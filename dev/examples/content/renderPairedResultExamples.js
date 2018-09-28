import {
    renderPairedResult,
    renderPairedResultLabelHidden,
    renderPairedResultLegendHidden,
    renderPairedResultLegendItemDisabled,
    renderPairedResultTimeseries,
    renderPairedResultY2Axis
} from "../controls/pairedResult";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class PairedResultExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderPairedResultExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Paired Result", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderPairedResult(
                contentSection,
                "pairedSimple",
                "Simple Paired Result Graph"
            )
        );
        instance.load(
            renderPairedResultTimeseries(
                contentSection,
                "pairedTimeSeries",
                "Time-Series"
            )
        );
        instance.load(
            renderPairedResultY2Axis(contentSection, "pairedY2", "Y2 Axis")
        );
        instance.load(
            renderPairedResultLabelHidden(
                contentSection,
                "pairedLabelHidden",
                "Label Hidden"
            )
        );
        instance.load(
            renderPairedResultLegendHidden(
                contentSection,
                "pairedLegendHidden",
                "Legend Hidden"
            )
        );
        instance.load(
            renderPairedResultLegendItemDisabled(
                contentSection,
                "pairedLegendItemDisabled",
                "Legend Item Disabled"
            )
        );
        instance.render();
        setState(instance);
    });
