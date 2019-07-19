"use strict";
import errors from "../../helpers/errors";

/**
 * The base content interface from which all graph controls can inherit.
 *
 * @interface
 * @class GraphContent
 */
export default class GraphContent {
    /**
     * Loads the input JSON for generating the graph.
     *
     * @abstract
     * @function GraphContent#load
     * @throws {module:errors.THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED}
     * @param {object} graph - Graph instance
     * @returns {object} - inherited class instance
     */
    load(graph) {
        throw new Error(errors.THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED);
    }

    /**
     * Remove the content from the chart.
     *
     * @abstract
     * @function GraphContent#unload
     * @throws {module:errors.THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED}
     * @param {object} graph - Graph instance
     * @returns {object} - inherited class instance
     */
    unload(graph) {
        throw new Error(errors.THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED);
    }

    /**
     * Resizes the graph based on window resize event.
     *
     * @abstract
     * @function GraphContent#resize
     * @throws {module:errors.THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED}
     * @param {object} graph - Graph instance
     * @returns {object} - inherited class instance
     */
    resize(graph) {
        throw new Error(errors.THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED);
    }

    /**
     * Force redraw the graph. This will be called when one of the content is removed.
     * The situation can be when a legend item was clicked.
     * The involves clearing the graph and redrawing the svg elements based on the data points that
     * can be shown
     *
     * @abstract
     * @function GraphContent#redraw
     * @throws {module:errors.THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED}
     * @param {object} graph - Graph instance
     * @returns {object} - inherited class instance
     */
    redraw(graph) {
        throw new Error(errors.THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED);
    }
}
