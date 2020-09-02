import sinon from "sinon";
import {
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import utils from "../../../../main/js/helpers/utils";

export const dataPointClickHandlerSpy = sinon.spy();
/**
 * Creates and returns an example input with data point values
 *
 * @param {Array} values - x and y co-ordinate values
 * @param {boolean} isDefaultColor - if true, doesnt load the COLOR
 * @param {boolean} isDefaultShape - if true, doesnt load the SHAPE
 * @param {boolean} isY2Axis - if true, then "y2"
 * @returns {object} input JSON
 */
export const getInput = (
    values,
    isDefaultColor = true,
    isDefaultShape = true,
    isY2Axis = false
) => ({
    key: `uid_1`,
    shape: {
        high: isDefaultShape ? "" : SHAPES.TEAR_ALT,
        mid: isDefaultShape ? "" : SHAPES.RHOMBUS,
        low: isDefaultShape ? "" : SHAPES.TEAR_DROP
    },
    color: {
        high: isDefaultColor ? "" : COLORS[Object.keys(COLORS)[1]],
        mid: isDefaultColor ? "" : COLORS[Object.keys(COLORS)[2]],
        low: isDefaultColor ? "" : COLORS[Object.keys(COLORS)[1]]
    },
    onClick: dataPointClickHandlerSpy,
    yAxis: isY2Axis ? "y2" : "y",
    label: {
        high: {
            display: "Data Label High"
        },
        mid: {
            display: "Data Label Median"
        },
        low: {
            display: "Data Label Low"
        }
    },
    values
});
/**
 * Creates and returns an example input with custom axis
 *
 * @param {object} axis - X and Y axis data
 * @returns {object} axes JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testPairedResult_carbon",
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
        upperLimit: 200
    },
    y2: {
        show: true,
        label: "Y2 Label",
        lowerLimit: 0,
        upperLimit: 200
    }
};
export const valuesTimeSeries = [
    {
        high: {
            x: "2016-08-17T12:00:00Z",
            y: 110
        },
        mid: {
            x: "2016-08-18T12:00:00Z",
            y: 70
        },
        low: {
            x: "2016-08-19T02:00:00Z",
            y: 30
        }
    },
    {
        high: {
            x: "2016-10-17T09:00:00Z",
            y: 160
        },
        mid: {
            x: "2016-10-18T11:00:00Z",
            y: 120
        },
        low: {
            x: "2016-10-19T21:00:00Z",
            y: 100
        }
    }
];
export const axisDefault = {
    x: {
        label: "X Label",
        lowerLimit: 0,
        upperLimit: 100
    },
    y: {
        label: "Y Label",
        lowerLimit: 0,
        upperLimit: 200
    },
    y2: {
        show: true,
        label: "Y2 Label",
        lowerLimit: 0,
        upperLimit: 200
    }
};
export const valuesDefault = [
    {
        high: {
            x: 45,
            y: 350
        },
        mid: {
            x: 45,
            y: 146
        },
        low: {
            x: 45,
            y: 75
        }
    },
    {
        high: {
            x: 470,
            y: 110
        },
        mid: {
            x: 470,
            y: 70
        },
        low: {
            x: 470,
            y: 30
        }
    },
    {
        high: {
            x: 300,
            y: 150
        },
        mid: {
            x: 300,
            y: 80
        },
        low: {
            x: 300,
            y: 50
        }
    }
];
export const simpleRegion = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220,
            color: "#c8cacb"
        }
    ],
    low: [
        {
            axis: "y",
            start: 20,
            end: 70
        }
    ]
};
export const multiRegion = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220,
            color: "#c8cacb"
        },
        {
            axis: "y",
            start: 180,
            end: 230,
            color: "#d6d8d9"
        }
    ],
    low: [
        {
            axis: "y",
            start: 20,
            end: 70
        }
    ]
};
export const multiRegionNotSame = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220,
            color: "#c8cacb"
        },
        {
            axis: "y",
            start: 180,
            end: 230,
            color: "#d6d8d9"
        }
    ],
    low: [
        {
            axis: "y",
            start: 20,
            end: 70
        }
    ],
    mid: [
        {
            axis: "y",
            start: 20,
            end: 90
        }
    ]
};
export const multiRegionSameData = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220
        }
    ],
    low: [
        {
            axis: "y",
            start: 140,
            end: 220
        }
    ],
    mid: [
        {
            axis: "y",
            start: 140,
            end: 220
        }
    ]
};
export const regionMissing = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220
        }
    ],
    low: [
        {
            axis: "y",
            start: 140,
            end: 220
        }
    ]
};
export const inputSecondary = {
    key: `uid_2`,
    label: {
        high: {
            display: "Data Label 2 High"
        },
        mid: {
            display: "Data Label 2 Median"
        },
        low: {
            display: "Data Label 2 Low"
        }
    },
    values: valuesDefault
};
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
