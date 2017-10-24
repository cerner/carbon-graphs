import sinon from "sinon";
import {
    AXIS_TYPE,
    COLORS
} from "../../../main/js/helpers/constants";
import utils from "../../../main/js/helpers/utils";

const SYMBOLS = {
    RHOMBUS: "RHOMBUS",
    CIRCLE: "CIRCLE"
};
export const dataPointClickHandlerSpy = sinon.spy();
/**
 * Creates and returns an example input with data point values
 * @param {Array} values - x and y co-ordinate values
 * @param {boolean} isDefaultColor - if true, doesnt load the COLOR
 * @param {boolean} isDefaultSymbol - if true, doesnt load the SYMBOL
 * @param {boolean} isY2Axis - if true, then "y2"
 * @returns {Object} input JSON
 */
export const getInput = (values = [], isDefaultColor = true, isDefaultSymbol = true, isY2Axis = false) => (
    {
        key: `uid_1`,
        color: isDefaultColor ? "" : COLORS[ Object.keys(COLORS)[ 1 ] ],
        symbol: isDefaultSymbol ? "" : SYMBOLS.RHOMBUS,
        onClick: dataPointClickHandlerSpy,
        yAxis: isY2Axis ? "y2" : "y",
        label: {
            display: "Data Label A"
        },
        values
    }
);
/**
 * Creates and returns an example input with custom axis
 * @param {Object} axis - X and Y axis data
 * @returns {Object} axes JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testLine_carbon",
    axis: utils.deepClone(axis)
});
export const axisTimeSeries = {
    x: {
        type: AXIS_TYPE.TIME_SERIES,
        label: "X Label",
        lowerLimit: "2016-01-01T12:00:00Z",
        upperLimit: "2017-01-01T12:00:00Z"
    },
    y: {
        label: "Y Label",
        lowerLimit: 0,
        upperLimit: 20
    }
};
export const valuesTimeSeries = [
    {
        x: "2016-02-03T12:00:00Z",
        y: 1
    },
    {
        x: "2016-03-03T12:00:00Z",
        y: 10
    },
    {
        x: "2016-06-03T12:00:00Z",
        y: 100
    }
];
export const axisDefault = {
    x: {
        label: "Some X Label",
        lowerLimit: 0,
        upperLimit: 100
    },
    y: {
        label: "Some Y Label",
        lowerLimit: 0,
        upperLimit: 20
    }
};
export const valuesDefault = [
    {
        x: 35,
        y: 4
    },
    {
        x: 45,
        y: 10
    },
    {
        x: 25,
        y: 35
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
 * Triggers an event on provided element
 * @param {HTMLElement} element - DOM element
 * @param {string} eventName - event name
 * @returns {undefined} returns nothing
 */
export const triggerEvent = (element, eventName) => {
    const event = document.createEvent("Event");
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
};
