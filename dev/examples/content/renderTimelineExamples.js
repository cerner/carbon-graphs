import { renderTimeline } from "../controls/timeline";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class TimelineExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderTimelineExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Timeline", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderTimeline(
                contentSection,
                "TimelineSimple",
                "Simple Timeline Graph"
            )
        );
        instance.render();
        setState(instance);
    });
