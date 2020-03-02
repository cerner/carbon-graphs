import * as d3 from "d3";
/**
 * @type {number} Delay duration
 */
export const TRANSITION_DELAY = 400;
/*
 * @type {number} Padding bottom
 */
export const PADDING_BOTTOM = 5;
/**
 * Flushes all D3 transitions before calling an event
 *
 * @private
 * @returns {undefined} returns nothing
 */
const flushAllD3Transitions = () => {
    const now = performance.now;
    performance.now = function() {
        return Infinity;
    };
    d3.timerFlush();
    performance.now = now;
};
/**
 * Triggers an event on provided element
 *
 * @private
 * @param {HTMLElement|Node|Window} element - DOM element
 * @param {string} eventName - event name
 * @param {Function} [cb] - callback function that needs to be executed post event trigger
 * @param {number} [delayDuration=TRANSITION_DELAY] - delay duration before calling the callback function
 * @returns {undefined} returns nothing
 */
export const triggerEvent = (
    element,
    eventName,
    cb,
    delayDuration = TRANSITION_DELAY
) => {
    try {
        const event = document.createEvent("Event");
        event.initEvent(eventName, true, true);
        element.dispatchEvent(event);
        if (cb) {
            delay(cb, delayDuration);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error caught within event trigger", e);
    }
};
/**
 * Wraps the provided function inside a setTimeout
 *
 * @private
 * @param {Function} fn - function to call
 * @param {number} [time] - Timeout milliseconds
 * @returns {number} Timeout identifier
 */
export const delay = (fn, time = TRANSITION_DELAY) => {
    flushAllD3Transitions();
    return d3.timeout(fn, time);
};
/**
 * Converts string number from HTML attributes to a number
 *
 * @private
 * @param {string} s A string to convert into a number.
 * @param {number} [radix] A value between 2 and 36 that specifies the base of the number in numString.
 * @returns {number} a number
 */
export const toNumber = (s, radix) => (!radix ? Number(s) : parseInt(s, radix));
/**
 * Loads custom matcher for Jasmine unit tests
 *
 * @returns {undefined} returns nothing
 */
export const loadCustomJasmineMatcher = () => {
    jasmine.addMatchers({
        toBeCloserTo() {
            return {
                compare(actualValue, expectedResult) {
                    const base = +(expectedResult[0] || expectedResult);
                    const offset = +(expectedResult[1] || 10);
                    const lower = base - offset;
                    const upper = base + offset;
                    const result = {
                        pass: true,
                        message: () => ""
                    };
                    result.pass =
                        +actualValue >= lower && +actualValue <= upper;
                    if (!result.pass) {
                        result.message = () =>
                            `Expected ${actualValue} to be between ${lower} and ${upper} (inclusive)`;
                    }
                    return result;
                }
            };
        }
    });
};
