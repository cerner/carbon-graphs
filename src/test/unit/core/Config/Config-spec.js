"use strict";
import BaseConfig from "../../../../main/js/core/BaseConfig";
import errors from "../../../../main/js/helpers/errors";

describe("BaseConfig", () => {
    let config = null;
    beforeEach(() => {
        config = new BaseConfig();
    });
    describe("when consumed", () => {
        it("creates interfaces", () => {
            expect(config.getConfig).toEqual(jasmine.any(Function));
            expect(config.setInput).toEqual(jasmine.any(Function));
            expect(config.validateInput).toEqual(jasmine.any(Function));
            expect(config.clone).toEqual(jasmine.any(Function));
        });
    });
    it("throws error when getInput is called without being implemented", () => {
        expect(() => {
            config.getConfig();
        }).toThrowError(errors.THROW_MSG_CONFIG_GET_CONFIG_NOT_IMPLEMENTED);
    });
    it("throws error when setInput is called without being implemented", () => {
        expect(() => {
            config.setInput();
        }).toThrowError(errors.THROW_MSG_CONFIG_SET_INPUT_NOT_IMPLEMENTED);
    });
    it("throws error when validateInput is called without being implemented", () => {
        expect(() => {
            config.validateInput();
        }).toThrowError(errors.THROW_MSG_CONFIG_VALIDATE_INPUT_NOT_IMPLEMENTED);
    });
    it("throws error when clone is called without being implemented", () => {
        expect(() => {
            config.clone();
        }).toThrowError(errors.THROW_MSG_CONFIG_CLONE_INPUT_NOT_IMPLEMENTED);
    });
});
