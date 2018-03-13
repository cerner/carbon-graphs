import { renderGantt } from "../controls/gantt";
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
        instance.render();
        setState(instance);
    });
