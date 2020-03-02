"use strict";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import { AXES_ORIENTATION } from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import LOCALE from "../../../../main/js/locale/index";
import { loadCustomJasmineMatcher } from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getData
} from "./helpers";

describe("Graph - Axes", () => {
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

        graph = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    it("Creates the x axis markup", () => {
        const xAxisElement = fetchElementByClass(styles.axisX);
        expect(xAxisElement.getAttribute("class")).toBe(
            `${styles.axis} ${styles.axisX}`
        );
    });
    it("Creates the y axis markup", () => {
        const yAxisElement = fetchElementByClass(styles.axisY);
        expect(yAxisElement.getAttribute("class")).toBe(
            `${styles.axis} ${styles.axisY}`
        );
    });
    it("Creates the y axis reference line markup", () => {
        const referenceElement = fetchElementByClass(styles.axisReferenceLine);
        expect(referenceElement.classList.contains(styles.axis)).toBeTruthy();
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.classList.contains(styles.axisY)).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
        expect(referenceElement.getAttribute("d")).not.toBeNull();
    });
    it("Creates the y2 axis reference line markup", () => {
        graph.destroy();
        new Graph(
            getAxes({
                x: axisDefault.x,
                y: axisDefault.y,
                y2: {
                    show: true,
                    label: "Some Y2 label",
                    lowerLimit: 0,
                    upperLimit: 200,
                    padDomain: true
                }
            })
        );
        const referenceElement = document.querySelector(
            `.${styles.axisReferenceLine}.${styles.axisY2}`
        );
        expect(referenceElement.classList.contains(styles.axis)).toBeTruthy();
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.classList.contains(styles.axisY2)).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
        expect(referenceElement.getAttribute("d")).not.toBeNull();
    });
    it("Does not create the y axis reference line markup when 0 to -ve", () => {
        graph.destroy();
        new Graph(
            getAxes({
                x: axisDefault.x,
                y: {
                    padDomain: false,
                    label: "Some Y Label",
                    lowerLimit: 0,
                    upperLimit: -20
                }
            })
        );
        const referenceElement = document.querySelector(
            `.${styles.axisReferenceLine}.${styles.axisY}`
        );
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Does not create the y axis reference line markup when -ve to -ve", () => {
        graph.destroy();
        new Graph(
            getAxes({
                x: axisDefault.x,
                y: {
                    padDomain: false,
                    label: "Some Y Label",
                    lowerLimit: -10,
                    upperLimit: -20
                }
            })
        );
        const referenceElement = document.querySelector(
            `.${styles.axisReferenceLine}.${styles.axisY}`
        );
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Creates the y axis reference line markup when in range +ve to -ve", () => {
        graph.destroy();
        new Graph(
            getAxes({
                x: axisDefault.x,
                y: {
                    padDomain: false,
                    label: "Some Y Label",
                    lowerLimit: 20,
                    upperLimit: -20
                }
            })
        );
        const referenceElement = document.querySelector(
            `.${styles.axisReferenceLine}.${styles.axisY}`
        );
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("false");
    });
    it("Does not create the y axis reference line markup when in range 0 to +ve", () => {
        graph.destroy();
        new Graph(
            getAxes({
                x: axisDefault.x,
                y: {
                    padDomain: false,
                    label: "Some Y Label",
                    lowerLimit: 0,
                    upperLimit: 20
                }
            })
        );
        const referenceElement = document.querySelector(
            `.${styles.axisReferenceLine}.${styles.axisY}`
        );
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Does not create the y axis reference line markup when in range +ve to +ve", () => {
        graph.destroy();
        new Graph(
            getAxes({
                x: axisDefault.x,
                y: {
                    padDomain: false,
                    label: "Some Y Label",
                    lowerLimit: 10,
                    upperLimit: 20
                }
            })
        );
        const referenceElement = document.querySelector(
            `.${styles.axisReferenceLine}.${styles.axisY}`
        );
        expect(
            referenceElement.classList.contains(styles.axisReferenceLine)
        ).toBeTruthy();
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Sets y2 axis start from 0 when padDomain is false", () => {
        graph.destroy();
        graph = new Graph(
            getAxes({
                x: axisDefault.x,
                y: axisDefault.y,
                y2: {
                    show: true,
                    label: "Some Y2 label",
                    lowerLimit: 0,
                    upperLimit: 200,
                    padDomain: false
                }
            })
        );
        const y2AxisElement = document.querySelectorAll(`.${styles.axisY2}`);
        // The first child element is the domain itself, and second child onwards denote the ticks
        expect(
            y2AxisElement[0].childNodes[1].querySelector("text").textContent
        ).toBe("0");
    });
    it("Sets x axis orientation to bottom", () => {
        graph.destroy();
        const xAxisBottomOrientation = utils.deepClone(axisDefault);
        xAxisBottomOrientation.x.orientation = AXES_ORIENTATION.X.BOTTOM;
        const input = getAxes(xAxisBottomOrientation);
        graph = new Graph(input);
        expect(graph.config.axis.x.orientation).toEqual(
            AXES_ORIENTATION.X.BOTTOM
        );
    });
    it("Hides x axis when not enabled", () => {
        graph.destroy();
        const hiddenAxisObj = utils.deepClone(axisTimeSeries);
        hiddenAxisObj.x.show = false;
        graph = new Graph(getAxes(hiddenAxisObj));
        const xAxisElement = fetchElementByClass(styles.axisX);
        expect(xAxisElement.getAttribute("class")).toBe(
            `${styles.axis} ${styles.axisX}`
        );
        expect(xAxisElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Hides y axis when not enabled", () => {
        graph.destroy();
        const hiddenAxisObj = utils.deepClone(axisTimeSeries);
        hiddenAxisObj.y.show = false;
        graph = new Graph(getAxes(hiddenAxisObj));
        const yAxisElement = fetchElementByClass(styles.axisY);
        expect(yAxisElement.getAttribute("class")).toBe(
            `${styles.axis} ${styles.axisY}`
        );
        expect(yAxisElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Sets axis info row orientation to top when x axis orientation is bottom", () => {
        graph.destroy();
        const xAxisBottomOrientation = utils.deepClone(axisDefault);
        xAxisBottomOrientation.x.orientation = AXES_ORIENTATION.X.BOTTOM;
        const input = getAxes(xAxisBottomOrientation);
        graph = new Graph(input);
        expect(graph.config.axis.x.orientation).not.toEqual(
            AXES_ORIENTATION.X.TOP
        );
        expect(
            getSVGAnimatedTransformList(
                fetchElementByClass(styles.axisInfoRow).getAttribute(
                    "transform"
                )
            ).translate[1]
        ).toBeLessThan(
            getSVGAnimatedTransformList(
                fetchElementByClass(styles.axisX).getAttribute("transform")
            ).translate[1]
        );
    });
    it("Sets axis info row orientation to bottom when x axis orientation is top", () => {
        graph.destroy();
        const xAxisBottomOrientation = utils.deepClone(axisDefault);
        xAxisBottomOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
        const input = getAxes(xAxisBottomOrientation);
        graph = new Graph(input);
        expect(graph.config.axis.x.orientation).not.toEqual(
            AXES_ORIENTATION.X.BOTTOM
        );
        expect(
            getSVGAnimatedTransformList(
                fetchElementByClass(styles.axisInfoRow).getAttribute(
                    "transform"
                )
            ).translate[1]
        ).toBeGreaterThan(
            getSVGAnimatedTransformList(
                fetchElementByClass(styles.axisX).getAttribute("transform")
            ).translate[1]
        );
    });
    it("Creates the y axis reference line markup even when hidden", () => {
        graph.destroy();
        const hiddenAxisObj = utils.deepClone(axisTimeSeries);
        hiddenAxisObj.y.show = false;
        graph = new Graph(getAxes(hiddenAxisObj));
        const referenceElement = fetchElementByClass(styles.axisReferenceLine);
        expect(referenceElement.getAttribute("aria-hidden")).toBe("true");
    });
    it("Hides x and y axis when not enabled", () => {
        graph.destroy();
        const hiddenAxisObj = utils.deepClone(axisTimeSeries);
        hiddenAxisObj.x.show = false;
        hiddenAxisObj.y.show = false;
        graph = new Graph(getAxes(hiddenAxisObj));
        expect(fetchElementByClass(styles.axisY).getAttribute("class")).toBe(
            `${styles.axis} ${styles.axisY}`
        );
        expect(fetchElementByClass(styles.axisX).getAttribute("class")).toBe(
            `${styles.axis} ${styles.axisX}`
        );
        expect(
            fetchElementByClass(styles.axisY).getAttribute("aria-hidden")
        ).toBe("true");
        expect(
            fetchElementByClass(styles.axisX).getAttribute("aria-hidden")
        ).toBe("true");
    });
    describe("For timeseries type", () => {
        beforeEach(() => {
            graph.destroy();
        });
        it("Creates x axis with ticks in default locale", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x.ticks = {
                format: "%b %Y"
            };
            graph = new Graph(getAxes(localeAxisObj));

            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement
                .querySelector(".tick")
                .querySelector("text");
            expect(tick.textContent).toBe("Jan 2016");
        });
        it("Creates x axis with ticks in provided locale - DE", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x.ticks = {
                format: "%b %Y"
            };
            graph = new Graph(
                Object.assign({ locale: LOCALE.de_DE }, getAxes(localeAxisObj))
            );

            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement
                .querySelector(".tick")
                .querySelector("text");
            expect(tick.textContent).toBe("Jan 2016");
        });
        it("Creates x axis with ticks in provided locale - FR", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x.ticks = {
                format: "%b %Y"
            };
            graph = new Graph(
                Object.assign({ locale: LOCALE.fr_FR }, getAxes(localeAxisObj))
            );

            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement
                .querySelector(".tick")
                .querySelector("text");
            expect(tick.textContent).toBe("janv. 2016");
        });
        it("Creates x axis with ticks in provided locale - ES", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x.ticks = {
                format: "%b %Y"
            };
            graph = new Graph(
                Object.assign({ locale: LOCALE.es_ES }, getAxes(localeAxisObj))
            );

            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement
                .querySelector(".tick")
                .querySelector("text");
            expect(tick.textContent).toBe("ene 2016");
        });
        it("Creates x axis with ticks in provided locale - PT_BR", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x.ticks = {
                format: "%b %Y"
            };
            graph = new Graph(
                Object.assign({ locale: LOCALE.pt_BR }, getAxes(localeAxisObj))
            );

            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement
                .querySelector(".tick")
                .querySelector("text");
            expect(tick.textContent).toBe("Jan 2016");
        });
        it("Hides x axis tick labels when format is blank", () => {
            graph.destroy();
            const axisData = utils.deepClone(axisTimeSeries);
            axisData.x.ticks = {
                format: ""
            };
            graph = new Graph(getAxes(axisData));
            const xAxisElement = fetchElementByClass(styles.axisX);
            const xAxisTickTexts = xAxisElement.querySelectorAll("text");
            xAxisTickTexts.forEach((textElement) => {
                expect(textElement.innerHTML).toBe("");
            });
        });
        it("Creates x axis with LowerTickValues", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x = {
                type: "timeseries",
                label: "Some X Label",
                lowerLimit: new Date(2017, 0).toISOString(),
                upperLimit: new Date(2017, 6).toISOString()
            };
            localeAxisObj.x.ticks = {
                format: "%b %Y",
                lowerStepTickValues: [
                    new Date(2017, 1).toISOString(),
                    new Date(2017, 3).toISOString(),
                    new Date(2017, 5).toISOString()
                ]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allXAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("Feb 2017");
            expect(
                allXAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("Apr 2017");
            expect(
                allXAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("Jun 2017");
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            expect(gridLowerStepElement.querySelectorAll(".tick").length).toBe(
                3
            );
        });
        it("Creates x axis with UpperTickValues", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x = {
                type: "timeseries",
                label: "Some X Label",
                lowerLimit: new Date(2016, 11).toISOString(),
                upperLimit: new Date(2017, 6).toISOString()
            };
            localeAxisObj.x.ticks = {
                format: "%b %Y",
                show: true,
                upperStepTickValues: [
                    new Date(2016, 11).toISOString(),
                    new Date(2018, 1).toISOString()
                ]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            const start = allXAxisElements[0].childNodes[1].querySelector(
                "text"
            );
            const end = allXAxisElements[0].childNodes[2].querySelector("text");
            expect(start.textContent).toBe("Dec 2016");
            expect(end.textContent).toBe("Feb 2018");
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );
            expect(gridUpperStepElement.querySelectorAll(".tick").length).toBe(
                2
            );
        });
        it("Creates x axis with LowerTickValues, UpperTickValues and values in default locale", () => {
            const localeAxisObj = utils.deepClone(axisTimeSeries);
            localeAxisObj.x = {
                type: "timeseries",
                label: "Some X Label",
                lowerLimit: new Date(2016, 11).toISOString(),
                upperLimit: new Date(2018, 2).toISOString()
            };
            localeAxisObj.x.ticks = {
                format: "%b %Y",
                show: true,
                lowerStepTickValues: [
                    new Date(2017, 1).toISOString(),
                    new Date(2017, 5).toISOString(),
                    new Date(2017, 9).toISOString()
                ],
                midpointTickValues: [
                    new Date(2017, 3).toISOString(),
                    new Date(2017, 7).toISOString(),
                    new Date(2017, 11).toISOString()
                ],
                upperStepTickValues: [
                    new Date(2016, 11).toISOString(),
                    new Date(2018, 1).toISOString()
                ]
            };
            graph = new Graph(getAxes(localeAxisObj));

            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            const lowerAxis = allXAxisElements[0].childNodes[1].querySelector(
                "text"
            );
            const upperAxis = allXAxisElements[0].childNodes[4].querySelector(
                "text"
            );
            expect(lowerAxis.textContent).toBe("Feb 2017");
            expect(upperAxis.textContent).toBe("Dec 2016");
        });
    });
    describe("For default type", () => {
        it("Creates x axis with ticks in default locale", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.lowerLimit = 1000;
            localeAxisObj.x.upperLimit = 20000;
            graph = new Graph(getAxes(localeAxisObj));
            graph.loadContent(
                new Line(
                    getData([
                        {
                            x: 3500,
                            y: 4
                        },
                        {
                            x: 15000,
                            y: 7
                        }
                    ])
                )
            );
            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement.querySelectorAll(".tick");
            expect(
                tick[tick.length - 1].querySelector("text").textContent
            ).toBe("20,000");
        });
        it("Creates x axis with ticks in provided locale - DE", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.lowerLimit = 1000;
            localeAxisObj.x.upperLimit = 20000;
            localeAxisObj.x.ticks = {
                format: "n"
            };
            graph = new Graph(
                Object.assign({ locale: LOCALE.de_DE }, getAxes(localeAxisObj))
            );
            graph.loadContent(
                new Line(
                    getData([
                        {
                            x: 3500,
                            y: 4
                        },
                        {
                            x: 15000,
                            y: 7
                        }
                    ])
                )
            );
            const xAxisElement = fetchElementByClass(styles.axisX);
            const tick = xAxisElement.querySelectorAll(".tick");
            expect(
                tick[tick.length - 1].querySelector("text").textContent
            ).toContain("20.000");
        });
        it("Hides x axis tick labels when format is blank", () => {
            graph.destroy();
            const axisData = utils.deepClone(axisDefault);
            axisData.x.ticks = {
                format: ""
            };
            graph = new Graph(getAxes(axisData));
            const xAxisElement = fetchElementByClass(styles.axisX);
            const xAxisTickTexts = xAxisElement.querySelectorAll("text");
            xAxisTickTexts.forEach((textElement) => {
                expect(textElement.innerHTML).toBe("");
            });
        });
    });
});
