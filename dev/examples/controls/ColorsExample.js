import { renderColors } from "../colors";
import {
    h3,
    section,
    vector
} from "../helpers";

export const renderColorsExample = (root) => {
    const sect = section.render(root);
    h3.render(sect, "Colors");
    vector.render(sect, "graph-colors", "0 0 1000 60");
    renderColors("#graph-colors");
};
