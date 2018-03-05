import {
    renderPairedResult,
    renderPairedResultGridHHidden,
    renderPairedResultGridVHidden,
    renderPairedResultLabelHidden,
    renderPairedResultLegendHidden,
    renderPairedResultLegendItemDisabled,
    renderPairedResultTimeseries,
    renderPairedResultXAlternateLocale,
    renderPairedResultXAxisFormatted,
    renderPairedResultXHidden,
    renderPairedResultXStaticTicks,
    renderPairedResultY2Axis,
    renderPairedResultYHidden
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
            renderPairedResultXHidden(
                contentSection,
                "pairedXHidden",
                "X Axis Hidden"
            )
        );
        instance.load(
            renderPairedResultYHidden(
                contentSection,
                "pairedYHidden",
                "Y Axis Hidden"
            )
        );
        instance.load(
            renderPairedResultXStaticTicks(
                contentSection,
                "pairedXStaticTick",
                "Static X Axis Ticks"
            )
        );
        instance.load(
            renderPairedResultXAxisFormatted(
                contentSection,
                "pairedXFormattedTick",
                "X Axis Ticks Formatted"
            )
        );
        instance.load(
            renderPairedResultXAlternateLocale(
                contentSection,
                "pairedXAltLocale",
                "X Axis Alternate Locale"
            )
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
        instance.load(
            renderPairedResultGridHHidden(
                contentSection,
                "pairedGridHHidden",
                "Horizontal Grid Hidden"
            )
        );
        instance.load(
            renderPairedResultGridVHidden(
                contentSection,
                "pairedGridVHidden",
                "Vertical Grid Hidden"
            )
        );
        instance.render();
        setState(instance);
    });
