"use strict";
import Symbol from "../../../main/js/core/Symbol";
import constants, { SYMBOLS } from "../../../main/js/helpers/constants";

describe("Symbol", () => {
    it("returns path for d3 symbol", () => {
        expect(Object.keys(constants.D3_INBUILT_SYMBOL).every((i) =>
            new Symbol(i).getPathElement()
        )).toBeTruthy();
    });
    it("returns path for carbon symbol", () => {
        expect(Object.keys(constants.CUSTOM_PATH).every((i) =>
            new Symbol(i).getPathElement()
        ));
    });
    it("throws error if unknown symbol is queried", () => {
        expect(() => {
            new Symbol("NewSymbol").getPathElement();
        }).toThrow();
    });
    describe("Moveto path", () => {
        it("tear drop", () => {
            expect(new Symbol(SYMBOLS.TEAR_DROP).getPathElement()).toBe(constants.CUSTOM_PATH.TEAR_DROP);
        });
        it("tear drop alternate", () => {
            expect(new Symbol(SYMBOLS.TEAR_ALT).getPathElement()).toBe(constants.CUSTOM_PATH.TEAR_ALT);
        });
        it("x symbol", () => {
            expect(new Symbol(SYMBOLS.X).getPathElement()).toBe(constants.CUSTOM_PATH.X);
        });
        it("rhombus symbol", () => {
            expect(new Symbol(SYMBOLS.RHOMBUS).getPathElement()).toBe(constants.CUSTOM_PATH.RHOMBUS);
        });
        it("vertical bar symbol", () => {
            expect(new Symbol(SYMBOLS.VERTICAL_BAR).getPathElement()).toBe(constants.CUSTOM_PATH.VERTICAL_BAR);
        });
    });
});
