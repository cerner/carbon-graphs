"use strict";
import * as d3 from "d3";
import Construct from "../../core/Construct";
import { getYAxisHeight, updateXAxisDomain } from "../../helpers/axis";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";
import { createLegend, reflowLegend } from "../../helpers/legend";
import styles from "../../helpers/styles";
import { d3RemoveElement } from "../Graph/helpers/helpers";
import { getElementBoxSizingParameters } from "../../helpers/paddingUtils";
import {
    attachEventHandlers,
    calculateAxesLabelSize,
    calculateAxesSize,
    createAxes,
    createDefs,
    createLabel,
    createTimelineContent,
    detachEventHandlers,
    determineHeight,
    scaleGraph,
    clickHandler,
    hoverHandler
} from "./helpers/creationHelpers";
import {
    translateTimelineGraph,
    translateAxes
} from "./helpers/translateHelpers";
import TimelineConfig, { processInput } from "./TimelineConfig";
import TimelineContent from "./TimelineContent";

/**
 * @typedef {object} Timeline
 * @typedef {object} TimelineConfig
 */
const BASE_CANVAS_WIDTH_PADDING = constants.BASE_CANVAS_WIDTH_PADDING;
/**
 * Sets the canvas width
 *
 * @private
 * @param {HTMLElement} container - d3 HTML element object which forms the chart container
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasWidth = (container, config) => {
    config.canvasWidth =
        parseInt(container.style("width"), 10) -
        getElementBoxSizingParameters(container);
};
/**
 * Sets the canvas width. Canvas rests within a container.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasHeight = (config) => {
    config.canvasHeight =
        getYAxisHeight(config) +
        (config.padding.bottom * 2 + config.padding.top) * 2;
};
/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @throws {module:errors.THROW_MSG_NO_AXES_DATA_LOADED}
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new TimelineConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();
/**
 * Executes the before init process checklist, needs to be called by parent control.
 *  Binds the chart id provided in the input JSON to graph container.
 *
 * @private
 * @param {Timeline} control - Timeline instance
 * @returns {Timeline} Timeline instance
 */
const beforeInit = (control) => {
    control.graphContainer = d3.select(control.config.bindTo);
    control.config.height = determineHeight(control.config);
    return control;
};
/**
 * Initializes the necessary Timeline constructor objects
 *
 * @private
 * @param {Timeline} control - Timeline instance
 * @returns {Timeline} Timeline instance
 */
const initConfig = (control) => {
    control.graphContainer = null;
    control.config = {
        axis: {
            x: {}
        },
        shownTargets: {},
        pan: {}
    };
    control.axis = {};
    control.scale = {};
    control.svg = null;
    control.legendSVG = null;
    control.content = [];
    control.contentConfig = [];
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
 *
 * @private
 * @param {Timeline} control - Timeline instance
 * @returns {Timeline} Timeline instance
 */
const init = (control) => {
    setCanvasWidth(control.graphContainer, control.config);
    calculateAxesSize(control.config);
    calculateAxesLabelSize(control.config);
    setCanvasHeight(control.config);
    scaleGraph(control.scale, control.config);
    return control;
};

/**
 * Timeline graph is a graph with no Y Axis. This is primarily used to denote an action
 * at a given point of time. It also accepts/supplies a content property which can be used to
 * display non-numeric values which typically cannot be represented using traditional graphs like
 * Line or Paired Result.
 *
 * * Axes - X axis only
 * * X Axis ticks
 * * Legend
 * * X Axis label
 * * Data points
 *
 * Lifecycle functions include:
 *  * BeforeInit
 *  * Init
 *  * Render
 *  * AfterInit
 *
 * @module Timeline
 * @class Timeline
 */
class Timeline extends Construct {
    /**
     * @class
     * @param {TimelineConfig} input - Input JSON instance created using TimelineConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.generate(input);
    }

    /**
     * Draw function that is called by the parent control. This draws the x-axis, legend and
     * X Axis label for the chart construct.
     *
     * @description Since we don't have the concept of z-index in visualization,
     * the order of rendering should be following:
     *  * SVG container
     *  * X-Axis
     *  * X Axis Label
     *  * Legend
     *  * Data [In our case we have load and unload]
     * @param {object} input - Input JSON
     * @returns {HTMLElement} d3 selection node of svg.
     */
    generate(input) {
        this.config = loadInput(input);
        processInput(input, this.config);
        beforeInit(this);
        init(this);
        const containerSVG = d3
            .select(this.config.bindTo)
            .append("div")
            .classed(styles.container, true)
            .style("padding-top", this.config.removeContainerPadding && 0)
            .style("padding-bottom", this.config.removeContainerPadding && 0);
        this.svg = containerSVG
            .insert("svg", ":first-child")
            .classed(styles.canvas, true)
            .attr("role", "img")
            .attr("height", this.config.canvasHeight)
            .attr(
                "width",
                this.config.padding.hasCustomPadding
                    ? this.config.canvasWidth
                    : this.config.canvasWidth - BASE_CANVAS_WIDTH_PADDING
            );
        createDefs(this.config, this.svg);
        createAxes(this.axis, this.scale, this.config, this.svg);
        const ticks = document.getElementsByClassName("tick");
        const firstTick = ticks[0].getBoundingClientRect().width;
        const lastTick = ticks[ticks.length - 1].getBoundingClientRect().width;
        const xAxis = document
            .getElementsByClassName("carbon-axis carbon-axis-x")[0]
            .getBoundingClientRect().width;
        if (xAxis + firstTick / 2 + lastTick / 2 > this.config.canvasWidth) {
            d3RemoveElement(this.graphContainer, "defs");
            d3RemoveElement(this.graphContainer, `.${styles.axisX}`);
            this.config.padding.left = firstTick / 2;
            this.config.padding.right = lastTick / 2;
            createDefs(this.config, this.svg);
            createAxes(this.axis, this.scale, this.config, this.svg);
        }
        createTimelineContent(this.config, this.svg);
        createLabel(this.config, this.svg);
        if (this.config.showLegend) {
            this.legendSVG = createLegend(
                this.config,
                this.config.bindLegendTo
                    ? d3.select(this.config.bindLegendTo)
                    : containerSVG
            );
        }
        attachEventHandlers(this);
        return this.svg;
    }

    /**
     * Resizes the graph canvas. Uses the clipPath def.
     * It scales the graph on resize, and translates the graph elements:
     *  X-Axis
     *  Label
     *
     *  @returns {Timeline} - Timeline instance
     */
    resize() {
        setCanvasWidth(this.graphContainer, this.config);
        scaleGraph(this.scale, this.config);
        translateTimelineGraph(this);
        this.contentConfig.forEach((control) => control.resize(this));
        return this;
    }

    /**
     * Loads the content onto the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     *
     * @param {object} input - Timeline content
     * @returns {Timeline} - Timeline instance
     */
    loadContent(input) {
        const _content = new TimelineContent(input);
        _content.load(this);
        this.content.push(input.key);
        this.contentConfig.push(_content);
        this.resize();
        return this;
    }

    /**
     * Unloads the content from the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     *
     * @param {object} input - Timeline content to be removed
     * @returns {Timeline} - Timeline instance
     */
    unloadContent(input) {
        const index = this.content.indexOf(input.key);
        if (index < 0) {
            throw new Error(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        }
        this.contentConfig[index].unload(this);
        this.content.splice(index, 1);
        this.contentConfig.splice(index, 1);
        this.resize();
        return this;
    }

    /**
     * Updates the graph axisData and content.
     *
     *  @returns {Timeline} - Timeline instance
     * @param {Array} graphData - Input array that holds updated values and key
     */
    reflow(graphData) {
        const eventHandlers = {
            clickHandler: clickHandler(this, this, this.config, this.svg),
            hoverHandler: hoverHandler(this.config.shownTargets, this.svg)
        };
        updateXAxisDomain(this.config);
        scaleGraph(this.scale, this.config);
        translateAxes(this.axis, this.scale, this.config, this.svg);
        let position;
        if (
            graphData &&
            graphData.values &&
            this.content.includes(graphData.key)
        ) {
            this.contentConfig.forEach((config, index) => {
                if (config.config.key === graphData.key) position = index;
            });
            this.contentConfig[position].reflow(this, graphData);
        }
        reflowLegend(
            this.legendSVG,
            this.contentConfig[0].config,
            this,
            eventHandlers
        );
        this.resize();
        return this;
    }

    /**
     * Destroys the graph: Container and canvas.
     *
     * @returns {Timeline} - Timeline instance
     */
    destroy() {
        detachEventHandlers(this);
        d3RemoveElement(this.graphContainer, `.${styles.canvas}`);
        d3RemoveElement(this.graphContainer, `.${styles.container}`);
        initConfig(this);
        return this;
    }
}

export default Timeline;
