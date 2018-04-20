"use strict";
import d3 from "d3";
import { AXIS_TYPE, LINE_TYPE } from "../../helpers/constants";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Checks if the value is undefined and sets the default value if it is.
 * @private
 * @param {Object} value - A value
 * @param {Object} defaultVal - A default value
 * @returns {Object} A defined value
 */
export const getDefaultValue = (value, defaultVal) =>
    utils.isUndefined(value) ? defaultVal : value;

/**
 * Validates if data is in correct format
 * Key and Values are mandatory.
 * @private
 * @param {Object} data - Input JSON
 * @returns {boolean} True if data valid
 */
export const isDataValidFormat = (data) =>
    utils.notEmpty(data.key) && utils.notEmpty(data.values);

/**
 * Type can be default (Number based) or timeseries
 * @private
 * @param {string} type - consumer passed input type
 * @returns {Object} Type property from input or "default"
 */
export const getType = (type) => getDefaultValue(type, AXIS_TYPE.DEFAULT);

/**
 * Interpolation type can be:
 * * Linear (default)
 * * Spline
 * @private
 * @param {string} type - consumer passed interpolation type
 * @returns {Object} Interpolation type property from line type or "linear"
 */
export const getInterpolationType = (type) =>
    getDefaultValue(type, LINE_TYPE.LINEAR);
/**
 * Gets the scale for X Axis. If the data points are linear then
 * linear scale is provided but if the data points are datetime then
 * time scale is returned
 * @private
 * @param {string} type - consumer passed input type
 * @returns {Object} d3 scale object
 */
export const getScale = (type) =>
    getType(type) === AXIS_TYPE.TIME_SERIES
        ? d3.time.scale()
        : d3.scale.linear();

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
export const getDomain = (type, lowerLimit, upperLimit) =>
    getType(type) === AXIS_TYPE.TIME_SERIES
        ? [utils.parseDateTime(lowerLimit), utils.parseDateTime(upperLimit)]
        : [utils.getNumber(lowerLimit), utils.getNumber(upperLimit)];

/**
 * API to parse consumer input.
 * @interface
 * @class BaseConfig
 */
export default class BaseConfig {
    /**
     * Returns the config object
     * @abstract
     * @function BaseConfig#getConfig
     * @throws {module:errors.THROW_MSG_CONFIG_GET_CONFIG_NOT_IMPLEMENTED}
     * @returns {Object} - inherited class instance
     */
    getConfig() {
        throw new Error(errors.THROW_MSG_CONFIG_GET_CONFIG_NOT_IMPLEMENTED);
    }

    /**
     * Sets the input object
     * @abstract
     * @function BaseConfig#setInput
     * @throws {module:errors.THROW_MSG_CONFIG_SET_INPUT_NOT_IMPLEMENTED}
     * @param {Object} inputJSON - Input JSON
     * @returns {Object} - inherited class instance
     */
    setInput(inputJSON) {
        throw new Error(errors.THROW_MSG_CONFIG_SET_INPUT_NOT_IMPLEMENTED);
    }

    /**
     * Validates and verifies the input JSON object
     * @abstract
     * @function BaseConfig#validateInput
     * @throws {module:errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED}
     * @returns {Object} - inherited class instance
     */
    validateInput() {
        throw new Error(errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED);
    }

    /**
     * Clones the input JSON into the config object
     * @abstract
     * @function BaseConfig#clone
     * @throws {module:errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED}
     * @returns {Object} - inherited class instance
     */
    clone() {
        throw new Error(errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED);
    }
}
