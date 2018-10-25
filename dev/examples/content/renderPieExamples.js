import {
    renderPieMultiple,
    renderPieSimple,
    renderPieUnload
} from "../controls/pie";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class PieExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderPieExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Pie", "pie", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderPieSimple(contentSection, "pieSimple", "Pie - Simple")
        );
        instance.load(
            renderPieMultiple(contentSection, "pieMultiple", "Pie - Multiple")
        );
        instance.load(
            renderPieUnload(contentSection, "pieUnload", "Pie - Unload")
        );
        instance.render();
        setState(instance);
    });
