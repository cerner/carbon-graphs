import {
    renderLine,
    renderLineBlankDataPoint,
    renderLineGridHHidden,
    renderLineGridVHidden,
    renderLineLabelHidden,
    renderLineLegendHidden,
    renderLineLegendItemDisabled,
    renderLineShapesHidden,
    renderLineTimeSeries,
    renderLineXAlternateLocale,
    renderLineXAxisFormatted,
    renderLineXHidden,
    renderLineXStaticTicks,
    renderLineY2Axis,
    renderLineYHidden,
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

const exampleSet = (exampleInstance, contentSection, setState) => {
    exampleInstance.load(renderLine(contentSection, "lineSimple", "Simple Line Graph"));
    exampleInstance.load(renderMultiLine(contentSection, "multiLine", "Multi-line Graph"));
    exampleInstance.load(renderLineTimeSeries(contentSection, "lineTimeSeries", "Time-Series"));
    exampleInstance.load(renderLineY2Axis(contentSection, "lineY2", "Y2 Axis"));
    exampleInstance.load(renderLineBlankDataPoint(contentSection, "lineBlankDataPoint", "Non-Contiguous Data"));
    exampleInstance.load(renderLineXHidden(contentSection, "lineXHidden", "X Axis Hidden"));
    exampleInstance.load(renderLineYHidden(contentSection, "lineYHidden", "Y Axis Hidden"));
    exampleInstance.load(renderLineXStaticTicks(contentSection, "lineXStaticTick", "Static X Axis Ticks"));
    exampleInstance.load(renderLineXAxisFormatted(contentSection, "lineXFormattedTick", "X Axis Ticks Formatted"));
    exampleInstance.load(renderLineXAlternateLocale(contentSection, "lineXAltLocale", "X Axis Alternate Locale"));
    exampleInstance.load(renderLineLabelHidden(contentSection, "lineLabelHidden", "Label Hidden"));
    exampleInstance.load(renderLineLegendHidden(contentSection, "lineLegendHidden", "Legend Hidden"));
    exampleInstance.load(renderLineLegendItemDisabled(contentSection, "lineLegendItemDisabled", "Legend Item Disabled"));
    exampleInstance.load(renderLineGridHHidden(contentSection, "lineGridHHidden", "Horizontal Grid Hidden"));
    exampleInstance.load(renderLineGridVHidden(contentSection, "lineGridVHidden", "Vertical Grid Hidden"));
    exampleInstance.load(renderLineShapesHidden(contentSection, "lineShapesHidden", "Shapes Hidden"));
    exampleInstance.render();
    setState(exampleInstance);
    return exampleInstance;
};
export const toggleLineAsActive = (instance, contentSection, setState, getState) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    exampleSet(instance, contentSection, setState);
};
export const renderLineExamples = (instance, toggleSection, contentSection, setState, getState) =>
    btn.render(toggleSection, "Line", toggleLineAsActive(instance, contentSection, setState, getState));
