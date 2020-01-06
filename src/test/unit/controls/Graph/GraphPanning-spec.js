"use strict";
import * as d3 from "d3";
import Graph from "../../../../main/js/controls/Graph/index";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import {
    loadCustomJasmineMatcher,
    PADDING_BOTTOM,
    toNumber,
    delay
} from "../../helpers/commonHelpers";
import {
    fetchElementByClass,
    axisTimeseriesWithDateline,
    axisDefaultWithPanning,
    axisDefaultWithoutPanning
} from "./helpers";

describe("Graph - Panning", () => {
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

    describe("When enabled", () => {
        beforeEach(() => {
            graph = new Graph(axisDefaultWithPanning);
        });
        it("Check if clamp is false if pan is enabled", () => {
            expect(graph.scale.x.clamp()).toEqual(false);
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
                graph.config.height + Math.floor(datelineIndicatorHeight / 2);
            expect(
                defsElement.lastChild.firstChild.getAttribute("height")
            ).toBe(datelineDefsHeight.toString());
        });
        it("DatelineGroup translates properly when panning is enabled", (done) => {
            const datelineGroup = fetchElementByClass(styles.datelineGroup);
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
    describe("When disabled", () => {
        beforeEach(() => {
            graph = new Graph(axisDefaultWithoutPanning);
        });
        it("Check if clamp is true if pan is disabled", () => {
            expect(graph.scale.x.clamp()).toEqual(true);
        });
        it("Check if different clipPath for dateline is not created", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.childElementCount).toBe(1);
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.lastChild.nodeName).toBe("clipPath");
            expect(defsElement.lastChild.firstChild.nodeName).toBe("rect");
        });
        it("Dateline group translates properly when pan is disabled", (done) => {
            const datelineGroup = fetchElementByClass(styles.datelineGroup);
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
    describe("When undefined", () => {
        beforeEach(() => {
            graph = new Graph(axisTimeseriesWithDateline);
        });
        it("Check if clamp is true if pan is undefined", () => {
            expect(graph.scale.x.clamp()).toEqual(true);
        });
        it("Check if different clipPath for dateline is not created", () => {
            const defsElement = fetchElementByClass(styles.canvas).firstChild;
            expect(defsElement.childElementCount).toBe(1);
            expect(defsElement.nodeName).toBe("defs");
            expect(defsElement.lastChild.nodeName).toBe("clipPath");
            expect(defsElement.lastChild.firstChild.nodeName).toBe("rect");
        });
        it("Dateline group translates properly when pan is undefined", (done) => {
            const datelineGroup = fetchElementByClass(styles.datelineGroup);
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(72);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
});
