import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import { isNativeShape } from "../../../src/main/js/core/Shape";
import styles from "../../../src/main/js/helpers/styles";
import { getShapes } from "../data";
import {
    shell,
    vector
} from "../helpers";

const viewBoxSize = "0 0 1050 100";
const transformPoint = (scaleFactor = 3) =>
    (d, i) => `translate(${i * 100 + 20},${25}) scale(${isNativeShape(d) ? scaleFactor : 1})`;
export const renderShapesSimple = (el, id, title) => {
    shell.render(el, id, title);
    vector.render(document.querySelector(`#${id}`), `${id}Items`, viewBoxSize);
    d3.select(`#${id}Items`)
      .append("g")
      .selectAll("path")
      .data(getShapes())
      .enter()
      .append("path")
      .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(500))
      .attr("transform", transformPoint());
};
export const renderCriticalityShapes = (el, id, title) => {
    shell.render(el, id, title);
    vector.render(document.querySelector(`#${id}`), `${id}Items`, viewBoxSize);
    const groupSVG = d3.select(`#${id}Items`)
                       .append("g")
                       .selectAll("g")
                       .data(getShapes())
                       .enter()
                       .append("g");
    groupSVG.append("path")
            .classed(styles.criticalityOuterPoint, true)
            .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(24 * 25))
            .attr("transform", transformPoint(3));
    groupSVG.append("path")
            .classed(styles.criticalityInnerPoint, true)
            .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(15 * 25))
            .attr("transform", transformPoint(2));
    groupSVG.append("path")
            .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(9 * 25))
            .attr("transform", transformPoint(1.5));
};
export const renderShapesAsSVG = (el, id, title) => {
    const section = shell.render(el, id, title);
    getShapes().forEach((i) => section.appendChild(Carbon.tools.shape(i).getShapeElement({ svgClassNames: "shape--normal" })));
};
