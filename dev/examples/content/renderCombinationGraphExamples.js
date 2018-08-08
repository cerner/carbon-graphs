import {
    renderCombinationSimple,
    renderCombinationBar
} from "../controls/combination";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class CombinationExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderCombinationGraphExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Combination Graph", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderCombinationSimple(
                contentSection,
                "combinationSimple",
                "Simple Combination Graph"
            )
        );
        instance.load(
            renderCombinationBar(
                contentSection,
                "combinationBar",
                "Bar Graph  With Line"
            )
        );
        instance.render();
        setState(instance);
    });
