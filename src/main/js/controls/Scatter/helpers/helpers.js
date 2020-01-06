"use strict";
import * as d3 from "d3";
import { Shape } from "../../../core";
import {
    getInterpolationType,
    parseTypedValue
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
    loadLegendItem,
    isLegendSelected
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
 * @typedef Scatter
 */
/**
 * Transforms the points in the Scatter graph on resize
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
 * Transforms points for a data point set in the Scatter graph on resize
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
        .selectAll(`.${styles.scatterGraphContent} .${cls}`)
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
 *  Points
 *  Selected point indicators
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const translateScatterGraph = (scale, canvasSVG, config) => {
    translatePoints(scale, canvasSVG, styles.point, config);
    translatePoints(scale, canvasSVG, styles.dataPointSelection, config);
};
/**
 * Draws the Scatter graph on the canvas element. This calls the Graph API to render the following first
 *  Grid
 *  Axes
 *  Legend
 *  Labels
 * Once these items are rendered, we will parse through the data points and render the points
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, config, canvasSVG, dataTarget) => {
    const scatterSVG = canvasSVG
        .append("g")
        .classed(styles.scatterGraphContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`)
        .attr("aria-hidden", config.shownTargets.indexOf(dataTarget.key) < 0)
        .attr("aria-describedby", dataTarget.key);
    const currentPointsPath = scatterSVG
        .selectAll(`.${styles.currentPointsGroup}`)
        .data([dataTarget]);
    currentPointsPath
        .enter()
        .append("g")
        .classed(styles.currentPointsGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        );
    currentPointsPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
    const pointPath = scatterSVG
        .select(`.${styles.currentPointsGroup}`)
        .selectAll(`.${styles.point}`)
        .data(getDataPointValues(dataTarget).filter((d) => d.y !== null));
    drawDataPoints(scale, config, pointPath.enter());
    pointPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
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
                        "aria-hidden": false,
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
                        "aria-hidden": false,
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
 *      * Shows/hides the regions
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {function()} callback function handler for RAF
 */
const onAnimationHandler = (config, canvasSVG) => () => {
    processRegions(config, canvasSVG);
};
/**
 * Click handler for legend item. Removes the data points from scatter graph when clicked
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {Scatter} control - Scatter instance
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
    const legendSelected = isLegendSelected(d3.select(element));
    updateShownTarget(config.shownTargets, item);
    canvasSVG
        .selectAll(
            `.${styles.dataPointSelection}[aria-describedby="${item.key}"]`
        )
        .attr("aria-hidden", true);
    canvasSVG
        .selectAll(`path[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", legendSelected);
    canvasSVG
        .selectAll(`.${styles.point}[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", legendSelected);
    window.requestAnimationFrame(onAnimationHandler(config, canvasSVG));
};
/**
 * Hover handler for legend item. Highlights current scatter data points and blurs the rest of the targets in Graph
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
    // Highlight the scatter data points of the item hovered on
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
 * CLear the graph data points and scatter data points currently rendered
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} dataTarget - Data points object
 * @returns {object} - d3 select object
 */
const clear = (canvasSVG, dataTarget) =>
    d3RemoveElement(canvasSVG, `g[aria-describedby="${dataTarget.key}"]`);

export {
    toggleDataPointSelection,
    translatePoints,
    translateScatterGraph,
    draw,
    clickHandler,
    hoverHandler,
    transformPoint,
    prepareLegendItems,
    processDataPoints,
    getDataPointValues,
    drawDataPoints,
    clear
};
