# Axes

Any graph that inherits from `Graph` API will inherit the following `Axis` and `Tick` properties as well.

-   [Axes](#axes)
    -   [JSON Properties](#json-properties)
        -   [Required](#required)
        -   [Optional](#optional)
    -   [AXIS_TYPE](#axis_type)
    -   [AXES_ORIENTATION](#axes_orientation)

## JSON Properties

### Required

| Property Name | Expected | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| lowerLimit    | string   | Upper bound for the axis. This is inclusive                   |
| upperLimit    | string   | Lower bound for the axis. This is inclusive                   |
| label         | string   | Axis label value. Will not be rendered if nothing is provided |

**Note:**

-   y2 axis is mandatory if the **y2.show** is enabled
-   Ticks are mandatory for Bar graphs

### Optional

Each axis - X, Y and Y2 should have the following properties:

| Property Name | Expected | Default           | Description                       |
| ------------- | -------- | ----------------- | --------------------------------- |
| type          | string   | AXIS_TYPE.DEFAULT | Normal number value or time-based |
| show          | boolean  | true              | Toggle for showing the axis       |
| ticks         | object   | null              | Refer [Ticks](Ticks.md)           |

## AXIS_TYPE

Consumers can pick axes tick type from default list. DEFAULT is enabled by default. This represents number based axes.
TIMESERIES is time based axes. For now it only reflects on X-Axis

| Constant    | Value                   |
| ----------- | ----------------------- |
| DEFAULT     | Numeric based X-axis    |
| TIME_SERIES | Timeseries based X-axis |

## AXES_ORIENTATION

Sets the orientation for Axes (X-Axis for now, for Right orientation use Y2 axis).

| Constant | Value       |
| -------- | ----------- |
| X        | TOP, BOTTOM |
| Y        | LEFT, RIGHT |
