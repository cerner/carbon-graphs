"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { getShapeForTarget } from "../../../../main/js/controls/Graph/helpers/helpers";
import Scatter from "../../../../main/js/controls/Scatter";
import { Shape } from "../../../../main/js/core";
import styles from "../../../../main/js/helpers/styles";
import {
    getCurrentTransform,
    getSVGAnimatedTransformList,
    getTransformScale,
    round2Decimals
} from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import { triggerEvent } from "../../helpers/commonHelpers";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault
} from "./helpers";

describe("Scatter - Criticality", () => {
    let inputPrimary = null;
    let scatterPrimary = null;
    let scatterSecondary = null;
    let graphDefault = null;
    let scatterGraphContainer;
    beforeEach(() => {
        scatterGraphContainer = document.createElement("div");
        scatterGraphContainer.id = "testScatter_carbon";
        scatterGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(scatterGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("On load", () => {
        it("Does not add indicator if data point is not critical", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            scatterPrimary = new Scatter(getInput(valuesMutated));
            graphDefault.loadContent(scatterPrimary);
            const criticalOuterElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalOuterElement).toBeNull();
            expect(criticalInnerElement).toBeNull();
        });
        it("Does not add indicator if data point is critical false", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = false;
            scatterPrimary = new Scatter(getInput(valuesMutated));
            graphDefault.loadContent(scatterPrimary);
            const criticalOuterElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalOuterElement).toBeNull();
            expect(criticalInnerElement).toBeNull();
        });
        it("Adds outer indicator - Red", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            const criticalOuterElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement).not.toBeNull();
            expect(criticalOuterElement.nodeName).toBe("svg");
            expect(criticalOuterElement.classList).toContain(styles.point);
            expect(criticalOuterElement.classList).toContain(
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(criticalOuterElement.getAttribute("aria-describedby")).toBe(
                inputPrimary.key
            );
        });
        it("Adds inner indicator - White", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            const criticalInnerElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement).not.toBeNull();
            expect(criticalInnerElement.nodeName).toBe("svg");
            expect(criticalInnerElement.classList).toContain(styles.point);
            expect(criticalInnerElement.classList).toContain(
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(criticalInnerElement.getAttribute("aria-describedby")).toBe(
                inputPrimary.key
            );
        });
        it("Adds indicators inner and outer with same shape", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);

            const criticalOuterElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            const currentShape = new Shape(
                getShapeForTarget(inputPrimary)
            ).getShapeElement();
            expect(criticalOuterElement.nodeName).toBe(currentShape.nodeName);
            expect(criticalInnerElement.nodeName).toBe(currentShape.nodeName);
            expect(
                criticalOuterElement.firstChild.firstChild.getAttribute("d")
            ).toBe(currentShape.firstChild.firstChild.getAttribute("d"));
            expect(
                criticalInnerElement.firstChild.firstChild.getAttribute("d")
            ).toBe(currentShape.firstChild.firstChild.getAttribute("d"));
        });
        it("Translates properly", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            const criticalOuterElementPath = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            ).firstChild;
            const criticalInnerElementPath = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
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
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            const criticalOuterElementPath = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            ).firstChild;
            const criticalInnerElementPath = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            ).firstChild;
            expect(getTransformScale(criticalOuterElementPath)[0]).toBe(
                round2Decimals(getShapeForTarget(inputPrimary).options.scale)
            );
            expect(getTransformScale(criticalInnerElementPath)[0]).toBe(
                round2Decimals(getShapeForTarget(inputPrimary).options.scale)
            );
        });
        it("Shows even on multiple data-set", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            scatterSecondary = new Scatter(inputSecondary);
            graphDefault.loadContent(scatterSecondary);
            const criticalOuterElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalOuterElement).not.toBeNull();
            expect(criticalOuterElement.nodeName).toBe("svg");
            expect(criticalOuterElement.classList).toContain(styles.point);
            expect(criticalOuterElement.classList).toContain(
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(criticalInnerElement).not.toBeNull();
            expect(criticalInnerElement.nodeName).toBe("svg");
            expect(criticalInnerElement.classList).toContain(styles.point);
            expect(criticalInnerElement.classList).toContain(
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
        });
        it("Selects data point when clicked on outer indicator", (done) => {
            const criticalOuterPointSpy = sinon.spy();
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            inputPrimary.onClick = criticalOuterPointSpy;
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            const point = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            triggerEvent(point, "click", () => {
                expect(criticalOuterPointSpy.calledOnce).toBeTruthy();
                done();
            });
        });
        it("Emits correct parameters when clicked on outer indicator", (done) => {
            let args = {};
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[1].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            inputPrimary.onClick = (cb, key, index, val, target) => {
                args = {
                    cb,
                    key,
                    index,
                    val,
                    target
                };
            };
            graphDefault.loadContent(new Scatter(inputPrimary));
            const point = scatterGraphContainer.querySelector(
                `.${styles.criticalityOuterPoint}`
            );
            triggerEvent(point, "click", () => {
                expect(args).not.toBeNull();
                expect(args.cb).toEqual(jasmine.any(Function));
                expect(args.key).toBe("uid_1");
                expect(args.index).toBe(1);
                expect(args.val).not.toBeNull();
                expect(args.val.x).toBe(inputPrimary.values[1].x);
                expect(args.val.y).toBe(inputPrimary.values[1].y);
                expect(args.target).not.toBeNull();
                done();
            });
        });
        it("Selects data point when clicked on inner indicator", (done) => {
            const criticalInnerPointSpy = sinon.spy();
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            inputPrimary.onClick = criticalInnerPointSpy;
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            const point = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            triggerEvent(point, "click", () => {
                expect(criticalInnerPointSpy.calledOnce).toBeTruthy();
                done();
            });
        });
        it("Emits correct parameters when clicked on inner point", (done) => {
            let args = {};
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[1].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            inputPrimary.onClick = (cb, key, index, val, target) => {
                args = {
                    cb,
                    key,
                    index,
                    val,
                    target
                };
            };
            graphDefault.loadContent(new Scatter(inputPrimary));
            const point = scatterGraphContainer.querySelector(
                `.${styles.criticalityInnerPoint}`
            );
            triggerEvent(point, "click", () => {
                expect(args).not.toBeNull();
                expect(args.cb).toEqual(jasmine.any(Function));
                expect(args.key).toBe("uid_1");
                expect(args.index).toBe(1);
                expect(args.val).not.toBeNull();
                expect(args.val.x).toBe(inputPrimary.values[1].x);
                expect(args.val.y).toBe(inputPrimary.values[1].y);
                expect(args.target).not.toBeNull();
                done();
            });
        });
    });
    describe("On unload", () => {
        beforeEach(() => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
            graphDefault.unloadContent(scatterPrimary);
        });
        it("Removes outer indicator", () => {
            const criticalOuterElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement).toBeNull();
        });
        it("Removes inner indicator", () => {
            const criticalInnerElement = fetchElementByClass(
                scatterGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement).toBeNull();
        });
    });
    describe("On legend item hover", () => {
        describe("On single data-set", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                scatterPrimary = new Scatter(inputPrimary);
                graphDefault.loadContent(scatterPrimary);
            });
            it("Highlights the indicators on mouse-enter", (done) => {
                const legendItem = fetchElementByClass(
                    scatterGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    expect(
                        criticalOuterElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(criticalOuterElement.classList).toContain(
                        styles.highlight
                    );
                    expect(
                        criticalInnerElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(criticalInnerElement.classList).toContain(
                        styles.highlight
                    );
                    done();
                });
            });
            it("Removes highlights for indicators on mouse-leave", (done) => {
                const legendItem = fetchElementByClass(
                    scatterGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(criticalOuterElement.classList).not.toContain(
                            styles.highlight
                        );
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(criticalInnerElement.classList).not.toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
            });
        });
        describe("On multiple data-set", () => {
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                }
            };
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                const valuesMutatedAlt = utils.deepClone(valuesDefault);
                valuesMutated[0].isCritical = true;
                valuesMutatedAlt[1].isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                scatterPrimary = new Scatter(inputPrimary);
                scatterSecondary = new Scatter(inputSecondary);
                graphDefault.loadContent(scatterPrimary);
                graphDefault.loadContent(scatterSecondary);
            });
            it("Highlights the current indicator", (done) => {
                const legendItem = fetchElementByClass(
                    scatterGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    expect(
                        criticalOuterElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        criticalInnerElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(criticalOuterElement.classList).toContain(
                        styles.highlight
                    );
                    expect(criticalInnerElement.classList).toContain(
                        styles.highlight
                    );
                    done();
                });
            });
            it("Blurs other indicators", (done) => {
                const legendItem = scatterGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalOuterElementAlt = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                    );
                    const criticalInnerElementAlt = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                    );
                    expect(criticalOuterElement.classList).not.toContain(
                        styles.highlight
                    );
                    expect(criticalInnerElement.classList).not.toContain(
                        styles.highlight
                    );
                    expect(criticalOuterElementAlt.classList).toContain(
                        styles.highlight
                    );
                    expect(criticalInnerElementAlt.classList).toContain(
                        styles.highlight
                    );
                    done();
                });
            });
            it("Removes highlights on mouse-leave", (done) => {
                const legendItem = scatterGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        expect(criticalOuterElement.classList).not.toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).not.toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
            });
            it("Removes blur for other data points on mouse-leave", (done) => {
                const legendItem = scatterGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(criticalOuterElement.classList).not.toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElement.classList).not.toContain(
                            styles.highlight
                        );
                        expect(criticalOuterElementAlt.classList).not.toContain(
                            styles.highlight
                        );
                        expect(criticalInnerElementAlt.classList).not.toContain(
                            styles.highlight
                        );
                        done();
                    });
                });
            });
        });
    });
    describe("On legend item click", () => {
        const inputSecondary = {
            key: `uid_2`,
            label: {
                display: "Data Label B"
            }
        };
        beforeEach(() => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].isCritical = true;
            inputPrimary = getInput(valuesMutated);
            scatterPrimary = new Scatter(inputPrimary);
            graphDefault.loadContent(scatterPrimary);
        });
        describe("On single data-set", () => {
            it("Hides indicators on toggle", (done) => {
                const legendItem = scatterGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                );
                triggerEvent(legendItem, "click", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    expect(
                        criticalOuterElement.getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        criticalInnerElement.getAttribute("aria-hidden")
                    ).toBe("true");
                    done();
                });
            });
            it("Shows indicators on re-toggle", (done) => {
                const legendItem = scatterGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(
                        legendItem,
                        "click",
                        () => {
                            const criticalOuterElement = document.querySelector(
                                `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            const criticalInnerElement = document.querySelector(
                                `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                            );
                            expect(
                                criticalOuterElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                criticalInnerElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            done();
                        },
                        200
                    );
                });
            });
        });
        describe("On multiple data-set", () => {
            it("Shows when data-sets shown === 1", (done) => {
                const valuesMutatedAlt = utils.deepClone(valuesDefault);
                valuesMutatedAlt[1].isCritical = true;
                inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                scatterSecondary = new Scatter(inputSecondary);
                graphDefault.loadContent(scatterSecondary);
                const legendItem = scatterGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}"]`
                );
                triggerEvent(legendItem, "click", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}"]`
                    );
                    const criticalOuterElementAlt = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}"]`
                    );
                    const criticalInnerElementAlt = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}"]`
                    );
                    expect(
                        criticalOuterElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        criticalInnerElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    expect(
                        criticalOuterElementAlt.getAttribute("aria-hidden")
                    ).toBe("true");
                    expect(
                        criticalInnerElementAlt.getAttribute("aria-hidden")
                    ).toBe("true");
                    graphDefault.unloadContent(scatterSecondary);
                    done();
                });
            });
        });
    });
});
