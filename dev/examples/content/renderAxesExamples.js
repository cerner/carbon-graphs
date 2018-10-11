import {
    renderLineXAlternateLocale,
    renderLineXAxisFormatted,
    renderLineXHidden,
    renderLineXStaticTicks,
    renderLineYHidden,
    renderLineDateTimeBuckets
} from "../controls/line";
import {
    renderPairedResultXAlternateLocale,
    renderPairedResultXAxisFormatted,
    renderPairedResultXHidden,
    renderPairedResultXStaticTicks,
    renderPairedResultYHidden,
    renderPairedResultDateTimeBuckets
} from "../controls/pairedResult";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";
import { renderGanttDateTimeBuckets } from "../controls/gantt";

export class AxesExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderAxesExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Axes", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(
            renderLineXHidden(
                contentSection,
                "lineXHidden",
                "Line - X Axis Hidden"
            )
        );
        instance.load(
            renderLineYHidden(
                contentSection,
                "lineYHidden",
                "Line - Y Axis Hidden"
            )
        );
        instance.load(
            renderLineXStaticTicks(
                contentSection,
                "lineXStaticTick",
                "Line - Static X Axis Ticks"
            )
        );
        instance.load(
            renderLineXAxisFormatted(
                contentSection,
                "lineXFormattedTick",
                "Line - X Axis Ticks Formatted"
            )
        );
        instance.load(
            renderLineXAlternateLocale(
                contentSection,
                "lineXAltLocale",
                "Line - X Axis Alternate Locale"
            )
        );
        instance.load(
            renderLineDateTimeBuckets(
                contentSection,
                "lineDateTimeBuckets",
                "Line - Datetime Buckets"
            )
        );

        instance.load(
            renderPairedResultXHidden(
                contentSection,
                "pairedXHidden",
                "Paired Result - X Axis Hidden"
            )
        );
        instance.load(
            renderPairedResultYHidden(
                contentSection,
                "pairedYHidden",
                "Paired Result - Y Axis Hidden"
            )
        );
        instance.load(
            renderPairedResultXStaticTicks(
                contentSection,
                "pairedXStaticTick",
                "Paired Result - Static X Axis Ticks"
            )
        );
        instance.load(
            renderPairedResultXAxisFormatted(
                contentSection,
                "pairedXFormattedTick",
                "Paired Result - X Axis Ticks Formatted"
            )
        );
        instance.load(
            renderPairedResultXAlternateLocale(
                contentSection,
                "pairedXAltLocale",
                "Paired Result - X Axis Alternate Locale"
            )
        );
        instance.load(
            renderPairedResultDateTimeBuckets(
                contentSection,
                "pairedXDateTimeBuckets",
                "Paired Result - Datetime Buckets"
            )
        );

        instance.load(
            renderGanttDateTimeBuckets(
                contentSection,
                "ganttDateTimeBuckets",
                "Gantt Datetime Buckets"
            )
        );
        instance.render();
        setState(instance);
    });
