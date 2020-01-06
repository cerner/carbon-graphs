"use strict";
import * as d3 from "d3";
import constants from "../../../helpers/constants";
import { loadPieLegendItem } from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    attachEventHandlers,
    d3RemoveElement,
    detachEventHandlers,
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";

/**
 * Calculates the height for graph
 * Height and Width are proportionally same for Pie to account for equal circumference
 * within the svg square
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {number} dimension - number in pixels for height
 * @returns {number} Height for the axes
 */
const determineHeight = (config, dimension) => {
    if (dimension.height) {
        return dimension.height;
    }
    return constants.PIE_CHART_DEFAULT_HEIGHT;
};
/**
 * Creates the d3 pie layout for creating the pie chart.
 *
 * @private
 * @returns {Function} d3 function that decides which pie should go where in the graph.
 */
const createPieLayout = () => d3.pie().value((d) => d.value);
/**
 * Creates an arc based on the pie chart radius
 *
 * @private
 * @param {number} r - Radius of the pie chart.
 * @returns {Function} d3.arc function that would calculate the arc for each pie value
 */
const createArc = (r) =>
    d3
        .arc()
        .innerRadius(constants.DEFAULT_PIE_INNER_RADIUS)
        .outerRadius(r)
        .padAngle(constants.DEFAULT_PIE_PAD_ANGLE);
/**
 * Added defs element for the canvas. This currently holds the clip paths for the entire chart.
 * Clip path rectangle has the same width and height, making it a square within with we
 * will house the circle.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.Selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const createDefs = (config, canvasSVG) =>
    canvasSVG
        .append("defs")
        .append("clipPath")
        .attr("id", config.clipPathId)
        .append("rect")
        .attr(constants.X_AXIS, 0)
        .attr(constants.Y_AXIS, 0)
        .attr("width", config.height)
        .attr("height", config.height);
/**
 * Creates a container for pie graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const createPieContentContainer = (config, canvasSVG) =>
    canvasSVG
        .append("g")
        .classed(styles.pieChartContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`);
/**
 * Creates a group for each pie content loaded
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {object} contentConfig - content config object
 * @param {object} dataTarget - Pie data object
 * @returns {object} d3 svg path
 */
const createPieContentGroup = (
    config,
    canvasSVG,
    legendPath,
    contentConfig,
    dataTarget
) =>
    canvasSVG
        .append("g")
        .classed(styles.pieContentGroup, true)
        .attr(
            "transform",
            `translate(${config.canvasRadius},${config.canvasRadius})`
        )
        .attr("aria-labelledby", contentConfig.label.display)
        .attr("aria-describedby", contentConfig.key)
        .attr("aria-disabled", !utils.isFunction(dataTarget.onClick))
        .attr("aria-selected", false)
        .on("click", function(value, index) {
            sliceClickActionHandler(legendPath, value, index, this);
        })
        .on("mouseenter", function(value) {
            sliceHoverActionHandler(
                legendPath,
                this,
                value.key,
                constants.HOVER_EVENT.MOUSE_ENTER
            );
        })
        .on("mouseleave", function(value) {
            sliceHoverActionHandler(
                legendPath,
                this,
                value.key,
                constants.HOVER_EVENT.MOUSE_EXIT
            );
        });
/**
 * Draws the slice with options opted in the input JSON by the consumer for each data set.
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} contentSVG - d3 html element of the canvas
 * @returns {object} d3 svg path
 */
const createSlice = (config, contentSVG) =>
    contentSVG.append("g").classed(styles.pieContentSlice, true);
/**
 * Gets all the slices given a reference slice within the pie chart
 *
 * @private
 * @param {HTMLElement} target - DOM element of the data point clicked
 * @returns {Array} List of slice group in a pie chart
 */
const getAllSliceNodes = (target) =>
    d3.select(target.parentNode).selectAll(`.${styles.pieContentGroup}`);
/**
 * Enforce selected state for a slice when clicked on.
 * This is only available when onClick function is provided.
 *
 * @private
 * @param {Array} nodes - List of d3.selection objects that are slices of pie chart
 * @param {string} selectedKey - Unique id of the slice clicked on
 * @returns {Array} d3.selection objects of slices with aria-selected toggled
 */
const enforceSliceSelection = (nodes, selectedKey) =>
    nodes.each(function() {
        const node = d3.select(this);
        node.attr(
            "aria-selected",
            node.attr("aria-describedby") === selectedKey
        );
    });
/**
 * Enforces blur state for all the slices that is not the one hovered on.
 * This is provided regardless of whether onClick is present or not.
 *
 * @private
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {Array} nodes - List of d3.selection objects that are slices of pie chart
 * @param {string} selectedKey - Unique id of the slice clicked on
 * @returns {undefined} - returns nothing
 */
const enforceSliceBlur = (legendPath, nodes, selectedKey) => {
    legendPath
        .select(`.${styles.pieLegendItem}[aria-describedby="${selectedKey}"]`)
        .classed(styles.pieLegendItemSliceHover, true);
    nodes.each(function() {
        const node = d3.select(this);
        node.classed(
            styles.blur,
            node.attr("aria-describedby") !== selectedKey
        );
    });
};
/**
 * Removes the selection from the slice and sets aria-selected for all slices as false
 *
 * @private
 * @param {Array} nodes - List of d3.selection objects that are slices of pie charts
 * @returns {Array} d3.selection objects of slices with aria-selected set to false
 */
const removeSliceSelection = (nodes) =>
    nodes.each(function() {
        const node = d3.select(this);
        node.attr("aria-selected", false);
    });
/**
 * Removes the carbon-blur style from all the slices to unblur the pie chart
 *
 * @private
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {Array} nodes - List of d3.selection objects that are slices of pie chart
 * @returns {undefined} - returns nothing
 */
const removeSliceBlur = (legendPath, nodes) => {
    legendPath
        .selectAll(`.${styles.pieLegendItem}`)
        .classed(styles.pieLegendItemSliceHover, false);
    nodes.each(function() {
        const node = d3.select(this);
        node.classed(styles.blur, false);
    });
};
/**
 * Toggles the selection of a dateline indicator, executes on click of a data point.
 *
 * @private
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {HTMLElement} target - DOM element of the data point clicked
 * @param {string} selectedKey - unique key of the selected slice
 * @returns {d3.selection} d3 html element of the selected point
 */
const toggleSliceSelection = (legendPath, target, selectedKey) => {
    const allSliceNodes = getAllSliceNodes(target);
    enforceSliceBlur(legendPath, allSliceNodes, selectedKey);
    enforceSliceSelection(allSliceNodes, selectedKey);
    return d3.select(target);
};
/**
 * Handler for the slice that is hovered on. It blurs all other slices in the pie chart.
 *
 * @private
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {HTMLElement} target - Target element slice hovered on
 * @param {string} key - Unique id of the target slice
 * @param {string} hoverState - Mouse over or Mouse out
 * @returns {undefined} - returns nothing
 */
const sliceHoverActionHandler = (legendPath, target, key, hoverState) => {
    const allSliceNodes = getAllSliceNodes(target);
    if (hoverState === constants.HOVER_EVENT.MOUSE_ENTER) {
        enforceSliceBlur(legendPath, allSliceNodes, key);
    } else {
        // Check if the click action is executed, only remove blur otherwise
        if (d3.select(target).attr("aria-selected") === "true") {
            return;
        }
        removeSliceBlur(legendPath, allSliceNodes);
    }
};
/**
 * Handler for the slice on click. If the content property is present for the data point
 * then the callback is executed other wise it is NOP.
 * If the callback is present, the selected data point is toggled and the element is passed as an argument to the
 * consumer in the callback, to execute once the popup is closed.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 *
 * @private
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {HTMLElement} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const sliceClickActionHandler = (legendPath, value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleSliceSelection(legendPath, target, value.key).call((selectedTarget) =>
        value.onClick(
            () => {
                removeSliceBlur(legendPath, getAllSliceNodes(target));
                removeSliceSelection(getAllSliceNodes(target));
            },
            value.key,
            index,
            value,
            selectedTarget
        )
    );
};
/**
 * Hover handler for legend item. Highlights current line and blurs the rest of the targets in Graph
 * if present.
 *
 * @private
 * @param {d3.selection} legendPath - d3 element that will be need to render the legend
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles hover action on legend item
 */
const hoverHandler = (legendPath, canvasSVG) => (item, state) => {
    const allSliceNodes = canvasSVG.selectAll(`.${styles.pieContentGroup}`);
    if (state === constants.HOVER_EVENT.MOUSE_ENTER) {
        enforceSliceBlur(legendPath, allSliceNodes, item.key);
    } else {
        removeSliceBlur(legendPath, allSliceNodes);
    }
};
/**
 * A callback that will be sent to Pie Construct class so that when graph is
 * created the Construct will execute this callback function and the legend
 * items are loaded.
 *
 * @private
 * @param {object} dataTarget - Data points object
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} legendSVG - d3 element that will be need to render the legend
 * items into.
 * @returns {undefined} - returns nothing
 */
const prepareLegendItems = (dataTarget, canvasSVG, legendSVG) => {
    if (legendSVG) {
        loadPieLegendItem(legendSVG, dataTarget, {
            hoverHandler: hoverHandler(legendSVG, canvasSVG)
        });
    }
};
/**
 * CLear the graph data points and lines currently rendered
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} dataTarget - Data points object
 * @returns {object} - d3 select object
 */
const clear = (canvasSVG, dataTarget) =>
    d3RemoveElement(canvasSVG, `g[aria-describedby="${dataTarget.key}"]`);

export {
    createPieLayout,
    createArc,
    createDefs,
    createPieContentContainer,
    createPieContentGroup,
    createSlice,
    prepareLegendItems,
    determineHeight,
    getShapeForTarget,
    getColorForTarget,
    attachEventHandlers,
    detachEventHandlers,
    clear
};
