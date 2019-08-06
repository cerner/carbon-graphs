"use strict";
import Carbon from "../../../../main/js/carbon";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import constants, {
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../helpers/commonHelpers";
import {
    axisDefault,
    axisInfoRowDefault,
    axisTimeSeries,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getInput,
    regionsDefault,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Bar", () => {
    let graphDefault = null;
    let barGraphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        barGraphContainer = document.createElement("div");
        barGraphContainer.id = "testBar_carbon";
        barGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(barGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("initializes properly", () => {
            const bar = new Bar(getInput(valuesDefault));
            expect(bar.config).not.toBeNull();
            expect(bar.valuesRange).not.toBeNull();
            expect(bar.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Bar());
            }).toThrowError(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(
                    new Bar({
                        label: { display: "data label" },
                        dummy: "dummy"
                    })
                );
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("throws error when no values are provided", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = [];
            expect(() => {
                graphDefault.loadContent(new Bar(input));
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("throws error when no ticks are provided for x-axis", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.axis.x.ticks = {};
            const graphNoTicks = new Graph(axisData);
            expect(() => {
                graphNoTicks.loadContent(new Bar(getInput(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_EMPTY_X_AXIS_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when x-axis type doesn't match with input type", () => {
            const graph = new Graph(getAxes(axisDefault));
            expect(() => {
                graph.loadContent(new Bar(getInput(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
            graph.destroy();
        });
        it("throws error when x-axis ticks are missing for input values", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.axis.x.ticks = {
                values: [1, 2, 4, 5]
            };
            const graphNoTicks = new Graph(axisData);
            expect(() => {
                graphNoTicks.loadContent(new Bar(getInput(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_INVALID_X_AXIS_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when x-axis ticks are missing for input axis info row", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.axis.x.ticks = {
                values: [1, 2]
            };
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.values = [
                {
                    x: 1,
                    y: 10
                },
                {
                    x: 2,
                    y: 15
                }
            ];
            data.axisInfoRow = axisInfoRowDefault;
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_INVALID_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row is empty", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_EMPTY_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row tick values do not match with X Axis tick values", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 6,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {
                            path: {
                                d: "M24,0l24,24L24,48L0,24L24,0z",
                                fill: Carbon.helpers.COLORS.ORANGE
                            },
                            options: {
                                x: -6,
                                y: -6,
                                scale: 0.25
                            }
                        },
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_INVALID_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row does not have value property", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {
                            path: {
                                d: "M24,0l24,24L24,48L0,24L24,0z",
                                fill: Carbon.helpers.COLORS.ORANGE
                            },
                            options: {
                                x: -6,
                                y: -6,
                                scale: 0.25
                            }
                        },
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                },
                {
                    axis: "x",
                    x: 2
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_VALUE_NOT_PROVIDED);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row label property is not provided", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {}
                    }
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(
                errors.THROW_MSG_AXIS_INFO_ROW_LABEL_DISPLAY_NOT_PROVIDED
            );
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row label property does not have display", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {}
                    }
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(
                errors.THROW_MSG_AXIS_INFO_ROW_LABEL_DISPLAY_NOT_PROVIDED
            );
            graphNoTicks.destroy();
        });
        it("clones the input object correctly", () => {
            const input = getInput(valuesDefault, false, false);
            const bar = new Bar(input);
            expect(bar.config.key).toBe(input.key);
            expect(bar.config.color).toBe(input.color);
            expect(bar.config.shape).toBe(input.shape);
            expect(bar.config.label).toEqual(input.label);
            expect(bar.config.onClick).toEqual(jasmine.any(Function));
            expect(bar.config.values.length).toBe(3);
            expect(
                bar.config.values.every(
                    (i, index) => i.x === input.values[index].x
                )
            ).toBeTruthy();
            expect(
                bar.config.values.every(
                    (i, index) => i.y === input.values[index].y
                )
            ).toBeTruthy();
        });
        it("any changes to input object doesn't affect the config", () => {
            const input = getInput(valuesDefault, false, false);
            const bar = new Bar(input);
            input.key = "";
            input.color = "";
            input.shape = "";
            input.onClick = null;
            input.label = {};
            input.values = [];

            expect(bar.config.key).not.toBe(input.key);
            expect(bar.config.color).not.toBe(input.color);
            expect(bar.config.shape).not.toBe(input.shape);
            expect(bar.config.label).not.toEqual(input.label);
            expect(bar.config.onClick).toEqual(jasmine.any(Function));
            expect(bar.config.values).not.toBe(input.values);
            expect(bar.config.values.length).toBe(3);
        });
        it("calculates min and max values correctly for y axis", () => {
            const input = getInput(valuesDefault, false, false);
            const bar = new Bar(input);
            expect(bar.valuesRange.y.min).toBe(0);
            expect(bar.valuesRange.y.max).toBe(15);
            expect(bar.valuesRange.y2).toBeUndefined();
            expect(bar.valuesRange.y2).toBeUndefined();
        });
    });
    describe("When graph is loaded with input", () => {
        afterEach(() => {
            graphDefault.destroy();
        });
        it("returns the graph instance", () => {
            const loadedBar = new Bar(getInput(valuesDefault, false, false));
            loadedBar.load(graphDefault);
            expect(loadedBar instanceof Bar).toBeTruthy();
        });
        it("internal subsets gets created correctly for each data point", () => {
            const graph = graphDefault.loadContent(
                new Bar(getInput(valuesDefault, false, false))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) =>
                        j.onClick !== null &&
                        j.x !== null &&
                        j.y !== null &&
                        j.label !== null &&
                        j.color &&
                        j.yAxis &&
                        j.key === data.key
                )
            ).toBeTruthy();
            expect(graph.config.shownTargets.length).toBe(1);
        });
        it("internal subsets gets created successfully for time series", () => {
            const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
            const graph = graphTimeSeries.loadContent(
                new Bar(getInput(valuesTimeSeries, false, false))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => typeof j.x === "object" && j.x instanceof Date
                )
            ).toBeTruthy();
        });
        it("defaults color to blue when not provided", () => {
            const graph = graphDefault.loadContent(
                new Bar(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every((j) => j.color === COLORS.BLUE)
            ).toBeTruthy();
        });
        it("defaults axis to Y axis when not provided", () => {
            const graph = graphDefault.loadContent(
                new Bar(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.yAxis === constants.Y_AXIS
                )
            ).toBeTruthy();
        });
        it("defaults bar content cascade group to key value if no group is provided", () => {
            const input = getInput(valuesDefault);
            const graph = graphDefault.loadContent(new Bar(input));
            const data = graph.content[0].dataTarget;
            expect(data.group).toEqual(input.key);
        });
        it("sets axis info row group to respective bar group", () => {
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            const bar = new Bar(data);
            const graph = graphDefault.loadContent(bar);
            expect(graph.content[0].dataTarget.axisInfoRow[0].group).toEqual(
                graph.content[0].dataTarget.group
            );
        });
        it("Adds axis info row label height to bottom padding when axis info row is used", () => {
            const initialBottomPadding = graphDefault.config.padding.bottom;
            const initialAxisInfoRowLabelHeight =
                graphDefault.config.axisInfoRowLabelHeight;
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            const bar = new Bar(data);
            const graph = graphDefault.loadContent(bar);
            const finalBottomPadding = graph.config.padding.bottom;
            const finalAxisInfoRowLabelHeight =
                graph.config.axisInfoRowLabelHeight;
            expect(initialBottomPadding).toEqual(constants.PADDING.bottom);
            expect(initialAxisInfoRowLabelHeight).toEqual(0);
            expect(finalBottomPadding).toBeGreaterThan(initialBottomPadding);
            expect(finalAxisInfoRowLabelHeight).not.toEqual(0);
            expect(finalBottomPadding).toEqual(
                initialBottomPadding + finalAxisInfoRowLabelHeight
            );
        });
        describe("draws the graph", () => {
            let input = null;
            beforeEach(() => {
                input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("adds content container for bars", () => {
                const barContentContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                expect(barContentContainer).not.toBeNull();
                expect(barContentContainer.tagName).toBe("g");
                expect(
                    barContentContainer.getAttribute("aria-describedby")
                ).toBe(input.key);
            });
            it("adds legend for each bar content", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new Bar(secInput));
                const legendItems = document.body.querySelectorAll(
                    `.${styles.legendItem}`
                );
                expect(legendItems.length).toBe(2);
            });
            it("disables legend when disabled flag is set", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisTimeSeries));
                input = getInput(valuesTimeSeries, false, false);
                input.label.isDisabled = true;
                graphDefault.loadContent(new Bar(input));
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
            });
            it("add bar group for bar content", () => {
                const barContentContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                const barGroup = fetchElementByClass(
                    barContentContainer,
                    styles.currentBarsGroup
                );
                expect(barGroup).not.toBeNull();
                expect(barGroup.tagName).toBe("g");
                expect(barGroup.getAttribute("transform")).not.toBeNull();
            });
            it("adds bar as an SVG", () => {
                const barContentContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                const barGroup = fetchElementByClass(
                    barContentContainer,
                    styles.currentBarsGroup
                );
                expect(barGroup.firstChild.tagName).toBe("g");
                expect(
                    barGroup.firstChild.classList.contains(styles.bar)
                ).toBeTruthy();
            });
            it("adds bars with correct color", () => {
                const barElement = fetchElementByClass(
                    barGraphContainer,
                    styles.bar
                );
                expect(barElement.firstChild.tagName).toBe("rect");
                expect(
                    barElement.firstChild.attributes.getNamedItem("style").value
                ).toBe("fill: #007cc3; stroke: #007cc3;");
            });
            it("adds bar content with correct unique key", () => {
                const barElement = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                expect(
                    barElement.attributes.getNamedItem("aria-describedby").value
                ).toBe(input.key);
            });
            it("creates selection bars", () => {
                const barElements = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBarSelection
                );
                expect(barElements.length).toBe(5);
            });
            it("hides selection bars by default", () => {
                const barElements = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBarSelection
                );
                expect(
                    barElements[0].attributes.getNamedItem("aria-hidden").value
                ).toBe("true");
            });
            it("selected data point has rect as shape", () => {
                const selectedPoints = fetchElementByClass(
                    barGraphContainer,
                    styles.taskBarSelection
                );
                expect(selectedPoints.tagName).toBe("rect");
            });
            it("creates selection bars for timeline graph", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisTimeSeries));
                input = getInput(valuesTimeSeries, false, false);
                graphDefault.loadContent(new Bar(input));
                const selectionPoints = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBarSelection
                );
                expect(selectionPoints.length).toEqual(5);
            });
            describe("selection bar translates to 0 x-axis range", () => {
                it("when graph has no bar contents", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    const bar = new Bar(input);
                    graphDefault.loadContent(bar);
                    bar.redraw(graphDefault);
                    graphDefault.unloadContent(bar);
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    expect(toNumber(selectionPoint.getAttribute("x"))).toEqual(
                        0
                    );
                });
            });
            describe("selection bar has rect attributes correctly set", () => {
                afterEach(() => {
                    graphDefault.destroy();
                });
                it("for simple bar", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar = new Bar(input);
                    graphDefault.loadContent(bar);
                    bar.redraw(graphDefault);
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        expect(
                            toNumber(selectionPoint.getAttribute("x"))
                        ).toEqual(toNumber(point.getAttribute("x")) - 5);
                        expect(
                            toNumber(selectionPoint.getAttribute("y"))
                        ).toEqual(toNumber(point.getAttribute("y")) - 5);
                        expect(
                            toNumber(selectionPoint.getAttribute("height"))
                        ).toEqual(toNumber(point.getAttribute("height")) + 10);
                        expect(
                            toNumber(selectionPoint.getAttribute("width"))
                        ).toEqual(toNumber(point.getAttribute("width")) + 10);
                        done();
                    });
                });
                it("for grouped bar", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar = new Bar(input);
                    graphDefault.loadContent(bar);
                    const input2 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input2.key = "uid_2";
                    input2.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar2 = new Bar(input2);
                    graphDefault.loadContent(bar2);
                    bar.redraw(graphDefault);
                    bar2.redraw(graphDefault);
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    const points = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        expect(
                            toNumber(selectionPoint.getAttribute("x"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("x")) - 5
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("y"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("y")) - 5
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("height"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("height")) + 10
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("width"))
                        ).toBeCloserTo(
                            toNumber(points[3].getAttribute("x")) -
                                toNumber(points[0].getAttribute("x")) +
                                toNumber(points[1].getAttribute("width")) +
                                10
                        );
                        done();
                    });
                });
                it("for stacked bar", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar = new Bar(input);
                    graphDefault.loadContent(bar);
                    const input2 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input2.key = "uid_2";
                    input2.group = "uid_1";
                    input2.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar2 = new Bar(input2);
                    graphDefault.loadContent(bar2);
                    bar.redraw(graphDefault);
                    bar2.redraw(graphDefault);
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    const points = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        expect(
                            toNumber(selectionPoint.getAttribute("x"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("x")) - 5
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("y"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("y")) - 5
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("height"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("height")) +
                                toNumber(points[3].getAttribute("height")) +
                                10
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("width"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("width")) + 10
                        );
                        done();
                    });
                });
                it("for mixed type bar", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar = new Bar(input);
                    graphDefault.loadContent(bar);
                    const input2 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input2.key = "uid_2";
                    input2.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const input3 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input3.key = "uid_3";
                    input3.group = "uid_1";
                    input3.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    const bar2 = new Bar(input2);
                    const bar3 = new Bar(input3);
                    graphDefault.loadContent(bar2);
                    graphDefault.loadContent(bar3);
                    bar.redraw(graphDefault);
                    bar2.redraw(graphDefault);
                    bar3.redraw(graphDefault);
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    const points = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        expect(
                            toNumber(selectionPoint.getAttribute("x"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("x")) - 5
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("y"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("y")) - 5
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("height"))
                        ).toBeCloserTo(
                            toNumber(points[0].getAttribute("height")) +
                                toNumber(points[6].getAttribute("height")) +
                                10
                        );
                        expect(
                            toNumber(selectionPoint.getAttribute("width"))
                        ).toBeCloserTo(
                            toNumber(points[3].getAttribute("x")) -
                                toNumber(points[0].getAttribute("x")) +
                                toNumber(points[1].getAttribute("width")) +
                                10
                        );
                        done();
                    });
                });
            });
            describe("when clicked on a data point", () => {
                afterEach(() => {
                    graphDefault.destroy();
                });
                it("does not do anything if no onClick callback is provided", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = null;
                    graphDefault.loadContent(new Bar(input));
                    const bar = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(bar, "click", () => {
                        expect(bar.getAttribute("aria-disabled")).toBe("true");
                        done();
                    });
                });
                it("hides data point selection when parameter callback is called", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    graphDefault.loadContent(new Bar(input));
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        const selectionPoint = fetchElementByClass(
                            barGraphContainer,
                            styles.taskBarSelection
                        );
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
                it("highlights the data point", (done) => {
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "false"
                        );
                        done();
                    });
                });
                it("removes highlight when data point is clicked again", (done) => {
                    const selectionPoint = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBarSelection
                    );
                    const point = fetchElementByClass(
                        barGraphContainer,
                        styles.taskBar
                    );
                    triggerEvent(point, "click", () => {
                        triggerEvent(point, "click", () => {
                            expect(
                                selectionPoint.getAttribute("aria-hidden")
                            ).toBe("true");
                            done();
                        });
                    });
                });
                it("calls onClick callback with parameters", (done) => {
                    let args = {};
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    graphDefault.loadContent(new Bar(input));
                    const selectionPoint = barGraphContainer.querySelectorAll(
                        `.${styles.taskBar}`
                    )[1];
                    triggerEvent(selectionPoint, "click", () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.vals).not.toBeNull();
                        expect(args.vals.length).toEqual(1);
                        done();
                    });
                });
                it("onClick callback will get an array of all content that belongs to that tick group", (done) => {
                    let args = {};
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    graphDefault.loadContent(new Bar(input));
                    const input2 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input2.key = "uid_2";
                    input2.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    graphDefault.loadContent(new Bar(input2));
                    const selectionPoint = barGraphContainer.querySelectorAll(
                        `.${styles.taskBar}`
                    )[1];
                    triggerEvent(selectionPoint, "click", () => {
                        expect(args.key).toBe("uid_1");
                        expect(args.vals.length).toEqual(2);
                        expect(args.vals[0].key).toBe("uid_1");
                        expect(args.vals[1].key).toBe("uid_2");
                        done();
                    });
                });
                it("unload content will remove content data from selection bar datum", (done) => {
                    let args = {};
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    graphDefault.loadContent(new Bar(input));
                    const input2 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input2.key = "uid_2";
                    input2.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    const barContent = new Bar(input2);
                    graphDefault.loadContent(barContent);
                    barContent.redraw(graphDefault);
                    graphDefault.unloadContent(barContent);
                    const selectionPoint2 = barGraphContainer.querySelectorAll(
                        `.${styles.taskBar}`
                    )[1];
                    triggerEvent(selectionPoint2, "click", () => {
                        expect(args.key).toBe("uid_1");
                        expect(args.vals.length).toEqual(1);
                        expect(args.vals[0].key).toBe("uid_1");
                        done();
                    });
                });
                it("onClick callback will get selection bar datum in order which input was loaded", (done) => {
                    let args = {};
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    const input2 = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    input2.key = "uid_2";
                    input2.onClick = (cb, key, index, vals) => {
                        args = {
                            cb,
                            key,
                            index,
                            vals
                        };
                    };
                    graphDefault.loadContent(new Bar(input2));
                    graphDefault.loadContent(new Bar(input));
                    const selectionPoint2 = barGraphContainer.querySelectorAll(
                        `.${styles.taskBar}`
                    )[1];
                    triggerEvent(selectionPoint2, "click", () => {
                        expect(args.vals.length).toEqual(2);
                        expect(args.vals[0].key).toBe("uid_2");
                        expect(args.vals[1].key).toBe("uid_1");
                        done();
                    });
                });
            });
        });
        describe("prepares to load legend item", () => {
            afterEach(() => {
                graphDefault.destroy();
            });
            it("does not load if legend is opted to be hidden", () => {
                graphDefault.destroy();
                const input = getAxes(axisDefault);
                input.showLegend = false;
                const noLegendGraph = new Graph(input);
                noLegendGraph.loadContent(new Bar(getInput(valuesDefault)));
                const legendContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.legend
                );
                expect(legendContainer).toBeNull();
                noLegendGraph.destroy();
            });
            it("does not load if label display value is not provided", () => {
                const input = getInput(valuesDefault);
                input.label.display = "";
                graphDefault.loadContent(new Bar(input));
                const legendContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("sanitizes the legend display", () => {
                const input = getInput(valuesDefault);
                input.label.display = "<HELLO DUMMY X LABEL>";
                graphDefault.loadContent(new Bar(input));
                const legendContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(1);
            });
            it("loads item with a shape and text", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                const legendItemBtn = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItemBtn
                );
                const iconSVG = legendItemBtn.children[0];
                const iconGroup = legendItemBtn.children[0].firstChild;
                expect(legendItem).not.toBeNull();
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
                expect(legendItem.getAttribute("aria-disabled")).toBe("false");
                expect(legendItem.children[1].className).toBe(
                    styles.legendItemText
                );
                expect(legendItem.children[1].tagName).toBe("LABEL");
                expect(legendItem.children[1].textContent).toBe(
                    input.label.display
                );
                expect(legendItemBtn).not.toBeNull();
                expect(legendItemBtn.getAttribute("class")).toBe(
                    styles.legendItemBtn
                );
                expect(legendItemBtn.children[0].tagName).toBe("svg");
                expect(iconGroup.firstChild.getAttribute("d")).toBe(
                    SHAPES.SQUARE.path.d
                );
                expect(
                    iconSVG.classList.contains(styles.legendItemIcon)
                ).toBeTruthy();
            });
            it("loads the correct color", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                const iconSVG = legendItem.querySelector("svg");
                const iconPath = legendItem.querySelector("path");
                expect(iconSVG).not.toBeNull();
                expect(iconSVG.classList).toContain(styles.legendItemIcon);
                expect(iconSVG.getAttribute("style")).toContain(COLORS.BLUE);
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
            });
            it("attaches click event handlers correctly", (done) => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    expect(legendItem.getAttribute("aria-selected")).toBe(
                        "false"
                    );
                    done();
                });
            });
            it("on click hides the bars", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const bar = new Bar(input);
                const graph = graphDefault.loadContent(bar);
                triggerEvent(
                    fetchElementByClass(barGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        bar.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(1);
                        expect(
                            fetchElementByClass(
                                barGraphContainer,
                                styles.bar
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("true");
                        rafSpy.calls.reset();
                        done();
                    }
                );
            });
            it("on click, removes the first bar content but keeps the rest", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryBar = new Bar(inputPrimary);
                const secondaryBar = new Bar(inputSecondary);
                graphDefault.loadContent(primaryBar);
                const graph = graphDefault.loadContent(secondaryBar);
                triggerEvent(
                    fetchElementByClass(barGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        primaryBar.redraw(graph);
                        secondaryBar.redraw(graph);
                        const primaryBarElement = barGraphContainer.querySelector(
                            `.${styles.barGraphContent}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const secondaryBarElement = barGraphContainer.querySelector(
                            `.${styles.barGraphContent}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(graph.config.shownTargets.length).toBe(1);
                        expect(
                            fetchElementByClass(
                                primaryBarElement,
                                styles.bar
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                secondaryBarElement,
                                styles.bar
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("on clicking twice toggles the bars back to visible", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const bar = new Bar(input);
                const graph = graphDefault.loadContent(bar);
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    bar.redraw(graph);
                    triggerEvent(legendItem, "click", () => {
                        bar.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(2);
                        expect(
                            fetchElementByClass(barGraphContainer, styles.bar)
                                .firstChild.style.display
                        ).toBe("");
                        rafSpy.calls.reset();
                        done();
                    });
                });
            });
            it("shown targets are removed from Graph", (done) => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Bar(input));
                triggerEvent(
                    fetchElementByClass(barGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        expect(graph.config.shownTargets.length).toBe(0);
                        done();
                    }
                );
            });
            it("shown targets are updated back when toggled", (done) => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(legendItem, "click", () => {
                        expect(graph.config.shownTargets.length).toBe(1);
                        done();
                    });
                });
            });
            it("attaches mouse enter event handlers correctly", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryBar = new Bar(inputPrimary);
                const secondaryBar = new Bar(inputSecondary);
                graphDefault.loadContent(primaryBar);
                graphDefault.loadContent(secondaryBar);
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="${inputSecondary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeTruthy();
                    done();
                });
            });
            it("attaches mouse leave event handlers correctly", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryBar = new Bar(inputPrimary);
                const secondaryBar = new Bar(inputSecondary);
                graphDefault.loadContent(primaryBar);
                graphDefault.loadContent(secondaryBar);
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseleave", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="${inputSecondary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeFalsy();
                    done();
                });
            });
        });
        describe("Prepares to load label shape", () => {
            let graph;
            beforeEach(() => {
                graphDefault.destroy();
                graph = new Graph(getAxes(axisDefault));
                const barPrimary = getInput(valuesDefault, true, true, true);
                const barSecondary = getInput(valuesDefault, true, true, false);
                barSecondary.key = "uid_2";
                graph.loadContent(new Bar(barPrimary));
                graph.loadContent(new Bar(barSecondary));
            });
            it("Does not load shape if Y2 axis is not loaded", () => {
                graphDefault.destroy();
                const axes = utils.deepClone(getAxes(axisDefault));
                axes.axis.y2.show = false;
                const graph = new Graph(axes);
                const input = getInput(valuesDefault, true, true, false);
                graph.loadContent(new Bar(input));
                expect(
                    graph.axesLabelShapeGroup[constants.Y_AXIS]
                ).toBeUndefined();
                expect(
                    graph.axesLabelShapeGroup[constants.Y2_AXIS]
                ).toBeUndefined();
            });
            it("Loads shape in Y Axis", () => {
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                const svgPath = labelShapeContainer.children[0];
                expect(
                    graph.axesLabelShapeGroup[constants.Y_AXIS]
                ).not.toBeUndefined();
                expect(labelShapeContainer.children.length).toBe(1);
                expect(svgPath.tagName).toBe("svg");
                expect(svgPath.getAttribute("x")).toBe("0");
                expect(svgPath.getAttribute("aria-describedby")).toBe("uid_2");
            });
            it("Loads shape for each data set in Y Axis", () => {
                const barTertiary = getInput(valuesDefault, true, true, false);
                barTertiary.key = "uid_3";
                graph.loadContent(new Bar(barTertiary));
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                const svgPath = labelShapeContainer.children[1];
                expect(labelShapeContainer.children.length).toBe(2);
                expect(svgPath.tagName).toBe("svg");
                expect(svgPath.getAttribute("x")).toBe("20");
                expect(svgPath.getAttribute("aria-describedby")).toBe("uid_3");
            });
            it("Loads shape in Y2 Axis", () => {
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                const svgPath = labelShapeContainer.children[0];
                expect(
                    graph.axesLabelShapeGroup[constants.Y2_AXIS]
                ).not.toBeUndefined();
                expect(labelShapeContainer.children.length).toBe(1);
                expect(svgPath.tagName).toBe("svg");
                expect(svgPath.getAttribute("x")).toBe("0");
                expect(svgPath.getAttribute("aria-describedby")).toBe("uid_1");
            });
            it("Loads shape for each data set in Y2 Axis", () => {
                const barTertiary = getInput(valuesDefault, true, true, true);
                barTertiary.key = "uid_4";
                graph.loadContent(new Bar(barTertiary));
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                const svgPath = labelShapeContainer.children[1];
                expect(labelShapeContainer.children.length).toBe(2);
                expect(svgPath.tagName).toBe("svg");
                expect(svgPath.getAttribute("x")).toBe("20");
                expect(svgPath.getAttribute("aria-describedby")).toBe("uid_4");
            });
        });
    });
    describe("When graph is unloaded off input", () => {
        let bar;
        beforeEach(() => {
            bar = new Bar(getInput(valuesDefault, false, false));
            graphDefault.loadContent(bar);
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("returns the bar instance", () => {
            const unloadedBar = bar.unload(graphDefault);
            expect(unloadedBar instanceof Bar);
        });
        it("clears the graph", () => {
            graphDefault.unloadContent(bar);
            const barContentContainer = fetchElementByClass(
                barGraphContainer,
                styles.barGraphContent
            );
            expect(barContentContainer).toBeNull();
        });
        it("removes the legend from graph", () => {
            graphDefault.unloadContent(bar);
            const graphLegend = fetchElementByClass(
                barGraphContainer,
                styles.legend
            );
            const barLegendItem = fetchElementByClass(
                barGraphContainer,
                styles.legendItem
            );
            expect(graphLegend).not.toBeNull();
            expect(barLegendItem).toBeNull();
        });
        it("resets the bar graph instance properties", () => {
            graphDefault.unloadContent(bar);
            expect(bar.dataTarget).toEqual({});
            expect(bar.config).toEqual({});
        });
        describe("Removes label shape from label container", () => {
            let graph;
            let barPrimary;
            let barSecondary;
            beforeEach(() => {
                graphDefault.destroy();
                graph = new Graph(getAxes(axisDefault));
                barPrimary = new Bar(getInput(valuesDefault, true, true, true));
                barSecondary = new Bar(
                    getInput(valuesDefault, true, true, false, "uid_2")
                );
                graph.loadContent(barPrimary);
                graph.loadContent(barSecondary);
            });
            it("Verifies content is present", () => {
                expect(
                    graph.axesLabelShapeGroup[constants.Y_AXIS]
                ).not.toBeUndefined();
                expect(
                    graph.axesLabelShapeGroup[constants.Y2_AXIS]
                ).not.toBeUndefined();
            });
            it("For Y axis", () => {
                graph.unloadContent(barSecondary);
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(0);
            });
            it("For Y axis with multiple data set", () => {
                graph.loadContent(
                    new Bar(getInput(valuesDefault, true, true, false, "uid_3"))
                );
                graph.unloadContent(barSecondary);
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(1);
                expect(labelShapeContainer.children[0].tagName).toBe("svg");
                expect(labelShapeContainer.children[0].getAttribute("x")).toBe(
                    "0"
                );
                expect(
                    labelShapeContainer.children[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe("uid_3");
            });
            it("For Y2 axis", () => {
                graph.unloadContent(barPrimary);
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(0);
            });
            it("For Y2 axis with multiple data set", () => {
                graph.loadContent(
                    new Bar(getInput(valuesDefault, true, true, true, "uid_4"))
                );
                graph.unloadContent(barPrimary);
                const labelShapeContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(1);
                expect(labelShapeContainer.children[0].tagName).toBe("svg");
                expect(labelShapeContainer.children[0].getAttribute("x")).toBe(
                    "0"
                );
                expect(
                    labelShapeContainer.children[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe("uid_4");
            });
        });
    });
    describe("Region", () => {
        let bar;
        let data;
        describe("on load", () => {
            afterEach(() => {
                graphDefault.destroy();
            });
            describe("Ideally", () => {
                beforeEach(() => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    data.regions = regionsDefault;
                    bar = new Bar(data);
                    graphDefault.loadContent(bar);
                });
                afterEach(() => {
                    graphDefault.destroy();
                });
                it("Creates region when present", () => {
                    const regionElement = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.region
                    );
                    expect(regionElement.length).toBe(2);
                    expect(regionElement[0].nodeName).toBe("rect");
                });
                it("shows region by default", () => {
                    const regionElement = fetchElementByClass(
                        barGraphContainer,
                        styles.region
                    );
                    expect(regionElement.getAttribute("class")).toBe(
                        `${styles.region} ${styles.barGoalLine}`
                    );
                    expect(regionElement.getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    expect(regionElement.getAttribute("aria-describedby")).toBe(
                        `region_${data.key}`
                    );
                });
            });
            it("Creates region only if present", () => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = null;
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionGroupElement = fetchElementByClass(
                    barGraphContainer,
                    `${styles.goalGroup}-${data.key}`
                );
                expect(regionGroupElement).toBeNull();
            });
            describe("Creates region when there are multiple regions", () => {
                beforeEach(() => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    data.regions = regionsDefault;
                    bar = new Bar(data);
                    graphDefault.loadContent(bar);
                });
                afterEach(() => {
                    graphDefault.destroy();
                });
                it("Renders all regions", () => {
                    const regionElement = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.region
                    );
                    expect(regionElement.length).toBe(2);
                    expect(regionElement[0].nodeName).toBe("rect");
                });
                it("shows all regions face-up by default", () => {
                    const regionsElement = document.querySelectorAll(
                        `.${styles.region}`
                    );
                    expect(regionsElement.length).toBe(2);
                    expect(regionsElement[0].getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    expect(regionsElement[1].getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    expect(
                        regionsElement[0].getAttribute("aria-describedby")
                    ).toBe(`region_${data.key}`);
                    expect(
                        regionsElement[1].getAttribute("aria-describedby")
                    ).toBe(`region_${data.key}`);
                });
            });
            describe("Validates each region", () => {
                beforeEach(() => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                });
                afterEach(() => {
                    data = null;
                    graphDefault.destroy();
                });
                it("Throws error when empty", () => {
                    data.regions = [{}];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(errors.THROW_MSG_REGION_EMPTY);
                });
                it("Throws error when both start and end are empty", () => {
                    data.regions = [
                        {
                            start: null,
                            end: null
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(errors.THROW_MSG_REGION_START_END_MISSING);
                });
                it("Throws error when axis info is invalid", () => {
                    data.regions = [
                        {
                            axis: "x",
                            start: 10,
                            end: 10
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when axis provided is different than data-set axis", () => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false, true)
                    );
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 20
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when axis is not and data-set axis is Y2", () => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false, true)
                    );
                    data.regions = [
                        {
                            start: 10,
                            end: 20
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when start value is invalid", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: "10",
                            end: 20
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                    );
                });
                it("Throws error when end value is invalid", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: "20"
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                    );
                });
                it("Throws error when start is more than end", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 20,
                            end: 10
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(errors.THROW_MSG_REGION_START_MORE_END);
                });
                it("Throws error when x value is not provided", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(errors.THROW_MSG_BAR_REGION_EMPTY_X_VALUE);
                });
                it("Throws error when x type is invalid", () => {
                    const timeData = utils.deepClone(
                        getInput(valuesTimeSeries, false, false)
                    );
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisTimeSeries));
                    timeData.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15,
                            x: 2
                        }
                    ];
                    bar = new Bar(timeData);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(errors.THROW_MSG_REGION_INVALID_FORMAT);
                });
                it("Throws error when x value provided is not in x axis ticks", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15,
                            x: 10
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).toThrowError(
                        errors.THROW_MSG_INVALID_REGION_X_AXIS_TICK
                    );
                });
                it("Correctly passes validation", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15,
                            x: 2
                        }
                    ];
                    bar = new Bar(data);
                    expect(() => {
                        graphDefault.loadContent(bar);
                    }).not.toThrow();
                });
            });
            it("Translates region correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement.nodeName).toBe("rect");
                expect(toNumber(regionElement.getAttribute("y"), 10)).toBe(
                    toNumber(graphDefault.scale.y(15), 10)
                );
            });
            it("Does not hide regions if graph has more than 1 data-set", () => {
                const inputSecondary = utils.deepClone(getInput(valuesDefault));
                inputSecondary.key = "uid_2";
                inputSecondary.regions = [
                    {
                        start: 1,
                        end: 5,
                        x: 1
                    }
                ];
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 1,
                        end: 5,
                        x: 1
                    }
                ];
                bar = new Bar(data);
                const barContent = new Bar(inputSecondary);
                graphDefault.loadContent(bar);
                graphDefault.loadContent(barContent);
                const regionGroupElement = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionGroupElement.length).toBe(2);
                expect(
                    regionGroupElement[0].getAttribute("aria-describedby")
                ).toBe(`region_${data.key}`);
                expect(
                    regionGroupElement[1].getAttribute("aria-describedby")
                ).toBe(`region_${inputSecondary.key}`);
                expect(regionGroupElement[0].getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(regionGroupElement[1].getAttribute("aria-hidden")).toBe(
                    "false"
                );
                graphDefault.unloadContent(barContent);
            });
            it("Sets the height correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(
                    toNumber(regionElement.getAttribute("height"))
                ).toBeGreaterThan(constants.PADDING.top);
            });
            it("Creates a goal bar when start and end are same", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 15,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(toNumber(regionElement.getAttribute("height"))).toBe(
                    constants.DEFAULT_REGION_GOAL_LINE_STROKE_WIDTH
                );
            });
            it("Creates region correctly when start is not provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(
                    toNumber(regionElement.getAttribute("y"))
                ).toBeGreaterThan(constants.PADDING.top);
                expect(toNumber(regionElement.getAttribute("y"))).toBeLessThan(
                    toNumber(graphDefault.config.height)
                );
            });
            it("Creates region correctly when end is not provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(toNumber(regionElement.getAttribute("y"))).toBe(0);
            });
            it("Creates region with correct, color if provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 10,
                        end: 15,
                        color: "#f44444",
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement.getAttribute("style")).toBe(
                    "fill: #f44444;"
                );
            });
            it("sets width correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                const graph = graphDefault.loadContent(bar);
                bar.redraw(graph);
                const regionWidth = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                ).getAttribute("width");
                const barWidth = fetchElementByClass(
                    barGraphContainer,
                    styles.taskBar
                ).getAttribute("width");
                expect(toNumber(regionWidth)).toBeCloseTo(
                    toNumber(barWidth) * 1.25,
                    0
                );
            });
        });
        describe("On unload", () => {
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Removes all regions", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 10,
                        end: 15,
                        x: 1
                    },
                    {
                        start: 10,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                graphDefault.loadContent(bar);
                graphDefault.unloadContent(bar);
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement).toBe(null);
            });
        });
        describe("On legend item hover", () => {
            describe("When multi-bar", () => {
                let inputPrimary = null;
                let inputSecondary = null;
                let barPrimary = null;
                let barSecondary = null;
                beforeEach(() => {
                    inputPrimary = getInput(valuesDefault, false, false);
                    inputPrimary.regions = [
                        {
                            start: 1,
                            end: 5,
                            x: 1
                        }
                    ];
                    inputSecondary = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    inputSecondary.key = "uid_2";
                    inputSecondary.regions = [
                        {
                            start: 1,
                            end: 5,
                            x: 1
                        }
                    ];
                    barPrimary = new Bar(inputPrimary);
                    barSecondary = new Bar(inputSecondary);
                    graphDefault.loadContent(barPrimary);
                    graphDefault.loadContent(barSecondary);
                });
                afterEach(() => {
                    graphDefault.destroy();
                });
                it("Hides all the regions except current on mouse hover", (done) => {
                    const legendItem = fetchElementByClass(
                        barGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const regionElements = fetchAllElementsByClass(
                            barGraphContainer,
                            styles.region
                        );
                        expect(
                            regionElements[0].getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            regionElements[1].getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    });
                });
                it("Shows all the regions on mouse leave", (done) => {
                    const legendItem = fetchElementByClass(
                        barGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const regionElements = fetchAllElementsByClass(
                                barGraphContainer,
                                styles.region
                            );
                            expect(
                                regionElements[0].getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                regionElements[1].getAttribute("aria-hidden")
                            ).toBe("false");
                            done();
                        });
                    });
                });
            });
        });
    });
});
