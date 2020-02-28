"use strict";
import * as d3 from "d3";
import { parseTypedValue } from "../../../core/BaseConfig";
import { isValidAxisType } from "../../../helpers/axis";
import constants from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import { validateRegion } from "../../../helpers/region";
import styles from "../../../helpers/styles";
import { round2Decimals } from "../../../helpers/transformUtils";
import utils from "../../../helpers/utils";

/**
 * Calculates x-axis range for given region
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @param {object} region - region input
 * @returns {number} - xRange of region
 */
const getXRange = (scale, bandScale, region) => {
    const leftShiftOffset =
        bandScale.x0.bandwidth() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.LEFT_SHIFT_OFFSET_RATIO; // this value is used to center bars by shifting left
    const groupOffset = bandScale.x1(region.group);
    const leftShiftPadding =
        bandScale.x1.bandwidth() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES
            .REGION_LEFT_SHIFT_OFFSET_PADDING_RATIO; // padding to be added on left side of bar

    return scale.x(region.x) + groupOffset - leftShiftOffset + leftShiftPadding;
};
/**
 * Validates the input object provided for the region
 *
 * @private
 * @param {object} region - Region to be shown within graph
 * @param {string} targetAxis - Axis for which region needs to be shown
 * @param {Array} ticks - x axis ticks array
 * @param {string} xAxisType - Graph x axis type
 * @returns {undefined} - returns nothing
 */
const validateBarRegion = (region, targetAxis, ticks, xAxisType) => {
    validateRegion(region, targetAxis);
    if (utils.isEmpty(region.x) && !utils.isDateInstance(region.x)) {
        throw new Error(errors.THROW_MSG_BAR_REGION_EMPTY_X_VALUE);
    }
    if (!isValidAxisType(region.x, xAxisType)) {
        throw new Error(errors.THROW_MSG_REGION_INVALID_FORMAT);
    }
    if (!ticks.filter((t) => utils.isEqual(t, region.x)).length) {
        throw new Error(errors.THROW_MSG_INVALID_REGION_X_AXIS_TICK);
    }
};
/**
 * Process goal regions. Sets x-axis range and width of each region.
 * These values are used in createRegion method to create rect for each region
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} dataTarget - Data input object
 * @param {string} targetAxis - Axis for which region needs to be shown
 * @returns {undefined} - returns nothing
 */
const processGoalLines = (
    scale,
    bandScale,
    config,
    dataTarget,
    targetAxis = constants.Y_AXIS
) => {
    const regionWidth =
        bandScale.x1.bandwidth() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.REGION_WIDTH_RATIO;
    dataTarget.regions.forEach((region) => {
        validateBarRegion(
            region,
            targetAxis,
            config.axis.x.ticks.values,
            config.axis.x.type
        );
        region.x = parseTypedValue(region.x, config.axis.x.type);
        region.group = dataTarget.group;
        region.xRange = getXRange(scale, bandScale, region);
        region.width = regionWidth;
    });
};
/**
 * Creates regions based on input object provided. Region can be one or many.
 * Regions are rendered based on the content.
 * Criteria:
 * * Either start or end is mandatory.
 * * If start is not provided - 0 to end
 * * If end is not provided - start to INFINITY (end of the graph)
 * If xRange is provided - starts from xRange point
 * If width is provided - applies that width to region
 * Color can be provided to identify the range.
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {object} regionGroupSVG - d3 object of region group svg
 * @param {Array} regionList - List of regions to be shown within graph
 * @param {string} uniqueKey - unique id of the content loaded in graph
 * @returns {undefined} - returns nothing
 */
const createRegion = (scale, config, regionGroupSVG, regionList, uniqueKey) => {
    const regionPath = regionGroupSVG.selectAll("g").data(regionList);
    regionPath
        .enter()
        .append("rect")
        .classed(styles.region, true)
        .classed(styles.barGoalLine, true)
        .attr("aria-hidden", config.shownTargets.indexOf(uniqueKey) < 0)
        .attr("aria-describedby", `region_${uniqueKey}`)
        .attr(
            "style",
            (d) => `fill: ${d.color || constants.DEFAULT_BAR_REGION_COLOR};`
        )
        .attr(constants.X_AXIS, (d) => d.xRange | 0)
        .attr(constants.Y_AXIS, getYAxisRangePosition(scale, config))
        .attr("width", (d) => d.width | 0)
        .attr("height", function(d) {
            return getRegionHeight(d3.select(this), d, scale, config);
        });
    regionPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
};
/**
 * Translates region. Moves the "rect" according the new scale generated on-resize.
 * Width and height are also flexed accordingly.
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {object} regionGroupSVG - d3 object of region group svg
 * @returns {undefined} - returns nothing
 */
const translateRegion = (scale, config, regionGroupSVG) => {
    regionGroupSVG
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(constants.X_AXIS, (d) => d.xRange | 0)
        .attr(constants.Y_AXIS, getYAxisRangePosition(scale, config))
        .attr("width", (d) => d.width | 0)
        .attr("height", function(d) {
            return getRegionHeight(d3.select(this), d, scale, config);
        });
};
/**
 * Returns the region axis or "y" as default
 *
 * @private
 * @param {object} region - Region to be shown within graph
 * @returns {string} Region axis or "y" as default
 */
const getRegionAxis = (region) => region.axis || constants.Y_AXIS;
/**
 * Returns the function which returns Y Axis Vertical position for Range
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @returns {function(*=): number} Function which returns Y Axis Vertical position for Range
 */
const getYAxisRangePosition = (scale) => (bounds) =>
    bounds.end ? round2Decimals(scale[getRegionAxis(bounds)](bounds.end)) : 0;
/**
 * Returns the height for range based on Y Axes, start and end bounds
 * If start and end bounds arent provided then a "goal line" number is returned with
 * height worth of padding top
 *
 * @private
 * @param {object} regionPath - d3 object of region svg
 * @param {object} bounds - Start and end values for region
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON.
 * @returns {number} Height of the region for Y axes
 */
const getRegionHeight = (regionPath, bounds, scale, config) => {
    const upperBound = utils.getNumber(regionPath.attr(constants.Y_AXIS));
    const lowerBound = bounds.start
        ? round2Decimals(scale[getRegionAxis(bounds)](bounds.start)) +
          constants.DEFAULT_GOAL_LINE_STROKE_WIDTH
        : config.height + constants.DEFAULT_GOAL_LINE_STROKE_WIDTH;
    // If start and end are the same then `constants.DEFAULT_GOAL_LINE_STROKE_WIDTH`
    // worth of height is applied to make it seem like a goal line
    return lowerBound - upperBound || constants.DEFAULT_GOAL_LINE_STROKE_WIDTH;
};

export { processGoalLines, translateRegion, createRegion };
