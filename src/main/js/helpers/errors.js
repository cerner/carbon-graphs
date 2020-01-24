/**
 * @file
 * Error constants dictionary.
 * @module errors
 * @alias module:errors
 */

/**
 * @enum {string}
 */
export default {
    /**
     * @description Construct
     */
    THROW_MSG_CONSTRUCT_GENERATE_NOT_IMPLEMENTED:
        "Generate function not implemented from Construct.",
    THROW_MSG_CONSTRUCT_LOAD_NOT_IMPLEMENTED:
        "LoadContent function not implemented from Construct.",
    THROW_MSG_CONSTRUCT_UNLOAD_NOT_IMPLEMENTED:
        "UnloadContent function not implemented from Construct.",
    THROW_MSG_CONSTRUCT_RESIZE_NOT_IMPLEMENTED:
        "Resize function not implemented from Construct.",
    THROW_MSG_CONSTRUCT_DESTROY_NOT_IMPLEMENTED:
        "Destroy function not implemented from Construct.",
    /**
     * @description Shapes
     */
    THROW_MSG_SHAPE_PATH_EMPTY: "Shape Path property cannot be empty.",
    THROW_MSG_SHAPE_OPTIONS_EMPTY: "Shape Options property cannot be empty.",
    THROW_MSG_SHAPE_OPTIONS_PROPERTY_INVALID:
        "Invalid Shape Options property attributes (x, y, scale).",
    /**
     * @description Graph
     */
    THROW_MSG_INVALID_INPUT: "Invalid input provided.",
    THROW_MSG_NO_BIND: "Invalid input format, graph DOM id must be provided.",
    THROW_MSG_NO_AXES_DATA_LOADED: "Graph axes data needs to be loaded.",
    THROW_MSG_NO_DATA_LOADED: "Graph data needs to be loaded.",
    THROW_MSG_INVALID_CALLBACK_FUNCTION: "Argument needs to be a function.",
    THROW_MSG_NO_DATA_POINTS:
        "Invalid input format, data points must be provided.",
    THROW_MSG_INVALID_DATA_PROPERTY:
        "Invalid input format, all data object properties must be provided.",
    THROW_MSG_NON_UNIQUE_PROPERTY:
        "Invalid input format, label and key must be unique.",
    THROW_MSG_UNIQUE_KEY_NOT_PROVIDED:
        "Invalid input format, unique key must be provided.",
    THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED:
        "Invalid input format, unique label must be provided.",
    THROW_MSG_NO_CONTENT_DATA_LOADED: "Content data needs to be loaded.",
    /**
     * @description Axes
     */
    THROW_MSG_NO_AXIS_INFO: "Invalid input format, axis must be provided.",
    THROW_MSG_NO_AXIS_LIMIT_INFO:
        "Invalid input format, axis limits must be provided.",
    THROW_MSG_NO_AXIS_LABEL_INFO:
        "Invalid input format, axis labels must be provided.",
    THROW_MSG_INVALID_TYPE: "Invalid input format, type must be valid.",
    THROW_MSG_INVALID_AXIS_TYPE_VALUES:
        "Axis type invalid, bounds need to be in ISO8601 datetime format.",
    THROW_MSG_INVALID_FORMAT_TYPE:
        "Type cannot be default, if data-points are in date time format.",
    THROW_MSG_INVALID_OBJECT_PROVIDED: "Invalid object provided as argument.",
    /**
     * @description Content
     */
    THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED:
        "Load function has not been implemented for this graph type.",
    THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED:
        "Unload function has not been implemented for this graph type.",
    THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED:
        "Resize function has not been implemented for this graph type.",
    THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED:
        "Redraw function has not been implemented for this graph type.",
    THROW_MSG_CONFIG_GET_CONFIG_NOT_IMPLEMENTED:
        "GetInput not been implemented for BaseConfig.",
    THROW_MSG_CONFIG_SET_INPUT_NOT_IMPLEMENTED:
        "SetInput not been implemented for BaseConfig.",
    THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED:
        "Input validation has not been implemented.",
    THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED:
        "Clone input function has not been implemented.",
    THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX:
        "Invalid input provided. Content cannot be loaded at index less than zero.",
    /**
     * @description Region
     */
    THROW_MSG_REGION_EMPTY: "Region in data object cannot be empty.",
    THROW_MSG_REGION_INVALID_AXIS_PROVIDED: "Region axis provided is invalid.",
    THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED:
        "Region 'start' and 'end' value has invalid type.",
    THROW_MSG_REGION_START_END_MISSING:
        "Region cannot have both 'start' and 'end' empty.",
    THROW_MSG_REGION_START_MORE_END:
        "Region 'start' cannot be larger than 'end'.",
    /**
     * @description Tasks
     */
    THROW_MSG_TASKS_NOT_PROVIDED:
        "Invalid input format, task(s) must be provided for a track.",
    THROW_MSG_TASKS_UNIQUE_KEY_NOT_PROVIDED:
        "Invalid input format; unique key must be provided for each task.",
    THROW_MSG_TASKS_START_AND_END_NOT_PROVIDED:
        "Invalid input format; both start date and end date cannot be empty.",
    THROW_MSG_TASKS_DURATION_NOT_PROVIDED:
        "Invalid input format; start date or end date cannot be empty for a task. No duration function provided.",
    THROW_MSG_TASKS_START_AND_END_TYPE_NOT_VALID:
        "Input type invalid, start date and end date needs to be in ISO8601 datetime format.",
    THROW_MSG_TASKS_START_MORE_END:
        "Input input format; start date cannot be larger than end date.",
    THROW_MSG_TASKS_DURATION_NOT_FUNCTION:
        "Invalid property: duration; Duration needs to be a function.",
    THROW_MSG_TASKS_DURATION_NOT_VALID:
        "Invalid property: duration; Duration needs to return a number.",

    /**
     * @description Activities
     */
    THROW_MSG_ACTIVITIES_NOT_PROVIDED:
        "Invalid input format, task(s) must be provided for a track.",
    THROW_MSG_ACTIVITIES_UNIQUE_KEY_NOT_PROVIDED:
        "Invalid input format; unique key must be provided for each task.",
    THROW_MSG_ACTIVITIES_START_AND_END_NOT_PROVIDED:
        "Invalid input format; both start date and end date cannot be empty.",
    THROW_MSG_ACTIVITIES_DURATION_NOT_PROVIDED:
        "Invalid input format; start date or end date cannot be empty for a task. No duration function provided.",
    THROW_MSG_ACTIVITIES_START_AND_END_TYPE_NOT_VALID:
        "Input type invalid, start date and end date needs to be in ISO8601 datetime format.",
    THROW_MSG_ACTIVITIES_START_MORE_END:
        "Input input format; start date cannot be larger than end date.",
    THROW_MSG_ACTIVITIES_DURATION_NOT_FUNCTION:
        "Invalid property: duration; Duration needs to be a function.",
    THROW_MSG_ACTIVITIES_DURATION_NOT_VALID:
        "Invalid property: duration; Duration needs to return a number.",
    /**
     * @description Actions
     */
    THROW_MSG_UNIQUE_ACTION_KEY_NOT_PROVIDED:
        "Invalid property, a valid unique action key must be provided matching the legend key.",
    /**
     * @description Dateline
     */
    THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED:
        "Invalid property, a valid dateline object must be provided.",
    THROW_MSG_DATELINE_NOT_PROVIDED:
        "Invalid property, a valid dateline value must be provided.",
    THROW_MSG_DATELINE_TYPE_NOT_VALID:
        "Invalid property, dateline value type must be in ISO8601 datetime format.",
    THROW_MSG_DATELINE_COLOR_NOT_PROVIDED:
        "Invalid property, a valid dateline color value must be provided.",
    THROW_MSG_DATELINE_SHAPE_NOT_PROVIDED:
        "Invalid property, a valid dateline shape value must be provided.",
    /**
     * @description Eventline
     */
    THROW_MSG_EVENTLINE_OBJECT_NOT_PROVIDED:
        "Invalid property, a valid eventline object must be provided.",
    THROW_MSG_EVENTLINE_NOT_PROVIDED:
        "Invalid property, a valid eventline value must be provided.",
    THROW_MSG_EVENTLINE_TYPE_NOT_VALID:
        "Invalid property, eventline value type must be in ISO8601 datetime format.",
    THROW_MSG_EVENTLINE_COLOR_NOT_PROVIDED:
        "Invalid property, a valid eventline color value must be provided.",
    /**
     * @description Bar
     */
    THROW_MSG_INVALID_X_AXIS_TICK_VALUES:
        "Invalid X Axis, tick values are required for Bar graph content.",
    THROW_MSG_EMPTY_X_AXIS_TICK_VALUES:
        "Invalid X Axis, tick values cannot be empty.",
    THROW_MSG_BAR_REGION_EMPTY_X_VALUE:
        "Region for Bar graph content cannot have 'x' value empty.",
    THROW_MSG_INVALID_REGION_X_AXIS_TICK:
        "Invalid X Axis, tick values are required for Bar region.",
    THROW_MSG_REGION_INVALID_FORMAT:
        "Region x type for bar graph cannot be default, if data-points are in date time format.",
    THROW_MSG_AXIS_INFO_ROW_EMPTY_TICK_VALUES:
        "Invalid X Axis Info Row, tick info values are required.",
    THROW_MSG_AXIS_INFO_ROW_INVALID_TICK_VALUES:
        "Invalid X Axis Info Row, tick info values should match with X Axis tick values.",
    THROW_MSG_AXIS_INFO_ROW_VALUE_NOT_PROVIDED:
        "Invalid X Axis Info Row input format, value property must be provided.",
    THROW_MSG_AXIS_INFO_ROW_LABEL_DISPLAY_NOT_PROVIDED:
        "Invalid X Axis Info Row input format, display must be provided for label property.",
    /**
     * @description Legend
     */
    THROW_MSG_LEGEND_LABEL_NOT_PROVIDED:
        "Invalid property, a valid label object with a valid string must be provided.",
    THROW_MSG_LEGEND_LABEL_FORMAT_NOT_PROVIDED:
        "Invalid property, a valid label.format callback function property must be provided."
};
