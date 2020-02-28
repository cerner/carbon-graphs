import * as d3 from "d3";
import Carbon from "../../src/main/js/carbon";
import {
    LEFT_CHEVRON,
    RIGHT_CHEVRON
} from "../../src/main/js/core/Shape/shapeDefinitions";

/**
 * Creates Panning container to hold the navigation buttons
 *
 * @private
 * @param {Array} container - Contains array of the html elements
 * @returns { HTMLElement } return html element
 */
const createPanningContainer = (container) =>
    container.insert("nav", ":first-child").classed("panning-container", true);

/**
 * createNavigationButton to control the graph movement
 *
 * @private
 * @param {Array} container - container we need to append the navigation button
 * @param {object} icon - icon to add inside the buttons
 * @param {Function} action - function to move to graph
 * @param {string} className - className to be given to each button
 * @returns {object} returns the navigation button element
 */
const createNavigationButton = (container, icon, action, className) =>
    container
        .append("button")
        .classed(className, true)
        .on("click", action)
        .attr("tabindex", 0)
        .append(() =>
            Carbon.tools.shape(icon).getShapeElement(
                Carbon.tools.defaultSVGProps({
                    svgStyles: `fill: ${Carbon.helpers.COLORS.BLACK};`
                }),
                true
            )
        );

/**
 * moveLeftHandler moves the graph to left on click of the button
 *
 * @private
 * @param {object} graphOptions - graph object which we have to re-create
 * @param {object} shift - rate by which we have to shift
 * @returns {object} returns the update axis to re-create the graph
 */
const moveLeftHandler = (graphOptions, shift) => () => {
    const { axisData, graphData, creationHandler } = graphOptions;
    const hour = shift.initial - shift.factor;
    shift.initial = hour;
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, hour).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, hour).toISOString();
    creationHandler(axisData, graphData);
};

/**
 * moveRightHandler moves the graph to left on click of the button
 *
 * @private
 * @param {object} graphOptions - graph object which we have to re-create
 * @param {object} shift - rate by which we have to shift
 * @returns {object} returns the update axis to re-create the graph
 */
const moveRightHandler = (graphOptions, shift) => () => {
    const { axisData, graphData, creationHandler } = graphOptions;
    const hour = shift.initial + shift.factor;
    shift.initial = hour;
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, hour).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, hour).toISOString();
    creationHandler(axisData, graphData);
};

/**
 * createPanningControls to create the navigation button with the click handler
 *
 * @private
 * @param {string} id - id of the div where we have to insert the navigation buttons
 * @param {object} graphOptions - graph data to perform operations on the graph
 * @returns {undefined} returns nothing
 */
const createPanningControls = (id, graphOptions) => {
    const shift = {
        initial: 0,
        factor: 3
    };

    const panningContainerElement = createPanningContainer(d3.select(`#${id}`));
    createNavigationButton(
        panningContainerElement,
        LEFT_CHEVRON,
        moveLeftHandler(graphOptions, shift),
        "nav-left"
    );
    createNavigationButton(
        panningContainerElement,
        RIGHT_CHEVRON,
        moveRightHandler(graphOptions, shift),
        "nav-right"
    );
};

export { createPanningControls, moveRightHandler, moveLeftHandler };
