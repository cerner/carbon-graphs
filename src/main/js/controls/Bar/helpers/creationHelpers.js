"use strict";
import * as d3 from "d3";
import { getType } from "../../../core/BaseConfig";
import {
    calculateVerticalPadding,
    getAxisLabelHeight,
    isValidAxisType
} from "../../../helpers/axis";
import { getBarStyle, getHashedBar, getRect } from "../../../helpers/barType";
import constants, {
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import { loadLegendItem } from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { d3RemoveElement } from "../../Graph/helpers/helpers";
import { createAxisInfoRowLabel } from "./axisInfoRowHelpers";
import { createRegion } from "./goalLineHelpers";
import { drawSelectionBars, getSelectedData } from "./selectionHelpers";

/**
 * Checks if ticks are provided for every input
 *
 * @private
 * @param {Array} xTicks - graph x axis tick values
 * @param {Array} inputValues - input values
 * @returns {boolean} - true if invalid. false if valid
 */
const hasInvalidTicks = (xTicks, inputValues) =>
    inputValues.some((value) => xTicks.indexOf(value.x) < 0);

/**
 * Checks if x-axis type matches for every input
 *
 * @private
 * @param {string} type - x-axis type
 * @param {Array} inputValues - input values
 * @returns {boolean} - true if input has invalid type, false if it doesn't have invalid type
 */
const hasInvalidTypes = (type, inputValues) =>
    inputValues.some((value) => !isValidAxisType(value.x, type));
/**
 * Processes the input JSON and adds the colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 * We add key to shownTargets if bar content is newly added to graph
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} dataTarget - Data points object
 * @throws module:errors.THROW_MSG_EMPTY_X_AXIS_TICK_VALUES
 * @throws module:errors.THROW_MSG_INVALID_FORMAT_TYPE
 * @throws module:errors.THROW_MSG_INVALID_X_AXIS_TICK_VALUES
 * @returns {object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) => {
    if (
        utils.isEmpty(graphConfig.axis.x.ticks) ||
        utils.isEmpty(graphConfig.axis.x.ticks.values)
    ) {
        throw new Error(errors.THROW_MSG_EMPTY_X_AXIS_TICK_VALUES);
    }
    if (hasInvalidTypes(graphConfig.axis.x.type, dataTarget.values)) {
        throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    }
    if (hasInvalidTicks(graphConfig.axis.x.ticks.values, dataTarget.values)) {
        throw new Error(errors.THROW_MSG_INVALID_X_AXIS_TICK_VALUES);
    }
    if (utils.isDefined(dataTarget.axisInfoRow)) {
        if (utils.isEmpty(dataTarget.axisInfoRow)) {
            throw new Error(errors.THROW_MSG_AXIS_INFO_ROW_EMPTY_TICK_VALUES);
        }
        if (
            hasInvalidTicks(
                graphConfig.axis.x.ticks.values,
                dataTarget.axisInfoRow
            )
        ) {
            throw new Error(errors.THROW_MSG_AXIS_INFO_ROW_INVALID_TICK_VALUES);
        }
        if (hasMissingAxisInfoRowValue(dataTarget.axisInfoRow)) {
            throw new Error(errors.THROW_MSG_AXIS_INFO_ROW_VALUE_NOT_PROVIDED);
        }
        if (hasMissingAxisInfoRowLabelDisplay(dataTarget.axisInfoRow)) {
            throw new Error(
                errors.THROW_MSG_AXIS_INFO_ROW_LABEL_DISPLAY_NOT_PROVIDED
            );
        }
    }
    graphConfig.shownTargets.push(dataTarget.key);
    return setDataPoints(graphConfig, dataTarget);
};

/**
 * Checks if each axis info row input has value
 *
 * @private
 * @param {object} inputAxisInfoRow - input axis info row values
 * @returns {boolean} - true if each axis info row input has value, false otherwise
 */
const hasMissingAxisInfoRowValue = (inputAxisInfoRow) =>
    inputAxisInfoRow.some((axisInfoRow) =>
        utils.isUndefined(axisInfoRow.value)
    );
/**
 * Checks if each axis info row input value label has display
 *
 * @private
 * @param {object} inputAxisInfoRow - input axis info row values
 * @returns {boolean} - true if each axis info row input value label has display , false otherwise
 */
const hasMissingAxisInfoRowLabelDisplay = (inputAxisInfoRow) =>
    inputAxisInfoRow.some(
        (axisInfoRow) =>
            utils.isUndefined(axisInfoRow.value.label) ||
            utils.isUndefined(axisInfoRow.value.label.display)
    );

/**
 * Processes the input JSON and adds the colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} dataTarget - Data points object
 * @returns {object} dataTarget - Updated data target object
 */
const setDataPoints = (graphConfig, dataTarget) => {
    const type = graphConfig.axis.x.type;
    const getXDataValues = (x) => {
        if (getType(type) === AXIS_TYPE.TIME_SERIES) {
            return utils.parseDateTime(x);
        }
        return utils.getNumber(x);
    };
    if (utils.notEmpty(dataTarget.axisInfoRow)) {
        dataTarget.axisInfoRow.forEach(
            (axisInfoRowValue) => (axisInfoRowValue.group = dataTarget.group)
        );
        if (!graphConfig.axisInfoRowLabelHeight) {
            graphConfig.axisInfoRowLabelHeight = hasSecondaryDisplay(dataTarget)
                ? getAxisLabelHeight("dummyString") * 2
                : getAxisLabelHeight("dummyString");
            graphConfig.padding.bottom =
                graphConfig.padding.bottom + graphConfig.axisInfoRowLabelHeight;
        }
    }
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => {
        const isHashed = dataTarget.style ? dataTarget.style.isHashed : false;
        return {
            onClick: dataTarget.onClick,
            x: getXDataValues(value.x),
            y: value.y,
            y0: 0,
            color: dataTarget.color || COLORS.BLUE,
            label: dataTarget.label,
            yAxis: dataTarget.yAxis || constants.Y_AXIS,
            key: dataTarget.key,
            isHashed: value.style ? value.style.isHashed : isHashed,
            style: getBarStyle(
                value.style ? value.style : dataTarget.style,
                dataTarget
            ),
            group: dataTarget.group
        };
    });
    // This square shape is used strictly for legend item
    dataTarget.shape = SHAPES.SQUARE;
    dataTarget.color = dataTarget.color || COLORS.BLUE;
    return dataTarget;
};
/**
 * Checks for the presence of secondary display inside axisInfoRow
 *
 * @private
 * @param {object} dataTarget - Data points object
 * @returns {boolean} - true if secondary display is present, false otherwise
 */
const hasSecondaryDisplay = (dataTarget) =>
    dataTarget.axisInfoRow.some(
        (axisInfoRowItem) => axisInfoRowItem.value.label.secondaryDisplay
    );

/**
 * X Axis's starting position within the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getXAxisXPosition = (config) =>
    config.axisSizes.y + config.axisLabelWidths.y;

/**
 * Draws the Bar graph on the canvas element. This calls the Graph API to render the following first
 *  Grid
 *  Axes
 *  Legend
 *  Labels
 * Once these items are rendered, we will parse through the data points and render the lines and points
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} bandScale - bar x-axis band scale
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, bandScale, config, canvasSVG, dataTarget) => {
    if (canvasSVG.select(`.${styles.barSelectionGroup}`).empty()) {
        drawSelectionBars(scale, bandScale, config, canvasSVG);
    }
    const barSVG = canvasSVG
        .append("g")
        .classed(styles.barGraphContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`)
        .attr("aria-hidden", config.shownTargets.indexOf(dataTarget.key) < 0)
        .attr("aria-describedby", dataTarget.key);
    const barGroupSVG = barSVG
        .append("g")
        .classed(styles.currentBarsGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        )
        .data([dataTarget]);
    const bars = barGroupSVG
        .selectAll(`.${styles.bar}`)
        .data(dataTarget.internalValuesSubset);
    drawDataBars(
        scale,
        bandScale,
        config,
        canvasSVG,
        bars.enter(),
        dataTarget.regions,
        dataTarget.axisInfoRow
    );
};

/**
 * Contains logic to calculate x, y, height, width for bar
 * x is calculated using band scale. Padding between each bar should be half of its width.
 * width of bar should be 2/3 of range band. Remaining 1/3 of range band is for padding between bars.
 * height of bar should be
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @returns {object} Object that contains methods for calculating x, y, height, width.
 */
const barAttributesHelper = (scale, bandScale) => {
    const leftShiftOffset =
        bandScale.x0.bandwidth() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.LEFT_SHIFT_OFFSET_RATIO; // this value is used to center bars by shifting left
    const leftShiftPadding =
        bandScale.x1.bandwidth() *
        constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES
            .LEFT_SHIFT_OFFSET_PADDING_RATIO; // padding to be added on left side of bar
    const getXRange = (x, groupOffset) =>
        scale.x(x) + leftShiftPadding + groupOffset - leftShiftOffset;

    return {
        x: (d) => {
            // x offset for grouped bars. By default every content is treated as a grouped bar.
            const groupOffset = bandScale.x1(d.group);
            return getXRange(d.x, groupOffset || 0) || 0;
        },
        y: (d) => (d.y < 0 ? scale[d.yAxis](d.y0) : scale[d.yAxis](d.y + d.y0)),
        height: (d) => Math.abs(scale[d.yAxis](0) - scale[d.yAxis](+d.y)),
        width: () =>
            bandScale.x1.bandwidth() *
            constants.DEFAULT_BAR_GRAPH_PADDING_ATTRIBUTES.WIDTH_RATIO
    };
};

/**
 * Creates a d3 svg bar
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} barGroupSVG - d3 object for bar group svg
 * @param {Array} regionList - List of regions to be shown within graph
 * @param {Array} axisInfoRowList - List of text labels to be shown
 * @returns {object} d3 bar object
 */
const drawDataBars = (
    scale,
    bandScale,
    config,
    canvasSVG,
    barGroupSVG,
    regionList,
    axisInfoRowList
) => {
    const attributeHelper = barAttributesHelper(scale, bandScale);
    return barGroupSVG
        .append("g")
        .classed(styles.bar, true)
        .each(function(dataPoint, index) {
            const dataPointSVG = d3.select(this);
            const rectPath = dataPoint.isHashed
                ? getHashedBar(
                      canvasSVG,
                      canvasSVG.append("defs"),
                      dataPointSVG,
                      attributeHelper.x(dataPoint),
                      attributeHelper.y(dataPoint),
                      attributeHelper.width(),
                      attributeHelper.height(dataPoint),
                      dataPoint.style
                  ).selectAll("rect")
                : getRect(
                      dataPointSVG,
                      attributeHelper.x(dataPoint),
                      attributeHelper.y(dataPoint),
                      attributeHelper.width(),
                      attributeHelper.height(dataPoint)
                  ).attr("style", `${dataPoint.style}`);
            rectPath
                .attr("aria-describedby", dataPoint.key)
                .classed(styles.taskBar, true)
                .attr(
                    "aria-hidden",
                    config.shownTargets.indexOf(dataPoint.key) < 0
                )
                .attr("aria-disabled", !utils.isFunction(dataPoint.onClick))
                .on("click", (value) => {
                    barActionHandler(
                        value,
                        index,
                        canvasSVG,
                        config.axis.x.type,
                        config.axis.x.ticks.values,
                        getSelectedData(canvasSVG, value, config)
                    );
                });
            if (utils.notEmpty(regionList)) {
                const regions = regionList.filter((r) =>
                    utils.isEqual(r.x, dataPoint.x)
                );
                if (utils.notEmpty(regions)) {
                    createRegion(
                        scale,
                        config,
                        dataPointSVG,
                        regions,
                        dataPoint.key
                    );
                }
            }
            if (utils.notEmpty(axisInfoRowList)) {
                const textLabels = axisInfoRowList.filter((t) =>
                    utils.isEqual(t.x, dataPoint.x)
                );
                if (utils.notEmpty(textLabels)) {
                    createAxisInfoRowLabel(
                        bandScale,
                        scale,
                        config,
                        canvasSVG,
                        textLabels[0],
                        dataPoint.key,
                        axisInfoRowList.indexOf(textLabels[0])
                    );
                }
            }
        });
};

/**
 * Sets key as group name if group name is empty
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {Array} content - Array of targets
 * @returns {undefined} - returns nothing
 */
const setGroupName = (config, content) => {
    if (utils.isEmpty(config.group)) {
        config.group = config.key;
        return;
    }
    if (!content.filter((c) => c.config.key === config.group).length) {
        config.group = config.key;
    }
};

/**
 * CLear the graph data points and bars currently rendered
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - identifier
 * @returns {object} - d3 select object
 */
const clear = (canvasSVG, key) =>
    d3RemoveElement(canvasSVG, `g[aria-describedby="${key}"]`);

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
const prepareLegendItems = (config, eventHandlers, dataTarget, legendSVG) => {
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
 * Toggles the selection of a bar, executes on click of a bar.
 *
 * @private
 * @param {object} value - data point object
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} type - x-axis type
 * @param {Array} tickValues - X axis ticks array
 * @returns {Array} d3 html element of the selected bar
 */
const toggleDataPointSelection = (value, canvasSVG, type, tickValues) => {
    const selectedPointNode = canvasSVG.select(
        `rect[aria-describedby=bar-selector-${
            type === AXIS_TYPE.TIME_SERIES
                ? tickValues.indexOf(new Date(value.x).toISOString())
                : tickValues.indexOf(value.x)
        }]`
    );
    const isHidden = selectedPointNode.attr("aria-hidden") === "true";
    setSelectionIndicatorAttributes(selectedPointNode, isHidden);
    return selectedPointNode;
};
/**
 * Handler for the bar on click. If the content property is present for the bar content
 * then the callback is executed other wise it is NOP.
 * If the callback is present, the selected bar is toggled and the element is passed as an argument to the
 * consumer in the callback, to execute once the popup is closed.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected bar target [d3 target]
 *  On close of popup, call -> the provided callback
 *
 * @private
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} type - x-axis type
 * @param {Array} tickValues - X axis ticks array
 * @param {Array} datum - selected bar data to be passed to onclick function
 * @returns {undefined} - returns nothing
 */
const barActionHandler = (value, index, canvasSVG, type, tickValues, datum) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(value, canvasSVG, type, tickValues).call(
        (selectedTarget) =>
            value.onClick(
                () => {
                    setSelectionIndicatorAttributes(selectedTarget, false);
                },
                value.key,
                index,
                datum,
                selectedTarget
            )
    );
};
/**
 * sets selection bar's aria-hidden and aria-selected attributes
 *
 * @private
 * @param {object} selectionPath - selection bar svg path
 * @param {boolean} isSelected - true if selected, false if not
 * @returns {undefined} - returns nothing
 */
const setSelectionIndicatorAttributes = (selectionPath, isSelected) => {
    selectionPath.attr("aria-hidden", !isSelected);
    selectionPath.attr("aria-selected", isSelected);
};

export {
    processDataPoints,
    draw,
    clear,
    setGroupName,
    prepareLegendItems,
    barAttributesHelper,
    getXAxisXPosition,
    setSelectionIndicatorAttributes,
    hasInvalidTicks,
    barActionHandler,
    getSelectedData
};
