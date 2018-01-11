# Line
A native line graph using d3 based on standard design patterns. 

## Usage
```javascript
var lineDefault = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
lineDefault.loadContent(Carbon.api.line(/* Add "data" JSON, shown below for example */));
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
|Property Name|Expected|
---|---|
|bindTo|string|
|axis|Object|
|data|Object|

#### Optional 
|Property Name|Expected|Default|
---|---|---|
|locale|Object|LOCALE.en_US
|dimension|Object|{}
|throttle|number|(1000/60) => time in ms
|showLabel|boolean|true
|showLegend|boolean|true
|showShapes|boolean|true
|showVGrid|boolean|true
|showHGrid|boolean|true

### Dimension
#### Required
`N/A`

#### Optional
|Property Name|Expected|Default|
---|---|---|
|height|number|250

### Axis
#### Required
|Property Name|Expected|
---|---|
|lowerLimit|string|
|upperLimit|string|
|label|string|""

#### Optional
Each axis - X, Y and Y2 should have the following properties:

|Property Name|Expected|Default|
---|---|---|
|type|string|AXIS_TYPE.DEFAULT
|show|boolean|true
|ticks|Object|null

`Note` _y2 axis is mandatory if the **y2.show** is enabled_

### Ticks
#### Required
`N/A`

#### Optional
|Property Name|Expected|Default|
---|---|---|
|[format](https://github.com/d3/d3-time-format/blob/master/README.md#locales)|string|""
|values|array|[]

### Data
#### Required
|Property Name|Expected|
---|---|
|key|unique string|
|values|Array|

#### Optional
|Property Name|Expected|Default
---|---|---|
|yAxis|string|"y"
|label|Object|{}
|color|string|COLORS.BLACK
|shape|string|SHAPES.CIRCLE
|onClick|Function|null

### Values
#### Required
|Property Name|Expected|
---|---|
|x|string
|y|string

#### Optional
 `N/A`

### Constraints
* If `label` display is not provided then the legend item will not be shown as well

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
            lowerLimit: "0",
            upperLimit: "20"
        },
        y2: {
            show: false,
            label: "Some Y2 Label",
            lowerLimit: "0",
            upperLimit: "250"
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
    label:
    {
        display: "Data Label 1"
    },
    shape: Carbon.helpers.SHAPES.SQUARE,
    color: Carbon.helpers.COLORS.BLUE,
    onClick: (onCloseCB, key, index, value) =>
    {
        /*
        onCloseCB needs to called by the consumer after popup is closed;
        This is so that graphing api can remove the selected indicator from data point
         */
    },
    values: [
        {
            x: "2016-02-03T12:00:00Z",
            y: "1"
        }
    ]
};
```
