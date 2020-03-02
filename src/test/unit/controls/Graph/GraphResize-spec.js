"use strict";
import * as d3 from "d3";
import Graph from "../../../../main/js/controls/Graph/index";
import { getXAxisWidth } from "../../../../main/js/helpers/axis";
import constants from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import { axisDefault, fetchElementByClass, getAxes } from "./helpers";

describe("Graph - Resize", () => {
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
        graph = new Graph(utils.deepClone(getAxes(axisDefault)));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("Sets the canvas width correctly", (done) => {
        expect(graph.config.canvasWidth).toBe(1024);
        graphContainer.setAttribute("style", "width: 800px; height: 200px");
        graph.resize();
        triggerEvent(window, "resize", () => {
            expect(graph.config.canvasWidth).toBe(800);
            done();
        });
    });
    it("Sets the defs clipPath width and height correctly", (done) => {
        graphContainer.setAttribute("style", "width: 800px; height: 200px");
        graph.resize();
        triggerEvent(window, "resize", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            const clipPathRect = defsElement.firstChild.firstChild;
            expect(toNumber(clipPathRect.getAttribute("height"))).toBe(
                graph.config.height
            );
            expect(toNumber(clipPathRect.getAttribute("width"))).toBe(
                getXAxisWidth(graph.config)
            );
            done();
        });
    });
    it("Calculates X axis d3 scale using domain and range", (done) => {
        graph.resize();
        triggerEvent(window, "resize", () => {
            expect(graph.scale.x).not.toBeNull();
            expect(graph.scale.x).toEqual(jasmine.any(Function));
            done();
        });
    });
    it("Calculates Y axis d3 scale using domain and range", (done) => {
        graph.resize();
        triggerEvent(window, "resize", () => {
            expect(graph.scale.y).not.toBeNull();
            expect(graph.scale.y).toEqual(jasmine.any(Function));
            done();
        });
    });
    it("Translates the canvas", (done) => {
        const canvasElement = fetchElementByClass(styles.canvas);
        graphContainer.setAttribute("style", "width: 800px; height: 200px");
        graph.resize();
        triggerEvent(window, "resize", () => {
            expect(toNumber(canvasElement.getAttribute("height"))).not.toBe(0);
            expect(
                toNumber(canvasElement.getAttribute("height"))
            ).toBeGreaterThan(0);
            expect(toNumber(canvasElement.getAttribute("width"))).toBe(790);
            done();
        });
    });
    it("Sets the content container width and height correctly", (done) => {
        graphContainer.setAttribute("style", "width: 800px; height: 200px");
        graph.resize();
        triggerEvent(window, "resize", () => {
            const contentContainer = fetchElementByClass(
                styles.contentContainer
            );
            expect(toNumber(contentContainer.getAttribute("height"))).toBe(
                graph.config.height
            );
            expect(toNumber(contentContainer.getAttribute("width"))).toBe(
                getXAxisWidth(graph.config)
            );
            done();
        });
    });
    it("Sets the throttle correctly, if undefined", () => {
        const throttledInput = utils.deepClone(getAxes(axisDefault));
        throttledInput.throttle = undefined;
        graph.destroy();
        graph = new Graph(throttledInput);
        expect(graph.config.throttle).toEqual(constants.RESIZE_THROTTLE);
    });
    it("Sets the throttle correctly", () => {
        const throttledInput = utils.deepClone(getAxes(axisDefault));
        throttledInput.throttle = 400;
        graph.destroy();
        graph = new Graph(throttledInput);
        expect(graph.config.throttle).toEqual(400);
        expect(graph.config.throttle).not.toEqual(constants.RESIZE_THROTTLE);
    });
    it("Throttles based on delay", (done) => {
        const rafSpy = spyOn(window, "requestAnimationFrame");
        const throttledInput = utils.deepClone(getAxes(axisDefault));
        throttledInput.throttle = undefined;
        graph.destroy();
        graph = new Graph(throttledInput);
        graphContainer.setAttribute("style", "width: 600px; height: 200px");
        graph.resize();
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
        const throttledInput = utils.deepClone(getAxes(axisDefault));
        throttledInput.throttle = 500;
        graph.destroy();
        graph = new Graph(throttledInput);
        graphContainer.setAttribute("style", "width: 400px; height: 200px");
        graph.resize();
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
    it("Translates label shape container when Y2 axis is provided", (done) => {
        graph.destroy();
        graph = new Graph(
            utils.deepClone(
                getAxes({
                    x: axisDefault.x,
                    y: axisDefault.y,
                    y2: {
                        show: true,
                        lowerLimit: 0,
                        upperLimit: 200,
                        label: "Some Y2 label"
                    }
                })
            )
        );
        graphContainer.setAttribute("style", "width: 400px; height: 200px");
        graph.resize();
        triggerEvent(window, "resize", () => {
            const canvasElement = fetchElementByClass(styles.canvas);
            const yAxisShapeContainer = canvasElement.querySelector(
                `.${styles.axisLabelYShapeContainer}`
            );
            const y2AxisShapeContainer = canvasElement.querySelector(
                `.${styles.axisLabelY2ShapeContainer}`
            );
            expect(yAxisShapeContainer.getAttribute("transform")).toContain(
                "translate"
            );
            expect(yAxisShapeContainer.getAttribute("transform")).toContain(
                "rotate(-90)"
            );
            expect(y2AxisShapeContainer.getAttribute("transform")).toContain(
                "translate"
            );
            expect(y2AxisShapeContainer.getAttribute("transform")).toContain(
                "rotate(90)"
            );
            done();
        });
    });
    /**
     * BF12182018.01 - Verify the consumer has the option to provide custom padding for the graph-container.
     */
    describe("When custom padding is used", () => {
        it("Default padding is applied when no custom padding is used", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            graph.destroy();
            graph = new Graph(axisData);
            const expectedOutput = {
                top: 10,
                bottom: 5,
                left: 30,
                right: 50,
                hasCustomPadding: false
            };
            expect(graph.config.padding).toEqual(expectedOutput);
        });
        it("Default padding is applied when custom padding half filled", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 40
            };
            graph.destroy();
            graph = new Graph(axisData);
            const expectedOutput = {
                top: 40,
                bottom: 5,
                left: 30,
                right: 50,
                hasCustomPadding: true
            };
            expect(graph.config.padding).toEqual(expectedOutput);
        });
        it("Position of content container starts where canvas starts", (done) => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 0,
                left: -17,
                right: 0,
                bottom: 0
            };
            graph.destroy();
            graph = new Graph(axisData);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("x"), 10)
                ).toBeCloserTo(-16);
                expect(
                    toNumber(contentContainer.getAttribute("y"), 10)
                ).toBeCloserTo(0);
                done();
            });
        });
        it("Position of content container shifts right, when left padding is applied", (done) => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 0,
                left: 20,
                right: 0,
                bottom: 0
            };
            graph.destroy();
            graph = new Graph(axisData);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(toNumber(contentContainer.getAttribute("y"))).toBe(0);
                done();
            });
        });
        it("Position of content container shifts right, when left padding is applied", (done) => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 0,
                left: 20,
                right: 0,
                bottom: 0
            };
            graph.destroy();
            graph = new Graph(axisData);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(toNumber(contentContainer.getAttribute("y"))).toBe(0);
                done();
            });
        });
        it("Position of content container shifts left, when right padding is applied", (done) => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 0,
                left: 0,
                right: 20,
                bottom: 0
            };
            graph.destroy();
            graph = new Graph(axisData);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                // height and width of the content container gets set when the resize event occurs, via translateContentContainer
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(
                    toNumber(contentContainer.attr("width"), 10)
                ).toBeCloserTo(742);
                expect(toNumber(contentContainer.attr("height"))).toBeCloserTo(
                    250
                );
                done();
            });
        });
        it("Position of content container shifts top, when bottom padding is applied", (done) => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 20
            };
            graph.destroy();
            graph = new Graph(axisData);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("height"))
                ).toBeLessThan(
                    toNumber(
                        fetchElementByClass(styles.canvas).getAttribute(
                            "height"
                        )
                    )
                );
                done();
            });
        });
        it("Position of content container shifts bottom, when top padding is applied", (done) => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.padding = {
                top: 20,
                left: 0,
                right: 0,
                bottom: 0
            };
            graph.destroy();
            graph = new Graph(axisData);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = fetchElementByClass(
                    styles.contentContainer
                );
                expect(
                    toNumber(contentContainer.getAttribute("height"))
                ).toBeLessThan(
                    toNumber(
                        fetchElementByClass(styles.canvas).getAttribute(
                            "height"
                        )
                    )
                );
                done();
            });
        });
    });
});
