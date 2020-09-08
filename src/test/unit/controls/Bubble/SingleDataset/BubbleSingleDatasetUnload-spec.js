"use strict";
import Graph from "../../../../../main/js/controls/Graph/Graph";
import { BubbleSingleDataset } from "../../../../../main/js/controls/Bubble";
import constants from "../../../../../main/js/helpers/constants";
import styles from "../../../../../main/js/helpers/styles";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault
} from "../helpers";

describe("Bubble Single Dataset- Unload", () => {
    let graphDefault = null;
    let bubbleGraphContainer;
    let consolewarn;

    beforeAll(() => {
        // to supress warnings
        consolewarn = console.warn;
        console.warn = () => {};
    });
    afterAll(() => {
        console.warn = consolewarn;
    });

    beforeEach(() => {
        bubbleGraphContainer = document.createElement("div");
        bubbleGraphContainer.id = "testBubble_carbon";
        bubbleGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(bubbleGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("returns the bubble instance", () => {
        const bubble = new BubbleSingleDataset(
            getInput(valuesDefault, false, false)
        );
        graphDefault.loadContent(bubble);
        const unloadedBubble = bubble.unload(graphDefault);
        expect(unloadedBubble instanceof BubbleSingleDataset);
    });
    it("clears the graph", () => {
        const bubble = new BubbleSingleDataset(getInput(valuesDefault, false));
        graphDefault.loadContent(bubble);
        bubble.unload(graphDefault);
        const bubbleContentContainer = fetchElementByClass(
            bubbleGraphContainer,
            styles.bubbleGraphContent
        );
        expect(bubbleContentContainer).toBeNull();
    });
    it("removes the legend from graph", () => {
        const graphLegend = fetchElementByClass(
            bubbleGraphContainer,
            styles.legend
        );
        const bubbleLegendItem = fetchElementByClass(
            bubbleGraphContainer,
            styles.legendItem
        );
        expect(graphLegend).not.toBeNull();
        expect(bubbleLegendItem).toBeNull();
    });
    it("resets the bubble graph instance properties", () => {
        const bubble = new BubbleSingleDataset(
            getInput(valuesDefault, false, false)
        );
        graphDefault.loadContent(bubble);
        bubble.unload(graphDefault);
        expect(bubble.dataTarget).toEqual({});
        expect(bubble.config).toEqual({});
    });
    describe("Removes label shape from label container", () => {
        let graph;
        let bubblePrimary;
        let bubbleSecondary;
        beforeEach(() => {
            graphDefault.destroy();
            graph = new Graph(getAxes(axisDefault));
            bubblePrimary = new BubbleSingleDataset(
                getInput(valuesDefault, true, true, true)
            );
            bubbleSecondary = new BubbleSingleDataset(inputSecondary);
            graph.loadContent(bubblePrimary);
            graph.loadContent(bubbleSecondary);
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
            graph.unloadContent(bubbleSecondary);
            const labelShapeContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y2 axis", () => {
            graph.unloadContent(bubblePrimary);
            const labelShapeContainer = fetchElementByClass(
                bubbleGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
    });
});
