import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import utils from "../../../src/main/js/helpers/utils";
import { CUSTOM_CONTAINER_STYLE } from "../helpers";
import { createPanningControls } from "../panHelpers";

const tickValues = [
    new Date(2016, 0, 1, 2, 0).toISOString(),
    new Date(2016, 0, 1, 4, 0).toISOString(),
    new Date(2016, 0, 1, 6, 0).toISOString(),
    new Date(2016, 0, 1, 8, 0).toISOString(),
    new Date(2016, 0, 1, 10, 0).toISOString(),
    new Date(2016, 0, 1, 12, 0).toISOString(),
    new Date(2016, 0, 1, 14, 0).toISOString()
];

export const renderTimeline = (id) => {
    const timelineDefault = Carbon.api.timeline(
        getDemoData(`#${id}`, "TIMELINE")
    );
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[0]);
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[1]);
    return timelineDefault;
};
export const renderTimelineCustomContentPadding = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "TIMELINE"));
    data.showLegend = false;
    data.showLabel = false;

    data.padding = {
        left: 150,
        right: 300,
        top: 0,
        bottom: 0
    };
    const timelineDefault = Carbon.api.timeline(data);
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[0]);
    return timelineDefault;
};
export const renderTimelineCustomContainerPadding = (id) => {
    const containerElement = document.querySelector(`#${id}`);
    containerElement.setAttribute(
        "class",
        `${containerElement.getAttribute("class")} ${CUSTOM_CONTAINER_STYLE}`
    );

    const data = utils.deepClone(getDemoData(`#${id}`, "TIMELINE"));
    const timelineDefault = Carbon.api.timeline(data);
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[0]);
    return timelineDefault;
};
export const renderTimelinePanning = (id) => {
    let graph;
    const axisData = utils.deepClone(getDemoData(`#${id}`, "TIMELINE"));
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.pan = {
        enabled: true
    };
    const graphData = utils.deepClone(
        getDemoData(`#${id}`, "TIMELINE").data[1]
    );
    const createGraph = (axis, values) => {
        if (graph) {
            graph.destroy();
        }
        graph = Carbon.api.timeline(axis);
        graph.loadContent(values);
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
export const renderTimelineNoXAxisTickLabel = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "TIMELINE"));
    data.axis.x.ticks = {
        values: tickValues,
        format: ""
    };
    const timelineDefault = Carbon.api.timeline(data);
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[0]);
    return timelineDefault;
};
