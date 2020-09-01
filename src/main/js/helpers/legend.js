/**
 * @module legend
 * @alias module:legend
 */

"use strict";
import * as d3 from "d3";
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
import { getDefaultValue } from "../core/BaseConfig";
import { getStrokeDashArray } from "../core/BaseConfig/helper";

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
 * Hide legend when legend item has no data and showElement is set to false
 *
 * @private
 * @param {object} input item object processed from the input JSON
 * @returns {string} returns "none" if legend is to be hidden otherwise returns empty string
 */
const legendDisplayStyle = (input) =>
    input.legendOptions &&
    input.legendOptions.showElement === false &&
    utils.isEmptyArray(input.values)
        ? "none"
        : "";
/**
 * Loads the legend items. The values are taken from the Labels property of the input JSON
 * The click and the hover events are only registered when there are datapoints matching the
 * unique ids or have the isDisabled flag turned off.
 *
 * @param {object} legendSVG - d3 element path of the legend from the parent control
 * @param {object} t - input item object processed from the input JSON
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} eventHandlers - Callback function object executed when legend item is clicked or hovered.
 * Contains click and hover handlers as object property
 * @returns {object} returns the d3 element path for the legend
 */
const loadLegendItem = (legendSVG, t, config, eventHandlers) => {
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
    const index = config.shownTargets.indexOf(t.key);
    const shouldForceDisableLegendItem =
        !!t.label.isDisabled || utils.isEmptyArray(t.values);
    const itemPath = legendSVG
        .append("li")
        .classed(styles.legendItem, true)
        .attr("aria-current", shouldForceDisableLegendItem || index > -1)
        .attr("aria-disabled", shouldForceDisableLegendItem)
        .style("display", legendDisplayStyle(t))
        .attr("role", "listitem")
        .attr("aria-labelledby", text)
        .attr("aria-describedby", t.key)
        .style("margin", config.legendPadding.hasCustomLegendPadding && 0)
        .style(
            "padding",
            `${config.legendPadding.top}px ${config.legendPadding.right}px ${config.legendPadding.bottom}px ${config.legendPadding.left}px`
        );
    if (!shouldForceDisableLegendItem && index > -1) {
        itemPath
            .on("click", function () {
                return eventHandlers.clickHandler(this, t);
            })
            .on("mouseenter", () =>
                eventHandlers.hoverHandler(t, constants.HOVER_EVENT.MOUSE_ENTER)
            )
            .on("mouseleave", () =>
                eventHandlers.hoverHandler(t, constants.HOVER_EVENT.MOUSE_EXIT)
            );
    }
    const buttonPath = itemPath
        .append("button")
        .classed(styles.legendItemBtn, true)
        .attr("title", text)
        .attr("tabindex", shouldForceDisableLegendItem ? -1 : 0)
        .append("span")
        .attr("class", styles.legendItemSpan);

    processLegendOptions(buttonPath, t);

    itemPath
        .append("label")
        .classed(styles.legendItemText, true)
        .attr("tabindex", -1)
        .text(text);
    return legendSVG;
};

/**
 * Creates legend button content based on legend options
 *
 * @private
 * @param {object} buttonPath - d3 svg object
 * @param {object} input - input item object processed from the input JSON
 */
const processLegendOptions = (buttonPath, input) => {
    if (input.legendOptions) {
        // Create a legend icon only if the showShape is true
        if (input.legendOptions.showShape) {
            createLegendIcon(buttonPath, input);
        }
        if (input.legendOptions.showLine) {
            createLegendLine(buttonPath, input);
        }
    } else {
        createLegendIcon(buttonPath, input);
    }
};

/**
 * Creates an icon in the legend button
 *
 * @private
 * @param {object} buttonPath - d3 svg object
 * @param {object} input - input item object processed from the input JSON
 * @returns {object} returns the d3 element path for the legend
 */
const createLegendIcon = (buttonPath, input) =>
    buttonPath.append(() =>
        new Shape(getShapeForTarget(input)).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.legendItemIcon,
                svgStyles: `fill: ${getColorForTarget(input)};`
            }),
            true
        )
    );

/**
 * Creates a line in the legend button
 *
 * @private
 * @param {object} buttonPath - d3 svg object
 * @param {object} t - input item object processed from the input JSON
 */
const createLegendLine = (buttonPath, t) => {
    const { legendOptions } = t;
    const svg = buttonPath
        .append("svg")
        .classed(
            legendOptions.showShape
                ? styles.legendItemLineWithIcon
                : styles.legendItemLine,
            true
        );
    svg.append("line") // creating white line
        .attr("x2", constants.DEFAULT_LEGEND_LINE_WIDTH)
        .classed(styles.legendItemWhiteLine, true);
    svg.append("line")
        .attr("x1", 1)
        .attr(
            "x2",
            legendOptions.showShape
                ? constants.DEFAULT_LEGEND_LINE_WIDTH_WITH_SYMBOL - 1
                : constants.DEFAULT_LEGEND_LINE_WIDTH - 1
        )
        .attr("y1", constants.LEGEND_LINE_POSITION)
        .attr("y2", constants.LEGEND_LINE_POSITION)
        .attr(
            "style",
            `stroke: ${getColorForTarget(t)};
            stroke-dasharray: ${legendOptions.style.strokeDashArray};
            stroke-width: 1px;`
        );
};
/**
 * Removes the legend item from legend SVG in the graph
 *
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
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} container - d3 Container svg
 * @returns {object} - d3 svg object
 */
const createLegend = (config, container) =>
    container
        .append("ul")
        .classed(styles.legend, true)
        .attr("role", "list")
        .style("flex-direction", config.bindLegendTo && "column");
/**
 * Returns a boolean after checking the attribute `aria-current`.
 *
 * @param {HTMLElement} target - d3 svg object
 * @returns {boolean} - returns boolean
 */
const isLegendSelected = (target) => target.attr("aria-current") !== "true";
/**
 * Handler that will need to be called when a legend item is clicked along
 * with any other operations that will be need to taken care of by the parent
 * control.
 *
 * @param {HTMLElement} element - d3 element of the legend item clicked
 * @returns {object} - d3 svg object
 */
const legendClickHandler = (element) => {
    const target = d3.select(element);
    return target.attr("aria-current", isLegendSelected(target));
};
/**
 * Hover handler for legend items.
 *
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
 * @param {object} legendSVG - d3 element path of the legend from the parent control
 * @param {object} dataTarget - input item object processed from the input JSON
 * @param {Function} hoverHandler - Callback function to be called when hovered over the legend item
 * @param {object} config - Graph config object derived from input JSON
 * @returns {undefined} returns nothing
 */
const loadPieLegendItem = (legendSVG, dataTarget, { hoverHandler }, config) => {
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
        .attr("aria-describedby", dataTarget.key)
        .style("margin", config.legendPadding.hasCustomLegendPadding && 0)
        .style(
            "padding",
            `${config.legendPadding.top}px ${config.legendPadding.right}px ${config.legendPadding.bottom}px ${config.legendPadding.left}px`
        );
    itemPath.append(() =>
        new Shape(getShapeForTarget(dataTarget)).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.pieLegendItemIcon,
                svgStyles: `fill: ${getColorForTarget(dataTarget)};`
            }),
            true
        )
    );
    itemPath.append("label").classed(styles.legendItemText, true).text(text);
    itemPath
        .on("mouseenter", () =>
            hoverHandler(dataTarget, constants.HOVER_EVENT.MOUSE_ENTER)
        )
        .on("mouseleave", () =>
            hoverHandler(dataTarget, constants.HOVER_EVENT.MOUSE_EXIT)
        );
};
/**
 * Validate and return the legendOptions property
 *
 * @param {object} graphConfig - config object of Graph API
 * @param {object} dataTarget - Data points object
 * @returns {object} legendOptions - legendOptions for the legend
 */
const getDefaultLegendOptions = (graphConfig, dataTarget) => {
    const legendOptions = getDefaultValue(dataTarget.legendOptions, {
        showShape: true,
        showLine: false,
        showElement: true
    });
    legendOptions.showShape = getDefaultValue(legendOptions.showShape, true);
    legendOptions.showLine = getDefaultValue(legendOptions.showLine, false);
    legendOptions.showElement = getDefaultValue(
        legendOptions.showElement,
        true
    );
    legendOptions.style = getDefaultValue(legendOptions.style, {});
    legendOptions.style = {
        strokeDashArray: getStrokeDashArray(legendOptions.style)
    };

    return legendOptions;
};
/**
 * Helper function to set the right legend padding values based on input JSON.
 *
 * @param {object} config - config which needs to be updated
 * @param {object} inputLegendPadding - input legend padding provided via input JSON.
 * @returns {object} - padding for Legend
 */
const getLegendPadding = (config, inputLegendPadding) => {
    // If legendPadding is provided, update the config object with the provided values, else update it with the default constants
    if (utils.isDefined(config.legendPadding)) {
        return {
            top: getDefaultValue(
                inputLegendPadding.top,
                constants.LEGEND_PADDING.top
            ),
            bottom: getDefaultValue(
                inputLegendPadding.bottom,
                constants.LEGEND_PADDING.bottom
            ),
            right: getDefaultValue(
                inputLegendPadding.right,
                constants.LEGEND_PADDING.right
            ),
            left: getDefaultValue(
                inputLegendPadding.left,
                constants.LEGEND_PADDING.left
            ),
            hasCustomLegendPadding: true
        };
    } else {
        return {
            top: constants.LEGEND_PADDING.top,
            bottom: constants.LEGEND_PADDING.bottom,
            right: constants.LEGEND_PADDING.right,
            left: constants.LEGEND_PADDING.left,
            hasCustomLegendPadding: false
        };
    }
};

/**
 * Updates the legend during reflow.
 *
 * @private
 * @param {object} legendSVG - d3 element path of the legend from the parent control
 * @param {object} legend - input item object processed from the input JSON
 * @param {object} graph - Graph object derived from input JSON
 * @param {object} eventHandlers - Callback function object executed when legend item is clicked or hovered.
 * Contains click and hover handlers as object property
 * @returns {object} returns the d3 element path for the legend
 */
const reflowLegend = (legendSVG, legend, graph, eventHandlers) => {
    const index = graph.config.shownTargets.indexOf(legend.key);
    const shouldForceDisableLegendItem =
        !!legend.label.isDisabled || utils.isEmptyArray(legend.values);
    const itemPath = legendSVG
        .select(`li[aria-describedby="${legend.key}"]`)
        .attr("aria-current", shouldForceDisableLegendItem || index > -1)
        .attr("aria-disabled", shouldForceDisableLegendItem)
        .style("display", legendDisplayStyle(legend));

    if (!shouldForceDisableLegendItem) {
        // set the click and hover handler, when legend have values
        itemPath
            .on("click", function () {
                return eventHandlers.clickHandler(this, legend);
            })
            .on("mouseenter", () =>
                eventHandlers.hoverHandler(legend, constants.HOVER_EVENT.MOUSE_ENTER)
            )
            .on("mouseleave", () =>
                eventHandlers.hoverHandler(legend, constants.HOVER_EVENT.MOUSE_EXIT)
            );
    } else {
        // set the click and hover handler to null, when legend doesnot have any value
        itemPath
            .on("click", () => null)
            .on("mouseenter", () => null)
            .on("mouseleave", () => null);
    }
    return legendSVG;
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
    legendHoverHandler,
    isLegendSelected,
    getDefaultLegendOptions,
    getLegendPadding,
    reflowLegend
};
