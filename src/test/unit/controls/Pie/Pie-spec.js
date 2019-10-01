"use strict";
import Pie from "../../../../main/js/controls/Pie";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    dataPrimary,
    dataSecondary,
    dataTertiary,
    fetchElementByClass,
    inputDefault
} from "./helpers";

describe("Pie", () => {
    let graphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        graphContainer = document.createElement("div");
        graphContainer.id = "testPie_carbon";
        graphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        graphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(graphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("On generate", () => {
        let pieInstance;
        let input;
        beforeEach(() => {
            input = inputDefault(graphContainer.id);
        });
        describe("Throws error", () => {
            it("When no input is provided", () => {
                expect(() => {
                    new Pie();
                }).toThrowError(errors.THROW_MSG_INVALID_INPUT);
            });
            it("When invalid input is provided", () => {
                const _input = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_INVALID_INPUT);
            });
            it("When no bind id is provided", () => {
                const _input = inputDefault(graphContainer.id);
                _input.bindTo = null;
                expect(() => {
                    new Pie(_input);
                }).toThrowError(errors.THROW_MSG_NO_BIND);
            });
        });
        describe("With valid input", () => {
            beforeEach(() => {
                pieInstance = new Pie(input);
            });
            it("Initializes properly", () => {
                expect(pieInstance.config).not.toBeNull();
                expect(pieInstance.canvasWidth).not.toBeNull();
                expect(pieInstance.canvasHeight).not.toBeNull();
                expect(pieInstance.canvasRadius).not.toBeNull();
                expect(pieInstance.d3PieLayoutTransformer).toEqual(
                    jasmine.any(Function)
                );
                expect(pieInstance.d3PieArcTransformer).toEqual(
                    jasmine.any(Function)
                );
                expect(pieInstance.content).not.toBeNull();
                expect(pieInstance instanceof Pie).toBeTruthy();
            });
            it("Generates the graph correctly", () => {
                const graphElement = fetchElementByClass(styles.container);
                expect(graphElement.childNodes.length).toBe(2);
                expect(graphElement.firstChild.nodeName).toBe("svg");
            });
            it("Clones input correctly", () => {
                expect(pieInstance.config.clipPathId).not.toBeNull();
                expect(pieInstance.config.bindTo).toBe(input.bindTo);
                expect(pieInstance.config.dimension).toEqual(input.dimension);
                expect(pieInstance.config.showLegend).toEqual(true);
                expect(pieInstance.config.bindLegendTo).toEqual(
                    input.bindLegendTo
                );
            });
            it("Any changes to input object doesn't affect the config", () => {
                input.bindTo = "";
                input.dimension = {};
                expect(pieInstance.config).not.toEqual(input);
                expect(pieInstance.config.bindTo).not.toBe(input.bindTo);
                expect(pieInstance.config.dimension).not.toEqual(
                    input.dimension
                );
            });
            it("Sets height and width to SVG", () => {
                const pieSVGElement = fetchElementByClass(
                    styles.pieChartCanvas
                );
                expect(pieSVGElement.nodeName).toBe("svg");
                expect(pieSVGElement.getAttribute("role")).toBe("img");
                expect(pieSVGElement.getAttribute("height")).toBe("300");
                expect(pieSVGElement.getAttribute("width")).toBe("300");
            });
            it("Creates defs element", () => {
                const pieSVGElement = fetchElementByClass(
                    styles.pieChartCanvas
                );
                expect(pieSVGElement.childNodes[0].nodeName).toBe("defs");
            });
            it("Sets defs element properties correctly", () => {
                const defsElement = fetchElementByClass(
                    `${styles.pieChartCanvas} defs`
                );
                expect(defsElement.childNodes[0].nodeName).toBe("clipPath");
                expect(defsElement.childNodes[0].id).toBeDefined();
                expect(defsElement.childNodes[0].childNodes[0].nodeName).toBe(
                    "rect"
                );
                expect(
                    defsElement.childNodes[0].childNodes[0].getAttribute("x")
                ).toBe("0");
                expect(
                    defsElement.childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("0");
                expect(
                    defsElement.childNodes[0].childNodes[0].getAttribute(
                        "width"
                    )
                ).toBe("300");
                expect(
                    defsElement.childNodes[0].childNodes[0].getAttribute(
                        "height"
                    )
                ).toBe("300");
            });
            it("Creates content container correctly", () => {
                const pieContentElement = fetchElementByClass(
                    styles.pieChartContent
                );
                expect(
                    pieContentElement.getAttribute("clip-path")
                ).toBeDefined();
            });
            it("Creates legend container correctly when legend is enabled", () => {
                const pieLegendContainer = fetchElementByClass(styles.legend);
                expect(pieLegendContainer.nodeName).toBe("UL");
                expect(pieLegendContainer.getAttribute("role")).toBe("list");
            });
            it("Does not create legend container when legend is disabled", () => {
                pieInstance.destroy();
                input.showLegend = false;
                pieInstance = new Pie(input);
                const pieLegendContainer = fetchElementByClass(styles.legend);
                expect(pieLegendContainer).toBeNull();
            });
        });
    });
    describe("On destroy", () => {
        let pieInstance;
        let input;
        beforeEach(() => {
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
            pieInstance.loadContent(dataPrimary);
        });
        it("Removes the graph", () => {
            pieInstance.destroy();
            expect(fetchElementByClass(styles.canvas)).toBeNull();
            expect(fetchElementByClass(styles.legend)).toBeNull();
        });
        it("Removes the container content", () => {
            pieInstance.destroy();
            expect(fetchElementByClass(styles.container)).toBeNull();
        });
        it("Throws no error", () => {
            expect(() => pieInstance.destroy()).not.toThrowError();
        });
        it("Throws no error on resize", (done) => {
            graphContainer.setAttribute("style", "width: 600px; height: 200px");
            pieInstance.destroy();
            expect(() => {
                triggerEvent(window, "resize", done);
            }).not.toThrowError();
        });
        it("Resets instance properties", () => {
            pieInstance.destroy();
            expect(pieInstance.config).toEqual({});
            expect(pieInstance.content).toEqual([]);
            expect(pieInstance.contentConfig).toEqual([]);
            expect(pieInstance.graphContainer).toBeNull();
            expect(pieInstance.resizeHandler).toBeNull();
            expect(pieInstance.svg).toBeNull();
            expect(pieInstance.legendSVG).toBeNull();
            expect(pieInstance.d3PieLayoutTransformer).toBeNull();
            expect(pieInstance.d3PieArcTransformer).toBeNull();
            expect(pieInstance instanceof Pie).toBeTruthy();
        });
    });
    describe("When legend loads", () => {
        let pieInstance;
        let input;
        beforeEach(() => {
            input = inputDefault(graphContainer.id);
            pieInstance = new Pie(input);
        });
        it("Throws error when legend format is provided but not a function", () => {
            const _input = utils.deepClone(dataPrimary);
            _input.label = {
                display: "Banana",
                format: "DUMMY"
            };
            expect(() => {
                pieInstance.loadContent(_input);
            }).toThrowError(errors.THROW_MSG_LEGEND_LABEL_FORMAT_NOT_PROVIDED);
        });
        it("Legend is not loaded if parent flag is disabled", () => {
            pieInstance.destroy();
            input = inputDefault(graphContainer.id);
            input.showLegend = false;
            pieInstance = new Pie(input);
            pieInstance.loadContent(dataPrimary);
            const legendContainer = fetchElementByClass(styles.legend);
            expect(legendContainer).toBeNull();
        });
        it("Legend attributes are correct", () => {
            pieInstance.loadContent(dataPrimary);
            const legendItemElement = fetchElementByClass(styles.pieLegendItem);
            expect(legendItemElement.nodeName).toBe("LI");
            expect(legendItemElement.getAttribute("role")).toBe("listitem");
            expect(legendItemElement.getAttribute("tabindex")).toBe("0");
            expect(legendItemElement.getAttribute("aria-labelledby")).toBe(
                `${dataPrimary.label.display}: ${dataPrimary.value}`
            );
            expect(legendItemElement.getAttribute("aria-describedby")).toBe(
                dataPrimary.key
            );
        });
        it("Legend icon has correct attributes", () => {
            pieInstance.loadContent(dataPrimary);
            const legendItemSVGElement = fetchElementByClass(
                `${styles.pieLegendItem} svg`
            );
            expect(legendItemSVGElement.nodeName).toBe("svg");
            expect(legendItemSVGElement.getAttribute("class")).toContain(
                styles.pieLegendItemIcon
            );
            expect(legendItemSVGElement.getAttribute("role")).toBe("img");
            expect(legendItemSVGElement.getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(legendItemSVGElement.getAttribute("viewBox")).toBe(
                "0 0 48 48"
            );
            expect(legendItemSVGElement.getAttribute("style")).toContain(
                dataPrimary.color
            );
        });
        it("Legend text has correct attributes", () => {
            pieInstance.loadContent(dataPrimary);
            const legendItemTextElement = fetchElementByClass(
                `${styles.pieLegendItem} label`
            );
            expect(legendItemTextElement.nodeName).toBe("LABEL");
            expect(legendItemTextElement.getAttribute("class")).toBe(
                styles.legendItemText
            );
            expect(legendItemTextElement.innerText).toContain(
                dataPrimary.label.display
            );
        });
        it("Legend label text is constructed using a formatter", () => {
            const _input = utils.deepClone(dataPrimary);
            _input.label.format = (display, value) =>
                `${display} has a value of ${value}`;
            pieInstance.loadContent(_input);
            const legendItemTextElement = fetchElementByClass(
                `${styles.pieLegendItem} label`
            );
            expect(legendItemTextElement.innerText).toBe(
                `${dataPrimary.label.display} has a value of ${dataPrimary.value}`
            );
        });
        describe("On legend action", () => {
            describe("On hover", () => {
                beforeEach(() => {
                    pieInstance.loadContent([
                        dataPrimary,
                        dataSecondary,
                        dataTertiary
                    ]);
                });
                describe("On mouseenter", () => {
                    it("Highlights respective legend item", (done) => {
                        const pieLegendItem = fetchElementByClass(
                            styles.pieLegendItem
                        );
                        triggerEvent(pieLegendItem, "mouseenter", () => {
                            expect(
                                pieLegendItem.classList.contains(
                                    styles.pieLegendItemSliceHover
                                )
                            ).toBeTruthy();
                            done();
                        });
                    });
                    it("Blurs all other slices", (done) => {
                        const pieLegendItem = fetchElementByClass(
                            styles.pieLegendItem
                        );
                        triggerEvent(pieLegendItem, "mouseenter", () => {
                            expect(
                                document
                                    .querySelector(
                                        `g[aria-describedby="${dataPrimary.key}"]`
                                    )
                                    .classList.contains(styles.blur)
                            ).toBeFalsy();
                            expect(
                                document
                                    .querySelector(
                                        `g[aria-describedby="${dataSecondary.key}"]`
                                    )
                                    .classList.contains(styles.blur)
                            ).toBeTruthy();
                            expect(
                                document
                                    .querySelector(
                                        `g[aria-describedby="${dataTertiary.key}"]`
                                    )
                                    .classList.contains(styles.blur)
                            ).toBeTruthy();
                            done();
                        });
                    });
                });
                describe("On mouseleave", () => {
                    it("Un-highlights respective legend item", (done) => {
                        const pieLegendItem = fetchElementByClass(
                            styles.pieLegendItem
                        );
                        triggerEvent(pieLegendItem, "mouseenter", () => {
                            triggerEvent(pieLegendItem, "mouseleave", () => {
                                expect(
                                    pieLegendItem.classList.contains(
                                        styles.pieLegendItemSliceHover
                                    )
                                ).toBeFalsy();
                                done();
                            });
                        });
                    });
                    it("Un-blurs all other slices", (done) => {
                        const pieLegendItem = fetchElementByClass(
                            styles.pieLegendItem
                        );
                        triggerEvent(pieLegendItem, "mouseenter", () => {
                            triggerEvent(pieLegendItem, "mouseleave", () => {
                                expect(
                                    document
                                        .querySelector(
                                            `g[aria-describedby="${dataSecondary.key}"]`
                                        )
                                        .classList.contains(styles.blur)
                                ).toBeFalsy();
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
