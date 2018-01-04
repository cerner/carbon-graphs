"use strict";
import d3 from "d3";
import { getType } from "../../../core/BaseConfig";
import {
    getColorForTarget,
    isBuiltAsAPathSymbol
} from "../../../core/Graph/helpers";
import Symbol from "../../../core/Symbol";
import { getXAxisXPosition } from "../../../helpers/axis";
import constants, {
    AXIS_TYPE,
    SYMBOLS
} from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import {
    legendClickHandler,
    legendHoverHandler,
    loadLegendItem
} from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    dataPointActionHandler,
    drawSelectionIndicator,
    translateSelectionBox,
    translateSelectionItem
} from "./selectionIndicatorHelpers";

const PADDING = constants.PADDING;
/**
 * Returns the value based on the type of data point - High, mid or low
 * @private
 * @param {Object} val - A value
 * @param {string} type - High, mid or low
 * @private
 * @returns {Object} value of the type
 */
const getValue = (val, type) => val ? val[ type ] : "";
/**
 * Creates a new d3 Paired Result using given x1, x2 and y1,y2 coordinates.
 * Interpolation is default linear
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} d - High and low x,y coordinates
 * @returns {undefined} - returns nothing
 */
const createLine = (scale, d) => {
    const newLine = d3.svg.line()
                      .x((value) => scale.x(value.x))
                      .y((value) => scale[ d.yAxis ](value.y))
                      .interpolate("linear");
    return newLine([
        {
            x: d.high.x,
            y: d.high.y
        },
        {
            x: d.low.x,
            y: d.low.y
        }
    ]);
};
/**
 * Transforms the point in the Paired Result graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {string} type - high, mid or low
 * @param {Object} value - data point object
 * @returns {string} - translate string for d3 transform
 */
const transformPoint = (scale, type, value) => {
    const getX = (val) => scale.x(getValue(val, type).x);
    const getY = (val) => scale[ val.yAxis ](getValue(val, type).y);
    return `translate(${getX(value)},${getY(value)})`;
};
/**
 * Transforms lines for a data point set in the Paired Result graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} - d3 select object
 */
const translateLines = (scale, config, canvasSVG) =>
    canvasSVG.selectAll(`.${styles.pairedBoxGroup} .${styles.pairedLine}`)
             .attr("d", (d) => (d.high && d.low) ? createLine(scale, d) : "");
/**
 * Transforms points for a data point set (high, low and mid) in the Paired Result graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} - d3 select object
 */
const translatePoints = (scale, canvasSVG) =>
    constants.PAIR_ITEM_TYPES.forEach((type) => {
        canvasSVG.selectAll(`.${styles.pairedBoxGroup} .${styles.pairedPoint}.${getValue(styles, type)}`)
                 .attr("transform", transformPoint.bind({}, scale, type));
    });
/**
 * Draws the PairedResult graph on the canvas element.
 * Once these items are rendered, we will parse through the data points and render the line and points
 * We draw paired box groups. Each box comprises of a Line and 2 points (high and low) possibly mid, if provided
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, config, canvasSVG, dataTarget) => {
    const drawBox = (boxPath) => {
        drawSelectionIndicator(scale, config, boxPath);
        drawLine(scale, config, boxPath);
        drawPoints(scale, config, boxPath);
    };
    const pairedBoxGroupSVG = canvasSVG.append("g")
                                       .classed(styles.pairedBoxGroup, true)
                                       .attr("clip-path", `url(#${constants.CLIP_PATH_ID});`)
                                       .attr("transform", `translate(${getXAxisXPosition(config)},${PADDING.top})`)
                                       .attr("aria-describedby", dataTarget.key);
    pairedBoxGroupSVG.selectAll(`.${styles.pairedBox}`)
                     .data(getDataPointValues(dataTarget))
                     .enter()
                     .append("g")
                     .classed(styles.pairedBox, true)
                     .attr("aria-selected", false)
                     .on("click", function(value, index) {
                         dataPointActionHandler(config, value, index, this);
                     })
                     .call(drawBox);
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
        if ((utils.isDate(x) && getType(type) !== AXIS_TYPE.TIME_SERIES) ||
            (!utils.isDate(x) && getType(type) === AXIS_TYPE.TIME_SERIES)) {
            throw errors.THROW_MSG_INVALID_FORMAT_TYPE;
        }
        if (getType(type) === AXIS_TYPE.TIME_SERIES) {
            return utils.parseDateTime(x);
        }
        return utils.getNumber(x);
    };
    graphConfig.shownTargets.push(dataTarget.key);
    // Each value is a pair. Construct enough information so that you can
    // construct a box. Each box would need 3 icons so we need 3 (max) data sets
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => {
        const subset = {};
        // We are going to iterate through different pair item types: HIGH, LOW and MID
        constants.PAIR_ITEM_TYPES.forEach((type) => {
            if (utils.isDefined(getValue(value, type))) {
                subset[ type ] = {
                    x: getXDataValues(getValue(value, type).x),
                    y: utils.getNumber(getValue(value, type).y),
                    color: getValue(dataTarget.color, type) || constants.DEFAULT_COLOR,
                    label: getValue(dataTarget.label, type) || {},
                    symbol: getValue(dataTarget.symbol, type) || SYMBOLS.CIRCLE,
                    key: `${dataTarget.key}_${type}`
                };
                if (!utils.hasValue(graphConfig.shownTargets, subset[ type ].key)) {
                    graphConfig.shownTargets.push(subset[ type ].key);
                }
            }
        });
        subset.yAxis = dataTarget.yAxis || constants.Y_AXIS;
        subset.onClick = dataTarget.onClick;
        subset.key = dataTarget.key;
        return subset;
    });
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
 * Draws line between the 2 data points high and low. If either one of them is missing
 * then the line is not drawn.
 * Lines are created using d3 svg line with linear interpolation.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} boxPath - d3 html element of the paired box
 * @returns {Object} - d3 append object
 */
const drawLine = (scale, config, boxPath) =>
    boxPath.each(function(value) {
        const shouldCreateLine = (d) => ((d.high && d.low) &&
            (utils.hasValue(config.shownTargets, d.high.key) &&
                utils.hasValue(config.shownTargets, d.low.key)));
        return d3.select(this).append("path")
                 .classed(styles.pairedLine, true)
                 .attr("aria-describedby", value.key)
                 .attr("d", (value.high && value.low) ? createLine(scale, value) : "")
                 .attr("style", (d) => `${!shouldCreateLine(d) ? "display: none;" : ""}`);
    });
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
const drawPoints = (scale, config, canvasSVG) => {
    const getDataPointPath = (path, type) =>
        path.classed(styles.pairedPoint, true)
            .classed(getValue(styles, type), true)
            .attr("d", (value) => {
                const symbol = isBuiltAsAPathSymbol(getValue(value, type));
                return new Symbol(symbol).getPathElement();
            })
            .attr("transform", transformPoint.bind({}, scale, type))
            .attr("style", (value) =>
                `fill: ${getColorForTarget(getValue(value, type))}${
                    config.shownTargets.indexOf(getValue(value, type).key) < 0 ? "; display: none;" : ";"}`)
            .attr("aria-describedby", (value) => getValue(value, type).key);
    canvasSVG.each(function(value) {
        const boxPath = d3.select(this);
        constants.PAIR_ITEM_TYPES.forEach((type) => {
            if (utils.isDefined(getValue(value, type))) {
                getDataPointPath(boxPath
                    .append("g")
                    .classed(styles.pointGroup, true)
                    .append("path"), type);
            }
        });
    });
};
/**
 * Called on resize, translates the data point values.
 * This includes:
 *  Lines
 *  Points
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translatePairedResultGraph = (scale, config, canvasSVG) => {
    translateSelectionBox(scale, canvasSVG);
    translateSelectionItem(scale, canvasSVG);
    translateLines(scale, config, canvasSVG);
    translatePoints(scale, canvasSVG);
};
/**
 * Click handler for legend item. Removes the line from graph when clicked and calls redraw
 * @private
 * @param {Object} graphContext - Graph instance
 * @param {PairedResult} control - Paired Result instance
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
    canvasSVG.selectAll(`path[aria-describedby="${item.key}"]`)
             .classed("hidden", true);
    window.requestAnimationFrame(control.redraw.bind(control, graphContext));
};
/**
 * Hover handler for legend item. Highlights current line and blurs the rest of the targets in Graph
 * if present.
 * @private
 * @param {Array} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {undefined} - returns nothing
 */
const hoverHandler = (config, canvasSVG) => (item, state) => {
    legendHoverHandler();
    // Blur everything except the item hovered
    // If user hovers over High, for instance: Blur -> Low, Median and the line
    config.shownTargets.forEach((k) => {
        if (k !== item.key) {
            canvasSVG.selectAll(`path[aria-describedby="${k}"]`)
                     .classed(styles.blur, (state === constants.HOVER_EVENT.MOUSE_ENTER));
            canvasSVG.selectAll(`.${styles.pairedLine}`)
                     .classed(styles.blur, (state === constants.HOVER_EVENT.MOUSE_ENTER));
        }
    });
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
    const constructLegendLabels = (d, type) => Object.assign({}, {
        symbol: getValue(d.symbol, type),
        color: getValue(d.color, type),
        label: getValue(d.label, type),
        key: `${d.key}_${type}`
    });
    if (dataTarget.label && legendSVG) {
        constants.PAIR_ITEM_TYPES.forEach((type) => {
                const label = getValue(dataTarget.label, type);
                if (label && label.display) {
                    loadLegendItem(legendSVG, constructLegendLabels(dataTarget, type), config.shownTargets, eventHandlers);
                }
            }
        );
    }
};
/**
 * Clears the paired boxes before redrawing.
 * We are selecting all the box pairs along
 * with all the data sets before clearing them.
 * @private
 * @param {Array} canvasSVG - d3 html element of canvas
 * @param {Object} dataTarget - Data points object
 * @returns {Object} - d3 select object
 */
const clear = (canvasSVG, dataTarget) =>
    canvasSVG.select(`g[aria-describedby="${dataTarget.key}"]`).remove();

export {
    translatePoints,
    translateLines,
    createLine,
    clickHandler,
    hoverHandler,
    transformPoint,
    draw,
    getDataPointValues,
    processDataPoints,
    drawLine,
    drawPoints,
    translatePairedResultGraph,
    prepareLegendItems,
    clear
};
