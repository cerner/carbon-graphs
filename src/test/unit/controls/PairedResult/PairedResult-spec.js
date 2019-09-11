"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { getShapeForTarget } from "../../../../main/js/controls/Graph/helpers/helpers";
import PairedResult from "../../../../main/js/controls/PairedResult";
import {
    getXAxisWidth,
    getXAxisXPosition
} from "../../../../main/js/helpers/axis";
import constants, {
    AXIS_TYPE,
    COLORS,
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
import {
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    multiRegion,
    multiRegionNotSame,
    simpleRegion,
    valuesDefault,
    valuesTimeSeries,
    multiRegionSameData,
    regionMissing
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
            expect(legendItem.getAttribute("aria-selected")).toBe("true");
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
    describe("When graph is loaded with input", () => {
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
                const validGraph = new Graph(
                    getAxes(utils.deepClone(axisDefault))
                );
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
                        i.onClick !== null &&
                        i.yAxis !== null &&
                        i.key === data.key
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
                        (j) =>
                            typeof i[j].x === "object" && i[j].x instanceof Date
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
                data.internalValuesSubset.every((i) =>
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
                data.internalValuesSubset.every((i) =>
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
                data.internalValuesSubset.every(
                    (j) => j.yAxis === constants.Y_AXIS
                )
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
                    pairedResultContentContainer.getAttribute(
                        "aria-describedby"
                    )
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
                expect(
                    linePath.classList.contains(styles.pairedLine)
                ).toBeTruthy();
            });
            it("adds line with default stroke", () => {
                const linePath = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.pairedLine
                );
                expect(linePath.getAttribute("class")).toBe(styles.pairedLine);
                expect(linePath.getAttribute("aria-describedby")).toBe(
                    input.key
                );
                expect(linePath.getAttribute("aria-hidden")).toBe("false");
                expect(
                    linePath.attributes.getNamedItem("d").value
                ).not.toBeNull();
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
                        "fill: #007cc3;"
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
                        "fill: #78c346;"
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
                        "fill: #007cc3;"
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
                        points.firstChild.firstChild.attributes.getNamedItem(
                            "d"
                        ).value
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
                        points.firstChild.firstChild.attributes.getNamedItem(
                            "d"
                        ).value
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
                        points.firstChild.firstChild.attributes.getNamedItem(
                            "d"
                        ).value
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
                    expect(
                        selectionElement.getAttribute("aria-describedby")
                    ).toBe(input.key);
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
                    expect(selectionElementGroup.firstChild.nodeName).toBe(
                        "path"
                    );
                    expect(
                        selectionElementGroup.firstChild.getAttribute("d")
                    ).toBe(SHAPES.CIRCLE.path.d);
                    expect(selectionElement.classList).toContain(
                        styles.dataPointSelection
                    );
                    expect(selectionElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    expect(
                        selectionElement.getAttribute("aria-describedby")
                    ).toBe(input.key);
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
                    expect(selectionElementGroup.firstChild.nodeName).toBe(
                        "path"
                    );
                    expect(
                        selectionElementGroup.firstChild.getAttribute("d")
                    ).toBe(SHAPES.CIRCLE.path.d);
                    expect(selectionElement.classList).toContain(
                        styles.dataPointSelection
                    );
                    expect(selectionElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    expect(
                        selectionElement.getAttribute("aria-describedby")
                    ).toBe(input.key);
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
                    expect(selectionElementGroup.firstChild.nodeName).toBe(
                        "path"
                    );
                    expect(
                        selectionElementGroup.firstChild.getAttribute("d")
                    ).toBe(SHAPES.CIRCLE.path.d);
                    expect(selectionElement.classList).toContain(
                        styles.dataPointSelection
                    );
                    expect(selectionElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    expect(
                        selectionElement.getAttribute("aria-describedby")
                    ).toBe(input.key);
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
                            expect(args.val.high.x).toBe(
                                input.values[1].high.x
                            );
                            expect(args.val.high.y).toBe(
                                input.values[1].high.y
                            );
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
                            expect(args.val.high.x).toBe(
                                input.values[1].high.x
                            );
                            expect(args.val.high.y).toBe(
                                input.values[1].high.y
                            );
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
                expect(legendText.textContent).toBe(
                    "&lt;HELLO DUMMY X LABEL&gt;"
                );
            });
            it("loads item with a shape", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItemBtn = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItemBtn
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
            it("loads item with a correct text", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                expect(legendItem).not.toBeNull();
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
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
                    `fill: ${COLORS.BLUE};`
                );
            });
            it("attaches click event handlers correctly", (done) => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new PairedResult(input));
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    expect(legendItem.getAttribute("aria-selected")).toBe(
                        "false"
                    );
                    expect(legendItem.getAttribute("aria-disabled")).toBe(
                        "false"
                    );
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
                            expect(high.getAttribute("aria-hidden")).toBe(
                                "true"
                            );
                            expect(mid.getAttribute("aria-hidden")).toBe(
                                "false"
                            );
                            expect(low.getAttribute("aria-hidden")).toBe(
                                "false"
                            );
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
                                    expect(selectionElement.tagName).toBe(
                                        "rect"
                                    );
                                    expect(
                                        selectionElement.classList
                                    ).toContain(styles.dataPointSelection);
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
                                    expect(selectionElement.tagName).toBe(
                                        "rect"
                                    );
                                    expect(
                                        selectionElement.classList
                                    ).toContain(styles.dataPointSelection);
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
                const pairSecondary = getInput(
                    valuesDefault,
                    true,
                    true,
                    false
                );
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
                expect(
                    graph.axesLabelShapeGroup[constants.Y_AXIS]
                ).toBeUndefined();
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
    });
    describe("When graph is unloaded off input", () => {
        it("returns the pairedResult instance", () => {
            const pairedResult = new PairedResult(
                getInput(valuesDefault, false, false)
            );
            graphDefault.loadContent(pairedResult);
            const unloadedPairResult = pairedResult.unload(graphDefault);
            expect(unloadedPairResult instanceof PairedResult);
        });
        it("clears the graph", () => {
            const pairedResult = new PairedResult(
                getInput(valuesDefault, false, false)
            );
            graphDefault.loadContent(pairedResult);
            pairedResult.unload(graphDefault);
            const pairedResultContentContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.pairedBoxGroup
            );
            expect(pairedResultContentContainer).toBeNull();
        });
        it("removes the legend from graph", () => {
            const graphLegend = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legend
            );
            const pairedResultLegendItem = fetchElementByClass(
                pairedResultGraphContainer,
                styles.legendItem
            );
            expect(graphLegend).not.toBeNull();
            expect(pairedResultLegendItem).toBeNull();
        });
        it("resets the pairedResult graph instance properties", () => {
            const pairedResult = new PairedResult(
                getInput(valuesDefault, false, false)
            );
            graphDefault.loadContent(pairedResult);
            pairedResult.unload(graphDefault);
            expect(pairedResult.dataTarget).toEqual({});
            expect(pairedResult.config).toEqual({});
        });
        describe("Removes label shape from label container", () => {
            let graph;
            let pairPrimary;
            let pairedSecondary;
            beforeEach(() => {
                graphDefault.destroy();
                graph = new Graph(getAxes(axisDefault));
                pairPrimary = new PairedResult(
                    getInput(valuesDefault, true, true, true)
                );
                pairedSecondary = new PairedResult(inputSecondary);
                graph.loadContent(pairPrimary);
                graph.loadContent(pairedSecondary);
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
                graph.unloadContent(pairedSecondary);
                const labelShapeContainer = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(0);
            });
            it("For Y axis with multiple data set", () => {
                const pairContent = getInput(valuesDefault, true, true, false);
                pairContent.key = "uid_3";
                graph.loadContent(new PairedResult(pairContent));
                graph.unloadContent(pairedSecondary);
                const labelShapeContainer = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.axisLabelYShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(3);
                expect(labelShapeContainer.children[0].tagName).toBe("svg");
                expect(labelShapeContainer.children[0].getAttribute("x")).toBe(
                    "0"
                );
                expect(
                    labelShapeContainer.children[0].getAttribute(
                        "aria-describedby"
                    )
                ).toContain("uid_3");
            });
            it("For Y2 axis", () => {
                graph.unloadContent(pairPrimary);
                const labelShapeContainer = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(0);
            });
            it("For Y2 axis with multiple data set", () => {
                const pairContent = getInput(valuesDefault, true, true, true);
                pairContent.key = "uid_4";
                graph.loadContent(new PairedResult(pairContent));
                graph.unloadContent(pairPrimary);
                const labelShapeContainer = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.axisLabelY2ShapeContainer
                );
                expect(labelShapeContainer.children.length).toBe(3);
                expect(labelShapeContainer.children[0].tagName).toBe("svg");
                expect(labelShapeContainer.children[0].getAttribute("x")).toBe(
                    "0"
                );
                expect(
                    labelShapeContainer.children[0].getAttribute(
                        "aria-describedby"
                    )
                ).toContain("uid_4");
            });
        });
    });
    describe("Region", () => {
        let pairedResultPrimaryContent = null;
        let data = null;
        const inputSecondary = {
            key: `uid_2`,
            regions: simpleRegion,
            label: {
                high: {
                    display: "Data Label 2 High"
                },
                mid: {
                    display: "Data Label 2 Median"
                },
                low: {
                    display: "Data Label 2 Low"
                }
            },
            values: valuesDefault
        };
        describe("On load", () => {
            describe("Ideally", () => {
                beforeEach(() => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false)
                    );
                    data.regions = simpleRegion;
                    pairedResultPrimaryContent = new PairedResult(data);
                    graphDefault.loadContent(pairedResultPrimaryContent);
                });
                it("Creates a pair group for each data-set region", () => {
                    const regionGroupElement = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.regionGroup
                    );
                    expect(regionGroupElement.firstChild).not.toBeNull();
                    expect(
                        regionGroupElement.firstChild.getAttribute("class")
                    ).toBe(styles.regionPairGroup);
                    expect(
                        regionGroupElement.firstChild.getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}`);
                });
                it("Creates a pair group for each data-set region for multi pair", () => {
                    const pairedResultSecondaryContent = new PairedResult(
                        inputSecondary
                    );
                    graphDefault.loadContent(pairedResultSecondaryContent);
                    const regionGroupElement = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.regionGroup
                    );
                    expect(regionGroupElement.firstChild).not.toBeNull();
                    expect(
                        regionGroupElement.firstChild.getAttribute("class")
                    ).toBe(styles.regionPairGroup);
                    expect(
                        regionGroupElement.firstChild.getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}`);
                    expect(
                        regionGroupElement.childNodes[1].getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${inputSecondary.key}`);
                });
                it("Creates region when present", () => {
                    const regionGroupElement = fetchElementByClass(
                        pairedResultGraphContainer,
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
                    const regionPairGroupElement = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.regionPairGroup
                    );
                    expect(
                        regionPairGroupElement.childNodes[0].getAttribute(
                            "class"
                        )
                    ).toBe(styles.region);
                    expect(
                        regionPairGroupElement.childNodes[0].getAttribute(
                            "aria-hidden"
                        )
                    ).toBe("false");
                    expect(
                        regionPairGroupElement.childNodes[0].getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}_high`);

                    expect(
                        regionPairGroupElement.childNodes[1].getAttribute(
                            "class"
                        )
                    ).toBe(styles.region);
                    expect(
                        regionPairGroupElement.childNodes[1].getAttribute(
                            "aria-hidden"
                        )
                    ).toBe("false");
                    expect(
                        regionPairGroupElement.childNodes[1].getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}_low`);
                });
            });
            it("Creates region only if present", () => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = null;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
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
                    data.regions = multiRegion;
                    pairedResultPrimaryContent = new PairedResult(data);
                    graphDefault.loadContent(pairedResultPrimaryContent);
                });
                it("Correctly renders", () => {
                    const regionGroupElement = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.regionPairGroup
                    );
                    expect(regionGroupElement.childNodes.length).toBe(3);
                    expect(regionGroupElement.childNodes[0].nodeName).toBe(
                        "rect"
                    );
                    expect(regionGroupElement.childNodes[1].nodeName).toBe(
                        "rect"
                    );
                    expect(regionGroupElement.childNodes[2].nodeName).toBe(
                        "rect"
                    );
                    expect(
                        regionGroupElement.childNodes[0].getAttribute("class")
                    ).toBe(styles.region);
                    expect(
                        regionGroupElement.childNodes[1].getAttribute("class")
                    ).toBe(styles.region);
                    expect(
                        regionGroupElement.childNodes[2].getAttribute("class")
                    ).toBe(styles.region);
                });
                it("shows multiple regions face-up by default", () => {
                    const regionGroupElement = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.regionPairGroup
                    );
                    expect(regionGroupElement.childNodes.length).toBe(3);
                    expect(
                        regionGroupElement.childNodes[0].getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}_high`);
                    expect(
                        regionGroupElement.childNodes[1].getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}_high`);
                    expect(
                        regionGroupElement.childNodes[2].getAttribute(
                            "aria-describedby"
                        )
                    ).toBe(`region_${data.key}_low`);
                    expect(
                        regionGroupElement.childNodes[0].getAttribute(
                            "aria-hidden"
                        )
                    ).toBe("false");
                    expect(
                        regionGroupElement.childNodes[1].getAttribute(
                            "aria-hidden"
                        )
                    ).toBe("false");
                    expect(
                        regionGroupElement.childNodes[2].getAttribute(
                            "aria-hidden"
                        )
                    ).toBe("false");
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
                    data.regions = { high: {} };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(errors.THROW_MSG_REGION_EMPTY);
                });
                it("Throws error when both start and end are empty", () => {
                    data.regions = {
                        high: [
                            {
                                start: null,
                                end: null
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(errors.THROW_MSG_REGION_START_END_MISSING);
                });
                it("Throws error when axis info is invalid", () => {
                    data.regions = {
                        high: [
                            {
                                axis: "x",
                                start: 10,
                                end: 20
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when axis info is invalid for Y2 axis", () => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false, true)
                    );
                    data.regions = {
                        high: [
                            {
                                axis: "x",
                                start: 10,
                                end: 20
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when axis provided is different than data-set axis", () => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false, true)
                    );
                    data.regions = {
                        high: [
                            {
                                axis: constants.Y_AXIS,
                                start: 10,
                                end: 20
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when axis is not and data-set axis is Y2", () => {
                    data = utils.deepClone(
                        getInput(valuesDefault, false, false, true)
                    );
                    data.regions = {
                        high: [
                            {
                                start: 10,
                                end: 20
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED
                    );
                });
                it("Throws error when start value is invalid", () => {
                    data.regions = {
                        high: [
                            {
                                start: "10",
                                end: 20
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                    );
                });
                it("Throws error when end value is invalid", () => {
                    data.regions = {
                        high: [
                            {
                                start: 10,
                                end: "20"
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(
                        errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                    );
                });
                it("Throws error when start is more than end", () => {
                    data.regions = {
                        high: [
                            {
                                start: 20,
                                end: 10
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).toThrowError(errors.THROW_MSG_REGION_START_MORE_END);
                });
                it("Correctly passes validation", () => {
                    data.regions = {
                        high: [
                            {
                                axis: constants.Y_AXIS,
                                start: 10,
                                end: 15
                            }
                        ]
                    };
                    pairedResultPrimaryContent = new PairedResult(data);
                    expect(() => {
                        graphDefault.loadContent(pairedResultPrimaryContent);
                    }).not.toThrow();
                });
            });
            it("Translates region correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.region
                );
                expect(regionElement.nodeName).toBe("rect");
                expect(toNumber(regionElement.getAttribute("x"))).toBe(
                    getXAxisXPosition(graphDefault.config)
                );
                expect(toNumber(regionElement.getAttribute("y"))).toBe(
                    toNumber(graphDefault.scale.y(220), 10) +
                        constants.PADDING.bottom
                );
            });
            it("Does not hide regions is graph has only 1 data-set", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionPairGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(2);
                expect(
                    regionGroupElement.childNodes[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_high`);
                expect(
                    regionGroupElement.childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_low`);
                expect(
                    regionGroupElement.childNodes[0].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    regionGroupElement.childNodes[1].getAttribute("aria-hidden")
                ).toBe("false");
            });
            it("Hides all the regions if region is not same for any value has more than 1 data-set", () => {
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        high: {
                            display: "Data Label 2 High"
                        },
                        mid: {
                            display: "Data Label 2 Median"
                        },
                        low: {
                            display: "Data Label 2 Low"
                        }
                    },
                    regions: multiRegion,
                    values: valuesDefault
                };
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                const pairedResultSecondaryContent = new PairedResult(
                    inputSecondary
                );
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.loadContent(pairedResultSecondaryContent);
                const regionGroupElements = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.regionPairGroup}`
                );

                expect(regionGroupElements[0].childNodes.length).toBe(2); // Regions from primary
                expect(regionGroupElements[1].childNodes.length).toBe(3); // Regions from secondary

                expect(
                    regionGroupElements[0].childNodes[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_high`);
                expect(
                    regionGroupElements[0].childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_low`);
                expect(
                    regionGroupElements[1].childNodes[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${inputSecondary.key}_high`);
                expect(
                    regionGroupElements[1].childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${inputSecondary.key}_high`);
                expect(
                    regionGroupElements[1].childNodes[2].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${inputSecondary.key}_low`);

                expect(
                    regionGroupElements[0].childNodes[0].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
                expect(
                    regionGroupElements[0].childNodes[1].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
                expect(
                    regionGroupElements[1].childNodes[0].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
                expect(
                    regionGroupElements[1].childNodes[1].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
                expect(
                    regionGroupElements[1].childNodes[2].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
                graphDefault.unloadContent(pairedResultSecondaryContent);
            });
            it("Sets the width correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.region
                );
                expect(toNumber(regionElement.getAttribute("width"))).toBe(
                    getXAxisWidth(graphDefault.config)
                );
            });
            it("Sets the height correctly", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("height")).toBeGreaterThan(
                    constants.PADDING.top
                );
            });
            it("Creates a goal pairedResult when start and end are same", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = {
                    high: [
                        {
                            start: 15,
                            end: 15
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.region
                );
                expect(+regionElement.getAttribute("height")).toBe(
                    constants.DEFAULT_REGION_LINE_STROKE_WIDTH
                );
            });
            it("Creates region correctly when start is not provided", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = {
                    high: [
                        {
                            end: 15
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
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
                data.regions = {
                    high: [
                        {
                            start: 10
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
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
                data.regions = {
                    high: [
                        {
                            axis: constants.Y2_AXIS,
                            start: 10,
                            end: 15
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
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
                data.regions = {
                    high: [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15,
                            color: "#f44444"
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
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
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.unloadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(0);
            });
            it("Removes all regions", () => {
                data = utils.deepClone(getInput(valuesDefault));
                data.regions = multiRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.unloadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(0);
            });
        });
        describe("On legend item hover", () => {
            describe("When single-paired result", () => {
                let inputPrimary = null;
                let pairedResultPrimaryContent = null;
                let pairedResultSecondaryContent = null;
                beforeEach(() => {
                    inputPrimary = getInput(valuesDefault);
                    inputPrimary.regions = simpleRegion;
                    pairedResultPrimaryContent = new PairedResult(inputPrimary);
                    pairedResultSecondaryContent = new PairedResult(
                        inputSecondary
                    );
                    graphDefault.loadContent(pairedResultPrimaryContent);
                    graphDefault.loadContent(pairedResultSecondaryContent);
                });
                it("Shows region on mouse enter", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                                )
                                .classList.contains(styles.regionHighlight)
                        ).toBeTruthy();
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                                )
                                .classList.contains(styles.regionBlur)
                        ).toBeFalsy();
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                                )
                                .classList.contains(styles.regionHighlight)
                        ).toBeFalsy();
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                                )
                                .classList.contains(styles.regionBlur)
                        ).toBeTruthy();
                        done();
                    });
                });
                it("Hides region on mouse exit", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            expect(
                                document
                                    .querySelector(
                                        `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                                    )
                                    .classList.contains(styles.regionHighlight)
                            ).toBeFalsy();
                            expect(
                                document
                                    .querySelector(
                                        `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                                    )
                                    .classList.contains(styles.regionBlur)
                            ).toBeFalsy();
                            done();
                        });
                    });
                });
            });
            describe("When multi-paired result", () => {
                let inputPrimary = null;
                let pairedResultPrimaryContent = null;
                let pairedResultSecondaryContent = null;
                beforeEach(() => {
                    inputPrimary = getInput(valuesDefault, false, false);
                    inputPrimary.regions = multiRegion;
                    pairedResultPrimaryContent = new PairedResult(inputPrimary);
                    pairedResultSecondaryContent = new PairedResult(
                        inputSecondary
                    );
                    graphDefault.loadContent(pairedResultPrimaryContent);
                    graphDefault.loadContent(pairedResultSecondaryContent);
                });
                it("Shows region on mouse enter", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const regionElements = document.querySelectorAll(
                                `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
        describe("When multi-paired result with multi-regions with same data", () => {
            let inputPrimary = null;
            let inputThird = null;
            let pairedResultPrimaryContent = null;
            let pairedResultSecondaryContent = null;
            let pairedResultThirdContent = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = multiRegionSameData;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                inputSecondary.regions = multiRegionSameData;
                pairedResultSecondaryContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.loadContent(pairedResultSecondaryContent);
            });
            it("Show all region face-up with same data always", () => {
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(6);
                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("false");
                });
                expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_high`
                );
                expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_mid`
                );
                expect(regionsElement[2].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_low`
                );
                expect(regionsElement[3].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}_high`
                );
                expect(regionsElement[4].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}_mid`
                );
                expect(regionsElement[5].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}_low`
                );
            });
            it("Hide region if region is missing for any value(high, mid, low) even if regions are same", () => {
                inputThird = {
                    key: `uid_3`,
                    label: {
                        high: {
                            display: "Data Label 3 High"
                        },
                        mid: {
                            display: "Data Label 3 Median"
                        },
                        low: {
                            display: "Data Label 3 Low"
                        }
                    },
                    values: valuesDefault
                };
                inputThird.regions = regionMissing;
                pairedResultThirdContent = new PairedResult(inputThird);
                graphDefault.loadContent(pairedResultThirdContent);
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(8);
                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("true");
                });
            });
        });
        describe("When multi-paired result with multi-regions not same", () => {
            let inputPrimary = null;
            let pairedResultPrimaryContent = null;
            let pairedResultSecondaryContent = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = multiRegionNotSame;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                inputSecondary.regions = multiRegionSameData;
                pairedResultSecondaryContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.loadContent(pairedResultSecondaryContent);
            });
            it("Not show region face-up", () => {
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(7);
                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("true");
                });
                expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_high`
                );
                expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_high`
                );
                expect(regionsElement[2].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_mid`
                );
                expect(regionsElement[3].getAttribute("aria-describedby")).toBe(
                    `region_${inputPrimary.key}_low`
                );
                expect(regionsElement[4].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}_high`
                );
                expect(regionsElement[5].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}_mid`
                );
                expect(regionsElement[6].getAttribute("aria-describedby")).toBe(
                    `region_${inputSecondary.key}_low`
                );
            });
        });
        describe("On legend item click", () => {
            let inputPrimary = null;
            let pairedResultPrimaryContent = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault);
                inputPrimary.regions = multiRegion;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
            });
            describe("When single-paired result", () => {
                it("Hides region on toggle", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        const regionElement = document.querySelector(
                            `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                        );
                        expect(regionElement.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
                it("Hides regions on toggle", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(legendItem, "click", () => {
                            const regionElements = document.querySelectorAll(
                                `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
    describe("Criticality", () => {
        let inputPrimary = null;
        let pairedResultPrimaryContent = null;
        let pairedResultSecondaryContent = null;
        describe("On load", () => {
            it("Does not add indicator if data point is not critical", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                pairedResultPrimaryContent = new PairedResult(
                    getInput(valuesMutated, false, false)
                );
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalOuterElement).toBeNull();
                expect(criticalInnerElement).toBeNull();
            });
            it("Does not add indicator if data point is critical false", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = false;
                valuesMutated[0].mid.isCritical = false;
                valuesMutated[0].low.isCritical = false;
                pairedResultPrimaryContent = new PairedResult(
                    getInput(valuesMutated, false, false)
                );
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalOuterElement).toBeNull();
                expect(criticalInnerElement).toBeNull();
            });
            it("Adds outer indicator - Red", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement).not.toBeNull();
                expect(criticalOuterElement.nodeName).toBe("svg");
                expect(criticalOuterElement.classList).toContain(
                    styles.pairedPoint
                );
                expect(criticalOuterElement.classList).toContain(
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(
                    criticalOuterElement.getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_high`);
            });
            it("Adds inner indicator - White", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalInnerElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement).not.toBeNull();
                expect(criticalInnerElement.nodeName).toBe("svg");
                expect(criticalInnerElement.classList).toContain(
                    styles.pairedPoint
                );
                expect(criticalInnerElement.classList).toContain(
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(
                    criticalInnerElement.getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_high`);
            });
            it("Adds inner and outer indicator for all the types", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElements = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.criticalityOuterPoint}`
                );
                const criticalInnerElements = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.criticalityInnerPoint}`
                );
                expect(
                    criticalOuterElements[0].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    criticalOuterElements[0].getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_high`);
                expect(
                    criticalOuterElements[1].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    criticalOuterElements[1].getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_mid`);
                expect(
                    criticalOuterElements[2].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    criticalOuterElements[2].getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_low`);
                expect(
                    criticalInnerElements[0].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    criticalInnerElements[0].getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_high`);
                expect(
                    criticalInnerElements[1].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    criticalInnerElements[1].getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_mid`);
                expect(
                    criticalInnerElements[2].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    criticalInnerElements[2].getAttribute("aria-describedby")
                ).toBe(`${inputPrimary.key}_low`);
            });
            it("Adds indicators inner and outer with same shape", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElementPath = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                ).firstChild.firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                ).firstChild.firstChild;
                expect(criticalOuterElementPath.getAttribute("d")).toBe(
                    SHAPES.TEAR_ALT.path.d
                );
                expect(criticalInnerElementPath.getAttribute("d")).toBe(
                    SHAPES.TEAR_ALT.path.d
                );
            });
            it("Adds indicators inner and outer with same shape for all pair types", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElementPath = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.criticalityOuterPoint} path`
                );
                const criticalInnerElementPath = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.criticalityInnerPoint} path`
                );
                expect(criticalOuterElementPath[0].getAttribute("d")).toBe(
                    SHAPES.TEAR_ALT.path.d
                );
                expect(criticalOuterElementPath[1].getAttribute("d")).toBe(
                    SHAPES.RHOMBUS.path.d
                );
                expect(criticalOuterElementPath[2].getAttribute("d")).toBe(
                    SHAPES.TEAR_DROP.path.d
                );
                expect(criticalInnerElementPath[0].getAttribute("d")).toBe(
                    SHAPES.TEAR_ALT.path.d
                );
                expect(criticalInnerElementPath[1].getAttribute("d")).toBe(
                    SHAPES.RHOMBUS.path.d
                );
                expect(criticalInnerElementPath[2].getAttribute("d")).toBe(
                    SHAPES.TEAR_DROP.path.d
                );
            });
            it("Translates properly", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElementPath = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                ).firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    pairedResultGraphContainer,
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
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const criticalOuterElementPath = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                ).firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                ).firstChild;
                expect(getTransformScale(criticalOuterElementPath)[0]).toBe(
                    round2Decimals(
                        getShapeForTarget(inputPrimary).high.options.scale
                    )
                );
                expect(getTransformScale(criticalInnerElementPath)[0]).toBe(
                    round2Decimals(
                        getShapeForTarget(inputPrimary).high.options.scale
                    )
                );
            });
            it("Shows even on multiple data-set", () => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                pairedResultSecondaryContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(pairedResultSecondaryContent);
                const criticalOuterElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalOuterElement).not.toBeNull();
                expect(criticalOuterElement.nodeName).toBe("svg");
                expect(criticalOuterElement.classList).toContain(
                    styles.pairedPoint
                );
                expect(criticalOuterElement.classList).toContain(
                    styles.criticalityOuterPoint
                );
                expect(criticalInnerElement).not.toBeNull();
                expect(criticalInnerElement.nodeName).toBe("svg");
                expect(criticalInnerElement.classList).toContain(
                    styles.pairedPoint
                );
                expect(criticalInnerElement.classList).toContain(
                    styles.criticalityInnerPoint
                );
            });
            it("selects data point when clicked on outer indicator", (done) => {
                const criticalOuterPointSpy = sinon.spy();
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputPrimary.onClick = criticalOuterPointSpy;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const point = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                );
                triggerEvent(point, "click", () => {
                    expect(criticalOuterPointSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("emits correct parameters when clicked on outer indicator", (done) => {
                let args = {};
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[1].high.isCritical = true;
                valuesMutated[1].mid.isCritical = true;
                valuesMutated[1].low.isCritical = true;
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
                graphDefault.loadContent(new PairedResult(inputPrimary));
                triggerEvent(
                    pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityOuterPoint}`
                    ),
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.high.x).toBe(
                            inputPrimary.values[1].high.x
                        );
                        expect(args.val.high.y).toBe(
                            inputPrimary.values[1].high.y
                        );
                        expect(args.val.low.x).toBe(
                            inputPrimary.values[1].low.x
                        );
                        expect(args.val.low.y).toBe(
                            inputPrimary.values[1].low.y
                        );
                        expect(args.val.mid.x).toBe(
                            inputPrimary.values[1].mid.x
                        );
                        expect(args.val.mid.y).toBe(
                            inputPrimary.values[1].mid.y
                        );
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            it("selects data point when clicked on inner indicator", (done) => {
                const criticalInnerPointSpy = sinon.spy();
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputPrimary.onClick = criticalInnerPointSpy;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const point = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                );
                triggerEvent(point, "click", () => {
                    expect(criticalInnerPointSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("emits correct parameters when clicked on inner indicator", (done) => {
                let args = {};
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[1].high.isCritical = true;
                valuesMutated[1].mid.isCritical = true;
                valuesMutated[1].low.isCritical = true;
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
                graphDefault.loadContent(new PairedResult(inputPrimary));
                triggerEvent(
                    pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityInnerPoint}`
                    ),
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.high.x).toBe(
                            inputPrimary.values[1].high.x
                        );
                        expect(args.val.high.y).toBe(
                            inputPrimary.values[1].high.y
                        );
                        expect(args.val.low.x).toBe(
                            inputPrimary.values[1].low.x
                        );
                        expect(args.val.low.y).toBe(
                            inputPrimary.values[1].low.y
                        );
                        expect(args.val.mid.x).toBe(
                            inputPrimary.values[1].mid.x
                        );
                        expect(args.val.mid.y).toBe(
                            inputPrimary.values[1].mid.y
                        );
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
        });
        describe("On unload", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.unloadContent(pairedResultPrimaryContent);
            });
            it("Removes outer indicator", () => {
                const criticalOuterElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityOuterPoint
                );
                expect(criticalOuterElement).toBeNull();
            });
            it("Removes inner indicator", () => {
                const criticalInnerElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.criticalityInnerPoint
                );
                expect(criticalInnerElement).toBeNull();
            });
        });
        describe("On legend item hover", () => {
            describe("On single data-set", () => {
                beforeEach(() => {
                    const valuesMutated = utils.deepClone(valuesDefault);
                    valuesMutated[0].high.isCritical = true;
                    valuesMutated[0].mid.isCritical = true;
                    valuesMutated[0].low.isCritical = true;
                    inputPrimary = getInput(valuesMutated, false, false);
                    pairedResultPrimaryContent = new PairedResult(inputPrimary);
                    graphDefault.loadContent(pairedResultPrimaryContent);
                });
                it("Highlights the indicators on mouse-enter", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        expect(criticalOuterElement.classList).toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
                it("Removes highlights for indicators on mouse-leave", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = pairedResultGraphContainer.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            const criticalInnerElement = pairedResultGraphContainer.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
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
                it("Highlights the indicators on mouse-enter", (done) => {
                    const legendItem = pairedResultGraphContainer.querySelectorAll(
                        `.${styles.legendItem}`
                    )[1];
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                        );
                        expect(criticalOuterElement.classList).toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
                it("Removes highlights for indicators on mouse-leave", (done) => {
                    const legendItem = pairedResultGraphContainer.querySelectorAll(
                        `.${styles.legendItem}`
                    )[1];
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = pairedResultGraphContainer.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                            );
                            const criticalInnerElement = pairedResultGraphContainer.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_mid"]`
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
                it("Highlights the indicators on mouse-enter", (done) => {
                    const legendItem = pairedResultGraphContainer.querySelectorAll(
                        `.${styles.legendItem}`
                    )[2];
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_low"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_low"]`
                        );
                        expect(criticalOuterElement.classList).toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
                it("Removes highlights for indicators on mouse-leave", (done) => {
                    const legendItem = pairedResultGraphContainer.querySelectorAll(
                        `.${styles.legendItem}`
                    )[2];
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = pairedResultGraphContainer.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_low"]`
                            );
                            const criticalInnerElement = pairedResultGraphContainer.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_low"]`
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
            });
            describe("On multiple data-set", () => {
                beforeEach(() => {
                    const valuesMutated = utils.deepClone(valuesDefault);
                    const valuesMutatedAlt = utils.deepClone(valuesDefault);
                    valuesMutated[0].high.isCritical = true;
                    valuesMutated[0].mid.isCritical = true;
                    valuesMutated[0].low.isCritical = true;
                    valuesMutatedAlt[1].high.isCritical = true;
                    inputPrimary = getInput(valuesMutated);
                    inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                    pairedResultPrimaryContent = new PairedResult(inputPrimary);
                    pairedResultSecondaryContent = new PairedResult(
                        inputSecondary
                    );
                    graphDefault.loadContent(pairedResultPrimaryContent);
                    graphDefault.loadContent(pairedResultSecondaryContent);
                });
                it("Highlights only the current indicator", (done) => {
                    const legendItem = fetchElementByClass(
                        pairedResultGraphContainer,
                        styles.legendItem
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
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
                    const legendItem = pairedResultGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_high"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}_high"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}_high"]`
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
                    const legendItem = pairedResultGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
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
                    const legendItem = pairedResultGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_high"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            const criticalOuterElementAlt = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}_high"]`
                            );
                            const criticalInnerElementAlt = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}_high"]`
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
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
            });
            describe("On single data-set", () => {
                it("Hides indicators on toggle", (done) => {
                    const legendItem = pairedResultGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
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
                    const legendItem = pairedResultGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(legendItem, "click", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            expect(
                                criticalOuterElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                criticalInnerElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            done();
                        });
                    });
                });
                it("Shows indicators on re-toggle low", (done) => {
                    const legendItem = pairedResultGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_low"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(legendItem, "click", () => {
                            let criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_low"]`
                            );
                            let criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_low"]`
                            );
                            expect(
                                criticalOuterElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                criticalInnerElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                            );
                            expect(
                                criticalOuterElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                criticalInnerElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            done();
                        });
                    });
                });
            });
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
