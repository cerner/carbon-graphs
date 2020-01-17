"use strict";
import utils from "./utils";
import errors from "./errors";
import styles from "./styles";
import { getTransformScale } from "./transformUtils";
import constants from "./constants";
import { getXAxisXPosition, getYAxisHeight, getYAxisYPosition } from "./axis";

/**
 * Translates the eventline, based on each content loaded.
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
const translateEventline = (scale, config, canvasSVG, yAxisPositionHandler) => {
    if (utils.isEmpty(config.eventline)) {
        return;
    }
    const eventlineGroup = canvasSVG
        .selectAll(`.${styles.eventlineGroup}`)
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)},${yAxisPositionHandler(
                config
            )})`
        );
    eventlineGroup
        .selectAll(`.${styles.eventlinePoint}`)
        .select("g")
        .attr("transform", function(d) {
            return `translate(${scale.x(
                utils.parseDateTime(d.value)
            )}, 0) scale(${getTransformScale(this)})`;
        });
    eventlineGroup
        .selectAll(`.${styles.eventline}`)
        .attr("x1", (val) => scale.x(utils.parseDateTime(val.value)))
        .attr("y1", 0)
        .attr("x2", (val) => scale.x(utils.parseDateTime(val.value)))
        .attr("y2", getYAxisHeight(config));
};
/**
 * Creates a eventline for graph. We are not adding
 * x1, x2, y1, y2 co-ordinates for the straight line since they will be adjusted when
 * content is loaded.
 *
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const createEventline = (scale, config, canvasSVG) => {
    const eventlineContent = canvasSVG
        .append("g")
        .classed(styles.eventlineContent, true)
        .attr("clip-path", `url(#${config.clipPathId})`);

    config.eventline.forEach((eventline, index) => {
        const eventlineGroup = eventlineContent
            .append("g")
            .classed(styles.eventlineGroup, true)
            .datum(eventline)
            .attr("style", (val) => `fill: ${val.color}; stroke: ${val.color};`)
            .attr("aria-selected", false);

        const graphConfigClickPassThrough = utils.isDefined(
            config.clickPassThrough
        )
            ? config.clickPassThrough.eventlines
            : false;

        eventlineGroup
            .append("line")
            .classed(styles.eventline, true)
            .attr(
                "style",
                (d) =>
                    `fill: ${d.color}; stroke: ${d.color}; stroke-dasharray: ${
                        d.style !== undefined &&
                        d.style.strokeDashArray !== undefined
                            ? d.style.strokeDashArray
                            : "2,2"
                    }`
            )
            .attr(
                "pointer-events",
                graphConfigClickPassThrough ? "none" : "auto"
            )
            .attr("aria-hidden", false);
    });
    translateEventline(scale, config, canvasSVG, getYAxisYPosition);
};
/**
 * redraw a eventline for graph. To add the eventline content on top of the content
 * when content is loaded.
 *
 * @description Redrawing the eventline to keep it on top of the content.
 * @private
 * @param {object} scale - d3 scale taking into account the input parameters
 * @param {object} config - config object derived from input JSON
 * @param {Array} canvasSVG - d3 object of canvas svg
 * @returns {undefined} - returns nothing
 */
const redrawEventlineContent = (scale, config, canvasSVG) => {
    if (!canvasSVG.select(`.${styles.eventlineContent}`).empty()) {
        canvasSVG.select(`.${styles.eventlineContent}`).remove();
        createEventline(scale, config, canvasSVG);
    }
};
/**
 * Validates and verifies the eventline
 * Checks if the following properties are present:
 *      color
 *      eventline
 *
 * @private
 * @param {object} eventline - JSON object with color, shape and date value.
 * @throws {module:errors.THROW_MSG_EVENTLINE_OBJECT_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_EVENTLINE_COLOR_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_EVENTLINE_NOT_PROVIDED}
 * @throws {module:errors.THROW_MSG_EVENTLINE_TYPE_NOT_VALID}
 * @returns {undefined} - returns nothing
 */
const validateEventline = (eventline) => {
    if (utils.isEmpty(eventline)) {
        throw new Error(errors.THROW_MSG_EVENTLINE_OBJECT_NOT_PROVIDED);
    }
    if (utils.isEmpty(eventline.value)) {
        throw new Error(errors.THROW_MSG_EVENTLINE_NOT_PROVIDED);
    }
    if (!utils.isDate(eventline.value)) {
        throw new Error(errors.THROW_MSG_EVENTLINE_TYPE_NOT_VALID);
    }
    if (utils.isEmpty(eventline.color)) {
        throw new Error(errors.THROW_MSG_EVENTLINE_COLOR_NOT_PROVIDED);
    }
};

export {
    validateEventline,
    createEventline,
    translateEventline,
    redrawEventlineContent
};
