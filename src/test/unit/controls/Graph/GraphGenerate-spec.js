"use strict";
import * as d3 from "d3";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import { getYAxisHeight } from "../../../../main/js/helpers/axis";
import constants, {
    AXES_ORIENTATION
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import { loadLegendItem } from "../../../../main/js/helpers/legend";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getData,
    valuesDefault
} from "./helpers";

describe("Graph - Generate", () => {
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

    it("Creates the container svg", () => {
        const graphElem = document.querySelector(graph.config.bindTo);
        expect(graphElem).not.toBeNull();
        expect(graphElem.children[0].nodeName).toBe("DIV");
        expect(graphElem.children[0].getAttribute("class")).toBe(
            styles.container
        );
    });
    it("Creates graph elements in order", () => {
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
    it("Creates canvas elements in order", () => {
        const defsElement = fetchElementByClass(styles.canvas).childNodes[0];
        const regionElement = fetchElementByClass(styles.canvas).childNodes[1];
        const gridElement = fetchElementByClass(styles.canvas).childNodes[2];
        const contentContainer = fetchElementByClass(styles.canvas)
            .childNodes[3];
        const axisXElement = fetchElementByClass(styles.canvas).childNodes[4];
        const axisYElement = fetchElementByClass(styles.canvas).childNodes[5];
        const axisInfoRowElement = fetchElementByClass(styles.canvas)
            .childNodes[6];
        const axisXLabelElement = fetchElementByClass(styles.canvas)
            .childNodes[7];
        const axisYLabelElement = fetchElementByClass(styles.canvas)
            .childNodes[8];
        const axisReferenceLintElement = fetchElementByClass(styles.canvas)
            .childNodes[9];
        expect(defsElement).not.toBeNull();
        expect(regionElement).not.toBeNull();
        expect(gridElement).not.toBeNull();
        expect(axisXElement).not.toBeNull();
        expect(axisYElement).not.toBeNull();
        expect(contentContainer).not.toBeNull();
        expect(axisInfoRowElement).not.toBeNull();
        expect(axisXLabelElement).not.toBeNull();
        expect(axisYLabelElement).not.toBeNull();
        expect(axisReferenceLintElement).not.toBeNull();

        expect(defsElement.nodeName).toBe("defs");
        expect(regionElement.nodeName).toBe("g");
        expect(gridElement.nodeName).toBe("g");
        expect(axisXElement.nodeName).toBe("g");
        expect(axisYElement.nodeName).toBe("g");
        expect(contentContainer.nodeName).toBe("rect");
        expect(axisInfoRowElement.nodeName).toBe("g");
        expect(axisXLabelElement.nodeName).toBe("g");
        expect(axisYLabelElement.nodeName).toBe("g");
        expect(axisReferenceLintElement.nodeName).toBe("path");

        expect(regionElement.getAttribute("class")).toBe(styles.regionGroup);
        expect(gridElement.getAttribute("class")).toBe(styles.grid);
        expect(axisXElement.classList).toContain(styles.axis);
        expect(axisXElement.classList).toContain(styles.axisX);
        expect(axisYElement.classList).toContain(styles.axis);
        expect(axisYElement.classList).toContain(styles.axisY);
        expect(contentContainer.classList).toContain(styles.contentContainer);
        expect(axisInfoRowElement.getAttribute("class")).toContain(
            styles.axisInfoRow
        );
        expect(axisInfoRowElement.childElementCount).toBe(1);
        expect(axisXLabelElement.getAttribute("class")).toBe(styles.axisLabelX);
        expect(axisYLabelElement.getAttribute("class")).toBe(styles.axisLabelY);
        expect(
            axisReferenceLintElement.classList.contains(
                styles.axisReferenceLine
            )
        ).toBeTruthy();
    });
    it("Creates the canvas svg", () => {
        const canvas = fetchElementByClass(styles.container).firstChild;
        expect(canvas).not.toBeNull();
        expect(canvas.nodeName).toBe("svg");
        expect(canvas.getAttribute("class")).toBe(styles.canvas);
        expect(toNumber(canvas.getAttribute("height"))).toBe(
            graph.config.canvasHeight
        );
        expect(toNumber(canvas.getAttribute("width"))).toBe(
            graph.config.canvasWidth - constants.BASE_CANVAS_WIDTH_PADDING
        );
    });
    it("Creates defs element with height and width", () => {
        const currentWidth =
            graph.config.axisSizes.y +
            graph.config.axisSizes.y2 +
            graph.config.axisLabelWidths.y +
            graph.config.axisLabelWidths.y2;
        const defsElement = fetchElementByClass(styles.canvas).firstChild;
        expect(defsElement.nodeName).toBe("defs");
        expect(defsElement.firstChild.nodeName).toBe("clipPath");
        expect(defsElement.firstChild.firstChild.nodeName).toBe("rect");
        expect(defsElement.firstChild.firstChild.getAttribute("width")).toBe(
            `${1024 - currentWidth}`
        );
        expect(
            toNumber(defsElement.firstChild.firstChild.getAttribute("height"))
        ).toBe(graph.config.height);
    });
    it("Creates region container", () => {
        const regionElement = fetchElementByClass(styles.canvas).childNodes[1];
        expect(regionElement.nodeName).toBe("g");
        expect(regionElement.getAttribute("class")).toBe(styles.regionGroup);
    });
    describe("When custom padding is used", () => {
        it("Renders correctly", () => {
            graph.destroy();
            const graphConfig = getAxes(axisDefault);
            graphConfig.padding = {
                top: 0,
                left: -17,
                right: 0,
                bottom: -17
            };
            graph = new Graph(graphConfig);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(-16);
            expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                graphConfig.padding.bottom
            );
            expect(
                toNumber(
                    graph.config.axisSizes.y + graph.config.axisLabelWidths.y,
                    10
                )
            ).toBeCloserTo(-16);
            expect(getYAxisHeight(graph.config)).toBeCloserTo(267);
        });
        it("Resizes correctly after rendering", (done) => {
            graph.destroy();
            const graphConfig = getAxes(axisDefault);
            graphConfig.padding = {
                top: 0,
                left: -17,
                right: 0,
                bottom: -17
            };
            graph = new Graph(graphConfig);
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const canvas = d3.select(`.${styles.canvas}`);
                expect(800).toBeCloserTo(toNumber(canvas.attr("width"), 10));
                expect(200).toBeCloserTo(
                    toNumber(canvas.attr("height"), 10) +
                        (graph.config.padding.bottom * 2 +
                            graph.config.padding.top) *
                            2
                );
                done();
            });
        });
        it("Renders correctly with X Axis orientation - Top", () => {
            graph.destroy();
            const graphConfig = getAxes(axisDefault);
            graphConfig.axis.x.orientation = AXES_ORIENTATION.X.TOP;
            graphConfig.padding = {
                top: -17,
                left: -17,
                right: 0,
                bottom: 0
            };
            graph = new Graph(graphConfig);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(-16);
            expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                toNumber(
                    graph.config.axisLabelHeights.x * 2 +
                        graphConfig.padding.top,
                    10
                )
            );
        });
        it("Renders correctly with X Axis orientation - Top without Label", () => {
            graph.destroy();
            const graphConfig = getAxes(axisDefault);
            graphConfig.axis.x.orientation = AXES_ORIENTATION.X.TOP;
            graphConfig.axis.x.label = "";
            graphConfig.padding = {
                top: -17,
                left: -17,
                right: 0,
                bottom: 0
            };
            graph = new Graph(graphConfig);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(-16);
            expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(
                graphConfig.padding.top
            );
        });
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
        /**
         *    Verify if lower step grid lines do not display with midpoint grid lines or upper grid lines, the lower step grid lines displays as a solid 1px light gray color #E8E9EA
         */
        it("Creates the grid markup with tick values provided", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.ticks = {
                values: [10, 20, 30]
            };
            localeAxisObj.y.ticks = {
                values: [1, 5, 8]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const gridElement = fetchElementByClass(styles.grid);
            const gridHElement = fetchElementByClass(styles.gridH);
            const gridVElement = fetchElementByClass(styles.gridV);
            expect(gridElement.childElementCount).toBe(2);
            expect(gridHElement.querySelectorAll(".tick").length).toBe(3);
            expect(gridVElement.querySelectorAll(".tick").length).toBe(3);
        });
        it("Creates the grid markup with upperTickValues, midTickValues and values provided", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.ticks = {
                show: true,
                values: [15, 25, 35],
                upperStepTickValues: [10, 40],
                midpointTickValues: [15, 25]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );

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
        it("Creates the grid markup with upperTickValues, lowerTickValues and midTickValues provided", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.ticks = {
                show: true,
                lowerStepTickValues: [15, 25, 35],
                upperStepTickValues: [10, 40],
                midpointTickValues: [15, 25]
            };
            graph = new Graph(getAxes(localeAxisObj));

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
        it("Creates the grid markup by giving lowerTickValues more precidence than values if both available", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.ticks = {
                show: true,
                values: [15, 30],
                lowerStepTickValues: [15, 25, 35],
                upperStepTickValues: [10, 40],
                midpointTickValues: [15, 25]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );

            expect(gridLowerStepElement.querySelectorAll(".tick").length).toBe(
                3
            );
            expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
            expect(gridUpperStepElement.querySelectorAll(".tick").length).toBe(
                2
            );
        });
        it("Creates the grid markup with upper values provided", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.ticks = {
                show: true,
                upperStepTickValues: [10, 40]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );

            expect(gridMidElement).toBeNull();
            expect(gridLowerStepElement).toBeNull();
            expect(gridUpperStepElement.querySelectorAll(".tick").length).toBe(
                2
            );
        });
        it("Creates the grid markup with mid values provided", () => {
            graph.destroy();
            const localeAxisObj = utils.deepClone(axisDefault);
            localeAxisObj.x.ticks = {
                show: true,
                midpointTickValues: [10, 40]
            };
            graph = new Graph(getAxes(localeAxisObj));
            const gridMidElement = fetchElementByClass(styles.gridMidpoint);
            const gridLowerStepElement = fetchElementByClass(
                styles.gridLowerStep
            );
            const gridUpperStepElement = fetchElementByClass(
                styles.gridUpperStep
            );

            expect(gridLowerStepElement).toBeNull();
            expect(gridUpperStepElement).toBeNull();
            expect(gridMidElement.querySelectorAll(".tick").length).toBe(2);
        });
        it("Creates the horizontal grid markup", () => {
            const gridElement = fetchElementByClass(styles.grid);
            expect(
                gridElement.querySelector(`.${styles.gridH}`)
            ).not.toBeNull();
            expect(gridElement.querySelector(`.${styles.gridH}`).nodeName).toBe(
                "g"
            );
        });
        it("Creates the vertical grid markup", () => {
            const gridElement = fetchElementByClass(styles.grid);
            expect(
                gridElement.querySelector(`.${styles.gridV}`)
            ).not.toBeNull();
            expect(gridElement.querySelector(`.${styles.gridV}`).nodeName).toBe(
                "g"
            );
        });
        it("Hides the horizontal grid if not enabled", () => {
            graph.destroy();
            graph = new Graph(
                Object.assign(
                    {
                        showVGrid: true,
                        showHGrid: false
                    },
                    getAxes(axisDefault)
                )
            );

            const gridElement = fetchElementByClass(styles.grid);
            expect(gridElement.querySelector(`.${styles.gridH}`)).toBeNull();
        });
        it("Hides the vertical grid if not enabled", () => {
            graph.destroy();
            graph = new Graph(
                Object.assign(
                    {
                        showVGrid: false,
                        showHGrid: true
                    },
                    getAxes(axisDefault)
                )
            );

            const gridElement = fetchElementByClass(styles.grid);
            expect(gridElement.querySelector(`.${styles.gridV}`)).toBeNull();
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
            expect(toNumber(containerElement.getAttribute("x"))).toBe(
                graph.config.axisSizes.y + graph.config.axisLabelWidths.y
            );
            expect(toNumber(containerElement.getAttribute("y"))).toBe(
                constants.PADDING.bottom
            );
        });
    });
    describe("Label", () => {
        it("Hides the label when not enabled", () => {
            graph.destroy();
            graph = new Graph(
                Object.assign(
                    {
                        showLabel: false
                    },
                    getAxes(axisDefault)
                )
            );

            const canvasElement = fetchElementByClass(styles.canvas);
            expect(
                canvasElement.querySelector(`.${styles.axisLabelX}`)
            ).toBeNull();
            expect(
                canvasElement.querySelector(`.${styles.axisLabelY}`)
            ).toBeNull();
        });
        it("Creates labels for x and y axes when text is present", () => {
            graph.destroy();
            graph = new Graph(getAxes(axisDefault));

            const canvasElement = fetchElementByClass(styles.canvas);
            expect(
                canvasElement.querySelector(`.${styles.axisLabelX}`)
            ).not.toBeNull();
            expect(
                canvasElement.querySelector(`.${styles.axisLabelY}`)
            ).not.toBeNull();
        });
        it("Creates label x axis when text is present", () => {
            graph.destroy();
            graph = new Graph(getAxes(axisDefault));

            const xLabelElement = fetchElementByClass(styles.axisLabelX);
            expect(xLabelElement.nodeName).toBe("g");
            expect(xLabelElement.querySelector("tspan").textContent).toBe(
                axisDefault.x.label
            );
        });
        it("Creates label y axis when y2-axis is false and when text is present", () => {
            graph.destroy();
            graph = new Graph(getAxes(axisDefault));

            const yLabelElement = fetchElementByClass(styles.axisLabelY);
            const translate = getSVGAnimatedTransformList(
                yLabelElement.getAttribute("transform")
            ).translate;
            expect(yLabelElement.nodeName).toBe("g");
            expect(yLabelElement.querySelector("tspan").textContent).toBe(
                axisDefault.y.label
            );
            expect(yLabelElement.getAttribute("transform")).toContain(
                "rotate(-90)"
            );
            expect(toNumber(translate[0], 10)).toBeCloserTo(20);
            expect(toNumber(translate[1], 10)).toBeCloserTo(115);
        });
        it("Creates label y axis when y2-axis is true and text is present", () => {
            graph.destroy();
            graph = new Graph(
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
            );

            const yLabelElement = fetchElementByClass(styles.axisLabelY);
            const translate = getSVGAnimatedTransformList(
                yLabelElement.getAttribute("transform")
            ).translate;
            expect(yLabelElement.nodeName).toBe("g");
            expect(yLabelElement.querySelector("tspan").textContent).toBe(
                axisDefault.y.label
            );
            expect(yLabelElement.getAttribute("transform")).toContain(
                "rotate(-90)"
            );
            expect(toNumber(translate[0], 10)).toBeCloserTo(12);
            expect(toNumber(translate[1], 10)).toBeCloserTo(115);
        });
        it("Changes label y axis position when height property of graph is set to custom value", () => {
            graph.destroy();
            const axes = getAxes(axisDefault);
            axes.dimension = { height: 100 };
            graph = new Graph(axes);

            const yLabelElement = fetchElementByClass(styles.axisLabelY);
            const translate = getSVGAnimatedTransformList(
                yLabelElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloserTo(20);
            expect(toNumber(translate[1], 10)).toBeCloserTo(47);
            expect(toNumber(translate[1], 10)).not.toBe(120);
        });
        it("Doesnt create label x axis when text is not present", () => {
            graph.destroy();
            const labelAxisObj = utils.deepClone(axisDefault);
            labelAxisObj.x.label = "";
            graph = new Graph(getAxes(labelAxisObj));

            const canvasElement = fetchElementByClass(styles.canvas);
            expect(
                canvasElement.querySelector(`.${styles.axisLabelX}`)
            ).toBeNull();
        });
        it("Throws error when label y axis text is not present", () => {
            expect(() => {
                graph.destroy();
                const labelAxisObj = utils.deepClone(axisDefault);
                labelAxisObj.y.label = "";
                graph = new Graph(getAxes(labelAxisObj));
            }).toThrowError(errors.THROW_MSG_NO_AXIS_LABEL_INFO);
        });
        it("Sanitizes x axis label text", () => {
            graph.destroy();
            const labelAxisObj = utils.deepClone(axisDefault);
            labelAxisObj.x.label = "<HELLO DUMMY X LABEL>";
            graph = new Graph(getAxes(labelAxisObj));

            const xLabelElement = fetchElementByClass(styles.axisLabelX);
            expect(xLabelElement.querySelector("tspan").textContent).toBe(
                "&lt;HELLO DUMMY X LABEL&gt;"
            );
        });
        it("Sanitizes y axis label text", () => {
            graph.destroy();
            const labelAxisObj = utils.deepClone(axisDefault);
            labelAxisObj.y.label = "<HELLO DUMMY Y LABEL>";
            graph = new Graph(getAxes(labelAxisObj));

            const yLabelElement = fetchElementByClass(styles.axisLabelY);
            expect(yLabelElement.querySelector("tspan").textContent).toBe(
                "&lt;HELLO DUMMY Y LABEL&gt;"
            );
        });
        it("Does not create label shape container when Y2 axis is not provided", () => {
            graph.destroy();
            graph = new Graph(getAxes(utils.deepClone(axisDefault)));
            const canvasElement = fetchElementByClass(styles.canvas);
            expect(
                canvasElement.querySelector(
                    `.${styles.axisLabelYShapeContainer}`
                )
            ).toBeNull();
            expect(
                canvasElement.querySelector(
                    `.${styles.axisLabelY2ShapeContainer}`
                )
            ).toBeNull();
        });
        it("Creates label shape container when Y2 axis is provided", () => {
            graph.destroy();
            graph = new Graph(
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
            );
            const canvasElement = fetchElementByClass(styles.canvas);
            const yAxisShapeContainer = canvasElement.querySelector(
                `.${styles.axisLabelYShapeContainer}`
            );
            const y2AxisShapeContainer = canvasElement.querySelector(
                `.${styles.axisLabelY2ShapeContainer}`
            );
            expect(yAxisShapeContainer).not.toBeNull();
            expect(y2AxisShapeContainer).not.toBeNull();
            expect(yAxisShapeContainer.tagName).toBe("g");
            expect(y2AxisShapeContainer.tagName).toBe("g");
        });
        it("Hides label shape container if flag is turned off", () => {
            graph.destroy();
            const labelAxisObj = utils.deepClone(
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
            );
            labelAxisObj.showLabel = false;
            graph = new Graph(labelAxisObj);
            const canvasElement = fetchElementByClass(styles.canvas);
            expect(
                canvasElement.querySelector(
                    `.${styles.axisLabelYShapeContainer}`
                )
            ).toBeNull();
            expect(
                canvasElement.querySelector(
                    `.${styles.axisLabelY2ShapeContainer}`
                )
            ).toBeNull();
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
            graph.destroy();
            const legendContainer = document.createElement("div");
            legendContainer.setAttribute("id", "lineLegendContainer");
            legendContainer.setAttribute("class", "legend-container");
            graphContainer.appendChild(legendContainer);
            const input = utils.deepClone(getAxes(axisDefault));
            input.bindLegendTo = "#lineLegendContainer";
            graph = new Graph(input);
            const container = fetchElementByClass(styles.container);
            const parentContainer = fetchElementByClass("carbon-test-class");
            expect(graph.config.bindLegendTo).toEqual(input.bindLegendTo);
            expect(container.childNodes.length).toEqual(1);
            expect(parentContainer.childNodes.length).toEqual(2);
            expect(parentContainer.childNodes[0].getAttribute("id")).toEqual(
                "lineLegendContainer"
            );
            expect(parentContainer.childNodes[0].getAttribute("class")).toEqual(
                "legend-container"
            );
            expect(parentContainer.childNodes[1].getAttribute("class")).toEqual(
                styles.container
            );
        });
        it("Hides legend when not enabled", () => {
            graph.destroy();
            graph = new Graph(
                Object.assign(
                    {
                        showLegend: false
                    },
                    getAxes(axisDefault)
                )
            );
            const canvasElement = fetchElementByClass(styles.canvas);
            expect(canvasElement.querySelector(`.${styles.legend}`)).toBeNull();
        });
    });
    describe("Validates content for unique keys", () => {
        it("Throws error if content doesn't have a unique key", () => {
            graph = new Graph(Object.assign(getAxes(axisDefault)));
            graph.loadContent(new Line(getData(valuesDefault)));
            expect(() => {
                graph.loadContent(new Line(getData(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
        });
        it("Doesn't throws error if content has unique keys", () => {
            graph = new Graph(Object.assign(getAxes(axisDefault)));
            graph.loadContent(new Line(getData(valuesDefault)));
            expect(() => {
                const uniqueData = getData(valuesDefault);
                uniqueData.key = "uid_2";
                graph.loadContent(new Line(uniqueData));
            }).not.toThrowError(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
        });
    });
    it("Attaches event handlers", () => {
        graph.resizeHandler();
        expect(graph.resizeHandler).not.toBeNull();
        expect(graph.resizeHandler).toEqual(jasmine.any(Function));
    });
});
