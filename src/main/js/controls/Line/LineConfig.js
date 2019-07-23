"use strict";
import BaseConfig, { validateBaseInput } from "../../core/BaseConfig";
import utils from "../../helpers/utils";

/**
 * API to parse consumer input for Line graph
 *
 * @class LineConfig
 */
class LineConfig extends BaseConfig {
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
     * @returns {LineConfig} instance object
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object.
     *
     * @returns {LineConfig} instance object
     */
    validateInput() {
        validateBaseInput(this.input);
        return this;
    }

    /**
     * Clones the input JSON into the config object
     *
     * @returns {LineConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default LineConfig;
