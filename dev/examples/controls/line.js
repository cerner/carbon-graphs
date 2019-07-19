import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";

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
export const renderLine = (id) => {
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineY2Axis = (id) => {
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
export const renderLineXHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.x.show = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineYHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.y.show = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineWithDateline = (id) => {
    const lineTime = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE")
    );
    lineTime.loadContent(
        Carbon.api.line(
            getDemoData(`#${id}`, "LINE_TIMESERIES_DATELINE").data[0]
        )
    );
    return lineTime;
};
export const renderLineXStaticTicks = (id) => {
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
export const renderLineXAxisFormatted = (id) => {
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
export const renderLineXAlternateLocale = (id) => {
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
export const renderLineLabelHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showLabel = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineLegendHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showLegend = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineLegendItemDisabled = (id) => {
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.label.isDisabled = true;
    lineDefault.loadContent(Carbon.api.line(data));
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[4])
    );
    return lineDefault;
};
export const renderLineGridHHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showHGrid = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineGridVHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showVGrid = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderLineShapesHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.showShapes = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
export const renderMultiLine = (id) => {
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
export const renderLineTimeSeries = (id) => {
    const lineTime = Carbon.api.graph(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    return lineTime;
};
export const renderLineRegionSimple = (id) => {
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.regions = [regions[0]];
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineRegionMultiple = (id) => {
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[4]);
    data.regions = regions;
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
export const renderLineRegionNoLower = (id) => {
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
export const renderLineRegionNoUpper = (id) => {
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
export const renderLineRegionY2 = (id) => {
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
export const renderMultiLineRegion = (id) => {
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
export const renderGoalLine = (id) => {
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
export const renderLineBlankDataPoint = (id) => {
    const data = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[2]
    );
    const lineTime = Carbon.api.graph(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    lineTime.loadContent(Carbon.api.line(data));
    return lineTime;
};
export const renderLineLegendTo = (id) => {
    // Add legend container ID to input JSON
    const data = utils.deepClone(
        getDemoData(`#graphContainer`, "LINE_TIMESERIES")
    );
    data.bindLegendTo = "#legendContainer";
    const lineTime = Carbon.api.graph(data);
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[0])
    );
    lineTime.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_TIMESERIES").data[2])
    );
    return lineTime;
};
export const renderLineDateTimeBuckets = (id) => {
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
export const renderLineXOrientationTop = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.x.orientation = Carbon.helpers.AXES_ORIENTATION.X.TOP;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_DEFAULT").data[0])
    );
    return lineDefault;
};
