import { AXIS_TYPE } from "../../../main/js/helpers/constants";
import utils from "../../../main/js/helpers/utils";

/**
 * Creates and returns an example input with custom axis values
 * @param {Object} axis - X and Y axis data
 * @returns {Object} input JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testGraph_carbon",
    axis: utils.deepClone(axis)
});
/**
 * Creates and returns an example input with data point values
 * @param {Array} values - x and y co-ordinate values
 * @returns {Object} input JSON
 */
export const getData = (values = []) =>
    utils.deepClone({
        key: "uid_1",
        label: {
            display: "Data Label 1"
        },
        values
    });

export const dimension = {
    height: 200
};
export const axisTimeSeries = {
    x: {
        type: AXIS_TYPE.TIME_SERIES,
        label: "Some X Label",
        lowerLimit: "2016-01-01T12:00:00Z",
        upperLimit: "2017-01-01T12:00:00Z"
    },
    y: {
        label: "Some Y Label",
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
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (cls) => document.querySelector(`.${cls}`);
