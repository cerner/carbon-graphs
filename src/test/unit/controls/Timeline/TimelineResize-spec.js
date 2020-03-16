"use strict";
import Timeline from "../../../../main/js/controls/Timeline";
import {
    getXAxisWidth,
    getXAxisYPosition
} from "../../../../main/js/controls/Timeline/helpers/creationHelpers";
import { getYAxisHeight } from "../../../../main/js/helpers/axis";
import constants from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import { toNumber, triggerEvent } from "../../helpers/commonHelpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    valuesJSON
} from "./helpers";

describe("Timeline - Resize", () => {
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

        timeline = new Timeline(getAxes(axisJSON));
        timeline.loadContent(getData(valuesJSON));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("Sets the canvas width correctly", (done) => {
        const rafSpy = spyOn(window, "requestAnimationFrame");
        const currentWidth = timeline.config.canvasWidth;
        expect(currentWidth).toBe(1024);
        TimelineGraphContainer.setAttribute(
            "style",
            "width: 800px; height: 200px"
        );
        timeline.resize();
        triggerEvent(window, "resize", () => {
            expect(timeline.config.canvasWidth).toBe(800);
            rafSpy.calls.reset();
            done();
        });
    });
    it("Sets the defs clipPath width and height correctly", (done) => {
        TimelineGraphContainer.setAttribute(
            "style",
            "width: 800px; height: 200px"
        );
        timeline.resize();
        triggerEvent(window, "resize", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
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
        timeline.resize();
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
        expect(timeline.config.throttle).not.toEqual(constants.RESIZE_THROTTLE);
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
        timeline.resize();
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
        timeline.resize();
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
        timeline.resize();
        triggerEvent(
            window,
            "resize",
            () => {
                expect(getXAxisYPosition(timeline.config)).toEqual(
                    (config.padding.top + config.padding.bottom) * 2
                );
                done();
            },
            config.throttle
        );
    });
});
