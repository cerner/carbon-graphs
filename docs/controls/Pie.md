# Pie

A native pie chart using D3 based on standard design patterns. A Pie chart is a circular statistical graphic, which is divided into slices to illustrate numerical proportion.

-   [Pie](#pie)
    -   [Usage](#usage)
    -   [Structure](#structure)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Required](#required)
            -   [Optional](#optional)
        -   [Data](#data)
            -   [Required](#required-1)
            -   [Optional](#optional-1)
        -   [Dimension](#dimension)
            -   [Optional](#optional-2)

## Usage

## Structure

You will **not** need all the properties in the example below.
Check out _optional_/_required_ properties explained in the [JSON Properties](#json-properties) section.

```javascript
var root = {
    bindTo: "#root",
    showLegend: true
};
var pieDefault = Carbon.api.pie(root);
```

`Data` can be provided one at a time within loadContent or as an array

```javascript
var data = {
    key: "uid_1",
    label: {
        display: "Blue"
    },
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, index, value) => {
        // onCloseCB needs to called by the consumer after popup is closed to deselect data point.
    },
    value: 50
};
pieDefault.loadContent(data);
```

For loading multiple data-sets, you can load as additional content:

```javascript
var dataArray = [
    {
        key: "uid_2",
        label: {
            display: "ORANGE"
        },
        color: Carbon.helpers.COLORS.ORANGE,
        value: 60
    },
    {
        key: "uid_3",
        label: {
            display: "Green"
        },
        color: Carbon.helpers.COLORS.GREEN,
        value: 10
    },
    {
        key: "uid_4",
        label: {
            display: "Light Purple"
        },
        color: Carbon.helpers.COLORS.LIGHT_PURPLE,
        value: 30
    }
];
pieDefault.loadContent(dataArray);
```

## JSON Properties

### Root

#### Required

| Property Name | Expected | Description                                                                                                          |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| bindTo        | string   | DOM id to bind the graph into                                                                                        |
| data          | []object | Refer [Data](#data). This is _not_ an actual object property rather this is provided as a parameter to `loadContent` |

#### Optional

| Property Name | Expected | Default | Description                                                                          |
| ------------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| bindLegendTo  | string   | null    | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`) |
| dimension     | object   | {}      | Refer [Dimension](#dimension)                                                        |
| showLegend    | boolean  | true    | Toggle to show graph legend                                                          |

### Data

#### Required

| Property Name | Expected | Description                          |
| ------------- | -------- | ------------------------------------ |
| key           | string   | Unique id which represents the slice |
| label         | object   | Display value each slice             |
| value         | number   | Value of the slice                   |

#### Optional

| Property Name | Expected | Default     | Description                                                                                |
| ------------- | -------- | ----------- | ------------------------------------------------------------------------------------------ |
| color         | string   | COLORS.BLUE | Color for slice. It is recommended to use values from `COLORS` sequentially except `BLACK` |
| onClick       | Function | undefined   | Any action that can be performed when clicking on the data point                           |

### Dimension

#### Optional

| Property Name | Expected | Default | Description                |
| ------------- | -------- | ------- | -------------------------- |
| height        | number   | 250     | Sets the size of pie chart |
