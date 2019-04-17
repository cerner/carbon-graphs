/**
 * @module legend
 * @alias module:legend
 */

"use strict";
import d3 from "d3";
import {
    d3RemoveElement,
    getColorForTarget,
    getShapeForTarget
} from "../controls/Graph/helpers/helpers";
import { Shape } from "../core";
import { getDefaultSVGProps } from "../core/Shape";
import constants from "../helpers/constants";
import styles from "../helpers/styles";
import utils from "../helpers/utils";

/**
 * Loads the legend items. The values are taken from the Labels property of the input JSON
 * The click and the hover events are only registered when there are datapoints matching the
 * unique ids or have the isDisabled flag turned off.
 * @private
 * @param {Object} legendSVG - d3 element path of the legend from the parent control
 * @param {Object} t - input item object processed from the input JSON
 * @param {Object} shownTargets - Currently shown targets in the graph, once the legend item is
 * clicked the item corresponding to the legend in the graph will be removed.
 * @param {Object} eventHandlers - Callback function object executed when legend item is clicked or hovered.
 * Contains click and hover handlers as object property
 * @returns {Object} returns the d3 element path for the legend
 */
const loadLegendItem = (legendSVG, t, shownTargets, eventHandlers) => {
    if (!utils.isFunction(eventHandlers.clickHandler)) {
        throw new Error(
            "Invalid Argument: eventHandlers needs a clickHandler callback function."
        );
    }
    if (!utils.isFunction(eventHandlers.hoverHandler)) {
        throw new Error(
            "Invalid Argument: eventHandlers needs a hoverHandler callback function."
        );
    }
    if (!t.label) {
        throw new Error("Invalid Argument: label needs to be a valid string.");
    }
    const text = utils.sanitize(t.label.display);
    const index = shownTargets.indexOf(t.key);
    const itemPath = legendSVG
        .append("li")
        .classed(styles.legendItem, true)
        .attr("aria-selected", !t.label.isDisabled && index > -1)
        .attr("aria-disabled", !!t.label.isDisabled)
        .attr("role", "listitem")
        .attr("aria-labelledby", text)
        .attr("aria-describedby", t.key);
    if (!t.label.isDisabled && index > -1) {
        itemPath
            .on("click", function() {
                return eventHandlers.clickHandler(this, t);
            })
            .on("mouseenter", () =>
                eventHandlers.hoverHandler(t, constants.HOVER_EVENT.MOUSE_ENTER)
            )
            .on("mouseleave", () =>
                eventHandlers.hoverHandler(t, constants.HOVER_EVENT.MOUSE_EXIT)
            );
    }
    itemPath
        .append("button")
        .classed(styles.legendItemBtn, true)
        .attr("tabindex", 0)
        .append(() =>
            new Shape(getShapeForTarget(t)).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: styles.legendItemIcon,
                    svgStyles: `fill: ${getColorForTarget(t)};`
                }),
                true
            )
        );
    itemPath
        .append("label")
        .classed(styles.legendItemText, true)
        .attr("tabindex", -1)
        .text(text);
    return legendSVG;
};
/**
 * Removes the legend item from legend SVG in the graph
 * @private
 * @param {Object} legendSVG - d3 svg object
 * @param {Object} dataTarget - Data points object
 * @returns {Object} - d3 svg object
 */
const removeLegendItem = (legendSVG, dataTarget) =>
    d3RemoveElement(legendSVG, `li[aria-describedby="${dataTarget.key}"]`);
/**
 * Creates the legend item list and appends into the container. The container consists of
 * the canvas which houses the graph itself, and the legend <ul> which contains the list of data points labels and
 * their respective shapes.
 * Only if showLegend is enabled.
 * @private
 * @param {Object} container - d3 Container svg
 * @returns {Object} - d3 svg object
 */
const createLegend = (container) =>
    container
        .append("ul")
        .classed(styles.legend, true)
        .attr("role", "list");
/**
 * Handler that will need to be called when a legend item is clicked along
 * with any other operations that will be need to taken care of by the parent
 * control.
 * @private
 * @param {HTMLElement} element - d3 element of the legend item clicked
 * @returns {Object} - d3 svg object
 */
const legendClickHandler = (element) => {
    const target = d3.select(element);
    const isSelected = target.attr("aria-selected");
    return target.attr("aria-selected", isSelected !== "true");
};
/**
 * Hover handler for legend items.
 * @private
 * @param {Array} shownTargets - Targets/data sets that are currently displayed in graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - Data points set unique key
 * @param {string} hoverState - state of mouse hover => enter or leave
 * @param {Array} [additionalHandlers] - Additional set of handlers that consumers can execute on
 * top of the base hover handler
 * @returns {undefined} - returns nothing
 */
const legendHoverHandler = (
    shownTargets,
    canvasSVG,
    key,
    hoverState,
    additionalHandlers = []
) => {
    // Blur everything except the item hovered
    shownTargets
        .filter((target) => target !== key)
        .forEach((k) => {
            // All Points
            canvasSVG
                .selectAll(`svg[aria-describedby="${k}"]`)
                .classed(
                    styles.blur,
                    hoverState === constants.HOVER_EVENT.MOUSE_ENTER
                );
            // All Lines
            canvasSVG
                .selectAll(`path[aria-describedby="${k}"]`)
                .classed(
                    styles.blur,
                    hoverState === constants.HOVER_EVENT.MOUSE_ENTER
                );
            canvasSVG
                .selectAll(`.${styles.pairedLine}`)
                .classed(
                    styles.blur,
                    hoverState === constants.HOVER_EVENT.MOUSE_ENTER
                );
            canvasSVG
                .selectAll(`rect[aria-describedby="${k}"]`)
                .classed(
                    styles.blur,
                    hoverState === constants.HOVER_EVENT.MOUSE_ENTER
                );
            canvasSVG
                .selectAll(
                    `.${styles.barGoalLine}[aria-describedby="region_${k}"]`
                )
                .attr(
                    "aria-hidden",
                    hoverState === constants.HOVER_EVENT.MOUSE_ENTER
                );
            canvasSVG
                .selectAll(`[aria-describedby="text_label_${k}"]`)
                .classed(
                    styles.blur,
                    hoverState === constants.HOVER_EVENT.MOUSE_ENTER
                );
            if (utils.notEmpty(additionalHandlers)) {
                additionalHandlers.forEach((fn) =>
                    fn(shownTargets, canvasSVG, key, hoverState, k)
                );
            }
        });
};

/**
 * @enum {Function}
 */
export {
    createLegend,
    loadLegendItem,
    removeLegendItem,
    legendClickHandler,
    legendHoverHandler
};
