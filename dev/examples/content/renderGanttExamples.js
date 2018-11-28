import {
    renderGantt,
    renderGanttAction,
    renderGanttEvents,
    renderGanttActivities,
    renderGanttPercentage,
    renderGanttStyle,
    renderGanttTruncate
} from "../controls/gantt";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class GanttExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const triggerGanttExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(renderGantt(contentSection, "ganttSimple", "Simple Gantt"));
    instance.load(
        renderGanttActivities(
            contentSection,
            "ganttActivities",
            "Tasks and Activities"
        )
    );
    instance.load(
        renderGanttPercentage(contentSection, "ganttPercentage", "Percentage")
    );
    instance.load(renderGanttAction(contentSection, "ganttAction", "Actions"));
    instance.load(renderGanttEvents(contentSection, "ganttEvent", "Events"));
    instance.load(renderGanttStyle(contentSection, "ganttStyles", "Bar types"));
    instance.load(
        renderGanttTruncate(contentSection, "ganttTruncate", "Label Truncation")
    );
    instance.render();
    setState(instance);
};
export const registerGanttExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Gantt",
        "gantt",
        triggerGanttExample(instance, contentSection, setState, getState)
    );
