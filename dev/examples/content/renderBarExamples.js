import {
    renderBarDefault,
    renderBarGroup,
    renderBarNegative,
    renderBarStacked,
    renderBarTimeSeries
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

export const renderBarExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Bar", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderBarDefault(contentSection, "barDefault", "Bar - Simple bar")
        );
        instance.load(
            renderBarTimeSeries(
                contentSection,
                "barTimeSeries",
                "Bar - TimeSeries"
            )
        );
        instance.load(
            renderBarGroup(contentSection, "barGroup", "Bar - Grouped bars")
        );
        instance.load(
            renderBarStacked(contentSection, "barStacked", "Bar - Stacked bars")
        );
        instance.load(
            renderBarNegative(
                contentSection,
                "barNegative",
                "Bar - Negative bars"
            )
        );
        instance.render();
        setState(instance);
    });
