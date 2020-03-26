"use strict";

import * as d3 from "d3";
import { getXAxisXPosition } from "../../../helpers/axis";
import { getRect } from "../../../helpers/barType";
import constants, { COLORS } from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { validateActivity } from "../GanttConfig";
import { getXAxisYPosition, isHashed } from "./creationHelpers";
import {
    getActivityDuration,
    getActivityStyle,
    getEndDuration,
    getStartDuration,
    isAChunk
} from "./durationHelpers";

/**
 * Processes the input for a activity and converts to an object needed to render a bar
 * Duration is a function that is needed to compute Start or end. If both start and end
 * are present then the duration will be ignored.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} trackLabel -Track label
 * @param {object} dataTarget - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
const processActivities = (graphConfig, trackLabel, dataTarget) => {
    const _duration = dataTarget.duration
        ? getActivityDuration(dataTarget.duration)
        : 0;
    return {
        y: trackLabel.display,
        startDate: getStartDuration(
            _duration,
            dataTarget.startDate,
            dataTarget.endDate
        ),
        endDate: getEndDuration(
            _duration,
            dataTarget.startDate,
            dataTarget.endDate
        ),
        dependencies: dataTarget.dependencies,
        color: dataTarget.color || COLORS.BLUE,
        label: dataTarget.label || null,
        key: dataTarget.key,
        style: getActivityStyle(dataTarget),
        isHashed: isHashed(dataTarget.style),
        clickPassThrough: utils.isDefined(graphConfig.clickPassThrough)
            ? graphConfig.clickPassThrough.activities
            : false
    };
};

/**
 * Generates arguments for creating activity rectangles
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} data - Current activity data
 * @param {Selection} path - d3 activity bar selection element
 * @returns {object} List of arguments - target element, x, y, width, height.
 */
const generatorArgs = (scale, data, path) => ({
    path: d3.select(path),
    x: scale.x(data.startDate),
    y: scale.y(data.y) + constants.DEFAULT_GANTT_ACTIVITY_PADDING.top,
    width:
        scale.x(data.endDate) - scale.x(data.startDate) ||
        constants.DEFAULT_GANTT_TASK_CHUNK_WIDTH,
    height: constants.DEFAULT_GANTT_ACTIVITY_HEIGHT
});

/**
 * Based on startDate and endDate, we either render a chunk or a normal bar.
 * If the startDate and endDate is same, render a Chunk with 5px width
 * else render a normal bar with width based on start and end parameters provided.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} data - Current activity data
 * @param {Selection} path - d3 activity bar selection element
 * @returns {undefined} - returns nothing
 */
const renderActivityGroup = (scale, data, path) => {
    const _args = generatorArgs(scale, data, path);
    (isAChunk(data.startDate, data.endDate)
        ? getActivityChunk
        : getActivityBar)(
        _args.path,
        _args.x,
        _args.y,
        _args.width,
        _args.height,
        data.style
    ).attr("pointer-events", () => (data.clickPassThrough ? "none" : "auto"));
};

/**
 * Based on startDate and endDate, we render a hashed bar.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} scale - d3 scale for Graph
 * @param {object} data - Current activity data
 * @param {Selection} path - d3 activity bar selection element
 * @returns {undefined} - returns nothing
 */
const renderHashedActivityGroup = (canvasSVG, scale, data, path) => {
    const _args = generatorArgs(scale, data, path);
    getActivityHashedBar(
        canvasSVG,
        canvasSVG.select("defs"),
        _args.path,
        _args.x,
        _args.y,
        _args.width,
        _args.height,
        data.style
    ).attr("pointer-events", () => (data.clickPassThrough ? "none" : "auto"));
};

/**
 * Renders the activities for a track. Each activity is created based on start and end datetime.
 * Values needs to be in ISO8601 datetime format, along with the unique key for each activity.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} trackLabel - Track label
 * @param {object} activityGroupPath - Container for all the activities.
 * @param {Array} activities - Activities list
 * @returns {undefined} - returns nothing
 */
const drawActivities = (
    canvasSVG,
    scale,
    config,
    trackLabel,
    activityGroupPath,
    activities
) => {
    const activityPath = activityGroupPath
        .selectAll("g")
        .data(
            activities.map((a) =>
                processActivities(config, trackLabel, utils.deepClone(a))
            )
        );
    activityPath
        .enter()
        .append("g")
        .classed(styles.activity, true)
        .attr("aria-selected", false)
        .attr("aria-describedby", (d) => d.key)
        .each(function(d) {
            d.isHashed
                ? renderHashedActivityGroup(canvasSVG, scale, d, this)
                : renderActivityGroup(scale, d, this);
        });
    activityPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
};

/**
 * Creates an element container with data points from the input JSON property: tasks
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @param {object} trackLabel - Track label
 * @param {Array} activities - input JSON for creating activities
 * @returns {undefined} - returns nothing
 */
const loadActivities = (graphContext, trackPathSVG, trackLabel, activities) => {
    const activityGroupPath = trackPathSVG
        .append("g")
        .classed(styles.activityGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(
                graphContext.config
            )},${getXAxisYPosition(graphContext.config)})`
        );
    activities.forEach((a) => {
        validateActivity(a);
    });
    drawActivities(
        graphContext.svg,
        graphContext.scale,
        graphContext.config,
        trackLabel,
        activityGroupPath,
        activities
    );
};

/**
 * Creates a patterned bar with forward backslashes
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Selection} defs - d3 selection path for defs element in the graph
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {string} style - style you want to apply for the bar
 * @returns {Selection} d3 selection path
 */
const getActivityHashedBar = (
    canvasSVG,
    defs,
    path,
    x,
    y,
    width,
    height,
    style
) => {
    const patternId = "pattern-stripe-gantt-activity";
    if (utils.isEmpty(defs) || defs.empty()) {
        canvasSVG.append("defs");
    }
    if (canvasSVG.select(`#${patternId}`).empty()) {
        defs.append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(135)")
            .attr("width", constants.DEFAULT_GANTT_ACTIVITY_STRIPE_WIDTH)
            .attr("height", height)
            .attr("style", `fill: ${constants.DEFAULT_BAR_STRIPE_COLOR};`)
            .append("rect")
            .attr("width", constants.DEFAULT_GANTT_ACTIVITY_STRIPE_DISTANCE)
            .attr("height", height);
    }
    // Draw the background rect
    getRect(path, x, y, width, height)
        .classed(styles.activityBar, true)
        .attr("style", style);
    // Opacity for bar with hashes
    getRect(path, x, y, width, height)
        .classed(styles.activityBar, true)
        .attr("style", `fill: url(#${patternId}); fill-opacity: 0.7;`);
    return path;
};

/**
 * Creates a rect and appends it to the d3 selection element provided in the argument
 *
 * @private
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {string} style - inline styling for the bar
 * @returns {Selection} d3 selection path
 */
const getActivityBar = (path, x, y, width, height, style) => {
    getRect(path, x, y, width, height)
        .classed(styles.activityBar, true)
        .attr("style", style);
    return path;
};

/**
 * Creates a rect and appends it to the d3 selection element provided in the argument.
 * A chunk is a bar with fixed width. Uses: DEFAULT_GANTT_TASK_CHUNK_WIDTH
 *
 * @private
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {object} style - inline styling for the bar
 * @returns {Selection} d3 selection path
 */
const getActivityChunk = (path, x, y, width, height, style) => {
    getActivityBar(
        path,
        x,
        y,
        constants.DEFAULT_GANTT_TASK_CHUNK_WIDTH,
        height,
        style
    );
    return path;
};

/**
 * Selects the activity group from the track and removes them
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
const unloadActivities = (graphContext, trackPathSVG) =>
    trackPathSVG.select(`g.${styles.activityGroup}`).remove();

export { loadActivities, unloadActivities };
