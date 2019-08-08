"use strict";
import { createSVG, validateShape } from "./helpers";

/**
 * Creates a skeleton for SVG props used to generate nested SVG
 *
 * @public
 * @param {object} [SVGProps] - SVG default props
 * @property {string} svgClassNames - SVG class name
 * @property {string} svgStyles - SVG styles
 * @property {Function} transformFn - Function callback for translating SVG
 * @property {Function} onClickFn - Function callback for onclick event
 * @property {object} a11yAttributes - a11y attributes for SVG
 * @returns {object} Object containing custom named SVG properties
 */
export const getDefaultSVGProps = ({
    svgClassNames = "",
    svgStyles = "",
    transformFn = () => {},
    onClickFn = () => {},
    a11yAttributes = {},
    additionalAttributes = {}
} = {}) => ({
    svgClassNames,
    svgStyles,
    transformFn,
    onClickFn,
    a11yAttributes,
    additionalAttributes
});

/**
 * A Shape is a data point representation in a graph.
 * This is also used as a point in the legend
 *
 * @class Shape
 */
class Shape {
    constructor(shape) {
        validateShape(shape);
        this.shape = shape;
    }

    /**
     * Returns the shape element. Shape element is an svg element containing a path element.
     * The consumer can customize the classNames and styles for the svg and path elements accordingly
     * using the function parameters.
     *
     * @public
     * @param {object} svgProps - SVG element attributes loaded by the consumer. This is required parameter for creating a non-generic svg
     * @param {boolean} [includeViewBox] -  Include viewBox in the SVG element or otherwise. False by default
     * @returns {HTMLElement} an svg element
     */
    getShapeElement(svgProps, includeViewBox = false) {
        return createSVG(
            this.shape,
            svgProps || getDefaultSVGProps(),
            includeViewBox
        );
    }
}

Shape.getDefaultSVGProps = getDefaultSVGProps;
export default Shape;
