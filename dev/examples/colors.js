import d3 from "d3";
import Carbon from "../../src/main/js/carbon";

export const renderColors = (id) =>
    d3.select(id)
      .append("g")
      .selectAll("circle")
      .data(Object.keys(Carbon.helpers.COLORS))
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("cx", (d, i) => i * 85 + 25)
      .attr("cy", () => 15)
      .attr("style", (d) => `fill: ${Carbon.helpers.COLORS[ d ]};`);
