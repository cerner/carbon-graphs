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

export const renderGridExamples = (
    instance,
    toggleSection,
    contentSection,
    setState,
    getState
) =>
    btn.render(toggleSection, "Grid", (event) => {
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
    });
