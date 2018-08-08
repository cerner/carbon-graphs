import { barAttributesHelper } from "./creationHelpers";
import constants from "../../../helpers/constants";

/**
 * Transforms bars for a data point set in the Bar graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} ordinalScale - bar x-axis ordinal scale
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Object} dataTarget - Data points object
 * @param {Object} config - config object derived from input JSON
 * @returns {Object} d3 select object
 */
const translateBarGraph = (scale, ordinalScale, canvasSVG, dataTarget) => {
    const attributehelper = barAttributesHelper(scale, ordinalScale);
    return canvasSVG
        .selectAll(`rect[aria-describedby=${dataTarget.key}]`)
        .transition(constants.d3Transition)
        .attr("x", (d) => attributehelper.x(d))
        .attr("y", (d) => attributehelper.y(d))
        .attr("width", (d) => attributehelper.width)
        .attr("height", (d) => attributehelper.height(d));
};

export { translateBarGraph };
