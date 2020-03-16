"use strict";
import * as d3 from "d3";
import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import { getYAxisHeight } from "../../../../main/js/helpers/axis";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import { axisDefault, getAxes, getData, valuesDefault } from "./helpers";

describe("Graph - Unload", () => {
    let graph = null;
    let graphContainer;
    let primaryContent;
    let secondaryContent;
    const primaryInput = getData(valuesDefault);
    const secondaryInput = getData(valuesDefault);

    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        graphContainer = document.createElement("div");
        graphContainer.id = "testGraph_carbon";
        graphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        graphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(graphContainer);

        primaryContent = new Line(primaryInput);
        secondaryContent = new Line(secondaryInput);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("Throws error when unloading a content which is not loaded", () => {
        secondaryInput.key = "uid_2";
        secondaryContent = new Line(secondaryInput);
        graph = new Graph(getAxes(axisDefault));
        graph.loadContent(primaryContent);
        expect(() => {
            graph.unloadContent(secondaryContent);
        }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
    });
    it("Removes the content successfully", () => {
        graph = new Graph(getAxes(axisDefault));
        graph.loadContent(primaryContent);
        graph.unloadContent(primaryContent);
        expect(graph.contentKeys).toEqual([]);
        expect(graph.content).toEqual([]);
        expect(graph.contentConfig).toEqual([]);
        expect(graph.content.length).toBe(0);
        expect(graph.contentConfig.length).toBe(0);
    });
    it("Removes the content successfully when key and label are provided", () => {
        graph = new Graph(getAxes(axisDefault));
        graph.loadContent(primaryContent);
        graph.unloadContent({
            key: primaryInput.key,
            label: primaryInput.label
        });
        expect(graph.contentKeys).toEqual([]);
        expect(graph.content).toEqual([]);
        expect(graph.contentConfig).toEqual([]);
        expect(graph.content.length).toBe(0);
        expect(graph.contentConfig.length).toBe(0);
    });
    describe("When custom padding is used", () => {
        beforeEach(() => {
            const graphConfig = utils.deepClone(getAxes(axisDefault));
            graphConfig.padding = {
                top: -17,
                left: -17,
                right: 0,
                bottom: 0
            };
            graph = new Graph(graphConfig);
            const data = utils.deepClone(getData(valuesDefault));
            const primaryContent = new Line(data);
            graph.loadContent(primaryContent);
            graph.unloadContent(primaryContent);
        });
        it("Renders correctly after content is removed", () => {
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toBeCloserTo(-16);
            expect(toNumber(contentContainer.attr("y"), 10)).toBeCloserTo(0);
            expect(
                toNumber(
                    graph.config.axisSizes.y + graph.config.axisLabelWidths.y,
                    10
                )
            ).toBeCloserTo(-16);
            expect(getYAxisHeight(graph.config)).toBeCloserTo(267);
        });
        it("Renders correctly on another resize", (done) => {
            graphContainer.setAttribute("style", "width: 800px; height: 200px");
            graph.resize();
            triggerEvent(window, "resize", () => {
                const contentContainer = d3.select(
                    `.${styles.contentContainer}`
                );
                expect(
                    toNumber(contentContainer.attr("width"), 10)
                ).toBeLessThan(1024);
                expect(
                    toNumber(contentContainer.attr("height"), 10)
                ).toBeLessThan(400);
                done();
            });
        });
    });
});
