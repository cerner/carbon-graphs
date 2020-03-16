"use strict";

import * as d3 from "d3";
import { getXAxisXPosition } from "../../../helpers/axis";
import {
    getBar,
    getChunk,
    getHashedBar,
    getPercentageBar,
    getRect
} from "../../../helpers/barType";
import constants, { COLORS } from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { validateTask } from "../GanttConfig";
import { getXAxisYPosition, isHashed } from "./creationHelpers";
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
 *
 * @private
 * @param {object} target - DOM element of the task clicked
 * @returns {Array} d3 html element of the task
 */
const toggleTaskSelection = (target) => {
    const taskNode = d3.select(target);
    const selectionTaskNode = taskNode.select(`.${styles.taskBarSelection}`);
    taskNode.attr(
        "aria-selected",
        !(taskNode.attr("aria-selected") === "true")
    );
    selectionTaskNode.attr(
        "aria-hidden",
        !(selectionTaskNode.attr("aria-hidden") === "true")
    );
    return taskNode;
};
/**
 * Handler for a task click action. If the content property is present for the task
 * then the callback is executed other wise it is NOP.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 *
 * @private
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const taskClickActionHandler = (value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleTaskSelection(target).call((d3TargetNode) =>
        value.onClick(
            () => {
                const d3SelectionNode = d3TargetNode.select(
                    `.${styles.taskBarSelection}`
                );
                d3SelectionNode.attr(
                    "aria-hidden",
                    !(d3SelectionNode.attr("aria-hidden") === "true")
                );
                d3TargetNode.attr("aria-selected", false);
            },
            value.key,
            index,
            value,
            d3TargetNode
        )
    );
};

/**
 * Processes the input for a task and converts to an object needed to render a bar
 * Duration is a function that is needed to compute Start or end. If both start and end
 * are present then the duration will be ignored.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} trackLabel -Track label
 * @param {object} dataTarget - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
const processTask = (graphConfig, trackLabel, dataTarget) => {
    const _duration = dataTarget.duration
        ? getDuration(dataTarget.duration)
        : 0;
    return {
        onClick: dataTarget.onClick,
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
        percentage: dataTarget.percentage,
        dependencies: dataTarget.dependencies,
        color: dataTarget.color || COLORS.BLUE,
        label: dataTarget.label || null,
        key: dataTarget.key,
        style: getTaskStyle(dataTarget),
        isHashed: isHashed(dataTarget.style),
        clickPassThrough: utils.isDefined(graphConfig.clickPassThrough)
            ? graphConfig.clickPassThrough.tasks
            : false
    };
};
/**
 * Generates arguments for creating task rectangles
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} taskData - Current task data
 * @param {Selection} taskPath - d3 task bar selection element
 * @returns {object} List of arguments - target element, x, y, width, height
 */
const generatorArgs = (scale, taskData, taskPath) => ({
    path: d3.select(taskPath),
    x: scale.x(taskData.startDate),
    y: scale.y(taskData.y) + constants.DEFAULT_GANTT_TASK_PADDING.top,
    width:
        scale.x(taskData.endDate) - scale.x(taskData.startDate) ||
        constants.DEFAULT_GANTT_TASK_CHUNK_WIDTH,
    height: constants.DEFAULT_GANTT_TASK_HEIGHT
});
/**
 * Renders the selection indicator for a task bar. Its hidden by default, displays when
 * a task is clicked
 *
 * @private
 * @param {object} indicatorArgs - arguments needed for generating rect for selection indicator
 * @returns {undefined} - returns nothing
 */
const renderSelectionIndicator = (indicatorArgs) => {
    getRect(
        indicatorArgs.path,
        indicatorArgs.x,
        indicatorArgs.y,
        indicatorArgs.width,
        indicatorArgs.height
    )
        .classed(styles.taskBarSelection, true)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("aria-hidden", true);
};
/**
 * Renders the percentage bar group for the task. This consists of
 * * Percentage bar
 * * Selection indicator for the percentage Bar
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} taskData - Current task data
 * @param {number} index - Current task data index
 * @param {Selection} taskPath - d3 task bar selection element
 * @returns {undefined} - returns nothing
 */
const renderPercentageBarGroup = (scale, taskData, index, taskPath) => {
    const _args = generatorArgs(scale, taskData, taskPath);
    // Create Selection indicator for Percentage Task
    renderSelectionIndicator(_args);
    // Create Percentage Task
    getPercentageBar(
        _args.path,
        _args.x,
        _args.y,
        _args.width,
        _args.height,
        calculatePercentage(
            scale.x(taskData.startDate),
            scale.x(taskData.endDate),
            taskData.percentage
        ),
        taskData.color
    )
        .attr("aria-disabled", !utils.isFunction(taskData.onClick))
        .attr("pointer-events", () =>
            taskData.clickPassThrough && !utils.isFunction(taskData.onClick)
                ? "none"
                : "auto"
        )
        .on("click", () => taskClickActionHandler(taskData, index, taskPath));
};
/**
 * Based on startDate and endDate, we either render a chunk or a normal bar.
 * If the startDate and endDate is same, render a Chunk with 5px width
 * else render a normal bar with width based on start and end parameters provided.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} taskData - Current task data
 * @param {number} index - Current task data index
 * @param {Selection} taskPath - d3 task bar selection element
 * @returns {undefined} - returns nothing
 */
const renderTaskGroup = (scale, taskData, index, taskPath) => {
    const _args = generatorArgs(scale, taskData, taskPath);
    renderSelectionIndicator(_args);
    (isAChunk(taskData.startDate, taskData.endDate) ? getChunk : getBar)(
        _args.path,
        _args.x,
        _args.y,
        _args.width,
        _args.height,
        taskData.style
    )
        .attr("aria-disabled", !utils.isFunction(taskData.onClick))
        .attr("pointer-events", () =>
            taskData.clickPassThrough && !utils.isFunction(taskData.onClick)
                ? "none"
                : "auto"
        )
        .on("click", () => taskClickActionHandler(taskData, index, taskPath));
};

/**
 * Based on startDate and endDate, we render a hashed bar.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} scale - d3 scale for Graph
 * @param {object} data - Current activity data
 * @param {number} index - Current task data index
 * @param {Selection} path - d3 activity bar selection element
 * @returns {undefined} - returns nothing
 */
const renderHashedTaskGroup = (canvasSVG, scale, data, index, path) => {
    const _args = generatorArgs(scale, data, path);
    renderSelectionIndicator(_args);
    getHashedBar(
        canvasSVG,
        canvasSVG.select("defs"),
        _args.path,
        _args.x,
        _args.y,
        _args.width,
        _args.height,
        data.style
    )
        .attr("aria-disabled", !utils.isFunction(data.onClick))
        .attr("pointer-events", () =>
            data.clickPassThrough && !utils.isFunction(data.onClick)
                ? "none"
                : "auto"
        )
        .on("click", () => taskClickActionHandler(data, index, path));
};
/**
 * Renders the tasks for a track. Each task is created based on start and end datetime.
 * Values needs to be in ISO8601 datetime format, along with the unique key for each task.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} trackLabel - Track label
 * @param {object} taskGroupPath - Container for all the tasks
 * @param {Array} tasks - Tasks list
 * @returns {undefined} - returns nothing
 */
const drawTasks = (
    canvasSVG,
    scale,
    config,
    trackLabel,
    taskGroupPath,
    tasks
) => {
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
        .each(function(d, i) {
            if (d.percentage) {
                renderPercentageBarGroup(scale, d, i, this);
            } else {
                d.isHashed
                    ? renderHashedTaskGroup(canvasSVG, scale, d, i, this)
                    : renderTaskGroup(scale, d, i, this);
            }
        });
    taskPath
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
            )},${getXAxisYPosition(graphContext.config)})`
        );
    tasks.forEach((a) => {
        validateTask(a);
    });
    drawTasks(
        graphContext.svg,
        graphContext.scale,
        graphContext.config,
        trackLabel,
        taskGroupPath,
        tasks
    );
};
/**
 * Selects the task group from the track and removes them
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
const unloadTasks = (graphContext, trackPathSVG) =>
    trackPathSVG.select(`g.${styles.taskGroup}`).remove();

export { loadTasks, unloadTasks };
