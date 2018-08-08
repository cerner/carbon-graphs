import {
    legendClickHandler,
    legendHoverHandler
} from "../../../helpers/legend";
import styles from "../../../helpers/styles";
import constants from "../../../helpers/constants";

/**
 * Handler for Request animation frame, executes on resize.
 *  * Order of execution
 *      * Redraws the content
 *      * Shows/hides the regions
 * @private
 * @param {Object} graphContext - Graph instance
 * @param {Line} control - Line instance
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {function()} callback function handler for RAF
 */
const onAnimationHandler = (graphContext, control, config, canvasSVG) => () => {
    control.redraw(graphContext);
    graphContext.resize();
};
/**
 * Click handler for legend item. Removes the bar from graph when clicked and calls redraw
 * @private
 * @param {Object} graphContext - Graph instance
 * @param {Line} control - Bar instance
 * @param {Object} config - Graph config object derived from input JSON
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {function} - returns callback function that handles click action on legend item
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
    window.requestAnimationFrame(
        onAnimationHandler(graphContext, control, config, canvasSVG)
    );
};
/**
 * Hover handler for legend item. Highlights current bar and blurs the rest of the targets in Graph
 * if present.
 * @private
 * @param {Array} graphTargets - List of all the items in the Graph
 * @param {Array} canvasSVG - d3 html element of canvas
 * @returns {function} - returns callback function that handles hover action on legend item
 */
const hoverHandler = (graphTargets, canvasSVG) => (item, state) => {
    const additionalHoverHandler = (
        shownTargets,
        canvasSVG,
        currentKey,
        hoverState,
        k
    ) => {
        canvasSVG
            .selectAll(`.${styles.region}[aria-describedby="region_${k}"]`)
            .classed(
                styles.regionBlur,
                hoverState === constants.HOVER_EVENT.MOUSE_ENTER
            );
    };

    legendHoverHandler(graphTargets, canvasSVG, item.key, state, [
        additionalHoverHandler
    ]);
};

export { clickHandler, hoverHandler };
