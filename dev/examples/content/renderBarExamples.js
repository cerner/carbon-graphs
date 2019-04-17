import {
    renderBarDefault,
    renderBarGroup,
    renderBarNegative,
    renderBarStacked,
    renderBarTimeSeries,
    renderSimpleBarAxisInfoTextLabels,
    renderStackedBarAxisInfoTextLabels
} from "../controls/bar";

import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class BarExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const triggerBarExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(
        renderBarDefault(contentSection, "barDefault", "Bar - Simple bar")
    );
    instance.load(
        renderBarTimeSeries(contentSection, "barTimeSeries", "Bar - TimeSeries")
    );
    instance.load(
        renderBarGroup(contentSection, "barGroup", "Bar - Grouped bars")
    );
    instance.load(
        renderBarStacked(contentSection, "barStacked", "Bar - Stacked bars")
    );
    instance.load(
        renderBarNegative(contentSection, "barNegative", "Bar - Negative bars")
    );
    instance.load(
        renderSimpleBarAxisInfoTextLabels(
            contentSection,
            "barSimpleAxisInfoTextLabels",
            "Bar - Simple - Axis Info Text Labels"
        )
    );
    instance.load(
        renderStackedBarAxisInfoTextLabels(
            contentSection,
            "barStackedAxisInfoTextLabels",
            "Bar - Stacked - Axis Info Text Labels"
        )
    );
    instance.render();
    setState(instance);
};
export const registerBarExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Bar",
        "bar",
        triggerBarExample(instance, contentSection, setState, getState)
    );
