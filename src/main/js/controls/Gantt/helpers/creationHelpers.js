"use strict";
import d3 from "d3";
import {
    getAxisTickFormat,
    getXAxisHeight,
    prepareXAxis
} from "../../../helpers/axis";
import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import {
    attachEventHandlers,
    detachEventHandlers,
    getColorForTarget,
    getCurrentTransform,
    getShape,
    getShapeForTarget,
    getTransformScale,
    translateCanvas
} from "../../Graph/helpers/helpers";
import { translateVGrid } from "./translateHelpers";

const PADDING = constants.PADDING;
/**
 * Calculates the height for Y and Y2 axes.
 * If dimensions are provided in the input, then they are given priority.
 * NOTE: For height calculations, we are providing contingency for values that are
 * outside the range of y and y2 axes upper and lower bounds. This is called an outlier stretch factor.
 * When default height is used then this stretch factor is applied and they wont be applicable when
 * an input of dimension.height is provided
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {number} dimension - number in pixels for height
 * @returns {number} Height for the axes
 */
const determineHeight = (config, dimension) => {
    if (dimension.height) {
        return dimension.height;
    }
    return constants.DEFAULT_HEIGHT - PADDING.top - PADDING.bottom;
};
/**
 * Calculates axes sizes, specifically:
 *  X Axis: Height
 *  @private
 *  @param {Object} config - config object derived from input JSON
 *  @returns {undefined} - returns nothing
 */
const calculateAxesSize = (config) => {
    config.axisSizes = {};
    config.axisSizes.x = getXAxisHeight(config);
};
/**
 * X Axis's width that will hold equally spaced ticks
 * @private
 * @param {Object} config - config object derived from input JSON
 * @todo Check if the axis sizes are refreshed when tracks are added.
 * @returns {number} X Axis width
 */
const getXAxisWidth = (config) =>
    config.canvasWidth -
    (config.axisSizes.y || PADDING.left * 2 + PADDING.right);
/**
 * X Axis's starting position within the canvas
 * @private
 * @returns {number} Position for the axis
 */
const getXAxisXPosition = () => constants.PADDING.left;
/**
 * X Axis's position vertically relative to the canvas
 * @private
 * @returns {number} Position for the axis
 */
const getXAxisYPosition = () => PADDING.top * 2 + PADDING.bottom;
/**
 * Prepares X,Y and Y2 Axes according to their scale and available container width and height
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {Object} - Scaled axes object
 */
const getAxesScale = (axis, scale, config) => {
    axis.x = prepareXAxis(
        scale.x,
        config.axis.x.ticks.values,
        getXAxisWidth(config),
        getAxisTickFormat(
            config.locale,
            config.axis.x.ticks.format,
            config.axis.x.type
        ),
        "top"
    );
    return axis;
};
/**
 * Creates and sets the d3 scale for the Graph. Once the scale is created
 * we can create the axes. To create a d3 scale, we need domain and range.
 * To create an axis we need scale, orientation and tick values, if needed
 *
 * The scale function uses d3.linear.nice which rounds the values in the axes.
 * i.e. [0.20147987687960267, 0.996679553296417] will get translated to [0.2, 1]
 *
 * The scale function uses d3.linear.clamp which "clamps" the scale so that any
 * input provided will clamp between the domain.
 * i.e. Before, If you have domain 0 to 20 (input lower and upper bounds) and range 0 to 100 (Width in px).
 * When input 20 is provided then the scale returns the px positioning as 200, which would put the point outside the graph.
 * Instead we clamp it within the graph as an upper bound using clamp. Now, it will return 100px.
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const scaleGraph = (scale, config) =>
    (scale.x = d3.time
        .scale()
        .domain(config.axis.x.domain)
        .range([0, getXAxisWidth(config)])
        .clamp(true)
        .nice());
/**
 * Added defs element for the canvas. This currently holds the clip paths for the entire chart.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 svg path
 */
const createDefs = (config, canvasSVG) =>
    canvasSVG
        .append("defs")
        .append("clipPath")
        .attr("id", constants.CLIP_PATH_ID)
        .append("rect")
        .attr(constants.X_AXIS, getXAxisXPosition())
        .attr(constants.Y_AXIS, getXAxisYPosition())
        .attr("width", getXAxisWidth(config))
        .attr("height", config.height);
/**
 * Create the d3 grid - horizontal and vertical and append into the canvas.
 * Only performed if the flags for showHGrid and showVGrid are enabled
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    const gridSVG = canvasSVG
        .append("g")
        .classed(styles.grid, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition()},${getXAxisYPosition()})`
        );
    gridSVG.append("g").classed(styles.gridH, true);
    gridSVG
        .append("g")
        .classed(styles.gridV, true)
        .call(translateVGrid(axis, config));
};
/**
 * Create the d3 Axes - X, Y and Y2 and append into the canvas.
 * If axis.x.show, axis.y.show or axis.y2.show is set to false:
 * then the axis will be hidden
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createAxes = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .append("g")
        .classed(styles.axis, true)
        .classed(styles.axisX, true)
        .attr("aria-hidden", !config.axis.x.show)
        .attr(
            "transform",
            `translate(${getXAxisXPosition()}, ${getXAxisYPosition()})`
        )
        .call(axis.x);
};
/**
 * Creates a container for graph content (evident when there are no boundary ticks)
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 svg path
 */
const createContentContainer = (config, canvasSVG) =>
    canvasSVG
        .append("rect")
        .classed(styles.contentContainer, true)
        .attr(constants.X_AXIS, getXAxisXPosition())
        .attr(constants.Y_AXIS, getXAxisYPosition())
        .attr("width", getXAxisWidth(config))
        .attr("height", config.height);

export {
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition,
    getAxesScale,
    calculateAxesSize,
    translateCanvas,
    createAxes,
    createDefs,
    createGrid,
    createContentContainer,
    scaleGraph,
    determineHeight,
    getShape,
    getShapeForTarget,
    getColorForTarget,
    getCurrentTransform,
    getTransformScale,
    attachEventHandlers,
    detachEventHandlers
};
