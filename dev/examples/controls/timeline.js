import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import utils from "../../../src/main/js/helpers/utils";

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
