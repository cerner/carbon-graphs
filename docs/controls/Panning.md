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

```javascript
export const renderLineWithPanning = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE")
    );
    axisData.pan = {
        enabled: true
    };
    const graphData = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE").data[0]
    );
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
