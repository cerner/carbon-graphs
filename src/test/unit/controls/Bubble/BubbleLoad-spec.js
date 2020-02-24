"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Bubble from "../../../../main/js/controls/Bubble";
import constants, {
    AXIS_TYPE,
    COLORS
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
    getNoOnClickInput,
    valuesDefault,
    valuesDefaultWeightBased,
    valuesTimeSeries,
    fetchElementByTag
} from "./helpers";
import { generateColor } from "../../../../main/js/controls/Bubble/helpers/colorGradient";

describe("Bubble - Load", () => {
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
    it("returns the graph instance", () => {
        const loadedBubble = new Bubble(getInput(valuesDefault, false));
        loadedBubble.load(graphDefault);
        expect(loadedBubble instanceof Bubble).toBeTruthy();
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const invalidTypeAxis = utils.deepClone(axisDefault);
            invalidTypeAxis.x.type = AXIS_TYPE.TIME_SERIES;
            const input = getInput(valuesDefault, false);
            const invalidGraph = new Graph(getAxes(invalidTypeAxis));
            invalidGraph.loadContent(new Bubble(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const input = getInput(valuesTimeSeries, false);
            const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
            validGraph.loadContent(new Bubble(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("internal subsets gets created correctly for each data point", () => {
        const graph = graphDefault.loadContent(
            new Bubble(getInput(valuesDefault, false, false))
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
            new Bubble(getInput(valuesTimeSeries, false, false))
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
            new Bubble(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every(
                (j) => j.color === constants.DEFAULT_COLOR
            )
        ).toBeTruthy();
    });
    it("defaults axis to Y axis when not provided", () => {
        const graph = graphDefault.loadContent(
            new Bubble(getInput(valuesDefault))
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
            graphDefault.loadContent(new Bubble(input));
        });
        it("adds content container for each bubble set", () => {
            const bubbleContentContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.bubbleGraphContent
            );
            expect(bubbleContentContainer).not.toBeNull();
            expect(bubbleContentContainer.tagName).toBe("g");
            expect(
                bubbleContentContainer.getAttribute("aria-describedby")
            ).toBe(input.key);
        });
        it("adds container for each data points sets for each bubble set", () => {
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new Bubble(secInput));
            const graphContent = document.body.querySelectorAll(
                `.${styles.bubbleGraphContent}`
            );
            expect(graphContent.length).toBe(2);
        });
        it("adds legend for each data points sets for each bubble", () => {
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new Bubble(secInput));
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
            graph.loadContent(new Bubble(input));
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
            graph.loadContent(new Bubble(input));
            const legendItem = document.body.querySelector(
                `.${styles.legendItemBtn}`
            );
            expect(legendItem.getAttribute("tabindex")).toBe("-1");
        });
        it("add bubble group for bubble", () => {
            const bubbleContentContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.bubbleGraphContent
            );
            const bubbleGroup = fetchElementByClass(
                bubbleContentContainer,
                styles.currentPointsGroup
            );
            expect(bubbleGroup).not.toBeNull();
            expect(bubbleGroup.tagName).toBe("g");
            expect(bubbleGroup.getAttribute("transform")).not.toBeNull();
        });
        it("does not show data point if data point is null", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const data = utils.deepClone(valuesDefault);
            data[0].y = null;
            input = getInput(data);
            graph.loadContent(new Bubble(input));
            const pointsGroup = fetchElementByClass(
                bubbleGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            const selectedPoint = fetchElementByClass(
                pointsGroup,
                styles.dataPointSelection
            );
            expect(pointsGroup.children.length).toBe(3);
            expect(points.getAttribute("aria-hidden")).toContain("true");
            expect(selectedPoint.getAttribute("aria-hidden")).toContain("true");
        });
        it("add points group for data points", () => {
            const pointsGroup = fetchElementByClass(
                bubbleGraphContainer,
                styles.currentPointsGroup
            );
            expect(pointsGroup).not.toBeNull();
            expect(pointsGroup.tagName).toBe("g");
            expect(pointsGroup.getAttribute("transform")).not.toBeNull();
        });
        it("adds points for each data point", () => {
            const pointsGroup = fetchElementByClass(
                bubbleGraphContainer,
                styles.currentPointsGroup
            );
            const points = pointsGroup.querySelectorAll(`.${styles.point}`);
            expect(points.length).toBe(valuesDefault.length);
        });
        it("points have correct color", () => {
            const pointsGroup = fetchElementByClass(
                bubbleGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            const bubbleCircle = fetchElementByTag(points, "circle");
            expect(bubbleCircle.attributes.fill.value).toEqual("#007cc3");
        });
        it("points have correct unique key assigned", () => {
            const pointsGroup = fetchElementByClass(
                bubbleGraphContainer,
                styles.currentPointsGroup
            );
            const points = fetchElementByClass(pointsGroup, styles.point);
            expect(points.getAttribute("aria-describedby")).toBe(input.key);
        });
        it("each bubble should have a default radius", () => {
            const points = fetchElementByClass(
                bubbleGraphContainer,
                styles.point
            );
            expect(points.tagName).toBe("g");
            expect(points.firstChild.tagName).toBe("circle");
            expect(points.firstChild.attributes.getNamedItem("r").value).toBe(
                `${constants.DEFAULT_BUBBLE_RADIUS_MAX}`
            );
        });
        it("adds a selected data point for each point", () => {
            const pointsGroup = fetchElementByClass(
                bubbleGraphContainer,
                styles.currentPointsGroup
            );
            const selectedPoints = pointsGroup.querySelectorAll(
                `.${styles.dataPointSelection}`
            );
            expect(selectedPoints.length).toBe(valuesDefault.length);
        });
        it("selected data point is hidden by default", () => {
            const selectedPoints = fetchElementByClass(
                bubbleGraphContainer,
                styles.dataPointSelection
            );
            expect(selectedPoints.getAttribute("aria-hidden")).toBe("true");
        });
        it("selected data point has circle as shape", () => {
            const selectedPoints = fetchElementByClass(
                bubbleGraphContainer,
                styles.dataPointSelection
            );
            expect(selectedPoints.tagName).toBe("g");
            expect(selectedPoints.firstChild.tagName).toBe("circle");
        });
        it("selected data point has correct unique key assigned", () => {
            const selectedPoints = fetchElementByClass(
                bubbleGraphContainer,
                styles.dataPointSelection
            );
            expect(selectedPoints.getAttribute("aria-describedby")).toBe(
                input.key
            );
        });
        describe("draw bubble different size", () => {
            it("bubble of custom size", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.weight = {
                    maxRadius: 12
                };
                const bubble = new Bubble(input);
                graphDefault.loadContent(bubble);
                const points = fetchElementByClass(
                    bubbleGraphContainer,
                    styles.point
                );
                expect(points.tagName).toBe("g");
                expect(points.firstChild.tagName).toBe("circle");
                expect(
                    points.firstChild.attributes.getNamedItem("r").value
                ).toBe("12");
            });
            it("weight based bubbles", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefaultWeightBased, false, false);
                input.weight = {
                    min: 10,
                    max: 100
                };
                const bubble = new Bubble(input);
                graphDefault.loadContent(bubble);

                const bubblePoint = document.querySelectorAll(
                    `.${styles.point}`
                );
                bubblePoint.forEach((points) => {
                    expect(points.tagName).toBe("g");
                    expect(points.firstChild.tagName).toBe("circle");
                    expect(
                        points.firstChild.attributes.getNamedItem("r").value
                    ).toBeGreaterThanOrEqual(3);
                    expect(
                        points.firstChild.attributes.getNamedItem("r").value
                    ).toBeLessThanOrEqual(30);
                });
            });
            it("weight and color based", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefaultWeightBased, false, false);
                input.weight = {
                    min: 10,
                    max: 100
                };
                input.hue = {
                    lowerShade: "#ffff00",
                    upperShade: "#ff0000"
                };
                const bubble = new Bubble(input);
                graphDefault.loadContent(bubble);

                const bubblePoint = document.querySelectorAll(
                    `.${styles.point}`
                );
                bubblePoint.forEach((point) => {
                    const radiusValue = parseInt(
                        point.firstChild.attributes.getNamedItem("r").value,
                        10
                    );
                    const colorEachBubble =
                        point.firstChild.attributes.fill.value;
                    expect(generateColor(input)(radiusValue)).toEqual(
                        colorEachBubble
                    );
                });
            });
            it("color based bubble", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.hue = {
                    lowerShade: "#ffff00",
                    upperShade: "#ff0000"
                };
                const bubble = new Bubble(input);
                graphDefault.loadContent(bubble);

                const bubblePoint = document.querySelectorAll(
                    `.${styles.point}`
                );
                bubblePoint.forEach((points) => {
                    const yValue = points.__data__.y;
                    const colorEachBubble =
                        points.firstChild.attributes.fill.value;
                    expect(generateColor(input)(yValue)).toEqual(
                        colorEachBubble
                    );
                });
            });
        });
        describe("when clicked on a data point", () => {
            it("does not do anything if no onClick callback is provided", (done) => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getNoOnClickInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bubble(input));
                const point = fetchElementByClass(
                    bubbleGraphContainer,
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
                graphDefault.loadContent(new Bubble(input));
                const point = fetchElementByClass(
                    bubbleGraphContainer,
                    styles.point
                );
                triggerEvent(point, "click", () => {
                    const selectionPoint = fetchElementByClass(
                        bubbleGraphContainer,
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
                graphDefault.loadContent(new Bubble(input));
                const point = fetchElementByClass(
                    bubbleGraphContainer,
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
                graphDefault.loadContent(new Bubble(input));
                const point = bubbleGraphContainer.querySelectorAll(
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
                    bubbleGraphContainer,
                    styles.dataPointSelection
                );
                const point = fetchElementByClass(
                    bubbleGraphContainer,
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
                    bubbleGraphContainer,
                    styles.dataPointSelection
                );
                const point = fetchElementByClass(
                    bubbleGraphContainer,
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
                    bubbleGraphContainer,
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
                graphDefault.loadContent(new Bubble(input));
                const selectionPoint = bubbleGraphContainer.querySelectorAll(
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
                    bubbleGraphContainer,
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
                    const input = getInput(values, true, false);
                    input.values = values;
                    graph.loadContent(new Bubble(input));
                    graph.resize();
                    const bubbleGroup = bubbleGraphContainer.querySelectorAll(
                        `.${styles.bubbleGraphContent}`
                    );
                    expect(bubbleGroup.length).toBe(1);
                    expect(
                        bubbleGraphContainer
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
                    graph.loadContent(new Bubble(input));
                    graph.resize();
                    const bubbleGroup = bubbleGraphContainer.querySelectorAll(
                        `.${styles.bubbleGraphContent}`
                    );
                    expect(bubbleGroup.length).toBe(1);
                    expect(
                        bubbleGraphContainer
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
                    graph.loadContent(new Bubble(input));
                    graph.resize();
                    const bubbleGroup = bubbleGraphContainer.querySelectorAll(
                        `.${styles.bubbleGraphContent}`
                    );
                    expect(bubbleGroup.length).toBe(1);
                    expect(
                        bubbleGraphContainer
                            .querySelectorAll(`.${styles.point}`)[2]
                            .getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(graph.config.axis.y2.domain.lowerLimit).toBe(11);
                    expect(graph.config.axis.y2.domain.upperLimit).toBe(209);
                });
                it("Displays graph properly without domain padding", () => {
                    graphDefault.destroy();
                    const data = getAxes(axis);
                    data.axis.y2.padDomain = false;
                    const graph = new Graph(data);
                    const input = getInput(values, true, true, true);
                    graph.loadContent(new Bubble(input));
                    graph.resize();
                    const bubbleGroup = bubbleGraphContainer.querySelectorAll(
                        `.${styles.bubbleGraphContent}`
                    );
                    expect(bubbleGroup.length).toBe(1);
                    expect(
                        bubbleGraphContainer
                            .querySelectorAll(`.${styles.point}`)[2]
                            .getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(graph.config.axis.y2.domain.lowerLimit).toBe(20);
                    expect(graph.config.axis.y2.domain.upperLimit).toBe(200);
                });
            });
        });
    });
    describe("prepares to load legend item", () => {
        it("display the legend when empty array is provided as input", () => {
            graphDefault.loadContent(new Bubble(getInput([], false)));
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
            expect(legendItem.getAttribute("aria-disabled")).toBe("true");
            expect(legendItem.getAttribute("aria-current")).toBe("true");
        });
        it("does not load if legend is opted to be hidden", () => {
            graphDefault.destroy();
            const input = getAxes(axisDefault);
            input.showLegend = false;
            const noLegendGraph = new Graph(input);
            noLegendGraph.loadContent(new Bubble(getInput(valuesDefault)));
            const legendContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.legend
            );
            expect(legendContainer).toBeNull();
            noLegendGraph.destroy();
        });
        it("does not load if label property is null", () => {
            const input = getInput(valuesDefault);
            input.label = null;
            graphDefault.loadContent(new Bubble(input));
            const legendContainer = fetchElementByClass(
                bubbleGraphContainer,
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
            graphDefault.loadContent(new Bubble(input));
            const legendContainer = fetchElementByClass(
                bubbleGraphContainer,
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
            graphDefault.loadContent(new Bubble(input));
            const legendContainer = fetchElementByClass(
                bubbleGraphContainer,
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
            graphDefault.loadContent(new Bubble(input));
            const legendContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.legend
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(1);
        });
        it("loads item with a shape and text", () => {
            const input = getInput(valuesDefault, false);
            graphDefault.loadContent(new Bubble(input));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
                styles.legendItem
            );
            const legendItemBtn = fetchElementByClass(
                bubbleGraphContainer,
                styles.legendItemBtn
            );
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
            expect(legendItemBtn.children[0].tagName).toBe("svg");
            expect(
                legendItemBtn.children[0].classList.contains(
                    styles.legendItemIcon
                )
            ).toBeTruthy();
        });
        it("loads the correct color", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new Bubble(input));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
                styles.legendItem
            );
            const iconSVG = legendItem.querySelector("svg");
            const iconPath = legendItem.querySelector("path");
            expect(iconSVG).not.toBeNull();
            expect(iconSVG.classList).toContain(styles.legendItemIcon);
            expect(iconSVG.getAttribute("style")).toBe(`fill: ${COLORS.BLUE};`);
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
        });
        it("attaches click event handlers correctly", (done) => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new Bubble(input));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                expect(legendItem.getAttribute("aria-current")).toBe("false");
                done();
            });
        });
        it("on click hides the bubbles", (done) => {
            const rafSpy = spyOn(
                window,
                "requestAnimationFrame"
            ).and.callThrough();
            const input = getInput(valuesDefault, false, false);
            const bubble = new Bubble(input);
            const graph = graphDefault.loadContent(bubble);
            triggerEvent(
                fetchElementByClass(bubbleGraphContainer, styles.legendItem),
                "click",
                () => {
                    bubble.redraw(graph);
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(
                        1
                    );
                    expect(
                        fetchElementByClass(
                            bubbleGraphContainer,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        fetchElementByClass(
                            bubbleGraphContainer,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    rafSpy.calls.reset();
                    done();
                }
            );
        });
        it("on click, removes the first bubble set but keeps the rest", (done) => {
            const inputPrimary = getInput(valuesDefault, false, false);
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                },
                values: valuesDefault
            };
            const primaryBubble = new Bubble(inputPrimary);
            const secondaryBubble = new Bubble(inputSecondary);
            graphDefault.loadContent(primaryBubble);
            const graph = graphDefault.loadContent(secondaryBubble);
            triggerEvent(
                fetchElementByClass(bubbleGraphContainer, styles.legendItem),
                "click",
                () => {
                    primaryBubble.redraw(graph);
                    secondaryBubble.redraw(graph);
                    const primaryBubbleElement = bubbleGraphContainer.querySelector(
                        `.${styles.bubbleGraphContent}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const secondaryBubbleElement = bubbleGraphContainer.querySelector(
                        `.${styles.bubbleGraphContent}[aria-describedby="${inputSecondary.key}"]`
                    );
                    expect(graph.config.shownTargets.length).toBe(1);
                    expect(
                        fetchElementByClass(
                            primaryBubbleElement,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        fetchElementByClass(
                            primaryBubbleElement,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        fetchElementByClass(
                            secondaryBubbleElement,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        fetchElementByClass(
                            secondaryBubbleElement,
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("true");
                    done();
                }
            );
        });
        it("on clicking twice toggles the bubbles back to visible", (done) => {
            const rafSpy = spyOn(
                window,
                "requestAnimationFrame"
            ).and.callThrough();
            const input = getInput(valuesDefault, false, false);
            const bubble = new Bubble(input);
            const graph = graphDefault.loadContent(bubble);
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                bubble.redraw(graph);
                triggerEvent(legendItem, "click", () => {
                    bubble.redraw(graph);
                    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(
                        2
                    );
                    expect(
                        fetchElementByClass(
                            bubbleGraphContainer,
                            styles.point
                        ).getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        fetchElementByClass(
                            bubbleGraphContainer,
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
            const graph = graphDefault.loadContent(new Bubble(input));
            triggerEvent(
                fetchElementByClass(bubbleGraphContainer, styles.legendItem),
                "click",
                () => {
                    expect(graph.config.shownTargets.length).toBe(0);
                    done();
                }
            );
        });
        it("shown targets are updated back when toggled", (done) => {
            const input = getInput(valuesDefault, false, false);
            const graph = graphDefault.loadContent(new Bubble(input));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
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
            graphDefault.loadContent(new Bubble(inputPrimary));
            graphDefault.loadContent(new Bubble(inputSecondary));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
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
            graphDefault.loadContent(new Bubble(inputPrimary));
            graphDefault.loadContent(new Bubble(inputSecondary));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
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
            const bubblePrimary = getInput(valuesDefault, true, true);
            const bubbleSecondary = getInput(valuesDefault, true, false);
            bubbleSecondary.key = "uid_2";
            graph.loadContent(new Bubble(bubblePrimary));
            graph.loadContent(new Bubble(bubbleSecondary));
        });
        it("Does not load shape if Y2 axis is not loaded", () => {
            graphDefault.destroy();
            const axes = utils.deepClone(getAxes(axisDefault));
            axes.axis.y2.show = false;
            const graph = new Graph(axes);
            const input = getInput(valuesDefault, true, false);
            graph.loadContent(new Bubble(input));
            expect(graph.axesLabelShapeGroup[constants.Y_AXIS]).toBeUndefined();
            expect(
                graph.axesLabelShapeGroup[constants.Y2_AXIS]
            ).toBeUndefined();
        });
        it("Loads shape in Y Axis", () => {
            const labelShapeContainer = fetchElementByClass(
                bubbleGraphContainer,
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
            const bubbleTertiary = getInput(valuesDefault, true, false);
            bubbleTertiary.key = "uid_3";
            graph.loadContent(new Bubble(bubbleTertiary));
            const labelShapeContainer = fetchElementByClass(
                bubbleGraphContainer,
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
                bubbleGraphContainer,
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
            const bubbleTertiary = getInput(valuesDefault, true, true);
            bubbleTertiary.key = "uid_4";
            graph.loadContent(new Bubble(bubbleTertiary));
            const labelShapeContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            const svgPath = labelShapeContainer.children[1];
            expect(labelShapeContainer.children.length).toBe(2);
            expect(svgPath.tagName).toBe("svg");
            expect(svgPath.getAttribute("x")).toBe("20");
            expect(svgPath.getAttribute("aria-describedby")).toBe("uid_4");
        });
    });
    describe("On Blubble Click", () => {
        let graph;
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
            const input = getInput(valuesDefault, false, false);
            graph.loadContent(new Bubble(input));
        });
        describe("On click", () => {
            it("Highlight respective bubble", (done) => {
                const bubblePoint = fetchElementByClass(
                    bubbleGraphContainer,
                    styles.point
                );
                const bubbleCircle = fetchElementByTag(bubblePoint, "circle");
                triggerEvent(bubbleCircle, "click", () => {
                    expect(bubbleCircle.classList.length.toString()).toEqual(
                        "0"
                    );
                    done();
                });
            });
            it("Blurs all other bubbles", (done) => {
                const bubblePoint = fetchElementByClass(
                    bubbleGraphContainer,
                    styles.point
                );
                const bubbleCircle = fetchElementByTag(bubblePoint, "circle");

                triggerEvent(bubbleCircle, "click", () => {
                    const circleNodes = document.querySelectorAll(
                        `.${styles.point} circle`
                    );
                    circleNodes.forEach((node) => {
                        if (node.getAttribute("aria-selected") === "false") {
                            expect(
                                node.classList.contains(styles.bubbleBlur)
                            ).toEqual(true);
                        }
                    });
                    done();
                });
            });
        });
    });
});
