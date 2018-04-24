import sinon from "sinon";
import Carbon from "../../../main/js/carbon";
import constants from "../../../main/js/helpers/constants";
import utils from "../../../main/js/helpers/utils";

export const onClickFunctionSpy = sinon.spy();
export const taskStartDate = new Date(2018, 2, 1).toISOString();
export const taskEndDate = new Date(2018, 5, 10).toISOString();
export const TRANSITION_DELAY = 500;
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
    }
];
export const trackDimension = {
    dimension: {
        trackHeight: 100
    }
};
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
 * @param {Object} axis - X and Y axis data
 * @returns {Object} input JSON
 */
export const getAxes = (axis = {}) => ({
    bindTo: "#testCarbonGantt",
    axis: utils.deepClone(axis)
});
/**
 * Creates and returns an example input with data point values
 * @param {Object} tasks - task values
 * @param {Object} activities - activities values
 * @param {Object} events - events values
 * @param {Object} actions - actions values
 * @returns {Object} input JSON
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
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (cls) => document.querySelector(`.${cls}`);
