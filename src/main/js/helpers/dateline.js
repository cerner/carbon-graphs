"use strict";
import * as d3 from "d3";
import utils from "./utils";
import errors from "./errors";
import styles from "./styles";
import { Shape } from "../core";
import { getDefaultSVGProps } from "../core/Shape";
import { getShapeForTarget } from "../controls/Graph/helpers/helpers";
import { getTransformScale } from "./transformUtils";
import constants from "./constants";
import { getXAxisXPosition, getYAxisHeight, getYAxisYPosition } from "./axis";

/**
 * Translates the dateline, based on each content loaded.
 * When a new content is loaded, the height of the graph changes
 * since the height is consumer provided value. We would need to
 * translate the straight line based on the new height.
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @param {Function} yAxisPositionHandler - call back to get y-axis position.Functions differ based on Constructs used
 * @returns {undefined} - returns nothing
 */
const translateDateline = (scale, config, canvasSVG, yAxisPositionHandler) => {
    if (utils.isEmpty(config.dateline)) {
        return;
    }
    const datelineGroup = canvasSVG
        .selectAll(`.${styles.datelineGroup}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${yAxisPositionHandler(
                config
            )})`
        );
    datelineGroup
        .selectAll(`.${styles.datelinePoint}`)
        .select("g")
        .attr("transform", function(d) {
            return `translate(${scale.x(
                utils.parseDateTime(d.value)
            )}, 0) scale(${getTransformScale(this)})`;
        });
    datelineGroup
        .selectAll(`.${styles.dateline}`)
        .attr("x1", (val) => scale.x(utils.parseDateTime(val.value)))
        .attr("y1", 0)
        .attr("x2", (val) => scale.x(utils.parseDateTime(val.value)))
        .attr("y2", getYAxisHeight(config));
};
/**
 * Toggles the selection of a dateline indicator, executes on click of a data point.
 *
 * @private
 * @param {object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (target) => {
    const selectedPointNode = d3.select(target.parentNode);
    selectedPointNode.attr(
        "aria-selected",
        !(selectedPointNode.attr("aria-selected") === "true")
    );
    return selectedPointNode;
};
/**
 * Handler for the dateline point on click. If the click property is present for the point
 * then the callback is executed other wise it is NOP.
 *
 * @private
 * @param {object} value - data point object
 * @param {object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
const datelineClickHandler = (value, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(target).call((selectedTarget) =>
        value.onClick(
            () => {
                selectedTarget.attr("aria-selected", false);
            },
            value,
            d3.select(target)
        )
    );
};
/**
 * getting the height of the dateline indicator.
 *
 * @private
 * @returns { number } returns height of the dateline indicator
 */
const getDatelineIndicatorHeight = () => {
    const shapeHeightArr = [];
    d3.selectAll(`.${styles.datelinePoint}`).each(function() {
        const shapeHeight = this.getBBox().height;
        shapeHeightArr.push(shapeHeight);
    });
    const datelineIndicatorHeight = Math.max(...shapeHeightArr);
    return datelineIndicatorHeight;
};
/**
 * Creates a dateline for graph. We are not adding
 * x1, x2, y1, y2 co-ordinates for the straight line since they will be adjusted when
 * content is loaded.
 *
 * @description Dateline point is shown only when showDatelineIndicator is enabled
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createDateline = (scale, config, canvasSVG) => {
    let datelineContent;
    if (config.settingsDictionary.shouldCreateDatelineDefs) {
        datelineContent = canvasSVG
            .append("g")
            .classed(styles.datelineContent, true)
            .attr("clip-path", `url(#${config.datelineClipPathId})`);
    } else {
        datelineContent = canvasSVG
            .append("g")
            .classed(styles.datelineContent, true);
    }
    config.dateline.forEach((dateline) => {
        const datelineGroup = datelineContent
            .append("g")
            .classed(styles.datelineGroup, true)
            .datum(dateline)
            .attr("style", (val) => `fill: ${val.color}; stroke: ${val.color};`)
            .attr("aria-selected", false);

        const graphConfigClickPassThrough = utils.isDefined(
            config.clickPassThrough
        )
            ? config.clickPassThrough.datelines
            : false;
        datelineGroup
            .append("line")
            .classed(styles.dateline, true)
            .attr("style", (d) => `fill: ${d.color}; stroke: ${d.color}`)
            .attr(
                "pointer-events",
                graphConfigClickPassThrough ? "none" : "auto"
            );
        datelineGroup.append((d) =>
            new Shape(getShapeForTarget(d)).getShapeElement(
                getDefaultSVGProps({
                    svgClassNames: styles.datelinePoint,
                    svgStyles: `fill: ${d.color}; stroke: ${d.color}`,
                    transformFn: (scale) => `scale(${scale})`,
                    onClickFn() {
                        datelineClickHandler(d, this);
                    },
                    a11yAttributes: {
                        "aria-hidden": !dateline.showDatelineIndicator,
                        "aria-disabled": !utils.isFunction(dateline.onClick)
                    }
                })
            )
        );
    });
    translateDateline(scale, config, canvasSVG, getYAxisYPosition);

    if (
        config.settingsDictionary.shouldCreateDatelineDefs &&
        config.dateline.length > 0
    ) {
        const datelineIndicatorHeight = Math.floor(
            getDatelineIndicatorHeight() / 2
        );
        canvasSVG
            .select(`clipPath#${config.datelineClipPathId}`)
            .selectAll("rect")
            .attr("height", getYAxisHeight(config) + datelineIndicatorHeight)
            .attr(
                constants.Y_AXIS,
                getYAxisYPosition(config) - datelineIndicatorHeight
            );
    }
};
/**
 * redraw a dateline for graph. To add the dateline content on top of the content
 * when content is loaded.
 *
 * @description Redrawing the dateline to keep it on top of the content.
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const redrawDatelineContent = (scale, config, canvasSVG) => {
    if (!canvasSVG.select(`.${styles.datelineContent}`).empty()) {
        canvasSVG.select(`.${styles.datelineContent}`).remove();
        createDateline(scale, config, canvasSVG);
    }
};
/**
 * Validates and verifies the dateline
 * Checks if the following properties are present:
 *      color
 *      shape
 *      dateline
 *
 * @private
 * @param {object} dateline - JSON object with color, shape and date value.
 * @throws {module:errors.THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_DATELINE_COLOR_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_DATELINE_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_DATELINE_TYPE_NOT_VALID}
 * @returns {undefined} - returns nothing
 */
const validateDateline = (dateline) => {
    if (utils.isEmpty(dateline)) {
        throw new Error(errors.THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED);
    }
    if (utils.isEmpty(dateline.value)) {
        throw new Error(errors.THROW_MSG_DATELINE_NOT_PROVIDED);
    }
    if (!utils.isDate(dateline.value)) {
        throw new Error(errors.THROW_MSG_DATELINE_TYPE_NOT_VALID);
    }
    if (utils.isEmpty(dateline.color)) {
        throw new Error(errors.THROW_MSG_DATELINE_COLOR_NOT_PROVIDED);
    }
    if (dateline.showDatelineIndicator && utils.isEmpty(dateline.shape)) {
        throw new Error(errors.THROW_MSG_DATELINE_SHAPE_NOT_PROVIDED);
    }
};

export {
    validateDateline,
    createDateline,
    translateDateline,
    redrawDatelineContent,
    getDatelineIndicatorHeight
};
