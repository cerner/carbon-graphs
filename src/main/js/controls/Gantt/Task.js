"use strict";
/**
 * @typedef {Object} Task
 * @typedef {Object} GraphContent
 * @typedef {Object} GanttConfig
 */

import { GraphContent } from "../../core";
import { COLORS } from "../../helpers/constants";
import GanttConfig, { validateTask } from "./GanttConfig";
import {
    getDuration,
    getEndDuration,
    getStartDuration,
    getTaskStyle
} from "./helpers/durationHelpers";

/**
 * Processes the input for a task and converts to an object needed to render a bar
 * Duration is a function that is needed to compute Start or end. If both start and end
 * are present then the duration will be ignored.
 * @private
 * @param {Object} graphConfig - config object of Graph API
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) => {
    const _duration = getDuration(dataTarget.duration);
    return {
        onClick: graphConfig.onClick,
        start: getStartDuration(_duration, dataTarget.start, dataTarget.end),
        end: getEndDuration(_duration, dataTarget.start, dataTarget.end),
        percentage: dataTarget.percentage,
        dependencies: dataTarget.dependencies,
        color: graphConfig.color || COLORS.BLUE,
        label: graphConfig.label || null,
        key: dataTarget.key,
        style: getTaskStyle(dataTarget.style)
    };
};
/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {GanttConfig} config object containing consumer data
 */
const loadInput = (inputJSON) => {
    const configObject = new GanttConfig();
    configObject.setInput(inputJSON);
    validateTask(inputJSON);
    configObject.clone();
    return configObject.getConfig();
};

/**
 * Task sub-graph part of a Gantt chart, which forms the foreground task
 * @module Task
 * @class Task
 */
class Task extends GraphContent {
    /**
     * @constructor
     * @param {JSON} input - Input JSON
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.dataTarget = {};
    }

    /**
     * @inheritDoc
     */
    load(graph) {
        this.dataTarget = processDataPoints(graph.config, this.config);
        return this;
    }

    /**
     * @inheritDoc
     */
    unload(graph) {
        this.dataTarget = {};
        this.config = {};
        return this;
    }

    /**
     * @inheritDoc
     */
    resize(graph) {
        return this;
    }

    /**
     * @inheritDoc
     */
    redraw(graph) {
        return this;
    }
}

export default Task;
