"use strict";
/**
 * @typedef {object} Track
 * @typedef {object} GraphContent
 * @typedef {object} GanttConfig
 */
import * as d3 from "d3";
import { GraphContent } from "../../core";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";
import { shouldTruncateLabel } from "../../helpers/label";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import { isUniqueKey } from "./GanttConfig";
import { loadActions, unloadActions } from "./helpers/actionHelpers";
import { loadActivities, unloadActivities } from "./helpers/activityHelpers";
import {
    createTrackContainer,
    removeTrackContainer,
    updateTrackProps
} from "./helpers/creationHelpers";
import { loadEvents, unloadEvents } from "./helpers/eventHelpers";
import { loadTasks, unloadTasks } from "./helpers/taskHelpers";
import {
    loadGanttTrackSelector,
    unloadGanttTrackSelector
} from "./helpers/trackHelpers";
import {
    translateActivities,
    translateDataPoints,
    translateTasks,
    translateTrackSelector
} from "./helpers/translateHelpers";

/**
 * Validates the newly added content into the graph before rendering
 *
 * @private
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_NON_UNIQUE_PROPERTY}
 * @throws {module:errors.THROW_MSG_TASKS_NOT_PROVIDED}
 * @param {object} content - Newly added graph content
 * @returns {undefined} - returns nothing
 */
export const validateContent = (content) => {
    if (utils.isEmpty(content)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (utils.isEmpty(content.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (
        utils.isEmpty(content.trackLabel) ||
        utils.isEmpty(content.trackLabel.display)
    ) {
        throw new Error(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
    }
};
/**
 * Checks if the track name is same as the instance track name.
 * We are doing this since tick texts cannot be appended with a unique attribute like
 * the rest of the implementation. D3 directly renders the tick elements along with the
 * text based on the domain array values.
 *
 * @private
 * @param {Track} control - Track instance
 * @param {string} display - current track instance Label value
 * @returns {boolean} true if label value is the same as the tick text, false otherwise
 */
const hasMatchingTrackLabel = (control, display) =>
    d3.select(control).datum() === display;
/**
 * Adds onClick event for each tick.
 * Criteria:
 *  * Text needs to have a unique display value
 *  * Text needs to have a valid function for onClick
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} labelObj - Label object provided by the consumer
 * @returns {object} d3 svg path
 */
const addTrackLabelEventHandler = (canvasSVG, labelObj) =>
    canvasSVG
        .selectAll(`.${styles.axisYTrackLabel} .tick text`)
        .each(function(displayVal) {
            if (
                !displayVal ||
                !utils.isFunction(labelObj.onClick) ||
                !hasMatchingTrackLabel(this, labelObj.display)
            ) {
                return;
            }
            if (
                shouldTruncateLabel(
                    labelObj.display,
                    constants.DEFAULT_LABEL_CHARACTER_LIMIT
                )
            ) {
                if (utils.isEmpty(d3.select(this).attr("aria-disabled"))) {
                    d3.select(this).attr(
                        "aria-disabled",
                        !utils.isFunction(labelObj.onClick)
                    );
                }
                d3.select(this).on("click", () => {
                    labelObj.onClick(labelObj.display, d3.select(this));
                });
            }
        });

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} config object containing consumer data
 */
const loadInput = (inputJSON) => utils.deepClone(inputJSON);

/**
 * Track sub-graph part of a Gantt chart, which forms the foreground task
 *
 * @module Track
 * @class Track
 */
class Track extends GraphContent {
    /**
     * @class
     * @param {object} input - Input JSON
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.trackGroupPath = null;
    }

    /**
     * @inheritdoc
     */
    load(graph) {
        if (!isUniqueKey(graph.tracks, this.config.key)) {
            throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        }
        this.trackGroupPath = createTrackContainer(
            graph.config,
            graph.svg,
            this.config
        );
        /**
         * To load the gantt track selector, we need to find the track-height, this gets updated only when updateTrackProps gets called.
         *
         * We Need to loadGanttTrackSelector prior to all other components, since trackSelector is part of trackGroup and should be layered bottom,
         * to ensure the clickable functionality.
         */
        updateTrackProps(graph.config, this.config, true);
        loadGanttTrackSelector(graph, this.trackGroupPath, this.config);
        if (utils.notEmpty(this.config.activities)) {
            loadActivities(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config.activities
            );
        }
        if (utils.notEmpty(this.config.tasks)) {
            loadTasks(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config.tasks
            );
        }
        if (utils.notEmpty(this.config.events)) {
            loadEvents(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config.events
            );
        }
        if (utils.notEmpty(this.config.actions)) {
            loadActions(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config.actions
            );
        }
        return this;
    }

    /**
     * @inheritdoc
     */
    unload(graph) {
        updateTrackProps(graph.config, this.config);
        unloadGanttTrackSelector(graph, this.trackGroupPath);
        if (utils.notEmpty(this.config.activities)) {
            unloadActivities(graph, this.trackGroupPath);
        }
        if (utils.notEmpty(this.config.tasks)) {
            unloadTasks(graph, this.trackGroupPath);
        }
        if (utils.notEmpty(this.config.events)) {
            unloadEvents(graph, this.trackGroupPath);
        }
        if (utils.notEmpty(this.config.actions)) {
            unloadActions(graph, this.trackGroupPath);
        }
        removeTrackContainer(graph.svg, this.config.key);
        this.config = {};
        return this;
    }

    /**
     * @inheritdoc
     */
    resize(graph) {
        if (utils.notEmpty(this.trackGroupPath)) {
            translateTrackSelector(
                graph.scale,
                graph.config,
                this.trackGroupPath,
                this.config
            );
        }
        if (utils.notEmpty(this.config.activities)) {
            translateActivities(graph.scale, graph.config, this.trackGroupPath);
        }
        if (utils.notEmpty(this.config.tasks)) {
            translateTasks(graph.scale, graph.config, this.trackGroupPath);
        }
        if (
            utils.notEmpty(this.config.actions) ||
            utils.notEmpty(this.config.events)
        ) {
            translateDataPoints(graph.scale, graph.config, this.trackGroupPath);
        }
        return this;
    }

    /**
     * @inheritdoc
     */
    redraw(graph) {
        addTrackLabelEventHandler(graph.svg, this.config.trackLabel);
        return this;
    }
}

export default Track;
