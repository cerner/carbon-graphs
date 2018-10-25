import {
    renderCriticalityShapes,
    renderFillTypes,
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

export const triggerShapesExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    renderShapesSimple(contentSection, "ShapesSimple", "Simple");
    renderCriticalityShapes(contentSection, "criticalityShapes", "Criticality");
    renderFillTypes(contentSection, "FillTypes", "Fill types");
    setState(instance);
};
export const registerShapesExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Shapes",
        "shapes",
        triggerShapesExample(instance, contentSection, setState, getState)
    );
