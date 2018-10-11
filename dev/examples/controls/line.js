import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { shell } from "../helpers";

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
export const renderLine = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineY2Axis = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.y2.show = true;
    const lineTime = Carbon.api.graph(axisData);
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[1])
    );
    return lineTime;
};
export const renderLineXHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.x.show = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineYHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.y.show = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineXStaticTicks = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%H:%M:%S"
    };
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineDefault;
};
export const renderLineXAxisFormatted = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e %X %Y"
    };
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineDefault;
};
export const renderLineXAlternateLocale = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    axisData.locale = Carbon.helpers.LOCALE.de_DE;
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%A %e %B %Y, %X"
    };
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineDefault;
};
export const renderLineLabelHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showLabel = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineLegendHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showLegend = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineLegendItemDisabled = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.label.isDisabled = true;
    lineDefault.loadContent(Carbon.api.line(data));
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[4])
    );
    return lineDefault;
};
export const renderLineGridHHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showHGrid = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineGridVHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showVGrid = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineShapesHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showShapes = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderMultiLine = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    setTimeout(
        () =>
            lineDefault.graphContainer
                ? lineDefault.loadContent(
                      Carbon.api.line(
                          getDemoData(`#${id}`, "LINE_DEFAULT").data[1]
                      )
                  )
                : "",
        750
    );
    setTimeout(
        () =>
            lineDefault.graphContainer
                ? lineDefault.loadContent(
                      Carbon.api.line(
                          getDemoData(`#${id}`, "LINE_DEFAULT").data[2]
                      )
                  )
                : "",
        750 * 2
    );
    setTimeout(
        () =>
            lineDefault.graphContainer
                ? lineDefault.loadContent(
                      Carbon.api.line(
                          getDemoData(`#${id}`, "LINE_DEFAULT").data[3]
                      )
                  )
                : "",
        750 * 3
    );
    setTimeout(
        () =>
            lineDefault.graphContainer
                ? lineDefault.loadContent(
                      Carbon.api.line(
                          getDemoData(`#${id}`, "LINE_DEFAULT").data[4]
                      )
                  )
                : "",
        750 * 4
    );
    setTimeout(
        () =>
            lineDefault.graphContainer
                ? lineDefault.loadContent(
                      Carbon.api.line(
                          getDemoData(`#${id}`, "LINE_DEFAULT").data[5]
                      )
                  )
                : "",
        750 * 5
    );
    setTimeout(
        () =>
            lineDefault.graphContainer
                ? lineDefault.loadContent(
                      Carbon.api.line(
                          getDemoData(`#${id}`, "LINE_DEFAULT").data[6]
                      )
                  )
                : "",
        750 * 6
    );
    return lineDefault;
};
export const renderLineTimeSeries = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineTime = Carbon.api.graph(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineTime;
};
export const renderLineRegionSimple = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A simple Line based graph. By default, region is shown face-up"
    );
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [regions[0]];
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineRegionMultiple = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Line based graph which has multiple ranges for a single data set."
    );
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[4]);
    data.regions = regions;
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineRegionNoLower = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Line based graph which has no lower bound for its region."
    );
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [
        {
            end: 10
        }
    ];
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineRegionNoUpper = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Line based graph which has no upper bound for its region."
    );
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [
        {
            start: 2
        }
    ];
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineRegionY2 = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Line based graph where the region is provided for Y2 axis. Click on 1st data-set or Hover over 2nd data-set to see the range."
    );
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
    const lineTime = Carbon.api.graph(axisData);
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    lineTime.loadContent(Carbon.api.line(dataValueObject));
    return lineTime;
};
export const renderMultiLineRegion = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A set of regions in a multi line scenario, each line has its own region expect the 3rd data set." +
            "By default, region is hidden unless hovered upon in the legend OR there is only 1 data set shown at a time in the graph."
    );
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
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
    lineDefault.loadContent(Carbon.api.line(data));
    lineDefault.loadContent(Carbon.api.line(dataAlt));
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[4])
    );
    return lineDefault;
};
export const renderGoalLine = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* The region is condensed into a 'Goal' line, achieved when 'start' and 'end' region parameters are the same."
    );
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[5]);
    data.regions = [
        {
            start: 15,
            end: 15,
            color: "#bcbfc0"
        }
    ];
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineBlankDataPoint = (el, id, title) => () => {
    const data = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[0]
    );
    data.values[6].y = null;
    shell.render(
        el,
        id,
        title,
        "* A Line graph where not all data points are present. In the example below, Data point at 7.00 AM is unavailable."
    );
    const lineTime = Carbon.api.graph(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    lineTime.loadContent(Carbon.api.line(data));
    return lineTime;
};
export const renderLineLegendTo = (el, id, title) => () => {
    shell.render(el, id, title);
    const parentContainerElem = document.querySelector(`#${id}`);
    parentContainerElem.setAttribute("style", "display: flex;");

    // Prepare legend container
    const legendContainer = document.createElement("div");
    const graphContainer = document.createElement("div");
    legendContainer.setAttribute("id", "lineLegendContainer");
    legendContainer.setAttribute("class", "legend-container");
    document.querySelector(`#${id}`).appendChild(legendContainer);

    //Prepare graph container
    graphContainer.setAttribute("id", "graphContainer");
    graphContainer.setAttribute("class", "graph-container");
    document.querySelector(`#${id}`).appendChild(graphContainer);

    // Add legend container ID to input JSON
    const data = utils.deepClone(
        getDemoData(`#graphContainer`, "LINE_TIMESERIES")
    );
    data.bindLegendTo = "#lineLegendContainer";
    const lineTime = Carbon.api.graph(data);
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineTime;
};
export const renderLineDateTimeBuckets = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "A Line graph within Lower, Middle and Upper steps."
    );
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
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineDefault;
};
