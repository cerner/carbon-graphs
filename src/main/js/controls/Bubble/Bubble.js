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
    translateBubbleGraph,
    getDataPointValues,
    drawBubbles,
    calculateValuesRange,
    loadInput
} from "./helpers/helpers";

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
     * @param {object} input - Input JSON instance created using GraphConfig
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
        console.warn(
            "Bubble will be deprecated in a future release. Please use BubbleSingleDataset or BubbleMultipleDataset"
        );

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
    reflow(graph, graphData) {
        const eventHandlers = {
            clickHandler: clickHandler(graph, this, graph.config, graph.svg),
            hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
        };
        this.config.values = graphData.values;
        this.dataTarget = processDataPoints(graph.config, this.config);
        const position = graph.config.shownTargets.lastIndexOf(graphData.key);

        if (position > -1) {
            graph.config.shownTargets.splice(position, 1);
        }
        reflowLegend(
            graph.legendSVG,
            graph.content.filter(
                (bubble) => bubble.config.key === graphData.key
            )[0].config,
            graph,
            eventHandlers
        );
        const currentPointsGroup = graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .select(`.${styles.currentPointsGroup}`)
            .data([this.dataTarget]);
        currentPointsGroup.exit().remove();
        const currentPointsPath = currentPointsGroup
            .selectAll(`.${styles.pointGroup}`)
            .data(this.dataTarget);
        currentPointsPath.exit().remove();
        const pointPath = graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .select(`.${styles.currentPointsGroup}`)
            .selectAll(`[class="${styles.point}"]`)
            .data(getDataPointValues(this.dataTarget));
        drawBubbles(
            graph.scale,
            graph.config,
            pointPath.enter(),
            this.dataTarget,
            graph.legendSVG
        );
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

export default Bubble;
