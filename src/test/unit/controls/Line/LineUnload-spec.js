"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Line from "../../../../main/js/controls/Line";
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

describe("Line - Unload", () => {
    let graphDefault = null;
    let lineGraphContainer;
    beforeEach(() => {
        lineGraphContainer = document.createElement("div");
        lineGraphContainer.id = "testLine_carbon";
        lineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(lineGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("returns the line instance", () => {
        const line = new Line(getInput(valuesDefault, false, false));
        graphDefault.loadContent(line);
        const unloadedLine = line.unload(graphDefault);
        expect(unloadedLine instanceof Line);
    });
    it("clears the graph", () => {
        const line = new Line(getInput(valuesDefault, false, false));
        graphDefault.loadContent(line);
        line.unload(graphDefault);
        const lineContentContainer = fetchElementByClass(
            lineGraphContainer,
            styles.lineGraphContent
        );
        expect(lineContentContainer).toBeNull();
    });
    it("removes the legend from graph", () => {
        const graphLegend = fetchElementByClass(
            lineGraphContainer,
            styles.legend
        );
        const lineLegendItem = fetchElementByClass(
            lineGraphContainer,
            styles.legendItem
        );
        expect(graphLegend).not.toBeNull();
        expect(lineLegendItem).toBeNull();
    });
    it("resets the line graph instance properties", () => {
        const line = new Line(getInput(valuesDefault, false, false));
        graphDefault.loadContent(line);
        line.unload(graphDefault);
        expect(line.dataTarget).toEqual({});
        expect(line.config).toEqual({});
    });
    describe("Removes label shape from label container", () => {
        let graph;
        let linePrimary;
        let lineSecondary;
        beforeEach(() => {
            graphDefault.destroy();
            graph = new Graph(getAxes(axisDefault));
            linePrimary = new Line(getInput(valuesDefault, true, true, true));
            lineSecondary = new Line(inputSecondary);
            graph.loadContent(linePrimary);
            graph.loadContent(lineSecondary);
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
            graph.unloadContent(lineSecondary);
            const labelShapeContainer = fetchElementByClass(
                lineGraphContainer,
                styles.axisLabelYShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y axis with multiple data set", () => {
            graph.loadContent(
                new Line({
                    key: `uid_3`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                })
            );
            graph.unloadContent(lineSecondary);
            const labelShapeContainer = fetchElementByClass(
                lineGraphContainer,
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
            graph.unloadContent(linePrimary);
            const labelShapeContainer = fetchElementByClass(
                lineGraphContainer,
                styles.axisLabelY2ShapeContainer
            );
            expect(labelShapeContainer.children.length).toBe(0);
        });
        it("For Y2 axis with multiple data set", () => {
            graph.loadContent(
                new Line({
                    key: `uid_4`,
                    label: {
                        display: "Data Label C"
                    },
                    yAxis: "y2",
                    values: valuesDefault
                })
            );
            graph.unloadContent(linePrimary);
            const labelShapeContainer = fetchElementByClass(
                lineGraphContainer,
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
