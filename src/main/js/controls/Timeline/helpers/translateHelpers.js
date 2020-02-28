"use strict";
import * as d3 from "d3";
import { getRotationForAxis, getYAxisHeight } from "../../../helpers/axis";
import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import { getTransformScale } from "../../../helpers/transformUtils";
import { translateCanvas } from "../../Graph/helpers/helpers";
import {
    getAxesScale,
    getXAxisLabelXPosition,
    getXAxisLabelYPosition,
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition
} from "./creationHelpers";

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
        .attr("height", getYAxisHeight(config))
        .attr("width", getXAxisWidth(config));
/**
 * Updates the x position on resize
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateAxes = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .select(`.${styles.axisX}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition(
                config
            )})`
        )
        .call(axis.x);
};
/**
 * Updates the x, y, y2 axes label positions on resize
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateLabel = (config, canvasSVG) => {
    if (config.axis.x.label) {
        canvasSVG
            .select(`.${styles.axisLabelX}`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr(
                "transform",
                `translate(${getXAxisLabelXPosition(
                    config
                )},${getXAxisLabelYPosition(
                    config
                )}) rotate(${getRotationForAxis(constants.X_AXIS)})`
            );
    }
};
/**
 * Transforms the point in the timeline graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON.
 * @returns {Function} - function that returns translate string for d3 transform
 */
const transformPoint = (scale, config) => (value) => (scaleFactor) => {
    const getX = (val) => scale.x(val.x);
    return `translate(${getX(value)},${getXAxisYPosition(
        config
    )}) scale(${scaleFactor})`;
};
/**
 * Transforms points for a data point set in the timeline graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - d3 object of points group key
 * @param {string} style - CSS style representing the data points
 * @returns {object} d3 select object
 */
const translatePoints = (scale, config, canvasSVG, key, style) =>
    canvasSVG
        .select(`.${styles.timelineContentGroup}[aria-describedby="${key}"]`)
        .selectAll(style)
        .each(function(d) {
            const pointGroupSVG = d3.select(this);
            pointGroupSVG
                .select("g")
                .transition()
                .call(
                    constants.d3Transition(config.settingsDictionary.transition)
                )
                .attr("transform", function() {
                    return transformPoint(scale, config)(d)(
                        getTransformScale(this)
                    );
                });
        });
/**
 * Translates graph based on the current positioning on resize. We
 * don't need to resize the entire graph, in our case we just need to transform:
 *  The canvas height and width
 *  The x axis x and y co-ordinates
 *  The label x and y co-ordinates
 *
 *  @private
 *  @param {object} control - Graph instance
 *  @returns {undefined} - returns nothing
 */
const translateTimelineGraph = (control) => {
    translateCanvas(control.config, control.svg);
    translateDefs(control.config, control.svg);
    translateAxes(control.axis, control.scale, control.config, control.svg);
    translateLabel(control.config, control.svg);
};

export { translateTimelineGraph, transformPoint, translatePoints };
