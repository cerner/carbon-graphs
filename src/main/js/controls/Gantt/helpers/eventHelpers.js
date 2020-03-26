"use strict";
import * as d3 from "d3";
import { Shape } from "../../../core";
import { getDefaultSVGProps } from "../../../core/Shape";
import { SHAPES } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";
import { validateEvent } from "../GanttConfig";
import {
    dataPointActionHandler,
    drawDataPoints,
    renderSelectionPath
} from "./datapointHelpers";
import { transformPoint } from "./translateHelpers";

/**
 * Renders the data point in the provided path element.
 * It uses the consumer opted Shape, color of the data point.
 * Behavior when clicked on the data point etc.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {SVGElement} path - svg Path element
 * @param {object} dataPoint - data point properties such as shape, color and onClick callback function
 * @param {number} index - data point index
 * @returns {object} - d3 selection object
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
                    "aria-disabled": !utils.isFunction(dataPoint.onClick)
                },
                additionalAttributes: {
                    "pointer-events":
                        dataPoint.clickPassThrough &&
                        !utils.isFunction(dataPoint.onClick)
                }
            })
        )
    );

/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, shape, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 *
 * @private
 * @callback drawEventDataPoints
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 html element of the canvas
 * @returns {undefined} - returns nothing
 */
const drawEventDataPoints = (scale, config, canvasSVG) => {
    canvasSVG
        .append("g")
        .classed(styles.pointGroup, true)
        .each(function(dataPoint, index) {
            const dataPointSVG = d3.select(this);
            if (utils.isFunction(dataPoint.onClick)) {
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
 *
 * @private
 * @param {object} config - Gantt config derived from input JSON.
 * @param {object} trackLabel - Track label
 * @param {object} dataTarget  - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
const processEvents = (config, trackLabel, dataTarget) => {
    const checkX = (x) => {
        if (!utils.isDate(x)) {
            throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        }
        return utils.parseDateTime(x);
    };
    return dataTarget.values.map((value) => ({
        key: dataTarget.key,
        onClick: dataTarget.onClick,
        x: checkX(value),
        y: trackLabel.display,
        label: dataTarget.label,
        color: dataTarget.color || "",
        shape: dataTarget.shape || SHAPES.CIRCLE,
        clickPassThrough: utils.isDefined(config.clickPassThrough)
            ? config.clickPassThrough.events
            : false
    }));
};

/**
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - input json for event.
 * @returns {object} config object containing consumer data.
 */
const loadEventInput = (inputJSON) => {
    validateEvent(inputJSON);
    return utils.deepClone(inputJSON);
};

/**
 * Creates an element container with data points from the input JSON property: events
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @param {object} trackLabel - Track label
 * @param {Array} events - input JSON for creating events
 * @returns {undefined} - returns nothing
 */
const loadEvents = (graphContext, trackPathSVG, trackLabel, events) => {
    events.forEach((event) => {
        drawDataPoints(
            graphContext.scale,
            graphContext.config,
            trackPathSVG,
            processEvents(
                graphContext.config,
                trackLabel,
                loadEventInput(event)
            ),
            drawEventDataPoints
        );
    });
};

/**
 * Selects all the event groups from the track and removes them
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
const unloadEvents = (graphContext, trackPathSVG) =>
    trackPathSVG.selectAll(`g.${styles.currentPointsGroup}`).remove();

export { loadEvents, unloadEvents };
