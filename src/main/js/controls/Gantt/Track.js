"use strict";
/**
 * @typedef {object} Track
 * @typedef {object} GraphContent
 * @typedef {object} GanttConfig
 */
import * as d3 from "d3";
import { GraphContent } from "../../core";
import errors from "../../helpers/errors";
import { loadLabelPopup, shouldTruncateLabel } from "../../helpers/label";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import { isUniqueKey } from "./GanttConfig";
import { loadActions, unloadActions, reflowActions } from "./helpers/actionHelpers";
import {
    loadActivities,
    unloadActivities,
    reflowActivities
} from "./helpers/activityHelpers";
import {
    createTrackContainer,
    removeTrackContainer,
    scaleGraph,
    updateTrackProps
} from "./helpers/creationHelpers";
import { 
    loadEvents,
    unloadEvents,
    reflowEvents 
} from "./helpers/eventHelpers";
import { 
    loadTasks,
    unloadTasks,
    reflowTasks
} from "./helpers/taskHelpers";
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
        .each(function (displayVal) {
            // checks if track name is same as instance of track name
            if (!displayVal || !hasMatchingTrackLabel(this, labelObj.display)) {
            } else {
                shouldTruncateLabel(labelObj.display)
                    ? d3
                          .select(this)
                          .style("cursor", "pointer")
                          .on("click", () => {
                              // If the consumer provides onclick function, it will override default onClick functionality provided by Carbon-graphs
                              utils.isDefined(labelObj.onClick) &&
                              utils.isFunction(labelObj.onClick)
                                  ? labelObj.onClick(
                                        labelObj.display,
                                        d3.select(this)
                                    )
                                  : loadLabelPopup(labelObj.display, "y");
                          })
                    : null;
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
        this.config.actionKeys = [];
        this.config.eventKeys = [];
        this.config.activityKeys = [];
        this.config.taskKeys = [];
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
                this.config
            );
        }
        if (utils.notEmpty(this.config.tasks)) {
            loadTasks(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config
            );
        }
        if (utils.notEmpty(this.config.events)) {
            loadEvents(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config
            );
        }
        if (utils.notEmpty(this.config.actions)) {
            loadActions(
                graph,
                this.trackGroupPath,
                this.config.trackLabel,
                this.config
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
        scaleGraph(graph.scale, graph.config);
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
    reflow(graph, graphData) {
        if (utils.notEmpty(graphData.activities)&& utils.notEmpty(this.config.activities)) {
            graphData.activityKeys=[];
            graphData.activities.forEach((activity) => {
                graphData.activityKeys.push(activity.key);
                if(this.config.activityKeys.includes(activity.key)) {
                    const position = this.config.activityKeys.indexOf(activity.key);
                    this.config.activities[position].startDate = activity.startDate;
                    this.config.activities[position].endDate = activity.endDate;
                }
            });
            this.config.activityKeys.slice(0).forEach((key, i) => {
                if (!graphData.activityKeys.includes(key)) {
                    const position = this.config.activityKeys.indexOf(key);
                    this.config.activityKeys.splice(position, 1);
                    this.config.activities.splice(position, 1);
                }
            });
            const trackGroupPath = graph.svg.selectAll(`.${styles.trackGroup}[aria-describedby="${this.config.key}"]`);
            reflowActivities(graph.svg, graph.config, graph.scale, this, trackGroupPath);
        }
        if (utils.notEmpty(graphData.tasks) && utils.notEmpty(this.config.tasks)) {
            graphData.taskKeys=[];
            graphData.tasks.forEach((task) => {
                graphData.taskKeys.push(task.key);
                if(this.config.taskKeys.includes(task.key)) {
                    const position = this.config.taskKeys.indexOf(task.key);
                    this.config.tasks[position].startDate = task.startDate;
                    this.config.tasks[position].endDate = task.endDate;
                }
            });
            this.config.taskKeys.slice(0).forEach((key, i) => {
                if (!graphData.taskKeys.includes(key)) {
                    const position = this.config.taskKeys.indexOf(key);
                    this.config.taskKeys.splice(position, 1);
                    this.config.tasks.splice(position, 1);
                }
            });
            const trackGroupPath = graph.svg.selectAll(`.${styles.trackGroup}[aria-describedby="${this.config.key}"]`);
            reflowTasks(graph.svg, graph.config, graph.scale, this, trackGroupPath);
        }
        if (utils.notEmpty(graphData.events) && utils.notEmpty(this.config.events)) {
            graphData.eventKeys=[];
            graphData.events.forEach((event) => {
                graphData.eventKeys.push(event.key);
                if(this.config.eventKeys.includes(event.key)) {
                    const position = this.config.eventKeys.indexOf(event.key);
                    this.config.events[position].values = event.values;
                }
            });
            this.config.eventKeys.slice(0).forEach((key) => {
                if (!graphData.eventKeys.includes(key)) {
                    const position = this.config.eventKeys.indexOf(key);
                    this.config.eventKeys.splice(position, 1);
                    this.config.events.splice(position, 1);
                }
            });
        const trackGroupPath = graph.svg.selectAll(`.${styles.trackGroup}[aria-describedby="${this.config.key}"]`);
        reflowEvents(graph.config, graph.scale, this, trackGroupPath);
        }
        if (utils.notEmpty(graphData.actions) && utils.notEmpty(this.config.actions)) {
            graphData.actionKeys=[];
            graphData.actions.forEach((action) => {
                graphData.actionKeys.push(action.key);
                if(this.config.actionKeys.includes(action.key)) {
                    const position = this.config.actionKeys.indexOf(action.key);
                    this.config.actions[position].values = action.values;
                }
            });
            this.config.actionKeys.slice(0).forEach((key) => {
                if (!graphData.actionKeys.includes(key)) {
                    const position = this.config.actionKeys.indexOf(key);
                    this.config.actionKeys.splice(position, 1);
                    this.config.actions.splice(position, 1);
                }
            })
        const trackGroupPath = graph.svg.selectAll(`.${styles.trackGroup}[aria-describedby="${this.config.key}"]`);
        reflowActions(graph.config, graph.scale, this, trackGroupPath);
        }

        this.resize(graph);
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
