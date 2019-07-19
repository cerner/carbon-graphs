"use strict";
import d3 from "d3";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";

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
 * Creates an element with SVG specs. SVG or path
 *
 * @private
 * @param {string} tag - svg or path
 * @returns {HTMLElement} an SVG or path element
 */
const createElementNS = (tag) =>
    document.createElementNS(d3.ns.prefix.svg, tag);
/**
 * Validates a shape for basic structure
 *
 * @private
 * @throws {module:errors.THROW_MSG_SHAPE_PATH_EMPTY}
 * @throws {module:errors.THROW_MSG_SHAPE_OPTIONS_EMPTY}
 * @throws {module:errors.THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID}
 * @param {string} shape -  Path object of the shape
 * @returns {undefined} - returns nothing
 */
const validateShape = (shape) => {
    if (utils.isEmpty(shape.path)) {
        throw new Error(errors.THROW_MSG_SHAPE_PATH_EMPTY);
    }
    if (utils.isEmpty(shape.options)) {
        throw new Error(errors.THROW_MSG_SHAPE_OPTIONS_EMPTY);
    }
    if (
        utils.isEmpty(shape.options.x) ||
        utils.isEmpty(shape.options.y) ||
        utils.isEmpty(shape.options.scale)
    ) {
        throw new Error(errors.THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID);
    }
};
/**
 * Returns svg path element with path description ('d' attr)
 *
 * @private
 * @param {Selection} d3Elem - d3 SVG element
 * @param {string|Array} shapePath - Path object of the shape
 * @param {Function} transformFn - Function to transform individual paths within SVG
 * @param {number} scale - transform scale for the path
 * @returns {Selection} A svg path element
 */
const setPathProperty = (
    d3Elem,
    shapePath,
    transformFn,
    scale = constants.DEFAULT_PLOT_SCALE
) => {
    const getD3PathElement = (path) =>
        d3
            .select(createElementNS("path"))
            .attr("transform", transformFn(scale))
            .attr("id", path.id || "")
            .attr("fill", path.fill || "")
            .attr("class", path.class || "")
            .attr("d", path.d || "");
    (utils.isArray(shapePath) ? shapePath : [shapePath]).forEach((p) =>
        d3Elem.append(() => getD3PathElement(p).node())
    );
    return d3Elem;
};
/**
 * Sets aria properties to the d3 element
 *
 * @private
 * @param {string} props - ARIA properties for SVG
 * @returns {Function} d3Elem - d3 SVG element
 */
const setA11yProperties = (...props) => (d3Elem, a11yAttributes) =>
    props.forEach((prop) =>
        Object.prototype.hasOwnProperty.call(a11yAttributes, prop)
            ? d3Elem.attr(prop, a11yAttributes[prop])
            : undefined
    );
/**
 * Sets viewBox to the element
 *
 * @private
 * @param {Selection} d3Elem - d3 SVG element
 * @returns {Selection} d3Elem - d3 SVG element
 */
const setViewBoxProperty = (d3Elem) =>
    d3Elem.attr("viewBox", constants.VIEW_BOX_SIZE);
/**
 * Returns the SVG element container within which a path element is stored.
 * viewBox sizing is "0 0 48 48"
 * Default icon width and height is 1rem
 *
 * @private
 * @param {string} shape -  Path object of the shape
 * @param {object} svgElementProps -  SVG element props
 * @param {boolean} [includeViewBox] -  Include viewBox in the SVG element or otherwise. False by default
 * @returns {HTMLElement} Returns the SVG element with the "icon" path
 */
const createSVG = (
    shape,
    {
        svgClassNames,
        svgStyles,
        transformFn,
        onClickFn,
        a11yAttributes,
        additionalAttributes
    },
    includeViewBox = false
) => {
    const d3SVGElement = d3
        .select(createElementNS("svg"))
        .attr("x", shape.options.x)
        .attr("y", shape.options.y)
        .attr("style", svgStyles)
        .attr("class", `${styles.svgIcon} ${svgClassNames}`)
        .attr("role", "img")
        .attr(
            "pointer-events",
            additionalAttributes["pointer-events"] ? "none" : "auto"
        )
        .on("click", onClickFn);
    if (includeViewBox) {
        setViewBoxProperty(d3SVGElement);
    }
    // Set a11y attributes to svg element
    setA11yProperties(
        "aria-describedby",
        "aria-hidden",
        "aria-selected",
        "aria-disabled"
    )(d3SVGElement, a11yAttributes);

    // Process the shape and generate paths, if the shape has more than one path
    setPathProperty(d3SVGElement, shape.path, transformFn, shape.options.scale);

    return d3SVGElement.node();
};

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
