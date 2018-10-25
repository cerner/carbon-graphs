import { renderSplineLine } from "../controls/spline";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class SplineExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const triggerSplineExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(
        renderSplineLine(
            contentSection,
            "splineLineSimple",
            "Simple Spline Line Graph"
        )
    );
    instance.render();
    setState(instance);
};
export const registerSplineExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Spline",
        "spline",
        triggerSplineExample(instance, contentSection, setState, getState)
    );
