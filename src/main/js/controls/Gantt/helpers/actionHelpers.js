import * as d3 from "d3";
import { Shape } from "../../../core";
import { getDefaultSVGProps } from "../../../core/Shape";
import constants, { SHAPES } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import {
    legendClickHandler,
    legendHoverHandler,
    loadLegendItem
} from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";
import {
    dataPointActionHandler,
    drawDataPoints,
    renderSelectionPath
} from "./datapointHelpers";
import { transformPoint } from "./translateHelpers";

/**
 * @typedef Gantt
 */

/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} trackLabel -Track label
 * @param {object} dataTarget - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
export const processActionItems = (graphConfig, trackLabel, dataTarget) => {
    const checkX = (x) => {
        if (!utils.isDate(x)) {
            throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        }
        return utils.parseDateTime(x);
    };
    const getActionLegendDetails = (legendItems, key) => {
        const item = legendItems.filter((l) => l.key === key);
        if (!item.length) {
            throw new Error(errors.THROW_MSG_UNIQUE_ACTION_KEY_NOT_PROVIDED);
        }
        return item[0];
    };
    const legendItem = getActionLegendDetails(
        graphConfig.actionLegend,
        dataTarget.key
    );
    return dataTarget.values.map((value) => ({
        key: dataTarget.key,
        onClick: dataTarget.onClick,
        x: checkX(value),
        y: trackLabel.display,
        label: legendItem.label,
        color: legendItem.color || constants.DEFAULT_COLOR,
        shape: legendItem.shape || SHAPES.CIRCLE,
        clickPassThrough: utils.isDefined(graphConfig.clickPassThrough)
            ? graphConfig.clickPassThrough.actions
            : false
    }));
};
/**
 * Updates the array parameter, with the key. If the key is present then
 * it removed, else added to the array.
 *
 * @private
 * @param {Array} shownTargets - List of targets shown in the graph
 * @param {object} key - unique data set key
 * @returns {Array} modified shownTarget array
 */
const updateShownTarget = (shownTargets, key) => {
    const index = shownTargets.indexOf(key);
    if (index > -1) {
        shownTargets.splice(index, 1);
    } else {
        shownTargets.push(key);
    }
    return shownTargets;
};
/**
 * Click handler for legend item. Removes the action items from graph when clicked and calls redraw
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles click action on legend item
 */
export const clickHandler = (graphContext, config, canvasSVG) => (
    element,
    item
) => {
    legendClickHandler(element);
    updateShownTarget(config.shownTargets, item);
    canvasSVG
        .selectAll(`.${styles.point}[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", function() {
            return !(d3.select(this).attr("aria-hidden") === "true");
        });
};
/**
 * Hover handler for legend item. Blurs the rest of the targets in Graph
 * if present.
 *
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles hover action on legend item
 */
export const hoverHandler = (graphTargets, canvasSVG) => (item, state) => {
    const additionalHoverHandler = (
        shownTargets,
        canvasSVG,
        currentKey,
        hoverState,
        k
    ) =>
        canvasSVG
            .selectAll(`.${styles.point}[aria-describedby="${k}"]`)
            .classed(styles.blur, state === constants.HOVER_EVENT.MOUSE_ENTER);
    legendHoverHandler(graphTargets, canvasSVG, item.key, state, [
        additionalHoverHandler
    ]);
};
/**
 * Prepares click and hover handlers for action legend items.
 *
 * @private
 * @param {Gantt} control - gantt chart instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 html element of the canvas
 * @param {Array} shownTargets - graph targets config object
 * @returns {{clickHandler: Function, hoverHandler: Function}} - event handlers for legend items
 */
export const prepareLegendEventHandlers = (
    control,
    config,
    canvasSVG,
    shownTargets
) => ({
    clickHandler: clickHandler(control, config, canvasSVG),
    hoverHandler: hoverHandler(shownTargets, canvasSVG)
});
/**
 * A callback that will be sent to Graph class so that when graph is
 * created the Graph API will execute this callback function and the legend
 * items are loaded.
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} eventHandlers - Object containing click and hover event handlers for legend item
 * @param {object} dataTarget - Data points object
 * @param {object} legendSVG - d3 element that will be need to render the legend
 * items into.
 * @returns {undefined} - returns nothing
 */
export const renderLegendItems = (
    config,
    eventHandlers,
    dataTarget,
    legendSVG
) => {
    if (dataTarget.label && dataTarget.label.display && legendSVG) {
        loadLegendItem(
            legendSVG,
            dataTarget,
            config.shownTargets,
            eventHandlers
        );
    }
};
/**
 * Validates the newly added content into the graph before rendering
 *
 * @private
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_NO_DATA_POINTS}
 * @param {object} content - Newly added graph content
 * @returns {undefined} - returns nothing
 */
const validateActionContent = (content) => {
    if (utils.isEmpty(content)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (utils.isEmpty(content.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (utils.isEmpty(content.values)) {
        throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
    }
};
/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} config object containing consumer data
 */
const loadActionInput = (inputJSON) => {
    validateActionContent(inputJSON);
    return utils.deepClone(inputJSON);
};
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
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 html element of the canvas
 * @returns {object} - d3 append object
 */
const drawActionDataPoints = (scale, config, canvasSVG) =>
    canvasSVG
        .append("g")
        .classed(styles.pointGroup, true)
        .each(function(dataPoint, index) {
            const dataPointSVG = d3.select(this);
            renderSelectionPath(scale, config, dataPointSVG, dataPoint, index);
            renderDataPointPath(scale, config, dataPointSVG, dataPoint, index);
        });
/**
 * Creates an element container with data points from the input JSON property: action
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @param {object} trackLabel - Track label
 * @param {object} actions - input JSON for creating an action
 * @returns {undefined} - returns nothing
 */
export const loadActions = (graphContext, trackPathSVG, trackLabel, actions) =>
    actions.forEach((a) => {
        drawDataPoints(
            graphContext.scale,
            graphContext.config,
            trackPathSVG,
            processActionItems(
                graphContext.config,
                trackLabel,
                loadActionInput(a)
            ),
            drawActionDataPoints
        );
    });
/**
 * Selects all the data point groups from the track and removes them
 *
 * @private
 * @param {object} graphContext - Gantt instance
 * @param {object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
export const unloadActions = (graphContext, trackPathSVG) =>
    trackPathSVG.selectAll(`g.${styles.currentPointsGroup}`).remove();
