/**
 * @module utils
 * @alias module:utils
 */
"use strict";
import constants from "./constants";

/**
 * Wraps a function in logical negation
 *
 * @private
 * @param {Function} [fn=x=>x] - A value-returning function - defaults to the identity function
 * @returns {Function} that forwards arguments to `fn` and takes the logical negation of the result
 */
const not = (fn = (x) => x) => (...args) => !fn(...args);
/**
 * Checks if parameter is a Function
 *
 * @private
 * @param {object} o - source object
 * @returns {boolean} true if Function
 */
const isFunction = (o) => typeof o === "function";
/**
 * Checks if parameter is an Array
 *
 * @private
 * @param {object} o - source object
 * @returns {boolean} true if Array
 */
const isArray = (o) => Array.isArray(o);
/**
 * Checks if parameter is an Array and it is having zero elements
 *
 * @private
 * @param {object} o - source object
 * @returns {boolean} true if it is an Array and length is zero
 */
const isEmptyArray = (o) => Array.isArray(o) && o.length === 0;
/**
 * Checks if parameter is a String
 *
 * @private
 * @param {string} o - source object
 * @returns {boolean} true if string
 */
const isString = (o) => typeof o === "string";
/**
 * Checks if parameter is of type undefined
 *
 * @private
 * @param {object} v - source object
 * @returns {boolean} true if undefined
 */
const isUndefined = (v) => typeof v === "undefined";
/**
 * Checks if parameter is not of type undefined
 *
 * @private
 * @param {object} v - source object
 * @returns {boolean} true if defined
 */
const isDefined = not(isUndefined);
/**
 * Checks if parameter is empty
 *  not undefined,
 *  not null,
 *  if string => length is not 0
 *  if object => keys are not non-existent
 *
 * @private
 * @param {object} o - source object
 * @returns {boolean} true if empty
 */
const isEmpty = (o) =>
    typeof o === "undefined" ||
    o === null ||
    (isString(o) && o.length === 0) ||
    (typeof o === "object" && Object.keys(o).length === 0);
/**
 * Checks if parameter is not empty
 *
 * @private
 * @param {object} o - source object
 * @returns {boolean} True if not empty
 */
const notEmpty = not(isEmpty);
/**
 * Checks if value exists within the given dictionary
 *
 * @private
 * @param {Array} dict - target array to be searched
 * @param {*} value -  value to be searched
 * @returns {boolean} true if present
 */
const hasValue = (dict, value) =>
    Object.keys(dict).some((o) => dict[o] === value);
/**
 * Sanitizes the string of < and >
 *
 * @private
 * @param {string} str - input string
 * @returns {string} sanitized string
 */
const sanitize = (str) =>
    typeof str === "string"
        ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : str;
/**
 * Deep clones the provided object
 *
 * @private
 * @param {object} o - Source object
 * @returns {object|Array} Returns a cloned object
 */
const deepClone = (o) => {
    if (isArray(o)) {
        return o.map(deepClone);
    } else if (o && typeof o === "object") {
        return Object.keys(o).reduce((acc, key) => {
            if (isDefined(o[key])) {
                acc[key] = deepClone(o[key]);
            }
            return acc;
        }, {});
    } else {
        return o;
    }
};
/**
 * Checks to see if the date provided is of ISO8601 datetime format.
 *
 * @private
 * @param {string} str - Datetime string in ISO8601 format: yyyy-MM-ddTHH:mm:ssZ
 * @returns {string} true if in correct format
 */
const isDate = (str) => constants.ISO8601_DATE_TIME_MILLI.test(str);
/**
 * Checks to see if the object provided is an instance of date
 *
 * @private
 * @param {object} obj - Object instance of date
 * @returns {boolean} true if instance of date
 */
const isDateInstance = (obj) => obj instanceof Date;
/**
 * Converts ISO8601 datetime string to Date
 *
 * @private
 * @param {number|string} value - ISO8601 datetime string
 * @todo Handle DST
 * @todo Convert UTC dates to local date
 * @returns {Date} new Date object
 */
const parseDateTime = (value) => new Date(value);
/**
 * Converts ISO8601 date string to a number
 *
 * @private
 * @param {string} value - ISO8601 datetime string
 * @returns {number} Date as a number
 */
const getTime = (value) => parseDateTime(value).getTime();
/**
 * Case converts to number
 *
 * @private
 * @param {string} n - source string
 * @returns {number} if not undefined or null return Number, 0 otherwise
 */
const getNumber = (n) => (n ? Number(n) : 0);
/**
 * Checks if input is a number or not
 *
 * @private
 * @param {*} n - input to be determined a number
 * @returns {boolean} if not undefined or null return Number, 0 otherwise
 */
const isNumber = (n) => typeof n === "number" && !isNaN(n);
/**
 * Checks if provided dates are equal
 *
 * @private
 * @param {Date} a - date to compare
 * @param {Date} b - date to compare
 * @returns {boolean} true if dates are equal
 */
const isDateEqual = (a, b) => a.getTime() === b.getTime();
/**
 * Compares 2 values and return true if equals. False if not.
 *
 * @private
 * @param {object} a - value to compare
 * @param {object} b - value to compare
 * @returns {boolean} - returns true or false
 */
const isEqual = (a, b) =>
    isDate(a) || isDateInstance(a)
        ? isDateEqual(parseDateTime(a), parseDateTime(b))
        : a === b;
/**
 * @enum {Function}
 */
export default {
    deepClone,
    isFunction,
    isArray,
    isEmptyArray,
    isDefined,
    isUndefined,
    isEmpty,
    notEmpty,
    hasValue,
    sanitize,
    getNumber,
    isDate,
    isNumber,
    parseDateTime,
    getTime,
    isDateInstance,
    isEqual
};
