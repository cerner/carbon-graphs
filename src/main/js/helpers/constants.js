/**
 * @module constants
 * @alias module:constants
 */
import d3 from "d3";

/**
 * Consumers can pick a color from this default list
 * @public
 * @property {string} BLACK "#1c1f21"
 * @property {string} BLUE "#007cc3"
 * @property {string} GREEN "#78c346"
 * @property {string} LIGHT_PURPLE "#c985da"
 * @property {string} ORANGE "#ffc20a"
 * @property {string} YELLOW "#ffc20a"
 * @property {string} GREY "#a7aaab"
 * @property {string} LIGHT_BLUE "#26a2e5"
 * @property {string} LIGHT_GREEN "#a5d784"
 * @property {string} PURPLE "#78288c"
 * @property {string} LIGHT_ORANGE "#ff7d00"
 * @property {string} LIGHT_YELLOW "#ffda6c"
 * @enum {{Object: String}}
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
 * @property {string} CIRCLE "CIRCLE"
 * @property {string} TRIANGLE "TRIANGLE"
 * @property {string} SQUARE "SQUARE"
 * @property {string} X "X"
 * @property {string} DIAMOND "DIAMOND"
 * @property {string} CROSS "CROSS"
 * @property {string} VERTICAL_BAR "VERTICAL_BAR"
 * @property {string} RHOMBUS "RHOMBUS"
 * @property {string} TEAR_DROP "TEAR_DROP"
 * @property {string} TEAR_ALT "TEAR_ALT"
 * @property {string} TRIANGLE_DOWN "TRIANGLE_DOWN"
 * @enum {{Object: String}}
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
 * @property {string} DEFAULT "default"
 * @property {string} TIME_SERIES "timeseries"
 * @enum {{DEFAULT: string, TIME_SERIES: string}}
 */
export const AXIS_TYPE = {
    DEFAULT: "default",
    TIME_SERIES: "timeseries"
};
/**
 * @enum {Object}
 */
export default {
    PADDING: {
        top: 5,
        bottom: 10,
        left: 30,
        right: 30
    },
    PAIR_ITEM_TYPES: ["high", "mid", "low"],
    ISO8601_DATE_TIME_MILLI: /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(:\d{2}(\.\d+)*)*)Z/,
    RESIZE_THROTTLE: 1000 / 60,
    BASE_CANVAS_WIDTH_PADDING: 10,
    DEFAULT_HEIGHT: 250,
    DEFAULT_PLOT_SIZE: 60,
    DEFAULT_PLOT_SCALE: [1, 1],
    DEFAULT_CRITICAL_OUTER_PLOT_SCALE: [1.9, 1.9],
    DEFAULT_CRITICAL_INNER_PLOT_SCALE: [1.4, 1.4],
    DEFAULT_LEGEND_ICON_SIZE: 30,
    DEFAULT_LEGEND_ICON_SCALE: 4,
    DEFAULT_LEGEND_ICON_X_POS: 25,
    DEFAULT_LEGEND_ICON_Y_POS: 22.5,
    DEFAULT_SELECTED_RADIUS: 9,
    DEFAULT_Y_AXIS_SPACING: 30,
    HOVER_EVENT: {
        MOUSE_ENTER: "enter",
        MOUSE_EXIT: "exit"
    },
    VIEW_BOX_SIZE: "0 0 48 48",
    DEFAULT_SHAPE: "circle",
    DEFAULT_COLOR: COLORS.BLACK,
    CLIP_PATH_ID: `carbon-${+new Date()}-clip`,
    X_AXIS: "x",
    Y_AXIS: "y",
    Y2_AXIS: "y2",
    MIN_TICKS: 3,
    MAX_TICK_VARIANCE: 100,
    SHAPE_PROPS: {
        CIRCLE: {
            translate: [24, 24],
            scale: 5
        },
        TRIANGLE: {
            translate: [24, 24],
            scale: 4
        },
        SQUARE: {
            translate: [24, 24],
            scale: 5.5
        },
        X: {
            translate: [24, 24],
            scale: 4.5
        },
        DIAMOND: {
            translate: [24, 24],
            scale: 3.25
        },
        CROSS: {
            translate: [24, 24],
            scale: 4.5
        },
        VERTICAL_BAR: {
            translate: [24, 24],
            scale: 4.5
        },
        RHOMBUS: {
            translate: [24, 24],
            scale: 4.75
        },
        TEAR_DROP: {
            translate: [24, 27],
            scale: 4.75
        },
        TEAR_ALT: {
            translate: [24, 25],
            scale: 4.75
        },
        TRIANGLE_DOWN: {
            translate: [24, 24],
            scale: 4
        }
    },
    D3_INBUILT_SHAPE: {
        CIRCLE: "circle",
        CROSS: "cross",
        DIAMOND: "diamond",
        SQUARE: "square",
        TRIANGLE_DOWN: "triangle-down",
        TRIANGLE: "triangle-up"
    },
    CUSTOM_SHAPE_PATH: {
        TEAR_DROP:
            "m0.05-5.59q0 0 3.05 3.66a3.9 3.9 0 1 1-6.1 0q3.05-3.66 3.05-3.66z",
        TEAR_ALT:
            "m0.01 4.72q0 0-3.05-3.66a3.9 3.9 0 1 1 6.1 0q-3.05 3.66-3.05 3.66z",
        X:
            "m-5.01-2.47 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5-2.5-2.5-2.5 2.5-2.5-2.5 2.5-2.5z",
        RHOMBUS: "M-0.01-5.01 4.99-0.01-0.01 4.99-5.01-0.01Z",
        VERTICAL_BAR: "m-2.46-6.05h4.8v12h-4.8v-12"
    },
    DEFAULT_INTERPOLATION: "linear",
    SELECTION_INDICATOR_X_POSITION: 10,
    SELECTION_INDICATOR_Y_POSITION: 12.5,
    d3Transition: d3
        .transition()
        .duration(250)
        .ease()
};
