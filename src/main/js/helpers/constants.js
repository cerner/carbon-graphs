const D3_INBUILT_SYMBOL = {
    CIRCLE: "circle",
    CROSS: "cross",
    DIAMOND: "diamond",
    SQUARE: "square",
    TRIANGLE_DOWN: "triangle-down",
    TRIANGLE: "triangle-up"
};
// Scaling is necessary for CUSTOM_PATH
const CUSTOM_PATH = {
    TEAR_DROP: "m0.05-5.59q0 0 3.05 3.66a3.9 3.9 0 1 1-6.1 0q3.05-3.66 3.05-3.66z",
    TEAR_ALT: "m0.01 4.72q0 0-3.05-3.66a3.9 3.9 0 1 1 6.1 0q-3.05 3.66-3.05 3.66z",
    X: "m-5.01-2.47 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5-2.5-2.5-2.5 2.5-2.5-2.5 2.5-2.5z",
    RHOMBUS: "M-0.01-5.01 4.99-0.01-0.01 4.99-5.01-0.01Z",
    VERTICAL_BAR: "m-2.46-6.05h4.8v12h-4.8v-12"
};
const PADDING = {
    top: 5,
    bottom: 10,
    left: 30,
    right: 30
};
/**
 * Consumers can pick a color from this default list
 * @public
 * @type {{BLACK: string, BLUE: string,
 * GREEN: string, LIGHT_PURPLE: string, ORANGE: string,
 * YELLOW: string, GREY: string, LIGHT_BLUE: string,
 * LIGHT_GREEN: string, PURPLE: string, LIGHT_ORANGE: string, LIGHT_YELLOW: string}}
 */
export const COLORS = {
    BLACK: "#1c1f21",
    BLUE: "#007cc3",
    GREEN: "#78c346",
    LIGHT_PURPLE: "#c985da",
    ORANGE: "#ed5e00",
    YELLOW: "#ffc20a",
    GREY: "#a7aaab",
    LIGHT_BLUE: "#26a2e5",
    LIGHT_GREEN: "#a5d784",
    PURPLE: "#78288c",
    LIGHT_ORANGE: "#ff7d00",
    LIGHT_YELLOW: "#ffda6c"
};
/**
 * Consumers can pick a symbol from this default list
 * @public
 * @type {{CIRCLE: string, TRIANGLE: string,
 * SQUARE: string, X: string, DIAMOND: string,
 * CROSS: string, VERTICAL_BAR: string, RHOMBUS: string,
 * TEAR_DROP: string, TEAR_ALT: string, TRIANGLE_DOWN: string}}
 */
export const SYMBOLS = {
    CIRCLE: "CIRCLE",
    TRIANGLE: "TRIANGLE",
    SQUARE: "SQUARE",
    X: "X",
    DIAMOND: "DIAMOND",
    CROSS: "CROSS",
    VERTICAL_BAR: "VERTICAL_BAR",
    RHOMBUS: "RHOMBUS",
    TEAR_DROP: "TEAR_DROP",
    TEAR_ALT: "TEAR_ALT",
    TRIANGLE_DOWN: "TRIANGLE_DOWN"
};
/**
 * Consumers can pick axes tick type from default list
 * DEFAULT is enabled by default. This represents number based axes
 * TIMESERIES is time based axes. For now it only reflects on x-Axis
 * @public
 * @type {{DEFAULT: string, TIME_SERIES: string}}
 */
export const AXIS_TYPE = {
    DEFAULT: "default",
    TIME_SERIES: "timeseries"
};
const DEFAULT_HEIGHT = 250;
const BASE_CANVAS_WIDTH_PADDING = 10;
const DEFAULT_PLOT_SIZE = 60;
const DEFAULT_PLOT_LEGEND_SIZE = 25;
const DEFAULT_PLOT_LEGEND_SCALE = 0.75;
const DEFAULT_SELECTED_RADIUS = 9;
const DEFAULT_Y_AXIS_SPACING = 30;
const RESIZE_THROTTLE = (1000 / 60);
const MIN_TICKS = 3;
const MAX_TICK_VARIANCE = 100;
const PAIR_ITEM_TYPES = [ "high", "mid", "low" ];
const ISO8601_DATETIME = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})Z/;
const ISO8601_DATETIME_MILLI = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}.\d{3})Z/;
const HOVER_EVENT = {
    MOUSE_ENTER: "enter",
    MOUSE_EXIT: "exit"
};
const TRANSITION_DURATION = 100;
const TRANSITION_FUNCTION = "linear";

export default {
    PADDING,
    PAIR_ITEM_TYPES,
    ISO8601_DATETIME,
    ISO8601_DATETIME_MILLI,
    RESIZE_THROTTLE,
    BASE_CANVAS_WIDTH_PADDING,
    DEFAULT_HEIGHT,
    DEFAULT_PLOT_SIZE,
    DEFAULT_PLOT_LEGEND_SIZE,
    DEFAULT_PLOT_LEGEND_SCALE,
    DEFAULT_SELECTED_RADIUS,
    DEFAULT_Y_AXIS_SPACING,
    HOVER_EVENT,
    DEFAULT_SYMBOL: D3_INBUILT_SYMBOL.CIRCLE,
    DEFAULT_COLOR: COLORS.BLACK,
    CLIP_PATH_ID: `carbon-${+new Date()}-clip`,
    X_AXIS: "x",
    Y_AXIS: "y",
    Y2_AXIS: "y2",
    MIN_TICKS,
    MAX_TICK_VARIANCE,
    AXIS_TYPE,
    D3_INBUILT_SYMBOL,
    CUSTOM_PATH,
    TRANSITION_DURATION,
    TRANSITION_FUNCTION
};
