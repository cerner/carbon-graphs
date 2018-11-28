"use strict";
import d3 from "d3";
import styles from "../../../helpers/styles";
import { Shape } from "../../../core";
import { getDefaultSVGProps } from "../../../core/Shape";
import { SHAPES } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import utils from "../../../helpers/utils";
import {
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";
import { transformPoint } from "./translateHelpers";
import {
    renderSelectionPath,
    dataPointActionHandler,
    drawDataPoints
} from "./datapointHelpers";
import { validateEvent } from "../GanttConfig";
import { getDefaultValue } from "../../../core/BaseConfig";
/**
 * Renders the data point in the provided path element.
 * It uses the consumer opted Shape, color of the data point.
 * Behavior when clicked on the data point etc.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {SVGElement} path - svg Path element
 * @param {Object} dataPoint - data point properties such as shape, color and onClick callback function
 * @param {number} index - data point index
 * @returns {Object} - d3 selection object
 */
const renderDataPointPath = (scale, config, path, dataPoint, index) =>
    path.append(() =>
        new Shape(getShapeForTarget(dataPoint)).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.point,
                svgStyles: `fill: ${getColorForTarget(dataPoint)};`,
                transformFn: transformPoint(scale, config)(dataPoint),
                onClickFn() {
                    dataPointActionHandler(dataPoint, index, this);
                },
                a11yAttributes: {
                    "aria-hidden": false,
                    "aria-describedby": dataPoint.key,
                    "aria-disabled": !dataPoint.isSelectable
                }
            })
        )
    );

/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, shape, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 * @private
 * @callback drawEventDataPoints
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of the canvas
 * @returns {Object} - d3 append object
 */
const drawEventDataPoints = (scale, config, canvasSVG) => {
    canvasSVG
        .append("g")
        .classed(styles.pointGroup, true)
        .each(function(dataPoint, index) {
            const dataPointSVG = d3.select(this);
            if (dataPoint.isSelectable) {
                renderSelectionPath(
                    scale,
                    config,
                    dataPointSVG,
                    dataPoint,
                    index
                );
            }
            renderDataPointPath(scale, config, dataPointSVG, dataPoint, index);
        });
};

/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we can
 * use them when rendering the data points of events.
 * @private
 * @param {Object} trackLabel - Track label
 * @param {Object} dataTarget  - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const processEvents = (trackLabel, dataTarget) => {
    const checkX = (x) => {
        if (!utils.isDate(x)) {
            throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        }
        return utils.parseDateTime(x);
    };
    return dataTarget.values.map((value) => ({
        key: dataTarget.key,
        isSelectable: getDefaultValue(dataTarget.isSelectable, true),
        onClick: dataTarget.onClick,
        x: checkX(value),
        y: trackLabel.display,
        label: dataTarget.label,
        color: dataTarget.color || "",
        shape: dataTarget.shape || SHAPES.CIRCLE
    }));
};

/**
 * Load function validates, clones and stores the input onto a config object.
 * @param {object} inputJSON - input json for event.
 * @returns {object} config object containing consumer data.
 */
const loadEventInput = (inputJSON) => {
    validateEvent(inputJSON);
    return utils.deepClone(inputJSON);
};

/**
 * Creates an element container with data points from the input JSON property: events
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPathSVG - Track container element
 * @param {Object} trackLabel - Track label
 * @param {Array} events - input JSON for creating events
 * @returns {undefined} - returns nothing
 */
const loadEvents = (graphContext, trackPathSVG, trackLabel, events) => {
    events.forEach((event) => {
        drawDataPoints(
            graphContext.scale,
            graphContext.config,
            trackPathSVG,
            processEvents(trackLabel, loadEventInput(event)),
            drawEventDataPoints
        );
    });
};

/**
 * Selects all the event groups from the track and removes them
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
const unloadEvents = (graphContext, trackPathSVG) =>
    trackPathSVG.selectAll(`g.${styles.currentPointsGroup}`).remove();

export { loadEvents, unloadEvents };
