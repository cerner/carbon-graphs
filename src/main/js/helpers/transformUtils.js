import * as d3 from "d3";

/**
 * Returns the current d3 transform attribute object from context object
 *
 * @private
 * @param {object} context - d3 element
 * @returns {object} returns the current d3 transform attribute object
 */
const getCurrentTransform = (context) => d3.select(context).attr("transform");
/**
 * Rounds to 2 decimals places. Use scaling technique
 * to bring two figures across the decimal point turning the figure into a whole number by
 * adding 0.00001 and then rounding it to 2 decimal places.
 *
 * @private
 * @param {number} v - A long decimal
 * @returns {number} decimal rounded to 2 decimal places
 */
const round2Decimals = (v) => Math.round((v + 0.00001) * 100) / 100;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const normalize = (a) => {
    const k = Math.sqrt(dot(a, a));
    if (k) {
        a[0] /= k;
        a[1] /= k;
    }
    return k;
};
const combine = (a, b, k) => {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
};

/**
 * Returns transform list with translate and scale properties given a transform string
 *
 * @private
 * @param {string} transform - Transform attribute as a string
 * @example "translate(23.100000381469727,184.64285278320312),scale(0.20000000298023224,0.20000000298023224)"
 * @returns {{scale: number[], translate: number[]}} Object containing scale and translate
 */
const getSVGAnimatedTransformList = (transform) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    const baseVal = g.transform.baseVal.consolidate();
    const m = baseVal
        ? baseVal.matrix
        : {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: 0,
              f: 0
          };
    const r0 = [m.a, m.b];
    const r1 = [m.c, m.d];
    let kx = normalize(r0);
    const kz = dot(r0, r1);
    const ky = normalize(combine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
        r0[0] *= -1;
        r0[1] *= -1;
        kx *= -1;
    }
    return {
        translate: [m.e, m.f],
        scale: [kx, ky]
    };
};

/**
 * Returns the scale from current d3 transform attribute object within context object
 * d3 transform for a scale returns decimal number like: 1.9000000953674316 for 1.9 or
 * 1.100000023841858 for 1.1. We are going to round this to 2 decimal places.
 *
 * @private
 * @param {object} context - d3 element
 * @returns {Array<number>} returns the scale from d3 element
 */
const getTransformScale = (context) =>
    getSVGAnimatedTransformList(getCurrentTransform(context)).scale.map((v) =>
        round2Decimals(v)
    );

export {
    getTransformScale,
    round2Decimals,
    getCurrentTransform,
    getSVGAnimatedTransformList
};
