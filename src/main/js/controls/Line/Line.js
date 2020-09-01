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
    areRegionsIdentical,
    createValueRegion
} from "../../helpers/region";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import {
    clear,
    clickHandler,
    draw,
    getDataPointValues,
    drawDataPoints,
    drawDataLines,
    hoverHandler,
    prepareLegendItems,
    processDataPoints,
    translateLineGraph
} from "./helpers/helpers";
import LineConfig from "./LineConfig";

/**
 * @typedef {object} Line
 * @typedef {object} GraphContent
 * @typedef {object} LineConfig
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
 * @returns {object} LineConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new LineConfig().setInput(inputJSON).validateInput().clone().getConfig();

/**
 * A Line graph is a graph used to represent a collection of data
 * points connected by a line along the X and Y Axis.
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 *
 * @module Line
 * @class Line
 */
class Line extends GraphContent {
    /**
     * @class
     * @param {LineConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.type = "Line";
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
        if (!utils.isEmptyArray(this.dataTarget.valueRegionSubset)) {
            createValueRegion(
                graph.scale,
                graph.config,
                graph.svg.select(`.${styles.regionGroup}`),
                this.dataTarget.valueRegionSubset,
                `region_${this.dataTarget.key}`,
                this.config.yAxis,
                this.dataTarget.interpolationType
            );
        } else if (utils.notEmpty(this.dataTarget.regions)) {
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
        if (
            utils.notEmpty(this.dataTarget.regions) ||
            !utils.isEmptyArray(this.dataTarget.valueRegionSubset)
        ) {
            if (graph.content.length > 1 && !graph.config.shouldHideAllRegion) {
                if (areRegionsIdentical(graph.svg)) {
                    graph.config.shouldHideAllRegion = false;
                } else {
                    graph.config.shouldHideAllRegion = true;
                }
            }
        } else {
            graph.config.shouldHideAllRegion = true;
        }
        if (graph.config.shouldHideAllRegion) {
            hideAllRegions(graph.svg);
        }
        translateRegion(
            graph.scale,
            graph.config,
            graph.svg.select(
                `.${styles.regionGroup}`,
                this.dataTarget.valueRegionSubset
            ),
            this.dataTarget.yAxis,
            !utils.isEmptyArray(this.dataTarget.valueRegionSubset),
            this.dataTarget.interpolationType
        );
        translateLineGraph(graph.scale, graph.svg, graph.config);
        return this;
    }

    /**
     * @inheritdoc
     */
    reflow(graph, graphData) {
        this.config.values = graphData.values;
        this.dataTarget = processDataPoints(graph.config, this.config);
        const eventHandlers = {
            clickHandler: clickHandler(graph, this, graph.config, graph.svg),
            hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
        };
        const position = graph.config.shownTargets.lastIndexOf(graphData.key);
        if (position > -1) {
            graph.config.shownTargets.splice(position, 1);
        }
        reflowLegend(
            graph.legendSVG,
            graph.content[0].config,
            graph,
            eventHandlers
        );
        const lineSVG = graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .selectAll(`.${styles.line}`)
            .data([this.dataTarget]);
        drawDataLines(graph.scale, graph.config, lineSVG.enter());
        lineSVG.exit().remove();

        if (graph.config.showShapes) {
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
        }
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

export default Line;
