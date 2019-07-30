import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import PairedResult from "../../../../main/js/controls/PairedResult";
import { loadCustomJasmineMatcher } from "../helpers/commonHelpers";
import { getAxes, axisDefault, fetchElementByClass } from "./helpers";
import constants from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import {
    valuesDefault as valuesLineDefault,
    getInput as getLineInput
} from "../Line/helpers";
import {
    valuesDefault as valuesPRDefault,
    getInput as getPRInput
} from "../PairedResult/helpers";

describe("Graph -> Combination", () => {
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

    describe("Regions", () => {
        const regionPR = {
            high: [
                {
                    axis: constants.Y_AXIS,
                    start: 140,
                    end: 220,
                    color: "#c8cacb"
                }
            ],
            low: [
                {
                    axis: constants.Y_AXIS,
                    start: 20,
                    end: 70
                }
            ]
        };
        const regionLine = [
            {
                axis: constants.Y_AXIS,
                start: 5,
                end: 15,
                color: "#f4f4f4"
            }
        ];
        beforeEach(() => {
            graph = new Graph(getAxes(axisDefault));
        });
        it("Render correctly with PR and Line", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            lineData.regions = regionLine;
            prData.regions = regionPR;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new PairedResult(prData));
            graph.loadContent(new Line(lineData));

            const regionGroupElement = fetchElementByClass(styles.regionGroup);
            expect(regionGroupElement).not.toBeNull();
            expect(regionGroupElement.childElementCount).toBe(2);
            expect(regionGroupElement.firstChild).not.toBeNull();
            expect(regionGroupElement.firstChild.childElementCount).toBe(2);
            expect(regionGroupElement.firstChild.getAttribute("class")).toBe(
                styles.regionPairGroup
            );
            expect(
                regionGroupElement.firstChild.getAttribute("aria-describedby")
            ).toBe(`region_${prData.key}`);
            expect(regionGroupElement.childNodes[1].nodeName).toBe("rect");
            expect(
                regionGroupElement.childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${lineData.key}`);
        });
        it("Render correctly with Line and PR", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            lineData.regions = regionLine;
            prData.regions = regionPR;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new Line(lineData));
            graph.loadContent(new PairedResult(prData));

            const regionGroupElement = fetchElementByClass(styles.regionGroup);
            expect(regionGroupElement).not.toBeNull();
            expect(regionGroupElement.childElementCount).toBe(2);
            expect(regionGroupElement.childNodes[1]).not.toBeNull();
            expect(regionGroupElement.childNodes[1].childElementCount).toBe(2);
            expect(regionGroupElement.childNodes[1].getAttribute("class")).toBe(
                styles.regionPairGroup
            );
            expect(
                regionGroupElement.childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${prData.key}`);
            expect(regionGroupElement.childNodes[0].nodeName).toBe("rect");
            expect(
                regionGroupElement.childNodes[0].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${lineData.key}`);
        });
    });
});
