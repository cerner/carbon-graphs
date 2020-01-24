import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { multiRegion, multiRegionAlt } from "./pairedResult";

export const renderCriticalityLineSimple = (id) => {
    const lineTime = Carbon.api.graph(getDemoData(`#${id}`, "LINE_TIMESERIES"));
    const data = utils.deepClone(
        getDemoData(`#${id}`, "LINE_TIMESERIES").data[0]
    );
    data.regions = [
        {
            axis: "y",
            start: 2,
            end: 10
        }
    ];
    data.values[0].isCritical = true;
    data.values[10].isCritical = true;
    lineTime.loadContent(Carbon.api.line(data));
    return lineTime;
};
export const renderCriticalityMultiLine = (id) => {
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.values[0].isCritical = true;
    data.values[5].isCritical = true;
    data.values[10].isCritical = true;
    data.regions = [
        {
            start: 2
        }
    ];
    const dataAlt = utils.deepClone(
        getDemoData(`#${id}`, "LINE_DEFAULT").data[2]
    );
    dataAlt.values[6].isCritical = true;
    dataAlt.values[11].isCritical = true;
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
export const renderCriticalityPairedResultSimple = (id) => {
    const pairedTime = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    const data = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
    );
    data.regions = {
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
    };
    data.values[3].high.isCritical = true;
    data.values[3].mid.isCritical = true;
    data.values[3].low.isCritical = true;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    return pairedTime;
};
export const renderCriticalityMultiPairedResult = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.y2.show = true;
    const pairedTime = Carbon.api.graph(axisData);
    const data = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
    );
    const dataAlt = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[1]
    );
    data.regions = multiRegion;
    data.values[3].high.isCritical = true;
    data.values[3].mid.isCritical = true;
    data.values[0].low.isCritical = true;

    dataAlt.regions = multiRegionAlt;
    dataAlt.values[1].high.isCritical = true;
    dataAlt.values[1].mid.isCritical = true;
    dataAlt.values[1].low.isCritical = true;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    pairedTime.loadContent(Carbon.api.pairedResult(dataAlt));
    return pairedTime;
};
export const renderCriticalityTimeline = (id) => {
    const timelineDefault = Carbon.api.timeline(
        getDemoData(`#${id}`, "TIMELINE")
    );
    const timelineData = utils.deepClone(getDemoData(`#${id}`, "TIMELINE"));
    timelineData.data[0].values[1].isCritical = true;
    timelineData.data[0].values[2].isCritical = true;
    timelineData.data[1].values[1].isCritical = true;
    timelineDefault.loadContent(timelineData.data[0]);
    timelineDefault.loadContent(timelineData.data[1]);
    return timelineDefault;
};
export const renderCriticalityScatter = (id) => {
    const scatterDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_DEFAULT")
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "LINE_DEFAULT").data[0]);
    data.values[0].isCritical = true;
    data.values[5].isCritical = true;
    data.values[10].isCritical = true;
    data.regions = [
        {
            start: 2
        }
    ];
    const dataAlt = utils.deepClone(
        getDemoData(`#${id}`, "LINE_DEFAULT").data[2]
    );
    dataAlt.values[6].isCritical = true;
    dataAlt.values[11].isCritical = true;
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
