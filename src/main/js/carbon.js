"use strict";
/* globals VERSION */
import api from "./controls";
import {
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "./helpers/constants";
import LOCALE from "./locale";

const helpers = {
    AXIS_TYPE,
    COLORS,
    LOCALE,
    SHAPES
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
