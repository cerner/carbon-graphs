"use strict";
import Carbon from "../../../../main/js/carbon";
import Pie from "../../../../main/js/controls/Pie";
import errors from "../../../../main/js/helpers/errors";
import { triggerEvent } from "../helpers/commonHelpers";
import { dataSecondary, dataTertiary, inputDefault } from "./helpers";

describe("Pie", () => {
    let graphContainer;
    beforeEach(() => {
        graphContainer = document.createElement("div");
        graphContainer.id = "testPie_carbon";
        graphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        document.body.appendChild(graphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        let pieInstance;
        let input;
        beforeEach(() => {
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
        });
        describe("Throws error", () => {
            it("When no input is provided", () => {
                expect(() => {
                    new Pie();
                }).toThrowError(errors.THROW_MSG_INVALID_INPUT);
            });
            it("When invalid input is provided", () => {
                const _input = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_INVALID_INPUT);
            });
            it("When no bind id is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.bindTo = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_NO_BIND);
            });
            it("When no data is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.data = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("When empty data is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.data = [{}];
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("When no key is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.data[0].key = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("When no label is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.data[0].label = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            });
            it("When no values is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.data[0].values = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
            });
        });
        it("Initializes properly", () => {
            expect(pieInstance.config).not.toBeNull();
            expect(pieInstance.content).not.toBeNull();
            expect(pieInstance.c3Context).not.toBeNull();
            expect(pieInstance instanceof Pie).toBeTruthy();
        });
        it("Generates the graph correctly", () => {
            const graphElement = document.querySelector(
                `#${graphContainer.id}`
            );
            expect(graphElement.childNodes.length).toBe(2);
            expect(graphElement.firstChild.nodeName).toBe("svg");
        });
        it("Sets input correctly", () => {
            expect(pieInstance.config).toEqual(input);
        });
        it("Clones input correctly", () => {
            expect(pieInstance.config).toEqual(input);
            expect(pieInstance.config.bindTo).toBe(input.bindTo);
            expect(pieInstance.config.dimension).toEqual(input.dimension);
            expect(pieInstance.config.data).toEqual(input.data);
            expect(pieInstance.config.pie).toEqual(input.pie);
            expect(pieInstance.config.data.length).toBe(input.data.length);
            pieInstance.config.data.forEach((d, index) => {
                expect(d.key).toBe(input.data[index].key);
                expect(d.color).toBe(input.data[index].color);
                expect(d.label).toEqual(input.data[index].label);
                expect(d.onClick).toEqual(jasmine.any(Function));
                expect(d.values.length).toEqual(
                    input.data[index].values.length
                );
                expect(
                    d.values.every((v, i) => v === input.data[index].values[i])
                ).toBeTruthy();
            });
        });
        it("Any changes to input object doesn't affect the config", () => {
            input.bindTo = "";
            input.dimension = {};
            input.data = [];
            input.pie = null;
            expect(pieInstance.config).not.toEqual(input);
            expect(pieInstance.config.bindTo).not.toBe(input.bindTo);
            expect(pieInstance.config.dimension).not.toEqual(input.dimension);
            expect(pieInstance.config.data).not.toEqual(input.data);
            expect(pieInstance.config.pie).not.toEqual(input.pie);
            expect(pieInstance.config.data.length).not.toBe(input.data.length);
            pieInstance.config.data.forEach((d) => {
                expect(d.key).not.toBeNull();
                expect(d.color).not.toBeNull();
                expect(d.label).not.toBeNull();
                expect(d.onClick).not.toBeNull();
                expect(d.values.length).not.toBe(0);
            });
        });
        it("Sets content data correctly", () => {
            pieInstance.content.forEach((d, index) => {
                expect(d.key).toBe(input.data[index].key);
                expect(d.color).toBe(input.data[index].color);
                expect(d.label).toEqual(input.data[index].label);
                expect(d.onClick).toEqual(jasmine.any(Function));
                expect(d.values.length).toEqual(
                    input.data[index].values.length
                );
                expect(
                    d.values.every((v, i) => v === input.data[index].values[i])
                ).toBeTruthy();
            });
        });
    });
    describe("when pie is loaded with input", () => {
        let pieInstance;
        let loadedPieInstance;
        let input;
        beforeEach(() => {
            loadedPieInstance = null;
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
            spyOn(pieInstance.c3Context, "load").and.callThrough();
        });
        describe("Throws error", () => {
            it("When no content is loaded", () => {
                expect(() => {
                    pieInstance.loadContent({});
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("When no key is provided", () => {
                expect(() => {
                    pieInstance.loadContent({
                        label: { display: "Orange" },
                        color: Carbon.helpers.COLORS.GREEN,
                        values: [50, 25]
                    });
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("When no label is provided", () => {
                expect(() => {
                    pieInstance.loadContent({
                        key: "uid_2",
                        color: Carbon.helpers.COLORS.GREEN,
                        values: [50, 25]
                    });
                }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            });
            it("When no values are provided", () => {
                expect(() => {
                    pieInstance.loadContent({
                        key: "uid_2",
                        label: { display: "Orange" },
                        color: Carbon.helpers.COLORS.GREEN
                    });
                }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
            });
            it("When key is not unique", () => {
                expect(() => {
                    pieInstance.loadContent({
                        key: "uid_1",
                        label: { display: "Orange" },
                        color: Carbon.helpers.COLORS.GREEN,
                        values: [50, 25]
                    });
                }).toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
            });
        });
        it("Returns the instance", () => {
            loadedPieInstance = pieInstance.loadContent(dataSecondary);
            expect(loadedPieInstance instanceof Pie).toBeTruthy();
        });
        it("Generates the graph correctly", () => {
            pieInstance.loadContent(dataSecondary);
            const graphElement = document.querySelector(
                `#${graphContainer.id}`
            );
            expect(graphElement.childNodes.length).toBe(2);
            expect(graphElement.firstChild.nodeName).toBe("svg");
            expect(pieInstance.c3Context.load).toHaveBeenCalledTimes(1);
        });
        it("Loads multiple content correctly", () => {
            pieInstance.loadContent(dataSecondary);
            pieInstance.loadContent(dataTertiary);
            expect(pieInstance.c3Context.load).toHaveBeenCalledTimes(2);
        });
        it("Stores the content correctly", () => {
            expect(pieInstance.content.length).toBe(1);
            expect(pieInstance.content[0]).toEqual(input.data[0]);
            pieInstance.loadContent(dataTertiary);
            expect(pieInstance.content.length).toBe(2);
            expect(pieInstance.content[1]).toEqual(dataTertiary);
        });
        it("Does not throw error when valid input", () => {
            expect(() => {
                loadedPieInstance = pieInstance.loadContent({
                    key: "uid_2",
                    label: { display: "Orange" },
                    color: Carbon.helpers.COLORS.GREEN,
                    values: [50, 25]
                });
            }).not.toThrowError();
        });
    });
    describe("On unload", () => {
        let pieInstance;
        let unloadedPieInstance;
        let input;
        beforeEach(() => {
            unloadedPieInstance = null;
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
            spyOn(pieInstance.c3Context, "unload").and.callThrough();
        });
        it("Throws error if key is invalid", () => {
            expect(() => {
                pieInstance.unloadContent({
                    key: "uid_2"
                });
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Returns the instance", () => {
            unloadedPieInstance = pieInstance.unloadContent({
                key: "uid_1",
                label: input.data[0].label
            });
            expect(unloadedPieInstance instanceof Pie).toBeTruthy();
        });
        it("Generates the graph correctly", () => {
            pieInstance.unloadContent({
                key: "uid_1",
                label: input.data[0].label
            });
            const graphElement = document.querySelector(
                `#${graphContainer.id}`
            );
            expect(graphElement.childNodes.length).toBe(2);
            expect(graphElement.firstChild.nodeName).toBe("svg");
            expect(pieInstance.c3Context.unload).toHaveBeenCalledTimes(1);
        });
        it("Calls unload correctly", () => {
            pieInstance.loadContent(dataSecondary);
            pieInstance.unloadContent({
                key: "uid_2"
            });
            pieInstance.unloadContent({
                key: "uid_1"
            });
            expect(pieInstance.c3Context.unload).toHaveBeenCalledTimes(2);
        });
        it("Updates content correctly when called out of order", () => {
            pieInstance.loadContent(dataSecondary);
            expect(pieInstance.content.length).toBe(2);
            expect(pieInstance.content).toEqual([input.data[0], dataSecondary]);
            pieInstance.unloadContent({
                key: "uid_2"
            });
            expect(pieInstance.content.length).toBe(1);
            expect(pieInstance.content).toEqual([input.data[0]]);
            pieInstance.unloadContent({
                key: "uid_1"
            });
            expect(pieInstance.content.length).toBe(0);
            expect(pieInstance.content).toEqual([]);
        });
        it("Updates content correctly when called in order", () => {
            pieInstance.loadContent(dataSecondary);
            expect(pieInstance.content.length).toBe(2);
            expect(pieInstance.content).toEqual([input.data[0], dataSecondary]);
            pieInstance.unloadContent({
                key: "uid_1"
            });
            expect(pieInstance.content.length).toBe(1);
            expect(pieInstance.content).toEqual([dataSecondary]);
            pieInstance.unloadContent({
                key: "uid_2"
            });
            expect(pieInstance.content.length).toBe(0);
            expect(pieInstance.content).toEqual([]);
        });
        it("Does not throw error when valid input", () => {
            expect(() => {
                pieInstance.unloadContent({
                    key: "uid_1",
                    label: input.data[0].label
                });
            }).not.toThrowError();
        });
    });
    describe("On resize", () => {
        let pieInstance;
        let input;
        beforeEach(() => {
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
        });
        it("Throws error when called", () => {
            expect(() => {
                pieInstance.resize();
            }).toThrowError(errors.THROW_MSG_CONSTRUCT_RESIZE_NOT_IMPLEMENTED);
        });
    });
    describe("On destroy", () => {
        let pieInstance;
        let input;
        beforeEach(() => {
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
            spyOn(pieInstance.c3Context, "destroy").and.callThrough();
        });
        it("Calls destroy correctly", () => {
            const _ctx = pieInstance.c3Context;
            pieInstance.destroy();
            expect(_ctx.destroy).toHaveBeenCalledTimes(1);
        });
        it("Removes the graph", () => {
            pieInstance.destroy();
            const graphElement = document.querySelector(
                `#${graphContainer.id}`
            );
            expect(graphElement.childNodes.length).toBe(0);
            expect(graphElement.firstChild).toBeNull();
        });
        it("Throws no error", () => {
            expect(() => pieInstance.destroy()).not.toThrowError();
        });
        it("Throws no error on resize", (done) => {
            graphContainer.setAttribute("style", "width: 600px; height: 200px");
            pieInstance.destroy();
            expect(() => {
                triggerEvent(window, "resize", done);
            }).not.toThrowError();
        });
        it("Resets instance properties", () => {
            pieInstance.destroy();
            expect(pieInstance.config).toEqual({});
            expect(pieInstance.content).toEqual([]);
            expect(pieInstance.c3Context).toBeNull();
            expect(pieInstance instanceof Pie).toBeTruthy();
        });
    });
});
