import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import { Shape } from "../../../src/main/js/core";
import {
    isNativeShape,
    isValidCarbonShape
} from "../../../src/main/js/core/Shape";
import { getShapes } from "../data";
import {
    h1,
    section,
    vector
} from "../helpers";

export const renderShapesExample = (el, id, title) => {
    const sect = section.render(el);
    h1.render(sect, title);
    vector.render(sect, id, "0 0 1050 200");
    d3.select(`#${id}`)
      .append("g")
      .attr("style", `fill: ${Carbon.helpers.COLORS.BLACK}`)
      .selectAll("path")
      .data(getShapes())
      .enter()
      .append("path")
      .attr("d", (d) => {
          if (!isValidCarbonShape(d)) {
              return;
          }
          return new Shape(d).getPathElement(500);
      })
      .attr("transform", (d, i) => {
          if (!isValidCarbonShape(d)) {
              return;
          }
          const scaleFactor = isNativeShape(d)
              ? 3
              : 1;
          return `translate(${i * 100 + 20},${100}) scale(${scaleFactor})`;
      });
};
