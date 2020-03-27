"use strict";
import Timeline from "../../../../main/js/controls/Timeline";
import { getXAxisWidth } from "../../../../main/js/controls/Timeline/helpers/creationHelpers";
import constants, { AXIS_TYPE } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../../main/js/helpers/legend";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import LOCALE from "../../../../main/js/locale/index";
import {
    axisJSON,
    BASE_CANVAS_HEIGHT_PADDING,
    DEFAULT_HEIGHT,
    fetchElementByClass,
    getAxes,
    getData,
    valuesJSON
} from "./helpers";
import { loadCustomJasmineMatcher } from "../../helpers/commonHelpers";

describe("Timeline", () => {
    let timeline = null;
    let TimelineGraphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        TimelineGraphContainer = document.createElement("div");
        TimelineGraphContainer.id = "testCarbonTimeline";
        TimelineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        TimelineGraphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(TimelineGraphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("Throws error on undefined input", () => {
            expect(() => {
                timeline = new Timeline();
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on null input", () => {
            expect(() => {
                timeline = new Timeline(null);
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on [] input", () => {
            expect(() => {
                timeline = new Timeline([]);
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on '' input", () => {
            expect(() => {
                timeline = new Timeline("");
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Throws error on {} input", () => {
            expect(() => {
                timeline = new Timeline({});
            }).toThrowError(errors.THROW_MSG_NO_AXES_DATA_LOADED);
        });
        it("Initializes properly", () => {
            timeline = new Timeline(getAxes(axisJSON));
            expect(timeline.graphContainer).not.toBeNull();
            expect(timeline.config).not.toBeNull();
            expect(timeline.axis).not.toBeNull();
            expect(timeline.scale).not.toBeNull();
            expect(timeline.legendSVG).not.toBeNull();
            expect(timeline.svg).not.toBeNull();
            expect(timeline.content).toEqual([]);
            expect(timeline.contentConfig).toEqual([]);
            expect(timeline.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("When input is loaded", () => {
        it("Throws error if no bind is present", () => {
            expect(() => {
                const input = getAxes(axisJSON);
                input.bindTo = "";
                new Timeline(input);
            }).toThrowError(errors.THROW_MSG_NO_BIND);
        });
        describe("Axis - throws error", () => {
            it("if no axis is present", () => {
                expect(() => {
                    new Timeline(getAxes({}));
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if no x axis is present", () => {
                expect(() => {
                    new Timeline(
                        getAxes({
                            x: {}
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_AXIS_INFO);
            });
            it("if x axis lowerLimit is not present", () => {
                expect(() => {
                    new Timeline(
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
                    new Timeline(
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
                    new Timeline(
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
                    new Timeline(
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
                new Timeline(getAxes(axisJSON));
            }).not.toThrow();
        });
        it("Loads the content correctly", () => {
            const primaryContent = getData(valuesJSON);
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(primaryContent);
            expect(timeline.content).toEqual([primaryContent.key]);
            expect(timeline.content.length).toBe(1);
            expect(timeline.contentConfig[0].config.key).toEqual(
                primaryContent.key
            );
            expect(timeline.contentConfig[0].config.label).toEqual(
                primaryContent.label
            );
            expect(timeline.contentConfig[0].config.shape).toEqual(
                primaryContent.shape
            );
            expect(timeline.contentConfig[0].config.color).toEqual(
                primaryContent.color
            );
            expect(timeline.contentConfig[0].config.values).toEqual(
                primaryContent.values
            );
            expect(timeline.contentConfig.length).toBe(1);
        });
        it("Throws error when duplicate key is provided for content", () => {
            expect(() => {
                const primaryContent = getData(valuesJSON);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(primaryContent);
                timeline.loadContent(primaryContent);
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Changes to new object has no impact on base object", () => {
            const data = getData(valuesJSON);
            const input = getAxes(axisJSON);
            timeline = new Timeline(input);
            timeline.loadContent(data);
            input.bindTo = "";
            input.axis = {};
            input.content = null;
            data.tasks = [];
            const cfg = timeline.config;
            expect(input.bindTo).toBe("");
            expect(input.axis).toEqual({});
            expect(data.tasks).toEqual([]);
            expect(cfg.bindTo).toBe("#testCarbonTimeline");
            expect(cfg.axis.x.lowerLimit).toBe(axisJSON.x.lowerLimit);
            expect(cfg.axis.x.upperLimit).toBe(axisJSON.x.upperLimit);
            expect(timeline.contentConfig.length).toBe(1);
            expect(timeline.contentConfig[0].config.key).toBe(data.key);
        });
        it("Applies half of tick width as padding if custom padding is less than half of tick width", () => {
            const data = getData(valuesJSON);
            const input = getAxes(axisJSON);
            input.padding = {
                left: 10,
                right: 20
            };
            timeline = new Timeline(input);
            timeline.loadContent(data);
            input.bindTo = "";
            input.axis = {};
            input.content = null;
            data.tasks = [];
            const cfg = timeline.config;
            const ticks = document.getElementsByClassName("tick");
            const leftValue = ticks[0].getBoundingClientRect().width / 2;
            const rightValue =
                ticks[ticks.length - 1].getBoundingClientRect().width / 2;
            expect(input.bindTo).toBe("");
            expect(input.axis).toEqual({});
            expect(data.tasks).toEqual([]);
            expect(cfg.bindTo).toBe("#testCarbonTimeline");
            expect(cfg.axis.x.lowerLimit).toBe(axisJSON.x.lowerLimit);
            expect(cfg.axis.x.upperLimit).toBe(axisJSON.x.upperLimit);
            expect(cfg.padding.left).toEqual(leftValue);
            expect(cfg.padding.right).toEqual(rightValue);
            expect(cfg.padding.top).toEqual(constants.PADDING.top);
            expect(cfg.padding.bottom).toEqual(constants.PADDING.bottom);
            expect(cfg.padding.hasCustomPadding).toBe(true);
            expect(timeline.scale.x.range()).toEqual([
                0,
                getXAxisWidth(timeline.config)
            ]);
            expect(timeline.contentConfig.length).toBe(1);
            expect(timeline.contentConfig[0].config.key).toBe(data.key);
        });
        it("Applies custom padding to the timeline if provided else default values", () => {
            const data = getData(valuesJSON);
            const input = getAxes(axisJSON);
            input.padding = {
                top: 15,
                bottom: 15
            };
            timeline = new Timeline(input);
            timeline.loadContent(data);
            input.bindTo = "";
            input.axis = {};
            input.content = null;
            data.tasks = [];
            const cfg = timeline.config;
            expect(input.bindTo).toBe("");
            expect(input.axis).toEqual({});
            expect(data.tasks).toEqual([]);
            expect(cfg.bindTo).toBe("#testCarbonTimeline");
            expect(cfg.axis.x.lowerLimit).toBe(axisJSON.x.lowerLimit);
            expect(cfg.axis.x.upperLimit).toBe(axisJSON.x.upperLimit);
            expect(cfg.padding.top).toEqual(input.padding.top);
            expect(cfg.padding.bottom).toEqual(input.padding.bottom);
            expect(cfg.padding.right).toEqual(constants.PADDING.right);
            expect(cfg.padding.left).toEqual(constants.PADDING.left);
            expect(cfg.padding.hasCustomPadding).toBe(true);
            expect(timeline.scale.x.range()).toEqual([
                0,
                getXAxisWidth(timeline.config)
            ]);
            expect(timeline.contentConfig.length).toBe(1);
            expect(timeline.contentConfig[0].config.key).toBe(data.key);
        });

        it("Processes the default input correctly", () => {
            const input = getAxes(axisJSON);
            timeline = new Timeline(input);
            expect(timeline.config.bindTo).toEqual(input.bindTo);
            expect(timeline.config.bindLegendTo).toEqual(input.bindLegendTo);
            expect(timeline.config.axis).not.toBeNull();
            expect(timeline.config.locale).not.toBeNull();
            expect(timeline.config.throttle).toEqual(constants.RESIZE_THROTTLE);
            expect(timeline.config.showLabel).toBeTruthy();
            expect(timeline.config.showLegend).toBeTruthy();
            expect(timeline.config.axis.x.type).toEqual(AXIS_TYPE.TIME_SERIES);
            expect(timeline.config.axis.x.ticks).toEqual({});
            expect(timeline.config.axis.x.rangeRounding).toEqual(true);
            expect(timeline.config.axis.x.domain[0]).toEqual(
                utils.parseDateTime(input.axis.x.lowerLimit)
            );
            expect(timeline.config.axis.x.domain[1]).toEqual(
                utils.parseDateTime(input.axis.x.upperLimit)
            );
            expect(timeline.config.axis.x.show).toBeTruthy();
            expect(timeline.config.shownTargets).toEqual([]);
        });
        it("Processes bindLegendTo correctly", () => {
            const input = utils.deepClone(getAxes(axisJSON));
            input.bindLegendTo = "#timelineLegendContainer";
            timeline = new Timeline(input);
            expect(timeline.config.bindLegendTo).toEqual(input.bindLegendTo);
        });
    });
    describe("When beforeInit is called", () => {
        describe("Without values", () => {
            beforeEach(() => {
                timeline = new Timeline(getAxes(axisJSON));
            });
            it("Sets the timeline container correctly", () => {
                expect(timeline.graphContainer).not.toBeNull();
                expect(timeline.graphContainer.node()).not.toBeNull();
            });
            it("Sets the height correctly", () => {
                expect(timeline.config.height).toBe(DEFAULT_HEIGHT);
            });
        });
        describe("With input loaded", () => {
            beforeEach(() => {
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(getData(valuesJSON));
            });
            it("Sets the timeline container correctly", () => {
                expect(timeline.graphContainer).not.toBeNull();
                expect(timeline.graphContainer.node()).not.toBeNull();
            });
            it("Sets the height correctly", () => {
                expect(timeline.config.height).toBe(
                    constants.TIMELINE_HEIGHT +
                        constants.PADDING.top -
                        constants.PADDING.bottom
                );
            });
        });
    });
    describe("When init is called", () => {
        describe("Without content loaded", () => {
            beforeEach(() => {
                timeline = new Timeline(getAxes(axisJSON));
            });
            it("Sets canvas width", () => {
                expect(timeline.config.canvasWidth).not.toBe(0);
                expect(timeline.config.canvasWidth).toBe(1024);
            });
            it("Sets canvas width taking container padding into consideration", () => {
                timeline.destroy();
                TimelineGraphContainer.setAttribute(
                    "style",
                    "width: 1024px; height: 400px; padding: 3rem"
                );
                timeline = new Timeline(getAxes(axisJSON));
                expect(timeline.config.canvasWidth).toBeCloserTo(928);
            });
            it("Sets canvas height", () => {
                expect(timeline.config.canvasHeight).toBe(
                    BASE_CANVAS_HEIGHT_PADDING + DEFAULT_HEIGHT
                );
            });
            it("Calculates X axis height", () => {
                expect(timeline.config.axisSizes.x).toBeGreaterThan(0);
                expect(timeline.config.axisSizes.y).toBeUndefined();
            });
            it("Calculates X axis label height", () => {
                expect(timeline.config.axisLabelHeights.x).toBeGreaterThan(0);
                expect(timeline.config.axisLabelHeights.y).toBeUndefined();
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(timeline.scale.x).not.toBeNull();
                expect(timeline.scale.x).toEqual(jasmine.any(Function));
                expect(timeline.scale.x.domain()[0].toISOString()).not.toEqual(
                    axisJSON.x.lowerLimit
                );
                expect(timeline.scale.x.domain()[1].toISOString()).not.toEqual(
                    axisJSON.x.upperLimit
                );
                expect(timeline.scale.x.range()).toEqual([
                    0,
                    getXAxisWidth(timeline.config)
                ]);
                expect(timeline.scale.y).toBeUndefined();
            });
            /**
             * CH01312019.01 - Verify the consumer will have the option to disable axis range rounding for the X axis
             */
            describe("when domains are not extended using d3.nice", () => {
                beforeEach(() => {
                    const timelineConfig = getAxes(axisJSON);
                    timelineConfig.axis.x.rangeRounding = false;
                    timeline = new Timeline(timelineConfig);
                });
                it("Calculates X axis d3 scale using domain and range", () => {
                    expect(timeline.config.axis.x.rangeRounding).toEqual(false);
                    expect(timeline.scale.x).not.toBeNull();
                    expect(timeline.scale.x).toEqual(jasmine.any(Function));
                    expect(timeline.scale.x.domain()[0].toISOString()).toEqual(
                        axisJSON.x.lowerLimit
                    );
                    expect(timeline.scale.x.domain()[1].toISOString()).toEqual(
                        axisJSON.x.upperLimit
                    );
                    expect(timeline.scale.x.range()).toEqual([
                        0,
                        getXAxisWidth(timeline.config)
                    ]);
                    expect(timeline.scale.y).toBeUndefined();
                });
            });
        });
        describe("With content loaded", () => {
            beforeEach(() => {
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(getData(valuesJSON));
            });
            it("Calculates X axis d3 scale using domain and range", () => {
                expect(timeline.scale.x).not.toBeNull();
                expect(timeline.scale.x).toEqual(jasmine.any(Function));
                expect(timeline.scale.x.range()).toEqual([
                    0,
                    getXAxisWidth(timeline.config)
                ]);
                expect(timeline.scale.x.domain()[0].toISOString()).not.toEqual(
                    axisJSON.x.lowerLimit
                );
                expect(timeline.scale.x.domain()[1].toISOString()).not.toEqual(
                    axisJSON.x.upperLimit
                );
            });
            describe("when domains are not extended using d3.nice", () => {
                beforeEach(() => {
                    const timelineConfig = getAxes(axisJSON);
                    timelineConfig.axis.x.rangeRounding = false;
                    timeline = new Timeline(timelineConfig);
                });
                it("Calculates X axis d3 scale using domain and range", () => {
                    expect(timeline.config.axis.x.rangeRounding).toEqual(false);
                    expect(timeline.scale.x).not.toBeNull();
                    expect(timeline.scale.x).toEqual(jasmine.any(Function));
                    expect(timeline.scale.x.domain()[0].toISOString()).toEqual(
                        axisJSON.x.lowerLimit
                    );
                    expect(timeline.scale.x.domain()[1].toISOString()).toEqual(
                        axisJSON.x.upperLimit
                    );
                    expect(timeline.scale.x.range()).toEqual([
                        0,
                        getXAxisWidth(timeline.config)
                    ]);
                    expect(timeline.scale.y).toBeUndefined();
                });
            });
        });
    });
    describe("When generate is called", () => {
        beforeEach(() => {
            timeline = new Timeline(getAxes(axisJSON));
        });
        it("Creates the container svg", () => {
            const graphElem = document.querySelector(timeline.config.bindTo);
            expect(graphElem).not.toBeNull();
            expect(graphElem.children[0].nodeName).toBe("DIV");
            expect(graphElem.children[0].getAttribute("class")).toBe(
                styles.container
            );
        });
        it("Creates elements in order - with showLegend", () => {
            timeline.destroy();
            timeline = new Timeline(getAxes(axisJSON));
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
        it("Creates elements in order - without showLegend", () => {
            timeline.destroy();
            timeline = new Timeline(
                Object.assign(
                    {
                        showLegend: false
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
            expect(legend).toBeUndefined();
        });
        it("Creates canvas elements in order", () => {
            const defsElement = fetchElementByClass(styles.canvas)
                .childNodes[0];
            const axisXElement = fetchElementByClass(styles.canvas)
                .childNodes[1];
            const contentElement = fetchElementByClass(styles.canvas)
                .childNodes[2];
            const labelElement = fetchElementByClass(styles.canvas)
                .childNodes[3];

            expect(defsElement).not.toBeNull();
            expect(axisXElement).not.toBeNull();
            expect(contentElement).not.toBeNull();
            expect(labelElement).not.toBeNull();

            expect(defsElement.nodeName).toBe("defs");
            expect(axisXElement.nodeName).toBe("g");
            expect(contentElement.nodeName).toBe("g");
            expect(labelElement.nodeName).toBe("g");
            expect(axisXElement.classList).toContain(styles.axis);
            expect(axisXElement.classList).toContain(styles.axisX);
            expect(contentElement.classList).toContain(
                styles.timelineGraphContent
            );
            expect(labelElement.classList).toContain(styles.axisLabelX);
        });
        it("Creates the canvas svg", () => {
            const canvas = fetchElementByClass(styles.container).firstChild;
            expect(canvas).not.toBeNull();
            expect(canvas.nodeName).toBe("svg");
            expect(canvas.getAttribute("class")).toBe(styles.canvas);
            expect(+canvas.getAttribute("height")).toBe(
                timeline.config.canvasHeight
            );
            expect(+canvas.getAttribute("width")).toBe(
                timeline.config.canvasWidth -
                    constants.BASE_CANVAS_WIDTH_PADDING
            );
        });
        it("Creates defs element with height and width", () => {
            const currentWidth =
                constants.PADDING.left + constants.PADDING.right;
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.firstChild.nodeName).toBe("clipPath");
            expect(defsElement.firstChild.firstChild.nodeName).toBe("rect");
            expect(
                defsElement.firstChild.firstChild.getAttribute("width")
            ).toBe(`${1024 - currentWidth}`);
            expect(
                +defsElement.firstChild.firstChild.getAttribute("height")
            ).toBe(timeline.config.height);
        });
        describe("Axes", () => {
            it("Creates the x axis markup", () => {
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
            });
            it("Ignores x axis show/hide property", () => {
                timeline.destroy();
                const hiddenAxisObj = utils.deepClone(axisJSON);
                hiddenAxisObj.x.show = false;
                timeline = new Timeline(getAxes(hiddenAxisObj));
                timeline.loadContent(getData(valuesJSON));
                const xAxisElement = fetchElementByClass(styles.axisX);
                expect(xAxisElement.getAttribute("class")).toBe(
                    `${styles.axis} ${styles.axisX}`
                );
                expect(xAxisElement.getAttribute("aria-hidden")).toBe("false");
            });
            describe("Locale", () => {
                it("Creates x axis with ticks in default locale", () => {
                    timeline.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    timeline = new Timeline(getAxes(localeAxisObj));
                    const xAxisElement = fetchElementByClass(styles.axisX);
                    const tick = xAxisElement
                        .querySelector(".tick")
                        .querySelector("text");
                    expect(tick.textContent).toBe("Jan 2018");
                });
                it("Creates x axis with ticks in provided locale - DE", () => {
                    timeline.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    timeline = new Timeline(
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
                    timeline.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    timeline = new Timeline(
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
                    timeline.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    timeline = new Timeline(
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
                    timeline.destroy();
                    const localeAxisObj = utils.deepClone(axisJSON);
                    localeAxisObj.x.ticks = {
                        format: "%b %Y"
                    };
                    timeline = new Timeline(
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
        describe("Label", () => {
            it("Hides the label when not enabled", () => {
                timeline.destroy();
                timeline = new Timeline(
                    Object.assign(
                        {
                            showLabel: false
                        },
                        getAxes(axisJSON)
                    )
                );
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelX}`)
                ).toBeNull();
            });
            it("Creates label x axis when text is present", () => {
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                const xLabelElement = fetchElementByClass(styles.axisLabelX);
                expect(xLabelElement.nodeName).toBe("g");
                expect(xLabelElement.querySelector("tspan").textContent).toBe(
                    axisJSON.x.label
                );
            });
            it("Doesnt create label x axis when text is not present", () => {
                timeline.destroy();
                const labelAxisObj = utils.deepClone(axisJSON);
                labelAxisObj.x.label = "";
                timeline = new Timeline(getAxes(labelAxisObj));
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.axisLabelX}`)
                ).toBeNull();
            });
            it("sanitizes x axis label text", () => {
                timeline.destroy();
                const labelAxisObj = utils.deepClone(axisJSON);
                labelAxisObj.x.label = "<HELLO DUMMY X LABEL>";
                timeline = new Timeline(getAxes(labelAxisObj));
                const xLabelElement = fetchElementByClass(styles.axisLabelX);
                expect(xLabelElement.querySelector("tspan").textContent).toBe(
                    "&lt;HELLO DUMMY X LABEL&gt;"
                );
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
                timeline.destroy();
                const legendContainer = document.createElement("div");
                legendContainer.setAttribute("id", "timelineLegendContainer");
                legendContainer.setAttribute("class", "legend-container");
                TimelineGraphContainer.appendChild(legendContainer);
                const input = utils.deepClone(getAxes(axisJSON));
                input.bindLegendTo = "#timelineLegendContainer";
                timeline = new Timeline(input);
                const container = fetchElementByClass(styles.container);
                const parentContainer = fetchElementByClass(
                    "carbon-test-class"
                );
                expect(timeline.config.bindLegendTo).toEqual(
                    input.bindLegendTo
                );
                expect(container.childNodes.length).toEqual(1);
                expect(parentContainer.childNodes.length).toEqual(2);
                expect(
                    parentContainer.childNodes[0].getAttribute("id")
                ).toEqual("timelineLegendContainer");
                expect(
                    parentContainer.childNodes[0].getAttribute("class")
                ).toEqual("legend-container");
                expect(
                    parentContainer.childNodes[1].getAttribute("class")
                ).toEqual(styles.container);
            });
            it("Shows legend when enabled", () => {
                timeline.destroy();
                timeline = new Timeline(
                    Object.assign(
                        {
                            showLegend: true
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
            it("hides legend when not enabled", () => {
                timeline.destroy();
                timeline = new Timeline(
                    Object.assign(
                        {
                            showLegend: false
                        },
                        getAxes(axisJSON)
                    )
                );
                const canvasElement = fetchElementByClass(styles.canvas);
                expect(
                    canvasElement.querySelector(`.${styles.legend}`)
                ).toBeNull();
            });
            it("Shows legend items correctly", () => {
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(getData(valuesJSON));
                const legendElement = fetchElementByClass(styles.legend);
                expect(legendElement.children.length).toBe(1);
                expect(legendElement.children[0].nodeName).toBe("LI");
                expect(legendElement.children[0].getAttribute("class")).toBe(
                    `${styles.legendItem}`
                );
                expect(
                    legendElement.children[0].getAttribute("aria-current")
                ).toBeTruthy();
                expect(legendElement.children[0].getAttribute("role")).toBe(
                    "listitem"
                );
                expect(
                    legendElement.children[0].getAttribute("aria-labelledby")
                ).toBe("Timeline A");
                expect(
                    legendElement.children[0].getAttribute("aria-describedby")
                ).toBe("uid_1");
            });
        });
        it("Attaches event handlers", () => {
            timeline.resizeHandler();
            expect(timeline.resizeHandler).not.toBeNull();
            expect(timeline.resizeHandler).toEqual(jasmine.any(Function));
        });
    });
    describe("When destruct is called", () => {
        beforeEach(() => {
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(getData(valuesJSON));
            timeline.destroy();
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
            expect(timeline.config).toEqual({
                axis: Object({
                    x: Object({})
                }),
                shownTargets: Object({}),
                pan: {}
            });
            expect(timeline.axis).toEqual({});
            expect(timeline.scale).toEqual({});
            expect(timeline.svg).toBeNull();
            expect(timeline.graphContainer).toBeNull();
            expect(timeline.legendSVG).toBeNull();
            expect(timeline.content).toEqual([]);
            expect(timeline.contentConfig).toEqual([]);
            expect(timeline.resizeHandler).toBeNull();
        });
    });
});
