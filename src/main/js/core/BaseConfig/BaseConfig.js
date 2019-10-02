"use strict";
import errors from "../../helpers/errors";

/**
 * API to parse consumer input.
 *
 * @interface
 * @class BaseConfig
 */
export default class BaseConfig {
    /**
     * Returns the config object
     *
     * @abstract
     * @function BaseConfig#getConfig
     * @throws {module:errors.THROW_MSG_CONFIG_GET_CONFIG_NOT_IMPLEMENTED}
     * @returns {object} - inherited class instance
     */
    getConfig() {
        throw new Error(errors.THROW_MSG_CONFIG_GET_CONFIG_NOT_IMPLEMENTED);
    }

    /**
     * Sets the input object
     *
     * @abstract
     * @function BaseConfig#setInput
     * @throws {module:errors.THROW_MSG_CONFIG_SET_INPUT_NOT_IMPLEMENTED}
     * @param {object} inputJSON - Input JSON
     * @returns {object} - inherited class instance
     */
    // eslint-disable-next-line no-unused-vars
    setInput(inputJSON) {
        throw new Error(errors.THROW_MSG_CONFIG_SET_INPUT_NOT_IMPLEMENTED);
    }

    /**
     * Validates and verifies the input JSON object
     *
     * @abstract
     * @function BaseConfig#validateInput
     * @throws {module:errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED}
     * @returns {object} - inherited class instance
     */
    validateInput() {
        throw new Error(errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED);
    }

    /**
     * Clones the input JSON into the config object
     *
     * @abstract
     * @function BaseConfig#clone
     * @throws {module:errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED}
     * @returns {object} - inherited class instance
     */
    clone() {
        throw new Error(errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED);
    }
}
