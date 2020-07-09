"use strict";
import BaseConfig, { getDefaultValue, getDomain } from "../../core/BaseConfig";
import {
    generateClipPathId,
    generateDatelineClipPathId,
    isPanningModeEnabled
} from "../../core/BaseConfig/helper";
import { hasY2Axis } from "../../helpers/axis";
import constants, {
    AXES_ORIENTATION,
    AXIS_TYPE
} from "../../helpers/constants";
import { validateDateline } from "../../helpers/dateline";
import errors from "../../helpers/errors";
import { validateEventline } from "../../helpers/eventline";
import utils from "../../helpers/utils";
import { DEFAULT_LOCALE } from "../../locale/index";
import { getLegendPadding } from "../../helpers/legend";

const initialAxisInfo = {
    ticks: {},
    show: false,
    domain: {
        lowerLimit: 0,
        upperLimit: 0
    }
};

/**
 * Helper function to set the right padding values based on input JSON.
 *
 * @private
 * @param {object} config - config which needs to be updated
 * @param {object} inputPadding - input padding provided via input JSON.
 * @returns {object} - padding for Graph
 */
const getPadding = (config, inputPadding) => {
    if (utils.isDefined(config.padding)) {
        return {
            top: getDefaultValue(inputPadding.top, constants.PADDING.top),
            bottom: getDefaultValue(
                inputPadding.bottom,
                constants.PADDING.bottom
            ),
            right: getDefaultValue(inputPadding.right, constants.PADDING.right),
            left: getDefaultValue(inputPadding.left, constants.PADDING.left),
            hasCustomPadding: true
        };
    } else {
        return {
            top: constants.PADDING.top,
            bottom: constants.PADDING.bottom,
            right: constants.PADDING.right,
            left: constants.PADDING.left,
            hasCustomPadding: false
        };
    }
};

/**
 * Processes the input from the JSON and updates the config object.
 * d3 domain and ranges are stored based on the upper and lower x, y and y2 limits.
 *
 * @private
 * @param {object} input - Input JSON provided by the consumer
 * @param {object} config - config object used by the graph
 * @param {string} type - input type
 * @returns {object} - returns configuration object constructed using Input JSON
 */
export const processInput = (input, config, type) => {
    const _axis = utils.deepClone(input.axis);
    const getAxisDomain = (config, yAxis, axisObj, showAxis = false) => {
        config.axis[yAxis].ticks = getDefaultValue(axisObj[yAxis].ticks, {});
        config.axis[yAxis].show = getDefaultValue(
            axisObj[yAxis].show,
            showAxis
        );
        config.axis[yAxis].domain = {
            lowerLimit: utils.getNumber(axisObj[yAxis].lowerLimit),
            upperLimit: utils.getNumber(axisObj[yAxis].upperLimit)
        };
        config.axis[yAxis].rangeRounding = getDefaultValue(
            axisObj[yAxis].rangeRounding,
            true
        );
        config.axis[yAxis].suppressTrailingZeros = getDefaultValue(
            axisObj[yAxis].suppressTrailingZeros,
            false
        );
        return config;
    };
    config.clipPathId = generateClipPathId();
    config.datelineClipPathId = generateDatelineClipPathId();
    config.bindTo = input.bindTo;
    config.bindLegendTo = input.bindLegendTo;
    config.axis = _axis;
    config.dateline = getDefaultValue(utils.deepClone(input.dateline), []);
    config.eventline = getDefaultValue(utils.deepClone(input.eventline), []);
    config.padding = getPadding(config, input.padding);
    config.locale = getDefaultValue(input.locale, DEFAULT_LOCALE);
    config.d3Locale = getDefaultValue(input.locale, DEFAULT_LOCALE);
    config.showNoDataText = getDefaultValue(input.showNoDataText, true);
    config.throttle = getDefaultValue(
        input.throttle,
        constants.RESIZE_THROTTLE
    );
    config.settingsDictionary = settingsDictionary(input);
    config.showLabel = getDefaultValue(input.showLabel, true);
    config.showLegend = getDefaultValue(input.showLegend, true);
    config.showShapes = getDefaultValue(input.showShapes, true);
    config.showHGrid = getDefaultValue(input.showHGrid, true);
    config.showVGrid = getDefaultValue(input.showVGrid, true);
    config.dimension = getDefaultValue(input.dimension, {});
    config.allowCalibration = getDefaultValue(input.allowCalibration, true);
    config.removeContainerPadding = getDefaultValue(
        input.removeContainerPadding,
        false
    );
    config.legendPadding = getLegendPadding(config, input.legendPadding);

    // Additional X Axis properties defined on top of input axis
    config.axis.x.type = getDefaultValue(_axis.x.type, AXIS_TYPE.DEFAULT);
    config.axis.x.ticks = getDefaultValue(_axis.x.ticks, {});
    config.axis.x.show = getDefaultValue(_axis.x.show, true);
    config.axis.x.orientation = getDefaultValue(
        _axis.x.orientation,
        AXES_ORIENTATION.X.BOTTOM
    );
    config.axis.x.domain = getDomain(
        type,
        _axis.x.lowerLimit,
        _axis.x.upperLimit
    );
    config.axis.x.rangeRounding = getDefaultValue(_axis.x.rangeRounding, true);
    config.axis.x.suppressTrailingZeros = getDefaultValue(
        _axis.x.suppressTrailingZeros,
        false
    );

    // Additional Y & Y2 Axis properties defined on top of input axis
    if (input.axis.y) {
        getAxisDomain(config, constants.Y_AXIS, _axis, true);
    } else {
        config.axis.y = initialAxisInfo;
    }
    if (input.axis.y2) {
        getAxisDomain(config, constants.Y2_AXIS, _axis);
    } else {
        config.axis.y2 = initialAxisInfo;
    }
    config.shownTargets = [];
    config.hasCriticality = false;
    config.shouldHideAllRegion = false;
    // axisPadding is needed for case by case basis. Example: for bar graphs, we toggle padding using this variable
    config.axisPadding = {
        y: getDefaultValue(_axis.y.padDomain, true),
        y2: getDefaultValue(_axis.y2.padDomain, true)
    };
    config.axisInfoRowLabelHeight = 0; // specific only to  Bar Graphs (when axis info row labels are used in Bar Graphs)
    return config;
};

/**
 * Checks if the keys for data points sets are unique
 *
 * @private
 * @param {Array} dictionary - Collections of graph content
 * @param {string} key - unique key for the newly added content
 * @returns {boolean} false if not unique
 */
export const isUniqueKey = (dictionary, key) =>
    !utils.hasValue(
        dictionary.map((i) => i.config.key),
        key
    );

/**
 * Validates the newly added content into the graph before rendering
 *
 * @private
 * @param {Array} content - Current set of graph contents, already rendered
 * @param {object} input - Newly added graph content
 * @returns {undefined} - returns nothing
 */
export const validateContent = (content, input) => {
    if (utils.isEmpty(input)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (!isUniqueKey(content, input.config.key)) {
        throw new Error(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
    }
};
/**
 * Used to set the clamp and transition when panning is enabled or not.
 *
 * @private
 * @param {object} config - config object used by the graph.
 * @returns {undefined} returns nothing
 */
export const settingsDictionary = (config) =>
    isPanningModeEnabled(config)
        ? {
              shouldClamp: false,
              transition: constants.D3_TRANSITION_PROPERTIES_DISABLED,
              shouldCreateDatelineDefs: true
          }
        : {
              shouldClamp: true,
              transition: constants.D3_TRANSITION_PROPERTIES_ENABLED,
              shouldCreateDatelineDefs: false
          };

/**
 * API to parse consumer input for Graph
 *
 * @class GraphConfig
 */
class GraphConfig extends BaseConfig {
    /**
     * @inheritdoc
     */
    constructor() {
        super();
        this.config = null;
        this.input = null;
    }

    /**
     * @inheritdoc
     */
    getConfig() {
        return this.config;
    }

    /**
     * @inheritdoc
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * Validates and verifies the input JSON object
     * Checks if the following properties are present:
     *      bindTo
     *      axis
     *      axis.x
     *      If axis.x.type is provided then it should be either default or timeseries
     *      axis.y
     *      Y axis label is mandatory and X axis is optional
     *
     * @throws {module:errors.THROW_MSG_NO_BIND}
     * @throws {module:errors.THROW_MSG_INVALID_TYPE}
     * @throws {module:errors.THROW_MSG_NO_AXIS_INFO}
     * @throws {module:errors.THROW_MSG_NO_AXIS_LIMIT_INFO}
     * @throws {module:errors.THROW_MSG_NO_AXIS_LABEL_INFO}
     * @returns {GraphConfig} instance object
     */
    validateInput() {
        if (utils.isEmpty(this.input)) {
            throw new Error(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        }
        if (utils.isEmpty(this.input.bindTo)) {
            throw new Error(errors.THROW_MSG_NO_BIND);
        }
        if (
            utils.isEmpty(this.input.axis) ||
            utils.isEmpty(this.input.axis.x) ||
            utils.isEmpty(this.input.axis.y)
        ) {
            throw new Error(errors.THROW_MSG_NO_AXIS_INFO);
        }
        if (
            utils.notEmpty(this.input.axis.x.type) &&
            !utils.hasValue(Object.values(AXIS_TYPE), this.input.axis.x.type)
        ) {
            throw new Error(errors.THROW_MSG_INVALID_TYPE);
        }
        if (
            utils.isEmpty(this.input.axis.x.lowerLimit) ||
            utils.isEmpty(this.input.axis.x.upperLimit) ||
            utils.isEmpty(this.input.axis.y.lowerLimit) ||
            utils.isEmpty(this.input.axis.y.upperLimit)
        ) {
            throw new Error(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
        }
        if (utils.isEmpty(this.input.axis.y.label)) {
            throw new Error(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
        }
        if (hasY2Axis(this.input.axis)) {
            if (
                utils.isEmpty(this.input.axis.y2.lowerLimit) ||
                utils.isEmpty(this.input.axis.y2.upperLimit)
            ) {
                throw new Error(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            }
            if (utils.isEmpty(this.input.axis.y2.label)) {
                throw new Error(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
            }
        }
        if (
            utils.notEmpty(this.input.dateline) &&
            this.input.axis.x.type !== AXIS_TYPE.TIME_SERIES
        ) {
            throw new Error(errors.THROW_MSG_INVALID_TYPE);
        }
        if (
            utils.notEmpty(this.input.dateline) &&
            this.input.axis.x.type === AXIS_TYPE.TIME_SERIES
        ) {
            this.input.dateline.forEach((dateline) => {
                validateDateline(dateline);
            });
        }
        if (
            utils.notEmpty(this.input.eventline) &&
            this.input.axis.x.type !== AXIS_TYPE.TIME_SERIES
        ) {
            throw new Error(errors.THROW_MSG_INVALID_TYPE);
        }
        if (
            utils.notEmpty(this.input.eventline) &&
            this.input.axis.x.type === AXIS_TYPE.TIME_SERIES
        ) {
            this.input.eventline.forEach((eventline) => {
                validateEventline(eventline);
            });
        }
        return this;
    }

    /**
     * Clones the input JSON into the config object
     *
     * @returns {GraphConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}

export default GraphConfig;
