"use strict";
import { calculateVerticalPadding } from "../../../helpers/axis";
import constants, { AXIS_TYPE } from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { barAttributesHelper, getXAxisXPosition } from "./creationHelpers";

const PADDING = constants.DEFAULT_BAR_SELECTION_PADDING;

/**
 * @typedef d3
 */

/**
 * Returns selected data on click of a bar.
 * This will return only content that is present in shownTargets. Array also maintains order in which content is loaded.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} value - selected value
 * @param {object} config - graph config object
 * @returns {Array} - array of selected content
 */
const getSelectedData = (canvasSVG, value, config) =>
    canvasSVG
        .select(
            `rect[aria-describedby=bar-selector-${
                config.axis.x.type === AXIS_TYPE.TIME_SERIES
                    ? config.axis.x.ticks.values.indexOf(
                          new Date(value.x).toISOString()
                      )
                    : config.axis.x.ticks.values.indexOf(value.x)
            }]`
        )
        .datum()
        .valueSubsetArray.filter(
            (v) => config.shownTargets.indexOf(v.key) > -1
        );
/**
 * This method is called when bar content is unloaded off graph. This will remove objects related to the unloaded content.
 *
 * @private
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {string} key - unloaded content key
 * @returns {undefined} - returns nothing
 */
const clearSelectionDatum = (canvasSVG, key) => {
    canvasSVG.selectAll(`.${styles.taskBarSelection}`).each((dataPoint) => {
        const index = dataPoint.valueSubsetArray.findIndex(
            (v) => v.key === key
        );
        if (index > -1) {
            dataPoint.valueSubsetArray.splice(index, 1);
        }
    });
};
/**
 * Updates selection datum with newly loaded content.
 *
 * @private
 * @param {Array} internalValueSubset - input internalValueSubset array
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - graph config object
 * @returns {undefined} - returns nothing
 */
const updateSelectionBars = (internalValueSubset, canvasSVG, config) => {
    const selectionPath = canvasSVG.selectAll(`.${styles.taskBarSelection}`);
    selectionPath.each((dataPoint) => {
        const value = internalValueSubset.filter((v) =>
            config.axis.x.type === AXIS_TYPE.TIME_SERIES
                ? v.x.toISOString() === dataPoint.x
                : v.x === dataPoint.x
        );
        if (utils.notEmpty(value)) {
            dataPoint.valueSubsetArray.push(value[0]);
        }
    });
};
/**
 * Creates a d3 svg selection bar
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @param {object} config - config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {undefined} - returns nothing
 */
const drawSelectionBars = (scale, bandScale, config, canvasSVG) => {
    const tickValues = config.axis.x.ticks.values.map((d) => ({
        x: d,
        valueSubsetArray: []
    }));
    const selectionPath = canvasSVG
        .append("g")
        .classed(styles.barSelectionGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${calculateVerticalPadding(
                config
            )})`
        )
        .selectAll(`${styles.taskBarSelection}`)
        .data(tickValues);
    selectionPath
        .enter()
        .append("rect")
        .attr("aria-hidden", true)
        .classed(styles.taskBarSelection, true)
        .attr(
            "aria-describedby",
            (value) => `bar-selector-${tickValues.indexOf(value)}`
        )
        .attr("rx", 3)
        .attr("ry", 3);
    selectionPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
};
/**
 * Contains logic to calculate x, y, height, width for selection bar
 * x is calculated using first visible content in the datum array for a tick.
 * y is calculated using maximum y available in datum.
 * Last content - first content range is the width
 * max y range - min y range is the height
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @param {Array} shownTargets - graph's shownTarget array
 * @param {Array} datum - selection datum array
 * @returns {object} Object that contains methods for calculating x, y, height, width.
 */
const selectionAttributeHelper = (scale, bandScale, shownTargets, datum) => {
    const barAttributeHelper = barAttributesHelper(scale, bandScale);
    const shownDatum = datum.filter((v) => shownTargets.indexOf(v.key) > -1);
    const maxYIndex = ((targets) => {
        let maxIndex = 0;
        if (utils.notEmpty(targets)) {
            let maxY = Math.max(0, targets[0].y + targets[0].y0);
            targets.forEach((v, i) => {
                const temp = Math.max(0, v.y + v.y0);
                if (maxY <= temp) {
                    maxIndex = i;
                    maxY = temp;
                }
            });
        }
        return maxIndex;
    })(shownDatum);
    const minYIndex = ((targets) => {
        let maxIndex = 0;
        if (utils.notEmpty(targets)) {
            let maxY = Math.min(0, targets[0].y + targets[0].y0);
            targets.forEach((v, i) => {
                const temp = Math.min(0, v.y + v.y0);
                if (maxY >= temp) {
                    maxIndex = i;
                    maxY = temp;
                }
            });
        }
        return maxIndex;
    })(shownDatum);
    const maxXIndex = ((targets) => {
        let maxIndex = 0;
        if (utils.notEmpty(targets)) {
            let maxX = 0;
            targets.forEach((v, i) => {
                const temp = Math.max(maxX, barAttributeHelper.x(v));
                if (temp > maxX) {
                    maxIndex = i;
                    maxX = temp;
                }
            });
        }
        return maxIndex;
    })(shownDatum);

    const leftRange = utils.notEmpty(shownDatum)
        ? barAttributeHelper.x(shownDatum[0])
        : 0;
    const topRange = utils.notEmpty(shownDatum)
        ? barAttributeHelper.y(shownDatum[maxYIndex])
        : 0;
    const rightRange = utils.notEmpty(shownDatum)
        ? barAttributeHelper.x(shownDatum[maxXIndex]) +
          barAttributeHelper.width()
        : 0;
    const bottomRange = utils.notEmpty(shownDatum)
        ? barAttributeHelper.y(shownDatum[minYIndex]) +
          barAttributeHelper.height(shownDatum[minYIndex])
        : 0;
    return {
        x: () => (utils.notEmpty(shownDatum) ? leftRange - PADDING : 0),
        y: () => (utils.notEmpty(shownDatum) ? topRange - PADDING : 0),
        height: () =>
            utils.notEmpty(shownDatum)
                ? bottomRange - topRange + 2 * PADDING
                : 0,
        width: () =>
            utils.notEmpty(shownDatum)
                ? rightRange - leftRange + 2 * PADDING
                : 0
    };
};

/**
 * Transforms selection bars for all ticks in the Bar graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} bandScale - bar x-axis band scale
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - config object derived from input JSON
 * @returns {object} d3 object for selection bars
 */
const translateSelectBars = (scale, bandScale, canvasSVG, config) =>
    canvasSVG.selectAll(`.${styles.taskBarSelection}`).each((dataPoint, i) => {
        const selectionAttrHelper = selectionAttributeHelper(
            scale,
            bandScale,
            config.shownTargets,
            dataPoint.valueSubsetArray
        );
        canvasSVG
            .select(`rect[aria-describedby=bar-selector-${i}]`)
            .transition()
            .call(constants.d3Transition(config.settingsDictionary.transition))
            .attr("x", selectionAttrHelper.x())
            .attr("y", selectionAttrHelper.y())
            .attr("height", selectionAttrHelper.height())
            .attr("width", selectionAttrHelper.width());
    });

export {
    getSelectedData,
    drawSelectionBars,
    translateSelectBars,
    updateSelectionBars,
    clearSelectionDatum
};
