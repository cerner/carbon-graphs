import { renderColorsExample } from "../controls/colors";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class ColorsExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const triggerColorsExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    setState(null);
    renderColorsExample(contentSection, "graph-colors", "Colors");
};
export const registerColorsExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Colors",
        "colors",
        triggerColorsExample(instance, contentSection, setState, getState)
    );
