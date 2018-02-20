import { renderCombinationRegion } from "../controls/combination";
import {
    renderGoalLine,
    renderLineRegionMultiple,
    renderLineRegionNoLower,
    renderLineRegionNoUpper,
    renderLineRegionSimple,
    renderLineRegionY2,
    renderMultiLineRegion
} from "../controls/line";
import {
    renderMultiPairedResultRegion,
    renderPairedResultRegionMultiple,
    renderPairedResultRegionSimple
} from "../controls/pairedResult";
import {
    btn,
    clearContent,
    ExampleControl,
    toggleSectionAsActive
} from "../helpers";

export class RegionsExample extends ExampleControl {
    constructor() {
        super();
    }
}

export const renderRegionsExamples = (instance, toggleSection, contentSection, setState, getState) =>
    btn.render(toggleSection, "Regions", (event) => {
        clearContent(contentSection, getState());
        toggleSectionAsActive(event.target);
        instance.load(renderLineRegionSimple(contentSection, "lineRegionSimple", "Line - Simple"));
        instance.load(renderPairedResultRegionSimple(contentSection, "pairedRegionSimple", "Paired Result - Simple"));
        instance.load(renderCombinationRegion(contentSection, "combinationRegion", "Combination - Simple"));
        instance.load(renderMultiLineRegion(contentSection, "multiLineRegion", "Multi-Line"));
        instance.load(renderMultiPairedResultRegion(contentSection, "multiPairedRegion", "Multi-Paired Result"));
        instance.load(renderLineRegionMultiple(contentSection, "lineRegionMultiple", "Line - Multiple Regions"));
        instance.load(renderPairedResultRegionMultiple(contentSection, "pairedRegionMultiple", "Paired Result - Multiple Regions"));
        instance.load(renderLineRegionY2(contentSection, "lineRegionY2", "Line - Y2"));
        instance.load(renderGoalLine(contentSection, "goalLine", "Line - Goal-line"));
        instance.load(renderLineRegionNoLower(contentSection, "lineRegionNoLower", "Line - No Lower Bound"));
        instance.load(renderLineRegionNoUpper(contentSection, "lineRegionNoUpper", "Line - No Upper Bound"));
        instance.render();
        setState(instance);
    });
