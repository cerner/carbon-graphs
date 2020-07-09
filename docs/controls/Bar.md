# Bar

A native bar graph using D3 based on standard design patterns.

-   [Bar](#bar)
    -   [Usage](#usage)
        -   [Structure](#structure)
            -   [Simple Bar](#simple-bar)
            -   [Negative Bar](#negative-bar)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
        -   [Data](#data)
            -   [Required](#required)
            -   [Optional](#optional)
        -   [Values](#values)
            -   [Required](#required-1)
            -   [Optional](#optional-1)
        -   [Regions](#regions)
            -   [Required](#required-2)
            -   [Optional](#optional-2)
        -   [Style](#style)
            -   [Optional](#optional-3)
        -   [Group](#group)
        -   [Axis Info Row](#axis-info-row)
            -   [Required](#required-3)
            -   [Optional](#optional-4)
            -   [Axis Info Row Value](#axis-info-row-value)
        -   [Constraints](#constraints)

## Usage

### Structure

You will **not** need all the properties in the example below.
Check out _optional_/_required_ properties explained in the [JSON Properties](#json-properties) section.

#### Simple Bar

```javascript
var root = {
    bindTo: "#root",
    axis: {
        x: {
            label: "Some X Label",
            lowerLimit: 0,
            upperLimit: 5,
            ticks: {
                values: [1, 2, 3, 4],
                format: ".0f"
            }
        },
        y: {
            label: "Some Y Label",
            lowerLimit: 0,
            upperLimit: 20
        },
        y2: {
            show: false,
            label: "Some Y2 Label",
            lowerLimit: -20,
            upperLimit: 0
        }
    },
    showLabel: true,
    showLegend: true,
    showShapes: true,
    showVGrid: true,
    showHGrid: true
};
var data = {
    key: "uid_bar_1",
    label: {
        display: "Data Label 1"
    },
    regions: [
        {
            axis: "y",
            start: 10,
            end: 10,
            x: 2
        }
    ],
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, valuesArray) => {
        //onCloseCB needs to called by the consumer after popup is closed;
        //This is so that graphing api can remove the selected indicator from data point
    },
    axisInfoRow: [
        {
            axis: "x",
            x: 1,
            value: {
                onClick: () => {},
                characterCount: 4,
                color: Carbon.helpers.COLORS.ORANGE,
                shape: {
                    path: {
                        d: "M24,0l24,24L24,48L0,24L24,0z",
                        fill: Carbon.helpers.COLORS.ORANGE
                    },
                    options: {
                        x: -6,
                        y: -6,
                        scale: 0.25
                    }
                },
                label: {
                    display: "1234567",
                    secondaryDisplay: "ICU"
                }
            }
        },
        {
            axis: "x",
            x: 2,
            value: {
                onClick: () => {},
                color: Carbon.helpers.COLORS.BLACK,
                shape: {},
                label: {
                    display: "65"
                }
            }
        }
    ],
    values: [
        {
            x: 1,
            y: 8
        },
        {
            x: 2,
            y: 15,
            style: {
                isHashed: true
            }
        },
        {
            x: 3,
            y: 8
        },
        {
            x: 4,
            y: 10
        }
    ]
};
var barDefault = Carbon.api.graph(root);
barDefault.loadContent(Carbon.api.bar(data));
```

#### Negative Bar

```javascript
var negativeData = {
    key: "uid_bar_3",
    label: {
        display: "Data Label 3"
    },

    yAxis: "y2",
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, valuesArray) => {
        //onCloseCB needs to called by the consumer after popup is closed;
        //This is so that graphing api can remove the selected indicator from data point
    },
    values: [
        {
            x: 1,
            y: -10
        },
        {
            x: 2,
            y: -5
        }
    ]
};

barDefault.loadContent(Carbon.api.bar(negativeData));
```

For loading multiple data-sets, you can load as additional content:

```javascript
var barDefault = Carbon.api.graph(/* Input JSON */);
barDefault.loadContent(Carbon.api.bar(/* Data array A */));
barDefault.loadContent(Carbon.api.bar(/* Data array B */));
barDefault.loadContent(Carbon.api.bar(/* Data array C */));
barDefault.loadContent(Carbon.api.bar(/* Data array D */));
```

## JSON Properties

### Root

Refer [Graph](../core/Graph.md) `Root` for more details.

### Data

#### Required

| Property Name | Expected | Description                                                    |
| ------------- | -------- | -------------------------------------------------------------- |
| key           | string   | Unique id which represents the data-set                        |
| values        | Array    | [Values](#values)                                              |
| label         | object   | Display value for the data-set which the data points belong to |

#### Optional

| Property Name | Expected | Default      | Description                                                                    |
| ------------- | -------- | ------------ | ------------------------------------------------------------------------------ |
| axisInfoRow   | array    | []           | Refer [Axis Info Row](#Axis-Info-Row)                                          |
| color         | string   | COLORS.BLACK | Color for the data point and line                                              |
| group         | string   | key          | Used for stacking bar content under another bar content. Refer [Group](#group) |
| legendOptions | object   | undefined    | Option to show legend. Refer [LegendOptions](#legendOptions)                   |
| onClick       | Function | undefined    | Any action that can be performed when clicking on the data point               |
| regions       | array    | []           | Refer [Regions](#regions)                                                      |
| style         | object   | {}           | Any style that can be applied. Refer [Styles](#style)                          |
| yAxis         | string   | "y"          | Setting for using different Y based axis. For now: its either Y or Y2          |

### LegendOptions

Each bar can have a legendOptions object in [Values](#values) level.

#### Optional

| Property Name | Expected | Default | Description                                           |
| ------------- | -------- | ------- | ----------------------------------------------------- |
| showElement   | boolean  | true    | Toggle to hide legend when legend item has no data.   |

### Values

#### Required

| Property Name | Expected | Description                         |
| ------------- | -------- | ----------------------------------- |
| x             | string   | Co-ordinate x, for plotting the bar |
| y             | string   | Co-ordinate y, for height of bar    |

#### Optional

| Property Name | Expected | Default | Description                                           |
| ------------- | -------- | ------- | ----------------------------------------------------- |
| style         | object   | {}      | Any style that can be applied. Refer [Styles](#style) |

### Regions

`Regions` in Bar Graph are conceptually different than other graph types, since `goal lines` are **per bar** as opposed to `regions lines` which are **per data-set**.

Each bar can have 1 or more regions. `start` and `end` is necessary for rendering a region.

-   Stacked bars has combined regions. Pass in same regions array for every bar content that is stacked.
-   Grouped bars has separate region for each content. Pass in different regions for each content.

#### Required

| Property Name | Expected | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| start         | number   | Start of the region                                   |
| end           | number   | End of the region                                     |
| x             | number   | X axis tick value for which you want to render region |

#### Optional

| Property Name | Expected | Default                                                            | Description                           |
| ------------- | -------- | ------------------------------------------------------------------ | ------------------------------------- |
| axis          | string   | "y"                                                                | Defines which axis if represents from |
| color         | string   | ![#bcbfc0](https://placehold.it/15/bcbfc0/000000?text=+) `#bcbfc0` | Default color of the region area      |

### Style

Each bar can have 1 or more styles.

-   To apply style to entire content, pass style object in [Data](#data) level.
-   To apply style to a single bar, pass style object in [Values](#values) level.
-   In case both objects are provided, Value level style object will take precedence over Data level style object.

#### Optional

| Property Name | Expected | Default | Description                           |
| ------------- | -------- | ------- | ------------------------------------- |
| isHashed      | boolean  | false   | applies hash pattern to bar           |
| isHollow      | boolean  | false   | creates hollow bar                    |
| isDotted      | boolean  | false   | applies dotted pattern to bar outline |

### Group

`group` property is used to enable stacking of bar content on another content. Each content is assigned a group id (by default this is the `key` property) when rendering on the graph.
For instance:
If `Content 2` needs to be stacked, then `Content 2` needs to provide the unique `key` of `Content 1` as `group`.

Note:

-   Not providing a `group` will load the content beside `Content 1`.

### Axis Info Row

Each bar can have Axis Info Row Labels. `axis`, `x` and `value` is necessary for rendering an axis info row label.

-   Stacked Bar Graph has combined axis info row labels. Pass in `axisInfoRow` array for first bar content that is stacked.
-   Grouped Bar Graph has separate axis info row labels for each content. Pass in different axis info row labels for each content.

Note:

-   For a Stacked Bar Graph, disable legend items while using Axis Info Row since toggling legend items will not change the Axis Info Row Labels.

#### Required

| Property Name | Expected | Description                                                  |
| ------------- | -------- | ------------------------------------------------------------ |
| x             | number   | X axis tick value for corresponding axis info row label item |
| value         | object   | Refer [Axis Info Row Value](#Axis-Info-Row-Value)            |

#### Optional

| Property Name | Expected | Default | Description                                        |
| ------------- | -------- | ------- | -------------------------------------------------- |
| axis          | string   | "x"     | Axis where you want to render axis info row labels |

#### Axis Info Row Value

| Property Name  | Expected | Default                                                            | Description                                                                                                        |
| -------------- | -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| characterCount | number   | No Default Value                                                   | Maximum character length before truncation                                                                         |
| color          | string   | ![#1c1f21](https://placehold.it/15/1c1f21/000000?text=+) `#1c1f21` | Default color of the display (For Primary label only)                                                              |
| onClick        | Function | undefined                                                          | Any action that can be performed when clicking on the data point                                                   |
| label          | object   | {}                                                                 | `display` property needs to be provided for label <br/> `secondaryDisplay` property can also be provided for label |
| shape          | object   | {}                                                                 | svg represented as json, which got transpiled from `@cerner/svg-to-carbon`. Refer [Shapes](../README.md#Shapes)    |

### Constraints

-   If data-set `label` display is not provided then the legend item will not be shown as well
