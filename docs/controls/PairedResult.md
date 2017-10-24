# Paired Result
A native paired result graph, representing a pair of result with an optional median value. A `pair` can be 
represented in any co-ordinate on a graph. Most common pattern used is charting a Blood Pressure graph where
the `pair` - High, low, mid are vertical data points connected by a vertical line.

## Usage
```javascript
var pairedGraph = Carbon.api.graph(/* Add "input" JSON, shown below for example */);
pairedGraph.loadContent(Carbon.api.pairedResult(/* Add "data" JSON, shown below for example */));
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
|symbol|string|SYMBOLS.CIRCLE
|onClick|Function|null

### Values
#### Required
 `N/A`
#### Optional
|Property Name|Expected|Default
---|---|---|
|high|Object|_{x: "", y: ""}_
|low|Object|_{x: "", y: ""}_
|mid|Object|_{x: "", y: ""}_

### Constraints
* If `label` display is not provided for `high`, `low` and `mid`, the legend item will not be shown as well

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
    onClick: (onCloseCB, key, index, value) =>
    {
        /*
        onCloseCB needs to called by the consumer after popup is closed;
        This is so that graphing api can remove the selected indicator from data point
         */
    },
    values: [
        {
            high:
            {
                x: 20,
                y: 150
            },
            low:
            {
                x: 20,
                y: 10
            },
            mid:
            {
                x: 20,
                y: 40
            }
        }
    ]
};
```
