"use strict";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import styles from "../../../../main/js/helpers/styles";
import constants from "../../../../main/js/helpers/constants";
import { loadCustomJasmineMatcher } from "../../helpers/commonHelpers";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    valuesDefault
} from "./helpers";

describe("When graph is unloaded off input", () => {
    let graphDefault = null;
    let barGraphContainer;
    let bar;
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
        graphDefault.destroy();
        document.body.innerHTML = "";
    });
    beforeEach(() => {
        bar = new Bar(getInput(valuesDefault, false, false));
        graphDefault.loadContent(bar);
    });
    afterEach(() => {
        graphDefault.destroy();
    });
    it("returns the bar instance", () => {
        const unloadedBar = bar.unload(graphDefault);
        expect(unloadedBar instanceof Bar);
    });
    it("clears the graph", () => {
        graphDefault.unloadContent(bar);
        const barContentContainer = fetchElementByClass(
            barGraphContainer,
            styles.barGraphContent
        );
        expect(barContentContainer).toBeNull();
    });
    it("removes the legend from graph", () => {
        graphDefault.unloadContent(bar);
        const graphLegend = fetchElementByClass(
            barGraphContainer,
            styles.legend
        );
        const barLegendItem = fetchElementByClass(
            barGraphContainer,
            styles.legendItem
        );
        expect(graphLegend).not.toBeNull();
        expect(barLegendItem).toBeNull();
    });
    it("resets the bar graph instance properties", () => {
        graphDefault.unloadContent(bar);
        expect(bar.dataTarget).toEqual({});
        expect(bar.config).toEqual({});
    });
    describe("Removes label shape from label container", () => {
        let graph;
        let barPrimary;
        let barSecondary;
        beforeEach(() => {
            graphDefault.destroy();
            graph = new Graph(getAxes(axisDefault));
            barPrimary = new Bar(getInput(valuesDefault, true, true, true));
            barSecondary = new Bar(
                getInput(valuesDefault, true, true, false, "uid_2")
            );
            graph.loadContent(barPrimary);
            graph.loadContent(barSecondary);
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
            graph.unloadContent(barSecondary);
            const labelShapeContainer = fetchElementByClass(
                barGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y axis with multiple data set", () => {
            graph.loadContent(
                new Bar(getInput(valuesDefault, true, true, false, "uid_3"))
            );
            graph.unloadContent(barSecondary);
            const labelShapeContainer = fetchElementByClass(
                barGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(1);
            expect(labelShapeContainer.children[0].tagName).toBe("svg");
            expect(labelShapeContainer.children[0].getAttribute("x")).toBe("0");
            expect(
                labelShapeContainer.children[0].getAttribute("aria-describedby")
            ).toBe("uid_3");
        });
        it("For Y2 axis", () => {
            graph.unloadContent(barPrimary);
            const labelShapeContainer = fetchElementByClass(
                barGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y2 axis with multiple data set", () => {
            graph.loadContent(
                new Bar(getInput(valuesDefault, true, true, true, "uid_4"))
            );
            graph.unloadContent(barPrimary);
            const labelShapeContainer = fetchElementByClass(
                barGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(1);
            expect(labelShapeContainer.children[0].tagName).toBe("svg");
            expect(labelShapeContainer.children[0].getAttribute("x")).toBe("0");
            expect(
                labelShapeContainer.children[0].getAttribute("aria-describedby")
            ).toBe("uid_4");
        });
    });
});
