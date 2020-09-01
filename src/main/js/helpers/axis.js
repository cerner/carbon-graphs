"use strict";

import * as d3 from "d3";
import Bar from "../controls/Bar/Bar";
import { getScale, getType, getDomain } from "../core/BaseConfig";
import constants, { AXES_ORIENTATION, AXIS_TYPE } from "../helpers/constants";
import styles from "../helpers/styles";
import utils from "../helpers/utils";
import { DEFAULT_TICK_FORMAT } from "../locale";
import { prepareHAxis } from "./datetimeBuckets";
import { shouldTruncateLabel, truncateLabel } from "./label";

/**
 * @module axis
 * @alias module:axis
 */

/**
 * Checks if Y or Y2 axis starts from Origin
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {string} yAxis - Y, Y2 etc
 * @returns {boolean} True if axis does not start from origin, false otherwise
 */
const hasNegativeLowerBound = (scale, yAxis = constants.Y_AXIS) =>
    d3.min(scale[yAxis].domain()) < 0 && d3.max(scale[yAxis].domain()) > 0;
/**
 * Parses the Y Axis lower and upper limits and returns it as an array for Y Axis reference line
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @returns {Array} x and y co-ordinate data for drawing a reference line
 */
const getReferenceLineData = (scale) => [
    {
        x: scale.x.domain()[0],
        y: 0
    },
    {
        x: scale.x.domain()[1],
        y: 0
    }
];
/**
 * Creates a simple reference line with x and y attributes
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {string} yAxis - Y, Y2 etc
 * @returns {d3.Line} A d3 line
 */
const createReferenceLine = (scale, yAxis) =>
    d3
        .line()
        .x((value) => scale.x(value.x))
        .y((value) => scale[yAxis](value.y));
/**
 * Create the d3 Axes - X, Y and Y2 and append into the canvas.
 * If axis.x.show, axis.y.show or axis.y2.show is set to false:
 * then the axis will be hidden
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const createAxes = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    prepareHAxis(scale, axis, config, prepareHorizontalAxis);
    canvasSVG
        .append("g")
        .classed(styles.axis, true)
        .classed(styles.axisX, true)
        .attr("aria-hidden", !config.axis.x.show)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)}, ${getXAxisYPosition(
                config
            )})`
        )
        .call(axis.x)
        .call(resetD3FontSize);
    canvasSVG
        .append("g")
        .classed(styles.axis, true)
        .classed(styles.axisY, true)
        .attr("aria-hidden", !config.axis.y.show)
        .attr(
            "transform",
            `translate(${getYAxisXPosition(config)}, ${getYAxisYPosition(
                config
            )})`
        )
        .call(axis.y)
        .call(resetD3FontSize);
    if (hasY2Axis(config.axis)) {
        canvasSVG
            .append("g")
            .classed(styles.axis, true)
            .classed(styles.axisY2, true)
            .attr(
                "transform",
                `translate(${getY2AxisXPosition(config)}, ${getY2AxisYPosition(
                    config
                )})`
            )
            .call(axis.y2)
            .call(resetD3FontSize);
    }
};

/**
 * Create the axis for text labels
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createXAxisInfoRow = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    canvasSVG
        .append("g")
        .classed(styles.axis, true)
        .classed(styles.axisInfoRow, true)
        .attr("aria-hidden", true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)}, ${getAxisInfoRowYPosition(
                config
            )})`
        )
        .call(axis.axisInfoRow.x)
        .call(resetD3FontSize);
};

/**
 * Creates a horizontal reference line at 0, when Y Axis does not start at 0.
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const createAxisReferenceLine = (axis, scale, config, canvasSVG) => {
    const transformAttribute = `translate(${getYAxisXPosition(
        config
    )}, ${getYAxisYPosition(config)})`;
    const setReferenceLineAttributes = (path, style) =>
        path
            .classed(styles.axisReferenceLine, true)
            .attr("aria-hidden", !hasNegativeLowerBound(scale, style))
            .attr("transform", transformAttribute)
            .attr(
                "d",
                createReferenceLine(scale, style)(getReferenceLineData(scale))
            );
    setReferenceLineAttributes(canvasSVG.append("path"), constants.Y_AXIS)
        .classed(styles.axis, true)
        .classed(styles.axisY, true);
    if (hasY2Axis(config.axis)) {
        setReferenceLineAttributes(canvasSVG.append("path"), constants.Y2_AXIS)
            .classed(styles.axis, true)
            .classed(styles.axisY2, true);
    }
};

/**
 * Prepares X,Y,Y2 and an optional axis info row (label row for Bar graphs) Axes according to their scale and available container width and height
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @returns {object} - Scaled axes object
 */
const getAxesScale = (axis, scale, config) => {
    let tickFormatToTrimTrailingZeros;

    // If suppressTrailingZeros is set to true and x axis type is set as
    // DEFAULT (normal number based axes values) and x axis's tick format
    // is not provided by the consumer, then invoke tickFormatter()
    // to insert '~' just before the default d3 tick format type
    // to suppress ticks values's trailing zeros
    if (
        config.axis.x.suppressTrailingZeros &&
        config.axis.x.type === AXIS_TYPE.DEFAULT &&
        utils.isUndefined(config.axis.x.ticks.format)
    ) {
        axis.x = isXAxisOrientationTop(config.axis.x.orientation)
            ? d3.axisTop(scale.x)
            : d3.axisBottom(scale.x);
        tickFormatToTrimTrailingZeros = tickFormatter(axis.x);
    }

    axis.x = prepareXAxis(
        scale.x,
        config.axis.x.ticks.values,
        getXAxisWidth(config),
        getAxisTickFormat(
            config.d3Locale,
            utils.isDefined(config.axis.x.ticks.format)
                ? config.axis.x.ticks.format
                : tickFormatToTrimTrailingZeros,
            config.axis.x.type
        ),
        config.axis.x.orientation
    );

    // Reset the tickFormatToTrimTrailingZeros to null, so that
    // if the y axis suppressTrailingZeros is set to false and
    // consumer has not defined its tick format,
    // we can ensure we are not using the same x axis's tick format
    // for y axis as well
    tickFormatToTrimTrailingZeros = null;

    axis.axisInfoRow.x = prepareXAxisInfoRow(
        scale.x,
        getAxisInfoOrientation(config.axis.x.orientation)
    );

    if (hasY2Axis(config.axis)) {
        // Y and Y2 axes - custom tick values. Takes priority
        // and ignores ticksCount if it is set. Will not work if only
        // Y2 ticks are provided.
        if (utils.isDefined(config.axis.y.ticks.values)) {
            // If suppressTrailingZeros is set to true and y axis's tick format
            // is not provided by the consumer, then invoke tickFormatter()
            // to insert '~' just before the default d3 tick format type
            // to suppress ticks values's trailing zeros
            if (
                config.axis.y.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y.ticks.format)
            ) {
                axis.y = d3.axisLeft(scale.y);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y);
            }
            axis.y = prepareYAxis(
                scale.y,
                config.axis.y.ticks.values,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y.ticks.format)
                        ? config.axis.y.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );

            // Reset the tickFormatToTrimTrailingZeros to null, so that
            // if the y2 axis suppressTrailingZeros is set to false and
            // consumer has not defined its tick format,
            // we can ensure we are not using the same y axis's tick format
            // for y2 axis as well
            tickFormatToTrimTrailingZeros = null;

            // If suppressTrailingZeros is set to true and y2 axis's tick format
            // is not provided by the consumer, then invoke tickFormatter()
            // to insert '~' just before the default d3 tick format type
            // to suppress ticks values's trailing zeros
            if (
                config.axis.y2.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y2.ticks.format)
            ) {
                axis.y2 = d3.axisRight(scale.y2);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y2);
            }
            axis.y2 = prepareY2Axis(
                scale.y2,
                config.axis.y2.ticks.values,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y2.ticks.format)
                        ? config.axis.y2.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
            return axis;
        }
        // Y and Y2 axes - ticksCount.
        else if (
            utils.isDefined(config.ticksCount) &&
            config.ticksCount <= constants.TICKSCOUNT_MAXLIMIT
        ) {
            const yTickValues = generateYAxesTickValues(
                config.axis.y.domain.lowerLimit,
                config.axis.y.domain.upperLimit,
                config.ticksCount,
                config.allowCalibration
            );

            const y2TickValues = generateYAxesTickValues(
                config.axis.y2.domain.lowerLimit,
                config.axis.y2.domain.upperLimit,
                config.ticksCount,
                config.allowCalibration
            );

            if (
                config.axis.y.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y.ticks.format)
            ) {
                axis.y = d3.axisLeft(scale.y);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y);
            }
            axis.y = prepareYAxis(
                scale.y,
                yTickValues,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y.ticks.format)
                        ? config.axis.y.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
            tickFormatToTrimTrailingZeros = null;

            if (
                config.axis.y2.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y2.ticks.format)
            ) {
                axis.y2 = d3.axisRight(scale.y2);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y2);
            }
            axis.y2 = prepareY2Axis(
                scale.y2,
                y2TickValues,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y2.ticks.format)
                        ? config.axis.y2.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
        }
        // Y and Y2 axes - If ticksCount is undefined or greater than
        // TICKS_MAXCOUNT AND if the Y2 is visible, then utilize a default value
        // for the ticksCount. This is based on the ranges of the Y & Y2 axes.
        else {
            const ticksCount = getAverageTicksCount(
                config.axis.y.domain.upperLimit -
                    config.axis.y.domain.lowerLimit,
                config.axis.y2.domain.upperLimit -
                    config.axis.y2.domain.lowerLimit
            );

            const yTickValues = generateYAxesTickValues(
                config.axis.y.domain.lowerLimit,
                config.axis.y.domain.upperLimit,
                ticksCount,
                config.allowCalibration
            );
            const y2TickValues = generateYAxesTickValues(
                config.axis.y2.domain.lowerLimit,
                config.axis.y2.domain.upperLimit,
                ticksCount,
                config.allowCalibration
            );

            if (
                config.axis.y.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y.ticks.format)
            ) {
                axis.y = d3.axisLeft(scale.y);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y);
            }
            axis.y = prepareYAxis(
                scale.y,
                yTickValues,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y.ticks.format)
                        ? config.axis.y.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
            tickFormatToTrimTrailingZeros = null;

            if (
                config.axis.y2.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y2.ticks.format)
            ) {
                axis.y2 = d3.axisRight(scale.y2);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y2);
            }
            axis.y2 = prepareY2Axis(
                scale.y2,
                y2TickValues,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y2.ticks.format)
                        ? config.axis.y2.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
        }
    }
    // Only single Y axis
    else {
        // Single Y axis - custom tick values
        if (utils.isDefined(config.axis.y.ticks.values)) {
            if (
                config.axis.y.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y.ticks.format)
            ) {
                axis.y = d3.axisLeft(scale.y);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y);
            }
            axis.y = prepareYAxis(
                scale.y,
                config.axis.y.ticks.values,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y.ticks.format)
                        ? config.axis.y.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
            // return axis;
        }
        // Single Y axis - ticksCount is defined
        else if (
            utils.isDefined(config.ticksCount) ||
            config.ticksCount <= constants.TICKSCOUNT_MAXLIMIT
        ) {
            const yTickValues = generateYAxesTickValues(
                config.axis.y.domain.lowerLimit,
                config.axis.y.domain.upperLimit,
                config.ticksCount,
                config.allowCalibration
            );

            if (
                config.axis.y.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y.ticks.format)
            ) {
                axis.y = d3.axisLeft(scale.y);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y);
            }
            axis.y = prepareYAxis(
                scale.y,
                yTickValues,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y.ticks.format)
                        ? config.axis.y.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
        }
        // Single Y axis - default case when
        // config.axis.y.ticks.values and ticksCount
        // are not defined
        else {
            if (
                config.axis.y.suppressTrailingZeros &&
                utils.isUndefined(config.axis.y.ticks.format)
            ) {
                axis.y = d3.axisLeft(scale.y);
                tickFormatToTrimTrailingZeros = tickFormatter(axis.y);
            }
            axis.y = prepareYAxis(
                scale.y,
                undefined,
                config.height,
                getAxisTickFormat(
                    config.locale,
                    utils.isDefined(config.axis.y.ticks.format)
                        ? config.axis.y.ticks.format
                        : tickFormatToTrimTrailingZeros
                )
            );
        }
    }
    return axis;
};

/**
 * Inserts '~' just before the format type to suppress ticks values's trailing zeros when default d3 tick formatting is used
 *
 * @private
 * @param {object} axis - Scaled axes object
 * @returns {string} tick format string
 */
const tickFormatter = (axis) => {
    const defaultTickFormat = axis.scale().tickFormat().toString();

    // Return the default d3 tick format with the '~' character inserted just before the format type
    // Eg: defaultTickFormat: .1f
    // Value returned below will be: .1~f
    return `${defaultTickFormat.slice(
        0,
        defaultTickFormat.length - 1
    )}~${defaultTickFormat.slice(defaultTickFormat.length - 1)}`;
};

/**
 * Ticks can be formatted by passing the format string via input JSON.
 * For Empty tick labels consumer would pass format as "" (blank)
 * For formatting numbers (x,y,y2 axes ticks) use Python specifiers.
 * Ticks can also be formatted for date time inputs.
 *
 * @private
 * @see https://docs.python.org/2/library/string.html#format-specification-mini-language
 * @see https://github.com/d3/d3-time-format/blob/master/README.md#locales
 * @param {object} locale - d3 Locale object
 * @param {string} format - tick format string
 * @param {string} type - default or timeseries chart type
 * @returns {object} d3 locale object formatter
 */
const getAxisTickFormat = (locale, format, type = AXIS_TYPE.DEFAULT) => {
    if (format === "") {
        return format;
    }
    const _locale =
        type === AXIS_TYPE.TIME_SERIES
            ? d3.timeFormatDefaultLocale(locale)
            : d3.formatDefaultLocale(locale);

    if (utils.isEmpty(format)) {
        return DEFAULT_TICK_FORMAT;
    }
    return _locale.format(format);
};

/**
 * Gets the tick values with correct format.
 * If there are no tick values provided then null is returned
 * If the ticks values are in a ISO8601 format then a date object is returned
 * No processing is done, otherwise
 *
 * @private
 * @param {Array} ticks - Array of values that represent the tick values
 * @returns {(Array|null)} returns processed ticks, null otherwise
 */
const processTickValues = (ticks) => {
    if (utils.isEmpty(ticks)) {
        return null;
    }
    return ticks.map((t) => (utils.isDate(t) ? utils.parseDateTime(t) : t));
};

/**
 * Gets the number of ticks on the axis based on the upper and lower limits
 *
 * @private
 * @param {number} range - range of values (upperLimit - lowerLimits)
 * @returns {number} returns number of ticks for that range, based on a predefined set
 */
const getTicksCountFromRange = (range) => {
    let ticksCount;

    switch (true) {
        case range <= constants.AXISRANGE_ONE:
            ticksCount = constants.DEFAULT_TICKSCOUNT - 4;
            break;

        case range <= constants.AXISRANGE_TWO:
            ticksCount = constants.DEFAULT_TICKSCOUNT - 3;
            break;

        case range <= constants.AXISRANGE_THREE:
            ticksCount = constants.DEFAULT_TICKSCOUNT - 2;
            break;

        case range <= constants.AXISRANGE_FOUR:
            ticksCount = constants.DEFAULT_TICKSCOUNT - 1;
            break;

        default:
            ticksCount = constants.DEFAULT_TICKSCOUNT;
    }

    return ticksCount;
};

/**
 * Gets average number of ticks to be used based on the Y and Y2 axes
 * result from getTicksCountFromRange for Y and Y2 axes
 *
 * @private
 * @param {number} rangeY - Y axis range (upperLimit - lowerLimit)
 * @param {number} rangeY2 - Y2 axis range (upperLimit - lowerLimit)
 * @returns {number} returns number of ticks to be rendered between the upper limits & lower limits with
 */
const getAverageTicksCount = (rangeY, rangeY2) => {
    const yTicksCount = getTicksCountFromRange(rangeY);
    const y2TicksCount = getTicksCountFromRange(rangeY2);

    return Math.round((yTicksCount + y2TicksCount) / 2);
};

/**
 * Generates an array of tick values for to be used as the
 * tick labels on the Y & Y2 axis.
 *
 * @private
 * @param {number} lowerLimit - Lower limit of the Y or Y2 Axis
 * @param {number} upperLimit - Upper limit of the Y or Y2 Axis
 * @param {number} ticksCount - Number of ticks between the upper and lower limits
 * @param {boolean} allowCalibration - Whether this property is true or false
 * @returns {(Array)} returns array of values to be used as tick labels
 */
const generateYAxesTickValues = (
    lowerLimit,
    upperLimit,
    ticksCount = constants.DEFAULT_TICKSCOUNT,
    allowCalibration = true
) => {
    ticksCount = Math.abs(ticksCount);
    const tickValues = [];

    // use the d3,js nice function to round off the upper and lower limits
    // to multiples of 2, 5 or 10

    if (allowCalibration) {
        [lowerLimit, upperLimit] = d3
            .scaleLinear()
            .domain([lowerLimit, upperLimit])
            .nice()
            .domain();
    }

    tickValues.push(lowerLimit);
    tickValues.push(upperLimit);

    if (lowerLimit < 0) {
        tickValues.push(0);
    }

    const interval = (upperLimit - lowerLimit) / (ticksCount + 1);

    for (let index = 1; index <= ticksCount; index++) {
        tickValues.push(lowerLimit + interval * index);
    }

    return tickValues;
};

/**
 * Based on x axis orientation, sets the axis info row orientation.
 * If x axis orientation is top, axis info row orientation is bottom.
 * If x axis orientation is bottom, axis info row orientation is top.
 *
 * @private
 * @param {string} xAxisOrientation - x axis orientation
 * @returns {string} returns orientation for axis info row.
 */
const getAxisInfoOrientation = (xAxisOrientation) =>
    isXAxisOrientationTop(xAxisOrientation)
        ? AXES_ORIENTATION.X.BOTTOM
        : AXES_ORIENTATION.X.TOP;
/**
 * Creates the axis using the scale provided for X Axis using d3 svg axis.
 * If tickValues are provided then they are reserved precedence over ticks/tick counts.
 *
 * @private
 * @param {object} scale - d3 scale calculated using domain and range
 * @param {Array} tickValues - Array of values that represent the tick values
 * @param {number} width - Width of the canvas which will be used to tell d3 how many ticks to
 * keep in the X axis
 * @param {object} format - d3 locale object formatted to represent the tick.
 * @param {string} [orientation] - Axis orientation
 * @returns {object} d3 object which forms the x-axis scale
 */
const prepareXAxis = (
    scale,
    tickValues,
    width,
    format,
    orientation = AXES_ORIENTATION.X.BOTTOM
) => {
    let d3Axis = d3.axisBottom(scale);
    if (isXAxisOrientationTop(orientation)) {
        d3Axis = d3.axisTop(scale);
    }
    d3Axis
        .ticks(
            Math.max(width / constants.MAX_TICK_VARIANCE, constants.MIN_TICKS)
        )
        .tickValues(processTickValues(tickValues))
        .tickFormat(format);
    return d3Axis;
};

/**
 * Creates the axis using the scale provided for X Axis using d3 svg axis.
 *
 * @private
 * @param {object} scale - d3 scale calculated using domain and range
 * @param {string} [orientation] - Axis orientation
 * @returns {object} d3 object which forms the text label axis scale
 */
const prepareXAxisInfoRow = (
    scale,
    orientation = AXES_ORIENTATION.X.BOTTOM
) => {
    let d3Axis = d3.axisBottom(scale);
    if (isXAxisOrientationTop(orientation)) {
        d3Axis = d3.axisTop(scale);
    }
    d3Axis.tickValues([]);
    return d3Axis;
};

/**
 * Helper function to Create the axis using the scale provided for X Axis using d3 svg axis.
 *
 * @param {object} scale - d3 scale calculated using domain and range
 * @param {Array} tickValues - Array of values that represent the tick values
 * @param {object} config - config object derived from input JSON
 * @param {string} [orientation] - Axis orientation
 * @returns {object} - d3 Object which forms the axis scale
 */
const prepareHorizontalAxis = (scale, tickValues, config, orientation) =>
    prepareXAxis(
        scale.x,
        tickValues,
        getXAxisWidth(config),
        getAxisTickFormat(
            config.d3Locale,
            config.axis.x.ticks.format,
            config.axis.x.type
        ),
        orientation
    );

/**
 * Creates the axis using the scale provided for Y Axis using d3 svg axis
 *
 * @private
 * @param {object} scale - d3 scale calculated using domain and range
 * @param {Array} tickValues - Array of values that represent the tick values
 * @param {number} height - Height of the Y Axis to calculate the number of Y Axis ticks
 * @param {object} format - d3 locale object formatted to represent the tick.
 * @returns {object} d3 object which forms the y-axis scale
 */
const prepareYAxis = (scale, tickValues, height, format) =>
    d3
        .axisLeft(scale)
        .ticks(height / constants.DEFAULT_Y_AXIS_SPACING)
        .tickValues(tickValues)
        .tickFormat(format);

/**
 * Creates the axis using the scale provided for Y2 Axis using d3 svg axis
 *
 * @private
 * @param {object} scale - d3 scale calculated using domain and range
 * @param {Array} tickValues - Array of values that represent the tick values
 * @param {number} height - Height of the Y2 Axis to calculate the number of Y2 Axis ticks
 * @param {object} format - d3 locale object formatted to represent the tick.
 * @returns {object} d3 object which forms the y2-axis scale
 */
const prepareY2Axis = (scale, tickValues, height, format) =>
    d3
        .axisRight(scale)
        .ticks(height / constants.DEFAULT_Y_AXIS_SPACING)
        .tickValues(tickValues)
        .tickFormat(format);

/**
 * Returns the number of degrees the rotation of axis needs to be performed based on axis
 *
 * @private
 * @param {string} axis - X, Y or Y2 axis
 * @returns {number} amount of degrees the rotation needs to be performed
 */
const getRotationForAxis = (axis) => {
    switch (axis) {
        case constants.Y_AXIS:
            return -90;
        case constants.Y2_AXIS:
            return 90;
        default:
            return 0;
    }
};
/**
 * X Axis label's starting position below the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label
 */
const getXAxisLabelXPosition = (config) =>
    getXAxisXPosition(config) + getXAxisWidth(config) / 2;
/**
 * X Axis label's position vertically below the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label
 */
const getXAxisLabelYPosition = (config) =>
    isXAxisOrientationTop(config.axis.x.orientation)
        ? calculateVerticalPadding(config) - config.axisLabelHeights.x * 2
        : getXAxisYPosition(config) +
          config.axisLabelHeights.x * 2 +
          (config.padding.bottom - config.axisInfoRowLabelHeight) * 2;
/**
 * Y Axis label's starting position vertically beside the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label
 */
const getYAxisLabelXPosition = (config) => {
    // If y2-axis is true, y-axis label should move close to svg container else move closer to y-axis.
    if (hasY2Axis(config.axis)) {
        return config.padding.left - config.axisLabelWidths.y;
    } else {
        return config.padding.left;
    }
};
/**
 * Y Axis label's position distance away from the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label
 */
const getYAxisLabelYPosition = (config) =>
    getYAxisYPosition(config) +
    (getYAxisHeight(config) - config.padding.left / 2) / 2;
/**
 * Y Axis label shape starting position vertically beside the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label shape
 */
const getYAxisLabelShapeXPosition = (config) =>
    getYAxisLabelXPosition(config) + constants.BASE_LABEL_ICON_HEIGHT_PADDING;
/**
 * Y Axis label shape position distance away from the graph.
 * We are taking the Container height and adding it with
 * half of the width for label shape container so that it centers to the graph.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {number} shapeCount - Number of shapes within shape container
 * @returns {number} Position for the label
 */
const getYAxisLabelShapeYPosition = (config, shapeCount) =>
    getYAxisLabelYPosition(config) +
    (shapeCount * constants.BASE_LABEL_ICON_HEIGHT_PADDING) / 1.5;
/**
 * Y2 Axis label shape position distance away from the graph.
 * We are taking the Container height and subtracting it with
 * Label shape container width to center it with respect to the
 * container in reverse order.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {number} shapeCount - Number of shapes within shape container
 * @returns {number} Position for the label
 */
const getY2AxisLabelShapeYPosition = (config, shapeCount) =>
    getYAxisLabelYPosition(config) -
    (shapeCount * constants.BASE_LABEL_ICON_HEIGHT_PADDING) / 1.5;
/**
 * Y2 Axis label's starting position vertically beside the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label
 */
const getY2AxisLabelXPosition = (config) =>
    getY2AxisXPosition(config) +
    config.padding.right +
    config.axisLabelWidths.y2;
/**
 * Y2 Axis label shape starting position vertically beside the graph
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the label shape
 */
const getY2AxisLabelShapeXPosition = (config) =>
    getY2AxisLabelXPosition(config) - constants.BASE_LABEL_ICON_HEIGHT_PADDING;
/**
 * Calculates Vertical Padding according to X Axis orientation
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Vertical Padding for X Axis
 */
const calculateVerticalPadding = (config) => {
    if (!isXAxisOrientationTop(config.axis.x.orientation)) {
        return config.padding.bottom;
    } else if (!config.axisLabelHeights.x) {
        return config.padding.top;
    }
    return config.axisLabelHeights.x * 2 + config.padding.top;
};
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
 * X Axis's position vertically relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getAxisInfoRowYPosition = (config) =>
    isXAxisOrientationTop(config.axis.x.orientation)
        ? getYAxisHeight(config) + calculateVerticalPadding(config)
        : calculateVerticalPadding(config);
/**
 * Axis Info Row's position vertically relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getXAxisYPosition = (config) =>
    isXAxisOrientationTop(config.axis.x.orientation)
        ? calculateVerticalPadding(config)
        : getYAxisHeight(config) + calculateVerticalPadding(config);
/**
 * Y Axis's starting position relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getYAxisXPosition = (config) => getXAxisXPosition(config);
/**
 * Y Axis's position vertically relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getYAxisYPosition = (config) => calculateVerticalPadding(config);
/**
 * Y2 Axis's starting position relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getY2AxisXPosition = (config) =>
    getYAxisXPosition(config) + getXAxisWidth(config);
/**
 * Y2 Axis's position vertically relative to the canvas
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Position for the axis
 */
const getY2AxisYPosition = (config) => calculateVerticalPadding(config);
/**
 * X Axis's width that will hold equally spaced ticks
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} X Axis width
 */
const getXAxisWidth = (config) =>
    config.canvasWidth -
    config.axisSizes.y -
    config.axisSizes.y2 -
    config.axisLabelWidths.y -
    config.axisLabelWidths.y2;
/**
 * Y Axis height for the axis and canvas region to clip the chart within
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Height of the canvas
 */
const getYAxisHeight = (config) => config.height;
/**
 * X Axis height for the axis and labels to display within
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {number} Height of the X Axis ticks, labels and numbers/datetimes
 */
const getXAxisHeight = (config) => {
    if (config.padding.hasCustomPadding) {
        return config.padding.bottom;
    }
    const scale = getScale(config.axis.x.type)
        .domain(config.axis.x.domain)
        .range([0, config.canvasWidth]);
    const axis = d3.axisBottom(scale);
    const dummy = d3.select("body").append("div");
    const svg = dummy.append("svg");
    const group = svg.append("g").call(axis);
    const height = group.node().getBoundingClientRect().height;
    dummy.remove();
    return height;
};
/**
 * X Axis range used to instruct d3 when creating a scale
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {Array} lower and upper bound forming the range
 */
const getXAxisRange = (config) => [0, getXAxisWidth(config)];
/**
 * Y Axis range used to instruct d3 when creating a scale
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {Array} lower and upper bound forming the range
 */
const getYAxisRange = (config) => [getYAxisHeight(config), 0];
/**
 * Dynamically generate the label width for axes
 *
 * @private
 * @param {string} label - Label text
 * @param {string} axis - x, y or y2
 * @returns {number} label width
 */
const getAxisLabelWidth = (label, axis) => {
    const dummy = d3.select("body").append("div");
    const svg = dummy.append("svg");
    const grouper = svg
        .append("g")
        .attr("transform", `rotate(${getRotationForAxis(axis)})`);
    buildAxisLabel(grouper, label);
    const width = grouper.node().getBoundingClientRect().width;
    dummy.remove();
    return width;
};

/**
 * Dynamically generate the label height for axes
 *
 * @private
 * @param {string} label - Label text
 * @returns {number} label height
 */
const getAxisLabelHeight = (label) => {
    const dummy = d3.select("body").append("div");
    const svg = dummy.append("svg");
    const grouper = svg.append("g");
    buildAxisLabel(grouper, label);
    const height = grouper.node().getBoundingClientRect().height;
    dummy.remove();
    return height;
};

/**
 * Dynamically generate the label width for y axes
 *
 * @private
 * @param {string} id - y or y2
 * @param {object} config - config object derived from input JSON
 * @returns {number} label width
 */
const getYAxisWidth = (id, config) => {
    if (config.padding.hasCustomPadding) {
        return config.padding.left;
    }
    const scale = d3
        .scaleLinear()
        .domain([
            config.axis[id].domain.lowerLimit,
            config.axis[id].domain.upperLimit
        ])
        .range([config.height, 0]);
    const axis = d3.axisLeft(scale);
    const dummy = d3.select("body").append("div");
    const svg = dummy.append("svg");
    const yAxisSVG = svg.append("g").call(axis);
    const width = yAxisSVG.node().getBoundingClientRect().width;
    dummy.remove();
    return width;
};

/**
 * Generate the label width for y2 axes.
 *
 * @private
 * @param {object} config - config object derived from input JSON.
 * @returns {number} label width
 */
const getY2AxisWidth = (config) => {
    if (config.padding.hasCustomPadding) {
        return config.padding.right;
    }
    return hasY2Axis(config.axis)
        ? getYAxisWidth(constants.Y2_AXIS, config)
        : 20;
};

/**
 * Checks if X Axis orientation is set to top
 *
 * @private
 * @param {string} xAxisOrientation - X Axis orientation
 * @returns {boolean} - true if X Axis orientation is set to top, false if it is bottom(default)
 */
const isXAxisOrientationTop = (xAxisOrientation) =>
    xAxisOrientation === AXES_ORIENTATION.X.TOP;
/**
 * Calculates axes sizes, specifically:
 *  X Axis: Height
 *  Y Axis: Width
 *  Y2 Axis: Width
 *
 *  @private
 *  @param {object} config - config object derived from input JSON
 *  @returns {undefined} - returns nothing
 */
const calculateAxesSize = (config) => {
    config.axisSizes = {};
    config.axisSizes.y =
        getYAxisWidth(constants.Y_AXIS, config) + config.padding.left;
    config.axisSizes.y2 = getY2AxisWidth(config) + config.padding.right;
    config.axisSizes.x = getXAxisHeight(config);
};

/**
 * Calculates axes label sizes, specifically:
 *  X Axis Label: Height
 *  Y Axis Label: Width
 *  Y2 Axis Label: Width
 *
 *  @private
 *  @param {object} config - config object derived from input JSON
 *  @returns {undefined} - returns nothing
 */
const calculateAxesLabelSize = (config) => {
    config.axisLabelHeights = {};
    config.axisLabelWidths = {};
    config.axisLabelHeights.x = 0;
    config.axisLabelWidths.y = 0;
    config.axisLabelWidths.y2 = 0;
    config.axisInfoRowLabelHeight = 0;
    if (config.showLabel) {
        if (config.axis.x.label) {
            config.axisLabelHeights.x = getAxisLabelHeight(config.axis.x.label);
        }
        if (config.axis.y.label) {
            config.axisLabelWidths.y = getAxisLabelWidth(
                config.axis.y.label,
                constants.Y_AXIS
            );
        }
        if (hasY2Axis(config.axis) && config.axis.y2.label) {
            config.axisLabelWidths.y2 = hasY2Axis(config.axis)
                ? getAxisLabelWidth(config.axis.y2.label, constants.Y2_AXIS)
                : 0;
        }
    }
};

/**
 * Returns the mid value of the axis domain relative to the lower bound
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @param {string} yAxis - Y, Y2 etc
 * @returns {number} returns a number representing the mid value of y axes domain
 */
const getMidPoint = (config, yAxis) => {
    const axisMidValue =
        (config.axis[yAxis].domain.upperLimit -
            config.axis[yAxis].domain.lowerLimit) /
        2;
    return config.axis[yAxis].domain.lowerLimit + axisMidValue;
};

/**
 * Calculates the lower part of the outlier based on data points.
 * If the content has any data points that are outside the lower and upper bounds set
 * in the vertical axis then we adjust the axis bounds to support that outlier value.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {Array} List of lower bound values for each of the vertical axis
 */
const getLowerOutlierStretchFactorList = (config) => {
    const lowerStretchFactors = [];
    const getMinValue = (config, yAxis, axisMinValue) => {
        const dataRangeMinValue = config.axis[yAxis].dataRange.min;
        return dataRangeMinValue < axisMinValue
            ? dataRangeMinValue
            : axisMinValue;
    };
    const getLowerStretchFactor = (yAxis) => {
        const axisMinValue = config.axis[yAxis].domain.lowerLimit;
        const axisMidPoint = getMidPoint(config, yAxis);
        const lowerStretchFactor = Math.abs(
            (axisMidPoint - getMinValue(config, yAxis, axisMinValue)) /
                (axisMidPoint - axisMinValue)
        );
        return lowerStretchFactor > 1 ? lowerStretchFactor : 1;
    };
    lowerStretchFactors.push(getLowerStretchFactor(constants.Y_AXIS));
    if (hasY2Axis(config.axis)) {
        lowerStretchFactors.push(getLowerStretchFactor(constants.Y2_AXIS));
    }
    return lowerStretchFactors;
};

/**
 * Updates the x axis domain values.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 */
const updateXAxisDomain = (config) => {
    config.axis.x.domain = getDomain(
        config.axis.x.type,
        config.axis.x.lowerLimit,
        config.axis.x.upperLimit
    );
};
/**
 * Calculates the upper part of the outlier based on data points.
 * If the content has any data points that are outside the lower and upper bounds set
 * in the vertical axis then we adjust the axis bounds to support that outlier value.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {Array} List of upper bound values for each of the vertical axis
 */
const getUpperOutlierStretchFactorList = (config) => {
    const upperStretchFactors = [];
    const getMaxValue = (config, yAxis, axisMaxValue) => {
        const dataRangeMaxValue = config.axis[yAxis].dataRange.max;
        return dataRangeMaxValue > axisMaxValue
            ? dataRangeMaxValue
            : axisMaxValue;
    };
    const getUpperStretchFactor = (yAxis) => {
        const axisMaxValue = config.axis[yAxis].domain.upperLimit;
        const axisMidPoint = getMidPoint(config, yAxis);
        const upperStretchFactor = Math.abs(
            (getMaxValue(config, yAxis, axisMaxValue) - axisMidPoint) /
                (axisMaxValue - axisMidPoint)
        );
        return upperStretchFactor > 1 ? upperStretchFactor : 1;
    };
    upperStretchFactors.push(getUpperStretchFactor(constants.Y_AXIS));
    if (hasY2Axis(config.axis)) {
        upperStretchFactors.push(getUpperStretchFactor(constants.Y2_AXIS));
    }
    return upperStretchFactors;
};

/**
 * Determines if the values provided exceed the lower and upper bounds provided in the Y or Y2 axes
 * If the values exceed the bounds then the range and domain are adjusted accordingly.
 * There is no outlier check for X axis, for now, due to the possibility that X axis can be a timeseries.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {object} stretch factor determines the new upper and lower limit.
 */
const determineOutlierStretchFactor = (config) => {
    const sortOutlier = (firstValue, secondValue) => secondValue - firstValue;
    return {
        upperLimit: getUpperOutlierStretchFactorList(config).sort(
            sortOutlier
        )[0],
        lowerLimit: getLowerOutlierStretchFactorList(config).sort(
            sortOutlier
        )[0]
    };
};

/**
 * Checks if the Axis label needs to be truncated and returns the truncated value
 *
 * @param {string} label - Axis label display property
 * @param {number} charLimit  - label character limit on axis
 * @returns {string} if more than character limit then truncates,
 * normal label otherwise
 */
const formatLabel = (label, charLimit) =>
    shouldTruncateLabel(label, Math.abs(charLimit))
        ? truncateLabel(label, Math.abs(charLimit))
        : label;

/**
 * Returns the d3 html element after appending axis label text
 *
 * @param {Array} group - d3 html element
 * @param {string} label - Label text
 * @param {number} charLimit - character limit of label with respect to axis size
 * @returns {Array} d3 html element
 */
const buildAxisLabel = (group, label, charLimit) =>
    group
        .append("text")
        .attr("text-anchor", "middle")
        .append("tspan")
        .text(formatLabel(label, charLimit));
/**
 * Decides true if the input JSON y2.show is enabled and if y2 axis points are provided
 *
 * @private
 * @param {object} axis - x, y and y2 axes values
 * @returns {boolean} True if enabled
 */
const hasY2Axis = (axis) => utils.isDefined(axis.y2) && axis.y2.show;
/**
 * D3 adds font-size and font-family by default to axis, to use/inherit consumer fonts
 * we have to override the properties.
 * https://github.com/d3/d3-axis/issues/36
 *
 * @private
 * @param {d3.selection} axisD3Element - Axis element post rendering in D3
 * @returns {undefined} returns nothing
 */
const resetD3FontSize = (axisD3Element) =>
    axisD3Element.attr("font-size", null).attr("font-family", null);
/**
 * Updates the x, y, y2 (if enabled) and axis info row(if enabled) positions on resize
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateAxes = (axis, scale, config, canvasSVG) => {
    getAxesScale(axis, scale, config);
    prepareHAxis(scale, axis, config, prepareHorizontalAxis);
    canvasSVG
        .select(`.${styles.axisX}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${getXAxisYPosition(
                config
            )})`
        )
        .call(axis.x);
    canvasSVG
        .select(`.${styles.axisY}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getYAxisXPosition(config)}, ${getYAxisYPosition(
                config
            )})`
        )
        .call(axis.y);
    if (hasY2Axis(config.axis)) {
        canvasSVG
            .select(`.${styles.axisY2}`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr(
                "transform",
                `translate(${getY2AxisXPosition(config)}, ${getY2AxisYPosition(
                    config
                )})`
            )
            .call(axis.y2);
    }
    canvasSVG
        .select(`.${styles.axisInfoRow}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)}, ${getAxisInfoRowYPosition(
                config
            )})`
        )
        .call(axis.axisInfoRow.x);
};
/**
 * Updates the Y axis reference line when resized. This is also called
 * when a content is loaded.
 *
 * @private
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const translateAxisReferenceLine = (axis, scale, config, canvasSVG) => {
    const setTranslate = (path, style) =>
        path
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr("aria-hidden", false)
            .attr(
                "d",
                createReferenceLine(scale, style)(getReferenceLineData(scale))
            );
    if (hasNegativeLowerBound(scale, constants.Y_AXIS)) {
        setTranslate(
            canvasSVG.select(
                `path.${styles.axis}.${styles.axisY}.${styles.axisReferenceLine}`
            ),
            constants.Y_AXIS
        );
    }
    if (
        hasY2Axis(config.axis) &&
        hasNegativeLowerBound(scale, constants.Y2_AXIS)
    ) {
        setTranslate(
            canvasSVG.select(
                `path.${styles.axis}.${styles.axisY2}.${styles.axisReferenceLine}`
            ),
            constants.Y2_AXIS
        );
    }
};
/**
 * Calculates current min and max value ranges.
 * if the input is bar content and is being cascaded on top of other bars,
 * then we need to calculate top and bottom domain values by summing cascaded bars value ranges
 *
 * @private
 * @param {object} input - Object containing min and max data point values
 * @param {Array} content - array of target objects
 * @param {string} axis - y or y2
 * @returns {object} - Object with min and max value ranges
 */
const getCurMinMaxValueRange = (input, content, axis) => {
    if (input instanceof Bar) {
        let min = 0;
        let max = 0;
        const groupedBars = content.filter((value) => {
            if (value instanceof Bar) {
                return value.config.group === input.config.group;
            }
            return false;
        });
        groupedBars.forEach((bar) => {
            max += bar.valuesRange[axis].max;
            min += bar.valuesRange[axis].min;
        });
        return {
            min,
            max
        };
    }
    return {
        min: input.valuesRange[axis].min,
        max: input.valuesRange[axis].max
    };
};
/**
 * Calculates the axes - x, y and y2 data range.
 * For each data point provided, we need to set the min and max ranges.
 * Data point sets [n]
 *  Data points [n]
 *      x, y, y2 [1]
 *
 * @private
 * @param {object} input - input content object
 * @param {string} axis - y or y2
 * @param {object} config - config object derived from input JSON
 * @param {Array} content - array of target objects
 * @returns {undefined} - returns nothing
 */
const getAxesDataRange = (
    input,
    axis = constants.Y_AXIS,
    config,
    content = []
) => {
    if (utils.isEmpty(config.axis.y.dataRange)) {
        config.axis.y.dataRange = {};
    }
    if (hasY2Axis(config.axis) && utils.isEmpty(config.axis.y2.dataRange)) {
        config.axis.y2.dataRange = {};
    }
    if (utils.isEmpty(input) || utils.isEmpty(input.valuesRange)) {
        return;
    }
    const curRange = getCurMinMaxValueRange(input, content, axis);
    const prevMin = config.axis[axis].dataRange.oldMin;
    const prevMax = config.axis[axis].dataRange.oldMax;
    const isRangeModified =
        !(prevMin && prevMax) ||
        !(prevMin <= curRange.min || prevMax >= curRange.max);
    config.axis[axis].dataRange.isRangeModified = isRangeModified;
    if (isRangeModified) {
        config.axis[axis].dataRange.oldMin = config.axis[axis].dataRange.min;
        config.axis[axis].dataRange.oldMax = config.axis[axis].dataRange.max;
        config.axis[axis].dataRange.min = curRange.min;
        config.axis[axis].dataRange.max = curRange.max;
    }
};
/**
 * Checks if provided input has valid axis type
 *
 * @param {string} x - input x value
 * @param {string} xAxisType - x axis type
 * @returns {boolean} - returns true if valid, false if invalid
 */
const isValidAxisType = (x, xAxisType) =>
    ((utils.isDate(x) || utils.isDateInstance(x)) &&
        getType(xAxisType) === AXIS_TYPE.TIME_SERIES) ||
    (!utils.isDate(x) &&
        !utils.isDateInstance(x) &&
        getType(xAxisType) !== AXIS_TYPE.TIME_SERIES);

/**
 * @enum {Function}
 */
export {
    prepareXAxis,
    prepareHorizontalAxis,
    prepareYAxis,
    prepareY2Axis,
    getAxisTickFormat,
    getRotationForAxis,
    getXAxisLabelXPosition,
    getXAxisLabelYPosition,
    getYAxisLabelXPosition,
    getYAxisLabelShapeXPosition,
    getYAxisLabelYPosition,
    getY2AxisLabelXPosition,
    getY2AxisLabelShapeXPosition,
    getYAxisLabelShapeYPosition,
    getY2AxisLabelShapeYPosition,
    getXAxisXPosition,
    getXAxisYPosition,
    getYAxisXPosition,
    getYAxisYPosition,
    getY2AxisXPosition,
    getY2AxisYPosition,
    getXAxisWidth,
    getYAxisHeight,
    getXAxisHeight,
    getXAxisRange,
    getYAxisRange,
    getAxisLabelWidth,
    getAxisLabelHeight,
    getYAxisWidth,
    calculateAxesSize,
    calculateAxesLabelSize,
    determineOutlierStretchFactor,
    buildAxisLabel,
    getAxesScale,
    createAxes,
    createXAxisInfoRow,
    createAxisReferenceLine,
    getAxesDataRange,
    processTickValues,
    generateYAxesTickValues,
    hasY2Axis,
    translateAxes,
    translateAxisReferenceLine,
    isValidAxisType,
    resetD3FontSize,
    calculateVerticalPadding,
    isXAxisOrientationTop,
    getAxisInfoRowYPosition,
    updateXAxisDomain,
    getTicksCountFromRange,
    getAverageTicksCount,
    formatLabel
};
