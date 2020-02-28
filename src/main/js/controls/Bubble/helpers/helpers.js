"use strict";
import * as d3 from "d3";
import { parseTypedValue } from "../../../core/BaseConfig";
import {
    calculateVerticalPadding,
    getXAxisXPosition,
    isValidAxisType
} from "../../../helpers/axis";
import constants from "../../../helpers/constants";
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
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { d3RemoveElement } from "../../Graph/helpers/helpers";
import { generateColor, bubbleScale } from "./colorGradient";

/**
 * @typedef Bubble
 */

/**
 * Transforms the point in the bubble graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @returns {Function} - translate function for d3 transform
 */
const transformPoint = (scale) => (value) => {
    const getX = (val) => scale.x(val.x);
    const getY = (val) => scale[val.yAxis](val.y);
    return `translate(${getX(value)},${getY(value)})`;
};
/**
 * Transforms points for a data point set in the bubble graph on resize
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
        .selectAll(`.${styles.bubbleGraphContent} .${cls}`)
        .each(function(d) {
            const pointSVG = d3.select(this);
            pointSVG
                .transition()
                .call(
                    constants.d3Transition(config.settingsDictionary.transition)
                )
                .attr("transform", () => transformPoint(scale)(d));
        });

/**
 * Toggles the selection of a data point, executes on click of a data point.
 *
 * @private
 * @param {object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (target) => {
    blurActionHandler(target);
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
                removeBubbleBlur();
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
const translateBubbleGraph = (scale, canvasSVG, config) => {
    translatePoints(scale, canvasSVG, styles.point, config);
    translatePoints(scale, canvasSVG, styles.dataPointSelection, config);
};
/**
 * Draws the bubble graph on the canvas element. This calls the Graph API to render the following first
 *  Grid
 *  Axes
 *  Legend
 *  Labels
 * Once these items are rendered, we will parse through the data points and render the bubbles
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, config, canvasSVG, dataTarget) => {
    const BubbleSVG = canvasSVG
        .append("g")
        .classed(styles.bubbleGraphContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`)
        .attr("aria-hidden", config.shownTargets.indexOf(dataTarget.key) < 0)
        .attr("aria-describedby", dataTarget.key);

    const currentPointsPath = BubbleSVG.selectAll(
        `.${styles.currentPointsGroup}`
    ).data([dataTarget]);
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

    const bubblePoint = BubbleSVG.select(`.${styles.currentPointsGroup}`)
        .selectAll(`.${styles.point}`)
        .data(getDataPointValues(dataTarget).filter((d) => d.y !== null));
    drawBubbles(scale, config, bubblePoint.enter(), dataTarget);
    bubblePoint
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

    graphConfig.shownTargets.push(dataTarget.key);
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => ({
        onClick: dataTarget.onClick,
        isCritical: value.isCritical || false,
        x: getXDataValues(value.x),
        y: value.y,
        weight: value.weight,
        color: dataTarget.color || constants.DEFAULT_COLOR,
        label: dataTarget.label || {},
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
 * Enforces blur state for all the bubbles that is not the one clicked on.
 * This is provided regardless of whether onClick is present or not.
 *
 * @private
 * @param {object} target - target node of bubble which is clicked
 * @returns {undefined} - returns nothing
 */
const enforceBubbleBlur = (target) => {
    d3.selectAll(`.${styles.point}`)
        .select("circle")
        .attr("fill-opacity", constants.DEFAULT_BUBBLE_BLUR_OPACITY)
        .attr("stroke-opacity", constants.DEFAULT_BUBBLE_BLUR_STROKE_OPACITY);

    d3.select(target)
        .select("circle")
        .attr("fill-opacity", constants.DEFAULT_BUBBLE_OPACITY)
        .attr("stroke-opacity", constants.DEFAULT_BUBBLE_STROKE_OPACITY);
};

/**
 * Removes the carbon-bubbleBlur style from all the bubbles to unblur all the bubbles in the bubble graph.
 *
 * @private
 * @returns {object} - d3 Selection object
 */
const removeBubbleBlur = () =>
    d3
        .selectAll(`.${styles.point}`)
        .attr("aria-selected", false)
        .select("circle")
        .attr("fill-opacity", constants.DEFAULT_BUBBLE_OPACITY)
        .attr("stroke-opacity", constants.DEFAULT_BUBBLE_STROKE_OPACITY);

/**
 * Handler for the bubble that is clicked on. It blurs all other bubble in the bubble graph except one which is selected.
 *
 * @private
 * @param {HTMLElement} target - Target element bubble clicked on
 * @returns {undefined} - returns nothing
 */
const blurActionHandler = (target) => {
    d3.select(target).attr("aria-selected", true);
    enforceBubbleBlur(target);
};

/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} pointGroupPath - d3 html element of the points group
 * @param {object} dataTarget - data for the bubble graph
 * @returns {undefined} - returns nothing
 */
const drawBubbles = (scale, config, pointGroupPath, dataTarget) => {
    const renderDataPoint = (path, value, index) => {
        const bubblePoint = path
            .append("g")
            .classed(styles.point, true)
            .attr("aria-disabled", !utils.isFunction(value.onClick))
            .attr("transform", transformPoint(scale)(value))
            .attr("aria-describedby", `${value.key}`)
            .attr("aria-selected", false)
            .attr("aria-hidden", false)
            .on("click", function() {
                dataPointActionHandler(value, index, this);
            });

        bubblePoint
            .append("circle")
            .attr("aria-describedby", value.key)
            .attr("r", (d) => decideRadius(dataTarget, d))
            .attr("fill", (d) => decideColor(dataTarget, d))
            .attr("fill-opacity", constants.DEFAULT_BUBBLE_OPACITY)
            .attr("stroke", (d) => decideColor(dataTarget, d));
    };

    const renderSelectionPath = (path, value, index) => {
        path.append("g")
            .classed(styles.dataPointSelection, true)
            .attr("transform", transformPoint(scale)(value))
            .attr("aria-disabled", utils.isDefined(value.onClick))
            .attr("aria-hidden", true)
            .attr("aria-describedby", value.key)
            .on("click", function() {
                dataPointActionHandler(value, index, this);
            })
            .append("circle")
            .attr(
                "r",
                (d) =>
                    decideRadius(dataTarget, d) +
                    constants.DEFAULT_BUBBLE_SELECTOR_RADIUS
            );
    };
    pointGroupPath
        .append("g")
        .classed(styles.pointGroup, true)
        .each(function(d, i) {
            const dataPointSVG = d3.select(this);
            renderSelectionPath(dataPointSVG, d, i);
            renderDataPoint(dataPointSVG, d, i);
        });
};

/**
 * Checks if the weight object is defined with min and max values.
 *
 * @private
 * @param {object} dataTarget - data for the bubble graph
 * @returns {boolean} - returns true if weight is defined and inside weight min and max is also defined else false.
 */
const areWeightsDefined = (dataTarget) =>
    utils.isDefined(dataTarget.weight)
        ? utils.isDefined(dataTarget.weight.min) &&
          utils.isDefined(dataTarget.weight.max)
        : false;

/**
 * Checks if hue is defined in the input JSON to get color gradient.
 *
 * @private
 * @param {object} hue - hue is object defining the color range.
 * @returns {boolean} - returns true if hue is defined else false.
 */
const isHueDefined = (hue) => utils.isDefined(hue);

/**
 * Decides the radius for each bubble
 *
 * @private
 * @param {object} dataTarget - data for the bubble graph
 * @param {number} value - data point whose radius has to be decided
 * @returns {number} - returns the radius of the bubble
 */
const decideRadius = (dataTarget, value) => {
    if (
        areWeightsDefined(dataTarget) &&
        utils.isUndefined(dataTarget.weight.maxRadius)
    ) {
        return bubbleScale(dataTarget)(value.weight);
    } else if (utils.isUndefined(dataTarget.weight)) {
        return constants.DEFAULT_BUBBLE_RADIUS_MAX;
    } else {
        return dataTarget.weight.maxRadius;
    }
};

/**
 * Decides the color for each bubble
 *
 * @private
 * @param {object} dataTarget - data for the bubble graph
 * @param {number} value - data point whose color has to be decided
 * @returns {string} - returns color string for each bubble
 */
const decideColor = (dataTarget, value) => {
    if (isHueDefined(dataTarget.hue) && areWeightsDefined(dataTarget)) {
        return generateColor(dataTarget)(bubbleScale(dataTarget)(value.weight));
    } else if (
        isHueDefined(dataTarget.hue) &&
        areWeightsDefined(dataTarget) === false
    ) {
        return generateColor(dataTarget)(value.y);
    } else {
        return dataTarget.color;
    }
};
/**
 * Handler for Request animation frame, executes on resize shows/hides the regions.
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
 * Click handler for legend item. Removes the bubble from the graph
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {Bubble} control - Bubble instance
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
    const isSelected = isLegendSelected(d3.select(element));
    updateShownTarget(config.shownTargets, item);
    canvasSVG
        .selectAll(
            `.${styles.dataPointSelection}[aria-describedby="${item.key}"]`
        )
        .attr("aria-hidden", true);
    canvasSVG
        .selectAll(`.${styles.point}[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", isSelected);
    window.requestAnimationFrame(onAnimationHandler(config, canvasSVG));
};
/**
 * Hover handler for legend item. Highlights current bubble and blurs the rest of the targets in Graph
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
    canvasSVG
        .selectAll(`.${styles.point}[aria-describedby="${item.key}"]`)
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
 * Clear the graph data points currently rendered
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
    draw,
    translateBubbleGraph,
    clickHandler,
    hoverHandler,
    transformPoint,
    prepareLegendItems,
    processDataPoints,
    getDataPointValues,
    clear
};
