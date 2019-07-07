import d3 from "d3";
import Carbon from "../../../src/main/js/carbon";
import { getBar, getHashedBar } from "../../../src/main/js/helpers/barType";
import styles from "../../../src/main/js/helpers/styles";
import utils from "../../../src/main/js/helpers/utils";
import { getShapes } from "../data";
import { h3, vector } from "../helpers";

const viewBoxSize = "0 0 1050 100";
const transformPoint = (i) => (scaleFactor = 1) =>
    `translate(${i * 100 + 20},${40}) scale(${scaleFactor})`;
const constructSVGObject = (shape, { posX = 1, posY = 1, scale = 1 }) => {
    const d3Shape = utils.deepClone(shape);
    d3Shape.options.x = shape.options.x * posX;
    d3Shape.options.y = shape.options.y * posY;
    d3Shape.options.scale = d3Shape.options.scale * scale;
    return d3Shape;
};
export const renderShapesSimple = (id) => {
    const sect = document.createElement("section");
    const svgElement = vector.render(sect, id, viewBoxSize);
    document.querySelector(`#${id}`).appendChild(sect);
    d3.select(svgElement)
        .append("g")
        .selectAll("path")
        .data(getShapes())
        .enter()
        .append((d, i) =>
            Carbon.tools
                .shape(constructSVGObject(Carbon.helpers.SHAPES[d], {}))
                .getShapeElement(
                    Carbon.tools.defaultSVGProps({
                        svgClassNames: styles.point,
                        transformFn: transformPoint(i)
                    })
                )
        );
};
export const renderCriticalityShapes = (id) => {
    const sect = document.createElement("section");
    const svgElement = vector.render(sect, id, viewBoxSize);
    document.querySelector(`#${id}`).appendChild(sect);

    const groupSVG = d3
        .select(svgElement)
        .append("g")
        .selectAll("g")
        .data(getShapes())
        .enter()
        .append("g");

    groupSVG.append((d, i) =>
        Carbon.tools
            .shape(constructSVGObject(Carbon.helpers.SHAPES[d], {}))
            .getShapeElement(
                Carbon.tools.defaultSVGProps({
                    svgClassNames: styles.criticalityOuterPoint,
                    transformFn: transformPoint(i)
                })
            )
    );
    groupSVG.append((d, i) =>
        Carbon.tools
            .shape(constructSVGObject(Carbon.helpers.SHAPES[d], {}))
            .getShapeElement(
                Carbon.tools.defaultSVGProps({
                    svgClassNames: styles.criticalityInnerPoint,
                    transformFn: transformPoint(i)
                })
            )
    );
    groupSVG.append((d, i) =>
        Carbon.tools
            .shape(constructSVGObject(Carbon.helpers.SHAPES[d], {}))
            .getShapeElement(
                Carbon.tools.defaultSVGProps({
                    svgClassNames: styles.point,
                    transformFn: transformPoint(i)
                })
            )
    );
};
export const renderFillTypes = (id) => {
    const shellElementId = document.querySelector(`#${id}`);
    h3.render(shellElementId, "Default");
    const barSVG = d3.select(
        vector.render(
            shellElementId,
            `${id}Bar`,
            "",
            "width: 100%; height: 50px"
        )
    );
    h3.render(shellElementId, "Hashed");
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
    const defsPath = hashSVG.append("defs");
    getBar(barSVG.append("g"), x, y, width, height, "fill: #007cc3;");
    getHashedBar(
        hashSVG,
        defsPath,
        hashSVG.append("g"),
        x,
        y,
        width,
        height,
        "fill: #007cc3"
    );
};
