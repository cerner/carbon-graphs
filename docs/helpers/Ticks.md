# Ticks

Ticks and Grid lines representing Axes values.

-   [Ticks](#ticks)
    -   [JSON Properties](#json-properties)
        -   [Required](#required)
        -   [Optional](#optional)
        -   [Constraints](#constraints)
        -   [Example](#example)
            -   [Values example](#values-example)
            -   [Datetime Buckets example](#datetime-buckets-example)
                -   [Use Case](#use-case)

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
