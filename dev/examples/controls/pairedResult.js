import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import {
    getAxes,
    getData
} from "../data";
import { shell } from "../helpers";

const tickValues = [
    new Date(2016, 0, 1, 1, 0).toISOString(),
    new Date(2016, 6, 1, 1, 0).toISOString(),
    new Date(2017, 0, 1, 1, 0).toISOString(),
    new Date(2017, 6, 1, 1, 0).toISOString(),
    new Date(2018, 0, 1, 1, 0).toISOString()
];
const regions = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220,
            color: "#c8cacb"
        },
        {
            axis: "y",
            start: 180,
            end: 230,
            color: "#d6d8d9"
        }
    ],
    low: [
        {
            axis: "y",
            start: 20,
            end: 70
        }
    ]
};
export const multiRegion = {
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
export const multiRegionAlt = {
    high: [
        {
            axis: "y2",
            start: 210,
            end: 280,
            color: "#c8cacb"
        }
    ],
    low: [
        {
            axis: "y2",
            start: 175,
            end: 200
        }
    ]
};
export const renderPairedResult = (el, id, title) => () => {
    shell.render(el, id, title);
    const pairedDefault = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultTimeseries = (el, id, title) => () => {
    shell.render(el, id, title);
    const pairedTime = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    pairedTime.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]));
    return pairedTime;
};
export const renderPairedResultY2Axis = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    axisData.axis.y2.show = true;
    const pairedTime = Carbon.api.graph(axisData);
    pairedTime.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]));
    pairedTime.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 1 ]));
    return pairedTime;
};
export const renderPairedResultXHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    axisData.axis.x.show = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultYHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    axisData.axis.y.show = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultXStaticTicks = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e %X %Y"
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultXAxisFormatted = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%b, %X %Y"
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultXAlternateLocale = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    axisData.locale = Carbon.helpers.LOCALE.fr_FR;
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%A %e %B %Y"
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultLabelHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showLabel = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultLegendHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showLegend = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultLegendItemDisabled = (el, id, title) => () => {
    shell.render(el, id, title);
    const pairedDefault = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]);
    data.label.high.isDisabled = true;
    data.label.low.isDisabled = true;
    pairedDefault.loadContent(Carbon.api.pairedResult(data));
    return pairedDefault;
};
export const renderPairedResultGridHHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showHGrid = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultGridVHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showVGrid = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]));
    return pairedDefault;
};
export const renderPairedResultRegionSimple = (el, id, title) => () => {
    shell.render(el, id, title,
        "* A Paired Result based graph where regions are present for High and Low data types. By default, regions are shown face-up.");
    const pairedDefault = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]);
    data.regions = {
        high: [
            regions.high[ 0 ]
        ],
        low: regions.low
    };
    pairedDefault.loadContent(Carbon.api.pairedResult(data));
    return pairedDefault;
};
export const renderPairedResultRegionMultiple = (el, id, title) => () => {
    shell.render(el, id, title, "* A Paired Result based graph where multiple regions are present for High data type. " +
        "By default, they are rendered face-up.");
    const pairedDefault = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_DEFAULT"));
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_DEFAULT").data[ 0 ]);
    data.regions = regions;
    pairedDefault.loadContent(Carbon.api.pairedResult(data));
    return pairedDefault;
};
export const renderMultiPairedResultRegion = (el, id, title) => () => {
    shell.render(el, id, title, "* A multiple Paired Result graph where regions are provided for High and Low data types. " +
        "By default, region is hidden unless hovered upon in the legend.");
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    axisData.axis.y2.show = true;
    const pairedTime = Carbon.api.graph(axisData);
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]);
    const dataAlt = utils.deepClone(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 1 ]);
    data.regions = multiRegion;
    dataAlt.regions = multiRegionAlt;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    pairedTime.loadContent(Carbon.api.pairedResult(dataAlt));
    return pairedTime;
};
