# Axes

Any graph that inherits from `Graph` API will inherit the following `Axis` and `Tick` properties as well.

-   [Axes](#axes)
    -   [JSON Properties](#json-properties)
        -   [Required](#required)
        -   [Optional](#optional)
            -   [Constraints](#constraints)
    -   [AXIS_TYPE](#axistype)
    -   [AXES_ORIENTATION](#axesorientation)
    -   [X Axis Domain Padding](#x-axis-domain-padding)

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

| Property Name         | Expected | Default           | Description                                                                                                                                                                                                                                                         |
| --------------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| padDomain             | boolean  | true              | Toggle for disabling the padding (only for Y and Y2 axes)                                                                                                                                                                                                           |
| rangeRounding         | boolean  | true              | Toggle for range rounding                                                                                                                                                                                                                                           |
| show                  | boolean  | true              | Toggle for showing the axis                                                                                                                                                                                                                                         |
| suppressTrailingZeros | boolean  | false             | Toggle to suppress tick values's trailing zeros when default d3 tick formatting is used. For X axis, this property works only when X axis type is set to AXIS_TYPE.DEFAULT. Specifying ~ in the tick format takes precedence over `suppressTrailingZeros` property. |
| ticks                 | object   | null              | Refer [Ticks](Ticks.md)                                                                                                                                                                                                                                             |
| type                  | string   | AXIS_TYPE.DEFAULT | Normal number value or time-based                                                                                                                                                                                                                                   |

**Note:**

-   `rangeRounding` property extends the domain so that it starts and ends on nice round values. This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value
-   `padDomain` property is only for Y and Y2 axes.

#### Constraints

-   For Bar Graphs, `padDomain` property will be overridden to false.

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

## X Axis Domain Padding

Unlike Y Axis, X Axis can have different types of values as ticks namely numeric, datetime etc. By design, domain padding has not been provided for this reason. Consumers however who are more acquainted with their dataset can judge how much value padding is necessary and achieve similar results as Y Axis.

Example:

```js
const padXAxisLimits = (extent) => {
    const range = extent[1] - extent[0];
    return [extent[0] - range * 0.05, extent[1] + range * 0.05];
};

const datetime = padXAxisLimits(
    d3.extent([
        /* Array containing all the datetime in RFC3339 format*/
    ])
);
```
