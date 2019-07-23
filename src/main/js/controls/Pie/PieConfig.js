"use strict";
import BaseConfig, { getDefaultValue } from "../../core/BaseConfig";
import { generateClipPathId } from "../../core/BaseConfig/helper";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Processes the input from the JSON and updates the config object.
 * d3 domain and ranges are stored based on the upper and lower x limits.
 *
 * @private
 * @param {object} input - Input JSON provided by the consumer
 * @param {object} config - config object used by the graph
 * @returns {object} - returns configuration object constructed using Input JSON
 */
export const processInput = (input, config) => {
    config.clipPathId = generateClipPathId();
    config.bindTo = input.bindTo;
    config.bindLegendTo = input.bindLegendTo;
    config.dimension = getDefaultValue(input.dimension, {});
    config.showLegend = getDefaultValue(input.showLegend, true);
    return config;
};

/**
 * API to parse consumer input for Graph
 *
 * @class PieConfig
 */
class PieConfig extends BaseConfig {
    /**
     * @inheritdoc
     */
    constructor() {
        super();
        this.config = null;
        this.input = null;
    }

    /**
     * @inheritdoc
     */
    getConfig() {
        return this.config;
    }

    /**
     * @inheritdoc
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object
     * Checks if the following properties are present:
     *      bindTo
     *
     * @throws {module:errors.THROW_MSG_NO_BIND}
     * @throws {module:errors.THROW_MSG_INVALID_INPUT}
     * @returns {PieConfig} instance object
     */
    validateInput() {
        if (utils.isEmpty(this.input)) {
            throw new Error(errors.THROW_MSG_INVALID_INPUT);
        }
        if (utils.isEmpty(this.input.bindTo)) {
            throw new Error(errors.THROW_MSG_NO_BIND);
        }
        return this;
    }

    /**
     * Clones the input JSON into the config object
     *
     * @returns {PieConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default PieConfig;
