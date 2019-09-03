# GraphAPI

GraphAPI is a set of graphs that share a common set of base visualization structure. These include:

-   X Axis
-   Y Axis
-   Vertical Grid
-   Horizontal Grid
-   X Axis labels
-   Y Axis labels
-   Legend

-   [GraphAPI](#graphapi)
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

| Property Name  | Expected | Default                                       | Description                                                                          |
| -------------- | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| bindLegendTo   | string   | null                                          | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`) |
| locale         | object   | LOCALE.en_US                                  | Locale object for X-Axis tick values                                                 |
| dimension      | object   | {}                                            | Refer [Dimension](#dimension)                                                        |
| throttle       | number   | (1000/60) => time in ms                       | Delay between resize of a browser window                                             |
| showLabel      | boolean  | true                                          | Toggle to show axes labels                                                           |
| showLegend     | boolean  | true                                          | Toggle to show graph legend                                                          |
| showShapes     | boolean  | true                                          | Toggle to show shapes in the line graph                                              |
| showVGrid      | boolean  | true                                          | Toggle to show vertical grid                                                         |
| showHGrid      | boolean  | true                                          | Toggle to show horizontal grid                                                       |
| dateline       | array    | []                                            | Refer [Dateline](../helpers/Dateline.md)                                             |
| padding        | object   | `{ top: 10, bottom: 5, left: 30, right: 50 }` | Refer [Padding](../controls/Padding.md)                                              |
| showNoDataText | boolean  | true                                          | Toggle to show no data text                                                          |

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
    bindTo: id,
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
