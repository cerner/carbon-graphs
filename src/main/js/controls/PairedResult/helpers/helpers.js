"use strict";
import * as d3 from "d3";
import { Shape } from "../../../core";
import { parseTypedValue } from "../../../core/BaseConfig";
import { getDefaultSVGProps } from "../../../core/Shape";
import {
    calculateVerticalPadding,
    getXAxisXPosition,
    isValidAxisType
} from "../../../helpers/axis";
import constants, { SHAPES } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import {
    legendClickHandler,
    legendHoverHandler,
    loadLegendItem,
    isLegendSelected,
    getDefaultLegendOptions
} from "../../../helpers/legend";
import {
    createRegion,
    hideAllRegions,
    isSingleTargetDisplayed,
    regionLegendHoverHandler,
    showHideRegion,
    areRegionsIdentical,
    createValueRegion
} from "../../../helpers/region";
import { getSVGObject } from "../../../helpers/shapeSVG";
import styles from "../../../helpers/styles";
import { getTransformScale } from "../../../helpers/transformUtils";
import utils from "../../../helpers/utils";
import {
    d3RemoveElement,
    getColorForTarget,
    getShapeForTarget
} from "../../Graph/helpers/helpers";
import {
    dataPointActionHandler,
    drawSelectionIndicator,
    translateSelectionBox,
    translateSelectionItem
} from "./selectionIndicatorHelpers";

/**
 * @typedef PairedResult
 */

/**
 * Returns the value based on the type of data point - High, mid or low
 *
 * @private
 * @param {object} val - A value
 * @param {string} type - High, mid or low
 * @returns {object} value of the type
 */
const getValue = (val, type) => (val ? val[type] : "");
/**
 * Iterates each type of a pair. High, low and mid.
 *
 * @private
 * @param {Function} fn - A function
 * @returns {undefined} - returns nothing
 */
const iterateOnPairType = (fn) => constants.PAIR_ITEM_TYPES.forEach(fn);
/**
 * Creates a new d3 Paired Result using given x1, x2 and y1,y2 coordinates.
 * Interpolation is default linear
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} d - High and low x,y coordinates
 * @returns {undefined} - returns nothing
 */
const createLine = (scale, d) => {
    const newLine = d3
        .line()
        .x((value) => scale.x(value.x))
        .y((value) => scale[d.yAxis](value.y))
        .curve(constants.DEFAULT_INTERPOLATION);
    return newLine([
        {
            x: d.high.x,
            y: d.high.y
        },
        {
            x: d.low.x,
            y: d.low.y
        }
    ]);
};
/**
 * Transforms the point in the Paired Result graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {string} type - high, mid or low
 * @returns {Function} - translate function for d3 transform
 */
const transformPoint = (scale, type) => (value) => (scaleFactor) => {
    const getX = (val) => scale.x(getValue(val, type).x);
    const getY = (val) => scale[val.yAxis](getValue(val, type).y);
    return `translate(${getX(value)},${getY(value)}) scale(${scaleFactor})`;
};
/**
 * Transforms lines for a data point set in the Paired Result graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - Graph config object derived from input JSON
 * @returns {object} - d3 select object
 */
const translateLines = (scale, canvasSVG, config) =>
    canvasSVG
        .selectAll(`.${styles.pairedBoxGroup} .${styles.pairedLine}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("d", (d) => (d.high && d.low ? createLine(scale, d) : ""));
/**
 * Transforms points for a data point set (high, low and mid) in the Paired Result graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - Graph config object derived from input JSON
 * @returns {object} - d3 select object
 */
const translatePoints = (scale, canvasSVG, config) =>
    iterateOnPairType((type) => {
        canvasSVG
            .selectAll(
                `.${styles.pairedBoxGroup} .${styles.pairedPoint}.${getValue(
                    styles,
                    type
                )}`
            )
            .each(function (d) {
                const pairedPointSVG = d3.select(this);
                pairedPointSVG
                    .select("g")
                    .transition()
                    .call(
                        constants.d3Transition(
                            config.settingsDictionary.transition
                        )
                    )
                    .attr("transform", function () {
                        return transformPoint(scale, type)(d)(
                            getTransformScale(this)
                        );
                    });
            });
    });
/**
 * Draws the PairedResult graph on the canvas element.
 * Once these items are rendered, we will parse through the data points and render the line and points
 * We draw paired box groups. Each box comprises of a Line and 2 points (high and low) possibly mid, if provided
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {Array} dataTarget - Data points
 * @returns {undefined} - returns nothing
 */
const draw = (scale, config, canvasSVG, dataTarget) => {
    const drawBox = (boxPath) => {
        drawSelectionIndicator(scale, config, boxPath);
        drawLine(scale, config, boxPath);
        drawPoints(scale, config, boxPath);
    };
    const pairedBoxGroupSVG = canvasSVG
        .append("g")
        .classed(styles.pairedBoxGroup, true)
        .attr("clip-path", `url(#${config.clipPathId})`)
        .attr("aria-describedby", dataTarget.key);
    const pairedBoxPath = pairedBoxGroupSVG
        .selectAll(`.${styles.pairedBox}`)
        .data(getDataPointValues(dataTarget));
    pairedBoxPath
        .enter()
        .append("g")
        .classed(styles.pairedBox, true)
        .attr("aria-selected", false)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        )
        .call(drawBox);
    pairedBoxPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
};
/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 *
 * @private
 * @param {object} graphConfig - config object of Graph API
 * @param {object} dataTarget - Data points object
 * @param {boolean} reflow - flag to check if reflow function called it
 * @returns {object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget, reflow = false) => {
    const type = graphConfig.axis.x.type;
    const getXDataValues = (x) => {
        if (!isValidAxisType(x, type)) {
            throw new Error(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        }
        return parseTypedValue(x, type);
    };
    const valueRegions = {
        high: [],
        low: [],
        mid: []
    };
    const regionObject = {
        high: {
            color: undefined,
            values: []
        },
        low: {
            color: undefined,
            values: []
        },
        mid: {
            color: undefined,
            values: []
        }
    };
    // Each value is a pair. Construct enough information so that you can
    // construct a box. Each box would need 3 icons so we need 3 (max) data sets
    dataTarget.internalValuesSubset = dataTarget.values.map((value) => {
        const subset = {};
        // We are going to iterate through different pair item types: HIGH, LOW and MID
        iterateOnPairType((type) => {
            if (utils.isDefined(getValue(value, type))) {
                const currentValue = getValue(value, type);
                subset[type] = {
                    x: getXDataValues(currentValue.x),
                    y: utils.getNumber(currentValue.y),
                    isCritical: currentValue.isCritical || false,
                    color:
                        getValue(dataTarget.color, type) ||
                        constants.DEFAULT_COLOR,
                    label: getValue(dataTarget.label, type) || {},
                    shape: getValue(dataTarget.shape, type) || SHAPES.CIRCLE,
                    key: `${dataTarget.key}_${type}`
                };
                if (
                    !utils.hasValue(
                        graphConfig.shownTargets,
                        subset[type].key
                    ) &&
                    !reflow
                ) {
                    graphConfig.shownTargets.push(subset[type].key);
                }

                // Generate value regions subset, by extracting the region object from each value
                if (
                    !utils.isEmpty(currentValue.region) &&
                    !utils.isEmpty(currentValue.region.start) &&
                    !utils.isEmpty(currentValue.region.end)
                ) {
                    // If the color is different, then move to new region set.
                    if (
                        regionObject[type].color !== currentValue.region.color
                    ) {
                        regionObject[type].values.length > 0 &&
                            valueRegions[type].push(regionObject[type]);

                        regionObject[type] = {
                            color: currentValue.region.color,
                            values: []
                        };
                    }
                    regionObject[type].color = currentValue.region.color;
                    regionObject[type].values.push({
                        x: getXDataValues(currentValue.x),
                        start: currentValue.region.start,
                        end: currentValue.region.end
                    });
                } else if (regionObject[type].values.length > 0) {
                    valueRegions[type].push(regionObject[type]);
                    regionObject[type] = {
                        color: undefined,
                        values: []
                    };
                }
            }
        });
        subset.yAxis = dataTarget.yAxis || constants.Y_AXIS;
        subset.onClick = dataTarget.onClick;
        subset.key = dataTarget.key;
        return subset;
    });
    const valueRegionSubset = {
        high: [],
        low: [],
        mid: []
    };
    let isValueRegionExist = false;
    // Check if the value region exist and also
    // Add start and end of a valueRegion to new valueRegion,
    // This is to cover the start and end data value with region.
    iterateOnPairType((type) => {
        if (regionObject[type].values.length > 0) {
            valueRegions[type].push(regionObject[type]);
        }
        valueRegions[type].forEach((region) => {
            isValueRegionExist = true;
            valueRegionSubset[type].push(region);
            if (region.values.length > 1) {
                valueRegionSubset[type].push({
                    color: region.color,
                    values: region.values.slice(0, 1)
                });

                valueRegionSubset[type].push({
                    color: region.color,
                    values: region.values.slice(region.values.length - 1)
                });
            }
        });
    });
    dataTarget.valueRegionSubset = isValueRegionExist
        ? valueRegionSubset
        : undefined;
    dataTarget.legendOptions = getDefaultLegendOptions(graphConfig, dataTarget);
    return dataTarget;
};
/**
 * Returns the internal values subset which is the array that was created from the input JSON.
 * This array has information for each data point w.r.t shape, colors and on click callback along with
 * x and y co-ordinates.
 *
 * @private
 * @param {object} target - Object containing the subsets
 * @returns {Array} List of data point subsets
 */
const getDataPointValues = (target) => target.internalValuesSubset;
/**
 * Draws line between the 2 data points high and low. If either one of them is missing
 * then the line is not drawn.
 * Lines are created using d3 svg line with linear interpolation.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} boxPath - d3 html element of the paired box
 * @returns {object} - d3 append object
 */
const drawLine = (scale, config, boxPath) =>
    boxPath.each(function (value, index) {
        const shouldCreateLine = (d) =>
            d.high &&
            d.low &&
            utils.hasValue(config.shownTargets, d.high.key) &&
            utils.hasValue(config.shownTargets, d.low.key) &&
            document
                .querySelector(
                    `.${styles.legendItem}[aria-describedby="${d.high.key}"]`
                )
                ?.getAttribute("aria-current") !== false &&
            document
                .querySelector(
                    `.${styles.legendItem}[aria-describedby="${d.low.key}"]`
                )
                ?.getAttribute("aria-current") !== false;
        return d3
            .select(this)
            .append("path")
            .classed(styles.pairedLine, true)
            .attr("aria-describedby", value.key)
            .attr("aria-hidden", (d) => !shouldCreateLine(d))
            .attr("aria-disabled", !utils.isFunction(value.onClick))
            .attr("d", value.high && value.low ? createLine(scale, value) : "")
            .on("click", function () {
                dataPointActionHandler(config, value, index, this.parentNode);
            });
    });
/**
 * Draws the points with options opted in the input JSON by the consumer for each data set.
 *  Render the point with appropriate color, shape, x and y co-ordinates, label etc.
 *  On click content callback function is called.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 html element of the canvas
 * @returns {undefined} - returns nothing
 */
const drawPoints = (scale, config, canvasSVG) => {
    const getDataPointPath = (path, type, value, index) =>
        path.append(() =>
            new Shape(getShapeForTarget(getValue(value, type))).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: `${styles.pairedPoint} ${getValue(
                        styles,
                        type
                    )}`,
                    svgStyles: `fill: ${getColorForTarget(
                        getValue(value, type)
                    )};`,
                    transformFn: transformPoint(scale, type)(value),
                    onClickFn() {
                        dataPointActionHandler(
                            config,
                            value,
                            index,
                            this.parentNode.parentNode
                        );
                    },
                    a11yAttributes: {
                        "aria-hidden":
                            document
                                .querySelector(
                                    `.${styles.legendItem}[aria-describedby="${
                                        getValue(value, type).key
                                    }"]`
                                )
                                ?.getAttribute("aria-current") === "false",
                        "aria-describedby": getValue(value, type).key,
                        "aria-disabled": !utils.isFunction(value.onClick)
                    }
                })
            )
        );
    canvasSVG.each(function (value, index) {
        const boxPath = d3.select(this);
        iterateOnPairType((type) => {
            if (utils.isDefined(getValue(value, type))) {
                const currentValue = getValue(value, type);
                const pointGroup = boxPath
                    .append("g")
                    .classed(styles.pointGroup, true);
                if (currentValue.isCritical) {
                    config.hasCriticality = true;
                    drawCriticalityPoints(
                        scale,
                        config,
                        pointGroup,
                        type,
                        value,
                        index
                    );
                }
                getDataPointPath(pointGroup, type, value, index);
            }
        });
    });
};
/**
 * Shows line between the 2 data points high and low. If either one of them is missing
 * then the line is not shown.
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} boxPath - d3 html element of the paired box
 * @returns {object} - d3 append object
 */
const showLine = (config, boxPath) =>
    boxPath.each(function () {
        const shouldCreateLine = (d) =>
            d.high &&
            d.low &&
            utils.hasValue(config.shownTargets, d.high.key) &&
            utils.hasValue(config.shownTargets, d.low.key) &&
            document
                .querySelector(
                    `.${styles.legendItem}[aria-describedby="${d.high.key}"]`
                )
                ?.getAttribute("aria-current") === "true" &&
            document
                .querySelector(
                    `.${styles.legendItem}[aria-describedby="${d.low.key}"]`
                )
                ?.getAttribute("aria-current") === "true";
        return d3
            .select(this)
            .select(`.${styles.pairedLine}`)
            .attr("aria-hidden", (d) => !shouldCreateLine(d));
    });
/**
 * Draws the criticality points with options opted in the input JSON by the consumer for each data set.
 *  On click content callback function is called.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} pointGroup - d3 html element of the point group (high, mid or low)
 * @param {string} type - High, mid or low
 * @param {object} value - A value
 * @param {number} index - Value index
 * @returns {undefined} - returns nothing
 */
const drawCriticalityPoints = (
    scale,
    config,
    pointGroup,
    type,
    value,
    index
) => {
    const renderPoint = (path, type, value, index, cls) =>
        path.append(() =>
            new Shape(getShapeForTarget(getValue(value, type))).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: `${cls}`,
                    transformFn: transformPoint(scale, type)(value),
                    onClickFn() {
                        dataPointActionHandler(
                            config,
                            value,
                            index,
                            this.parentNode.parentNode
                        );
                    },
                    a11yAttributes: {
                        "aria-hidden":
                            document
                                .querySelector(
                                    `.${styles.legendItem}[aria-describedby="${
                                        getValue(value, type).key
                                    }"]`
                                )
                                ?.getAttribute("aria-current") === "false",
                        "aria-describedby": getValue(value, type).key,
                        "aria-disabled": !utils.isFunction(value.onClick)
                    }
                })
            )
        );
    renderPoint(
        pointGroup,
        type,
        value,
        index,
        `${styles.pairedPoint} ${getValue(styles, type)} ${
            styles.criticalityOuterPoint
        }`
    );
    renderPoint(
        pointGroup,
        type,
        value,
        index,
        `${styles.pairedPoint} ${getValue(styles, type)} ${
            styles.criticalityInnerPoint
        }`
    );
};
/**
 * Called on resize, translates the data point values.
 * This includes:
 *  Lines
 *  Points
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - Graph config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const translatePairedResultGraph = (scale, canvasSVG, config) => {
    translateSelectionBox(scale, canvasSVG, config);
    translateSelectionItem(scale, canvasSVG, config);
    translateLines(scale, canvasSVG, config);
    translatePoints(scale, canvasSVG, config);
};
/**
 * Show/hide regions based on the following criteria:
 * * Regions would be checked if they are identical before hiding them.
 * * If only 1 target is displayed -> show the region using unique data set key
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - Pair type - high, low or mid pair object containing the key
 * @returns {undefined} - returns nothing
 */
const processRegions = (graphContext, config, canvasSVG, { key }) => {
    if (isSinglePairedResultTargetDisplayed(config, graphContext)) {
        const showHideKeys = config.shownTargets.concat([key]);
        showHideKeys.forEach((targetKey) => {
            showHideRegion(
                canvasSVG,
                `region_${targetKey}`,
                config.shownTargets.indexOf(targetKey) > -1
            );
        });
    } else if (
        !config.shouldHideAllRegion &&
        config.shownTargets.length > 0 &&
        areRegionsIdentical(canvasSVG)
    ) {
        canvasSVG.selectAll(`.${styles.region}`).attr("aria-hidden", false);
    } else {
        hideAllRegions(canvasSVG);
    }
};
/**
 * Checks if only one paired result content item is present in the graph
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} graphContext - Graph instance
 * @returns {boolean} true if displayed targets is equal to 1, false otherwise
 */
const isSinglePairedResultTargetDisplayed = (config, graphContext) => {
    const displayedPairedResults = [];

    config.shownTargets.forEach((target) => {
        graphContext.contentKeys.forEach((key) => {
            if (target.includes(key) && !displayedPairedResults.includes(key)) {
                displayedPairedResults.push(key);
            }
        });
    });

    return isSingleTargetDisplayed(displayedPairedResults);
};
/**
 * Checks the region data of Paired Result so that if one of regions for Paired Result data pairs are not provided,
 * i.e. if regions for "high" and "low" are provided and the values contain data for "high", "mid" and "low",
 * all regions would be hidden(returns false) and if region for all "high", "mid" and "low" is there as well as value contains
 * data for "high", "mid" and "low" then it returns true.
 *
 * @private
 * @param {object} value - pairedResult values
 * @param {object} regionList - List of all the regions provided
 * @returns { boolean } returns true if regions are not missing for the value keys( high, mid or low) else false
 */
const isRegionMappedToAllValues = (value, regionList) =>
    Object.keys(value).every((v) =>
        Object.prototype.hasOwnProperty.call(regionList, v)
    );
/**
 * Handler for Request animation frame, executes on resize.
 *  * Order of execution
 *      * Shows/hides the regions
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} item - paired result type unique key
 * @returns {function()} callback function handler for RAF
 */
const onAnimationHandler = (graphContext, config, canvasSVG, item) => () => {
    processRegions(graphContext, config, canvasSVG, item);
};
/**
 * Click handler for legend item. Removes the line from graph when clicked
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {PairedResult} control - Paired Result instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const clickHandler = (graphContext, control, config, canvasSVG) => (
    element,
    item
) => {
    const updateShownTarget = (shownTargets, item) => {
        const index = shownTargets.indexOf(item.key);
        if (index > -1) {
            shownTargets.splice(index, 1);
        } else {
            shownTargets.push(item.key);
        }
    };
    legendClickHandler(element);
    const legendSelected = isLegendSelected(d3.select(element));
    updateShownTarget(config.shownTargets, item);
    canvasSVG
        .selectAll(`path[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", legendSelected);
    canvasSVG
        .selectAll(`.${styles.pairedPoint}[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", legendSelected);
    /*
    Select only those .carbon-data-pair elements that belong to the particular canvas for which a paired result legend item was clicked
    and  pass them to showLine() method.
    This ensures that when there are multiple canvases with paired results in each canvas,
    selecting a paired result legend item in one canvas does not affect paired results in other canvases.
    */
    const pairedBoxGroupClipPath = `url(#${config.clipPathId})`;
    const pairedBoxGroup = d3.selectAll(`.${styles.pairedBoxGroup}`);
    pairedBoxGroup.each(function () {
        const clipPath = d3.select(this).attr("clip-path");
        if (clipPath === pairedBoxGroupClipPath) {
            const boxPath = d3.select(this).selectAll(`.${styles.pairedBox}`);
            showLine(config, boxPath);
        }
    });
    window.requestAnimationFrame(
        onAnimationHandler(graphContext, config, canvasSVG, item)
    );
};
/**
 * Hover handler for legend item. Highlights current line and blurs the rest of the targets in Graph
 * if present.
 *
 * @private
 * @param {Array} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const hoverHandler = (config, canvasSVG) => (item, state) => {
    const additionalHoverHandler = (
        shownTargets,
        canvasSVG,
        currentKey,
        hoverState,
        k
    ) => {
        canvasSVG
            .selectAll(`.${styles.region}[aria-describedby="region_${k}"]`)
            .classed(
                styles.regionBlur,
                hoverState === constants.HOVER_EVENT.MOUSE_ENTER
            );
    };
    legendHoverHandler(config.shownTargets, canvasSVG, item.key, state, [
        additionalHoverHandler
    ]);
    // Highlight the line of the item hovered on
    canvasSVG
        .selectAll(`path[aria-describedby="${item.key}"]`)
        .classed(styles.highlight, state === constants.HOVER_EVENT.MOUSE_ENTER);
    canvasSVG
        .selectAll(`.${styles.pairedPoint}[aria-describedby="${item.key}"]`)
        .classed(styles.highlight, state === constants.HOVER_EVENT.MOUSE_ENTER);

    // Highlight region(s) of the item hovered on, only if the graph is currently displayed
    regionLegendHoverHandler(config.shownTargets, canvasSVG, item.key, state);
};
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
    const constructLegendLabels = (d, type) =>
        Object.assign(
            {},
            {
                shape: getValue(d.shape, type),
                color: getValue(d.color, type),
                label: getValue(d.label, type),
                key: `${d.key}_${type}`,
                values: dataTarget.values,
                legendOptions: dataTarget.legendOptions
            }
        );
    if (dataTarget.label && legendSVG) {
        iterateOnPairType((type) => {
            const label = getValue(dataTarget.label, type);
            if (label && label.display) {
                loadLegendItem(
                    legendSVG,
                    constructLegendLabels(dataTarget, type),
                    config,
                    eventHandlers
                );
            }
        });
    }
};
/**
 * Renders the regions for each pair item, if available
 * Each region in a graph content is created as a group.
 * Each group is defined by its unique id with the prefix "region_",
 * so that any region belonging to the pair can be rendered within the paired region group.
 * This is a bit different than other types of graph since we have individual legend
 * for each of the pair types.
 * Criteria for loading the regions:
 *  Each content should show regions for high, low and/or mid upfront
 *  Region should only be hidden if:
 *      Toggled using legend
 *      If more than 1 data set/content is available
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} dataTarget - Data points object
 * @returns {undefined} - returns nothing
 */
const renderRegion = (scale, config, canvasSVG, dataTarget) => {
    const regionGroupSVG = canvasSVG.select(`.${styles.regionGroup}`);
    const regionPairGroup = regionGroupSVG
        .append("g")
        .classed(styles.regionPairGroup, true)
        .attr("aria-describedby", `region_${dataTarget.key}`);
    regionPairGroup.call(() => {
        iterateOnPairType((type) => {
            if (
                dataTarget.valueRegionSubset &&
                dataTarget.valueRegionSubset[type]
            ) {
                createValueRegion(
                    scale,
                    config,
                    regionPairGroup,
                    dataTarget.valueRegionSubset[type],
                    `region_${dataTarget.key}_${type}`,
                    dataTarget.yAxis
                );
            } else if (dataTarget.regions && dataTarget.regions[type]) {
                if (
                    !utils.isArray(dataTarget.regions[type]) ||
                    utils.isUndefined(dataTarget.regions[type])
                ) {
                    throw new Error(errors.THROW_MSG_REGION_EMPTY);
                }
                createRegion(
                    scale,
                    config,
                    regionPairGroup,
                    dataTarget.regions[type],
                    `region_${dataTarget.key}_${type}`,
                    dataTarget.yAxis
                );
            }
        });
    });
};

/**
 * Clears the paired boxes before redrawing.
 * We are selecting all the box pairs along
 * with all the data sets before clearing them.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} dataTarget - Data points object
 * @returns {object} - d3 select object
 */
const clear = (canvasSVG, dataTarget) =>
    d3RemoveElement(canvasSVG, `g[aria-describedby="${dataTarget.key}"]`);

export {
    getSVGObject,
    getValue,
    translatePoints,
    translateLines,
    createLine,
    clickHandler,
    iterateOnPairType,
    hoverHandler,
    transformPoint,
    draw,
    getDataPointValues,
    processDataPoints,
    drawLine,
    drawPoints,
    translatePairedResultGraph,
    prepareLegendItems,
    renderRegion,
    isRegionMappedToAllValues,
    clear
};
