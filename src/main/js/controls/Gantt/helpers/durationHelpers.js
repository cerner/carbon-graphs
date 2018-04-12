import errors from "../../../helpers/errors";
import utils from "../../../helpers/utils";

/**
 * Returns the appropriate bar based on the task style settings
 * @private
 * @param {Object} styles - Style setting for task bar
 * @returns {string} A style constant
 */
export const getTaskStyle = (styles) => {
    // TODO Return style constants for each of the case
};
/**
 * Executes the function sent by consumer to get the duration.
 * This duration is used to compute start or end if one of them is not provided
 * @private
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_FUNCTION}
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_VALID}
 * @param {Function} duration - Duration function which returns a Date as a number
 * @returns {number} a datetime number
 */
export const getDuration = (duration) => {
    if (!utils.isFunction(duration)) {
        throw new Error(errors.THROW_MSG_TASKS_DURATION_NOT_FUNCTION);
    }
    const durationTime = duration();
    if (typeof durationTime !== "number") {
        throw new Error(errors.THROW_MSG_TASKS_DURATION_NOT_VALID);
    }
    return durationTime;
};
/**
 * Calculates the start date using the duration provided and end datetime
 * @private
 * @param {number} duration - duration date as a number
 * @param {string} start - start date string
 * @param {string} end - end date string
 * @returns {Date} start, if start datetime is provided, otherwise calculated datetime
 */
export const getStartDuration = (duration, start, end) =>
    utils.isEmpty(start)
        ? utils.parseDateTime(utils.getTime(end) - duration)
        : utils.parseDateTime(start);
/**
 * Calculates the end date using the duration provided and start datetime
 * @private
 * @param {number} duration - duration date as a number
 * @param {string} start - start date string
 * @param {string} end - end date string
 * @returns {Date} end, if end datetime is provided, otherwise calculated datetime
 */
export const getEndDuration = (duration, start, end) =>
    utils.isEmpty(end)
        ? utils.parseDateTime(utils.getTime(start) + duration)
        : utils.parseDateTime(end);
