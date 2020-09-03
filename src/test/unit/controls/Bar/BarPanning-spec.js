"use strict";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    PADDING_BOTTOM,
    delay
} from "../../helpers/commonHelpers";
import {
    getAxes,
    getInput,
    valuesTimeSeries,
    axisTimeSeries,
    fetchAllElementsByClass,
    fetchElementByClass
} from "./helpers";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import { COLORS, SHAPES } from "../../../../main/js/helpers/constants";

describe("Bar - Panning", () => {
    let graphDefault = null;
    let barGraphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        barGraphContainer = document.createElement("div");
        barGraphContainer.id = "testBar_carbon";
        barGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(barGraphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When enabled", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisTimeSeries));
            axisData.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREEN,
                    shape: SHAPES.SQUARE,
                    value: "2016-06-03T12:00:00Z"
                }
            ];
            axisData.pan = { enabled: true };
            const input = getInput(valuesTimeSeries, false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new Bar(input));
        });
        it("Check if clamp is false if pan is enabled", () => {
            expect(graphDefault.scale.x.clamp()).toEqual(false);
        });
        it("DatelineGroup translates properly when panning is enabled", (done) => {
            const datelineGroup = document.querySelector(
                `.${styles.datelineGroup}`
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
        describe("when key matches", () => {
            describe("label is not passed", () => {
                 it("should update dynamic data and retain label", () => {
                    const panData = {
                        key: "uid_1",
                        values: [
                            {
                                x: "2016-03-03T12:00:00Z",
                                y: 2
                            },
                            {
                                x: "2016-04-03T12:00:00Z",
                                y: 20
                            }
                        ]
                    };
                    let barContent = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.bar
                    );
                    expect(barContent.length).toEqual(3);
                    graphDefault.reflow(panData);
                    barContent = fetchAllElementsByClass(barGraphContainer, styles.bar);
                    expect(barContent.length).toEqual(2);
                    const axisLabelX = fetchElementByClass(barGraphContainer, styles.axisLabelX);
                    const axisLabelY = fetchElementByClass(barGraphContainer, styles.axisLabelY);
                    const axisLabelY2 = fetchElementByClass(barGraphContainer, styles.axisLabelY2);
                    expect(axisLabelX.querySelector("text").textContent).toBe("X Label");
                    expect(axisLabelY.querySelector("text").textContent).toBe("Y Label");
                    expect(axisLabelY2.querySelector("text").textContent).toBe("Y2 Label");
                 });
             });
             describe("when label is passed", () => {
                it("should update the label during reflow", () => {
                    const panData = {
                        key: "uid_1",
                        values: [
                            {
                                x: "2016-03-03T12:00:00Z",
                                y: 2
                            },
                            {
                                x: "2016-04-03T12:00:00Z",
                                y: 20
                            }
                        ],
                        xLabel: "updated xLabel",
                        yLabel: "updated yLabel",
                        y2Label: "updated y2Label"
                    };
                    graphDefault.reflow(panData);
                    const axisLabelX = fetchElementByClass(barGraphContainer, styles.axisLabelX);
                    const axisLabelY = fetchElementByClass(barGraphContainer, styles.axisLabelY);
                    const axisLabelY2 = fetchElementByClass(barGraphContainer, styles.axisLabelY2);
                    expect(axisLabelX.querySelector("text").textContent).toBe("updated xLabel");
                    expect(axisLabelY.querySelector("text").textContent).toBe("updated yLabel");
                    expect(axisLabelY2.querySelector("text").textContent).toBe("updated y2Label");
                });
             })
        });
        it("Dynamic Data is not updated when key does not match", () => {
            const panData = {
                key: "uid_2",
                values: [
                    {
                        x: "2016-03-03T12:00:00Z",
                        y: 2
                    },
                    {
                        x: "2016-04-03T12:00:00Z",
                        y: 20
                    }
                ]
            };
            let barContent = fetchAllElementsByClass(
                barGraphContainer,
                styles.bar
            );
            expect(barContent.length).toEqual(3);
            graphDefault.reflow(panData);
            barContent = fetchAllElementsByClass(barGraphContainer, styles.bar);
            expect(barContent.length).toEqual(3);
        });
    });
    describe("When disabled", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisTimeSeries));
            axisData.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREEN,
                    shape: SHAPES.SQUARE,
                    value: "2016-06-03T12:00:00Z"
                }
            ];
            axisData.pan = { enabled: false };
            const input = getInput(valuesTimeSeries, false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new Bar(input));
        });
        it("Check if clamp is true if pan is disabled", () => {
            expect(graphDefault.scale.x.clamp()).toEqual(true);
        });
        it("DatelineGroup translates properly after some delay when panning is disabled", (done) => {
            const datelineGroup = document.querySelector(
                `.${styles.datelineGroup}`
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
    describe("On click of panning button", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisTimeSeries));
            axisData.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREEN,
                    shape: SHAPES.SQUARE,
                    value: "2016-06-03T12:00:00Z"
                }
            ];
            axisData.pan = { enabled: false };
            const input = getInput([], false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new Bar(input));
        });
        describe("when legend hold values", () => {
            it("should remove the No Data Views", () => {
                const panData = {
                    key: "uid_1",
                    values: [
                        {
                            x: "2016-03-03T12:00:00Z",
                            y: 2
                        },
                        {
                            x: "2016-04-03T12:00:00Z",
                            y: 20
                        }
                    ]
                };
                let barContent = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.bar
                );
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
                expect(barContent.length).toEqual(0);
                graphDefault.reflow(panData);
                barContent = fetchAllElementsByClass(barGraphContainer, styles.bar);
                expect(barContent.length).toEqual(2);
                expect(legendItem.getAttribute("aria-disabled")).toBe("false");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
            });
        });
    });
});
