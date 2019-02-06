import d3 from "d3";

/**
 * @type {number} Delay duration
 */
export const TRANSITION_DELAY = 400;
/**
 * Disables all animations for unit testing
 * @returns {undefined} returns nothing
 */
export const flushAllD3Transitions = () => {
    const now = Date.now;
    Date.now = function() {
        return Infinity;
    };
    d3.timer.flush();
    Date.now = now;
};
/**
 * Triggers an event on provided element
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
    const event = document.createEvent("Event");
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
    if (cb) {
        flushAllD3Transitions();
        delay(cb, delayDuration);
    }
};
/**
 * Wraps the provided function inside a setTimeout
 * @param {Function} fn - function to call
 * @param {int} [time=100] - Timeout milliseconds
 * @returns {int} Timeout identifier
 */
export const delay = (fn, time = TRANSITION_DELAY) => setTimeout(fn, time);
