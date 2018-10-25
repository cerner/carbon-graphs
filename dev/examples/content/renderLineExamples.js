import {
    renderLine,
    renderLineBlankDataPoint,
    renderLineLabelHidden,
    renderLineLegendHidden,
    renderLineLegendItemDisabled,
    renderLineShapesHidden,
    renderLineTimeSeries,
    renderLineY2Axis,
    renderMultiLine
} from "../controls/line";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class LineExample extends ExampleControl {
    constructor() {
        super();
    }
}

const lineExampleSet = (exampleInstance, contentSection, setState) => {
    exampleInstance.load(
        renderLine(contentSection, "lineSimple", "Simple Line Graph")
    );
    exampleInstance.load(
        renderLineTimeSeries(contentSection, "lineTimeSeries", "Time-Series")
    );
    exampleInstance.load(renderLineY2Axis(contentSection, "lineY2", "Y2 Axis"));
    exampleInstance.load(
        renderLineLabelHidden(contentSection, "lineLabelHidden", "Label Hidden")
    );
    exampleInstance.load(
        renderLineLegendHidden(
            contentSection,
            "lineLegendHidden",
            "Legend Hidden"
        )
    );
    exampleInstance.load(
        renderLineLegendItemDisabled(
            contentSection,
            "lineLegendItemDisabled",
            "Legend Item Disabled"
        )
    );
    exampleInstance.load(
        renderLineShapesHidden(
            contentSection,
            "lineShapesHidden",
            "Shapes Hidden"
        )
    );
    exampleInstance.render();
    setState(exampleInstance);
    return exampleInstance;
};
export const triggerLineExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    lineExampleSet(instance, contentSection, setState);
};
export const triggerNonContiguousExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(
        renderLineBlankDataPoint(
            contentSection,
            "nonContiguousLine",
            "Non-Contiguous Data Points"
        )
    );
    instance.render();
    setState(instance);
};
export const triggerMultilineExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(
        renderMultiLine(contentSection, "multiLine", "Multi-Line Graph")
    );
    instance.render();
    setState(instance);
};
export const registerNonContiguousLineExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Non-Contiguous Line",
        "non-contiguous-line",
        triggerNonContiguousExample(
            instance,
            contentSection,
            setState,
            getState
        )
    );
export const registerMultiLineExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Multi-Line",
        "multiline",
        triggerMultilineExample(instance, contentSection, setState, getState)
    );
export const registerLineExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Line",
        "line",
        triggerLineExample(instance, contentSection, setState, getState)
    );
