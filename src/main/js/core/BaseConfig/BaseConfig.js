"use strict";
import d3 from "d3";
import { AXIS_TYPE } from "../../helpers/constants";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Converts ISO8601 datetime string to Date
 * @private
 * @param {string} value - ISO8601 datetime string
 * @todo Handle DST
 * @todo Convert UTC dates to local date
 * @returns {Date} new Date object
 */
export const parseDateTime = (value) => new Date(value);
/**
 * Checks if the value is undefined and sets the default value if it is.
 * @private
 * @param {Object} value - A value
 * @param {Object} defaultVal - A default value
 * @returns {Object} A defined value
 */
export const getDefaultValue = (value, defaultVal) => utils.isUndefined(value) ? defaultVal : value;

/**
 * Validates if data is in correct format
 * Key and Values are mandatory.
 * @private
 * @param {Object} data - Input JSON
 * @returns {boolean} True if data valid
 */
export const isDataValidFormat = (data) =>
    utils.notEmpty(data.key) &&
    utils.notEmpty(data.values);

/**
 * Checks if the keys for data points sets are unique
 * @private
 * @param {Object} data - Input JSON
 * @returns {boolean} True if unique
 */
export const isUniqueKey = (data) => {
    const keyList = data.map((i) => i.key);
    return keyList.length === new Set(keyList).size;
};

/**
 * Type can be default (Number based) or timeseries
 * @private
 * @param {string} type - consumer passed input type
 * @returns {Object} Type property from input or "default"
 */
export const getType = (type) => getDefaultValue(type, AXIS_TYPE.DEFAULT);

/**
 * Gets the scale for X Axis. If the data points are linear then
 * linear scale is provided but if the data points are datetime then
 * time scale is returned
 * @private
 * @param {string} type - consumer passed input type
 * @returns {Object} d3 scale object
 */
export const getScale = (type) => {
    if (getType(type) === AXIS_TYPE.TIME_SERIES) {
        return d3.time.scale();
    }
    return d3.scale.linear();
};

/**
 * Returns the domain for the axes. If the range is a number then the domain is treated
 * as a number or if its a datetime then they are converted to a date object and returned as
 * an array. It is returned as an array since d3 domain takes input range as an array.
 * @private
 * @param {string} type - input type
 * @param {string} lowerLimit - lower limit of the axes
 * @param {string} upperLimit - upper limit of the axes
 * @returns {Array} Array represented by lower and upper limit ranges.
 */
export const getDomain = (type, lowerLimit, upperLimit) => {
    if (getType(type) === AXIS_TYPE.TIME_SERIES) {
        return [
            parseDateTime(lowerLimit),
            parseDateTime(upperLimit)
        ];
    }
    return [
        Number(lowerLimit),
        Number(upperLimit)
    ];
};

/**
 * API to parse consumer input.
 * @interface
 * @class BaseConfig
 */
export default class BaseConfig {
    /**
     * Validates and verifies the input JSON object
     * @throws errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED
     * @abstract
     * @returns {undefined} - returns nothing
     */
    validateInput() {
        throw errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED;
    }

    /**
     * Clones the input JSON into the config object
     * @throws errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED
     * @abstract
     * @returns {undefined} - returns nothing
     */
    clone() {
        throw errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED;
    }
}
