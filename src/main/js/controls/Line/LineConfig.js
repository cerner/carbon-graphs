"use strict";
import BaseConfig, { isDataValidFormat } from "../../core/BaseConfig";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * API to parse consumer input for Line graph
 *
 * @class LineConfig
 */
class LineConfig extends BaseConfig {
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
     * @returns {LineConfig} instance object
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object
     * Checks if the following properties are present:
     *      data
     * Validates for:
     *      values
     *      unique keys
     * @throws errors.THROW_MSG_NO_DATA_POINTS
     * @throws errors.THROW_MSG_INVALID_DATA_PROPERTY
     * @returns {LineConfig} instance object
     */
    validateInput() {
        if (utils.isEmpty(this.input)) {
            throw errors.THROW_MSG_NO_DATA_POINTS;
        }
        if (!isDataValidFormat(this.input)) {
            throw errors.THROW_MSG_INVALID_DATA_PROPERTY;
        }
        return this;
    }

    /**
     * Clones the input JSON into the config object
     * @returns {LineConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default LineConfig;
