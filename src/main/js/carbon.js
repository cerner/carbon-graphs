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
 *
 * @enum {{Object: Function}}
 */
const tools = {
    shape: (...args) => new Shape(...args),
    defaultSVGProps: (args) => Shape.getDefaultSVGProps(args)
};
/**
 * Carbon helper constants
 *
 * @public
 * @property {object} AXIS_TYPE Carbon API axis types constants
 * @property {object} COLORS Carbon API color constants
 * @property {object} LINE_TYPE Carbon API line type constants
 * @property {object} LOCALE Carbon API locale objects
 * @property {object} SHAPES Carbon API shape constants
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
 *
 * @public
 * @module Carbon
 * @property {object} api Carbon API controls
 * @property {object} tools Tools such as Shapes
 * @property {object} helpers Helper constants such as colors and shapes
 * @property {object} version Current version
 * @enum {object}
 */
const Carbon = {
    api,
    tools,
    helpers,
    version: VERSION
};

export default Carbon;
