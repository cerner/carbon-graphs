"use strict";

import d3 from "d3";
import { getXAxisXPosition } from "../../../helpers/axis";
import constants, { COLORS } from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { validateTask } from "../GanttConfig";
import { getBar, getChunk, getPercentageBar } from "./barTypeHelpers";
import { getTrackLabel, getXAxisYPosition } from "./creationHelpers";
import {
    calculatePercentage,
    getDuration,
    getEndDuration,
    getStartDuration,
    getTaskStyle,
    isAChunk
} from "./durationHelpers";

/**
 * Toggles the selection of a task, executes on click of a data point.
 * @private
 * @param {Object} target - DOM element of the task clicked
 * @returns {Array} d3 html element of the task
 */
const toggleTaskSelection = (target) => {
    const selectTaskNode = d3.select(target);
    selectTaskNode.attr(
        "aria-selected",
        !(selectTaskNode.attr("aria-selected") === "true")
    );
    return selectTaskNode;
};
/**
 * Handler for a task click action. If the content property is present for the task
 * then the callback is executed other wise it is NOP.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 * @private
 * @param {Object} value - data point object
 * @param {number} index - data point index for the set
 * @param {Object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const taskClickActionHandler = (value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleTaskSelection(target).call((selectedTarget) =>
        value.onClick(
            () => selectedTarget.attr("aria-selected", false),
            value.key,
            index,
            value,
            selectedTarget
        )
    );
};
/**
 * Processes the input for a task and converts to an object needed to render a bar
 * Duration is a function that is needed to compute Start or end. If both start and end
 * are present then the duration will be ignored.
 * @private
 * @param {Object} graphConfig - config object of Graph API
 * @param {Object} trackLabel -Track label
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const processTask = (graphConfig, trackLabel, dataTarget) => {
    const _duration = dataTarget.duration
        ? getDuration(dataTarget.duration)
        : 0;
    return {
        onClick: dataTarget.onClick,
        y: getTrackLabel(trackLabel.display),
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
        percentage: dataTarget.percentage,
        dependencies: dataTarget.dependencies,
        color: dataTarget.color || COLORS.BLUE,
        label: dataTarget.label || null,
        key: dataTarget.key,
        style: getTaskStyle(dataTarget)
    };
};
/**
 * Renders the tasks for a track. Each task is created based on start and end datetime.
 * Values needs to be in ISO8601 datetime format, along with the unique key for each task.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Object} trackLabel - Track label
 * @param {Object} taskGroupPath - Container for all the tasks
 * @param {Array} tasks - Tasks list
 * @returns {undefined} - returns nothing
 */
const drawTasks = (scale, config, trackLabel, taskGroupPath, tasks) => {
    const taskPath = taskGroupPath
        .selectAll("g")
        .data(
            tasks.map((a) =>
                processTask(config, trackLabel, utils.deepClone(a))
            )
        );
    taskPath
        .enter()
        .append("g")
        .classed(styles.task, true)
        .attr("aria-selected", false)
        .attr("aria-describedby", (d) => d.key)
        .each(function(d) {
            if (d.percentage) {
                return getPercentageBar(
                    d3.select(this),
                    scale.x(d.startDate),
                    scale.y(d.y) + constants.DEFAULT_GANTT_TASK_PADDING.top,
                    scale.x(d.endDate) - scale.x(d.startDate),
                    constants.DEFAULT_GANTT_TASK_HEIGHT,
                    calculatePercentage(
                        scale.x(d.startDate),
                        scale.x(d.endDate),
                        d.percentage
                    ),
                    d.color
                ).on("click", function(value, index) {
                    taskClickActionHandler(d, index, this);
                });
            }
            // Based on startDate and endDate, we either render a chunk or a normal bar.
            // If the startDate and endDate is same, render a Chunk with 5px width
            // else render a normal bar with width based on start and end parameters provided
            return (isAChunk(d.startDate, d.endDate) ? getChunk : getBar)(
                d3.select(this),
                scale.x(d.startDate),
                scale.y(d.y) + constants.DEFAULT_GANTT_TASK_PADDING.top,
                scale.x(d.endDate) - scale.x(d.startDate),
                constants.DEFAULT_GANTT_TASK_HEIGHT,
                d.style
            ).on("click", function(value, index) {
                taskClickActionHandler(d, index, this);
            });
        });
    taskPath
        .exit()
        .transition(constants.d3Transition)
        .remove();
};

/**
 * Creates an element container with data points from the input JSON property: tasks
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPathSVG - Track container element
 * @param {Object} trackLabel - Track label
 * @param {Array} tasks - input JSON for creating tasks
 * @returns {undefined} - returns nothing
 */
const loadTasks = (graphContext, trackPathSVG, trackLabel, tasks) => {
    const taskGroupPath = trackPathSVG
        .append("g")
        .classed(styles.taskGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(
                graphContext.config
            )},${getXAxisYPosition()})`
        );
    tasks.forEach((a) => {
        validateTask(a);
    });
    drawTasks(
        graphContext.scale,
        graphContext.config,
        trackLabel,
        taskGroupPath,
        tasks
    );
};
/**
 * Selects the task group from the track and removes them
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
const unloadTasks = (graphContext, trackPathSVG) =>
    trackPathSVG.select(`g.${styles.taskGroup}`).remove();

export { loadTasks, unloadTasks };
