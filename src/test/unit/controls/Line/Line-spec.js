"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { getShapeForTarget } from "../../../../main/js/controls/Graph/helpers/helpers";
import Line from "../../../../main/js/controls/Line";
import { Shape } from "../../../../main/js/core";
import {
    getXAxisWidth,
    getXAxisXPosition
} from "../../../../main/js/helpers/axis";
import constants, {
    AXIS_TYPE,
    COLORS,
    LINE_TYPE,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import {
    getCurrentTransform,
    getSVGAnimatedTransformList,
    getTransformScale,
    round2Decimals
} from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import { toNumber, triggerEvent } from "../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault,
    valuesTimeSeries,
    inputTertiary
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
    describe("When graph is loaded with input", () => {
        it("returns the graph instance", () => {
            const loadedLine = new Line(getInput(valuesDefault, false, false));
            loadedLine.load(graphDefault);
            expect(loadedLine instanceof Line).toBeTruthy();
        });
        it("throws error when type and values are a mismatch", () => {
            expect(() => {
                const invalidTypeAxis = utils.deepClone(axisDefault);
                invalidTypeAxis.x.type = AXIS_TYPE.TIME_SERIES;
                const input = getInput(valuesDefault, false, false);
                const invalidGraph = new Graph(getAxes(invalidTypeAxis));
                invalidGraph.loadContent(new Line(input));
            }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("throws error when type and values are a mismatch", () => {
            expect(() => {
                const input = getInput(valuesTimeSeries, false, false);
                const validGraph = new Graph(
                    getAxes(utils.deepClone(axisDefault))
                );
                validGraph.loadContent(new Line(input));
            }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("internal subsets gets created correctly for each data point", () => {
            const graph = graphDefault.loadContent(
                new Line(getInput(valuesDefault, false, false))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) =>
                        j.onClick !== null &&
                        j.x !== null &&
                        j.y !== null &&
                        j.label !== null &&
                        j.shape &&
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
                new Line(getInput(valuesTimeSeries, false, false))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => typeof j.x === "object" && j.x instanceof Date
                )
            ).toBeTruthy();
        });
        it("defaults color to black when not provided", () => {
            const graph = graphDefault.loadContent(
                new Line(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.color === constants.DEFAULT_COLOR
                )
            ).toBeTruthy();
        });
        it("defaults interpolation to linear when not provided", () => {
            const graph = graphDefault.loadContent(
                new Line(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(data.interpolationType).toBe(LINE_TYPE.LINEAR);
        });
        it("defaults shapes to circle when not provided", () => {
            const graph = graphDefault.loadContent(
                new Line(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.shape === SHAPES.CIRCLE
                )
            ).toBeTruthy();
        });
        it("defaults axis to Y axis when not provided", () => {
            const graph = graphDefault.loadContent(
                new Line(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.yAxis === constants.Y_AXIS
                )
            ).toBeTruthy();
        });
        describe("draws the graph", () => {
            let input = null;
            beforeEach(() => {
                input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
            });
            it("adds content container for each line", () => {
                const lineContentContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.lineGraphContent
                );
                expect(lineContentContainer).not.toBeNull();
                expect(lineContentContainer.tagName).toBe("g");
                expect(
                    lineContentContainer.getAttribute("aria-describedby")
                ).toBe(input.key);
            });
            it("adds container for each data points sets for each line", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new Line(secInput));
                const graphContent = document.body.querySelectorAll(
                    `.${styles.lineGraphContent}`
                );
                expect(graphContent.length).toBe(2);
            });
            it("adds legend for each data points sets for each line", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new Line(secInput));
                const legendItems = document.body.querySelectorAll(
                    `.${styles.legendItem}`
                );
                expect(legendItems.length).toBe(2);
            });
            it("disables legend when disabled flag is set", () => {
                graphDefault.destroy();
                const graph = new Graph(getAxes(axisDefault));
                const data = utils.deepClone(valuesDefault);
                input = getInput(data);
                input.label.isDisabled = true;
                graph.loadContent(new Line(input));
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
            });
            it("disabled legend item is not tab-able", () => {
                graphDefault.destroy();
                const graph = new Graph(getAxes(axisDefault));
                const data = utils.deepClone(valuesDefault);
                input = getInput(data);
                input.label.isDisabled = true;
                graph.loadContent(new Line(input));
                const legendItem = document.body.querySelector(
                    `.${styles.legendItemBtn}`
                );
                expect(legendItem.getAttribute("tabindex")).toBe("-1");
            });
            it("add line group for line", () => {
                const lineContentContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.lineGraphContent
                );
                const lineGroup = fetchElementByClass(
                    lineContentContainer,
                    styles.currentLinesGroup
                );
                expect(lineGroup).not.toBeNull();
                expect(lineGroup.tagName).toBe("g");
                expect(lineGroup.getAttribute("transform")).not.toBeNull();
            });
            it("adds line path as an SVG", () => {
                const lineContentContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.lineGraphContent
                );
                const lineGroup = fetchElementByClass(
                    lineContentContainer,
                    styles.currentLinesGroup
                );
                expect(lineGroup.firstChild.tagName).toBe("g");
                expect(
                    lineGroup.firstChild.classList.contains(styles.line)
                ).toBeTruthy();
            });
            it("adds line with correct color", () => {
                const lineElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.line
                );
                expect(lineElement.firstChild.tagName).toBe("path");
                expect(
                    lineElement.firstChild.attributes.getNamedItem("style")
                        .value
                ).toBe("stroke: #007cc3;");
            });
            it("adds line with correct unique key", () => {
                const lineElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.line
                );
                expect(
                    lineElement.firstChild.attributes.getNamedItem(
                        "aria-describedby"
                    ).value
                ).toBe(input.key);
            });
            it("does not show data point if data point is null", () => {
                graphDefault.destroy();
                const graph = new Graph(getAxes(axisDefault));
                const data = utils.deepClone(valuesDefault);
                data[0].y = null;
                input = getInput(data);
                graph.loadContent(new Line(input));
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                const points = fetchElementByClass(pointsGroup, styles.point);
                const selectedPoint = fetchElementByClass(
                    pointsGroup,
                    styles.dataPointSelection
                );
                expect(pointsGroup.children.length).toBe(3);
                expect(points.getAttribute("aria-hidden")).toContain("true");
                expect(selectedPoint.getAttribute("aria-hidden")).toContain(
                    "true"
                );
            });
            it("does not render points if shapes needs to be hidden", () => {
                graphDefault.destroy();
                const hiddenShapeInput = getAxes(axisDefault);
                hiddenShapeInput.showShapes = false;
                const hiddenShapeGraph = new Graph(hiddenShapeInput);
                input = getInput(valuesDefault, false, false);
                hiddenShapeGraph.loadContent(new Line(input));
                expect(
                    fetchElementByClass(
                        lineGraphContainer,
                        styles.currentPointsGroup
                    )
                ).toBeNull();
            });
            it("add points group for data points", () => {
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                expect(pointsGroup).not.toBeNull();
                expect(pointsGroup.tagName).toBe("g");
                expect(pointsGroup.getAttribute("transform")).not.toBeNull();
            });
            it("adds points for each data point", () => {
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                const points = pointsGroup.querySelectorAll(`.${styles.point}`);
                expect(points.length).toBe(valuesDefault.length);
            });
            it("points have correct color", () => {
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                const points = fetchElementByClass(pointsGroup, styles.point);
                expect(points.attributes.getNamedItem("style").value).toBe(
                    "fill: #007cc3;"
                );
            });
            it("points have correct shape", () => {
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                const points = fetchElementByClass(pointsGroup, styles.point);
                expect(
                    points.firstChild.firstChild.attributes.getNamedItem("d")
                        .value
                ).toBe(SHAPES.RHOMBUS.path.d);
            });
            it("points have correct unique key assigned", () => {
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                const points = fetchElementByClass(pointsGroup, styles.point);
                expect(points.getAttribute("aria-describedby")).toBe(input.key);
            });
            it("adds a selected data point for each point", () => {
                const pointsGroup = fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                );
                const selectedPoints = pointsGroup.querySelectorAll(
                    `.${styles.dataPointSelection}`
                );
                expect(selectedPoints.length).toBe(valuesDefault.length);
            });
            it("selected data point is hidden by default", () => {
                const selectedPoints = fetchElementByClass(
                    lineGraphContainer,
                    styles.dataPointSelection
                );
                expect(selectedPoints.getAttribute("aria-hidden")).toBe("true");
            });
            it("selected data point has circle as shape", () => {
                const selectedPoints = fetchElementByClass(
                    lineGraphContainer,
                    styles.dataPointSelection
                );
                expect(selectedPoints.tagName).toBe("svg");
                expect(
                    selectedPoints.firstChild.firstChild.getAttribute("d")
                ).toBe(SHAPES.CIRCLE.path.d);
            });
            it("selected data point has correct unique key assigned", () => {
                const selectedPoints = fetchElementByClass(
                    lineGraphContainer,
                    styles.dataPointSelection
                );
                expect(selectedPoints.getAttribute("aria-describedby")).toBe(
                    input.key
                );
            });
            describe("when clicked on a data point", () => {
                it("does not do anything if no onClick callback is provided", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = null;
                    graphDefault.loadContent(new Line(input));
                    const point = fetchElementByClass(
                        lineGraphContainer,
                        styles.point
                    );
                    triggerEvent(point, "click", () => {
                        expect(point.getAttribute("aria-disabled")).toBe(
                            "true"
                        );
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
                    graphDefault.loadContent(new Line(input));
                    const point = fetchElementByClass(
                        lineGraphContainer,
                        styles.point
                    );
                    triggerEvent(point, "click", () => {
                        const selectionPoint = fetchElementByClass(
                            lineGraphContainer,
                            styles.dataPointSelection
                        );
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
                it("calls onClick callback", (done) => {
                    const dataPointClickHandlerSpy = sinon.spy();
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = dataPointClickHandlerSpy;
                    graphDefault.loadContent(new Line(input));
                    const point = fetchElementByClass(
                        lineGraphContainer,
                        styles.point
                    );
                    triggerEvent(point, "click", () => {
                        expect(
                            dataPointClickHandlerSpy.calledOnce
                        ).toBeTruthy();
                        done();
                    });
                });
                it("calls onClick callback with parameters", (done) => {
                    let args = {};
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (cb, key, index, val, target) => {
                        args = {
                            cb,
                            key,
                            index,
                            val,
                            target
                        };
                    };
                    graphDefault.loadContent(new Line(input));
                    const point = lineGraphContainer.querySelectorAll(
                        `.${styles.point}`
                    )[1];
                    triggerEvent(point, "click", () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toBe(input.values[1].x);
                        expect(args.val.y).toBe(input.values[1].y);
                        expect(args.target).not.toBeNull();
                        done();
                    });
                });
                it("highlights the data point", (done) => {
                    const selectionPoint = fetchElementByClass(
                        lineGraphContainer,
                        styles.dataPointSelection
                    );
                    const point = fetchElementByClass(
                        lineGraphContainer,
                        styles.point
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
                        lineGraphContainer,
                        styles.dataPointSelection
                    );
                    const point = fetchElementByClass(
                        lineGraphContainer,
                        styles.point
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
            });
            describe("when clicked on a data point's near surrounding area", () => {
                it("highlights the data point", (done) => {
                    const selectionPoint = fetchElementByClass(
                        lineGraphContainer,
                        styles.dataPointSelection
                    );
                    triggerEvent(selectionPoint, "click", () => {
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "false"
                        );
                        done();
                    });
                });
                it("calls onClick callback with parameters", (done) => {
                    let args = {};
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (cb, key, index, val, target) => {
                        args = {
                            cb,
                            key,
                            index,
                            val,
                            target
                        };
                    };
                    graphDefault.loadContent(new Line(input));
                    const selectionPoint = lineGraphContainer.querySelectorAll(
                        `.${styles.dataPointSelection}`
                    )[1];
                    triggerEvent(selectionPoint, "click", () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toBe(input.values[1].x);
                        expect(args.val.y).toBe(input.values[1].y);
                        expect(args.target).not.toBeNull();
                        done();
                    });
                });
                it("removes highlight when clicked again", (done) => {
                    const selectionPoint = fetchElementByClass(
                        lineGraphContainer,
                        styles.dataPointSelection
                    );
                    triggerEvent(selectionPoint, "click", () => {
                        triggerEvent(selectionPoint, "click", () => {
                            expect(
                                selectionPoint.getAttribute("aria-hidden")
                            ).toBe("true");
                            done();
                        });
                    });
                });
            });
            describe("When interpolation type is provided", () => {
                it("Displays graph properly", () => {
                    graphDefault.destroy();
                    const graph = new Graph(getAxes(axisDefault));
                    const input = getInput(valuesDefault);
                    input.type = LINE_TYPE.SPLINE;
                    graph.loadContent(new Line(input));
                    const data = graph.content[0].dataTarget;
                    expect(data.interpolationType).toBe(LINE_TYPE.SPLINE);
                });
            });
            describe("When values are non-contiguous", () => {
                const axis = {
                    x: {
                        label: "Some X Label",
                        lowerLimit: 0,
                        upperLimit: 100
                    },
                    y: {
                        label: "Some Y Label",
                        lowerLimit: 20,
                        upperLimit: 200
                    },
                    y2: {
                        show: true,
                        label: "Some Y2 Label",
                        lowerLimit: 20,
                        upperLimit: 200
                    }
                };
                const values = [
                    { x: 35, y: 40 },
                    { x: 55, y: 50 },
                    { x: 45, y: null },
                    { x: 25, y: 100 },
                    { x: 45, y: 150 }
                ];
                describe("In Y Axis", () => {
                    it("Displays graph properly", () => {
                        graphDefault.destroy();
                        const graph = new Graph(getAxes(axis));
                        const input = getInput(values, true, true, false);
                        input.values = values;
                        graph.loadContent(new Line(input));
                        graph.resize();
                        const lineGroup = lineGraphContainer.querySelectorAll(
                            `.${styles.currentLinesGroup}`
                        );
                        expect(lineGroup.length).toBe(1);
                        expect(
                            lineGraphContainer
                                .querySelectorAll(`.${styles.point}`)[2]
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(graph.config.axis.y.domain.lowerLimit).toBe(11);
                        expect(graph.config.axis.y.domain.upperLimit).toBe(209);
                    });
                    it("Displays graph properly without domain padding", () => {
                        graphDefault.destroy();
                        const data = getAxes(axis);
                        data.axis.y.padDomain = false;
                        const graph = new Graph(data);
                        const input = getInput(values, true, true, false);
                        input.values = values;
                        graph.loadContent(new Line(input));
                        graph.resize();
                        const lineGroup = lineGraphContainer.querySelectorAll(
                            `.${styles.currentLinesGroup}`
                        );
                        expect(lineGroup.length).toBe(1);
                        expect(
                            lineGraphContainer
                                .querySelectorAll(`.${styles.point}`)[2]
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(graph.config.axis.y.domain.lowerLimit).toBe(20);
                        expect(graph.config.axis.y.domain.upperLimit).toBe(200);
                    });
                });
                describe("In Y2 Axis", () => {
                    it("Displays graph properly", () => {
                        graphDefault.destroy();
                        const graph = new Graph(getAxes(axis));
                        const input = getInput(values, true, true, true);
                        graph.loadContent(new Line(input));
                        graph.resize();
                        const lineGroup = lineGraphContainer.querySelectorAll(
                            `.${styles.currentLinesGroup}`
                        );
                        expect(lineGroup.length).toBe(1);
                        expect(
                            lineGraphContainer
                                .querySelectorAll(`.${styles.point}`)[2]
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(graph.config.axis.y2.domain.lowerLimit).toBe(11);
                        expect(graph.config.axis.y2.domain.upperLimit).toBe(
                            209
                        );
                    });
                    it("Displays graph properly without domain padding", () => {
                        graphDefault.destroy();
                        const data = getAxes(axis);
                        data.axis.y2.padDomain = false;
                        const graph = new Graph(data);
                        const input = getInput(values, true, true, true);
                        graph.loadContent(new Line(input));
                        graph.resize();
                        const lineGroup = lineGraphContainer.querySelectorAll(
                            `.${styles.currentLinesGroup}`
                        );
                        expect(lineGroup.length).toBe(1);
                        expect(
                            lineGraphContainer
                                .querySelectorAll(`.${styles.point}`)[2]
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(graph.config.axis.y2.domain.lowerLimit).toBe(20);
                        expect(graph.config.axis.y2.domain.upperLimit).toBe(
                            200
                        );
                    });
                });
            });
        });
        describe("prepares to load legend item", () => {
            it("display the legend when empty array is provided as input", () => {
                graphDefault.loadContent(new Line(getInput([], false, true)));
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
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
            });
            it("does not load if legend is opted to be hidden", () => {
                graphDefault.destroy();
                const input = getAxes(axisDefault);
                input.showLegend = false;
                const noLegendGraph = new Graph(input);
                noLegendGraph.loadContent(new Line(getInput(valuesDefault)));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legend
                );
                expect(legendContainer).toBeNull();
                noLegendGraph.destroy();
            });
            it("does not load if label property is null", () => {
                const input = getInput(valuesDefault);
                input.label = null;
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("does not load if label property is empty", () => {
                const input = getInput(valuesDefault);
                input.label = {};
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("does not load if label display value is not provided", () => {
                const input = getInput(valuesDefault);
                input.label.display = "";
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
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
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(1);
            });
            it("loads item with a shape and text", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                const legendItemBtn = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItemBtn
                );
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
                expect(
                    legendItemBtn.children[0].classList.contains(
                        styles.legendItemIcon
                    )
                ).toBeTruthy();
            });
            it("loads the correct shape", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                const iconSVG = legendItem.querySelector("svg");
                const iconPath = legendItem.querySelector("path");
                expect(iconSVG).not.toBeNull();
                expect(iconSVG.classList).toContain(styles.legendItemIcon);
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("d")).toBe(SHAPES.RHOMBUS.path.d);
            });
            it("loads the correct color", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                const iconSVG = legendItem.querySelector("svg");
                const iconPath = legendItem.querySelector("path");
                expect(iconSVG).not.toBeNull();
                expect(iconSVG.classList).toContain(styles.legendItemIcon);
                expect(iconSVG.getAttribute("style")).toBe(
                    `fill: ${COLORS.BLUE};`
                );
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
            });
            it("attaches click event handlers correctly", (done) => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    expect(legendItem.getAttribute("aria-selected")).toBe(
                        "false"
                    );
                    done();
                });
            });
            it("on click hides the line and points", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const line = new Line(input);
                const graph = graphDefault.loadContent(line);
                triggerEvent(
                    fetchElementByClass(lineGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        line.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(1);
                        expect(
                            fetchElementByClass(
                                lineGraphContainer,
                                styles.point
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                lineGraphContainer,
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                lineGraphContainer,
                                styles.line
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("true");
                        rafSpy.calls.reset();
                        done();
                    }
                );
            });
            it("on click, removes the first line but keeps the rest", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryLine = new Line(inputPrimary);
                const secondaryLine = new Line(inputSecondary);
                graphDefault.loadContent(primaryLine);
                const graph = graphDefault.loadContent(secondaryLine);
                triggerEvent(
                    fetchElementByClass(lineGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        primaryLine.redraw(graph);
                        secondaryLine.redraw(graph);
                        const primaryLineElement = lineGraphContainer.querySelector(
                            `.${styles.lineGraphContent}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const secondaryLineElement = lineGraphContainer.querySelector(
                            `.${styles.lineGraphContent}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(graph.config.shownTargets.length).toBe(1);
                        expect(
                            fetchElementByClass(
                                primaryLineElement,
                                styles.point
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                primaryLineElement,
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                primaryLineElement,
                                styles.line
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                secondaryLineElement,
                                styles.point
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                secondaryLineElement,
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                secondaryLineElement,
                                styles.line
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("on clicking twice toggles the line and points back to visible", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const line = new Line(input);
                const graph = graphDefault.loadContent(line);
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    line.redraw(graph);
                    triggerEvent(legendItem, "click", () => {
                        line.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(2);
                        expect(
                            fetchElementByClass(
                                lineGraphContainer,
                                styles.point
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                lineGraphContainer,
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                lineGraphContainer,
                                styles.line
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("false");
                        rafSpy.calls.reset();
                        done();
                    });
                });
            });
            it("shown targets are removed from Graph", (done) => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Line(input));
                triggerEvent(
                    fetchElementByClass(lineGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        expect(graph.config.shownTargets.length).toBe(0);
                        done();
                    }
                );
            });
            it("shown targets are updated back when toggled", (done) => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
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
                graphDefault.loadContent(new Line(inputPrimary));
                graphDefault.loadContent(new Line(inputSecondary));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    expect(
                        document
                            .querySelector(
                                `path[aria-describedby="${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.highlight)
                    ).toBeTruthy();
                    expect(
                        document
                            .querySelector(
                                `.${styles.point}[aria-describedby="${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.highlight)
                    ).toBeTruthy();
                    expect(
                        document
                            .querySelector(
                                `path[aria-describedby="${inputSecondary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeTruthy();
                    expect(
                        document
                            .querySelector(
                                `.${styles.point}[aria-describedby="${inputSecondary.key}"]`
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
                graphDefault.loadContent(new Line(inputPrimary));
                graphDefault.loadContent(new Line(inputSecondary));
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseleave", () => {
                    expect(
                        document
                            .querySelector(
                                `path[aria-describedby="${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.highlight)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `.${styles.point}[aria-describedby="${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.highlight)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `path[aria-describedby="${inputSecondary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `.${styles.point}[aria-describedby="${inputSecondary.key}"]`
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
                const linePrimary = getInput(valuesDefault, true, true, true);
                const lineSecondary = getInput(
                    valuesDefault,
                    true,
                    true,
                    false
                );
                lineSecondary.key = "uid_2";
                graph.loadContent(new Line(linePrimary));
                graph.loadContent(new Line(lineSecondary));
            });
            it("Does not load shape if Y2 axis is not loaded", () => {
                graphDefault.destroy();
                const axes = utils.deepClone(getAxes(axisDefault));
                axes.axis.y2.show = false;
                const graph = new Graph(axes);
                const input = getInput(valuesDefault, true, true, false);
                graph.loadContent(new Line(input));
                expect(
                    graph.axesLabelShapeGroup[constants.Y_AXIS]
                ).toBeUndefined();
                expect(
                    graph.axesLabelShapeGroup[constants.Y2_AXIS]
                ).toBeUndefined();
            });
            it("Loads shape in Y Axis", () => {
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
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
                const lineTertiary = getInput(valuesDefault, true, true, false);
                lineTertiary.key = "uid_3";
                graph.loadContent(new Line(lineTertiary));
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
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
                    lineGraphContainer,
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
                const lineTertiary = getInput(valuesDefault, true, true, true);
                lineTertiary.key = "uid_4";
                graph.loadContent(new Line(lineTertiary));
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
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
        it("returns the line instance", () => {
            const line = new Line(getInput(valuesDefault, false, false));
            graphDefault.loadContent(line);
            const unloadedLine = line.unload(graphDefault);
            expect(unloadedLine instanceof Line);
        });
        it("clears the graph", () => {
            const line = new Line(getInput(valuesDefault, false, false));
            graphDefault.loadContent(line);
            line.unload(graphDefault);
            const lineContentContainer = fetchElementByClass(
                lineGraphContainer,
                styles.lineGraphContent
            );
            expect(lineContentContainer).toBeNull();
        });
        it("removes the legend from graph", () => {
            const graphLegend = fetchElementByClass(
                lineGraphContainer,
                styles.legend
            );
            const lineLegendItem = fetchElementByClass(
                lineGraphContainer,
                styles.legendItem
            );
            expect(graphLegend).not.toBeNull();
            expect(lineLegendItem).toBeNull();
        });
        it("resets the line graph instance properties", () => {
            const line = new Line(getInput(valuesDefault, false, false));
            graphDefault.loadContent(line);
            line.unload(graphDefault);
            expect(line.dataTarget).toEqual({});
            expect(line.config).toEqual({});
        });
        describe("Removes label shape from label container", () => {
            let graph;
            let linePrimary;
            let lineSecondary;
            beforeEach(() => {
                graphDefault.destroy();
                graph = new Graph(getAxes(axisDefault));
                linePrimary = new Line(
                    getInput(valuesDefault, true, true, true)
                );
                lineSecondary = new Line(inputSecondary);
                graph.loadContent(linePrimary);
                graph.loadContent(lineSecondary);
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
                graph.unloadContent(lineSecondary);
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(0);
            });
            it("For Y axis with multiple data set", () => {
                graph.loadContent(
                    new Line({
                        key: `uid_3`,
                        label: {
                            display: "Data Label B"
                        },
                        values: valuesDefault
                    })
                );
                graph.unloadContent(lineSecondary);
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
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
                graph.unloadContent(linePrimary);
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(0);
            });
            it("For Y2 axis with multiple data set", () => {
                graph.loadContent(
                    new Line({
                        key: `uid_4`,
                        label: {
                            display: "Data Label C"
                        },
                        yAxis: "y2",
                        values: valuesDefault
                    })
                );
                graph.unloadContent(linePrimary);
                const labelShapeContainer = fetchElementByClass(
                    lineGraphContainer,
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
        let line = null;
        let data = null;
        describe("On load", () => {
            describe("Ideally", () => {
                beforeEach(() => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 5,
                            end: 15,
                            color: "#f4f4f4"
                        }
                    ];
                    line = new Line(data);
                    graphDefault.loadContent(line);
                });
                it("Creates region when present", () => {
                    const regionGroupElement = fetchElementByClass(
                        lineGraphContainer,
                        styles.regionGroup
                    );
                    const regionElement = fetchElementByClass(
                        regionGroupElement,
                        styles.region
                    );
                    expect(regionGroupElement.childNodes.length).toBe(1);
                    expect(regionElement.nodeName).toBe("rect");
                });
                it("shows region by default", () => {
                    const regionElement = fetchElementByClass(
                        fetchElementByClass(
                            lineGraphContainer,
                            styles.regionGroup
                        ),
                        styles.region
                    );
                    expect(regionElement.getAttribute("class")).toBe(
                        styles.region
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
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                const regionElement = fetchElementByClass(
                    regionGroupElement,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(0);
                expect(regionElement).toBeNull();
            });
            describe("Creates region when there are multiple regions", () => {
                beforeEach(() => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 5,
                            end: 10
                        },
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15
                        }
                    ];
                    line = new Line(data);
                    graphDefault.loadContent(line);
                });
                it("Correctly renders", () => {
                    const regionGroupElement = fetchElementByClass(
                        lineGraphContainer,
                        styles.regionGroup
                    );
                    const regionElement = fetchElementByClass(
                        regionGroupElement,
                        styles.region
                    );
                    expect(regionGroupElement.childNodes.length).toBe(2);
                    expect(regionElement.nodeName).toBe("rect");
                });
                it("shows multiple regions face-up by default", () => {
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
                });
                it("Throws error when empty", () => {
                    data.regions = [{}];
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
                    }).toThrowError(errors.THROW_MSG_REGION_EMPTY);
                });
                it("Throws error when both start and end are empty", () => {
                    data.regions = [
                        {
                            start: null,
                            end: null
                        }
                    ];
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
                    }).toThrowError(errors.THROW_MSG_REGION_START_END_MISSING);
                });
                it("Throws error when axis info is invalid", () => {
                    data.regions = [
                        {
                            axis: "x",
                            start: 10,
                            end: 20
                        }
                    ];
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when axis info is invalid for Y2 axis", () => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false, true)
                    );
                    data.regions = [
                        {
                            axis: "x",
                            start: 10,
                            end: 20
                        }
                    ];
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
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
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
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
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
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
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
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
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
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
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
                    }).toThrowError(errors.THROW_MSG_REGION_START_MORE_END);
                });
                it("Correctly passes validation", () => {
                    data.regions = [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15
                        }
                    ];
                    line = new Line(data);
                    expect(() => {
                        graphDefault.loadContent(line);
                    }).not.toThrow();
                });
            });
            it("Translates region correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(regionElement.nodeName).toBe("rect");
                expect(+regionElement.getAttribute("x")).toBe(
                    getXAxisXPosition(graphDefault.config)
                );
                expect(toNumber(regionElement.getAttribute("y"), 10)).toBe(
                    toNumber(graphDefault.scale.y(15), 10) +
                        constants.PADDING.bottom
                );
            });
            it("Does not hide regions if graph has only 1 data-set", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 1,
                        end: 5
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                const regionElement = fetchElementByClass(
                    regionGroupElement,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(1);
                expect(regionElement.getAttribute("aria-describedby")).toBe(
                    `region_${data.key}`
                );
                expect(regionElement.getAttribute("aria-hidden")).toBe("false");
            });
            it("Hides all the regions if graph has more than 1 data-set", () => {
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 1,
                        end: 5
                    },
                    {
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                const lineContent = new Line(inputSecondary);
                graphDefault.loadContent(line);
                graphDefault.loadContent(lineContent);
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(2);
                expect(
                    regionGroupElement.childNodes[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}`);
                expect(
                    regionGroupElement.childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}`);
                expect(
                    regionGroupElement.childNodes[0].getAttribute("aria-hidden")
                ).toBe("true");
                expect(
                    regionGroupElement.childNodes[1].getAttribute("aria-hidden")
                ).toBe("true");
                graphDefault.unloadContent(lineContent);
            });
            it("Sets the width correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("width")).toBe(
                    getXAxisWidth(graphDefault.config)
                );
            });
            it("Sets the height correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("height")).toBeGreaterThan(
                    constants.PADDING.top
                );
            });
            it("Creates a goal line when start and end are same", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 15,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("height")).toBe(
                    constants.DEFAULT_REGION_GOAL_LINE_STROKE_WIDTH
                );
            });
            it("Creates region correctly when start is not provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("x")).toBe(
                    getXAxisXPosition(graphDefault.config)
                );
                expect(+regionElement.getAttribute("y")).toBeGreaterThan(
                    constants.PADDING.top
                );
                expect(+regionElement.getAttribute("y")).toBeLessThan(
                    +graphDefault.config.height
                );
            });
            it("Creates region correctly when end is not provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("x")).toBe(
                    getXAxisXPosition(graphDefault.config)
                );
                expect(+regionElement.getAttribute("y")).toBe(
                    constants.PADDING.bottom
                );
            });
            it("Creates region correctly for y2 axis", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = [
                    {
                        axis: constants.Y2_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(regionElement.nodeName).toBe("rect");
                expect(+regionElement.getAttribute("x")).toBe(
                    getXAxisXPosition(graphDefault.config)
                );
                expect(toNumber(regionElement.getAttribute("y"), 10)).toBe(
                    toNumber(graphDefault.scale.y2(15), 10) +
                        constants.PADDING.bottom
                );
            });
            it("Creates region with correct, color if provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 10,
                        end: 15,
                        color: "#f44444"
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                const regionElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.region
                );
                expect(regionElement.getAttribute("style")).toBe(
                    "fill: #f44444;"
                );
            });
        });
        describe("On unload", () => {
            it("Removes any region", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                graphDefault.unloadContent(line);
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(0);
            });
            it("Removes all regions", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = [
                    {
                        start: 1,
                        end: 5
                    },
                    {
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
                graphDefault.unloadContent(line);
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(0);
            });
        });
        describe("On legend item hover", () => {
            describe("When single-line", () => {
                let inputPrimary = null;
                let linePrimary = null;
                let lineSecondary = null;
                beforeEach(() => {
                    inputPrimary = getInput(valuesDefault, false, false);
                    inputPrimary.regions = [
                        {
                            start: 1,
                            end: 5
                        }
                    ];
                    linePrimary = new Line(inputPrimary);
                    lineSecondary = new Line(inputSecondary);
                    graphDefault.loadContent(linePrimary);
                    graphDefault.loadContent(lineSecondary);
                });
                it("Shows region on mouse enter", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}"]`
                                )
                                .classList.contains(styles.regionHighlight)
                        ).toBeTruthy();
                        done();
                    });
                });
                it("Hides region on mouse exit", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            expect(
                                document
                                    .querySelector(
                                        `rect[aria-describedby="region_${inputPrimary.key}"]`
                                    )
                                    .classList.contains(styles.regionHighlight)
                            ).toBeFalsy();
                            expect(
                                document
                                    .querySelector(
                                        `rect[aria-describedby="region_${inputPrimary.key}"]`
                                    )
                                    .getAttribute("aria-hidden")
                            ).toBeTruthy();
                            done();
                        });
                    });
                });
            });
            describe("When multi-line", () => {
                let inputPrimary = null;
                let linePrimary = null;
                let lineSecondary = null;
                beforeEach(() => {
                    inputPrimary = getInput(valuesDefault, false, false);
                    inputPrimary.regions = [
                        {
                            start: 1,
                            end: 5
                        },
                        {
                            start: 10,
                            end: 15
                        }
                    ];
                    linePrimary = new Line(inputPrimary);
                    lineSecondary = new Line(inputSecondary);
                    graphDefault.loadContent(linePrimary);
                    graphDefault.loadContent(lineSecondary);
                });
                it("Shows region on mouse enter", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}"]`
                        );
                        expect(
                            regionElements[0].classList.contains(
                                styles.regionHighlight
                            )
                        ).toBeTruthy();
                        expect(
                            regionElements[1].classList.contains(
                                styles.regionHighlight
                            )
                        ).toBeTruthy();
                        done();
                    });
                });
                it("Hides all the regions except current", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const regionElements = document.querySelectorAll(
                                `rect[aria-describedby="region_${inputPrimary.key}"]`
                            );
                            expect(
                                regionElements[0].classList.contains(
                                    styles.regionHighlight
                                )
                            ).toBeFalsy();
                            expect(
                                regionElements[1].classList.contains(
                                    styles.regionHighlight
                                )
                            ).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
        describe("Check if region same for multiline with same dataset", () => {
            let inputPrimary = null;
            let linePrimary = null;
            let lineSecondary = null;
            let lineThird = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = [
                    {
                        start: 1,
                        end: 5
                    }
                ];
                inputSecondary.regions = [
                    {
                        start: 1,
                        end: 5
                    }
                ];
                linePrimary = new Line(inputPrimary);
                lineSecondary = new Line(inputSecondary);
                graphDefault.loadContent(linePrimary);
                graphDefault.loadContent(lineSecondary);
            });
            it("Correctly renders", () => {
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                const regionElement = fetchElementByClass(
                    regionGroupElement,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(2);
                expect(regionElement.nodeName).toBe("rect");
            });
            it("Hides region if one or more is missing", () => {
                inputTertiary.regions = null;
                lineThird = new Line(inputTertiary);
                graphDefault.loadContent(lineThird);
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(2);
                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("true");
                });
                expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}`
                );
                expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}`
                );
            });
            it("Shows region if one or more are identical", () => {
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(2);
                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("false");
                });
                expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}`
                );
                expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}`
                );
            });
            it("Hides region if one or more are not identical", () => {
                inputTertiary.regions = [
                    {
                        start: 1,
                        end: 10
                    }
                ];
                lineThird = new Line(inputTertiary);
                graphDefault.loadContent(lineThird);
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(3);
                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("true");
                });
                expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}`
                );
                expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}`
                );
                expect(regionsElement[2].getAttribute("aria-describedby")).toBe(
                    `region_${inputTertiary.key}`
                );
            });
        });
        describe("On legend item click", () => {
            let inputPrimary = null;
            let linePrimary = null;
            let lineSecondary = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault);
                inputPrimary.regions = [
                    {
                        start: 1,
                        end: 5
                    },
                    {
                        start: 10,
                        end: 15
                    }
                ];
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
            });
            describe("When single-line", () => {
                it("Hides region on toggle", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        const regionElement = document.querySelector(
                            `rect[aria-describedby="region_${inputPrimary.key}"]`
                        );
                        expect(regionElement.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
                it("Hides regions on toggle", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}"]`
                        );
                        expect(
                            regionElements[0].getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            regionElements[1].getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    });
                });
                it("Shows region on re-toggle", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(
                            legendItem,
                            "click",
                            () => {
                                const regionElements = document.querySelectorAll(
                                    `rect[aria-describedby="region_${inputPrimary.key}"]`
                                );
                                expect(
                                    regionElements[0].getAttribute(
                                        "aria-hidden"
                                    )
                                ).toBe("false");
                                expect(
                                    regionElements[1].getAttribute(
                                        "aria-hidden"
                                    )
                                ).toBe("false");
                                done();
                            },
                            200
                        );
                    });
                });
            });
            describe("When multi-line", () => {
                it("Shows when data-sets shown === 1", (done) => {
                    lineSecondary = new Line(inputSecondary);
                    graphDefault.loadContent(lineSecondary);
                    const legendItem = lineGraphContainer.querySelectorAll(
                        `.${styles.legendItem}`
                    );
                    triggerEvent(legendItem[1], "click", () => {
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}"]`
                                )
                                .getAttribute("aria-hidden")
                        ).toBe("false");
                        graphDefault.unloadContent(lineSecondary);
                        done();
                    });
                });
            });
        });
    });
    describe("Criticality", () => {
        let inputPrimary = null;
        let linePrimary = null;
        let lineSecondary = null;
        describe("On load", () => {
            it("Does not add indicator if data point is not critical", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                linePrimary = new Line(getInput(valuesMutated));
                graphDefault.loadContent(linePrimary);
                const criticalOuterElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalOuterElement).toBeNull();
                expect(criticalInnerElement).toBeNull();
            });
            it("Does not add indicator if data point is critical false", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = false;
                linePrimary = new Line(getInput(valuesMutated));
                graphDefault.loadContent(linePrimary);
                const criticalOuterElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalOuterElement).toBeNull();
                expect(criticalInnerElement).toBeNull();
            });
            it("Adds outer indicator - Red", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                const criticalOuterElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement).not.toBeNull();
                expect(criticalOuterElement.nodeName).toBe("svg");
                expect(criticalOuterElement.classList).toContain(styles.point);
                expect(criticalOuterElement.classList).toContain(
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(
                    criticalOuterElement.getAttribute("aria-describedby")
                ).toBe(inputPrimary.key);
            });
            it("Adds inner indicator - White", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                const criticalInnerElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement).not.toBeNull();
                expect(criticalInnerElement.nodeName).toBe("svg");
                expect(criticalInnerElement.classList).toContain(styles.point);
                expect(criticalInnerElement.classList).toContain(
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(
                    criticalInnerElement.getAttribute("aria-describedby")
                ).toBe(inputPrimary.key);
            });
            it("Adds indicators inner and outer with same shape", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);

                const criticalOuterElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                const currentShape = new Shape(
                    getShapeForTarget(inputPrimary)
                ).getShapeElement();
                expect(criticalOuterElement.nodeName).toBe(
                    currentShape.nodeName
                );
                expect(criticalInnerElement.nodeName).toBe(
                    currentShape.nodeName
                );
                expect(
                    criticalOuterElement.firstChild.firstChild.getAttribute("d")
                ).toBe(currentShape.firstChild.firstChild.getAttribute("d"));
                expect(
                    criticalInnerElement.firstChild.firstChild.getAttribute("d")
                ).toBe(currentShape.firstChild.firstChild.getAttribute("d"));
            });
            it("Translates properly", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                const criticalOuterElementPath = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                ).firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                ).firstChild;

                expect(
                    criticalOuterElementPath.getAttribute("transform")
                ).not.toBeNull();
                expect(
                    criticalInnerElementPath.getAttribute("transform")
                ).not.toBeNull();
                expect(
                    getSVGAnimatedTransformList(
                        getCurrentTransform(criticalOuterElementPath)
                    ).translate[0]
                ).not.toBeNull();
                expect(
                    getSVGAnimatedTransformList(
                        getCurrentTransform(criticalOuterElementPath)
                    ).translate[1]
                ).not.toBeNull();
                expect(
                    getSVGAnimatedTransformList(
                        getCurrentTransform(criticalInnerElementPath)
                    ).translate[0]
                ).not.toBeNull();
                expect(
                    getSVGAnimatedTransformList(
                        getCurrentTransform(criticalInnerElementPath)
                    ).translate[1]
                ).not.toBeNull();
            });
            it("Scales properly", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                const criticalOuterElementPath = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                ).firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                ).firstChild;
                expect(getTransformScale(criticalOuterElementPath)[0]).toBe(
                    round2Decimals(
                        getShapeForTarget(inputPrimary).options.scale
                    )
                );
                expect(getTransformScale(criticalInnerElementPath)[0]).toBe(
                    round2Decimals(
                        getShapeForTarget(inputPrimary).options.scale
                    )
                );
            });
            it("Shows even on multiple data-set", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                lineSecondary = new Line(inputSecondary);
                graphDefault.loadContent(lineSecondary);
                const criticalOuterElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalOuterElement).not.toBeNull();
                expect(criticalOuterElement.nodeName).toBe("svg");
                expect(criticalOuterElement.classList).toContain(styles.point);
                expect(criticalOuterElement.classList).toContain(
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(criticalInnerElement).not.toBeNull();
                expect(criticalInnerElement.nodeName).toBe("svg");
                expect(criticalInnerElement.classList).toContain(styles.point);
                expect(criticalInnerElement.classList).toContain(
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
            });
            it("Selects data point when clicked on outer indicator", (done) => {
                const criticalOuterPointSpy = sinon.spy();
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputPrimary.onClick = criticalOuterPointSpy;
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                const point = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                triggerEvent(point, "click", () => {
                    expect(criticalOuterPointSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Emits correct parameters when clicked on outer indicator", (done) => {
                let args = {};
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[1].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputPrimary.onClick = (cb, key, index, val, target) => {
                    args = {
                        cb,
                        key,
                        index,
                        val,
                        target
                    };
                };
                graphDefault.loadContent(new Line(inputPrimary));
                const point = lineGraphContainer.querySelector(
                    `.${styles.criticalityOuterPoint}`
                );
                triggerEvent(point, "click", () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.x).toBe(inputPrimary.values[1].x);
                    expect(args.val.y).toBe(inputPrimary.values[1].y);
                    expect(args.target).not.toBeNull();
                    done();
                });
            });
            it("Selects data point when clicked on inner indicator", (done) => {
                const criticalInnerPointSpy = sinon.spy();
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputPrimary.onClick = criticalInnerPointSpy;
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                const point = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                triggerEvent(point, "click", () => {
                    expect(criticalInnerPointSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Emits correct parameters when clicked on inner point", (done) => {
                let args = {};
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[1].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputPrimary.onClick = (cb, key, index, val, target) => {
                    args = {
                        cb,
                        key,
                        index,
                        val,
                        target
                    };
                };
                graphDefault.loadContent(new Line(inputPrimary));
                const point = lineGraphContainer.querySelector(
                    `.${styles.criticalityInnerPoint}`
                );
                triggerEvent(point, "click", () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.x).toBe(inputPrimary.values[1].x);
                    expect(args.val.y).toBe(inputPrimary.values[1].y);
                    expect(args.target).not.toBeNull();
                    done();
                });
            });
        });
        describe("On unload", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
                graphDefault.unloadContent(linePrimary);
            });
            it("Removes outer indicator", () => {
                const criticalOuterElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement).toBeNull();
            });
            it("Removes inner indicator", () => {
                const criticalInnerElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement).toBeNull();
            });
        });
        describe("On legend item hover", () => {
            describe("On single data-set", () => {
                beforeEach(() => {
                    const valuesMutated = utils.deepClone(valuesDefault);
                    valuesMutated[0].isCritical = true;
                    inputPrimary = getInput(valuesMutated, false, false);
                    linePrimary = new Line(inputPrimary);
                    graphDefault.loadContent(linePrimary);
                });
                it("Highlights the indicators on mouse-enter", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(criticalOuterElement.classList).toContain(
                            styles.highlight
                        );
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(criticalInnerElement.classList).toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
                it("Removes highlights for indicators on mouse-leave", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            expect(
                                criticalOuterElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                criticalOuterElement.classList
                            ).not.toContain(styles.highlight);
                            expect(
                                criticalInnerElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                criticalInnerElement.classList
                            ).not.toContain(styles.highlight);
                            done();
                        });
                    });
                });
            });
            describe("On multiple data-set", () => {
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    }
                };
                beforeEach(() => {
                    const valuesMutated = utils.deepClone(valuesDefault);
                    const valuesMutatedAlt = utils.deepClone(valuesDefault);
                    valuesMutated[0].isCritical = true;
                    valuesMutatedAlt[1].isCritical = true;
                    inputPrimary = getInput(valuesMutated);
                    inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                    linePrimary = new Line(inputPrimary);
                    lineSecondary = new Line(inputSecondary);
                    graphDefault.loadContent(linePrimary);
                    graphDefault.loadContent(lineSecondary);
                });
                it("Highlights the current indicator", (done) => {
                    const legendItem = fetchElementByClass(
                        lineGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(criticalOuterElement.classList).toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
                it("Blurs other indicators", (done) => {
                    const legendItem = lineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(criticalOuterElement.classList).not.toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).not.toContain(
                            styles.highlight
                        );
                        expect(criticalOuterElementAlt.classList).toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElementAlt.classList).toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
                it("Removes highlights on mouse-leave", (done) => {
                    const legendItem = lineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            expect(
                                criticalOuterElement.classList
                            ).not.toContain(styles.highlight);
                            expect(
                                criticalInnerElement.classList
                            ).not.toContain(styles.highlight);
                            done();
                        });
                    });
                });
                it("Removes blur for other data points on mouse-leave", (done) => {
                    const legendItem = lineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalOuterElementAlt = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                            );
                            const criticalInnerElementAlt = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                            );
                            expect(
                                criticalOuterElement.classList
                            ).not.toContain(styles.highlight);
                            expect(
                                criticalInnerElement.classList
                            ).not.toContain(styles.highlight);
                            expect(
                                criticalOuterElementAlt.classList
                            ).not.toContain(styles.highlight);
                            expect(
                                criticalInnerElementAlt.classList
                            ).not.toContain(styles.highlight);
                            done();
                        });
                    });
                });
            });
        });
        describe("On legend item click", () => {
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                }
            };
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                linePrimary = new Line(inputPrimary);
                graphDefault.loadContent(linePrimary);
            });
            describe("On single data-set", () => {
                it("Hides indicators on toggle", (done) => {
                    const legendItem = lineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    });
                });
                it("Shows indicators on re-toggle", (done) => {
                    const legendItem = lineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(
                            legendItem,
                            "click",
                            () => {
                                const criticalOuterElement = document.querySelector(
                                    `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                                );
                                const criticalInnerElement = document.querySelector(
                                    `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                                );
                                expect(
                                    criticalOuterElement.getAttribute(
                                        "aria-hidden"
                                    )
                                ).toBe("false");
                                expect(
                                    criticalInnerElement.getAttribute(
                                        "aria-hidden"
                                    )
                                ).toBe("false");
                                done();
                            },
                            200
                        );
                    });
                });
            });
            describe("On multiple data-set", () => {
                it("Shows when data-sets shown === 1", (done) => {
                    const valuesMutatedAlt = utils.deepClone(valuesDefault);
                    valuesMutatedAlt[1].isCritical = true;
                    inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                    lineSecondary = new Line(inputSecondary);
                    graphDefault.loadContent(lineSecondary);
                    const legendItem = lineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            criticalOuterElementAlt.getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            criticalInnerElementAlt.getAttribute("aria-hidden")
                        ).toBe("true");
                        graphDefault.unloadContent(lineSecondary);
                        done();
                    });
                });
            });
        });
    });
});
