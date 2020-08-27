# Graph

Graph is a set of graphs that share a common set of base visualization structure. These include:

-   X Axis
-   Y Axis
-   Vertical Grid
-   Horizontal Grid
-   X Axis labels
-   Y Axis labels
-   Legend

-   [Graph](#Graph)
    -   [Root](#root)
        -   [Required](#required)
        -   [Optional](#optional)
    -   [Dimension](#dimension)
        -   [Required](#required-1)
        -   [Optional](#optional-1)
    -   [Structure](#structure)

## Root

### Required

| Property Name | Expected | Description                                                                                                                                    |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| bindTo        | string   | DOM id to bind the graph into                                                                                                                  |
| axis          | object   | Refer [Axis](../helpers/Axes.md)                                                                                                               |
| data          | array    | Refer respective graph content `data` section. This is _not_ an actual object property rather this is provided as a parameter to `loadContent` |

### Optional

| Property Name          | Expected | Default                                        | Description                                                                                                                                                                                 |
| ---------------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| allowCalibration       | boolean  | true                                           | Toggle to allow calibration to adjust the y axis                                                                                                                                            |
| bindLegendTo           | string   | null                                           | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`)                                                                                                        |
| dateline               | array    | []                                             | Refer [Dateline](../helpers/Dateline.md)                                                                                                                                                    |
| dimension              | object   | {}                                             | Refer [Dimension](#dimension)                                                                                                                                                               |
| legendPadding          | object   | `{ top: 4, bottom: 4, left: 8, right: 8 }`     | Sets the legend padding and removes the carbon default margin of 8px around legend                                                                                                          |
| locale                 | object   | LOCALE.en_US                                   | Locale object for X-Axis tick values                                                                                                                                                        |
| opaqueBackground       | false    | false                                          | Toggle between a transparent or White background for the container                                                                                                                          |
| padding                | object   | `{ top: 10, bottom: 10, left: 30, right: 50 }` | Refer [Padding](../controls/Padding.md)                                                                                                                                                     |
| pan                    | object   | {}                                             | Refer [Panning](../controls/Panning.md)                                                                                                                                                     |
| removeContainerPadding | boolean  | false                                          | Toggle to remove carbon container top and bottom padding                                                                                                                                    |
| showHGrid              | boolean  | true                                           | Toggle to show horizontal grid                                                                                                                                                              |
| showLabel              | boolean  | true                                           | Toggle to show axes labels                                                                                                                                                                  |
| showLegend             | boolean  | true                                           | Toggle to show graph legend                                                                                                                                                                 |
| showNoDataText         | boolean  | true                                           | Toggle to show no data text                                                                                                                                                                 |
| showShapes             | boolean  | true                                           | Toggle to show shapes in the line graph                                                                                                                                                     |
| showVGrid              | boolean  | true                                           | Toggle to show vertical grid                                                                                                                                                                |
| ticksCount             | number   | 3-7 depending on the input range               | Number of ticks (0-19) to show on the vertical axes, excluding the upper and lower limits, if not provided, the number of ticks will be set to a value from 3-7, based on the Y & Y2 range. |
| throttle               | number   | (1000/60) => time in ms                        | Delay between resize of a browser window                                                                                                                                                    |

## Dimension

### Required

`N/A`

### Optional

| Property Name | Expected | Default | Description                           |
| ------------- | -------- | ------- | ------------------------------------- |
| height        | number   | 250     | Sets the height for the graph content |

## Structure

```javascript
var input = {
    bindTo: "#root",
    axis: {
        x: {
            type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
            label: "Some X Label",
            lowerLimit: "2016-01-01T12:00:00Z",
            upperLimit: "2017-01-01T12:00:00Z"
        },
        y: {
            label: "Some Y Label",
            lowerLimit: 0,
            upperLimit: 20
        },
        y2: {
            show: false,
            label: "Some Y2 Label",
            lowerLimit: 0,
            upperLimit: 250
        }
    },
    showLabel: true,
    showLegend: true,
    showShapes: true,
    showVGrid: true,
    showHGrid: true
};
```
