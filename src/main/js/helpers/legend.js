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
import errors from "../helpers/errors";
import styles from "../helpers/styles";
import utils from "../helpers/utils";

/**
 * Validates legend label
 *
 * @private
 * @throws {module:errors.THROW_MSG_LEGEND_LABEL_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_LEGEND_LABEL_FORMAT_NOT_PROVIDED}
 * @param {object} label - label object
 * @returns {undefined} returns nothing
 */
const validateLegendLabel = (label) => {
    if (!label) {
        throw new Error(errors.THROW_MSG_LEGEND_LABEL_NOT_PROVIDED);
    }
    if (utils.isDefined(label.format) && !utils.isFunction(label.format)) {
        throw new Error(errors.THROW_MSG_LEGEND_LABEL_FORMAT_NOT_PROVIDED);
    }
};
/**
 * Returns the sanitized legend item display string
 *
 * @private
 * @param {string} text - legend display string
 * @returns {string} Sanitized text
 */
const getText = (text) => utils.sanitize(text);
/**
 * Loads the legend items. The values are taken from the Labels property of the input JSON
 * The click and the hover events are only registered when there are datapoints matching the
 * unique ids or have the isDisabled flag turned off.
 *
 * @private
 * @param {object} legendSVG - d3 element path of the legend from the parent control
 * @param {object} t - input item object processed from the input JSON
 * @param {object} shownTargets - Currently shown targets in the graph, once the legend item is
 * clicked the item corresponding to the legend in the graph will be removed.
 * @param {object} eventHandlers - Callback function object executed when legend item is clicked or hovered.
 * Contains click and hover handlers as object property
 * @returns {object} returns the d3 element path for the legend
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
    validateLegendLabel(t.label);
    const text = getText(t.label.display);
    const index = shownTargets.indexOf(t.key);
    const shouldForceDisableLegendItem =
        !!t.label.isDisabled || utils.isEmptyArray(t.values);
    const itemPath = legendSVG
        .append("li")
        .classed(styles.legendItem, true)
        .attr("aria-selected", shouldForceDisableLegendItem || index > -1)
        .attr("aria-disabled", shouldForceDisableLegendItem)
        .attr("role", "listitem")
        .attr("aria-labelledby", text)
        .attr("aria-describedby", t.key);
    if (!shouldForceDisableLegendItem && index > -1) {
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
        .attr("tabindex", shouldForceDisableLegendItem ? -1 : 0)
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
 *
 * @private
 * @param {object} legendSVG - d3 svg object
 * @param {object} dataTarget - Data points object
 * @returns {object} - d3 svg object
 */
const removeLegendItem = (legendSVG, dataTarget) =>
    d3RemoveElement(legendSVG, `li[aria-describedby="${dataTarget.key}"]`);
/**
 * Creates the legend item list and appends into the container. The container consists of
 * the canvas which houses the graph itself, and the legend <ul> which contains the list of data points labels and
 * their respective shapes.
 * Only if showLegend is enabled.
 *
 * @private
 * @param {object} container - d3 Container svg
 * @returns {object} - d3 svg object
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
 *
 * @private
 * @param {HTMLElement} element - d3 element of the legend item clicked
 * @returns {object} - d3 svg object
 */
const legendClickHandler = (element) => {
    const target = d3.select(element);
    const isSelected = target.attr("aria-selected");
    return target.attr("aria-selected", isSelected !== "true");
};
/**
 * Hover handler for legend items.
 *
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
 * Constructs a legend text based on the display string, value.
 * If formatter function is provided by the consumer then that function will be called.
 *
 * @private
 * @param {string} display - legend item display string
 * @param {number} value - pie slice value
 * @param {Function} format - formatter callback function provided by the consumer
 * @returns {string} - A string that will be used in the legend item
 */
const getPieLegendText = (display, value, format) => {
    if (format) {
        return format(display, value);
    }
    return `${getText(display)}: ${value}`;
};
/**
 * Pie chart legend items are non-clickable and they react only to hover or click
 * performed on any of a slice in pie chart itself or hovered over a legend item.
 *
 * @private
 * @param {object} legendSVG - d3 element path of the legend from the parent control
 * @param {object} dataTarget - input item object processed from the input JSON
 * @param {Function} hoverHandler - Callback function to be called when hovered over the legend item
 * @returns {undefined} returns nothing
 */
const loadPieLegendItem = (legendSVG, dataTarget, { hoverHandler }) => {
    validateLegendLabel(dataTarget.label);
    const text = getPieLegendText(
        dataTarget.label.display,
        dataTarget.value,
        dataTarget.label.format
    );
    const itemPath = legendSVG
        .append("li")
        .classed(styles.pieLegendItem, true)
        .attr("role", "listitem")
        .attr("tabindex", 0)
        .attr("aria-labelledby", text)
        .attr("aria-describedby", dataTarget.key);
    itemPath.append(() =>
        new Shape(getShapeForTarget(dataTarget)).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.pieLegendItemIcon,
                svgStyles: `fill: ${getColorForTarget(dataTarget)};`
            }),
            true
        )
    );
    itemPath
        .append("label")
        .classed(styles.legendItemText, true)
        .text(text);
    itemPath
        .on("mouseenter", () =>
            hoverHandler(dataTarget, constants.HOVER_EVENT.MOUSE_ENTER)
        )
        .on("mouseleave", () =>
            hoverHandler(dataTarget, constants.HOVER_EVENT.MOUSE_EXIT)
        );
};

/**
 * @enum {Function}
 */
export {
    createLegend,
    loadLegendItem,
    loadPieLegendItem,
    removeLegendItem,
    legendClickHandler,
    legendHoverHandler
};
