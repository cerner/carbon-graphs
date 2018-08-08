import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { shell } from "../helpers";

const tickValues = [
    new Date(2018, 0, 1).toISOString(),
    new Date(2018, 0, 2).toISOString(),
    new Date(2018, 0, 3).toISOString(),
    new Date(2018, 0, 4).toISOString(),
    new Date(2018, 0, 5).toISOString(),
    new Date(2018, 0, 6).toISOString(),
    new Date(2018, 0, 7).toISOString()
];

export const renderBarDefault = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = {
        values: [1, 2, 3, 4, 5, 6, 7]
    };
    axisData.showVGrid = false;

    const barSimple = Carbon.api.graph(axisData);
    barSimple.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    return barSimple;
};

export const renderBarTimeSeries = (el, id, title) => () => {
    shell.render(el, id, title, "* A Bar graph with timeseries");
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e"
    };
    axisData.showVGrid = false;

    const barTime = Carbon.api.graph(axisData);
    barTime.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_TIMESERIES").data[0])
    );
    return barTime;
};

export const renderBarGroup = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = {
        values: [1, 2, 3, 4, 5, 6, 7]
    };
    axisData.showVGrid = false;

    const barGroup = Carbon.api.graph(axisData);
    barGroup.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[1])
    );
    barGroup.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    const content2 = Carbon.api.bar(
        getDemoData(`#${id}`, "BAR_DEFAULT").data[2]
    );
    barGroup.loadContent(content2);
    return barGroup;
};

export const renderBarStacked = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = {
        values: [1, 2, 3, 4, 5, 6, 7]
    };
    axisData.showVGrid = false;

    const barStacked = Carbon.api.graph(axisData);
    barStacked.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    barStacked.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[3])
    );
    barStacked.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[4])
    );
    return barStacked;
};

export const renderBarNegative = (el, id, title) => () => {
    shell.render(el, id, title, "* A Bar graph with negative data point");
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = {
        values: [1, 2, 3, 4, 5, 6, 7]
    };
    axisData.showVGrid = false;
    axisData.axis.y.lowerLimit = -15;
    axisData.axis.y.upperLimit = 0;
    const barNegative = Carbon.api.graph(axisData);
    barNegative.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[5])
    );
    return barNegative;
};
