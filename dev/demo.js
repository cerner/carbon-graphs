import "babel-polyfill";
import "../src/main/less/carbon.less";
import "./demo.less";
import { renderColorsExample } from "./examples/controls/ColorsExample";
import { renderLineExample } from "./examples/controls/LineExample";
import { renderPairedResultExample } from "./examples/controls/PairedResultExample";
import { renderSymbolsExample } from "./examples/controls/SymbolsExample";
import {
    div,
    header
} from "./examples/helpers";

const renderRoot = (el) => {
    header.render(el, "Carbon");
    div.render(el, "tooltip", "tooltip", "display: none;");
};
const root = document.querySelector("#root");

renderRoot(root);
renderLineExample(root);
renderPairedResultExample(root);
renderSymbolsExample(root);
renderColorsExample(root);
