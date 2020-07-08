"use strict";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import constants, {
    AXES_ORIENTATION
} from "../../../../main/js/helpers/constants";
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
import {
    generateYAxesTickValues,
    getTicksCountFromRange,
    getAverageTicksCount
} from "../../../../main/js/helpers/axis";

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

    describe("Axes ticks processing", () => {
        beforeEach(() => {
            graph.destroy();
        });
        it("Has correct output if ticksCount = TICKSCOUNT_MAXLIMIT", () => {
            const lowerLimit = 0;
            const upperLimit = 10;
            const ticksCount = constants.TICKSCOUNT_MAXLIMIT;
            expect(
                generateYAxesTickValues(lowerLimit, upperLimit, ticksCount)
                    .length
            ).toEqual(ticksCount + 2);
        });
        it("Has correct output if ticksCount < TICKSCOUNT_MAXLIMIT - 1", () => {
            const lowerLimit = 0;
            const upperLimit = 10;
            const ticksCount = constants.TICKSCOUNT_MAXLIMIT - 1;
            expect(
                generateYAxesTickValues(lowerLimit, upperLimit, ticksCount)
                    .length
            ).toEqual(ticksCount + 2);
        });
        it("Has correct output if ticksCount = 0", () => {
            const lowerLimit = 0;
            const upperLimit = 10;
            const ticksCount = 0;
            expect(
                generateYAxesTickValues(lowerLimit, upperLimit, ticksCount)
                    .length
            ).toEqual(ticksCount + 2);
        });
        it("Uses absolute value if ticksCount is negative", () => {
            const lowerLimit = 0;
            const upperLimit = 10;
            const ticksCount = -5;
            expect(
                generateYAxesTickValues(lowerLimit, upperLimit, ticksCount)
                    .length
            ).toEqual(Math.abs(ticksCount) + 2);
        });
        it("Returns correct value for AXISRANGE_ONE", () => {
            const boundary = constants.AXISRANGE_ONE;
            expect(getTicksCountFromRange(boundary - 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 4
            );
            expect(getTicksCountFromRange(boundary)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 4
            );
            expect(getTicksCountFromRange(boundary + 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 3
            );
        });
        it("Returns correct value for AXISRANGE_TWO", () => {
            const boundary = constants.AXISRANGE_TWO;
            expect(getTicksCountFromRange(boundary - 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 3
            );
            expect(getTicksCountFromRange(boundary)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 3
            );
            expect(getTicksCountFromRange(boundary + 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 2
            );
        });
        it("Returns correct value for AXISRANGE_THREE", () => {
            const boundary = constants.AXISRANGE_THREE;
            expect(getTicksCountFromRange(boundary - 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 2
            );
            expect(getTicksCountFromRange(boundary)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 2
            );
            expect(getTicksCountFromRange(boundary + 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 1
            );
        });
        it("Returns correct value for AXISRANGE_FOUR", () => {
            const boundary = constants.AXISRANGE_FOUR;
            expect(getTicksCountFromRange(boundary - 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 1
            );
            expect(getTicksCountFromRange(boundary)).toEqual(
                constants.DEFAULT_TICKSCOUNT - 1
            );
            expect(getTicksCountFromRange(boundary + 1)).toEqual(
                constants.DEFAULT_TICKSCOUNT
            );
        });
        it("Calculates the correct value when given Y and Y2 ranges", () => {
            const rangeY = 32;
            const rangeY2 = 250;
            expect(getAverageTicksCount(rangeY, rangeY2)).toEqual(5);
        });
    });

    describe("when Y-2 axis is present", () => {
        beforeEach(() => {
            graph.destroy();
        });
        it("uses custom tick values when axis.y.ticks.values is set and ignores ticksCount", () => {
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "y axis - custom ticks",
                lowerLimit: 0,
                upperLimit: 10,
                ticks: {
                    values: [2, 4, 6, 8]
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 2
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            const NumberOfTicks = allYAxisElements[0].childNodes.length;
            expect(
                allYAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("2");
            expect(
                allYAxisElements[0].childNodes[NumberOfTicks - 1].querySelector(
                    "text"
                ).textContent
            ).toBe("8");
        });

        it("uses ticksCount values when axis.y.ticks.values is undefined and ticksCount is set", () => {
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "y axis - ticksCount ticks",
                lowerLimit: 0,
                upperLimit: 10
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 2
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            const NumberOfTicks = allYAxisElements[0].childNodes.length;
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("3");
            expect(
                allYAxisElements[0].childNodes[NumberOfTicks - 1].querySelector(
                    "text"
                ).textContent
            ).toBe("7");
        });

        it("uses default method for Y tick values when custom ticks and ticksCount are not provided", () => {
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "y axis - default method",
                lowerLimit: 0,
                upperLimit: 10
            };
            graph = new Graph(Object.assign({}, getAxes(localeAxisObj)));
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            const NumberOfTicks = allYAxisElements[0].childNodes.length;
            expect(
                allYAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allYAxisElements[0].childNodes[NumberOfTicks - 2].querySelector(
                    "text"
                ).textContent
            ).toBe("9");
        });
    });

    describe("when only Y axis is present", () => {
        beforeEach(() => {
            graph.destroy();
        });
        it("uses custom values for Y and Y2 tick values when custom ticks are provided", () => {
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "y axis - custom tick values",
                lowerLimit: 0,
                upperLimit: 10,
                ticks: {
                    values: [2, 4, 6, 8]
                }
            };
            localeAxisObj.y2 = {
                show: true,
                label: "y2 axis - custom tick values",
                lowerLimit: 11,
                upperLimit: 25,
                ticks: {
                    values: [12, 14, 16, 18]
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 2
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            const NumberOfTicks = allYAxisElements[0].childNodes.length;
            expect(
                allYAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("2");
            expect(
                allYAxisElements[0].childNodes[NumberOfTicks - 1].querySelector(
                    "text"
                ).textContent
            ).toBe("8");
            expect(
                allY2AxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("12");
            expect(
                allY2AxisElements[0].childNodes[
                    NumberOfTicks - 1
                ].querySelector("text").textContent
            ).toBe("18");
        });

        it("uses ticksCount for Y and Y2 tick values when given ticksCount and custom ticks are undefined", () => {
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "y axis - ticksCount",
                lowerLimit: 0,
                upperLimit: 10
            };
            localeAxisObj.y2 = {
                show: true,
                label: "y2 axis - ticksCount",
                lowerLimit: 11,
                upperLimit: 25,
                ticks: {
                    values: [12, 14, 16, 18]
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 2
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            const NumberOfTicks = allYAxisElements[0].childNodes.length;
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("3");
            expect(
                allYAxisElements[0].childNodes[NumberOfTicks - 1].querySelector(
                    "text"
                ).textContent
            ).toBe("7");
            expect(
                allY2AxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("16");
            expect(
                allY2AxisElements[0].childNodes[
                    NumberOfTicks - 1
                ].querySelector("text").textContent
            ).toBe("20");
        });

        it("uses default method for Y and Y2 tick values when custom ticks and ticksCount are undefined", () => {
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "y axis - default ticks",
                lowerLimit: 0,
                upperLimit: 10
            };
            localeAxisObj.y2 = {
                show: true,
                label: "y2 axis - default ticks",
                lowerLimit: 11,
                upperLimit: 25
            };
            graph = new Graph(Object.assign({}, getAxes(localeAxisObj)));
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            const NumberOfTicks = allYAxisElements[0].childNodes.length;
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("3");
            expect(
                allYAxisElements[0].childNodes[NumberOfTicks - 1].querySelector(
                    "text"
                ).textContent
            ).toBe("8");
            expect(
                allY2AxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("15");
            expect(
                allY2AxisElements[0].childNodes[
                    NumberOfTicks - 1
                ].querySelector("text").textContent
            ).toBe("22");
        });
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
    describe("When default d3 tick formatting for x axis is used and suppressTrailingZeros for x axis is set to true", () => {
        it("should suppress x axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x = {
                label: "Some X Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                suppressTrailingZeros: true,
                ticks: {
                    values: [0.0, 0.5, 1.0, 1.5, 2.0]
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allXAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0");
            expect(
                allXAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allXAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allXAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.5");
            expect(
                allXAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("2");
        });
    });
    describe("When default d3 tick formatting is used for x axis and suppressTrailingZeros for x axis is set to false", () => {
        it("should not suppress x axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x = {
                label: "Some X Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                suppressTrailingZeros: false,
                ticks: {
                    values: [0.0, 0.5, 1.0, 1.5, 2.0]
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allXAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0.0");
            expect(
                allXAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allXAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("1.0");
            expect(
                allXAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.5");
            expect(
                allXAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("2.0");
        });
    });
    describe("When default d3 tick formatting is not used for x axis and consumer specifies '~' in tick format", () => {
        it("should suppress x axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x = {
                label: "Some X Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                ticks: {
                    values: [0.0, 0.5, 1.0, 1.5, 2.0],
                    format: ".1~f"
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allXAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0");
            expect(
                allXAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allXAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allXAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.5");
            expect(
                allXAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("2");
        });
    });
    describe("When default d3 tick formatting is not used for x axis and consumer does not specify '~' in tick format", () => {
        it("should not suppress x axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x = {
                label: "Some X Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                ticks: {
                    values: [0.0, 0.5, 1.0, 1.5, 2.0],
                    format: ".1f"
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allXAxisElements = document.querySelectorAll(
                `.${styles.axisX}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allXAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0.0");
            expect(
                allXAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allXAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("1.0");
            expect(
                allXAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.5");
            expect(
                allXAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("2.0");
        });
    });
    describe("When default d3 tick formatting for y axis is used and suppressTrailingZeros for y axis is set to true", () => {
        it("should suppress y axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "Some Y Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                suppressTrailingZeros: true
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allYAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0");
            expect(
                allYAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2");
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allYAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allYAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting is used for y axis and suppressTrailingZeros for y axis is set to false", () => {
        it("should not suppress y axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "Some Y Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                suppressTrailingZeros: false
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allYAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0.0");
            expect(
                allYAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2.0");
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allYAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.0");
            expect(
                allYAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting is not used for y axis and consumer specifies '~' in tick format", () => {
        it("should suppress y axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "Some Y Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                ticks: {
                    format: ".1~f"
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allYAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0");
            expect(
                allYAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2");
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allYAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allYAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting is not used for y axis and consumer does not specify '~' in tick format", () => {
        it("should not suppress y axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y = {
                label: "Some Y Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                ticks: {
                    format: ".1f"
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allYAxisElements = document.querySelectorAll(
                `.${styles.axisY}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allYAxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0.0");
            expect(
                allYAxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2.0");
            expect(
                allYAxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allYAxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.0");
            expect(
                allYAxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting for y2 axis is used and suppressTrailingZeros for y2 is set to true", () => {
        it("should suppress y2 axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y2 = {
                show: true,
                label: "Some Y2 Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                suppressTrailingZeros: true
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allY2AxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0");
            expect(
                allY2AxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2");
            expect(
                allY2AxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allY2AxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allY2AxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting is used for y2 axis and suppressTrailingZeros for y2 is set to false", () => {
        it("should not suppress y2 axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y2 = {
                show: true,
                label: "Some Y2 Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                suppressTrailingZeros: false
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allY2AxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0.0");
            expect(
                allY2AxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2.0");
            expect(
                allY2AxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allY2AxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.0");
            expect(
                allY2AxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting is not used for y2 axis and consumer specifies '~' in tick format", () => {
        it("should suppress y2 axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y2 = {
                show: true,
                label: "Some Y2 Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                ticks: {
                    format: ".1~f"
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allY2AxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0");
            expect(
                allY2AxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2");
            expect(
                allY2AxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allY2AxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1");
            expect(
                allY2AxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
    describe("When default d3 tick formatting is not used for y2 axis and consumer does not specify '~' in tick format", () => {
        it("should not suppress y2 axis tick values's trailing zeros", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.y2 = {
                show: true,
                label: "Some Y2 Label",
                lowerLimit: 0.0,
                upperLimit: 2.0,
                ticks: {
                    format: ".1f"
                }
            };
            graph = new Graph(
                Object.assign(
                    {
                        ticksCount: 3,
                        allowCalibration: false
                    },
                    getAxes(localeAxisObj)
                )
            );
            const allY2AxisElements = document.querySelectorAll(
                `.${styles.axisY2}`
            );
            // The first child element is the domain itself, and second child onwards denote the ticks
            expect(
                allY2AxisElements[0].childNodes[1].querySelector("text")
                    .textContent
            ).toBe("0.0");
            expect(
                allY2AxisElements[0].childNodes[2].querySelector("text")
                    .textContent
            ).toBe("2.0");
            expect(
                allY2AxisElements[0].childNodes[3].querySelector("text")
                    .textContent
            ).toBe("0.5");
            expect(
                allY2AxisElements[0].childNodes[4].querySelector("text")
                    .textContent
            ).toBe("1.0");
            expect(
                allY2AxisElements[0].childNodes[5].querySelector("text")
                    .textContent
            ).toBe("1.5");
        });
    });
});
