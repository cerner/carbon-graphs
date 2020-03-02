"use strict";
import * as d3 from "d3";
import {
    getYAxisHeight,
    getYAxisXPosition,
    prepareHorizontalAxis,
    processTickValues
} from "../../../helpers/axis";
import constants, { AXES_ORIENTATION } from "../../../helpers/constants";
import {
    getDatelineIndicatorHeight,
    translateDateline
} from "../../../helpers/dateline";
import { prepareHAxis, translateVGrid } from "../../../helpers/datetimeBuckets";
import { translateEventline } from "../../../helpers/eventline";
import styles from "../../../helpers/styles";
import { getTransformScale } from "../../../helpers/transformUtils";
import utils from "../../../helpers/utils";
import { translateCanvas } from "../../Graph/helpers/helpers";
import {
    getAxesScale,
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition,
    getYAxisYPosition
} from "./creationHelpers";
import { calculatePercentage } from "./durationHelpers";
import { generatorArgs } from "./trackHelpers";

const TRACK_LABEL_TEXT_CLASS = `.${styles.axisYTrackLabel} .tick text`;
/**
 * Returns the track label position in D3 scale's domain
 *
 * @private
 * @param {object} scale - d3 scale for Graph
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
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {string} yVal - Current track label
 * @param {number} index - label index in domain
 * @returns {boolean} true if y co-ordinate transform translate is not needed, false otherwise
 */
const isTrackLabelOutsideDomain = (scale, config, yVal, index) =>
    index < 0 ||
    utils.isEmpty(config.axis.y.trackList) ||
    scale.y.domain().length > Object.keys(config.axis.y.trackList).length;
/**
 * Returns the Y co-ordinate translate value for Y axis transform based on its domain. Since the
 * Y Axis for gantt is a text and not conventional number system. We need to
 * Calculate the pixel region for that label and get the current d3 range value.
 *
 * @private
 * @description Use this to move the contents to the center of the track
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {string} yVal - Current track label
 * @returns {number} y co-ordinate transform translate
 */
const getTransformYCoordinate = (scale, config, yVal) => {
    const index = getLabelIndexFromDomain(scale, yVal);
    if (!scale || isTrackLabelOutsideDomain(scale, config, yVal, index)) {
        return 0;
    }
    const getCurrentTrackHeightList = (trackList) =>
        Object.keys(trackList).map((o) => trackList[o].trackHeight);
    const currentHeight = getCurrentTrackHeightList(config.axis.y.trackList);
    return currentHeight[index] / 2;
};
/**
 * Returns the X co-ordinate translate value for Y axis transform based on its scale
 *
 * @private
 * @param {object} [scale] - d3 scale for Graph
 * @param {string} [xVal] - current x Axis date value
 * @returns {number} x co-ordinate transform translate
 */
const getTransformXCoordinate = (scale, xVal) => (!scale ? 0 : scale.x(xVal));
/**
 * Uses the scale to move track content to the correct track position and center it relative to the track
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {string} yVal - Current track label
 * @returns {number} y co-ordinate transform translate
 */
const getTransformYCoordinateWithScale = (scale, config, yVal) => {
    const offset = !scale ? 0 : scale.y(yVal);
    const yPosBasedOnHeight = getTransformYCoordinate(scale, config, yVal);
    return offset + yPosBasedOnHeight;
};
/**
 * Returns the Transform string for a given d3 domain. This can be used to translate the
 * graph/track elements
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
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
 *
 * @description
 * Calling getDatelineIndicatorHeight() will trigger a page reflow and resizing the page might cause Layout Thrashing.
 * We understand this and deem it necessary to calculate the indicator height when a new dataset/set of contents are loaded during Panning.
 * Furthermore, this function is called only when panning is enabled and there is a dateline defs element is present.
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateDefs = (config, canvasSVG) => {
    canvasSVG
        .select(`clipPath#${config.clipPathId}`)
        .selectAll("rect")
        .attr("height", getYAxisHeight(config))
        .attr("width", getXAxisWidth(config));
    if (
        config.settingsDictionary.shouldCreateDatelineDefs &&
        config.dateline.length > 0
    ) {
        const datelineIndicatorHeight = Math.floor(
            getDatelineIndicatorHeight() / 2
        );
        canvasSVG
            .select(`clipPath#${config.datelineClipPathId}`)
            .selectAll("rect")
            .attr("height", config.height + datelineIndicatorHeight)
            .attr("width", getXAxisWidth(config))
            .attr(
                constants.Y_AXIS,
                getYAxisYPosition(config) - datelineIndicatorHeight
            );
    }
};
/**
 * Updates the x, y and y2 (if enabled) positions on resize
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
    prepareHAxis(
        scale,
        axis,
        config,
        prepareHorizontalAxis,
        AXES_ORIENTATION.X.TOP
    );
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
    canvasSVG
        .select(`.${styles.axisY}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getYAxisXPosition(config)}, ${getYAxisYPosition(
                config
            )})`
        )
        .call(axis.y);
};

/**
 * Translates the vertical grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the X Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 svg path
 */
const translateVerticalGrid = (axis, config) => {
    let xAxisGrid;
    if (utils.notEmpty(config.axis.x.ticks.values)) {
        const ticks = config.axis.x.ticks.values;
        xAxisGrid = axis.x
            .tickValues(processTickValues(ticks))
            .tickSize(getYAxisHeight(config) * -1, 0, 0)
            .tickFormat("");
    } else {
        xAxisGrid = axis.x
            .tickSize(getYAxisHeight(config) * -1, 0, 0)
            .tickFormat("");
    }
    return xAxisGrid;
};
/**
 * Translates the horizontal grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the Y Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 svg path
 */
const translateHorizontalGrid = (axis, config) =>
    axis.y.tickSize(getXAxisWidth(config) * -1, 0, 0).tickFormat("");
/**
 * Updates the horizontal and vertical grid sizes/positions on resize
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .select(`.${styles.grid}`)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition(
                config
            )})`
        );
    canvasSVG
        .select(`.${styles.gridH}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .call(translateHorizontalGrid(axis, config));
    translateVGrid(canvasSVG, axis, config, translateVGridHandler);
};

/**
 * Function to create the vertical-grid with a specific style and config.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} axis - Axis scaled according to input parameters
 * @param {string} style - Style with which, grid needs to be created.
 * @param {object} config - config required for translating vertical grid.
 * @returns {undefined} - Doesn't return anything.
 */
const translateVGridHandler = (canvasSVG, axis, style, config) => {
    canvasSVG
        .select(`.${style}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .call(translateVerticalGrid(axis, config));
};
/**
 * Translates the rectangle which forms the container for graph content
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const translateContentContainer = (config, canvasSVG) =>
    canvasSVG
        .select(`.${styles.contentContainer}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("width", getXAxisWidth(config))
        .attr("height", getYAxisHeight(config));
/**
 * Translates label to center of each track. Normally a tick text is aligned to the grid/tick,
 * but we want to move it to the center position to better associate it to the track.
 * We take the domain and range, calculate the index of the current text data in the domain and then use
 * the range value to get the pixel position of the tick.
 * With the current position and previous tick position, we can find out the middle area for
 * repositioning the text.
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateLabelText = (scale, config, canvasSVG) =>
    canvasSVG
        .selectAll(TRACK_LABEL_TEXT_CLASS)
        .attr("transform", getTrackLabelTransformProperty(scale, config));
/**
 * Transforms the point in the gantt graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @returns {Function} - translate string for d3 transform function
 */
const transformPoint = (scale, config) => (value) => (scaleFactor) =>
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
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {Array} trackPath - d3 object of track element
 * @param {string} style - CSS style representing the data points
 * @returns {object} d3 select object
 */
const translatePoints = (scale, config, trackPath, style) =>
    trackPath.selectAll(style).each(function(d) {
        const pointSVG = d3.select(this);
        pointSVG
            .select("g")
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
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
 *  The axes x and y co-ordinates
 *  The grid x and y co-ordinates
 *  The labels x and y co-ordinates
 *
 *  @private
 *  @param {object} control - Graph instance
 *  @returns {undefined} - returns nothing
 */
const translateGraph = (control) => {
    translateCanvas(control.config, control.svg);
    translateDefs(control.config, control.svg);
    translateAxes(control.axis, control.scale, control.config, control.svg);
    translateGrid(control.axis, control.scale, control.config, control.svg);
    translateContentContainer(control.config, control.svg);
    translateDateline(
        control.scale,
        control.config,
        control.svg,
        getYAxisYPosition
    );
    translateEventline(
        control.scale,
        control.config,
        control.svg,
        getYAxisYPosition
    );
};
/**
 * Called on resize, translates the data point values.
 * This includes:
 *  Points
 *  Selected point indicators
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {Array} trackPath - d3 object of track
 * @returns {undefined} - returns nothing
 */
const translateDataPoints = (scale, config, trackPath) => {
    translatePoints(scale, config, trackPath, `.${styles.point}`);
    translatePoints(scale, config, trackPath, `.${styles.dataPointSelection}`);
};
/**
 * Translates task bars when resized.
 *
 * @description When translating the width of a bar:
 * If its a percentage bar then we would need to translate multiple bars
 * Since we have 2 rectangles in a percentage bar, one which shows how much percentage
 * has been finished and the other is the total length of the task time taken, we would need
 * to process this separately based on the style.
 * The Completion Bar will need to be translated based on the percentage provided,
 * however the other bar will be subjected to normal translation.
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {Selection} path - d3 object of track
 * @param {object} config - graph config needed for panning feature
 * @returns {undefined} - returns nothing
 */
const translateTaskBar = (scale, path, config) =>
    path
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
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
 * Translates activity bars when resized.
 *
 * @description When translating the width of a bar:
 * Bar will be subjected to normal translation.
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {Selection} path - d3 object of track
 * @param {object} config - graph config needed for panning feature
 * @returns {undefined} - returns nothing
 */
const translateActivityBar = (scale, path, config) =>
    path
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("x", (val) => scale.x(val.startDate))
        .attr(
            "y",
            (val) =>
                scale.y(val.y) + constants.DEFAULT_GANTT_ACTIVITY_PADDING.top
        )
        .attr(
            "width",
            (val) =>
                scale.x(val.endDate) - scale.x(val.startDate) ||
                constants.DEFAULT_GANTT_ACTIVITY_CHUNK_WIDTH
        );
/**
 * Translates task selection indicators when resized.
 * This is also called on initial creation, sets the positioning for
 * x, y, width and height attributes based on current task bar positioning.
 * If the current task is from Unit 3 to Unit 7 then we position the selection
 * indicator from 3 to 7 and add some padding to the indicator so that it provides
 * an illusion of enclosing the task
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {Selection} path - d3 object of track
 * @param {object} config - graph config needed for panning feature
 * @returns {undefined} - returns nothing
 */
const translateTaskIndicator = (scale, path, config) => {
    const padding = Math.floor(
        constants.DEFAULT_GANTT_TASK_SELECTION_PADDING / 2
    );
    const positionAdjustment = Math.floor(
        constants.DEFAULT_GANTT_TASK_SELECTION_PADDING / 4
    );
    path.transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("x", (val) => scale.x(val.startDate) - positionAdjustment)
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
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {Selection} trackPath - d3 object of track
 * @returns {Selection} - d3 Track selection
 */
const translateTasks = (scale, config, trackPath) =>
    trackPath
        .selectAll(`g.${styles.task}`)
        .selectAll("rect")
        .each(function() {
            const path = d3.select(this);
            path.classed(styles.taskBarSelection)
                ? translateTaskIndicator(scale, path, config)
                : translateTaskBar(scale, path, config);
        });
/**
 * Translates track selector based on container width.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - base config derived from input JSON.
 * @param {object} trackPathSVG - Track container element
 * @param {object} trackConfig - config derived from input track JSON.
 * @returns {undefined} - returns nothing.
 */
const translateTrackSelector = (scale, config, trackPathSVG, trackConfig) => {
    const ganttTrackSelectorGroupPath = trackPathSVG.select(
        `.${styles.ganttTrackSelectorGroup}`
    );
    ganttTrackSelectorGroupPath.select("rect").each(function() {
        const path = d3.select(this);
        const _args = generatorArgs(config, scale, path, trackConfig);
        path.transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr("y", _args.y)
            .attr("width", _args.width)
            .attr("height", _args.height);
    });
};
/**
 * Translates activities based on container width.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {Selection} trackPath - d3 object of track
 * @returns {Selection} - d3 Track selection
 */
const translateActivities = (scale, config, trackPath) =>
    trackPath
        .selectAll(`g.${styles.activity}`)
        .selectAll(`rect.${styles.activityBar}`)
        .each(function() {
            translateActivityBar(scale, d3.select(this), config);
        });
export {
    translateGraph,
    translateHorizontalGrid,
    translateVerticalGrid,
    translateLabelText,
    transformPoint,
    translateDataPoints,
    translateTasks,
    translateActivities,
    translateTrackSelector
};
