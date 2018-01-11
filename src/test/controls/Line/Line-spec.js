"use strict";
import Line from "../../../main/js/controls/Line";
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

describe("Line", () => {
    let graphDefault = null;
    let lineGraphContainer;
    beforeEach(() => {
        lineGraphContainer = document.createElement("div");
        lineGraphContainer.id = "testLine_carbon";
        lineGraphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        document.body.appendChild(lineGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("when constructed", () => {
        it("initializes properly", () => {
            const line = new Line(getInput(valuesDefault));
            expect(line.config).not.toBeNull();
            expect(line.valuesRange).not.toBeNull();
            expect(line.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Line());
            }).toThrow(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Line({ dummy: "dummy" }));
            }).toThrow(errors.THROW_MSG_INVALID_DATA_PROPERTY);
        });
        it("throws error when no values are provided", () => {
            expect(() => {
                graphDefault.loadContent(new Line(getInput([], false, false)));
            }).toThrow(errors.THROW_MSG_INVALID_DATA_PROPERTY);
        });
        it("does not throw error when datetime values have milliseconds", () => {
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(new Line(getInput([
                    {
                        x: "2016-02-03T12:00:00.000Z",
                        y: 1
                    }
                ], false, false)));
            }).not.toThrow();
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(new Line(getInput([
                    {
                        x: "2016-02-03T12:00:00Z",
                        y: 1
                    }
                ], false, false)));
            }).not.toThrow();
            expect(() => {
                const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                graphTimeSeries.loadContent(new Line(getInput([
                    {
                        x: "2016-02-03T12:00Z",
                        y: 1
                    }
                ], false, false)));
            }).not.toThrow();
        });
        describe("throws error when values have datetime in a different ISO8601 format", () => {
            it("on invalid millisecond value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new Line(getInput([
                        {
                            x: "2016-02-03T12:00:00:000Z",
                            y: 1
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on invalid second value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new Line(getInput([
                        {
                            x: "2016-02-03T12:00:00:000.000Z",
                            y: 1
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on no second value but with millisecond value", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new Line(getInput([
                        {
                            x: "2016-02-03T12:00.00Z",
                            y: 1
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on no minute or second but with Zulu time stamp", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new Line(getInput([
                        {
                            x: "2016-02-03T12Z",
                            y: 1
                        }
                    ], false, false)));
                }).toThrow();
            });
            it("on no hour, minute or second value but with Zulu timestamp", () => {
                expect(() => {
                    const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
                    graphTimeSeries.loadContent(new Line(getInput([
                        {
                            x: "2016-02-03Z",
                            y: 1
                        }
                    ], false, false)));
                }).toThrow();
            });
        });
        it("clones the input object correctly", () => {
            const input = getInput(valuesDefault, false, false);
            const line = new Line(input);
            expect(line.config.key).toBe(input.key);
            expect(line.config.color).toBe(input.color);
            expect(line.config.shape).toBe(input.shape);
            expect(line.config.label).toEqual(input.label);
            expect(line.config.onClick).toEqual(jasmine.any(Function));
            expect(line.config.values.length).toBe(3);
            expect(line.config.values.every((i, index) => i.x === input.values[ index ].x)).toBeTruthy();
            expect(line.config.values.every((i, index) => i.y === input.values[ index ].y)).toBeTruthy();
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
    describe("when graph is loaded with input", () => {
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
            }).toThrow(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("throws error when type and values are a mismatch", () => {
            expect(() => {
                const input = getInput(valuesTimeSeries, false, false);
                const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
                validGraph.loadContent(new Line(input));
            }).toThrow(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("internal subsets gets created correctly for each data point", () => {
            const graph = graphDefault.loadContent(new Line(getInput(valuesDefault, false, false)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                j.onClick !== null &&
                j.x !== null &&
                j.y !== null &&
                j.label !== null &&
                j.shape &&
                j.color &&
                j.yAxis &&
                j.key === data.key
            )).toBeTruthy();
            expect(graph.config.shownTargets.length).toBe(1);
        });
        it("internal subsets gets created successfully for time series", () => {
            const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
            const graph = graphTimeSeries.loadContent(new Line(getInput(valuesTimeSeries, false, false)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                typeof j.x === "object" &&
                j.x instanceof Date
            )).toBeTruthy();
        });
        it("defaults color to black when not provided", () => {
            const graph = graphDefault.loadContent(new Line(getInput(valuesDefault)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                j.color === constants.DEFAULT_COLOR
            )).toBeTruthy();
        });
        it("defaults shapes to circle when not provided", () => {
            const graph = graphDefault.loadContent(new Line(getInput(valuesDefault)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                j.shape === "CIRCLE"
            )).toBeTruthy();
        });
        it("defaults axis to Y axis when not provided", () => {
            const graph = graphDefault.loadContent(new Line(getInput(valuesDefault)));
            const data = graph.content[ 0 ].dataTarget;
            expect(data.internalValuesSubset.every((j) =>
                j.yAxis === constants.Y_AXIS
            )).toBeTruthy();
        });
        describe("draws the graph", () => {
            let input = null;
            beforeEach(() => {
                input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
            });
            it("adds content container for each line", () => {
                const lineContentContainer = fetchElementByClass(lineGraphContainer, styles.lineGraphContent);
                expect(lineContentContainer).not.toBeNull();
                expect(lineContentContainer.tagName).toBe("g");
                expect(lineContentContainer.getAttribute("aria-describedby")).toBe(input.key);
            });
            it("adds container for each data points sets for each line", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new Line(secInput));
                const graphContent = document.body.querySelectorAll(`.${styles.lineGraphContent}`);
                expect(graphContent.length).toBe(2);
            });
            it("adds legend for each data points sets for each line", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new Line(secInput));
                const legendItems = document.body.querySelectorAll(`.${styles.legendItem}`);
                expect(legendItems.length).toBe(2);
            });
            it("add line group for line", () => {
                const lineContentContainer = fetchElementByClass(lineGraphContainer, styles.lineGraphContent);
                const lineGroup = fetchElementByClass(lineContentContainer, styles.currentLinesGroup);
                expect(lineGroup).not.toBeNull();
                expect(lineGroup.tagName).toBe("g");
                expect(lineGroup.getAttribute("transform")).not.toBeNull();
            });
            it("adds line path as an SVG", () => {
                const lineContentContainer = fetchElementByClass(lineGraphContainer, styles.lineGraphContent);
                const lineGroup = fetchElementByClass(lineContentContainer, styles.currentLinesGroup);
                expect(lineGroup.firstChild.tagName).toBe("g");
                expect(lineGroup.firstChild.classList.contains(styles.line)).toBeTruthy();
            });
            it("adds line with correct color", () => {
                const lineElement = fetchElementByClass(lineGraphContainer, styles.line);
                expect(lineElement.firstChild.tagName).toBe("path");
                expect(lineElement.firstChild.attributes.getNamedItem("style").value).toBe("stroke: #007cc3;");
            });
            it("adds line with correct unique key", () => {
                const lineElement = fetchElementByClass(lineGraphContainer, styles.line);
                expect(lineElement.firstChild.attributes.getNamedItem("aria-describedby").value).toBe(input.key);
            });
            it("does not render points if shapes needs to be hidden", () => {
                graphDefault.destroy();
                const hiddenShapeInput = getAxes(axisDefault);
                hiddenShapeInput.showShapes = false;
                const hiddenShapeGraph = new Graph(hiddenShapeInput);
                input = getInput(valuesDefault, false, false);
                hiddenShapeGraph.loadContent(new Line(input));
                expect(fetchElementByClass(lineGraphContainer, styles.currentPointsGroup)).toBeNull();
            });
            it("add points group for data points", () => {
                const pointsGroup = fetchElementByClass(lineGraphContainer, styles.currentPointsGroup);
                expect(pointsGroup).not.toBeNull();
                expect(pointsGroup.tagName).toBe("g");
                expect(pointsGroup.getAttribute("transform")).not.toBeNull();
            });
            it("adds points for each data point", () => {
                const pointsGroup = fetchElementByClass(lineGraphContainer, styles.currentPointsGroup);
                const points = pointsGroup.querySelectorAll(`.${styles.point}`);
                expect(points.length).toBe(valuesDefault.length);
            });
            it("points have correct color", () => {
                const pointsGroup = fetchElementByClass(lineGraphContainer, styles.currentPointsGroup);
                const points = fetchElementByClass(pointsGroup, styles.point);
                expect(points.attributes.getNamedItem("style").value).toBe("fill: #007cc3;");
            });
            it("points have correct shape", () => {
                const pointsGroup = fetchElementByClass(lineGraphContainer, styles.currentPointsGroup);
                const points = fetchElementByClass(pointsGroup, styles.point);
                expect(points.attributes.getNamedItem("d").value).toBe(constants.CUSTOM_SHAPE_PATH.RHOMBUS);
            });
            it("points have correct unique key assigned", () => {
                const pointsGroup = fetchElementByClass(lineGraphContainer, styles.currentPointsGroup);
                const points = fetchElementByClass(pointsGroup, styles.point);
                expect(points.getAttribute("aria-describedby")).toBe(input.key);
            });
            it("adds a selected data point for each point", () => {
                const pointsGroup = fetchElementByClass(lineGraphContainer, styles.currentPointsGroup);
                const selectedPoints = pointsGroup.querySelectorAll(`.${styles.dataPointSelection}`);
                expect(selectedPoints.length).toBe(valuesDefault.length);
            });
            it("selected data point is hidden by default", () => {
                const selectedPoints = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                expect(selectedPoints.classList.contains("hidden")).toBeTruthy();
            });
            it("selected data point has circle as shape", () => {
                const selectedPoints = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                expect(selectedPoints.tagName).toBe("circle");
            });
            it("selected data point has correct unique key assigned", () => {
                const selectedPoints = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                expect(selectedPoints.getAttribute("aria-describedby")).toBe(input.key);
            });
            describe("when clicked on a data point", () => {
                it("does not do anything if no onClick callback is provided", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = null;
                    graphDefault.loadContent(new Line(input));
                    const point = fetchElementByClass(lineGraphContainer, styles.point);
                    triggerEvent(point, "click");
                    expect(dataPointClickHandlerSpy.calledOnce).toBeFalsy();
                });
                it("hides data point selection when parameter callback is called", () => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    graphDefault.loadContent(new Line(input));
                    const point = fetchElementByClass(lineGraphContainer, styles.point);
                    triggerEvent(point, "click");
                    const selectionPoint = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                    expect(selectionPoint.classList.contains("hidden")).toBeTruthy();
                });
                it("calls onClick callback", () => {
                    const point = fetchElementByClass(lineGraphContainer, styles.point);
                    triggerEvent(point, "click");
                    expect(dataPointClickHandlerSpy.calledOnce).toBeTruthy();
                });
                it("highlights the data point", () => {
                    const selectionPoint = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                    const point = fetchElementByClass(lineGraphContainer, styles.point);
                    triggerEvent(point, "click");
                    expect(selectionPoint.classList.contains("hidden")).toBeFalsy();
                });
                it("removes highlight when data point is clicked again", () => {
                    const selectionPoint = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                    const point = fetchElementByClass(lineGraphContainer, styles.point);
                    triggerEvent(point, "click");
                    triggerEvent(point, "click");
                    expect(selectionPoint.classList.contains("hidden")).toBeTruthy();
                });
            });
            describe("when clicked on a data point's near surrounding area", () => {
                it("highlights the data point", () => {
                    const selectionPoint = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                    triggerEvent(selectionPoint, "click");
                    expect(selectionPoint.classList.contains("hidden")).toBeFalsy();
                });
                it("removes highlight when clicked again", () => {
                    const selectionPoint = fetchElementByClass(lineGraphContainer, styles.dataPointSelection);
                    triggerEvent(selectionPoint, "click");
                    triggerEvent(selectionPoint, "click");
                    expect(selectionPoint.classList.contains("hidden")).toBeTruthy();
                });
            });
        });
        describe("prepares to load legend item", () => {
            it("does not load if legend is opted to be hidden", () => {
                graphDefault.destroy();
                const input = getAxes(axisDefault);
                input.showLegend = false;
                const noLegendGraph = new Graph(input);
                noLegendGraph.loadContent(new Line(getInput(valuesDefault)));
                const legendContainer = fetchElementByClass(lineGraphContainer, styles.legend);
                expect(legendContainer).toBeNull();
                noLegendGraph.destroy();
            });
            it("does not load if label property is null", () => {
                const input = getInput(valuesDefault);
                input.label = null;
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(lineGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("does not load if label property is empty", () => {
                const input = getInput(valuesDefault);
                input.label = {};
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(lineGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("does not load if label display value is not provided", () => {
                const input = getInput(valuesDefault);
                input.label.display = "";
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(lineGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("sanitizes the legend display", () => {
                const input = getInput(valuesDefault);
                input.label.display = "<HELLO DUMMY X LABEL>";
                graphDefault.loadContent(new Line(input));
                const legendContainer = fetchElementByClass(lineGraphContainer, styles.legend);
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(1);
            });
            it("loads item with a shape and text", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                const legendItemBtn = fetchElementByClass(lineGraphContainer, styles.legendItemBtn);
                expect(legendItem).not.toBeNull();
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
                expect(legendItem.children[ 1 ].className).toBe(styles.legendItemText);
                expect(legendItem.children[ 1 ].tagName).toBe("SPAN");
                expect(legendItem.children[ 1 ].textContent).toBe(input.label.display);
                expect(legendItemBtn).not.toBeNull();
                expect(legendItemBtn.getAttribute("class")).toBe(styles.legendItemBtn);
                expect(legendItemBtn.children[ 0 ].tagName).toBe("svg");
                expect(legendItemBtn.children[ 0 ].classList.contains(styles.legendItemIcon)).toBeTruthy();
            });
            it("loads the correct shape", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                const iconPath = legendItem.querySelector("path");
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("d")).toBe(constants.CUSTOM_SHAPE_PATH.RHOMBUS);
                expect(iconPath.getAttribute("transform")).not.toBeNull();
            });
            it("loads the correct color", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                const iconPath = legendItem.querySelector("path");
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("style")).toBe(`fill: ${COLORS.BLUE}`);
            });
            it("attaches click event handlers correctly", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "click");
                expect(legendItem.getAttribute("aria-selected")).toBe("false");
            });
            it("on click hides the line and points", () => {
                spyOn(window, "requestAnimationFrame").and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const line = new Line(input);
                const graph = graphDefault.loadContent(line);
                triggerEvent(fetchElementByClass(lineGraphContainer, styles.legendItem), "click");
                line.redraw(graph);
                expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
                expect(fetchElementByClass(lineGraphContainer, styles.point).style.display).toBe("none");
                expect(fetchElementByClass(lineGraphContainer, styles.dataPointSelection).style.display).toBe("none");
                expect(fetchElementByClass(lineGraphContainer, styles.line).firstChild.style.display).toBe("none");
            });
            it("on click, removes the first line but keeps the rest", () => {
                let graph = null;
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
                graph = graphDefault.loadContent(secondaryLine);
                triggerEvent(fetchElementByClass(lineGraphContainer, styles.legendItem), "click");
                primaryLine.redraw(graph);
                secondaryLine.redraw(graph);
                const primaryLineElement = lineGraphContainer.querySelector(`.${styles.lineGraphContent}[aria-describedby="${inputPrimary.key}"]`);
                const secondaryLineElement = lineGraphContainer.querySelector(`.${styles.lineGraphContent}[aria-describedby="${inputSecondary.key}"]`);
                expect(graph.config.shownTargets.length).toBe(1);
                expect(fetchElementByClass(primaryLineElement, styles.point).style.display).toBe("none");
                expect(fetchElementByClass(primaryLineElement, styles.dataPointSelection).style.display).toBe("none");
                expect(fetchElementByClass(primaryLineElement, styles.line).firstChild.style.display).toBe("none");
                expect(fetchElementByClass(secondaryLineElement, styles.point).style.display).toBe("");
                expect(fetchElementByClass(secondaryLineElement, styles.dataPointSelection).style.display).toBe("");
                expect(fetchElementByClass(secondaryLineElement, styles.line).firstChild.style.display).toBe("");
            });
            it("on clicking twice toggles the line and points back to visible", () => {
                spyOn(window, "requestAnimationFrame").and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const line = new Line(input);
                const graph = graphDefault.loadContent(line);
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "click");
                line.redraw(graph);
                triggerEvent(legendItem, "click");
                line.redraw(graph);
                expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
                expect(fetchElementByClass(lineGraphContainer, styles.point).style.display).toBe("");
                expect(fetchElementByClass(lineGraphContainer, styles.dataPointSelection).style.display).toBe("");
                expect(fetchElementByClass(lineGraphContainer, styles.line).firstChild.style.display).toBe("");
            });
            it("shown targets are removed from Graph", () => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Line(input));
                triggerEvent(fetchElementByClass(lineGraphContainer, styles.legendItem), "click");
                expect(graph.config.shownTargets.length).toBe(0);
            });
            it("shown targets are updated back when toggled", () => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Line(input));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "click");
                triggerEvent(legendItem, "click");
                expect(graph.config.shownTargets.length).toBe(1);
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
                graphDefault.loadContent(new Line(inputPrimary));
                graphDefault.loadContent(new Line(inputSecondary));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "mouseenter");
                expect(document.querySelector(`path[aria-describedby="${inputPrimary.key}"]`).classList.contains(styles.highlight)).toBeTruthy();
                expect(document.querySelector(`.${styles.point}[aria-describedby="${inputPrimary.key}"]`).classList.contains(styles.highlight)).toBeTruthy();
                expect(document.querySelector(`path[aria-describedby="${inputSecondary.key}"]`).classList.contains(styles.blur)).toBeTruthy();
                expect(document.querySelector(`.${styles.point}[aria-describedby="${inputSecondary.key}"]`).classList.contains(styles.blur)).toBeTruthy();
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
                graphDefault.loadContent(new Line(inputPrimary));
                graphDefault.loadContent(new Line(inputSecondary));
                const legendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
                triggerEvent(legendItem, "mouseleave");
                expect(document.querySelector(`path[aria-describedby="${inputPrimary.key}"]`).classList.contains(styles.highlight)).toBeFalsy();
                expect(document.querySelector(`.${styles.point}[aria-describedby="${inputPrimary.key}"]`).classList.contains(styles.highlight)).toBeFalsy();
                expect(document.querySelector(`path[aria-describedby="${inputSecondary.key}"]`).classList.contains(styles.blur)).toBeFalsy();
                expect(document.querySelector(`.${styles.point}[aria-describedby="${inputSecondary.key}"]`).classList.contains(styles.blur)).toBeFalsy();
            });
        });
    });
    describe("when graph is unloaded off input", () => {
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
            const lineContentContainer = fetchElementByClass(lineGraphContainer, styles.lineGraphContent);
            expect(lineContentContainer).toBeNull();
        });
        it("removes the legend from graph", () => {
            const graphLegend = fetchElementByClass(lineGraphContainer, styles.legend);
            const lineLegendItem = fetchElementByClass(lineGraphContainer, styles.legendItem);
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
    });
});
