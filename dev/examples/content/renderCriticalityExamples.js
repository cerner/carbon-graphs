import {
    renderCriticalityLineSimple,
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
        instance.load(renderCriticalityLineSimple(contentSection, "criticalityLineSimple", "Line"));
        instance.load(renderCriticalityPairedResultSimple(contentSection, "criticalityPairedSimple", "Paired Result"));
        instance.render();
        setState(instance);
    });
};
