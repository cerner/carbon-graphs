import { renderBarTimeSeriesXOrientationTop } from "../controls/bar";
import {
    renderGanttCustomPadding,
    renderGanttDateTimeBuckets
} from "../controls/gantt";
import {
    renderLineDateTimeBuckets,
    renderLineXAlternateLocale,
    renderLineXAxisFormatted,
    renderLineXHidden,
    renderLineXOrientationTop,
    renderLineXStaticTicks,
    renderLineYHidden
} from "../controls/line";
import {
    renderPairedResultDateTimeBuckets,
    renderPairedResultXAlternateLocale,
    renderPairedResultXAxisFormatted,
    renderPairedResultXHidden,
    renderPairedResultXOrientationTop,
    renderPairedResultXStaticTicks,
    renderPairedResultYHidden
} from "../controls/pairedResult";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class AxesExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const triggerAxesExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(
        renderLineXHidden(contentSection, "lineXHidden", "Line - X Axis Hidden")
    );
    instance.load(
        renderLineYHidden(contentSection, "lineYHidden", "Line - Y Axis Hidden")
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
        renderLineXOrientationTop(
            contentSection,
            "lineXtop",
            "Line - X Axis Orientation Top"
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
        renderPairedResultXOrientationTop(
            contentSection,
            "pairedXTop",
            "Paired Result - X Axis Orientation Top"
        )
    );

    instance.load(
        renderGanttDateTimeBuckets(
            contentSection,
            "ganttDateTimeBuckets",
            "Gantt - Datetime Buckets"
        )
    );
    instance.load(
        renderGanttCustomPadding(
            contentSection,
            "ganttCustomPadding",
            "Gantt - Custom Padding"
        )
    );

    instance.load(
        renderBarTimeSeriesXOrientationTop(
            contentSection,
            "barXTop",
            "Bar - X Axis Orientation Top"
        )
    );
    instance.render();
    setState(instance);
};
export const registerAxesExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Axes",
        "axes",
        triggerAxesExample(instance, contentSection, setState, getState)
    );
