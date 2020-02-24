"use strict";
import { GraphContent } from "../../core";
import { getDefaultValue } from "../../core/BaseConfig";
import constants from "../../helpers/constants";
import {
    prepareLabelShapeItem,
    removeLabelShapeItem
} from "../../helpers/label";
import { removeLegendItem } from "../../helpers/legend";
import {
    createRegion,
    hideAllRegions,
    removeRegion,
    translateRegion,
    areRegionsIdentical
} from "../../helpers/region";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import {
    clear,
    clickHandler,
    draw,
    hoverHandler,
    prepareLegendItems,
    processDataPoints,
    translateBubbleGraph
} from "./helpers/helpers";
import BubbleConfig from "./BubbleConfig";

/**
 * @typedef {object} Bubble
 * @typedef {object} GraphContent
 * @typedef {object} BubbleConfig
 */
/**
 * Calculates the min and max values for Y Axis or Y2 Axis.
 * First we filter out values that are `null`, this is a result of
 * datapoint being part of being in a non-contiguous series and then we
 * get the min and max values for the Y or Y2 axis domain.
 *
 * @private
 * @param {Array} values - Datapoint values
 * @param {string} axis - y or y2
 * @returns {object} - Contains min and max values for the data points for Y and Y2 axis
 */
const calculateValuesRange = (values, axis = constants.Y_AXIS) => {
    const yAxisValuesList = values.filter((i) => i.y !== null).map((i) => i.y);
    return {
        [axis]: {
            min: Math.min(...yAxisValuesList),
            max: Math.max(...yAxisValuesList)
        }
    };
};

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} BubbleConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new BubbleConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();

/**
 * A Bubble graph is a graph used to represent a collection of data
 * points connected by a Bubble along the X and Y Axis.
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 *
 * @module Bubble
 * @class Bubble
 */
class Bubble extends GraphContent {
    /**
     * @class
     * @param {BubbleConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.config.yAxis = getDefaultValue(
            this.config.yAxis,
            constants.Y_AXIS
        );
        this.valuesRange = calculateValuesRange(
            this.config.values,
            this.config.yAxis
        );
        this.dataTarget = {};
    }

    /**
     * @inheritdoc
     */
    load(graph) {
        this.dataTarget = processDataPoints(graph.config, this.config);
        draw(graph.scale, graph.config, graph.svg, this.dataTarget);
        if (utils.notEmpty(this.dataTarget.regions)) {
            createRegion(
                graph.scale,
                graph.config,
                graph.svg.select(`.${styles.regionGroup}`),
                this.dataTarget.regions,
                `region_${this.dataTarget.key}`,
                this.config.yAxis
            );
        }
        prepareLegendItems(
            graph.config,
            {
                clickHandler: clickHandler(
                    graph,
                    this,
                    graph.config,
                    graph.svg
                ),
                hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
            },
            this.dataTarget,
            graph.legendSVG
        );
        prepareLabelShapeItem(
            graph.config,
            this.dataTarget,
            graph.axesLabelShapeGroup[this.config.yAxis]
        );
        return this;
    }

    /**
     * @inheritdoc
     */
    unload(graph) {
        clear(graph.svg, this.dataTarget);
        removeRegion(
            graph.svg.select(`.${styles.regionGroup}`),
            this.dataTarget
        );
        removeLegendItem(graph.legendSVG, this.dataTarget);
        removeLabelShapeItem(
            graph.axesLabelShapeGroup[this.config.yAxis],
            this.dataTarget,
            graph.config
        );
        this.dataTarget = {};
        this.config = {};
        return this;
    }

    /**
     * @inheritdoc
     */
    resize(graph) {
        if (utils.notEmpty(this.dataTarget.regions)) {
            if (graph.content.length > 1 && !graph.config.shouldHideAllRegion) {
                if (areRegionsIdentical(graph.svg)) {
                    graph.config.shouldHideAllRegion = false;
                } else {
                    hideAllRegions(graph.svg);
                    graph.config.shouldHideAllRegion = true;
                }
            }
        } else {
            hideAllRegions(graph.svg);
            graph.config.shouldHideAllRegion = true;
        }
        translateRegion(
            graph.scale,
            graph.config,
            graph.svg.select(`.${styles.regionGroup}`)
        );
        translateBubbleGraph(graph.scale, graph.svg, graph.config);
        return this;
    }

    /**
     * @inheritdoc
     */
    redraw(graph) {
        clear(graph.svg, this.dataTarget);
        draw(graph.scale, graph.config, graph.svg, this.dataTarget);
        return this;
    }
}

export default Bubble;
