import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import {
    getBar,
    getChunk,
    getHashedBar,
    getPercentageBar
} from "../../../src/main/js/controls/Gantt/helpers/barTypeHelpers";
import { isNativeShape } from "../../../src/main/js/core/Shape";
import styles from "../../../src/main/js/helpers/styles";
import { getShapes } from "../data";
import { h3, shell, vector } from "../helpers";

const viewBoxSize = "0 0 1050 100";
const transformPoint = (scaleFactor = 3) => (d, i) =>
    `translate(${i * 100 + 20},${25}) scale(${
        isNativeShape(d) ? scaleFactor : 1
    })`;
export const renderShapesSimple = (el, id, title) => {
    shell.render(el, id, title);
    vector.render(document.querySelector(`#${id}`), `${id}Items`, viewBoxSize);
    d3
        .select(`#${id}Items`)
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
    const groupSVG = d3
        .select(`#${id}Items`)
        .append("g")
        .selectAll("g")
        .data(getShapes())
        .enter()
        .append("g");
    groupSVG
        .append("path")
        .classed(styles.criticalityOuterPoint, true)
        .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(24 * 25))
        .attr("transform", transformPoint(3));
    groupSVG
        .append("path")
        .classed(styles.criticalityInnerPoint, true)
        .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(15 * 25))
        .attr("transform", transformPoint(2));
    groupSVG
        .append("path")
        .attr("d", (d) => Carbon.tools.shape(d).getPathDescription(9 * 25))
        .attr("transform", transformPoint(1.5));
};
export const renderShapesAsSVG = (el, id, title) => {
    const section = shell.render(el, id, title);
    getShapes().forEach((i) =>
        section.appendChild(
            Carbon.tools
                .shape(i)
                .getShapeElement({ svgClassNames: "svg-shape" })
        )
    );
};
export const renderGanttBarTypes = (el, id, title) => {
    shell.render(el, id, title);
    const getPercentage = (p, w) => p * w / 100;
    const shellElementId = document.querySelector(`#${id}`);
    h3.render(shellElementId, "Normal Bar");
    const barSVG = d3.select(
        vector.render(
            shellElementId,
            `${id}Bar`,
            "",
            "width: 100%; height: 50px"
        )
    );
    h3.render(shellElementId, "Chunk");
    const chunkSVG = d3.select(
        vector.render(
            shellElementId,
            `${id}Chunk`,
            "",
            "width: 100%; height: 50px"
        )
    );
    h3.render(shellElementId, "Percentage Bar");
    const percentageSVG = d3.select(
        vector.render(
            shellElementId,
            `${id}Percentage`,
            "",
            "width: 100%; height: 50px"
        )
    );
    h3.render(shellElementId, "Hashed Bar");
    const hashSVG = d3.select(
        vector.render(
            shellElementId,
            `${id}Hash`,
            "",
            "width: 100%; height: 50px"
        )
    );
    const x = 10;
    const y = 10;
    const width = 400;
    const height = 30;
    const percentage = 75;
    const defsPath = hashSVG.append("defs");

    getBar(barSVG.append("g"), x, y, width, height, "fill: #007cc3;");
    getChunk(chunkSVG.append("g"), x, y, width, height, "fill: #007cc3;");
    getPercentageBar(
        percentageSVG.append("g"),
        x,
        y,
        width,
        height,
        getPercentage(percentage, width),
        "#ed5e00"
    );
    getHashedBar(defsPath, hashSVG.append("g"), x, y, width, height, "#007cc3");
};
