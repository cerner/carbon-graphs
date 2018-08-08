import constants from "../../../helpers/constants";
import { barAttributesHelper } from "./creationHelpers";

/**
 * Transforms bars for a data point set in the Bar graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Object} dataTarget - Data points object
 * @returns {Object} d3 select object
 */
const translateBarGraph = (scale, ordinalScale, canvasSVG, dataTarget) => {
    const attributeHelper = barAttributesHelper(scale, ordinalScale);
    return canvasSVG
        .selectAll(`rect[aria-describedby=${dataTarget.key}]`)
        .transition(constants.d3Transition)
        .attr("x", (d) => attributeHelper.x(d))
        .attr("y", (d) => attributeHelper.y(d))
        .attr("width", attributeHelper.width)
        .attr("height", (d) => attributeHelper.height(d));
};

export { translateBarGraph };
