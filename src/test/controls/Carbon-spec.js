import Carbon from "../../main/js/controls";
import Line from "../../main/js/controls/Line";
import PairedResult from "../../main/js/controls/PairedResult";
import Graph from "../../main/js/core/Graph";

const LIBRARY_LIST = [
    "graph",
    "line",
    "pairedResult"
];
const input = {
    bindTo: "#testGraph_carbon",
    axis: {
        x: {
            label: "Some X Label",
            lowerLimit: 0,
            upperLimit: 100
        },
        y: {
            label: "Some Y Label",
            lowerLimit: 0,
            upperLimit: 20
        }
    }
};
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
        const keys = Object.keys(Carbon);
        expect(keys).toBeDefined();
        expect(keys.every((i) => LIBRARY_LIST.indexOf(i) > -1)).toBeTruthy();
        expect(keys.length).toBe(LIBRARY_LIST.length);
    });
    it("registers graph", () => {
        const graph = Carbon.graph(input);
        expect(Carbon.line).toEqual(jasmine.any(Function));
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
        const line = Carbon.line(data);
        expect(Carbon.line).toEqual(jasmine.any(Function));
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
        const paired = Carbon.pairedResult(data);
        expect(Carbon.pairedResult).toEqual(jasmine.any(Function));
        expect(paired instanceof PairedResult).toBeTruthy();
    });
});
