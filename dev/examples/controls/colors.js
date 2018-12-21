import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import { h2, section, vector } from "../helpers";

export const renderColorsExample = (el, id, title) => {
    const sect = section.render(el);
    h2.render(sect, title);
    vector.render(sect, id, "0 0 1080 150");
    d3.select(`#${id}`)
        .attr("style", "background: #dedfe0;", true)
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
