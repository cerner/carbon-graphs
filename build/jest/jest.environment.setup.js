/* GLOBALS jest, jasmine */

require("@babel/polyfill");

const d3 = require("d3");
const d3timer = d3.timer;
// eslint-disable-next-line no-undef
jasmine.addMatchers({
    toBeCloserTo() {
        return {
            compare(actualValue, expectedResult) {
                const base = +(expectedResult[0] || expectedResult);
                const offset = +(expectedResult[1] || 5);
                const lower = base - offset;
                const upper = base + offset;
                const result = {
                    pass: true,
                    message: () => ""
                };
                result.pass = +actualValue >= lower && +actualValue <= upper;
                if (!result.pass) {
                    result.message = () =>
                        `Expected ${actualValue} to be between ${lower} and ${upper} (inclusive)`;
                }
                return result;
            }
        };
    }
});
d3.timer = function(callback, delay, then) {
    d3timer(callback, 0, 0);
};
