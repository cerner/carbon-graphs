"use strict";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import styles from "../../../../main/js/helpers/styles";
import {
    getXAxisWidth,
    getYAxisHeight,
    getXAxisLabelXPosition,
    getYAxisLabelYPosition
} from "../../../../main/js/helpers/axis";
import constants from "../../../../main/js/helpers/constants";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getData,
    valuesDefault
} from "./helpers";

describe("Graph - No Data", () => {
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
    describe("Will be displayed", () => {
        it("If showNoDataText is set to true or undefined", () => {
            graph = new Graph(getAxes(axisDefault));
            const noDataTextElement = fetchElementByClass(
                styles.noDataContainer
            );
            expect(noDataTextElement).not.toBeNull();
        });
        it("If showNoDataText is set to true or undefined and the value of the data is not present", () => {
            const primaryContent = new Line(getData());
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            const noDataTextElement = fetchElementByClass(
                styles.noDataContainer
            );
            expect(noDataTextElement).not.toBeNull();
        });
        it("if data is unloaded and no more data present on the screen to display", () => {
            const primaryContent = new Line(getData(valuesDefault));
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            const noNoDataTextElement = fetchElementByClass(
                styles.noDataContainer
            );
            expect(noNoDataTextElement).toBeNull();
            graph.unloadContent(primaryContent);
            const noDataTextElement = fetchElementByClass(
                styles.noDataContainer
            );
            expect(noDataTextElement).not.toBeNull();
        });
    });
    describe("Will not be displayed", () => {
        it("if showNoDataText is set to false", () => {
            graph = new Graph(
                Object.assign(
                    {
                        showNoDataText: false
                    },
                    getAxes(axisDefault)
                )
            );
            const noDataTextElement = fetchElementByClass(
                styles.noDataContainer
            );
            expect(noDataTextElement).toBeNull();
        });
        it("if loaded data contains value", () => {
            const primaryContent = new Line(getData(valuesDefault));
            graph = new Graph(getAxes(axisDefault));
            graph.loadContent(primaryContent);
            const noDataTextElement = fetchElementByClass(
                styles.noDataContainer
            );
            expect(noDataTextElement).toBeNull();
        });
    });
    describe("On Resize", () => {
        it("No data view aligns correctly", (done) => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph = new Graph(getAxes(axisDefault));
            graph.resize();
            triggerEvent(window, "resize", () => {
                const noDataContainer = fetchElementByClass(
                    styles.noDataOverlay
                );
                expect(toNumber(noDataContainer.getAttribute("height"))).toBe(
                    getYAxisHeight(graph.config) /
                        constants.NO_DATA_VIEW_PROPORTION
                );
                expect(toNumber(noDataContainer.getAttribute("width"))).toBe(
                    getXAxisWidth(graph.config)
                );

                const noDataLabel = fetchElementByClass(styles.noDataLabel);
                expect(toNumber(noDataLabel.getAttribute("x"))).toBe(
                    getXAxisLabelXPosition(graph.config)
                );
                expect(toNumber(noDataLabel.getAttribute("y"))).toBe(
                    getYAxisLabelYPosition(graph.config) +
                        constants.NO_DATA_LABEL_PADDING
                );
                done();
            });
        });
    });
});
