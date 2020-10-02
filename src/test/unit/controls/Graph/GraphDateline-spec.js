"use strict";
import sinon from "sinon";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import { COLORS, SHAPES } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    PADDING_BOTTOM,
    toNumber,
    triggerEvent,
    delay
} from "../../helpers/commonHelpers";
import {
    axisTimeSeries,
    fetchElementByClass,
    getAxes,
    getData,
    valuesDefault,
    valuesTimeSeries,
    axisDefaultWithDateline,
    axisTimeseriesWithDateline,
    datelineJSON,
    axisTimeSeriesWithAxisTop
} from "./helpers";

describe("Graph - Dateline", () => {
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
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("Validates input props", () => {
        it("Process the default input with dateline throw error", () => {
            expect(() => {
                graph = new Graph(axisDefaultWithDateline);
                graph.loadContent(new Line(getData(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_INVALID_TYPE);
        });
        it("Process the timeseries input with dateline without any error", () => {
            expect(() => {
                graph = new Graph(axisTimeseriesWithDateline);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).not.toThrow();
        });
        it("Throw error on empty dateline", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = [{}];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_DATELINE_OBJECT_NOT_PROVIDED);
        });
        it("Throw error on dateline without value", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = [
                    {
                        showDatelineIndicator: true,
                        label: {
                            display: "Release A"
                        },
                        color: COLORS.GREEN,
                        shape: SHAPES.SQUARE
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_DATELINE_NOT_PROVIDED);
        });
        it("Throw error on dateline with value not date", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = [
                    {
                        showDatelineIndicator: true,
                        label: {
                            display: "Release A"
                        },
                        color: COLORS.GREEN,
                        shape: SHAPES.SQUARE,
                        value: "notDate"
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_DATELINE_TYPE_NOT_VALID);
        });
        it("Throw error on dateline without color", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = [
                    {
                        showDatelineIndicator: true,
                        label: {
                            display: "Release A"
                        },
                        shape: SHAPES.SQUARE,
                        value: new Date(2016, 5, 1).toISOString()
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_DATELINE_COLOR_NOT_PROVIDED);
        });
        it("Throw error on dateline without shape", () => {
            expect(() => {
                const input = utils.deepClone(getAxes(axisTimeSeries));
                input.dateline = [
                    {
                        showDatelineIndicator: true,
                        label: {
                            display: "Release A"
                        },
                        color: COLORS.GREEN,
                        value: new Date(2016, 5, 1).toISOString()
                    }
                ];
                graph = new Graph(input);
                graph.loadContent(new Line(getData(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_DATELINE_SHAPE_NOT_PROVIDED);
        });
    });
    it("Process dateline correctly", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.dateline = datelineJSON;
        graph = new Graph(input);
        expect(graph.config.dateline).toEqual(input.dateline);
    });
    it("Process dateline correctly with x-axis at top", () => {
        const input = utils.deepClone(getAxes(axisTimeSeriesWithAxisTop));
        input.dateline = datelineJSON;
        graph = new Graph(input);
        const datelines = document.querySelectorAll(`.${styles.dateline}`);
        expect(datelines.length).toBe(1);
        expect(datelines[0].getAttribute("pointer-events")).toBe("auto");
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
    });
    it("Creates multiple datelines correctly", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.dateline = [
            {
                showDatelineIndicator: true,
                label: {
                    display: "Release A"
                },
                color: COLORS.GREY,
                shape: SHAPES.SQUARE,
                value: new Date(2016, 5, 1).toISOString()
            },
            {
                showDatelineIndicator: true,
                label: {
                    display: "Release B"
                },
                color: COLORS.ORANGE,
                shape: SHAPES.DIAMOND,
                value: new Date(2016, 8, 1).toISOString()
            }
        ];
        graph = new Graph(input);
        const datelines = document.querySelectorAll(`.${styles.dateline}`);
        const datelineShapePath = document.querySelectorAll(
            `.${styles.datelinePoint} g path`
        );
        expect(datelines.length).toBe(2);
        expect(datelines[0].getAttribute("pointer-events")).toBe("auto");
        expect(datelines[1].getAttribute("pointer-events")).toBe("auto");
        expect(datelines[0].style.fill).toBe("rgb(167, 170, 171)");
        expect(datelines[1].style.fill).toBe("rgb(181, 73, 0)");
        expect(datelineShapePath[0].getAttribute("d")).toBe("M0 0h48v48H0V0z");
        expect(datelineShapePath[1].getAttribute("d")).toBe(
            "M24 0l12 24-12 24-12-24L24 0z"
        );
    });
    it("Creates dateline point correctly", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.dateline = utils.deepClone(datelineJSON);
        graph = new Graph(input);
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
    });
    it("Hides dateline point on consumer disable", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.dateline = utils.deepClone(datelineJSON);
        input.dateline[0].showDatelineIndicator = false;
        input.dateline[0].shape = "";
        graph = new Graph(input);
        const datelinePoint = fetchElementByClass(styles.datelinePoint);
        const datelineGroupElement = fetchElementByClass(styles.datelineGroup);
        expect(datelineGroupElement.childNodes.length).toBe(2);
        expect(datelinePoint).not.toBeNull();
        expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
        expect(datelinePoint.getAttribute("pointer-events")).toBe("auto");
    });
    it("Hides dateline point on consumer disable when shape available", () => {
        const input = utils.deepClone(getAxes(axisTimeSeries));
        input.dateline = utils.deepClone(datelineJSON);
        input.dateline[0].showDatelineIndicator = false;
        input.dateline[0].shape = SHAPES.CIRCLE;
        graph = new Graph(input);
        const datelinePoint = fetchElementByClass(styles.datelinePoint);
        const datelineGroupElement = fetchElementByClass(styles.datelineGroup);
        expect(datelineGroupElement.childNodes.length).toBe(2);
        expect(datelinePoint).not.toBeNull();
        expect(datelinePoint.getAttribute("aria-hidden")).toBe("true");
    });
    describe("When clicked on dateline", () => {
        it("Does not do anything if no onClick callback is provided", (done) => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = utils.deepClone(datelineJSON);
            graph = new Graph(input);
            const datelinePointElement = fetchElementByClass(
                styles.datelinePoint
            );
            triggerEvent(datelinePointElement, "click", () => {
                expect(datelinePointElement.getAttribute("aria-disabled")).toBe(
                    "true"
                );
                done();
            });
        });
        it("Calls onClick callback", (done) => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            const onClickFunctionSpy = sinon.spy();
            input.dateline = utils.deepClone(datelineJSON);
            input.dateline[0].onClick = onClickFunctionSpy;
            graph = new Graph(input);
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
                expect(datelinePointElement.getAttribute("aria-disabled")).toBe(
                    "false"
                );
                done();
            });
        });
        it("Removes selection when dateline is clicked again", (done) => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            const onClickFunctionSpy = sinon.spy();
            input.dateline = utils.deepClone(datelineJSON);
            input.dateline[0].onClick = onClickFunctionSpy;
            graph = new Graph(input);
            const point = fetchElementByClass(styles.datelinePoint);
            triggerEvent(point, "click", () => {
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
        it("Removes dateline selection when parameter callback is called", (done) => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = utils.deepClone(datelineJSON);
            input.dateline[0].onClick = (clearSelectionCallback) =>
                clearSelectionCallback();
            graph = new Graph(input);
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
    describe("When dateline clickPassThrough is provided", () => {
        describe("When clickPassThrough property is provided - true", () => {
            beforeEach(() => {
                const input = Object.assign(getAxes(axisTimeSeries), {
                    clickPassThrough: {
                        datelines: true
                    }
                });
                input.dateline = utils.deepClone(datelineJSON);
                graph = new Graph(input);
            });
            it("Set pointer-events correctly", () => {
                const dateline = fetchElementByClass(styles.dateline);
                expect(dateline.getAttribute("pointer-events")).toBe("none");
                const datelinePoint = fetchElementByClass(styles.datelinePoint);
                expect(datelinePoint.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
        });
        describe("When clickPassThrough property is provided - false", () => {
            beforeEach(() => {
                const input = Object.assign(getAxes(axisTimeSeries), {
                    clickPassThrough: {
                        datelines: false
                    }
                });
                input.dateline = utils.deepClone(datelineJSON);
                graph = new Graph(input);
            });
            it("Set pointer-events correctly", () => {
                const dateline = fetchElementByClass(styles.dateline);
                expect(dateline.getAttribute("pointer-events")).toBe("auto");
                const datelinePoint = fetchElementByClass(styles.datelinePoint);
                expect(datelinePoint.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
        });
    });
    describe("Check the translation of Dateline correctly", () => {
        beforeEach(() => {
            const input = utils.deepClone(getAxes(axisTimeSeries));
            input.dateline = datelineJSON;
            graph = new Graph(input);
        });
        it("DatelineGroup translates properly", (done) => {
            const datelineGroup = fetchElementByClass(styles.datelineGroup);
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
        it("Transform dateline Point correctly", (done) => {
            const datelinePoint = fetchElementByClass(styles.datelinePoint);
            delay(() => {
                const datelinePointPath = datelinePoint.firstChild;
                const translate = getSVGAnimatedTransformList(
                    datelinePointPath.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(541);
                expect(toNumber(translate[1], 10)).toBeCloserTo(0);
                done();
            });
        });
        it("Check Dateline coordinate attributes", (done) => {
            delay(() => {
                const datelineElement = fetchElementByClass(styles.dateline);
                expect(
                    toNumber(datelineElement.getAttribute("x1"), 10)
                ).toBeCloserTo(541);
                expect(
                    toNumber(datelineElement.getAttribute("y1"), 10)
                ).toBeCloserTo(0);
                expect(
                    toNumber(datelineElement.getAttribute("x2"), 10)
                ).toBeCloserTo(541);
                expect(
                    toNumber(datelineElement.getAttribute("y2"), 10)
                ).toBeCloserTo(235);
                done();
            });
        });
    });
});
