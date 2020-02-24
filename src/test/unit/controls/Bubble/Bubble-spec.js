"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Bubble from "../../../../main/js/controls/Bubble";
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

describe("Bubble", () => {
    let graphDefault = null;
    let bubbleGraphContainer;
    beforeEach(() => {
        bubbleGraphContainer = document.createElement("div");
        bubbleGraphContainer.id = "testBubble_carbon";
        bubbleGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(bubbleGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("initializes properly", () => {
            const bubble = new Bubble(getInput(valuesDefault));
            expect(bubble.config).not.toBeNull();
            expect(bubble.valuesRange).not.toBeNull();
            expect(bubble.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Bubble());
            }).toThrowError(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Bubble({ dummy: "dummy" }));
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("throws error when no values are provided", () => {
            expect(() => {
                graphDefault.loadContent(
                    new Bubble(getInput(undefined, false, false))
                );
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("display the legend when values are provided", () => {
            const input = getInput(valuesDefault);
            graphDefault.loadContent(new Bubble(input));
            const legendContainer = fetchElementByClass(
                bubbleGraphContainer,
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
                graphDefault.loadContent(new Bubble(input));
            }).not.toThrow();
        });
        it("does not throw error when datetime values have milliseconds", () => {
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(
                    new Bubble(
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
                    new Bubble(
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
                    new Bubble(
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
                        new Bubble(
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
                        new Bubble(
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
                        new Bubble(
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
                        new Bubble(
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
                        new Bubble(
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
            const bubble = new Bubble(input);
            expect(bubble.config.key).toBe(input.key);
            expect(bubble.config.color).toBe(input.color);
            expect(bubble.config.label).toEqual(input.label);
            expect(bubble.config.onClick).toEqual(jasmine.any(Function));
            expect(bubble.config.values.length).toBe(3);
            expect(
                bubble.config.values.every(
                    (i, index) => i.x === input.values[index].x
                )
            ).toBeTruthy();
            expect(
                bubble.config.values.every(
                    (i, index) => i.y === input.values[index].y
                )
            ).toBeTruthy();
        });
        it("any changes to input object doesn't affect the config", () => {
            const input = getInput(valuesDefault, false, false);
            const bubble = new Bubble(input);
            input.key = "";
            input.color = "";
            input.onClick = null;
            input.label = {};
            input.values = [];

            expect(bubble.config.key).not.toBe(input.key);
            expect(bubble.config.color).not.toBe(input.color);
            expect(bubble.config.label).not.toEqual(input.label);
            expect(bubble.config.onClick).toEqual(jasmine.any(Function));
            expect(bubble.config.values).not.toBe(input.values);
            expect(bubble.config.values.length).toBe(3);
        });
        it("calculates min and max values correctly for y axis", () => {
            const input = getInput(valuesDefault, false, false);
            const bubble = new Bubble(input);
            expect(bubble.valuesRange.y.min).toBe(4);
            expect(bubble.valuesRange.y.max).toBe(35);
            expect(bubble.valuesRange.y2).toBeUndefined();
            expect(bubble.valuesRange.y2).toBeUndefined();
        });
        it("calculates min and max values correctly for y2 axis", () => {
            const input = getInput(valuesDefault, false, true);
            const bubble = new Bubble(input);
            expect(bubble.valuesRange.y).toBeUndefined();
            expect(bubble.valuesRange.y).toBeUndefined();
            expect(bubble.valuesRange.y2.min).toBe(4);
            expect(bubble.valuesRange.y2.max).toBe(35);
        });
    });
});
