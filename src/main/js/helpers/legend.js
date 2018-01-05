/**
 * @module legend
 * @alias module:legend
 */
"use strict";
import d3 from "d3";
import { isBuiltAsAPathSymbol } from "../core/Graph/helpers";
import Symbol, { isNativeSymbol } from "../core/Symbol";
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
        throw "Invalid Argument: eventHandlers needs a clickHandler callback function";
    }
    if (!utils.isFunction(eventHandlers.hoverHandler)) {
        throw "Invalid Argument: eventHandlers needs a hoverHandler callback function";
    }
    if (!t.label) {
        return null;
    }
    const symbol = t.symbol;
    const isInBuilt = isBuiltAsAPathSymbol(t);
    const color = t.color;
    const text = utils.sanitize(t.label.display);
    const index = shownTargets.indexOf(t.key);
    const cx = 5.5;
    const cy = 6.5;
    const itemPath = legendSVG.append("li")
                              .classed(styles.legendItem, true)
                              .attr("aria-selected", (!t.label.isDisabled && index > -1))
                              .attr("role", "listitem")
                              .attr("aria-labelledby", text)
                              .attr("aria-describedby", t.key);
    if (!t.label.isDisabled && index > -1) {
        itemPath.on("click", function() {
                    return eventHandlers.clickHandler(this, t);
                })
                .on("mouseenter", () => eventHandlers.hoverHandler(t, constants.HOVER_EVENT.MOUSE_ENTER))
                .on("mouseleave", () => eventHandlers.hoverHandler(t, constants.HOVER_EVENT.MOUSE_EXIT));
    }
    const buttonPath = itemPath.append("button")
                               .classed(styles.legendItemBtn, true)
                               .attr("tabindex", 0);
    const iconPath = buttonPath.append("svg")
                               .classed(styles.legendItemIcon, true)
                               .attr("role", "img")
                               .attr("viewBox", constants.LEGEND_ICON_SIZE);
    iconPath.append("path")
            .attr("d", () => new Symbol(isInBuilt).getPathElement(constants.DEFAULT_PLOT_LEGEND_SIZE))
            .attr("transform", () => {
                const scaleFactor = isNativeSymbol(symbol) ? constants.DEFAULT_PLOT_LEGEND_SCALE : 1;
                return `translate(${cx},${cy}) scale(${scaleFactor})`;
            })
            .attr("style", `fill: ${color}`);
    itemPath.append("span")
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
const removeLegendItem = (legendSVG, dataTarget) => legendSVG ? legendSVG.select(`li[aria-describedby="${dataTarget.key}"]`).remove() : "";

/**
 * Creates the legend item list and appends into the container. The container consists of
 * the canvas which houses the graph itself, and the legend <ul> which contains the list of data points labels and
 * their respective symbols.
 * Only if showLegend is enabled.
 * @private
 * @param {container} container - Container
 * @returns {Object} - d3 svg object
 */
const createLegend = (container) => container.append("ul")
                                             .classed(styles.legend, true)
                                             .attr("role", "list");
/**
 * Handler that will need to be called when a legend item is clicked along
 * with any other operations that will be need to taken care of by the parent
 * control.
 * @private
 * @param {HTMLElement} element - d3 element of the legend item clicked
 * @returns {undefined} - returns nothing
 */
const legendClickHandler = (element) => {
    const target = d3.select(element);
    const isSelected = target.attr("aria-selected");
    return target.attr("aria-selected", isSelected !== "true");
};
/**
 * Hover handler for legend items.
 * @private
 * @returns {undefined} - returns nothing
 */
const legendHoverHandler = () => {
    /* NOP for now, entry point for future development */
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
