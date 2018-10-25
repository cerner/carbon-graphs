import { renderLineGridHHidden, renderLineGridVHidden } from "../controls/line";
import {
    renderPairedResultGridHHidden,
    renderPairedResultGridVHidden
} from "../controls/pairedResult";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class GridExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const triggerGridExample = (
    instance,
    contentSection,
    setState,
    getState
) => (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    instance.load(
        renderLineGridHHidden(
            contentSection,
            "lineGridHHidden",
            "Line - Horizontal Grid Hidden"
        )
    );
    instance.load(
        renderLineGridVHidden(
            contentSection,
            "lineGridVHidden",
            "Line - Vertical Grid Hidden"
        )
    );
    instance.load(
        renderPairedResultGridHHidden(
            contentSection,
            "pairedGridHHidden",
            "Paired Result - Horizontal Grid Hidden"
        )
    );
    instance.load(
        renderPairedResultGridVHidden(
            contentSection,
            "pairedGridVHidden",
            "Paired Result - Vertical Grid Hidden"
        )
    );
    instance.render();
    setState(instance);
};
export const registerGridExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(
        toggleSection,
        "Grid",
        "grid",
        triggerGridExample(instance, contentSection, setState, getState)
    );
