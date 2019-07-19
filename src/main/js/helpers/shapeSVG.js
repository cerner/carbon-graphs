import utils from "./utils";

/**
 * Returns an object to create a svg circle for data point
 *
 * @private
 * @param {object} shape - SHAPE object
 * @param {number} scaleFactor - Scale factor for datapoint
 * @returns {object} SVG Object
 */
export const getSVGObject = (shape, { posX, posY, scale }) => {
    const d3Shape = utils.deepClone(shape);
    d3Shape.options.x = shape.options.x * posX;
    d3Shape.options.y = shape.options.y * posY;
    d3Shape.options.scale = d3Shape.options.scale * scale;
    return d3Shape;
};
