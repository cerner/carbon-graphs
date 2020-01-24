import sinon from "sinon";
import Carbon from "../../../../main/js/carbon";
import constants from "../../../../main/js/helpers/constants";
import utils from "../../../../main/js/helpers/utils";

export const onClickFunctionSpy = sinon.spy();
export const taskStartDate = new Date(2018, 2, 1).toISOString();
export const taskEndDate = new Date(2018, 5, 10).toISOString();
export const BASE_CANVAS_HEIGHT_PADDING =
    (constants.PADDING.bottom * 2 + constants.PADDING.top) * 2;
export const legendJSON = [
    {
        key: "uid_action_1",
        label: {
            display: "Action A"
        },
        shape: Carbon.helpers.SHAPES.CIRCLE,
        color: Carbon.helpers.COLORS.BLUE
    },
    {
        key: "uid_action_2",
        label: {
            display: "Action B"
        },
        shape: Carbon.helpers.SHAPES.TRIANGLE,
        color: Carbon.helpers.COLORS.GREEN
    }
];
export const axisJSON = {
    x: {
        lowerLimit: new Date(2018, 0, 1, 12).toISOString(),
        upperLimit: new Date(2019, 0, 1, 12).toISOString()
    },
    y: {}
};
export const taskValuesJSON = [
    {
        key: "taskNormal",
        onClick: sinon.spy(),
        label: {
            display: "Story Apex Task Something"
        },
        startDate: taskStartDate,
        endDate: taskEndDate
    },
    {
        key: "taskChunk",
        onClick: sinon.spy(),
        label: {
            display: "Story Broccoli"
        },
        startDate: taskStartDate,
        endDate: taskStartDate
    },
    {
        key: "taskPercentage",
        onClick: sinon.spy(),
        label: {
            display: "Story Charming"
        },
        percentage: 50,
        startDate: taskStartDate,
        endDate: taskEndDate
    },
    {
        key: "taskHash",
        onClick: sinon.spy(),
        label: {
            display: "Story Charming"
        },
        startDate: taskStartDate,
        endDate: taskEndDate,
        style: {
            isHashed: true
        }
    }
];
export const activityValuesJSON = [
    {
        key: "activityNormal",
        label: {
            display: "Story Apex Activity Something"
        },
        startDate: taskStartDate,
        endDate: taskEndDate
    },
    {
        key: "activityChunk",
        label: {
            display: "Story Broccoli"
        },
        startDate: taskStartDate,
        endDate: taskStartDate
    }
];
export const trackDimension = {
    dimension: {
        trackHeight: 100
    }
};
export const datelineJSON = [
    {
        showDatelineIndicator: true,
        label: {
            display: "Release A"
        },
        color: Carbon.helpers.COLORS.GREEN,
        shape: Carbon.helpers.SHAPES.SQUARE,
        value: new Date(2018, 5, 1).toISOString()
    }
];

export const eventlineJSON = [
    {
        color: Carbon.helpers.COLORS.GREY,
        style: {
            strokeDashArray: "4,4"
        },
        value: new Date(2018, 5, 1).toISOString()
    }
];

export const eventlineAlt = {
    color: Carbon.helpers.COLORS.GREY,
    style: {
        strokeDashArray: "4,4"
    },
    value: new Date(2018, 5, 1).toISOString()
};

export const datelineAlt = {
    showDatelineIndicator: true,
    label: {
        display: "Release A"
    },
    color: Carbon.helpers.COLORS.GREEN,
    shape: Carbon.helpers.SHAPES.SQUARE,
    value: new Date(2018, 5, 1).toISOString()
};
/**
 * Creates and returns an example input with custom axis values
 *
 * @param {object} axis - X and Y axis data
 * @returns {object} input JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testCarbonGantt",
    axis: utils.deepClone(axis)
});
/**
 * Creates and returns an example input with data point values
 *
 * @param {object} tasks - task values
 * @param {object} activities - activities values
 * @param {object} events - events values
 * @param {object} actions - actions values
 * @returns {object} input JSON
 */
export const getData = (
    tasks = [],
    activities = [],
    events = [],
    actions = []
) =>
    utils.deepClone({
        key: "track 1",
        /**
         * Track dimension removed to enable usage
         * of default track height
         */
        trackLabel: {
            display: "Project A",
            onClick: onClickFunctionSpy
        },
        tasks,
        activities,
        events,
        actions
    });
/**
 * Returns the DOM element queried by Class
 *
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (cls) => document.querySelector(`.${cls}`);

/**
 * Returns the DOM element queried by Class
 *
 * @param {HTMLElement} id - Id attribute name
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchAllElementsByClass = (id, cls) =>
    id.querySelectorAll(`.${cls}`);
