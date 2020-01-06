"use strict";
import * as d3 from "d3";
import Gantt from "../../../../main/js/controls/Gantt";
import { getXAxisWidth } from "../../../../main/js/controls/Gantt/helpers/creationHelpers";
import constants from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import {
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisJSON,
    BASE_CANVAS_HEIGHT_PADDING,
    fetchElementByClass,
    getAxes,
    getData
} from "./helpers";

describe("Gantt - Resize", () => {
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

        gantt = new Gantt(getAxes(axisJSON));
        gantt.loadContent(getData());
    });
    afterEach(() => {
        document.body.innerHTML = "";
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
        gantt.resize();
        triggerEvent(window, "resize", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
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
                    +fetchElementByClass(styles.canvas).getAttribute("height")
                ).toBe(41 + BASE_CANVAS_HEIGHT_PADDING);
                expect(
                    +fetchElementByClass(styles.canvas).getAttribute("width")
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
        expect(gantt.config.throttle).not.toEqual(constants.RESIZE_THROTTLE);
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
                    (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
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
                    gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
                );
                expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                    (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
                );
                done();
            },
            TRANSITION_DELAY
        );
    });
});
