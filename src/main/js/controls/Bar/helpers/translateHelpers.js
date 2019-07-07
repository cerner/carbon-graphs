import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import {
    getTextLabelsXPosition,
    getTextLabelsYPosition
} from "./axisInfoRowHelpers";
import { barAttributesHelper } from "./creationHelpers";
import { translateSelectBars } from "./selectionHelpers";

/**
 * Transforms bars for a data point set in the Bar graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Object} dataTarget - Data points object
 * @param {Object} config - graph config object
 * @returns {Object} d3 select object
 */
const translateBarGraph = (
    scale,
    ordinalScale,
    canvasSVG,
    dataTarget,
    config
) => {
    const attributeHelper = barAttributesHelper(scale, ordinalScale);
    translateSelectBars(scale, ordinalScale, canvasSVG, config);
    return canvasSVG
        .selectAll(`rect[aria-describedby=${dataTarget.key}]`)
        .transition()
        .call(constants.d3Transition)
        .attr("x", (d) => attributeHelper.x(d))
        .attr("y", (d) => attributeHelper.y(d))
        .attr("width", attributeHelper.width)
        .attr("height", (d) => attributeHelper.height(d));
};

/**
 * Translates text label in axis info row
 * @private
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - graph config object
 * @param {Array} canvasSVG -d3 object of canvas svg
 * @param {Array} textLabelList - input axis info row JSON
 * @param {Object} dataTarget - Data points object
 * @returns {Object} d3 select object
 */
const translateTextLabel = (
    ordinalScale,
    scale,
    config,
    canvasSVG,
    textLabelList,
    dataTarget
) => {
    const attributeHelper = barAttributesHelper(scale, ordinalScale);
    const axisInfoPath = canvasSVG.select(`.${styles.axisInfoRow}`);
    return axisInfoPath
        .selectAll(`g[aria-describedby="text_label_${dataTarget.key}"]`)
        .transition()
        .call(constants.d3Transition)
        .attr(
            "transform",
            (d, index) =>
                `translate(${getTextLabelsXPosition(
                    attributeHelper,
                    textLabelList,
                    index
                )}, ${getTextLabelsYPosition(config)})`
        );
};

export { translateBarGraph, translateTextLabel };
