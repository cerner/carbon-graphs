"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Scatter from "../../../../main/js/controls/Scatter";
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

describe("Scatter - Unload", () => {
    let graphDefault = null;
    let scatterGraphContainer;
    beforeEach(() => {
        scatterGraphContainer = document.createElement("div");
        scatterGraphContainer.id = "testScatter_carbon";
        scatterGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(scatterGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("returns the scatter instance", () => {
        const scatter = new Scatter(getInput(valuesDefault, false, false));
        graphDefault.loadContent(scatter);
        const unloadedScatter = scatter.unload(graphDefault);
        expect(unloadedScatter instanceof Scatter);
    });
    it("clears the graph", () => {
        const scatter = new Scatter(getInput(valuesDefault, false, false));
        graphDefault.loadContent(scatter);
        scatter.unload(graphDefault);
        const scatterContentContainer = fetchElementByClass(
            scatterGraphContainer,
            styles.scatterGraphContent
        );
        expect(scatterContentContainer).toBeNull();
    });
    it("removes the legend from graph", () => {
        const graphLegend = fetchElementByClass(
            scatterGraphContainer,
            styles.legend
        );
        const scatterLegendItem = fetchElementByClass(
            scatterGraphContainer,
            styles.legendItem
        );
        expect(graphLegend).not.toBeNull();
        expect(scatterLegendItem).toBeNull();
    });
    it("resets the scatter graph instance properties", () => {
        const scatter = new Scatter(getInput(valuesDefault, false, false));
        graphDefault.loadContent(scatter);
        scatter.unload(graphDefault);
        expect(scatter.dataTarget).toEqual({});
        expect(scatter.config).toEqual({});
    });
    describe("Removes label shape from label container", () => {
        let graph;
        let scatterPrimary;
        let scatterSecondary;
        beforeEach(() => {
            graphDefault.destroy();
            graph = new Graph(getAxes(axisDefault));
            scatterPrimary = new Scatter(
                getInput(valuesDefault, true, true, true)
            );
            scatterSecondary = new Scatter(inputSecondary);
            graph.loadContent(scatterPrimary);
            graph.loadContent(scatterSecondary);
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
            graph.unloadContent(scatterSecondary);
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y axis with multiple data set", () => {
            graph.loadContent(
                new Scatter({
                    key: `uid_3`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                })
            );
            graph.unloadContent(scatterSecondary);
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
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
            graph.unloadContent(scatterPrimary);
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y2 axis with multiple data set", () => {
            graph.loadContent(
                new Scatter({
                    key: `uid_4`,
                    label: {
                        display: "Data Label C"
                    },
                    yAxis: "y2",
                    values: valuesDefault
                })
            );
            graph.unloadContent(scatterPrimary);
            const labelShapeContainer = fetchElementByClass(
                scatterGraphContainer,
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
