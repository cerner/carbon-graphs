"use strict";
import * as d3 from "d3";
import Gantt from "../../../../main/js/controls/Gantt";
import { COLORS } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    delay,
    loadCustomJasmineMatcher,
    PADDING_BOTTOM,
    toNumber
} from "../../helpers/commonHelpers";
import {
    axisJSON,
    eventlineAlt,
    eventlineJSON,
    fetchElementByClass,
    getAxes
} from "./helpers";

describe("Eventline", () => {
    let ganttChartContainer;
    let axisObj;

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
        axisObj = utils.deepClone(getAxes(axisJSON));
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("Validates", () => {
        it("Throws error when eventline is not provided", () => {
            axisObj.eventline = [{}];
            expect(() => {
                new Gantt(axisObj);
            }).toThrowError(errors.THROW_MSG_EVENTLINE_OBJECT_NOT_PROVIDED);
        });
        it("Throws error when eventline value is not provided", () => {
            axisObj.eventline = utils.deepClone(eventlineJSON);
            axisObj.eventline[0].value = "";
            expect(() => {
                new Gantt(axisObj);
            }).toThrowError(errors.THROW_MSG_EVENTLINE_NOT_PROVIDED);
        });

        /**
         * Verify that if a eventline is specified and a color is not supplied by the consumer, an Invalid property message is displayed, 'a valid color value must be provided'
         */
        it("Throws error when eventline color is not provided", () => {
            axisObj.eventline = utils.deepClone(eventlineJSON);
            axisObj.eventline[0].color = "";
            expect(() => {
                new Gantt(axisObj);
            }).toThrowError(errors.THROW_MSG_EVENTLINE_COLOR_NOT_PROVIDED);
        });

        it("Throws error when eventline value is not provided", () => {
            axisObj.eventline = utils.deepClone(eventlineJSON);
            axisObj.eventline[0].value = "HELLO";
            expect(() => {
                new Gantt(axisObj);
            }).toThrowError(errors.THROW_MSG_EVENTLINE_TYPE_NOT_VALID);
        });
    });

    it("Creates eventline group element", (done) => {
        axisObj.eventline = utils.deepClone(eventlineJSON);
        new Gantt(axisObj);
        const eventlineGroupElement = fetchElementByClass(
            styles.eventlineGroup
        );
        expect(d3.select(eventlineGroupElement).datum().value).toBe(
            eventlineAlt.value
        );
        expect(eventlineGroupElement.getAttribute("aria-selected")).toBe(
            "false"
        );
        delay(() => {
            const translate = getSVGAnimatedTransformList(
                eventlineGroupElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloseTo(106);
            expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
            done();
        });
        expect(eventlineGroupElement.childNodes.length).toBe(1);
    });
    it("Creates eventline correctly", (done) => {
        axisObj.eventline = utils.deepClone(eventlineJSON);
        new Gantt(axisObj);
        const eventline = fetchElementByClass(styles.eventline);
        expect(eventline.getAttribute("pointer-events")).toBe("auto");
        expect(eventline).not.toBeNull();
        delay(() => {
            const eventlineElement = fetchElementByClass(styles.eventline);
            expect(
                toNumber(eventlineElement.getAttribute("x1"), 10)
            ).toBeCloseTo(338);
            expect(
                toNumber(eventlineElement.getAttribute("y1"), 10)
            ).toBeCloseTo(0);
            expect(
                toNumber(eventlineElement.getAttribute("x2"), 10)
            ).toBeCloseTo(338);
            expect(
                toNumber(eventlineElement.getAttribute("y2"), 10)
            ).toBeCloseTo(0);
            done();
        });
    });
    it("creates multiple eventlines correctly", () => {
        axisObj.eventline = utils.deepClone(eventlineJSON);
        axisObj.eventline = [
            {
                color: COLORS.GREY,
                style: {
                    strokeDashArray: "4,4"
                },
                value: new Date(2018, 5, 1).toISOString()
            },
            {
                color: COLORS.ORANGE,
                style: {
                    strokeDashArray: "2,2"
                },
                value: new Date(2018, 8, 1).toISOString()
            }
        ];
        new Gantt(axisObj);
        const eventlines = document.querySelectorAll(`.${styles.eventline}`);
        expect(eventlines.length).toBe(2);
        expect(eventlines[0].getAttribute("pointer-events")).toBe("auto");
        expect(eventlines[1].getAttribute("pointer-events")).toBe("auto");
    });
    describe("Pass Through's", () => {
        describe("clickPassThrough - undefined", () => {
            beforeEach(() => {
                axisObj = getAxes(axisJSON);
                axisObj.eventline = utils.deepClone(eventlineJSON);
                new Gantt(axisObj);
            });
            it("set pointer-events correctly", () => {
                const eventline = fetchElementByClass(styles.eventline);
                expect(eventline.getAttribute("pointer-events")).toBe("auto");
            });
        });
        describe("clickPassThrough - true", () => {
            beforeEach(() => {
                axisObj = Object.assign(getAxes(axisJSON), {
                    clickPassThrough: {
                        eventlines: true
                    }
                });
                axisObj.eventline = utils.deepClone(eventlineJSON);
                new Gantt(axisObj);
            });
            it("set pointer-events correctly", () => {
                const eventline = fetchElementByClass(styles.eventline);
                expect(eventline.getAttribute("pointer-events")).toBe("none");
            });
        });
        describe("clickPassThrough - false", () => {
            beforeEach(() => {
                axisObj = Object.assign(getAxes(axisJSON), {
                    clickPassThrough: {
                        eventlines: false
                    }
                });
                axisObj.eventline = utils.deepClone(eventlineJSON);
                new Gantt(axisObj);
            });
            it("set pointer-events correctly", () => {
                const eventline = fetchElementByClass(styles.eventline);
                expect(eventline.getAttribute("pointer-events")).toBe("auto");
            });
        });
    });
});
