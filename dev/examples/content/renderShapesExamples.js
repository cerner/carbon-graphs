import {
    renderCriticalityShapes,
    renderShapesSimple
} from "../controls/shapes";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class ShapesExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderShapesExamples = (instance, toggleSection, contentSection, setState, getState) => {
    btn.render(toggleSection, "Shapes", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        renderShapesSimple(contentSection, "ShapesSimple", "Simple");
        renderCriticalityShapes(contentSection, "criticalityShapes", "Criticality");
        setState(instance);
    });
};
