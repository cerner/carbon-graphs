"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import constants, {
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../../main/js/helpers/legend";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import LOCALE from "../../../../main/js/locale/index";
import {
    delay,
    PADDING_BOTTOM,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisJSON,
    datelineAlt,
    datelineJSON,
    fetchElementByClass,
    getAxes,
    getData,
    legendJSON
} from "./helpers";

describe("Gantt - Generate", () => {
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
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    it("Creates the container svg", () => {
        const graphElem = document.querySelector(gantt.config.bindTo);
        expect(graphElem).not.toBeNull();
        expect(graphElem.children[0].nodeName).toBe("DIV");
        expect(graphElem.children[0].getAttribute("class")).toBe(
            styles.container
        );
    });
    it("Creates gantt elements in order - with showActionLegend", () => {
        gantt.destroy();
        gantt = new Gantt(
            Object.assign(
                {
                    showActionLegend: true
                },
                getAxes(axisJSON)
            )
        );
        const canvas = fetchElementByClass(styles.container).childNodes[0];
        const legend = fetchElementByClass(styles.container).childNodes[1];
        expect(canvas).not.toBeNull();
        expect(canvas.getAttribute("class")).toBe(styles.canvas);
        expect(canvas.nodeName).toBe("svg");
        expect(canvas.getAttribute("role")).toBe("img");
        expect(legend).not.toBeNull();
        expect(legend.getAttribute("class")).toBe(styles.legend);
        expect(legend.getAttribute("role")).toBe("list");
    });
    it("Creates gantt elements in order - without showActionLegend", () => {
        const canvas = fetchElementByClass(styles.container).childNodes[0];
        const legend = fetchElementByClass(styles.container).childNodes[1];
        expect(canvas).not.toBeNull();
        expect(canvas.getAttribute("class")).toBe(styles.canvas);
        expect(canvas.nodeName).toBe("svg");
        expect(canvas.getAttribute("role")).toBe("img");
        expect(legend).toBeUndefined();
    });
    it("Creates canvas elements in order", () => {
        const defsElement = fetchElementByClass(styles.canvas).childNodes[0];
        const gridElement = fetchElementByClass(styles.canvas).childNodes[1];
        const contentContainer = fetchElementByClass(styles.canvas)
            .childNodes[2];
        const axisXElement = fetchElementByClass(styles.canvas).childNodes[3];
        const axisYElement = fetchElementByClass(styles.canvas).childNodes[4];
        expect(defsElement).not.toBeNull();
        expect(gridElement).not.toBeNull();
        expect(axisXElement).not.toBeNull();
        expect(axisYElement).not.toBeNull();
        expect(contentContainer).not.toBeNull();

        expect(defsElement.nodeName).toBe("defs");
        expect(gridElement.nodeName).toBe("g");
        expect(axisXElement.nodeName).toBe("g");
        expect(axisYElement.nodeName).toBe("g");
        expect(contentContainer.nodeName).toBe("rect");
        expect(gridElement.getAttribute("class")).toBe(styles.grid);
        expect(axisXElement.classList).toContain(styles.axis);
        expect(axisXElement.classList).toContain(styles.axisX);
        expect(axisYElement.classList).toContain(styles.axis);
        expect(axisYElement.classList).toContain(styles.axisY);
        expect(contentContainer.classList).toContain(styles.contentContainer);
    });
    it("Creates the canvas svg", () => {
        const canvas = fetchElementByClass(styles.container).firstChild;
        expect(canvas).not.toBeNull();
        expect(canvas.nodeName).toBe("svg");
        expect(canvas.getAttribute("class")).toBe(styles.canvas);
        expect(+canvas.getAttribute("height")).toBe(gantt.config.canvasHeight);
        expect(+canvas.getAttribute("width")).toBe(
            gantt.config.canvasWidth - constants.BASE_CANVAS_WIDTH_PADDING
        );
    });
    it("Creates defs element with height and width", () => {
        const currentWidth =
            gantt.config.axisSizes.y +
            gantt.config.axisLabelWidths.y +
            (constants.PADDING.top + constants.PADDING.bottom) * 2;
        const defsElement = fetchElementByClass(styles.canvas).firstChild;
        expect(defsElement.nodeName).toBe("defs");
        expect(defsElement.firstChild.nodeName).toBe("clipPath");
        expect(defsElement.firstChild.firstChild.nodeName).toBe("rect");
        expect(defsElement.firstChild.firstChild.getAttribute("width")).toBe(
            `${1024 - currentWidth}`
        );
        expect(+defsElement.firstChild.firstChild.getAttribute("height")).toBe(
            gantt.config.height
        );
    });
    describe("Grid", () => {
        it("Creates the grid markup", () => {
            const canvasElement = fetchElementByClass(styles.canvas);
            expect(
                canvasElement.querySelector(`.${styles.grid}`)
            ).not.toBeNull();
            const gridElement = fetchElementByClass(styles.grid);
            expect(gridElement.childElementCount).toBe(2);
        });
        it("Creates the grid markup with tick values provided", () => {
            gantt.destroy();
            const localeAxisObj = utils.deepClone(axisJSON);
            localeAxisObj.x.ticks = {
                values: [
                    new Date(2018, 2, 1, 12).toISOString(),
                    new Date(2018, 4, 1, 12).toISOString(),
                    new Date(2018, 6, 1, 12).toISOString()
                ]
            };
            gantt = new Gantt(getAxes(localeAxisObj));
            gantt.loadContent(getData());

            const gridElement = fetchElementByClass(styles.grid);
            const gridHElement = fetchElementByClass(styles.gridH);
            const gridVElement = fetchElementByClass(styles.gridV);
            expect(gridElement.childElementCount).toBe(2);
            expect(gridHElement.querySelectorAll(".tick").length).toBe(1);
            expect(gridVElement.querySelectorAll(".tick").length).toBe(3);
        });
        it("Creates the horizontal grid markup", () => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(getData());
            const gridElement = fetchElementByClass(styles.grid);
            expect(
                gridElement.querySelector(`.${styles.gridH}`)
            ).not.toBeNull();
            expect(gridElement.querySelector(`.${styles.gridH}`).nodeName).toBe(
                "g"
            );
        });
        it("Creates the vertical grid markup", () => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(getData());
            const gridElement = fetchElementByClass(styles.grid);
            expect(
                gridElement.querySelector(`.${styles.gridV}`)
            ).not.toBeNull();
            expect(gridElement.querySelector(`.${styles.gridV}`).nodeName).toBe(
                "g"
            );
        });
        it("creates the grid markup with upperTickValues, values and midTickValues provided", () => {
            gantt.destroy();
            const axis = utils.deepClone(axisJSON);
            axis.x.ticks = {
                show: true,
                values: [
                    new Date(2018, 0, 2, 12).toISOString(),
                    new Date(2019, 0, 6, 12).toISOString(),
                    new Date(2019, 0, 11, 12).toISOString()
                ],
                upperStepTickValues: [
                    new Date(2019, 0, 1, 12).toISOString(),
                    new Date(2019, 0, 12, 12).toISOString()
                ],
                midpointTickValues: [
                    new Date(2019, 0, 3, 12).toISOString(),
                    new Date(2019, 0, 11, 12).toISOString()
                ]
            };
            gantt = new Gantt(getAxes(axis));

            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            expect(gridMidElement).toBeDefined();
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            expect(gridLowerStepElement).toBeDefined();
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );
            expect(gridUpperStepElement).toBeDefined();

            expect(gridLowerStepElement.querySelectorAll(".tick").length).toBe(
                3
            );
            expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
            expect(gridUpperStepElement.querySelectorAll(".tick").length).toBe(
                2
            );
        });
        /**
         * Verify if lower step grid lines are displayed with midpoint grid lines or upper grid lines, the lower step grid lines displays as a solid 1px med gray color #9B9B9B
         * Verify the upper step grid line displays as a solid 3px gray color #BCBFC0
         * Verify the midpoint grid lines display as a solid 1px light gray color #E8E9EA
         */
        it("creates the grid markup with upperTickValues, lowerTickValues and midTickValues provided", () => {
            gantt.destroy();
            const axis = utils.deepClone(axisJSON);
            axis.x.ticks = {
                show: true,
                lowerStepTickValues: [
                    new Date(2018, 0, 2, 12).toISOString(),
                    new Date(2019, 0, 6, 12).toISOString(),
                    new Date(2019, 0, 11, 12).toISOString()
                ],
                upperStepTickValues: [
                    new Date(2019, 0, 1, 12).toISOString(),
                    new Date(2019, 0, 12, 12).toISOString()
                ],
                midpointTickValues: [
                    new Date(2019, 0, 3, 12).toISOString(),
                    new Date(2019, 0, 11, 12).toISOString()
                ]
            };
            gantt = new Gantt(getAxes(axis));

            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            expect(gridMidElement).toBeDefined();
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            expect(gridLowerStepElement).toBeDefined();
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );
            expect(gridUpperStepElement).toBeDefined();

            expect(gridLowerStepElement.querySelectorAll(".tick").length).toBe(
                3
            );
            expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
            expect(gridUpperStepElement.querySelectorAll(".tick").length).toBe(
                2
            );
        });
        it("creates the grid markup by giving lowerTickValues more precidence than values if both available", () => {
            gantt.destroy();
            const axis = utils.deepClone(axisJSON);
            axis.x.ticks = {
                show: true,
                values: [
                    new Date(2018, 0, 2, 12).toISOString(),
                    new Date(2019, 0, 6, 12).toISOString()
                ],
                lowerStepTickValues: [
                    new Date(2018, 0, 2, 12).toISOString(),
                    new Date(2019, 0, 6, 12).toISOString(),
                    new Date(2019, 0, 11, 12).toISOString()
                ]
            };
            gantt = new Gantt(getAxes(axis));
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            expect(gridLowerStepElement.querySelectorAll(".tick").length).toBe(
                3
            );
        });
        it("creates the grid markup with upper values provided", () => {
            gantt.destroy();
            const axis = utils.deepClone(axisJSON);
            axis.x.ticks = {
                show: true,
                upperStepTickValues: [
                    new Date(2019, 0, 1, 12).toISOString(),
                    new Date(2019, 0, 12, 12).toISOString()
                ]
            };
            gantt = new Gantt(getAxes(axis));
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );
            expect(gridUpperStepElement.querySelectorAll(".tick").length).toBe(
                2
            );
        });
        it("creates the grid markup with mid values provided", () => {
            gantt.destroy();
            const axis = utils.deepClone(axisJSON);
            axis.x.ticks = {
                show: true,
                midpointTickValues: [
                    new Date(2019, 0, 1, 12).toISOString(),
                    new Date(2019, 0, 12, 12).toISOString()
                ]
            };
            gantt = new Gantt(getAxes(axis));
            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
        });
    });
    describe("Content container", () => {
        it("Creates the container markup", () => {
            const canvasElement = fetchElementByClass(styles.canvas);
            const containerElement = canvasElement.querySelector(
                `.${styles.contentContainer}`
            );
            expect(containerElement).not.toBeNull();
            expect(containerElement.nodeName).toBe("rect");
            expect(+containerElement.getAttribute("x")).toBe(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(+containerElement.getAttribute("y")).toBe(
                (constants.PADDING.top + constants.PADDING.bottom) * 2
            );
            expect(+containerElement.getAttribute("height")).toBe(0);
        });
    });
    describe("Axes", () => {
        it("Creates the x axis markup", () => {
            const xAxisElement = fetchElementByClass(styles.axisX);
            expect(xAxisElement.getAttribute("class")).toBe(
                `${styles.axis} ${styles.axisX}`
            );
        });
        it("Creates the y axis markup", () => {
            const yAxisElement = fetchElementByClass(styles.axisY);
            expect(yAxisElement.getAttribute("class")).toBe(
                `${styles.axis} ${styles.axisY} ${styles.axisYTrackLabel}`
            );
        });
        it("Creates correct text for each track", (done) => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(getData());
            delay(() => {
                const yAxisElement = fetchElementByClass(
                    styles.axisYTrackLabel
                );
                const textElementList = yAxisElement.querySelectorAll(
                    ".tick text"
                );
                expect(
                    textElementList[0].getAttribute("transform")
                ).not.toBeNull(); // Project A
                expect(textElementList[0].innerHTML).toBe("Project A"); // Project A
                done();
            });
        });
        it("Hides x axis when not enabled", () => {
            gantt.destroy();
            const hiddenAxisObj = utils.deepClone(axisJSON);
            hiddenAxisObj.x.show = false;
            gantt = new Gantt(getAxes(hiddenAxisObj));
            gantt.loadContent(getData());
            const xAxisElement = fetchElementByClass(styles.axisX);
            expect(xAxisElement.getAttribute("class")).toBe(
                `${styles.axis} ${styles.axisX}`
            );
            expect(xAxisElement.getAttribute("aria-hidden")).toBe("true");
        });
        it("Hides y axis when not enabled", () => {
            gantt.destroy();
            const hiddenAxisObj = utils.deepClone(axisJSON);
            hiddenAxisObj.y.show = false;
            gantt = new Gantt(getAxes(hiddenAxisObj));
            gantt.loadContent(getData());
            const yAxisElement = fetchElementByClass(styles.axisY);
            expect(yAxisElement.getAttribute("class")).toBe(
                `${styles.axis} ${styles.axisY} ${styles.axisYTrackLabel}`
            );
            expect(yAxisElement.getAttribute("aria-hidden")).toBe("true");
        });
        it("Hides x and y axis when not enabled", () => {
            gantt.destroy();
            const hiddenAxisObj = utils.deepClone(axisJSON);
            hiddenAxisObj.x.show = false;
            hiddenAxisObj.y.show = false;
            gantt = new Gantt(getAxes(hiddenAxisObj));
            gantt.loadContent(getData());
            expect(
                fetchElementByClass(styles.axisY).getAttribute("class")
            ).toBe(`${styles.axis} ${styles.axisY} ${styles.axisYTrackLabel}`);
            expect(
                fetchElementByClass(styles.axisX).getAttribute("class")
            ).toBe(`${styles.axis} ${styles.axisX}`);
            expect(
                fetchElementByClass(styles.axisY).getAttribute("aria-hidden")
            ).toBe("true");
            expect(
                fetchElementByClass(styles.axisX).getAttribute("aria-hidden")
            ).toBe("true");
        });
        describe("Locale", () => {
            it("Creates x axis with ticks in default locale", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x.ticks = {
                    format: "%b %Y"
                };
                gantt = new Gantt(getAxes(localeAxisObj));
                const xAxisElement = fetchElementByClass(styles.axisX);
                const tick = xAxisElement
                    .querySelector(".tick")
                    .querySelector("text");
                expect(tick.textContent).toBe("Jan 2018");
            });
            it("creates x axis with LowerTickValues", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x = {
                    type: "timeseries",
                    label: "Some X Label",
                    lowerLimit: new Date(2016, 11).toISOString(),
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
                gantt = new Gantt(getAxes(localeAxisObj));
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
            });
            it("creates x axis with UpperTickValues", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
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
                gantt = new Gantt(getAxes(localeAxisObj));
                const allXAxisElements = document.querySelectorAll(
                    `.${styles.axisX}`
                );
                // The first child element is the domain itself, and second child onwards denote the ticks
                const start = allXAxisElements[0].childNodes[1].querySelector(
                    "text"
                );
                const end = allXAxisElements[0].childNodes[2].querySelector(
                    "text"
                );
                expect(start.textContent).toBe("Dec 2016");
                expect(end.textContent).toBe("Feb 2018");
            });
            it("creates x axis with LowerTickValues, UpperTickValues and midTickValues in default locale", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x = {
                    type: "timeseries",
                    label: "Some X Label",
                    lowerLimit: new Date(2016, 10).toISOString(),
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
                gantt = new Gantt(getAxes(localeAxisObj));

                const allXAxisElements = document.querySelectorAll(
                    `.${styles.axisX}`
                );
                // The first child element is the domain itself, and second child onwards denote the ticks
                const lowerAxis1 = allXAxisElements[0].childNodes[1].querySelector(
                    "text"
                );
                const lowerAxis2 = allXAxisElements[0].childNodes[2].querySelector(
                    "text"
                );
                const lowerAxis3 = allXAxisElements[0].childNodes[3].querySelector(
                    "text"
                );
                const upperAxis1 = allXAxisElements[0].childNodes[4].querySelector(
                    "text"
                );
                const upperAxis2 = allXAxisElements[0].childNodes[5].querySelector(
                    "text"
                );
                expect(lowerAxis1.textContent).toBe("Feb 2017");
                expect(lowerAxis2.textContent).toBe("Jun 2017");
                expect(lowerAxis3.textContent).toBe("Oct 2017");
                expect(upperAxis1.textContent).toBe("Dec 2016");
                expect(upperAxis2.textContent).toBe("Feb 2018");
            });
            it("Creates x axis with ticks in provided locale - DE", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x.ticks = {
                    format: "%b %Y"
                };
                gantt = new Gantt(
                    Object.assign(
                        { locale: LOCALE.de_DE },
                        getAxes(localeAxisObj)
                    )
                );

                const xAxisElement = fetchElementByClass(styles.axisX);
                const tick = xAxisElement
                    .querySelector(".tick")
                    .querySelector("text");
                expect(tick.textContent).toBe("Jan 2018");
            });
            it("Creates x axis with ticks in provided locale - FR", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x.ticks = {
                    format: "%b %Y"
                };
                gantt = new Gantt(
                    Object.assign(
                        { locale: LOCALE.fr_FR },
                        getAxes(localeAxisObj)
                    )
                );

                const xAxisElement = fetchElementByClass(styles.axisX);
                const tick = xAxisElement
                    .querySelector(".tick")
                    .querySelector("text");
                expect(tick.textContent).toBe("janv. 2018");
            });
            it("Creates x axis with ticks in provided locale - ES", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x.ticks = {
                    format: "%b %Y"
                };
                gantt = new Gantt(
                    Object.assign(
                        { locale: LOCALE.es_ES },
                        getAxes(localeAxisObj)
                    )
                );
                const xAxisElement = fetchElementByClass(styles.axisX);
                const tick = xAxisElement
                    .querySelector(".tick")
                    .querySelector("text");
                expect(tick.textContent).toBe("ene 2018");
            });
            it("Creates x axis with ticks in provided locale - PT_BR", () => {
                gantt.destroy();
                const localeAxisObj = utils.deepClone(axisJSON);
                localeAxisObj.x.ticks = {
                    format: "%b %Y"
                };
                gantt = new Gantt(
                    Object.assign(
                        { locale: LOCALE.pt_BR },
                        getAxes(localeAxisObj)
                    )
                );
                const xAxisElement = fetchElementByClass(styles.axisX);
                const tick = xAxisElement
                    .querySelector(".tick")
                    .querySelector("text");
                expect(tick.textContent).toBe("Jan 2018");
            });
        });
    });
    describe("Legend", () => {
        it("Throws error when legend is loaded without a click handler", () => {
            expect(() => {
                loadLegendItem({}, {}, {}, {});
            }).toThrowError(
                "Invalid Argument: eventHandlers needs a clickHandler callback function."
            );
        });
        it("Throws error when legend is loaded without a hover handler", () => {
            expect(() => {
                loadLegendItem({}, {}, {}, { clickHandler: Function });
            }).toThrowError(
                "Invalid Argument: eventHandlers needs a hoverHandler callback function."
            );
        });
        it("Throws error when legend is loaded without a label value", () => {
            expect(() => {
                loadLegendItem(
                    {},
                    { label: null },
                    {},
                    {
                        clickHandler: Function,
                        hoverHandler: Function
                    }
                );
            }).toThrowError(errors.THROW_MSG_LEGEND_LABEL_NOT_PROVIDED);
        });
        it("Loads legend in separate container when bindLegendTo used", () => {
            gantt.destroy();
            const legendContainer = document.createElement("div");
            legendContainer.setAttribute("id", "ganttChartLegendContainer");
            legendContainer.setAttribute("class", "legend-container");
            ganttChartContainer.appendChild(legendContainer);
            const input = utils.deepClone(getAxes(axisJSON));
            input.bindLegendTo = "#ganttChartLegendContainer";
            gantt = new Gantt(input);
            const container = fetchElementByClass(styles.container);
            const parentContainer = fetchElementByClass("carbon-test-class");
            expect(gantt.config.bindLegendTo).toEqual(input.bindLegendTo);
            expect(container.childNodes.length).toEqual(1);
            expect(parentContainer.childNodes.length).toEqual(2);
            expect(parentContainer.childNodes[0].getAttribute("id")).toEqual(
                "ganttChartLegendContainer"
            );
            expect(parentContainer.childNodes[0].getAttribute("class")).toEqual(
                "legend-container"
            );
            expect(parentContainer.childNodes[1].getAttribute("class")).toEqual(
                styles.container
            );
        });
        it("Hides legend by default", () => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            const containerElement = fetchElementByClass("carbon-test-class");
            expect(
                containerElement.querySelector(`.${styles.legend}`)
            ).toBeNull();
        });
        it("Shows legend when enabled", () => {
            gantt.destroy();
            gantt = new Gantt(
                Object.assign(
                    {
                        showActionLegend: true
                    },
                    getAxes(axisJSON)
                )
            );
            const containerElement = fetchElementByClass("carbon-test-class");
            const legendElement = containerElement.querySelector(
                `.${styles.legend}`
            );
            expect(legendElement).not.toBeNull();
            expect(legendElement.nodeName).toBe("UL");
            expect(legendElement.getAttribute("role")).toBe("list");
        });
        it("Shows legend items correctly", () => {
            gantt.destroy();
            gantt = new Gantt(
                Object.assign(
                    {
                        showActionLegend: true,
                        actionLegend: legendJSON
                    },
                    getAxes(axisJSON)
                )
            );
            const legendElement = fetchElementByClass(styles.legend);
            expect(legendElement.children.length).toBe(2);
            expect(legendElement.children[0].nodeName).toBe("LI");
            expect(legendElement.children[0].getAttribute("class")).toBe(
                `${styles.legendItem}`
            );
            expect(
                legendElement.children[0].getAttribute("aria-current")
            ).toBeTruthy();
            expect(
                legendElement.children[0].getAttribute("aria-disabled")
            ).toBe("false");
            expect(legendElement.children[0].getAttribute("role")).toBe(
                "listitem"
            );
            expect(
                legendElement.children[0].getAttribute("aria-labelledby")
            ).toBe(legendJSON[0].label.display);
            expect(
                legendElement.children[1].getAttribute("aria-labelledby")
            ).toBe(legendJSON[1].label.display);
            expect(
                legendElement.children[0].getAttribute("aria-describedby")
            ).toBe(legendJSON[0].key);
            expect(
                legendElement.children[1].getAttribute("aria-describedby")
            ).toBe(legendJSON[1].key);
        });
    });
    describe("Dateline", () => {
        let axisObj;
        beforeEach(() => {
            gantt.destroy();
            axisObj = utils.deepClone(getAxes(axisJSON));
        });
        describe("Validates", () => {
            it("Throws error when dateline is not provided", () => {
                axisObj.dateline = [{}];
                expect(() => {
                    gantt = new Gantt(axisObj);
                }).toThrowError(errors.THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED);
            });
            it("Throws error when dateline value is not provided", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].value = "";
                expect(() => {
                    gantt = new Gantt(axisObj);
                }).toThrowError(errors.THROW_MSG_DATELINE_NOT_PROVIDED);
            });

            /**
             * Verify that if a dateline is specified and a color is not supplied by the consumer, an Invalid property message is displayed, 'a valid color value must be provided'
             */
            it("Throws error when dateline color is not provided", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].color = "";
                expect(() => {
                    gantt = new Gantt(axisObj);
                }).toThrowError(errors.THROW_MSG_DATELINE_COLOR_NOT_PROVIDED);
            });

            /**
             * Verify that if an indicator is specified for the dateline and a shape is not supplied by the consumer, an Invalid property message is displayed, 'a valid shape valid must be provided'
             */
            it("Throws error when dateline shape is not provided when indicators are true", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].shape = "";
                expect(() => {
                    gantt = new Gantt(axisObj);
                }).toThrowError(errors.THROW_MSG_DATELINE_SHAPE_NOT_PROVIDED);
            });
            it("Does not throws error when dateline shape is not provided when indicators are false", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].showDatelineIndicator = false;
                axisObj.dateline[0].shape = "";
                gantt = new Gantt(axisObj);
            });

            it("Throws error when dateline value is not provided", () => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].value = "HELLO";
                expect(() => {
                    gantt = new Gantt(axisObj);
                }).toThrowError(errors.THROW_MSG_DATELINE_TYPE_NOT_VALID);
            });
        });

        it("Creates dateline group element", (done) => {
            axisObj.dateline = utils.deepClone(datelineJSON);
            gantt = new Gantt(axisObj);
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(d3.select(datelineGroupElement).datum().value).toBe(
                datelineAlt.value
            );
            expect(datelineGroupElement.getAttribute("aria-selected")).toBe(
                "false"
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroupElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloseTo(106);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
            expect(datelineGroupElement.childNodes.length).toBe(2);
        });
        it("Creates dateline correctly", (done) => {
            axisObj.dateline = utils.deepClone(datelineJSON);
            gantt = new Gantt(axisObj);
            const dateline = fetchElementByClass(styles.dateline);
            expect(dateline.getAttribute("pointer-events")).toBe("auto");
            expect(dateline).not.toBeNull();
            delay(() => {
                const datelineElement = fetchElementByClass(styles.dateline);
                expect(
                    toNumber(datelineElement.getAttribute("x1"), 10)
                ).toBeCloseTo(338);
                expect(
                    toNumber(datelineElement.getAttribute("y1"), 10)
                ).toBeCloseTo(0);
                expect(
                    toNumber(datelineElement.getAttribute("x2"), 10)
                ).toBeCloseTo(338);
                expect(
                    toNumber(datelineElement.getAttribute("y2"), 10)
                ).toBeCloseTo(0);
                done();
            });
        });
        it("creates multiple datelines correctly", () => {
            axisObj.dateline = utils.deepClone(datelineJSON);
            axisObj.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREY,
                    shape: SHAPES.SQUARE,
                    value: new Date(2018, 5, 1).toISOString()
                },
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release B"
                    },
                    color: COLORS.GREY,
                    shape: SHAPES.SQUARE,
                    value: new Date(2018, 8, 1).toISOString()
                }
            ];
            gantt = new Gantt(axisObj);
            const datelines = document.querySelectorAll(`.${styles.dateline}`);
            expect(datelines.length).toBe(2);
            expect(datelines[0].getAttribute("pointer-events")).toBe("auto");
            expect(datelines[1].getAttribute("pointer-events")).toBe("auto");
        });
        it("Creates dateline point correctly", (done) => {
            axisObj.dateline = utils.deepClone(datelineJSON);
            gantt = new Gantt(axisObj);
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelinePointGroupElement = datelinePoint.firstChild;
            const datelinePointPath = datelinePointGroupElement.firstChild;
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("false");
            expect(datelinePoint.getAttribute("pointer-events")).toBe("auto");
            expect(datelinePointPath.getAttribute("d")).not.toBeNull();
            expect(datelinePointPath.getAttribute("d")).toBe(
                datelineJSON[0].shape.path.d
            );
            delay(() => {
                const datelinePointGroupElement = datelinePoint.firstChild;
                const translate = getSVGAnimatedTransformList(
                    datelinePointGroupElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloseTo(338);
                expect(toNumber(translate[1], 10)).toBeCloseTo(0);
                done();
            });
        });
        it("Hides dateline point on consumer disable", () => {
            axisObj.dateline = utils.deepClone(datelineJSON);
            axisObj.dateline[0].showDatelineIndicator = false;
            axisObj.dateline[0].shape = "";
            gantt = new Gantt(axisObj);
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(datelineGroupElement.childNodes.length).toBe(2);
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
            expect(datelinePoint.getAttribute("pointer-events")).toBe("auto");
        });
        it("Hides dateline point on consumer disable when shape available", () => {
            axisObj.dateline = utils.deepClone(datelineJSON);
            axisObj.dateline[0].showDatelineIndicator = false;
            axisObj.dateline[0].shape = SHAPES.CIRCLE;
            gantt = new Gantt(axisObj);
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(datelineGroupElement.childNodes.length).toBe(2);
            expect(datelinePoint).not.toBeNull();
            expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
        });
        describe("when clicked on dateline", () => {
            it("Does not do anything if no onClick callback is provided", (done) => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                gantt = new Gantt(axisObj);
                const datelinePointElement = fetchElementByClass(
                    styles.datelinePoint
                );
                triggerEvent(datelinePointElement, "click", () => {
                    expect(
                        datelinePointElement.getAttribute("aria-disabled")
                    ).toBe("true");
                    done();
                });
            });
            it("Calls onClick callback", (done) => {
                const onClickFunctionSpy = sinon.spy();
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].onClick = onClickFunctionSpy;
                gantt = new Gantt(axisObj);
                const datelinePointElement = fetchElementByClass(
                    styles.datelinePoint
                );
                triggerEvent(datelinePointElement, "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                    expect(
                        fetchElementByClass(styles.datelineGroup).getAttribute(
                            "aria-selected"
                        )
                    ).toBe("true");
                    expect(
                        datelinePointElement.getAttribute("aria-disabled")
                    ).toBe("false");
                    done();
                });
            });
            it("Removes selection when dateline is clicked again", (done) => {
                const onClickFunctionSpy = sinon.spy();
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].onClick = onClickFunctionSpy;
                gantt = new Gantt(axisObj);
                const point = fetchElementByClass(styles.datelinePoint);
                triggerEvent(point, "click", () => {
                    triggerEvent(point, "click", () => {
                        expect(
                            fetchElementByClass(
                                styles.datelineGroup
                            ).getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    });
                });
            });
            it("Removes dateline selection when parameter callback is called", (done) => {
                axisObj.dateline = utils.deepClone(datelineJSON);
                axisObj.dateline[0].onClick = (clearSelectionCallback) =>
                    clearSelectionCallback();
                gantt = new Gantt(axisObj);
                const point = fetchElementByClass(styles.datelinePoint);
                triggerEvent(point, "click", () => {
                    expect(
                        fetchElementByClass(styles.datelineGroup).getAttribute(
                            "aria-selected"
                        )
                    ).toBe("false");
                    done();
                });
            });
        });
        describe("Pass Through's", () => {
            describe("clickPassThrough - undefined", () => {
                beforeEach(() => {
                    axisObj = getAxes(axisJSON);
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    gantt = new Gantt(axisObj);
                });
                it("set pointer-events correctly", () => {
                    const dateline = fetchElementByClass(styles.dateline);
                    expect(dateline.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                    const datelinePoint = fetchElementByClass(
                        styles.datelinePoint
                    );
                    expect(datelinePoint.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
            describe("clickPassThrough - true", () => {
                beforeEach(() => {
                    axisObj = Object.assign(getAxes(axisJSON), {
                        clickPassThrough: {
                            datelines: true
                        }
                    });
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    gantt = new Gantt(axisObj);
                });
                it("set pointer-events correctly", () => {
                    const dateline = fetchElementByClass(styles.dateline);
                    expect(dateline.getAttribute("pointer-events")).toBe(
                        "none"
                    );
                    const datelinePoint = fetchElementByClass(
                        styles.datelinePoint
                    );
                    expect(datelinePoint.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
            describe("clickPassThrough - false", () => {
                beforeEach(() => {
                    axisObj = Object.assign(getAxes(axisJSON), {
                        clickPassThrough: {
                            datelines: false
                        }
                    });
                    axisObj.dateline = utils.deepClone(datelineJSON);
                    gantt = new Gantt(axisObj);
                });
                it("set pointer-events correctly", () => {
                    const dateline = fetchElementByClass(styles.dateline);
                    expect(dateline.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                    const datelinePoint = fetchElementByClass(
                        styles.datelinePoint
                    );
                    expect(datelinePoint.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
        });
    });
    it("Attaches event handlers", () => {
        gantt.resizeHandler();
        expect(gantt.resizeHandler).not.toBeNull();
        expect(gantt.resizeHandler).toEqual(jasmine.any(Function));
    });
});
