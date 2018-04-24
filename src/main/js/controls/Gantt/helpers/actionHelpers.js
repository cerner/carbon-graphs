import d3 from "d3";
import { Shape } from "../../../core";
import { getXAxisXPosition } from "../../../helpers/axis";
import constants, { SHAPES } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import {
    legendClickHandler,
    legendHoverHandler,
    loadLegendItem
} from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { getColorForTarget, getShape } from "../../Graph/helpers/helpers";
import { getXAxisYPosition } from "./creationHelpers";
import { transformPoint } from "./translateHelpers";

/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 * @private
 * @param {Object} graphConfig - config object of Graph API
 * @param {Object} trackLabel -Track label
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
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
        shape: legendItem.shape || SHAPES.CIRCLE
    }));
};
/**
 * Updates the array parameter, with the key. If the key is present then
 * it removed, else added to the array.
 * @private
 * @param {Array} shownTargets - List of targets shown in the graph
 * @param {Object} key - unique data set key
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
 * @private
 * @param {Object} graphContext - Graph instance
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {function} - returns callback function that handles click action on legend item
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
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {function} - returns callback function that handles hover action on legend item
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
 * @private
 * @param {Gantt} control - gantt chart instance
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of the canvas
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
 * @private
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Object} eventHandlers - Object containing click and hover event handlers for legend item
 * @param {Object} dataTarget - Data points object
 * @param {Object} legendSVG - d3 element that will be need to render the legend
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
 * @private
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_NO_DATA_POINTS}
 * @param {Object} content - Newly added graph content
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
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} config object containing consumer data
 */
const loadActionInput = (inputJSON) => {
    validateActionContent(inputJSON);
    return utils.deepClone(inputJSON);
};
/**
 * Toggles the selection of a data point, executes on click of a data point.
 * @private
 * @param {Object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (target) => {
    const selectedPointNode = d3
        .select(target.parentNode)
        .select(`.${styles.dataPointSelection}`);
    selectedPointNode.attr(
        "aria-hidden",
        !(selectedPointNode.attr("aria-hidden") === "true")
    );
    return selectedPointNode;
};
/**
 * Handler for the data point on click. If the content property is present for the data point
 * then the callback is executed other wise it is NOP.
 * If the callback is present, the selected data point is toggled and the element is passed as an argument to the
 * consumer in the callback, to execute once the popup is closed.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 * @private
 * @param {Object} value - data point object
 * @param {number} index - data point index for the set
 * @param {Object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const dataPointActionHandler = (value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(target).call((selectedTarget) =>
        value.onClick(
            () => selectedTarget.attr("aria-hidden", true),
            value.key,
            index,
            value,
            selectedTarget
        )
    );
};
/**
 * Checks if the data-set is currently shown in the graph or if the y data-point value is null
 * If they are, then true. False, otherwise
 * @private
 * @param {Object} shownTargets - graph targets config object
 * @param {object} value - data point value object
 * @returns {boolean} true if data point needs to be hidden, false otherwise
 */
const shouldHideDataPoints = (shownTargets, value) =>
    shownTargets.indexOf(value.key) < 0 || value.y === null;
/**
 * Renders the data point in the provided path element.
 * It uses the consumer opted Shape, color of the data point.
 * Behavior when clicked on the data point etc.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {SVGElement} path - svg Path element
 * @param {Object} dataPoint - data point properties such as shape, color and onClick callback function
 * @returns {Object} - d3 selection object
 */
const renderDataPointPath = (scale, config, path, dataPoint) =>
    path
        .classed(styles.point, true)
        .attr("d", new Shape(getShape(dataPoint)).getPathDescription())
        .attr("transform", transformPoint(scale, config))
        .attr(
            "style",
            `fill: ${getColorForTarget(dataPoint)}${
                shouldHideDataPoints(config.shownTargets, dataPoint)
                    ? "; display: none;"
                    : ";"
            }`
        )
        .attr("aria-hidden", false)
        .attr("aria-describedby", dataPoint.key)
        .on("click", function(value, index) {
            dataPointActionHandler(value, index, this);
        });
/**
 * Renders the circle svg element which shows up when clicked on the data point.
 * It is hidden by default and toggled visible onClick.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {SVGElement} path - svg circle element
 * @param {Object} dataPoint - data point properties such as shape, color and onClick callback function
 * @returns {Object} - d3 selection object
 */
const renderSelectionPath = (scale, config, path, dataPoint) =>
    path
        .classed(styles.dataPointSelection, true)
        .attr("d", new Shape(getShape(dataPoint)).getPathDescription())
        .attr("transform", transformPoint(scale, config))
        .attr("r", constants.DEFAULT_SELECTED_RADIUS)
        .attr(
            "style",
            `${
                shouldHideDataPoints(config.shownTargets, dataPoint)
                    ? "display: none;"
                    : ""
            }`
        )
        .attr("aria-hidden", true)
        .attr("aria-describedby", dataPoint.key)
        .on("click", function(value, index) {
            dataPointActionHandler(value, index, this);
        });
/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, shape, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of the canvas
 * @returns {Object} - d3 append object
 */
const drawDataPoints = (scale, config, canvasSVG) =>
    canvasSVG
        .append("g")
        .classed(styles.pointGroup, true)
        .each(function(dataPoint) {
            const dataPointSVG = d3.select(this);
            renderSelectionPath(
                scale,
                config,
                dataPointSVG.append(constants.DEFAULT_SHAPE),
                dataPoint
            );
            renderDataPointPath(
                scale,
                config,
                dataPointSVG.append("path"),
                dataPoint
            );
        });
/**
 * Renders the action items for a track. The data points provided are of ISO8601 datetime format
 * They are dependent on a unique key which needs to match the legend id's provided when initializing
 * the gantt chart.
 * @private
 * @param {Object} scale - d3 scale for Graph
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Object} ganttContentContainerPath - Container for gantt chart's contents (Tracks)
 * @param {Object} dataTarget - Data point values and their properties for each action item
 * @returns {undefined} - returns nothing
 */
const drawActionDataPoints = (
    scale,
    config,
    ganttContentContainerPath,
    dataTarget
) => {
    const currentPointsPath = ganttContentContainerPath
        .append("g")
        .classed(styles.currentPointsGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition()})`
        );
    const pointPath = currentPointsPath
        .selectAll(`.${styles.point}`)
        .data(dataTarget);
    drawDataPoints(scale, config, pointPath.enter());
    pointPath
        .exit()
        .transition(constants.d3Transition)
        .remove();
};
/**
 * Creates an element container with data points from the input JSON property: action
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPathSVG - Track container element
 * @param {Object} trackLabel - Track label
 * @param {Object} actions - input JSON for creating an action
 * @returns {undefined} - returns nothing
 */
export const loadActions = (graphContext, trackPathSVG, trackLabel, actions) =>
    actions.forEach((a) => {
        drawActionDataPoints(
            graphContext.scale,
            graphContext.config,
            trackPathSVG,
            processActionItems(
                graphContext.config,
                trackLabel,
                loadActionInput(a)
            )
        );
    });
/**
 * Selects all the data point groups from the track and removes them
 * @private
 * @param {Object} graphContext - Gantt instance
 * @param {Object} trackPathSVG - Track container element
 * @returns {Selection} - track container element
 */
export const unloadActions = (graphContext, trackPathSVG) =>
    trackPathSVG.selectAll(`g.${styles.currentPointsGroup}`).remove();
