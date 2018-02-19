"use strict";
import d3 from "d3";
import constants, { SHAPES } from "../../helpers/constants";
import errors from "../../helpers/errors";
import styles from "../../helpers/styles";

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
 * Returns the SVG element container within which a path element is stored.
 * viewBox sizing is "0 0 48 48"
 * Default icon width and height is 1rem
 * @private
 * @param {HTMLElement} pathElement -  Path element containing the "icon" as a description
 * @param {string} classNames - SVG element class attribute loaded by the consumer
 * @param {string} style - Style that can be applied to the svg element
 * @returns {HTMLElement} Returns the SVG element with the "icon" path
 */
const getSVGElement = (pathElement, { classNames, style }) => {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("viewBox", constants.VIEW_BOX_SIZE);
    svgElement.setAttribute("style", style);
    svgElement.setAttribute("class", `${styles.svgIcon} ${classNames}`);
    svgElement.setAttribute("role", "img");
    svgElement.appendChild(pathElement);
    return svgElement;
};

/**
 * A Shape is a data point representation in a graph.
 * This is also used as a point in the legend
 * @class Shape
 */
class Shape {
    constructor(shape = SHAPES.CIRCLE) {
        this.shape = shape;
    }

    /**
     * Returns the path description (svg -> d attribute) for the shape.
     * @throws {module:errors.THROW_MSG_UNKNOWN_SHAPE}
     * @param {number} [size] - size of the shape. Used for d3 inbuilt shapes only.
     * Custom shapes would need separate scaling
     * @returns {string} Path description "d" value for the shape set in the Shape class
     */
    getPathDescription(size) {
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

    /**
     * Returns svg path element with path description ('d' attr)
     * @param {string} classNames - Path element class attribute loaded by the consumer
     * @param {string} style - Style that can be applied to the path element
     * @returns {HTMLElement} A svg path element
     */
    getPathElement({ classNames, style }) {
        const shapeProp = constants.SHAPE_PROPS[ this.shape ];
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathElement.setAttribute("style", style);
        pathElement.setAttribute("class", classNames);
        pathElement.setAttribute("d", this.getPathDescription());
        pathElement.setAttribute("transform", `translate(${shapeProp.translate.join(",")}) scale(${shapeProp.scale})`);
        return pathElement;
    }

    /**
     * Returns the shape element. Shape element is an svg element containing a path element.
     * The consumer can customize the classNames and styles for the svg and path elements accordingly
     * using the function parameters.
     * @param {string} svgClassNames - SVG element class attribute loaded by the consumer
     * @param {string} svgStyles - Style that can be applied to the svg element
     * @param {string} pathClassNames - Path element class attribute loaded by the consumer
     * @param {string} pathStyles - Style that can be applied to the path element
     * @returns {HTMLElement} an svg element
     */
    getShapeElement({ svgClassNames = "", svgStyles = "", pathClassNames = "", pathStyles = "" }) {
        return getSVGElement(this.getPathElement({
            classNames: pathClassNames,
            style: pathStyles
        }), {
            classNames: svgClassNames,
            style: svgStyles
        });
    }
}

export default Shape;
