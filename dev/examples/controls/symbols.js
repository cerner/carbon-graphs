import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import { Symbol } from "../../../src/main/js/core";
import {
    isNativeSymbol,
    isValidCarbonSymbol
} from "../../../src/main/js/core/Symbol";
import { getSymbols } from "../data";
import {
    h1,
    section,
    vector
} from "../helpers";

export const renderSymbolsExample = (el, id, title) => {
    const sect = section.render(el);
    h1.render(sect, title);
    vector.render(sect, id, "0 0 1050 200");
    d3.select(`#${id}`)
      .append("g")
      .attr("style", `fill: ${Carbon.helpers.COLORS.BLACK}`)
      .selectAll("path")
      .data(getSymbols())
      .enter()
      .append("path")
      .attr("d", (d) => {
          if (!isValidCarbonSymbol(d)) {
              return;
          }
          return new Symbol(d).getPathElement(500);
      })
      .attr("transform", (d, i) => {
          if (!isValidCarbonSymbol(d)) {
              return;
          }
          const scaleFactor = isNativeSymbol(d)
              ? 3
              : 1;
          return `translate(${i * 100 + 20},${100}) scale(${scaleFactor})`;
      });
};
