"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Line from "../../../../main/js/controls/Line";
import constants, {
    AXIS_TYPE,
    COLORS,
    LINE_TYPE,
    SHAPES
} from "../../../../main/js/helpers/constants";
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
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Line - Load", () => {
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
            const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
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
            data.internalValuesSubset.every((j) => j.shape === SHAPES.CIRCLE)
        ).toBeTruthy();
    });
    it("defaults axis to Y axis when not provided", () => {
        const graph = graphDefault.loadContent(
            new Line(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every((j) => j.yAxis === constants.Y_AXIS)
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
            expect(lineContentContainer.getAttribute("aria-describedby")).toBe(
                input.key
            );
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
        it("adds line with correct color with default stroke-dasharray to 0", () => {
            const lineElement = fetchElementByClass(
                lineGraphContainer,
                styles.line
            );
            expect(lineElement.firstChild.tagName).toBe("path");
            expect(
                lineElement.firstChild.attributes.getNamedItem("style").value
            ).toBe(`stroke: ${COLORS.GREEN}; stroke-dasharray: 0;`);
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
        it("does not render data point if data point is null", () => {
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
            const selectedPoint = fetchElementByClass(
                pointsGroup,
                styles.dataPointSelection
            );
            expect(pointsGroup.children.length).toBe(valuesDefault.length - 1);
            expect(selectedPoint.getAttribute("aria-hidden")).toContain("true");
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
        it("does not update y axis range if allow calibration is disabled", () => {
            graphDefault.destroy();
            const disableCalibrationInput = getAxes(axisDefault);
            disableCalibrationInput.allowCalibration = false;
            const disableCalibrationGraph = new Graph(disableCalibrationInput);
            input = getInput(valuesDefault, false, false);
            disableCalibrationGraph.loadContent(new Line(input));
            expect(disableCalibrationInput.axis.y.upperLimit).toEqual(
                disableCalibrationGraph.config.axis.y.domain.upperLimit
            );
            expect(disableCalibrationInput.axis.y.lowerLimit).toEqual(
                disableCalibrationGraph.config.axis.y.domain.lowerLimit
            );
        });
        it("update y axis range by default", () => {
            graphDefault.destroy();
            const disableCalibrationInput = getAxes(axisDefault);
            const disableCalibrationGraph = new Graph(disableCalibrationInput);
            input = getInput(valuesDefault, false, false);
            disableCalibrationGraph.loadContent(new Line(input));
            expect(disableCalibrationInput.axis.y.upperLimit).not.toEqual(
                disableCalibrationGraph.config.axis.y.domain.upperLimit
            );
            expect(disableCalibrationInput.axis.y.lowerLimit).not.toEqual(
                disableCalibrationGraph.config.axis.y.domain.lowerLimit
            );
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
                `fill: ${COLORS.GREEN};`
            );
        });
        it("points have correct shape", () => {
            const pointsGroup = fetchElementByClass(
                lineGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            expect(
                points.firstChild.firstChild.attributes.getNamedItem("d").value
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
            expect(selectedPoints.firstChild.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
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
        it("does not render points if shapes are hidden per data set", () => {
            graphDefault.destroy();
            const hiddenShapeInput = getAxes(axisDefault);
            hiddenShapeInput.showShapes = true;
            const hiddenShapeGraph = new Graph(hiddenShapeInput);
            input = getInput(valuesDefault, false, false);
            input.showShapes = false;
            hiddenShapeGraph.loadContent(new Line(input));
            expect(
                fetchElementByClass(
                    lineGraphContainer,
                    styles.currentPointsGroup
                )
            ).toBeNull();
        });
        describe("adds line with stroke-dasharray as provided by consumer with", () => {
            it("comma seperated values", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.style = {
                    strokeDashArray: "2,2"
                };
                const line = new Line(input);
                graphDefault.loadContent(line);
                const lineElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.line
                );
                expect(lineElement.firstChild.tagName).toBe("path");
                expect(
                    lineElement.firstChild.attributes.getNamedItem("style")
                        .value
                ).toBe(`stroke: ${COLORS.GREEN}; stroke-dasharray: 2,2;`);
            });
            it("space seperated values", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.style = {
                    strokeDashArray: "2 2"
                };
                const line = new Line(input);
                graphDefault.loadContent(line);
                const lineElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.line
                );
                expect(lineElement.firstChild.tagName).toBe("path");
                expect(
                    lineElement.firstChild.attributes.getNamedItem("style")
                        .value
                ).toBe(`stroke: ${COLORS.GREEN}; stroke-dasharray: 2 2;`);
            });
            it("just a single value", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.style = {
                    strokeDashArray: "2"
                };
                const line = new Line(input);
                graphDefault.loadContent(line);
                const lineElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.line
                );
                expect(lineElement.firstChild.tagName).toBe("path");
                expect(
                    lineElement.firstChild.attributes.getNamedItem("style")
                        .value
                ).toBe(`stroke: ${COLORS.GREEN}; stroke-dasharray: 2;`);
            });
        });
        it("adds line with correct stroke-dasharray", () => {});
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
                    expect(point.getAttribute("aria-disabled")).toBe("true");
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
                    expect(dataPointClickHandlerSpy.calledOnce).toBeTruthy();
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
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
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
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
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
                        lineGraphContainer.querySelectorAll(`.${styles.point}`)
                            .length
                    ).toEqual(values.length - 1);
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
                        lineGraphContainer.querySelectorAll(`.${styles.point}`)
                            .length
                    ).toEqual(values.length - 1);
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
                        lineGraphContainer.querySelectorAll(`.${styles.point}`)
                            .length
                    ).toEqual(values.length - 1);
                    expect(graph.config.axis.y2.domain.lowerLimit).toBe(11);
                    expect(graph.config.axis.y2.domain.upperLimit).toBe(209);
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
                        lineGraphContainer.querySelectorAll(`.${styles.point}`)
                            .length
                    ).toEqual(values.length - 1);
                    expect(graph.config.axis.y2.domain.lowerLimit).toBe(20);
                    expect(graph.config.axis.y2.domain.upperLimit).toBe(200);
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
            expect(legendItem.getAttribute("aria-current")).toBe("true");
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
            const iconSVG = legendItemBtn.children[0].firstChild;
            expect(legendItem).not.toBeNull();
            expect(legendItem.getAttribute("aria-current")).toBe("true");
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
            expect(iconSVG.tagName).toBe("svg");
            expect(
                iconSVG.classList.contains(styles.legendItemIcon)
            ).toBeTruthy();
        });
        it("loads the correct shape", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new Line(input));
            const legendItem = fetchElementByClass(
                lineGraphContainer,
                styles.legendItem
            );
            const svgElements = legendItem.querySelectorAll("svg");
            const iconSVG = svgElements[0];
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
            const svgElements = legendItem.querySelectorAll("svg");
            const iconSVG = svgElements[0];
            const iconPath = legendItem.querySelector("path");
            expect(iconSVG).not.toBeNull();
            expect(iconSVG.classList).toContain(styles.legendItemIcon);
            expect(iconSVG.getAttribute("style")).toBe(
                `fill: ${COLORS.GREEN};`
            );
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
        });
        it("loads only line if user sets showLine to be true and showShape to be false", () => {
            const input = getInput(valuesDefault, false, false);
            input.legendOptions = {
                showShape: false,
                showLine: true
            };
            graphDefault.loadContent(new Line(input));
            const legendItem = fetchElementByClass(
                lineGraphContainer,
                styles.legendItem
            );
            const svgElements = legendItem.querySelectorAll("svg");
            const lineSVG = svgElements[0];
            expect(svgElements.length).toBe(1);
            expect(lineSVG).not.toBeNull();
            expect(lineSVG.classList).toContain(styles.legendItemLine);
        });
        it("loads only shape if user sets showLine to be false and showShape to be true", () => {
            const input = getInput(valuesDefault, false, false);
            input.legendOptions = {
                showShape: true,
                showLine: false
            };
            graphDefault.loadContent(new Line(input));
            const legendItem = fetchElementByClass(
                lineGraphContainer,
                styles.legendItem
            );
            const svgElements = legendItem.querySelectorAll("svg");
            const iconPath = legendItem.querySelector("path");
            const iconSVG = svgElements[0];
            expect(svgElements.length).toBe(1);
            expect(iconSVG).not.toBeNull();
            expect(iconSVG.classList).toContain(styles.legendItemIcon);
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
        });
        it("loads the line with provided stroke dashArray", () => {
            const input = getInput(valuesDefault, false, false);
            input.legendOptions = {
                showShape: false,
                showLine: true,
                style: {
                    strokeDashArray: "2,2"
                }
            };
            graphDefault.loadContent(new Line(input));
            const legendItem = fetchElementByClass(
                lineGraphContainer,
                styles.legendItem
            );
            const svgElements = legendItem.querySelectorAll("svg");
            const lineSVG = svgElements[0];
            expect(lineSVG).not.toBeNull();
            expect(lineSVG.classList).toContain(styles.legendItemLine);
            expect(
                lineSVG.children[1].attributes.getNamedItem("style").value
            ).toContain(`stroke-dasharray: 2,2;`);
        });
        it("attaches click event handlers correctly", (done) => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new Line(input));
            const legendItem = fetchElementByClass(
                lineGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                expect(legendItem.getAttribute("aria-current")).toBe("false");
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
            graphDefault.loadContent(line);
            triggerEvent(
                fetchElementByClass(lineGraphContainer, styles.legendItem),
                "click",
                () => {
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(
                        1
                    );
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
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(
                        2
                    );
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
        describe("when the legend has no data",  () => {
            it ("should hide the legend if showElement is false", () => {
                const input = getInput([], false, false);
                input.legendOptions = {
                    showElement: false
                }
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("LI");
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("style")).toBe("display: none; padding: 4px 8px;");
            });
            it ("should show the legend if showElement is true", () => {
                const input = getInput([], false, false);
                input.legendOptions = {
                    showElement: true,
                }
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("LI");
                expect(legendItems.length).toBe(2);
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
            });
         });
         describe("when the legend has data",  () => {
            it ("should show the legend if showElement is false", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showElement: true,
                }
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("LI");
                expect(legendItems.length).toBe(2);
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("false");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
            });
            it ("should show the legend if showElement is true", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showElement: true,
                }
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
                expect(legendItem.getAttribute("aria-current")).toBe("true");
            });
         });
    });
    describe("Prepares to load label shape", () => {
        let graph;
        beforeEach(() => {
            graphDefault.destroy();
            graph = new Graph(getAxes(axisDefault));
            const linePrimary = getInput(valuesDefault, true, true, true);
            const lineSecondary = getInput(valuesDefault, true, true, false);
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
            expect(graph.axesLabelShapeGroup[constants.Y_AXIS]).toBeUndefined();
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
    describe("When legend item is clicked", () => {
        it("Preserves the DOM order", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const linePrimary = getInput(valuesDefault, true, true, true);
            const lineSecondary = getInput(valuesDefault, true, true, false);
            linePrimary.key = "uid_1";
            lineSecondary.key = "uid_2";
            graph.loadContent(new Line(linePrimary));
            graph.loadContent(new Line(lineSecondary));
            const legendItem = document.querySelector(
                `.${styles.legendItem}[aria-describedby="${linePrimary.key}"]`
            );
            expect(graph.config.shownTargets).toEqual(["uid_1", "uid_2"]);
            triggerEvent(legendItem, "click");
            triggerEvent(legendItem, "click");
            expect(graph.config.shownTargets).toEqual(["uid_2", "uid_1"]);
            expect(
                document
                    .querySelector(`.${styles.lineGraphContent}`)
                    .getAttribute("aria-describedby")
            ).toEqual(linePrimary.key);
        });
    });
});
