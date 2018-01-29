"use strict";
import d3 from "d3";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";

/**
 * Checks if the shape is an inbuilt shape
 * @private
 * @param {string} shape - shape to display in the point
 * @returns {boolean} true if inbuilt shape
 */
export const isD3InbuiltShape = (shape) => shape in constants.D3_INBUILT_SHAPE;
/**
 * Checks if the shape is an custom shape
 * @private
 * @param {string} shape - shape to display in the point
 * @returns {boolean} true if custom shape
 */
export const isNativeShape = (shape) => shape in constants.CUSTOM_SHAPE_PATH;

/**
 * Checks if the shape is a d3 inbuilt shape or one of the Carbon custom shapes.
 * @protected
 * @param {string} shape - shape to display in the point
 * @returns {boolean} true if inbuilt or custom shape, false otherwise
 */
export const isValidCarbonShape = (shape) => ((isD3InbuiltShape(shape)) || (isNativeShape(shape)));

/**
 * A Shape is a data point representation in a graph.
 * This is also used as a point in the legend
 * @class Shape
 */
class Shape {
    constructor(shape) {
        this.shape = shape;
    }

    /**
     * Returns the Moveto path for the shape.
     * @throws {module:errors.THROW_MSG_UNKNOWN_SHAPE}
     * @param {number} [size] - size of the shape. Used for d3 inbuilt shapes only.
     * Custom shapes would need separate scaling
     * @returns {string} Moveto paths for the shape set in the Shape class
     */
    getPathElement(size) {
        const getCustomPath = (shape) => {
            if (isNativeShape(shape)) {
                return constants.CUSTOM_SHAPE_PATH[ shape ];
            }
            throw new Error(errors.THROW_MSG_UNKNOWN_SHAPE);
        };
        const getD3Shape = (shape) =>
            d3.svg.symbol().type(constants.D3_INBUILT_SHAPE[ shape ]).size(size || constants.DEFAULT_PLOT_SIZE)();

        return isD3InbuiltShape(this.shape) ? getD3Shape(this.shape) : getCustomPath(this.shape);
    }
}

export default Shape;
