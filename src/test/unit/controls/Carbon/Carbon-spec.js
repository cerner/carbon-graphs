import Carbon from "../../../../main/js/carbon";
import Bar from "../../../../main/js/controls/Bar";
import Gantt from "../../../../main/js/controls/Gantt";
import Graph from "../../../../main/js/controls/Graph";
import Line from "../../../../main/js/controls/Line";
import PairedResult from "../../../../main/js/controls/PairedResult";
import Pie from "../../../../main/js/controls/Pie";
import Timeline from "../../../../main/js/controls/Timeline";
import Shape from "../../../../main/js/core/Shape/Shape";
import Scatter from "../../../../main/js/controls/Scatter";
import Bubble from "../../../../main/js/controls/Bubble";

import {
    ganttInput,
    LIBRARY_LIST,
    nativeInput,
    pieInput,
    timelineInput,
    TOOLS_LIST
} from "./helpers";

describe("Carbon", () => {
    let graphContainer;
    beforeEach(() => {
        graphContainer = document.createElement("div");
        graphContainer.id = "testGraph_carbon";
        graphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        document.body.appendChild(graphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    it("registers all graph types", () => {
        const keys = Object.keys(Carbon.api);
        expect(keys).toBeDefined();
        expect(keys.every((i) => LIBRARY_LIST.indexOf(i) > -1)).toBeTruthy();
        expect(keys.length).toBe(LIBRARY_LIST.length);
    });
    it("registers all graph tools", () => {
        const keys = Object.keys(Carbon.tools);
        expect(keys).toBeDefined();
        expect(keys.every((i) => TOOLS_LIST.indexOf(i) > -1)).toBeTruthy();
        expect(keys.length).toBe(TOOLS_LIST.length);
    });
    it("registers Graph", () => {
        const graph = Carbon.api.graph(nativeInput);
        expect(Carbon.api.graph).toEqual(jasmine.any(Function));
        expect(graph instanceof Graph).toBeTruthy();
    });
    it("registers Line graph", () => {
        const data = {
            key: "uid_1",
            label: {
                display: "Data Label 1"
            },
            values: [
                {
                    x: 35,
                    y: 4
                }
            ]
        };
        const line = Carbon.api.line(data);
        expect(Carbon.api.line).toEqual(jasmine.any(Function));
        expect(line instanceof Line).toBeTruthy();
    });
    it("registers Paired Result graph", () => {
        const data = {
            key: "uid_1",
            values: [
                {
                    high: {
                        x: 45,
                        y: 350
                    }
                }
            ]
        };
        const paired = Carbon.api.pairedResult(data);
        expect(Carbon.api.pairedResult).toEqual(jasmine.any(Function));
        expect(paired instanceof PairedResult).toBeTruthy();
    });
    it("registers Shape", () => {
        const shape = Carbon.tools.shape(Carbon.helpers.SHAPES.RHOMBUS);
        expect(Carbon.tools.shape).toEqual(jasmine.any(Function));
        expect(shape instanceof Shape).toBeTruthy();
    });
    it("registers Shape - Dark", () => {
        const shape = Carbon.tools.shape(Carbon.helpers.SHAPES.DARK.RHOMBUS);
        expect(Carbon.tools.shape).toEqual(jasmine.any(Function));
        expect(shape instanceof Shape).toBeTruthy();
    });
    it("registers Shape - Light", () => {
        const shape = Carbon.tools.shape(Carbon.helpers.SHAPES.LIGHT.RHOMBUS);
        expect(Carbon.tools.shape).toEqual(jasmine.any(Function));
        expect(shape instanceof Shape).toBeTruthy();
    });
    it("registers defaultSVGProps", () => {
        const _svgProps = Carbon.tools.defaultSVGProps();
        expect(Carbon.tools.defaultSVGProps).toEqual(jasmine.any(Function));
        expect(_svgProps instanceof Object).toBeTruthy();
        expect(_svgProps.svgClassNames).toEqual("");
        expect(_svgProps.svgStyles).toEqual("");
        expect(_svgProps.transformFn).toEqual(jasmine.any(Function));
        expect(_svgProps.onClickFn).toEqual(jasmine.any(Function));
        expect(_svgProps.a11yAttributes).toEqual({});
    });
    it("registers Gantt", () => {
        const gantt = Carbon.api.gantt(ganttInput);
        expect(Carbon.api.gantt).toEqual(jasmine.any(Function));
        expect(gantt instanceof Gantt).toBeTruthy();
    });
    it("registers Timeline", () => {
        const timeline = Carbon.api.timeline(timelineInput);
        expect(Carbon.api.timeline).toEqual(jasmine.any(Function));
        expect(timeline instanceof Timeline).toBeTruthy();
    });
    it("registers Bar", () => {
        const data = {
            key: "uid_1",
            label: {
                display: "Data Label 1"
            },
            values: [
                {
                    x: 35,
                    y: 4
                }
            ]
        };
        const bar = Carbon.api.bar(data);
        expect(Carbon.api.bar).toEqual(jasmine.any(Function));
        expect(bar instanceof Bar).toBeTruthy();
    });
    it("registers Pie", () => {
        const pie = Carbon.api.pie(pieInput);
        expect(Carbon.api.line).toEqual(jasmine.any(Function));
        expect(pie instanceof Pie).toBeTruthy();
    });
    it("registers Scatter", () => {
        const data = {
            key: "uid_1",
            label: {
                display: "Data Label 1"
            },
            values: [
                {
                    x: 35,
                    y: 4
                }
            ]
        };
        const scatter = Carbon.api.scatter(data);
        expect(Carbon.api.scatter).toEqual(jasmine.any(Function));
        expect(scatter instanceof Scatter).toBeTruthy();
    });
    it("register Bubble", () => {
        const data = {
            key: "uid_12",
            label: {
                display: "Data Label 1"
            },
            values: [
                {
                    x: 35,
                    y: 4
                }
            ]
        };

        const bubble = Carbon.api.bubble(data);
        expect(Carbon.api.bubble).toEqual(jasmine.any(Function));
        expect(bubble instanceof Bubble).toBeTruthy();
    });
});
