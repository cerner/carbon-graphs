# Line

A native line graph using d3 based on standard design patterns.

-   [Line](#line)
    -   [Usage](#usage)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Required](#required)
            -   [Optional](#optional)
        -   [Data](#data)
            -   [Required](#required-1)
            -   [Optional](#optional-1)
        -   [Dimension](#dimension)
            -   [Required](#required-2)
            -   [Optional](#optional-2)
        -   [Values](#values)
            -   [Required](#required-3)
            -   [Optional](#optional-3)
        -   [Regions](#regions)
            -   [Required](#required-4)
            -   [Optional](#optional-4)
        -   [Constraints](#constraints)
        -   [Structure](#structure)

## Usage

```javascript
var lineDefault = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
lineDefault.loadContent(
    Carbon.api.line(/* Add "data" JSON, shown below for example */)
);
```

For loading multiple data sets, you can load as additional content:

```javascript
var lineDefault = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
lineDefault.loadContent(Carbon.api.line(/* Data array A */));
lineDefault.loadContent(Carbon.api.line(/* Data array B */));
lineDefault.loadContent(Carbon.api.line(/* Data array C */));
lineDefault.loadContent(Carbon.api.line(/* Data array D */));
```

## JSON Properties

### Root

#### Required

| Property Name | Expected | Description                      |
| ------------- | -------- | -------------------------------- |
| bindTo        | string   | DOM id to bind the graph into    |
| axis          | object   | Refer [Axis](../helpers/Axes.md) |
| data          | array    | Refer [Data](#data)              |

#### Optional

| Property Name | Expected | Default                 | Description                                                                          |
| ------------- | -------- | ----------------------- | ------------------------------------------------------------------------------------ |
| bindLegendTo  | string   | null                    | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`) |
| locale        | object   | LOCALE.en_US            | Locale object for X-Axis tick values                                                 |
| dimension     | object   | {}                      | Refer [Dimension](#dimension)                                                        |
| throttle      | number   | (1000/60) => time in ms | Delay between resize of a browser window                                             |
| showLabel     | boolean  | true                    | Toggle to show axes labels                                                           |
| showLegend    | boolean  | true                    | Toggle to show graph legend                                                          |
| showShapes    | boolean  | true                    | Toggle to show shapes in the line graph                                              |
| showVGrid     | boolean  | true                    | Toggle to show vertical grid                                                         |
| showHGrid     | boolean  | true                    | Toggle to show horizontal grid                                                       |

### Data

#### Required

| Property Name | Expected | Description                             |
| ------------- | -------- | --------------------------------------- |
| key           | string   | Unique id which represents the data set |
| values        | Array    | [Values](#values)                       |

#### Optional

| Property Name | Expected | Default          | Description                                                           |
| ------------- | -------- | ---------------- | --------------------------------------------------------------------- |
| yAxis         | string   | "y"              | Setting for using different Y based axis. For now: its either Y or Y2 |
| type          | string   | LINE_TYPE.LINEAR | Nature of line that needs to be drawn (Linear or Cardinal)            |
| regions       | array    | []               | Refer [Regions](#regions)                                             |
| label         | object   | {}               | Display value for the data set which the data points belong to        |
| color         | string   | COLORS.BLACK     | Color for the data point and line                                     |
| shape         | string   | SHAPES.CIRCLE    | Shape for representing the data points                                |
| onClick       | Function | null             | Any action that can be performed when clicking on the data point      |

### Dimension

#### Required

`N/A`

#### Optional

| Property Name | Expected | Default | Description                           |
| ------------- | -------- | ------- | ------------------------------------- |
| height        | number   | 250     | Sets the height for the graph content |

### Values

#### Required

| Property Name | Expected | Description                                |
| ------------- | -------- | ------------------------------------------ |
| x             | string   | Co-ordinate x, for plotting the data point |
| y             | string   | Co-ordinate y, for plotting the data point |

#### Optional

| Property Name | Expected | Default | Description                                                |
| ------------- | -------- | ------- | ---------------------------------------------------------- |
| isCritical    | boolean  | `false` | Shows an indicator surrounding the data point when enabled |

### Regions

Each data-set can have 1 or more regions. `start` and `end` is necessary for rendering a horizontal area.

#### Required

| Property Name | Expected | Description         |
| ------------- | -------- | ------------------- |
| start         | number   | Start of the region |
| end           | number   | End of the region   |

#### Optional

| Property Name | Expected | Default                                                            | Description                           |
| ------------- | -------- | ------------------------------------------------------------------ | ------------------------------------- |
| axis          | string   | "y"                                                                | Defines which axis if represents from |
| color         | string   | ![#f4f4f4](https://placehold.it/15/f4f4f4/000000?text=+) `#f4f4f4` | Default color of the region area      |

### Constraints

-   If data-set `label` display is not provided then the legend item will not be shown as well

### Structure

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
var data = {
    key: "uid_1",
    label: {
        display: "Data Label 1"
    },
    regions: [
        {
            axis: "y",
            start: 2,
            end: 10,
            color: "#f4f4f4"
        }
    ],
    shape: Carbon.helpers.SHAPES.SQUARE,
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, index, value) => {
        //onCloseCB needs to called by the consumer after popup is closed;
        //This is so that graphing api can remove the selected indicator from data point
    },
    values: [
        {
            x: "2016-02-03T12:00:00Z",
            y: "1"
        },
        {
            x: "2016-05-01T12:00:00Z",
            y: "15",
            isCritical: true
        }
    ]
};
```
