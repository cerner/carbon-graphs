# Bubble Multiple Dataset

A native bubble graph for multiple datasets using D3 based on standard design patterns.

-   [Bubble](#bubble)
    -   [Usage](#usage)
        -   [Structure](#structure)
            -   [Weight Based Bubble](#weight-based-bubble)
            -   [Colored Bubbles](#colored-bubbles)
            -   [Custom Size Based Bubble](#custom-sized-bubble)
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

For weight based bubble Graph, provide a weight object with `min` and `max` values. For the individual bubbles in the values array, include `weight` along with its `x` and `y` coordinates.

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

Provide a `color` from the [single color palette](../../README.md#colors) to apply to all bubbles:

```javascript
var colorBasedData = {
    key: "uid_2",
    label: {
        display: "Data Label 2"
    },
    color: Carbon.helpers.COLORS.GREEN,
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

#### Custom Sized Bubble

For a custom size bubble, provide `fixedRadius` in the weight object. `fixedRadius` takes priority over the `min` and `max` properties if they are provided.

_Note: this property was formerly known as `maxRadius` in the [old Bubble API](./Bubble.md)_

```javascript
var customSizeBasedData = {
    key: "uid_2",
    label: {
        display: "Data Label 2"
    },
    weight: {
        fixedRadius: 10
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

| Property Name | Expected | Default      | Description                                                                                                     |
| ------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| color         | string   | COLORS.BLACK | Color for the bubbles                                                                                           |
| onClick       | Function | undefined    | Any action that can be performed when clicking on the data point                                                |
| label         | object   | {}           | Display value for the data-set which the data points belong to                                                  |
| legendOptions | object   | undefined    | Toggle to show legend. Refer to [LegendOptions](#legendOptions)                                                 |
| regions       | array    | []           | Refer to [Regions](#regions)                                                                                    |
| weight        | object   | {}           | Provide `min` and `max` for weight based or `fixedRadius` for a custom sized bubble. Refer to [Weight](#Weight) |
| yAxis         | string   | "y"          | Setting for using different Y based axis. For now: its either Y or Y2                                           |

### LegendOptions

Each bubble can have a legendOptions object in [Values](#values) level.

#### Optional

| Property Name | Expected | Default | Description                                         |
| ------------- | -------- | ------- | --------------------------------------------------- |
| showElement   | boolean  | true    | Toggle to hide legend when legend item has no data. |

### Weight

For a weight based bubble, provide weight with `min` and `max`, with each bubble having a weight property among their [values](#values). For custom sized bubbles across the dataset, provide `fixedRadius` instead.

_Note: this property was formerly known as `maxRadius` in the [old Bubble API](./Bubble.md)_

```javascript
weight: {
    min: 10,
    max: 30,
}

// OR

weight: {
    fixedRadius: 30
}
```

#### Optional

| Property Name | Expected | Default   | Description                                                                              |
| ------------- | -------- | --------- | ---------------------------------------------------------------------------------------- |
| min           | number   | undefined | Min value for the weight based bubble                                                    |
| max           | number   | undefined | Max value for the weight based bubble                                                    |
| fixedRadius   | number   | 30        | Used to set a single weight for all bubbles in the dataset and overrides `max` and `min` |

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

Each dataset can have 1 or more regions. `start` and `end` is necessary for rendering a horizontal area.

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

-   If the dataset's `label` property is undefined, then it will not be shown in the legend.
