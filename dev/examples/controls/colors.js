import * as d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import { vector } from "../helpers";

export const renderColorsExample = (id) => {
    const sect = document.createElement("section");
    sect.setAttribute("class", "shape-container");
    const svgElement = vector.render(sect, id, "0 0 1080 150");
    document.querySelector(`#${id}`).appendChild(sect);
    d3.select(svgElement)
        .attr("style", "background: #fafafa; margin: 1rem;", true)
        .append("g")
        .selectAll("circle")
        .data(Object.keys(Carbon.helpers.COLORS))
        .enter()
        .append("circle")
        .attr("r", 20)
        .attr("cx", (d, i) => i * 85 + 25)
        .attr("cy", () => 75)
        .attr("style", (d) => `fill: ${Carbon.helpers.COLORS[d]};`);
};
