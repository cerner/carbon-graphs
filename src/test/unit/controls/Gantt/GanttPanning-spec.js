"use strict";
import * as d3 from "d3";
import Gantt from "../../../../main/js/controls/Gantt";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    datelineAlt,
    datelineJSON
} from "./helpers";
import utils from "../../../../main/js/helpers/utils";
import { delay, toNumber, PADDING_BOTTOM } from "../../helpers/commonHelpers";

describe("Panning", () => {
    let gantt = null;
    let ganttChartContainer;
    beforeEach(() => {
        ganttChartContainer = document.createElement("div");
        ganttChartContainer.id = "testCarbonGantt";
        ganttChartContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        ganttChartContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(ganttChartContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("When enabled", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisJSON));
            axisData.dateline = datelineJSON;
            axisData.pan = { enabled: true };
            gantt = new Gantt(axisData);
        });
        it("Check if clamp is false if pan is enabled", () => {
            expect(gantt.scale.x.clamp()).toEqual(false);
        });
        it("Check if different clipPath for dateline is created", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.childElementCount).toBe(2);
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.lastChild.nodeName).toBe("clipPath");
            expect(defsElement.lastChild.firstChild.nodeName).toBe("rect");
            expect(defsElement.lastChild.id).toContain(`-dateline-clip`);
        });
        it("Check the height for dateline defs is proper", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            const shapeHeightArr = [];
            d3.selectAll(`.${styles.datelinePoint}`).each(function() {
                const shapeHeight = this.getBBox().height;
                shapeHeightArr.push(shapeHeight);
            });
            const datelineIndicatorHeight = Math.max(...shapeHeightArr);
            const datelineDefsHeight =
                gantt.config.height + Math.floor(datelineIndicatorHeight / 2);
            expect(
                defsElement.lastChild.firstChild.getAttribute("height")
            ).toBe(datelineDefsHeight.toString());
        });
        it("Dateline group translates properly when pan is enabled", (done) => {
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(d3.select(datelineGroupElement).datum().value).toBe(
                datelineAlt.value
            );
            expect(datelineGroupElement.getAttribute("aria-selected")).toBe(
                "false"
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroupElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloseTo(106);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
    describe("When disabled", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisJSON));
            axisData.dateline = datelineJSON;
            axisData.pan = { enabled: false };
            gantt = new Gantt(axisData);
        });
        it("Check if clamp is false if pan is enabled", () => {
            expect(gantt.scale.x.clamp()).toEqual(true);
        });
        it("Check if different clipPath for dateline is not created", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.childElementCount).toBe(1);
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.lastChild.nodeName).toBe("clipPath");
            expect(defsElement.lastChild.firstChild.nodeName).toBe("rect");
        });
        it("Dateline group translates properly when panning is disabled", (done) => {
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(d3.select(datelineGroupElement).datum().value).toBe(
                datelineAlt.value
            );
            expect(datelineGroupElement.getAttribute("aria-selected")).toBe(
                "false"
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroupElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloseTo(106);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
    describe("When undefined", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisJSON));
            axisData.dateline = datelineJSON;
            gantt = new Gantt(axisData);
        });
        it("Check if clamp is false if pan is undefined", () => {
            expect(gantt.scale.x.clamp()).toEqual(true);
        });
        it("Check if different clipPath for dateline is not created", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.childElementCount).toBe(1);
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.lastChild.nodeName).toBe("clipPath");
            expect(defsElement.lastChild.firstChild.nodeName).toBe("rect");
        });
        it("Dateline group translates properly when panning is undefined", (done) => {
            const datelineGroupElement = fetchElementByClass(
                styles.datelineGroup
            );
            expect(d3.select(datelineGroupElement).datum().value).toBe(
                datelineAlt.value
            );
            expect(datelineGroupElement.getAttribute("aria-selected")).toBe(
                "false"
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroupElement.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloseTo(106);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
});
