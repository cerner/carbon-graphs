import Graph from "../../../../main/js/controls/Graph/index";
import Line from "../../../../main/js/controls/Line/Line";
import PairedResult from "../../../../main/js/controls/PairedResult";
import { loadCustomJasmineMatcher } from "../../helpers/commonHelpers";
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
        const regionPRMissing = {
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
                    start: 140,
                    end: 220
                }
            ]
        };
        const regionPRSame = {
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
                    start: 140,
                    end: 220
                }
            ],
            mid: [
                {
                    axis: constants.Y_AXIS,
                    start: 140,
                    end: 220
                }
            ]
        };
        const regionLineSame = [
            {
                axis: constants.Y_AXIS,
                start: 140,
                end: 220,
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
        it("Hides Regions since regions are not equal", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            lineData.regions = regionLine;
            prData.regions = regionPR;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new Line(lineData));
            graph.loadContent(new PairedResult(prData));

            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(3);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
        });
        it("Hide regions since region for mid is missing as value for mid is there but no region", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            lineData.regions = regionLineSame;
            prData.regions = regionPRMissing;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new Line(lineData));
            graph.loadContent(new PairedResult(prData));

            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(3);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
        });
        it("Show regions if are regions are equal and no region is missing", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            lineData.regions = regionLineSame;
            prData.regions = regionPRSame;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new Line(lineData));
            graph.loadContent(new PairedResult(prData));

            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(4);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("false");
            });
        });
        it("Hide regions if region for line is not given", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            prData.regions = regionPRSame;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new Line(lineData));
            graph.loadContent(new PairedResult(prData));

            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(3);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
        });
        it("Hide regions if region for PR is not given", () => {
            const lineData = getLineInput(valuesLineDefault, false, false);
            const prData = getPRInput(valuesPRDefault, false, false);
            lineData.regions = regionLineSame;
            lineData.key = "uid_1";
            prData.key = "uid_2";
            graph.loadContent(new Line(lineData));
            graph.loadContent(new PairedResult(prData));

            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(1);
            expect(regionsElement[0].getAttribute("aria-hidden")).toBe("true");
        });
    });
});
