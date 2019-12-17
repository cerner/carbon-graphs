import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { createPanningControls } from "../panHelpers";

const tickValues = [
    new Date(2016, 0, 1, 1, 0).toISOString(),
    new Date(2016, 0, 1, 5, 0).toISOString(),
    new Date(2016, 0, 1, 10, 0).toISOString(),
    new Date(2016, 0, 1, 15, 0).toISOString(),
    new Date(2016, 0, 1, 20, 0).toISOString()
];
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
export const renderScatterXStaticTicks = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%H:%M:%S"
    };
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return scatterDefault;
};
export const renderScatterXAxisFormatted = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e %X %Y"
    };
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return scatterDefault;
};
export const renderScatterXAlternateLocale = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.locale = Carbon.helpers.LOCALE.de_DE;
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%A %e %B %Y, %X"
    };
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return scatterDefault;
};
export const renderScatterLabelHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showLabel = false;
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterLegendHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showLegend = false;
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterLegendItemDisabled = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.label.isDisabled = true;
    scatterDefault.loadContent(Carbon.api.scatter(data));
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[4])
    );
    return scatterDefault;
};
export const renderScatterGridHHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showHGrid = false;
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterGridVHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showVGrid = false;
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
export const renderScatterRegionSimple = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [regions[0]];
    scatterDefault.loadContent(Carbon.api.scatter(data));
    return scatterDefault;
};
export const renderScatterRegionMultiple = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[4]);
    data.regions = regions;
    scatterDefault.loadContent(Carbon.api.scatter(data));
    return scatterDefault;
};
export const renderScatterRegionNoLower = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [
        {
            end: 10
        }
    ];
    scatterDefault.loadContent(Carbon.api.scatter(data));
    return scatterDefault;
};
export const renderScatterRegionNoUpper = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [
        {
            start: 2
        }
    ];
    scatterDefault.loadContent(Carbon.api.scatter(data));
    return scatterDefault;
};
export const renderScatterRegionY2 = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    const dataValueObject = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[1]
    );
    axisData.axis.y2.show = true;
    dataValueObject.regions = [
        {
            axis: "y2",
            start: 50,
            end: 150
        }
    ];
    const scatterTime = Carbon.api.graph(axisData);
    scatterTime.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    scatterTime.loadContent(Carbon.api.scatter(dataValueObject));
    return scatterTime;
};
export const renderMultiScatterRegion = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    const dataAlt = utils.deepClone(
        getDemoData(`#${id}`, "LINE_DEFAULT").data[2]
    );
    data.regions = [
        {
            start: 2
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
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[4])
    );
    return scatterDefault;
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
export const renderRegionScatter = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[5]);
    data.regions = [
        {
            start: 15,
            end: 15,
            color: "#bcbfc0"
        }
    ];
    scatterDefault.loadContent(Carbon.api.scatter(data));
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
export const renderScatterLegendTo = (id) => {
    // Add legend container ID to input JSON
    const data = utils.deepClone(
        getDemoData(`#graphContainer`, "LINE_TIMESERIES")
    );
    data.bindLegendTo = "#legendContainer";
    const scatterTime = Carbon.api.graph(data);
    scatterTime.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    scatterTime.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[2])
    );
    return scatterTime;
};
export const renderScatterDateTimeBuckets = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.lowerLimit = new Date(2016, 0, 0, 23, 59).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 1, 0).toISOString();
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%H",
        lowerStepTickValues: [
            new Date(2016, 0, 1, 6).toISOString(),
            new Date(2016, 0, 1, 12).toISOString(),
            new Date(2016, 0, 1, 18).toISOString()
        ],
        midpointTickValues: [
            new Date(2016, 0, 1, 3).toISOString(),
            new Date(2016, 0, 1, 9).toISOString(),
            new Date(2016, 0, 1, 15).toISOString(),
            new Date(2016, 0, 1, 21).toISOString()
        ],
        upperStepTickValues: [
            new Date(2016, 0, 1, 0).toISOString(),
            new Date(2016, 0, 1, 24).toISOString()
        ]
    };
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return scatterDefault;
};
export const renderScatterXOrientationTop = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.x.orientation = Carbon.helpers.AXES_ORIENTATION.X.TOP;
    const scatterDefault = Carbon.api.graph(axisData);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterCustomPadding = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    data.showLegend = false;
    data.axis.x.show = false;
    data.axis.y.show = false;
    data.padding = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    const scatterDefault = Carbon.api.graph(data);
    scatterDefault.loadContent(
        Carbon.api.scatter(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return scatterDefault;
};
export const renderScatterWithPanning = (id) => {
    let graph;
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
    const createGraph = (axis, values) => {
        if (graph) {
            graph.destroy();
        }
        graph = Carbon.api.graph(axis);
        graph.loadContent(Carbon.api.scatter(values));
        return graph;
    };
    graph = createGraph(axisData, graphData);
    createPanningControls(id, {
        axisData,
        graphData,
        creationHandler: createGraph
    });
    return graph;
};
