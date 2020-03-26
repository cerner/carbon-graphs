"use strict";
import * as d3 from "d3";
import Construct from "../../core/Construct";
import errors from "../../helpers/errors";
import { createLegend } from "../../helpers/legend";
import { contentLoadHandler } from "../../helpers/constructUtils";
import styles from "../../helpers/styles";
import { d3RemoveElement } from "../Graph/helpers/helpers";
import {
    attachEventHandlers,
    createArc,
    createDefs,
    createPieContentContainer,
    createPieLayout,
    detachEventHandlers,
    determineHeight
} from "./helpers/creationHelpers";
import { translatePieGraph } from "./helpers/translateHelpers";
import PieConfig, { processInput } from "./PieConfig";
import PieContent from "./PieContent";

/**
 * @typedef {object} Pie
 * @typedef {object} PieConfig
 */
/**
 * Sets the canvas width
 *
 * @private
 * @param {HTMLElement} container - d3 HTML element object which forms the chart container
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasWidth = (container, config) => {
    config.canvasWidth = config.width;
};
/**
 * Sets the canvas width. Canvas rests within a container.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasHeight = (config) => {
    config.canvasHeight = config.height;
};
/**
 * Sets the canvas radius for pie chart.
 *
 * @private
 * @param {object} config - config object derived from input JSON
 * @returns {undefined} - returns nothing
 */
const setCanvasRadius = (config) => {
    config.canvasRadius = d3.min([config.height, config.width]) / 2;
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
    new PieConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig();
/**
 * Executes the before init process checklist, needs to be called by parent control.
 *  Binds the chart id provided in the input JSON to graph container.
 *
 * @private
 * @param {Pie} control - Pie instance
 * @returns {Pie} Pie instance
 */
const beforeInit = (control) => {
    control.graphContainer = d3.select(control.config.bindTo);
    control.config.height = determineHeight(
        control.config,
        control.config.dimension
    );
    control.config.width = determineHeight(
        control.config,
        control.config.dimension
    );
    return control;
};
/**
 * Initializes the necessary Pie constructor objects
 *
 * @private
 * @param {Pie} control - Pie instance
 * @returns {Pie} Pie instance
 */
const initConfig = (control) => {
    control.graphContainer = null;
    control.config = {};
    control.svg = null;
    control.legendSVG = null;
    control.content = [];
    control.contentConfig = [];
    control.resizeHandler = null;
    control.d3PieLayoutTransformer = null;
    control.d3PieArcTransformer = null;
    return control;
};
/**
 * Executes the init process checklist, needs to be called by parent control.
 * Needs to be called post calling beforeInit
 *  Sets the canvas width within the graph container
 *  Determines the height for canvas
 *  Calculates Axes width and height
 *  Calculates Axes label width and height, positioning
 *
 * @private
 * @param {Pie} control - Pie instance
 * @returns {Pie} Pie instance
 */
const init = (control) => {
    setCanvasWidth(control.graphContainer, control.config);
    setCanvasHeight(control.config);
    setCanvasRadius(control.config);
    control.d3PieLayoutTransformer = createPieLayout();
    control.d3PieArcTransformer = createArc(control.config.canvasRadius);
    return control;
};

/**
 * A Pie chart is a circular statistical graphic, which is divided into
 * slices to illustrate numerical proportion.
 *
 * Lifecycle functions include:
 *  * BeforeInit
 *  * Init
 *  * Render
 *  * AfterInit
 *
 * @module Pie
 * @class Pie
 */
class Pie extends Construct {
    /**
     * @class
     * @param {PieConfig} input - Input JSON instance created using PieConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.generate(input);
    }

    /**
     * Draw function that is called by the parent control. This draws the legend and the content for the chart construct.
     *
     * @description Since we dont have the concept of z-index in visualization,
     * the order of rendering should be following:
     *  * SVG container
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
            .classed(styles.container, true);
        this.svg = containerSVG
            .insert("svg", ":first-child")
            .classed(styles.pieChartCanvas, true)
            .attr("role", "img")
            .attr("height", this.config.canvasHeight)
            .attr("width", this.config.canvasWidth);
        createDefs(this.config, this.svg);
        createPieContentContainer(this.config, this.svg);
        if (this.config.showLegend) {
            this.legendSVG = createLegend(
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
     *
     *  @returns {Pie} - Pie instance
     */
    resize() {
        translatePieGraph(this);
        return this;
    }

    /**
     * Loads the content onto the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     *
     * @param {object|Array} input - Pie content
     * @returns {Pie} - Pie instance
     */
    loadContent(input) {
        contentLoadHandler(input, (i) => {
            const _content = new PieContent(i);
            _content.load(this);
            this.content.push(i.key);
            this.contentConfig.push(_content);
        });
        this.contentConfig.forEach((control) => control.resize(this));
        return this;
    }

    /**
     * Unloads the content from the graph.
     * The content serves as a 1to1 relationship. For rendering
     * multiple data sets respective number of content needs to be provided.
     *
     * @param {object} input - Pie content to be removed
     * @returns {Pie} - Pie instance
     */
    unloadContent(input) {
        const index = this.content.indexOf(input.key);
        if (index < 0) {
            throw new Error(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        }
        this.contentConfig[index].unload(this);
        this.content.splice(index, 1);
        this.contentConfig.splice(index, 1);
        this.contentConfig.forEach((control) => control.resize(this));
        return this;
    }

    /**
     * Destroys the graph: Container and canvas.
     *
     * @returns {Pie} - Pie instance
     */
    destroy() {
        detachEventHandlers(this);
        d3RemoveElement(this.graphContainer, `.${styles.pieChartCanvas}`);
        d3RemoveElement(this.graphContainer, `.${styles.container}`);
        initConfig(this);
        return this;
    }
}

export default Pie;
