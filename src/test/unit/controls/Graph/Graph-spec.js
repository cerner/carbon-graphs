"use strict";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import constants, {
    AXES_ORIENTATION,
    AXIS_TYPE
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    dimension,
    fetchElementByClass,
    getAxes,
    getData,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";
import { rgb } from "d3";

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
            expect(graph.contentKeys).toEqual([]);
            expect(graph.content).toEqual([]);
            expect(graph.contentConfig).toEqual([]);
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
            it("If showNoDataText is not present, default value of showNoDataText is set to true", () => {
                const graph = new Graph(getAxes(axisDefault));
                expect(graph.config.showNoDataText).toEqual(true);
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
            expect(graph.contentConfig).toEqual([primaryContent.config]);
            expect(graph.content.length).toBe(1);
            expect(graph.contentConfig.length).toBe(1);
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
            expect(graph.config.d3Locale).not.toBeNull();
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(graph.config.showLabel).toEqual(true);
            expect(graph.config.showLegend).toEqual(true);
            expect(graph.config.showNoDataText).toEqual(true);
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
            expect(graph.config.d3Locale).not.toBeNull();
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(graph.config.showLabel).toEqual(true);
            expect(graph.config.showLegend).toEqual(true);
            expect(graph.config.showNoDataText).toEqual(true);
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
            it("Sets canvas width taking container padding into consideration", () => {
                graph.destroy();
                graphContainer.setAttribute(
                    "style",
                    "width: 1024px; height: 400px; padding: 3rem"
                );
                graph = new Graph(getAxes(axisDefault));

                expect(graph.config.canvasWidth).toBeCloserTo(928);
            });
            it("Sets canvas height", () => {
                expect(graph.config.canvasHeight).not.toBe(0);
                expect(graph.config.canvasHeight).toBeGreaterThan(0);
            });
            it("Sets the height correctly", () => {
                expect(graph.config.height).toBe(230);
            });
            it("Sets X axis position correctly", () => {
                const axisXElement = fetchElementByClass(styles.axisX);
                const translate = getSVGAnimatedTransformList(
                    axisXElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(67);
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
                dateline: [],
                eventline: [],
                pan: {}
            });
            expect(graph.axis).toEqual({
                axisInfoRow: Object({
                    x: Object({})
                })
            });
            expect(graph.scale).toEqual({});
            expect(graph.svg).toBeNull();
            expect(graph.resizeHandler).toBeNull();
            expect(graph.contentKeys).toEqual([]);
            expect(graph.content).toEqual([]);
            expect(graph.contentConfig).toEqual([]);
        });
    });
    describe("When generate is called", () => {
        it("sets background as white when opaqueBackground is set to true", () => {
            const input = getAxes(axisDefault);
            input.opaqueBackground = true;
            new Graph(input);
            expect(
                fetchElementByClass(
                    styles.container
                ).style.backgroundColor.toString()
            ).toEqual(rgb(255, 255, 255).toString());
        });
        it("sets background as transparent when opaqueBackground is set to false", () => {
            const input = getAxes(axisDefault);
            input.opaqueBackground = false;
            new Graph(input);
            expect(
                fetchElementByClass(styles.container).style.backgroundColor
            ).toEqual("");
        });
        it("sets background as transparent when opaqueBackground is set to undefined", () => {
            const input = getAxes(axisDefault);
            new Graph(input);
            expect(
                fetchElementByClass(styles.container).style.backgroundColor
            ).toEqual("");
        });
    });
    describe("When x axis orientation is TOP", () => {
        it("Processes the default input correctly", () => {
            const xAxisTopOrientation = utils.deepClone(axisDefault);
            xAxisTopOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
            const input = getAxes(xAxisTopOrientation);
            graph = new Graph(input);
            expect(graph.config.bindTo).toEqual(input.bindTo);
            expect(graph.config.axis).not.toBeNull();
            expect(graph.config.locale).not.toBeNull();
            expect(graph.config.d3Locale).not.toBeNull();
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(graph.config.showLabel).toEqual(true);
            expect(graph.config.showLegend).toEqual(true);
            expect(graph.config.showNoDataText).toEqual(true);
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
            expect(toNumber(translate[0], 10)).toBeCloserTo(67);
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
            expect(toNumber(translate[0], 10)).toBeCloserTo(67);
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
            expect(toNumber(translate[0], 10)).toBeCloserTo(67);
            expect(toNumber(translate[1], 10)).toBeCloserTo(10);
        });
    });
});
