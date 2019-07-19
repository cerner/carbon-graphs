import { getBarStyle } from "../../../helpers/barType";
import constants, { COLORS } from "../../../helpers/constants";
import errors from "../../../helpers/errors";
import utils from "../../../helpers/utils";

/**
 * Returns the appropriate bar based on the task style settings.
 * For Percentage Bar: Since we have multiple rectangle for a percentage
 * bar, we dont want to apply settings based on style property.
 * For Normal Bar and chunk, we apply the settings below in the
 * `rect` element style attribute.
 *
 * @private
 * @param {object} data - data associated to the task
 * @returns {string} A style constant
 */
const getTaskStyle = (data = {}) =>
    getBarStyle(data.style, { color: data.color });

/**
 * Returns the appropriate bar based on the activity style settings.
 * For Normal Bar we apply the settings below in the
 * `rect` element style attribute.
 *
 * @private
 * @param {object} data - data associated to the task
 * @returns {string} A style constant
 */
const getActivityStyle = (data = {}) => {
    const color = data.color || COLORS.BLUE;
    let currentStyle = `fill: ${color}; fill-opacity: ${constants.DEFAULT_GANTT_ACTIVITY_OPACITY};`;

    // If style property is not provided then we use treat it as filled.
    if (utils.isEmpty(data.style)) {
        return currentStyle;
    }
    if (data.style.isHashed === true) {
        currentStyle = `fill: ${constants.DEFAULT_ACTIVITY_BAR_HASH_COLOR}; fill-opacity: ${constants.DEFAULT_GANTT_ACTIVITY_OPACITY};`;
    }
    return currentStyle;
};
/**
 * Executes the function sent by consumer to get the duration.
 * This duration is used to compute start or end if one of them is not provided
 *
 * @private
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_FUNCTION}
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_VALID}
 * @param {Function} duration - Duration function which returns a Date as a number
 * @returns {number} a datetime number
 */
const getDuration = (duration) => {
    if (duration && !utils.isFunction(duration)) {
        throw new Error(errors.THROW_MSG_TASKS_DURATION_NOT_FUNCTION);
    }
    const durationTime = duration();
    if (typeof durationTime !== "number") {
        throw new Error(errors.THROW_MSG_TASKS_DURATION_NOT_VALID);
    }
    return durationTime;
};

/**
 * Executes the function sent by consumer to get the duration.
 * This duration is used to compute start or end if one of them is not provided
 *
 * @private
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_FUNCTION}
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_VALID}
 * @param {Function} duration - Duration function which returns a Date as a number
 * @returns {number} a datetime number
 */
const getActivityDuration = (duration) => {
    if (duration && !utils.isFunction(duration)) {
        throw new Error(errors.THROW_MSG_ACTIVITIES_DURATION_NOT_FUNCTION);
    }
    const durationTime = duration();
    if (typeof durationTime !== "number") {
        throw new Error(errors.THROW_MSG_ACTIVITIES_DURATION_NOT_VALID);
    }
    return durationTime;
};
/**
 * Calculates the start date using the duration provided and end datetime
 *
 * @private
 * @param {number} duration - duration date as a number
 * @param {string} start - start date string
 * @param {string} end - end date string
 * @returns {Date} start, if start datetime is provided, otherwise calculated datetime
 */
const getStartDuration = (duration = 0, start, end) =>
    utils.isEmpty(start)
        ? utils.parseDateTime(utils.getTime(end) - duration)
        : utils.parseDateTime(start);
/**
 * Calculates the end date using the duration provided and start datetime
 *
 * @private
 * @param {number} duration - duration date as a number
 * @param {string} start - start date string
 * @param {string} end - end date string
 * @returns {Date} end, if end datetime is provided, otherwise calculated datetime
 */
const getEndDuration = (duration = 0, start, end) =>
    utils.isEmpty(end)
        ? utils.parseDateTime(utils.getTime(start) + duration)
        : utils.parseDateTime(end);
/**
 *
 * Checks if the bar is a chunk (Fixed width bar) or otherwise.
 * It is a chunk if the startDate and endDate is the same.
 *
 * @private
 * @param {string} start - start date string
 * @param {string} end - end date string
 * @returns {boolean} true if chunk, false otherwise
 */
const isAChunk = (start, end) =>
    utils.getTime(end) - utils.getTime(start) === 0;
/**
 * Calculates the percentage of pixels based on start and end scales.
 *
 * @private
 * @param {number} start - Start date scaled in pixels
 * @param {number} end - End date scaled in pixels
 * @param {number} percent - Percent complete
 * @returns {number} Width for the completion bar in Pixels
 */
const calculatePercentage = (start, end, percent = 100) =>
    (percent * (end - start)) / 100;

export {
    calculatePercentage,
    isAChunk,
    getEndDuration,
    getStartDuration,
    getDuration,
    getActivityDuration,
    getTaskStyle,
    getActivityStyle
};
