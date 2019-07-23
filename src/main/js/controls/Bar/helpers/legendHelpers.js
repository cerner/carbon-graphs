import {
    legendClickHandler,
    legendHoverHandler
} from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import { setSelectionIndicatorAttributes } from "./creationHelpers";

/**
 * @typedef Bar
 * @typedef d3
 */

/**
 * Handler for Request animation frame, executes on resize.
 *  * Order of execution
 *      * Redraws the content
 *      * Shows/hides the regions
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {Bar} control - Bar instance
 * @returns {function()} callback function handler for RAF
 */
const onAnimationHandler = (graphContext, control) => () => {
    control.redraw(graphContext);
    graphContext.resize();
};
/**
 * Click handler for legend item. Removes the bar from graph when clicked and calls redraw.
 * This will also redraws selection bars and update datum. So, we hide selection bar when legend is clicked.
 *
 * @private
 * @param {object} graphContext - Graph instance
 * @param {Bar} control - Bar instance
 * @param {object} config - Graph config object derived from input JSON
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles click action on legend item
 */
const clickHandler = (graphContext, control, config, canvasSVG) => (
    element,
    item
) => {
    const updateShownTarget = (shownTargets, item) => {
        const index = shownTargets.indexOf(item.key);
        if (index > -1) {
            shownTargets.splice(index, 1);
        } else {
            shownTargets.push(item.key);
        }
    };
    legendClickHandler(element);
    updateShownTarget(config.shownTargets, item);
    canvasSVG
        .selectAll(`g[aria-describedby="${item.key}"]`)
        .attr("aria-hidden", true);
    setSelectionIndicatorAttributes(
        canvasSVG.selectAll(`.${styles.taskBarSelection}`),
        false
    );
    window.requestAnimationFrame(onAnimationHandler(graphContext, control));
};
/**
 * Hover handler for legend item. Highlights current bar and blurs the rest of the targets in Graph
 * if present.
 *
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @returns {Function} - returns callback function that handles hover action on legend item
 */
const hoverHandler = (graphTargets, canvasSVG) => (item, state) => {
    legendHoverHandler(graphTargets, canvasSVG, item.key, state, []);
};

export { clickHandler, hoverHandler };
