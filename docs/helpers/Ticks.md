# Ticks

Ticks and Grid lines representing Axes values.

-   [Ticks](#ticks)
    -   [Overview](#overview)
    -   [JSON Properties](#json-properties)
        -   [Required](#required)
        -   [Optional](#optional)
        -   [Constraints](#constraints)
        -   [Example](#example)
            -   [Values example](#values-example)
            -   [Datetime Buckets example](#datetime-buckets-example)
                -   [Use Case](#use-case)
    -   [Tick Values](#tick-values)

## Overview

Ticks are labels on the Axes to represent axis values. These values are determined by the upper and lower limits of its axis. If any datapoints on the graph exceed the upper or lower limits, the axis range will adjust accordingly and the tick labels will be updated.

If there is only 1 axis in the graph, the tick intervals are calculated automatically using the d3.js `nice` function. If the Y2 axis is visible, the tick intervals are set based on the range of the Y & Y2 axes. This can be overridden to be custom using the `ticksCount` property in the graph configuration object. Acceptable values for `ticksCount` are `0 - 19`. Invalid values will result in `ticksCount` being ignored and going back to the default behavior.

## JSON Properties

#### Required

| Property Name | Expected | Description                                                                                                                                       |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| values        | array    | Ticks values in the axis. Each tick will have an associated grid line. If they are not provided, optional tick values need to exist.              |
| format        | string   | [Formatter](https://github.com/d3/d3-time-format/blob/master/README.md#locales) for tick values. `Note:` This is mandatory if values are provided |

#### Optional

| Property Name       | Expected | Default | Description                                                                                                                                                                                                                            |
| ------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lowerStepTickValues | array    | []      | Lower-Tick-Values in the axis. Each tick will have an associated grid line. When lowerTickValues are present, values are disregarded. Lighter gray shade when compared to others.                                                      |
| midpointTickValues  | array    | []      | Mid-Tick-Values in the axis. Each tick will have an associated grid line. Darker when compared to lowerTickValues. Uses the default coloring of values, if none of the lowerTickValues, midTickValues and upperTickValues are provided |
| upperStepTickValues | array    | []      | Upper-Tick-Values in the axis. Each tick will have an associated grid line. Much thicker and darker when compared with lowerTickValues, midTickValues and values axis.                                                                 |

#### Constraints

-   When both `lowerStepTickValues` and `values` properties are provided, preference is given to the former and we disregard `values`.
-   When using `values`/`lowerStepTickValues` and one of the following: `midpointTickValues`, `upperStepTickValues` it is the consumers' responsibility to ensure that the datetime values provided do not overlap with each other.
-   `midpointTickValues` do not have an associated tick label on the X Axis. They are supposed to denote a separation between Lower Step and Upper Step or consecutive Lower Steps/Upper Steps.

#### Example

##### Values example

```javascript
var axis = {
    lowerLimit: new Date(2018, 1, 1, 23).toISOString(),
    upperLimit: new Date(2018, 1, 3, 1).toISOString(),
    x: {
        ticks: {
            format: "%H",
            values: [
                new Date(2018, 1, 2, 6).toISOString(),
                new Date(2018, 1, 2, 12).toISOString(),
                new Date(2018, 1, 2, 18).toISOString()
            ]
        },
        show: true
    },
    y: {
        show: true
    }
};
```

##### Datetime Buckets example

###### Use Case

**Note:** Usage of datetime buckets are very use case specific. One such use case is described below:

-   `lowerStepTickValues` represent the time frame for every 6 hours -> ["6:00", "12:00", "18:00"]
-   `upperStepTickValues` represent the time frame for each day -> ["Aug 5th, 00:00", "Aug 6th, 00:00"]
-   `midpointTickValues` represent the time frame which are in between -> ["3:00", "9:00", "15:00", "21:00"]

```javascript
var axis = {
    lowerLimit: new Date(2018, 1, 1, 23).toISOString(),
    upperLimit: new Date(2018, 1, 3, 1).toISOString(),
    x: {
        ticks: {
            format: "%H",
            lowerStepTickValues: [
                new Date(2018, 1, 2, 6).toISOString(),
                new Date(2018, 1, 2, 12).toISOString(),
                new Date(2018, 1, 2, 18).toISOString()
            ],
            midpointTickValues: [
                new Date(2018, 1, 2, 3).toISOString(),
                new Date(2018, 1, 2, 9).toISOString(),
                new Date(2018, 1, 2, 15).toISOString(),
                new Date(2018, 1, 2, 21).toISOString()
            ],
            upperStepTickValues: [
                new Date(2018, 1, 2, 0).toISOString(),
                new Date(2018, 1, 2, 24).toISOString()
            ]
        },
        show: true
    },
    y: {
        show: true
    }
};
```

## Tick Values

The tick values are set one of 3 methods, in the following priority:

-   **Consumer provided values**:

    Consumer provided values in `axis.y.ticks.values` and `axis.y2.ticks.values` will take priority if provided.

-   **ticksCount property**

    If no values are provided and the ticksCount property is set, then it will be used to calculate tick values by dividing `upperLimit - lowerLimit` into `ticksCount + 1` equal divisions. 
    
    If ticksCount is an invalid value, such as greater than `TICKSCOUNT_MAXLIMIT`, then this property will be ignored and the default behavior will be used.

    If `axis.y.ticks.values` AND `ticksCount` are both provided, then `ticksCount` will be ignored in favor of the custom values.

-   **Default**

    If the Y2 Axis is visible, then the default behavior will calculate and use a ticksCount value based on the ranges of Y and Y2.

    If there is no Y2 axis, the Carbon will use D3.js to automatically find the tick values.
