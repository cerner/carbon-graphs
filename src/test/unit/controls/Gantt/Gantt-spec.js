"use strict";
import Gantt from "../../../../main/js/controls/Gantt";
import { getXAxisWidth } from "../../../../main/js/controls/Gantt/helpers/creationHelpers";
import Track from "../../../../main/js/controls/Gantt/Track";
import constants, { AXIS_TYPE } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    axisJSON,
    BASE_CANVAS_HEIGHT_PADDING,
    fetchElementByClass,
    getAxes,
    getData
} from "./helpers";
import { loadCustomJasmineMatcher } from "../../helpers/commonHelpers";

describe("Gantt", () => {
    let gantt = null;
    let ganttChartContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
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
            expect(gantt.config.eventline).toEqual(input.eventline || []);
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
            it("Sets canvas width taking container padding into consideration", () => {
                gantt.destroy();
                ganttChartContainer.setAttribute(
                    "style",
                    "width: 1024px; height: 400px; padding: 3rem"
                );
                gantt = new Gantt(getAxes(axisJSON));
                expect(gantt.config.canvasWidth).toBeCloserTo(928);
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
                dateline: [],
                eventline: [],
                pan: {}
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
