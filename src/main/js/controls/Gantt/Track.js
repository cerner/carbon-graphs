"use strict";
/**
 * @typedef {Object} Track
 * @typedef {Object} GraphContent
 * @typedef {Object} GanttConfig
 */
import d3 from "d3";
import { GraphContent } from "../../core";
import errors from "../../helpers/errors";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import { isUniqueKey } from "./GanttConfig";
import { getTrackLabel, updateTrackProps } from "./helpers/creationHelpers";
import { translateLabelText } from "./helpers/translateHelpers";

/**
 * Validates the newly added content into the graph before rendering
 * @private
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_NON_UNIQUE_PROPERTY}
 * @throws {module:errors.THROW_MSG_TASKS_NOT_PROVIDED}
 * @param {Object} content - Newly added graph content
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
    if (utils.isEmpty(content.tasks)) {
        throw new Error(errors.THROW_MSG_TASKS_NOT_PROVIDED);
    }
};
/**
 * Checks if the track name is same as the instance track name.
 * We are doing this since tick texts cannot be appended with a unique attribute like
 * the rest of the implementation. D3 directly renders the tick elements along with the
 * text based on the domain array values.
 * @private
 * @param {Track} control - Track instance
 * @param {string} display - current track instance Label value
 * @returns {boolean} true if label value is the same as the tick text, false otherwise
 */
const hasMatchingTrackLabel = (control, display) =>
    d3.select(control).datum() === getTrackLabel(display);
/**
 * Adds onClick event for each tick.
 * Criteria:
 *  * Text needs to have a unique display value
 *  * Text needs to have a valid function for onClick
 * @private
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Object} labelObj - Label object provided by the consumer
 * @returns {Object} d3 svg path
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
            d3.select(this).on("click", () => {
                labelObj.onClick(labelObj.display);
            });
        });

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {GanttConfig} config object containing consumer data
 */
const loadInput = (inputJSON) => {
    validateContent(inputJSON);
    return utils.deepClone(inputJSON);
};

/**
 * Track sub-graph part of a Gantt chart, which forms the foreground task
 * @module Track
 * @class Track
 */
class Track extends GraphContent {
    /**
     * @constructor
     * @param {Object} input - Input JSON
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
    }

    /**
     * @inheritDoc
     */
    load(graph) {
        if (!isUniqueKey(graph.tracks, this.config.key)) {
            throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        }
        updateTrackProps(graph.config, this.config, true);
        return this;
    }

    /**
     * @inheritDoc
     */
    unload(graph) {
        updateTrackProps(graph.config, this.config);
        this.config = {};
        return this;
    }

    /**
     * @inheritDoc
     */
    resize(graph) {
        translateLabelText(graph.scale, graph.svg);
        return this;
    }

    /**
     * @inheritDoc
     */
    redraw(graph) {
        addTrackLabelEventHandler(graph.svg, this.config.trackLabel);
        return this;
    }
}

export default Track;
