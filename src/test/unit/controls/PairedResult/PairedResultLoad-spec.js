"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { getShapeForTarget } from "../../../../main/js/controls/Graph/helpers/helpers";
import PairedResult from "../../../../main/js/controls/PairedResult";
import constants, {
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { TRANSITION_DELAY, triggerEvent } from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Paired Result - Load", () => {
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
    it("returns the graph instance", () => {
        const loadedPair = new PairedResult(
            getInput(valuesDefault, false, false)
        );
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
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("throws error when type and values are a mismatch", () => {
        expect(() => {
            const input = getInput(valuesTimeSeries, false, false);
            const validGraph = new Graph(getAxes(utils.deepClone(axisDefault)));
            validGraph.loadContent(new PairedResult(input));
        }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
    });
    it("internal subsets gets created correctly for each data point", () => {
        const graph = graphDefault.loadContent(
            new PairedResult(getInput(valuesDefault, false, false))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.map((i) =>
                constants.PAIR_ITEM_TYPES.map(
                    (j) =>
                        i[j].x !== null &&
                        i[j].y !== null &&
                        i[j].label !== null &&
                        i[j].shape &&
                        i[j].color &&
                        i[j].key === `${data.key}_${j}`
                )
            )
        ).toBeTruthy();
        expect(
            data.internalValuesSubset.every(
                (i) =>
                    i.onClick !== null && i.yAxis !== null && i.key === data.key
            )
        ).toBeTruthy();
        expect(graph.config.shownTargets.length).toBe(3);
    });
    it("internal subsets gets created successfully for time series", () => {
        const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
        const graph = graphTimeSeries.loadContent(
            new PairedResult(getInput(valuesTimeSeries, false, false))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every((i) =>
                constants.PAIR_ITEM_TYPES.map(
                    (j) => typeof i[j].x === "object" && i[j].x instanceof Date
                )
            )
        ).toBeTruthy();
    });
    it("defaults color to black when not provided", () => {
        const graph = graphDefault.loadContent(
            new PairedResult(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every(() =>
                constants.PAIR_ITEM_TYPES.map(
                    (j) => j.color === constants.DEFAULT_COLOR
                )
            )
        ).toBeTruthy();
    });
    it("defaults shapes to circle when not provided", () => {
        const graph = graphDefault.loadContent(
            new PairedResult(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every(() =>
                constants.PAIR_ITEM_TYPES.map((j) => j.shape === "CIRCLE")
            )
        ).toBeTruthy();
    });
    it("defaults axis to Y axis when not provided", () => {
        const graph = graphDefault.loadContent(
            new PairedResult(getInput(valuesDefault))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every((j) => j.yAxis === constants.Y_AXIS)
        ).toBeTruthy();
    });
    it("sets axis to y2 if provided", () => {
        graphDefault.destroy();
        graphDefault = new Graph(
            getAxes(
                Object.assign(
                    {},
                    {
                        y2: {
                            show: true,
                            label: "Y2 Label",
                            lowerLimit: 0,
                            upperLimit: 200
                        }
                    },
                    axisDefault
                )
            )
        );
        const graph = graphDefault.loadContent(
            new PairedResult(getInput(valuesDefault, false, false, true))
        );
        const data = graph.content[0].dataTarget;
        expect(
            data.internalValuesSubset.every(
                (j) => j.yAxis === constants.Y2_AXIS
            )
        ).toBeTruthy();
    });
    describe("draws the graph", () => {
        let input = null;
        beforeEach(() => {
            input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(input));
        });
        it("adds content container for each paired result", () => {
            const pairedResultContentContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            expect(pairedResultContentContainer).not.toBeNull();
            expect(pairedResultContentContainer.tagName).toBe("g");
            expect(
                pairedResultContentContainer.getAttribute("aria-describedby")
            ).toBe(input.key);
        });
        it("adds container for each data points sets for each paired result", () => {
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new PairedResult(secInput));
            const graphContent = document.body.querySelectorAll(
                `.${styles.pairedBoxGroup}`
            );
            expect(graphContent.length).toBe(2);
        });
        it("adds legend for each data points sets for each paired result", () => {
            const secInput = utils.deepClone(input);
            secInput.key = "uid_2";
            graphDefault.loadContent(new PairedResult(secInput));
            const legendItems = document.body.querySelectorAll(
                `.${styles.legendItem}`
            );
            expect(legendItems.length).toBe(6);
        });
        it("disables legend when disabled flag is set", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const data = utils.deepClone(valuesDefault);
            input = getInput(data);
            input.label.high.isDisabled = true;
            graph.loadContent(new PairedResult(input));
            const legendItem = document.body.querySelector(
                `.${styles.legendItem}`
            );
            expect(legendItem.getAttribute("aria-disabled")).toBe("true");
        });
        it("adds data pair group for paired result", () => {
            const pairedGroupContentContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            const pairedBox = fetchElementByClass(
                pairedGroupContentContainer,
                styles.pairedBox
            );
            expect(pairedBox).not.toBeNull();
            expect(pairedBox.tagName).toBe("g");
            expect(pairedBox.getAttribute("aria-selected")).toBe("false");
            expect(pairedBox.getAttribute("transform")).not.toBeNull();
        });
        it("adds line path as an SVG", () => {
            const pairedGroupContentContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            const linePath = fetchElementByClass(
                pairedGroupContentContainer,
                styles.pairedLine
            );
            expect(linePath.tagName).toBe("path");
            expect(linePath.getAttribute("d")).not.toBeNull();
            expect(linePath.classList.contains(styles.pairedLine)).toBeTruthy();
        });
        it("adds line with default stroke", () => {
            const linePath = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedLine
            );
            expect(linePath.getAttribute("class")).toBe(styles.pairedLine);
            expect(linePath.getAttribute("aria-describedby")).toBe(input.key);
            expect(linePath.getAttribute("aria-hidden")).toBe("false");
            expect(linePath.attributes.getNamedItem("d").value).not.toBeNull();
        });
        it("adds points for each data point", () => {
            const pointsGroup = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            const points = pointsGroup.querySelectorAll(
                `.${styles.pairedPoint}`
            );
            expect(points.length).toBe(
                valuesDefault
                    .map((i) => Object.keys(i).length)
                    .reduce((a, b) => a + b, 0)
            );
        });
        it("adds points for each high data point", () => {
            const pointsGroup = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            const points = pointsGroup.querySelectorAll(
                `.${styles.pairedPoint}.${styles.high}`
            );
            expect(points.length).toBe(
                valuesDefault
                    .map((i) => (i.high ? 1 : 0))
                    .reduce((a, b) => a + b, 0)
            );
        });
        it("adds points for each mid data point", () => {
            const pointsGroup = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            const points = pointsGroup.querySelectorAll(
                `.${styles.pairedPoint}.${styles.mid}`
            );
            expect(points.length).toBe(
                valuesDefault
                    .map((i) => (i.mid ? 1 : 0))
                    .reduce((a, b) => a + b, 0)
            );
        });
        it("adds points for each low data point", () => {
            const pointsGroup = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            const points = pointsGroup.querySelectorAll(
                `.${styles.pairedPoint}.${styles.low}`
            );
            expect(points.length).toBe(
                valuesDefault
                    .map((i) => (i.low ? 1 : 0))
                    .reduce((a, b) => a + b, 0)
            );
        });
        it("doesn't load high if not provided", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(
                [
                    {
                        mid: {
                            x: 45,
                            y: 146
                        },
                        low: {
                            x: 45,
                            y: 75
                        }
                    }
                ],
                false,
                false
            );
            graphDefault.loadContent(new PairedResult(input));
            const point = pairedResultGraphContainer.querySelectorAll(
                `.${styles.pairedPoint}.${styles.high}`
            );
            expect(point.length).toBe(0);
        });
        it("doesn't load mid if not provided", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(
                [
                    {
                        high: {
                            x: 45,
                            y: 350
                        },
                        low: {
                            x: 45,
                            y: 75
                        }
                    }
                ],
                false,
                false
            );
            graphDefault.loadContent(new PairedResult(input));
            const point = pairedResultGraphContainer.querySelectorAll(
                `.${styles.pairedPoint}.${styles.mid}`
            );
            expect(point.length).toBe(0);
        });
        it("doesn't load low if not provided", () => {
            graphDefault.destroy();
            graphDefault = new Graph(getAxes(axisDefault));
            input = getInput(
                [
                    {
                        high: {
                            x: 45,
                            y: 350
                        },
                        mid: {
                            x: 45,
                            y: 146
                        }
                    }
                ],
                false,
                false
            );
            graphDefault.loadContent(new PairedResult(input));
            const point = pairedResultGraphContainer.querySelectorAll(
                `.${styles.pairedPoint}.${styles.low}`
            );
            expect(point.length).toBe(0);
        });
        describe("data points have correct unique key", () => {
            it("line", () => {
                const lineElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedLine
                );
                expect(
                    lineElement.attributes.getNamedItem("aria-describedby")
                        .value
                ).toBe(input.key);
            });
            it("creates a group for each data point", () => {
                const pair = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBox
                );
                const pointGroup = pair.querySelectorAll(
                    `.${styles.pointGroup}`
                );
                expect(pointGroup.length).toBe(3);
                expect(pointGroup.item(0).tagName).toBe("g");
                expect(pointGroup.item(1).tagName).toBe("g");
                expect(pointGroup.item(2).tagName).toBe("g");
            });
            it("high data-point", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.high}`
                );
                expect(points.parentNode.classList).toContain(
                    styles.pointGroup
                );
                expect(points.getAttribute("aria-describedby")).toBe(
                    `${input.key}_high`
                );
            });
            it("mid data-point", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.mid}`
                );
                expect(points.parentNode.classList).toContain(
                    styles.pointGroup
                );
                expect(points.getAttribute("aria-describedby")).toBe(
                    `${input.key}_mid`
                );
            });
            it("low data-point", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.low}`
                );
                expect(points.parentNode.classList).toContain(
                    styles.pointGroup
                );
                expect(points.getAttribute("aria-describedby")).toBe(
                    `${input.key}_low`
                );
            });
        });
        describe("data points have correct color", () => {
            it("high", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.high}`
                );
                expect(points.attributes.getNamedItem("style").value).toBe(
                    `fill: ${COLORS.GREEN};`
                );
            });
            it("mid", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.mid}`
                );
                expect(points.attributes.getNamedItem("style").value).toBe(
                    `fill: ${COLORS.ORANGE};`
                );
            });
            it("low", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.low}`
                );
                expect(points.attributes.getNamedItem("style").value).toBe(
                    `fill: ${COLORS.GREEN};`
                );
            });
        });
        describe("data points have correct shape", () => {
            it("high", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.high}`
                );
                expect(
                    points.firstChild.firstChild.attributes.getNamedItem("d")
                        .value
                ).toBe(SHAPES.TEAR_ALT.path.d);
            });
            it("mid", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.mid}`
                );
                expect(
                    points.firstChild.firstChild.attributes.getNamedItem("d")
                        .value
                ).toBe(SHAPES.RHOMBUS.path.d);
            });
            it("low", () => {
                const pointsGroup = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedBoxGroup
                );
                const points = pointsGroup.querySelector(
                    `.${styles.pairedPoint}.${styles.low}`
                );
                expect(
                    points.firstChild.firstChild.attributes.getNamedItem("d")
                        .value
                ).toBe(SHAPES.TEAR_DROP.path.d);
            });
        });
        describe("creates data point selection elements as needed", () => {
            it("creates a rectangle highlight for data point", () => {
                const selectionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.dataPointSelection
                );
                expect(selectionElement).not.toBeNull();
                expect(selectionElement.tagName).toBe("rect");
                expect(selectionElement.classList).toContain(
                    styles.dataPointSelection
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(selectionElement.getAttribute("aria-describedby")).toBe(
                    input.key
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("creates circle for incomplete pairs - high", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(
                    [
                        {
                            high: {
                                x: 45,
                                y: 350
                            }
                        }
                    ],
                    false,
                    false
                );
                graphDefault.loadContent(new PairedResult(input));
                const selectionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.dataPointSelection
                );
                const selectionElementGroup = selectionElement.firstChild;
                expect(selectionElement.tagName).toBe("svg");
                expect(selectionElementGroup.firstChild.nodeName).toBe("path");
                expect(selectionElementGroup.firstChild.getAttribute("d")).toBe(
                    SHAPES.CIRCLE.path.d
                );
                expect(selectionElement.classList).toContain(
                    styles.dataPointSelection
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(selectionElement.getAttribute("aria-describedby")).toBe(
                    input.key
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("creates circle for incomplete pairs - mid", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(
                    [
                        {
                            mid: {
                                x: 45,
                                y: 146
                            }
                        }
                    ],
                    false,
                    false
                );
                graphDefault.loadContent(new PairedResult(input));
                const selectionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.dataPointSelection
                );
                const selectionElementGroup = selectionElement.firstChild;
                expect(selectionElement.tagName).toBe("svg");
                expect(selectionElementGroup.firstChild.nodeName).toBe("path");
                expect(selectionElementGroup.firstChild.getAttribute("d")).toBe(
                    SHAPES.CIRCLE.path.d
                );
                expect(selectionElement.classList).toContain(
                    styles.dataPointSelection
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(selectionElement.getAttribute("aria-describedby")).toBe(
                    input.key
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("creates circle for incomplete pairs - low", () => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(
                    [
                        {
                            low: {
                                x: 45,
                                y: 75
                            }
                        }
                    ],
                    false,
                    false
                );
                graphDefault.loadContent(new PairedResult(input));
                const selectionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.dataPointSelection
                );
                const selectionElementGroup = selectionElement.firstChild;
                expect(selectionElement.tagName).toBe("svg");
                expect(selectionElementGroup.firstChild.nodeName).toBe("path");
                expect(selectionElementGroup.firstChild.getAttribute("d")).toBe(
                    SHAPES.CIRCLE.path.d
                );
                expect(selectionElement.classList).toContain(
                    styles.dataPointSelection
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(selectionElement.getAttribute("aria-describedby")).toBe(
                    input.key
                );
                expect(selectionElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
        });
        describe("when clicked on a data point", () => {
            it("does not do anything if no onClick callback is provided", (done) => {
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.onClick = null;
                graphDefault.loadContent(new PairedResult(input));
                const point = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedPoint
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
                graphDefault.loadContent(new PairedResult(input));
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.pairedPoint
                    ),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            ).getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("calls onClick callback", (done) => {
                const dataPointClickHandlerSpy = sinon.spy();
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisDefault));
                input = getInput(valuesDefault, false, false);
                input.onClick = dataPointClickHandlerSpy;
                graphDefault.loadContent(new PairedResult(input));

                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.pairedPoint
                    ),
                    "click",
                    () => {
                        expect(
                            dataPointClickHandlerSpy.calledOnce
                        ).toBeTruthy();
                        done();
                    }
                );
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
                graphDefault.loadContent(new PairedResult(input));
                triggerEvent(
                    pairedResultGraphContainer.querySelectorAll(
                        `.${styles.pairedPoint}`
                    )[3],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.high.x).toBe(input.values[1].high.x);
                        expect(args.val.high.y).toBe(input.values[1].high.y);
                        expect(args.val.low.x).toBe(input.values[1].low.x);
                        expect(args.val.low.y).toBe(input.values[1].low.y);
                        expect(args.val.mid.x).toBe(input.values[1].mid.x);
                        expect(args.val.mid.y).toBe(input.values[1].mid.y);
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            it("highlights the data point", (done) => {
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.pairedPoint
                    ),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            ).getAttribute("aria-selected")
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("creates a rectangle highlight for data point", (done) => {
                const point = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedPoint
                );
                triggerEvent(point, "click", () => {
                    const selectionElement = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.dataPointSelection
                    );
                    expect(selectionElement).not.toBeNull();
                    expect(selectionElement.tagName).toBe("rect");
                    expect(selectionElement.classList).toContain(
                        styles.dataPointSelection
                    );
                    done();
                });
            });
            it("removes highlight when data point is clicked again", (done) => {
                const point = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedPoint
                );
                triggerEvent(point, "click", () => {
                    triggerEvent(
                        point,
                        "click",
                        () => {
                            expect(
                                fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedBox
                                ).getAttribute("aria-selected")
                            ).toBe("false");
                            done();
                        },
                        TRANSITION_DELAY
                    );
                });
            });
        });
        describe("when clicked on a pair data point", () => {
            it("highlights the data point", (done) => {
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.pairedPoint
                    ),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            ).getAttribute("aria-selected")
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("removes highlight when clicked again", (done) => {
                const point = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedPoint
                );
                triggerEvent(point, "click", () => {
                    triggerEvent(point, "click", () => {
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            ).getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    });
                });
            });
        });
        describe("when clicked on a paired line", () => {
            it("highlights the data point", (done) => {
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.pairedLine
                    ),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            ).getAttribute("aria-selected")
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("removes highlight when clicked again", (done) => {
                const line = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedLine
                );
                triggerEvent(line, "click", () => {
                    triggerEvent(line, "click", () => {
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            ).getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    });
                });
            });
            it("emits correct parameters", (done) => {
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
                graphDefault.loadContent(new PairedResult(input));
                triggerEvent(
                    pairedResultGraphContainer.querySelectorAll(
                        `.${styles.pairedLine}`
                    )[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.high.x).toBe(input.values[1].high.x);
                        expect(args.val.high.y).toBe(input.values[1].high.y);
                        expect(args.val.low.x).toBe(input.values[1].low.x);
                        expect(args.val.low.y).toBe(input.values[1].low.y);
                        expect(args.val.mid.x).toBe(input.values[1].mid.x);
                        expect(args.val.mid.y).toBe(input.values[1].mid.y);
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
        });
    });
    describe("prepares to load legend item", () => {
        it("does not load if legend is opted to be hidden", () => {
            graphDefault.destroy();
            const input = getAxes(axisDefault);
            input.showLegend = false;
            const noLegendGraph = new Graph(input);
            noLegendGraph.loadContent(
                new PairedResult(getInput(valuesDefault))
            );
            const legendContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legend
            );
            expect(legendContainer).toBeNull();
            noLegendGraph.destroy();
        });
        it("does not load if label property is null", () => {
            const input = getInput(valuesDefault);
            input.label = null;
            graphDefault.loadContent(new PairedResult(input));
            const legendContainer = fetchElementByClass(
                pairedResultGraphContainer,
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
            graphDefault.loadContent(new PairedResult(input));
            const legendContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legend
            );
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
            const legendContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legend
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(0);
        });
        it("sanitizes the legend display", () => {
            const input = getInput(valuesDefault);
            input.label.high.display = "<HELLO DUMMY X LABEL>";
            graphDefault.loadContent(new PairedResult(input));
            const legendContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legend
            );
            const legendText = fetchElementByClass(
                legendContainer,
                styles.legendItemText
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(3);
            expect(legendText.textContent).toBe("&lt;HELLO DUMMY X LABEL&gt;");
        });
        it("loads item with a shape", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(input));
            const legendItemBtn = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItemBtn
            );
            const iconSVG = legendItemBtn.children[0].firstChild;
            expect(legendItemBtn).not.toBeNull();
            expect(legendItemBtn.getAttribute("class")).toBe(
                styles.legendItemBtn
            );
            expect(iconSVG.tagName).toBe("svg");
            expect(
                iconSVG.classList.contains(styles.legendItemIcon)
            ).toBeTruthy();
        });
        it("loads item with a correct text", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(input));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            expect(legendItem).not.toBeNull();
            expect(legendItem.getAttribute("aria-current")).toBe("true");
            expect(legendItem.children[1].className).toBe(
                styles.legendItemText
            );
            expect(legendItem.children[1].tagName).toBe("LABEL");
            expect(legendItem.children[1].textContent).toBe(
                input.label.high.display
            );
        });
        it("loads the correct shape", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(input));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            const iconSVG = legendItem.querySelector("svg");
            const iconPath = legendItem.querySelector("path");
            expect(iconSVG).not.toBeNull();
            expect(iconSVG.classList).toContain(styles.legendItemIcon);
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
            expect(iconPath.getAttribute("d")).toBe(SHAPES.TEAR_ALT.path.d);
        });
        it("loads the correct color", () => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(input));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            const iconSVG = legendItem.querySelector("svg");
            const iconPath = legendItem.querySelector("path");
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
            expect(iconPath.getAttribute("d")).toEqual(
                getShapeForTarget(input).high.path.d
            );
            expect(iconSVG.getAttribute("style")).toBe(
                `fill: ${COLORS.GREEN};`
            );
        });
        describe("if user sets showLine to be true and showShape to be false", () => {
            it("loads only line", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showShape: false,
                    showLine: true
                };
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                const svgElements = legendItem.querySelectorAll("svg");
                const lineSVG = svgElements[0];
                expect(svgElements.length).toBe(1);
                expect(lineSVG).not.toBeNull();
                expect(lineSVG.classList).toContain(styles.legendItemLine);
            });
        });
        describe("if user sets showLine to be false and showShape to be true", () => {
            it("loads only shape", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showShape: true,
                    showLine: false
                };
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
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
        });
        describe("if user sets showLine to be true, showShape to be false and provided stroke dashArray", () => {
            it("loads the line", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showShape: false,
                    showLine: true,
                    style: {
                        strokeDashArray: "2,2"
                    }
                };
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
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
        });
        describe("if user sets both showLine and showShape to be true", () => {
            it("loads both line and shape", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showShape: true,
                    showLine: true
                };
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                const svgElements = legendItem.querySelectorAll("svg");
                const iconSVG = svgElements[0];
                const lineSVG = svgElements[1];
                expect(svgElements.length).toBe(2);
                expect(iconSVG).not.toBeNull();
                expect(iconSVG.classList).toContain(styles.legendItemIcon);
                expect(lineSVG).not.toBeNull();
                expect(lineSVG.classList).toContain(
                    styles.legendItemLineWithIcon
                );
            });
        });

        describe("if user sets both showLine and showShape to be false", () => {
            it("loads empty legend button", () => {
                const input = getInput(valuesDefault, false, false);
                input.legendOptions = {
                    showShape: false,
                    showLine: false
                };
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                const svgElements = legendItem.querySelectorAll("svg");
                expect(svgElements.length).toBe(0);
            });
        });
        it("attaches click event handlers correctly", (done) => {
            const input = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(input));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                expect(legendItem.getAttribute("aria-current")).toBe("false");
                expect(legendItem.getAttribute("aria-disabled")).toBe("false");
                done();
            });
        });
        describe("on click", () => {
            it("hides the points", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const prContent = new PairedResult(input);
                const graph = graphDefault.loadContent(prContent);
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    ),
                    "click",
                    () => {
                        prContent.redraw(graph);
                        const high = pairedResultGraphContainer.querySelector(
                            `.${styles.pairedPoint}.${styles.high}`
                        );
                        const mid = pairedResultGraphContainer.querySelector(
                            `.${styles.pairedPoint}.${styles.mid}`
                        );
                        const low = pairedResultGraphContainer.querySelector(
                            `.${styles.pairedPoint}.${styles.low}`
                        );
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(1);
                        expect(high.getAttribute("aria-hidden")).toBe("true");
                        expect(mid.getAttribute("aria-hidden")).toBe("false");
                        expect(low.getAttribute("aria-hidden")).toBe("false");
                        rafSpy.calls.reset();
                        done();
                    }
                );
            });
            it("hides the line and points, if the point is high", (done) => {
                const input = getInput(valuesDefault, false, false);
                const prContent = new PairedResult(input);
                const graph = graphDefault.loadContent(prContent);
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    ),
                    "click",
                    () => {
                        prContent.redraw(graph);
                        expect(
                            pairedResultGraphContainer
                                .querySelector(`.${styles.pairedLine}`)
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("hides the line and points, if the point is low", (done) => {
                const input = getInput(valuesDefault, false, false);
                const prContent = new PairedResult(input);
                const graph = graphDefault.loadContent(prContent);
                const legendContainer = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legend
                );
                triggerEvent(
                    legendContainer.querySelector(
                        `[aria-describedby=${input.key}_low]`
                    ),
                    "click",
                    () => {
                        prContent.redraw(graph);
                        expect(
                            pairedResultGraphContainer
                                .querySelector(`.${styles.pairedLine}`)
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("does not hide the line and points, if the point is mid", (done) => {
                const input = getInput(valuesDefault, false, false);
                const prContent = new PairedResult(input);
                const graph = graphDefault.loadContent(prContent);
                const legendContainer = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legend
                );
                triggerEvent(
                    legendContainer.querySelector(
                        `[aria-describedby=${input.key}_mid]`
                    ),
                    "click",
                    () => {
                        prContent.redraw(graph);
                        const line = pairedResultGraphContainer.querySelector(
                            `.${styles.pairedLine}`
                        );
                        expect(line.getAttribute("d")).not.toBeNull();
                        done();
                    }
                );
            });
            it("removes the point but keeps the rest for multiple data sets", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const primaryPRContent = new PairedResult(inputPrimary);
                const secondaryPRContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(primaryPRContent);
                const graph = graphDefault.loadContent(secondaryPRContent);
                triggerEvent(
                    fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    ),
                    "click",
                    () => {
                        primaryPRContent.redraw(graph);
                        secondaryPRContent.redraw(graph);
                        const primaryPRElement = pairedResultGraphContainer.querySelector(
                            `.${styles.pairedBoxGroup}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const secondaryPRElement = pairedResultGraphContainer.querySelector(
                            `.${styles.pairedBoxGroup}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(graph.config.shownTargets.length).toBe(5);
                        expect(
                            fetchElementByClass(
                                primaryPRElement,
                                styles.pairedPoint
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                secondaryPRElement,
                                styles.pairedPoint
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("on clicking twice toggles the points back to visible", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const prContent = new PairedResult(input);
                const graph = graphDefault.loadContent(prContent);
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    prContent.redraw(graph);
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(2);
                        expect(
                            fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedPoint
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        rafSpy.calls.reset();
                        done();
                    });
                });
            });
            describe("highlights the data point and shows rest of data points", () => {
                const input = getInput(valuesDefault);
                let prContent = null;
                let graph = null;
                beforeEach(() => {
                    prContent = new PairedResult(input);
                    graph = graphDefault.loadContent(prContent);
                });
                it("box is set as selected", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            const box = fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedBox
                            );
                            expect(box.getAttribute("aria-selected")).toBe(
                                "true"
                            );
                            done();
                        });
                    });
                });
                it("selection element is displayed - Line", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            const selectionElement = fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.dataPointSelection
                            );
                            expect(selectionElement).not.toBeNull();
                            expect(selectionElement.tagName).toBe("rect");
                            expect(selectionElement.classList).toContain(
                                styles.dataPointSelection
                            );
                            expect(
                                fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedBox
                                ).getAttribute("aria-selected")
                            ).toBe("true");
                            done();
                        });
                    });
                });
                it("selection element is displayed - Point", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const point = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedPoint
                        );
                        triggerEvent(point, "click", () => {
                            const selectionElement = fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.dataPointSelection
                            );
                            expect(selectionElement).not.toBeNull();
                            expect(selectionElement.tagName).toBe("rect");
                            expect(selectionElement.classList).toContain(
                                styles.dataPointSelection
                            );
                            expect(
                                fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedBox
                                ).getAttribute("aria-selected")
                            ).toBe("true");
                            done();
                        });
                    });
                });
                it("line is displayed to connect the pair", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            const lineElement = fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedLine
                            );
                            expect(lineElement.tagName).toBe("path");
                            expect(lineElement.classList).toContain(
                                styles.pairedLine
                            );
                            expect(lineElement.classList).toContain(
                                styles.dataPointDisplayEnable
                            );
                            expect(
                                fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedBox
                                ).getAttribute("aria-selected")
                            ).toBe("true");
                            done();
                        });
                    });
                });
                it("points are displayed even if they are hidden", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            const pointElement = fetchElementByClass(
                                pairedResultGraphContainer,
                                styles.pairedPoint
                            );
                            expect(pointElement.tagName).toBe("svg");
                            expect(pointElement.classList).toContain(
                                styles.pairedPoint
                            );
                            expect(pointElement.classList).toContain(
                                styles.high
                            );
                            expect(pointElement.classList).toContain(
                                styles.dataPointDisplayEnable
                            );
                            expect(
                                fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedBox
                                ).getAttribute("aria-selected")
                            ).toBe("true");
                            done();
                        });
                    });
                });
            });
            describe("removes highlight when reset", () => {
                let input;
                let prContent;
                let graph;
                let legendItem;
                beforeEach(() => {
                    input = getInput(valuesDefault, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    prContent = new PairedResult(input);
                    graph = graphDefault.loadContent(prContent);
                    legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                });
                it("box is set as unselected", (done) => {
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            triggerEvent(line, "click", () => {
                                expect(
                                    fetchElementByClass(
                                        pairedResultGraphContainer,
                                        styles.pairedBox
                                    ).getAttribute("aria-selected")
                                ).toBe("false");
                                done();
                            });
                        });
                    });
                });
                it("selection element is hidden - Line", (done) => {
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            triggerEvent(line, "click", () => {
                                const selectionElement = fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.dataPointSelection
                                );
                                expect(selectionElement).not.toBeNull();
                                expect(selectionElement.tagName).toBe("rect");
                                expect(selectionElement.classList).toContain(
                                    styles.dataPointSelection
                                );
                                expect(
                                    fetchElementByClass(
                                        pairedResultGraphContainer,
                                        styles.pairedBox
                                    ).getAttribute("aria-selected")
                                ).toBe("false");
                                done();
                            });
                        });
                    });
                });
                it("selection element is hidden - Point", (done) => {
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const point = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedPoint
                        );
                        triggerEvent(point, "click", () => {
                            triggerEvent(point, "click", () => {
                                const selectionElement = fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.dataPointSelection
                                );
                                expect(selectionElement).not.toBeNull();
                                expect(selectionElement.tagName).toBe("rect");
                                expect(selectionElement.classList).toContain(
                                    styles.dataPointSelection
                                );
                                expect(
                                    fetchElementByClass(
                                        pairedResultGraphContainer,
                                        styles.pairedBox
                                    ).getAttribute("aria-selected")
                                ).toBe("false");
                                done();
                            });
                        });
                    });
                });
                it("line between the pair is hidden", (done) => {
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            triggerEvent(line, "click", () => {
                                const lineElement = fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedLine
                                );
                                expect(lineElement.tagName).toBe("path");
                                expect(lineElement.classList).toContain(
                                    styles.pairedLine
                                );
                                expect(
                                    lineElement.classList[1]
                                ).toBeUndefined();
                                expect(
                                    fetchElementByClass(
                                        pairedResultGraphContainer,
                                        styles.pairedBox
                                    ).getAttribute("aria-selected")
                                ).toBe("false");
                                done();
                            });
                        });
                    });
                });
                it("points are hidden that were toggled off", (done) => {
                    triggerEvent(legendItem, "click", () => {
                        prContent.redraw(graph);
                        const line = fetchElementByClass(
                            pairedResultGraphContainer,
                            styles.pairedLine
                        );
                        triggerEvent(line, "click", () => {
                            triggerEvent(line, "click", () => {
                                const pointElement = fetchElementByClass(
                                    pairedResultGraphContainer,
                                    styles.pairedPoint
                                );
                                expect(pointElement.tagName).toBe("svg");
                                expect(pointElement.classList).toContain(
                                    styles.svgIcon
                                );
                                expect(pointElement.classList).toContain(
                                    styles.pairedPoint
                                );
                                expect(pointElement.classList).toContain(
                                    styles.high
                                );
                                expect(
                                    pointElement.classList[3]
                                ).toBeUndefined();
                                expect(
                                    fetchElementByClass(
                                        pairedResultGraphContainer,
                                        styles.pairedBox
                                    ).getAttribute("aria-selected")
                                ).toBe("false");
                                done();
                            });
                        });
                    });
                });
            });
        });
        it("shown targets are removed from Graph", (done) => {
            const input = getInput(valuesDefault, false, false);
            const graph = graphDefault.loadContent(new PairedResult(input));
            triggerEvent(
                fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                ),
                "click",
                () => {
                    expect(graph.config.shownTargets.length).toBe(2);
                    done();
                }
            );
        });
        it("shown targets are updated back when toggled", (done) => {
            const input = getInput(valuesDefault, false, false);
            const graph = graphDefault.loadContent(new PairedResult(input));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "click", () => {
                triggerEvent(legendItem, "click", () => {
                    expect(graph.config.shownTargets.length).toBe(3);
                    done();
                });
            });
        });
        it("attaches mouse enter event handlers correctly", (done) => {
            const inputPrimary = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(inputPrimary));
            graphDefault.loadContent(new PairedResult(inputSecondary));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "mouseenter", () => {
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `.${styles.pairedPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeFalsy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `path[aria-describedby="${inputPrimary.key}"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeTruthy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `path[aria-describedby="${inputSecondary.key}"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeTruthy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `.${styles.pairedPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeTruthy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `.${styles.pairedPoint}[aria-describedby="${inputSecondary.key}_low"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeTruthy();
                done();
            });
        });
        it("attaches mouse leave event handlers correctly", (done) => {
            const inputPrimary = getInput(valuesDefault, false, false);
            graphDefault.loadContent(new PairedResult(inputPrimary));
            graphDefault.loadContent(new PairedResult(inputSecondary));
            const legendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            triggerEvent(legendItem, "mouseleave", () => {
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `path[aria-describedby="${inputPrimary.key}"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeFalsy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `path[aria-describedby="${inputSecondary.key}"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeFalsy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `.${styles.pairedPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeFalsy();
                expect(
                    pairedResultGraphContainer
                        .querySelector(
                            `.${styles.pairedPoint}[aria-describedby="${inputSecondary.key}_low"]`
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
            const pairPrimary = getInput(valuesDefault, true, true, true);
            const pairSecondary = getInput(valuesDefault, true, true, false);
            pairSecondary.key = "uid_2";
            graph.loadContent(new PairedResult(pairPrimary));
            graph.loadContent(new PairedResult(pairSecondary));
        });
        it("Does not load shape if Y2 axis is not loaded", () => {
            graphDefault.destroy();
            const axes = utils.deepClone(getAxes(axisDefault));
            axes.axis.y2.show = false;
            const graph = new Graph(axes);
            const input = getInput(valuesDefault, true, true, false);
            graph.loadContent(new PairedResult(input));
            expect(graph.axesLabelShapeGroup[constants.Y_AXIS]).toBeUndefined();
            expect(
                graph.axesLabelShapeGroup[constants.Y2_AXIS]
            ).toBeUndefined();
        });
        it("Loads shape in Y Axis", () => {
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelYShapeContainer
            );
            const svgPathHigh = labelShapeContainer.children[0];
            const svgPathMid = labelShapeContainer.children[1];
            const svgPathLow = labelShapeContainer.children[2];
            expect(
                graph.axesLabelShapeGroup[constants.Y_AXIS]
            ).not.toBeUndefined();
            expect(labelShapeContainer.children.length).toBe(3);
            expect(svgPathHigh.tagName).toBe("svg");
            expect(svgPathHigh.getAttribute("x")).toBe("0");
            expect(svgPathHigh.getAttribute("aria-describedby")).toContain(
                "uid_2"
            );
            expect(svgPathHigh.getAttribute("aria-describedby")).toBe(
                "uid_2_high"
            );

            expect(svgPathMid.tagName).toBe("svg");
            expect(svgPathMid.getAttribute("x")).toBe("20");
            expect(svgPathMid.getAttribute("aria-describedby")).toBe(
                "uid_2_mid"
            );

            expect(svgPathLow.tagName).toBe("svg");
            expect(svgPathLow.getAttribute("x")).toBe("40");
            expect(svgPathLow.getAttribute("aria-describedby")).toBe(
                "uid_2_low"
            );
        });
        it("Loads shape for each data set in Y Axis", () => {
            const pairTertiary = getInput(valuesDefault, true, true, false);
            pairTertiary.key = "uid_3";
            graph.loadContent(new PairedResult(pairTertiary));
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelYShapeContainer
            );
            const svgPathHigh = labelShapeContainer.children[3];
            const svgPathMid = labelShapeContainer.children[4];
            const svgPathLow = labelShapeContainer.children[5];
            expect(labelShapeContainer.children.length).toBe(6);
            expect(svgPathHigh.tagName).toBe("svg");
            expect(svgPathHigh.getAttribute("x")).toBe("60");
            expect(svgPathHigh.getAttribute("aria-describedby")).toContain(
                "uid_3"
            );
            expect(svgPathHigh.getAttribute("aria-describedby")).toBe(
                "uid_3_high"
            );

            expect(svgPathMid.tagName).toBe("svg");
            expect(svgPathMid.getAttribute("x")).toBe("80");
            expect(svgPathMid.getAttribute("aria-describedby")).toBe(
                "uid_3_mid"
            );

            expect(svgPathLow.tagName).toBe("svg");
            expect(svgPathLow.getAttribute("x")).toBe("100");
            expect(svgPathLow.getAttribute("aria-describedby")).toBe(
                "uid_3_low"
            );
        });
        it("Loads shape in Y2 Axis", () => {
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            const svgPathHigh = labelShapeContainer.children[0];
            const svgPathMid = labelShapeContainer.children[1];
            const svgPathLow = labelShapeContainer.children[2];
            expect(
                graph.axesLabelShapeGroup[constants.Y_AXIS]
            ).not.toBeUndefined();
            expect(labelShapeContainer.children.length).toBe(3);
            expect(svgPathHigh.tagName).toBe("svg");
            expect(svgPathHigh.getAttribute("x")).toBe("0");
            expect(svgPathHigh.getAttribute("aria-describedby")).toContain(
                "uid_1"
            );
            expect(svgPathHigh.getAttribute("aria-describedby")).toBe(
                "uid_1_high"
            );

            expect(svgPathMid.tagName).toBe("svg");
            expect(svgPathMid.getAttribute("x")).toBe("20");
            expect(svgPathMid.getAttribute("aria-describedby")).toBe(
                "uid_1_mid"
            );

            expect(svgPathLow.tagName).toBe("svg");
            expect(svgPathLow.getAttribute("x")).toBe("40");
            expect(svgPathLow.getAttribute("aria-describedby")).toBe(
                "uid_1_low"
            );
        });
        it("Loads shape for each data set in Y2 Axis", () => {
            const pairTertiary = getInput(valuesDefault, true, true, true);
            pairTertiary.key = "uid_4";
            graph.loadContent(new PairedResult(pairTertiary));
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            const svgPathHigh = labelShapeContainer.children[3];
            const svgPathMid = labelShapeContainer.children[4];
            const svgPathLow = labelShapeContainer.children[5];
            expect(labelShapeContainer.children.length).toBe(6);
            expect(svgPathHigh.tagName).toBe("svg");
            expect(svgPathHigh.getAttribute("x")).toBe("60");
            expect(svgPathHigh.getAttribute("aria-describedby")).toContain(
                "uid_4"
            );
            expect(svgPathHigh.getAttribute("aria-describedby")).toBe(
                "uid_4_high"
            );

            expect(svgPathMid.tagName).toBe("svg");
            expect(svgPathMid.getAttribute("x")).toBe("80");
            expect(svgPathMid.getAttribute("aria-describedby")).toBe(
                "uid_4_mid"
            );

            expect(svgPathLow.tagName).toBe("svg");
            expect(svgPathLow.getAttribute("x")).toBe("100");
            expect(svgPathLow.getAttribute("aria-describedby")).toBe(
                "uid_4_low"
            );
        });
    });
    describe("When legend item is clicked", () => {
        it("Preserves the DOM order", () => {
            graphDefault.destroy();
            const graph = new Graph(getAxes(axisDefault));
            const pairPrimary = getInput(valuesDefault, true, true, true);
            const pairSecondary = getInput(valuesDefault, true, true, false);
            pairPrimary.key = "uid_1";
            pairSecondary.key = "uid_2";
            graph.loadContent(new PairedResult(pairPrimary));
            graph.loadContent(new PairedResult(pairSecondary));
            const legendItem = document.querySelector(
                `.${styles.legendItem}[aria-describedby="${pairPrimary.key}_high"]`
            );
            expect(graph.config.shownTargets).toEqual([
                "uid_1_high",
                "uid_1_mid",
                "uid_1_low",
                "uid_2_high",
                "uid_2_mid",
                "uid_2_low"
            ]);
            triggerEvent(legendItem, "click");
            triggerEvent(legendItem, "click");
            expect(graph.config.shownTargets).toEqual([
                "uid_1_mid",
                "uid_1_low",
                "uid_2_high",
                "uid_2_mid",
                "uid_2_low",
                "uid_1_high"
            ]);
            expect(
                document
                    .querySelector(`.${styles.pairedBoxGroup}`)
                    .getAttribute("aria-describedby")
            ).toEqual(pairPrimary.key);
        });
        describe("When multiple canvases with paired results present", () => {
            it("Shoud not affect paired results in other canvases", () => {
                const inputPrimary = getInput(valuesDefault);
                const primaryGraph = new Graph(getAxes(axisDefault));
                primaryGraph.loadContent(new PairedResult(inputPrimary));
                const secondaryGraph = new Graph(getAxes(axisDefault));
                secondaryGraph.loadContent(new PairedResult(inputSecondary));
                const legendItem = document.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                );
                triggerEvent(legendItem, "click");
                const primaryGraphPRElement = pairedResultGraphContainer.querySelector(
                    `.${styles.pairedBoxGroup}[aria-describedby="${inputPrimary.key}"]`
                );
                const secondaryGraphPRElement = pairedResultGraphContainer.querySelector(
                    `.${styles.pairedBoxGroup}[aria-describedby="${inputSecondary.key}"]`
                );
                expect(
                    fetchElementByClass(
                        primaryGraphPRElement,
                        styles.pairedLine
                    ).getAttribute("aria-hidden")
                ).toBe("true");
                expect(
                    fetchElementByClass(
                        secondaryGraphPRElement,
                        styles.pairedLine
                    ).getAttribute("aria-hidden")
                ).toBe("false");
            });
        });
    });
});
