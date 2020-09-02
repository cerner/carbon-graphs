"use strict";
import Bubble from "../../../../main/js/controls/Bubble";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { COLORS, SHAPES } from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    delay,
    loadCustomJasmineMatcher,
    PADDING_BOTTOM,
    toNumber
} from "../../helpers/commonHelpers";
import {
    axisTimeSeries,
    getAxes,
    getInput,
    valuesTimeSeries,
    fetchAllElementsByClass,
    fetchElementByClass
} from "./helpers";

describe("Bubble - Panning", () => {
    let graphDefault = null;
    let bubbleGraphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        bubbleGraphContainer = document.createElement("div");
        bubbleGraphContainer.id = "testBubble_carbon";
        bubbleGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(bubbleGraphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When pan is enabled", () => {
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
            graphDefault.loadContent(new Bubble(input));
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
                    let bubbleContent = fetchAllElementsByClass(
                        bubbleGraphContainer,
                        styles.pointGroup
                    );
                    expect(bubbleContent.length).toEqual(3);
                    graphDefault.reflow(panData);
                    bubbleContent = fetchAllElementsByClass(
                        bubbleGraphContainer,
                        styles.pointGroup
                    );
                    expect(bubbleContent.length).toEqual(2);
                    const axisLabelX = fetchElementByClass(bubbleGraphContainer, styles.axisLabelX);
                    const axisLabelY = fetchElementByClass(bubbleGraphContainer, styles.axisLabelY);
                    const axisLabelY2 = fetchElementByClass(bubbleGraphContainer, styles.axisLabelY2);
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
                    const axisLabelX = fetchElementByClass(bubbleGraphContainer, styles.axisLabelX);
                    const axisLabelY = fetchElementByClass(bubbleGraphContainer, styles.axisLabelY);
                    const axisLabelY2 = fetchElementByClass(bubbleGraphContainer, styles.axisLabelY2);
                    expect(axisLabelX.querySelector("text").textContent).toBe("updated xLabel");
                    expect(axisLabelY.querySelector("text").textContent).toBe("updated yLabel");
                    expect(axisLabelY2.querySelector("text").textContent).toBe("updated y2Label");
                    
                });
             });
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
            let bubbleContent = fetchAllElementsByClass(
                bubbleGraphContainer,
                styles.pointGroup
            );
            expect(bubbleContent.length).toEqual(3);
            graphDefault.reflow(panData);
            bubbleContent = fetchAllElementsByClass(
                bubbleGraphContainer,
                styles.pointGroup
            );
            expect(bubbleContent.length).toEqual(3);
        });
        describe("when there is no data", () => {
            it("should update the dynamic data and disable the legend", () => {
                const panData = {
                    key: "uid_1",
                    values: []
                };
                let bubbleContent = fetchAllElementsByClass(
                    bubbleGraphContainer,
                    styles.pointGroup
                );
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(bubbleContent.length).toEqual(3);
                graphDefault.reflow(panData);
                bubbleContent = fetchAllElementsByClass(
                    bubbleGraphContainer,
                    styles.pointGroup
                );
                expect(bubbleContent.length).toEqual(0);
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
           });
       });
    });
    describe("When pan is disabled", () => {
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
            graphDefault.loadContent(new Bubble(input));
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
            axisData.pan = { enabled: true };
            const input = getInput([], false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new Bubble(input));
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
                let bubbleContent = fetchAllElementsByClass(
                    bubbleGraphContainer,
                    styles.pointGroup
                );
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
                expect(bubbleContent.length).toEqual(0);
                graphDefault.reflow(panData);
                bubbleContent = fetchAllElementsByClass(
                    bubbleGraphContainer,
                    styles.pointGroup
                );
                expect(bubbleContent.length).toEqual(2);
                expect(legendItem.getAttribute("aria-disabled")).toBe("false");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
            });
        });
    });
});