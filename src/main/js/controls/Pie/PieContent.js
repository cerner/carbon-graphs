"use strict";
/**
 * @typedef {Object} PieContent
 * @typedef {Object} GraphContent
 * @typedef {Object} PieConfig
 */
import { GraphContent } from "../../core";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";
import { removeLegendItem } from "../../helpers/legend";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import { isUniqueKey } from "../Graph/GraphConfig";
import {
    clear,
    createPieContentGroup,
    createSlice,
    prepareLegendItems
} from "./helpers/creationHelpers";
import { translateSlices } from "./helpers/translateHelpers";

/**
 * Processes the input JSON and adds the shapes, colors, labels etc. to each data points so that we
 * can use them when rendering the data point.
 * @private
 * @param {Object} graphConfig - config object of Pie instance Construct
 * @param {Object} dataTarget - Data points object
 * @returns {Object} dataTarget - Updated data target object
 */
const processDataPoints = (graphConfig, dataTarget) =>
    Object.assign({}, dataTarget, {
        onClick: dataTarget.onClick,
        color: dataTarget.color || constants.DEFAULT_PIE_COLOR,
        shape: constants.DEFAULT_PIE_LEGEND_SHAPE,
        label: dataTarget.label || {},
        key: dataTarget.key
    });
/**
 * Validates the newly added pie content into the graph before rendering
 * @private
 * @param {Object} input - Newly added graph tasks
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @throws {module:errors.THROW_MSG_NO_DATA_POINTS}
 * @throws {module:errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED}
 * @returns {undefined} - returns nothing
 */
export const validateContent = (input) => {
    if (utils.isEmpty(input)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (utils.isEmpty(input.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    // Label is necessary since it shows the value along with the display
    // This is essential for a11y in a pie chart
    if (utils.isEmpty(input.label) || utils.isEmpty(input.label.display)) {
        throw new Error(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
    }
    if (utils.isEmpty(input.value)) {
        throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
    }
};
/**
 * Draws an arc based on the value provided within the larger Pie
 * @private
 * @param {PieContent} control - PieContent instance
 * @param {Object} graph - Graph instance
 * @param {d3.selection} pieChartContentSVG - d3 selection node of canvas svg
 * @param {d3.selection} legendPath - d3 selection node of legend `ul` path
 * @param {Object} dataTarget - Pie data object
 * @returns {undefined} - returns nothing
 */
const draw = (control, graph, pieChartContentSVG, legendPath, dataTarget) => {
    const contentGroupPath = createPieContentGroup(
        graph.config,
        pieChartContentSVG,
        legendPath,
        control.config,
        dataTarget
    );
    /* Set the data to the group as well as the slice within, since the slice data will be changed
     * to accommodate d3 arc object data as well during translate phase to combine all the pie slices
     * together*/
    contentGroupPath.data([dataTarget]);
    createSlice(graph.config, contentGroupPath);
};
/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} config object containing consumer data
 */
const loadInput = (inputJSON) => {
    validateContent(inputJSON);
    return utils.deepClone(inputJSON);
};

/**
 * PieContent is part of a Pie graph
 * @module PieContent
 * @class PieContent
 */
class PieContent extends GraphContent {
    /**
     * @constructor
     * @param {Object} input - Input JSON
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.dataTarget = null;
    }

    /**
     * @inheritDoc
     */
    load(graph) {
        if (!isUniqueKey(graph.contentConfig, this.config.key)) {
            throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        }
        this.dataTarget = processDataPoints(graph.config, this.config);
        draw(
            this,
            graph,
            graph.svg.select(`.${styles.pieChartContent}`),
            graph.legendSVG,
            this.dataTarget
        );
        prepareLegendItems(this.dataTarget, graph.svg, graph.legendSVG);
        return this;
    }

    /**
     * @inheritDoc
     */
    unload(graph) {
        clear(graph.svg, this.dataTarget);
        removeLegendItem(graph.legendSVG, this.dataTarget);
        this.dataTarget = {};
        this.config = {};
        return this;
    }

    /**
     * @inheritDoc
     */
    resize(graph) {
        translateSlices(
            graph.config,
            graph.svg.select(`.${styles.pieChartContent}`),
            graph.d3PieLayoutTransformer,
            graph.d3PieArcTransformer
        );
        return this;
    }

    /**
     * @inheritDoc
     */
    redraw(graph) {
        /*
         * Legends are not actionable within Pie chart, no redraw
         * is necessary due to this
         * */
        return this;
    }
}

export default PieContent;
