"use strict";
import d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import { getXAxisWidth } from "../../../../main/js/controls/Gantt/helpers/creationHelpers";
import Track from "../../../../main/js/controls/Gantt/Track";
import constants, {
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import errors from "../../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../../main/js/helpers/legend";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import LOCALE from "../../../../main/js/locale/index";
import {
    delay,
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../helpers/commonHelpers";
import {
    axisJSON,
    BASE_CANVAS_HEIGHT_PADDING,
    datelineAlt,
    datelineJSON,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getData,
    legendJSON,
    trackDimension
} from "./helpers";

describe("Gantt", () => {
    let gantt = null;
    let ganttChartContainer;
    beforeEach(() => {
        ganttChartContainer = document.createElement("div");
        ganttChartContainer.id = "testCarbonGantt";
        ganttChartContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        ganttChartContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(ganttChartContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("Throws error on undefined input", () => {
            expect(() => {
                gantt = new Gantt();
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on null input", () => {
            expect(() => {
                gantt = new Gantt(null);
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on [] input", () => {
            expect(() => {
                gantt = new Gantt([]);
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on '' input", () => {
            expect(() => {
                gantt = new Gantt("");
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on {} input", () => {
            expect(() => {
                gantt = new Gantt({});
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Initializes properly", () => {
            gantt = new Gantt(getAxes(axisJSON));
            expect(gantt.graphContainer).not.toBeNull();
            expect(gantt.config).not.toBeNull();
            expect(gantt.axis).not.toBeNull();
            expect(gantt.scale).not.toBeNull();
            expect(gantt.legendSVG).toBeNull();
            expect(gantt.svg).not.toBeNull();
            expect(gantt.tracks).toEqual([]);
            expect(gantt.trackConfig).toEqual([]);
            expect(gantt.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("When input is loaded", () => {
        it("Throws error if no bind is present", () => {
            expect(() => {
                const input = getAxes(axisJSON);
                input.bindTo = "";
                new Gantt(input);
            }).toThrowError(errors.THROW_MSG_NO_BIND);
        });
        describe("Axis - throws error", () => {
            it("if no axis is present", () => {
                expect(() => {
                    new Gantt(getAxes({}));
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if no x axis is present", () => {
                expect(() => {
                    new Gantt(
                        getAxes({
                            x: {}
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if x axis lowerLimit is not present", () => {
                expect(() => {
                    new Gantt(
                        getAxes({
                            x: {
                                upperLimit: new Date(
                                    2019,
                                    1,
                                    1,
                                    12
                                ).toISOString()
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("if x axis upperLimit is not present", () => {
                expect(() => {
                    new Gantt(
                        getAxes({
                            x: {
                                lowerLimit: new Date(
                                    2019,
                                    1,
                                    1,
                                    12
                                ).toISOString()
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_LIMIT_INFO);
            });
            it("if x axis lowerLimit is not valid", () => {
                expect(() => {
                    new Gantt(
                        getAxes({
                            x: {
                                lowerLimit: 10,
                                upperLimit: new Date(
                                    2019,
                                    1,
                                    1,
                                    12
                                ).toISOString()
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_INVALID_AXIS_TYPE_VALUES);
            });
            it("if x axis upperLimit is not valid", () => {
                expect(() => {
                    new Gantt(
                        getAxes({
                            x: {
                                lowerLimit: new Date(
                                    2018,
                                    1,
                                    1,
                                    12
                                ).toISOString(),
                                upperLimit: 10
                            }
                        })
                    );
                }).toThrowError(errors.THROW_MSG_INVALID_AXIS_TYPE_VALUES);
            });
        });
        it("Processes the default input without any error", () => {
            expect(() => {
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(getData());
            }).not.toThrow();
        });
        it("Loads the content correctly", () => {
            const primaryContent = getData();
            const mockTrack = new Track(primaryContent);
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(primaryContent);
            expect(gantt.tracks).toEqual([primaryContent.key]);
            expect(gantt.trackConfig[0].key).toEqual(mockTrack.key);
            expect(gantt.trackConfig[0].trackLabel).toEqual(
                mockTrack.trackLabel
            );
            expect(gantt.trackConfig[0].tasks).toEqual(mockTrack.tasks);
            expect(gantt.tracks.length).toBe(1);
            expect(gantt.trackConfig.length).toBe(1);
        });
        it("Throws error when duplicate key is provided for content", () => {
            expect(() => {
                const primaryContent = getData();
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(primaryContent);
                gantt.loadContent(primaryContent);
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Changes to new object has no impact on base object", () => {
            const data = getData();
            const input = getAxes(axisJSON);
            gantt = new Gantt(input);
            gantt.loadContent(data);
            input.bindTo = "";
            input.axis = {};
            input.tracks = null;
            data.tasks = [];
            const cfg = gantt.config;
            expect(input.bindTo).toBe("");
            expect(input.axis).toEqual({});
            expect(data.tasks).toEqual([]);
            expect(cfg.bindTo).toBe("#testCarbonGantt");
            expect(cfg.axis.x.lowerLimit).toBe(axisJSON.x.lowerLimit);
            expect(cfg.axis.x.upperLimit).toBe(axisJSON.x.upperLimit);
            expect(gantt.trackConfig.length).toBe(1);
            expect(gantt.trackConfig[0].config.key).toBe(data.key);
        });
        it("Processes the default input correctly", () => {
            const input = getAxes(axisJSON);
            gantt = new Gantt(input);
            expect(gantt.config.bindTo).toEqual(input.bindTo);
            expect(gantt.config.bindLegendTo).toEqual(input.bindLegendTo);
            expect(gantt.config.axis).not.toBeNull();
            expect(gantt.config.locale).not.toBeNull();
            expect(gantt.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(gantt.config.dateline).toEqual(input.dateline || []);
            expect(gantt.config.actionLegend).toEqual(input.actionLegend || []);
            expect(gantt.config.axis.x.type).toEqual(AXIS_TYPE.TIME_SERIES);
            expect(gantt.config.axis.x.ticks).toEqual({});
            expect(gantt.config.axis.x.domain[0]).toEqual(
                utils.parseDateTime(input.axis.x.lowerLimit)
            );
            expect(gantt.config.axis.x.domain[1]).toEqual(
                utils.parseDateTime(input.axis.x.upperLimit)
            );
            expect(gantt.config.axis.x.rangeRounding).toEqual(true);
            expect(gantt.config.axis.x.show).toEqual(true);
            expect(gantt.config.axis.y.show).toEqual(true);
            expect(gantt.config.shownTargets).toEqual([]);
        });
        it("Processes bindLegendTo correctly", () => {
            const input = utils.deepClone(getAxes(axisJSON));
            input.bindLegendTo = "#ganttChartLegendContainer";
            gantt = new Gantt(input);
            expect(gantt.config.bindLegendTo).toEqual(input.bindLegendTo);
        });
    });
    /**
     * BF12182018.01 - Verify the consumer has the option to provide custom padding for the graph-container.
     */
    describe("When custom padding is used in input", () => {
        it("default padding is applied when no custom padding is used", () => {
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            gantt = new Gantt(ganttConfig);
            const expectedOutput = {
                top: 10,
                bottom: 5,
                left: 100, // defaults to constants trackLabel
                right: 50,
                hasCustomPadding: false
            };
            expect(gantt.config.padding).toEqual(expectedOutput);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (5 + 10) * 2
            );
        });
        it("default padding applied when custom padding half used", () => {
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                top: 50
            };
            gantt = new Gantt(ganttConfig);
            const expectedOutput = {
                top: 50,
                bottom: 5,
                left: 100,
                right: 50,
                hasCustomPadding: true
            };
            expect(gantt.config.padding).toEqual(expectedOutput);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (50 + 5) * 2
            );
        });
        it("position of content container starts where canvas starts", () => {
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                left: 0,
                right: 0,
                bottom: 0,
                top: 0
            };
            gantt = new Gantt(ganttConfig);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
        it("position of content container shifts right, when left padding is applied", () => {
            // Ideally, Gantt wouldn't be using left and right padding, but it uses trackLabel.
            // When custom padding is applied, trackLabel's value is defaulted to left padding value.
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                left: 20,
                right: 0,
                bottom: 0,
                top: 0
            };
            gantt = new Gantt(ganttConfig);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
        it("position of content container shifts bottom, when top padding is applied", () => {
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                left: 0,
                right: 0,
                bottom: 0,
                top: 20
            };
            gantt = new Gantt(ganttConfig);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
        it("position of content container shifts top, when bottom padding is applied", () => {
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                left: 0,
                right: 0,
                bottom: 20,
                top: 0
            };
            gantt = new Gantt(ganttConfig);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
        it("width and height of the content container is equal to width and height of the canvas when no padding", () => {
            const primaryContent = getData();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                left: 0,
                right: 0,
                bottom: 0,
                top: 0
            };
            gantt = new Gantt(ganttConfig);
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            const canvas = d3.select(`.${styles.canvas}`);
            expect(contentContainer.attr("width")).toEqual(
                canvas.attr("width")
            );
            expect(gantt.config.canvasHeight).toEqual(gantt.config.height);
        });
    });
    describe("When beforeInit is called", () => {
        describe("With normal type values", () => {
            beforeEach(() => {
                gantt = new Gantt(getAxes(axisJSON));
            });
            it("Sets the gantt container correctly", () => {
                expect(gantt.graphContainer).not.toBeNull();
                expect(gantt.graphContainer.node()).not.toBeNull();
            });
            it("Gets the min bound for Y Axis correctly", () => {
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            });
            it("Gets the max bound for Y Axis correctly", () => {
                expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
            });
            it("Sets the height correctly", () => {
                expect(gantt.config.height).toBe(0);
            });
        });
        describe("With input loaded", () => {
            beforeEach(() => {
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(getData());
            });
            it("Sets the gantt container correctly", () => {
                expect(gantt.graphContainer).not.toBeNull();
                expect(gantt.graphContainer.node()).not.toBeNull();
            });
            it("Gets the min bound for Y Axis correctly", () => {
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            });
            it("Gets the max bound for Y Axis correctly", () => {
                expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
            });
            it("Sets the height correctly", () => {
                expect(gantt.config.height).toBe(
                    constants.DEFAULT_GANTT_TRACK_HEIGHT
                );
            });
        });
    });
    describe("When init is called", () => {
        describe("Without content loaded", () => {
            beforeEach(() => {
                gantt = new Gantt(getAxes(axisJSON));
            });
            it("Sets canvas width", () => {
                expect(gantt.config.canvasWidth).not.toBe(0);
                expect(gantt.config.canvasWidth).toBe(1024);
            });
            it("Sets canvas height", () => {
                expect(gantt.config.canvasHeight).toBe(
                    BASE_CANVAS_HEIGHT_PADDING
                );
            });
            it("Calculates X axis height", () => {
                expect(gantt.config.axisSizes.x).toBeGreaterThan(0);
            });
            it("Calculates Y Axis width", () => {
                expect(gantt.config.axisSizes.y).toBeGreaterThan(0);
            });
            it("Calculates Y axis label width", () => {
                expect(gantt.config.axisLabelWidths.y).toBeGreaterThan(0);
                expect(gantt.config.axisLabelWidths.y).toBe(
                    constants.PADDING.trackLabel
                );
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(gantt.scale.x).not.toBeNull();
                expect(gantt.scale.x).toEqual(jasmine.any(Function));
                expect(gantt.scale.x.range()).toEqual([
                    0,
                    getXAxisWidth(gantt.config)
                ]);
            });
            it("Calculates Y axis d3 scale using domain and range", () => {
                expect(gantt.scale.y).not.toBeNull();
                expect(gantt.scale.y).toEqual(jasmine.any(Function));
                expect(gantt.scale.y.domain()).toEqual([]);
                expect(gantt.scale.y.range()).toEqual([0]);
            });
        });
        describe("With content loaded", () => {
            beforeEach(() => {
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(getData());
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(gantt.scale.x).not.toBeNull();
                expect(gantt.scale.x).toEqual(jasmine.any(Function));
                expect(gantt.scale.x.domain()[0]).not.toEqual(
                    axisJSON.x.lowerLimit
                );
                expect(gantt.scale.x.domain()[1]).not.toEqual(
                    axisJSON.x.upperLimit
                );
                expect(gantt.scale.x.range()).toEqual([
                    0,
                    getXAxisWidth(gantt.config)
                ]);
            });
            it("Calculates Y axis d3 scale using domain and range", () => {
                expect(gantt.scale.y).not.toBeNull();
                expect(gantt.scale.y).toEqual(jasmine.any(Function));
                expect(gantt.scale.y.domain()).toEqual(["Project A"]);
                expect(gantt.scale.y.range()).toEqual([0, 41]);
            });
        });
        /**
         * CH01312019.01 - Verify the consumer will have the option to disable axis range rounding for the X axis
         */
        describe("With content loaded when domain is not extended using d3.nice", () => {
            let domains;
            beforeEach(() => {
                const axis = utils.deepClone(axisJSON);
                axis.x.rangeRounding = false;
                const config = {
                    bindTo: "#testCarbonGantt",
                    axis
                };
                gantt = new Gantt(config);
                domains = gantt.scale.x.domain();
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(gantt.config.axis.x.rangeRounding).toEqual(false);
                expect(gantt.scale.x).not.toBeNull();
                expect(gantt.scale.x).toEqual(jasmine.any(Function));
                expect(gantt.scale.x.domain()[0].toISOString()).toEqual(
                    axisJSON.x.lowerLimit
                );
                expect(gantt.scale.x.domain()[1].toISOString()).toEqual(
                    axisJSON.x.upperLimit
                );
                expect(gantt.scale.x.range()).toEqual([
                    0,
                    getXAxisWidth(gantt.config)
                ]);
            });
            it("Domains change when d3.nice is enabled", () => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                const currentDomains = gantt.scale.x.domain();
                expect(domains[0]).not.toEqual(currentDomains[0]);
                expect(domains[1]).not.toEqual(currentDomains[1]);
            });
        });
    });
    describe("When generate is called", () => {
        beforeEach(() => {
            gantt = new Gantt(getAxes(axisJSON));
        });
        it("Creates the container svg", () => {
            const graphElem = document.querySelector(gantt.config.bindTo);
            expect(graphElem).not.toBeNull();
            expect(graphElem.children[0].nodeName).toBe("DIV");
            expect(graphElem.children[0].getAttribute("class")).toBe(
                styles.container
            );
        });
        it("Creates gantt elements in order - with showActionLegend", () => {
            gantt.destroy();
            gantt = new Gantt(
                Object.assign(
                    {
                        showActionLegend: true
                    },
                    getAxes(axisJSON)
                )
            );
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
        it("Creates gantt elements in order - without showActionLegend", () => {
            const canvas = fetchElementByClass(styles.container).childNodes[0];
            const legend = fetchElementByClass(styles.container).childNodes[1];
            expect(canvas).not.toBeNull();
            expect(canvas.getAttribute("class")).toBe(styles.canvas);
            expect(canvas.nodeName).toBe("svg");
            expect(canvas.getAttribute("role")).toBe("img");
            expect(legend).toBeUndefined();
        });
        it("Creates canvas elements in order", () => {
            const defsElement = fetchElementByClass(styles.canvas)
                .childNodes[0];
            const gridElement = fetchElementByClass(styles.canvas)
                .childNodes[1];
            const contentContainer = fetchElementByClass(styles.canvas)
                .childNodes[2];
            const axisXElement = fetchElementByClass(styles.canvas)
                .childNodes[3];
            const axisYElement = fetchElementByClass(styles.canvas)
                .childNodes[4];
            expect(defsElement).not.toBeNull();
            expect(gridElement).not.toBeNull();
            expect(axisXElement).not.toBeNull();
            expect(axisYElement).not.toBeNull();
            expect(contentContainer).not.toBeNull();

            expect(defsElement.nodeName).toBe("defs");
            expect(gridElement.nodeName).toBe("g");
            expect(axisXElement.nodeName).toBe("g");
            expect(axisYElement.nodeName).toBe("g");
            expect(contentContainer.nodeName).toBe("rect");
            expect(gridElement.getAttribute("class")).toBe(styles.grid);
            expect(axisXElement.classList).toContain(styles.axis);
            expect(axisXElement.classList).toContain(styles.axisX);
            expect(axisYElement.classList).toContain(styles.axis);
            expect(axisYElement.classList).toContain(styles.axisY);
            expect(contentContainer.classList).toContain(
                styles.contentContainer
            );
        });
        it("Creates the canvas svg", () => {
            const canvas = fetchElementByClass(styles.container).firstChild;
            expect(canvas).not.toBeNull();
            expect(canvas.nodeName).toBe("svg");
            expect(canvas.getAttribute("class")).toBe(styles.canvas);
            expect(+canvas.getAttribute("height")).toBe(
                gantt.config.canvasHeight
            );
            expect(+canvas.getAttribute("width")).toBe(
                gantt.config.canvasWidth - constants.BASE_CANVAS_WIDTH_PADDING
            );
        });
        it("Creates defs element with height and width", () => {
            const currentWidth =
                gantt.config.axisSizes.y +
                gantt.config.axisLabelWidths.y +
                (constants.PADDING.top + constants.PADDING.bottom) * 2;
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.firstChild.nodeName).toBe("clipPath");
            expect(defsElement.firstChild.firstChild.nodeName).toBe("rect");
            expect(
                defsElement.firstChild.firstChild.getAttribute("width")
            ).toBe(`${1024 - currentWidth}`);
            expect(
                +defsElement.firstChild.firstChild.getAttribute("height")
            ).toBe(gantt.config.height);
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
            it("Creates the grid markup with tick values provided", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x.ticks = {
                    values: [
                        new Date(2018, 2, 1, 12).toISOString(),
                        new Date(2018, 4, 1, 12).toISOString(),
                        new Date(2018, 6, 1, 12).toISOString()
                    ]
                };
                gantt = new Gantt(getAxes(localeAxisObj));
                gantt.loadContent(getData());

                const gridElement = fetchElementByClass(styles.grid);
                const gridHElement = fetchElementByClass(styles.gridH);
                const gridVElement = fetchElementByClass(styles.gridV);
                expect(gridElement.childElementCount).toBe(2);
                expect(gridHElement.querySelectorAll(".tick").length).toBe(1);
                expect(gridVElement.querySelectorAll(".tick").length).toBe(3);
            });
            it("Creates the horizontal grid markup", () => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(getData());
                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridH}`)
                ).not.toBeNull();
                expect(
                    gridElement.querySelector(`.${styles.gridH}`).nodeName
                ).toBe("g");
            });
            it("Creates the vertical grid markup", () => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(getData());
                const gridElement = fetchElementByClass(styles.grid);
                expect(
                    gridElement.querySelector(`.${styles.gridV}`)
                ).not.toBeNull();
                expect(
                    gridElement.querySelector(`.${styles.gridV}`).nodeName
                ).toBe("g");
            });
            it("creates the grid markup with upperTickValues, values and midTickValues provided", () => {
                gantt.destroy();
                const axis = utils.deepClone(axisJSON);
                axis.x.ticks = {
                    show: true,
                    values: [
                        new Date(2018, 0, 2, 12).toISOString(),
                        new Date(2019, 0, 6, 12).toISOString(),
                        new Date(2019, 0, 11, 12).toISOString()
                    ],
                    upperStepTickValues: [
                        new Date(2019, 0, 1, 12).toISOString(),
                        new Date(2019, 0, 12, 12).toISOString()
                    ],
                    midpointTickValues: [
                        new Date(2019, 0, 3, 12).toISOString(),
                        new Date(2019, 0, 11, 12).toISOString()
                    ]
                };
                gantt = new Gantt(getAxes(axis));

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
            /**
             * Verify if lower step grid lines are displayed with midpoint grid lines or upper grid lines, the lower step grid lines displays as a solid 1px med gray color #9B9B9B
             * Verify the upper step grid line displays as a solid 3px gray color #BCBFC0
             * Verify the midpoint grid lines display as a solid 1px light gray color #E8E9EA
             */
            it("creates the grid markup with upperTickValues, lowerTickValues and midTickValues provided", () => {
                gantt.destroy();
                const axis = utils.deepClone(axisJSON);
                axis.x.ticks = {
                    show: true,
                    lowerStepTickValues: [
                        new Date(2018, 0, 2, 12).toISOString(),
                        new Date(2019, 0, 6, 12).toISOString(),
                        new Date(2019, 0, 11, 12).toISOString()
                    ],
                    upperStepTickValues: [
                        new Date(2019, 0, 1, 12).toISOString(),
                        new Date(2019, 0, 12, 12).toISOString()
                    ],
                    midpointTickValues: [
                        new Date(2019, 0, 3, 12).toISOString(),
                        new Date(2019, 0, 11, 12).toISOString()
                    ]
                };
                gantt = new Gantt(getAxes(axis));

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
            it("creates the grid markup by giving lowerTickValues more precidence than values if both available", () => {
                gantt.destroy();
                const axis = utils.deepClone(axisJSON);
                axis.x.ticks = {
                    show: true,
                    values: [
                        new Date(2018, 0, 2, 12).toISOString(),
                        new Date(2019, 0, 6, 12).toISOString()
                    ],
                    lowerStepTickValues: [
                        new Date(2018, 0, 2, 12).toISOString(),
                        new Date(2019, 0, 6, 12).toISOString(),
                        new Date(2019, 0, 11, 12).toISOString()
                    ]
                };
                gantt = new Gantt(getAxes(axis));
                const gridLowerStepElement = fetchElementByClass(
                    styles.gridLowerStep
                );
                expect(
                    gridLowerStepElement.querySelectorAll(".tick").length
                ).toBe(3);
            });
            it("creates the grid markup with upper values provided", () => {
                gantt.destroy();
                const axis = utils.deepClone(axisJSON);
                axis.x.ticks = {
                    show: true,
                    upperStepTickValues: [
                        new Date(2019, 0, 1, 12).toISOString(),
                        new Date(2019, 0, 12, 12).toISOString()
                    ]
                };
                gantt = new Gantt(getAxes(axis));
                const gridUpperStepElement = fetchElementByClass(
                    styles.gridUpperStep
                );
                expect(
                    gridUpperStepElement.querySelectorAll(".tick").length
                ).toBe(2);
            });
            it("creates the grid markup with mid values provided", () => {
                gantt.destroy();
                const axis = utils.deepClone(axisJSON);
                axis.x.ticks = {
                    show: true,
                    midpointTickValues: [
                        new Date(2019, 0, 1, 12).toISOString(),
                        new Date(2019, 0, 12, 12).toISOString()
                    ]
                };
                gantt = new Gantt(getAxes(axis));
                const gridMidElement = fetchElementByClass(styles.gridMidpoint);
                expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
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
                expect(+containerElement.getAttribute("x")).toBe(
                    gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
                );
                expect(+containerElement.getAttribute("y")).toBe(
                    (constants.PADDING.top + constants.PADDING.bottom) * 2
                );
                expect(+containerElement.getAttribute("height")).toBe(0);
            });
        });
        describe("Axes", () => {
            it("Creates the x axis markup", () => {
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
            });
            it("Creates the y axis markup", () => {
                const yAxisElement = fetchElementByClass(styles.axisY);
                expect(yAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisY} ${styles.axisYTrackLabel}`
                );
            });
            it("Creates correct text for each track", () => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(getData());
                const yAxisElement = fetchElementByClass(
                    styles.axisYTrackLabel
                );
                const textElementList = yAxisElement.querySelectorAll(
                    ".tick text"
                );
                expect(
                    textElementList[0].getAttribute("transform")
                ).not.toBeNull(); // Project A
                expect(textElementList[0].innerHTML).toBe("Project A"); // Project A
            });
            it("Hides x axis when not enabled", () => {
                gantt.destroy();
                const hiddenAxisObj = utils.deepClone(axisJSON);
                hiddenAxisObj.x.show = false;
                gantt = new Gantt(getAxes(hiddenAxisObj));
                gantt.loadContent(getData());
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
                expect(xAxisElement.getAttribute("aria-hidden")).toBe("true");
            });
            it("Hides y axis when not enabled", () => {
                gantt.destroy();
                const hiddenAxisObj = utils.deepClone(axisJSON);
                hiddenAxisObj.y.show = false;
                gantt = new Gantt(getAxes(hiddenAxisObj));
                gantt.loadContent(getData());
                const yAxisElement = fetchElementByClass(styles.axisY);
                expect(yAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisY} ${styles.axisYTrackLabel}`
                );
                expect(yAxisElement.getAttribute("aria-hidden")).toBe("true");
            });
            it("Hides x and y axis when not enabled", () => {
                gantt.destroy();
                const hiddenAxisObj = utils.deepClone(axisJSON);
                hiddenAxisObj.x.show = false;
                hiddenAxisObj.y.show = false;
                gantt = new Gantt(getAxes(hiddenAxisObj));
                gantt.loadContent(getData());
                expect(
                    fetchElementByClass(styles.axisY).getAttribute("class")
                ).toBe(
                    `${styles.axis} ${styles.axisY} ${styles.axisYTrackLabel}`
                );
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
            describe("Locale", () => {
                it("Creates x axis with ticks in default locale", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    gantt = new Gantt(getAxes(localeAxisObj));
                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2018");
                });
                it("creates x axis with LowerTickValues", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x = {
                        type: "timeseries",
                        label: "Some X Label",
                        lowerLimit: new Date(2016, 11).toISOString(),
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
                    gantt = new Gantt(getAxes(localeAxisObj));
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
                });
                it("creates x axis with UpperTickValues", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
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
                    gantt = new Gantt(getAxes(localeAxisObj));
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
                });
                it("creates x axis with LowerTickValues, UpperTickValues and midTickValues in default locale", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x = {
                        type: "timeseries",
                        label: "Some X Label",
                        lowerLimit: new Date(2016, 10).toISOString(),
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
                    gantt = new Gantt(getAxes(localeAxisObj));

                    const allXAxisElements = document.querySelectorAll(
                        `.${styles.axisX}`
                    );
                    const lowerAxis1 = allXAxisElements[0].childNodes[0].querySelector(
                        "text"
                    );
                    const lowerAxis2 = allXAxisElements[0].childNodes[1].querySelector(
                        "text"
                    );
                    const lowerAxis3 = allXAxisElements[0].childNodes[2].querySelector(
                        "text"
                    );
                    const upperAxis1 = allXAxisElements[0].childNodes[3].querySelector(
                        "text"
                    );
                    const upperAxis2 = allXAxisElements[0].childNodes[4].querySelector(
                        "text"
                    );
                    expect(lowerAxis1.textContent).toBe("Feb 2017");
                    expect(lowerAxis2.textContent).toBe("Jun 2017");
                    expect(lowerAxis3.textContent).toBe("Oct 2017");
                    expect(upperAxis1.textContent).toBe("Dec 2016");
                    expect(upperAxis2.textContent).toBe("Feb 2018");
                });
                it("Creates x axis with ticks in provided locale - DE", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    gantt = new Gantt(
                        Object.assign(
                            { locale: LOCALE.de_DE },
                            getAxes(localeAxisObj)
                        )
                    );

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2018");
                });
                it("Creates x axis with ticks in provided locale - FR", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    gantt = new Gantt(
                        Object.assign(
                            { locale: LOCALE.fr_FR },
                            getAxes(localeAxisObj)
                        )
                    );

                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("janv. 2018");
                });
                it("Creates x axis with ticks in provided locale - ES", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    gantt = new Gantt(
                        Object.assign(
                            { locale: LOCALE.es_ES },
                            getAxes(localeAxisObj)
                        )
                    );
                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("ene 2018");
                });
                it("Creates x axis with ticks in provided locale - PT_BR", () => {
                    gantt.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    gantt = new Gantt(
                        Object.assign(
                            { locale: LOCALE.pt_BR },
                            getAxes(localeAxisObj)
                        )
                    );
                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2018");
                });
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
                gantt.destroy();
                const legendContainer = document.createElement("div");
                legendContainer.setAttribute("id", "ganttChartLegendContainer");
                legendContainer.setAttribute("class", "legend-container");
                ganttChartContainer.appendChild(legendContainer);
                const input = utils.deepClone(getAxes(axisJSON));
                input.bindLegendTo = "#ganttChartLegendContainer";
                gantt = new Gantt(input);
                const container = fetchElementByClass(styles.container);
                const parentContainer = fetchElementByClass(
                    "carbon-test-class"
                );
                expect(gantt.config.bindLegendTo).toEqual(input.bindLegendTo);
                expect(container.childNodes.length).toEqual(1);
                expect(parentContainer.childNodes.length).toEqual(2);
                expect(
                    parentContainer.childNodes[0].getAttribute("id")
                ).toEqual("ganttChartLegendContainer");
                expect(
                    parentContainer.childNodes[0].getAttribute("class")
                ).toEqual("legend-container");
                expect(
                    parentContainer.childNodes[1].getAttribute("class")
                ).toEqual(styles.container);
            });
            it("Hides legend by default", () => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                const containerElement = fetchElementByClass(
                    "carbon-test-class"
                );
                expect(
                    containerElement.querySelector(`.${styles.legend}`)
                ).toBeNull();
            });
            it("Shows legend when enabled", () => {
                gantt.destroy();
                gantt = new Gantt(
                    Object.assign(
                        {
                            showActionLegend: true
                        },
                        getAxes(axisJSON)
                    )
                );
                const containerElement = fetchElementByClass(
                    "carbon-test-class"
                );
                const legendElement = containerElement.querySelector(
                    `.${styles.legend}`
                );
                expect(legendElement).not.toBeNull();
                expect(legendElement.nodeName).toBe("UL");
                expect(legendElement.getAttribute("role")).toBe("list");
            });
            it("Shows legend items correctly", () => {
                gantt.destroy();
                gantt = new Gantt(
                    Object.assign(
                        {
                            showActionLegend: true,
                            actionLegend: legendJSON
                        },
                        getAxes(axisJSON)
                    )
                );
                const legendElement = fetchElementByClass(styles.legend);
                expect(legendElement.children.length).toBe(2);
                expect(legendElement.children[0].nodeName).toBe("LI");
                expect(legendElement.children[0].getAttribute("class")).toBe(
                    `${styles.legendItem}`
                );
                expect(
                    legendElement.children[0].getAttribute("aria-selected")
                ).toBeTruthy();
                expect(
                    legendElement.children[0].getAttribute("aria-disabled")
                ).toBe("false");
                expect(legendElement.children[0].getAttribute("role")).toBe(
                    "listitem"
                );
                expect(
                    legendElement.children[0].getAttribute("aria-labelledby")
                ).toBe(legendJSON[0].label.display);
                expect(
                    legendElement.children[1].getAttribute("aria-labelledby")
                ).toBe(legendJSON[1].label.display);
                expect(
                    legendElement.children[0].getAttribute("aria-describedby")
                ).toBe(legendJSON[0].key);
                expect(
                    legendElement.children[1].getAttribute("aria-describedby")
                ).toBe(legendJSON[1].key);
            });
        });
        describe("Dateline", () => {
            let axisObj;
            beforeEach(() => {
                gantt.destroy();
                axisObj = utils.deepClone(getAxes(axisJSON));
            });
            describe("Validates", () => {
                it("Throws error when dateline is not provided", () => {
                    axisObj.dateline = [{}];
                    expect(() => {
                        gantt = new Gantt(axisObj);
                    }).toThrowError(
                        errors.THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED
                    );
                });
                it("Throws error when dateline value is not provided", () => {
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].value = "";
                    expect(() => {
                        gantt = new Gantt(axisObj);
                    }).toThrowError(errors.THROW_MSG_DATELINE_NOT_PROVIDED);
                });

                /**
                 * Verify that if a dateline is specified and a color is not supplied by the consumer, an Invalid property message is displayed, 'a valid color value must be provided'
                 */
                it("Throws error when dateline color is not provided", () => {
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].color = "";
                    expect(() => {
                        gantt = new Gantt(axisObj);
                    }).toThrowError(
                        errors.THROW_MSG_DATELINE_COLOR_NOT_PROVIDED
                    );
                });

                /**
                 * Verify that if an indicator is specified for the dateline and a shape is not supplied by the consumer, an Invalid property message is displayed, 'a valid shape valid must be provided'
                 */
                it("Throws error when dateline shape is not provided when indicators are true", () => {
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].shape = "";
                    expect(() => {
                        gantt = new Gantt(axisObj);
                    }).toThrowError(
                        errors.THROW_MSG_DATELINE_SHAPE_NOT_PROVIDED
                    );
                });
                it("Does not throws error when dateline shape is not provided when indicators are false", () => {
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].showDatelineIndicator = false;
                    axisObj.dateline[0].shape = "";
                    gantt = new Gantt(axisObj);
                });

                it("Throws error when dateline value is not provided", () => {
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].value = "HELLO";
                    expect(() => {
                        gantt = new Gantt(axisObj);
                    }).toThrowError(errors.THROW_MSG_DATELINE_TYPE_NOT_VALID);
                });
            });

            it("Creates dateline group element", (done) => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                gantt = new Gantt(axisObj);
                const datelineGroupElement = fetchElementByClass(
                    styles.datelineGroup
                );
                expect(d3.select(datelineGroupElement).datum().value).toBe(
                    datelineAlt.value
                );
                expect(datelineGroupElement.getAttribute("aria-selected")).toBe(
                    "false"
                );
                delay(() => {
                    const translate = getSVGAnimatedTransformList(
                        datelineGroupElement.getAttribute("transform")
                    ).translate;
                    expect(toNumber(translate[0], 10)).toBeCloseTo(106);
                    expect(toNumber(translate[1], 10)).toBeCloseTo(5);
                    done();
                });
                expect(datelineGroupElement.childNodes.length).toBe(2);
            });
            it("Creates dateline correctly", (done) => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                gantt = new Gantt(axisObj);
                const dateline = fetchElementByClass(styles.dateline);
                expect(dateline.getAttribute("pointer-events")).toBe("auto");
                expect(dateline).not.toBeNull();
                delay(() => {
                    const datelineElement = fetchElementByClass(
                        styles.dateline
                    );
                    expect(
                        toNumber(datelineElement.getAttribute("x1"), 10)
                    ).toBeCloseTo(338);
                    expect(
                        toNumber(datelineElement.getAttribute("y1"), 10)
                    ).toBeCloseTo(0);
                    expect(
                        toNumber(datelineElement.getAttribute("x2"), 10)
                    ).toBeCloseTo(338);
                    expect(
                        toNumber(datelineElement.getAttribute("y2"), 10)
                    ).toBeCloseTo(0);
                    done();
                });
            });
            it("creates multiple datelines correctly", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline = [
                    {
                        showDatelineIndicator: true,
                        label: {
                            display: "Release A"
                        },
                        color: COLORS.GREY,
                        shape: SHAPES.SQUARE,
                        value: new Date(2018, 5, 1).toISOString()
                    },
                    {
                        showDatelineIndicator: true,
                        label: {
                            display: "Release B"
                        },
                        color: COLORS.GREY,
                        shape: SHAPES.SQUARE,
                        value: new Date(2018, 8, 1).toISOString()
                    }
                ];
                gantt = new Gantt(axisObj);
                const datelines = document.querySelectorAll(
                    `.${styles.dateline}`
                );
                expect(datelines.length).toBe(2);
                expect(datelines[0].getAttribute("pointer-events")).toBe(
                    "auto"
                );
                expect(datelines[1].getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
            it("Creates dateline point correctly", (done) => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                gantt = new Gantt(axisObj);
                const datelinePoint = fetchElementByClass(styles.datelinePoint);
                const datelinePointPath = datelinePoint.firstChild;
                expect(datelinePoint).not.toBeNull();
                expect(datelinePoint.getAttribute("aria-hidden")).toBe("false");
                expect(datelinePoint.getAttribute("pointer-events")).toBe(
                    "auto"
                );
                expect(datelinePointPath.getAttribute("d")).not.toBeNull();
                expect(datelinePointPath.getAttribute("d")).toBe(
                    datelineJSON[0].shape.path.d
                );
                delay(() => {
                    const datelinePointPath = datelinePoint.firstChild;
                    const translate = getSVGAnimatedTransformList(
                        datelinePointPath.getAttribute("transform")
                    ).translate;
                    expect(toNumber(translate[0], 10)).toBeCloseTo(338);
                    expect(toNumber(translate[1], 10)).toBeCloseTo(0);
                    done();
                });
            });
            it("Hides dateline point on consumer disable", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].showDatelineIndicator = false;
                axisObj.dateline[0].shape = "";
                gantt = new Gantt(axisObj);
                const datelinePoint = fetchElementByClass(styles.datelinePoint);
                const datelineGroupElement = fetchElementByClass(
                    styles.datelineGroup
                );
                expect(datelineGroupElement.childNodes.length).toBe(2);
                expect(datelinePoint).not.toBeNull();
                expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
                expect(datelinePoint.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
            it("Hides dateline point on consumer disable when shape available", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].showDatelineIndicator = false;
                axisObj.dateline[0].shape = SHAPES.CIRCLE;
                gantt = new Gantt(axisObj);
                const datelinePoint = fetchElementByClass(styles.datelinePoint);
                const datelineGroupElement = fetchElementByClass(
                    styles.datelineGroup
                );
                expect(datelineGroupElement.childNodes.length).toBe(2);
                expect(datelinePoint).not.toBeNull();
                expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
            });
            describe("when clicked on dateline", () => {
                it("Does not do anything if no onClick callback is provided", (done) => {
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    gantt = new Gantt(axisObj);
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
                    const onClickFunctionSpy = sinon.spy();
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].onClick = onClickFunctionSpy;
                    gantt = new Gantt(axisObj);
                    const datelinePointElement = fetchElementByClass(
                        styles.datelinePoint
                    );
                    triggerEvent(datelinePointElement, "click", () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(
                                styles.datelineGroup
                            ).getAttribute("aria-selected")
                        ).toBe("true");
                        expect(
                            datelinePointElement.getAttribute("aria-disabled")
                        ).toBe("false");
                        done();
                    });
                });
                it("Removes selection when dateline is clicked again", (done) => {
                    const onClickFunctionSpy = sinon.spy();
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].onClick = onClickFunctionSpy;
                    gantt = new Gantt(axisObj);
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
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    axisObj.dateline[0].onClick = (clearSelectionCallback) =>
                        clearSelectionCallback();
                    gantt = new Gantt(axisObj);
                    const point = fetchElementByClass(styles.datelinePoint);
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
            describe("Pass Through's", () => {
                describe("clickPassThrough - undefined", () => {
                    beforeEach(() => {
                        axisObj = getAxes(axisJSON);
                        axisObj.dateline = utils.deepClone(datelineJSON);
                        gantt = new Gantt(axisObj);
                    });
                    it("set pointer-events correctly", () => {
                        const dateline = fetchElementByClass(styles.dateline);
                        expect(dateline.getAttribute("pointer-events")).toBe(
                            "auto"
                        );
                        const datelinePoint = fetchElementByClass(
                            styles.datelinePoint
                        );
                        expect(
                            datelinePoint.getAttribute("pointer-events")
                        ).toBe("auto");
                    });
                });
                describe("clickPassThrough - true", () => {
                    beforeEach(() => {
                        axisObj = Object.assign(getAxes(axisJSON), {
                            clickPassThrough: {
                                datelines: true
                            }
                        });
                        axisObj.dateline = utils.deepClone(datelineJSON);
                        gantt = new Gantt(axisObj);
                    });
                    it("set pointer-events correctly", () => {
                        const dateline = fetchElementByClass(styles.dateline);
                        expect(dateline.getAttribute("pointer-events")).toBe(
                            "none"
                        );
                        const datelinePoint = fetchElementByClass(
                            styles.datelinePoint
                        );
                        expect(
                            datelinePoint.getAttribute("pointer-events")
                        ).toBe("auto");
                    });
                });
                describe("clickPassThrough - false", () => {
                    beforeEach(() => {
                        axisObj = Object.assign(getAxes(axisJSON), {
                            clickPassThrough: {
                                datelines: false
                            }
                        });
                        axisObj.dateline = utils.deepClone(datelineJSON);
                        gantt = new Gantt(axisObj);
                    });
                    it("set pointer-events correctly", () => {
                        const dateline = fetchElementByClass(styles.dateline);
                        expect(dateline.getAttribute("pointer-events")).toBe(
                            "auto"
                        );
                        const datelinePoint = fetchElementByClass(
                            styles.datelinePoint
                        );
                        expect(
                            datelinePoint.getAttribute("pointer-events")
                        ).toBe("auto");
                    });
                });
            });
        });
        it("Attaches event handlers", () => {
            gantt.resizeHandler();
            expect(gantt.resizeHandler).not.toBeNull();
            expect(gantt.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("When load is called", () => {
        const primaryContent = getData();
        const secondaryContent = utils.deepClone(getData());
        secondaryContent.key = "uid_2";
        beforeEach(() => {
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(primaryContent);
        });
        describe("Single Track input", () => {
            it("Creates a new Track instance for each content", () => {
                expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
            });
            it("Saves track instance", () => {
                expect(gantt.trackConfig[0]).not.toBeNull();
                expect(gantt.tracks[0]).not.toBeNull();
                expect(gantt.tracks[0]).toBe(primaryContent.key);
            });
            it("Update axes domain", () => {
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
                expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
            });
            it("Updates the height", () => {
                expect(gantt.config.height).toBe(41);
            });
            it("Sets canvas height", () => {
                expect(gantt.config.canvasHeight).toBe(
                    41 + BASE_CANVAS_HEIGHT_PADDING
                );
            });
            it("Resizes the graph", () => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                spyOn(gantt, "resize");
                gantt.loadContent(primaryContent);
                expect(gantt.resize).toHaveBeenCalled();
            });
            it("Moves track label to middle", () => {
                const trackLabelElement = document.querySelectorAll(
                    ".carbon-axis.carbon-axis-y .tick text"
                );
                expect(
                    trackLabelElement[0].getAttribute("transform")
                ).not.toBeNull();
            });
            it("Custom Padding input with Custom Track Height", () => {
                gantt.destroy();
                const ganttConfig = getAxes(axisJSON);
                ganttConfig.padding = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                };
                gantt = new Gantt(ganttConfig);
                const primaryContent = getData();
                primaryContent.dimension = trackDimension.dimension;
                gantt.loadContent(primaryContent);
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                    gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                    (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
                );
            });
        });
        describe("Multiple Track inputs", () => {
            it("Loads content correctly", () => {
                gantt.loadContent(secondaryContent);
                expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
                expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
                expect(gantt.tracks[0]).toBe(primaryContent.key);
                expect(gantt.tracks[1]).toBe(secondaryContent.key);
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
                expect(gantt.config.axis.y.domain.upperLimit).toBe(2);
                expect(gantt.config.height).toBe(82);
                expect(gantt.config.canvasHeight).toBe(
                    82 + BASE_CANVAS_HEIGHT_PADDING
                );
            });
            it("Loads multiple contents correctly", () => {
                const multipleContents = [primaryContent, secondaryContent];
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent(multipleContents);
                const mockPrimaryTrack = new Track(primaryContent);
                expect(gantt.trackConfig[0].tasks).toEqual(mockPrimaryTrack.tasks);
                expect(gantt.trackConfig[0].key).toEqual(mockPrimaryTrack.key);
                expect(gantt.trackConfig[0].trackLabel).toEqual(
                    mockPrimaryTrack.trackLabel
                );
                const mockSecondaryTrack = new Track(secondaryContent);
                expect(gantt.trackConfig[1].tasks).toEqual(mockSecondaryTrack.tasks);
                expect(gantt.trackConfig[1].key).toEqual(mockSecondaryTrack.key);
                expect(gantt.trackConfig[1].trackLabel).toEqual(
                    mockSecondaryTrack.trackLabel
                );
                expect(gantt.tracks.length).toBe(2);
                expect(gantt.tracks).toEqual([primaryContent.key, secondaryContent.key]);
                expect(gantt.trackConfig.length).toBe(2);
            });
            it("Loads content correctly with different heights - 2", () => {
                const primaryContent = getData();
                const secondaryContent = utils.deepClone(getData());
                secondaryContent.key = "uid_2";
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                primaryContent.dimension = trackDimension.dimension;
                secondaryContent.dimension = trackDimension.dimension;
                gantt.loadContent(primaryContent);
                gantt.loadContent(secondaryContent);

                expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
                expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
                expect(gantt.tracks[0]).toBe(primaryContent.key);
                expect(gantt.tracks[1]).toBe(secondaryContent.key);
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
                expect(gantt.config.axis.y.domain.upperLimit).toBe(2);
                expect(gantt.config.height).toBe(200);
                expect(gantt.config.canvasHeight).toBe(
                    200 + BASE_CANVAS_HEIGHT_PADDING
                );
            });
            it("Loads content correctly with different heights - 3", () => {
                const primaryContent = getData();
                const secondaryContent = utils.deepClone(getData());
                secondaryContent.key = "uid_2";
                const tertiaryContent = utils.deepClone(getData());
                tertiaryContent.key = "uid_3";
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                primaryContent.dimension = trackDimension.dimension;
                secondaryContent.dimension = trackDimension.dimension;
                gantt.loadContent(primaryContent);
                gantt.loadContent(secondaryContent);
                gantt.loadContent(tertiaryContent);
                expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
                expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
                expect(gantt.trackConfig[2] instanceof Track).toBeTruthy();
                expect(gantt.tracks[0]).toBe(primaryContent.key);
                expect(gantt.tracks[1]).toBe(secondaryContent.key);
                expect(gantt.tracks[2]).toBe(tertiaryContent.key);
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
                expect(gantt.config.axis.y.domain.upperLimit).toBe(3);
                expect(gantt.config.height).toBe(241);
                expect(gantt.config.canvasHeight).toBe(
                    241 + BASE_CANVAS_HEIGHT_PADDING
                );
            });
            it("Custom Padding input with Custom Track Heights", () => {
                gantt.destroy();
                const ganttConfig = getAxes(axisJSON);
                ganttConfig.padding = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                };
                gantt = new Gantt(ganttConfig);
                const primaryContent = getData();
                const secondaryContent = utils.deepClone(getData());
                secondaryContent.key = "uid_2";
                const tertiaryContent = utils.deepClone(getData());
                tertiaryContent.key = "uid_3";
                primaryContent.dimension = trackDimension.dimension;
                secondaryContent.dimension = trackDimension.dimension;
                gantt.loadContent(primaryContent);
                gantt.loadContent(secondaryContent);
                gantt.loadContent(tertiaryContent);
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                    gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                    (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
                );
                expect(gantt.config.axisSizes.y).toEqual(0);
                expect(
                    (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
                ).toEqual(0);
                const canvas = d3.select(`.${styles.canvas}`);
                expect(gantt.config.height).toEqual(
                    toNumber(canvas.attr("height"), 10)
                );
                expect(getXAxisWidth(gantt.config)).toEqual(
                    toNumber(canvas.attr("width"), 10)
                );
                expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                    gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                    (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
                );
            });
        });
        /**
         * CH02152019.01 - Verify when the track is loading, the system positions the track according to the index position.
         */
        describe("Track loading at a index", () => {
            describe("Validation", () => {
                it("Throws error if input index is not valid", () => {
                    const content = utils.deepClone(primaryContent);
                    content.loadAtIndex = -2;
                    expect(() => {
                        gantt.loadContent(content);
                    }).toThrow(
                        new Error(
                            errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX
                        )
                    );
                });
                it("Doesn't Throw an error if input index is valid", () => {
                    const content = utils.deepClone(primaryContent);
                    content.loadAtIndex = 1;
                    expect(() => {
                        gantt.loadContent(content);
                    }).not.toThrow(
                        new Error(
                            errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX
                        )
                    );
                });
                it("Doesn't throw an error if loadAtIndex is not used", () => {
                    const content = utils.deepClone(primaryContent);
                    expect(() => {
                        gantt.loadContent(content);
                    }).not.toThrow(
                        new Error(
                            errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX
                        )
                    );
                });
            });
            it("Inserts at head, if index is 0", (done) => {
                const content = utils.deepClone(primaryContent);
                content.key = "track 2";
                content.trackLabel.display = "Project B";
                content.loadAtIndex = 0;
                gantt.loadContent(content);
                expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                    "track 2"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                    "track 1"
                );
                gantt.resize();
                delay(() => {
                    const trackGroups = fetchAllElementsByClass(
                        ganttChartContainer,
                        `${styles.trackGroup}`
                    );
                    expect(
                        trackGroups[0].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("42");
                    expect(
                        trackGroups[1].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("1");
                    done();
                }, TRANSITION_DELAY);
            });
            it("Inserts in between, if index is less than trackLength", (done) => {
                const secondaryContent = utils.deepClone(primaryContent);
                secondaryContent.key = "track 2";
                secondaryContent.trackLabel.display = "Project B";
                gantt.loadContent(secondaryContent);
                const ternaryContent = utils.deepClone(primaryContent);
                ternaryContent.key = "track 3";
                ternaryContent.trackLabel.display = "Project C";
                ternaryContent.loadAtIndex = 1;
                gantt.loadContent(ternaryContent);
                expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                    "track 1"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                    "track 3"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[2]).toBe(
                    "track 2"
                );
                delay(() => {
                    const trackGroups = fetchAllElementsByClass(
                        ganttChartContainer,
                        `${styles.trackGroup}`
                    );
                    expect(
                        trackGroups[0].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("1");
                    expect(
                        trackGroups[1].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("83");
                    expect(
                        trackGroups[2].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("42");
                    done();
                }, TRANSITION_DELAY);
            });
            it("Inserts at end, if index is equal to trackLength", (done) => {
                const secondaryContent = utils.deepClone(primaryContent);
                secondaryContent.key = "track 2";
                secondaryContent.trackLabel.display = "Project B";
                gantt.loadContent(secondaryContent);
                const ternaryContent = utils.deepClone(primaryContent);
                ternaryContent.key = "track 3";
                ternaryContent.trackLabel.display = "Project C";
                ternaryContent.loadAtIndex = 2;
                gantt.loadContent(ternaryContent);
                expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                    "track 1"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                    "track 2"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[2]).toBe(
                    "track 3"
                );
                delay(() => {
                    const trackGroups = fetchAllElementsByClass(
                        ganttChartContainer,
                        `${styles.trackGroup}`
                    );
                    expect(
                        trackGroups[0].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("1");
                    expect(
                        trackGroups[1].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("42");
                    expect(
                        trackGroups[2].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("83");
                    done();
                }, TRANSITION_DELAY);
            });
            it("Inserts at end, if index is too big than trackLength", (done) => {
                const secondaryContent = utils.deepClone(primaryContent);
                secondaryContent.key = "track 2";
                secondaryContent.trackLabel.display = "Project B";
                gantt.loadContent(secondaryContent);
                const ternaryContent = utils.deepClone(primaryContent);
                ternaryContent.key = "track 3";
                ternaryContent.trackLabel.display = "Project C";
                ternaryContent.loadAtIndex = 99;
                gantt.loadContent(ternaryContent);
                expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                    "track 1"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                    "track 2"
                );
                expect(Object.keys(gantt.config.axis.y.trackList)[2]).toBe(
                    "track 3"
                );
                delay(() => {
                    const trackGroups = fetchAllElementsByClass(
                        ganttChartContainer,
                        `${styles.trackGroup}`
                    );
                    expect(
                        trackGroups[0].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("1");
                    expect(
                        trackGroups[1].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("42");
                    expect(
                        trackGroups[2].childNodes[0].childNodes[0].getAttribute(
                            "y"
                        )
                    ).toBe("83");
                    done();
                }, TRANSITION_DELAY);
            });
        });
        describe("Validates content for unique keys", () => {
            it("Throws error if content doesn't have a unique key", () => {
                gantt = new Gantt(Object.assign(getAxes(axisJSON)));
                gantt.loadContent(getData());
                expect(() => {
                    gantt.loadContent(getData());
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("doesn't throws error if content has unique keys", () => {
                gantt = new Gantt(Object.assign(getAxes(axisJSON)));
                gantt.loadContent(getData());
                expect(() => {
                    const uniqueData = getData();
                    uniqueData.key = "uid_2";
                    gantt.loadContent(uniqueData);
                }).not.toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
        });
        describe("Content container", () => {
            it("Increases the height when content is loaded dynamically", (done) => {
                const canvasElement = fetchElementByClass(styles.canvas);
                delay(() => {
                    const containerElement = canvasElement.querySelector(
                        `.${styles.contentContainer}`
                    );
                    expect(+containerElement.getAttribute("height")).toBe(41);
                    done();
                }, TRANSITION_DELAY);
            });
            it("Increases the height when content is loaded dynamically with different height", (done) => {
                gantt.destroy();
                gantt = new Gantt(getAxes(axisJSON));
                const data = utils.deepClone(getData());
                data.dimension = trackDimension.dimension;
                gantt.loadContent(data);
                const canvasElement = fetchElementByClass(styles.canvas);
                delay(() => {
                    const containerElement = canvasElement.querySelector(
                        `.${styles.contentContainer}`
                    );
                    expect(+containerElement.getAttribute("height")).toBe(100);
                    done();
                }, TRANSITION_DELAY);
            });
        });
    });
    describe("When resize is called", () => {
        beforeEach(() => {
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(getData());
        });
        it("Sets the canvas width correctly", (done) => {
            const currentWidth = gantt.config.canvasWidth;
            expect(currentWidth).toBe(1024);
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(gantt.config.canvasWidth).toBe(800);
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Sets the defs clipPath width and height correctly", (done) => {
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            triggerEvent(window, "resize", () => {
                const defsElement = fetchElementByClass(styles.canvas)
                    .firstChild;
                const clipPathRect = defsElement.firstChild.firstChild;
                expect(+clipPathRect.getAttribute("height")).toBe(
                    gantt.config.height
                );
                expect(+clipPathRect.getAttribute("width")).toBe(
                    getXAxisWidth(gantt.config)
                );
                done();
            });
        });
        it("Calculates X axis d3 scale using domain and range", (done) => {
            gantt.resize();
            triggerEvent(window, "resize", () => {
                expect(gantt.scale.x).not.toBeNull();
                expect(gantt.scale.x).toEqual(jasmine.any(Function));
                done();
            });
        });
        it("Calculates Y axis d3 scale using domain and range", (done) => {
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(gantt.scale.y).not.toBeNull();
                    expect(gantt.scale.y).toEqual(jasmine.any(Function));
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Translates the canvas", (done) => {
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(
                        +fetchElementByClass(styles.canvas).getAttribute(
                            "height"
                        )
                    ).toBe(41 + BASE_CANVAS_HEIGHT_PADDING);
                    expect(
                        +fetchElementByClass(styles.canvas).getAttribute(
                            "width"
                        )
                    ).toBe(790);
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Sets the content container width and height correctly", (done) => {
            const rafSpy = spyOn(window, "requestAnimationFrame");
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    const contentContainer = d3.select(
                        `.${styles.contentContainer}`
                    );
                    expect(+contentContainer.attr("height")).toBe(
                        gantt.config.height
                    );
                    expect(+contentContainer.attr("width")).toBe(
                        getXAxisWidth(gantt.config)
                    );
                    rafSpy.calls.reset();
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Sets the throttle correctly, if undefined", () => {
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = undefined;
            gantt.destroy();
            gantt = new Gantt(throttledInput);
            expect(gantt.config.throttle).toEqual(constants.RESIZE_THROTTLE);
        });
        it("Sets the throttle correctly", () => {
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = 400;
            gantt.destroy();
            gantt = new Gantt(throttledInput);
            expect(gantt.config.throttle).toEqual(400);
            expect(gantt.config.throttle).not.toEqual(
                constants.RESIZE_THROTTLE
            );
        });
        it("Throttles based on delay", (done) => {
            const rafSpy = spyOn(window, "requestAnimationFrame");
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = undefined;
            gantt.destroy();
            gantt = new Gantt(throttledInput);
            ganttChartContainer.setAttribute(
                "style",
                "width: 600px; height: 200px"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(window.requestAnimationFrame).toHaveBeenCalled();
                    rafSpy.calls.reset();
                    done();
                },
                constants.RESIZE_THROTTLE
            );
        });
        it("Throttles based on delay provided in the input", (done) => {
            const rafSpy = spyOn(window, "requestAnimationFrame");
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = 500;
            gantt.destroy();
            gantt = new Gantt(throttledInput);
            ganttChartContainer.setAttribute(
                "style",
                "width: 400px; height: 200px"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(window.requestAnimationFrame).toHaveBeenCalled();
                    rafSpy.calls.reset();
                    done();
                },
                throttledInput.throttle
            );
        });
        it("When custom padding is used", (done) => {
            gantt.destroy();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };
            gantt = new Gantt(ganttConfig);
            const primaryContent = getData();
            gantt.loadContent(primaryContent);
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(gantt.config.axisSizes.y).toEqual(0);
                    expect(
                        (ganttConfig.padding.top + ganttConfig.padding.bottom) *
                            2
                    ).toEqual(0);
                    const canvas = d3.select(`.${styles.canvas}`);
                    const contentContainer = d3.select(
                        `.${styles.contentContainer}`
                    );
                    expect(gantt.config.height).toEqual(
                        toNumber(canvas.attr("height"), 10)
                    );
                    expect(getXAxisWidth(gantt.config)).toEqual(
                        toNumber(canvas.attr("width"), 10)
                    );
                    expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                        gantt.config.axisSizes.y +
                            gantt.config.axisLabelWidths.y
                    );
                    expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                        (ganttConfig.padding.top + ganttConfig.padding.bottom) *
                            2
                    );
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });
    describe("When unload is called", () => {
        const primaryContent = getData();
        const secondaryContent = utils.deepClone(getData());
        const tertiaryContent = utils.deepClone(getData());
        secondaryContent.key = "uid_2";
        tertiaryContent.key = "uid_3";
        beforeEach(() => {
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(primaryContent);
        });
        it("Throws error when unloading a content which is not loaded", () => {
            expect(() => {
                gantt.unloadContent(secondaryContent);
            }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        });
        it("Removes the content successfully", (done) => {
            gantt.unloadContent(primaryContent);
            delay(() => {
                expect(gantt.tracks).toEqual([]);
                expect(gantt.trackConfig).toEqual([]);
                expect(gantt.tracks.length).toBe(0);
                expect(gantt.trackConfig.length).toBe(0);
                expect(gantt.config.height).toBe(0);
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
                expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
                expect(gantt.config.canvasHeight).toBe(
                    BASE_CANVAS_HEIGHT_PADDING
                );
                done();
            }, TRANSITION_DELAY);
        });
        it("Removes multiple content successfully", (done) => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            const multipleContents = [primaryContent, secondaryContent];
            gantt.loadContent(multipleContents);
            expect(gantt.tracks.length).toBe(2);
            gantt.unloadContent(multipleContents);
            delay(() => {
                expect(gantt.tracks).toEqual([]);
                expect(gantt.trackConfig).toEqual([]);
                expect(gantt.tracks.length).toBe(0);
                expect(gantt.trackConfig.length).toBe(0);
                expect(gantt.config.height).toBe(0);
                expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
                expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
                expect(gantt.config.canvasHeight).toBe(
                    BASE_CANVAS_HEIGHT_PADDING
                );
                done();
            }, TRANSITION_DELAY);
        });
        it("Removes the grid and track", (done) => {
            gantt.unloadContent(primaryContent);
            delay(() => {
                expect(gantt.scale.y.domain()).toEqual([]);
                expect(gantt.scale.y.range()).toEqual([0]);
                done();
            }, TRANSITION_DELAY);
        });
        it("Adjusts the defs height", (done) => {
            gantt.unloadContent(primaryContent);
            delay(() => {
                const defsContainerElement = document.querySelector(
                    `clipPath#${gantt.config.clipPathId}`
                );
                expect(+defsContainerElement.getAttribute("height")).toBe(0);
                done();
            }, TRANSITION_DELAY);
        });
        it("Adjusts the content container height", (done) => {
            gantt.unloadContent(primaryContent);
            delay(() => {
                const contentContainerElement = fetchElementByClass(
                    styles.contentContainer
                );
                expect(+contentContainerElement.getAttribute("height")).toBe(0);
                done();
            }, TRANSITION_DELAY);
        });
        it("Updates track props", (done) => {
            gantt.unloadContent(primaryContent);
            delay(() => {
                expect(gantt.config.axis.y.trackCount).toBe(0);
                expect(
                    gantt.config.axis.y.trackList[primaryContent.key]
                ).toBeUndefined();
                done();
            }, TRANSITION_DELAY);
        });
        it("Unloads content correctly with different heights", () => {
            const primaryContent = getData();
            const secondaryContent = utils.deepClone(getData());
            secondaryContent.key = "uid_2";
            const tertiaryContent = utils.deepClone(getData());
            tertiaryContent.key = "uid_3";

            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            primaryContent.dimension = trackDimension.dimension;
            secondaryContent.dimension = trackDimension.dimension;
            gantt.loadContent(primaryContent);
            gantt.loadContent(secondaryContent);
            gantt.loadContent(tertiaryContent);
            gantt.unloadContent(secondaryContent);
            expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
            expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
            expect(gantt.trackConfig[2]).toBeUndefined();
            expect(gantt.tracks[0]).toBe(primaryContent.key);
            expect(gantt.tracks[1]).toBe(tertiaryContent.key);
            expect(gantt.tracks[2]).toBeUndefined();
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(2);
            expect(gantt.config.height).toBe(141);
            expect(gantt.config.canvasHeight).toBe(
                141 + BASE_CANVAS_HEIGHT_PADDING
            );
            expect(
                document.querySelector(`[aria-describedby="track 2"]`)
            ).toBeNull();
            expect(
                document.querySelector(`[aria-describedby="track 1"]`)
            ).not.toBeNull();
        });
        it("When custom padding is used", () => {
            gantt.destroy();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            gantt = new Gantt(ganttConfig);
            gantt.loadContent(primaryContent);
            gantt.loadContent(secondaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(gantt.config.axisSizes.y).toEqual(0);
            expect(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            ).toEqual(0);
            const canvas = d3.select(`.${styles.canvas}`);
            expect(gantt.config.height).toEqual(
                toNumber(canvas.attr("height"), 10)
            );
            expect(getXAxisWidth(gantt.config)).toEqual(
                toNumber(canvas.attr("width"), 10)
            );
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
            gantt.unloadContent(secondaryContent);
            expect(gantt.config.axisSizes.y).toEqual(0);
            expect(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            ).toEqual(0);
            expect(gantt.config.height).toEqual(
                toNumber(canvas.attr("height"), 10)
            );
            expect(getXAxisWidth(gantt.config)).toEqual(
                toNumber(canvas.attr("width"), 10)
            );
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
    });
    describe("When destruct is called", () => {
        beforeEach(() => {
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(getData());
            gantt.destroy();
        });
        it("Removes the canvas content", () => {
            expect(fetchElementByClass(styles.canvas)).toBeNull();
        });
        it("Removes the legend content", () => {
            expect(fetchElementByClass(styles.legend)).toBeNull();
        });
        it("Removes the container content", () => {
            expect(fetchElementByClass(styles.container)).toBeNull();
        });
        it("Resets the API objects", () => {
            expect(gantt.config).toEqual({
                axis: Object({
                    x: Object({}),
                    y: Object({})
                }),
                shownTargets: Object({}),
                actionLegend: [],
                dateline: []
            });
            expect(gantt.axis).toEqual({});
            expect(gantt.scale).toEqual({});
            expect(gantt.svg).toBeNull();
            expect(gantt.graphContainer).toBeNull();
            expect(gantt.legendSVG).toBeNull();
            expect(gantt.tracks).toEqual([]);
            expect(gantt.trackConfig).toEqual([]);
            expect(gantt.resizeHandler).toBeNull();
        });
    });
});
