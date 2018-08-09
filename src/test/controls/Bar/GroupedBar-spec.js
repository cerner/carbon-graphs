"use strict";
import Bar from "../../../main/js/controls/Bar/Bar";
import Graph from "../../../main/js/controls/Graph/Graph";
import styles from "../../../main/js/helpers/styles";
import utils from "../../../main/js/helpers/utils";
import {
    axisDefault,
    fetchAllElementsByClass,
    getAxes,
    getInput,
    valuesDefault,
    valuesNegativeDefault
} from "./helpers";

describe("Grouped Bar", () => {
    let graphDefault = null;
    let barGraphContainer;
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
            const yInput2 = Number(barsContainer[0].getAttribute("y"));
            graphDefault.resize();
            barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            const heightInput1 = Number(
                barsContainer[0].getAttribute("height")
            );
            // y Range of first input should be equal to yRange of second input (because both have same y values)
            expect(Number(barsContainer[3].getAttribute("y"))).toBe(yInput2);
            //x range of both inputs should not be equal
            expect(Number(barsContainer[0].getAttribute("x"))).not.toEqual(
                Number(barsContainer[3].getAttribute("x"))
            );
            expect(Number(barsContainer[0].getAttribute("height"))).toBe(
                heightInput1
            );
            expect(Number(barsContainer[0].getAttribute("width"))).toEqual(
                Number(barsContainer[3].getAttribute("width"))
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
            const yInput2 = Number(barsContainer[0].getAttribute("y"));
            graphDefault.resize();
            barsContainer = fetchAllElementsByClass(
                barGraphContainer,
                styles.taskBar
            );
            const heightInput1 = Number(
                barsContainer[0].getAttribute("height")
            );
            // y Range of first input should be equal to yRange of second input (because both have same y values)
            expect(Number(barsContainer[3].getAttribute("y"))).toBe(yInput2);
            //x range of both inputs should not be equal
            expect(Number(barsContainer[0].getAttribute("x"))).not.toEqual(
                Number(barsContainer[3].getAttribute("x"))
            );
            expect(Number(barsContainer[0].getAttribute("height"))).toBe(
                heightInput1
            );
            expect(Number(barsContainer[0].getAttribute("width"))).toEqual(
                Number(barsContainer[3].getAttribute("width"))
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
});
