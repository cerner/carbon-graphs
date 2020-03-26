"use strict";
import * as d3 from "d3";
import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";

/**
 * Updates clipPath rectangle width and height on resize.
 * `clipPath` updates are necessary since the clip-path URL needs to get
 * the necessary parameters on resize so that data points are not cut off
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const translateDefs = (config, canvasSVG) =>
    canvasSVG
        .select(`clipPath#${config.clipPathId}`)
        .selectAll("rect")
        .attr("height", config.canvasHeight)
        .attr("width", config.canvasWidth);
/**
 * Returns d3 data object for all the slices within pie chart content group
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Array} Array of objects containing data within each slice
 */
const getAllPieContentData = (canvasSVG) =>
    canvasSVG.selectAll(`.${styles.pieContentGroup}`).data();
/**
 * Clearing the slices that are already created from other contents,
 * Rewriting slices with updated percentages.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} returns nothing
 */
const clearAllSliceContent = (canvasSVG) => {
    const contentSlicePaths = canvasSVG.selectAll(`.${styles.pieContentSlice}`);
    if (!contentSlicePaths.empty()) {
        contentSlicePaths.html(null);
    }
};
/**
 * A slice is created relative to the other slice, so query the DOM for other slices
 * Add data to the layout transformer within the pie
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Function} layout - Pie layout transformer function
 * @returns {d3.selection} returns d3 selection list containing all the slices within the pie
 */
const updateAllSliceLayout = (canvasSVG, layout) =>
    canvasSVG
        .selectAll(`.${styles.pieContentSlice}`)
        .data(layout(getAllPieContentData(canvasSVG)));
/**
 * Returns a percentage value given the start angle and end angle of a slice arc.
 *
 * @private
 * @param {number} startAngle - Start angle of d3 arc
 * @param {number} endAngle - End angle of d3 arc
 * @returns {number} Percentage based on start and end angle
 */
const getSlicePercentage = (startAngle, endAngle) =>
    ((endAngle - startAngle) / (2 * Math.PI)) * 100;

/**
 * Translates all slices when a new content is added.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} contentSVG - d3 selection node of content group
 * @param {Function} layout - Pie layout transformer function
 * @param {Function} arc - Pie arc transformer function
 * @returns {undefined} - returns nothing
 */
const translateSlices = (config, contentSVG, layout, arc) => {
    clearAllSliceContent(contentSVG);
    const allSlicePaths = updateAllSliceLayout(contentSVG, layout);
    allSlicePaths
        .append("path")
        .attr("fill", (d) => d.data.color)
        .transition()
        .call(
            constants.d3Transition(constants.D3_TRANSITION_PROPERTIES_ENABLED)
        )
        .attrTween("d", (d) => {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            return (t) => {
                d.endAngle = i(t);
                return arc(d);
            };
        });
};
/**
 * Translates graph based on the current positioning on resize. We
 * don't need to resize the entire graph, in our case we just need to transform:
 *  The defs height and width
 *
 *  @private
 *  @param {object} control - Graph instance
 *  @returns {undefined} - returns nothing
 */
const translatePieGraph = (control) => {
    translateDefs(control.config, control.svg);
};

export { getSlicePercentage, translatePieGraph, translateSlices };
