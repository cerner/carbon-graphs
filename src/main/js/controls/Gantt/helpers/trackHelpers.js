"use strict";
import styles from "../../../helpers/styles";
import {
    getXAxisXPosition,
    getXAxisYPosition,
    getXAxisWidth
} from "./creationHelpers";
import constants from "../../../helpers/constants";
import { getRect } from "../../../helpers/barType";
import utils from "../../../helpers/utils";

/**
 * Generates arguments for creating track rectangles
 * @private
 * @param {Object} config - config object derived from input JSON.
 * @param {Selection} ganttSelectorGroupPath - d3 track bar selection element
 * @param {String} key - track key
 * @returns {Object} List of arguments - target element, x, y, width, height
 */
const generatorArgs = (config, ganttSelectorGroupPath, key) => ({
    path: ganttSelectorGroupPath,
    x: getXAxisXPosition(config) + constants.DEFAULT_GANTT_TRACK_SELECTION.x,
    y:
        config.height +
        getXAxisYPosition(config) +
        constants.DEFAULT_GANTT_TRACK_SELECTION.y,
    width:
        getXAxisWidth(config) - constants.DEFAULT_GANTT_TRACK_SELECTION.width,
    height:
        config.axis.y.trackList[key].trackHeight -
        constants.DEFAULT_GANTT_TRACK_SELECTION.height
});

/**
 * Renders the selection indicator for a track bar.
 * @private
 * @param {Object} indicatorArgs - arguments needed for generating rect for selection indicator
 * @param {Object} trackConfig - config dervied from input track JSON.
 * @returns {undefined} - returns nothing.
 */
const renderSelectionIndicator = (indicatorArgs, trackConfig) => {
    getRect(
        indicatorArgs.path,
        indicatorArgs.x,
        indicatorArgs.y,
        indicatorArgs.width,
        indicatorArgs.height
    )
        .attr("aria-selected", false)
        .classed(styles.ganttTrackBarSelection, true)
        .attr("aria-describedby", trackConfig.key)
        .attr("aria-disabled", !utils.isFunction(trackConfig.onClick))
        .on("click", () =>
            trackClickActionHandler(indicatorArgs.path, trackConfig)
        );
};

/**
 * Toggles the selection of a track, executes on click of a track.
 * @private
 * @param {Object} target - DOM element of the track clicked
 * @param {String} key - track key
 * @returns {Array} d3 html element of the track.
 */
const toggleTrackSelection = (target, key) => {
    const selectionTrackNode = target.select(`[aria-describedby='${key}']`);
    selectionTrackNode.attr(
        "aria-selected",
        !(selectionTrackNode.attr("aria-selected") === "true")
    );
    return selectionTrackNode;
};
/**
 * Handler for a track click action. If the content property is present for the track
 * then the callback is executed other wise it is NOP.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 * @private
 * @param {Object} path - DOM object of the  clicked track.
 * @param {Object} trackConfig - Config of the track derived from
 * @returns {undefined} - returns nothing.
 */
const trackClickActionHandler = (path, trackConfig) => {
    if (utils.isEmpty(trackConfig.onClick)) {
        return;
    }
    toggleTrackSelection(path, trackConfig.key).call((d3TargetNode) =>
        trackConfig.onClick(
            () => {
                const isSelected =
                    d3TargetNode.attr("aria-selected") === "true";
                d3TargetNode.attr("aria-selected", !isSelected);
            },
            trackConfig.key,
            trackConfig,
            d3TargetNode
        )
    );
};
/**
 * Creates a container for gantt chart content
 * @private
 * @param {Object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Object} trackConfig - track's config object
 * @returns {Object} d3 svg path
 */
export const loadGanttTrackSelector = (config, canvasSVG, trackConfig) => {
    const ganttTrackSelectorGroupPath = canvasSVG.select(
        `.${styles.ganttTrackSelectorGroup}`
    );
    renderSelectionIndicator(
        generatorArgs(config, ganttTrackSelectorGroupPath, trackConfig.key),
        trackConfig
    );
};
