import d3 from "d3";

/**
 * Returns the current d3 transform attribute object from context object
 * @private
 * @param {Object} context - d3 element
 * @returns {Object} returns the current d3 transform attribute object
 */
const getCurrentTransform = (context) => d3.select(context).attr("transform");
/**
 * Rounds to 2 decimals places. Use scaling technique
 * to bring two figures across the decimal point turning the figure into a whole number by
 * adding 0.00001 and then rounding it to 2 decimal places.
 * @private
 * @param {number} v - A long decimal
 * @returns {number} decimal rounded to 2 decimal places
 */
const round2Decimals = (v) => Math.round((v + 0.00001) * 100) / 100;
/**
 * Returns the scale from current d3 transform attribute object within context object
 * d3 transform for a scale returns decimal number like: 1.9000000953674316 for 1.9 or
 * 1.100000023841858 for 1.1. We are going to round this to 2 decimal places.
 * @private
 * @param {Object} context - d3 element
 * @returns {Array<number>} returns the scale from d3 element
 */
const getTransformScale = (context) =>
    d3
        .transform(getCurrentTransform(context))
        .scale.map((v) => round2Decimals(v));
export { getTransformScale, round2Decimals, getCurrentTransform };
