"use strict";
import PairedResult from "../../../main/js/controls/PairedResult";
import Graph from "../../../main/js/core/Graph/Graph";
import constants, {
    AXIS_TYPE,
    COLORS
} from "../../../main/js/helpers/constants";
import errors from "../../../main/js/helpers/errors";
import styles from "../../../main/js/helpers/styles";
import utils from "../../../main/js/helpers/utils";
import {
    axisDefault,
    axisTimeSeries,
    dataPointClickHandlerSpy,
    fetchElementByClass,
    getAxes,
    getInput,
    triggerEvent,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("PairedResult", () => {
    let graphDefault = null;
    let pairedResultGraphContainer;
    beforeEach(() => {
        pairedResultGraphContainer = document.createElement("div");
        pairedResultGraphContainer.id = "testPairedResult_carbon";
        pairedResultGraphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        document.body.appendChild(pairedResultGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("when constructed", () => {
        it("initializes properly", () => {
            const pairedResult = new PairedResult(getInput(valuesDefault));
            expect(pairedResult.config).not.toBeNull();
            expect(pairedResult.valuesRange).not.toBeNull();
            expect(pairedResult.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new PairedResult());
            }).toThrow(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new PairedResult({ dummy: "dummy" }));
            }).toThrow(errors.THROW_MSG_INVALID_DATA_PROPERTY);
        });
        it("throws error when no values are provided", () => {
            expect(() => {
                graphDefault.loadContent(new PairedResult(getInput([], false, false)));
            }).toThrow(errors.THROW_MSG_INVALID_DATA_PROPERTY);
        });
        it("does not throw error when datetime values have milliseconds", () => {
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(new PairedResult(getInput([
                    {
                        high: {
                            x: "2016-02-03T12:00:00.000Z",
                            y: 1
                        }
                    }

                ], false, false)));
            }).not.toThrow();
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(new PairedResult(getInput([
                    {
                        high: {
                            x: "2016-02-03T12:00:00Z",
                            y: 1
                        }
                    }

                ], false, false)));
            }).not.toThrow();
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(new PairedResult(getInput([
                    {
                        high: {
                            x: "2016-02-03T12:00Z",
                            y: 1
                        }
                    }

                ], false, false)));
            }).not.toThrow();
        });
        describe("throws error when values have datetime in a different ISO8601 format", () => {
            it("on invalid millisecond value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new PairedResult(getInput([
                        {
                            high: {
                                x: "2016-02-03T12:00:00:000Z",
                                y: 1
                            }
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on invalid second value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new PairedResult(getInput([
                        {
                            high: {
                                x: "2016-02-03T12:00:00:000.000Z",
                                y: 1
                            }
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on no second value but with millisecond value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new PairedResult(getInput([
                        {
                            high: {
                                x: "2016-02-03T12:00.00Z",
                                y: 1
                            }
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on no minute or second but with Zulu time stamp", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new PairedResult(getInput([
                        {
                            high: {
                                x: "2016-02-03T12Z",
                                y: 1
                            }
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on no hour, minute or second value but with Zulu timestamp", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new PairedResult(getInput([
                        {
                            high: {
                                x: "2016-02-03Z",
                                y: 1
                            }
                        }
                    ], false, false)));
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
            expect(pairedResult.config.values.every((i, index) => Object.keys(i).every((j) => i[ j ].x === input.values[ index ][ j ].x))).toBeTruthy();
            expect(pairedResult.config.values.every((i, index) => Object.keys(i).every((j) => i[ j ].y === input.values[ index ][ j ].y))).toBeTruthy();
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
            expect(pairedResult.config.shape).not.toBe(input.shape);
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
    describe("when graph is loaded with input", () => {
        it("returns the graph instance", () => {
            const loadedPair = new PairedResult(getInput(valuesDefault, false, false));
            loadedPair.load(graphDefault);
            expect(loadedPair instanceof PairedResult).toBeTruthy();
        });
        it("throws error when type and values are a mismatch", () => {
            expect(() => {
                const invalidTypeAxis = utils.deepClone(axisDefault);
                invalidTypeAxis.x.type = AXIS_TYPE.TIME_SERIES;
                const input = getInput(valuesDefault, false, false);
                const invalidGraph = new Graph(getAxes(invalidTypeAxis));
                invalidGraph.loadContent(new PairedResult(input));
            }).toThrow(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("throws error when type and values are a mismatch", () => {
            expect(() => {
                const input = getInput(valuesTimeSeries, false, false);
                const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
                validGraph.loadContent(new PairedResult(input));
            }).toThrow(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("internal subsets gets created correctly for each data point", () => {
            const graph = graphDefault.loadContent(new PairedResult(getInput(valuesDefault, false, false)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.map((i) =>
                constants.PAIR_ITEM_TYPES.map((j) =>
                    i[ j ].x !== null &&
                    i[ j ].y !== null &&
                    i[ j ].label !== null &&
                    i[ j ].shape &&
                    i[ j ].color &&
                    i[ j ].key === `${data.key}_${j}`
                )
            )).toBeTruthy();
            expect(data.internalValuesSubset.every((i) =>
                i.onClick !== null &&
                i.yAxis !== null &&
                i.key === data.key
            )).toBeTruthy();
            expect(graph.config.shownTargets.length).toBe(4);
        });
        it("internal subsets gets created successfully for time series", () => {
            const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
            const graph = graphTimeSeries.loadContent(new PairedResult(getInput(valuesTimeSeries, false, false)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((i) =>
                constants.PAIR_ITEM_TYPES.map((j) =>
                    typeof i[ j ].x === "object" &&
                    i[ j ].x instanceof Date
                )
            )).toBeTruthy();
        });
        it("defaults color to black when not provided", () => {
            const graph = graphDefault.loadContent(new PairedResult(getInput(valuesDefault)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((i) =>
                constants.PAIR_ITEM_TYPES.map((j) =>
                    j.color === constants.DEFAULT_COLOR
                )
            )).toBeTruthy();
        });
        it("defaults shapes to circle when not provided", () => {
            const graph = graphDefault.loadContent(new PairedResult(getInput(valuesDefault)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((i) =>
                constants.PAIR_ITEM_TYPES.map((j) =>
                    j.shape === "CIRCLE"
                )
            )).toBeTruthy();
        });
        it("defaults axis to Y axis when not provided", () => {
            const graph = graphDefault.loadContent(new PairedResult(getInput(valuesDefault)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                j.yAxis === constants.Y_AXIS
            )).toBeTruthy();
        });
        it("sets axis to y2 if provided", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(Object.assign({}, {
                y2: {
                    show: true,
                    label: "Y2 Label",
                    lowerLimit: 0,
                    upperLimit: 200
                }
            }, axisDefault)));
            const graph = graphDefault.loadContent(new PairedResult(getInput(valuesDefault, false, false, true)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                j.yAxis === constants.Y2_AXIS
            )).toBeTruthy();
        });
        describe("draws the graph", () => {
            let input = null;
            beforeEach(() => {
                input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
            });
            it("adds content container for each paired result", () => {
                const pairedResultContentContainer = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                expect(pairedResultContentContainer).not.toBeNull();
                expect(pairedResultContentContainer.tagName).toBe("g");
                expect(pairedResultContentContainer.getAttribute("aria-describedby")).toBe(input.key);
            });
            it("adds container for each data points sets for each paired result", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new PairedResult(secInput));
                const graphContent = document.body.querySelectorAll(`.${styles.pairedBoxGroup}`);
                expect(graphContent.length).toBe(2);
            });
            it("adds legend for each data points sets for each paired result", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new PairedResult(secInput));
                const legendItems = document.body.querySelectorAll(`.${styles.legendItem}`);
                expect(legendItems.length).toBe(6);
            });
            it("adds data pair group for paired result", () => {
                const pairedGroupContentContainer = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                const pairedBox = fetchElementByClass(pairedGroupContentContainer, styles.pairedBox);
                expect(pairedBox).not.toBeNull();
                expect(pairedBox.tagName).toBe("g");
                expect(pairedBox.getAttribute("aria-selected")).toBe("false");
            });
            it("adds line path as an SVG", () => {
                const pairedGroupContentContainer = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                const linePath = fetchElementByClass(pairedGroupContentContainer, styles.pairedLine);
                expect(linePath.tagName).toBe("path");
                expect(linePath.getAttribute("d")).not.toBeNull();
                expect(linePath.classList.contains(styles.pairedLine)).toBeTruthy();
            });
            it("adds line with default stroke", () => {
                const linePath = fetchElementByClass(pairedResultGraphContainer, styles.pairedLine);
                expect(linePath.getAttribute("class")).toBe(styles.pairedLine);
                expect(linePath.getAttribute("aria-describedby")).toBe(input.key);
                expect(linePath.attributes.getNamedItem("style").value).toBe("");
                expect(linePath.attributes.getNamedItem("d").value).not.toBeNull();
            });
            it("adds points for each data point", () => {
                const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                const points = pointsGroup.querySelectorAll(`.${styles.pairedPoint}`);
                expect(points.length).toBe(valuesDefault.map((i) => Object.keys(i).length).reduce((a, b) => a + b, 0));
            });
            it("adds points for each high data point", () => {
                const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                const points = pointsGroup.querySelectorAll(`.${styles.pairedPoint}.${styles.high}`);
                expect(points.length).toBe(valuesDefault.map((i) => i.high ? 1 : 0).reduce((a, b) => a + b, 0));
            });
            it("adds points for each mid data point", () => {
                const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                const points = pointsGroup.querySelectorAll(`.${styles.pairedPoint}.${styles.mid}`);
                expect(points.length).toBe(valuesDefault.map((i) => i.mid ? 1 : 0).reduce((a, b) => a + b, 0));
            });
            it("adds points for each low data point", () => {
                const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                const points = pointsGroup.querySelectorAll(`.${styles.pairedPoint}.${styles.low}`);
                expect(points.length).toBe(valuesDefault.map((i) => i.low ? 1 : 0).reduce((a, b) => a + b, 0));
            });
            it("doesn't load high if not provided", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput([ {
                    mid: {
                        x: 45,
                        y: 146
                    },
                    low: {
                        x: 45,
                        y: 75
                    }

                } ], false, false);
                graphDefault.loadContent(new PairedResult(input));
                const point = pairedResultGraphContainer.querySelectorAll(`.${styles.pairedPoint}.${styles.high}`);
                expect(point.length).toBe(0);
            });
            it("doesn't load mid if not provided", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput([ {
                    high: {
                        x: 45,
                        y: 350
                    },
                    low: {
                        x: 45,
                        y: 75
                    }

                } ], false, false);
                graphDefault.loadContent(new PairedResult(input));
                const point = pairedResultGraphContainer.querySelectorAll(`.${styles.pairedPoint}.${styles.mid}`);
                expect(point.length).toBe(0);
            });
            it("doesn't load low if not provided", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput([ {
                    high: {
                        x: 45,
                        y: 350
                    },
                    mid: {
                        x: 45,
                        y: 146
                    }

                } ], false, false);
                graphDefault.loadContent(new PairedResult(input));
                const point = pairedResultGraphContainer.querySelectorAll(`.${styles.pairedPoint}.${styles.low}`);
                expect(point.length).toBe(0);
            });
            describe("data points have correct unique key", () => {
                it("line", () => {
                    const lineElement = fetchElementByClass(pairedResultGraphContainer, styles.pairedLine);
                    expect(lineElement.attributes.getNamedItem("aria-describedby").value).toBe(input.key);
                });
                it("creates a group for each data point", () => {
                    const pair = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                    const pointGroup = pair.querySelectorAll(`.${styles.pointGroup}`);
                    expect(pointGroup.length).toBe(3);
                    expect(pointGroup.item(0).tagName).toBe("g");
                    expect(pointGroup.item(1).tagName).toBe("g");
                    expect(pointGroup.item(2).tagName).toBe("g");
                });
                it("high data-point", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.high}`);
                    expect(points.parentNode.classList).toContain(styles.pointGroup);
                    expect(points.getAttribute("aria-describedby")).toBe(`${input.key}_high`);
                });
                it("mid data-point", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.mid}`);
                    expect(points.parentNode.classList).toContain(styles.pointGroup);
                    expect(points.getAttribute("aria-describedby")).toBe(`${input.key}_mid`);
                });
                it("low data-point", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.low}`);
                    expect(points.parentNode.classList).toContain(styles.pointGroup);
                    expect(points.getAttribute("aria-describedby")).toBe(`${input.key}_low`);
                });
            });
            describe("data points have correct color", () => {
                it("high", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.high}`);
                    expect(points.attributes.getNamedItem("style").value).toBe("fill: #007cc3;");
                });
                it("mid", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.mid}`);
                    expect(points.attributes.getNamedItem("style").value).toBe("fill: #78c346;");
                });
                it("low", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.low}`);
                    expect(points.attributes.getNamedItem("style").value).toBe("fill: #007cc3;");
                });
            });
            describe("data points have correct shape", () => {
                it("high", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.high}`);
                    expect(points.attributes.getNamedItem("d").value).toBe(constants.CUSTOM_SHAPE_PATH.TEAR_DROP);
                });
                it("mid", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.mid}`);
                    expect(points.attributes.getNamedItem("d").value).toBe(constants.CUSTOM_SHAPE_PATH.RHOMBUS);
                });
                it("low", () => {
                    const pointsGroup = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
                    const points = pointsGroup.querySelector(`.${styles.pairedPoint}.${styles.low}`);
                    expect(points.attributes.getNamedItem("d").value).toBe(constants.CUSTOM_SHAPE_PATH.TEAR_DROP);
                });
            });
            describe("creates data point selection elements as needed", () => {
                it("creates a rectangle highlight for data point", () => {
                    const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                    expect(selectionElement).not.toBeNull();
                    expect(selectionElement.tagName).toBe("rect");
                    expect(selectionElement.classList).toContain(styles.dataPointSelection);
                    expect(selectionElement.classList).toContain("hidden");
                    expect(selectionElement.getAttribute("aria-describedby")).toBe(input.key);
                    expect(selectionElement.getAttribute("style")).toBe("");
                });
                it("creates circle for incomplete pairs - high", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput([ {
                        high: {
                            x: 45,
                            y: 350
                        }
                    } ], false, false);
                    graphDefault.loadContent(new PairedResult(input));
                    const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                    expect(selectionElement.tagName).toBe("circle");
                    expect(selectionElement.classList).toContain(styles.dataPointSelection);
                    expect(selectionElement.classList).toContain("hidden");
                    expect(selectionElement.getAttribute("aria-describedby")).toBe(input.key);
                    expect(selectionElement.getAttribute("style")).toBe("");
                });
                it("creates circle for incomplete pairs - mid", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput([ {
                        mid: {
                            x: 45,
                            y: 146
                        }
                    } ], false, false);
                    graphDefault.loadContent(new PairedResult(input));
                    const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                    expect(selectionElement.tagName).toBe("circle");
                    expect(selectionElement.classList).toContain(styles.dataPointSelection);
                    expect(selectionElement.classList).toContain("hidden");
                    expect(selectionElement.getAttribute("aria-describedby")).toBe(input.key);
                    expect(selectionElement.getAttribute("style")).toBe("");
                });
                it("creates circle for incomplete pairs - low", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput([ {
                        low: {
                            x: 45,
                            y: 75
                        }
                    } ], false, false);
                    graphDefault.loadContent(new PairedResult(input));
                    const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                    expect(selectionElement.tagName).toBe("circle");
                    expect(selectionElement.classList).toContain(styles.dataPointSelection);
                    expect(selectionElement.classList).toContain("hidden");
                    expect(selectionElement.getAttribute("aria-describedby")).toBe(input.key);
                    expect(selectionElement.getAttribute("style")).toBe("");
                });
            });
            describe("when clicked on a data point", () => {
                it("does not do anything if no onClick callback is provided", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = null;
                    graphDefault.loadContent(new PairedResult(input));
                    const point = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                    triggerEvent(point, "click", done);
                    expect(dataPointClickHandlerSpy.calledOnce).toBeFalsy();
                });
                it("hides data point selection when parameter callback is called", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    graphDefault.loadContent(new PairedResult(input));
                    const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                    const point = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                    triggerEvent(point, "click");
                    expect(box.getAttribute("aria-selected")).toBe("false");
                });
                it("calls onClick callback", () => {
                    const point = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                    triggerEvent(point, "click");
                    expect(dataPointClickHandlerSpy.calledOnce).toBeTruthy();
                });
                it("highlights the data point", (done) => {
                    const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                    const point = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                    triggerEvent(point, "click", done);
                    expect(box.getAttribute("aria-selected")).toBe("true");
                });
                it("creates a rectangle highlight for data point", (done) => {
                    const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                    const point = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                    triggerEvent(point, "click", done);
                    expect(selectionElement).not.toBeNull();
                    expect(selectionElement.tagName).toBe("rect");
                    expect(selectionElement.classList).toContain(styles.dataPointSelection);
                });
                it("removes highlight when data point is clicked again", (done) => {
                    const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                    const point = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                    triggerEvent(point, "click");
                    triggerEvent(point, "click", done);
                    expect(box.getAttribute("aria-selected")).toBe("false");
                });
            });
            describe("when clicked on a paired box area", () => {
                it("highlights the data point", (done) => {
                    const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                    triggerEvent(box, "click", done);
                    expect(box.getAttribute("aria-selected")).toBe("true");
                });
                it("removes highlight when clicked again", (done) => {
                    const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                    triggerEvent(box, "click");
                    triggerEvent(box, "click", done);
                    expect(box.getAttribute("aria-selected")).toBe("false");
                });
            });
        });
        describe("prepares to load legend item", () => {
            it("does not load if legend is opted to be hidden", () => {
                graphDefault.destroy();
                const input = getAxes(axisDefault);
                input.showLegend = false;
                const noLegendGraph = new Graph(input);
                noLegendGraph.loadContent(new PairedResult(getInput(valuesDefault)));
                const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                expect(legendContainer).toBeNull();
                noLegendGraph.destroy();
            });
            it("does not load if label property is null", () => {
                const input = getInput(valuesDefault);
                input.label = null;
                graphDefault.loadContent(new PairedResult(input));
                const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("does not load if label property is empty", () => {
                const input = getInput(valuesDefault);
                input.label = {};
                graphDefault.loadContent(new PairedResult(input));
                const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("does not load if label display value is not provided", () => {
                const input = getInput(valuesDefault);
                input.label.high.display = "";
                input.label.mid.display = "";
                input.label.low.display = "";
                graphDefault.loadContent(new PairedResult(input));
                const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("sanitizes the legend display", () => {
                const input = getInput(valuesDefault);
                input.label.high.display = "<HELLO DUMMY X LABEL>";
                graphDefault.loadContent(new PairedResult(input));
                const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                const legendText = fetchElementByClass(legendContainer, styles.legendItemText);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(3);
                expect(legendText.textContent).toBe("&lt;HELLO DUMMY X LABEL&gt;");
            });
            it("loads item with a shape", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItemBtn = fetchElementByClass(pairedResultGraphContainer, styles.legendItemBtn);
                expect(legendItemBtn).not.toBeNull();
                expect(legendItemBtn.getAttribute("class")).toBe(styles.legendItemBtn);
                expect(legendItemBtn.children[ 0 ].tagName).toBe("svg");
                expect(legendItemBtn.children[ 0 ].classList.contains(styles.legendItemIcon)).toBeTruthy();
            });
            it("loads item with a correct text", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                expect(legendItem).not.toBeNull();
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
                expect(legendItem.children[ 1 ].className).toBe(styles.legendItemText);
                expect(legendItem.children[ 1 ].tagName).toBe("SPAN");
                expect(legendItem.children[ 1 ].textContent).toBe(input.label.high.display);
            });
            it("loads the correct shape", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                const iconPath = legendItem.querySelector("path");
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("d")).toBe(constants.CUSTOM_SHAPE_PATH.TEAR_DROP);
                expect(iconPath.getAttribute("transform")).not.toBeNull();
            });
            it("loads the correct color", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                const iconPath = legendItem.querySelector("path");
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("style")).toBe(`fill: ${COLORS.BLUE}`);
            });
            it("attaches click event handlers correctly", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "click");
                expect(legendItem.getAttribute("aria-selected")).toBe("false");
            });
            describe("on click", () => {
                it("hides the points", () => {
                    spyOn(window, "requestAnimationFrame").and.callThrough();
                    const input = getInput(valuesDefault, false, false);
                    const pairResultInstance = new PairedResult(input);
                    const graph = graphDefault.loadContent(pairResultInstance);
                    triggerEvent(fetchElementByClass(pairedResultGraphContainer, styles.legendItem), "click");
                    pairResultInstance.redraw(graph);

                    const high = pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}.${styles.high}`);
                    const mid = pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}.${styles.mid}`);
                    const low = pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}.${styles.low}`);
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
                    expect(high.style.display).toBe("none");
                    expect(mid.style.display).toBe("");
                    expect(low.style.display).toBe("");
                });
                it("hides the line and points, if the point is high", () => {
                    const input = getInput(valuesDefault, false, false);
                    const pairResultInstance = new PairedResult(input);
                    const graph = graphDefault.loadContent(pairResultInstance);
                    triggerEvent(fetchElementByClass(pairedResultGraphContainer, styles.legendItem), "click");
                    pairResultInstance.redraw(graph);
                    expect(pairedResultGraphContainer.querySelector(`.${styles.pairedLine}`).style.display).toBe("none");
                });
                it("hides the line and points, if the point is low", () => {
                    const input = getInput(valuesDefault, false, false);
                    const pairResultInstance = new PairedResult(input);
                    const graph = graphDefault.loadContent(pairResultInstance);
                    const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                    triggerEvent(legendContainer.querySelector(`[aria-describedby=${input.key}_low]`), "click");
                    pairResultInstance.redraw(graph);
                    expect(pairedResultGraphContainer.querySelector(`.${styles.pairedLine}`).style.display).toBe("none");
                });
                it("does not hide the line and points, if the point is mid", () => {
                    const input = getInput(valuesDefault, false, false);
                    const pairResultInstance = new PairedResult(input);
                    const graph = graphDefault.loadContent(pairResultInstance);
                    const legendContainer = fetchElementByClass(pairedResultGraphContainer, styles.legend);
                    triggerEvent(legendContainer.querySelector(`[aria-describedby=${input.key}_mid]`), "click");
                    pairResultInstance.redraw(graph);
                    const line = pairedResultGraphContainer.querySelector(`.${styles.pairedLine}`);
                    expect(line.getAttribute("d")).not.toBeNull();
                });
                it("removes the point but keeps the rest for multiple data sets", () => {
                    const inputPrimary = getInput(valuesDefault, false, false);
                    const inputSecondary = {
                        key: `uid_2`,
                        label: {
                            display: "Data Label B"
                        },
                        values: valuesDefault
                    };
                    const primaryPR = new PairedResult(inputPrimary);
                    const secondaryPR = new PairedResult(inputSecondary);
                    graphDefault.loadContent(primaryPR);
                    const graph = graphDefault.loadContent(secondaryPR);
                    triggerEvent(fetchElementByClass(pairedResultGraphContainer, styles.legendItem), "click");
                    primaryPR.redraw(graph);
                    secondaryPR.redraw(graph);
                    const primaryPRElement = pairedResultGraphContainer.querySelector(`.${styles.pairedBoxGroup}[aria-describedby="${inputPrimary.key}"]`);
                    const secondaryPRElement = pairedResultGraphContainer.querySelector(`.${styles.pairedBoxGroup}[aria-describedby="${inputSecondary.key}"]`);
                    expect(graph.config.shownTargets.length).toBe(7);
                    expect(fetchElementByClass(primaryPRElement, styles.pairedPoint).style.display).toBe("none");
                    expect(fetchElementByClass(secondaryPRElement, styles.pairedPoint).style.display).toBe("");
                });
                it("on clicking twice toggles the points back to visible", () => {
                    spyOn(window, "requestAnimationFrame").and.callThrough();
                    const input = getInput(valuesDefault, false, false);
                    const line = new PairedResult(input);
                    const graph = graphDefault.loadContent(line);
                    const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                    triggerEvent(legendItem, "click");
                    line.redraw(graph);
                    triggerEvent(legendItem, "click");
                    line.redraw(graph);
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
                    expect(fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint).style.display).toBe("");
                });
                describe("highlights the data point and shows rest of data points", () => {
                    beforeEach(() => {
                        const input = getInput(valuesDefault, false, false);
                        const line = new PairedResult(input);
                        const graph = graphDefault.loadContent(line);
                        const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                        triggerEvent(legendItem, "click");
                        line.redraw(graph);
                    });
                    it("box is set as selected", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click", done);
                        expect(box.getAttribute("aria-selected")).toBe("true");
                    });
                    it("selection element is displayed", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click", done);
                        const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                        expect(selectionElement).not.toBeNull();
                        expect(selectionElement.tagName).toBe("rect");
                        expect(selectionElement.classList).toContain(styles.dataPointSelection);
                    });
                    it("line is displayed to connect the pair", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click", done);
                        const lineElement = fetchElementByClass(pairedResultGraphContainer, styles.pairedLine);
                        expect(lineElement.tagName).toBe("path");
                        expect(lineElement.classList).toContain(styles.pairedLine);
                        expect(lineElement.classList).toContain(styles.dataPointDisplayEnable);
                    });
                    it("points are displayed even if they are hidden", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click", done);
                        const pointElement = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                        expect(pointElement.tagName).toBe("path");
                        expect(pointElement.classList).toContain(styles.pairedPoint);
                        expect(pointElement.classList).toContain(styles.high);
                        expect(pointElement.classList).toContain(styles.dataPointDisplayEnable);
                    });
                });
                describe("removes highlight when reset", () => {
                    beforeEach(() => {
                        const input = getInput(valuesDefault, false, false);
                        input.onClick = (clearSelectionCallback) => {
                            clearSelectionCallback();
                        };
                        const line = new PairedResult(input);
                        const graph = graphDefault.loadContent(line);
                        const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                        triggerEvent(legendItem, "click");
                        line.redraw(graph);
                    });
                    it("box is set as unselected", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click");
                        triggerEvent(box, "click", done);
                        expect(box.getAttribute("aria-selected")).toBe("false");
                    });
                    it("selection element is hidden", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click");
                        triggerEvent(box, "click", done);
                        const selectionElement = fetchElementByClass(pairedResultGraphContainer, styles.dataPointSelection);
                        expect(selectionElement).not.toBeNull();
                        expect(selectionElement.tagName).toBe("rect");
                        expect(selectionElement.classList).toContain(styles.dataPointSelection);
                    });
                    it("line between the pair is hidden", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click");
                        triggerEvent(box, "click", done);
                        const lineElement = fetchElementByClass(pairedResultGraphContainer, styles.pairedLine);
                        expect(lineElement.tagName).toBe("path");
                        expect(lineElement.classList).toContain(styles.pairedLine);
                        expect(lineElement.classList[ 1 ]).toBeUndefined();
                    });
                    it("points are hidden that were toggled off", (done) => {
                        const box = fetchElementByClass(pairedResultGraphContainer, styles.pairedBox);
                        triggerEvent(box, "click");
                        triggerEvent(box, "click", done);
                        const pointElement = fetchElementByClass(pairedResultGraphContainer, styles.pairedPoint);
                        expect(pointElement.tagName).toBe("path");
                        expect(pointElement.classList).toContain(styles.pairedPoint);
                        expect(pointElement.classList).toContain(styles.high);
                        expect(pointElement.classList[ 2 ]).toBeUndefined();
                    });
                });
            });
            it("shown targets are removed from Graph", () => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new PairedResult(input));
                triggerEvent(fetchElementByClass(pairedResultGraphContainer, styles.legendItem), "click");
                expect(graph.config.shownTargets.length).toBe(3);
            });
            it("shown targets are updated back when toggled", () => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "click");
                triggerEvent(legendItem, "click");
                expect(graph.config.shownTargets.length).toBe(4);
            });
            it("attaches mouse enter event handlers correctly", () => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                graphDefault.loadContent(new PairedResult(inputPrimary));
                graphDefault.loadContent(new PairedResult(inputSecondary));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "mouseenter");
                expect(pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}[aria-describedby="${inputPrimary.key}_high"]`).classList.contains(styles.blur)).toBeFalsy();
                expect(pairedResultGraphContainer.querySelector(`path[aria-describedby="${inputPrimary.key}"]`).classList.contains(styles.blur)).toBeTruthy();
                expect(pairedResultGraphContainer.querySelector(`path[aria-describedby="${inputSecondary.key}"]`).classList.contains(styles.blur)).toBeTruthy();
                expect(pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}[aria-describedby="${inputPrimary.key}_mid"]`).classList.contains(styles.blur)).toBeTruthy();
                expect(pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}[aria-describedby="${inputSecondary.key}_low"]`).classList.contains(styles.blur)).toBeTruthy();
            });
            it("attaches mouse leave event handlers correctly", () => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                graphDefault.loadContent(new PairedResult(inputPrimary));
                graphDefault.loadContent(new PairedResult(inputSecondary));
                const legendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "mouseleave");
                expect(pairedResultGraphContainer.querySelector(`path[aria-describedby="${inputPrimary.key}"]`).classList.contains(styles.blur)).toBeFalsy();
                expect(pairedResultGraphContainer.querySelector(`path[aria-describedby="${inputSecondary.key}"]`).classList.contains(styles.blur)).toBeFalsy();
                expect(pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}[aria-describedby="${inputPrimary.key}_mid"]`).classList.contains(styles.blur)).toBeFalsy();
                expect(pairedResultGraphContainer.querySelector(`.${styles.pairedPoint}[aria-describedby="${inputSecondary.key}_low"]`).classList.contains(styles.blur)).toBeFalsy();
            });
        });
    });
    describe("when graph is unloaded off input", () => {
        it("returns the pairedResult instance", () => {
            const pairedResult = new PairedResult(getInput(valuesDefault, false, false));
            graphDefault.loadContent(pairedResult);
            const unloadedPairResult = pairedResult.unload(graphDefault);
            expect(unloadedPairResult instanceof PairedResult);
        });
        it("clears the graph", () => {
            const pairedResult = new PairedResult(getInput(valuesDefault, false, false));
            graphDefault.loadContent(pairedResult);
            pairedResult.unload(graphDefault);
            const pairedResultContentContainer = fetchElementByClass(pairedResultGraphContainer, styles.pairedBoxGroup);
            expect(pairedResultContentContainer).toBeNull();
        });
        it("removes the legend from graph", () => {
            const graphLegend = fetchElementByClass(pairedResultGraphContainer, styles.legend);
            const pairedResultLegendItem = fetchElementByClass(pairedResultGraphContainer, styles.legendItem);
            expect(graphLegend).not.toBeNull();
            expect(pairedResultLegendItem).toBeNull();
        });
        it("resets the pairedResult graph instance properties", () => {
            const pairedResult = new PairedResult(getInput(valuesDefault, false, false));
            graphDefault.loadContent(pairedResult);
            pairedResult.unload(graphDefault);
            expect(pairedResult.dataTarget).toEqual({});
            expect(pairedResult.config).toEqual({});
        });
    });
});
