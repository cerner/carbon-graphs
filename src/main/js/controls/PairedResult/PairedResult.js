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
    drawLine,
    drawPoints,
    getValue,
    getDataPointValues,
    hoverHandler,
    iterateOnPairType,
    prepareLegendItems,
    processDataPoints,
    renderRegion,
    isRegionMappedToAllValues,
    translatePairedResultGraph
} from "./helpers/helpers";
import { drawSelectionIndicator } from "./helpers/selectionIndicatorHelpers";
import PairedResultConfig from "./PairedResultConfig";
import {
    calculateVerticalPadding,
    getXAxisXPosition
} from "../../helpers/axis";

/**
 * @typedef {object} PairedResult
 * @typedef {object} GraphContent
 * @typedef {object} PairedResultConfig
 */
/**
 * Calculates the min and max values for Y Axis or Y2 Axis
 *
 * @private
 * @param {Array} values - Datapoint values
 * @param {string} axis - y or y2
 * @returns {object} - Contains min and max values for the data points
 */
const calculateValuesRange = (values, axis = constants.Y_AXIS) => ({
    [axis]: {
        min: Math.min(
            ...values.map((i) => Math.min(...Object.keys(i).map((j) => i[j].y)))
        ),
        max: Math.max(
            ...values.map((i) => Math.max(...Object.keys(i).map((j) => i[j].y)))
        )
    }
});

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} PairedResultConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new PairedResultConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();

/**
 * A Paired result graph is a graph that is represented by 2 points
 * and a line connecting them. There may be an optional 3rd datapoint
 * representing a median between them.
 *
 * @example
 * You can have 3 pairs of x and y co-ordinates with different x and y values to make option 3 below.
 * Or
 * You can have 3 identical X co-ordinates with varying Y co-ordinates to have option 1, shown below.
 *   o
 *   |
 *   |
 *   |
 *   |
 *   o
 *
 *  // Or
 *
 * o------------o
 *
 * // Or
 * o
 *  \
 *   \
 *    \
 *     \
 *      o
 *
 * // etc.
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 * @module PairedResult
 * @class PairedResult
 */
class PairedResult extends GraphContent {
    /**
     * @class
     * @param {PairedResultConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        this.config = loadInput(input);
        this.type = "PairedResult";
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
        if (
            utils.notEmpty(this.dataTarget.regions) ||
            utils.notEmpty(this.dataTarget.valueRegionSubset)
        ) {
            renderRegion(graph.scale, graph.config, graph.svg, this.dataTarget);
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
                hoverHandler: hoverHandler(graph.config, graph.svg)
            },
            this.dataTarget,
            graph.legendSVG
        );
        if (graph.axesLabelShapeGroup[this.config.yAxis]) {
            iterateOnPairType((type) => {
                prepareLabelShapeItem(
                    graph.config,
                    {
                        key: `${this.dataTarget.key}_${type}`,
                        label: getValue(this.dataTarget.label, type),
                        color: getValue(this.dataTarget.color, type),
                        shape: getValue(this.dataTarget.shape, type)
                    },
                    graph.axesLabelShapeGroup[this.config.yAxis]
                );
            });
        }
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
        iterateOnPairType((type) => {
            const key = `${this.dataTarget.key}_${type}`;
            removeLegendItem(graph.legendSVG, {
                key
            });
            removeLabelShapeItem(
                graph.axesLabelShapeGroup[this.config.yAxis],
                {
                    key
                },
                graph.config
            );
        });
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
            utils.notEmpty(this.dataTarget.valueRegionSubset)
        ) {
            const values = this.dataTarget.values;
            // If graph has more than 1 content, we compare the regions if they are identical show and hide if even atleast one of them is not.
            if (graph.content.length > 1) {
                // check if paired Data is proper i.e - region for each key(high, mid and low) in value should be there
                const isPairedDataProper = values.every((value) =>
                    isRegionMappedToAllValues(
                        value,
                        this.dataTarget.regions ||
                            this.dataTarget.valueRegionSubset
                    )
                );

                if (
                    isPairedDataProper &&
                    !graph.config.shouldHideAllRegion &&
                    areRegionsIdentical(graph.svg)
                ) {
                    graph.config.shouldHideAllRegion = false;
                } else {
                    hideAllRegions(graph.svg);
                    graph.config.shouldHideAllRegion = true;
                }
            }

            translateRegion(
                graph.scale,
                graph.config,
                graph.svg.select(
                    `g[aria-describedby="region_${this.dataTarget.key}"]`
                ),
                this.dataTarget.yAxis,
                utils.notEmpty(this.dataTarget.valueRegionSubset)
            );
        } else {
            hideAllRegions(graph.svg);
            graph.config.shouldHideAllRegion = true;
        }

        translatePairedResultGraph(graph.scale, graph.svg, graph.config);
        return this;
    }

    /**
     * @inheritdoc
     */
    reflow(graph, graphData) {
        const eventHandlers = {
            clickHandler: clickHandler(graph, this, graph.config, graph.svg),
            hoverHandler: hoverHandler(graph.config, graph.svg)
        };
        const constructLegendLabels = (d, type) =>
            Object.assign(
                {},
                {
                    shape: getValue(d.shape, type),
                    color: getValue(d.color, type),
                    label: getValue(d.label, type),
                    key: `${d.key}_${type}`,
                    values: d.values,
                    legendOptions: d.legendOptions,
                    type
                }
            );
        const reflow = !!this.config.values.length;
        this.config.values = graphData.values;
        this.dataTarget = processDataPoints(graph.config, this.config, reflow);
        const drawBox = (boxPath) => {
            drawSelectionIndicator(graph.scale, graph.config, boxPath);
            drawLine(graph.scale, graph.config, boxPath);
            drawPoints(graph.scale, graph.config, boxPath);
        };
        const types = ["high", "mid", "low"];
        types.forEach((type) => {
            const label = getValue(graph.contentConfig[0].label, type);
            if (label && label.display) {
                reflowLegend(
                    graph.legendSVG,
                    constructLegendLabels(graph.contentConfig.filter((pairedResult) => pairedResult.key === graphData.key)[0], type),
                    graph,
                    eventHandlers
                );
            }
        });
        const internalValuesSubset = getDataPointValues(this.dataTarget);
        graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .selectAll(`.${styles.pairedBox}`)
            .remove();
        const pairedBoxSVG = graph.svg
            .select(`g[aria-describedby="${graphData.key}"]`)
            .selectAll(`.${styles.pairedBox}`)
            .data(internalValuesSubset);
        pairedBoxSVG
            .enter()
            .append("g")
            .classed(styles.pairedBox, true)
            .attr("aria-selected", false)
            .attr(
                "transform",
                `translate(${getXAxisXPosition(
                    graph.config
                )},${calculateVerticalPadding(graph.config)})`
            )
            .call(drawBox);
        pairedBoxSVG.exit().remove();

        this.valuesRange = calculateValuesRange(
            this.config.values,
            this.config.yAxis
        );
        this.resize(graph);
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

export default PairedResult;
