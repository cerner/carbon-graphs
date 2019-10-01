"use strict";
import sinon from "sinon";
import Timeline from "../../../../main/js/controls/Timeline";
import { Shape } from "../../../../main/js/core";
import {
    getShapeForTarget,
    getXAxisWidth
} from "../../../../main/js/controls/Timeline/helpers/creationHelpers";
import styles from "../../../../main/js/helpers/styles";
import {
    getCurrentTransform,
    getSVGAnimatedTransformList,
    getTransformScale
} from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    delay,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisJSON,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getData,
    valuesJSON
} from "./helpers";

describe("Timeline - Criticality", () => {
    let inputPrimary = null;
    let inputSecondary = null;
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
            expect(criticalOuterElement.getAttribute("aria-describedby")).toBe(
                inputPrimary.key
            );
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
            expect(criticalInnerElement.getAttribute("aria-describedby")).toBe(
                inputPrimary.key
            );
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
            const criticalOuterGroupElement = criticalOuterElement.firstChild;
            const criticalInnerGroupElement = criticalInnerElement.firstChild;
            const currentShape = new Shape(
                getShapeForTarget(inputPrimary)
            ).getShapeElement();
            const currentShapeGroupElement = currentShape.firstChild;
            expect(criticalOuterElement.nodeName).toBe(currentShape.nodeName);
            expect(criticalInnerElement.nodeName).toBe(currentShape.nodeName);
            expect(criticalOuterGroupElement.firstChild.getAttribute("d")).toBe(
                currentShapeGroupElement.firstChild.getAttribute("d")
            );
            expect(criticalInnerGroupElement.firstChild.getAttribute("d")).toBe(
                currentShapeGroupElement.firstChild.getAttribute("d")
            );
        });
        it("Resizes properly", (done) => {
            const valuesMutated = utils.deepClone(valuesJSON);
            valuesMutated[0].isCritical = true;
            inputPrimary = getData(valuesMutated, false, false);
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(inputPrimary);
            const timelinePointsBefore = fetchAllElementsByClass(styles.point);
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
                "width: 1000px; height: 323px"
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
                done();
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
                expect(args.val.x).toEqual(new Date(inputPrimary.values[1].x));
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
                expect(args.val.x).toEqual(new Date(inputPrimary.values[1].x));
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
                        expect(criticalOuterElement.classList).not.toContain(
                            styles.blur
                        );
                        expect(criticalInnerElement.classList).not.toContain(
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
                        expect(criticalOuterElement.getAttribute("style")).toBe(
                            "fill: undefined;"
                        );
                        expect(criticalInnerElement.getAttribute("style")).toBe(
                            "fill: undefined;"
                        );
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
                    expect(criticalOuterElementAlt.getAttribute("style")).toBe(
                        "fill: undefined;"
                    );
                    expect(criticalInnerElementAlt.getAttribute("style")).toBe(
                        "fill: undefined;"
                    );
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
            timeline.resize();
            triggerEvent(window, "resize", () => {
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
            timeline.resize();
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
