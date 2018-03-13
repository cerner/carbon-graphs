"use strict";
import d3 from "d3";
import Construct from "../../core/Construct";
import { getYAxisHeight } from "../../helpers/axis";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";
import { createLegend } from "../../helpers/legend";
import styles from "../../helpers/styles";
import GanttConfig, { processInput, validateContent } from "./GanttConfig";
import {
    attachEventHandlers,
    calculateAxesSize,
    createAxes,
    createContentContainer,
    createDefs,
    createGrid,
    detachEventHandlers,
    determineHeight,
    scaleGraph
} from "./helpers/creationHelpers";
import { translateGraph } from "./helpers/translateHelpers";

/**
 * @typedef {Object} Gantt
 * @typedef {Object} GanttConfig
 */

const PADDING = constants.PADDING;
const BASE_CANVAS_WIDTH_PADDING = constants.BASE_CANVAS_WIDTH_PADDING;
/**
 * Sets the canvas width
 * @private
 * @param {HTMLElement} container - d3 HTML element object which forms the chart container
 * @param {Object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasWidth = (container, config) => {
    config.canvasWidth = parseInt(container.style("width"), 10);
};

/**
 * Sets the canvas width. Canvas rests within a container.
 * On resize, the canvas is subjected to resizing but its sibling: Legend isnt.
 * @private
 * @param {Object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasHeight = (config) => {
    config.canvasHeight =
        getYAxisHeight(config) + (PADDING.bottom + PADDING.top) * 2;
};

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @throws {module:errors.THROW_MSG_NO_AXES_DATA_LOADED}
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new GanttConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();
/**
 * Executes the before init process checklist, needs to be called by parent control.
 *  Binds the chart id provided in the input JSON to graph container.
 * @private
 * @param {Gantt} control - Gantt instance
 * @returns {Gantt} Gantt instance
 */
const beforeInit = (control) => {
    control.graphContainer = d3.select(control.config.bindTo);
    return control;
};

/**
 * Initializes the necessary Gantt constructor objects
 * @private
 * @param {Gantt} control - Gantt instance
 * @returns {Gantt} Gantt instance
 */
const initConfig = (control) => {
    control.graphContainer = null;
    control.config = {
        axis: {
            x: {},
            y: {}
        },
        shownTargets: {}
    };
    control.axis = {};
    control.scale = {};
    control.svg = null;
    control.legendSVG = null;
    control.content = [];
    control.contentTargets = [];
    control.resizeHandler = null;
    return control;
};

/**
 * Executes the init process checklist, needs to be called by parent control.
 * Needs to be called post calling beforeInit
 *  Sets the canvas width within the graph container
 *  Determines the height for canvas
 *  Calculates Axes width and height
 *  Calculates Axes label width and height, positioning
 *  Creates and sets the d3 scale for the Graph
 * @private
 * @param {Gantt} control - Gantt instance
 * @returns {Gantt} Gantt instance
 */
const init = (control) => {
    control.config.height = determineHeight(
        control.config,
        control.config.dimension
    );
    setCanvasWidth(control.graphContainer, control.config);
    calculateAxesSize(control.config);
    setCanvasHeight(control.config);
    scaleGraph(control.scale, control.config);
    return control;
};

/**
 * A common API used to plot everything except the datapoints and legend themselves.
 * * Axes - X, Y axis
 * * Grid - Horizontal and vertical
 * * X,Y Axis ticks
 *
 * Lifecycle functions include:
 *  * BeforeInit
 *  * Init
 *  * Render
 *  * AfterInit
 * @module Gantt
 * @class Gantt
 */
class Gantt extends Construct {
    /**
     * @constructor
     * @param {GanttConfig} input - Input JSON instance created using GanttConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.generate(input);
    }

    /**
     * Draw function that is called by the parent control. This draws the Axes, grid, legend and
     * labels for the chart construct.
     * @description Since we dont have the concept of z-index in visualization,
     * the order of rendering should be following:
     *  * SVG container
     *  * Grid
     *  * X-Axis
     *  * Y-Axis
     *  * Labels
     *  * Legend
     *  * Data [In our case we have load and unload]
     * @param {Object} input - Input JSON
     * @returns {HTMLElement} d3 HTML element SVG.
     */
    generate(input) {
        this.config = loadInput(input);
        processInput(input, this.config);
        beforeInit(this);
        init(this);
        const containerSVG = d3
            .select(this.config.bindTo)
            .append("div")
            .classed(styles.container, true);
        this.svg = containerSVG
            .insert("svg", ":first-child")
            .classed(styles.canvas, true)
            .attr("role", "img")
            .attr("height", this.config.canvasHeight)
            .attr("width", this.config.canvasWidth - BASE_CANVAS_WIDTH_PADDING);
        createDefs(this.config, this.svg);
        createGrid(this.axis, this.scale, this.config, this.svg);
        createContentContainer(this.config, this.svg);
        createAxes(this.axis, this.scale, this.config, this.svg);
        this.legendSVG = createLegend(
            this.config.bindLegendTo
                ? d3.select(this.config.bindLegendTo)
                : containerSVG
        );
        attachEventHandlers(this);
        return this.svg;
    }

    /**
     * Resizes the graph canvas. Uses the clipPath def.
     * It scales the graph on resize, and translates the graph elements:
     *  Axes
     *  Grid
     *  Labels
     *  @returns {Gantt} - Gantt instance
     */
    resize() {
        setCanvasWidth(this.graphContainer, this.config);
        scaleGraph(this.scale, this.config);
        translateGraph(this);
        // TODO need to implement this
        this.content.forEach((control) => control.resize(this));
        return this;
    }

    /**
     * Loads the content onto the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     * @param {Object} content - Gantt content
     * @returns {Gantt} - Gantt instance
     */
    loadContent(content) {
        validateContent(this.content, content);
        this.content.push(content);
        this.contentTargets.push(content.config);
        // TODO need to implement this
        content.load(this);
        this.resize();
        return this;
    }

    /**
     * Unloads the content from the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     * @param {Object} content - Gantt content to be removed
     * @returns {Gantt} - Gantt instance
     */
    unloadContent(content) {
        const index = this.content.indexOf(content);
        if (index < 0) {
            throw new Error(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        }
        this.content.splice(index, 1);
        this.contentTargets.splice(index, 1);
        // TODO need to implement this
        content.unload(this);
        this.resize();
        return this;
    }

    /**
     * Destroys the graph: Container and canvas.
     * @returns {Gantt} - Gantt instance
     */
    destroy() {
        detachEventHandlers(this);
        this.graphContainer.select(`.${styles.canvas}`).remove();
        this.graphContainer.select(`.${styles.container}`).remove();
        initConfig(this);
        return this;
    }
}

export default Gantt;
