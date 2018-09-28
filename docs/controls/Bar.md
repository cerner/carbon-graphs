# Bar

A native bar graph using d3 based on standard design patterns.

## Usage

```javascript
var barDefault = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
barDefault.loadContent(
    Carbon.api.bar(/* Add "data" JSON, shown below for example */)
);
```

For loading multiple data sets, you can load as additional content:

```javascript
var barDefault = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
barDefault.loadContent(Carbon.api.bar(/* Data array A */));
barDefault.loadContent(Carbon.api.bar(/* Data array B */));
barDefault.loadContent(Carbon.api.bar(/* Data array C */));
barDefault.loadContent(Carbon.api.bar(/* Data array D */));
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
| ticks         | object   | X-axis ticks are required. Refer [Ticks](#ticks)              |

#### Optional

Each axis - X, Y and Y2 should have the following properties:

| Property Name | Expected | Default           | Description                       |
| ------------- | -------- | ----------------- | --------------------------------- |
| type          | string   | AXIS_TYPE.DEFAULT | Normal number value or time-based |
| show          | boolean  | true              | Toggle for showing the axis       |

`Note` _y2 axis is mandatory if the **y2.show** is enabled_

### Ticks

#### Required

| Property Name | Expected | Default | Description                                                           |
| ------------- | -------- | ------- | --------------------------------------------------------------------- |
| values        | array    | []      | Ticks values in the axis. Each tick will have an associated grid line |

#### Optional

| Property Name | Expected | Default | Description                                                                                                                                       |
| ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| format        | string   | ""      | [Formatter](https://github.com/d3/d3-time-format/blob/master/README.md#locales) for tick values. `Note:` This is mandatory if values are provided |

### Data

#### Required

| Property Name | Expected | Description                                                    |
| ------------- | -------- | -------------------------------------------------------------- |
| key           | string   | Unique id which represents the data set                        |
| values        | Array    | [Values](#values)                                              |
| label         | object   | Display value for the data set which the data points belong to |

#### Optional

| Property Name | Expected | Default      | Description                                                                    |
| ------------- | -------- | ------------ | ------------------------------------------------------------------------------ |
| yAxis         | string   | "y"          | Setting for using different Y based axis. For now: its either Y or Y2          |
| regions       | array    | []           | Refer [Regions](#regions)                                                      |
| color         | string   | COLORS.BLACK | Color for the data point and line                                              |
| onClick       | Function | null         | Any action that can be performed when clicking on the data point               |
| style         | object   | {}           | Any style that can be applied. Refer [Styles](#style)                          |
| group         | string   | key          | Used for stacking bar content under another bar content. Refer [Group](#group) |

### Dimension

#### Required

`N/A`

#### Optional

| Property Name | Expected | Default | Description                           |
| ------------- | -------- | ------- | ------------------------------------- |
| height        | number   | 250     | Sets the height for the graph content |

### Values

#### Required

| Property Name | Expected | Description                         |
| ------------- | -------- | ----------------------------------- |
| x             | string   | Co-ordinate x, for plotting the bar |
| y             | string   | Co-ordinate y, for height of bar    |

#### Optional

| Property Name | Expected | Default | Description                                            |
| ------------- | -------- | ------- | ------------------------------------------------------ |
| style         | object   | {}      | Any style that can be applied. Refer [Styles](#styles) |

### Regions

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

### Constraints

-   If data-set `label` display is not provided then the legend item will not be shown as well

### Structure

#### Simple Bar

```javascript
var input = {
    bindTo: id,
    axis: {
        x: {
            label: "Some X Label",
            lowerLimit: "0",
            upperLimit: "8",
            ticks: {
                values: [1, 2, 3, 4, 5, 6, 7]
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
            start: 2,
            end: 10,
            x: 1
        },
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
    values: [
        {
            x: "1",
            y: "8"
        },
        {
            x: "2",
            y: "15",
            style: {
                isHashed: true
            }
        }
    ]
};
```

#### Negative Bar

```javascript
var data = {
    key: "uid_bar_3",
    label: {
        display: "Data Label 3"
    },
    group: "uid_bar_1",
    regions: [
        {
            axis: "y2",
            start: -12,
            end: -12,
            x: 1
        }
    ],
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, valuesArray) => {
        //onCloseCB needs to called by the consumer after popup is closed;
        //This is so that graphing api can remove the selected indicator from data point
    },
    values: [
        {
            x: "1",
            y: "-10"
        },
        {
            x: "2",
            y: "-5"
        }
    ]
};
```
