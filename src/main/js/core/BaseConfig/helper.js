"use strict";
import d3 from "d3";
import { AXIS_TYPE, LINE_TYPE } from "../../helpers/constants";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Validates and verifies the input JSON object
 * Checks following properties:
 * Tests if Input is present
 * Tests if Key is present
 * Tests if Values are present
 *
 * Note: We do not need to make labels as required for any graph using
 * Graph API since there is a use case where consumers want to have a content but
 * they do not need a legend item loaded.
 *
 * @private
 * @throws module:errors.THROW_MSG_NO_DATA_POINTS
 * @throws module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED
 * @throws module:errors.THROW_MSG_NO_CONTENT_DATA_LOADED
 * @param {object} input - input JSON object
 * @returns {undefined} returns nothing
 */
export const validateBaseInput = (input) => {
    if (utils.isEmpty(input)) {
        throw new Error(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
    }
    if (utils.isEmpty(input.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (!utils.isArray(input.values)) {
        throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
    }
};
/**
 * Checks if the value is undefined and sets the default value if it is.
 *
 * @private
 * @param {object} value - A value
 * @param {object} defaultVal - A default value
 * @returns {object} A defined value
 */
export const getDefaultValue = (value, defaultVal) =>
    utils.isUndefined(value) ? defaultVal : value;
/**
 * Type can be default (Number based) or timeseries
 *
 * @private
 * @param {string} type - consumer passed input type
 * @returns {object} Type property from input or "default"
 */
export const getType = (type) => getDefaultValue(type, AXIS_TYPE.DEFAULT);
/**
 * Generates a clip path ID based on current date
 *
 * @private
 * @returns {string} Clip path ID
 */
export const generateClipPathId = () => `carbon-${+new Date()}-clip`;
/**
 * Interpolation type can be:
 * * Linear (default)
 * * Spline
 *
 * @private
 * @param {string} type - consumer passed interpolation type
 * @returns {object} Interpolation type property from line type or "linear"
 */
export const getInterpolationType = (type) =>
    getDefaultValue(type, LINE_TYPE.LINEAR);
/**
 * Gets the scale for X Axis. If the data points are linear then
 * linear scale is provided but if the data points are datetime then
 * time scale is returned
 *
 * @private
 * @param {string} type - consumer passed input type
 * @returns {object} d3 scale object
 */
export const getScale = (type) =>
    getType(type) === AXIS_TYPE.TIME_SERIES
        ? d3.time.scale()
        : d3.scale.linear();
/**
 * Returns the domain for the axes. If the range is a number then the domain is treated
 * as a number or if its a datetime then they are converted to a date object and returned as
 * an array. It is returned as an array since d3 domain takes input range as an array.
 *
 * @private
 * @param {string} type - input type
 * @param {string} lowerLimit - lower limit of the axes
 * @param {string} upperLimit - upper limit of the axes
 * @returns {Array} Array represented by lower and upper limit ranges.
 */
export const getDomain = (type, lowerLimit, upperLimit) =>
    getType(type) === AXIS_TYPE.TIME_SERIES
        ? [utils.parseDateTime(lowerLimit), utils.parseDateTime(upperLimit)]
        : [utils.getNumber(lowerLimit), utils.getNumber(upperLimit)];
/**
 * Parses input value to either date or number based on xAxisType
 *
 * @private
 * @param {object} x - input x value
 * @param {object} xAxisType - Graph x axis type
 * @returns {any} - if xAxisType is time series then returns date, else returns number
 */
export const parseTypedValue = (x, xAxisType) =>
    getType(xAxisType) === AXIS_TYPE.TIME_SERIES
        ? utils.parseDateTime(x)
        : utils.getNumber(x);
