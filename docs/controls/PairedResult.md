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
|axis|object|
|data|array|

#### Optional 
|Property Name|Expected|Default|
---|---|---|
|bindLegendTo|string|null (Example: `"#legendContainer"`)
|locale|object|LOCALE.en_US
|dimension|object|{}
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
|ticks|object|null

`Note` _y2 axis is mandatory if the **y2.show** is enabled_

### Ticks
#### Required
`N/A`

#### Optional
|Property Name|Expected|Value
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
|regions|object|{}
|label|object|{}
|color|string|COLORS.BLACK
|shape|string|SHAPES.CIRCLE
|onClick|Function|null

### Values
#### Required
|Property Name|Expected|Value
---|---|---|
|high|object|_{x: "", y: "", isCritical: `true`}_
|low|object|_{x: "", y: "", isCritical: `true`}_
|mid|object|_{x: "", y: "", isCritical: `true`}_

### Regions
* Each data-set can have 1 or more regions for `high`, `low` and/or `mid`
* Each pair type mentioned above needs to have a `start` and `end`
#### Required
|Property Name|Expected|Value
---|---|---|
|high|object|_{start: `number`, end: `number`}_
|low|object|_{start: `number`, end: `number`}_
|mid|object|_{start: `number`, end: `number`}_

#### Optional type properties
|Property Name|Expected|Default
---|---|---|
|axis|string|"y"
|color|string|![#f4f4f4](https://placehold.it/15/f4f4f4/000000?text=+) `#f4f4f4`

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
                y: 150,
                isCritical: true
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
