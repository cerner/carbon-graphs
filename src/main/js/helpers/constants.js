/**
 * @module constants
 * @alias module:constants
 */
/**
 * Consumers can pick a color from this default list
 * @public
 * @enum {{BLACK: string, BLUE: string,
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
 * Consumers can pick a shape from this default list
 * @public
 * @enum {{CIRCLE: string, TRIANGLE: string,
 * SQUARE: string, X: string, DIAMOND: string,
 * CROSS: string, VERTICAL_BAR: string, RHOMBUS: string,
 * TEAR_DROP: string, TEAR_ALT: string, TRIANGLE_DOWN: string}}
 */
export const SHAPES = {
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
 * @enum {{DEFAULT: string, TIME_SERIES: string}}
 */
export const AXIS_TYPE = {
    DEFAULT: "default",
    TIME_SERIES: "timeseries"
};
/**
 * @enum {String}
 */
export default {
    PADDING: {
        top: 5,
        bottom: 10,
        left: 30,
        right: 30
    },
    PAIR_ITEM_TYPES: [ "high", "mid", "low" ],
    ISO8601_DATE_TIME_MILLI: /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(:\d{2}(\.\d+)*)*)Z/,
    RESIZE_THROTTLE: (1000 / 60),
    BASE_CANVAS_WIDTH_PADDING: 10,
    DEFAULT_HEIGHT: 250,
    DEFAULT_PLOT_SIZE: 60,
    DEFAULT_PLOT_LEGEND_SIZE: 30,
    DEFAULT_PLOT_LEGEND_SCALE: 4,
    DEFAULT_SELECTED_RADIUS: 9,
    DEFAULT_Y_AXIS_SPACING: 30,
    HOVER_EVENT: {
        MOUSE_ENTER: "enter",
        MOUSE_EXIT: "exit"
    },
    LEGEND_ICON_SIZE: "0 0 48 48",
    DEFAULT_SHAPE: "circle",
    DEFAULT_COLOR: COLORS.BLACK,
    CLIP_PATH_ID: `carbon-${+new Date()}-clip`,
    X_AXIS: "x",
    Y_AXIS: "y",
    Y2_AXIS: "y2",
    MIN_TICKS: 3,
    MAX_TICK_VARIANCE: 100,
    D3_INBUILT_SHAPE: {
        CIRCLE: "circle",
        CROSS: "cross",
        DIAMOND: "diamond",
        SQUARE: "square",
        TRIANGLE_DOWN: "triangle-down",
        TRIANGLE: "triangle-up"
    },
    CUSTOM_SHAPE_PATH: {
        TEAR_DROP: "m0.05-5.59q0 0 3.05 3.66a3.9 3.9 0 1 1-6.1 0q3.05-3.66 3.05-3.66z",
        TEAR_ALT: "m0.01 4.72q0 0-3.05-3.66a3.9 3.9 0 1 1 6.1 0q-3.05 3.66-3.05 3.66z",
        X: "m-5.01-2.47 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5-2.5-2.5-2.5 2.5-2.5-2.5 2.5-2.5z",
        RHOMBUS: "M-0.01-5.01 4.99-0.01-0.01 4.99-5.01-0.01Z",
        VERTICAL_BAR: "m-2.46-6.05h4.8v12h-4.8v-12"
    },
    TRANSITION_DURATION: 100,
    TRANSITION_FUNCTION: "linear",
    DEFAULT_INTERPOLATION: "linear",
    SELECTION_INDICATOR_X_POSITION: 10,
    SELECTION_INDICATOR_Y_POSITION: 12.5
};
