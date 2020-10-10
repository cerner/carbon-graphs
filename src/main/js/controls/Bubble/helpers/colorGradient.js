"use strict";
import * as d3 from "d3";
import constants, { BUBBLE } from "../../../helpers/constants";
import utils from "../../../helpers/utils";

/**
 * Gives bubble scale for given weight range in min and max
 *
 * @private
 * @param {object} dataTarget - data for the bubble graph
 * @returns {d3.scale} - returns a function to get bubble radius
 */
export const bubbleScale = (dataTarget) =>
    d3
        .scaleLinear()
        .domain([dataTarget.weight.min, dataTarget.weight.max])
        .range([
            constants.DEFAULT_BUBBLE_RADIUS_MIN,
            constants.DEFAULT_BUBBLE_RADIUS_MAX
        ]);

/**
 * Generates color range for the given color lowerShade and upperShade
 *
 * @private
 * @param {object} dataTarget - data for the bubble graph
 * @returns {d3.scale} - returns function to get color for specific bubble
 */
export const generateColor = (dataTarget) => {
    const lowerShade = dataTarget.hue.lowerShade;
    const upperShade = dataTarget.hue.upperShade;
    let radiusData;
    if (utils.isUndefined(dataTarget.weight)) {
        radiusData = dataTarget.values.map((element) => element.y);
    } else {
        radiusData = dataTarget.values.map((element) =>
            bubbleScale(dataTarget)(element.weight)
        );
    }
    const huePaletteList = d3
        .scaleLinear()
        .domain(d3.extent(radiusData))
        .range([lowerShade, upperShade]);

    return huePaletteList;
};

/**
 * Generates color range for the given color for a single dataset
 *
 * @private
 * @param {object} dataTarget - data for the bubble graph
 * @returns {d3.scale} - returns function to get color for specific bubble
 */
export const generateColorSingleDataset = (dataTarget) => {
    let radiusData;
    let color = [];
    let huePaletteList = null;

    if (utils.isUndefined(dataTarget.weight)) {
        radiusData = dataTarget.values.map((element) => element.y);
    } else {
        radiusData = dataTarget.values.map((element) =>
            bubbleScale(dataTarget)(element.weight)
        );
    }

    if (utils.isDefined(dataTarget.palette)) {
        color = dataTarget.palette;
        switch (dataTarget.values.length) {
            case 4:
                if (color.length === 3) {
                    color.unshift(BUBBLE.PALETTE.GRAY);
                }
                break;
            case 2:
                if (color.length === 1) {
                    color.splice(1, 1);
                }
                break;
            case 1:
                if (color.length === 1) {
                    color.splice(1, 2);
                }
                break;
        }
    }

    huePaletteList = d3
        .scaleQuantile()
        .domain(d3.extent(radiusData))
        .range(color);

    return huePaletteList;
};
