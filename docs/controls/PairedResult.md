# Paired Result

A native paired result graph, representing a pair of result with an optional median value. A `pair` can be
represented in any co-ordinate on a graph. Most common pattern used is charting a Blood Pressure graph where
the `pair` - High, low, mid are vertical data points connected by a vertical line.

## Usage

```javascript
var pairedGraph = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
pairedGraph.loadContent(
    Carbon.api.pairedResult(/* Add "data" JSON, shown below for example */)
);
```

## JSON Properties

### Root

#### Required

| Property Name | Expected | Description                   |
| ------------- | -------- | ----------------------------- |
| bindTo        | string   | DOM id to bind the graph into |
| axis          | object   | Refer [Axis](#axis)           |
| data          | array    | Refer [Data](#data)           |

#### Optional

| Property Name | Expected | Default                 | Description                                                                          |
| ------------- | -------- | ----------------------- | ------------------------------------------------------------------------------------ |
| bindLegendTo  | string   | null                    | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`) |
| locale        | object   | LOCALE.en_US            | Locale object for X-Axis tick values                                                 |
| dimension     | object   | {}                      | Refer [Dimension](#dimension)                                                        |
| throttle      | number   | (1000/60) => time in ms | Delay between resize of a browser window                                             |
| showLabel     | boolean  | true                    | Toggle to show axes labels                                                           |
| showLegend    | boolean  | true                    | Toggle to show graph legend                                                          |
| showVGrid     | boolean  | true                    | Toggle to show vertical grid                                                         |
| showHGrid     | boolean  | true                    | Toggle to show horizontal grid                                                       |

### Axis

#### Required

| Property Name | Expected | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| lowerLimit    | string   | Upper bound for the axis. This is inclusive                   |
| upperLimit    | string   | Lower bound for the axis. This is inclusive                   |
| label         | string   | Axis label value. Will not be rendered if nothing is provided |

#### Optional

Each axis - X, Y and Y2 should have the following properties:

| Property Name | Expected | Default           | Description                       |
| ------------- | -------- | ----------------- | --------------------------------- |
| type          | string   | AXIS_TYPE.DEFAULT | Normal number value or time-based |
| show          | boolean  | true              | Toggle for showing the axis       |
| ticks         | object   | null              | Refer [Ticks](#ticks)             |

`Note` _y2 axis is mandatory if the **y2.show** is enabled_

### Ticks

#### Required

`N/A`

#### Optional

| Property Name | Expected | Default | Description                                                                                                                                       |
| ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| format        | string   | ""      | [Formatter](https://github.com/d3/d3-time-format/blob/master/README.md#locales) for tick values. `Note:` This is mandatory if values are provided |
| values        | array    | []      | Ticks values in the axis. Each tick will have an associated grid line                                                                             |

### Data

#### Required

| Property Name | Expected | Description                             |
| ------------- | -------- | --------------------------------------- |
| key           | string   | Unique id which represents the data set |
| values        | Array    | [Values](#values)                       |

#### Optional

| Property Name | Expected | Default       | Description                                                           |
| ------------- | -------- | ------------- | --------------------------------------------------------------------- |
| yAxis         | string   | "y"           | Setting for using different Y based axis. For now: its either Y or Y2 |
| regions       | object   | {}            | Refer [Regions](#regions)                                             |
| label         | object   | {}            | Display value for the data set which the data points belong to        |
| color         | string   | COLORS.BLACK  | Color for the data point                                              |
| shape         | string   | SHAPES.CIRCLE | Shape for representing the data points                                |
| onClick       | Function | null          | Any action that can be performed when clicking on the data point      |

### Dimension

#### Required

`N/A`

#### Optional

| Property Name | Expected | Default | Description                           |
| ------------- | -------- | ------- | ------------------------------------- |
| height        | number   | 250     | Sets the height for the graph content |

### Values

#### Required

| Property Name | Expected | Value                                | Description                    |
| ------------- | -------- | ------------------------------------ | ------------------------------ |
| high          | object   | _{x: "", y: "", isCritical: `true`}_ | Data point co-ordinate x and y |
| low           | object   | _{x: "", y: "", isCritical: `true`}_ | Data point co-ordinate x and y |

#### Optional

| Property Name | Expected | Value                                | Description                    |
| ------------- | -------- | ------------------------------------ | ------------------------------ |
| mid           | object   | _{x: "", y: "", isCritical: `true`}_ | Data point co-ordinate x and y |

`Note:`

*   `isCritical` toggle is disabled by default
*   When `isCritical` toggle is enabled, an indicator will be shown surrounding the data point

### Regions

Draws a Horizontal area along the X-Axis

*   Each data-set can have 1 or more regions for `high`, `low` and/or `mid`
*   Each pair type mentioned above needs to have a `start` and `end`

#### Required

| Property Name | Expected | Value                              | Description                   |
| ------------- | -------- | ---------------------------------- | ----------------------------- |
| high          | object   | _{start: `number`, end: `number`}_ | Start and end `@type: number` |
| low           | object   | _{start: `number`, end: `number`}_ | Start and end `@type: number` |

#### Optional

| Property Name | Expected | Value                              | Description                   |
| ------------- | -------- | ---------------------------------- | ----------------------------- |
| mid           | object   | _{start: `number`, end: `number`}_ | Start and end `@type: number` |

#### Optional type properties

| Property Name | Expected | Default                                                            | Description                           |
| ------------- | -------- | ------------------------------------------------------------------ | ------------------------------------- |
| axis          | string   | "y"                                                                | Defines which axis if represents from |
| color         | string   | ![#f4f4f4](https://placehold.it/15/f4f4f4/000000?text=+) `#f4f4f4` | Default color of the region area      |

### Constraints

*   If data-set `label` display is not provided for `high`, `low` and `mid`, the legend item will not be shown as well

### Structure

```javascript
var input = {
    bindTo: id,
    axis: {
        x: {
            label: "Some X Label",
            lowerLimit: 0,
            upperLimit: 1000
        },
        y: {
            label: "Some Y Label",
            lowerLimit: 0,
            upperLimit: 200
        }
    },
    showLabel: true,
    showLegend: true,
    showVGrid: true,
    showHGrid: true
};
var data = {
    key: "uid_1",
    regions: {
        high: [
            {
                axis: "y",
                start: 120,
                end: 170,
                color: "#c8cacb"
            }
        ],
        low: [
            {
                axis: "y",
                start: 20,
                end: 100
            }
        ]
    },
    onClick: (onCloseCB, key, index, value) => {
        // onCloseCB needs to called by the consumer after popup is closed;
        // This is so that graphing api can remove the selected indicator from data point
    },
    values: [
        {
            high: {
                x: 20,
                y: 150,
                isCritical: true
            },
            low: {
                x: 20,
                y: 10
            },
            mid: {
                x: 20,
                y: 40
            }
        }
    ]
};
```
