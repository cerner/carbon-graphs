"use strict";
import d3 from "d3";
import { Shape } from "../../../core";
import {
    getInterpolationType,
    parseTypedValue,
    getDefaultValue
} from "../../../core/BaseConfig";
import { getDefaultSVGProps } from "../../../core/Shape";
import {
    calculateVerticalPadding,
    getXAxisXPosition,
    isValidAxisType
} from "../../../helpers/axis";
import constants, { SHAPES } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import {
    legendClickHandler,
    legendHoverHandler,
    loadLegendItem
} from "../../../helpers/legend";
import {
    processRegions,
    regionLegendHoverHandler
} from "../../../helpers/region";
import { getSVGObject } from "../../../helpers/shapeSVG";
import styles from "../../../helpers/styles";
import { getTransformScale } from "../../../helpers/transformUtils";
import utils from "../../../helpers/utils";
import {
    d3RemoveElement,
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";

/**
 * @typedef Line
 */

/**
 * Creates a d3 svg line
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {Array} d - Data point set containing data point value objects
 * @returns {object} d3 line object
 */
const createLine = (scale, d) => {
    const newLine = d3.svg
        .line()
        .defined((value) => value.y !== null)
        .x((value) => scale.x(value.x))
        .y((value) => scale[value.yAxis](value.y))
        .interpolate(d.interpolationType);
    return newLine(getDataPointValues(d));
};
/**
 * Transforms the point in the Line graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @returns {Function} - translate function for d3 transform
 */
const transformPoint = (scale) => (value) => (scaleFactor) => {
    const getX = (val) => scale.x(val.x);
    const getY = (val) => scale[val.yAxis](val.y);
    return `translate(${getX(value)},${getY(value)}) scale(${scaleFactor})`;
};
/**
 * Transforms lines for a data point set in the Line graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 select object
 */
const translateLines = (scale, canvasSVG, config) =>
    canvasSVG
        .selectAll(`.${styles.lineGraphContent} .${styles.line}`)
        .select("path")
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("d", (value) => createLine(scale, value));
/**
 * Transforms points for a data point set in the Line graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} cls - selector for the data point translation
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 select object
 */
const translatePoints = (scale, canvasSVG, cls, config) =>
    canvasSVG
        .selectAll(`.${styles.lineGraphContent} .${cls}`)
        .each(function(d) {
            const pointSVG = d3.select(this);
            pointSVG
                .select("g")
                .transition()
                .call(
                    constants.d3Transition(config.settingsDictionary.transition)
                )
                .attr("transform", function() {
                    return transformPoint(scale)(d)(getTransformScale(this));
                });
        });
/**
 * Toggles the selection of a data point, executes on click of a data point.
 *
 * @private
 * @param {object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (target) => {
    const selectedPointNode = d3
        .select(target.parentNode)
        .select(`.${styles.dataPointSelection}`);
    selectedPointNode.attr(
        "aria-hidden",
        !(selectedPointNode.attr("aria-hidden") === "true")
    );
    return selectedPointNode;
};
/**
 * Handler for the data point on click. If the content property is present for the data point
 * then the callback is executed other wise it is NOP.
 * If the callback is present, the selected data point is toggled and the element is passed as an argument to the
 * consumer in the callback, to execute once the popup is closed.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 *
 * @private
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const dataPointActionHandler = (value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(target).call((selectedTarget) =>
        value.onClick(
            () => {
                selectedTarget.attr("aria-hidden", true);
            },
            value.key,
            index,
            value,
            selectedTarget
        )
    );
};
/**
 * Called on resize, translates the data point values.
 * This includes:
 *  Lines
 *  Points
 *  Selected point indicators
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const translateLineGraph = (scale, canvasSVG, config) => {
    translateLines(scale, canvasSVG, config);
    translatePoints(scale, canvasSVG, styles.point, config);
    translatePoints(scale, canvasSVG, styles.dataPointSelection, config);
};
/**
 * Draws the Line graph on the canvas element. This calls the Graph API to render the following first
 *  Grid
 *  Axes
 *  Legend
 *  Labels
 * Once these items are rendered, we will parse through the data points and render the lines and points
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, config, canvasSVG, dataTarget) => {
    const lineSVG = canvasSVG
        .append("g")
        .classed(styles.lineGraphContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`)
        .attr("aria-hidden", config.shownTargets.indexOf(dataTarget.key) < 0)
        .attr("aria-describedby", dataTarget.key);
    const lineGroupSVG = lineSVG
        .append("g")
        .classed(styles.currentLinesGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        );
    const linePath = lineGroupSVG
        .selectAll(`.${styles.line}`)
        .data([dataTarget]);
    drawDataLines(scale, config, linePath.enter());
    linePath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();

    if (config.showShapes) {
        const currentPointsPath = lineSVG
            .selectAll(`.${styles.currentPointsGroup}`)
            .data([dataTarget]);
        currentPointsPath
            .enter()
            .append("g")
            .classed(styles.currentPointsGroup, true)
            .attr(
                "transform",
                `translate(${getXAxisXPosition(
                    config
                )},${calculateVerticalPadding(config)})`
            );
        currentPointsPath
            .exit()
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .remove();
        const pointPath = lineSVG
            .select(`.${styles.currentPointsGroup}`)
            .selectAll(`.${styles.point}`)
            .data(getDataPointValues);
        drawDataPoints(scale, config, pointPath.enter());
        pointPath
            .exit()
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .remove();
    }
};
/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} dataTarget - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) => {
    const type = graphConfig.axis.x.type;
    const getXDataValues = (x) => {
        if (!isValidAxisType(x, type)) {
            throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        }
        return parseTypedValue(x, type);
    };
    // Update the interpolation type
    dataTarget.interpolationType = getInterpolationType(dataTarget.type);

    dataTarget.style = getDefaultValue(dataTarget.style, {});
    dataTarget.style = {
        strokeDashArray: getStrokeDashArray(dataTarget.style)
    };

    graphConfig.shownTargets.push(dataTarget.key);
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => ({
        onClick: dataTarget.onClick,
        isCritical: value.isCritical || false,
        x: getXDataValues(value.x),
        y: value.y,
        color: dataTarget.color || constants.DEFAULT_COLOR,
        label: dataTarget.label || {},
        shape: dataTarget.shape || SHAPES.CIRCLE,
        yAxis: dataTarget.yAxis || constants.Y_AXIS,
        key: dataTarget.key
    }));
    return dataTarget;
};
/**
 * Returns the internal values subset which is the array that was created from the input JSON.
 * This array has information for each data point w.r.t shape, colors and on click callback along with
 * x and y co-ordinates.
 *
 * @private
 * @param {object} target - Object containing the subsets
 * @returns {Array} List of data point subsets
 */
const getDataPointValues = (target) => target.internalValuesSubset;
/**
 * Checks the data-set is currently shown in the graph and if the y data-point value is null
 * If they are then true, false otherwise
 *
 * @private
 * @param {object} shownTargets - graph targets config object
 * @param {object} value - data point value object
 * @returns {boolean} true if data point needs to be hidden, false otherwise
 */
const shouldHideDataPoints = (shownTargets, value) =>
    shownTargets.indexOf(value.key) < 0 || value.y === null;
/**
 * Draws lines using the data point values.
 * Lines are created using d3 svg line with linear interpolation.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} lineGroupSVG - d3 html element of the line group
 * @returns {undefined} - returns nothing
 */
const drawDataLines = (scale, config, lineGroupSVG) =>
    lineGroupSVG
        .append("g")
        .classed(styles.line, true)
        .append("path")
        .attr("d", (value) => createLine(scale, value))
        .attr(
            "style",
            (value) =>
                `stroke: ${getColorForTarget(value)}; stroke-dasharray: ${
                    value.style.strokeDashArray
                };`
        )
        .attr("aria-hidden", (value) =>
            shouldHideDataPoints(config.shownTargets, value)
        )
        .attr("aria-describedby", (target) => target.key);
/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, shape, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} pointGroupPath - d3 html element of the points group
 * @returns {undefined} - returns nothing
 */
const drawDataPoints = (scale, config, pointGroupPath) => {
    const renderDataPointPath = (path, value, index) =>
        path.append(() =>
            new Shape(getShapeForTarget(value)).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: styles.point,
                    svgStyles: `fill: ${getColorForTarget(value)};`,
                    transformFn: transformPoint(scale)(value),
                    onClickFn() {
                        dataPointActionHandler(value, index, this);
                    },
                    a11yAttributes: {
                        "aria-hidden": shouldHideDataPoints(
                            config.shownTargets,
                            value
                        ),
                        "aria-describedby": value.key,
                        "aria-disabled": !utils.isFunction(value.onClick)
                    }
                })
            )
        );
    const renderSelectionPath = (path, value, index) =>
        path.append(() =>
            new Shape(
                getSVGObject(
                    SHAPES.CIRCLE,
                    constants.DEFAULT_PLOT_SELECTION_SCALE
                )
            ).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: styles.dataPointSelection,
                    transformFn: transformPoint(scale)(value),
                    onClickFn() {
                        dataPointActionHandler(value, index, this);
                    },
                    a11yAttributes: {
                        "aria-hidden": true,
                        "aria-describedby": value.key,
                        "aria-disabled": !utils.isFunction(value.onClick)
                    }
                })
            )
        );
    const renderCriticalityPath = (path, value, index, cls) =>
        path.append(() =>
            new Shape(getShapeForTarget(value)).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: `${styles.point} ${cls}`,
                    transformFn: transformPoint(scale)(value),
                    onClickFn() {
                        dataPointActionHandler(value, index, this);
                    },
                    a11yAttributes: {
                        "aria-hidden": shouldHideDataPoints(
                            config.shownTargets,
                            value
                        ),
                        "aria-describedby": value.key,
                        "aria-disabled": !utils.isFunction(value.onClick)
                    }
                })
            )
        );
    pointGroupPath
        .append("g")
        .classed(styles.pointGroup, true)
        .each(function(d, i) {
            const dataPointSVG = d3.select(this);
            renderSelectionPath(dataPointSVG, d, i);
            if (d.isCritical) {
                config.hasCriticality = true;
                renderCriticalityPath(
                    dataPointSVG,
                    d,
                    i,
                    styles.criticalityOuterPoint
                );
                renderCriticalityPath(
                    dataPointSVG,
                    d,
                    i,
                    styles.criticalityInnerPoint
                );
            }
            renderDataPointPath(dataPointSVG, d, i);
        });
};
/**
 * Handler for Request animation frame, executes on resize.
 *  * Order of execution
 *      * Redraws the content
 *      * Shows/hides the regions
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {Line} control - Line instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {function()} callback function handler for RAF
 */
const onAnimationHandler = (graphContext, control, config, canvasSVG) => () => {
    control.redraw(graphContext);
    processRegions(config, canvasSVG);
};
/**
 * Click handler for legend item. Removes the line from graph when clicked and calls redraw
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {Line} control - Line instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles click action on legend item
 */
const clickHandler = (graphContext, control, config, canvasSVG) => (
    element,
    item
) => {
    const updateShownTarget = (shownTargets, item) => {
        const index = shownTargets.indexOf(item.key);
        if (index > -1) {
            shownTargets.splice(index, 1);
        } else {
            shownTargets.push(item.key);
        }
    };
    legendClickHandler(element);
    updateShownTarget(config.shownTargets, item);
    canvasSVG
        .selectAll(`path[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", true);
    canvasSVG
        .selectAll(`.${styles.point}[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", true);
    window.requestAnimationFrame(
        onAnimationHandler(graphContext, control, config, canvasSVG)
    );
};
/**
 * Hover handler for legend item. Highlights current line and blurs the rest of the targets in Graph
 * if present.
 *
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles hover action on legend item
 */
const hoverHandler = (graphTargets, canvasSVG) => (item, state) => {
    const additionalHoverHandler = (
        shownTargets,
        canvasSVG,
        currentKey,
        hoverState,
        k
    ) => {
        canvasSVG
            .selectAll(`.${styles.point}[aria-describedby="${k}"]`)
            .classed(styles.blur, state === constants.HOVER_EVENT.MOUSE_ENTER);
    };
    legendHoverHandler(graphTargets, canvasSVG, item.key, state, [
        additionalHoverHandler
    ]);
    // Highlight the line of the item hovered on
    canvasSVG
        .selectAll(`path[aria-describedby="${item.key}"]`)
        .classed(styles.highlight, state === constants.HOVER_EVENT.MOUSE_ENTER);
    canvasSVG
        .selectAll(`svg[aria-describedby="${item.key}"]`)
        .classed(styles.highlight, state === constants.HOVER_EVENT.MOUSE_ENTER);

    // Highlight region(s) of the item hovered on, only if the content is currently displayed
    regionLegendHoverHandler(graphTargets, canvasSVG, item.key, state);
};
/**
 * A callback that will be sent to Graph class so that when graph is
 * created the Graph API will execute this callback function and the legend
 * items are loaded.
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} eventHandlers - Object containing click and hover event handlers for legend item
 * @param {object} dataTarget - Data points object
 * @param {object} legendSVG - d3 element that will be need to render the legend
 * items into.
 * @returns {undefined} - returns nothing
 */
const prepareLegendItems = (config, eventHandlers, dataTarget, legendSVG) => {
    if (dataTarget.label && dataTarget.label.display && legendSVG) {
        loadLegendItem(
            legendSVG,
            dataTarget,
            config.shownTargets,
            eventHandlers
        );
    }
};
/**
 * CLear the graph data points and lines currently rendered
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} dataTarget - Data points object
 * @returns {object} - d3 select object
 */
const clear = (canvasSVG, dataTarget) =>
    d3RemoveElement(canvasSVG, `g[aria-describedby="${dataTarget.key}"]`);

/**
 * Validate and return the strokeDashArray property
 *
 * @private
 * @param {object} style - style you want to apply for the line
 * @returns {string} - stroke-dasharray css value for the line
 */
const getStrokeDashArray = (style) =>
    getDefaultValue(style.strokeDashArray, "0");

export {
    toggleDataPointSelection,
    translatePoints,
    translateLines,
    translateLineGraph,
    draw,
    createLine,
    clickHandler,
    hoverHandler,
    transformPoint,
    prepareLegendItems,
    processDataPoints,
    getDataPointValues,
    drawDataLines,
    drawDataPoints,
    clear
};
