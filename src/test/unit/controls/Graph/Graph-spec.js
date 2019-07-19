"use strict";
import d3 from "d3";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import {
    getXAxisWidth,
    getYAxisHeight
} from "../../../../main/js/helpers/axis";
import constants, {
    AXES_ORIENTATION,
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../../main/js/helpers/legend";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import LOCALE from "../../../../main/js/locale/index";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent,
    delay
} from "../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    dimension,
    fetchElementByClass,
    getAxes,
    getData,
    valuesDefault,
    valuesTimeSeries,
    axisDefaultwithDateline,
    axisTimeserieswithDateline,
    datelineJSON,
    axisTimeSeriesWithAxisTop
} from "./helpers";

describe("Graph", () => {
    let graph = null;
    let graphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        graphContainer = document.createElement("div");
        graphContainer.id = "testGraph_carbon";
        graphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        graphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(graphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("Throws error on undefined input", () => {
            expect(() => {
                graph = new Graph();
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Initializes properly", () => {
            graph = new Graph(getAxes(axisDefault));
            expect(graph.graphContainer).not.toBeNull();
            expect(graph.config).not.toBeNull();
            expect(graph.axis).not.toBeNull();
            expect(graph.scale).not.toBeNull();
            expect(graph.legendSVG).not.toBeNull();
            expect(graph.svg).not.toBeNull();
            expect(graph.content).toEqual([]);
            expect(graph.contentTargets).toEqual([]);
            expect(graph.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("When input is loaded", () => {
        it("Throws error if no bind is present", () => {
            expect(() => {
                const input = getAxes(axisDefault);
                input.bindTo = "";
                new Graph(input);
            }).toThrowError(errors.THROW_MSG_NO_BIND);
        });
        describe("Axis - throws error", () => {
            it("If no axis is present", () => {
                expect(() => {
                    new Graph(getAxes({}));
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("If no x axis is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: {},
                            y: axisDefault.y
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("If no y axis is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: {}
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("If x axis type is different than allowed", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: {
                                type: "DIFFERENT_TYPE",
                                label: "Some X Label",
                                lowerLimit: "2016-01-01T12:00:00Z",
                                upperLimit: "2017-01-01T12:00:00Z"
                            },
                            y: axisDefault.y
                        })
                    );
                }).toThrowError(errors.THROW_MSG_INVALID_TYPE);
            });
            it("If x axis lowerLimit is not present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: {
                                label: "Some X Label",
                                upperLimit: 20
                            },
                            y: axisDefault.y
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("If x axis upperLimit is not present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: {
                                label: "Some X Label",
                                lowerLimit: 0
                            },
                            y: axisDefault.y
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("If y axis lowerLimit is not present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: {
                                label: "Some Y Label",
                                upperLimit: 20
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("If y axis upperLimit is not present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: {
                                label: "Some Y Label",
                                lowerLimit: 0
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("If y axis label is not present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: {
                                lowerLimit: 0,
                                upperLimit: 20
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
            });
            it("If y2 axis is enabled but not lowerLimit is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: axisDefault.y,
                            y2: {
                                show: true,
                                label: "Some Y2 label"
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("If y2 axis is enabled but not upperLimit is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: axisDefault.y,
                            y2: {
                                show: true,
                                label: "Some Y2 label",
                                lowerLimit: 20
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("If y2 axis is enabled but not label is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: axisDefault.y,
                            y2: {
                                show: true,
                                lowerLimit: 20,
                                upperLimit: 200
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
            });
        });
        it("Throws error on empty input", () => {
            expect(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent({});
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("Throws error on null input", () => {
            expect(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent(null);
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("Processes the default input without any error", () => {
            expect(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent(new Line(getData(valuesDefault)));
            }).not.toThrow();
        });
        it("Processes the timeseries input without any error", () => {
            expect(() => {
                graph = new Graph(getAxes(axisTimeSeries));
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).not.toThrow();
        });
        it("Loads the content correctly", () => {
            const primaryContent = new Line(getData(valuesDefault));
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            expect(graph.content).toEqual([primaryContent]);
            expect(graph.contentTargets).toEqual([primaryContent.config]);
            expect(graph.content.length).toBe(1);
            expect(graph.contentTargets.length).toBe(1);
        });
        it("Changes to new object has no impact on base object", () => {
            const data = getData(valuesDefault);
            const input = getAxes(axisDefault);
            const primaryContent = new Line(data);
            graph = new Graph(input);
            graph.loadContent(primaryContent);
            input.bindTo = "";
            input.axis = {};
            input.data = [];
            const cfg = graph.config;
            expect(input.bindTo).toBe("");
            expect(input.axis).toEqual({});
            expect(input.data).toEqual([]);
            expect(cfg.bindTo).toBe("#testGraph_carbon");
            expect(cfg.axis.x.label).toBe(axisDefault.x.label);
            expect(cfg.axis.x.lowerLimit).toBe(axisDefault.x.lowerLimit);
            expect(cfg.axis.x.upperLimit).toBe(axisDefault.x.upperLimit);
            expect(cfg.axis.y.label).toBe(axisDefault.y.label);
            expect(cfg.axis.y.lowerLimit).toBe(axisDefault.y.lowerLimit);
            expect(cfg.axis.y.upperLimit).toBe(axisDefault.y.upperLimit);
        });
        it("Processes the default input correctly", () => {
            const input = getAxes(axisDefault);
            graph = new Graph(input);
            expect(graph.config.bindTo).toEqual(input.bindTo);
            expect(graph.config.axis).not.toBeNull();
            expect(graph.config.locale).not.toBeNull();
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(graph.config.showLabel).toEqual(true);
            expect(graph.config.showLegend).toEqual(true);
            expect(graph.config.showShapes).toEqual(true);
            expect(graph.config.showHGrid).toEqual(true);
            expect(graph.config.showVGrid).toEqual(true);
            expect(graph.config.dimension).toEqual({});
            expect(graph.config.axis.x.type).toEqual(AXIS_TYPE.DEFAULT);
            expect(graph.config.axis.x.ticks).toEqual({});
            expect(graph.config.axis.x.rangeRounding).toEqual(true);
            expect(graph.config.axis.y.ticks).toEqual({});
            expect(graph.config.axis.y.rangeRounding).toEqual(true);
            expect(graph.config.axis.x.show).toEqual(true);
            expect(graph.config.axis.y.show).toEqual(true);
            expect(graph.config.axis.x.orientation).toEqual(
                AXES_ORIENTATION.X.BOTTOM
            );
            expect(graph.config.axisPadding.y).toEqual(true);
            expect(graph.config.axisInfoRowLabelHeight).toEqual(0);
        });
        it("Processes the input when y axis padDomain is set to false", () => {
            const _axisDefault = utils.deepClone(axisDefault);
            _axisDefault.y.padDomain = false;
            graph = new Graph(getAxes(_axisDefault));
            expect(graph.config.axisPadding.y).toEqual(false);
        });
        it("Processes the input when y axis padDomain is set to true", () => {
            const _axisDefault = utils.deepClone(axisDefault);
            _axisDefault.y.padDomain = true;
            graph = new Graph(getAxes(_axisDefault));
            expect(graph.config.axisPadding.y).toEqual(true);
        });
        it("Processes the input when y axis padDomain is set to undefined", () => {
            const _axisDefault = utils.deepClone(axisDefault);
            _axisDefault.y.padDomain = undefined;
            graph = new Graph(getAxes(_axisDefault));
            expect(graph.config.axisPadding.y).toEqual(true);
        });
        it("Processes the input when y2 axis padDomain is set to true", () => {
            const input = getAxes({
                x: axisDefault.x,
                y: axisDefault.y,
                y2: {
                    show: true,
                    label: "Some Y2 label",
                    lowerLimit: 0,
                    upperLimit: 200,
                    padDomain: true
                }
            });
            graph = new Graph(input);
            expect(graph.config.axisPadding.y2).toEqual(true);
        });
        it("Processes the input when y2 axis padDomain is set to false", () => {
            const input = getAxes({
                x: axisDefault.x,
                y: axisDefault.y,
                y2: {
                    show: true,
                    label: "Some Y2 label",
                    lowerLimit: 0,
                    upperLimit: 200,
                    padDomain: false
                }
            });
            graph = new Graph(input);
            expect(graph.config.axisPadding.y2).toEqual(false);
        });
        it("Processes the input when y2 axis padDomain is set to undefined", () => {
            const input = getAxes({
                x: axisDefault.x,
                y: axisDefault.y,
                y2: {
                    show: true,
                    label: "Some Y2 label",
                    lowerLimit: 0,
                    upperLimit: 200,
                    padDomain: undefined
                }
            });
            graph = new Graph(input);
            expect(graph.config.axisPadding.y2).toEqual(true);
        });
        it("Processes the timeseries input correctly", () => {
            const input = getAxes(axisTimeSeries);
            graph = new Graph(input);
            expect(graph.config.bindTo).toEqual(input.bindTo);
            expect(graph.config.axis).not.toBeNull();
            expect(graph.config.locale).not.toBeNull();
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(graph.config.showLabel).toEqual(true);
            expect(graph.config.showLegend).toEqual(true);
            expect(graph.config.showShapes).toEqual(true);
            expect(graph.config.showHGrid).toEqual(true);
            expect(graph.config.showVGrid).toEqual(true);
            expect(graph.config.dimension).toEqual({});
            expect(graph.config.axis.x.type).toEqual(AXIS_TYPE.TIME_SERIES);
            expect(graph.config.axis.x.rangeRounding).toEqual(true);
            expect(graph.config.axis.x.ticks).toEqual({});
            expect(graph.config.axis.y.ticks).toEqual({});
            expect(graph.config.axis.y.rangeRounding).toEqual(true);
            expect(graph.config.axis.x.show).toEqual(true);
            expect(graph.config.axis.y.show).toEqual(true);
            expect(graph.config.axis.x.orientation).toEqual(
                AXES_ORIENTATION.X.BOTTOM
            );
            expect(graph.config.axisPadding.y).toEqual(true);
            expect(graph.config.axisInfoRowLabelHeight).toEqual(0);
        });
        it("process bindLegendTo correctly", () => {
            const input = utils.deepClone(getAxes(axisDefault));
            input.bindLegendTo = "#lineLegendContainer";
            graph = new Graph(input);
            expect(graph.config.bindLegendTo).toEqual(input.bindLegendTo);
        });
    });
    describe("When dateline is provided", () => {
        describe("Validates input props", () => {
            it("Process the default input with dateline throw error", () => {
                expect(() => {
                    graph = new Graph(axisDefaultwithDateline);
                    graph.loadContent(new Line(getData(valuesDefault)));
                }).toThrowError(errors.THROW_MSG_INVALID_TYPE);
            });
            it("Process the timeseries input with dateline without any error", () => {
                expect(() => {
                    graph = new Graph(axisTimeserieswithDateline);
                    graph.loadContent(new Line(getData(valuesTimeSeries)));
                }).not.toThrow();
            });
            it("Throw error on empty dateline", () => {
                expect(() => {
                    const input = utils.deepClone(getAxes(axisTimeSeries));
                    input.dateline = [{}];
                    graph = new Graph(input);
                    graph.loadContent(new Line(getData(valuesTimeSeries)));
                }).toThrowError(errors.THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED);
            });
            it("Throw error on dateline without value", () => {
                expect(() => {
                    const input = utils.deepClone(getAxes(axisTimeSeries));
                    input.dateline = [
                        {
                            showDatelineIndicator: true,
                            label: {
                                display: "Release A"
                            },
                            color: COLORS.GREEN,
                            shape: SHAPES.SQUARE
                        }
                    ];
                    graph = new Graph(input);
                    graph.loadContent(new Line(getData(valuesTimeSeries)));
                }).toThrowError(errors.THROW_MSG_DATELINE_NOT_PROVIDED);
            });
            it("Throw error on dateline with value not date", () => {
                expect(() => {
                    const input = utils.deepClone(getAxes(axisTimeSeries));
                    input.dateline = [
                        {
                            showDatelineIndicator: true,
                            label: {
                                display: "Release A"
                            },
                            color: COLORS.GREEN,
                            shape: SHAPES.SQUARE,
                            value: "notDate"
                        }
                    ];
                    graph = new Graph(input);
                    graph.loadContent(new Line(getData(valuesTimeSeries)));
                }).toThrowError(errors.THROW_MSG_DATELINE_TYPE_NOT_VALID);
            });
            it("Throw error on dateline without color", () => {
                expect(() => {
                    const input = utils.deepClone(getAxes(axisTimeSeries));
                    input.dateline = [
                        {
                            showDatelineIndicator: true,
                            label: {
                                display: "Release A"
                            },
                            shape: SHAPES.SQUARE,
                            value: new Date(2016, 5, 1).toISOString()
                        }
                    ];
                    graph = new Graph(input);
                    graph.loadContent(new Line(getData(valuesTimeSeries)));
                }).toThrowError(errors.THROW_MSG_DATELINE_COLOR_NOT_PROVIDED);
            });
            it("Throw error on dateline without shape", () => {
                expect(() => {
                    const input = utils.deepClone(getAxes(axisTimeSeries));
                    input.dateline = [
                        {
                            showDatelineIndicator: true,
                            label: {
                                display: "Release A"
                            },
                            color: COLORS.GREEN,
                            value: new Date(2016, 5, 1).toISOString()
                        }
                    ];
                    graph = new Graph(input);
                    graph.loadContent(new Line(getData(valuesTimeSeries)));
                }).toThrowError(errors.THROW_MSG_DATELINE_SHAPE_NOT_PROVIDED);
            });
        });
        it("Process dateline correctly", () => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = datelineJSON;
            graph = new Graph(input);
            expect(graph.config.dateline).toEqual(input.dateline);
        });
        it("Process dateline correctly with x-axis at top", () => {
            const input = utils.deepClone(getAxes(axisTimeSeriesWithAxisTop));
            input.dateline = datelineJSON;
            graph = new Graph(input);
            const datelines = document.querySelectorAll(`.${styles.dateline}`);
            expect(datelines.length).toBe(1);
            expect(datelines[0].getAttribute("pointer-events")).toBe("auto");
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelinePointPath = datelinePoint.firstChild;
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("false");
            expect(datelinePoint.getAttribute("pointer-events")).toBe("auto");
            expect(datelinePointPath.getAttribute("d")).not.toBeNull();
            expect(datelinePointPath.getAttribute("d")).toBe(
                datelineJSON[0].shape.path.d
            );
        });
        it("Creates multiple datelines correctly", () => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREY,
                    shape: SHAPES.SQUARE,
                    value: new Date(2016, 5, 1).toISOString()
                },
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release B"
                    },
                    color: COLORS.ORANGE,
                    shape: SHAPES.SQUARE,
                    value: new Date(2016, 8, 1).toISOString()
                }
            ];
            graph = new Graph(input);
            const datelines = document.querySelectorAll(`.${styles.dateline}`);
            expect(datelines.length).toBe(2);
            expect(datelines[0].getAttribute("pointer-events")).toBe("auto");
            expect(datelines[1].getAttribute("pointer-events")).toBe("auto");
        });
        it("Creates dateline point correctly", () => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = utils.deepClone(datelineJSON);
            graph = new Graph(input);
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelinePointPath = datelinePoint.firstChild;
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("false");
            expect(datelinePoint.getAttribute("pointer-events")).toBe("auto");
            expect(datelinePointPath.getAttribute("d")).not.toBeNull();
            expect(datelinePointPath.getAttribute("d")).toBe(
                datelineJSON[0].shape.path.d
            );
        });
        it("Hides dateline point on consumer disable", () => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = utils.deepClone(datelineJSON);
            input.dateline[0].showDatelineIndicator = false;
            input.dateline[0].shape = "";
            graph = new Graph(input);
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(datelineGroupElement.childNodes.length).toBe(2);
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
            expect(datelinePoint.getAttribute("pointer-events")).toBe("auto");
        });
        it("Hides dateline point on consumer disable when shape available", () => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = utils.deepClone(datelineJSON);
            input.dateline[0].showDatelineIndicator = false;
            input.dateline[0].shape = SHAPES.CIRCLE;
            graph = new Graph(input);
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(datelineGroupElement.childNodes.length).toBe(2);
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
        });
        describe("When clicked on dateline", () => {
            it("Does not do anything if no onClick callback is provided", (done) => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = utils.deepClone(datelineJSON);
                graph = new Graph(input);
                const datelinePointElement = fetchElementByClass(
                    styles.datelinePoint
                );
                triggerEvent(datelinePointElement, "click", () => {
                    expect(
                        datelinePointElement.getAttribute("aria-disabled")
                    ).toBe("true");
                    done();
                });
            });
            it("Calls onClick callback", (done) => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                const onClickFunctionSpy = sinon.spy();
                input.dateline = utils.deepClone(datelineJSON);
                input.dateline[0].onClick = onClickFunctionSpy;
                graph = new Graph(input);
                const datelinePointElement = fetchElementByClass(
                    styles.datelinePoint
                );
                triggerEvent(datelinePointElement, "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                    expect(
                        fetchElementByClass(styles.datelineGroup).getAttribute(
                            "aria-selected"
                        )
                    ).toBe("true");
                    expect(
                        datelinePointElement.getAttribute("aria-disabled")
                    ).toBe("false");
                    done();
                });
            });
            it("Removes selection when dateline is clicked again", (done) => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                const onClickFunctionSpy = sinon.spy();
                input.dateline = utils.deepClone(datelineJSON);
                input.dateline[0].onClick = onClickFunctionSpy;
                graph = new Graph(input);
                const point = fetchElementByClass(styles.datelinePoint);
                triggerEvent(point, "click", () => {
                    triggerEvent(point, "click", () => {
                        expect(
                            fetchElementByClass(
                                styles.datelineGroup
                            ).getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    });
                });
            });
            it("Removes dateline selection when parameter callback is called", (done) => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = utils.deepClone(datelineJSON);
                input.dateline[0].onClick = (clearSelectionCallback) =>
                    clearSelectionCallback();
                graph = new Graph(input);
                const point = fetchElementByClass(styles.datelinePoint);
                triggerEvent(point, "click", () => {
                    expect(
                        fetchElementByClass(styles.datelineGroup).getAttribute(
                            "aria-selected"
                        )
                    ).toBe("false");
                    done();
                });
            });
        });
        describe("When dateline clickPassThrough is provided", () => {
            describe("When clickPassThrough property is provided - true", () => {
                beforeEach(() => {
                    const input = Object.assign(getAxes(axisTimeSeries), {
                        clickPassThrough: {
                            datelines: true
                        }
                    });
                    input.dateline = utils.deepClone(datelineJSON);
                    graph = new Graph(input);
                });
                it("Set pointer-events correctly", () => {
                    const dateline = fetchElementByClass(styles.dateline);
                    expect(dateline.getAttribute("pointer-events")).toBe(
                        "none"
                    );
                    const datelinePoint = fetchElementByClass(
                        styles.datelinePoint
                    );
                    expect(datelinePoint.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
            describe("When clickPassThrough property is provided - false", () => {
                beforeEach(() => {
                    const input = Object.assign(getAxes(axisTimeSeries), {
                        clickPassThrough: {
                            datelines: false
                        }
                    });
                    input.dateline = utils.deepClone(datelineJSON);
                    graph = new Graph(input);
                });
                it("Set pointer-events correctly", () => {
                    const dateline = fetchElementByClass(styles.dateline);
                    expect(dateline.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                    const datelinePoint = fetchElementByClass(
                        styles.datelinePoint
                    );
                    expect(datelinePoint.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
        });
        describe("Check the translation of Dateline correctly", () => {
            beforeEach(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = datelineJSON;
                graph = new Graph(input);
            });
            it("DatelineGroup translates properly", (done) => {
                const datelineGroup = fetchElementByClass(styles.datelineGroup);
                delay(() => {
                    const translate = getSVGAnimatedTransformList(
                        datelineGroup.getAttribute("transform")
                    ).translate;
                    expect(toNumber(translate[0], 10)).toBeCloserTo(73);
                    expect(toNumber(translate[1], 10)).toBeCloserTo(5);
                    done();
                });
            });
            it("Transform dateline Point correctly", (done) => {
                const datelinePoint = fetchElementByClass(styles.datelinePoint);
                delay(() => {
                    const datelinePointPath = datelinePoint.firstChild;
                    const translate = getSVGAnimatedTransformList(
                        datelinePointPath.getAttribute("transform")
                    ).translate;
                    expect(toNumber(translate[0], 10)).toBeCloserTo(541);
                    expect(toNumber(translate[1], 10)).toBeCloserTo(0);
                    done();
                });
            });
            it("Check Dateline coordinate attributes", (done) => {
                delay(() => {
                    const datelineElement = fetchElementByClass(
                        styles.dateline
                    );
                    expect(
                        toNumber(datelineElement.getAttribute("x1"), 10)
                    ).toBeCloserTo(541);
                    expect(
                        toNumber(datelineElement.getAttribute("y1"), 10)
                    ).toBeCloserTo(0);
                    expect(
                        toNumber(datelineElement.getAttribute("x2"), 10)
                    ).toBeCloserTo(541);
                    expect(
                        toNumber(datelineElement.getAttribute("y2"), 10)
                    ).toBeCloserTo(235);
                    done();
                });
            });
        });
    });
    describe("When beforeInit is called", () => {
        describe("With normal type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisDefault));
            });
            it("Sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("Gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.min
                ).toBeUndefined();
            });
            it("Gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.max
                ).toBeUndefined();
            });
            it("Does not extends Y Axis domain lower limit", () => {
                expect(
                    graph.config.axis[constants.Y_AXIS].domain.lowerLimit
                ).toEqual(0);
            });
            it("Does not extends Y Axis domain upper limit", () => {
                expect(
                    graph.config.axis[constants.Y_AXIS].domain.upperLimit
                ).toEqual(20);
            });
        });
        describe("With timeseries type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisTimeSeries));
            });
            it("Sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("Gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.min
                ).toBeUndefined();
            });
            it("Gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.max
                ).toBeUndefined();
            });
        });
        describe("With normal type values and input loaded", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent(new Line(getData(valuesDefault)));
            });
            it("Sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("Gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.min).toBe(
                    4
                );
            });
            it("Gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.max).toBe(
                    35
                );
            });
            it("Extends Y Axis domain, if lower bound is less", () => {
                expect(
                    toNumber(
                        graph.config.axis[constants.Y_AXIS].domain.lowerLimit
                    )
                ).toBeLessThan(0);
            });
            it("Extends Y Axis domain, if upper bound is less", () => {
                expect(
                    toNumber(
                        graph.config.axis[constants.Y_AXIS].domain.upperLimit
                    )
                ).toBeGreaterThan(20);
            });
        });
        describe("With timeseries type values and input loaded", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisTimeSeries));
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            });
            it("Sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("Gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.min).toBe(
                    1
                );
            });
            it("Gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.max).toBe(
                    100
                );
            });
        });
    });
    describe("When init is called", () => {
        describe("With normal type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisDefault));
            });
            it("Sets canvas width", () => {
                expect(graph.config.canvasWidth).not.toBe(0);
                expect(graph.config.canvasWidth).toBe(1024);
            });
            it("Sets canvas height", () => {
                expect(graph.config.canvasHeight).not.toBe(0);
                expect(graph.config.canvasHeight).toBeGreaterThan(0);
            });
            it("Sets the height correctly", () => {
                expect(graph.config.height).toBe(235);
            });
            it("Sets X axis position correctly", () => {
                const axisXElement = fetchElementByClass(styles.axisX);
                const translate = getSVGAnimatedTransformList(
                    axisXElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloserTo(240);
            });
            it("Returns the consumer set height if dimension is provided", () => {
                graph = new Graph(
                    Object.assign(
                        { dimension },
                        getAxes(axisDefault),
                        dimension
                    )
                );
                expect(graph.config.height).toBe(dimension.height);
            });
            it("Calculates X axis height", () => {
                expect(graph.config.axisSizes.x).not.toBe(0);
                expect(graph.config.axisSizes.x).not.toBeNull();
                expect(graph.config.axisSizes.x).toBeGreaterThan(0);
            });
            it("Calculates Y Axis width", () => {
                expect(graph.config.axisSizes.y).not.toBe(0);
                expect(graph.config.axisSizes.y).not.toBeNull();
                expect(graph.config.axisSizes.y).toBeGreaterThan(0);
            });
            it("Calculates X axis label height", () => {
                expect(graph.config.axisLabelHeights.x).not.toBe(0);
                expect(graph.config.axisLabelHeights.x).not.toBeNull();
                expect(graph.config.axisLabelHeights.x).toBeGreaterThan(0);
            });
            it("Calculates Y axis label width", () => {
                expect(graph.config.axisLabelWidths.y).not.toBe(0);
                expect(graph.config.axisLabelWidths.y).not.toBeNull();
                expect(graph.config.axisLabelWidths.y).toBeGreaterThan(0);
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(graph.scale.x).not.toBeNull();
                expect(graph.scale.x).toEqual(jasmine.any(Function));
                expect(graph.scale.x.domain()).toEqual([
                    axisDefault.x.lowerLimit,
                    axisDefault.x.upperLimit
                ]);
            });
            it("Calculates Y axis d3 scale using domain and range", () => {
                expect(graph.scale.y).not.toBeNull();
                expect(graph.scale.y).toEqual(jasmine.any(Function));
                expect(graph.scale.y.domain()).toEqual([
                    axisDefault.y.lowerLimit,
                    axisDefault.y.upperLimit
                ]);
            });
            /**
             * CH01312019.01 - Verify the consumer will have the option to disable axis range rounding for the X axis
             * CH01312019.01 - Verify the consumer will have the option to disable axis range rounding for the Y axis
             * CH01312019.01 - Verify the consumer will have the option to disable axis range rounding for the second Y axis (Y2)
             */
            describe("When domains are not extended using d3.nice", () => {
                beforeEach(() => {
                    const config = getAxes(axisDefault);
                    config.axis.x.rangeRounding = false;
                    config.axis.y.rangeRounding = false;
                    graph = new Graph(config);
                });
                it("Calculates X axis d3 scale using domain and range", () => {
                    expect(graph.config.axis.x.rangeRounding).toEqual(false);
                    expect(graph.scale.x).not.toBeNull();
                    expect(graph.scale.x).toEqual(jasmine.any(Function));
                    expect(graph.scale.x.domain()).toEqual([
                        axisDefault.x.lowerLimit,
                        axisDefault.x.upperLimit
                    ]);
                });
                it("Calculates Y axis d3 scale using domain and range", () => {
                    expect(graph.config.axis.y.rangeRounding).toEqual(false);
                    expect(graph.scale.y).not.toBeNull();
                    expect(graph.scale.y).toEqual(jasmine.any(Function));
                    expect(graph.scale.y.domain()).toEqual([
                        axisDefault.y.lowerLimit,
                        axisDefault.y.upperLimit
                    ]);
                });
                it("Calculates Y2 axis d3 scale using domain and range", () => {
                    graph.destroy();
                    const config = getAxes(axisDefault);
                    config.axis.y2 = {
                        show: true,
                        label: "Some Y2 label",
                        lowerLimit: 0,
                        upperLimit: 200,
                        rangeRounding: false
                    };
                    graph = new Graph(config);
                    expect(graph.config.axis.y2.rangeRounding).toEqual(false);
                    expect(graph.scale.y2).not.toBeNull();
                    expect(graph.scale.y2).toEqual(jasmine.any(Function));
                    expect(graph.scale.y2.domain()).toEqual([0, 200]);
                });
            });
        });
        describe("With timeseries type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisTimeSeries));
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(graph.scale.x).not.toBeNull();
                expect(graph.scale.x).toEqual(jasmine.any(Function));
                expect(graph.scale.x.domain()[0].toISOString()).not.toEqual(
                    axisTimeSeries.x.lowerLimit
                );
                expect(graph.scale.x.domain()[1].toISOString()).not.toEqual(
                    axisTimeSeries.y.lowerLimit
                );
            });
            it("Calculates Y axis d3 scale using domain and range", () => {
                expect(graph.scale.y).not.toBeNull();
                expect(graph.scale.y).toEqual(jasmine.any(Function));
                expect(graph.scale.y.domain()).toEqual([0, 20]);
            });
            describe("When domains are not extended using d3.nice", () => {
                beforeEach(() => {
                    const timeSeriesConfig = getAxes(axisTimeSeries);
                    timeSeriesConfig.axis.x.rangeRounding = false;
                    timeSeriesConfig.axis.y.rangeRounding = false;
                    graph = new Graph(timeSeriesConfig);
                });
                it("Calculates X axis d3 scale using domain and range", () => {
                    expect(graph.config.axis.x.rangeRounding).toEqual(false);
                    expect(graph.scale.x).not.toBeNull();
                    expect(graph.scale.x).toEqual(jasmine.any(Function));
                    expect(graph.scale.x.domain()[0].toISOString()).toEqual(
                        axisTimeSeries.x.lowerLimit
                    );
                    expect(graph.scale.x.domain()[1].toISOString()).toEqual(
                        axisTimeSeries.x.upperLimit
                    );
                });
                it("Calculates Y axis d3 scale using domain and range", () => {
                    expect(graph.config.axis.y.rangeRounding).toEqual(false);
                    expect(graph.scale.y).not.toBeNull();
                    expect(graph.scale.y).toEqual(jasmine.any(Function));
                    expect(graph.scale.y.domain()).toEqual([0, 20]);
                });
            });
        });
    });
    describe("When generate is called", () => {
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
        });
        it("Creates the container svg", () => {
            const graphElem = document.querySelector(graph.config.bindTo);
            expect(graphElem).not.toBeNull();
            expect(graphElem.children[0].nodeName).toBe("DIV");
            expect(graphElem.children[0].getAttribute("class")).toBe(
                styles.container
            );
        });
        it("Creates graph elements in order", () => {
            const canvas = fetchElementByClass(styles.container).childNodes[0];
            const legend = fetchElementByClass(styles.container).childNodes[1];
            expect(canvas).not.toBeNull();
            expect(canvas.getAttribute("class")).toBe(styles.canvas);
            expect(canvas.nodeName).toBe("svg");
            expect(canvas.getAttribute("role")).toBe("img");
            expect(legend).not.toBeNull();
            expect(legend.getAttribute("class")).toBe(styles.legend);
            expect(legend.getAttribute("role")).toBe("list");
        });
        it("Creates canvas elements in order", () => {
            const defsElement = fetchElementByClass(styles.canvas)
                .childNodes[0];
            const regionElement = fetchElementByClass(styles.canvas)
                .childNodes[1];
            const gridElement = fetchElementByClass(styles.canvas)
                .childNodes[2];
            const contentContainer = fetchElementByClass(styles.canvas)
                .childNodes[3];
            const axisXElement = fetchElementByClass(styles.canvas)
                .childNodes[4];
            const axisYElement = fetchElementByClass(styles.canvas)
                .childNodes[5];
            const axisInfoRowElement = fetchElementByClass(styles.canvas)
                .childNodes[6];
            const axisXLabelElement = fetchElementByClass(styles.canvas)
                .childNodes[7];
            const axisYLabelElement = fetchElementByClass(styles.canvas)
                .childNodes[8];
            const axisReferenceLintElement = fetchElementByClass(styles.canvas)
                .childNodes[9];
            expect(defsElement).not.toBeNull();
            expect(regionElement).not.toBeNull();
            expect(gridElement).not.toBeNull();
            expect(axisXElement).not.toBeNull();
            expect(axisYElement).not.toBeNull();
            expect(contentContainer).not.toBeNull();
            expect(axisInfoRowElement).not.toBeNull();
            expect(axisXLabelElement).not.toBeNull();
            expect(axisYLabelElement).not.toBeNull();
            expect(axisReferenceLintElement).not.toBeNull();

            expect(defsElement.nodeName).toBe("defs");
            expect(regionElement.nodeName).toBe("g");
            expect(gridElement.nodeName).toBe("g");
            expect(axisXElement.nodeName).toBe("g");
            expect(axisYElement.nodeName).toBe("g");
            expect(contentContainer.nodeName).toBe("rect");
            expect(axisInfoRowElement.nodeName).toBe("g");
            expect(axisXLabelElement.nodeName).toBe("g");
            expect(axisYLabelElement.nodeName).toBe("g");
            expect(axisReferenceLintElement.nodeName).toBe("path");

            expect(regionElement.getAttribute("class")).toBe(
                styles.regionGroup
            );
            expect(gridElement.getAttribute("class")).toBe(styles.grid);
            expect(axisXElement.classList).toContain(styles.axis);
            expect(axisXElement.classList).toContain(styles.axisX);
            expect(axisYElement.classList).toContain(styles.axis);
            expect(axisYElement.classList).toContain(styles.axisY);
            expect(contentContainer.classList).toContain(
                styles.contentContainer
            );
            expect(axisInfoRowElement.getAttribute("class")).toContain(
                styles.axisInfoRow
            );
            expect(axisInfoRowElement.childElementCount).toBe(1);
            expect(axisXLabelElement.getAttribute("class")).toBe(
                styles.axisLabelX
            );
            expect(axisYLabelElement.getAttribute("class")).toBe(
                styles.axisLabelY
            );
            expect(
                axisReferenceLintElement.classList.contains(
                    styles.axisReferenceLine
                )
            ).toBeTruthy();
        });
        it("Creates the canvas svg", () => {
            const canvas = fetchElementByClass(styles.container).firstChild;
            expect(canvas).not.toBeNull();
            expect(canvas.nodeName).toBe("svg");
            expect(canvas.getAttribute("class")).toBe(styles.canvas);
            expect(toNumber(canvas.getAttribute("height"))).toBe(
                graph.config.canvasHeight
            );
            expect(toNumber(canvas.getAttribute("width"))).toBe(
                graph.config.canvasWidth - constants.BASE_CANVAS_WIDTH_PADDING
            );
        });
        it("Creates defs element with height and width", () => {
            const currentWidth =
                graph.config.axisSizes.y +
                graph.config.axisSizes.y2 +
                graph.config.axisLabelWidths.y +
                graph.config.axisLabelWidths.y2;
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.firstChild.nodeName).toBe("clipPath");
            expect(defsElement.firstChild.firstChild.nodeName).toBe("rect");
            expect(
                defsElement.firstChild.firstChild.getAttribute("width")
            ).toBe(`${1024 - currentWidth}`);
            expect(
                toNumber(
                    defsElement.firstChild.firstChild.getAttribute("height")
                )
            ).toBe(graph.config.height);
        });
        it("Creates region container", () => {
            const regionElement = fetchElementByClass(styles.canvas)
                .childNodes[1];
            expect(regionElement.nodeName).toBe("g");
            expect(regionElement.getAttribute("class")).toBe(
                styles.regionGroup
            );
        });
        describe("when custom padding is used", () => {
            it("Renders correctly", () => {
                graph.destroy();
                const graphConfig = getAxes(axisDefault);
                graphConfig.padding = {
                    top: 0,
                    left: -17,
                    right: 0,
                    bottom: -17
                };
                graph = new Graph(graphConfig);
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(
                    0
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                    graphConfig.padding.bottom
                );
                expect(
                    toNumber(
                        graph.config.axisSizes.y +
                            graph.config.axisLabelWidths.y,
                        10
                    )
                ).toBeCloserTo(0);
                expect(getYAxisHeight(graph.config)).toBeCloserTo(267);
            });
            it("Resizes correctly after rendering", (done) => {
                graph.destroy();
                const graphConfig = getAxes(axisDefault);
                graphConfig.padding = {
                    top: 0,
                    left: -17,
                    right: 0,
                    bottom: -17
                };
                graph = new Graph(graphConfig);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                triggerEvent(window, "resize", () => {
                    const canvas = d3.select(`.${styles.canvas}`);
                    expect(800).toBeCloserTo(
                        toNumber(canvas.attr("width"), 10)
                    );
                    expect(200).toBeCloserTo(
                        toNumber(canvas.attr("height"), 10) +
                            (graph.config.padding.bottom * 2 +
                                graph.config.padding.top) *
                                2
                    );
                    done();
                });
            });
            it("Renders correctly with X Axis orientation - Top", () => {
                graph.destroy();
                const graphConfig = getAxes(axisDefault);
                graphConfig.axis.x.orientation = AXES_ORIENTATION.X.TOP;
                graphConfig.padding = {
                    top: -17,
                    left: -17,
                    right: 0,
                    bottom: 0
                };
                graph = new Graph(graphConfig);
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(
                    0
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                    toNumber(
                        graph.config.axisLabelHeights.x * 2 +
                            graphConfig.padding.top,
                        10
                    )
                );
            });
            it("Renders correctly with X Axis orientation - Top without Label", () => {
                graph.destroy();
                const graphConfig = getAxes(axisDefault);
                graphConfig.axis.x.orientation = AXES_ORIENTATION.X.TOP;
                graphConfig.axis.x.label = "";
                graphConfig.padding = {
                    top: -17,
                    left: -17,
                    right: 0,
                    bottom: 0
                };
                graph = new Graph(graphConfig);
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(
                    0
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                    graphConfig.padding.top
                );
            });
        });
        describe("axes", () => {
            it("Creates the x axis markup", () => {
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
            });
            it("Creates the y axis markup", () => {
                const yAxisElement = fetchElementByClass(styles.axisY);
                expect(yAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisY}`
                );
            });
            it("Creates the y axis reference line markup", () => {
                const referenceElement = fetchElementByClass(
                    styles.axisReferenceLine
                );
                expect(
                    referenceElement.classList.contains(styles.axis)
                ).toBeTruthy();
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(
                    referenceElement.classList.contains(styles.axisY)
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(referenceElement.getAttribute("d")).not.toBeNull();
            });
            it("Creates the y2 axis reference line markup", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: axisDefault.y,
                        y2: {
                            show: true,
                            label: "Some Y2 label",
                            lowerLimit: 0,
                            upperLimit: 200,
                            padDomain: true
                        }
                    })
                );
                const referenceElement = document.querySelector(
                    `.${styles.axisReferenceLine}.${styles.axisY2}`
                );
                expect(
                    referenceElement.classList.contains(styles.axis)
                ).toBeTruthy();
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(
                    referenceElement.classList.contains(styles.axisY2)
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(referenceElement.getAttribute("d")).not.toBeNull();
            });
            it("Does not create the y axis reference line markup when 0 to -ve", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: {
                            padDomain: false,
                            label: "Some Y Label",
                            lowerLimit: 0,
                            upperLimit: -20
                        }
                    })
                );
                const referenceElement = document.querySelector(
                    `.${styles.axisReferenceLine}.${styles.axisY}`
                );
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("Does not create the y axis reference line markup when -ve to -ve", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: {
                            padDomain: false,
                            label: "Some Y Label",
                            lowerLimit: -10,
                            upperLimit: -20
                        }
                    })
                );
                const referenceElement = document.querySelector(
                    `.${styles.axisReferenceLine}.${styles.axisY}`
                );
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("Creates the y axis reference line markup when in range +ve to -ve", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: {
                            padDomain: false,
                            label: "Some Y Label",
                            lowerLimit: 20,
                            upperLimit: -20
                        }
                    })
                );
                const referenceElement = document.querySelector(
                    `.${styles.axisReferenceLine}.${styles.axisY}`
                );
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "false"
                );
            });
            it("Does not create the y axis reference line markup when in range 0 to +ve", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: {
                            padDomain: false,
                            label: "Some Y Label",
                            lowerLimit: 0,
                            upperLimit: 20
                        }
                    })
                );
                const referenceElement = document.querySelector(
                    `.${styles.axisReferenceLine}.${styles.axisY}`
                );
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("Does not create the y axis reference line markup when in range +ve to +ve", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: {
                            padDomain: false,
                            label: "Some Y Label",
                            lowerLimit: 10,
                            upperLimit: 20
                        }
                    })
                );
                const referenceElement = document.querySelector(
                    `.${styles.axisReferenceLine}.${styles.axisY}`
                );
                expect(
                    referenceElement.classList.contains(
                        styles.axisReferenceLine
                    )
                ).toBeTruthy();
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("Sets y2 axis start from 0 when padDomain is false", () => {
                graph.destroy();
                graph = new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: axisDefault.y,
                        y2: {
                            show: true,
                            label: "Some Y2 label",
                            lowerLimit: 0,
                            upperLimit: 200,
                            padDomain: false
                        }
                    })
                );
                const y2AxisElement = document.querySelectorAll(
                    `.${styles.axisY2}`
                );
                expect(
                    y2AxisElement[0].childNodes[0].querySelector("text")
                        .textContent
                ).toBe("0");
            });
            it("Sets x axis orientation to bottom", () => {
                const xAxisBottomOrientation = utils.deepClone(axisDefault);
                xAxisBottomOrientation.x.orientation =
                    AXES_ORIENTATION.X.BOTTOM;
                const input = getAxes(xAxisBottomOrientation);
                graph = new Graph(input);
                expect(graph.config.axis.x.orientation).toEqual(
                    AXES_ORIENTATION.X.BOTTOM
                );
            });
            it("Hides x axis when not enabled", () => {
                graph.destroy();
                const hiddenAxisObj = utils.deepClone(axisTimeSeries);
                hiddenAxisObj.x.show = false;
                graph = new Graph(getAxes(hiddenAxisObj));
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
                expect(xAxisElement.getAttribute("aria-hidden")).toBe("true");
            });
            it("Hides y axis when not enabled", () => {
                graph.destroy();
                const hiddenAxisObj = utils.deepClone(axisTimeSeries);
                hiddenAxisObj.y.show = false;
                graph = new Graph(getAxes(hiddenAxisObj));
                const yAxisElement = fetchElementByClass(styles.axisY);
                expect(yAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisY}`
                );
                expect(yAxisElement.getAttribute("aria-hidden")).toBe("true");
            });
            it("Sets axis info row orientation to top when x axis orientation is bottom", () => {
                const xAxisBottomOrientation = utils.deepClone(axisDefault);
                xAxisBottomOrientation.x.orientation =
                    AXES_ORIENTATION.X.BOTTOM;
                const input = getAxes(xAxisBottomOrientation);
                graph = new Graph(input);
                expect(graph.axis.axisInfoRow.x.orient()).toEqual(
                    AXES_ORIENTATION.X.TOP
                );
            });
            it("Sets axis info row orientation to bottom when x axis orientation is top", () => {
                const xAxisBottomOrientation = utils.deepClone(axisDefault);
                xAxisBottomOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
                const input = getAxes(xAxisBottomOrientation);
                graph = new Graph(input);
                expect(graph.axis.axisInfoRow.x.orient()).toEqual(
                    AXES_ORIENTATION.X.BOTTOM
                );
            });
            it("Creates the y axis reference line markup even when hidden", () => {
                graph.destroy();
                const hiddenAxisObj = utils.deepClone(axisTimeSeries);
                hiddenAxisObj.y.show = false;
                graph = new Graph(getAxes(hiddenAxisObj));
                const referenceElement = fetchElementByClass(
                    styles.axisReferenceLine
                );
                expect(referenceElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
            });
            it("Hides x and y axis when not enabled", () => {
                graph.destroy();
                const hiddenAxisObj = utils.deepClone(axisTimeSeries);
                hiddenAxisObj.x.show = false;
                hiddenAxisObj.y.show = false;
                graph = new Graph(getAxes(hiddenAxisObj));
                expect(
                    fetchElementByClass(styles.axisY).getAttribute("class")
                ).toBe(`${styles.axis} ${styles.axisY}`);
                expect(
                    fetchElementByClass(styles.axisX).getAttribute("class")
                ).toBe(`${styles.axis} ${styles.axisX}`);
                expect(
                    fetchElementByClass(styles.axisY).getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
                expect(
                    fetchElementByClass(styles.axisX).getAttribute(
                        "aria-hidden"
                    )
                ).toBe("true");
            });
            describe("For timeseries type", () => {
                beforeEach(() => {
                    graph.destroy();
                });
                it("Creates x axis with ticks in default locale", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    graph = new Graph(getAxes(localeAxisObj));

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2016");
                });
                it("Creates x axis with ticks in provided locale - DE", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    graph = new Graph(
                        Object.assign(
                            { locale: LOCALE.de_DE },
                            getAxes(localeAxisObj)
                        )
                    );

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2016");
                });
                it("Creates x axis with ticks in provided locale - FR", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    graph = new Graph(
                        Object.assign(
                            { locale: LOCALE.fr_FR },
                            getAxes(localeAxisObj)
                        )
                    );

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("janv. 2016");
                });
                it("Creates x axis with ticks in provided locale - ES", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    graph = new Graph(
                        Object.assign(
                            { locale: LOCALE.es_ES },
                            getAxes(localeAxisObj)
                        )
                    );

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("ene 2016");
                });
                it("Creates x axis with ticks in provided locale - PT_BR", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    graph = new Graph(
                        Object.assign(
                            { locale: LOCALE.pt_BR },
                            getAxes(localeAxisObj)
                        )
                    );

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2016");
                });
                it("Creates x axis with LowerTickValues", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x = {
                        type: "timeseries",
                        label: "Some X Label",
                        lowerLimit: new Date(2017, 0).toISOString(),
                        upperLimit: new Date(2017, 6).toISOString()
                    };
                    localeAxisObj.x.ticks = {
                        format: "%b %Y",
                        lowerStepTickValues: [
                            new Date(2017, 1).toISOString(),
                            new Date(2017, 3).toISOString(),
                            new Date(2017, 5).toISOString()
                        ]
                    };
                    graph = new Graph(getAxes(localeAxisObj));
                    const allXAxisElements = document.querySelectorAll(
                        `.${styles.axisX}`
                    );
                    expect(
                        allXAxisElements[0].childNodes[0].querySelector("text")
                            .textContent
                    ).toBe("Feb 2017");
                    expect(
                        allXAxisElements[0].childNodes[1].querySelector("text")
                            .textContent
                    ).toBe("Apr 2017");
                    expect(
                        allXAxisElements[0].childNodes[2].querySelector("text")
                            .textContent
                    ).toBe("Jun 2017");
                    const gridLowerStepElement = fetchElementByClass(
                        styles.gridLowerStep
                    );
                    expect(
                        gridLowerStepElement.querySelectorAll(".tick").length
                    ).toBe(3);
                });
                it("Creates x axis with UpperTickValues", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x = {
                        type: "timeseries",
                        label: "Some X Label",
                        lowerLimit: new Date(2016, 11).toISOString(),
                        upperLimit: new Date(2017, 6).toISOString()
                    };
                    localeAxisObj.x.ticks = {
                        format: "%b %Y",
                        show: true,
                        upperStepTickValues: [
                            new Date(2016, 11).toISOString(),
                            new Date(2018, 1).toISOString()
                        ]
                    };
                    graph = new Graph(getAxes(localeAxisObj));
                    const allXAxisElements = document.querySelectorAll(
                        `.${styles.axisX}`
                    );
                    const start = allXAxisElements[0].childNodes[0].querySelector(
                        "text"
                    );
                    const end = allXAxisElements[0].childNodes[1].querySelector(
                        "text"
                    );
                    expect(start.textContent).toBe("Dec 2016");
                    expect(end.textContent).toBe("Feb 2018");
                    const gridUpperStepElement = fetchElementByClass(
                        styles.gridUpperStep
                    );
                    expect(
                        gridUpperStepElement.querySelectorAll(".tick").length
                    ).toBe(2);
                });
                it("Creates x axis with LowerTickValues, UpperTickValues and values in default locale", () => {
                    const localeAxisObj = utils.deepClone(axisTimeSeries);
                    localeAxisObj.x = {
                        type: "timeseries",
                        label: "Some X Label",
                        lowerLimit: new Date(2016, 11).toISOString(),
                        upperLimit: new Date(2018, 2).toISOString()
                    };
                    localeAxisObj.x.ticks = {
                        format: "%b %Y",
                        show: true,
                        lowerStepTickValues: [
                            new Date(2017, 1).toISOString(),
                            new Date(2017, 5).toISOString(),
                            new Date(2017, 9).toISOString()
                        ],
                        midpointTickValues: [
                            new Date(2017, 3).toISOString(),
                            new Date(2017, 7).toISOString(),
                            new Date(2017, 11).toISOString()
                        ],
                        upperStepTickValues: [
                            new Date(2016, 11).toISOString(),
                            new Date(2018, 1).toISOString()
                        ]
                    };
                    graph = new Graph(getAxes(localeAxisObj));

                    const allXAxisElements = document.querySelectorAll(
                        `.${styles.axisX}`
                    );
                    const lowerAxis = allXAxisElements[0].childNodes[0].querySelector(
                        "text"
                    );
                    const upperAxis = allXAxisElements[0].childNodes[3].querySelector(
                        "text"
                    );
                    expect(lowerAxis.textContent).toBe("Feb 2017");
                    expect(upperAxis.textContent).toBe("Dec 2016");
                });
            });
            describe("For default type", () => {
                it("Creates x axis with ticks in default locale", () => {
                    graph.destroy();
                    const localeAxisObj = utils.deepClone(axisDefault);
                    localeAxisObj.x.lowerLimit = 1000;
                    localeAxisObj.x.upperLimit = 20000;
                    graph = new Graph(getAxes(localeAxisObj));
                    graph.loadContent(
                        new Line(
                            getData([
                                {
                                    x: 3500,
                                    y: 4
                                },
                                {
                                    x: 15000,
                                    y: 7
                                }
                            ])
                        )
                    );
                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement.querySelectorAll(".tick");
                    expect(
                        tick[tick.length - 1].querySelector("text").textContent
                    ).toBe("20,000");
                });
                it("Creates x axis with ticks in provided locale - DE", () => {
                    graph.destroy();
                    const localeAxisObj = utils.deepClone(axisDefault);
                    localeAxisObj.x.lowerLimit = 1000;
                    localeAxisObj.x.upperLimit = 20000;
                    localeAxisObj.x.ticks = {
                        format: "n"
                    };
                    graph = new Graph(
                        Object.assign(
                            { locale: LOCALE.de_DE },
                            getAxes(localeAxisObj)
                        )
                    );
                    graph.loadContent(
                        new Line(
                            getData([
                                {
                                    x: 3500,
                                    y: 4
                                },
                                {
                                    x: 15000,
                                    y: 7
                                }
                            ])
                        )
                    );
                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement.querySelectorAll(".tick");
                    expect(
                        tick[tick.length - 1].querySelector("text").textContent
                    ).toBe("20.000");
                });
            });
        });
        describe("Grid", () => {
            it("Creates the grid markup", () => {
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.grid}`)
                ).not.toBeNull();
                const gridElement = fetchElementByClass(styles.grid);
                expect(gridElement.childElementCount).toBe(2);
            });
            /**
             *    Verify if lower step grid lines do not display with midpoint grid lines or upper grid lines, the lower step grid lines displays as a solid 1px light gray color #E8E9EA
             */
            it("Creates the grid markup with tick values provided", () => {
                graph.destroy();
                const localeAxisObj = utils.deepClone(axisDefault);
                localeAxisObj.x.ticks = {
                    values: [10, 20, 30]
                };
                localeAxisObj.y.ticks = {
                    values: [1, 5, 8]
                };
                graph = new Graph(getAxes(localeAxisObj));
                const gridElement = fetchElementByClass(styles.grid);
                const gridHElement = fetchElementByClass(styles.gridH);
                const gridVElement = fetchElementByClass(styles.gridV);
                expect(gridElement.childElementCount).toBe(2);
                expect(gridHElement.querySelectorAll(".tick").length).toBe(3);
                expect(gridVElement.querySelectorAll(".tick").length).toBe(3);
            });
            it("Creates the grid markup with upperTickValues, midTickValues and values provided", () => {
                graph.destroy();
                const localeAxisObj = utils.deepClone(axisDefault);
                localeAxisObj.x.ticks = {
                    show: true,
                    values: [15, 25, 35],
                    upperStepTickValues: [10, 40],
                    midpointTickValues: [15, 25]
                };
                graph = new Graph(getAxes(localeAxisObj));
                const gridMidElement = fetchElementByClass(styles.gridMidpoint);
                const gridLowerStepElement = fetchElementByClass(
                    styles.gridLowerStep
                );
                const gridUpperStepElement = fetchElementByClass(
                    styles.gridUpperStep
                );

                expect(
                    gridLowerStepElement.querySelectorAll(".tick").length
                ).toBe(3);
                expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
                expect(
                    gridUpperStepElement.querySelectorAll(".tick").length
                ).toBe(2);
            });
            /**
             * Verify if lower step grid lines are displayed with midpoint grid lines or upper grid lines, the lower step grid lines displays as a solid 1px med gray color #9B9B9B
             * Verify the upper step grid line displays as a solid 3px gray color #BCBFC0
             * Verify the midpoint grid lines display as a solid 1px light gray color #E8E9EA
             */
            it("Creates the grid markup with upperTickValues, lowerTickValues and midTickValues provided", () => {
                graph.destroy();
                const localeAxisObj = utils.deepClone(axisDefault);
                localeAxisObj.x.ticks = {
                    show: true,
                    lowerStepTickValues: [15, 25, 35],
                    upperStepTickValues: [10, 40],
                    midpointTickValues: [15, 25]
                };
                graph = new Graph(getAxes(localeAxisObj));

                const gridMidElement = fetchElementByClass(styles.gridMidpoint);
                expect(gridMidElement).toBeDefined();
                const gridLowerStepElement = fetchElementByClass(
                    styles.gridLowerStep
                );
                expect(gridLowerStepElement).toBeDefined();
                const gridUpperStepElement = fetchElementByClass(
                    styles.gridUpperStep
                );
                expect(gridUpperStepElement).toBeDefined();

                expect(
                    gridLowerStepElement.querySelectorAll(".tick").length
                ).toBe(3);
                expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
                expect(
                    gridUpperStepElement.querySelectorAll(".tick").length
                ).toBe(2);
            });
            it("Creates the grid markup by giving lowerTickValues more precidence than values if both available", () => {
                graph.destroy();
                const localeAxisObj = utils.deepClone(axisDefault);
                localeAxisObj.x.ticks = {
                    show: true,
                    values: [15, 30],
                    lowerStepTickValues: [15, 25, 35],
                    upperStepTickValues: [10, 40],
                    midpointTickValues: [15, 25]
                };
                graph = new Graph(getAxes(localeAxisObj));
                const gridMidElement = fetchElementByClass(styles.gridMidpoint);
                const gridLowerStepElement = fetchElementByClass(
                    styles.gridLowerStep
                );
                const gridUpperStepElement = fetchElementByClass(
                    styles.gridUpperStep
                );

                expect(
                    gridLowerStepElement.querySelectorAll(".tick").length
                ).toBe(3);
                expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
                expect(
                    gridUpperStepElement.querySelectorAll(".tick").length
                ).toBe(2);
            });
            it("Creates the grid markup with upper values provided", () => {
                graph.destroy();
                const localeAxisObj = utils.deepClone(axisDefault);
                localeAxisObj.x.ticks = {
                    show: true,
                    upperStepTickValues: [10, 40]
                };
                graph = new Graph(getAxes(localeAxisObj));
                const gridMidElement = fetchElementByClass(styles.gridMidpoint);
                const gridLowerStepElement = fetchElementByClass(
                    styles.gridLowerStep
                );
                const gridUpperStepElement = fetchElementByClass(
                    styles.gridUpperStep
                );

                expect(gridMidElement).toBeNull();
                expect(gridLowerStepElement).toBeNull();
                expect(
                    gridUpperStepElement.querySelectorAll(".tick").length
                ).toBe(2);
            });
            it("Creates the grid markup with mid values provided", () => {
                graph.destroy();
                const localeAxisObj = utils.deepClone(axisDefault);
                localeAxisObj.x.ticks = {
                    show: true,
                    midpointTickValues: [10, 40]
                };
                graph = new Graph(getAxes(localeAxisObj));
                const gridMidElement = fetchElementByClass(styles.gridMidpoint);
                const gridLowerStepElement = fetchElementByClass(
                    styles.gridLowerStep
                );
                const gridUpperStepElement = fetchElementByClass(
                    styles.gridUpperStep
                );

                expect(gridLowerStepElement).toBeNull();
                expect(gridUpperStepElement).toBeNull();
                expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
            });
            it("Creates the horizontal grid markup", () => {
                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridH}`)
                ).not.toBeNull();
                expect(
                    gridElement.querySelector(`.${styles.gridH}`).nodeName
                ).toBe("g");
            });
            it("Creates the vertical grid markup", () => {
                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridV}`)
                ).not.toBeNull();
                expect(
                    gridElement.querySelector(`.${styles.gridV}`).nodeName
                ).toBe("g");
            });
            it("Hides the horizontal grid if not enabled", () => {
                graph.destroy();
                graph = new Graph(
                    Object.assign(
                        {
                            showVGrid: true,
                            showHGrid: false
                        },
                        getAxes(axisDefault)
                    )
                );

                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridH}`)
                ).toBeNull();
            });
            it("Hides the vertical grid if not enabled", () => {
                graph.destroy();
                graph = new Graph(
                    Object.assign(
                        {
                            showVGrid: false,
                            showHGrid: true
                        },
                        getAxes(axisDefault)
                    )
                );

                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridV}`)
                ).toBeNull();
            });
        });
        describe("Content container", () => {
            it("Creates the container markup", () => {
                const canvasElement = fetchElementByClass(styles.canvas);
                const containerElement = canvasElement.querySelector(
                    `.${styles.contentContainer}`
                );
                expect(containerElement).not.toBeNull();
                expect(containerElement.nodeName).toBe("rect");
                expect(toNumber(containerElement.getAttribute("x"))).toBe(
                    graph.config.axisSizes.y + graph.config.axisLabelWidths.y
                );
                expect(toNumber(containerElement.getAttribute("y"))).toBe(
                    constants.PADDING.bottom
                );
            });
        });
        describe("Label", () => {
            it("Hides the label when not enabled", () => {
                graph.destroy();
                graph = new Graph(
                    Object.assign(
                        {
                            showLabel: false
                        },
                        getAxes(axisDefault)
                    )
                );

                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelX}`)
                ).toBeNull();
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelY}`)
                ).toBeNull();
            });
            it("Creates labels for x and y axes when text is present", () => {
                graph.destroy();
                graph = new Graph(getAxes(axisDefault));

                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelX}`)
                ).not.toBeNull();
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelY}`)
                ).not.toBeNull();
            });
            it("Creates label x axis when text is present", () => {
                graph.destroy();
                graph = new Graph(getAxes(axisDefault));

                const xLabelElement = fetchElementByClass(styles.axisLabelX);
                expect(xLabelElement.nodeName).toBe("g");
                expect(xLabelElement.querySelector("tspan").textContent).toBe(
                    axisDefault.x.label
                );
            });
            it("Creates label y axis when text is present", () => {
                graph.destroy();
                graph = new Graph(getAxes(axisDefault));

                const yLabelElement = fetchElementByClass(styles.axisLabelY);
                const translate = getSVGAnimatedTransformList(
                    yLabelElement.getAttribute("transform")
                ).translate;
                expect(yLabelElement.nodeName).toBe("g");
                expect(yLabelElement.querySelector("tspan").textContent).toBe(
                    axisDefault.y.label
                );
                expect(yLabelElement.getAttribute("transform")).toContain(
                    "rotate(-90)"
                );
                expect(toNumber(translate[0], 10)).toBeCloserTo(12);
                expect(toNumber(translate[1], 10)).toBeCloserTo(115);
            });
            it("Changes label y axis position when height property of graph is set to custom value", () => {
                graph.destroy();
                const axes = getAxes(axisDefault);
                axes.dimension = { height: 100 };
                graph = new Graph(axes);

                const yLabelElement = fetchElementByClass(styles.axisLabelY);
                const translate = getSVGAnimatedTransformList(
                    yLabelElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(12);
                expect(toNumber(translate[1], 10)).toBeCloserTo(47);
                expect(toNumber(translate[1], 10)).not.toBe(120);
            });
            it("Doesnt create label x axis when text is not present", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.x.label = "";
                graph = new Graph(getAxes(labelAxisObj));

                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelX}`)
                ).toBeNull();
            });
            it("Throws error when label y axis text is not present", () => {
                expect(() => {
                    graph.destroy();
                    const labelAxisObj = utils.deepClone(axisDefault);
                    labelAxisObj.y.label = "";
                    graph = new Graph(getAxes(labelAxisObj));
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
            });
            it("Sanitizes x axis label text", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.x.label = "<HELLO DUMMY X LABEL>";
                graph = new Graph(getAxes(labelAxisObj));

                const xLabelElement = fetchElementByClass(styles.axisLabelX);
                expect(xLabelElement.querySelector("tspan").textContent).toBe(
                    "&lt;HELLO DUMMY X LABEL&gt;"
                );
            });
            it("Sanitizes y axis label text", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.y.label = "<HELLO DUMMY Y LABEL>";
                graph = new Graph(getAxes(labelAxisObj));

                const yLabelElement = fetchElementByClass(styles.axisLabelY);
                expect(yLabelElement.querySelector("tspan").textContent).toBe(
                    "&lt;HELLO DUMMY Y LABEL&gt;"
                );
            });
            it("Does not create label shape container when Y2 axis is not provided", () => {
                graph.destroy();
                graph = new Graph(getAxes(utils.deepClone(axisDefault)));
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(
                        `.${styles.axisLabelYShapeContainer}`
                    )
                ).toBeNull();
                expect(
                    canvasElement.querySelector(
                        `.${styles.axisLabelY2ShapeContainer}`
                    )
                ).toBeNull();
            });
            it("Creates label shape container when Y2 axis is provided", () => {
                graph.destroy();
                graph = new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: axisDefault.y,
                        y2: {
                            show: true,
                            lowerLimit: 0,
                            upperLimit: 200,
                            label: "Some Y2 label"
                        }
                    })
                );
                const canvasElement = fetchElementByClass(styles.canvas);
                const yAxisShapeContainer = canvasElement.querySelector(
                    `.${styles.axisLabelYShapeContainer}`
                );
                const y2AxisShapeContainer = canvasElement.querySelector(
                    `.${styles.axisLabelY2ShapeContainer}`
                );
                expect(yAxisShapeContainer).not.toBeNull();
                expect(y2AxisShapeContainer).not.toBeNull();
                expect(yAxisShapeContainer.tagName).toBe("g");
                expect(y2AxisShapeContainer.tagName).toBe("g");
            });
            it("Hides label shape container if flag is turned off", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(
                    getAxes({
                        x: axisDefault.x,
                        y: axisDefault.y,
                        y2: {
                            show: true,
                            lowerLimit: 0,
                            upperLimit: 200,
                            label: "Some Y2 label"
                        }
                    })
                );
                labelAxisObj.showLabel = false;
                graph = new Graph(labelAxisObj);
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(
                        `.${styles.axisLabelYShapeContainer}`
                    )
                ).toBeNull();
                expect(
                    canvasElement.querySelector(
                        `.${styles.axisLabelY2ShapeContainer}`
                    )
                ).toBeNull();
            });
        });
        describe("Legend", () => {
            it("Throws error when legend is loaded without a click handler", () => {
                expect(() => {
                    loadLegendItem({}, {}, {}, {});
                }).toThrowError(
                    "Invalid Argument: eventHandlers needs a clickHandler callback function."
                );
            });
            it("Throws error when legend is loaded without a hover handler", () => {
                expect(() => {
                    loadLegendItem({}, {}, {}, { clickHandler: Function });
                }).toThrowError(
                    "Invalid Argument: eventHandlers needs a hoverHandler callback function."
                );
            });
            it("Throws error when legend is loaded without a label value", () => {
                expect(() => {
                    loadLegendItem(
                        {},
                        { label: null },
                        {},
                        {
                            clickHandler: Function,
                            hoverHandler: Function
                        }
                    );
                }).toThrowError(errors.THROW_MSG_LEGEND_LABEL_NOT_PROVIDED);
            });
            it("Loads legend in separate container when bindLegendTo used", () => {
                graph.destroy();
                const legendContainer = document.createElement("div");
                legendContainer.setAttribute("id", "lineLegendContainer");
                legendContainer.setAttribute("class", "legend-container");
                graphContainer.appendChild(legendContainer);
                const input = utils.deepClone(getAxes(axisDefault));
                input.bindLegendTo = "#lineLegendContainer";
                graph = new Graph(input);
                const container = fetchElementByClass(styles.container);
                const parentContainer = fetchElementByClass(
                    "carbon-test-class"
                );
                expect(graph.config.bindLegendTo).toEqual(input.bindLegendTo);
                expect(container.childNodes.length).toEqual(1);
                expect(parentContainer.childNodes.length).toEqual(2);
                expect(
                    parentContainer.childNodes[0].getAttribute("id")
                ).toEqual("lineLegendContainer");
                expect(
                    parentContainer.childNodes[0].getAttribute("class")
                ).toEqual("legend-container");
                expect(
                    parentContainer.childNodes[1].getAttribute("class")
                ).toEqual(styles.container);
            });
            it("Hides legend when not enabled", () => {
                graph.destroy();
                graph = new Graph(
                    Object.assign(
                        {
                            showLegend: false
                        },
                        getAxes(axisDefault)
                    )
                );
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.legend}`)
                ).toBeNull();
            });
        });
        describe("Validates content for unique keys", () => {
            it("Throws error if content doesn't have a unique key", () => {
                graph = new Graph(Object.assign(getAxes(axisDefault)));
                graph.loadContent(new Line(getData(valuesDefault)));
                expect(() => {
                    graph.loadContent(new Line(getData(valuesDefault)));
                }).toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
            });
            it("Doesn't throws error if content has unique keys", () => {
                graph = new Graph(Object.assign(getAxes(axisDefault)));
                graph.loadContent(new Line(getData(valuesDefault)));
                expect(() => {
                    const uniqueData = getData(valuesDefault);
                    uniqueData.key = "uid_2";
                    graph.loadContent(new Line(uniqueData));
                }).not.toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
            });
        });
        it("Attaches event handlers", () => {
            graph.resizeHandler();
            expect(graph.resizeHandler).not.toBeNull();
            expect(graph.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("When resize is called", () => {
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
        });
        it("Sets the canvas width correctly", () => {
            const currentWidth = graph.config.canvasWidth;
            expect(currentWidth).toBe(1024);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            expect(graph.config.canvasWidth).toBe(800);
        });
        it("Sets the defs clipPath width and height correctly", () => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            const clipPathRect = defsElement.firstChild.firstChild;
            expect(toNumber(clipPathRect.getAttribute("height"))).toBe(
                graph.config.height
            );
            expect(toNumber(clipPathRect.getAttribute("width"))).toBe(
                getXAxisWidth(graph.config)
            );
        });
        it("Calculates X axis d3 scale using domain and range", () => {
            graph.resize();
            expect(graph.scale.x).not.toBeNull();
            expect(graph.scale.x).toEqual(jasmine.any(Function));
        });
        it("Calculates Y axis d3 scale using domain and range", () => {
            graph.resize();
            expect(graph.scale.y).not.toBeNull();
            expect(graph.scale.y).toEqual(jasmine.any(Function));
        });
        it("Translates the canvas", () => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            expect(
                toNumber(
                    fetchElementByClass(styles.canvas).getAttribute("height")
                )
            ).not.toBe(0);
            expect(
                toNumber(
                    fetchElementByClass(styles.canvas).getAttribute("height")
                )
            ).toBeGreaterThan(0);
            expect(
                toNumber(
                    fetchElementByClass(styles.canvas).getAttribute("width")
                )
            ).toBe(790);
        });
        it("Sets the content container width and height correctly", (done) => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(toNumber(contentContainer.getAttribute("height"))).toBe(
                    graph.config.height
                );
                expect(toNumber(contentContainer.getAttribute("width"))).toBe(
                    getXAxisWidth(graph.config)
                );
                done();
            });
        });
        it("Sets the throttle correctly, if undefined", () => {
            const throttledInput = getAxes(axisDefault);
            throttledInput.throttle = undefined;
            graph.destroy();
            graph = new Graph(throttledInput);
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
        });
        it("Sets the throttle correctly", () => {
            const throttledInput = getAxes(axisDefault);
            throttledInput.throttle = 400;
            graph.destroy();
            graph = new Graph(throttledInput);
            expect(graph.config.throttle).toEqual(400);
            expect(graph.config.throttle).not.toEqual(
                constants.RESIZE_THROTTLE
            );
        });
        it("Throttles based on delay", (done) => {
            spyOn(window, "requestAnimationFrame");
            const throttledInput = getAxes(axisDefault);
            throttledInput.throttle = undefined;
            graph.destroy();
            graph = new Graph(throttledInput);
            graphContainer.setAttribute("style", "width: 600px; height: 200px");
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(window.requestAnimationFrame).toHaveBeenCalled();
                    done();
                },
                constants.RESIZE_THROTTLE
            );
        });
        it("Throttles based on delay provided in the input", (done) => {
            spyOn(window, "requestAnimationFrame");
            const throttledInput = getAxes(axisDefault);
            throttledInput.throttle = 500;
            graph.destroy();
            graph = new Graph(throttledInput);
            graphContainer.setAttribute("style", "width: 400px; height: 200px");
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(window.requestAnimationFrame).toHaveBeenCalled();
                    done();
                },
                throttledInput.throttle
            );
        });
        it("Translates label shape container when Y2 axis is provided", (done) => {
            graph.destroy();
            graph = new Graph(
                getAxes({
                    x: axisDefault.x,
                    y: axisDefault.y,
                    y2: {
                        show: true,
                        lowerLimit: 0,
                        upperLimit: 200,
                        label: "Some Y2 label"
                    }
                })
            );
            graphContainer.setAttribute("style", "width: 400px; height: 200px");
            triggerEvent(window, "resize", () => {
                const canvasElement = fetchElementByClass(styles.canvas);
                const yAxisShapeContainer = canvasElement.querySelector(
                    `.${styles.axisLabelYShapeContainer}`
                );
                const y2AxisShapeContainer = canvasElement.querySelector(
                    `.${styles.axisLabelY2ShapeContainer}`
                );
                expect(yAxisShapeContainer.getAttribute("transform")).toContain(
                    "translate"
                );
                expect(yAxisShapeContainer.getAttribute("transform")).toContain(
                    "rotate(-90)"
                );
                expect(
                    y2AxisShapeContainer.getAttribute("transform")
                ).toContain("translate");
                expect(
                    y2AxisShapeContainer.getAttribute("transform")
                ).toContain("rotate(90)");
                done();
            });
        });
        /**
         * BF12182018.01 - Verify the consumer has the option to provide custom padding for the graph-container.
         */
        describe("when custom padding is used", () => {
            it("Default padding is applied when no custom padding is used", () => {
                const axisData = getAxes(axisDefault);
                graph.destroy();
                graph = new Graph(axisData);
                const expectedOutput = {
                    top: 10,
                    bottom: 5,
                    left: 30,
                    right: 50,
                    hasCustomPadding: false
                };
                expect(graph.config.padding).toEqual(expectedOutput);
            });
            it("Default padding is applied when custom padding half filled", () => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 40
                };
                graph.destroy();
                graph = new Graph(axisData);
                const expectedOutput = {
                    top: 40,
                    bottom: 5,
                    left: 30,
                    right: 50,
                    hasCustomPadding: true
                };
                expect(graph.config.padding).toEqual(expectedOutput);
            });
            it("Position of content container starts where canvas starts", () => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 0,
                    left: -17,
                    right: 0,
                    bottom: 0
                };
                graph.destroy();
                graph = new Graph(axisData);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("x"), 10)
                ).toBeCloserTo(0);
                expect(
                    toNumber(contentContainer.getAttribute("y"), 10)
                ).toBeCloserTo(0);
            });
            it("Position of content container shifts right, when left padding is applied", () => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 0,
                    left: 20,
                    right: 0,
                    bottom: 0
                };
                graph.destroy();
                graph = new Graph(axisData);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(toNumber(contentContainer.getAttribute("y"))).toBe(0);
            });
            it("Position of content container shifts right, when left padding is applied", () => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 0,
                    left: 20,
                    right: 0,
                    bottom: 0
                };
                graph.destroy();
                graph = new Graph(axisData);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(toNumber(contentContainer.getAttribute("y"))).toBe(0);
            });
            it("Position of content container shifts left, when right padding is applied", (done) => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 0,
                    left: 0,
                    right: 20,
                    bottom: 0
                };
                graph.destroy();
                graph = new Graph(axisData);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                triggerEvent(window, "resize", () => {
                    // height and width of the content container gets set when the resize event occurs, via translateContentContainer
                    const contentContainer = d3.select(
                        `.${styles.contentContainer}`
                    );
                    expect(
                        toNumber(contentContainer.attr("width"), 10)
                    ).toBeCloserTo(762);
                    expect(
                        toNumber(contentContainer.attr("height"))
                    ).toBeCloserTo(250);
                    done();
                });
            });
            it("Position of content container shifts top, when bottom padding is applied", () => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 20
                };
                graph.destroy();
                graph = new Graph(axisData);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("height"))
                ).toBeLessThan(
                    toNumber(
                        fetchElementByClass(styles.canvas).getAttribute(
                            "height"
                        )
                    )
                );
            });
            it("Position of content container shifts bottom, when top padding is applied", () => {
                const axisData = getAxes(axisDefault);
                axisData.padding = {
                    top: 20,
                    left: 0,
                    right: 0,
                    bottom: 0
                };
                graph.destroy();
                graph = new Graph(axisData);
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("height"))
                ).toBeLessThan(
                    toNumber(
                        fetchElementByClass(styles.canvas).getAttribute(
                            "height"
                        )
                    )
                );
            });
        });
    });
    describe("When unload is called", () => {
        let primaryContent;
        let secondaryContent;
        beforeEach(() => {
            primaryContent = new Line(getData(valuesDefault));
            secondaryContent = new Line(getData(valuesDefault));
        });
        it("Throws error when unloading a content which is not loaded", () => {
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            expect(() => {
                graph.unloadContent(secondaryContent);
            }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        });
        it("Removes the content successfully", () => {
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            graph.unloadContent(primaryContent);
            expect(graph.content).toEqual([]);
            expect(graph.contentTargets).toEqual([]);
            expect(graph.content.length).toBe(0);
            expect(graph.contentTargets.length).toBe(0);
        });
        describe("When custom padding is used", () => {
            beforeEach(() => {
                const graphConfig = utils.deepClone(getAxes(axisDefault));
                graphConfig.padding = {
                    top: -17,
                    left: -17,
                    right: 0,
                    bottom: 0
                };
                graph = new Graph(graphConfig);
                const data = utils.deepClone(getData(valuesDefault));
                const primaryContent = new Line(data);
                graph.loadContent(primaryContent);
                graph.unloadContent(primaryContent);
            });
            it("Renders correctly after content is removed", () => {
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(
                    0
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                    0
                );
                expect(
                    toNumber(
                        graph.config.axisSizes.y +
                            graph.config.axisLabelWidths.y,
                        10
                    )
                ).toBeCloserTo(0);
                expect(getYAxisHeight(graph.config)).toBeCloserTo(267);
            });
            it("Renders correctly on another resize", (done) => {
                graphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                graph.resize();
                triggerEvent(window, "resize", () => {
                    const contentContainer = d3.select(
                        `.${styles.contentContainer}`
                    );
                    expect(
                        toNumber(contentContainer.attr("width"), 10)
                    ).toBeLessThan(1024);
                    expect(
                        toNumber(contentContainer.attr("height"), 10)
                    ).toBeLessThan(400);
                    done();
                });
            });
        });
    });
    describe("When destruct is called", () => {
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
            graph.destroy();
        });
        it("Does not throw error if graph container does not exist", () => {
            expect(() => {
                graph.destroy();
            }).not.toThrow();
        });
        it("Removes the canvas content", () => {
            expect(fetchElementByClass(styles.canvas)).toBeNull();
        });
        it("Removes the legend content", () => {
            expect(fetchElementByClass(styles.legend)).toBeNull();
        });
        it("Removes the region group content", () => {
            expect(fetchElementByClass(styles.regionGroup)).toBeNull();
        });
        it("Removes the container content", () => {
            expect(fetchElementByClass(styles.container)).toBeNull();
        });
        it("Resets the API objects", () => {
            expect(graph.config.canvasWidth).toBeUndefined();
            expect(graph.config.canvasHeight).toBeUndefined();
            expect(graph.config.axisSizes).toBeUndefined();
            expect(graph.config.axisLabelWidths).toBeUndefined();
            expect(graph.config.axisLabelHeights).toBeUndefined();
            expect(graph.config).toEqual({
                axis: Object({
                    x: Object({}),
                    y: Object({}),
                    y2: Object({})
                }),
                shownTargets: Object({}),
                dateline: []
            });
            expect(graph.axis).toEqual({
                axisInfoRow: Object({
                    x: Object({})
                })
            });
            expect(graph.scale).toEqual({});
            expect(graph.svg).toBeNull();
            expect(graph.resizeHandler).toBeNull();
            expect(graph.content).toEqual([]);
            expect(graph.contentTargets).toEqual([]);
        });
    });
    describe("When x axis orientation is set to top", () => {
        it("Processes the default input correctly", () => {
            const xAxisTopOrientation = utils.deepClone(axisDefault);
            xAxisTopOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
            const input = getAxes(xAxisTopOrientation);
            graph = new Graph(input);
            expect(graph.config.bindTo).toEqual(input.bindTo);
            expect(graph.config.axis).not.toBeNull();
            expect(graph.config.locale).not.toBeNull();
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(graph.config.showLabel).toEqual(true);
            expect(graph.config.showLegend).toEqual(true);
            expect(graph.config.showShapes).toEqual(true);
            expect(graph.config.showHGrid).toEqual(true);
            expect(graph.config.showVGrid).toEqual(true);
            expect(graph.config.dimension).toEqual({});
            expect(graph.config.axis.x.type).toEqual(AXIS_TYPE.DEFAULT);
            expect(graph.config.axis.x.ticks).toEqual({});
            expect(graph.config.axis.y.ticks).toEqual({});
            expect(graph.config.axis.x.show).toEqual(true);
            expect(graph.config.axis.y.show).toEqual(true);
            expect(graph.config.axis.x.orientation).toEqual(
                AXES_ORIENTATION.X.TOP
            );
            expect(graph.config.axisPadding.y).toEqual(true);
        });
        it("Creates label x axis when text is present", () => {
            const xAxisTopOrientation = utils.deepClone(axisDefault);
            xAxisTopOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
            const input = getAxes(xAxisTopOrientation);
            graph = new Graph(input);
            const xLabelElement = fetchElementByClass(styles.axisLabelX);
            expect(xLabelElement.nodeName).toBe("g");
            expect(xLabelElement.querySelector("tspan").textContent).toBe(
                axisDefault.x.label
            );
        });
        it("Sets x axis position correctly", () => {
            const xAxisTopOrientation = utils.deepClone(axisDefault);
            xAxisTopOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
            const input = getAxes(xAxisTopOrientation);
            graph = new Graph(input);
            const axisXElement = fetchElementByClass(styles.axisX);
            const translate = getSVGAnimatedTransformList(
                axisXElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloserTo(72);
            expect(toNumber(translate[1], 10)).toBeCloserTo(45);
        });
        it("Sets x axis position correctly when x axis is hidden", () => {
            const hiddenAxisObj = utils.deepClone(axisDefault);
            hiddenAxisObj.x.show = false;
            hiddenAxisObj.x.orientation = AXES_ORIENTATION.X.TOP;
            graph = new Graph(getAxes(hiddenAxisObj));
            const axisXElement = fetchElementByClass(styles.axisX);
            const translate = getSVGAnimatedTransformList(
                axisXElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloserTo(72);
            expect(toNumber(translate[1], 10)).toBeCloserTo(45);
        });
        it("Sets x axis position correctly when labels are hidden", () => {
            const hiddenLabelObj = utils.deepClone(axisDefault);
            hiddenLabelObj.x.orientation = AXES_ORIENTATION.X.TOP;
            graph = new Graph(
                Object.assign(
                    {
                        showLabel: false
                    },
                    getAxes(hiddenLabelObj)
                )
            );
            const axisXElement = fetchElementByClass(styles.axisX);
            const translate = getSVGAnimatedTransformList(
                axisXElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloserTo(55);
            expect(toNumber(translate[1], 10)).toBeCloserTo(10);
        });
        it("Sets x axis position correctly when x axis label is hidden", () => {
            const hiddenXLabelObj = utils.deepClone(axisDefault);
            hiddenXLabelObj.x.orientation = AXES_ORIENTATION.X.TOP;
            hiddenXLabelObj.x.label = "";
            const input = getAxes(hiddenXLabelObj);
            graph = new Graph(input);
            const axisXElement = fetchElementByClass(styles.axisX);
            const translate = getSVGAnimatedTransformList(
                axisXElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloserTo(72);
            expect(toNumber(translate[1], 10)).toBeCloserTo(10);
        });
    });
});
