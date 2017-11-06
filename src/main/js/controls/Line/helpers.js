"use strict";
import d3 from "d3";
import {
    getType,
    parseDateTime
} from "../../core/BaseConfig";
import {
    getColorForTarget,
    isBuiltAsAPathSymbol,
    isDate
} from "../../core/Graph/helpers";
import Symbol from "../../core/Symbol";
import { getXAxisXPosition } from "../../helpers/axis";
import constants, {
    AXIS_TYPE,
    SYMBOLS
} from "../../helpers/constants";
import errors from "../../helpers/errors";
import {
    legendClickHandler,
    legendHoverHandler,
    loadLegendItem
} from "../../helpers/legend";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";

const PADDING = constants.PADDING;

/**
 * Creates a d3 svg line
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Array} d - Data point set containing data point value objects
 * @returns {Object} d3 line object
 */
const createLine = (scale, d) => {
    const newLine = d3.svg.line()
                      .x((value) => scale.x(value.x))
                      .y((value) => scale[ value.yAxis ](value.y))
                      .interpolate("linear");
    return newLine(getDataPointValues(d));
};
/**
 * Transforms the point in the Line graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} value - data point object
 * @returns {string} - translate string for d3 transform
 */
const transformPoint = (scale, value) => {
    const getX = (value) => scale.x(value.x);
    const getY = (value) => scale[ value.yAxis ](value.y);
    return `translate(${getX(value)},${getY(value)})`;
};
/**
 * Transforms lines for a data point set in the Line graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 select object
 */
const translateLines = (scale, canvasSVG) =>
    canvasSVG.selectAll(`.${styles.line}`)
             .select("path")
             .attr("d", (value) => createLine(scale, value));
/**
 * Transforms points for a data point set in the Line graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 select object
 */
const translatePoints = (scale, canvasSVG) =>
    canvasSVG.selectAll(`.${styles.point}`)
             .attr("transform", transformPoint.bind({}, scale));
/**
 * Transforms selected data point element for a data point in the Line graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 select object
 */
const translateSelectedPoint = (scale, canvasSVG) =>
    canvasSVG.selectAll(`.${styles.dataPointSelection}`)
             .attr("transform", transformPoint.bind({}, scale));
/**
 * Toggles the selection of a data point, executes on click of a data point.
 * @private
 * @param {Object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (target) => {
    const selectedPointNode = d3.select(target.parentNode)
                                .select(`.${styles.dataPointSelection}`);
    selectedPointNode.classed("hidden", !selectedPointNode.classed("hidden"));
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
 * @private
 * @param {Object} value - data point object
 * @param {number} index - data point index for the set
 * @param {Object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const dataPointActionHandler = (value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(target).call((selectedTarget) =>
        value.onClick(() => {
            selectedTarget.classed("hidden", true);
        }, value.key, index, value, selectedTarget)
    );
};
/**
 * Called on resize, translates the data point values.
 * This includes:
 *  Lines
 *  Points
 *  Selected point indicators
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateLineGraph = (scale, canvasSVG) => {
    translateLines(scale, canvasSVG);
    translatePoints(scale, canvasSVG);
    translateSelectedPoint(scale, canvasSVG);
};
/**
 * Draws the Line graph on the canvas element. This calls the Graph API to render the following first
 *  Grid
 *  Axes
 *  Legend
 *  Labels
 * Once these items are rendered, we will parse through the data points and render the lines and points
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, config, canvasSVG, dataTarget) => {
    const lineSVG = canvasSVG.append("g")
                             .classed(styles.lineGraphContent, true)
                             .attr("clip-path", `url(#${constants.CLIP_PATH_ID});`)
                             .attr("aria-describedby", dataTarget.key);
    const lineGroupSVG = lineSVG.append("g")
                                .classed(styles.currentLinesGroup, true)
                                .attr("transform", `translate(${getXAxisXPosition(config)},${PADDING.top})`);
    drawDataLines(scale, config, lineGroupSVG.selectAll(`.${styles.line}`)
                                             .data([ dataTarget ])
                                             .enter()
    );
    if (config.showSymbols) {
        const pointGroupSVG = lineSVG.append("g")
                                     .classed(styles.currentPointsGroup, true)
                                     .attr("transform", `translate(${getXAxisXPosition(config)},${PADDING.top})`);
        pointGroupSVG.selectAll(`.${styles.pointGroup}`)
                     .data([ dataTarget ])
                     .enter()
                     .append("g")
                     .classed(styles.pointGroup, true);
        drawDataPoints(scale, config, pointGroupSVG.select(`.${styles.pointGroup}`)
                                                   .selectAll(`.${styles.point}`)
                                                   .data(getDataPointValues)
                                                   .enter()
        );
    }
};
/**
 * Processes the input JSON and adds the symbols, colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 * @private
 * @param {Object} graphConfig - config object of Graph API
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) => {
    const type = graphConfig.axis.x.type;
    const getXDataValues = (x) => {
        if ((isDate(x) && getType(type) !== AXIS_TYPE.TIME_SERIES) ||
            (!isDate(x) && getType(type) === AXIS_TYPE.TIME_SERIES)) {
            throw errors.THROW_MSG_INVALID_FORMAT_TYPE;
        }
        if (getType(type) === AXIS_TYPE.TIME_SERIES) {
            return parseDateTime(x);
        }
        return Number(x);
    };
    graphConfig.shownTargets.push(dataTarget.key);
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => ({
        onClick: dataTarget.onClick,
        x: getXDataValues(value.x),
        y: Number(value.y),
        color: dataTarget.color || constants.DEFAULT_COLOR,
        label: dataTarget.label || {},
        symbol: dataTarget.symbol || SYMBOLS.CIRCLE,
        yAxis: dataTarget.yAxis || constants.Y_AXIS,
        key: dataTarget.key
    }));
    return dataTarget;
};
/**
 * Returns the internal values subset which is the array that was created from the input JSON.
 * This array has information for each data point w.r.t symbol, colors and on click callback along with
 * x and y co-ordinates.
 * @private
 * @param {Object} target - Object containing the subsets
 * @returns {Array} List of data point subsets
 */
const getDataPointValues = (target) => target.internalValuesSubset;
/**
 * Draws lines using the data point values.
 * Lines are created using d3 svg line with linear interpolation.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} lineGroupSVG - d3 html element of the line group
 * @returns {undefined} - returns nothing
 */
const drawDataLines = (scale, config, lineGroupSVG) =>
    lineGroupSVG.append("g")
                .classed(styles.line, true)
                .append("path")
                .attr("d", (value) => createLine(scale, value))
                .attr("style", (value) => `stroke: ${getColorForTarget(value)
                    }${config.shownTargets.indexOf(value.key) < 0 ? "; display: none;" : ";"}`)
                .attr("aria-describedby", (target) => target.key);
/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, symbol, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of the canvas
 * @returns {undefined} - returns nothing
 */
const drawDataPoints = (scale, config, canvasSVG) => {
    const getDataPointPath = (path) =>
        path.classed(styles.point, true)
            .attr("d", (value) => new Symbol(isBuiltAsAPathSymbol(value)).getPathElement())
            .attr("transform", transformPoint.bind({}, scale))
            .on("click", function(value, index) {
                dataPointActionHandler(value, index, this);
            })
            .attr("style", (value) =>
                `fill: ${getColorForTarget(value)}${config.shownTargets.indexOf(value.key) < 0 ? "; display: none;" : ";"}`)
            .attr("aria-describedby", (value) => value.key);
    const getSelectionPath = (path) =>
        path.classed(styles.dataPointSelection, true)
            .classed("hidden", true)
            .attr("d", (value) => new Symbol(isBuiltAsAPathSymbol(value)).getPathElement())
            .attr("transform", transformPoint.bind({}, scale))
            .attr("r", constants.DEFAULT_SELECTED_RADIUS)
            .attr("style", (value) =>
                `${config.shownTargets.indexOf(value.key) < 0 ? " display: none;" : ""}`)
            .attr("aria-describedby", (value) => value.key)
            .on("click", function(value, index) {
                dataPointActionHandler(value, index, this);
            });
    const pointsPath = canvasSVG.append("g")
                                .classed(styles.dataPointSelectionGroup, true);
    getSelectionPath(pointsPath.append(constants.DEFAULT_SYMBOL));
    getDataPointPath(pointsPath.append("path"));
};

/**
 * Click handler for legend item. Removes the line from graph when clicked and calls redraw
 * @private
 * @param {Object} graphContext - Graph instance
 * @param {Line} control - Line instance
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {undefined} - returns nothing
 */
const clickHandler = (graphContext, control, config, canvasSVG) => (element, item) => {
    const updateShownTarget = (shownTargets, item) => {
        const index = shownTargets.indexOf(item.key);
        if (index > -1) {
            shownTargets.splice(index, 1);
        }
        else {
            shownTargets.push(item.key);
        }
    };
    legendClickHandler(element);
    updateShownTarget(config.shownTargets, item);
    canvasSVG.select(`path[aria-describedby="${item.key}"]`)
             .classed("hidden", true);
    canvasSVG.select(`.${styles.point}[aria-describedby="${item.key}"]`)
             .classed("hidden", true);
    window.requestAnimationFrame(control.redraw.bind(control, graphContext));
};
/**
 * Hover handler for legend item. Highlights current line and blurs the rest of the targets in Graph
 * if present.
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {undefined} - returns nothing
 */
const hoverHandler = (graphTargets, canvasSVG) => (item, state) => {
    legendHoverHandler();
    // Blur all other items except the item hovered on
    graphTargets.forEach((t) => {
        if (t.key !== item.key) {
            canvasSVG.selectAll(`path[aria-describedby="${t.key}"]`)
                     .classed(styles.blur, (state === constants.HOVER_EVENT.MOUSE_ENTER));
            canvasSVG.selectAll(`.${styles.point}[aria-describedby="${t.key}"]`)
                     .classed(styles.blur, (state === constants.HOVER_EVENT.MOUSE_ENTER));
        }
    });
    // Highlight the line of the item hovered on
    canvasSVG.selectAll(`path[aria-describedby="${item.key}"]`)
             .classed(styles.highlight, (state === constants.HOVER_EVENT.MOUSE_ENTER));
};
/**
 * A callback that will be sent to Graph class so that when graph is
 * created the Graph API will execute this callback function and the legend
 * items are loaded.
 * @private
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Object} eventHandlers - Object containing click and hover event handlers for legend item
 * @param {Object} dataTarget - Data points object
 * @param {Object} legendSVG - d3 element that will be need to render the legend
 * items into.
 * @returns {undefined} - returns nothing
 */
const prepareLegendItems = (config, eventHandlers, dataTarget, legendSVG) => {
    if (dataTarget.label && dataTarget.label.display && legendSVG) {
        loadLegendItem(legendSVG, dataTarget, config.shownTargets, eventHandlers);
    }
};
/**
 * CLear the graph data points and lines currently rendered
 * @private
 * @param {Array} canvasSVG - d3 html element of canvas
 * @param {Object} dataTarget - Data points object
 * @returns {Object} - d3 select object
 */
const clear = (canvasSVG, dataTarget) =>
    canvasSVG.select(`g[aria-describedby="${dataTarget.key}"]`).remove();

export {
    toggleDataPointSelection,
    translateSelectedPoint,
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
