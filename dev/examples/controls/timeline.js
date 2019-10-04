import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import utils from "../../../src/main/js/helpers/utils";
import { createPanningControls } from "./panHelpers";

export const renderTimeline = (id) => {
    const timelineDefault = Carbon.api.timeline(
        getDemoData(`#${id}`, "TIMELINE")
    );
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[0]);
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[1]);
    return timelineDefault;
};
export const renderTimelineCustomPadding = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "TIMELINE"));
    data.showLegend = false;
    data.axis.x.show = false;
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
