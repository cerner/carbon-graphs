"use strict";
import Shape from "../../../main/js/core/Shape";
import constants, { SHAPES } from "../../../main/js/helpers/constants";

describe("Shape", () => {
    it("returns path for d3 shape", () => {
        expect(Object.keys(constants.D3_INBUILT_SHAPE).every((i) =>
            new Shape(i).getPathElement()
        )).toBeTruthy();
    });
    it("returns path for carbon shape", () => {
        expect(Object.keys(constants.CUSTOM_SHAPE_PATH).every((i) =>
            new Shape(i).getPathElement()
        ));
    });
    it("throws error if unknown shape is queried", () => {
        expect(() => {
            new Shape("NewShape").getPathElement();
        }).toThrow();
    });
    describe("Moveto path", () => {
        it("tear drop", () => {
            expect(new Shape(SHAPES.TEAR_DROP).getPathElement()).toBe(constants.CUSTOM_SHAPE_PATH.TEAR_DROP);
        });
        it("tear drop alternate", () => {
            expect(new Shape(SHAPES.TEAR_ALT).getPathElement()).toBe(constants.CUSTOM_SHAPE_PATH.TEAR_ALT);
        });
        it("x shape", () => {
            expect(new Shape(SHAPES.X).getPathElement()).toBe(constants.CUSTOM_SHAPE_PATH.X);
        });
        it("rhombus shape", () => {
            expect(new Shape(SHAPES.RHOMBUS).getPathElement()).toBe(constants.CUSTOM_SHAPE_PATH.RHOMBUS);
        });
        it("vertical bar shape", () => {
            expect(new Shape(SHAPES.VERTICAL_BAR).getPathElement()).toBe(constants.CUSTOM_SHAPE_PATH.VERTICAL_BAR);
        });
    });
});
