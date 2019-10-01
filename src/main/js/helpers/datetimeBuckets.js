import styles from "./styles";
import utils from "./utils";

/**
 * @typedef d3
 */

/**
 * Different types of Buckets.
 *
 * @private
 * @type {{UPPER_STEP_TICK_VALUES: string, LOWER_STEP_TICK_VALUES: string, MIDPOINT_TICK_VALUES: string}}
 */
const BUCKET_TYPES = {
    LOWER_STEP_TICK_VALUES: "lowerStepTickValues",
    MIDPOINT_TICK_VALUES: "midpointTickValues",
    UPPER_STEP_TICK_VALUES: "upperStepTickValues"
};
/**
 * Helper to create the d3 Axis ticks (X-Axis ticks) of different types and append into the canvas.
 *
 * @private
 * @param {object} gridSVG - d3 object of the grid
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Function} createVGridHandler - Call back function to create grid.
 * @returns {undefined} - returns nothing.
 */
const createDatetimeBuckets = (gridSVG, axis, config, createVGridHandler) => {
    if (
        utils.notEmpty(config.axis.x.ticks.values) &&
        utils.isEmpty(config.axis.x.ticks.lowerStepTickValues)
    ) {
        createVGridForDatetimeBuckets(
            gridSVG,
            axis,
            config.axis.x.ticks.values,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.LOWER_STEP_TICK_VALUES,
            createVGridHandler
        );
    } else if (utils.notEmpty(config.axis.x.ticks.lowerStepTickValues)) {
        createVGridForDatetimeBuckets(
            gridSVG,
            axis,
            config.axis.x.ticks.lowerStepTickValues,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.LOWER_STEP_TICK_VALUES,
            createVGridHandler
        );
    }

    if (utils.notEmpty(config.axis.x.ticks.midpointTickValues)) {
        createVGridForDatetimeBuckets(
            gridSVG,
            axis,
            config.axis.x.ticks.midpointTickValues,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.MIDPOINT_TICK_VALUES,
            createVGridHandler
        );
    }

    if (utils.notEmpty(config.axis.x.ticks.upperStepTickValues)) {
        createVGridForDatetimeBuckets(
            gridSVG,
            axis,
            config.axis.x.ticks.upperStepTickValues,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.UPPER_STEP_TICK_VALUES,
            createVGridHandler
        );
    }
};

/**
 * Helper to translate d3 Axis ticks (X-Axis ticks) of different types and append into the canvas.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Function} translateVGridHandler - Call back function to translate grid.
 * @returns {undefined} - returns nothing.
 */
const translateDatetimeBuckets = (
    canvasSVG,
    axis,
    config,
    translateVGridHandler
) => {
    if (
        utils.notEmpty(config.axis.x.ticks.values) &&
        utils.isEmpty(config.axis.x.ticks.lowerStepTickValues)
    ) {
        translateVGridDatetimeBuckets(
            canvasSVG,
            axis,
            config.axis.x.ticks.values,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.LOWER_STEP_TICK_VALUES,
            translateVGridHandler
        );
    } else if (utils.notEmpty(config.axis.x.ticks.lowerStepTickValues)) {
        translateVGridDatetimeBuckets(
            canvasSVG,
            axis,
            config.axis.x.ticks.lowerStepTickValues,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.LOWER_STEP_TICK_VALUES,
            translateVGridHandler
        );
    }

    if (utils.notEmpty(config.axis.x.ticks.midpointTickValues)) {
        translateVGridDatetimeBuckets(
            canvasSVG,
            axis,
            config.axis.x.ticks.midpointTickValues,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.MIDPOINT_TICK_VALUES,
            translateVGridHandler
        );
    }

    if (utils.notEmpty(config.axis.x.ticks.upperStepTickValues)) {
        translateVGridDatetimeBuckets(
            canvasSVG,
            axis,
            config.axis.x.ticks.upperStepTickValues,
            config.axis.x.orientation,
            config.height,
            config.settingsDictionary.transition,
            BUCKET_TYPES.UPPER_STEP_TICK_VALUES,
            translateVGridHandler
        );
    }
};

/**
 * Helper to create the d3 Axis ticks (X-Axis ticks) of different types based on if its gantt or not.
 *
 * @private
 * @param {object} gridSVG - d3 object of the grid
 * @param {object} axis - Axis scaled according to input parameters
 * @param {Array} values - List of all tick values.
 * @param {string} orientation - X axis orientation.
 * @param {string} height - height of the grid, based on input config.
 * @param {object} transition - gets transition based on pannig mode is enabled or not
 * @param {string} type - type of tick. Either lowerStepTick or midpointTick or upperStepTick.
 * @param {Function} createVGridHandler - Call back function to create grid.
 * @returns {undefined} - returns nothing.
 */
const createVGridForDatetimeBuckets = (
    gridSVG,
    axis,
    values,
    orientation,
    height,
    transition,
    type,
    createVGridHandler
) => {
    const config = createDatetimeBucketConfig(
        values,
        height,
        orientation,
        transition
    );
    const style = determineBucketStyle(type);
    createVGridHandler(gridSVG, axis, style, config);
};

/**
 * Helper to translate the d3 Axis ticks (X-Axis ticks) of different types based on if its gantt or not.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} axis - Axis scaled according to input parameters
 * @param {Array} values - List of all tick values.
 * @param {string} orientation - X axis orientation.
 * @param {string} height - height of the grid, based on input config.
 * @param {object} transition - gets transition based on pannig mode is enabled or not
 * @param {string} type - type of tick. Either lowerStepTick or midpointTick or upperStepTick.
 * @param {Function} translateVGridHandler - Call back function to translate grid.
 * @returns {undefined} - returns nothing.
 */
const translateVGridDatetimeBuckets = (
    canvasSVG,
    axis,
    values,
    orientation,
    height,
    transition,
    type,
    translateVGridHandler
) => {
    const config = createDatetimeBucketConfig(
        values,
        height,
        orientation,
        transition
    );
    const style = determineBucketStyle(type);
    translateVGridHandler(canvasSVG, axis, style, config);
};

/**
 * Helper to create the config for dateTimeBuckets for creating and translating grids and axis.
 *
 * @private
 * @param {Array} values - list of all tick values.
 * @param {string} height - Y axis height.
 * @param {string} orientation - X axis orientation.
 * @param {object} transition - gets transition based on pannig mode is enabled or not
 * @returns {object} - config with tick values and height.
 */
const createDatetimeBucketConfig = (
    values,
    height,
    orientation,
    transition
) => ({
    axis: {
        x: {
            ticks: {
                values
            },
            orientation: `${orientation}`
        }
    },
    height: `${height}`,
    settingsDictionary: {
        transition
    }
});

/**
 * Helper function to determine the type.
 *
 * @private
 * @param {string} type - different types of tick.
 * @returns {string} styling of the type.
 */
const determineBucketStyle = (type) => {
    switch (type) {
        case BUCKET_TYPES.LOWER_STEP_TICK_VALUES:
            return styles.gridLowerStep;
        case BUCKET_TYPES.MIDPOINT_TICK_VALUES:
            return styles.gridMidpoint;
        case BUCKET_TYPES.UPPER_STEP_TICK_VALUES:
            return styles.gridUpperStep;
        default:
            return "";
    }
};

/**
 * Helper function to create config for axes when dateTimeBuckets are used.
 * We only display lowerStepTickValues/values and upperStepTickValues in the axis, since,
 * midpointTickValues can be inferred.
 *
 * @private
 * @param {object} dateTimeBuckets - all tick values.
 * @returns {Array} newStepvalues - tick values based on bucket input.
 */
const constructDatetimeBucketValues = (dateTimeBuckets) => {
    let newStepValues = [];
    if (utils.notEmpty(dateTimeBuckets.values)) {
        newStepValues = newStepValues.concat(dateTimeBuckets.values);
    }
    if (utils.notEmpty(dateTimeBuckets.upperStepTickValues)) {
        newStepValues = newStepValues.concat(
            dateTimeBuckets.upperStepTickValues
        );
    }

    return newStepValues;
};

/**
 * Helper function to determine if the graph config is not a DatetimeBucket
 *
 * @private
 * @param {object} ticks - ticks object derived from input JSON.
 * @returns {boolean} - True, if DatetimeBucket. False, if it is not a DatetimeBucket.
 */
const hasDatetimeBuckets = (ticks) => {
    if (utils.isEmpty(ticks)) {
        return false;
    }
    return (
        utils.notEmpty(ticks.midpointTickValues) ||
        utils.notEmpty(ticks.upperStepTickValues) ||
        utils.notEmpty(ticks.lowerStepTickValues)
    );
};

/**
 * Helper function to create Vertical grid
 *
 * @private
 * @param {object} gridSVG - d3 object of the grid
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON * @param gridSVG
 * @param {Function} createVGridHandler - Call back function to create grid.
 * @returns {undefined} - returns nothing
 */
const createVGrid = (gridSVG, axis, config, createVGridHandler) => {
    if (hasDatetimeBuckets(config.axis.x.ticks)) {
        createDatetimeBuckets(gridSVG, axis, config, createVGridHandler);
    } else {
        createVGridHandler(gridSVG, axis, styles.gridV, config);
    }
};

/**
 * Helper function to update horizontal axes, if graph has datetime buckets
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON * @param gridSVG
 * @param {Function} prepareXAxisHandler - Callback function to prepare the axis with new tick values
 * @param {string} [orientation] - Axis orientation
 * @returns {undefined} - returns nothing
 */
const prepareHAxis = (
    scale,
    axis,
    config,
    prepareXAxisHandler,
    orientation = config.axis.x.orientation
) => {
    if (hasDatetimeBuckets(config.axis.x.ticks)) {
        const values = config.axis.x.ticks.lowerStepTickValues
            ? config.axis.x.ticks.lowerStepTickValues
            : config.axis.x.ticks.values;
        const datetimeBuckets = {
            values,
            upperStepTickValues: config.axis.x.ticks.upperStepTickValues
        };
        axis.x = prepareXAxisHandler(
            scale,
            constructDatetimeBucketValues(datetimeBuckets),
            config,
            orientation
        );
    }
};

/**
 * Helper function to translate Vertical grid
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} axis - Axis scaled according to input parameters
 * @param {object} config - config object derived from input JSON * @param gridSVG
 * @param {Function} translateVGridHandler - Call back function to translate grid.
 * @returns {undefined} - returns nothing * @param axis
 */
const translateVGrid = (canvasSVG, axis, config, translateVGridHandler) => {
    if (hasDatetimeBuckets(config.axis.x.ticks)) {
        translateDatetimeBuckets(
            canvasSVG,
            axis,
            config,
            translateVGridHandler
        );
    } else {
        translateVGridHandler(canvasSVG, axis, styles.gridV, config);
    }
};

export { createVGrid, prepareHAxis, translateVGrid };
