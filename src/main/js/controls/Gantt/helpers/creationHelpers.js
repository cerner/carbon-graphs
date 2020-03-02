"use strict";
import * as d3 from "d3";
import {
    getAxisTickFormat,
    getXAxisHeight,
    getXAxisXPosition,
    getYAxisHeight,
    getYAxisXPosition,
    prepareHorizontalAxis,
    prepareXAxis,
    resetD3FontSize
} from "../../../helpers/axis";
import constants, { AXES_ORIENTATION } from "../../../helpers/constants";
import { createVGrid, prepareHAxis } from "../../../helpers/datetimeBuckets";
import errors from "../../../helpers/errors";
import { shouldTruncateLabel, truncateLabel } from "../../../helpers/label";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    attachEventHandlers,
    detachEventHandlers,
    getColorForTarget,
    getShapeForTarget,
    translateCanvas
} from "../../Graph/helpers/helpers";
import Track, { validateContent } from "../Track";
import {
    translateHorizontalGrid,
    translateVerticalGrid
} from "./translateHelpers";

/**
 * Calculates the height for Y and Y2 axes.
 * If dimensions are provided in the input, then they are given priority.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Height for the axes
 */
const determineHeight = (config) =>
    utils.isEmpty(config.axis.y.trackList)
        ? 0
        : parseInt(getYAxisRange(config.axis.y.trackList).pop(), 10);
/**
 * Updates the track count based on load or unload of content into gantt chart
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {boolean} [isLoad=false] True if load workflow, false if unload
 * @returns {number} current track count within the graph
 */
const updateTrackCount = (config, isLoad = false) =>
    isLoad ? config.axis.y.trackCount++ : config.axis.y.trackCount--;

/**
 * Updates the trackList object to include new track info, by converting trackListObject
 * to array, insert new trackObject and convert it back to object.
 *
 * @private
 * @param {object} content - track Content
 * @param {number} trackIndex - index at which track needs to be loaded
 * @param {object} trackListObject - Object which holds list of Tracks
 * @returns {object} Updated object which now holds the new track.
 */
const updateTrackList = (content, trackIndex, trackListObject) => {
    // convert trackListObject to an actual array (its an object)
    const trackList = Object.keys(trackListObject).map((key) => [
        key,
        trackListObject[key]
    ]);
    trackList.splice(trackIndex, 0, [
        content.key,
        {
            trackHeight: content.dimension
                ? content.dimension.trackHeight
                : constants.DEFAULT_GANTT_TRACK_HEIGHT,
            trackLabel: content.trackLabel.display
        }
    ]);
    // convert the list back to an object
    const trackListObj = {};
    trackList.forEach((track) => {
        trackListObj[track[0]] = track[1];
    });
    return trackListObj;
};

/**
 * Updates the track properties such as label, key and height lists.
 * Required props:
 *  * trackLabel
 *  * key
 *
 *  Optional:
 *  * Height - by default: constants.DEFAULT_GANTT_TRACK_HEIGHT
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {object} content - input JSON provided by consumer
 * @param {boolean} [isLoad=false] True if load workflow, false if unload
 * @returns {undefined} - returns nothing
 */
const updateTrackProps = (config, content, isLoad = false) => {
    updateTrackCount(config, isLoad);
    if (!isLoad) {
        delete config.axis.y.trackList[content.key];
    }
};
/**
 * Determines the domain for x and y axes.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {object} config - config object derived from input JSON
 */
const updateAxesDomain = (config) => {
    config.axis.y.domain = {
        lowerLimit: 0,
        upperLimit: config.axis.y.trackCount || 1
    };
    return config;
};
/**
 * Checks if the track label needs to be truncated and returns the truncated value
 *
 * @private
 * @param {string} label - Track label display property
 * @returns {string} if more than constants.DEFAULT_LABEL_CHARACTER_LIMIT then truncates,
 * normal label otherwise
 */
const formatTrackLabel = (label) =>
    shouldTruncateLabel(label) ? truncateLabel(label) : label;
/**
 * Creates the axis using the scale provided for Y Axis using d3 svg axis
 *
 * @private
 * @param {object} scale - d3 scale calculated using domain and range
 * @param {number} height - Height of the Y Axis to calculate the number of Y Axis ticks
 * @returns {object} d3 object which forms the y-axis scale
 */
const prepareYAxis = (scale, height) =>
    d3
        .axisLeft(scale)
        .ticks(height / constants.DEFAULT_Y_AXIS_SPACING)
        .tickFormat(formatTrackLabel)
        .tickPadding(8);
/**
 * Calculates axes sizes, specifically:
 *  X Axis: Height
 *  Y Axis: Width
 *  Padding is provided enough to accommodate around 15 characters.
 *  Beyond which we would need to apply truncation (ellipsis)
 *
 *  @private
 *  @param {object} config - config object derived from input JSON
 *  @returns {undefined} - returns nothing
 */
const calculateAxesSize = (config) => {
    config.axisSizes = {};
    config.axisSizes.x = getXAxisHeight(config);
    config.axisSizes.y = getYAxisWidth(config);
};
/**
 *  Calculates the label size needed for each axes.
 *  Y Axis: Width
 *
 *  @private
 *  @param {object} config - config object derived from input JSON
 *  @returns {undefined} - returns nothing
 */
const calculateAxesLabelSize = (config) => {
    config.axisLabelWidths = {};
    config.axisLabelWidths.y = config.padding.left;
};
/**
 * Dynamically generate the label width for y axes
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} label width
 */
const getYAxisWidth = (config) => {
    if (config.padding.hasCustomPadding) {
        return config.padding.left;
    }
    const scale = d3
        .scaleOrdinal()
        .domain(getYAxisDomain(config.axis.y.trackList))
        .range([0, ...getYAxisRange(config.axis.y.trackList)]);
    const axis = d3.axisLeft(scale);
    const dummy = d3.select("body").append("div");
    const svg = dummy.append("svg");
    const yAxisSVG = svg.append("g").call(axis);
    const width = yAxisSVG.node().getBoundingClientRect().width;
    dummy.remove();
    return width;
};
/**
 * X Axis's width that will hold equally spaced ticks
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} X Axis width
 */
const getXAxisWidth = (config) =>
    config.canvasWidth -
    config.axisSizes.y -
    config.axisLabelWidths.y -
    getXAxisYPosition(config);
/**
 * X Axis's position vertically relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getXAxisYPosition = (config) =>
    (config.padding.top + config.padding.bottom) * 2;
/**
 * Y Axis's position vertically relative to the canvas
 *
 * @private
 * @param {object} config - derived config from input json.
 * @returns {number} Position for the axis
 */
const getYAxisYPosition = (config) => getXAxisYPosition(config);
/**
 * Prepares X,Y and Y2 Axes according to their scale and available container width and height
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {object} - Scaled axes object
 */
const getAxesScale = (axis, scale, config) => {
    axis.x = prepareXAxis(
        scale.x,
        config.axis.x.ticks.values,
        getXAxisWidth(config),
        getAxisTickFormat(
            config.d3Locale,
            config.axis.x.ticks.format,
            config.axis.x.type
        ),
        AXES_ORIENTATION.X.TOP
    );
    axis.y = prepareYAxis(scale.y, getYAxisHeight(config));
    return axis;
};
/**
 * Returns an array containing the current domain for Y Axis.
 * If there are no labels or the graph has no content then the domain is empty array,
 * but if the data is provided then the domain will be 'null' as the first item
 * followed by the content labels. We add the null to ensure that the first track does not
 * coincide with the X Axis.
 *
 * @private
 * @param {object} trackList - Y Axis trackList config object
 * @returns {Array} array containing the current domain for Y Axis
 */
const getYAxisDomain = (trackList) =>
    utils.isEmpty(trackList)
        ? []
        : Object.keys(trackList).map((k) => trackList[k].trackLabel);
/**
 * Computes the Y Axis range by adding the track heights provided by consumer for each track
 * If the track height for 3 tracks are [80, null, 50]
 * then they will be [80, 80+<DEFAULT_TRACK_HEIGHT>, 80+<DEFAULT_TRACK_HEIGHT>+50]
 *
 * @private
 * @param {object} trackList - Y Axis trackList config object
 * @returns {Array} array containing the current range for Y Axis
 */
const getYAxisRange = (trackList) =>
    Object.keys(trackList)
        .map((o) => trackList[o].trackHeight)
        .map((h, index, arr) =>
            index > 0 ? h + arr.slice(0, index).reduce((a, b) => a + b, 0) : h
        );
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
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const scaleGraph = (scale, config) => {
    scale.x = d3
        .scaleTime()
        .domain(config.axis.x.domain)
        .range([0, getXAxisWidth(config)])
        .clamp(config.settingsDictionary.shouldClamp);
    scale.y = d3
        .scaleOrdinal()
        .domain(getYAxisDomain(config.axis.y.trackList))
        .range([0, ...getYAxisRange(config.axis.y.trackList)]);
    if (config.axis.x.rangeRounding) {
        scale.x.nice();
    }
};
/**
 * Added defs element for the canvas. This currently holds the clip paths for the entire chart.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} return nothing
 */
const createDefs = (config, canvasSVG) => {
    const defsElement = canvasSVG.append("defs");

    defsElement
        .append("clipPath")
        .attr("id", config.clipPathId)
        .append("rect")
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(constants.Y_AXIS, getYAxisYPosition(config))
        .attr("width", getXAxisWidth(config))
        .attr("height", getYAxisHeight(config));

    if (
        config.settingsDictionary.shouldCreateDatelineDefs &&
        config.dateline.length > 0
    ) {
        defsElement
            .append("clipPath")
            .attr("id", config.datelineClipPathId)
            .append("rect")
            .attr(constants.X_AXIS, getXAxisXPosition(config))
            .attr(constants.Y_AXIS, getYAxisYPosition(config))
            .attr("width", getXAxisWidth(config))
            .attr("height", 0);
    }
};
/**
 * Create the d3 grid - horizontal and vertical and append into the canvas.
 * Only performed if the flags for showHGrid and showVGrid are enabled
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const createGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    const gridSVG = canvasSVG
        .append("g")
        .classed(styles.grid, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition(
                config
            )})`
        );
    gridSVG
        .append("g")
        .classed(styles.gridH, true)
        .call(translateHorizontalGrid(axis, config));
    createVGrid(gridSVG, axis, config, createVGridHandler);
};

/**
 * Function to create the vertical-grid with a specific style and config.
 *
 * @private
 * @param {object} gridSVG - d3 object of the grid
 * @param {object} axis - Axis scaled according to input parameters
 * @param {string} style - Style with which, grid needs to be created.
 * @param {object} config - config required for translating vertical grid.
 * @returns {undefined} - Doesn't return anything.
 */
const createVGridHandler = (gridSVG, axis, style, config) => {
    gridSVG
        .append("g")
        .classed(style, true)
        .call(translateVerticalGrid(axis, config));
};
/**
 * Create the d3 Axes - X, Y and Y2 and append into the canvas.
 * If axis.x.show, axis.y.show or axis.y2.show is set to false:
 * then the axis will be hidden
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const createAxes = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    prepareHAxis(
        scale,
        axis,
        config,
        prepareHorizontalAxis,
        AXES_ORIENTATION.X.TOP
    );
    canvasSVG
        .append("g")
        .classed(styles.axis, true)
        .classed(styles.axisX, true)
        .attr("aria-hidden", !config.axis.x.show)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)}, ${getXAxisYPosition(
                config
            )})`
        )
        .call(axis.x)
        .call(resetD3FontSize);
    canvasSVG
        .append("g")
        .classed(styles.axis, true)
        .classed(styles.axisY, true)
        .classed(styles.axisYTrackLabel, true)
        .attr("aria-hidden", !config.axis.y.show)
        .attr(
            "transform",
            `translate(${getYAxisXPosition(config)},${getXAxisYPosition(
                config
            )})`
        )
        .call(axis.y)
        .call(resetD3FontSize);
};

/**
 * Creates a container for graph content (evident when there are no boundary ticks)
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const createContentContainer = (config, canvasSVG) =>
    canvasSVG
        .append("rect")
        .classed(styles.contentContainer, true)
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(constants.Y_AXIS, getXAxisYPosition(config))
        .attr("width", getXAxisWidth(config))
        .attr("height", getYAxisHeight(config));

/**
 * Creates a container for gantt chart track content
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const createTrackSelectionContainer = (config, canvasSVG) =>
    canvasSVG.append("g").classed(styles.ganttTrackSelectorGroup, true);
/**
 * Creates a container for gantt chart content
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const createGanttContent = (config, canvasSVG) =>
    canvasSVG
        .append("g")
        .classed(styles.ganttChartContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`);
/**
 * Prepares the appropriate index value for inserting the track, and scaling the graph, if the trackContent has an index.
 * If no index is provided, we return the size of the trackList to insert at the end.
 * If the index is too large than the current track length, we insert it at end. If not, we insert at the index provided.
 * If the loading index is below 0, we throw an error.
 *
 * @private
 * @param {object} scale - d3 scale
 * @param {object} config - config object derived from input JSON
 * @param {object} content - track content which needs to be loaded
 * @param {number} length - length of all tracks
 * @throws module:errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX
 * @returns {number} - index where we would insert the new track content
 */
const prepareLoadAtIndex = (scale, config, content, length) => {
    validateContent(content);
    if (utils.notEmpty(content) && utils.notEmpty(content.loadAtIndex)) {
        if (content.loadAtIndex < 0) {
            throw new Error(errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX);
        }
        const index = content.loadAtIndex;
        config.axis.y.trackList = updateTrackList(
            content,
            index,
            config.axis.y.trackList
        );
        scaleGraph(scale, config);
        return index;
    }
    config.axis.y.trackList = updateTrackList(
        content,
        length,
        config.axis.y.trackList
    );
    return length;
};
/**
 * Creates a new Track instance
 *
 * @private
 * @param {object} content - input JSON for creating a track
 * @returns {Track} track instance
 */
const createTrack = (content) => new Track(content);
/**
 * Creates a container for track contents
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} trackConfig - track's config object
 * @returns {Selection} d3 svg path
 */
const createTrackContainer = (config, canvasSVG, trackConfig) =>
    canvasSVG
        .select(`.${styles.ganttChartContent}`)
        .append("g")
        .classed(styles.trackGroup, true)
        .attr("aria-labelledby", trackConfig.trackLabel.display)
        .attr("aria-describedby", trackConfig.key);
/**
 * Removes the container for track contents
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - Unique identifier of the track.
 * @returns {Selection} - d3 svg path
 */
const removeTrackContainer = (canvasSVG, key) =>
    canvasSVG.select(`g[aria-describedby="${key}"]`).remove();

/**
 * Checks if hashing style is available.
 *
 * @private
 * @param {object} style - all stlyings which can be applied.
 * @returns {boolean} - indicating if hashed styling can be applied.
 */
const isHashed = (style) => !(utils.isEmpty(style) || !style.isHashed);

/**
 * Removes the element with provided selector using d3
 *
 * @private
 * @param {Selection|object} el - d3 selection element
 * @param {string} selector - attribute to query the element, typically a class or id
 * @param {boolean} [isBatchSelect] - enables `selectAll` rather than default `select`
 * @returns {undefined} - returns nothing
 */
const d3RemoveElement = (el, selector, isBatchSelect = false) => {
    if (!el) {
        return;
    }
    if (isBatchSelect) {
        el.selectAll(selector).remove();
    } else {
        el.select(selector).remove();
    }
};

export {
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition,
    getYAxisYPosition,
    getAxesScale,
    createTrack,
    calculateAxesSize,
    calculateAxesLabelSize,
    translateCanvas,
    createAxes,
    createDefs,
    createGrid,
    createContentContainer,
    createTrackSelectionContainer,
    createGanttContent,
    createTrackContainer,
    removeTrackContainer,
    scaleGraph,
    determineHeight,
    getShapeForTarget,
    getColorForTarget,
    attachEventHandlers,
    detachEventHandlers,
    updateAxesDomain,
    updateTrackProps,
    prepareLoadAtIndex,
    isHashed,
    d3RemoveElement
};
