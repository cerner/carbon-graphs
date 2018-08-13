import d3 from "d3";
import constants, { COLORS } from "./constants";
import styles from "./styles";
import utils from "./utils";

/**
 * Returns the appropriate bar based on the bar style settings.
 * For Bar, we apply the settings below in the
 * `rect` element style attribute.
 * @private
 * @param {Object} style - data associated to the task
 * @param {Object} dataTarget - input data object
 * @returns {string} A style constant
 */
const getBarStyle = (style = {}, dataTarget) => {
    const color = dataTarget.color || constants.DEFAULT_BAR_COLOR;
    let currentStyle = `fill: ${color}; stroke: ${color};`;

    // If style property is not provided then we use treat it as filled.
    if (utils.isEmpty(style)) {
        return currentStyle;
    }
    if (style.isDotted === true) {
        currentStyle = `${currentStyle} stroke-width: 1; stroke-dasharray: 2, 2;`;
    }
    if (style.isHollow === true) {
        currentStyle = `${currentStyle} fill: ${
            COLORS.WHITE
        }; stroke-width: 1;`;
    }
    return currentStyle;
};

/**
 * Creates a SVG rect and appends to the d3 element provided
 * @private
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @returns {Selection} d3 selection path after appending rect
 */
const getRect = (path, x, y, width, height) =>
    path
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height);
/**
 * Creates a rect and appends it to the d3 selection element provided in the argument
 * @private
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {string} style - inline styling for the bar
 * @returns {Selection} d3 selection path
 */
const getBar = (path, x, y, width, height, style) => {
    getRect(path, x, y, width, height)
        .classed(styles.taskBar, true)
        .attr("style", style);
    return path;
};

/**
 * Creates a rect and appends it to the d3 selection element provided in the argument.
 * A chunk is a bar with fixed width. Uses: DEFAULT_GANTT_TASK_CHUNK_WIDTH
 * @private
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {string} style - inline styling for the bar
 * @returns {Selection} d3 selection path
 */
const getChunk = (path, x, y, width, height, style) => {
    getBar(path, x, y, constants.DEFAULT_GANTT_TASK_CHUNK_WIDTH, height, style);
    return path;
};
/**
 * Creates 2 rect:
 * * Full width bar
 * * Completion bar with width as much as the percentage provided
 * We render the Completion bar on top of the Full width bar to give an illusion of
 * a percentage bar. If percentage is 100 then the Completion bar will overlap the Full width bar
 * @private
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {number} percent - percent value for percentage completion
 * @param {string} color - hexa value denoting the color of the bar
 * @returns {Selection} d3 selection path
 */
const getPercentageBar = (path, x, y, width, height, percent, color) => {
    getRect(path, x, y, width, height)
        .classed(styles.taskBar, true)
        .attr(
            "style",
            `fill: ${COLORS.WHITE}; stroke: ${color}; stroke-width: 1px;`
        );
    getRect(path, x, y, percent, height)
        .classed(styles.taskBarCompletion, true)
        .attr("style", `fill: ${color};`);
    return path;
};
/**
 * Creates a patterned bar with forward backslashes
 * @private
 * @param {Selection} defs - d3 selection path for defs element in the graph
 * @param {Selection} path - d3 selection path for the SVG group element
 * @param {number} x - Scaled x co-ordinate
 * @param {number} y - Scaled y co-ordinate
 * @param {number} width - width in scaled pixels
 * @param {number} height - fixed pixel height as a number
 * @param {string} style - style you want to apply for bar
 * @returns {Selection} d3 selection path
 */
const getHashedBar = (
    defs,
    path,
    x,
    y,
    width,
    height,
    style = `fill: ${constants.DEFAULT_BAR_HASH_COLOR};`
) => {
    const patternId = "pattern-stripe";
    if (d3.select(`#${patternId}`).empty()) {
        defs.append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(-45)")
            .attr("width", "12")
            .attr("height", "16")
            .append("rect")
            .attr("width", "3")
            .attr("height", "16")
            .attr("style", "fill: #fff");
    }
    getRect(path, x, y, width, height)
        .classed(styles.taskBar, true)
        .attr("style", style);
    getRect(path, x, y, width, height)
        .classed(styles.taskBar, true)
        .attr("style", `fill: url(#${patternId}); opacity: 0.4;`);
    return path;
};

export {
    getRect,
    getBar,
    getChunk,
    getPercentageBar,
    getHashedBar,
    getBarStyle
};
