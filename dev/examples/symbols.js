import d3 from "d3";
import Carbon from "../../src/main/js/carbon";
import { Symbol } from "../../src/main/js/core/index";
import { getSymbols } from "./data";

export const renderSymbols = (id) =>
    d3.select("#graph-symbols")
      .append("g")
      .attr("style", `fill: ${Carbon.helpers.COLORS.BLACK}`)
      .selectAll("path")
      .data(getSymbols())
      .enter()
      .append("path")
      .attr("d", (d) => {
          if (!Symbol.isBuiltAsAPath(d)) {
              return;
          }
          return new Symbol(d).getPathElement(300);
      })
      .attr("transform", (d, i) => {
          if (!Symbol.isBuiltAsAPath(d)) {
              return;
          }
          const scaleFactor = Symbol.isCustomPath(d)
              ? 2
              : 1;
          return `translate(${i * 100 + 20},${20}) scale(${scaleFactor})`;
      });
