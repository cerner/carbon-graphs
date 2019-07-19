/**
 * @module loadUtil
 * @alias module:loadUtil
 */

"use strict";

import utils from "./utils";

/**
 * Simple utility that checks if the input is an array or objects or simple object.
 * Iterate over the array and calls the loader callback function.
 * @private
 * @param {Object|Array} input - Input can be a single object or an array of objects
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

export { contentLoadHandler };
