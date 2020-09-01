"use strict";
import Timeline from "../../../../main/js/controls/Timeline";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    valuesJSON,
    fetchAllElementsByClass
} from "./helpers";
import {
    getSVGAnimatedTransformList,
    getCurrentTransform
} from "../../../../main/js/helpers/transformUtils";

describe("Panning", () => {
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
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("When enabled", () => {
        beforeEach(() => {
            const values = utils.deepClone(valuesJSON);
            const input = getData(values, false, false);
            const axisData = utils.deepClone(getAxes(axisJSON));
            axisData.pan = { enabled: true };
            timeline = new Timeline(axisData);
            timeline.loadContent(input);
        });
        it("Check if clamp is false if pan is enabled", () => {
            expect(timeline.scale.x.clamp()).toEqual(false);
        });
        it("check if data point are getting translated properly", () => {
            const dataPoint = fetchElementByClass(styles.point).firstChild;
            expect(
                getSVGAnimatedTransformList(getCurrentTransform(dataPoint))
                    .translate[0]
            ).not.toBeNull();
            expect(
                getSVGAnimatedTransformList(getCurrentTransform(dataPoint))
                    .translate[1]
            ).not.toBeNull();
        });
        it("Dynamic Data is updated correctly when key matches", () => {
            const panData = {
                key: "uid_1",
                values: [
                    {
                        x: new Date(2018, 2, 1).toISOString(),
                        content: "This is custom value of another unit"
                    }
                ]
            };
            let timelineContent = fetchAllElementsByClass(styles.pointGroup);
            expect(timelineContent.length).toEqual(2);
            timeline.reflow(panData);
            timelineContent = fetchAllElementsByClass(styles.pointGroup);
            expect(timelineContent.length).toEqual(1);
        });
        it("Dynamic Data is not updated when key does not match", () => {
            const panData = {
                key: "uid_2",
                values: [
                    {
                        x: new Date(2018, 2, 1).toISOString(),
                        content: "This is custom value of another unit"
                    }
                ]
            };
            let timelineContent = fetchAllElementsByClass(styles.pointGroup);
            expect(timelineContent.length).toEqual(2);
            timeline.reflow(panData);
            timelineContent = fetchAllElementsByClass(styles.pointGroup);
            expect(timelineContent.length).toEqual(2);
        });
        describe("when there is no data", () => {
            it("should update the dynamic data and disable the legend", () => {
                const panData = {
                    key: "uid_1",
                    values: []
                };
                let timelineContent = fetchAllElementsByClass(styles.pointGroup);
                expect(timelineContent.length).toEqual(2);
                const legendItem = document.body.querySelector(
                    `.${styles.legendItem}`
                );
                timeline.reflow(panData);
                timelineContent = fetchAllElementsByClass(styles.pointGroup);
                expect(timelineContent.length).toEqual(0);
                expect(legendItem.getAttribute("aria-disabled")).toBe("true");
                expect(legendItem.getAttribute("aria-current")).toBe("true");
           });
       });
    });
    describe("When disabled", () => {
        beforeEach(() => {
            const values = utils.deepClone(valuesJSON);
            const input = getData(values, false, false);
            const axisData = utils.deepClone(getAxes(axisJSON));
            axisData.pan = { enabled: false };
            timeline = new Timeline(axisData);
            timeline.loadContent(input);
        });
        it("Check if clamp is true if pan is disabled", () => {
            expect(timeline.scale.x.clamp()).toEqual(true);
        });
        it("check if data point are getting translated properly", () => {
            const dataPoint = fetchElementByClass(styles.point).firstChild;
            expect(
                getSVGAnimatedTransformList(getCurrentTransform(dataPoint))
                    .translate[0]
            ).not.toBeNull();
            expect(
                getSVGAnimatedTransformList(getCurrentTransform(dataPoint))
                    .translate[1]
            ).not.toBeNull();
        });
    });
    describe("When undefined", () => {
        beforeEach(() => {
            const values = utils.deepClone(valuesJSON);
            const input = getData(values, false, false);
            const axisData = utils.deepClone(getAxes(axisJSON));
            timeline = new Timeline(axisData);
            timeline.loadContent(input);
        });
        it("Check if clamp is true if pan is undefined", () => {
            expect(timeline.scale.x.clamp()).toEqual(true);
        });
        it("Check if data point are getting translated properly", () => {
            const dataPoint = fetchElementByClass(styles.point).firstChild;
            expect(
                getSVGAnimatedTransformList(getCurrentTransform(dataPoint))
                    .translate[0]
            ).not.toBeNull();
            expect(
                getSVGAnimatedTransformList(getCurrentTransform(dataPoint))
                    .translate[1]
            ).not.toBeNull();
        });
    });
});
