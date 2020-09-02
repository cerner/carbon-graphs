import sinon from "sinon";
import Carbon from "../../../../main/js/carbon";
import { AXIS_TYPE, COLORS } from "../../../../main/js/helpers/constants";
import utils from "../../../../main/js/helpers/utils";

/**
 * @typedef BarConfig
 */

/**
 * Creates and returns an example input with custom axis
 *
 * @param {object} axis - X and Y axis data
 * @returns {object} axes JSON
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
    },
    y2: {
        show: true,
        label: "Y2 Label",
        lowerLimit: 0,
        upperLimit: 20
    }
};

/**
 * Creates and returns an example input with data point values
 *
 * @param {Array} values - x and y co-ordinate values
 * @param {boolean} isDefaultColor - if true, doesnt load the COLOR
 * @param {boolean} isDefaultShape - if true, doesnt load the SHAPE
 * @param {boolean} isY2Axis - if true, then "y2"
 * @param {string} key - content key
 * @returns {BarConfig} input JSON
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
    onClick: sinon.spy(),
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
export const valuesOutliers = [
    {
        x: 1,
        y: 40
    },
    {
        x: 2,
        y: 35
    },
    {
        x: 3,
        y: 38
    }
];
export const regionsDefault = [
    {
        x: 1,
        start: 7,
        end: 7
    },
    {
        x: 2,
        start: 13,
        end: 13
    }
];
export const axisInfoRowDefault = [
    {
        axis: "x",
        x: 1,
        value: {
            onClick: () => {},
            characterCount: 9,
            color: Carbon.helpers.COLORS.ORANGE,
            shape: {
                path: {
                    d: "M24,0l24,24L24,48L0,24L24,0z",
                    fill: Carbon.helpers.COLORS.ORANGE
                },
                options: {
                    x: -6,
                    y: -6,
                    scale: 0.25
                }
            },
            label: {
                display: "51",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: 2,
        value: {
            onClick: () => {},
            characterCount: 9,
            color: Carbon.helpers.COLORS.ORANGE,
            shape: {},
            label: {
                display: "51",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: 3,
        value: {
            onClick: () => {},
            characterCount: 9,
            color: Carbon.helpers.COLORS.ORANGE,
            shape: {},
            label: {
                display: "51",
                secondaryDisplay: "ICU"
            }
        }
    }
];
export const axisInfoRowTimeSeries = [
    {
        axis: "x",
        x: "2016-02-03T12:00:00Z",
        value: {
            onClick: () => {},
            characterCount: 9,
            color: Carbon.helpers.COLORS.ORANGE,
            shape: {
                path: {
                    d: "M24,0l24,24L24,48L0,24L24,0z",
                    fill: Carbon.helpers.COLORS.ORANGE
                },
                options: {
                    x: -6,
                    y: -6,
                    scale: 0.25
                }
            },
            label: {
                display: "51",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: "2016-03-03T12:00:00Z",
        value: {
            onClick: () => {},
            characterCount: 9,
            color: Carbon.helpers.COLORS.ORANGE,
            shape: {},
            label: {
                display: "51",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: "2016-06-03T12:00:00Z",
        value: {
            onClick: () => {},
            characterCount: 9,
            color: Carbon.helpers.COLORS.ORANGE,
            shape: {},
            label: {
                display: "51",
                secondaryDisplay: "ICU"
            }
        }
    }
];
/**
 * Returns the DOM element queried by Class
 *
 * @param {HTMLElement} id - Id attribute name
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (id, cls) => id.querySelector(`.${cls}`);

/**
 * Returns the DOM element queried by Class
 *
 * @param {HTMLElement} id - Id attribute name
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchAllElementsByClass = (id, cls) =>
    id.querySelectorAll(`.${cls}`);
