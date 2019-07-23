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
     * @inheritdoc
     */
    constructor() {
        super();
        this.config = null;
        this.input = null;
    }

    /**
     * Returns the config object
     *
     * @returns {object} config object
     */
    getConfig() {
        return this.config;
    }

    /**
     * Sets the input object
     *
     * @param {object} inputJSON - Input JSON
     * @returns {BarConfig} instance object
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object.
     *
     * @returns {BarConfig} instance object
     */
    validateInput() {
        validateBaseInput(this.input);
        return this;
    }

    /**
     * Clones the input JSON into the config object
     *
     * @returns {BarConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default BarConfig;
