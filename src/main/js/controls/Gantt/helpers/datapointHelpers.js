import * as d3 from "d3";
import { Shape } from "../../../core";
import { getDefaultSVGProps } from "../../../core/Shape";
import { getXAxisXPosition } from "../../../helpers/axis";
import constants, { SHAPES } from "../../../helpers/constants";
import { getSVGObject } from "../../../helpers/shapeSVG";
import styles from "../../../helpers/styles";
import utils from "../../../helpers/utils";
import { getXAxisYPosition } from "./creationHelpers";
import { transformPoint } from "./translateHelpers";

/**
 * Renders the action items for a track. The data points provided are of ISO8601 datetime format
 * They are dependent on a unique key which needs to match the legend id's provided when initializing
 * the gantt chart.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {object} ganttContentContainerPath - Container for gantt chart's contents (Tracks)
 * @param {object} dataTarget - Data point values and their properties for each action item
 * @param {Function} drawDataPointsHandler - call back function to draw points with options.
 * @returns {undefined} - returns nothing
 */
export const drawDataPoints = (
    scale,
    config,
    ganttContentContainerPath,
    dataTarget,
    drawDataPointsHandler
) => {
    const allPointsPath = ganttContentContainerPath
        .append("g")
        .classed(styles.currentPointsGroup, true)
        .attr(
            "transform",
            `translate(${getXAxisXPosition(config)}, ${getXAxisYPosition(
                config
            )})`
        );
    const pointPath = allPointsPath
        .selectAll(`.${styles.point}`)
        .data(dataTarget);
    drawDataPointsHandler(scale, config, pointPath.enter());
    pointPath
        .exit()
        .transition()
        .call(constants.d3Transition(config.settingsDictionary.transition))
        .remove();
};

/**
 * Renders the circle svg element which shows up when clicked on the data point.
 * It is hidden by default and toggled visible onClick.
 *
 * @private
 * @param {object} scale - d3 scale for Graph
 * @param {object} config - Graph config object derived from input JSON
 * @param {SVGElement} path - svg circle element
 * @param {object} dataPoint - data point properties such as shape, color and onClick callback function
 * @param {number} index - data point index
 * @returns {object} - d3 selection object
 */
export const renderSelectionPath = (scale, config, path, dataPoint, index) =>
    path.append(() =>
        new Shape(
            getSVGObject(SHAPES.CIRCLE, constants.DEFAULT_PLOT_SELECTION_SCALE)
        ).getShapeElement(
            getDefaultSVGProps({
                svgClassNames: styles.dataPointSelection,
                svgStyles: ``,
                transformFn: transformPoint(scale, config)(dataPoint),
                onClickFn() {
                    dataPointActionHandler(dataPoint, index, this);
                },
                a11yAttributes: {
                    "aria-hidden": true,
                    "aria-describedby": dataPoint.key,
                    "aria-disabled": !utils.isFunction(dataPoint.onClick)
                }
            })
        )
    );

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
 * @param {object} value - data point object
 * @param {number} index - data point index for the set
 * @param {object} target - DOM object of the clicked point
 * @returns {undefined} - returns nothing
 */
export const dataPointActionHandler = (value, index, target) => {
    if (utils.isEmpty(value.onClick)) {
        return;
    }
    toggleDataPointSelection(target).call((selectedTarget) =>
        value.onClick(
            () => selectedTarget.attr("aria-hidden", true),
            value.key,
            index,
            value,
            selectedTarget
        )
    );
};

/**
 * Toggles the selection of a data point, executes on click of a data point.
 *
 * @private
 * @param {object} target - DOM element of the data point clicked
 * @returns {Array} d3 html element of the selected point
 */
const toggleDataPointSelection = (target) => {
    const selectedPointNode = d3
        .select(target.parentNode)
        .select(`.${styles.dataPointSelection}`);
    selectedPointNode.attr(
        "aria-hidden",
        !(selectedPointNode.attr("aria-hidden") === "true")
    );
    return selectedPointNode;
};
