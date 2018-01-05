"use strict";
import d3 from "d3";
import {
    buildAxisLabel,
    determineOutlierStretchFactor,
    getAxesScale,
    getRotationForAxis,
    getXAxisLabelXPosition,
    getXAxisLabelYPosition,
    getXAxisRange,
    getXAxisWidth,
    getXAxisXPosition,
    getY2AxisLabelXPosition,
    getYAxisHeight,
    getYAxisLabelXPosition,
    getYAxisLabelYPosition,
    getYAxisRange,
    hasY2Axis,
    translateAxes
} from "../../helpers/axis";
import constants, { SYMBOLS } from "../../helpers/constants";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import { getScale } from "../BaseConfig";
import { isValidCarbonSymbol } from "../Symbol";

const BASE_CANVAS_PADDING = constants.BASE_CANVAS_WIDTH_PADDING;
const PADDING = constants.PADDING;
const DEFAULT_HEIGHT = constants.DEFAULT_HEIGHT;

/**
 * Updates the height and width of the canvas on resize
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 svg path
 */
const translateCanvas = (config, canvasSVG) =>
    canvasSVG.attr("height", config.canvasHeight)
             .attr("width", config.canvasWidth - BASE_CANVAS_PADDING);
/**
 * Translates the horizontal grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the Y Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {Object} d3 svg path
 */
const translateHGrid = (axis, config) => {
    let yAxisGrid;
    if (utils.notEmpty(config.axis.y.ticks.values)) {
        const ticks = config.axis.y.ticks.values;
        yAxisGrid = axis.y.tickValues(ticks.slice(1, ticks.length - 1))
                        .tickSize((getXAxisWidth(config) * -1), 0, 0)
                        .tickFormat("");
    }
    else {
        yAxisGrid = axis.y.tickSize((getXAxisWidth(config) * -1), 0, 0)
                        .tickFormat("");
    }
    return yAxisGrid;
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
        xAxisGrid = axis.x.tickValues(ticks.slice(1, ticks.length - 1))
                        .tickSize((getYAxisHeight(config)), 0, 0)
                        .tickFormat("");
    }
    else {
        xAxisGrid = axis.x.tickSize((getYAxisHeight(config)), 0, 0)
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
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG.select(`.${styles.grid}`).attr("transform", `translate(${getXAxisXPosition(config)},${PADDING.top})`);
    if (config.showHGrid) {
        canvasSVG.select(`.${styles.gridH}`).call(translateHGrid(axis, config));
    }

    if (config.showVGrid) {
        canvasSVG.select(`.${styles.gridV}`).call(translateVGrid(axis, config));
    }
};
/**
 * Updates the x, y, y2 axes label positions on resize
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateLabel = (config, canvasSVG) => {
    if (config.axis.x.label) {
        canvasSVG.select(`.${styles.axisLabelX}`)
                 .attr("transform", `translate(${getXAxisLabelXPosition(config)},${getXAxisLabelYPosition(config)
                     }) rotate(${getRotationForAxis(constants.X_AXIS)})`);
    }

    if (config.axis.y.label) {
        canvasSVG.select(`.${styles.axisLabelY}`)
                 .attr("transform", `translate(${getYAxisLabelXPosition(config)}, ${getYAxisLabelYPosition(config)
                     }) rotate(${getRotationForAxis(constants.Y_AXIS)})`);
    }

    if (hasY2Axis(config.axis)) {
        canvasSVG.select(`.${styles.axisLabelY2}`)
                 .attr("transform", `translate(${getY2AxisLabelXPosition(config)}, ${
                     getYAxisLabelYPosition(config)}) rotate(${getRotationForAxis(constants.Y2_AXIS)})`);
    }
};
/**
 * Checks to see if the date provided is of ISO8601 datetime format.
 * @private
 * @param {string} str - Datetime string in ISO8601 format: yyyy-MM-ddTHH:mm:ssZ
 * @returns {string} true if in correct format
 */
const isDate = (str) => constants.ISO8601_DATE_TIME_MILLI.test(str);

/**
 * Determines the domain for x, y and y2 axes. For Y axis and Y2 axis,
 * the end points are calculated based on the ranges provided. This is done so that the axes are
 * padded on both ends properly.
 * For X Axis no such processing is provided. This decision was made due to the resize happening
 * horizontally rather than vertical resize. To alleviate processing cost we depend on x axis's end points directly.
 * If the consumer needs to pad the X Axis then they can provide the range with sufficient padding.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @returns {Object} config - config object derived from input JSON
 */
const updateAxesDomain = (config) => {
    config.outlierStretchFactor = determineOutlierStretchFactor(config);
    const halfDomain = (config.axis.y.domain[ 1 ] - config.axis.y.domain[ 0 ]) / 2;
    const midPoint = (config.axis.y.domain[ 1 ] + config.axis.y.domain[ 0 ]) / 2;
    config.axis.y.domain[ 0 ] = midPoint - (halfDomain * config.outlierStretchFactor.lowerLimit);
    config.axis.y.domain[ 1 ] = midPoint + (halfDomain * config.outlierStretchFactor.upperLimit);
    padDomain(config.axis.y.domain);
    if (hasY2Axis(config.axis)) {
        const halfDomain = (config.axis.y2.domain[ 1 ] - config.axis.y2.domain[ 0 ]) / 2;
        const midPoint = (config.axis.y2.domain[ 1 ] + config.axis.y2.domain[ 0 ]) / 2;
        config.axis.y2.domain[ 0 ] = midPoint - (halfDomain * config.outlierStretchFactor.lowerLimit);
        config.axis.y2.domain[ 1 ] = midPoint + (halfDomain * config.outlierStretchFactor.upperLimit);
        padDomain(config.axis.y2.domain);
    }
    return config;
};
/**
 * Added defs element for the canvas. This currently holds the clip paths for the entire chart.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {Object} d3 svg path
 */
const createDefs = (config, canvasSVG) =>
    canvasSVG.append("defs")
             .append("clipPath")
             .attr("id", constants.CLIP_PATH_ID)
             .append("rect")
             .attr(constants.X_AXIS, getXAxisXPosition(config))
             .attr(constants.Y_AXIS, PADDING.top)
             .attr("width", "100%")
             .attr("height", config.canvasHeight);
/**
 * Create the d3 grid - horizontal and vertical and append into the canvas.
 * Only performed if the flags for showHGrid and showVGrid are enabled
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    const gridSVG = canvasSVG.append("g")
                             .classed(styles.grid, true)
                             .attr("transform", `translate(${getXAxisXPosition(config)},${PADDING.top})`);
    if (config.showHGrid) {
        gridSVG.append("g")
               .classed(styles.gridH, true)
               .call(translateHGrid(axis, config));
    }
    if (config.showVGrid) {
        gridSVG.append("g")
               .classed(styles.gridV, true)
               .call(translateVGrid(axis, config));
    }
};
/**
 * Create the d3 Labels - X, Y and Y2 and append into the canvas.
 * Only if showLabel is enabled. X Axis is 0 deg rotated, Y Axis is rotated 90 deg
 * Y2 Axis is rotated -90 deg along its horizontal axis.
 * @private
 * @todo Add symbols for each datapoint set into corresponding axis
 * @todo Add datapoint set label to corresponding axis
 * @todo Label overflow formatting, adding ellipsis?
 * @param {Object} config - config object derived from input JSON
 * @param {Object} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createLabel = (config, canvasSVG) => {
    if (config.showLabel) {
        if (config.axis.x.label) {
            const labelPath = canvasSVG.append("g")
                                       .classed(styles.axisLabelX, true)
                                       .attr("transform", `translate(${getXAxisLabelXPosition(config)},${getXAxisLabelYPosition(config)
                                           }) rotate(${getRotationForAxis(constants.X_AXIS)})`);
            buildAxisLabel(labelPath, utils.sanitize(config.axis.x.label));
        }
        if (config.axis.y.label) {
            const labelPath = canvasSVG.append("g")
                                       .classed(styles.axisLabelY, true)
                                       .attr("transform", `translate(${getYAxisLabelXPosition(config)}, ${getYAxisLabelYPosition(config)
                                           }) rotate(${getRotationForAxis(constants.Y_AXIS)})`);
            buildAxisLabel(labelPath, utils.sanitize(config.axis.y.label));
        }
        if (hasY2Axis(config.axis)) {
            const labelPath = canvasSVG.append("g")
                                       .classed(styles.axisLabelY2, true)
                                       .attr("transform", `translate(${getY2AxisLabelXPosition(config)}, ${
                                           getYAxisLabelYPosition(config)}) rotate(${getRotationForAxis(constants.Y2_AXIS)})`);
            buildAxisLabel(labelPath, utils.sanitize(config.axis.y2.label));
        }
    }
};
/**
 * Creates and sets the d3 scale for the Graph. Once the scale is created
 * we can create the axes. To create a d3 scale, we need domain and range.
 * To create an axis we need scale, orientation and tick values, if needed
 *
 * The range function uses d3.linear.nice which rounds the values in the axes.
 * i.e. [0.20147987687960267, 0.996679553296417] will get translated to [0.2, 1]
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const scaleGraph = (scale, config) => {
    scale.y = d3.scale.linear()
                .domain(config.axis.y.domain)
                .range(getYAxisRange(config))
                .nice();
    scale.x = getScale(config.axis.x.type).domain(config.axis.x.domain)
                                          .range(getXAxisRange(config))
                                          .nice();
    if (hasY2Axis(config.axis)) {
        scale.y2 = d3.scale.linear()
                     .domain(config.axis.y2.domain)
                     .range(getYAxisRange(config))
                     .nice();
    }
};
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
    translateAxes(control.axis, control.scale, control.config, control.svg);
    translateGrid(control.axis, control.scale, control.config, control.svg);
    translateLabel(control.config, control.svg);
};
/**
 * Pads the domain with some buffer that gets calculated based on input values
 * @private
 * @param {Array} domain - Lower and upper bounds for the axes. Currently only being performed for Y and Y2 axes
 * @returns {undefined} - returns nothing
 */
const padDomain = (domain) => {
    const lowerBound = domain[ 0 ];
    const upperBound = domain[ 1 ];
    const domainRange = Math.abs(upperBound - lowerBound);
    const domainStretch = domainRange * (60 / 1000);
    domain[ 1 ] = upperBound + domainStretch;
    domain[ 0 ] = lowerBound - domainStretch;
};

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
    const halfHeight = (DEFAULT_HEIGHT - PADDING.top - PADDING.bottom) / 2;
    return (halfHeight * config.outlierStretchFactor.upperLimit +
        halfHeight * config.outlierStretchFactor.lowerLimit);
};
/**
 * Checks if the symbol is part of inbuilt d3 symbols list or otherwise.
 * @private
 * @param {Object} dataPoint - Data point containing the symbol
 * @returns {Object} Symbol Object if present or null
 */
const isBuiltAsAPathSymbol = (dataPoint) => {
    const symbol = getSymbolForTarget(dataPoint);
    return isValidCarbonSymbol(symbol) ? symbol : null;
};
/**
 * Returns the symbol property from the data point.
 * If the symbol is not provided then the default symbol is Circle.
 * @private
 * @param {Object} dataPoint - Data point containing x, y co-ordinate points, color and symbol.
 * @returns {string} provided symbol or a circle.
 */
const getSymbolForTarget = (dataPoint) => (dataPoint.symbol || SYMBOLS.CIRCLE);
/**
 * Returns the color property from the data point.
 * If the symbol is not provided then the default color is #1C1F21 {black}.
 * @private
 * @param {Object} dataPoint - Data point containing x, y co-ordinate points, color and symbol.
 * @returns {string} provided symbol or a circle.
 */
const getColorForTarget = (dataPoint) => (dataPoint.color || constants.DEFAULT_COLOR);

/**
 * Attach event handlers for Line graph.
 * requestAnimationFrame will be used if consumer doesnt need
 * to throttle the graph resize. Which will result in a smoother animation
 * If the throttle is needed then use `throttle` property in the input JSON
 * @private
 * @param {Object} control - Line instance
 * @returns {undefined} - returns nothing
 */
const attachEventHandlers = (control) => {
    let resizeTimeout = 0;
    const getConfig = (control, config) => {
        const boundResize = control.resize.bind(control);
        const setRequestAnimationFrame = () => window.requestAnimationFrame(boundResize);
        if (!config.hasThrottle) {
            return setRequestAnimationFrame;
        }
        return () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(setRequestAnimationFrame, config.throttle);
        };
    };
    const resizeCallback = getConfig(control, control.config);
    window.addEventListener("resize", resizeCallback, true);
    control.resizeHandler = resizeCallback;
};
/**
 * Detach event handlers currently set for Line graph
 * @private
 * @param {Object} control - Line instance
 * @returns {undefined} - returns nothing
 */
const detachEventHandlers = (control) => {
    window.removeEventListener("resize", control.resizeHandler, true);
};

export {
    translateLabel,
    translateGrid,
    translateCanvas,
    isDate,
    updateAxesDomain,
    createDefs,
    createGrid,
    createLabel,
    scaleGraph,
    translateGraph,
    padDomain,
    determineHeight,
    isBuiltAsAPathSymbol,
    getSymbolForTarget,
    getColorForTarget,
    attachEventHandlers,
    detachEventHandlers
};
