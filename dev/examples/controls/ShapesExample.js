import {
    h3,
    section,
    vector
} from "../helpers";
import { renderShapes } from "../shapes";

export const renderShapesExample = (root) => {
    const sect = section.render(root);
    h3.render(sect, "Shapes");
    vector.render(sect, "graph-shapes", "0 0 1050 50");
    renderShapes("#graph-shapes");

};
