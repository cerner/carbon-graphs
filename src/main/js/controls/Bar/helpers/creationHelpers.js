"use strict";
import d3 from "d3";
import constants, {
    COLORS,
    AXIS_TYPE,
    SHAPES
} from "../../../helpers/constants";
import { getType } from "../../../core/BaseConfig";
import errors from "../../../helpers/errors";
import utils from "../../../helpers/utils";
import styles from "../../../helpers/styles";
import { getBarStyle, getRect, getHashedBar } from "../../../helpers/barType";
import { d3RemoveElement } from "../../Graph/helpers/helpers";
import { loadLegendItem } from "../../../helpers/legend";

const PADDING = constants.PADDING;

/**
 * Checks if ticks are provided for every input
 * @private
 * @param {Array} xTicks - graph x axis tick values
 * @param {Array} inputValues - input values
 * @returns {Boolean} - true if invalid. false if valid
 */
const hasInvalidTicks = (xTicks, inputValues) =>
    inputValues.some((value) => xTicks.indexOf(value.x) < 0);

/**
 * Checks if x-axis type matches for every input
 * @private
 * @param {String} type - x-axis type
 * @param {Array} inputValues - input values
 * @returns {Boolean} - true if input has invalid type, false if it doesn't have invalid type
 */
const hasInvalidTypes = (type, inputValues) =>
    inputValues.some(
        (value) =>
            (utils.isDate(value.x) &&
                getType(type) !== AXIS_TYPE.TIME_SERIES) ||
            (!utils.isDate(value.x) && getType(type) === AXIS_TYPE.TIME_SERIES)
    );
/**
 * Processes the input JSON and adds the colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 * We add key to shownTargets if bar content is newly added to graph
 * @private
 * @param {Object} graphConfig - config object of Graph API
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) => {
    if (
        utils.isEmpty(graphConfig.axis.x.ticks) ||
        utils.isEmpty(graphConfig.axis.x.ticks.values)
    ) {
        throw new Error(errors.THROW_MSG_EMPTY_X_AXIS_TICK_VALUES);
    }
    if (hasInvalidTypes(graphConfig.axis.x.type, dataTarget.values)) {
        throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    }
    if (hasInvalidTicks(graphConfig.axis.x.ticks.values, dataTarget.values)) {
        throw new Error(errors.THROW_MSG_INVALID_X_AXIS_TICK_VALUES);
    }
    graphConfig.shownTargets.push(dataTarget.key);
    return setDataPoints(graphConfig, dataTarget);
};

/**
 * Processes the input JSON and adds the colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 * @private
 * @param {Object} graphConfig - config object of Graph API
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const setDataPoints = (graphConfig, dataTarget) => {
    const type = graphConfig.axis.x.type;
    const getXDataValues = (x) => {
        if (getType(type) === AXIS_TYPE.TIME_SERIES) {
            return utils.parseDateTime(x);
        }
        return utils.getNumber(x);
    };
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => {
        const isHashed = dataTarget.style ? dataTarget.style.isHashed : false;
        return {
            onClick: dataTarget.onClick,
            x: getXDataValues(value.x),
            y: value.y,
            y0: 0,
            color: dataTarget.color || COLORS.BLUE,
            label: dataTarget.label,
            yAxis: dataTarget.yAxis || constants.Y_AXIS,
            key: dataTarget.key,
            isHashed: value.style ? value.style.isHashed : isHashed,
            style: getBarStyle(
                value.style ? value.style : dataTarget.style,
                dataTarget
            ),
            group: dataTarget.group
        };
    });
    // This square shape is used strictly for legend item
    dataTarget.shape = SHAPES.SQUARE;
    return dataTarget;
};

/**
 * X Axis's starting position within the canvas
 * @private
 * @param {Object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getXAxisXPosition = (config) =>
    config.axisSizes.y + config.axisLabelWidths.y;

/**
 * Draws the Bar graph on the canvas element. This calls the Graph API to render the following first
 *  Grid
 *  Axes
 *  Legend
 *  Labels
 * Once these items are rendered, we will parse through the data points and render the lines and points
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, ordinalScale, config, canvasSVG, dataTarget) => {
    const barSVG = canvasSVG
        .append("g")
        .classed(styles.barGraphContent, true)
        .attr("clip-path", `url(#${constants.CLIP_PATH_ID})`)
        .attr("aria-hidden", config.shownTargets.indexOf(dataTarget.key) < 0)
        .attr("aria-describedby", dataTarget.key);
    const barGroupSVG = barSVG
        .append("g")
        .classed(styles.currentBarsGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${PADDING.top})`
        )
        .data([dataTarget]);
    const bars = barGroupSVG
        .selectAll(`.${styles.bar}`)
        .data(dataTarget.internalValuesSubset);
    drawDataBars(scale, ordinalScale, config, canvasSVG, bars.enter());
};

/**
 * Contains logic to calculate x, y, height, width for bar
 * x is calculated using ordinal scale. Padding between each bar should be half of its width.
 * width of bar should be 2/3 of range band. Remaining 1/3 of range band is for padding between bars.
 * height of bar should be
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @returns {Object} Object that contains methods for calculating x, y, height, width.
 */
const barAttributesHelper = (scale, ordinalScale) => {
    const leftShiftOffset =
        ordinalScale.x0.rangeBand() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.LEFT_SHIFT_OFFSET_RATIO; //this value is used to center bars by shifting left
    const leftShiftPadding =
        ordinalScale.x1.rangeBand() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES
            .LEFT_SHIFT_OFFSET_PADDING_RATIO; //padding to be added on left side of bar
    const getXRange = (x, groupOffset) =>
        scale.x(x) + leftShiftPadding + groupOffset - leftShiftOffset;

    return {
        x: (d) => {
            // x offset for grouped bars. By default every content is treated as a grouped bar.
            const groupOffset = ordinalScale.x1(d.group);
            return getXRange(d.x, groupOffset || 0);
        },
        y: (d) => (d.y < 0 ? scale[d.yAxis](d.y0) : scale[d.yAxis](d.y + d.y0)),
        height: (d) => Math.abs(scale[d.yAxis](0) - scale[d.yAxis](+d.y)),
        width:
            ordinalScale.x1.rangeBand() *
            constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.WIDTH_RATIO
    };
};

/**
 * Creates a d3 svg bar
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Object} barGroupSVG - d3 object for bar group svg
 * @returns {Object} d3 bar object
 */
const drawDataBars = (scale, ordinalScale, config, canvasSVG, barGroupSVG) => {
    const attributeHelper = barAttributesHelper(scale, ordinalScale);
    return barGroupSVG
        .append("g")
        .classed(styles.bar, true)
        .each(function(dataPoint) {
            const dataPointSVG = d3.select(this);
            const rectPath = dataPoint.isHashed
                ? getHashedBar(
                      canvasSVG,
                      dataPointSVG,
                      attributeHelper.x(dataPoint),
                      attributeHelper.y(dataPoint),
                      attributeHelper.width,
                      attributeHelper.height(dataPoint),
                      dataPoint.style
                  ).selectAll("rect")
                : getRect(
                      dataPointSVG,
                      attributeHelper.x(dataPoint),
                      attributeHelper.y(dataPoint),
                      attributeHelper.width,
                      attributeHelper.height(dataPoint)
                  ).attr("style", `${dataPoint.style}`);
            rectPath
                .attr("aria-describedby", dataPoint.key)
                .classed(styles.taskBar, true)
                .attr(
                    "aria-hidden",
                    config.shownTargets.indexOf(dataPoint.key) < 0
                );
        });
};

/**
 * Sets key as group name if group name is empty
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} content - Array of targets
 * @returns {undefined} - returns nothing
 */
const setGroupName = (config, content) => {
    if (utils.isEmpty(config.group)) {
        config.group = config.key;
        return;
    }
    if (!content.filter((c) => c.config.key === config.group).length) {
        config.group = config.key;
    }
};

/**
 * CLear the graph data points and bars currently rendered
 * @private
 * @param {Object} canvasSVG - d3 html element of canvas
 * @param {String} key - identifier
 * @returns {Object} - d3 select object
 */
const clear = (canvasSVG, key) =>
    d3RemoveElement(canvasSVG, `g[aria-describedby="${key}"]`);

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
        loadLegendItem(
            legendSVG,
            dataTarget,
            config.shownTargets,
            eventHandlers
        );
    }
};

export {
    processDataPoints,
    draw,
    clear,
    setGroupName,
    prepareLegendItems,
    barAttributesHelper
};
