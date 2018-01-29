import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import {
    h2,
    section,
    vector
} from "../helpers";

export const renderColorsExample = (el, id, title) => {
    const sect = section.render(el);
    h2.render(sect, title);
    vector.render(sect, id, "0 0 1050 200");
    d3.select(`#${id}`)
      .append("g")
      .selectAll("circle")
      .data(Object.keys(Carbon.helpers.COLORS))
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("cx", (d, i) => i * 85 + 25)
      .attr("cy", () => 100)
      .attr("style", (d) => `fill: ${Carbon.helpers.COLORS[ d ]};`);
};
