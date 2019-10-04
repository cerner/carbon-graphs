"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import PairedResult from "../../../../main/js/controls/PairedResult";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { triggerEvent } from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault,
    multiRegionSameData
} from "./helpers";

describe("PairedResult", () => {
    let graphDefault = null;
    let pairedResultGraphContainer;
    beforeEach(() => {
        pairedResultGraphContainer = document.createElement("div");
        pairedResultGraphContainer.id = "testPairedResult_carbon";
        pairedResultGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(pairedResultGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("initializes properly", () => {
            const pairedResult = new PairedResult(getInput(valuesDefault));
            expect(pairedResult.config).not.toBeNull();
            expect(pairedResult.valuesRange).not.toBeNull();
            expect(pairedResult.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new PairedResult());
            }).toThrowError(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new PairedResult({ dummy: "dummy" }));
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("throws error when no values are provided", () => {
            expect(() => {
                graphDefault.loadContent(
                    new PairedResult(getInput(undefined, false, false))
                );
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("does not throw error when empty array is provided", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = [];
            expect(() => {
                graphDefault.loadContent(new PairedResult(input));
            }).not.toThrow();
        });
        it("display the legend when empty array is provided as input", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = [];
            graphDefault.loadContent(new PairedResult(input));
            const legendContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legend
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(3);
            const legendItem = document.body.querySelector(
                `.${styles.legendItem}`
            );
            expect(legendItem.getAttribute("aria-disabled")).toBe("true");
            expect(legendItem.getAttribute("aria-current")).toBe("true");
        });
        it("does not throw error when datetime values have milliseconds", () => {
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(
                    new PairedResult(
                        getInput(
                            [
                                {
                                    high: {
                                        x: "2016-02-03T12:00:00.000Z",
                                        y: 1
                                    }
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
                    new PairedResult(
                        getInput(
                            [
                                {
                                    high: {
                                        x: "2016-02-03T12:00:00Z",
                                        y: 1
                                    }
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
                    new PairedResult(
                        getInput(
                            [
                                {
                                    high: {
                                        x: "2016-02-03T12:00Z",
                                        y: 1
                                    }
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
                        new PairedResult(
                            getInput(
                                [
                                    {
                                        high: {
                                            x: "2016-02-03T12:00:00:000Z",
                                            y: 1
                                        }
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
                        new PairedResult(
                            getInput(
                                [
                                    {
                                        high: {
                                            x: "2016-02-03T12:00:00:000.000Z",
                                            y: 1
                                        }
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
                        new PairedResult(
                            getInput(
                                [
                                    {
                                        high: {
                                            x: "2016-02-03T12:00.00Z",
                                            y: 1
                                        }
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
                        new PairedResult(
                            getInput(
                                [
                                    {
                                        high: {
                                            x: "2016-02-03T12Z",
                                            y: 1
                                        }
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
                        new PairedResult(
                            getInput(
                                [
                                    {
                                        high: {
                                            x: "2016-02-03Z",
                                            y: 1
                                        }
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
            const pairedResult = new PairedResult(input);
            expect(pairedResult.config.key).toBe(input.key);
            expect(pairedResult.config.color).toEqual(input.color);
            expect(pairedResult.config.shape).toEqual(input.shape);
            expect(pairedResult.config.label).toEqual(input.label);
            expect(pairedResult.config.onClick).toEqual(jasmine.any(Function));
            expect(pairedResult.config.values).toEqual(input.values);
            expect(pairedResult.config.values.length).toBe(3);
            expect(
                pairedResult.config.values.every((i, index) =>
                    Object.keys(i).every(
                        (j) => i[j].x === input.values[index][j].x
                    )
                )
            ).toBeTruthy();
            expect(
                pairedResult.config.values.every((i, index) =>
                    Object.keys(i).every(
                        (j) => i[j].y === input.values[index][j].y
                    )
                )
            ).toBeTruthy();
        });
        it("any changes to input object doesn't affect the config", () => {
            const input = getInput(valuesDefault, false, false);
            const pairedResult = new PairedResult(input);
            input.key = "";
            input.color = "";
            input.shape = "";
            input.onClick = null;
            input.label = {};
            input.values = [];
            expect(pairedResult.config.key).not.toBe(input.key);
            expect(pairedResult.config.color).not.toBe(input.color);
            expect(pairedResult.config.shape).not.toEqual(input.shape);
            expect(pairedResult.config.label).not.toEqual(input.label);
            expect(pairedResult.config.values).not.toBe(input.values);
            expect(pairedResult.config.onClick).toEqual(jasmine.any(Function));
            expect(pairedResult.config.values.length).toBe(3);
        });
        it("calculates min and max values correctly for y axis", () => {
            const input = getInput(valuesDefault, false, false);
            const pairedResult = new PairedResult(input);
            expect(pairedResult.valuesRange.y.min).toBe(30);
            expect(pairedResult.valuesRange.y.max).toBe(350);
            expect(pairedResult.valuesRange.y2).toBeUndefined();
            expect(pairedResult.valuesRange.y2).toBeUndefined();
        });
        it("calculates min and max values correctly for y2 axis", () => {
            const input = getInput(valuesDefault, false, false, true);
            const pairedResult = new PairedResult(input);
            expect(pairedResult.valuesRange.y).toBeUndefined();
            expect(pairedResult.valuesRange.y).toBeUndefined();
            expect(pairedResult.valuesRange.y2.min).toBe(30);
            expect(pairedResult.valuesRange.y2.max).toBe(350);
        });
    });
    describe("On legend item click", () => {
        let inputPrimary = null;
        let pairedResultPrimaryContent = null;
        let pairedResultSecondaryContent = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault, false, false);
            inputPrimary.regions = multiRegionSameData;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            inputSecondary.regions = multiRegionSameData;
            pairedResultSecondaryContent = new PairedResult(inputSecondary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.loadContent(pairedResultSecondaryContent);
        });
        describe("When Multiple-paired result", () => {
            it("Show region on legend click if regions are same", (done) => {
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_low"]`
                );
                triggerEvent(legendItem, "click", () => {
                    const regionElement = document.querySelector(
                        `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                    );
                    expect(regionElement.getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    done();
                });
            });
        });
    });
});
