"use strict";
import sinon from "sinon";
import Graph from "../../../../../main/js/controls/Graph/Graph";
import { BubbleSingleDataset } from "../../../../../main/js/controls/Bubble";
import constants, {
    AXIS_TYPE,
    BUBBLE,
    COLORS
} from "../../../../../main/js/helpers/constants";
import errors from "../../../../../main/js/helpers/errors";
import styles from "../../../../../main/js/helpers/styles";
import utils from "../../../../../main/js/helpers/utils";
import { triggerEvent } from "../../../helpers/commonHelpers";
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
} from "../helpers";
import { generateColorSingleDataset } from "../../../../../main/js/controls/Bubble/helpers/colorGradient";

describe("Bubble Single Dataset - Load", () => {
    let graphDefault = null;
    let bubbleGraphContainer;
    let consolewarn;

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
        graphDefault.destroy();
    });
    beforeAll(() => {
        // to supress warnings
        consolewarn = console.warn;
        console.warn = () => {};
    });
    afterAll(() => {
        console.warn = consolewarn;
    });
    it("returns the graph instance", () => {
        const loadedBubble = new BubbleSingleDataset(
            getInput(valuesDefault, false)
        );
        graphDefault.content = [];
        graphDefault.content.push({
            config: {
                color: COLORS.GREEN
            }
        });
        loadedBubble.load(graphDefault);
        expect(loadedBubble instanceof BubbleSingleDataset).toBeTruthy();
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const invalidTypeAxis = utils.deepClone(axisDefault);
            invalidTypeAxis.x.type = AXIS_TYPE.TIME_SERIES;
            const input = getInput(valuesDefault, false);
            const invalidGraph = new Graph(getAxes(invalidTypeAxis));
            invalidGraph.loadContent(new BubbleSingleDataset(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const input = getInput(valuesTimeSeries, false);
            const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
            validGraph.loadContent(new BubbleSingleDataset(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("internal subsets gets created correctly for each data point", () => {
        const graph = graphDefault.loadContent(
            new BubbleSingleDataset(getInput(valuesDefault, false, false))
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
            new BubbleSingleDataset(getInput(valuesTimeSeries, false, false))
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
            new BubbleSingleDataset(getInput(valuesDefault))
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
            new BubbleSingleDataset(getInput(valuesDefault))
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
        });
        afterEach(() => {
            input = null;
            graphDefault.destroy();
        });
        it("disables legend when disabled flag is set", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const data = utils.deepClone(valuesDefault);
            input = getInput(data);
            input.label.isDisabled = true;
            graph.loadContent(new BubbleSingleDataset(input));
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
            graph.loadContent(new BubbleSingleDataset(input));
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
            graph.loadContent(new BubbleSingleDataset(input));
            const pointsGroups = bubbleGraphContainer.querySelectorAll(
                `.${styles.point}`
            );
            expect(pointsGroups.length).toBe(2);
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
            expect(bubbleCircle.attributes.fill.value).toEqual(COLORS.GREEN);
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
            beforeEach(() => {});
            it("bubble of custom size", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.weight = {
                    fixedRadius: 12
                };
                const bubble = new BubbleSingleDataset(input);
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
                const bubble = new BubbleSingleDataset(input);
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
                input.palette = BUBBLE.PALETTE.ORANGE;
                input.color = undefined;
                const bubble = new BubbleSingleDataset(input);
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
                    expect(
                        generateColorSingleDataset(input)(radiusValue)
                    ).toEqual(colorEachBubble);
                });
            });
            it("color based bubble", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.palette = BUBBLE.PALETTE.ORANGE;
                input.color = undefined;
                const bubble = new BubbleSingleDataset(input);
                graphDefault.loadContent(bubble);

                const bubblePoint = document.querySelectorAll(
                    `.${styles.point}`
                );
                bubblePoint.forEach((points) => {
                    const yValue = points.__data__.y;
                    const colorEachBubble =
                        points.firstChild.attributes.fill.value;
                    expect(generateColorSingleDataset(input)(yValue)).toEqual(
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
                graphDefault.loadContent(new BubbleSingleDataset(input));
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
                graphDefault.loadContent(new BubbleSingleDataset(input));
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
                graphDefault.loadContent(new BubbleSingleDataset(input));
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
                graphDefault.loadContent(new BubbleSingleDataset(input));
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
                graphDefault.loadContent(new BubbleSingleDataset(input));
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
                    graph.loadContent(new BubbleSingleDataset(input));
                    graph.resize();
                    const bubbleGroup = bubbleGraphContainer.querySelectorAll(
                        `.${styles.bubbleGraphContent}`
                    );
                    expect(bubbleGroup.length).toBe(1);
                    expect(
                        bubbleGraphContainer.querySelectorAll(
                            `.${styles.point}`
                        ).length
                    ).toBe(4);
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
                    graph.loadContent(new BubbleSingleDataset(input));
                    graph.resize();
                    const bubbleGroup = bubbleGraphContainer.querySelectorAll(
                        `.${styles.bubbleGraphContent}`
                    );
                    expect(bubbleGroup.length).toBe(1);
                    expect(
                        bubbleGraphContainer.querySelectorAll(
                            `.${styles.point}`
                        ).length
                    ).toBe(4);
                    expect(graph.config.axis.y.domain.lowerLimit).toBe(20);
                    expect(graph.config.axis.y.domain.upperLimit).toBe(200);
                });
            });
        });
    });
    describe("prepares to load legend item", () => {
        it("display the legend when empty array is provided as input", () => {
            graphDefault.loadContent(
                new BubbleSingleDataset(getInput([], false))
            );
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
            noLegendGraph.loadContent(
                new BubbleSingleDataset(getInput(valuesDefault))
            );
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
                styles.legendItem
            );
            const legendItemBtn = fetchElementByClass(
                bubbleGraphContainer,
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
        it("loads the correct color", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new BubbleSingleDataset(input));
            const legendItem = fetchElementByClass(
                bubbleGraphContainer,
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
            graphDefault.loadContent(new BubbleSingleDataset(input));
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
            const bubble = new BubbleSingleDataset(input);
            graphDefault.loadContent(bubble);
            triggerEvent(
                fetchElementByClass(bubbleGraphContainer, styles.legendItem),
                "click",
                () => {
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
            const primaryBubble = new BubbleSingleDataset(inputPrimary);
            graphDefault.loadContent(primaryBubble);
            triggerEvent(
                fetchElementByClass(bubbleGraphContainer, styles.legendItem),
                "click",
                () => {
                    const primaryBubbleElement = bubbleGraphContainer.querySelector(
                        `.${styles.bubbleGraphContent}[aria-describedby="${inputPrimary.key}"]`
                    );
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
            const bubble = new BubbleSingleDataset(input);
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
            const graph = graphDefault.loadContent(
                new BubbleSingleDataset(input)
            );
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
            const graph = graphDefault.loadContent(
                new BubbleSingleDataset(input)
            );
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
            // const inputSecondary = {
            //     key: `uid_2`,
            //     label: {
            //         display: "Data Label B"
            //     },
            //     values: valuesDefault
            // };
            graphDefault.loadContent(new BubbleSingleDataset(inputPrimary));
            // graphDefault.loadContent(new BubbleSingleDataset(inputSecondary));
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
                // expect(
                //     document
                //         .querySelector(
                //             `.${styles.point}[aria-describedby="${inputSecondary.key}"]`
                //         )
                //         .classList.contains(styles.blur)
                // ).toBeTruthy();
                done();
            });
        });
        it("attaches mouse leave event handlers correctly", (done) => {
            const inputPrimary = getInput(valuesDefault, false, false);

            graphDefault.loadContent(new BubbleSingleDataset(inputPrimary));
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
                done();
            });
        });
    });
    describe("On Bubble Click", () => {
        let graph;
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
            const input = getInput(valuesDefault, false, false);
            graph.loadContent(new BubbleSingleDataset(input));
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
    describe("Single Dataset behavior", () => {
        let input = null;
        let graph = null;
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
            input = getInput(valuesDefault, false, false);
        });

        it("does not plot more than four bubbles if shades are provided", () => {
            const data = utils.deepClone(input);
            data.values.push({ x: 20, y: 8 });
            data.values.push({ x: 30, y: 15 });
            data.values.push({ x: 40, y: 7 });
            data.palette = BUBBLE.PALETTE.BLUE;
            data.color = undefined;
            graph.loadContent(new BubbleSingleDataset(data));
            const graphContent = document.body.querySelectorAll(
                `.${styles.bubbleGraphContent}`
            );
            expect(graphContent.length).toBe(0);
        });
        it("ignores the palette property if color is defined", () => {
            const data = utils.deepClone(input);
            data.palette = BUBBLE.PALETTE.BLUE;
            data.color = COLORS.GREEN;
            graph.loadContent(new BubbleSingleDataset(data));
            const graphContent = document.body.querySelectorAll(
                `.${styles.bubbleGraphContent}`
            );
            expect(graphContent.length).toBe(1);
        });
        it("ignores all datasets after the first one", () => {
            const priInput = utils.deepClone(input);
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new BubbleSingleDataset(priInput));
            graphDefault.loadContent(new BubbleSingleDataset(secInput));
            const graphContent = document.body.querySelectorAll(
                `.${styles.bubbleGraphContent}`
            );
            expect(graphContent.length).toBe(1);
        });
        it("uses a palette of 4 colors if 4 datapoints", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(valuesDefaultWeightBased, false, false);
            input.weight = {
                min: 10,
                max: 100
            };
            input.palette = BUBBLE.PALETTE.ORANGE;
            input.color = undefined;
            const bubble = new BubbleSingleDataset(input);
            graphDefault.loadContent(bubble);

            const bubblePoint = document.querySelectorAll(`.${styles.point}`);
            bubblePoint.forEach((point) => {
                const radiusValue = parseInt(
                    point.firstChild.attributes.getNamedItem("r").value,
                    10
                );
                const colorEachBubble = point.firstChild.attributes.fill.value;
                expect(generateColorSingleDataset(input)(radiusValue)).toEqual(
                    colorEachBubble
                );
            });
        });
        it("uses a palette of 3 colors if 3 datapoints", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(valuesDefaultWeightBased, false, false);
            input.weight = {
                min: 10,
                max: 100
            };
            input.values.pop();
            input.palette = BUBBLE.PALETTE.ORANGE;
            input.color = undefined;
            const bubble = new BubbleSingleDataset(input);
            graphDefault.loadContent(bubble);

            const bubblePoint = document.querySelectorAll(`.${styles.point}`);
            bubblePoint.forEach((point) => {
                const radiusValue = parseInt(
                    point.firstChild.attributes.getNamedItem("r").value,
                    10
                );
                const colorEachBubble = point.firstChild.attributes.fill.value;
                expect(generateColorSingleDataset(input)(radiusValue)).toEqual(
                    colorEachBubble
                );
            });
        });
        it("uses a palette of 2 colors if 2 datapoints", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(valuesDefaultWeightBased, false, false);
            input.weight = {
                min: 10,
                max: 100
            };
            input.values.pop();
            input.palette = BUBBLE.PALETTE.ORANGE;
            input.color = undefined;
            const bubble = new BubbleSingleDataset(input);
            graphDefault.loadContent(bubble);

            const bubblePoint = document.querySelectorAll(`.${styles.point}`);
            bubblePoint.forEach((point) => {
                const radiusValue = parseInt(
                    point.firstChild.attributes.getNamedItem("r").value,
                    10
                );
                const colorEachBubble = point.firstChild.attributes.fill.value;
                expect(generateColorSingleDataset(input)(radiusValue)).toEqual(
                    colorEachBubble
                );
            });
        });
        it("uses a palette of 1 color if 1 datapoint", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(valuesDefaultWeightBased, false, false);
            input.weight = {
                min: 10,
                max: 100
            };
            input.values.splice(0, 2);
            input.palette = BUBBLE.PALETTE.ORANGE;
            input.color = undefined;
            const bubble = new BubbleSingleDataset(input);
            graphDefault.loadContent(bubble);

            const bubblePoint = document.querySelectorAll(`.${styles.point}`);
            bubblePoint.forEach((point) => {
                const radiusValue = parseInt(
                    point.firstChild.attributes.getNamedItem("r").value,
                    10
                );
                const colorEachBubble = point.firstChild.attributes.fill.value;
                expect(generateColorSingleDataset(input)(radiusValue)).toEqual(
                    colorEachBubble
                );
            });
        });
    });
});
