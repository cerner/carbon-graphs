"use strict";
import * as d3 from "d3";
import { Shape } from "../../../core";
import { getDefaultSVGProps } from "../../../core/Shape";
import {
    getAxisLabelWidth,
    isXAxisOrientationTop
} from "../../../helpers/axis";
import constants, { AXIS_TYPE } from "../../../helpers/constants";
import { shouldTruncateLabel, truncateLabel } from "../../../helpers/label";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    d3RemoveElement,
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";
import { barAttributesHelper } from "./creationHelpers";

/**
 * Creates text labels based on input object provided. Text label can be one or many.
 *
 * @private
 * @param {object} bandScale - band scale object
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {object} canvasSVG - d3 object of canvas group svg
 * @param {Array} textLabelList - List of text labels
 * @param {string} uniqueKey - unique id of the content loaded in graph
 * @param {number} index - data point index
 * @returns {undefined} - returns nothing
 */
const createAxisInfoRowLabel = (
    bandScale,
    scale,
    config,
    canvasSVG,
    textLabelList,
    uniqueKey,
    index
) => {
    if (config.axis.x.type === AXIS_TYPE.TIME_SERIES) {
        textLabelList.x = utils.parseDateTime(textLabelList.x); // for time series
    }
    const attributeHelper = barAttributesHelper(scale, bandScale);
    const axisInfoRow = canvasSVG
        .select(`.${styles.axisInfoRow}`)
        .attr("aria-hidden", false)
        .datum(textLabelList.value)
        .append("g")
        .classed(styles.axisInfoRowItem, true)
        .attr("text-anchor", "middle")
        .attr(
            "transform",
            `translate(${getTextLabelsXPosition(
                attributeHelper,
                textLabelList
            )}, ${getTextLabelsYPosition(config)})`
        )
        .attr("aria-describedby", `text_label_${uniqueKey}`)
        .attr("aria-hidden", config.shownTargets.indexOf(uniqueKey) < 0);
    if (
        shouldTruncateLabel(
            textLabelList.value.label.display,
            textLabelList.value.characterCount
        ) ||
        (textLabelList.value.label.secondaryDisplay &&
            shouldTruncateLabel(
                textLabelList.value.label.secondaryDisplay,
                textLabelList.value.characterCount
            ))
    ) {
        axisInfoRow
            .attr(
                "aria-disabled",
                !utils.isFunction(textLabelList.value.onClick)
            )
            .on("click", (value) => {
                axisInfoRowActionHandler(
                    value,
                    index,
                    canvasSVG,
                    config.axis.x.type,
                    uniqueKey
                );
            });
    }
    if (utils.notEmpty(textLabelList.value.shape)) {
        axisInfoRow
            .append("g")
            .classed(styles.axisInfoRowIcon, true)
            .attr(
                "transform",
                `translate(${-(
                    getAxisLabelWidth(
                        getTextLabel(
                            textLabelList.value.label.display,
                            textLabelList.value.characterCount
                        )
                    ) / 2
                ) - constants.TEXT_LABEL_ICON_WIDTH_PADDING},
                ${-constants.TEXT_LABEL_ICON_HEIGHT_PADDING})`
            );
        addTextLabelIcon(axisInfoRow, config, textLabelList, uniqueKey);
    }
    addTextLabelString(axisInfoRow, config, textLabelList, uniqueKey);
};

/**
 * Handler for the text label on click.
 * If the callback is present, the selected text label is toggled and the element is passed as an argument to the
 * consumer in the callback, to execute once the popup is closed.
 *
 * @private
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {string} type - x-axis type
 * @param {string} uniqueKey - unique id of the content loaded in graph
 * @returns {undefined} - returns nothing
 */
const axisInfoRowActionHandler = (value, index, canvasSVG, type, uniqueKey) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(value, canvasSVG, type, uniqueKey, index).call(
        (selectedTarget) =>
            value.onClick(
                () => {
                    setOnSelectionAttributes(selectedTarget, false);
                },
                value,
                index,
                uniqueKey,
                selectedTarget
            )
    );
};

/**
 * Toggles the selection of a text label, executes on click of a text label.
 *
 * @private
 * @param {object} value - data point object
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {string} type - x-axis type
 * @param {string} uniqueKey - unique id of the content loaded in graph
 * @param {number} index - data point index
 * @returns {Array} d3 html element of the selected text label
 */
const toggleDataPointSelection = (value, canvasSVG, type, uniqueKey, index) => {
    const selectedPointNodes = canvasSVG.selectAll(
        `g[aria-describedby=text_label_${uniqueKey}]`
    );
    const selectedPointNode = d3.select(selectedPointNodes.nodes()[index]);
    const isSelected = selectedPointNode.attr("aria-selected") === "true";
    setOnSelectionAttributes(selectedPointNode, !isSelected);
    return selectedPointNode;
};
/**
 * sets selection axis info row label's aria-selected attribute
 *
 * @private
 * @param {object} selectionPath - selection axis info row label svg path
 * @param {boolean} isSelected - true if selected, false if not
 * @returns {undefined} - returns nothing
 */
const setOnSelectionAttributes = (selectionPath, isSelected) => {
    selectionPath.attr("aria-selected", isSelected);
};
/**
 * Adds the label strings to axis info row after truncation(if required).
 *
 * @private
 * @param {object} axisInfoRow - d3 object of axis info row group svg
 * @param {object} config - config object derived from input JSON
 * @param {Array} textLabelList - list of text labels
 * @returns {undefined} - returns nothing
 */
const addTextLabelString = (axisInfoRow, config, textLabelList) => {
    axisInfoRow
        .append("text")
        .classed(styles.axisInfoRowDisplay, true)
        .text(
            getTextLabel(
                textLabelList.value.label.display,
                textLabelList.value.characterCount
            )
        )
        .attr("style", `fill: ${textLabelList.value.color};`);
    if (textLabelList.value.label.secondaryDisplay) {
        axisInfoRow
            .append("text")
            .classed(styles.axisInfoRowSecondaryDisplay, true)
            .text(
                getTextLabel(
                    textLabelList.value.label.secondaryDisplay,
                    textLabelList.value.characterCount
                )
            )
            .attr(
                "dy",
                isXAxisOrientationTop(config.axis.x.orientation)
                    ? config.axisLabelHeights.x
                    : -config.axisLabelHeights.x
            );
    }
};

/**
 * Truncates the label string to the character count provided, by default the label will not be truncated
 *
 * @private
 * @param {string} label - axis info row label
 * @param {number} characterCount - Maximum character length before truncation
 * @returns {string} A truncated string with ellipsis
 */
const getTextLabel = (label, characterCount) =>
    shouldTruncateLabel(label, characterCount)
        ? truncateLabel(label, characterCount)
        : label;

/**
 * X position for the text label
 *
 * @private
 * @param {object} attributeHelper - contains methods for calculating x, y, height, width.
 * @param {Array} textLabelList - list of text labels
 * @param {number} index - data point index
 * @returns {number} X position for the text label
 */
const getTextLabelsXPosition = (attributeHelper, textLabelList, index) =>
    utils.isDefined(index) && index < textLabelList.length
        ? attributeHelper.x(textLabelList[index]) + attributeHelper.width() / 2
        : attributeHelper.x(textLabelList) + attributeHelper.width() / 2;

/**
 * Y position for the text label
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Y position for the text label
 */
const getTextLabelsYPosition = (config) =>
    isXAxisOrientationTop(config.axis.x.orientation)
        ? constants.TEXT_LABEL_VERTICAL_POSITION.bottom // axis info row orientation is bottom
        : constants.TEXT_LABEL_VERTICAL_POSITION.top; // axis info row orientation is top

/**
 * Adds svg element for each text label.
 *
 * @private
 * @param {object} axisInfoRow - d3 select object containing the text label
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} textLabelList - list of text labels
 * @param {string} uniqueKey - unique id of the content loaded in graph
 * @returns {undefined} - returns nothing
 */
const addTextLabelIcon = (axisInfoRow, config, textLabelList, uniqueKey) =>
    axisInfoRow.select(`.${styles.axisInfoRowIcon}`).append(() =>
        new Shape(getShapeForTarget(textLabelList.value)).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.point,
                svgStyles: `fill: ${getColorForTarget(
                    textLabelList.value.shape
                )}`,
                transformFn: (scale) => `scale(${scale})`,
                a11yAttributes: {
                    "aria-hidden": config.shownTargets.indexOf(uniqueKey) < 0,
                    "aria-describedby": uniqueKey
                }
            })
        )
    );

/**
 * CLear the axis info row labels currently rendered
 *
 * @private
 * @param {d3.selection} axisInfoRowSVG - d3 selection node of axis info row svg
 * @param {string} key - identifier
 * @returns {object} - d3 select object
 */
const removeAxisInfoRowLabels = (axisInfoRowSVG, key) =>
    d3RemoveElement(
        axisInfoRowSVG,
        `g[aria-describedby="text_label_${key}"]`,
        true
    );

export {
    createAxisInfoRowLabel,
    getTextLabelsYPosition,
    getTextLabelsXPosition,
    removeAxisInfoRowLabels
};
