"use strict";
import d3 from "d3";
import { hasY2Axis } from "../../helpers/axis";
import constants, { AXIS_TYPE } from "../../helpers/constants";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";
import { DEFAULT_LOCALE } from "../../locale";
import BaseConfig, {
    getDefaultValue,
    getDomain
} from "../BaseConfig";

/**
 * Processes the input from the JSON and updates the config object.
 * d3 domain and ranges are stored based on the upper and lower x, y and y2 limits.
 * @private
 * @param {Object} input - Input JSON provided by the consumer
 * @param {Object} config - config object used by the graph
 * @param {string} type - input type
 * @returns {Object} - returns configuration object constructed using Input JSON
 */
export const processInput = (input, config, type) => {
    const _axis = utils.deepClone(input.axis);
    config.bindTo = input.bindTo;
    config.axis = _axis;
    config.locale = d3.locale(getDefaultValue(input.locale, DEFAULT_LOCALE));
    config.hasThrottle = !!input.throttle;
    config.throttle = getDefaultValue(input.throttle, constants.RESIZE_THROTTLE);
    config.showLabel = getDefaultValue(input.showLabel, true);
    config.showLegend = getDefaultValue(input.showLegend, true);
    config.showShapes = getDefaultValue(input.showShapes, true);
    config.showHGrid = getDefaultValue(input.showHGrid, true);
    config.showVGrid = getDefaultValue(input.showVGrid, true);
    config.dimension = getDefaultValue(input.dimension, {});
    config.axis.x.type = getDefaultValue(_axis.x.type, AXIS_TYPE.DEFAULT);
    config.axis.x.ticks = getDefaultValue(_axis.x.ticks, {});
    config.axis.y.ticks = getDefaultValue(_axis.y.ticks, {});
    config.axis.x.show = getDefaultValue(_axis.x.show, true);
    config.axis.y.show = getDefaultValue(_axis.y.show, true);
    config.axis.x.domain = getDomain(type, _axis.x.lowerLimit, _axis.x.upperLimit);
    config.axis.y.domain = [
        utils.getNumber(_axis.y.lowerLimit),
        utils.getNumber(_axis.y.upperLimit)
    ];
    if (input.axis.y2) {
        config.axis.y2.ticks = getDefaultValue(input.axis.y2.ticks, {});
        config.axis.y2.show = getDefaultValue(input.axis.y2.show, false);
        if (config.axis.y2.show) {
            config.axis.y2.domain = [
                utils.getNumber(input.axis.y2.lowerLimit),
                utils.getNumber(input.axis.y2.upperLimit)
            ];
        }
    }
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
export const isUniqueKey = (dictionary, key) =>
    !utils.hasValue(dictionary.map((i) => i.config.key), key);

/**
 * Validates the newly added content into the graph before rendering
 * @private
 * @param {Array} content - Current set of graph contents, already rendered
 * @param {Object} input - Newly added graph content
 * @returns {undefined} - returns nothing
 */
export const validateContent = (content, input) => {
    if (utils.isEmpty(input)) {
        throw errors.THROW_MSG_NO_DATA_LOADED;
    }
    if (!isUniqueKey(content, input.config.key)) {
        throw errors.THROW_MSG_NON_UNIQUE_KEY;
    }
};

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
     * Returns the config object
     * @returns {Object} config object
     */
    getConfig() {
        return this.config;
    }

    /**
     * Sets the input object
     * @param {Object} inputJSON - Input JSON
     * @returns {GraphConfig} instance object
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
     *      If axis.x.type is provided then it should be either default or timeseries
     *      axis.y
     *      Y axis label is mandatory and X axis is optional
     * @throws {module:errors.THROW_MSG_NO_BIND}
     * @throws {module:errors.THROW_MSG_INVALID_TYPE}
     * @throws {module:errors.THROW_MSG_NO_AXIS_INFO}
     * @throws {module:errors.THROW_MSG_NO_AXIS_LIMIT_INFO}
     * @throws {module:errors.THROW_MSG_NO_AXIS_LABEL_INFO}
     * @returns {GraphConfig} instance object
     */
    validateInput() {
        if (utils.isEmpty(this.input.bindTo)) {
            throw errors.THROW_MSG_NO_BIND;
        }
        if (utils.isEmpty(this.input.axis) ||
            utils.isEmpty(this.input.axis.x) ||
            utils.isEmpty(this.input.axis.y)) {
            throw errors.THROW_MSG_NO_AXIS_INFO;
        }
        if (utils.notEmpty(this.input.axis.x.type) &&
            !(utils.hasValue(Object.values(AXIS_TYPE), this.input.axis.x.type))) {
            throw errors.THROW_MSG_INVALID_TYPE;
        }
        if (utils.isEmpty(this.input.axis.x.lowerLimit) ||
            utils.isEmpty(this.input.axis.x.upperLimit) ||
            utils.isEmpty(this.input.axis.y.lowerLimit) ||
            utils.isEmpty(this.input.axis.y.upperLimit)) {
            throw errors.THROW_MSG_NO_AXIS_LIMIT_INFO;
        }
        if (utils.isEmpty(this.input.axis.y.label)) {
            throw errors.THROW_MSG_NO_AXIS_LABEL_INFO;
        }
        if (hasY2Axis(this.input.axis)) {
            if (utils.isEmpty(this.input.axis.y2.lowerLimit) ||
                utils.isEmpty(this.input.axis.y2.upperLimit)) {
                throw errors.THROW_MSG_NO_AXIS_LIMIT_INFO;
            }
            if (utils.isEmpty(this.input.axis.y2.label)) {
                throw errors.THROW_MSG_NO_AXIS_LABEL_INFO;
            }
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
