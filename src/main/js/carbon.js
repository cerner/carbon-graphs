"use strict";
/* globals VERSION */
import api from "./controls";
import { Shape } from "./core";
import { AXIS_TYPE, COLORS, SHAPES } from "./helpers/constants";
import LOCALE from "./locale";

const tools = {
    shape: (...args) => new Shape(...args)
};
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
    tools,
    helpers,
    version: VERSION
};

export default Carbon;
