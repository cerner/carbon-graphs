"use strict";
/* globals VERSION */
import api from "./controls";
import { Shape } from "./core";
import {
    AXES_ORIENTATION,
    AXIS_TYPE,
    COLORS,
    LINE_TYPE,
    SHAPES
} from "./helpers/constants";
import LOCALE from "./locale";

/**
 * Carbon tools for generating reusable items like different shapes
 * @enum {{Object: Function}}
 */
const tools = {
    shape: (...args) => new Shape(...args),
    defaultSVGProps: (args) => Shape.getDefaultSVGProps(args)
};
/**
 * Carbon helper constants
 * @public
 * @property {Object} AXIS_TYPE Carbon API axis types constants
 * @property {Object} COLORS Carbon API color constants
 * @property {Object} LINE_TYPE Carbon API line type constants
 * @property {Object} LOCALE Carbon API locale objects
 * @property {Object} SHAPES Carbon API shape constants
 */
const helpers = {
    AXIS_TYPE,
    COLORS,
    LINE_TYPE,
    LOCALE,
    SHAPES,
    AXES_ORIENTATION
};
/**
 * Carbon
 * @public
 * @module Carbon
 * @property {Object} api Carbon API controls
 * @property {Object} tools Tools such as Shapes
 * @property {Object} helpers Helper constants such as colors and shapes
 * @property {Object} version Current version
 * @enum {Object}
 */
const Carbon = {
    api,
    tools,
    helpers,
    version: VERSION
};

export default Carbon;
