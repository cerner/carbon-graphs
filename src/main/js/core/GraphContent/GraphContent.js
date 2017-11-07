"use strict";
import errors from "../../helpers/errors";

/**
 * The base content class from which all graph controls can inherit.
 * @interface
 * @class GraphContent
 */
export default class GraphContent {
    /**
     * Loads the input JSON for generating the graph
     * @abstract
     * @function GraphContent#load
     * @throws {module:errors.THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED}
     * @param {Object} graph - Graph instance
     * @returns {undefined} - returns nothing
     */
    load(graph) {
        throw errors.THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED;
    }

    /**
     * Remove the data point from the chart.
     * @abstract
     * @function GraphContent#unload
     * @throws {module:errors.THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED}
     * @param {Object} graph - Graph instance
     * @returns {undefined} - returns nothing
     */
    unload(graph) {
        throw errors.THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED;
    }

    /**
     * Resizes the graph based on window resize event
     * @abstract
     * @function GraphContent#resize
     * @throws {module:errors.THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED}
     * @param {Object} graph - Graph instance
     * @returns {undefined} - returns nothing
     */
    resize(graph) {
        throw errors.THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED;
    }

    /**
     * Force redraw the graph. This will be called when one of the data point is removed.
     * The situation can be when a legend item was clicked.
     * The involves clearing the graph and redrawing the svg elements based on the data points that
     * can be shown
     * @abstract
     * @function GraphContent#redraw
     * @throws {module:errors.THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED}
     * @param {Object} graph - Graph instance
     * @returns {undefined} - returns nothing
     */
    redraw(graph) {
        throw errors.THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED;
    }
}
