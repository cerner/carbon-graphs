"use strict";

import constants, { BUBBLE } from "../../helpers/constants";
import { prepareLabelShapeItem } from "../../helpers/label";
import { reflowLegend } from "../../helpers/legend";
import {
    createRegion,
    hideAllRegions,
    translateRegion
} from "../../helpers/region";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import {
    clear,
    clickHandler,
    hoverHandler,
    prepareLegendItems,
    processDataPoints,
    translateBubbleGraph,
    getDataPointValues,
    calculateValuesRange
} from "./helpers/helpers";
import { draw, drawBubbles } from "./helpers/helpersSingleDataset";
import Bubble from "./Bubble";

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
 * @module BubbleSingleDataset
 * @class BubbleSingleDataset
 */
class BubbleSingleDataset extends Bubble {
    /**
     * @inheritdoc
     * @public
     */
    load(graph) {
        if (graph.content.length > 1) {
            console.warn("BubbleSingleDataset can only use one dataset.");
            return this;
        }

        if (
            utils.isUndefined(graph.content[0].config.color) &&
            utils.isDefined(graph.content[0].config.palette) &&
            graph.content[0].config.values.length >
                BUBBLE.MAX_BUBBLES_SINGLE_DATASET
        ) {
            console.warn("Cannot plot more than 4 bubbles using shades.");
            return this;
        }

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

    // /**
    //  * @inheritdoc
    //  */
    // unload(graph) { ... }
    //  inherited from class Bubble

    /**
     * @inheritdoc
     */
    resize(graph) {
        if (utils.isEmpty(this.dataTarget.regions)) {
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
            this.dataTarget
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

export default BubbleSingleDataset;
