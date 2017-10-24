import {
    h3,
    section,
    vector
} from "../helpers";
import { renderSymbols } from "../symbols";

export const renderSymbolsExample = (root) => {
    const sect = section.render(root);
    h3.render(sect, "Symbols");
    vector.render(sect, "graph-symbols", "0 0 1050 50");
    renderSymbols("#graph-symbols");

};
