/**
 * @module paddingUtils
 * @alias module:paddingUtils
 */

/**
 * Calculates the amount of width available for the graph without the padding
 * in the container. This is so that the consumer can position the graph in the page
 * however they want.
 *
 * @private
 * @param {Selection} d3Element - d3 element of the graph container provided by consumer
 * @returns {number} Total box sizing parameters for the container - margin and padding
 */
const getElementBoxSizingParameters = (d3Element) => {
    const htmlElement = d3Element.node();
    const styles = window.getComputedStyle(htmlElement);
    const padding =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const margin =
        parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
    return margin + padding;
};

/**
 * @enum {Function}
 */
export { getElementBoxSizingParameters };
