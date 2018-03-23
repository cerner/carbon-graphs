"use strict";
import constants from "./constants";

/**
 * @fileOverview
 * Label helper functions.
 * @module label
 * @alias module:label
 */

/**
 * Informs if a label needs truncation or otherwise
 * @private
 * @param {string} labelStr - A label
 * @param {number} [charLimit] - Maximum character length before truncation
 * @returns {boolean} true if needs truncation, false otherwise
 */
const shouldTruncateLabel = (
    labelStr,
    charLimit = constants.DEFAULT_LABEL_CHARACTER_LIMIT
) => labelStr.length > charLimit;
/**
 * Truncates the label string to the character limit provided, by default its
 * constants.DEFAULT_LABEL_CHARACTER_LIMIT
 * @private
 * @param {string} labelStr - A label
 * @param {number} charLimit - Maximum character length before truncation
 * @returns {string} A truncated string with ellipsis
 */
const truncateLabel = (
    labelStr,
    charLimit = constants.DEFAULT_LABEL_CHARACTER_LIMIT
) => labelStr.substring(0, charLimit).concat("...");

/**
 * @enum {Function}
 */
export { shouldTruncateLabel, truncateLabel };
