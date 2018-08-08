"use strict";
import Graph from "../../../main/js/controls/Graph/index";
import Line from "../../../main/js/controls/Line/Line";
import { getXAxisWidth } from "../../../main/js/helpers/axis";
import constants, { AXIS_TYPE } from "../../../main/js/helpers/constants";
import errors from "../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../main/js/helpers/legend";
import styles from "../../../main/js/helpers/styles";
import utils from "../../../main/js/helpers/utils";
import LOCALE from "../../../main/js/locale/index";
import {
    axisDefault,
    axisTimeSeries,
    dimension,
    fetchElementByClass,
    getAxes,
    getData,
    triggerEvent,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Graph", () => {
    let graph = null;
    let graphContainer;
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
    describe("when constructed", () => {
        it("throws error on undefined input", () => {
            expect(() => {
                graph = new Graph();
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("initializes properly", () => {
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
    describe("when input is loaded", () => {
        it("throws error if no bind is present", () => {
            expect(() => {
                const input = getAxes(axisDefault);
                input.bindTo = "";
                new Graph(input);
            }).toThrowError(errors.THROW_MSG_NO_BIND);
        });
        describe("axis - throws error", () => {
            it("if no axis is present", () => {
                expect(() => {
                    new Graph(getAxes({}));
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if no x axis is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: {},
                            y: axisDefault.y
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if no y axis is present", () => {
                expect(() => {
                    new Graph(
                        getAxes({
                            x: axisDefault.x,
                            y: {}
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if x axis type is different than allowed", () => {
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
            it("if x axis lowerLimit is not present", () => {
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
            it("if x axis upperLimit is not present", () => {
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
            it("if y axis lowerLimit is not present", () => {
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
            it("if y axis upperLimit is not present", () => {
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
            it("if y axis label is not present", () => {
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
            it("if y2 axis is enabled but not lowerLimit is present", () => {
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
            it("if y2 axis is enabled but not upperLimit is present", () => {
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
            it("if y2 axis is enabled but not label is present", () => {
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
        it("throws error on empty input", () => {
            expect(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent({});
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("throws error on null input", () => {
            expect(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent(null);
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("processes the default input without any error", () => {
            expect(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent(new Line(getData(valuesDefault)));
            }).not.toThrow();
        });
        it("processes the timeseries input without any error", () => {
            expect(() => {
                graph = new Graph(getAxes(axisTimeSeries));
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).not.toThrow();
        });
        it("loads the content correctly", () => {
            const primaryContent = new Line(getData(valuesDefault));
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            expect(graph.content).toEqual([primaryContent]);
            expect(graph.contentTargets).toEqual([primaryContent.config]);
            expect(graph.content.length).toBe(1);
            expect(graph.contentTargets.length).toBe(1);
        });
        it("changes to new object has no impact on base object", () => {
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
        it("processes the default input correctly", () => {
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
            expect(graph.config.axis.y.ticks).toEqual({});
            expect(graph.config.axis.x.show).toEqual(true);
            expect(graph.config.axis.y.show).toEqual(true);
        });
        it("processes the timeseries input correctly", () => {
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
            expect(graph.config.axis.x.ticks).toEqual({});
            expect(graph.config.axis.y.ticks).toEqual({});
            expect(graph.config.axis.x.show).toEqual(true);
            expect(graph.config.axis.y.show).toEqual(true);
        });
        it("process bindLegendTo correctly", () => {
            const input = utils.deepClone(getAxes(axisDefault));
            input.bindLegendTo = "#lineLegendContainer";
            graph = new Graph(input);
            expect(graph.config.bindLegendTo).toEqual(input.bindLegendTo);
        });
    });
    describe("when beforeInit is called", () => {
        describe("with normal type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisDefault));
            });
            it("sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.min
                ).toBeUndefined();
            });
            it("gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.max
                ).toBeUndefined();
            });
            it("does not extends Y Axis domain lower limit", () => {
                expect(
                    graph.config.axis[constants.Y_AXIS].domain.lowerLimit
                ).toEqual(0);
            });
            it("does not extends Y Axis domain upper limit", () => {
                expect(
                    graph.config.axis[constants.Y_AXIS].domain.upperLimit
                ).toEqual(20);
            });
        });
        describe("with timeseries type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisTimeSeries));
            });
            it("sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.min
                ).toBeUndefined();
            });
            it("gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(
                    graph.config.axis[constants.Y_AXIS].dataRange.max
                ).toBeUndefined();
            });
        });
        describe("with normal type values and input loaded", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisDefault));
                graph.loadContent(new Line(getData(valuesDefault)));
            });
            it("sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.min).toBe(
                    4
                );
            });
            it("gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.max).toBe(
                    35
                );
            });
            it("extends Y Axis domain, if lower bound is less", () => {
                expect(
                    graph.config.axis[constants.Y_AXIS].domain.lowerLimit
                ).toBeLessThan(0);
            });
            it("extends Y Axis domain, if upper bound is less", () => {
                expect(
                    graph.config.axis[constants.Y_AXIS].domain.upperLimit
                ).toBeGreaterThan(20);
            });
        });
        describe("with timeseries type values and input loaded", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisTimeSeries));
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            });
            it("sets the graph container correctly", () => {
                expect(graph.graphContainer).not.toBeNull();
                expect(graph.graphContainer.node()).not.toBeNull();
            });
            it("gets the min bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].lowerLimit).toBe(0);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.min).toBe(
                    1
                );
            });
            it("gets the max bound for Y Axis correctly", () => {
                expect(graph.config.axis[constants.Y_AXIS].upperLimit).toBe(20);
                expect(graph.config.axis[constants.Y_AXIS].dataRange.max).toBe(
                    100
                );
            });
        });
    });
    describe("when init is called", () => {
        describe("with normal type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisDefault));
            });
            it("sets canvas width", () => {
                expect(graph.config.canvasWidth).not.toBe(0);
                expect(graph.config.canvasWidth).toBe(1024);
            });
            it("sets canvas height", () => {
                expect(graph.config.canvasHeight).not.toBe(0);
                expect(graph.config.canvasHeight).toBeGreaterThan(0);
            });
            it("sets the height correctly", () => {
                expect(graph.config.height).toBe(235);
            });
            it("returns the consumer set height if dimension is provided", () => {
                graph = new Graph(
                    Object.assign(
                        { dimension },
                        getAxes(axisDefault),
                        dimension
                    )
                );
                expect(graph.config.height).toBe(dimension.height);
            });
            it("calculates X axis height", () => {
                expect(graph.config.axisSizes.x).not.toBe(0);
                expect(graph.config.axisSizes.x).not.toBeNull();
                expect(graph.config.axisSizes.x).toBeGreaterThan(0);
            });
            it("calculates Y Axis width", () => {
                expect(graph.config.axisSizes.y).not.toBe(0);
                expect(graph.config.axisSizes.y).not.toBeNull();
                expect(graph.config.axisSizes.y).toBeGreaterThan(0);
            });
            it("calculates X axis label height", () => {
                expect(graph.config.axisLabelHeights.x).not.toBe(0);
                expect(graph.config.axisLabelHeights.x).not.toBeNull();
                expect(graph.config.axisLabelHeights.x).toBeGreaterThan(0);
            });
            it("calculates Y axis label width", () => {
                expect(graph.config.axisLabelWidths.y).not.toBe(0);
                expect(graph.config.axisLabelWidths.y).not.toBeNull();
                expect(graph.config.axisLabelWidths.y).toBeGreaterThan(0);
            });
            it("calculates X axis d3 scale using domain and range", () => {
                expect(graph.scale.x).not.toBeNull();
                expect(graph.scale.x).toEqual(jasmine.any(Function));
            });
            it("calculates Y axis d3 scale using domain and range", () => {
                expect(graph.scale.y).not.toBeNull();
                expect(graph.scale.y).toEqual(jasmine.any(Function));
            });
        });
        describe("with timeseries type values", () => {
            beforeEach(() => {
                graph = new Graph(getAxes(axisTimeSeries));
            });
            it("calculates X axis d3 scale using domain and range", () => {
                expect(graph.scale.x).not.toBeNull();
                expect(graph.scale.x).toEqual(jasmine.any(Function));
            });
            it("calculates Y axis d3 scale using domain and range", () => {
                expect(graph.scale.y).not.toBeNull();
                expect(graph.scale.y).toEqual(jasmine.any(Function));
            });
        });
    });
    describe("when generate is called", () => {
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
        });
        it("creates the container svg", () => {
            const graphElem = document.querySelector(graph.config.bindTo);
            expect(graphElem).not.toBeNull();
            expect(graphElem.children[0].nodeName).toBe("DIV");
            expect(graphElem.children[0].getAttribute("class")).toBe(
                styles.container
            );
        });
        it("creates graph elements in order", () => {
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
        it("creates canvas elements in order", () => {
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
            const axisXLabelElement = fetchElementByClass(styles.canvas)
                .childNodes[6];
            const axisYLabelElement = fetchElementByClass(styles.canvas)
                .childNodes[7];
            const axisReferenceLintElement = fetchElementByClass(styles.canvas)
                .childNodes[8];
            expect(defsElement).not.toBeNull();
            expect(regionElement).not.toBeNull();
            expect(gridElement).not.toBeNull();
            expect(axisXElement).not.toBeNull();
            expect(axisYElement).not.toBeNull();
            expect(contentContainer).not.toBeNull();
            expect(axisXLabelElement).not.toBeNull();
            expect(axisYLabelElement).not.toBeNull();
            expect(axisReferenceLintElement).not.toBeNull();

            expect(defsElement.nodeName).toBe("defs");
            expect(regionElement.nodeName).toBe("g");
            expect(gridElement.nodeName).toBe("g");
            expect(axisXElement.nodeName).toBe("g");
            expect(axisYElement.nodeName).toBe("g");
            expect(contentContainer.nodeName).toBe("rect");
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
        it("creates the canvas svg", () => {
            const canvas = fetchElementByClass(styles.container).firstChild;
            expect(canvas).not.toBeNull();
            expect(canvas.nodeName).toBe("svg");
            expect(canvas.getAttribute("class")).toBe(styles.canvas);
            expect(+canvas.getAttribute("height")).toBe(
                graph.config.canvasHeight
            );
            expect(+canvas.getAttribute("width")).toBe(
                graph.config.canvasWidth - constants.BASE_CANVAS_WIDTH_PADDING
            );
        });
        it("creates defs element with height and width", () => {
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
                +defsElement.firstChild.firstChild.getAttribute("height")
            ).toBe(graph.config.height);
        });
        it("creates region container", () => {
            const regionElement = fetchElementByClass(styles.canvas)
                .childNodes[1];
            expect(regionElement.nodeName).toBe("g");
            expect(regionElement.getAttribute("class")).toBe(
                styles.regionGroup
            );
        });
        describe("axes", () => {
            it("creates the x axis markup", () => {
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
            });
            it("creates the y axis markup", () => {
                const yAxisElement = fetchElementByClass(styles.axisY);
                expect(yAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisY}`
                );
            });
            it("creates the y axis reference line markup", () => {
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
            it("creates the y2 axis reference line markup", () => {
                graph.destroy();
                new Graph(
                    getAxes({
                        x: axisDefault.x,
                        y: axisDefault.y,
                        y2: {
                            show: true,
                            label: "Some Y2 label",
                            lowerLimit: 0,
                            upperLimit: 200
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
            it("hides x axis when not enabled", () => {
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
            it("hides y axis when not enabled", () => {
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
            it("creates the y axis reference line markup even when hidden", () => {
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
            it("hides x and y axis when not enabled", () => {
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
            describe("for timeseries type", () => {
                it("creates x axis with ticks in default locale", () => {
                    graph.destroy();
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
                it("creates x axis with ticks in provided locale - DE", () => {
                    graph.destroy();
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
                it("creates x axis with ticks in provided locale - FR", () => {
                    graph.destroy();
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
                it("creates x axis with ticks in provided locale - ES", () => {
                    graph.destroy();
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
                it("creates x axis with ticks in provided locale - PT_BR", () => {
                    graph.destroy();
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
            });
            describe("for default type", () => {
                it("creates x axis with ticks in default locale", () => {
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
                it("creates x axis with ticks in provided locale - DE", () => {
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
        describe("grid", () => {
            it("creates the grid markup", () => {
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.grid}`)
                ).not.toBeNull();
                const gridElement = fetchElementByClass(styles.grid);
                expect(gridElement.childElementCount).toBe(2);
            });
            it("creates the grid markup with tick values provided", () => {
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
            it("creates the horizontal grid markup", () => {
                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridH}`)
                ).not.toBeNull();
                expect(
                    gridElement.querySelector(`.${styles.gridH}`).nodeName
                ).toBe("g");
            });
            it("creates the vertical grid markup", () => {
                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridV}`)
                ).not.toBeNull();
                expect(
                    gridElement.querySelector(`.${styles.gridV}`).nodeName
                ).toBe("g");
            });
            it("hides the horizontal grid if not enabled", () => {
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
            it("hides the vertical grid if not enabled", () => {
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
        describe("content container", () => {
            it("creates the container markup", () => {
                const canvasElement = fetchElementByClass(styles.canvas);
                const containerElement = canvasElement.querySelector(
                    `.${styles.contentContainer}`
                );
                expect(containerElement).not.toBeNull();
                expect(containerElement.nodeName).toBe("rect");
                expect(+containerElement.getAttribute("x")).toBe(
                    graph.config.axisSizes.y + graph.config.axisLabelWidths.y
                );
                expect(+containerElement.getAttribute("y")).toBe(
                    constants.PADDING.top
                );
            });
        });
        describe("label", () => {
            it("hides the label when not enabled", () => {
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
            it("creates labels for x and y axes when text is present", () => {
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
            it("creates label x axis when text is present", () => {
                graph.destroy();
                graph = new Graph(getAxes(axisDefault));

                const xLabelElement = fetchElementByClass(styles.axisLabelX);
                expect(xLabelElement.nodeName).toBe("g");
                expect(xLabelElement.querySelector("tspan").textContent).toBe(
                    axisDefault.x.label
                );
            });
            it("creates label y axis when text is present", () => {
                graph.destroy();
                graph = new Graph(getAxes(axisDefault));

                const yLabelElement = fetchElementByClass(styles.axisLabelY);
                expect(yLabelElement.nodeName).toBe("g");
                expect(yLabelElement.querySelector("tspan").textContent).toBe(
                    axisDefault.y.label
                );
                expect(yLabelElement.getAttribute("transform")).toContain(
                    "rotate(-90)"
                );
                expect(yLabelElement.getAttribute("transform")).toContain(
                    "translate(34, 115)"
                );
            });
            it("changes label y axis position when height proprty of graph is set to custom value", () => {
                graph.destroy();
                const axes = getAxes(axisDefault);
                axes.dimension = { height: 100 };
                graph = new Graph(axes);

                const yLabelElement = fetchElementByClass(styles.axisLabelY);
                expect(yLabelElement.getAttribute("transform")).not.toContain(
                    "translate(34, 115)"
                );
                expect(yLabelElement.getAttribute("transform")).toContain(
                    "translate(34, 47.5)"
                );
            });
            it("doesnt create label x axis when text is not present", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.x.label = "";
                graph = new Graph(getAxes(labelAxisObj));

                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelX}`)
                ).toBeNull();
            });
            it("throws error when label y axis text is not present", () => {
                expect(() => {
                    graph.destroy();
                    const labelAxisObj = utils.deepClone(axisDefault);
                    labelAxisObj.y.label = "";
                    graph = new Graph(getAxes(labelAxisObj));
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
            });
            it("sanitizes x axis label text", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.x.label = "<HELLO DUMMY X LABEL>";
                graph = new Graph(getAxes(labelAxisObj));

                const xLabelElement = fetchElementByClass(styles.axisLabelX);
                expect(xLabelElement.querySelector("tspan").textContent).toBe(
                    "&lt;HELLO DUMMY X LABEL&gt;"
                );
            });
            it("sanitizes y axis label text", () => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.y.label = "<HELLO DUMMY Y LABEL>";
                graph = new Graph(getAxes(labelAxisObj));

                const yLabelElement = fetchElementByClass(styles.axisLabelY);
                expect(yLabelElement.querySelector("tspan").textContent).toBe(
                    "&lt;HELLO DUMMY Y LABEL&gt;"
                );
            });
        });
        describe("legend", () => {
            it("throws error when legend is loaded without a click handler", () => {
                expect(() => {
                    loadLegendItem({}, {}, {}, {});
                }).toThrowError(
                    "Invalid Argument: eventHandlers needs a clickHandler callback function."
                );
            });
            it("throws error when legend is loaded without a hover handler", () => {
                expect(() => {
                    loadLegendItem({}, {}, {}, { clickHandler: Function });
                }).toThrowError(
                    "Invalid Argument: eventHandlers needs a hoverHandler callback function."
                );
            });
            it("throws error when legend is loaded without a label value", () => {
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
                }).toThrowError(
                    "Invalid Argument: label needs to be a valid string."
                );
            });
            it("loads legend in separate container when bindLegendTo used", () => {
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
            it("hides legend when not enabled", () => {
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
        describe("validates content for unique keys", () => {
            it("throws error if content doesn't have a unique key", () => {
                graph = new Graph(Object.assign(getAxes(axisDefault)));
                graph.loadContent(new Line(getData(valuesDefault)));
                expect(() => {
                    graph.loadContent(new Line(getData(valuesDefault)));
                }).toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
            });
            it("doesn't throws error if content has unique keys", () => {
                graph = new Graph(Object.assign(getAxes(axisDefault)));
                graph.loadContent(new Line(getData(valuesDefault)));
                expect(() => {
                    const uniqueData = getData(valuesDefault);
                    uniqueData.key = "uid_2";
                    graph.loadContent(new Line(uniqueData));
                }).not.toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
            });
        });
        it("attaches event handlers", () => {
            graph.resizeHandler();
            expect(graph.resizeHandler).not.toBeNull();
            expect(graph.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("when resize is called", () => {
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
        });
        it("sets the canvas width correctly", () => {
            const currentWidth = graph.config.canvasWidth;
            expect(currentWidth).toBe(1024);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            expect(graph.config.canvasWidth).toBe(800);
        });
        it("sets the defs clipPath width and height correctly", () => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            const clipPathRect = defsElement.firstChild.firstChild;
            expect(+clipPathRect.getAttribute("height")).toBe(
                graph.config.height
            );
            expect(+clipPathRect.getAttribute("width")).toBe(
                getXAxisWidth(graph.config)
            );
        });
        it("calculates X axis d3 scale using domain and range", () => {
            graph.resize();
            expect(graph.scale.x).not.toBeNull();
            expect(graph.scale.x).toEqual(jasmine.any(Function));
        });
        it("calculates Y axis d3 scale using domain and range", () => {
            graph.resize();
            expect(graph.scale.y).not.toBeNull();
            expect(graph.scale.y).toEqual(jasmine.any(Function));
        });
        it("translates the canvas", () => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            expect(
                +fetchElementByClass(styles.canvas).getAttribute("height")
            ).not.toBe(0);
            expect(
                +fetchElementByClass(styles.canvas).getAttribute("height")
            ).toBeGreaterThan(0);
            expect(
                +fetchElementByClass(styles.canvas).getAttribute("width")
            ).toBe(790);
        });
        it("sets the content container width and height correctly", (done) => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(+contentContainer.getAttribute("height")).toBe(
                    graph.config.height
                );
                expect(+contentContainer.getAttribute("width")).toBe(
                    getXAxisWidth(graph.config)
                );
                done();
            });
        });
        it("sets the throttle correctly, if undefined", () => {
            const throttledInput = getAxes(axisDefault);
            throttledInput.throttle = undefined;
            graph.destroy();
            graph = new Graph(throttledInput);
            expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
        });
        it("sets the throttle correctly", () => {
            const throttledInput = getAxes(axisDefault);
            throttledInput.throttle = 400;
            graph.destroy();
            graph = new Graph(throttledInput);
            expect(graph.config.throttle).toEqual(400);
            expect(graph.config.throttle).not.toEqual(
                constants.RESIZE_THROTTLE
            );
        });
        it("throttles based on delay", (done) => {
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
        it("throttles based on delay provided in the input", (done) => {
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
    });
    describe("when unload is called", () => {
        const primaryContent = new Line(getData(valuesDefault));
        const secondaryContent = new Line(getData(valuesDefault));
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
        });
        it("throws error when unloading a content which isnt loaded", () => {
            expect(() => {
                graph.unloadContent(secondaryContent);
            }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        });
        it("Removes the content successfully", () => {
            graph.unloadContent(primaryContent);
            expect(graph.content).toEqual([]);
            expect(graph.contentTargets).toEqual([]);
            expect(graph.content.length).toBe(0);
            expect(graph.contentTargets.length).toBe(0);
        });
    });
    describe("when destruct is called", () => {
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
            graph.destroy();
        });
        it("Does not throw error if graph container does not exist", () => {
            expect(() => {
                graph.destroy();
            }).not.toThrow();
        });
        it("removes the canvas content", () => {
            expect(fetchElementByClass(styles.canvas)).toBeNull();
        });
        it("removes the legend content", () => {
            expect(fetchElementByClass(styles.legend)).toBeNull();
        });
        it("removes the region group content", () => {
            expect(fetchElementByClass(styles.regionGroup)).toBeNull();
        });
        it("removes the container content", () => {
            expect(fetchElementByClass(styles.container)).toBeNull();
        });
        it("resets the API objects", () => {
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
                shownTargets: Object({})
            });
            expect(graph.axis).toEqual({});
            expect(graph.scale).toEqual({});
            expect(graph.svg).toBeNull();
            expect(graph.resizeHandler).toBeNull();
            expect(graph.content).toEqual([]);
            expect(graph.contentTargets).toEqual([]);
        });
    });
});
