"use strict";
/**
 * Checks if parameter is a Function
 * @private
 * @param {Object} o - source object
 * @returns {boolean} true if Function
 */
const isFunction = (o) => typeof o === "function";
/**
 * Checks if parameter is an Array
 * @private
 * @param {string} o - source object
 * @returns {boolean} true if Array
 */
const isArray = (o) => Array.isArray(o);
/**
 * Checks if parameter is a String
 * @private
 * @param {string} o - source object
 * @returns {boolean} true if string
 */
const isString = (o) => typeof o === "string";
/**
 * Checks if parameter is of type undefined
 * @private
 * @param {Object} v - source object
 * @returns {boolean} true if undefined
 */
const isUndefined = (v) => typeof v === "undefined";
/**
 * Checks if parameter is not of type undefined
 * @private
 * @param {Object} v - source object
 * @returns {boolean} true if defined
 */
const isDefined = (v) => typeof v !== "undefined";
/**
 * Checks if parameter is empty
 *  not undefined,
 *  not null,
 *  if string => length is not 0
 *  if object => keys are not non-existent
 * @private
 * @param {Object} o - source object
 * @returns {boolean} true if empty
 */
const isEmpty = (o) =>
    typeof o === "undefined" || o === null || (isString(o) && o.length === 0) || (typeof o === "object" && Object.keys(o).length === 0);
/**
 * Checks if parameter is not empty
 * @private
 * @param {Object} o - source object
 * @returns {boolean} True if not empty
 */
const notEmpty = (o) => !isEmpty(o);
/**
 * Checks if value exists within the given dictionary
 * @private
 * @param {Array} dict - target array to be searched
 * @param {*} value -  value to be searched
 * @returns {boolean} true if present
 */
const hasValue = (dict, value) => Object.keys(dict).some((o) => dict[ o ] === value);
/**
 * Sanitizes the string of < and >
 * @private
 * @param {string} str - input string
 * @returns {string} sanitized string
 */
const sanitize = (str) => ((typeof str === "string") ? (str.replace(/</g, "&lt;").replace(/>/g, "&gt;")) : str);
/**
 * Deep clones the provided object
 * @private
 * @param {Object} o - Source object
 * @returns {Object} Returns a cloned object
 */
const deepClone = (o) =>
    Object.keys(o).reduce((acc, prop) => {
        acc[ prop ] = o[ prop ];
        if (o[ prop ] && typeof(o[ prop ]) === "object" && !Array.isArray(o[ prop ])) {
            acc[ prop ] = deepClone(o[ prop ]);
        }
        return acc;
    }, {});

export default {
    deepClone,
    isFunction,
    isArray,
    isDefined,
    isUndefined,
    isEmpty,
    notEmpty,
    hasValue,
    sanitize
};
