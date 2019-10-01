"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Line from "../../../../main/js/controls/Line";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    axisDefault,
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getInput,
    valuesDefault
} from "./helpers";

describe("Line", () => {
    let graphDefault = null;
    let lineGraphContainer;
    beforeEach(() => {
        lineGraphContainer = document.createElement("div");
        lineGraphContainer.id = "testLine_carbon";
        lineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(lineGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("initializes properly", () => {
            const line = new Line(getInput(valuesDefault));
            expect(line.config).not.toBeNull();
            expect(line.valuesRange).not.toBeNull();
            expect(line.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Line());
            }).toThrowError(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Line({ dummy: "dummy" }));
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("throws error when no values are provided", () => {
            expect(() => {
                graphDefault.loadContent(
                    new Line(getInput(undefined, false, false))
                );
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("display the legend when values are provided", () => {
            const input = getInput(valuesDefault);
            graphDefault.loadContent(new Line(input));
            const legendContainer = fetchElementByClass(
                lineGraphContainer,
                styles.legend
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(1);
            const legendItem = document.body.querySelector(
                `.${styles.legendItem}`
            );
            expect(legendItem.getAttribute("aria-disabled")).toBe("false");
        });
        it("does not throw error when empty array is provided", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = [];
            expect(() => {
                graphDefault.loadContent(new Line(input));
            }).not.toThrow();
        });
        it("does not throw error when datetime values have milliseconds", () => {
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(
                    new Line(
                        getInput(
                            [
                                {
                                    x: "2016-02-03T12:00:00.000Z",
                                    y: 1
                                }
                            ],
                            false,
                            false
                        )
                    )
                );
            }).not.toThrow();
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(
                    new Line(
                        getInput(
                            [
                                {
                                    x: "2016-02-03T12:00:00Z",
                                    y: 1
                                }
                            ],
                            false,
                            false
                        )
                    )
                );
            }).not.toThrow();
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(
                    new Line(
                        getInput(
                            [
                                {
                                    x: "2016-02-03T12:00Z",
                                    y: 1
                                }
                            ],
                            false,
                            false
                        )
                    )
                );
            }).not.toThrow();
        });
        describe("throws error when values have datetime in a different ISO8601 format", () => {
            it("on invalid millisecond value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(
                        new Line(
                            getInput(
                                [
                                    {
                                        x: "2016-02-03T12:00:00:000Z",
                                        y: 1
                                    }
                                ],
                                false,
                                false
                            )
                        )
                    );
                }).toThrow();
            });
            it("on invalid second value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(
                        new Line(
                            getInput(
                                [
                                    {
                                        x: "2016-02-03T12:00:00:000.000Z",
                                        y: 1
                                    }
                                ],
                                false,
                                false
                            )
                        )
                    );
                }).toThrow();
            });
            it("on no second value but with millisecond value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(
                        new Line(
                            getInput(
                                [
                                    {
                                        x: "2016-02-03T12:00.00Z",
                                        y: 1
                                    }
                                ],
                                false,
                                false
                            )
                        )
                    );
                }).toThrow();
            });
            it("on no minute or second but with Zulu time stamp", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(
                        new Line(
                            getInput(
                                [
                                    {
                                        x: "2016-02-03T12Z",
                                        y: 1
                                    }
                                ],
                                false,
                                false
                            )
                        )
                    );
                }).toThrow();
            });
            it("on no hour, minute or second value but with Zulu timestamp", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(
                        new Line(
                            getInput(
                                [
                                    {
                                        x: "2016-02-03Z",
                                        y: 1
                                    }
                                ],
                                false,
                                false
                            )
                        )
                    );
                }).toThrow();
            });
        });
        it("clones the input object correctly", () => {
            const input = getInput(valuesDefault, false, false);
            const line = new Line(input);
            expect(line.config.key).toBe(input.key);
            expect(line.config.color).toBe(input.color);
            expect(line.config.shape).toEqual(input.shape);
            expect(line.config.label).toEqual(input.label);
            expect(line.config.onClick).toEqual(jasmine.any(Function));
            expect(line.config.values.length).toBe(3);
            expect(
                line.config.values.every(
                    (i, index) => i.x === input.values[index].x
                )
            ).toBeTruthy();
            expect(
                line.config.values.every(
                    (i, index) => i.y === input.values[index].y
                )
            ).toBeTruthy();
        });
        it("any changes to input object doesn't affect the config", () => {
            const input = getInput(valuesDefault, false, false);
            const line = new Line(input);
            input.key = "";
            input.color = "";
            input.shape = "";
            input.onClick = null;
            input.label = {};
            input.values = [];

            expect(line.config.key).not.toBe(input.key);
            expect(line.config.color).not.toBe(input.color);
            expect(line.config.shape).not.toBe(input.shape);
            expect(line.config.label).not.toEqual(input.label);
            expect(line.config.onClick).toEqual(jasmine.any(Function));
            expect(line.config.values).not.toBe(input.values);
            expect(line.config.values.length).toBe(3);
        });
        it("calculates min and max values correctly for y axis", () => {
            const input = getInput(valuesDefault, false, false);
            const line = new Line(input);
            expect(line.valuesRange.y.min).toBe(4);
            expect(line.valuesRange.y.max).toBe(35);
            expect(line.valuesRange.y2).toBeUndefined();
            expect(line.valuesRange.y2).toBeUndefined();
        });
        it("calculates min and max values correctly for y2 axis", () => {
            const input = getInput(valuesDefault, false, false, true);
            const line = new Line(input);
            expect(line.valuesRange.y).toBeUndefined();
            expect(line.valuesRange.y).toBeUndefined();
            expect(line.valuesRange.y2.min).toBe(4);
            expect(line.valuesRange.y2.max).toBe(35);
        });
    });
});
