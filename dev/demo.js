import "babel-polyfill";
import "../src/main/less/carbon.less";
import "./demo.less";
import {
    CombinationExample,
    renderCombinationGraphExamples
} from "./examples/content/renderCombinationGraphExamples";
import {
    CriticalityExample,
    renderCriticalityExamples
} from "./examples/content/renderCriticalityExamples";
import {
    LineExample,
    renderLineExamples,
    toggleLineAsActive
} from "./examples/content/renderLineExamples";
import {
    PairedResultExample,
    renderPairedResultExamples
} from "./examples/content/renderPairedResultExamples";
import {
    RegionsExample,
    renderRegionsExamples
} from "./examples/content/renderRegionsExamples";
import {
    renderShapesExamples,
    ShapesExample
} from "./examples/content/renderShapesExamples";
import { renderColorsExample } from "./examples/controls/colors";
import {
    btn,
    clearContent,
    renderRoot,
    renderRootSection,
    renderTooltip,
    toggleSectionAsActive
} from "./examples/helpers";

const root = document.querySelector("#root");

/* Render the root here.*/
renderRoot(root);
renderTooltip(root);
renderRootSection(root);
const toggleSection = root.querySelector(".nav-section");
const contentSection = root.querySelector(".content-section");
const _state = {
    currentSection: null
};
const setState = (val) => {
    _state.currentSection = val;
};
const getState = () => _state.currentSection;

/* Add examples (graph types) that needs to go inside the Nav bar
* Steps:
*   * Create a "control"
*   * Create a "content" to tie in control to the DOM
*   * Add the content function below
*/
renderLineExamples(new LineExample(), toggleSection, contentSection, setState, getState);
renderPairedResultExamples(new PairedResultExample(), toggleSection, contentSection, setState, getState);
renderCombinationGraphExamples(new CombinationExample(), toggleSection, contentSection, setState, getState);
renderRegionsExamples(new RegionsExample(), toggleSection, contentSection, setState, getState);
renderCriticalityExamples(new CriticalityExample(), toggleSection, contentSection, setState, getState);
renderShapesExamples(new ShapesExample(), toggleSection, contentSection, setState, getState);

btn.render(toggleSection, "Colors", (event) => {
    clearContent(contentSection, getState());
    toggleSectionAsActive(event.target);
    setState(null);
    renderColorsExample(contentSection, "graph-colors", "Colors");
});

/* Toggle Line in nav bar to show by default */
toggleLineAsActive(new LineExample(), contentSection, setState, getState)({
    target: toggleSection.querySelector(".carbon-btn")
});
