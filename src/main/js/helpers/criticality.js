"use strict";
import d3 from "d3";
import constants from "./constants";
import styles from "./styles";

/**
 * @module criticality
 * @alias module:criticality
 */

/**
 * Checks if only 1 content item is present in the graph
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @returns {boolean} true if displayed targets is equal to 1, false otherwise
 */
const isSingleTargetDisplayed = (graphTargets) => graphTargets.length === 1;
/**
 * Hides all the criticality within a graph
 * @private
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {undefined} - returns nothing
 */
const hideAllCriticality = (canvasSVG) => {
    canvasSVG.selectAll(`.${styles.criticalityOuterPoint}`)
             .attr("aria-hidden", true);
    canvasSVG.selectAll(`.${styles.criticalityInnerPoint}`)
             .attr("aria-hidden", true);
};
/**
 * Decides if criticality indicators needs to be hidden based on count of displayed targets in graph
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @returns {boolean} true if displayed targets are more than 1, false otherwise
 */
const shouldHideAllCriticality = (graphTargets) => graphTargets.length > 1;
/**
 * Hides/shows the criticality given the canvas path and unique identifier of the content
 * @private
 * @param {Array} canvasSVG - d3 html element of canvas
 * @param {string} key - Data points set unique key
 * @param {boolean} shouldShow - true if enabled
 * @returns {undefined} - returns nothing
 */
const showHideCriticality = (canvasSVG, key, shouldShow) => {
    canvasSVG.selectAll(`.${styles.criticalityOuterPoint}[aria-describedby="${key}"]`)
             .attr("aria-hidden", !shouldShow);
    canvasSVG.selectAll(`.${styles.criticalityInnerPoint}[aria-describedby="${key}"]`)
             .attr("aria-hidden", !shouldShow);
};
/**
 * Toggles display of criticality indicators for a graph content
 * @private
 * @param {Array} canvasSVG - d3 html element of canvas
 * @param {string} key - Data points set unique key
 * @returns {undefined} - returns nothing
 */
const toggleCriticality = (canvasSVG, key) => {
    const toggleStatus = (context) => !(d3.select(context).attr("aria-hidden") === "true");
    canvasSVG.selectAll(`.${styles.criticalityOuterPoint}[aria-describedby="${key}"]`)
             .attr("aria-hidden", function() {
                 return toggleStatus(this);
             });
    canvasSVG.selectAll(`.${styles.criticalityInnerPoint}[aria-describedby="${key}"]`)
             .attr("aria-hidden", function() {
                 return toggleStatus(this);
             });
};
/**
 * Processes the criteria for displaying criticality indicators within a graph
 * * If more than 1 target is displayed -> Hide indicator(s)
 * * If only 1 target is displayed -> show the indicator(s) using unique data set key
 * @private
 * @param {Object} graphContext - Graph instance
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {undefined} - returns nothing
 */
const processCriticalityCriteria = (graphContext, config, canvasSVG) =>
    isSingleTargetDisplayed(graphContext)
        ? toggleCriticality(canvasSVG, ...config.shownTargets)
        : hideAllCriticality(canvasSVG);
/**
 * Handler for show/hide indicators when hovered over a legend item
 * @private
 * @param {Array} shownTargets - Targets/data sets that are currently displayed in graph
 * @param {Array} canvasSVG - d3 html element of canvas
 * @param {string} key - Data points set unique key
 * @param {string} hoverState - state of mouse hover => enter or leave
 * @returns {undefined} - returns nothing
 */
const criticalityLegendHoverHandler = (shownTargets, canvasSVG, key, hoverState) => {
    const shouldShow = (hoverState === constants.HOVER_EVENT.MOUSE_ENTER && shownTargets.indexOf(key) > -1);
    canvasSVG.selectAll(`.${styles.criticalityOuterPoint}[aria-describedby="${key}"]`)
             .classed(styles.criticalityHighlight, shouldShow);
    canvasSVG.selectAll(`.${styles.criticalityInnerPoint}[aria-describedby="${key}"]`)
             .classed(styles.criticalityHighlight, shouldShow);
};

/**
 * @enum {Function}
 */
export {
    criticalityLegendHoverHandler,
    hideAllCriticality,
    isSingleTargetDisplayed,
    processCriticalityCriteria,
    showHideCriticality,
    shouldHideAllCriticality,
    toggleCriticality
};
