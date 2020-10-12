import Carbon from "../../../src/main/js/carbon";
import { loadPopup, loadBubblePopup } from "../popup";
import { createPanningControls } from "../panHelpers";
import { BUBBLE } from "../../../src/main/js/helpers/constants";

const simpleAxisData = (id) => ({
    bindTo: id,
    axis: {
        x: {
            type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
            label: "Datetime",
            lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
            upperLimit: new Date(2016, 0, 1, 23, 59).toISOString()
        },
        y: {
            label: "Bubble",
            lowerLimit: 10,
            upperLimit: 200
        }
    }
});

const axisData = (id) => ({
    bindTo: id,
    axis: {
        x: {
            type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
            label: "Datetime",
            lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
            upperLimit: new Date(2016, 0, 1, 23, 59).toISOString()
        },
        y: {
            label: "Year",
            lowerLimit: 2010,
            upperLimit: 2020
        }
    }
});

const temperatureAxisData = (id) => ({
    bindTo: id,
    axis: {
        x: {
            type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
            label: "Datetime",
            lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
            upperLimit: new Date(2016, 0, 1, 23, 59).toISOString()
        },
        y: {
            label: "Temperature",
            lowerLimit: 50,
            upperLimit: 280
        }
    }
});

const dataToReduceGraphAndLegendPadding = (id) => ({
    bindTo: id,
    axis: {
        x: {
            type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
            label: "Datetime",
            lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
            upperLimit: new Date(2016, 0, 1, 23, 59).toISOString()
        },
        y: {
            label: "Bubble",
            lowerLimit: 10,
            upperLimit: 200
        }
    },
    removeContainerPadding: true,
    legendPadding: {
        left: 2.5,
        right: 2.5,
        top: 2.5,
        bottom: 2.5
    }
});

const data = {
    key: "uid_1",
    label: {
        display: "Bubble set A"
    },
    onClick: loadPopup,
    color: "#004C76",
    values: [
        {
            x: new Date(2016, 0, 1, 12, 0).toISOString(),
            y: 70
        },
        {
            x: new Date(2016, 0, 1, 15, 45).toISOString(),
            y: 120
        },
        {
            x: new Date(2016, 0, 1, 10, 30).toISOString(),
            y: 160
        },
        {
            x: new Date(2016, 0, 1, 18, 0).toISOString(),
            y: 180
        }
    ],
    yAxis: "y",
    showShapes: false
};

const data2 = {
    key: "uid_2",
    label: {
        display: "Amount"
    },
    color: Carbon.helpers.COLORS.ORANGE,
    onClick: loadBubblePopup,
    weight: {
        min: 40,
        max: 450
    },
    hue: {
        lowerShade: "yellow",
        upperShade: "red"
    },
    values: [
        {
            x: new Date(2016, 0, 1, 11, 0).toISOString(),
            y: 2012,
            weight: 70
        },
        {
            x: new Date(2016, 0, 1, 9, 0).toISOString(),
            y: 2014,
            weight: 180
        },
        {
            x: new Date(2016, 0, 1, 19, 30).toISOString(),
            y: 2016,
            weight: 220
        },
        {
            x: new Date(2016, 0, 1, 15, 0).toISOString(),
            y: 2018,
            weight: 340
        }
    ],
    yAxis: "y"
};

const data3 = {
    key: "uid_3",
    label: {
        display: "Temperature"
    },
    onClick: loadPopup,
    color: Carbon.helpers.COLORS.ORANGE,
    hue: {
        // 1-to-1 mapping of range with data values. If not provided, data.color is used
        // If lowerShade and upperShade is provided, Carbon will map the colors to each data value.
        lowerShade: "#ffff00", // yellow
        upperShade: "#ff0000" // red
    },
    values: [
        {
            x: new Date(2016, 0, 1, 9, 0).toISOString(),
            y: 80
        },
        {
            x: new Date(2016, 0, 1, 11, 0).toISOString(),
            y: 110
        },
        {
            x: new Date(2016, 0, 1, 13, 0).toISOString(),
            y: 150
        },
        {
            x: new Date(2016, 0, 1, 15, 0).toISOString(),
            y: 190
        },
        {
            x: new Date(2016, 0, 1, 16, 40).toISOString(),
            y: 220
        },
        {
            x: new Date(2016, 0, 1, 18, 30).toISOString(),
            y: 250
        }
    ],
    yAxis: "y"
};

const data4 = {
    key: "uid_4",
    label: {
        display: "Population"
    },
    color: Carbon.helpers.COLORS.BLUE,
    onClick: loadBubblePopup,
    weight: {
        min: 100000,
        max: 250000
    },
    values: [
        {
            x: new Date(2016, 0, 1, 11, 0).toISOString(),
            y: 2012,
            weight: 120000
        },
        {
            x: new Date(2016, 0, 1, 9, 0).toISOString(),
            y: 2014,
            weight: 180000
        },
        {
            x: new Date(2016, 0, 1, 19, 30).toISOString(),
            y: 2016,
            weight: 220000
        },
        {
            x: new Date(2016, 0, 1, 15, 0).toISOString(),
            y: 2018,
            weight: 240000
        }
    ],
    yAxis: "y"
};

const data5 = {
    key: "uid_5",
    label: {
        display: "Bubble set B"
    },
    color: Carbon.helpers.COLORS.LIGHT_BLUE,
    onClick: loadPopup,
    weight: {
        // when providing maxRadius, it will be given preference
        maxRadius: 12
    },
    values: [
        {
            x: new Date(2016, 0, 1, 6, 0).toISOString(),
            y: 60
        },
        {
            x: new Date(2016, 0, 1, 10, 0).toISOString(),
            y: 120
        },
        {
            x: new Date(2016, 0, 1, 12, 0).toISOString(),
            y: 180
        },
        {
            x: new Date(2016, 0, 1, 18, 0).toISOString(),
            y: 220
        }
    ],
    yAxis: "y"
};

const data6 = {
    key: "uid_6",
    label: {
        display: "Bubble set C"
    },
    onClick: loadPopup,
    color: "#004C76",
    values: [
        {
            x: new Date(2016, 0, 1, 12, 0).toISOString(),
            y: 50
        },
        {
            x: new Date(2016, 0, 1, 15, 45).toISOString(),
            y: 120
        },
        {
            x: new Date(2016, 0, 1, 10, 30).toISOString(),
            y: 130
        },
        {
            x: new Date(2016, 0, 1, 18, 0).toISOString(),
            y: 180
        }
    ],
    yAxis: "y"
};

const panData = {
    key: "uid_5",
    values: [
        {
            x: new Date(2016, 0, 1, 9, 0).toISOString(),
            y: 80
        },
        {
            x: new Date(2016, 0, 1, 10, 0).toISOString(),
            y: 50
        },
        {
            x: new Date(2016, 0, 1, 12, 0).toISOString(),
            y: 100
        },
        {
            x: new Date(2016, 0, 1, 15, 0).toISOString(),
            y: 200
        }
    ],
    yAxis: "y"
};

export const renderSimpleBubble = (id) => {
    const bubbleGraph = Carbon.api.graph(simpleAxisData(`#${id}`));
    bubbleGraph.loadContent(Carbon.api.bubble(data));
    return bubbleGraph;
};

export const renderWeightBasedBubbleGraph = (id) => {
    const bubbleGraph = Carbon.api.graph(axisData(`#${id}`));
    bubbleGraph.loadContent(Carbon.api.bubble(data4));
    return bubbleGraph;
};

export const renderColorBasedBubbleGraph = (id) => {
    const bubbleGraph = Carbon.api.graph(temperatureAxisData(`#${id}`));
    bubbleGraph.loadContent(Carbon.api.bubble(data3));
    return bubbleGraph;
};

export const renderWeightColorCombination = (id) => {
    const bubbleGraph = Carbon.api.graph(axisData(`#${id}`));
    bubbleGraph.loadContent(Carbon.api.bubble(data2));
    return bubbleGraph;
};

export const renderCustomBubbleSize = (id) => {
    const bubbleGraph = Carbon.api.graph(simpleAxisData(`#${id}`));
    bubbleGraph.loadContent(Carbon.api.bubble(data5));
    return bubbleGraph;
};

export const renderBubbleWithPanning = (id) => {
    const axisData = simpleAxisData(`#${id}`);
    axisData.pan = {
        enabled: true
    };
    const graphDataY = data5;
    const createGraph = () => {
        graph.reflow();
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.bubble(graphDataY));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderBubblePanningWithDynamicData = (id) => {
    const axisData = simpleAxisData(`#${id}`);
    axisData.pan = {
        enabled: true
    };
    const graphDataY = data5;
    const createGraph = () => {
        const graphData = panData;
        graph.reflow(graphData);
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.bubble(graphDataY));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderBubbleGraphAndLegendPaddingReduced = (id) => {
    const bubbleGraph = Carbon.api.graph(
        dataToReduceGraphAndLegendPadding(`#${id}`)
    );
    bubbleGraph.loadContent(Carbon.api.bubble(data6));
    return bubbleGraph;
};

export const renderGraphBubbleSingleDataset = (id) => {
    const bubbleGraph = Carbon.api.graph(axisData(`#${id}`));
    data2.palette = BUBBLE.PALETTE.ORANGE;
    data2.color = undefined;
    data2.label.display = "dataset with palette";
    bubbleGraph.loadContent(Carbon.api.bubbleSingleDataset(data2));

    const bubbleGraph2 = Carbon.api.graph(temperatureAxisData(`#${id}`));
    data3.color = Carbon.helpers.COLORS.GREEN;
    data3.label.display = "dataset with single color";
    bubbleGraph2.loadContent(Carbon.api.bubbleSingleDataset(data3));

    return bubbleGraph;
};

export const renderGraphBubbleMultipleDataset = (id) => {
    const bubbleGraph = Carbon.api.graph(temperatureAxisData(`#${id}`));
    data.color = Carbon.helpers.COLORS.PURPLE;
    data3.color = Carbon.helpers.COLORS.BLUE;
    data.label.display = "Bubble Set A";
    data3.label.display = "Bubble Set B";
    bubbleGraph.loadContent(Carbon.api.bubbleMultipleDataset(data));
    bubbleGraph.loadContent(Carbon.api.bubbleMultipleDataset(data3));

    return bubbleGraph;
};
