import Carbon from "../../../main/js/carbon";
import Graph from "../../../main/js/controls/Graph";
import Line from "../../../main/js/controls/Line";
import PairedResult from "../../../main/js/controls/PairedResult";
import Shape from "../../../main/js/core/Shape/Shape";
import { SHAPES } from "../../../main/js/helpers/constants";
import { LIBRARY_LIST, nativeInput, TOOLS_LIST } from "./helpers";

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
        expect(Carbon.api.line).toEqual(jasmine.any(Function));
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
        const shape = Carbon.tools.shape(SHAPES.RHOMBUS);
        expect(Carbon.tools.shape).toEqual(jasmine.any(Function));
        expect(shape instanceof Shape).toBeTruthy();
    });
});
