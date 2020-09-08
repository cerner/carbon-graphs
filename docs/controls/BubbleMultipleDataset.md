# Bubble

A native bubble graph for multiple datasets using D3 based on standard design patterns.

-   [Bubble](#bubble)
    -   [Usage](#usage)
        -   [Structure](#structure)
            -   [Weight Based Bubble](#weight-based-bubble)
            -   [Custom Size Based Bubble](#custom-size-based-bubble)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
        -   [Data](#data)
            -   [Required](#required)
            -   [Optional](#optional)
        -   [Values](#values)
            -   [Required](#required-2)
            -   [Optional](#optional-2)
        -   [Regions](#regions)
            -   [Required](#required-3)
            -   [Optional](#optional-3)
        -   [Constraints](#constraints)

## Usage

**Note: Bubble Muliple Dataset is limited to 7 datasets. any additional datasets will be ignored.**

### Structure

You will **not** need all the properties in the example below.
Check out _optional_/_required_ properties explained in the [JSON Properties](#json-properties) section.

```javascript
var root = {
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
    }
};

var data = {
    key: "uid_1",
    label: {
        display: "Data Label 1"
    },
    color: Carbon.helpers.COLORS.BLUE,
    values: [
        {
            x: "2016-02-03T12:00:00Z",
            y: 4
        },
        {
            x: "2016-05-01T12:00:00Z",
            y: 15
        },
        {
            x: "2016-10-01T12:00:00Z",
            y: 10
        }
    ]
};
var bubbleDefault = Carbon.api.graph(root);
bubbleDefault.loadContent(Carbon.api.bubbleMultipleDataset(data));
```

#### Weight Based Bubble

For weight based bubble Graph, provide weight with min and max and also pass weight as third paramter in the values and the weight(third parameter) should be in the range of min and max provide in the weight.

```javascript

var dataWeightBased = {
    key: "uid_1",
    label: {
        display: "Data Label 1"
    },
    weight: {
        min: 10,
        max: 50
    }
    color: Carbon.helpers.COLORS.BLUE,
    values: [
        {
            x: "2016-02-03T12:00:00Z",
            y: 4,
            weight: 15
        },
        {
            x: "2016-05-01T12:00:00Z",
            y: 15,
            weight: 20
        },
        {
            x: "2016-10-01T12:00:00Z",
            y: 10,
            weight: 40
        }
    ]
};
var bubbleWeight = Carbon.api.graph(root);
bubbleWeight.loadContent(Carbon.api.bubbleMultipleDataset(dataWeightBased));
```

#### Colored Bubbles

For colored Bubbles, provide `color`:

```javascript
var colorBasedData = {
    key: "uid_2",
    label: {
        display: "Data Label 2"
    },
    color: BUBBLE.PALETTE.ORANGE,
    values: [
        {
            x: "2016-03-01T12:00:00Z",
            y: 14
        },
        {
            x: "2016-04-10T12:00:00Z",
            y: 1
        },
        {
            x: "2016-11-01T12:00:00Z",
            y: 18
        }
    ]
};
bubbleColorBased = Carbon.api.graph(root);
bubbleColorBased.loadContent(Carbon.api.bubbleMultipleDataset(colorBasedData));
```

#### Custom Size Based Bubble

For a custom size bubble, provide `maxRadius` in weight as given below between (min and max) and maxRadius maxRadius is given precedence.

```javascript
var customSizeBasedData = {
    key: "uid_2",
    label: {
        display: "Data Label 2"
    },
    weight: {
        maxRadius: 10
    }
    values: [
        {
            x: "2016-03-01T12:00:00Z",
            y: 14,
        },
        {
            x: "2016-04-10T12:00:00Z",
            y: 1,
        },
        {
            x: "2016-11-01T12:00:00Z",
            y: 18,
        }
    ]
};
bubbleGraph = Carbon.api.graph(root);
bubbleGraph.loadContent(Carbon.api.bubbleMultipleDataset(customSizeBasedData));
```

## JSON Properties

### Root

Refer [Graph](../core/Graph.md) `Root` for more details.

### Data

#### Required

| Property Name | Expected | Description                             |
| ------------- | -------- | --------------------------------------- |
| key           | string   | Unique id which represents the data-set |
| values        | Array    | [Values](#values)                       |

#### Optional

| Property Name | Expected | Default      | Description                                                                               |
| ------------- | -------- | ------------ | ----------------------------------------------------------------------------------------- |
| color         | string   | COLORS.BLACK | Color for the bubbles                                                                     |
| onClick       | Function | undefined    | Any action that can be performed when clicking on the data point                          |
| hue           | object   | {}           | Provide lowerShade and upperShadefor color based bubble [Hue](#Hue)                       |
| label         | object   | {}           | Display value for the data-set which the data points belong to                            |
| legendOptions | object   | undefined    | Toggle to show legend. Refer [LegendOptions](#legendOptions)                              |
| regions       | array    | []           | Refer [Regions](#regions)                                                                 |
| weight        | object   | {}           | Provide min and max or maxRadius for weight based or custom sized bubble[Weight](#Weight) |
| yAxis         | string   | "y"          | Setting for using different Y based axis. For now: its either Y or Y2                     |

### LegendOptions

Each bubble can have a legendOptions object in [Values](#values) level.

#### Optional

| Property Name | Expected | Default | Description                                         |
| ------------- | -------- | ------- | --------------------------------------------------- |
| showElement   | boolean  | true    | Toggle to hide legend when legend item has no data. |

### Weight

For weight based bubble provide weight with `min` and `max`, each bubble can have a weight object in [Values](#values) level.

```
weight: {
    min: 10,
    max: 30,
    maxRadius: 30
}
```

#### Required

| Property Name | Expected | Default   | Description                        |
| ------------- | -------- | --------- | ---------------------------------- |
| lowerShade    | string   | undefined | Lower shade for color based bubble |
| upperShade    | string   | undefined | Upper shade for color based bubble |

### Values

#### Required

| Property Name | Expected | Description                                |
| ------------- | -------- | ------------------------------------------ |
| x             | string   | Co-ordinate x, for plotting the data point |
| y             | string   | Co-ordinate y, for plotting the data point |

#### Optional

| Property Name | Expected | Default   | Description                                                                                                       |
| ------------- | -------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| weight        | number   | undefined | Make bubble based on the weight provided in the weight inside values, based on the weight range [Weight](#weight) |

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
