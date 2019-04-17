/* GLOBALS jest */

require("@babel/polyfill");

const d3 = require("d3");
const d3timer = d3.timer;

d3.timer = function(callback, delay, then) {
    d3timer(callback, 0, 0);
};
