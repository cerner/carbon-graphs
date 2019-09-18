"use strict";
import d3 from "d3";
import sinon from "sinon";
import Timeline from "../../../../main/js/controls/Timeline";
import { Shape } from "../../../../main/js/core";
import {
    getShapeForTarget,
    getXAxisWidth,
    getXAxisYPosition
} from "../../../../main/js/controls/Timeline/helpers/creationHelpers";
import { getYAxisHeight } from "../../../../main/js/helpers/axis";
import constants, {
    AXIS_TYPE,
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../../main/js/helpers/legend";
import styles from "../../../../main/js/helpers/styles";
import {
    getCurrentTransform,
    getSVGAnimatedTransformList,
    getTransformScale
} from "../../../../main/js/helpers/transformUtils";
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
    DEFAULT_HEIGHT,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getData,
    secondaryValuesJSON,
    valuesJSON
} from "./helpers";

describe("Timeline", () => {
    let timeline = null;
    let TimelineGraphContainer;
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
                constants.PADDING.left +
                constants.PADDING.right +
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
                    legendElement.children[0].getAttribute("aria-selected")
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
    describe("When load is called", () => {
        let input;
        beforeEach(() => {
            input = getData(valuesJSON);
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(input);
        });
        describe("Validates input", () => {
            it("Throws error on empty input", () => {
                expect(() => {
                    timeline.loadContent({});
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("Throws error on null input", () => {
                expect(() => {
                    timeline.loadContent(null);
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("Throws error on empty key", () => {
                expect(() => {
                    const data = getData(valuesJSON);
                    data.key = null;
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("Throws error on undefined key", () => {
                expect(() => {
                    const data = getData(valuesJSON);
                    data.key = undefined;
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("Throws error on invalid label", () => {
                expect(() => {
                    const data = getData(valuesJSON);
                    data.label = null;
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            });
            it("Throws error on invalid label display", () => {
                expect(() => {
                    const data = getData(valuesJSON);
                    data.label = {};
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
                expect(() => {
                    const data = getData(valuesJSON);
                    data.label = {
                        display: null
                    };
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
                expect(() => {
                    const data = getData(valuesJSON);
                    data.label = {
                        display: ""
                    };
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            });
            it("Throws error for invalid values", () => {
                expect(() => {
                    const data = getData(valuesJSON);
                    data.values = null;
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
            });
            it("Throws error for invalid values type", () => {
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                expect(() => {
                    const data = getData(valuesJSON);
                    data.values = [
                        {
                            x: 10
                        }
                    ];
                    timeline.loadContent(data);
                }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
            });
            it("Throws error for duplicate keys", () => {
                expect(() => {
                    timeline.loadContent(getData(valuesJSON));
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
        });
        it("Clones the input object correctly", () => {
            expect(timeline.contentConfig[0].config.key).toBe(input.key);
            expect(timeline.contentConfig[0].config.color).toBe(input.color);
            expect(timeline.contentConfig[0].config.shape).toBe(input.shape);
            expect(timeline.contentConfig[0].config.label).toEqual(input.label);
            expect(timeline.contentConfig[0].config.onClick).toEqual(
                jasmine.any(Function)
            );
            expect(timeline.contentConfig[0].config.values.length).toBe(2);
            expect(
                timeline.contentConfig[0].config.values.every(
                    (i, index) => i.x === input.values[index].x
                )
            ).toBeTruthy();
            expect(
                timeline.contentConfig[0].config.values.every(
                    (i, index) => i.y === input.values[index].y
                )
            ).toBeTruthy();
        });
        it("Any changes to input object doesn't affect the config", () => {
            timeline.destroy();
            const mutatedInput = getData(valuesJSON, false, false);
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(mutatedInput);
            mutatedInput.key = "";
            mutatedInput.color = "";
            mutatedInput.shape = "";
            mutatedInput.onClick = null;
            mutatedInput.label = {};
            mutatedInput.values = [];

            expect(timeline.contentConfig[0].config.key).not.toBe(
                mutatedInput.key
            );
            expect(timeline.contentConfig[0].config.color).not.toBe(
                mutatedInput.color
            );
            expect(timeline.contentConfig[0].config.shape).not.toBe(
                mutatedInput.shape
            );
            expect(timeline.contentConfig[0].config.label).not.toEqual(
                mutatedInput.label
            );
            expect(timeline.contentConfig[0].config.onClick).toEqual(
                jasmine.any(Function)
            );
            expect(timeline.contentConfig[0].config.values).not.toBe(
                mutatedInput.values
            );
            expect(timeline.contentConfig[0].config.values.length).toBe(2);
        });
        it("Defaults color to black when not provided", () => {
            const data = timeline.contentConfig[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.color === constants.DEFAULT_COLOR
                )
            ).toBeTruthy();
        });
        it("Defaults shapes to circle when not provided", () => {
            const data = timeline.contentConfig[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.shape === SHAPES.CIRCLE
                )
            ).toBeTruthy();
        });
        it("when custom padding is used", () => {
            timeline.destroy();
            input = getData(valuesJSON);
            const config = getAxes(axisJSON);
            config.padding = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            timeline = new Timeline(config);
            timeline.loadContent(input);
            const canvas = d3.select(`.${styles.canvas}`);
            const canvasHeight =
                getYAxisHeight(timeline.config) +
                (config.padding.bottom * 2 + config.padding.top) * 2;
            expect(toNumber(canvas.attr("height"), 10)).toEqual(canvasHeight);
            expect(getXAxisYPosition(timeline.config)).toEqual(
                (config.padding.top + config.padding.bottom) * 2
            );
        });
        describe("Draws the graph", () => {
            let input = null;
            let secondaryInput = null;
            beforeEach(() => {
                timeline.destroy();
                input = getData(valuesJSON, false, false);
                secondaryInput = getData(secondaryValuesJSON, false, false);
                secondaryInput.key = "uid_2";
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(input);
            });
            it("Adds content container for each content", () => {
                const contentContainer = fetchElementByClass(
                    styles.timelineContentGroup
                );
                expect(contentContainer).not.toBeNull();
                expect(contentContainer.tagName).toBe("g");
                expect(contentContainer.getAttribute("aria-describedby")).toBe(
                    input.key
                );
            });
            it("Adds container for each data points sets for each line", () => {
                timeline.loadContent(secondaryInput);
                const graphContent = document.body.querySelectorAll(
                    `.${styles.timelineContentGroup}`
                );
                expect(graphContent.length).toBe(2);
            });
            it("Adds legend for each data points sets for each line", () => {
                timeline.loadContent(secondaryInput);
                const legendItems = document.body.querySelectorAll(
                    `.${styles.legendItem}`
                );
                expect(legendItems.length).toBe(2);
            });
            it("Disables legend when disabled flag is set", () => {
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                input = getData(valuesJSON, false, false);
                input.label.isDisabled = true;
                timeline.loadContent(input);
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
            });
            it("Adds points for each data point", () => {
                const pointsGroup = fetchElementByClass(
                    styles.timelineContentGroup
                );
                const points = pointsGroup.querySelectorAll(`.${styles.point}`);
                expect(points.length).toBe(valuesJSON.length);
            });
            it("Points have correct color", () => {
                const points = fetchElementByClass(styles.point);
                expect(points.attributes.getNamedItem("style").value).toBe(
                    "fill: #007cc3;"
                );
            });
            it("Points have correct shape", () => {
                const points = fetchElementByClass(styles.point);
                expect(
                    points.firstChild.firstChild.attributes.getNamedItem("d")
                        .value
                ).toBe(SHAPES.RHOMBUS.path.d);
            });
            it("Points have correct unique key assigned", () => {
                const points = fetchElementByClass(styles.point);
                expect(points.getAttribute("aria-describedby")).toBe(input.key);
            });
            it("Adds a selected data point for each point", () => {
                const pointsGroup = fetchElementByClass(
                    styles.timelineContentGroup
                );
                const selectedPoints = pointsGroup.querySelectorAll(
                    `.${styles.dataPointSelection}`
                );
                expect(selectedPoints.length).toBe(valuesJSON.length);
            });
            it("Selected data point is hidden by default", () => {
                const selectedPoints = fetchElementByClass(
                    styles.dataPointSelection
                );
                expect(selectedPoints.getAttribute("aria-hidden")).toBe("true");
            });
            it("Selected data point has circle as shape", () => {
                const selectedPoints = fetchElementByClass(
                    styles.dataPointSelection
                );
                expect(selectedPoints.tagName).toBe("svg");
                expect(selectedPoints.firstChild.nodeName).toBe("g");
                expect(selectedPoints.firstChild.firstChild.nodeName).toBe(
                    "path"
                );
                expect(
                    selectedPoints.firstChild.firstChild.getAttribute("d")
                ).toBe(SHAPES.CIRCLE.path.d);
            });
            it("Selected data point has correct unique key assigned", () => {
                const selectedPoints = fetchElementByClass(
                    styles.dataPointSelection
                );
                expect(selectedPoints.getAttribute("aria-describedby")).toBe(
                    input.key
                );
            });
            describe("When clicked on a data point", () => {
                it("Does not do anything if no onClick callback is provided", (done) => {
                    const onClickFunctionSpy = sinon.spy();
                    timeline.destroy();
                    timeline = new Timeline(getAxes(axisJSON));
                    input = getData(valuesJSON, false, false);
                    input.onClick = null;
                    timeline.loadContent(input);
                    const point = fetchElementByClass(styles.point);
                    triggerEvent(point, "click", () => {
                        expect(onClickFunctionSpy.calledOnce).toBeFalsy();
                        expect(point.getAttribute("aria-disabled")).toBe(
                            "true"
                        );
                        done();
                    });
                });
                it("Hides data point selection when parameter callback is called", (done) => {
                    timeline.destroy();
                    timeline = new Timeline(getAxes(axisJSON));
                    input = getData(valuesJSON, false, false);
                    input.onClick = (clearSelectionCallback) => {
                        clearSelectionCallback();
                    };
                    timeline.loadContent(input);
                    const point = fetchElementByClass(styles.point);
                    triggerEvent(point, "click", () => {
                        const selectionPoint = fetchElementByClass(
                            styles.dataPointSelection
                        );
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
                it("Calls onClick callback", (done) => {
                    const onClickFunctionSpy = sinon.spy();
                    timeline.destroy();
                    timeline = new Timeline(getAxes(axisJSON));
                    input = getData(valuesJSON, false, false);
                    input.onClick = onClickFunctionSpy;
                    timeline.loadContent(input);
                    const point = fetchElementByClass(styles.point);
                    triggerEvent(point, "click", () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        done();
                    });
                });
                it("Emits correct parameters", (done) => {
                    let args = {};
                    timeline.destroy();
                    timeline = new Timeline(getAxes(axisJSON));
                    input = getData(valuesJSON, false, false);
                    input.onClick = (cb, key, index, val, target) => {
                        args = {
                            cb,
                            key,
                            index,
                            val,
                            target
                        };
                    };
                    timeline.loadContent(input);
                    const point = document.querySelectorAll(
                        `.${styles.point}`
                    )[1];
                    triggerEvent(point, "click", () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toEqual(new Date(valuesJSON[1].x));
                        expect(args.target).not.toBeNull();
                        done();
                    });
                });
                it("Highlights the data point", (done) => {
                    const selectionPoint = fetchElementByClass(
                        styles.dataPointSelection
                    );
                    const point = fetchElementByClass(styles.point);
                    triggerEvent(point, "click", () => {
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "false"
                        );
                        done();
                    });
                });
                it("Removes highlight when data point is clicked again", (done) => {
                    const selectionPoint = fetchElementByClass(
                        styles.dataPointSelection
                    );
                    const point = fetchElementByClass(styles.point);
                    triggerEvent(point, "click", () => {
                        triggerEvent(point, "click", () => {
                            expect(
                                selectionPoint.getAttribute("aria-hidden")
                            ).toBe("true");
                            done();
                        });
                    });
                });
            });
            describe("When clicked on a data point's near surrounding area", () => {
                it("highlights the data point", (done) => {
                    const selectionPoint = fetchElementByClass(
                        styles.dataPointSelection
                    );
                    triggerEvent(selectionPoint, "click", () => {
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "false"
                        );
                        done();
                    });
                });
                it("removes highlight when clicked again", (done) => {
                    const selectionPoint = fetchElementByClass(
                        styles.dataPointSelection
                    );
                    triggerEvent(selectionPoint, "click", () => {
                        triggerEvent(selectionPoint, "click", () => {
                            expect(
                                selectionPoint.getAttribute("aria-hidden")
                            ).toBe("true");
                            done();
                        });
                    });
                });
                it("Emits correct parameters", (done) => {
                    let args = {};
                    timeline.destroy();
                    timeline = new Timeline(getAxes(axisJSON));
                    input = getData(valuesJSON, false, false);
                    input.onClick = (cb, key, index, val, target) => {
                        args = {
                            cb,
                            key,
                            index,
                            val,
                            target
                        };
                    };
                    timeline.loadContent(input);
                    const point = document.querySelectorAll(
                        `.${styles.dataPointSelection}`
                    )[1];
                    triggerEvent(point, "click", () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toEqual(new Date(valuesJSON[1].x));
                        expect(args.target).not.toBeNull();
                        done();
                    });
                });
            });
        });
        describe("Prepares to load legend item", () => {
            beforeEach(() => {
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
            });
            it("Does not load if legend is opted to be hidden", () => {
                timeline.destroy();
                const input = getAxes(axisJSON);
                input.showLegend = false;
                const noLegendGraph = new Timeline(input);
                noLegendGraph.loadContent(getData(valuesJSON));
                const legendContainer = fetchElementByClass(styles.legend);
                expect(legendContainer).toBeNull();
                noLegendGraph.destroy();
            });
            it("Loads item with a shape and text", () => {
                const input = getData(valuesJSON, false, false);
                timeline.loadContent(input);
                const legendItem = fetchElementByClass(styles.legendItem);
                const legendItemBtn = fetchElementByClass(styles.legendItemBtn);
                expect(legendItem).not.toBeNull();
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
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
            it("Loads the correct shape", () => {
                const input = getData(valuesJSON, false, false);
                timeline.loadContent(input);
                const legendItem = fetchElementByClass(styles.legendItem);
                const iconSVG = legendItem.querySelector("svg");
                const iconPath = legendItem.querySelector("path");
                expect(iconSVG).not.toBeNull();
                expect(iconSVG.classList).toContain(styles.legendItemIcon);
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("d")).toBe(SHAPES.RHOMBUS.path.d);
            });
            it("Loads the correct color", () => {
                const input = getData(valuesJSON, false, false);
                timeline.loadContent(input);
                const legendItem = fetchElementByClass(styles.legendItem);
                const iconSVG = legendItem.querySelector("svg");
                const iconPath = legendItem.querySelector("path");
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("d")).toEqual(
                    getShapeForTarget(input).path.d
                );
                expect(iconSVG.getAttribute("style")).toBe(
                    `fill: ${COLORS.BLUE};`
                );
            });
            it("Attaches click event handlers correctly", (done) => {
                const input = getData(valuesJSON, false, false);
                timeline.loadContent(input);
                const legendItem = fetchElementByClass(styles.legendItem);
                triggerEvent(legendItem, "click", () => {
                    expect(legendItem.getAttribute("aria-selected")).toBe(
                        "false"
                    );
                    done();
                });
            });
            it("On click hides data points", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                timeline.loadContent(getData(valuesJSON, false, false));
                triggerEvent(
                    fetchElementByClass(styles.legendItem),
                    "click",
                    () => {
                        timeline.resize();
                        delay(() => {
                            expect(
                                window.requestAnimationFrame
                            ).toHaveBeenCalledTimes(1);
                            expect(
                                fetchElementByClass(styles.point).getAttribute(
                                    "aria-hidden"
                                )
                            ).toBe("true");
                            expect(
                                fetchElementByClass(
                                    styles.dataPointSelection
                                ).getAttribute("aria-hidden")
                            ).toBe("true");
                            rafSpy.calls.reset();
                            done();
                        }, TRANSITION_DELAY);
                    }
                );
            });
            it("On click, removes the first data point set but keeps the rest", (done) => {
                const inputPrimary = getData(valuesJSON, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Timeline B"
                    },
                    values: valuesJSON
                };
                timeline.loadContent(inputPrimary);
                timeline.loadContent(inputSecondary);
                triggerEvent(
                    fetchElementByClass(styles.legendItem),
                    "click",
                    () => {
                        timeline.resize();
                        delay(() => {
                            const primaryElement = document.querySelector(
                                `.${styles.timelineContentGroup}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const secondaryElement = document.querySelector(
                                `.${styles.timelineContentGroup}[aria-describedby="${inputSecondary.key}"]`
                            );
                            expect(timeline.config.shownTargets.length).toBe(1);
                            expect(
                                primaryElement
                                    .querySelector(`.${styles.point}`)
                                    .getAttribute("aria-hidden")
                            ).toBe("true");
                            expect(
                                primaryElement
                                    .querySelector(
                                        `.${styles.dataPointSelection}`
                                    )
                                    .getAttribute("aria-hidden")
                            ).toBe("true");
                            expect(
                                secondaryElement
                                    .querySelector(`.${styles.point}`)
                                    .getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                secondaryElement
                                    .querySelector(
                                        `.${styles.dataPointSelection}`
                                    )
                                    .getAttribute("aria-hidden")
                            ).toBe("true");
                            done();
                        }, TRANSITION_DELAY);
                    }
                );
            });
            it("On clicking twice toggles points back to visible", (done) => {
                const rafSpy = spyOn(
                    window,
                    "requestAnimationFrame"
                ).and.callThrough();
                timeline.loadContent(getData(valuesJSON, false, false));
                const legendItem = fetchElementByClass(styles.legendItem);
                triggerEvent(legendItem, "click", () => {
                    timeline.resize();
                    triggerEvent(legendItem, "click", () => {
                        timeline.resize();
                        delay(() => {
                            expect(
                                window.requestAnimationFrame
                            ).toHaveBeenCalledTimes(2);
                            expect(
                                fetchElementByClass(styles.point).getAttribute(
                                    "aria-hidden"
                                )
                            ).toBe("false");
                            expect(
                                fetchElementByClass(
                                    styles.dataPointSelection
                                ).getAttribute("aria-hidden")
                            ).toBe("true");
                            rafSpy.calls.reset();
                            done();
                        }, TRANSITION_DELAY);
                    });
                });
            });
            it("Shown targets are removed from Graph", (done) => {
                timeline.loadContent(getData(valuesJSON, false, false));
                triggerEvent(
                    fetchElementByClass(styles.legendItem),
                    "click",
                    () => {
                        expect(timeline.config.shownTargets.length).toBe(0);
                        done();
                    }
                );
            });
            it("Shown targets are updated back when toggled", (done) => {
                timeline.loadContent(getData(valuesJSON, false, false));
                const legendItem = fetchElementByClass(styles.legendItem);
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(legendItem, "click", () => {
                        expect(timeline.config.shownTargets.length).toBe(1);
                        done();
                    });
                });
            });
            it("Attaches mouse enter event handlers correctly", (done) => {
                const inputPrimary = getData(valuesJSON, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesJSON
                };
                timeline.loadContent(inputPrimary);
                timeline.loadContent(inputSecondary);
                const legendItem = fetchElementByClass(styles.legendItem);
                triggerEvent(legendItem, "mouseenter", () => {
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
            it("Attaches mouse leave event handlers correctly", (done) => {
                const inputPrimary = getData(valuesJSON, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesJSON
                };
                timeline.loadContent(inputPrimary);
                timeline.loadContent(inputSecondary);
                const legendItem = fetchElementByClass(styles.legendItem);
                triggerEvent(legendItem, "mouseleave", () => {
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
    });
    describe("When resize is called", () => {
        beforeEach(() => {
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(getData(valuesJSON));
        });
        it("Sets the canvas width correctly", (done) => {
            const rafSpy = spyOn(window, "requestAnimationFrame");
            const currentWidth = timeline.config.canvasWidth;
            expect(currentWidth).toBe(1024);
            TimelineGraphContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            triggerEvent(window, "resize", () => {
                timeline.resize();
                delay(() => {
                    expect(timeline.config.canvasWidth).toBe(800);
                    rafSpy.calls.reset();
                    done();
                }, TRANSITION_DELAY);
            });
        });
        it("Sets the defs clipPath width and height correctly", (done) => {
            TimelineGraphContainer.setAttribute(
                "style",
                "width: 800px; height: 200px"
            );
            triggerEvent(window, "resize", () => {
                const defsElement = fetchElementByClass(styles.canvas)
                    .firstChild;
                const clipPathRect = defsElement.firstChild.firstChild;
                expect(+clipPathRect.getAttribute("height")).toBe(
                    timeline.config.height
                );
                expect(+clipPathRect.getAttribute("width")).toBe(
                    getXAxisWidth(timeline.config)
                );
                done();
            });
        });
        it("Calculates X axis d3 scale using domain and range", (done) => {
            triggerEvent(window, "resize", () => {
                expect(timeline.scale.x).not.toBeNull();
                expect(timeline.scale.x).toEqual(jasmine.any(Function));
                done();
            });
        });
        it("Sets the throttle correctly, if undefined", () => {
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = undefined;
            timeline.destroy();
            timeline = new Timeline(throttledInput);
            expect(timeline.config.throttle).toEqual(constants.RESIZE_THROTTLE);
        });
        it("Sets the throttle correctly", () => {
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = 400;
            timeline.destroy();
            timeline = new Timeline(throttledInput);
            expect(timeline.config.throttle).toEqual(400);
            expect(timeline.config.throttle).not.toEqual(
                constants.RESIZE_THROTTLE
            );
        });
        it("Throttles based on delay", (done) => {
            const rafSpy = spyOn(window, "requestAnimationFrame");
            const throttledInput = getAxes(axisJSON);
            throttledInput.throttle = undefined;
            timeline.destroy();
            timeline = new Timeline(throttledInput);
            TimelineGraphContainer.setAttribute(
                "style",
                "width: 600px; height: 200px"
            );
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
            timeline.destroy();
            timeline = new Timeline(throttledInput);
            TimelineGraphContainer.setAttribute(
                "style",
                "width: 400px; height: 200px"
            );
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
        /**
         * BF12182018.01 - Verify the consumer has the option to provide custom padding for the graph-container.
         */
        it("when custom padding is used", (done) => {
            timeline.destroy();
            const input = getData(valuesJSON);
            const config = getAxes(axisJSON);
            config.padding = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            config.throttle = 500;
            timeline = new Timeline(config);
            timeline.loadContent(input);
            TimelineGraphContainer.setAttribute(
                "style",
                "width: 400px; height: 200px"
            );
            const canvasHeight =
                getYAxisHeight(timeline.config) +
                (config.padding.bottom * 2 + config.padding.top) * 2;
            const canvas = fetchElementByClass(styles.canvas);
            expect(toNumber(canvas.getAttribute("height"), 10)).toEqual(
                canvasHeight
            );
            triggerEvent(
                window,
                "resize",
                () => {
                    done();
                    expect(getXAxisYPosition(timeline.config)).toEqual(
                        (config.padding.top + config.padding.bottom) * 2
                    );
                },
                config.throttle
            );
        });
    });
    describe("When unload is called", () => {
        let input = null;
        beforeEach(() => {
            input = getData(valuesJSON, false, false);
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(input);
        });
        it("Throws error if invalid key provided", () => {
            expect(() => {
                timeline.unloadContent({
                    key: "DUMMY"
                });
            }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
        });
        it("Clears the graph", () => {
            timeline.unloadContent({
                key: input.key,
                label: input.label
            });
            const containerElement = fetchElementByClass(
                styles.timelineGraphContent
            );
            expect(containerElement.children.length).toBe(0);
        });
        it("Removes the legend from graph", () => {
            timeline.unloadContent({
                key: input.key,
                label: input.label
            });
            const graphLegend = fetchElementByClass(styles.legend);
            const lineLegendItem = fetchElementByClass(styles.legendItem);
            expect(graphLegend).not.toBeNull();
            expect(lineLegendItem).toBeNull();
        });
        it("Resets the config", () => {
            timeline.unloadContent({
                key: input.key,
                label: input.label
            });
            expect(timeline.contentConfig.length).toBe(0);
            expect(timeline.content.length).toBe(0);
        });
        it("Removes only the unloaded item from config", () => {
            const secondaryInput = getData(secondaryValuesJSON, false, false);
            secondaryInput.key = "uid_2";
            timeline.loadContent(secondaryInput);
            timeline.unloadContent({
                key: input.key,
                label: input.label
            });
            expect(timeline.contentConfig.length).toBe(1);
            expect(timeline.contentConfig[0].config.key).toBe(
                secondaryInput.key
            );
            expect(timeline.content.length).toBe(1);
            expect(timeline.content[0]).toBe(secondaryInput.key);
        });
        it("when custom padding is used", () => {
            timeline.destroy();
            input = getData(valuesJSON);
            const config = getAxes(axisJSON);
            config.padding = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            timeline = new Timeline(config);
            timeline.loadContent(input);
            const secondaryInput = getData(secondaryValuesJSON, false, false);
            secondaryInput.key = "uid_2";
            timeline.loadContent(secondaryInput);
            timeline.unloadContent(secondaryInput);
            const canvas = d3.select(`.${styles.canvas}`);
            const canvasHeight =
                getYAxisHeight(timeline.config) +
                (config.padding.bottom * 2 + config.padding.top) * 2;
            expect(toNumber(canvas.attr("height"), 10)).toEqual(canvasHeight);
            expect(getXAxisYPosition(timeline.config)).toEqual(
                (config.padding.top + config.padding.bottom) * 2
            );
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
                shownTargets: Object({})
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
    describe("Criticality", () => {
        let inputPrimary = null;
        let inputSecondary = null;
        describe("On load", () => {
            it("Does not add indicator if data point is not critical", () => {
                timeline = new Timeline(getAxes(axisJSON));
                const valuesMutated = utils.deepClone(valuesJSON);
                timeline.loadContent(getData(valuesMutated));

                const criticalOuterElement = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalOuterElement).toBeNull();
                expect(criticalInnerElement).toBeNull();
            });
            it("Does not add indicator if data point is critical false", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = false;
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(getData(valuesMutated));
                const criticalOuterElement = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalOuterElement).toBeNull();
                expect(criticalInnerElement).toBeNull();
            });
            it("Adds outer indicator - Red", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                timeline = new Timeline(getAxes(axisJSON));
                inputPrimary = getData(valuesMutated);
                timeline.loadContent(inputPrimary);
                const criticalOuterElement = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                expect(criticalOuterElement).not.toBeNull();
                expect(criticalOuterElement.nodeName).toBe("svg");
                expect(criticalOuterElement.classList).toContain(styles.point);
                expect(criticalOuterElement.classList).toContain(
                    styles.criticalityTimelineOuterPoint
                );
                expect(criticalOuterElement.getAttribute("style")).toBe(
                    "fill: undefined;"
                );
                expect(
                    criticalOuterElement.getAttribute("aria-describedby")
                ).toBe(inputPrimary.key);
            });
            it("Adds inner indicator - White", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const criticalInnerElement = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalInnerElement).not.toBeNull();
                expect(criticalInnerElement.nodeName).toBe("svg");
                expect(criticalInnerElement.classList).toContain(styles.point);
                expect(criticalInnerElement.classList).toContain(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalInnerElement.getAttribute("style")).toBe(
                    "fill: undefined;"
                );
                expect(
                    criticalInnerElement.getAttribute("aria-describedby")
                ).toBe(inputPrimary.key);
            });
            it("Adds indicators inner and outer with same shape", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated, false, false);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);

                const criticalOuterElement = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                const criticalOuterGroupElement =
                    criticalOuterElement.firstChild;
                const criticalInnerGroupElement =
                    criticalInnerElement.firstChild;
                const currentShape = new Shape(
                    getShapeForTarget(inputPrimary)
                ).getShapeElement();
                const currentShapeGroupElement = currentShape.firstChild;
                expect(criticalOuterElement.nodeName).toBe(
                    currentShape.nodeName
                );
                expect(criticalInnerElement.nodeName).toBe(
                    currentShape.nodeName
                );
                expect(
                    criticalOuterGroupElement.firstChild.getAttribute("d")
                ).toBe(currentShapeGroupElement.firstChild.getAttribute("d"));
                expect(
                    criticalInnerGroupElement.firstChild.getAttribute("d")
                ).toBe(currentShapeGroupElement.firstChild.getAttribute("d"));
            });
            it("Resizes properly", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated, false, false);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const timelinePointsBefore = fetchAllElementsByClass(
                    styles.point
                );
                const criticalOuterElementBefore = timelinePointsBefore[0];
                const criticalInnerElementBefore = timelinePointsBefore[1];
                const dataPointElementBefore = timelinePointsBefore[2];

                expect(dataPointElementBefore.getAttribute("x")).toEqual(
                    criticalInnerElementBefore.getAttribute("x")
                );
                expect(dataPointElementBefore.getAttribute("x")).toEqual(
                    criticalOuterElementBefore.getAttribute("x")
                );
                expect(dataPointElementBefore.getAttribute("y")).toEqual(
                    criticalInnerElementBefore.getAttribute("y")
                );
                expect(dataPointElementBefore.getAttribute("y")).toEqual(
                    criticalOuterElementBefore.getAttribute("y")
                );

                TimelineGraphContainer.setAttribute(
                    "style",
                    "width: 1234px; height: 323px"
                );
                timeline.resize();

                triggerEvent(window, "resize", () => {
                    const timelinePointsAfter = fetchAllElementsByClass(
                        styles.point
                    );
                    const criticalOuterElementAfter = timelinePointsAfter[0];
                    const criticalInnerElementAfter = timelinePointsAfter[1];
                    const dataPointElementAfter = timelinePointsAfter[2];

                    expect(dataPointElementAfter.getAttribute("x")).toEqual(
                        criticalInnerElementAfter.getAttribute("x")
                    );
                    expect(dataPointElementAfter.getAttribute("x")).toEqual(
                        criticalOuterElementAfter.getAttribute("x")
                    );
                    expect(dataPointElementAfter.getAttribute("y")).toEqual(
                        criticalInnerElementAfter.getAttribute("y")
                    );
                    expect(dataPointElementAfter.getAttribute("y")).toEqual(
                        criticalOuterElementAfter.getAttribute("y")
                    );
                });
            });
            it("Translates properly", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated, false, false);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const criticalOuterElementPath = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                ).firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
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
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated, false, false);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const criticalOuterElementPath = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                ).firstChild;
                const criticalInnerElementPath = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                ).firstChild;
                const dataElementPath = fetchAllElementsByClass(styles.point)[2]
                    .firstChild;
                expect(getTransformScale(criticalOuterElementPath)[0]).toBe(
                    getTransformScale(dataElementPath)[0]
                );
                expect(getTransformScale(criticalInnerElementPath)[0]).toBe(
                    getTransformScale(dataElementPath)[0]
                );
            });
            it("Shows even on multiple data-set", () => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated, false, false);
                inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Timeline B"
                    },
                    values: valuesJSON
                };
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                timeline.loadContent(inputSecondary);
                const criticalOuterElement = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                const criticalInnerElement = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalOuterElement).not.toBeNull();
                expect(criticalOuterElement.nodeName).toBe("svg");
                expect(criticalOuterElement.classList).toContain(
                    styles.criticalityTimelineOuterPoint
                );
                expect(criticalOuterElement.getAttribute("style")).toBe(
                    "fill: undefined;"
                );
                expect(criticalInnerElement).not.toBeNull();
                expect(criticalInnerElement.nodeName).toBe("svg");
                expect(criticalInnerElement.classList).toContain(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalInnerElement.getAttribute("style")).toBe(
                    "fill: undefined;"
                );
            });
            it("Selects data point when clicked on outer indicator", (done) => {
                const criticalOuterPointSpy = sinon.spy();
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated);
                inputPrimary.onClick = criticalOuterPointSpy;
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const point = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                triggerEvent(point, "click", () => {
                    expect(criticalOuterPointSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Emits correct parameters when clicked on outer indicator", (done) => {
                let args = {};
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[1].isCritical = true;
                inputPrimary = getData(valuesMutated);
                inputPrimary.onClick = (cb, key, index, val, target) => {
                    args = {
                        cb,
                        key,
                        index,
                        val,
                        target
                    };
                };

                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const point = TimelineGraphContainer.querySelector(
                    `.${styles.criticalityTimelineOuterPoint}`
                );
                triggerEvent(point, "click", () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.x).toEqual(
                        new Date(inputPrimary.values[1].x)
                    );
                    expect(args.target).not.toBeNull();
                    done();
                });
            });
            it("Selects data point when clicked on inner indicator", (done) => {
                const criticalInnerPointSpy = sinon.spy();
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated);
                inputPrimary.onClick = criticalInnerPointSpy;
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const point = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                triggerEvent(point, "click", () => {
                    expect(criticalInnerPointSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Emits correct parameters when clicked on inner indicator", (done) => {
                let args = {};
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[1].isCritical = true;
                inputPrimary = getData(valuesMutated);
                inputPrimary.onClick = (cb, key, index, val, target) => {
                    args = {
                        cb,
                        key,
                        index,
                        val,
                        target
                    };
                };
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                const point = TimelineGraphContainer.querySelector(
                    `.${styles.criticalityTimelineInnerPoint}`
                );
                triggerEvent(point, "click", () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.x).toEqual(
                        new Date(inputPrimary.values[1].x)
                    );
                    expect(args.target).not.toBeNull();
                    done();
                });
            });
        });
        describe("On unload", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated);
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                timeline.unloadContent(inputPrimary);
            });
            it("Removes outer indicator", () => {
                const criticalOuterElement = fetchElementByClass(
                    styles.criticalityTimelineOuterPoint
                );
                expect(criticalOuterElement).toBeNull();
            });
            it("Removes inner indicator", () => {
                const criticalInnerElement = fetchElementByClass(
                    styles.criticalityTimelineInnerPoint
                );
                expect(criticalInnerElement).toBeNull();
            });
        });
        describe("On legend item hover", () => {
            describe("On multiple data-set", () => {
                beforeEach(() => {
                    const valuesMutated = utils.deepClone(valuesJSON);
                    const valuesMutatedAlt = utils.deepClone(valuesJSON);
                    valuesMutated[0].isCritical = true;
                    valuesMutatedAlt[1].isCritical = true;
                    inputPrimary = getData(valuesMutated);
                    inputSecondary = {
                        key: `uid_2`,
                        label: {
                            display: "Timeline B"
                        },
                        values: utils.deepClone(valuesMutatedAlt)
                    };
                    timeline = new Timeline(getAxes(axisJSON));
                    timeline.loadContent(inputPrimary);
                    timeline.loadContent(inputSecondary);
                });
                it("Blurs other indicators", (done) => {
                    const legendItem = TimelineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(criticalOuterElement.classList).toContain(
                            styles.blur
                        );
                        expect(criticalInnerElement.classList).toContain(
                            styles.blur
                        );
                        expect(criticalOuterElementAlt.classList).not.toContain(
                            styles.blur
                        );
                        expect(criticalInnerElementAlt.classList).not.toContain(
                            styles.blur
                        );
                        done();
                    });
                });
                it("Removes blur for other data points on mouse-leave", (done) => {
                    const legendItem = TimelineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                    );
                    triggerEvent(legendItem, "mouseenter", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalOuterElementAlt = document.querySelector(
                                `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                            );
                            const criticalInnerElementAlt = document.querySelector(
                                `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                            );
                            expect(
                                criticalOuterElement.classList
                            ).not.toContain(styles.blur);
                            expect(
                                criticalInnerElement.classList
                            ).not.toContain(styles.blur);
                            expect(
                                criticalOuterElementAlt.classList
                            ).not.toContain(styles.blur);
                            expect(
                                criticalInnerElementAlt.classList
                            ).not.toContain(styles.blur);
                            done();
                        });
                    });
                });
            });
        });
        describe("On legend item click", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesJSON);
                const valuesMutatedAlt = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                valuesMutatedAlt[1].isCritical = true;
                inputPrimary = getData(valuesMutated);
                inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Timeline B"
                    },
                    values: utils.deepClone(valuesMutatedAlt)
                };
                timeline = new Timeline(getAxes(axisJSON));
                timeline.loadContent(inputPrimary);
                timeline.loadContent(inputSecondary);
            });
            describe("On single data-set", () => {
                it("Hides indicators on toggle", (done) => {
                    const legendItem = TimelineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(legendItem, "mouseleave", () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            expect(
                                criticalOuterElement.getAttribute("style")
                            ).toBe("fill: undefined;");
                            expect(
                                criticalInnerElement.getAttribute("style")
                            ).toBe("fill: undefined;");
                            done();
                        });
                    });
                });
                it("Shows indicators on re-toggle", (done) => {
                    const legendItem = TimelineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        triggerEvent(
                            legendItem,
                            "click",
                            () => {
                                const criticalOuterElement = document.querySelector(
                                    `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                                );
                                const criticalInnerElement = document.querySelector(
                                    `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                                );
                                expect(
                                    criticalOuterElement.getAttribute("style")
                                ).toBe("fill: undefined;");
                                expect(
                                    criticalInnerElement.getAttribute("style")
                                ).toBe("fill: undefined;");
                                done();
                            },
                            200
                        );
                    });
                });
            });
            describe("On multiple data-set", () => {
                it("Shows when data-sets shown === 1", (done) => {
                    const valuesMutatedAlt = utils.deepClone(valuesJSON);
                    valuesMutatedAlt[1].isCritical = true;
                    inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                    timeline = new Timeline(getAxes(axisJSON));
                    timeline.loadContent(inputSecondary);
                    const legendItem = TimelineGraphContainer.querySelector(
                        `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                    );
                    triggerEvent(legendItem, "click", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityTimelineOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityTimelineInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(criticalOuterElement.getAttribute("style")).toBe(
                            "fill: undefined;"
                        );
                        expect(criticalInnerElement.getAttribute("style")).toBe(
                            "fill: undefined;"
                        );
                        expect(
                            criticalOuterElementAlt.getAttribute("style")
                        ).toBe("fill: undefined;");
                        expect(
                            criticalInnerElementAlt.getAttribute("style")
                        ).toBe("fill: undefined;");
                        done();
                    });
                });
            });
        });
        describe("When resize is called", () => {
            beforeEach(() => {
                timeline = new Timeline(getAxes(axisJSON));
                const valuesMutated = utils.deepClone(valuesJSON);
                valuesMutated[0].isCritical = true;
                inputPrimary = getData(valuesMutated);
                timeline.loadContent(inputPrimary);
            });
            it("Sets the canvas width correctly", (done) => {
                const rafSpy = spyOn(window, "requestAnimationFrame");
                const currentWidth = timeline.config.canvasWidth;
                expect(currentWidth).toBe(1024);
                TimelineGraphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                triggerEvent(window, "resize", () => {
                    timeline.resize();
                    delay(() => {
                        expect(timeline.config.canvasWidth).toBe(800);
                        rafSpy.calls.reset();
                        done();
                    }, TRANSITION_DELAY);
                });
            });
            it("Sets the defs clipPath width and height correctly", (done) => {
                TimelineGraphContainer.setAttribute(
                    "style",
                    "width: 800px; height: 200px"
                );
                triggerEvent(window, "resize", () => {
                    const defsElement = fetchElementByClass(styles.canvas)
                        .firstChild;
                    const clipPathRect = defsElement.firstChild.firstChild;
                    expect(+clipPathRect.getAttribute("height")).toBe(
                        timeline.config.height
                    );
                    expect(+clipPathRect.getAttribute("width")).toBe(
                        getXAxisWidth(timeline.config)
                    );
                    done();
                });
            });
        });
    });
});
