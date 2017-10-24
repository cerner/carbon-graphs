"use strict";
import GraphContent from "../../core/GraphContent";
import constants from "../../helpers/constants";
import utils from "../../helpers/utils";
import {
    clear,
    clickHandler,
    draw,
    hoverHandler,
    prepareLegendItems,
    processDataPoints,
    removeLegendItem,
    translatePairedResultGraph
} from "./helpers";
import PairedResultConfig from "./PairedResultConfig";

/**
 * Calculates the min and max values for Y Axis or Y2 Axis
 * @private
 * @param {Array} values - Datapoint values
 * @param {string} axis - y or y2
 * @returns {Object} - Contains min and max values for the data points
 */
const calculateValuesRange = (values, axis = constants.Y_AXIS) =>
    Object.assign({}, {
        [axis]: {
            min: Math.min(...values.map((i) =>
                Math.min(...Object.keys(i).map((j) =>
                    i[ j ].y)))),
            max: Math.max(...values.map((i) =>
                Math.max(...Object.keys(i).map((j) =>
                    i[ j ].y))))

        }
    });

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} PairedResultConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new PairedResultConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();

/**
 * A Paired result graph is a graph that is represented by 2 points
 * and a vertical line connecting them. There may be an optional 3rd datapoint
 * representing a median between them.
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 *
 * @class PairedResult
 */
class PairedResult extends GraphContent {
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.valuesRange = calculateValuesRange(this.config.values, this.config.yAxis);
        this.dataTarget = {};
    }

    /**
     * @inheritDoc
     */
    load(graph) {
        this.dataTarget = processDataPoints(graph.config, utils.deepClone(this.config));
        draw(graph.scale, graph.config, graph.svg, this.dataTarget);
        prepareLegendItems(graph.config, {
            clickHandler: clickHandler(graph, this, graph.config, graph.svg),
            hoverHandler: hoverHandler(graph.config, graph.svg)
        }, this.dataTarget, graph.legendSVG);
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
        translatePairedResultGraph(graph.scale, graph.config, graph.svg);
        return this;
    }

    /**
     * @inheritDoc
     */
    redraw(graph) {
        clear(graph.svg, this.dataTarget);
        draw(graph.scale, graph.config, graph.svg, this.dataTarget);
        return this;
    }
}

export default PairedResult;
