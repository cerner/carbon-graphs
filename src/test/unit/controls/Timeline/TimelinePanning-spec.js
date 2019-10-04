"use strict";
import Timeline from "../../../../main/js/controls/Timeline";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    valuesJSON
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
