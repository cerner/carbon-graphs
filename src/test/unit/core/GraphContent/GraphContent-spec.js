"use strict";
import { GraphContent } from "../../../../main/js/core";
import errors from "../../../../main/js/helpers/errors";

describe("GraphContent", () => {
    let content = null;
    beforeEach(() => {
        content = new GraphContent();
    });
    describe("when consumed", () => {
        it("creates interfaces", () => {
            expect(content.load).toEqual(jasmine.any(Function));
            expect(content.unload).toEqual(jasmine.any(Function));
            expect(content.resize).toEqual(jasmine.any(Function));
            expect(content.redraw).toEqual(jasmine.any(Function));
        });
        it("throws error when load is called without being implemented", () => {
            expect(() => {
                content.load();
            }).toThrowError(errors.THROW_MSG_CONTENT_LOAD_NOT_IMPLEMENTED);
        });
        it("throws error when unload is called without being implemented", () => {
            expect(() => {
                content.unload();
            }).toThrowError(errors.THROW_MSG_CONTENT_UNLOAD_NOT_IMPLEMENTED);
        });
        it("throws error when resize is called without being implemented", () => {
            expect(() => {
                content.resize();
            }).toThrowError(errors.THROW_MSG_CONTENT_RESIZE_NOT_IMPLEMENTED);
        });
        it("throws error when redraw is called without being implemented", () => {
            expect(() => {
                content.redraw();
            }).toThrowError(errors.THROW_MSG_CONTENT_REDRAW_NOT_IMPLEMENTED);
        });
    });
});
