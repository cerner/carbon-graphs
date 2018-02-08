import {
    renderCriticalityLineSimple,
    renderCriticalityMultiLine,
    renderCriticalityMultiPairedResult,
    renderCriticalityPairedResultSimple
} from "../controls/criticality";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class CriticalityExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderCriticalityExamples = (instance, toggleSection, contentSection, setState, getState) => {
    btn.render(toggleSection, "Criticality", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(renderCriticalityLineSimple(contentSection, "criticalityLineSimple", "Simple Line"));
        instance.load(renderCriticalityMultiLine(contentSection, "criticalityMultiLine", "Multi-line"));
        instance.load(renderCriticalityPairedResultSimple(contentSection, "criticalityPairedSimple", "Simple Paired Result"));
        instance.load(renderCriticalityMultiPairedResult(contentSection, "criticalityMultiPaired", "Multi Paired Result"));
        instance.render();
        setState(instance);
    });
};
