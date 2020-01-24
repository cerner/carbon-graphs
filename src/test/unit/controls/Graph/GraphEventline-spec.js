"use strict";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    PADDING_BOTTOM,
    toNumber,
    delay
} from "../../helpers/commonHelpers";
import {
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getData,
    valuesDefault,
    valuesTimeSeries,
    axisDefaultWithEventline,
    axisTimeseriesWithEventline,
    eventlineJSON,
    axisTimeSeriesWithAxisTop
} from "./helpers";
import { COLORS } from "../../../../main/js/helpers/constants";

describe("Graph - Eventline", () => {
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

    describe("Validates input props", () => {
        it("Process the default input with eventline throw error", () => {
            expect(() => {
                graph = new Graph(axisDefaultWithEventline);
                graph.loadContent(new Line(getData(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_INVALID_TYPE);
        });
        it("Process the timeseries input with eventline without any error", () => {
            expect(() => {
                graph = new Graph(axisTimeseriesWithEventline);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).not.toThrow();
        });
        it("Throw error on empty eventline", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.eventline = [{}];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_EVENTLINE_OBJECT_NOT_PROVIDED);
        });
        it("Throw error on eventline without value", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.eventline = [
                    {
                        color: "grey",
                        style: {
                            strokeDashArray: "4,4"
                        }
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_EVENTLINE_NOT_PROVIDED);
        });
        it("Throw error on eventline with value not date", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.eventline = [
                    {
                        color: "grey",
                        style: {
                            strokeDashArray: "4,4"
                        },
                        value: "not Date"
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_EVENTLINE_TYPE_NOT_VALID);
        });
        it("Throw error on eventline without color", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.eventline = [
                    {
                        style: {
                            strokeDashArray: "4,4"
                        },
                        value: new Date(2016, 5, 1).toISOString()
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_EVENTLINE_COLOR_NOT_PROVIDED);
        });
    });
    it("Process eventline correctly", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.eventline = eventlineJSON;
        graph = new Graph(input);
        expect(graph.config.eventline).toEqual(input.eventline);
    });
    it("Process eventline correctly with x-axis at top", () => {
        const input = utils.deepClone(getAxes(axisTimeSeriesWithAxisTop));
        input.eventline = eventlineJSON;
        graph = new Graph(input);
        const eventlines = document.querySelectorAll(`.${styles.eventline}`);
        expect(eventlines.length).toBe(1);
        expect(eventlines[0].getAttribute("pointer-events")).toBe("auto");
    });
    it("Creates multiple eventlines correctly", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.eventline = [
            {
                color: COLORS.GREY,
                style: {
                    strokeDashArray: "4,4"
                },
                value: new Date(2016, 5, 1).toISOString()
            },
            {
                color: COLORS.BLACK,
                style: {
                    strokeDashArray: "2,2"
                },
                value: new Date(2016, 8, 1).toISOString()
            }
        ];
        graph = new Graph(input);
        const eventlines = document.querySelectorAll(`.${styles.eventline}`);
        expect(eventlines.length).toBe(2);
        expect(eventlines[0].getAttribute("pointer-events")).toBe("auto");
        expect(eventlines[1].getAttribute("pointer-events")).toBe("auto");
    });
    describe("When eventline clickPassThrough is provided", () => {
        describe("When clickPassThrough property is provided - true", () => {
            beforeEach(() => {
                const input = Object.assign(getAxes(axisTimeSeries), {
                    clickPassThrough: {
                        eventlines: true
                    }
                });
                input.eventline = utils.deepClone(eventlineJSON);
                graph = new Graph(input);
            });
            it("Set pointer-events correctly", () => {
                const eventline = fetchElementByClass(styles.eventline);
                expect(eventline.getAttribute("pointer-events")).toBe("none");
            });
        });
        describe("When clickPassThrough property is provided - false", () => {
            beforeEach(() => {
                const input = Object.assign(getAxes(axisTimeSeries), {
                    clickPassThrough: {
                        eventlines: false
                    }
                });
                input.eventline = utils.deepClone(eventlineJSON);
                graph = new Graph(input);
            });
            it("Set pointer-events correctly", () => {
                const eventline = fetchElementByClass(styles.eventline);
                expect(eventline.getAttribute("pointer-events")).toBe("auto");
            });
        });
    });
    describe("Check the translation of Eventline correctly", () => {
        beforeEach(() => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.eventline = eventlineJSON;
            graph = new Graph(input);
        });
        it("EventlineGroup translates properly", (done) => {
            const eventlineGroup = fetchElementByClass(styles.eventlineGroup);
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    eventlineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(73);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
        it("Check Eventline coordinate attributes", (done) => {
            delay(() => {
                const eventlineElement = fetchElementByClass(styles.eventline);
                expect(
                    toNumber(eventlineElement.getAttribute("x1"), 10)
                ).toBeCloserTo(600);
                expect(
                    toNumber(eventlineElement.getAttribute("y1"), 10)
                ).toBeCloserTo(0);
                expect(
                    toNumber(eventlineElement.getAttribute("x2"), 10)
                ).toBeCloserTo(600);
                expect(
                    toNumber(eventlineElement.getAttribute("y2"), 10)
                ).toBeCloserTo(235);
                done();
            });
        });
    });
});
