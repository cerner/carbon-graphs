"use strict";
import { getColorForTarget } from "../../../main/js/controls/Graph/helpers/helpers";
import { Shape } from "../../../main/js/core";
import constants, { SHAPES } from "../../../main/js/helpers/constants";
import styles from "../../../main/js/helpers/styles";

describe("Shape", () => {
    it("returns path for d3 shape", () => {
        expect(
            Object.keys(constants.D3_INBUILT_SHAPE).every((i) =>
                new Shape(i).getPathDescription()
            )
        ).toBeTruthy();
    });
    it("returns path for carbon shape", () => {
        expect(
            Object.keys(constants.CUSTOM_SHAPE_PATH).every((i) =>
                new Shape(i).getPathDescription()
            )
        ).toBeTruthy();
    });
    it("throws error if unknown shape is queried", () => {
        expect(() => {
            new Shape("NewShape").getPathDescription();
        }).toThrow();
    });
    describe("Moveto path", () => {
        it("tear drop", () => {
            expect(new Shape(SHAPES.TEAR_DROP).getPathDescription()).toBe(
                constants.CUSTOM_SHAPE_PATH.TEAR_DROP
            );
        });
        it("tear drop alternate", () => {
            expect(new Shape(SHAPES.TEAR_ALT).getPathDescription()).toBe(
                constants.CUSTOM_SHAPE_PATH.TEAR_ALT
            );
        });
        it("x shape", () => {
            expect(new Shape(SHAPES.X).getPathDescription()).toBe(
                constants.CUSTOM_SHAPE_PATH.X
            );
        });
        it("rhombus shape", () => {
            expect(new Shape(SHAPES.RHOMBUS).getPathDescription()).toBe(
                constants.CUSTOM_SHAPE_PATH.RHOMBUS
            );
        });
        it("vertical bar shape", () => {
            expect(new Shape(SHAPES.VERTICAL_BAR).getPathDescription()).toBe(
                constants.CUSTOM_SHAPE_PATH.VERTICAL_BAR
            );
        });
    });
    describe("returns svg element correctly", () => {
        const createShape = (shape) =>
            new Shape(shape).getShapeElement({
                svgClassNames: styles.legendItemIcon,
                pathStyles: `fill: ${getColorForTarget(
                    constants.DEFAULT_COLOR
                )}`
            });
        it("throws no error when shape is valid", () => {
            expect(() =>
                Object.keys(SHAPES).map((s) => createShape(s))
            ).not.toThrowError();
        });
        it("throws error when invalid shape is used", () => {
            expect(() => createShape("NewShape")).toThrowError();
        });
        it("gets svg", () => {
            const svgElement = createShape("CIRCLE");
            expect(svgElement.getAttribute("viewBox")).toBe(
                constants.VIEW_BOX_SIZE
            );
            expect(svgElement.getAttribute("style")).toBe("");
            expect(svgElement.getAttribute("class")).toContain(styles.svgIcon);
            expect(svgElement.getAttribute("class")).toContain(
                styles.legendItemIcon
            );
            expect(svgElement.getAttribute("role")).toBe("img");
        });
        it("contains path within svg", () => {
            const svgElement = createShape("RHOMBUS");
            const pathElement = svgElement.childNodes[0];
            const shapeProp = constants.SHAPE_PROPS.RHOMBUS;
            expect(svgElement.childNodes.length).toBe(1);
            expect(pathElement.getAttribute("style")).toBe(
                `fill: ${constants.DEFAULT_COLOR}`
            );
            expect(pathElement.getAttribute("class")).toBe("");
            expect(pathElement.getAttribute("d")).toBe(
                constants.CUSTOM_SHAPE_PATH.RHOMBUS
            );
            expect(pathElement.getAttribute("transform")).toBe(
                `translate(${shapeProp.translate.join(",")}) scale(${
                    shapeProp.scale
                })`
            );
        });
    });
});
