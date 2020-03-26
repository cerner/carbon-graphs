"use strict";
import * as d3 from "d3";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";

/**
 * @enum {string} tagList
 * @private
 */
const tagList = {
    PATH: "path",
    CIRCLE: "circle",
    RECT: "rect",
    POLYGON: "polygon",
    G: "g",
    STYLE: "style"
};
/**
 * Creates an element with SVG specs. SVG or path
 *
 * @private
 * @param {string} tag - svg or path
 * @returns {HTMLElement} an SVG or path element
 */
const createElementNS = (tag) =>
    document.createElementNS(d3.namespaces.svg, tag);
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
    if (utils.isEmpty(shape[tagList.PATH])) {
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
 * @param {string} elementType - item from tagList enum
 * @param {string|Array} shapePath - Path object of the shape
 * @returns {Selection} A svg path element
 */
const setSVGChildProperty = (d3Elem, elementType, shapePath) => {
    const getD3PathElement = (path) => {
        const d3Elem = d3.select(createElementNS(elementType));
        Object.keys(path).forEach((k) => {
            if (k === "_html") {
                d3Elem.html(shapePath._html);
                return;
            }
            d3Elem.attr(k, path[k] || "");
        });
        return d3Elem;
    };
    (utils.isArray(shapePath) ? shapePath : [shapePath]).forEach((p) => {
        d3Elem.append(() => getD3PathElement(p).node());
    });

    return d3Elem;
};
/**
 * Process the svg json
 * Uses enum `tagList`
 * Adds them as elements within the SVG group `g`
 *
 * @private
 * @param {Selection} groupElement - group element created within svg
 * @param {object} shape - Carbon SHAPE
 * @param {Function} transformFn - Function to transform individual paths within SVG
 * @param {number} scale - transform scale for the path
 * @returns {undefined} returns nothing
 */
const appendSVGChildren = (groupElement, shape, transformFn, scale) => {
    // Add transform property to the entire "g" to move all child elements within nested svg
    groupElement.attr("transform", transformFn(scale));
    Object.keys(tagList).forEach((el) => {
        if (!shape[tagList[el]]) {
            return;
        }
        setSVGChildProperty(groupElement, tagList[el], shape[tagList[el]]);
    });
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
    const groupElement = d3SVGElement.append("g");
    appendSVGChildren(groupElement, shape, transformFn, shape.options.scale);
    return d3SVGElement.node();
};

/**
 * @enum {Function}
 */
export { createSVG, validateShape };
