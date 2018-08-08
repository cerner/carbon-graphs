import sinon from "sinon";
import { AXIS_TYPE, COLORS } from "../../../main/js/helpers/constants";
import utils from "../../../main/js/helpers/utils";

export const barClickHandlerSpy = sinon.spy();

/**
 * Creates and returns an example input with custom axis
 * @param {Object} axis - X and Y axis data
 * @returns {Object} axes JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testBar_carbon",
    axis: utils.deepClone(axis)
});
export const axisDefault = {
    x: {
        label: "Some X Label",
        lowerLimit: 0,
        upperLimit: 6,
        ticks: {
            values: [1, 2, 3, 4, 5]
        }
    },
    y: {
        label: "Some Y Label",
        lowerLimit: 0,
        upperLimit: 40
    },
    y2: {
        show: true,
        label: "Some Y2 Label",
        lowerLimit: 0,
        upperLimit: 120
    }
};
export const axisTimeSeries = {
    x: {
        type: AXIS_TYPE.TIME_SERIES,
        label: "X Label",
        lowerLimit: "2016-01-01T12:00:00Z",
        upperLimit: "2016-06-01T12:00:00Z",
        ticks: {
            values: [
                "2016-02-03T12:00:00Z",
                "2016-03-03T12:00:00Z",
                "2016-04-03T12:00:00Z",
                "2016-05-03T12:00:00Z",
                "2016-06-03T12:00:00Z"
            ]
        }
    },
    y: {
        label: "Y Label",
        lowerLimit: 0,
        upperLimit: 20
    }
};

/**
 * Creates and returns an example input with data point values
 * @param {Array} values - x and y co-ordinate values
 * @param {boolean} isDefaultColor - if true, doesnt load the COLOR
 * @param {boolean} isDefaultShape - if true, doesnt load the SHAPE
 * @param {boolean} isY2Axis - if true, then "y2"
 * @param {string} key - content key
 * @returns {Object} input JSON
 */
export const getInput = (
    values = [],
    isDefaultColor = true,
    isDefaultShape = true,
    isY2Axis = false,
    key = `uid_1`
) => ({
    key,
    color: !isDefaultColor ? COLORS[Object.keys(COLORS)[1]] : "",
    onClick: barClickHandlerSpy,
    yAxis: isY2Axis ? "y2" : "y",
    label: {
        display: "Data Label A"
    },
    values
});

export const valuesDefault = [
    {
        x: 1,
        y: 13
    },
    {
        x: 2,
        y: 10
    },
    {
        x: 3,
        y: 15
    }
];
export const valuesNegativeDefault = [
    {
        x: 1,
        y: -13
    },
    {
        x: 2,
        y: -10
    },
    {
        x: 3,
        y: -15
    }
];
export const valuesTimeSeries = [
    {
        x: "2016-02-03T12:00:00Z",
        y: 8
    },
    {
        x: "2016-03-03T12:00:00Z",
        y: 10
    },
    {
        x: "2016-06-03T12:00:00Z",
        y: 15
    }
];
/**
 * Returns the DOM element queried by Class
 * @param {HTMLElement} id - Id attribute name
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (id, cls) => id.querySelector(`.${cls}`);

/**
 * Returns the DOM element queried by Class
 * @param {HTMLElement} id - Id attribute name
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchAllElementsByClass = (id, cls) =>
    id.querySelectorAll(`.${cls}`);
/**
 * Triggers an event on provided element
 * @param {HTMLElement} element - DOM element
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
