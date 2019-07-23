"use strict";
import d3 from "d3";
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
 * Calculates and returns outer padding ratio for ordidnal scale unit bandwidth
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
 * Creates and sets the d3 ordinalScale for the Graph. This scale is created only if
 * static x-axis is provided for graph.
 * To create a d3 ordinalScale, we need domain, rangeBands and bandwidth padding
 *
 * @private
 * @param {object} ordinalScale - d3 ordinalScale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} content - Array of targets
 * @returns {undefined} - returns nothing
 */
const scaleOrdinalAxis = (ordinalScale, config, content) => {
    if (
        utils.notEmpty(config.axis.x.ticks) &&
        utils.notEmpty(config.axis.x.ticks.values)
    ) {
        ordinalScale.x0 = d3.scale
            .ordinal()
            .domain(config.axis.x.ticks.values)
            .rangeBands(
                getXAxisRange(config),
                getBandwidthPaddingRatio(content, config.shownTargets)
            );
        ordinalScale.x1 = d3.scale.ordinal();
    }
};
/**
 * Sets domain and range bands for ordinal scale
 *
 * @private
 * @param {Array} bands - bands array for bandwidth
 * @param {Array} content - Array of targets
 * @param {object} ordinalScale - ordinal scale object
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setX0X1Scale = (bands, content, ordinalScale, config) => {
    if (
        utils.isEmpty(content) ||
        utils.isEmpty(bands) ||
        utils.isEmpty(config.axis.x.ticks) ||
        utils.isEmpty(config.axis.x.ticks.values)
    ) {
        return;
    }
    ordinalScale.x1.domain(bands).rangeBands([0, ordinalScale.x0.rangeBand()]);
};
/**
 * Sets offsets for bars on content load
 *
 * @private
 * @param {Array} content - Array of targets
 * @param {Array} contentTargets - Array of targets config objects
 * @param {object} input - load input object
 * @param {object} ordinalScale - ordinal scale object
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setBarOffsets = (
    content,
    contentTargets,
    input,
    ordinalScale,
    config
) => {
    const shownTargets = config.shownTargets;
    const group = contentTargets.filter(
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
        ordinalScale,
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

export { scaleOrdinalAxis, setBarOffsets };
