"use strict";
import BaseConfig, { validateBaseInput } from "../../core/BaseConfig";
import utils from "../../helpers/utils";

/**
 * API to parse consumer input for Bar graph
 *
 * @class BarConfig
 */
class BarConfig extends BaseConfig {
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
     * @returns {BarConfig} instance object
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object
     * Checks if the following properties are present:
     *      data
     *      label
     * Validates for:
     *      values
     *      unique keys
     * @throws module:module:errors.THROW_MSG_NO_DATA_POINTS
     * @throws module:errors.THROW_MSG_INVALID_DATA_PROPERTY
     * @returns {BarConfig} instance object
     */
    validateInput() {
        validateBaseInput(this.input);
        return this;
    }

    /**
     * Clones the input JSON into the config object
     * @returns {BarConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default BarConfig;
