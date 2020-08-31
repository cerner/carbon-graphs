"use strict";
import * as d3 from "d3";
import { getScale } from "../../../core/BaseConfig/index";
import {
    buildAxisLabel,
    calculateVerticalPadding,
    determineOutlierStretchFactor,
    getAxesScale,
    getRotationForAxis,
    getXAxisLabelXPosition,
    getXAxisLabelYPosition,
    getXAxisRange,
    getXAxisWidth,
    getXAxisXPosition,
    getYAxisYPosition,
    getY2AxisLabelXPosition,
    getYAxisHeight,
    getYAxisLabelXPosition,
    getYAxisLabelYPosition,
    getYAxisRange,
    hasY2Axis,
    isXAxisOrientationTop,
    processTickValues,
    translateAxes,
    translateAxisReferenceLine,
    formatLabel
} from "../../../helpers/axis";
import constants, { SHAPES } from "../../../helpers/constants";
import { createVGrid, translateVGrid } from "../../../helpers/datetimeBuckets";
import {
    buildY2AxisLabelShapeContainer,
    buildYAxisLabelShapeContainer,
    shouldTruncateLabel,
    translateLabelShapeContainer,
    loadLabelPopup
} from "../../../helpers/label";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import {
    translateDateline,
    getDatelineIndicatorHeight
} from "../../../helpers/dateline";
import { translateEventline } from "../../../helpers/eventline";

const BASE_CANVAS_WIDTH_PADDING = constants.BASE_CANVAS_WIDTH_PADDING;
const DEFAULT_HEIGHT = constants.DEFAULT_HEIGHT;

/**
 * Updates the height and width of the canvas on resize
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const translateCanvas = (config, canvasSVG) =>
    canvasSVG
        .attr("height", config.canvasHeight + getAxisInfoRowLabelHeight(config))
        .attr(
            "width",
            config.padding.hasCustomPadding
                ? config.canvasWidth
                : config.canvasWidth - BASE_CANVAS_WIDTH_PADDING
        );
/**
 * Checks if axis info row labels are present and updates the canvas height
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} - axis info row label height
 */
const getAxisInfoRowLabelHeight = (config) =>
    utils.isDefined(config.axisInfoRowLabelHeight)
        ? config.axisInfoRowLabelHeight
        : 0;

/**
 * Updates clipPath rectangle width and height on resize.
 * `clipPath` updates are necessary since the clip-path URL needs to get
 * the necessary parameters on resize so that data points are not cut off
 *
 * @description
 * Calling getDatelineIndicatorHeight() will trigger a page reflow and resizing the page might cause Layout Thrashing.
 * We understand this and deem it necessary to calculate the indicator height when a new dataset/set of contents are loaded during Panning.
 * Furthermore, this function is called only when panning is enabled and there is a dateline defs element is present.
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateDefs = (config, canvasSVG) => {
    canvasSVG
        .select(`clipPath#${config.clipPathId}`)
        .selectAll("rect")
        .attr("height", config.height)
        .attr("width", getXAxisWidth(config))
        .attr(
            constants.Y_AXIS,
            config.axis.x.orientation && calculateVerticalPadding(config)
        );

    if (
        config.settingsDictionary.shouldCreateDatelineDefs &&
        config.dateline.length > 0
    ) {
        const datelineIndicatorHeight = Math.floor(
            getDatelineIndicatorHeight() / 2
        );
        canvasSVG
            .select(`clipPath#${config.datelineClipPathId}`)
            .selectAll("rect")
            .attr("height", config.height + datelineIndicatorHeight)
            .attr("width", getXAxisWidth(config))
            .attr(
                constants.Y_AXIS,
                config.axis.x.orientation &&
                    calculateVerticalPadding(config) - datelineIndicatorHeight
            );
    }
};
/**
 * Translates the horizontal grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the Y Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 svg path
 */
const translateHorizontalGrid = (axis, config) => {
    let yAxisGrid;
    if (utils.notEmpty(config.axis.y.ticks.values)) {
        const ticks = config.axis.y.ticks.values;
        yAxisGrid = axis.y
            .tickValues(processTickValues(ticks))
            .tickSize(getXAxisWidth(config) * -1, 0, 0)
            .tickFormat("");
    } else {
        yAxisGrid = axis.y
            .tickSize(getXAxisWidth(config) * -1, 0, 0)
            .tickFormat("");
    }
    return yAxisGrid;
};
/**
 * Translates the vertical grid on the canvas, grids are only applicable to standard
 * X and Y Axis.
 * We decide using the ticks that are present in the X Axis and have the grid lines for every tick except the bounds.
 * When we resize, the ticks change based on the container real estate and we add/remove the grids respectively.
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 svg path
 */
const translateVerticalGrid = (axis, config) => {
    let xAxisGrid;
    const tickSizeMultiplicand = isXAxisOrientationTop(
        config.axis.x.orientation
    )
        ? constants.TICK_ORIENTATION.TOP
        : constants.TICK_ORIENTATION.BOTTOM;
    if (utils.notEmpty(config.axis.x.ticks.values)) {
        const ticks = config.axis.x.ticks.values;
        xAxisGrid = axis.x
            .tickValues(processTickValues(ticks))
            .tickSize(getYAxisHeight(config) * tickSizeMultiplicand, 0, 0)
            .tickFormat("");
    } else {
        xAxisGrid = axis.x
            .tickSize(getYAxisHeight(config) * tickSizeMultiplicand, 0, 0)
            .tickFormat("");
    }
    return xAxisGrid;
};
/**
 * Updates the horizontal and vertical grid sizes/positions on resize
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .select(`.${styles.grid}`)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        );
    if (config.showHGrid) {
        canvasSVG
            .select(`.${styles.gridH}`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .call(translateHorizontalGrid(axis, config));
    }

    if (config.showVGrid) {
        translateVGrid(canvasSVG, axis, config, translateVGridHandler);
    }
};

/**
 * Function to translate the vertical-grid with a specific style and config.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} axis - Axis scaled according to input parameters
 * @param {string} style - Style with which, grid needs to be created.
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing.
 */
const translateVGridHandler = (canvasSVG, axis, style, config) => {
    canvasSVG
        .select(`.${style}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .call(translateVerticalGrid(axis, config));
};
/**
 * Translates the rectangle which forms the container for graph content
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const translateContentContainer = (config, canvasSVG) =>
    canvasSVG
        .select(`.${styles.contentContainer}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("width", getXAxisWidth(config))
        .attr("height", config.height)
        .attr(
            constants.Y_AXIS,
            config.axis.x.orientation && calculateVerticalPadding(config)
        );
/**
 * Updates the x, y, y2 axes label positions on resize
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateLabel = (config, canvasSVG) => {
    const axesLabelCharLimits = getAxesLabelCharacterLimits(config);
    if (config.axis.x.label) {
        canvasSVG
            .select(`.${styles.axisLabelX}`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr(
                "transform",
                `translate(${getXAxisLabelXPosition(
                    config
                )},${getXAxisLabelYPosition(
                    config
                )}) rotate(${getRotationForAxis(constants.X_AXIS)})`
            );
        canvasSVG
            .selectAll(`.${styles.axisLabelX} text`)
            .each(function (displayVal) {
                d3.select(this).text(
                    formatLabel(
                        config.axis.x.label,
                        axesLabelCharLimits.xAxisLimit
                    )
                );
            });
    }

    if (config.axis.y.label) {
        canvasSVG
            .select(`.${styles.axisLabelY}`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr(
                "transform",
                `translate(${getYAxisLabelXPosition(
                    config
                )}, ${getYAxisLabelYPosition(
                    config
                )}) rotate(${getRotationForAxis(constants.Y_AXIS)})`
            );
        canvasSVG
            .selectAll(`.${styles.axisLabelY} text`)
            .each(function (displayVal) {
                d3.select(this).text(
                    formatLabel(
                        config.axis.y.label,
                        axesLabelCharLimits.yAndY2AxisLimit
                    )
                );
            });
    }

    if (hasY2Axis(config.axis)) {
        canvasSVG
            .select(`.${styles.axisLabelY2}`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr(
                "transform",
                `translate(${getY2AxisLabelXPosition(
                    config
                )}, ${getYAxisLabelYPosition(
                    config
                )}) rotate(${getRotationForAxis(constants.Y2_AXIS)})`
            );
        canvasSVG
            .selectAll(`.${styles.axisLabelY2} text`)
            .each(function (displayVal) {
                d3.select(this).text(
                    formatLabel(
                        config.axis.y2.label,
                        axesLabelCharLimits.yAndY2AxisLimit
                    )
                );
            });
    }
};
/**
 * Determines the domain for x, y and y2 axes. For Y axis and Y2 axis,
 * the end points are calculated based on the ranges provided. This is done so that the axes are
 * padded on both ends properly.
 * For X Axis no such processing is provided. This decision was made due to the resize happening
 * horizontally rather than vertical resize. To alleviate processing cost we depend on x axis's end points directly.
 * If the consumer needs to pad the X Axis then they can provide the range with sufficient padding.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {object} [input] - array of target objects
 * @returns {object} config - config object derived from input JSON
 */
const updateAxesDomain = (config, input = {}) => {
    config.outlierStretchFactor = determineOutlierStretchFactor(config);
    const setDomain = (outlierStretchFactor, lowerLimit, upperLimit, yAxis) => {
        const halfDomain = (upperLimit - lowerLimit) / 2;
        const midPoint = (upperLimit + lowerLimit) / 2;
        return padDomain(
            {
                lowerLimit:
                    midPoint - halfDomain * outlierStretchFactor.lowerLimit,
                upperLimit:
                    midPoint + halfDomain * outlierStretchFactor.upperLimit
            },
            config.axisPadding[yAxis]
        );
    };

    if (utils.notEmpty(input)) {
        const yAxis = input.config.yAxis || constants.Y_AXIS;
        config.axis[yAxis].domain = setDomain(
            config.outlierStretchFactor,
            config.axis[yAxis].domain.lowerLimit,
            config.axis[yAxis].domain.upperLimit,
            yAxis
        );
    }
    return config;
};
/**
 * Added defs element for the canvas. This currently holds the clip paths for the entire chart.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const createDefs = (config, canvasSVG) => {
    const defsElement = canvasSVG.append("defs");

    defsElement
        .append("clipPath")
        .attr("id", config.clipPathId)
        .append("rect")
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(constants.Y_AXIS, calculateVerticalPadding(config))
        .attr("width", getXAxisWidth(config))
        .attr("height", config.height);

    if (
        config.settingsDictionary.shouldCreateDatelineDefs &&
        config.dateline.length > 0
    ) {
        defsElement
            .append("clipPath")
            .attr("id", config.datelineClipPathId)
            .append("rect")
            .attr(constants.X_AXIS, getXAxisXPosition(config))
            .attr(constants.Y_AXIS, 0)
            .attr("width", getXAxisWidth(config))
            .attr("height", 0);
    }
};

/**
 * Create the d3 grid - horizontal and vertical and append into the canvas.
 * Only performed if the flags for showHGrid and showVGrid are enabled
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const createGrid = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    const gridSVG = canvasSVG
        .append("g")
        .classed(styles.grid, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        );
    if (config.showHGrid) {
        gridSVG
            .append("g")
            .classed(styles.gridH, true)
            .call(translateHorizontalGrid(axis, config));
    }
    if (config.showVGrid) {
        createVGrid(gridSVG, axis, config, createVGridHandler);
    }
};

/**
 * Function to create the vertical-grid with a specific style and config.
 *
 * @private
 * @param {object} gridSVG - d3 object of the grid
 * @param {object} axis - Axis scaled according to input parameters
 * @param {string} style - Style with which, grid needs to be created.
 * @param {object} config - config required for translating vertical grid.
 * @returns {undefined} - Doesn't return anything.
 */
const createVGridHandler = (gridSVG, axis, style, config) => {
    gridSVG
        .append("g")
        .classed(style, true)
        .call(translateVerticalGrid(axis, config));
};
/**
 * calculates the character limit of label with respect to axis length.
 *
 * @private
 * @param {string} config - config object derived from input JSON
 * @returns {object} character limit for both and y-axis
 */
const getAxesLabelCharacterLimits = (config) => ({
    /*
     *  We can fit 1 Uppercase character for every ≈7px. To fit ellipses with truncated text, we can assign 8px per character for y and y2-axis.
     *  And if we use 8px per character, there will be some space left on x-axis. Inorder to use maximum space on x-axis,
     *  we can assign less than 8px(22/3 i.e ≈7.3) per character in x-axis.
     *
     */
    xAxisLimit: getXAxisWidth(config) / 7.33,
    yAndY2AxisLimit: config.height / 8
});
/**
 * Adds onClick event for each label in Axes.
 * Criteria:
 *  * Text needs to have a valid function for onClick
 *  * Label should exceed the calculated character limit with respect to axis length
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} className - class name of axis
 * @param {object} axisObj - Axis object provided by the consumer
 * @param {number} charLimit - character limit of label in axis
 * @param {string} axisType - type of axis
 * @returns {object} d3 svg path
 */
const addLabelEventHandler = (
    canvasSVG,
    className,
    axisObj,
    charLimit,
    axisType
) =>
    canvasSVG.selectAll(`.${className} text`).each(function (displayVal) {
        shouldTruncateLabel(axisObj.label, charLimit)
            ? d3
                  .select(this)
                  .style("cursor", "pointer")
                  .on("click", () => {
                      utils.isDefined(axisObj.onLabelClick) &&
                      utils.isFunction(axisObj.onLabelClick)
                          ? axisObj.onLabelClick(axisObj.label, d3.select(this))
                          : loadLabelPopup(axisObj.label, axisType);
                  })
            : null;
    });
/**
 * Create the d3 Labels - X, Y and Y2 and append into the canvas.
 * Only if showLabel is enabled. X Axis is 0 deg rotated, Y Axis is rotated 90 deg
 * Y2 Axis is rotated -90 deg along its horizontal axis.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} control - Graph instance
 * @returns {undefined} - returns nothing
 */
const createLabel = (config, canvasSVG, control) => {
    if (config.showLabel) {
        const axesLabelCharLimits = getAxesLabelCharacterLimits(config);
        if (config.axis.x.label) {
            const labelPath = canvasSVG
                .append("g")
                .classed(styles.axisLabelX, true)
                .attr(
                    "transform",
                    `translate(${getXAxisLabelXPosition(
                        config
                    )},${getXAxisLabelYPosition(
                        config
                    )}) rotate(${getRotationForAxis(constants.X_AXIS)})`
                );
            buildAxisLabel(
                labelPath,
                utils.sanitize(config.axis.x.label),
                axesLabelCharLimits.xAxisLimit
            );
            addLabelEventHandler(
                labelPath,
                styles.axisLabelX,
                config.axis.x,
                axesLabelCharLimits.xAxisLimit,
                constants.X_AXIS
            );
        }
        if (config.axis.y.label) {
            const labelPath = canvasSVG
                .append("g")
                .classed(styles.axisLabelY, true)
                .attr(
                    "transform",
                    `translate(${getYAxisLabelXPosition(
                        config
                    )}, ${getYAxisLabelYPosition(
                        config
                    )}) rotate(${getRotationForAxis(constants.Y_AXIS)})`
                );
            buildAxisLabel(
                labelPath,
                utils.sanitize(config.axis.y.label),
                axesLabelCharLimits.yAndY2AxisLimit
            );
            addLabelEventHandler(
                labelPath,
                styles.axisLabelY,
                config.axis.y,
                axesLabelCharLimits.yAndY2AxisLimit,
                constants.Y_AXIS
            );
        }
        if (hasY2Axis(config.axis)) {
            const labelPath = canvasSVG
                .append("g")
                .classed(styles.axisLabelY2, true)
                .attr(
                    "transform",
                    `translate(${getY2AxisLabelXPosition(
                        config
                    )}, ${getYAxisLabelYPosition(
                        config
                    )}) rotate(${getRotationForAxis(constants.Y2_AXIS)})`
                );
            buildAxisLabel(
                labelPath,
                utils.sanitize(config.axis.y2.label),
                axesLabelCharLimits.yAndY2AxisLimit
            );
            addLabelEventHandler(
                canvasSVG,
                styles.axisLabelY2,
                config.axis.y2,
                axesLabelCharLimits.yAndY2AxisLimit,
                constants.Y2_AXIS
            );
            /*
             * Label shapes are only applicable when we have a Y2 Axis
             * */
            control.axesLabelShapeGroup = {
                [constants.Y_AXIS]: buildYAxisLabelShapeContainer(
                    config,
                    canvasSVG
                ),
                [constants.Y2_AXIS]: buildY2AxisLabelShapeContainer(
                    config,
                    canvasSVG
                )
            };
        }
    }
};
/**
 * Creates a container for graph content (evident when there are no boundary ticks)
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {object} d3 svg path
 */
const createContentContainer = (config, canvasSVG) =>
    canvasSVG
        .append("rect")
        .classed(styles.contentContainer, true)
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(constants.Y_AXIS, calculateVerticalPadding(config));

/**
 * Creates and sets the d3 scale for the Graph. Once the scale is created
 * we can create the axes. To create a d3 scale, we need domain and range.
 * To create an axis we need scale, orientation and tick values, if needed
 *
 * The scale function uses d3.linear.nice which rounds the values in the axes.
 * i.e. [0.20147987687960267, 0.996679553296417] will get translated to [0.2, 1]
 *
 * The scale function uses d3.linear.clamp which "clamps" the scale so that any
 * input provided will clamp between the domain.
 * i.e. Before, If you have domain 0 to 20 (input lower and upper bounds) and range 0 to 100 (Width in px).
 * When input 20 is provided then the scale returns the px positioning as 200, which would put the point outside the graph.
 * Instead we clamp it within the graph as an upper bound using clamp. Now, it will return 100px.
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const scaleGraph = (scale, config) => {
    scale.x = getScale(config.axis.x.type)
        .domain(config.axis.x.domain)
        .range(getXAxisRange(config))
        .clamp(config.settingsDictionary.shouldClamp);

    scale.y = d3
        .scaleLinear()
        .domain([
            config.axis.y.domain.lowerLimit,
            config.axis.y.domain.upperLimit
        ])
        .range(getYAxisRange(config))
        .clamp(config.allowCalibration);
    if (config.axis.x.rangeRounding) {
        scale.x.nice();
    }
    if (config.allowCalibration && config.axis.y.rangeRounding) {
        scale.y.nice();
    }
    if (hasY2Axis(config.axis)) {
        scale.y2 = d3
            .scaleLinear()
            .domain([
                config.axis.y2.domain.lowerLimit,
                config.axis.y2.domain.upperLimit
            ])
            .range(getYAxisRange(config))
            .clamp(config.allowCalibration);
        if (config.allowCalibration && config.axis.y2.rangeRounding) {
            scale.y2.nice();
        }
    }
};
/**
 * Translates graph based on the current positioning on resize. We
 * don't need to resize the entire graph, in our case we just need to transform:
 *  The canvas height and width
 *  The axes x and y co-ordinates
 *  The grid x and y co-ordinates
 *  The labels x and y co-ordinates
 *
 *  @private
 *  @param {object} control - Graph instance
 *  @returns {undefined} - returns nothing
 */
const translateGraph = (control) => {
    translateCanvas(control.config, control.svg);
    translateDefs(control.config, control.svg);
    translateAxes(control.axis, control.scale, control.config, control.svg);
    translateGrid(control.axis, control.scale, control.config, control.svg);
    translateContentContainer(control.config, control.svg);
    translateLabel(control.config, control.svg);
    translateLabelShapeContainer(control.config, control.axesLabelShapeGroup);
    translateAxisReferenceLine(
        control.axis,
        control.scale,
        control.config,
        control.svg
    );
    translateDateline(
        control.scale,
        control.config,
        control.svg,
        getYAxisYPosition
    );
    translateEventline(
        control.scale,
        control.config,
        control.svg,
        getYAxisYPosition
    );
    translateNoDataView(control.config, control.svg);
};
/**
 * Pads the domain with some buffer that gets calculated based on input values.
 * Pad percentage is 5%
 *
 * @private
 * @param {object} domain - Lower and upper bounds for the axes. Currently only being performed for Y and Y2 axes
 * @param {boolean} isPaddingNeeded - represents if axis needs padding
 * @returns {object} - Bound adjusted (Padded) lower and upper bounds for the axes
 */
const padDomain = (domain, isPaddingNeeded = true) => {
    const lowerBound = domain.lowerLimit;
    const upperBound = domain.upperLimit;
    const domainRange = Math.abs(upperBound - lowerBound);
    const domainStretch = domainRange * (50 / 1000);
    return {
        lowerLimit: lowerBound - (isPaddingNeeded ? domainStretch : 0),
        upperLimit: upperBound + (isPaddingNeeded ? domainStretch : 0)
    };
};
/**
 * Calculates the height for Y and Y2 axes.
 * If dimensions are provided in the input, then they are given priority.
 * NOTE: For height calculations, we are providing contingency for values that are
 * outside the range of y and y2 axes upper and lower bounds. This is called an outlier stretch factor.
 * When default height is used then this stretch factor is applied and they wont be applicable when
 * an input of dimension.height is provided
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
    const verticalPadding = config.padding.top + config.padding.bottom;
    const halfHeight = (DEFAULT_HEIGHT - verticalPadding) / 2;
    return (
        halfHeight * config.outlierStretchFactor.upperLimit +
        halfHeight * config.outlierStretchFactor.lowerLimit
    );
};
/**
 * Returns the shape property from the data point.
 * If the shape is not provided then the default shape is Circle.
 *
 * @private
 * @param {object} dataPoint - Data point containing x, y co-ordinate points, color and shape.
 * @returns {string} provided shape or a circle.
 */
const getShapeForTarget = (dataPoint) => dataPoint.shape || SHAPES.CIRCLE;
/**
 * Returns the color property from the data point.
 * If the shape is not provided then the default color is #1C1F21 {black}.
 *
 * @private
 * @param {object} dataPoint - Data point containing x, y co-ordinate points, color and shape.
 * @returns {string} provided shape or a circle.
 */
const getColorForTarget = (dataPoint) =>
    dataPoint.color || constants.DEFAULT_COLOR;
/**
 * Attach event handlers for Line graph.
 * requestAnimationFrame will be used if consumer doesn't need
 * to throttle the graph resize. Which will result in a smoother animation
 * If the throttle is needed then use `throttle` property in the input JSON
 *
 * @private
 * @param {object} control - Graph instance
 * @returns {undefined} - returns nothing
 */
const attachEventHandlers = (control) => {
    let resizeTimeout = 0;
    const boundResize = control.resize.bind(control);
    const setRequestAnimationFrame = () =>
        window.requestAnimationFrame(boundResize);
    const getConfig = (config) => () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = d3.timeout(setRequestAnimationFrame, config.throttle);
    };
    const resizeCallback = getConfig(control.config);
    window.addEventListener("resize", resizeCallback, true);
    control.resizeHandler = resizeCallback;
};
/**
 * Detach event handlers currently set for Line graph
 *
 * @private
 * @param {object} control - Graph instance
 * @returns {undefined} - returns nothing
 */
const detachEventHandlers = (control) => {
    window.removeEventListener("resize", control.resizeHandler, true);
};
/**
 * Removes the element with provided selector using d3
 *
 * @private
 * @param {Selection|object} el - d3 selection element
 * @param {string} selector - attribute to query the element, typically a class or id
 * @param {boolean} [isBatchSelect] - enables `selectAll` rather than default `select`
 * @returns {undefined} - returns nothing
 */
const d3RemoveElement = (el, selector, isBatchSelect = false) => {
    if (!el) {
        return;
    }
    if (isBatchSelect) {
        el.selectAll(selector).remove();
    } else {
        el.select(selector).remove();
    }
};
/**
 * This toggles padding for y and y2 axis based on loaded content.
 * Checks if axisPadding is set to true or false inside input config.
 * If set to false, padding is turned off for that yAxis
 *
 * @private
 * @param {object} axisPadding - object representing padding values for y and y2
 * @param {object} config - input content's config object
 * @returns {undefined} - returns nothing
 */
const setAxisPadding = (axisPadding, { config }) => {
    const yAxis = config.yAxis ? config.yAxis : constants.Y_AXIS;
    if (utils.notEmpty(config.axisPadding)) {
        axisPadding[yAxis] = config.axisPadding;
    }
};
/**
 * Removes the No Data View from the node
 *
 * @private
 * @param {d3.selection} svg - d3 selection node of svg.
 * @returns {undefined} - returns nothing
 */
const removeNoDataView = (svg) => {
    d3RemoveElement(svg, `.${styles.noDataContainer}`);
};
/**
 * Append No Data View to the graph node.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} svg - d3 selection node of svg.
 * @returns {d3.selection} d3 selection node of svg.
 */
const drawNoDataView = (config, svg) => {
    removeNoDataView(svg);
    const noDataViewHeight =
        getYAxisHeight(config) / constants.NO_DATA_VIEW_PROPORTION;

    const noDataViewContainer = svg
        .append("g")
        .classed(styles.noDataContainer, true);

    noDataViewContainer
        .append("rect")
        .classed(styles.noDataOverlay, true)
        .attr(constants.X_AXIS, getXAxisXPosition(config))
        .attr(
            constants.Y_AXIS,
            calculateVerticalPadding(config) + noDataViewHeight
        )
        .attr("height", noDataViewHeight)
        .attr("width", getXAxisWidth(config));
    noDataViewContainer
        .append("text")
        .classed(styles.noDataLabel, true)
        .attr("x", getXAxisLabelXPosition(config))
        .attr(
            "y",
            getYAxisLabelYPosition(config) + constants.NO_DATA_LABEL_PADDING
        )
        .append("tspan")
        .text(config.locale.noData);

    return svg;
};

/**
 * Translates no data view rectangle and the label
 * based on the current positioning on resize.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} svg - d3 selection node of svg.
 *  @returns {undefined} - returns nothing
 */
const translateNoDataView = (config, svg) => {
    svg.select(`.${styles.noDataOverlay}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "height",
            getYAxisHeight(config) / constants.NO_DATA_VIEW_PROPORTION
        )
        .attr("width", getXAxisWidth(config));
    svg.select(`.${styles.noDataLabel}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr("x", getXAxisLabelXPosition(config))
        .attr(
            "y",
            getYAxisLabelYPosition(config) + constants.NO_DATA_LABEL_PADDING
        );
};

export {
    translateAxes,
    translateVerticalGrid,
    translateContentContainer,
    translateDefs,
    translateLabel,
    translateGrid,
    translateCanvas,
    updateAxesDomain,
    createDefs,
    createGrid,
    createLabel,
    createContentContainer,
    scaleGraph,
    translateGraph,
    padDomain,
    determineHeight,
    getShapeForTarget,
    getColorForTarget,
    attachEventHandlers,
    detachEventHandlers,
    d3RemoveElement,
    setAxisPadding,
    getAxisInfoRowLabelHeight,
    removeNoDataView,
    drawNoDataView
};
