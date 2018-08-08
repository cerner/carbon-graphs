"use strict";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Validates and verifies the input JSON object
 * Checks following properties:
 * Tests if input is present
 * Tests if Label is present.
 * Tests if Label display is present
 * Tests if Key is present
 * Tests if Values are present
 * @throws module:module:errors.THROW_MSG_NO_DATA_POINTS
 * @throws module:errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED
 * @throws module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED
 * @throws module:errors.THROW_MSG_NO_CONTENT_DATA_LOADED
 * @param {object} input - input JSON object
 * @returns {BarConfig} instance object
 */
export const validateBaseInput = (input) => {
    if (utils.isEmpty(input)) {
        throw new Error(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
    }
    if (utils.isEmpty(input.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (utils.isEmpty(input.label) || utils.isEmpty(input.label.display)) {
        throw new Error(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
    }
    if (utils.isEmpty(input.values)) {
        throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
    }
};
