"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Scatter from "../../../../main/js/controls/Scatter";
import constants, {
    AXIS_TYPE,
    COLORS,
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

describe("Scatter - Load", () => {
    let graphDefault = null;
    let scatterGraphContainer;
    beforeEach(() => {
        scatterGraphContainer = document.createElement("div");
        scatterGraphContainer.id = "testScatter_carbon";
        scatterGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(scatterGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    it("returns the graph instance", () => {
        const loadedScatter = new Scatter(
            getInput(valuesDefault, false, false)
        );
        loadedScatter.load(graphDefault);
        expect(loadedScatter instanceof Scatter).toBeTruthy();
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const invalidTypeAxis = utils.deepClone(axisDefault);
            invalidTypeAxis.x.type = AXIS_TYPE.TIME_SERIES;
            const input = getInput(valuesDefault, false, false);
            const invalidGraph = new Graph(getAxes(invalidTypeAxis));
            invalidGraph.loadContent(new Scatter(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const input = getInput(valuesTimeSeries, false, false);
            const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
            validGraph.loadContent(new Scatter(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("internal subsets gets created correctly for each data point", () => {
        const graph = graphDefault.loadContent(
            new Scatter(getInput(valuesDefault, false, false))
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
            new Scatter(getInput(valuesTimeSeries, false, false))
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
            new Scatter(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every(
                (j) => j.color === constants.DEFAULT_COLOR
            )
        ).toBeTruthy();
    });
    it("defaults shapes to circle when not provided", () => {
        const graph = graphDefault.loadContent(
            new Scatter(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every((j) => j.shape === SHAPES.CIRCLE)
        ).toBeTruthy();
    });
    it("defaults axis to Y axis when not provided", () => {
        const graph = graphDefault.loadContent(
            new Scatter(getInput(valuesDefault))
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
            graphDefault.loadContent(new Scatter(input));
        });
        it("adds content container for each scatter points", () => {
            const scatterContentContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.scatterGraphContent
            );
            expect(scatterContentContainer).not.toBeNull();
            expect(scatterContentContainer.tagName).toBe("g");
            expect(
                scatterContentContainer.getAttribute("aria-describedby")
            ).toBe(input.key);
        });
        it("adds container for each data points sets for each scatter points", () => {
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new Scatter(secInput));
            const graphContent = document.body.querySelectorAll(
                `.${styles.scatterGraphContent}`
            );
            expect(graphContent.length).toBe(2);
        });
        it("adds legend for each data points sets for each scatter points", () => {
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new Scatter(secInput));
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
            graph.loadContent(new Scatter(input));
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
            graph.loadContent(new Scatter(input));
            const legendItem = document.body.querySelector(
                `.${styles.legendItemBtn}`
            );
            expect(legendItem.getAttribute("tabindex")).toBe("-1");
        });
        it("add scatter group for scatter points", () => {
            const scatterContentContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.scatterGraphContent
            );
            const scatterGroup = fetchElementByClass(
                scatterContentContainer,
                styles.currentPointsGroup
            );
            expect(scatterGroup).not.toBeNull();
            expect(scatterGroup.tagName).toBe("g");
            expect(scatterGroup.getAttribute("transform")).not.toBeNull();
        });
        it("does not show data point if data point is null", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const data = utils.deepClone(valuesDefault);
            data[0].y = null;
            input = getInput(data);
            graph.loadContent(new Scatter(input));
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            const selectedPoint = fetchElementByClass(
                pointsGroup,
                styles.dataPointSelection
            );
            expect(pointsGroup.children.length).toBe(valuesDefault.length - 1);
            expect(selectedPoint.getAttribute("aria-hidden")).toContain("true");
        });
        it("add points group for data points", () => {
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            expect(pointsGroup).not.toBeNull();
            expect(pointsGroup.tagName).toBe("g");
            expect(pointsGroup.getAttribute("transform")).not.toBeNull();
        });
        it("adds points for each data point", () => {
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            const points = pointsGroup.querySelectorAll(`.${styles.point}`);
            expect(points.length).toBe(valuesDefault.length);
        });
        it("points have correct color", () => {
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            expect(points.attributes.getNamedItem("style").value).toBe(
                `fill: ${COLORS.GREEN};`
            );
        });
        it("points have correct shape", () => {
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            expect(
                points.firstChild.firstChild.attributes.getNamedItem("d").value
            ).toBe(SHAPES.RHOMBUS.path.d);
        });
        it("points have correct unique key assigned", () => {
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            expect(points.getAttribute("aria-describedby")).toBe(input.key);
        });
        it("adds a selected data point for each point", () => {
            const pointsGroup = fetchElementByClass(
                scatterGraphContainer,
                styles.currentPointsGroup
            );
            const selectedPoints = pointsGroup.querySelectorAll(
                `.${styles.dataPointSelection}`
            );
            expect(selectedPoints.length).toBe(valuesDefault.length);
        });
        it("selected data point is hidden by default", () => {
            const selectedPoints = fetchElementByClass(
                scatterGraphContainer,
                styles.dataPointSelection
            );
            expect(selectedPoints.getAttribute("aria-hidden")).toBe("true");
        });
        it("selected data point has circle as shape", () => {
            const selectedPoints = fetchElementByClass(
                scatterGraphContainer,
                styles.dataPointSelection
            );
            expect(selectedPoints.tagName).toBe("svg");
            expect(selectedPoints.firstChild.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
        });
        it("selected data point has correct unique key assigned", () => {
            const selectedPoints = fetchElementByClass(
                scatterGraphContainer,
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
                graphDefault.loadContent(new Scatter(input));
                const point = fetchElementByClass(
                    scatterGraphContainer,
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
                graphDefault.loadContent(new Scatter(input));
                const point = fetchElementByClass(
                    scatterGraphContainer,
                    styles.point
                );
                triggerEvent(point, "click", () => {
                    const selectionPoint = fetchElementByClass(
                        scatterGraphContainer,
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
                graphDefault.loadContent(new Scatter(input));
                const point = fetchElementByClass(
                    scatterGraphContainer,
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
                graphDefault.loadContent(new Scatter(input));
                const point = scatterGraphContainer.querySelectorAll(
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
                    scatterGraphContainer,
                    styles.dataPointSelection
                );
                const point = fetchElementByClass(
                    scatterGraphContainer,
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
                    scatterGraphContainer,
                    styles.dataPointSelection
                );
                const point = fetchElementByClass(
                    scatterGraphContainer,
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
                    scatterGraphContainer,
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
                graphDefault.loadContent(new Scatter(input));
                const selectionPoint = scatterGraphContainer.querySelectorAll(
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
                    scatterGraphContainer,
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
                    graph.loadContent(new Scatter(input));
                    graph.resize();
                    const scatterGroup = scatterGraphContainer.querySelectorAll(
                        `.${styles.currentPointsGroup}`
                    );
                    expect(scatterGroup.length).toBe(1);
                    expect(
                        scatterGraphContainer.querySelectorAll(
                            `.${styles.point}`
                        ).length
                    ).toBe(values.length - 1);
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
                    graph.loadContent(new Scatter(input));
                    graph.resize();
                    const scatterGroup = scatterGraphContainer.querySelectorAll(
                        `.${styles.currentPointsGroup}`
                    );
                    expect(scatterGroup.length).toBe(1);
                    expect(
                        scatterGraphContainer.querySelectorAll(
                            `.${styles.point}`
                        ).length
                    ).toBe(values.length - 1);
                    expect(graph.config.axis.y.domain.lowerLimit).toBe(20);
                    expect(graph.config.axis.y.domain.upperLimit).toBe(200);
                });
            });
            describe("In Y2 Axis", () => {
                it("Displays graph properly", () => {
                    graphDefault.destroy();
                    const graph = new Graph(getAxes(axis));
                    const input = getInput(values, true, true, true);
                    graph.loadContent(new Scatter(input));
                    graph.resize();
                    const scatterGroup = scatterGraphContainer.querySelectorAll(
                        `.${styles.currentPointsGroup}`
                    );
                    expect(scatterGroup.length).toBe(1);
                    expect(
                        scatterGraphContainer.querySelectorAll(
                            `.${styles.point}`
                        ).length
                    ).toBe(values.length - 1);
                    expect(graph.config.axis.y2.domain.lowerLimit).toBe(11);
                    expect(graph.config.axis.y2.domain.upperLimit).toBe(209);
                });
                it("Displays graph properly without domain padding", () => {
                    graphDefault.destroy();
                    const data = getAxes(axis);
                    data.axis.y2.padDomain = false;
                    const graph = new Graph(data);
                    const input = getInput(values, true, true, true);
                    graph.loadContent(new Scatter(input));
                    graph.resize();
                    const scatterGroup = scatterGraphContainer.querySelectorAll(
                        `.${styles.currentPointsGroup}`
                    );
                    expect(scatterGroup.length).toBe(1);
                    expect(
                        scatterGraphContainer.querySelectorAll(
                            `.${styles.point}`
                        ).length
                    ).toBe(values.length - 1);
                    expect(graph.config.axis.y2.domain.lowerLimit).toBe(20);
                    expect(graph.config.axis.y2.domain.upperLimit).toBe(200);
                });
            });
        });
    });
    describe("prepares to load legend item", () => {
        it("display the legend when empty array is provided as input", () => {
            graphDefault.loadContent(new Scatter(getInput([], false, true)));
            const legendContainer = fetchElementByClass(
                scatterGraphContainer,
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
            noLegendGraph.loadContent(new Scatter(getInput(valuesDefault)));
            const legendContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.legend
            );
            expect(legendContainer).toBeNull();
            noLegendGraph.destroy();
        });
        it("does not load if label property is null", () => {
            const input = getInput(valuesDefault);
            input.label = null;
            graphDefault.loadContent(new Scatter(input));
            const legendContainer = fetchElementByClass(
                scatterGraphContainer,
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
            graphDefault.loadContent(new Scatter(input));
            const legendContainer = fetchElementByClass(
                scatterGraphContainer,
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
            graphDefault.loadContent(new Scatter(input));
            const legendContainer = fetchElementByClass(
                scatterGraphContainer,
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
            graphDefault.loadContent(new Scatter(input));
            const legendContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.legend
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(1);
        });
        it("loads item with a shape and text", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new Scatter(input));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
                styles.legendItem
            );
            const legendItemBtn = fetchElementByClass(
                scatterGraphContainer,
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
            graphDefault.loadContent(new Scatter(input));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
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
            graphDefault.loadContent(new Scatter(input));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
                styles.legendItem
            );
            const iconSVG = legendItem.querySelector("svg");
            const iconPath = legendItem.querySelector("path");
            expect(iconSVG).not.toBeNull();
            expect(iconSVG.classList).toContain(styles.legendItemIcon);
            expect(iconSVG.getAttribute("style")).toBe(
                `fill: ${COLORS.GREEN};`
            );
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
        });
        it("attaches click event handlers correctly", (done) => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new Scatter(input));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                expect(legendItem.getAttribute("aria-current")).toBe("false");
                done();
            });
        });
        // todo
        it("on click hides the scatter point", (done) => {
            const rafSpy = spyOn(
                window,
                "requestAnimationFrame"
            ).and.callThrough();
            const input = getInput(valuesDefault, false, false);
            const scatter = new Scatter(input);
            graphDefault.loadContent(scatter);
            triggerEvent(
                fetchElementByClass(scatterGraphContainer, styles.legendItem),
                "click",
                () => {
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(
                        1
                    );
                    expect(
                        fetchElementByClass(
                            scatterGraphContainer,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        fetchElementByClass(
                            scatterGraphContainer,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    rafSpy.calls.reset();
                    done();
                }
            );
        });
        it("on click, removes the first scatter but keeps the rest", (done) => {
            const inputPrimary = getInput(valuesDefault, false, false);
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                },
                values: valuesDefault
            };
            const primaryScatter = new Scatter(inputPrimary);
            const secondaryScatter = new Scatter(inputSecondary);
            graphDefault.loadContent(primaryScatter);
            const graph = graphDefault.loadContent(secondaryScatter);
            triggerEvent(
                fetchElementByClass(scatterGraphContainer, styles.legendItem),
                "click",
                () => {
                    const primaryScatterElement = scatterGraphContainer.querySelector(
                        `.${styles.scatterGraphContent}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const secondaryScatterElement = scatterGraphContainer.querySelector(
                        `.${styles.scatterGraphContent}[aria-describedby="${inputSecondary.key}"]`
                    );
                    expect(graph.config.shownTargets.length).toBe(1);
                    expect(
                        fetchElementByClass(
                            primaryScatterElement,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        fetchElementByClass(
                            primaryScatterElement,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        fetchElementByClass(
                            secondaryScatterElement,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        fetchElementByClass(
                            secondaryScatterElement,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    done();
                }
            );
        });
        it("on clicking twice toggles the scatter and points back to visible", (done) => {
            const rafSpy = spyOn(
                window,
                "requestAnimationFrame"
            ).and.callThrough();
            const input = getInput(valuesDefault, false, false);
            const scatter = new Scatter(input);
            const graph = graphDefault.loadContent(scatter);
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                scatter.redraw(graph);
                triggerEvent(legendItem, "click", () => {
                    scatter.redraw(graph);
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(
                        2
                    );
                    expect(
                        fetchElementByClass(
                            scatterGraphContainer,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        fetchElementByClass(
                            scatterGraphContainer,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    rafSpy.calls.reset();
                    done();
                });
            });
        });
        it("shown targets are removed from Graph", (done) => {
            const input = getInput(valuesDefault, false, false);
            const graph = graphDefault.loadContent(new Scatter(input));
            triggerEvent(
                fetchElementByClass(scatterGraphContainer, styles.legendItem),
                "click",
                () => {
                    expect(graph.config.shownTargets.length).toBe(0);
                    done();
                }
            );
        });
        it("shown targets are updated back when toggled", (done) => {
            const input = getInput(valuesDefault, false, false);
            const graph = graphDefault.loadContent(new Scatter(input));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
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
            graphDefault.loadContent(new Scatter(inputPrimary));
            graphDefault.loadContent(new Scatter(inputSecondary));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "mouseenter", () => {
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
            graphDefault.loadContent(new Scatter(inputPrimary));
            graphDefault.loadContent(new Scatter(inputSecondary));
            const legendItem = fetchElementByClass(
                scatterGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "mouseleave", () => {
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
            const scatterPrimary = getInput(valuesDefault, true, true, true);
            const scatterSecondary = getInput(valuesDefault, true, true, false);
            scatterSecondary.key = "uid_2";
            graph.loadContent(new Scatter(scatterPrimary));
            graph.loadContent(new Scatter(scatterSecondary));
        });
        it("Does not load shape if Y2 axis is not loaded", () => {
            graphDefault.destroy();
            const axes = utils.deepClone(getAxes(axisDefault));
            axes.axis.y2.show = false;
            const graph = new Graph(axes);
            const input = getInput(valuesDefault, true, true, false);
            graph.loadContent(new Scatter(input));
            expect(graph.axesLabelShapeGroup[constants.Y_AXIS]).toBeUndefined();
            expect(
                graph.axesLabelShapeGroup[constants.Y2_AXIS]
            ).toBeUndefined();
        });
        it("Loads shape in Y Axis", () => {
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.axisLabelYShapeContainer
            );
            const svgPoints = labelShapeContainer.children[0];
            expect(
                graph.axesLabelShapeGroup[constants.Y_AXIS]
            ).not.toBeUndefined();
            expect(labelShapeContainer.children.length).toBe(1);
            expect(svgPoints.tagName).toBe("svg");
            expect(svgPoints.getAttribute("x")).toBe("0");
            expect(svgPoints.getAttribute("aria-describedby")).toBe("uid_2");
        });
        it("Loads shape for each data set in Y Axis", () => {
            const scatterTertiary = getInput(valuesDefault, true, true, false);
            scatterTertiary.key = "uid_3";
            graph.loadContent(new Scatter(scatterTertiary));
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.axisLabelYShapeContainer
            );
            const svgPoints = labelShapeContainer.children[1];
            expect(labelShapeContainer.children.length).toBe(2);
            expect(svgPoints.tagName).toBe("svg");
            expect(svgPoints.getAttribute("x")).toBe("20");
            expect(svgPoints.getAttribute("aria-describedby")).toBe("uid_3");
        });
        it("Loads shape in Y2 Axis", () => {
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            const svgPoints = labelShapeContainer.children[0];
            expect(
                graph.axesLabelShapeGroup[constants.Y2_AXIS]
            ).not.toBeUndefined();
            expect(labelShapeContainer.children.length).toBe(1);
            expect(svgPoints.tagName).toBe("svg");
            expect(svgPoints.getAttribute("x")).toBe("0");
            expect(svgPoints.getAttribute("aria-describedby")).toBe("uid_1");
        });
        it("Loads shape for each data set in Y2 Axis", () => {
            const scatterTertiary = getInput(valuesDefault, true, true, true);
            scatterTertiary.key = "uid_4";
            graph.loadContent(new Scatter(scatterTertiary));
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            const svgPoints = labelShapeContainer.children[1];
            expect(labelShapeContainer.children.length).toBe(2);
            expect(svgPoints.tagName).toBe("svg");
            expect(svgPoints.getAttribute("x")).toBe("20");
            expect(svgPoints.getAttribute("aria-describedby")).toBe("uid_4");
        });
    });
    describe("When legend item is clicked", () => {
        it("Preserves the DOM order", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const scatterPrimary = getInput(valuesDefault, true, true, true);
            const scatterSecondary = getInput(valuesDefault, true, true, false);
            scatterPrimary.key = "uid_1";
            scatterSecondary.key = "uid_2";
            graph.loadContent(new Scatter(scatterPrimary));
            graph.loadContent(new Scatter(scatterSecondary));
            const legendItem = document.querySelector(
                `.${styles.legendItem}[aria-describedby="${scatterPrimary.key}"]`
            );
            expect(graph.config.shownTargets).toEqual(["uid_1", "uid_2"]);
            triggerEvent(legendItem, "click");
            triggerEvent(legendItem, "click");
            expect(graph.config.shownTargets).toEqual(["uid_2", "uid_1"]);
            expect(
                document
                    .querySelector(`.${styles.scatterGraphContent}`)
                    .getAttribute("aria-describedby")
            ).toEqual(scatterPrimary.key);
        });
    });
});
