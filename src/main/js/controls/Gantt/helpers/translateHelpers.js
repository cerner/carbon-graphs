import { getYAxisHeight, processTickValues } from "../../../helpers/axis";
import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { translateCanvas } from "../../Graph/helpers/helpers";
import {
    getAxesScale,
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition
} from "./creationHelpers";

/**
 * Updates clipPath rectangle width and height on resize.
 * `clipPath` updates are necessary since the clip-path URL needs to get
 * the necessary parameters on resize so that data points are not cut off
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 svg path
 */
const translateDefs = (config, canvasSVG) =>
    canvasSVG
        .select(`clipPath#${constants.CLIP_PATH_ID}`)
        .selectAll("rect")
        .attr("height", config.height)
        .attr("width", getXAxisWidth(config));
/**
 * Updates the x, y and y2 (if enabled) positions on resize
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateAxes = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .select(`.${styles.axisX}`)
        .transition(constants.d3Transition)
        .attr(
            "transform",
            `translate(${getXAxisXPosition()},${getXAxisYPosition()})`
        )
        .call(axis.x);
};
/**
 * Translates the vertical grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the X Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {Object} d3 svg path
 */
const translateVGrid = (axis, config) => {
    let xAxisGrid;
    if (utils.notEmpty(config.axis.x.ticks.values)) {
        const ticks = config.axis.x.ticks.values;
        xAxisGrid = axis.x
            .orient("bottom")
            .tickValues(processTickValues(ticks))
            .tickSize(getYAxisHeight(config), 0, 0)
            .tickFormat("");
    } else {
        xAxisGrid = axis.x
            .orient("bottom")
            .tickSize(getYAxisHeight(config), 0, 0)
            .tickFormat("");
    }
    return xAxisGrid;
};
/**
 * Updates the horizontal and vertical grid sizes/positions on resize
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .select(`.${styles.grid}`)
        .attr(
            "transform",
            `translate(${getXAxisXPosition()},${getXAxisYPosition()})`
        );
    canvasSVG
        .select(`.${styles.gridV}`)
        .transition(constants.d3Transition)
        .call(translateVGrid(axis, config));
};
/**
 * Translates the rectangle which forms the container for graph content
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 svg path
 */
const translateContentContainer = (config, canvasSVG) =>
    canvasSVG
        .select(`.${styles.contentContainer}`)
        .transition(constants.d3Transition)
        .attr("width", getXAxisWidth(config))
        .attr("height", config.height);
/**
 * Translates graph based on the current positioning on resize. We
 * don't need to resize the entire graph, in our case we just need to transform:
 *  The canvas height and width
 *  The axes x and y co-ordinates
 *  The grid x and y co-ordinates
 *  The labels x and y co-ordinates
 *  @private
 *  @param {Object} control - Graph instance
 *  @returns {undefined} - returns nothing
 */
const translateGraph = (control) => {
    translateCanvas(control.config, control.svg);
    translateDefs(control.config, control.svg);
    translateAxes(control.axis, control.scale, control.config, control.svg);
    translateGrid(control.axis, control.scale, control.config, control.svg);
    translateContentContainer(control.config, control.svg);
};

export { translateGraph, translateVGrid };
