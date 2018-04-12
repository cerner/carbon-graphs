import {
    renderGantt,
    renderGanttAction,
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

export const renderGanttExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Gantt", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderGantt(contentSection, "ganttSimple", "Simple Gantt")
        );
        instance.load(
            renderGanttAction(contentSection, "ganttAction", "Actions")
        );
        instance.load(
            renderGanttTruncate(
                contentSection,
                "ganttTruncate",
                "Label Truncation"
            )
        );
        instance.render();
        setState(instance);
    });
