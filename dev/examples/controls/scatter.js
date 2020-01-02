import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { createPanningControls } from "../panHelpers";

const regions = [
    {
        axis: "y",
        start: 2,
        end: 10,
        color: "#f4f4f4"
    },
    {
        axis: "y",
        start: 12,
        end: 18,
        color: "#c8cacb"
    }
];
export const renderScatter = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterY2Axis = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.y2.show = true;
    const scatterTime = Carbon.api.graph(axisData);
    scatterTime.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    scatterTime.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[1])
    );
    return scatterTime;
};
export const renderScatterWithDateline = (id) => {
    const scatterTime = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE")
    );
    scatterTime.loadContent(
        Carbon.api.scatter(
            getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE").data[0]
        )
    );
    return scatterTime;
};
export const renderScatterXHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.x.show = false;
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterYHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.y.show = false;
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterTimeSeries = (id) => {
    const scatterTime = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_TIMESERIES")
    );
    scatterTime.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return scatterTime;
};
export const renderMultiScatterIdenticalDatasetRegion = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    const dataAlt = utils.deepClone(
        getDemoData(`#${id}`, "LINE_DEFAULT").data[2]
    );
    data.regions = [
        {
            start: 2,
            end: 14
        }
    ];
    dataAlt.regions = [
        {
            start: 2,
            end: 14
        }
    ];
    scatterDefault.loadContent(Carbon.api.scatter(data));
    scatterDefault.loadContent(Carbon.api.scatter(dataAlt));
    return scatterDefault;
};
export const renderScatterBlankDataPoint = (id) => {
    const data = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[2]
    );
    const scatterTime = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_TIMESERIES")
    );
    scatterTime.loadContent(Carbon.api.scatter(data));
    return scatterTime;
};
export const renderScatterWithPanning = (id) => {
    let graph;
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE")
    );
    axisData.pan = {
        enabled: true
    };
    const graphDataY = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE").data[0]
    );
    graphDataY.regions = [regions[0]];

    const createGraph = () => {
        graph.reflow();
    };
    if (graph) {
        graph = createGraph();
    } else {
        graph = Carbon.api.graph(axisData);
        graph.loadContent(Carbon.api.scatter(graphDataY));
        axisData.axis = graph.config.axis;
    }
    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderScatterY2AxisWithPanning = (id) => {
    let graph;
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.pan = {
        enabled: true
    };
    axisData.axis.y2.show = true;
    const graphDataY = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[0]
    );
    const graphDataY2 = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[1]
    );
    graphDataY.regions = [regions[0]];
    const createGraph = () => {
        graph.reflow();
    };
    if (graph) {
        graph = createGraph();
    } else {
        graph = Carbon.api.graph(axisData);
        graph.loadContent(Carbon.api.scatter(graphDataY));
        graph.loadContent(Carbon.api.scatter(graphDataY2));
        axisData.axis = graph.config.axis;
    }
    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};
