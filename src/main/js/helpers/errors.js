/**
 * @fileOverview
 * Error constants dictionary.
 * @module errors
 * @alias module:errors
 */

/**
 * @enum {String}
 */
export default {
    THROW_MSG_UNKNOWN_SHAPE: "Unknown shape type provided for data point",
    THROW_MSG_NO_BIND: "Invalid input format, graph DOM id must be provided.",
    THROW_MSG_NO_AXES_DATA_LOADED: "Graph axes data needs to be loaded.",
    THROW_MSG_NO_DATA_LOADED: "Graph data needs to be loaded.",
    THROW_MSG_INVALID_CALLBACK_FUNCTION: "Argument needs to be a function.",
    THROW_MSG_NO_DATA_POINTS: "Invalid input format, data points must be provided.",
    THROW_MSG_INVALID_DATA_PROPERTY: "Invalid input format, all data object properties must be provided.",
    THROW_MSG_NON_UNIQUE_KEY: "Invalid input format, key must be unique.",
    THROW_MSG_NO_AXIS_INFO: "Invalid input format, axis must be provided.",
    THROW_MSG_NO_AXIS_LIMIT_INFO: "Invalid input format, axis limits must be provided.",
    THROW_MSG_NO_AXIS_LABEL_INFO: "Invalid input format, axis labels must be provided.",
    THROW_MSG_INVALID_TYPE: "Invalid input format, type must be valid.",
    THROW_MSG_INVALID_FORMAT_TYPE: "Type cannot be default, if data-points are in date time format.",
    THROW_MSG_INVALID_OBJECT_PROVIDED: "Invalid object provided as argument.",
    THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED: "Load function has not been implemented for this graph type.",
    THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED: "Unload function has not been implemented for this graph type.",
    THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED: "Resize function has not been implemented for this graph type.",
    THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED: "Redraw function has not been implemented for this graph type.",
    THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED: "Input validation has not been implemented.",
    THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED: "Clone input function has not been implemented.",
    THROW_MSG_REGION_EMPTY: "Region in data object cannot be empty.",
    THROW_MSG_REGION_INVALID_AXIS_PROVIDED: "Region axis provided is invalid.",
    THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED: "Region 'start' and 'end' value has invalid type.",
    THROW_MSG_REGION_START_END_MISSING: "Region cannot have both 'start' and 'end' empty.",
    THROW_MSG_REGION_START_MORE_END: "Region 'start' cannot be larger than 'end'."
};
