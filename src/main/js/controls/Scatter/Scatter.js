"use strict";
import { GraphContent } from "../../core";
import { getDefaultValue } from "../../core/BaseConfig";
import constants from "../../helpers/constants";
import {
    prepareLabelShapeItem,
    removeLabelShapeItem
} from "../../helpers/label";
import { removeLegendItem, reflowLegend } from "../../helpers/legend";
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
    translateScatterGraph,
    drawDataPoints,
    getDataPointValues
} from "./helpers/helpers";
import ScatterConfig from "./ScatterConfig";

/**
 * @typedef {object} Scatter
 * @typedef {object} GraphContent
 * @typedef {object} ScatterConfig
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
 * @returns {object} ScatterConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new ScatterConfig().setInput(inputJSON).validateInput().clone().getConfig();

/**
 * A Scatter graph is a graph used to represent a collection of data
 * points along the X and Y Axis.
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 *
 * @module Scatter
 * @class Scatter
 */
class Scatter extends GraphContent {
    /**
     * @class
     * @param {ScatterConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.type = "Scatter";
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
        translateScatterGraph(graph.scale, graph.svg, graph.config);
        return this;
    }

    /**
     * @inheritdoc
     */
    reflow(graph, graphData) {
        this.config.values = graphData.values;
        const eventHandlers = {
            clickHandler: clickHandler(graph, this, graph.config, graph.svg),
            hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
        };
        this.dataTarget = processDataPoints(graph.config, this.config);
        const position = graph.config.shownTargets.lastIndexOf(graphData.key);
        if (position > -1) {
            graph.config.shownTargets.splice(position, 1);
        }
        reflowLegend(
            graph.legendSVG,
            graph.content.filter((scatter) => scatter.config.key === graphData.key)[0].config,
            graph,
            eventHandlers
        );
        const currentPointsPath = graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .selectAll(`.${styles.pointGroup}`)
            .data(this.dataTarget);
        currentPointsPath.exit().remove();
        const pointPath = graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .select(`.${styles.currentPointsGroup}`)
            .selectAll(`[class*="${styles.point}"]`)
            .data(getDataPointValues(this.dataTarget));
        drawDataPoints(graph.scale, graph.config, pointPath.enter());
        pointPath
            .exit()
            .transition()
            .call(
                constants.d3Transition(
                    graph.config.settingsDictionary.transition
                )
            )
            .remove();

        this.valuesRange = calculateValuesRange(
            this.config.values,
            this.config.yAxis
        );
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

export default Scatter;
