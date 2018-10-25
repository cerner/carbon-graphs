import {
    renderCombinationBar,
    renderCombinationSimple
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

export const triggerCombinationGraphExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
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
};
export const registerCombinationGraphExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Combination Graph",
        "combination-graph",
        triggerCombinationGraphExample(
            instance,
            contentSection,
            setState,
            getState
        )
    );
