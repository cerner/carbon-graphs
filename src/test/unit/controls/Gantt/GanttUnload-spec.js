"use strict";
import * as d3 from "d3";
import Gantt from "../../../../main/js/controls/Gantt";
import { getXAxisWidth } from "../../../../main/js/controls/Gantt/helpers/creationHelpers";
import Track from "../../../../main/js/controls/Gantt/Track";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { delay, toNumber, TRANSITION_DELAY } from "../../helpers/commonHelpers";
import {
    axisJSON,
    BASE_CANVAS_HEIGHT_PADDING,
    fetchElementByClass,
    getAxes,
    getData,
    trackDimension
} from "./helpers";
describe("Gantt - Unload", () => {
    let gantt = null;
    let ganttChartContainer;
    const primaryContent = getData();
    const secondaryContent = utils.deepClone(getData());
    const tertiaryContent = utils.deepClone(getData());
    secondaryContent.key = "uid_2";
    tertiaryContent.key = "uid_3";
    beforeEach(() => {
        ganttChartContainer = document.createElement("div");
        ganttChartContainer.id = "testCarbonGantt";
        ganttChartContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        ganttChartContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(ganttChartContainer);

        gantt = new Gantt(getAxes(axisJSON));
        gantt.loadContent(primaryContent);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    it("Throws error when unloading a content which is not loaded", () => {
        expect(() => {
            gantt.unloadContent(secondaryContent);
        }).toThrowError(errors.THROW_MSG_INVALID_OBJECT_PROVIDED);
    });
    it("Removes the content successfully", (done) => {
        gantt.unloadContent(primaryContent);
        delay(() => {
            expect(gantt.tracks).toEqual([]);
            expect(gantt.trackConfig).toEqual([]);
            expect(gantt.tracks.length).toBe(0);
            expect(gantt.trackConfig.length).toBe(0);
            expect(gantt.config.height).toBe(0);
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
            expect(gantt.config.canvasHeight).toBe(BASE_CANVAS_HEIGHT_PADDING);
            done();
        }, TRANSITION_DELAY);
    });
    it("Removes multiple content successfully", (done) => {
        gantt.destroy();
        gantt = new Gantt(getAxes(axisJSON));
        const multipleContents = [primaryContent, secondaryContent];
        gantt.loadContent(multipleContents);
        expect(gantt.tracks.length).toBe(2);
        gantt.unloadContent(multipleContents);
        delay(() => {
            expect(gantt.tracks).toEqual([]);
            expect(gantt.trackConfig).toEqual([]);
            expect(gantt.tracks.length).toBe(0);
            expect(gantt.trackConfig.length).toBe(0);
            expect(gantt.config.height).toBe(0);
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
            expect(gantt.config.canvasHeight).toBe(BASE_CANVAS_HEIGHT_PADDING);
            done();
        }, TRANSITION_DELAY);
    });
    it("Removes the grid and track", (done) => {
        gantt.unloadContent(primaryContent);
        delay(() => {
            expect(gantt.tracks).toEqual([]);
            expect(gantt.trackConfig).toEqual([]);
            expect(gantt.scale.y.range()).toEqual([0]);
            done();
        }, TRANSITION_DELAY);
    });
    it("Adjusts the defs height", (done) => {
        gantt.unloadContent(primaryContent);
        delay(() => {
            const defsContainerElement = document.querySelector(
                `clipPath#${gantt.config.clipPathId}`
            );
            expect(+defsContainerElement.getAttribute("height")).toBe(0);
            done();
        }, TRANSITION_DELAY);
    });
    it("Adjusts the content container height", (done) => {
        gantt.unloadContent(primaryContent);
        delay(() => {
            const contentContainerElement = fetchElementByClass(
                styles.contentContainer
            );
            expect(+contentContainerElement.getAttribute("height")).toBe(0);
            done();
        }, TRANSITION_DELAY);
    });
    it("Updates track props", (done) => {
        gantt.unloadContent(primaryContent);
        delay(() => {
            expect(gantt.config.axis.y.trackCount).toBe(0);
            expect(
                gantt.config.axis.y.trackList[primaryContent.key]
            ).toBeUndefined();
            done();
        }, TRANSITION_DELAY);
    });
    it("Unloads content correctly with different heights", () => {
        const primaryContent = getData();
        const secondaryContent = utils.deepClone(getData());
        secondaryContent.key = "uid_2";
        const tertiaryContent = utils.deepClone(getData());
        tertiaryContent.key = "uid_3";

        gantt.destroy();
        gantt = new Gantt(getAxes(axisJSON));
        primaryContent.dimension = trackDimension.dimension;
        secondaryContent.dimension = trackDimension.dimension;
        gantt.loadContent(primaryContent);
        gantt.loadContent(secondaryContent);
        gantt.loadContent(tertiaryContent);
        gantt.unloadContent(secondaryContent);
        expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
        expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
        expect(gantt.trackConfig[2]).toBeUndefined();
        expect(gantt.tracks[0]).toBe(primaryContent.key);
        expect(gantt.tracks[1]).toBe(tertiaryContent.key);
        expect(gantt.tracks[2]).toBeUndefined();
        expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
        expect(gantt.config.axis.y.domain.upperLimit).toBe(2);
        expect(gantt.config.height).toBe(141);
        expect(gantt.config.canvasHeight).toBe(
            141 + BASE_CANVAS_HEIGHT_PADDING
        );
        expect(
            document.querySelector(`[aria-describedby="track 2"]`)
        ).toBeNull();
        expect(
            document.querySelector(`[aria-describedby="track 1"]`)
        ).not.toBeNull();
    });
    it("When custom padding is used", () => {
        gantt.destroy();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        };
        gantt = new Gantt(ganttConfig);
        gantt.loadContent(primaryContent);
        gantt.loadContent(secondaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(gantt.config.axisSizes.y).toEqual(0);
        expect(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        ).toEqual(0);
        const canvas = d3.select(`.${styles.canvas}`);
        expect(gantt.config.height).toEqual(
            toNumber(canvas.attr("height"), 10)
        );
        expect(getXAxisWidth(gantt.config)).toEqual(
            toNumber(canvas.attr("width"), 10)
        );
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        );
        gantt.unloadContent(secondaryContent);
        expect(gantt.config.axisSizes.y).toEqual(0);
        expect(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        ).toEqual(0);
        expect(gantt.config.height).toEqual(
            toNumber(canvas.attr("height"), 10)
        );
        expect(getXAxisWidth(gantt.config)).toEqual(
            toNumber(canvas.attr("width"), 10)
        );
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        );
    });
});
