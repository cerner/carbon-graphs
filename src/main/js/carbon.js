"use strict";
/* globals VERSION */
import api from "./controls";
import {
    AXIS_TYPE,
    COLORS,
    SYMBOLS
} from "./helpers/constants";
import LOCALE from "./locale";

const helpers = {
    AXIS_TYPE,
    COLORS,
    LOCALE,
    SYMBOLS
};
/**
 * Carbon
 * @public
 * @module Carbon
 * @enum {Object}
 */
const Carbon = {
    api,
    helpers,
    version: VERSION
};

export default Carbon;
