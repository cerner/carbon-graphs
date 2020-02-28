"use strict";
import * as d3 from "d3";
import Timeline from "../../../../main/js/controls/Timeline";
import { getXAxisYPosition } from "../../../../main/js/controls/Timeline/helpers/creationHelpers";
import { getYAxisHeight } from "../../../../main/js/helpers/axis";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { toNumber } from "../../helpers/commonHelpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    secondaryValuesJSON,
    valuesJSON
} from "./helpers";

describe("Timeline - Unload", () => {
    let input = null;
    let timeline = null;
    let TimelineGraphContainer;
    beforeEach(() => {
        TimelineGraphContainer = document.createElement("div");
        TimelineGraphContainer.id = "testCarbonTimeline";
        TimelineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        TimelineGraphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(TimelineGraphContainer);

        input = getData(valuesJSON, false, false);
        timeline = new Timeline(getAxes(axisJSON));
        timeline.loadContent(input);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("Throws error if invalid key provided", () => {
        expect(() => {
            timeline.unloadContent({
                key: "DUMMY"
            });
        }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
    });
    it("Clears the graph", () => {
        timeline.unloadContent({
            key: input.key,
            label: input.label
        });
        const containerElement = fetchElementByClass(
            styles.timelineGraphContent
        );
        expect(containerElement.children.length).toBe(0);
    });
    it("Removes the legend from graph", () => {
        timeline.unloadContent({
            key: input.key,
            label: input.label
        });
        const graphLegend = fetchElementByClass(styles.legend);
        const lineLegendItem = fetchElementByClass(styles.legendItem);
        expect(graphLegend).not.toBeNull();
        expect(lineLegendItem).toBeNull();
    });
    it("Resets the config", () => {
        timeline.unloadContent({
            key: input.key,
            label: input.label
        });
        expect(timeline.contentConfig.length).toBe(0);
        expect(timeline.content.length).toBe(0);
    });
    it("Removes only the unloaded item from config", () => {
        const secondaryInput = getData(secondaryValuesJSON, false, false);
        secondaryInput.key = "uid_2";
        timeline.loadContent(secondaryInput);
        timeline.unloadContent({
            key: input.key,
            label: input.label
        });
        expect(timeline.contentConfig.length).toBe(1);
        expect(timeline.contentConfig[0].config.key).toBe(secondaryInput.key);
        expect(timeline.content.length).toBe(1);
        expect(timeline.content[0]).toBe(secondaryInput.key);
    });
    it("when custom padding is used", () => {
        timeline.destroy();
        input = getData(valuesJSON);
        const config = getAxes(axisJSON);
        config.padding = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        };
        timeline = new Timeline(config);
        timeline.loadContent(input);
        const secondaryInput = getData(secondaryValuesJSON, false, false);
        secondaryInput.key = "uid_2";
        timeline.loadContent(secondaryInput);
        timeline.unloadContent(secondaryInput);
        const canvas = d3.select(`.${styles.canvas}`);
        const canvasHeight =
            getYAxisHeight(timeline.config) +
            (config.padding.bottom * 2 + config.padding.top) * 2;
        expect(toNumber(canvas.attr("height"), 10)).toEqual(canvasHeight);
        expect(getXAxisYPosition(timeline.config)).toEqual(
            (config.padding.top + config.padding.bottom) * 2
        );
    });
});
