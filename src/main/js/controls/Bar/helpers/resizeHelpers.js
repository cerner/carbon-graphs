"use strict";
import * as d3 from "d3";
import { getXAxisRange } from "../../../helpers/axis";
import constants from "../../../helpers/constants";
import utils from "../../../helpers/utils";
import Bar from "../Bar";

/**
 * Filters and returns number of groups available for a unit bandwidth (for each x-axis tick)
 *
 * @private
 * @param {Array} content - Array of targets
 * @param {Array} shownTargets - Array of shown targets
 * @returns {Array} - array of group names
 */
const getBands = (content, shownTargets) => {
    const bands = [];
    const addGroupNameToBands = (group) => {
        if (bands.indexOf(group) < 0) {
            bands.push(group);
        }
    };
    if (utils.notEmpty(content)) {
        content.forEach((value) => {
            if (value instanceof Bar) {
                if (shownTargets.indexOf(value.config.key) > -1) {
                    addGroupNameToBands(value.config.group);
                }
            }
        });
    }
    return bands;
};
/**
 * Calculates and returns outer padding ratio for band scale unit bandwidth
 * Outer padding should be 2.5 times the inner padding
 * Inner padding should be 0.5 times the bar width
 *
 * @private
 * @param {Array} content - Array of targets
 * @param {Array} shownTargets - Array of shown targets
 * @returns {number} - padding value
 */
const getBandwidthPaddingRatio = (content, shownTargets) =>
    constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.OUTER_PADDING_RATIO /
    (3 * getBands(content, shownTargets).length +
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.OUTER_PADDING_RATIO);
/**
 * Creates and sets the d3 bandScale for the Graph. This scale is created only if
 * static x-axis is provided for graph.
 * To create a d3 bandScale, we need domain, range and bandwidth padding
 *
 * @private
 * @param {object} bandScale - d3 bandScale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} content - Array of targets
 * @returns {undefined} - returns nothing
 */
const scaleBandAxis = (bandScale, config, content) => {
    if (
        utils.notEmpty(config.axis.x.ticks) &&
        utils.notEmpty(config.axis.x.ticks.values)
    ) {
        bandScale.x0 = d3
            .scaleBand()
            .domain(config.axis.x.ticks.values)
            .range(getXAxisRange(config))
            .paddingInner(
                getBandwidthPaddingRatio(content, config.shownTargets)
            );
        bandScale.x1 = d3.scaleBand();
    }
};
/**
 * Sets domain and range bands for band scale
 *
 * @private
 * @param {Array} bands - bands array for bandwidth
 * @param {Array} content - Array of targets
 * @param {object} bandScale - band scale object
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setX0X1Scale = (bands, content, bandScale, config) => {
    if (
        utils.isEmpty(content) ||
        utils.isEmpty(bands) ||
        utils.isEmpty(config.axis.x.ticks) ||
        utils.isEmpty(config.axis.x.ticks.values)
    ) {
        return;
    }
    bandScale.x1.domain(bands).range([0, bandScale.x0.bandwidth()]);
};
/**
 * Sets offsets for bars on content load
 *
 * @private
 * @param {Array} content - Array of targets
 * @param {Array} contentConfig - Array of targets config objects
 * @param {object} input - load input object
 * @param {object} bandScale - band scale object
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setBarOffsets = (content, contentConfig, input, bandScale, config) => {
    const shownTargets = config.shownTargets;
    const group = contentConfig.filter(
        (d) =>
            d.key === input.config.key ||
            (d.group === input.config.group &&
                shownTargets.indexOf(d.key) !== -1)
    );
    setStackOffset(
        input.dataTarget.internalValuesSubset,
        group.splice(group.indexOf(input.config) + 1)
    );
    setX0X1Scale(
        getBands(content, config.shownTargets),
        content,
        bandScale,
        config
    );
};
/**
 * In case of stacked bars, this method sets y-axis offset for each data point.
 * By default, every bar is considered as a stacked bar. This method checks if there are any bars
 * getting stacked under it and calculates offset for both positive and negative bars.
 * If no other bar is stacked below this bar, offset is set to 0.
 *
 * @private
 * @param {Array} inputValues - Array of dataTarget's inputValueSubset
 * @param {Array} group - Array of filtered group names
 * @returns {undefined} - returns nothing
 */
const setStackOffset = (inputValues, group) => {
    inputValues.forEach((value) => {
        let upY = 0;
        let downY = 0;
        group.forEach((prev) => {
            const f = prev.values.filter((p) => utils.isEqual(p.x, value.x));
            if (f.length > 0) {
                if (f[0].y > 0) {
                    upY += f[0].y;
                } else {
                    downY += f[0].y;
                }
            }
        });
        value.y0 = value.y < 0 ? downY : upY;
    });
};

export { scaleBandAxis, setBarOffsets };
