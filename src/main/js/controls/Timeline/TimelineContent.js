"use strict";
/**
 * @typedef {object} TimelineContent
 * @typedef {object} GraphContent
 * @typedef {object} TimelineConfig
 */
import { GraphContent } from "../../core";
import constants, { SHAPES } from "../../helpers/constants";
import errors from "../../helpers/errors";
import { removeLegendItem } from "../../helpers/legend";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import { isUniqueKey } from "../Graph/GraphConfig";
import {
    clear,
    clickHandler,
    createPoints,
    createTimelineContentGroup,
    hoverHandler,
    prepareLegendItems
} from "./helpers/creationHelpers";
import { translatePoints } from "./helpers/translateHelpers";

/**
 * Checks if values are of type datetime in ISO8601 datetime format
 *
 * @private
 * @param {string} x - Date string
 * @returns {Date} ISO8601 datetime
 */
const getXDataValues = (x) => {
    if (!utils.isDate(x)) {
        throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    }
    return utils.parseDateTime(x);
};
/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we
 * can use them when rendering the data point. Applies isCritical to the point if point is
 * marked critical.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} dataTarget - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) => {
    graphConfig.shownTargets.push(dataTarget.key);
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => ({
        onClick: dataTarget.onClick,
        isCritical: value.isCritical || false,
        x: getXDataValues(value.x),
        content: value.content,
        color: dataTarget.color || constants.DEFAULT_COLOR,
        label: dataTarget.label || {},
        shape: dataTarget.shape || SHAPES.CIRCLE,
        key: dataTarget.key
    }));
    return dataTarget;
};
/**
 * Validates the newly added timeline content into the graph before rendering
 *
 * @private
 * @param {object} input - Newly added graph tasks
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_NO_DATA_POINTS}
 * @throws {module:errors.THROW_MSG_INVALID_DATA_PROPERTY}
 * @returns {undefined} - returns nothing
 */
export const validateContent = (input) => {
    if (utils.isEmpty(input)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (utils.isEmpty(input.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (utils.isEmpty(input.label) || utils.isEmpty(input.label.display)) {
        throw new Error(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
    }
    if (utils.isEmpty(input.values)) {
        throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
    }
};
/**
 * Draws points along X Axis based on datetime
 *
 * @private
 * @param {TimelineContent} control - TimelineContent instance
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} timelineGraphContentSVG - d3 selection node of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (control, scale, config, timelineGraphContentSVG, dataTarget) => {
    const contentGroupPath = createTimelineContentGroup(
        config,
        timelineGraphContentSVG,
        control.config
    );
    const pointPath = contentGroupPath
        .selectAll(`.${styles.point}`)
        .data(dataTarget.internalValuesSubset);
    createPoints(scale, config, pointPath.enter());
    pointPath
        .exit()
        .transition()
        .call(constants.d3Transition)
        .remove();
};
/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} config object containing consumer data
 */
const loadInput = (inputJSON) => {
    validateContent(inputJSON);
    return utils.deepClone(inputJSON);
};

/**
 * TimelineContent is part of a Timeline graph
 *
 * @module TimelineContent
 * @class TimelineContent
 */
class TimelineContent extends GraphContent {
    /**
     * @class
     * @param {object} input - Input JSON
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.dataTarget = null;
    }

    /**
     * @inheritdoc
     */
    load(graph) {
        if (!isUniqueKey(graph.contentConfig, this.config.key)) {
            throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        }
        this.dataTarget = processDataPoints(graph.config, this.config);
        draw(
            this,
            graph.scale,
            graph.config,
            graph.svg.select(`.${styles.timelineGraphContent}`),
            this.dataTarget
        );
        prepareLegendItems(
            graph.config,
            {
                clickHandler: clickHandler(
                    graph,
                    this,
                    graph.config,
                    graph.svg
                ),
                hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
            },
            this.dataTarget,
            graph.legendSVG
        );
        return this;
    }

    /**
     * @inheritdoc
     */
    unload(graph) {
        clear(graph.svg, this.dataTarget);
        removeLegendItem(graph.legendSVG, this.dataTarget);
        this.dataTarget = {};
        this.config = {};
        return this;
    }

    /**
     * @inheritdoc
     */
    resize(graph) {
        translatePoints(
            graph.scale,
            graph.config,
            graph.svg,
            this.config.key,
            `.${styles.point}`
        );
        translatePoints(
            graph.scale,
            graph.config,
            graph.svg,
            this.config.key,
            `.${styles.dataPointSelection}`
        );
        return this;
    }

    /**
     * @inheritdoc
     */
    redraw(graph) {
        clear(graph.svg, this.dataTarget);
        draw(
            this,
            graph.scale,
            graph.config,
            graph.svg.select(`.${styles.timelineGraphContent}`),
            this.dataTarget
        );
        return this;
    }
}

export default TimelineContent;
