import sinon from "sinon";
import constants, { COLORS } from "../../../main/js/helpers/constants";
import utils from "../../../main/js/helpers/utils";

export const SHAPES = {
    RHOMBUS: "RHOMBUS",
    CIRCLE: "CIRCLE"
};
export const onClickFunctionSpy = sinon.spy();
export const TRANSITION_DELAY = 500;
export const BASE_CANVAS_HEIGHT_PADDING =
    (constants.PADDING.bottom * 2 + constants.PADDING.top) * 2;
export const DEFAULT_HEIGHT =
    constants.TIMELINE_HEIGHT +
    constants.PADDING.top -
    constants.PADDING.bottom;
export const axisJSON = {
    x: {
        label: "Datetime",
        lowerLimit: new Date(2018, 0, 1, 12).toISOString(),
        upperLimit: new Date(2019, 0, 1, 12).toISOString()
    }
};
export const valuesJSON = [
    {
        x: new Date(2018, 1, 1).toISOString(),
        content: "This is custom value of another unit"
    },
    {
        x: new Date(2018, 10, 1).toISOString(),
        content: "This is custom value of another unit"
    }
];
export const secondaryValuesJSON = [
    {
        x: new Date(2018, 2, 1).toISOString(),
        content: "Secondary Values content"
    },
    {
        x: new Date(2018, 7, 1).toISOString(),
        content: "Secondary Values content"
    }
];
/**
 * Triggers an event on provided element
 * @param {HTMLElement|Node} element - DOM element
 * @param {string} eventName - event name
 * @param {Function} [cb] - callback function that needs to be executed post event trigger
 * @param {number} [delayDuration=100] - delay duration before calling the callback function
 * @returns {undefined} returns nothing
 */
export const triggerEvent = (element, eventName, cb, delayDuration = 100) => {
    const event = document.createEvent("Event");
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
    if (cb) {
        setTimeout(cb, delayDuration);
    }
};
/**
 * Creates and returns an example input with custom axis values
 * @param {Object} axis - X axis data
 * @returns {Object} input JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testCarbonTimeline",
    axis: utils.deepClone(axis)
});
/**
 * Creates and returns an example input with data point values
 * @param {Array} values - x and y co-ordinate values
 * @param {boolean} isDefaultColor - if true, doesnt load the COLOR
 * @param {boolean} isDefaultShape - if true, doesnt load the SHAPE
 * @returns {Object} input JSON
 */
export const getData = (values, isDefaultColor = true, isDefaultShape = true) =>
    utils.deepClone({
        key: "uid_1",
        label: {
            display: "Timeline A"
        },
        color: !isDefaultColor ? COLORS[Object.keys(COLORS)[1]] : "",
        shape: !isDefaultShape ? SHAPES.RHOMBUS : "",
        onClick: onClickFunctionSpy,
        values
    });
/**
 * Returns the DOM element queried by Class
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (cls) => document.querySelector(`.${cls}`);
