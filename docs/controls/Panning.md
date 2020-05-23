# Panning

Panning is applied with timeline/custom button

-   [Panning](#panning)
    -   [Usage](#usage)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Optional](#optional)
    -   [Constraints](#constraints)

## Usage

Panning can only be used with graphs having the construct as Graph, Gantt and Timeline.

```jsx
// axisData
const graphConfiguration = {
    bindTo: "#root",
    axis: {
        x: {
            type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
            label: "Datetime",
            lowerLimit: new Date(2016, 0, 1, 9, 0).toISOString(),
            upperLimit: new Date(2016, 0, 1, 15, 59).toISOString()
        },
        y: {
            label: "Temperature (degF)",
            lowerLimit: 90,
            upperLimit: 106
        }
    }
};
```

```jsx
// graphData
const dataSet = {
    key: "uid_1",
    label: {
        display: "Oral Temperature"
    },
    shape: Carbon.helpers.SHAPES.RHOMBUS,
    color: Carbon.helpers.COLORS.BLUE,
    values: [
        {
            x: new Date(2016, 0, 1, 10, 5).toISOString(),
            y: 96.5
        },
        {
            x: new Date(2016, 0, 1, 12, 15).toISOString(),
            y: 98.7
        },
        {
            x: new Date(2016, 0, 1, 14, 15).toISOString(),
            y: 97.4
        }
    ]
};
```

```javascript
export const renderLineWithPanning = (id) => {
    const axisData = graphConfiguration;
    axisData.pan = {
        enabled: true
    };
    const graphData = dataSet;
    graphData.regions = [regions[0]];

    const createGraph = () => {
        graph.reflow();
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.line(graphData));
    // Additional data-sets to be loaded here only, like:
    graph.loadContent(Carbon.api.line(/* Data array */));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};
```

## JSON Properties

### Root

#### Optional

| Property Name | Expected | Default   | Description                        |
| ------------- | -------- | --------- | ---------------------------------- |
| enabled       | boolean  | undefined | Set to true when panning is needed |

## Constraints

-   If panning is not provided then enabled will be false.
