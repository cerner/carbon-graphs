"use strict";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { COLORS } from "../../../../main/js/helpers/constants";
import {
    axisDefault,
    fetchAllElementsByClass,
    getAxes,
    getInput,
    valuesDefault
} from "./helpers";

describe("Bar Styles", () => {
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
    describe("Hashed Bar", () => {
        describe("when graph is loaded with input", () => {
            let bar1;
            beforeEach(() => {
                const input = utils.deepClone(
                    getInput(valuesDefault, false, false, false, "uid_2")
                );
                input.style = {
                    isHashed: true
                };
                bar1 = new Bar(input);
                const graph = graphDefault.loadContent(bar1);
                bar1.redraw(graph);
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Hashed bars are loaded", () => {
                const barContentContainer = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBar
                );
                expect(barContentContainer).not.toBeNull();
                expect(barContentContainer[0].nodeName).toBe("rect");
                expect(barContentContainer[0].getAttribute("style")).toContain(
                    `fill: ${COLORS.GREEN};`
                );

                expect(barContentContainer[1].nodeName).toBe("rect");
                expect(barContentContainer[1].getAttribute("style")).toContain(
                    "url"
                );
            });

            it("when graph is unloaded off input, unloads hashed bars", () => {
                graphDefault.unloadContent(bar1);
                const barsContainer = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBar
                );
                expect(barsContainer.length).toEqual(0);
            });
        });
    });
    describe("Hollow Bar", () => {
        describe("when graph is loaded with input", () => {
            let bar1;
            beforeEach(() => {
                const input = utils.deepClone(
                    getInput(valuesDefault, false, false, false, "uid_2")
                );
                input.style = {
                    isHollow: true
                };
                bar1 = new Bar(input);
                const graph = graphDefault.loadContent(bar1);
                bar1.redraw(graph);
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Hollow bars are loaded", () => {
                const barContentContainer = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBar
                );
                expect(barContentContainer).not.toBeNull();
                expect(barContentContainer[0].nodeName).toBe("rect");
                expect(barContentContainer[0].getAttribute("style")).toContain(
                    "fill: #ffffff;"
                );
            });

            it("when graph is unloaded off input, unloads hollow bars", () => {
                graphDefault.unloadContent(bar1);
                const barsContainer = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBar
                );
                expect(barsContainer.length).toEqual(0);
            });
        });
    });
    describe("Dotted Hollow Bar", () => {
        describe("when graph is loaded with input", () => {
            let bar1;
            beforeEach(() => {
                const input = utils.deepClone(
                    getInput(valuesDefault, false, false, false, "uid_2")
                );
                input.style = {
                    isHollow: true,
                    isDotted: true
                };
                bar1 = new Bar(input);
                const graph = graphDefault.loadContent(bar1);
                bar1.redraw(graph);
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Dotted bars are loaded", () => {
                const barContentContainer = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBar
                );
                expect(barContentContainer).not.toBeNull();
                expect(barContentContainer[0].nodeName).toBe("rect");
                expect(barContentContainer[0].getAttribute("style")).toContain(
                    "stroke-dasharray: 2, 2; fill: #ffffff;"
                );
            });

            it("when graph is unloaded off input, unloads dotted bars", () => {
                graphDefault.unloadContent(bar1);
                const barsContainer = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.taskBar
                );
                expect(barsContainer.length).toEqual(0);
            });
        });
    });
});
