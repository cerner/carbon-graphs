"use strict";
import d3 from "d3";
import BaseConfig, { getDefaultValue, getDomain } from "../../core/BaseConfig";
import constants, { AXIS_TYPE } from "../../helpers/constants";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";
import { DEFAULT_LOCALE } from "../../locale/index";

/**
 * Validates the newly added task into the graph before rendering
 * @private
 * @param {Object} input - Newly added graph tasks
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_TASKS_UNIQUE_KEY_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_TASKS_START_AND_END_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_TASKS_DURATION_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_TASKS_START_AND_END_TYPE_NOT_VALID}
 * @throws {module:errors.THROW_MSG_TASKS_START_MORE_END}
 * @returns {undefined} - returns nothing
 */
const validateData = (input) => {
    if (utils.isEmpty(input)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (utils.isEmpty(input.key)) {
        throw new Error(errors.THROW_MSG_TASKS_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (utils.isEmpty(input.startDate) && utils.isEmpty(input.endDate)) {
        throw new Error(errors.THROW_MSG_TASKS_START_AND_END_NOT_PROVIDED);
    }
    if (
        (utils.isEmpty(input.startDate) || utils.isEmpty(input.endDate)) &&
        utils.isEmpty(input.duration)
    ) {
        throw new Error(errors.THROW_MSG_TASKS_DURATION_NOT_PROVIDED);
    }
    if (
        (input.startDate && !utils.isDate(input.startDate)) ||
        (input.endDate && !utils.isDate(input.endDate))
    ) {
        throw new Error(errors.THROW_MSG_TASKS_START_AND_END_TYPE_NOT_VALID);
    }
    if (utils.getTime(input.startDate) > utils.getTime(input.endDate)) {
        throw new Error(errors.THROW_MSG_TASKS_START_MORE_END);
    }
};
/**
 * Processes the input from the JSON and updates the config object.
 * d3 domain and ranges are stored based on the upper and lower x limits.
 * @private
 * @param {Object} input - Input JSON provided by the consumer
 * @param {Object} config - config object used by the graph
 * @returns {Object} - returns configuration object constructed using Input JSON
 */
export const processInput = (input, config) => {
    const _axis = utils.deepClone(input.axis);
    config.bindTo = input.bindTo;
    config.bindLegendTo = input.bindLegendTo;
    config.axis = {
        x: {},
        y: {}
    };
    config.locale = d3.locale(getDefaultValue(input.locale, DEFAULT_LOCALE));
    config.throttle = getDefaultValue(
        input.throttle,
        constants.RESIZE_THROTTLE
    );
    config.datelines = getDefaultValue(utils.deepClone(input.datelines), []);
    config.showDateLines = getDefaultValue(input.showDateLines, true);
    config.actionLegend = getDefaultValue(
        utils.deepClone(input.actionLegend),
        []
    );
    config.showActionLegend = getDefaultValue(input.showActionLegend, false);
    config.dimension = getDefaultValue(input.dimension, {});
    config.axis.x = Object.assign(_axis.x, {
        type: AXIS_TYPE.TIME_SERIES,
        show: getDefaultValue(_axis.x.show, true),
        ticks: getDefaultValue(_axis.x.ticks, {}),
        domain: getDomain(
            AXIS_TYPE.TIME_SERIES,
            _axis.x.lowerLimit,
            _axis.x.upperLimit
        )
    });
    config.axis.y = {
        show: _axis.y ? getDefaultValue(_axis.y.show, true) : true,
        trackCount: 0,
        trackList: {}
    };
    config.shownTargets = [];
    return config;
};

/**
 * Checks if the keys for data points sets are unique
 * @private
 * @param {Array} dictionary - Collections of graph content
 * @param {string} key - unique key for the newly added content
 * @returns {boolean} false if not unique
 */
export const isUniqueKey = (dictionary, key) => dictionary.indexOf(key) < 0;

/**
 * API to parse consumer input for Graph
 * @class GraphConfig
 */
class GraphConfig extends BaseConfig {
    /**
     * @inheritDoc
     */
    constructor() {
        super();
        this.config = null;
        this.input = null;
    }

    /**
     * @inheritDoc
     */
    getConfig() {
        return this.config;
    }

    /**
     * @inheritDoc
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object
     * Checks if the following properties are present:
     *      bindTo
     *      axis
     *      axis.x
     * @throws {module:errors.THROW_MSG_NO_BIND}
     * @throws {module:errors.THROW_MSG_NO_AXES_DATA_LOADED}
     * @throws {module:errors.THROW_MSG_NO_AXIS_INFO}
     * @throws {module:errors.THROW_MSG_NO_AXIS_LIMIT_INFO}
     * @throws {module:errors.THROW_MSG_INVALID_AXIS_TYPE_VALUES}
     * @returns {GraphConfig} instance object
     */
    validateInput() {
        if (utils.isEmpty(this.input)) {
            throw new Error(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        }
        if (utils.isEmpty(this.input.bindTo)) {
            throw new Error(errors.THROW_MSG_NO_BIND);
        }
        if (
            utils.isEmpty(this.input.axis) ||
            utils.isEmpty(this.input.axis.x)
        ) {
            throw new Error(errors.THROW_MSG_NO_AXIS_INFO);
        }
        if (
            utils.isEmpty(this.input.axis.x.lowerLimit) ||
            utils.isEmpty(this.input.axis.x.upperLimit)
        ) {
            throw new Error(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
        }
        if (
            !utils.isDate(this.input.axis.x.lowerLimit) ||
            !utils.isDate(this.input.axis.x.upperLimit)
        ) {
            throw new Error(errors.THROW_MSG_INVALID_AXIS_TYPE_VALUES);
        }
        return this;
    }

    /**
     * Clones the input JSON into the config object
     * @returns {GraphConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default GraphConfig;
export const validateTask = validateData;
export const validateActivity = validateData;
