/**
 * @module constructUtils
 * @alias module:constructUtils
 */

"use strict";

import utils from "./utils";

/**
 * Simple utility that checks if the input is an array or objects or simple object.
 * Iterate over the array and calls the loader callback function.
 *
 * @private
 * @param {object|Array} input - Input can be a single object or an array of objects
 * @param {Function} loader - loader callback function that will be called with the input as an argument
 * @returns {undefined} returns nothing
 */
const contentLoadHandler = (input, loader) => {
    if (utils.isArray(input)) {
        input.forEach((i) => loader(i));
    } else {
        loader(input);
    }
};

/**
 * Simple utility that checks if the input is an array or objects or simple object.
 * Iterate over the array and calls the unloader callback function.
 *
 * @private
 * @param {object|Array} input - Input can be a single object or an array of objects
 * @param {Function} unloader - unloader callback function that will be called with the input as an argument
 * @returns {undefined} returns nothing
 */
const contentUnloadHandler = (input, unloader) => {
    if (utils.isArray(input)) {
        input.forEach((i) => unloader(i));
    } else {
        unloader(input);
    }
};

export { contentLoadHandler, contentUnloadHandler };
