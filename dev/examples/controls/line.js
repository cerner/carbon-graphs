import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import {
    getAxes,
    getData
} from "../data";
import { shell } from "../helpers";

const tickValues = [
    new Date(2016, 0, 1, 1, 0).toISOString(),
    new Date(2016, 0, 1, 5, 0).toISOString(),
    new Date(2016, 0, 1, 10, 0).toISOString(),
    new Date(2016, 0, 1, 15, 0).toISOString(),
    new Date(2016, 0, 1, 20, 0).toISOString()
];

export const renderLine = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getAxes(`#${id}`, "LINE_DEFAULT"));
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineY2Axis = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.y2.show = true;
    const lineTime = Carbon.api.graph(axisData);
    lineTime.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]));
    lineTime.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_TIMESERIES").data[ 1 ]));
    return lineTime;
};
export const renderLineXHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.x.show = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineYHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.axis.y.show = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineXStaticTicks = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%H:%M:%S"
    };
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]));
    return lineDefault;
};
export const renderLineXAxisFormatted = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e %X %Y"
    };
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]));
    return lineDefault;
};
export const renderLineXAlternateLocale = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_TIMESERIES"));
    axisData.locale = Carbon.helpers.LOCALE.de_DE;
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%A %e %B %Y, %X"
    };
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]));
    return lineDefault;
};
export const renderLineLabelHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.showLabel = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineLegendHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.showLegend = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineLegendItemDisabled = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getAxes(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]);
    data.label.isDisabled = true;
    lineDefault.loadContent(Carbon.api.line(data));
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 4 ]));
    return lineDefault;
};
export const renderLineGridHHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.showHGrid = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineGridVHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.showVGrid = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderLineShapesHidden = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getAxes(`#${id}`, "LINE_DEFAULT"));
    axisData.showShapes = false;
    const lineDefault = Carbon.api.graph(axisData);
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    return lineDefault;
};
export const renderMultiLine = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getAxes(`#${id}`, "LINE_DEFAULT"));
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]));
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 1 ]))
        , 500);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 2 ]))
        , 1000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 3 ]))
        , 1500);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 4 ]))
        , 2000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 5 ]))
        , 2500);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 6 ]))
        , 3000);
    return lineDefault;
};
export const renderLineTimeSeries = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineTime = Carbon.api.graph(getAxes(`#${id}`, "LINE_TIMESERIES"));
    lineTime.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]));
    return lineTime;
};
