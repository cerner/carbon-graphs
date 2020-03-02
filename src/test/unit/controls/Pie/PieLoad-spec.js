"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Carbon from "../../../../main/js/carbon";
import Pie from "../../../../main/js/controls/Pie";
import { getSlicePercentage } from "../../../../main/js/controls/Pie/helpers/translateHelpers";
import constants from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    dataPrimary,
    dataSecondary,
    dataTertiary,
    fetchElementByClass,
    inputDefault
} from "./helpers";

describe("Pie - Load", () => {
    let pieInstance;
    let loadedPieInstance;
    let input;
    let graphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        graphContainer = document.createElement("div");
        graphContainer.id = "testPie_carbon";
        graphContainer.setAttribute("style", "width: 1024px; height: 400px;");
        graphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(graphContainer);

        loadedPieInstance = null;
        input = inputDefault(graphContainer.id);
        pieInstance = new Pie(input);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("Throws error", () => {
        it("When no content is loaded", () => {
            expect(() => {
                pieInstance.loadContent({});
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("When content is null", () => {
            expect(() => {
                pieInstance.loadContent(null);
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("When no key is provided", () => {
            expect(() => {
                pieInstance.loadContent({
                    label: { display: "Orange" },
                    color: Carbon.helpers.COLORS.GREEN,
                    value: 50
                });
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("When no label is provided", () => {
            expect(() => {
                pieInstance.loadContent({
                    key: "uid_2",
                    color: Carbon.helpers.COLORS.GREEN,
                    values: [50, 25]
                });
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
        });
        it("When no label display is provided", () => {
            expect(() => {
                pieInstance.loadContent({
                    label: {},
                    key: "uid_2",
                    color: Carbon.helpers.COLORS.GREEN,
                    values: [50, 25]
                });
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
        });
        it("When no values are provided", () => {
            expect(() => {
                pieInstance.loadContent({
                    key: "uid_2",
                    label: { display: "Orange" },
                    color: Carbon.helpers.COLORS.GREEN
                });
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("When key is not unique", () => {
            expect(() => {
                pieInstance.loadContent({
                    key: "uid_1",
                    label: { display: "Orange" },
                    color: Carbon.helpers.COLORS.GREEN,
                    value: 50
                });
                pieInstance.loadContent({
                    key: "uid_1",
                    label: { display: "Orange" },
                    color: Carbon.helpers.COLORS.GREEN,
                    value: 50
                });
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
    });
    it("Returns the instance", () => {
        loadedPieInstance = pieInstance.loadContent(dataSecondary);
        expect(loadedPieInstance instanceof Pie).toBeTruthy();
    });
    it("Processes content data correctly", () => {
        pieInstance.loadContent(dataPrimary);
        expect(pieInstance.content[0]).toEqual(dataPrimary.key);
        expect(pieInstance.contentConfig[0].config.onClick).toEqual(
            dataPrimary.onClick
        );
        expect(pieInstance.contentConfig[0].config.color).toEqual(
            dataPrimary.color
        );
        expect(pieInstance.contentConfig[0].config.shape).toEqual(
            dataPrimary.shape
        );
        expect(pieInstance.contentConfig[0].config.label).toEqual(
            dataPrimary.label
        );
        expect(pieInstance.contentConfig[0].config.key).toEqual(
            dataPrimary.key
        );
    });
    it("Processes content data correctly with multiple content", () => {
        const _input = [dataPrimary, dataSecondary];
        pieInstance.loadContent(_input);
        pieInstance.content.forEach((c, i) => {
            expect(c).toEqual(_input[i].key);
        });
        pieInstance.contentConfig.forEach((c, i) => {
            expect(c.config.onClick).toEqual(_input[i].onClick);
            expect(c.config.color).toEqual(_input[i].color);
            expect(c.config.shape).toEqual(_input[i].shape);
            expect(c.config.label).toEqual(_input[i].label);
            expect(c.config.key).toEqual(_input[i].key);
        });
    });
    it("Generates the graph correctly", () => {
        pieInstance.loadContent(dataPrimary);
        const pieContentGroupElement = fetchElementByClass(
            styles.pieContentGroup
        );
        expect(pieContentGroupElement.nodeName).toBe("g");
        expect(pieContentGroupElement.getAttribute("aria-labelledby")).toBe(
            dataPrimary.label.display
        );
        expect(pieContentGroupElement.getAttribute("aria-describedby")).toBe(
            dataPrimary.key
        );
        expect(pieContentGroupElement.getAttribute("aria-disabled")).toBe(
            "false"
        );
        expect(pieContentGroupElement.getAttribute("aria-selected")).toBe(
            "false"
        );
        expect(pieContentGroupElement.getAttribute("transform")).toBeDefined();
    });
    it("Creates slice with default color if none provided", () => {
        const _input = utils.deepClone(dataPrimary);
        _input.color = null;
        pieInstance.loadContent(_input);
        const legendItemSVGElement = fetchElementByClass(
            `${styles.pieLegendItem} svg`
        );
        const pieGroupElementData = d3
            .select(fetchElementByClass(styles.pieContentGroup))
            .datum();
        expect(pieGroupElementData.color).toBe(constants.DEFAULT_PIE_COLOR);
        expect(legendItemSVGElement.getAttribute("style")).toContain(
            constants.DEFAULT_PIE_COLOR
        );
    });
    it("Generates slice with click disabled when onClick is not provided", () => {
        const _input = utils.deepClone(dataPrimary);
        _input.onClick = null;
        pieInstance.loadContent(_input);
        const pieContentGroupElement = fetchElementByClass(
            styles.pieContentGroup
        );
        expect(pieContentGroupElement.getAttribute("aria-disabled")).toBe(
            "true"
        );
    });
    it("Generates slice with data embedded within", () => {
        pieInstance.loadContent(dataPrimary);
        const pieContentGroupElement = fetchElementByClass(
            styles.pieContentGroup
        );
        const storedData = d3.select(pieContentGroupElement).datum();
        expect(storedData.key).toEqual(dataPrimary.key);
        expect(storedData.label).toEqual(dataPrimary.label);
        expect(storedData.color).toEqual(dataPrimary.color);
        expect(storedData.shape).toEqual(constants.DEFAULT_PIE_LEGEND_SHAPE);
        expect(storedData.value).toEqual(dataPrimary.value);
    });
    it("Stores the content correctly", () => {
        pieInstance.loadContent(dataPrimary);
        expect(pieInstance.content.length).toBe(1);
        expect(pieInstance.content[0]).toEqual(dataPrimary.key);
        pieInstance.loadContent(dataTertiary);
        expect(pieInstance.content.length).toBe(2);
        expect(pieInstance.content[1]).toEqual(dataTertiary.key);
    });
    it("Created legend item correctly", () => {
        pieInstance.loadContent(dataPrimary);
        const legendContainer = fetchElementByClass(styles.legend);
        expect(legendContainer.childNodes.length).toBe(1);
    });
    it("Created multiple legend item correctly", () => {
        pieInstance.loadContent([dataPrimary, dataSecondary]);
        const legendContainer = fetchElementByClass(styles.legend);
        expect(legendContainer.childNodes.length).toBe(2);
    });
    it("Loads multiple content correctly", () => {
        pieInstance.loadContent([dataSecondary, dataTertiary]);
        const pieContentGroupElement = fetchElementByClass(
            styles.pieChartContent
        );
        expect(pieInstance.content.length).toBe(2);
        expect(pieInstance.contentConfig.length).toBe(2);
        expect(pieContentGroupElement.childNodes.length).toBe(2);
    });
    it("Does not throw error when multiple content is provided", () => {
        expect(() => {
            pieInstance.loadContent([dataSecondary, dataTertiary]);
        }).not.toThrowError();
    });
    it("Does not throw error when valid input", () => {
        expect(() => {
            loadedPieInstance = pieInstance.loadContent({
                key: "uid_2",
                label: { display: "Orange" },
                color: Carbon.helpers.COLORS.ORANGE,
                value: 125
            });
        }).not.toThrowError();
    });
    it("Takes default height if not provided in input", () => {
        pieInstance.destroy();
        input.dimension = undefined;
        pieInstance = new Pie(input);
        const pieSVGElement = fetchElementByClass(styles.pieChartCanvas);
        expect(pieSVGElement.nodeName).toBe("svg");
        expect(pieSVGElement.getAttribute("role")).toBe("img");
        expect(pieSVGElement.getAttribute("height")).toBeCloserTo(
            constants.PIE_CHART_DEFAULT_HEIGHT
        );
        expect(pieSVGElement.getAttribute("width")).toBeCloserTo(
            constants.PIE_CHART_DEFAULT_HEIGHT
        );
    });
    it("Creates slices correctly", () => {
        pieInstance.loadContent(dataPrimary);
        const sliceElementGroup = document.querySelectorAll(
            `.${styles.pieContentSlice}`
        );
        expect(sliceElementGroup.length).toBe(1);
        expect(sliceElementGroup[0].childNodes[0].nodeName).toBe("path");
        expect(sliceElementGroup[0].childNodes[0].getAttribute("fill")).toBe(
            dataPrimary.color
        );
        expect(
            sliceElementGroup[0].childNodes[0].getAttribute("d")
        ).toBeDefined();
    });
    it("Creates slices correctly for multiple slices", () => {
        pieInstance.loadContent([dataPrimary, dataSecondary, dataTertiary]);
        const sliceElementGroup = document.querySelectorAll(
            `.${styles.pieContentSlice}`
        );
        expect(sliceElementGroup.length).toBe(3);
        // We are comparing colors since we cannot compare the attr d between themselves
        expect(sliceElementGroup[0].firstChild.getAttribute("fill")).toBe(
            dataPrimary.color
        );
        expect(sliceElementGroup[1].firstChild.getAttribute("fill")).toBe(
            dataSecondary.color
        );
        expect(sliceElementGroup[2].firstChild.getAttribute("fill")).toBe(
            dataTertiary.color
        );
    });
    it("Creates the first slice from top center", () => {
        pieInstance.loadContent([dataPrimary, dataSecondary, dataTertiary]);
        const sliceElementGroup = document.querySelectorAll(
            `.${styles.pieContentSlice}`
        );
        const sliceOneDatum = d3.select(sliceElementGroup[0]).datum();
        const sliceTwoDatum = d3.select(sliceElementGroup[1]).datum();
        const sliceThreeDatum = d3.select(sliceElementGroup[2]).datum();
        expect(sliceOneDatum.value).toBe(dataPrimary.value);
        expect(sliceOneDatum.startAngle).toBe(0);
        expect(sliceTwoDatum.startAngle).not.toBe(0);
        expect(sliceThreeDatum.startAngle).not.toBe(0);
    });
    it("Slices total to 100%", () => {
        pieInstance.loadContent([dataPrimary, dataSecondary, dataTertiary]);
        const sliceElementGroup = document.querySelectorAll(
            `.${styles.pieContentSlice}`
        );
        const sliceOneDatum = d3.select(sliceElementGroup[0]).datum();
        const sliceTwoDatum = d3.select(sliceElementGroup[1]).datum();
        const sliceThreeDatum = d3.select(sliceElementGroup[2]).datum();
        expect(
            getSlicePercentage(
                sliceOneDatum.startAngle,
                sliceOneDatum.endAngle
            ) +
                getSlicePercentage(
                    sliceTwoDatum.startAngle,
                    sliceTwoDatum.endAngle
                ) +
                getSlicePercentage(
                    sliceThreeDatum.startAngle,
                    sliceThreeDatum.endAngle
                )
        ).toBeCloserTo(100);
    });
    it("Sorts slices in descending order based on value", () => {
        pieInstance.loadContent([dataPrimary, dataSecondary, dataTertiary]);
        const sliceElementGroup = document.querySelectorAll(
            `.${styles.pieContentSlice}`
        );
        const sliceOneDatum = d3.select(sliceElementGroup[0]).datum();
        const sliceTwoDatum = d3.select(sliceElementGroup[1]).datum();
        const sliceThreeDatum = d3.select(sliceElementGroup[2]).datum();
        // The slices should be loaded in the order -> dataPrimary, dataTertiary, dataSecondary
        // Values are 100, 25, 5
        // dataPrimary & 100
        expect(sliceOneDatum.startAngle).toBe(0);
        expect(sliceOneDatum.value).toBe(100);
        // dataTertiary & 25
        expect(sliceThreeDatum.startAngle).toBeGreaterThan(
            sliceOneDatum.startAngle
        );
        expect(sliceThreeDatum.startAngle).toBeLessThanOrEqual(
            sliceTwoDatum.startAngle
        );
        expect(sliceThreeDatum.value).toBe(25);
        // dataSecondary & 5
        expect(sliceTwoDatum.startAngle).toBeGreaterThanOrEqual(
            sliceThreeDatum.endAngle
        );
        expect(sliceTwoDatum.value).toBe(5);
    });
    describe("On slice action", () => {
        describe("On hover", () => {
            beforeEach(() => {
                pieInstance.loadContent([
                    dataPrimary,
                    dataSecondary,
                    dataTertiary
                ]);
            });
            it("Blurs other slices", (done) => {
                // Hover over the first slice
                triggerEvent(
                    fetchElementByClass(styles.pieContentGroup),
                    "mouseenter",
                    () => {
                        expect(
                            document
                                .querySelector(
                                    `g[aria-describedby="${dataPrimary.key}"]`
                                )
                                .classList.contains(styles.blur)
                        ).toBeFalsy();
                        expect(
                            document
                                .querySelector(
                                    `g[aria-describedby="${dataSecondary.key}"]`
                                )
                                .classList.contains(styles.blur)
                        ).toBeTruthy();
                        expect(
                            document
                                .querySelector(
                                    `g[aria-describedby="${dataTertiary.key}"]`
                                )
                                .classList.contains(styles.blur)
                        ).toBeTruthy();
                        done();
                    }
                );
            });
            it("Highlights corresponding legend item", (done) => {
                // Legend item of first slice
                const pieLegendItem = fetchElementByClass(styles.pieLegendItem);
                triggerEvent(
                    fetchElementByClass(styles.pieContentGroup),
                    "mouseenter",
                    () => {
                        expect(
                            pieLegendItem.classList.contains(
                                styles.pieLegendItemSliceHover
                            )
                        ).toBeTruthy();
                        done();
                    }
                );
            });
            it("Un-blurs all slices on mouseleave", (done) => {
                const firstSliceElement = fetchElementByClass(
                    styles.pieContentGroup
                );
                triggerEvent(firstSliceElement, "mouseenter", () => {
                    triggerEvent(firstSliceElement, "mouseleave", () => {
                        expect(
                            document
                                .querySelector(
                                    `g[aria-describedby="${dataTertiary.key}"]`
                                )
                                .classList.contains(styles.blur)
                        ).toBeFalsy();
                        done();
                    });
                });
            });
            it("Un-highlights legend item on mouseleave", (done) => {
                const pieLegendItem = fetchElementByClass(styles.pieLegendItem);
                const firstSliceElement = fetchElementByClass(
                    styles.pieContentGroup
                );
                triggerEvent(firstSliceElement, "mouseenter", () => {
                    triggerEvent(firstSliceElement, "mouseleave", () => {
                        expect(
                            pieLegendItem.classList.contains(
                                styles.pieLegendItemSliceHover
                            )
                        ).toBeFalsy();
                        done();
                    });
                });
            });
        });
        describe("On click", () => {
            it("Calls consumer provided callback", (done) => {
                const onClickFunctionSpy = sinon.spy();
                const _input = utils.deepClone(dataPrimary);
                _input.onClick = onClickFunctionSpy;
                pieInstance.loadContent([_input, dataSecondary, dataTertiary]);
                const firstSliceElement = fetchElementByClass(
                    styles.pieContentGroup
                );
                triggerEvent(firstSliceElement, "click", () => {
                    expect(
                        firstSliceElement.getAttribute("aria-selected")
                    ).toBeTruthy();
                    expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Resets selection on re-clicking", (done) => {
                const _input = utils.deepClone(dataPrimary);
                _input.onClick = (cb) => cb();
                pieInstance.loadContent([_input, dataSecondary, dataTertiary]);
                const firstSliceElement = fetchElementByClass(
                    styles.pieContentGroup
                );
                triggerEvent(firstSliceElement, "click", () => {
                    triggerEvent(firstSliceElement, "click", () => {
                        expect(
                            firstSliceElement.getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    });
                });
            });
            it("Doesnt enable selection if no click function is provided", (done) => {
                const _input = utils.deepClone(dataPrimary);
                _input.onClick = null;
                pieInstance.loadContent([_input, dataSecondary, dataTertiary]);
                const firstSliceElement = fetchElementByClass(
                    styles.pieContentGroup
                );
                triggerEvent(firstSliceElement, "click", () => {
                    triggerEvent(firstSliceElement, "click", () => {
                        expect(
                            firstSliceElement.getAttribute("aria-selected")
                        ).toBe("false");
                        done();
                    });
                });
            });
            it("Maintains blur on other slices even if clicked on a slice", (done) => {
                pieInstance.loadContent([
                    dataPrimary,
                    dataSecondary,
                    dataTertiary
                ]);
                const firstSliceElement = fetchElementByClass(
                    styles.pieContentGroup
                );
                triggerEvent(firstSliceElement, "mouseenter", () => {
                    triggerEvent(firstSliceElement, "click", () => {
                        triggerEvent(firstSliceElement, "mouseleave", () => {
                            expect(
                                document
                                    .querySelector(
                                        `g[aria-describedby="${dataTertiary.key}"]`
                                    )
                                    .classList.contains(styles.blur)
                            ).toBeTruthy();
                            done();
                        });
                    });
                });
            });
        });
    });
});
