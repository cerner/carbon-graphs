"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { getShapeForTarget } from "../../../../main/js/controls/Graph/helpers/helpers";
import PairedResult from "../../../../main/js/controls/PairedResult";
import { SHAPES } from "../../../../main/js/helpers/constants";
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

describe("Paired Result - Criticality", () => {
    let inputPrimary = null;
    let pairedResultPrimaryContent = null;
    let pairedResultSecondaryContent = null;
    let graphDefault = null;
    let pairedResultGraphContainer;
    beforeEach(() => {
        pairedResultGraphContainer = document.createElement("div");
        pairedResultGraphContainer.id = "testPairedResult_carbon";
        pairedResultGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(pairedResultGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("On load", () => {
        it("Does not add indicator if data point is not critical", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            pairedResultPrimaryContent = new PairedResult(
                getInput(valuesMutated, false, false)
            );
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalOuterElement).toBeNull();
            expect(criticalInnerElement).toBeNull();
        });
        it("Does not add indicator if data point is critical false", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = false;
            valuesMutated[0].mid.isCritical = false;
            valuesMutated[0].low.isCritical = false;
            pairedResultPrimaryContent = new PairedResult(
                getInput(valuesMutated, false, false)
            );
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalOuterElement).toBeNull();
            expect(criticalInnerElement).toBeNull();
        });
        it("Adds outer indicator - Red", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement).not.toBeNull();
            expect(criticalOuterElement.nodeName).toBe("svg");
            expect(criticalOuterElement.classList).toContain(
                styles.pairedPoint
            );
            expect(criticalOuterElement.classList).toContain(
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(criticalOuterElement.getAttribute("aria-describedby")).toBe(
                `${inputPrimary.key}_high`
            );
        });
        it("Adds inner indicator - White", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalInnerElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement).not.toBeNull();
            expect(criticalInnerElement.nodeName).toBe("svg");
            expect(criticalInnerElement.classList).toContain(
                styles.pairedPoint
            );
            expect(criticalInnerElement.classList).toContain(
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(criticalInnerElement.getAttribute("aria-describedby")).toBe(
                `${inputPrimary.key}_high`
            );
        });
        it("Adds inner and outer indicator for all the types", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElements = pairedResultGraphContainer.querySelectorAll(
                `.${styles.criticalityOuterPoint}`
            );
            const criticalInnerElements = pairedResultGraphContainer.querySelectorAll(
                `.${styles.criticalityInnerPoint}`
            );
            expect(criticalOuterElements[0].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(
                criticalOuterElements[0].getAttribute("aria-describedby")
            ).toBe(`${inputPrimary.key}_high`);
            expect(criticalOuterElements[1].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(
                criticalOuterElements[1].getAttribute("aria-describedby")
            ).toBe(`${inputPrimary.key}_mid`);
            expect(criticalOuterElements[2].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(
                criticalOuterElements[2].getAttribute("aria-describedby")
            ).toBe(`${inputPrimary.key}_low`);
            expect(criticalInnerElements[0].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(
                criticalInnerElements[0].getAttribute("aria-describedby")
            ).toBe(`${inputPrimary.key}_high`);
            expect(criticalInnerElements[1].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(
                criticalInnerElements[1].getAttribute("aria-describedby")
            ).toBe(`${inputPrimary.key}_mid`);
            expect(criticalInnerElements[2].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(
                criticalInnerElements[2].getAttribute("aria-describedby")
            ).toBe(`${inputPrimary.key}_low`);
        });
        it("Adds indicators inner and outer with same shape", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElementPath = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            ).firstChild.firstChild;
            const criticalInnerElementPath = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            ).firstChild.firstChild;
            expect(criticalOuterElementPath.getAttribute("d")).toBe(
                SHAPES.TEAR_ALT.path.d
            );
            expect(criticalInnerElementPath.getAttribute("d")).toBe(
                SHAPES.TEAR_ALT.path.d
            );
        });
        it("Adds indicators inner and outer with same shape for all pair types", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElementPath = pairedResultGraphContainer.querySelectorAll(
                `.${styles.criticalityOuterPoint} path`
            );
            const criticalInnerElementPath = pairedResultGraphContainer.querySelectorAll(
                `.${styles.criticalityInnerPoint} path`
            );
            expect(criticalOuterElementPath[0].getAttribute("d")).toBe(
                SHAPES.TEAR_ALT.path.d
            );
            expect(criticalOuterElementPath[1].getAttribute("d")).toBe(
                SHAPES.RHOMBUS.path.d
            );
            expect(criticalOuterElementPath[2].getAttribute("d")).toBe(
                SHAPES.TEAR_DROP.path.d
            );
            expect(criticalInnerElementPath[0].getAttribute("d")).toBe(
                SHAPES.TEAR_ALT.path.d
            );
            expect(criticalInnerElementPath[1].getAttribute("d")).toBe(
                SHAPES.RHOMBUS.path.d
            );
            expect(criticalInnerElementPath[2].getAttribute("d")).toBe(
                SHAPES.TEAR_DROP.path.d
            );
        });
        it("Translates properly", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElementPath = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            ).firstChild;
            const criticalInnerElementPath = fetchElementByClass(
                pairedResultGraphContainer,
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
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const criticalOuterElementPath = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            ).firstChild;
            const criticalInnerElementPath = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            ).firstChild;
            expect(getTransformScale(criticalOuterElementPath)[0]).toBe(
                round2Decimals(
                    getShapeForTarget(inputPrimary).high.options.scale
                )
            );
            expect(getTransformScale(criticalInnerElementPath)[0]).toBe(
                round2Decimals(
                    getShapeForTarget(inputPrimary).high.options.scale
                )
            );
        });
        it("Shows even on multiple data-set", () => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            pairedResultSecondaryContent = new PairedResult(inputSecondary);
            graphDefault.loadContent(pairedResultSecondaryContent);
            const criticalOuterElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            );
            const criticalInnerElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalOuterElement).not.toBeNull();
            expect(criticalOuterElement.nodeName).toBe("svg");
            expect(criticalOuterElement.classList).toContain(
                styles.pairedPoint
            );
            expect(criticalOuterElement.classList).toContain(
                styles.criticalityOuterPoint
            );
            expect(criticalInnerElement).not.toBeNull();
            expect(criticalInnerElement.nodeName).toBe("svg");
            expect(criticalInnerElement.classList).toContain(
                styles.pairedPoint
            );
            expect(criticalInnerElement.classList).toContain(
                styles.criticalityInnerPoint
            );
        });
        it("selects data point when clicked on outer indicator", (done) => {
            const criticalOuterPointSpy = sinon.spy();
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated);
            inputPrimary.onClick = criticalOuterPointSpy;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const point = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            );
            triggerEvent(point, "click", () => {
                expect(criticalOuterPointSpy.calledOnce).toBeTruthy();
                done();
            });
        });
        it("emits correct parameters when clicked on outer indicator", (done) => {
            let args = {};
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[1].high.isCritical = true;
            valuesMutated[1].mid.isCritical = true;
            valuesMutated[1].low.isCritical = true;
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
            graphDefault.loadContent(new PairedResult(inputPrimary));
            triggerEvent(
                pairedResultGraphContainer.querySelector(
                    `.${styles.criticalityOuterPoint}`
                ),
                "click",
                () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.high.x).toBe(inputPrimary.values[1].high.x);
                    expect(args.val.high.y).toBe(inputPrimary.values[1].high.y);
                    expect(args.val.low.x).toBe(inputPrimary.values[1].low.x);
                    expect(args.val.low.y).toBe(inputPrimary.values[1].low.y);
                    expect(args.val.mid.x).toBe(inputPrimary.values[1].mid.x);
                    expect(args.val.mid.y).toBe(inputPrimary.values[1].mid.y);
                    expect(args.target).not.toBeNull();
                    done();
                }
            );
        });
        it("selects data point when clicked on inner indicator", (done) => {
            const criticalInnerPointSpy = sinon.spy();
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated);
            inputPrimary.onClick = criticalInnerPointSpy;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const point = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            );
            triggerEvent(point, "click", () => {
                expect(criticalInnerPointSpy.calledOnce).toBeTruthy();
                done();
            });
        });
        it("emits correct parameters when clicked on inner indicator", (done) => {
            let args = {};
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[1].high.isCritical = true;
            valuesMutated[1].mid.isCritical = true;
            valuesMutated[1].low.isCritical = true;
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
            graphDefault.loadContent(new PairedResult(inputPrimary));
            triggerEvent(
                pairedResultGraphContainer.querySelector(
                    `.${styles.criticalityInnerPoint}`
                ),
                "click",
                () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.high.x).toBe(inputPrimary.values[1].high.x);
                    expect(args.val.high.y).toBe(inputPrimary.values[1].high.y);
                    expect(args.val.low.x).toBe(inputPrimary.values[1].low.x);
                    expect(args.val.low.y).toBe(inputPrimary.values[1].low.y);
                    expect(args.val.mid.x).toBe(inputPrimary.values[1].mid.x);
                    expect(args.val.mid.y).toBe(inputPrimary.values[1].mid.y);
                    expect(args.target).not.toBeNull();
                    done();
                }
            );
        });
    });
    describe("On unload", () => {
        beforeEach(() => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated, false, false);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.unloadContent(pairedResultPrimaryContent);
        });
        it("Removes outer indicator", () => {
            const criticalOuterElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityOuterPoint
            );
            expect(criticalOuterElement).toBeNull();
        });
        it("Removes inner indicator", () => {
            const criticalInnerElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.criticalityInnerPoint
            );
            expect(criticalInnerElement).toBeNull();
        });
    });
    describe("On legend item hover", () => {
        describe("On single data-set", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                inputPrimary = getInput(valuesMutated, false, false);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                graphDefault.loadContent(pairedResultPrimaryContent);
            });
            it("Highlights the indicators on mouse-enter", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    const criticalInnerElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    expect(criticalOuterElement.classList).toContain(
                        styles.highlight
                    );
                    expect(criticalInnerElement.classList).toContain(
                        styles.highlight
                    );
                    done();
                });
            });
            it("Removes highlights for indicators on mouse-leave", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
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
            it("Highlights the indicators on mouse-enter", (done) => {
                const legendItem = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.legendItem}`
                )[1];
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                    );
                    const criticalInnerElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                    );
                    expect(criticalOuterElement.classList).toContain(
                        styles.highlight
                    );
                    expect(criticalInnerElement.classList).toContain(
                        styles.highlight
                    );
                    done();
                });
            });
            it("Removes highlights for indicators on mouse-leave", (done) => {
                const legendItem = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.legendItem}`
                )[1];
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_mid"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_mid"]`
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
            it("Highlights the indicators on mouse-enter", (done) => {
                const legendItem = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.legendItem}`
                )[2];
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_low"]`
                    );
                    const criticalInnerElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_low"]`
                    );
                    expect(criticalOuterElement.classList).toContain(
                        styles.highlight
                    );
                    expect(criticalInnerElement.classList).toContain(
                        styles.highlight
                    );
                    done();
                });
            });
            it("Removes highlights for indicators on mouse-leave", (done) => {
                const legendItem = pairedResultGraphContainer.querySelectorAll(
                    `.${styles.legendItem}`
                )[2];
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_low"]`
                        );
                        const criticalInnerElement = pairedResultGraphContainer.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_low"]`
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
        });
        describe("On multiple data-set", () => {
            beforeEach(() => {
                const valuesMutated = utils.deepClone(valuesDefault);
                const valuesMutatedAlt = utils.deepClone(valuesDefault);
                valuesMutated[0].high.isCritical = true;
                valuesMutated[0].mid.isCritical = true;
                valuesMutated[0].low.isCritical = true;
                valuesMutatedAlt[1].high.isCritical = true;
                inputPrimary = getInput(valuesMutated);
                inputSecondary.values = utils.deepClone(valuesMutatedAlt);
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                pairedResultSecondaryContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.loadContent(pairedResultSecondaryContent);
            });
            it("Highlights only the current indicator", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    const criticalInnerElement = pairedResultGraphContainer.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
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
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_high"]`
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    const criticalOuterElementAlt = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}_high"]`
                    );
                    const criticalInnerElementAlt = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}_high"]`
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
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
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
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_high"]`
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalOuterElementAlt = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputSecondary.key}_high"]`
                        );
                        const criticalInnerElementAlt = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputSecondary.key}_high"]`
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
        beforeEach(() => {
            const valuesMutated = utils.deepClone(valuesDefault);
            valuesMutated[0].high.isCritical = true;
            valuesMutated[0].mid.isCritical = true;
            valuesMutated[0].low.isCritical = true;
            inputPrimary = getInput(valuesMutated);
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
        });
        describe("On single data-set", () => {
            it("Hides indicators on toggle", (done) => {
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                );
                triggerEvent(legendItem, "click", () => {
                    const criticalOuterElement = document.querySelector(
                        `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                    );
                    const criticalInnerElement = document.querySelector(
                        `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
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
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_high"]`
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(legendItem, "click", () => {
                        const criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        const criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    });
                });
            });
            it("Shows indicators on re-toggle low", (done) => {
                const legendItem = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputPrimary.key}_low"]`
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(legendItem, "click", () => {
                        let criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_low"]`
                        );
                        let criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_low"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        criticalOuterElement = document.querySelector(
                            `.${styles.criticalityOuterPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        criticalInnerElement = document.querySelector(
                            `.${styles.criticalityInnerPoint}[aria-describedby="${inputPrimary.key}_high"]`
                        );
                        expect(
                            criticalOuterElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            criticalInnerElement.getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    });
                });
            });
        });
    });
});
