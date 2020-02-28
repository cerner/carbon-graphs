import * as d3 from "d3";
import Shape, { getDefaultSVGProps } from "../../../core/Shape";
import constants, { SHAPES } from "../../../helpers/constants";
import styles from "../../../helpers/styles";
import { getTransformScale } from "../../../helpers/transformUtils";
import utils from "../../../helpers/utils";
import { getSVGObject } from "./helpers";

/**
 * Returns the pair value that's present, to be used when
 * one of the pair item is known to be absent
 *
 * @private
 * @param {object} pair - Object containing high, low and mid pair values along with
 * their x and y co-ordinates.
 * @returns {object} Available pair object value
 */
const getIncompletePairObject = (pair) => {
    if (pair.high) {
        return pair.high;
    } else if (pair.low) {
        return pair.low;
    }
    return pair.mid;
};
/**
 * Checks if any pairs values are present and if they are currently hidden in the graph.
 * The operation of hiding is usually achieved using legend toggle.
 *
 * @summary A pair is incomplete if either high or low value is missing.
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @returns {boolean} If data point high, low or mid is hidden or otherwise
 */
const isIncompletePairHidden = (config, value) =>
    config.shownTargets.indexOf(getIncompletePairObject(value).key) < 0;
/**
 * Although we are displaying the indicator even when the legend item
 * is toggled, we should hide all but the ones we are going to click on.
 *
 * @summary A pair is partial if the both high and low data are present but they are
 * hidden.
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @returns {boolean} True if high or low are hidden from graph or otherwise
 */
const isPairPartiallyHidden = (config, value) =>
    config.shownTargets.indexOf(value.high.key) < 0 ||
    config.shownTargets.indexOf(value.low.key) < 0;
/**
 * Shows/hides the pair when clicked on one of the data points.
 * When the legend toggle is used one or many data points might be hidden, when
 * a currently visible data point is clicked, we display all the data points back
 * and hide when the consumer closes the popup.
 * This will not be triggered when the data point is:
 *  * Incomplete pair to begin with
 *  * Already has both high and low pairs displayed
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @param {object} target - DOM element of the data point clicked
 * @returns {undefined} - returns nothing
 */
const showHideSiblingDataPoint = (config, value, target) => {
    // Toggle items to force show if hidden or hide, add/remove a class to force display:block
    const targetNode = d3.select(target);
    targetNode
        .select("path")
        .classed(styles.dataPointDisplayEnable, function() {
            return !d3.select(this).classed(styles.dataPointDisplayEnable);
        });
    targetNode
        .selectAll("svg")
        .classed(styles.dataPointDisplayEnable, function() {
            return !d3.select(this).classed(styles.dataPointDisplayEnable);
        });
    const targetSelectionIndicator = targetNode.select("rect");
    targetSelectionIndicator.classed(
        styles.dataPointDisplayEnable,
        !targetSelectionIndicator.classed(styles.dataPointDisplayEnable)
    );
};
/**
 * Checks if the legend item has been toggled for the data set in graph
 *  * If the pair in question doesnt have both high and low data point values
 *  * If one or more are hidden using the legend toggle
 *  * If ones of the data point values are missing i.e. either high or low.
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @returns {*|boolean} True if a legend item is toggled, false otherwise
 */
const isDataPointLegendToggled = (config, value) => {
    const isCompletePairNotPresent = () =>
        !!(value.high && value.low) && isPairPartiallyHidden(config, value);
    return isCompletePairNotPresent() || isIncompletePairHidden(config, value);
};
/**
 * Toggles the selection of a data point, executes on click of a data point.
 * Shows the highlight for the selected data point.
 * If ones of the data points are hidden using legend, then they are also shown for
 * the pair that was selected.
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @param {object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (config, value, target) => {
    const pairNode = d3.select(target);
    const selectedPairNode = pairNode.select(`.${styles.dataPointSelection}`);
    pairNode.attr(
        "aria-selected",
        !(pairNode.attr("aria-selected") === "true")
    );
    selectedPairNode.attr(
        "aria-hidden",
        !(selectedPairNode.attr("aria-hidden") === "true")
    );
    if (isDataPointLegendToggled(config, value)) {
        showHideSiblingDataPoint(config, value, target);
    }
    return selectedPairNode;
};
/**
 * Handler for the data point on click. If the content property is present for the data point
 * then the callback is executed other wise it is NOP.
 * If the callback is present, the selected data point is toggled and the element is passed as an argument to the
 * consumer in the callback, to execute once the popup is closed.
 *  Callback arguments:
 *      Post close callback function
 *      value [x and y data point values]
 *      Selected data point target [d3 target]
 *  On close of popup, call -> the provided callback
 *
 * @private
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
export const dataPointActionHandler = (config, value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(config, value, target).call((selectedTarget) =>
        value.onClick(
            () => {
                const selectedNodeParent = selectedTarget.node().parentNode;
                d3.select(selectedNodeParent).attr("aria-selected", false);
                selectedTarget.attr("aria-hidden", true);
                if (isDataPointLegendToggled(config, value)) {
                    showHideSiblingDataPoint(config, value, selectedNodeParent);
                }
            },
            value.key,
            index,
            value,
            selectedTarget
        )
    );
};
/**
 * Updates the attributes for the rectangle which serves as a selection indicator for a Paired
 * Result. When a pair is clicked the rectangle shall be toggled visible.
 * The attributes width and height are calculated using x,y and x1,y1 co-ordinates from
 * high and low pair values. They are converted to appropriate "scale" using the parameter.
 *
 * @private
 * @param {object} d3PairElement - d3 appended object
 * @param {object} scale - d3 scale for Graph
 * @param {object} value - data point object
 * @returns {object} - d3 append object with correct attributes for creation and translation
 */
const updateSelectionIndicatorAttributes = (d3PairElement, scale, value) =>
    d3PairElement
        .attr(
            "x",
            (d) => scale.x(d.high.x) - constants.SELECTION_INDICATOR_X_POSITION
        )
        .attr(
            "y",
            (d) =>
                scale[value.yAxis](d.high.y) -
                constants.SELECTION_INDICATOR_Y_POSITION
        )
        .attr(
            "width",
            (d) =>
                scale.x(d.low.x) -
                    scale.x(d.high.x) +
                    constants.SELECTION_INDICATOR_X_POSITION * 2 ||
                constants.SELECTION_INDICATOR_X_POSITION * 2
        )
        .attr(
            "height",
            (d) =>
                scale[value.yAxis](d.low.y) -
                scale[value.yAxis](d.high.y) +
                constants.SELECTION_INDICATOR_Y_POSITION * 2
        );
/**
 * Transforms the partial point in the Paired Result graph on resize
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @returns {Function} - translate function for d3 transform
 */
const transformPartialPoint = (scale) => (value) => (scaleFactor) => {
    const getX = (val) => scale.x(getIncompletePairObject(val).x);
    const getY = (val) => scale[value.yAxis](getIncompletePairObject(val).y);
    return `translate(${getX(value)},${getY(value)}) scale(${scaleFactor})`;
};
/**
 * Transforms selection indicator RECTANGLE for a data point set in the Paired Result graph on resize, with
 * both high and low data points.
 * Needs to have both high and low data points for translation of a "box" to occur.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - Graph config object derived from input JSON
 * @returns {object} - d3 select object
 */
export const translateSelectionBox = (scale, canvasSVG, config) =>
    canvasSVG
        .selectAll(
            `.${styles.pairedBoxGroup} rect.${styles.dataPointSelection}`
        )
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .each(function(value) {
            return updateSelectionIndicatorAttributes(
                d3
                    .select(this)
                    .transition()
                    .call(
                        constants.d3Transition(
                            config.settingsDictionary.transition
                        )
                    ),
                scale,
                value
            );
        });
/**
 * Transforms selection indicator CIRCLE for a data point set in the Paired Result graph on resize, with
 * an incomplete pair i.e. only high or low is present.
 * If both high and low are not present then we load a circle as a selection indicator.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {d3.selection} canvasSVG - d3 selection node of canvas svg
 * @param {object} config - Graph config object derived from input JSON
 * @returns {object} - d3 select object
 */
export const translateSelectionItem = (scale, canvasSVG, config) =>
    canvasSVG
        .selectAll(`.${styles.pairedBoxGroup} .${styles.dataPointSelection}`)
        .each(function(value) {
            return d3
                .select(this)
                .select("g")
                .transition()
                .call(
                    constants.d3Transition(config.settingsDictionary.transition)
                )
                .attr("transform", function() {
                    return transformPartialPoint(scale)(value)(
                        getTransformScale(this)
                    );
                });
        });
/**
 * Adds a RECT svg element for each data point pair high AND low.
 *
 * @private
 * @param {object} d3PairElement - d3 select object containing the pair box
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @returns {object} - d3 append object
 */
const addRect = (d3PairElement, scale, config, value) =>
    updateSelectionIndicatorAttributes(
        d3PairElement
            .append("rect")
            .classed(styles.dataPointSelection, true)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("aria-hidden", true)
            .attr("aria-describedby", value.key),
        scale,
        value
    );

/**
 * Adds a CIRCLE svg element for each data point pair high OR low OR mid.
 *
 * @private
 * @param {object} d3PairElement - d3 select object containing the pair box
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} value - data point object
 * @returns {undefined} - returns nothing
 */
const addCircle = (d3PairElement, scale, config, value) =>
    d3PairElement.append(() =>
        new Shape(
            getSVGObject(SHAPES.CIRCLE, constants.DEFAULT_PLOT_SELECTION_SCALE)
        ).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.dataPointSelection,
                transformFn: transformPartialPoint(scale)(value),
                a11yAttributes: {
                    "aria-hidden": true,
                    "aria-describedby": value.key
                }
            })
        )
    );
/**
 * Draws a rectangle around the 2 data points high and low. If either one of them is missing
 * then the rectangle is not drawn. A circle is allocated for any incomplete pair.
 * They are hidden by default, will be shown when a pair is clicked
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {Array} boxPath - d3 html element of the paired box
 * @returns {object} - d3 append object
 */
export const drawSelectionIndicator = (scale, config, boxPath) =>
    boxPath.each(function(value) {
        if (!(value.high && value.low)) {
            return addCircle(d3.select(this), scale, config, value);
        }
        return addRect(d3.select(this), scale, config, value);
    });
