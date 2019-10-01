"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import PairedResult from "../../../../main/js/controls/PairedResult";
import constants from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault
} from "./helpers";

describe("Paired Result - Unload", () => {
    let graphDefault = null;
    let pairedResultGraphContainer;
    beforeEach(() => {
        pairedResultGraphContainer = document.createElement("div");
        pairedResultGraphContainer.id = "testPairedResult_carbon";
        pairedResultGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(pairedResultGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    it("returns the pairedResult instance", () => {
        const pairedResult = new PairedResult(
            getInput(valuesDefault, false, false)
        );
        graphDefault.loadContent(pairedResult);
        const unloadedPairResult = pairedResult.unload(graphDefault);
        expect(unloadedPairResult instanceof PairedResult);
    });
    it("clears the graph", () => {
        const pairedResult = new PairedResult(
            getInput(valuesDefault, false, false)
        );
        graphDefault.loadContent(pairedResult);
        pairedResult.unload(graphDefault);
        const pairedResultContentContainer = fetchElementByClass(
            pairedResultGraphContainer,
            styles.pairedBoxGroup
        );
        expect(pairedResultContentContainer).toBeNull();
    });
    it("removes the legend from graph", () => {
        const graphLegend = fetchElementByClass(
            pairedResultGraphContainer,
            styles.legend
        );
        const pairedResultLegendItem = fetchElementByClass(
            pairedResultGraphContainer,
            styles.legendItem
        );
        expect(graphLegend).not.toBeNull();
        expect(pairedResultLegendItem).toBeNull();
    });
    it("resets the pairedResult graph instance properties", () => {
        const pairedResult = new PairedResult(
            getInput(valuesDefault, false, false)
        );
        graphDefault.loadContent(pairedResult);
        pairedResult.unload(graphDefault);
        expect(pairedResult.dataTarget).toEqual({});
        expect(pairedResult.config).toEqual({});
    });
    describe("Removes label shape from label container", () => {
        let graph;
        let pairPrimary;
        let pairedSecondary;
        beforeEach(() => {
            graphDefault.destroy();
            graph = new Graph(getAxes(axisDefault));
            pairPrimary = new PairedResult(
                getInput(valuesDefault, true, true, true)
            );
            pairedSecondary = new PairedResult(inputSecondary);
            graph.loadContent(pairPrimary);
            graph.loadContent(pairedSecondary);
        });
        it("Verifies content is present", () => {
            expect(
                graph.axesLabelShapeGroup[constants.Y_AXIS]
            ).not.toBeUndefined();
            expect(
                graph.axesLabelShapeGroup[constants.Y2_AXIS]
            ).not.toBeUndefined();
        });
        it("For Y axis", () => {
            graph.unloadContent(pairedSecondary);
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y axis with multiple data set", () => {
            const pairContent = getInput(valuesDefault, true, true, false);
            pairContent.key = "uid_3";
            graph.loadContent(new PairedResult(pairContent));
            graph.unloadContent(pairedSecondary);
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(3);
            expect(labelShapeContainer.children[0].tagName).toBe("svg");
            expect(labelShapeContainer.children[0].getAttribute("x")).toBe("0");
            expect(
                labelShapeContainer.children[0].getAttribute("aria-describedby")
            ).toContain("uid_3");
        });
        it("For Y2 axis", () => {
            graph.unloadContent(pairPrimary);
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y2 axis with multiple data set", () => {
            const pairContent = getInput(valuesDefault, true, true, true);
            pairContent.key = "uid_4";
            graph.loadContent(new PairedResult(pairContent));
            graph.unloadContent(pairPrimary);
            const labelShapeContainer = fetchElementByClass(
                pairedResultGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(3);
            expect(labelShapeContainer.children[0].tagName).toBe("svg");
            expect(labelShapeContainer.children[0].getAttribute("x")).toBe("0");
            expect(
                labelShapeContainer.children[0].getAttribute("aria-describedby")
            ).toContain("uid_4");
        });
    });
});
