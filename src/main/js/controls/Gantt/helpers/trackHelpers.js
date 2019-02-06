"use strict";
import { getRect } from "../../../helpers/barType";
import constants from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    getXAxisWidth,
    getXAxisXPosition,
    getXAxisYPosition
} from "./creationHelpers";

/**
 * Generates arguments for creating track rectangles
 * @private
 * @param {Object} config - config object derived from input JSON.
 * @param {Object} scale - d3 scale for Graph
 * @param {Selection} ganttSelectorGroupPath - d3 track bar selection element
 * @param {Object} trackConfig - config for the track
 * @returns {Object} List of arguments - target element, x, y, width, height
 */
export const generatorArgs = (
    config,
    scale,
    ganttSelectorGroupPath,
    trackConfig
) => ({
    path: ganttSelectorGroupPath,
    x: constants.DEFAULT_GANTT_TRACK_SELECTION.x,
    y:
        scale.y(trackConfig.trackLabel.display) +
        constants.DEFAULT_GANTT_TRACK_SELECTION.y,
    width:
        getXAxisWidth(config) - constants.DEFAULT_GANTT_TRACK_SELECTION.width,
    height:
        config.axis.y.trackList[trackConfig.key].trackHeight -
        constants.DEFAULT_GANTT_TRACK_SELECTION.height
});

/**
 * Renders the selection indicator for a track bar.
 * @private
 * @param {Object} indicatorArgs - arguments needed for generating rect for selection indicator
 * @param {Object} trackConfig - config dervied from input track JSON.
 * @returns {void} - returns nothing.
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
 * @returns {void} - returns nothing.
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
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPath - Track container element
 * @param {Object} trackConfig - track's config object
 * @returns {Object} d3 svg path
 */
export const loadGanttTrackSelector = (
    graphContext,
    trackPath,
    trackConfig
) => {
    const ganttTrackSelectorGroupPath = trackPath
        .append("g")
        .classed(styles.ganttTrackSelectorGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(
                graphContext.config
            )},${getXAxisYPosition(graphContext.config)})`
        );
    renderSelectionIndicator(
        generatorArgs(
            graphContext.config,
            graphContext.scale,
            ganttTrackSelectorGroupPath,
            trackConfig
        ),
        trackConfig
    );
};

/**
 * Selects the trackSelector group and removes them
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPath - Track container element
 * @returns {Selection} - track container element
 */
export const unloadGanttTrackSelector = (graphContext, trackPath) =>
    trackPath.select(`g.${styles.ganttTrackSelectorGroup}`).remove();
