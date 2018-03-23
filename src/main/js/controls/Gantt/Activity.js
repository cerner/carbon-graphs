"use strict";
/**
 * @typedef {Object} Activity
 * @typedef {Object} GraphContent
 */

import { GraphContent } from "../../core";
import GanttConfig, { validateActivity } from "./GanttConfig";

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} LineConfig config object containing consumer data
 */
const loadInput = (inputJSON) => {
    const configObject = new GanttConfig();
    configObject.setInput(inputJSON);
    validateActivity(inputJSON);
    configObject.clone();
    return configObject.getConfig();
};

/**
 * Activity sub-graph part of a Gantt chart, which forms the background task/shadow task
 * @module Activity
 * @class Activity
 */
class Activity extends GraphContent {
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

export default Activity;
