"use strict";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import styles from "../../../../main/js/helpers/styles";
import {
    getCurrentTransform,
    getSVGAnimatedTransformList,
    round2Decimals
} from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisInfoRowDefault,
    fetchAllElementsByClass,
    getAxes,
    getInput,
    regionsDefault,
    valuesDefault,
    valuesNegativeDefault
} from "./helpers";

describe("Grouped Bar", () => {
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
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("when graph is loaded with 2 inputs", () => {
        let bar1, bar2;
        beforeEach(() => {
            bar1 = new Bar(getInput(valuesDefault, false, false));
            let graph = graphDefault.loadContent(bar1);
            bar1.redraw(graph);
            const input = utils.deepClone(
                getInput(valuesDefault, false, false, false, "uid_2")
            );
            input.group = "uid_11";
            bar2 = new Bar(input);
            graph = graphDefault.loadContent(bar2);
            bar2.redraw(graph);
            bar1.redraw(graph);
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Both inputs are loaded", () => {
            const barContentContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.barGraphContent
            );
            expect(barContentContainer).not.toBeNull();
            expect(
                barContentContainer[0].getAttribute("aria-describedby")
            ).toBe("uid_2");
            expect(
                barContentContainer[1].getAttribute("aria-describedby")
            ).toBe("uid_1");
        });

        it("second input is grouped with first content", () => {
            let barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            const yInput2 = toNumber(barsContainer[0].getAttribute("y"));
            graphDefault.resize();
            barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            const heightInput1 = toNumber(
                barsContainer[0].getAttribute("height")
            );
            // y Range of first input should be equal to yRange of second input (because both have same y values)
            expect(toNumber(barsContainer[3].getAttribute("y"))).toBe(yInput2);
            // x range of both inputs should not be equal
            expect(toNumber(barsContainer[0].getAttribute("x"))).not.toEqual(
                toNumber(barsContainer[3].getAttribute("x"))
            );
            expect(toNumber(barsContainer[0].getAttribute("height"))).toBe(
                heightInput1
            );
            expect(toNumber(barsContainer[0].getAttribute("width"))).toEqual(
                toNumber(barsContainer[3].getAttribute("width"))
            );
        });

        it("when graph is unloaded off input1, unloads first content from graph", () => {
            graphDefault.unloadContent(bar1);
            const barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            expect(barsContainer.length).toEqual(3);
        });

        it("when graph is unloaded off input2, unloads second content from graph", () => {
            graphDefault.unloadContent(bar2);
            const barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            expect(barsContainer.length).toEqual(3);
        });

        it("when graph is unloaded off both inputs, unloads both content from graph", () => {
            graphDefault.unloadContent(bar1);
            graphDefault.unloadContent(bar2);
            const barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            expect(barsContainer.length).toEqual(0);
        });
    });
    describe("when graph is loaded with 2 inputs with negative values", () => {
        let bar1, bar2;
        beforeEach(() => {
            bar1 = new Bar(getInput(valuesNegativeDefault, false, false));
            let graph = graphDefault.loadContent(bar1);
            bar1.redraw(graph);
            const input = utils.deepClone(
                getInput(valuesNegativeDefault, false, false, false, "uid_2")
            );
            input.group = "uid_11";
            bar2 = new Bar(input);
            graph = graphDefault.loadContent(bar2);
            bar2.redraw(graph);
            bar1.redraw(graph);
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Both inputs are loaded", () => {
            const barContentContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.barGraphContent
            );
            expect(barContentContainer).not.toBeNull();
            expect(
                barContentContainer[0].getAttribute("aria-describedby")
            ).toBe("uid_2");
            expect(
                barContentContainer[1].getAttribute("aria-describedby")
            ).toBe("uid_1");
        });

        it("second input is grouped with first content", () => {
            let barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            const yInput2 = toNumber(barsContainer[0].getAttribute("y"));
            graphDefault.resize();
            barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            const heightInput1 = toNumber(
                barsContainer[0].getAttribute("height")
            );
            // y Range of first input should be equal to yRange of second input (because both have same y values)
            expect(toNumber(barsContainer[3].getAttribute("y"))).toBe(yInput2);
            // x range of both inputs should not be equal
            expect(toNumber(barsContainer[0].getAttribute("x"))).not.toEqual(
                toNumber(barsContainer[3].getAttribute("x"))
            );
            expect(toNumber(barsContainer[0].getAttribute("height"))).toBe(
                heightInput1
            );
            expect(toNumber(barsContainer[0].getAttribute("width"))).toEqual(
                toNumber(barsContainer[3].getAttribute("width"))
            );
        });

        it("when graph is unloaded off input1, unloads first content from graph", () => {
            graphDefault.unloadContent(bar1);
            const barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            expect(barsContainer.length).toEqual(3);
        });

        it("when graph is unloaded off input2, unloads second content from graph", () => {
            graphDefault.unloadContent(bar2);
            const barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            expect(barsContainer.length).toEqual(3);
        });

        it("when graph is unloaded off both inputs, unloads both content from graph", () => {
            graphDefault.unloadContent(bar1);
            graphDefault.unloadContent(bar2);
            const barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            expect(barsContainer.length).toEqual(0);
        });
    });
    describe("Region", () => {
        let bar1;
        let bar2;
        describe("on load", () => {
            beforeEach(() => {
                const input1 = getInput(valuesNegativeDefault, false, false);
                input1.regions = regionsDefault;
                bar1 = new Bar(input1);
                let graph = graphDefault.loadContent(bar1);
                bar1.redraw(graph);
                const input2 = utils.deepClone(
                    getInput(
                        valuesNegativeDefault,
                        false,
                        false,
                        false,
                        "uid_2"
                    )
                );
                input2.key = "uid_11";
                input2.regions = regionsDefault;
                bar2 = new Bar(input2);
                graph = graphDefault.loadContent(bar2);
                bar2.redraw(graph);
                bar1.redraw(graph);
            });
            afterEach(() => {
                graphDefault.destroy();
            });

            it("Translates region correctly", () => {
                const regionElement = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement[0].getAttribute("y")).toBe(
                    regionElement[2].getAttribute("y")
                );
                expect(regionElement[0].getAttribute("x")).not.toBe(
                    regionElement[2].getAttribute("x")
                );
            });
        });
    });
    describe("Axis Info Row", () => {
        let bar1;
        let bar2;
        describe("on load", () => {
            beforeEach(() => {
                const input1 = getInput(valuesDefault, false, false);
                input1.axisInfoRow = axisInfoRowDefault;
                bar1 = new Bar(input1);
                let graph = graphDefault.loadContent(bar1);
                bar1.redraw(graph);
                const input2 = utils.deepClone(
                    getInput(valuesDefault, false, false, false, "uid_2")
                );
                input2.group = "uid_11";
                input2.axisInfoRow = axisInfoRowDefault;
                bar2 = new Bar(input2);
                graph = graphDefault.loadContent(bar2);
                bar2.redraw(graph);
                bar1.redraw(graph);
            });
            afterEach(() => {
                graphDefault.destroy();
            });

            it("Translates axis info row labels correctly", () => {
                const axisInfoRowElement = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.axisInfoRowItem
                );
                expect(axisInfoRowElement.length).toBeCloserTo(6);
                expect(
                    toNumber(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[0])
                        ).translate[0],
                        10
                    )
                ).toBeCloserTo(169);
                expect(
                    round2Decimals(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[0])
                        ).translate[1]
                    )
                ).toBeCloserTo(-10);
                expect(
                    toNumber(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[1])
                        ).translate[0],
                        10
                    )
                ).toBeCloserTo(320);
                expect(
                    round2Decimals(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[1])
                        ).translate[1]
                    )
                ).toBeCloserTo(-10);
                expect(
                    toNumber(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[2])
                        ).translate[0],
                        10
                    )
                ).toBeCloserTo(453);
                expect(
                    toNumber(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[3])
                        ).translate[0],
                        10
                    )
                ).toBeCloserTo(112);
                expect(
                    toNumber(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[4])
                        ).translate[0],
                        10
                    )
                ).toBeCloserTo(254);
                expect(
                    toNumber(
                        getSVGAnimatedTransformList(
                            getCurrentTransform(axisInfoRowElement[5])
                        ).translate[0],
                        10
                    )
                ).toBeCloserTo(396);
            });
        });
    });
});
