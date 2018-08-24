"use strict";
import d3 from "d3";
import {
    getYAxisHeight,
    getYAxisXPosition,
    processTickValues
} from "../../../helpers/axis";
import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    getTransformScale,
    translateCanvas
} from "../../Graph/helpers/helpers";
import {
    getAxesScale,
    getTrackLabel,
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition,
    getYAxisYPosition
} from "./creationHelpers";
import { calculatePercentage } from "./durationHelpers";

/**
 * Returns the track label position in D3 scale's domain
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {string} yVal - Current track label
 * @returns {number} Track label index
 */
const getLabelIndexFromDomain = (scale, yVal) => scale.y.domain().indexOf(yVal);
/**
 *
 * Validates track label to get the Y Co-ordinate before figuring out the translation
 * Cases include:
 * When TrackLabel is not present in the domain
 * When TrackList is empty i.e. No content is loaded yet
 * When domain has more items than trackList. i.e. This is a result of using transition
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {string} yVal - Current track label
 * @param {number} index - label index in domain
 * @returns {boolean} true if y co-ordinate transform translate is not needed, false otherwise
 */
const validateLabelBeforeTranslation = (scale, config, yVal, index) =>
    index < 0 ||
    utils.isEmpty(config.axis.y.trackList) ||
    scale.y.domain().length > Object.keys(config.axis.y.trackList).length;
/**
 * Returns the Y co-ordinate translate value for Y axis transform based on its domain. Since the
 * Y Axis for gantt is a text and not conventional number system. We need to
 * Calculate the pixel region for that label and get the current d3 range value.
 * @private
 * @description Use this to move the contents to the center of the track
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {string} yVal - Current track label
 * @returns {number} y co-ordinate transform translate
 */
const getTransformYCoordinate = (scale, config, yVal) => {
    if (!scale) {
        return 0;
    }
    const index = getLabelIndexFromDomain(scale, yVal);
    if (validateLabelBeforeTranslation(scale, config, yVal, index)) {
        return scale.y(yVal) / 2;
    }
    const getCurrentTrackHeightList = (trackList) =>
        Object.keys(trackList).map((o) => trackList[o].trackHeight);
    const currentHeight = getCurrentTrackHeightList(config.axis.y.trackList);
    return currentHeight[index] / 2;
};
/**
 * Returns the X co-ordinate translate value for Y axis transform based on its scale
 * @private
 * @param {Object} [scale] - d3 scale for Graph
 * @param {string} [xVal] - current x Axis date value
 * @returns {number} x co-ordinate transform translate
 */
const getTransformXCoordinate = (scale, xVal) => (!scale ? 0 : scale.x(xVal));
/**
 * Uses the scale to move track content to the correct track position and center it relative to the track
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {string} yVal - Current track label
 * @returns {number} y co-ordinate transform translate
 */
const getTransformYCoordinateWithScale = (scale, config, yVal) => {
    const label = getTrackLabel(yVal);
    const offset = !scale ? 0 : scale.y(label);
    const yPosBasedOnHeight = getTransformYCoordinate(scale, config, label);
    return offset + yPosBasedOnHeight;
};
/**
 * Returns the Transform string for a given d3 domain. This can be used to translate the
 * graph/track elements
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {function(*=): string} Transform property of translate
 */
const getTrackLabelTransformProperty = (scale, config) => (trackName) =>
    `translate(${getTransformXCoordinate()}, ${getTransformYCoordinate(
        scale,
        config,
        trackName
    )})`;
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
        .select(`clipPath#${config.clipPathId}`)
        .selectAll("rect")
        .attr("height", getYAxisHeight(config))
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
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition()})`
        )
        .call(axis.x);
    canvasSVG
        .select(`.${styles.axisY}`)
        .transition(constants.d3Transition)
        .attr(
            "transform",
            `translate(${getYAxisXPosition(config)}, ${getYAxisYPosition()})`
        )
        .call(axis.y);
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
 * Translates the horizontal grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the Y Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 * @private
 * @param {Object} axis - Axis scaled according to input parameters
 * @param {Object} config - config object derived from input JSON
 * @returns {Object} d3 svg path
 */
const translateHGrid = (axis, config) =>
    axis.y.tickSize(getXAxisWidth(config) * -1, 0, 0).tickFormat("");
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
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition()})`
        );
    canvasSVG
        .select(`.${styles.gridH}`)
        .transition(constants.d3Transition)
        .call(translateHGrid(axis, config));
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
        .attr("height", getYAxisHeight(config));
/**
 * Translates the dateline, based on each content loaded.
 * When a new content is loaded, the height of the graph changes
 * since the height is consumer provided value. We would need to
 * translate the straight line based on the new height.
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateDateline = (scale, config, canvasSVG) => {
    if (!config.dateline.value) {
        return;
    }
    const xVal = scale.x(utils.parseDateTime(config.dateline.value));
    const datelineGroup = canvasSVG
        .select(`.${styles.ganttDatelineGroup}`)
        .transition(constants.d3Transition)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition()})`
        );
    datelineGroup
        .select(`.${styles.ganttDatelinePoint}`)
        .attr("transform", `translate(${xVal},0)`);
    datelineGroup
        .select(`.${styles.ganttDateline}`)
        .attr("x1", xVal)
        .attr("y1", 0)
        .attr("x2", xVal)
        .attr("y2", getYAxisHeight(config));
};
/**
 * Translates label to center of each track. Normally a tick text is aligned to the grid/tick,
 * but we want to move it to the center position to better associate it to the track.
 * We take the domain and range, calculate the index of the current text data in the domain and then use
 * the range value to get the pixel position of the tick.
 * With the current position and previous tick position, we can find out the middle area for
 * repositioning the text.
 * @private
 * @param {Object} scale - d3 scale taking into account the input parameters
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateLabelText = (scale, config, canvasSVG) =>
    canvasSVG
        .selectAll(".carbon-axis.carbon-axis-y .tick text")
        .attr("transform", getTrackLabelTransformProperty(scale, config));
/**
 * Transforms the point in the gantt graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {Array<number>|number} [scaleFactor] - amount of transform needs to be done for scaling an svg
 * @returns {Function} - translate string for d3 transform function
 */
const transformPoint = (
    scale,
    config,
    scaleFactor = constants.DEFAULT_PLOT_SCALE
) => (value) =>
    `translate(${getTransformXCoordinate(
        scale,
        value.x
    )},${getTransformYCoordinateWithScale(
        scale,
        config,
        value.y
    )}) scale(${scaleFactor})`;
/**
 * Transforms points for a data point set in the gantt graph on resize
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {Array} trackPath - d3 object of track element
 * @param {string} style - CSS style representing the data points
 * @returns {Object} d3 select object
 */
const translatePoints = (scale, config, trackPath, style) =>
    trackPath
        .selectAll(style)
        .transition(constants.d3Transition)
        .attr("transform", function(value) {
            return transformPoint(
                scale,
                config,
                getTransformScale(this)
            )(value);
        });
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
    translateDateline(control.scale, control.config, control.svg);
};
/**
 * Called on resize, translates the data point values.
 * This includes:
 *  Points
 *  Selected point indicators
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {Array} trackPath - d3 object of track
 * @returns {undefined} - returns nothing
 */
const translateActionPoints = (scale, config, trackPath) => {
    translatePoints(scale, config, trackPath, `.${styles.point}`);
    translatePoints(scale, config, trackPath, `.${styles.dataPointSelection}`);
};
/**
 * Translates task bars when resized.
 * @description When translating the width of a bar:
 * If its a percentage bar then we would need to translate multiple bars
 * Since we have 2 rectangles in a percentage bar, one which shows how much percentage
 * has been finished and the other is the total length of the task time taken, we would need
 * to process this separately based on the style.
 * The Completion Bar will need to be translated based on the percentage provided,
 * however the other bar will be subjected to normal translation.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Selection} path - d3 object of track
 * @returns {undefined} - returns nothing
 */
const translateTaskBar = (scale, path) =>
    path
        .attr("x", (val) => scale.x(val.startDate))
        .attr(
            "y",
            (val) => scale.y(val.y) + constants.DEFAULT_GANTT_TASK_PADDING.top
        )
        .attr("width", function(val) {
            if (val.percentage) {
                return d3.select(this).classed(styles.taskBarCompletion)
                    ? calculatePercentage(
                          scale.x(val.startDate),
                          scale.x(val.endDate),
                          val.percentage
                      )
                    : scale.x(val.endDate) - scale.x(val.startDate);
            } else {
                // Otherwise, its either a chunk or bar
                return (
                    scale.x(val.endDate) - scale.x(val.startDate) ||
                    constants.DEFAULT_GANTT_TASK_CHUNK_WIDTH
                );
            }
        });
/**
 * Translates task selection indicators when resized.
 * This is also called on initial creation, sets the positioning for
 * x, y, width and height attributes based on current task bar positioning.
 * If the current task is from Unit 3 to Unit 7 then we position the selection
 * indicator from 3 to 7 and add some padding to the indicator so that it provides
 * an illusion of enclosing the task
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Selection} path - d3 object of track
 * @returns {undefined} - returns nothing
 */
const translateTaskIndicator = (scale, path) => {
    const padding = Math.floor(
        constants.DEFAULT_GANTT_TASK_SELECTION_PADDING / 2
    );
    const positionAdjustment = Math.floor(
        constants.DEFAULT_GANTT_TASK_SELECTION_PADDING / 4
    );
    path.attr("x", (val) => scale.x(val.startDate) - positionAdjustment)
        .attr(
            "y",
            (val) =>
                scale.y(val.y) +
                constants.DEFAULT_GANTT_TASK_PADDING.top -
                positionAdjustment
        )
        .attr(
            "width",
            (val) =>
                (scale.x(val.endDate) - scale.x(val.startDate) ||
                    constants.DEFAULT_GANTT_TASK_CHUNK_WIDTH) + padding
        )
        .attr("height", constants.DEFAULT_GANTT_TASK_HEIGHT + padding);
};
/**
 * Translates tasks based on container width.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - config object derived from input JSON
 * @param {Selection} trackPath - d3 object of track
 * @returns {Selection} - d3 Track selection
 */
const translateTasks = (scale, config, trackPath) =>
    trackPath
        .selectAll(`g.${styles.task}`)
        .transition(constants.d3Transition)
        .selectAll("rect")
        .each(function() {
            const path = d3.select(this);
            path.classed(styles.taskBarSelection)
                ? translateTaskIndicator(scale, path)
                : translateTaskBar(scale, path);
        });

export {
    translateGraph,
    translateHGrid,
    translateVGrid,
    translateLabelText,
    transformPoint,
    translateActionPoints,
    translateTasks
};
