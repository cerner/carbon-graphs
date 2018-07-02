import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import { shell } from "../helpers";

export const renderTimeline = (el, id, title) => () => {
    shell.render(el, id, title);
    const timelineDefault = Carbon.api.timeline(
        getDemoData(`#${id}`, "TIMELINE")
    );
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[0]);
    timelineDefault.loadContent(getDemoData(`#${id}`, "TIMELINE").data[1]);
    return timelineDefault;
};
