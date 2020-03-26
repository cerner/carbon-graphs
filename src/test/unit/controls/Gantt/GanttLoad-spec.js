"use strict";
import * as d3 from "d3";
import Gantt from "../../../../main/js/controls/Gantt";
import { getXAxisWidth } from "../../../../main/js/controls/Gantt/helpers/creationHelpers";
import Track from "../../../../main/js/controls/Gantt/Track";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { delay, toNumber, TRANSITION_DELAY } from "../../helpers/commonHelpers";
import {
    axisJSON,
    BASE_CANVAS_HEIGHT_PADDING,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getData,
    trackDimension
} from "./helpers";
describe("Gantt - Load", () => {
    let gantt = null;
    let ganttChartContainer;
    const primaryContent = getData();
    const secondaryContent = utils.deepClone(getData());
    secondaryContent.key = "uid_2";

    beforeEach(() => {
        ganttChartContainer = document.createElement("div");
        ganttChartContainer.id = "testCarbonGantt";
        ganttChartContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        ganttChartContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(ganttChartContainer);

        gantt = new Gantt(getAxes(axisJSON));
        gantt.loadContent(primaryContent);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("Single Track input", () => {
        it("Creates a new Track instance for each content", () => {
            expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
        });
        it("Saves track instance", () => {
            expect(gantt.trackConfig[0]).not.toBeNull();
            expect(gantt.tracks[0]).not.toBeNull();
            expect(gantt.tracks[0]).toBe(primaryContent.key);
        });
        it("Update axes domain", () => {
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(1);
        });
        it("Updates the height", () => {
            expect(gantt.config.height).toBe(41);
        });
        it("Sets canvas height", () => {
            expect(gantt.config.canvasHeight).toBe(
                41 + BASE_CANVAS_HEIGHT_PADDING
            );
        });
        it("Resizes the graph", () => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            spyOn(gantt, "resize");
            gantt.loadContent(primaryContent);
            expect(gantt.resize).toHaveBeenCalled();
        });
        it("Moves track label to middle", () => {
            const trackLabelElement = document.querySelectorAll(
                ".carbon-axis.carbon-axis-y .tick text"
            );
            expect(
                trackLabelElement[0].getAttribute("transform")
            ).not.toBeNull();
        });
        it("Custom Padding input with Custom Track Height", () => {
            gantt.destroy();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            };
            gantt = new Gantt(ganttConfig);
            const primaryContent = getData();
            primaryContent.dimension = trackDimension.dimension;
            gantt.loadContent(primaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
    });
    describe("Multiple Track inputs", () => {
        it("Loads content correctly", () => {
            gantt.loadContent(secondaryContent);
            expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
            expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
            expect(gantt.tracks[0]).toBe(primaryContent.key);
            expect(gantt.tracks[1]).toBe(secondaryContent.key);
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(2);
            expect(gantt.config.height).toBe(82);
            expect(gantt.config.canvasHeight).toBe(
                82 + BASE_CANVAS_HEIGHT_PADDING
            );
        });
        it("Loads multiple contents correctly", () => {
            const multipleContents = [primaryContent, secondaryContent];
            gantt = new Gantt(getAxes(axisJSON));
            gantt.loadContent(multipleContents);
            const mockPrimaryTrack = new Track(primaryContent);
            expect(gantt.trackConfig[0].tasks).toEqual(mockPrimaryTrack.tasks);
            expect(gantt.trackConfig[0].key).toEqual(mockPrimaryTrack.key);
            expect(gantt.trackConfig[0].trackLabel).toEqual(
                mockPrimaryTrack.trackLabel
            );
            const mockSecondaryTrack = new Track(secondaryContent);
            expect(gantt.trackConfig[1].tasks).toEqual(
                mockSecondaryTrack.tasks
            );
            expect(gantt.trackConfig[1].key).toEqual(mockSecondaryTrack.key);
            expect(gantt.trackConfig[1].trackLabel).toEqual(
                mockSecondaryTrack.trackLabel
            );
            expect(gantt.tracks.length).toBe(2);
            expect(gantt.tracks).toEqual([
                primaryContent.key,
                secondaryContent.key
            ]);
            expect(gantt.trackConfig.length).toBe(2);
        });
        it("Loads content correctly with different heights - 2", () => {
            const primaryContent = getData();
            const secondaryContent = utils.deepClone(getData());
            secondaryContent.key = "uid_2";
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            primaryContent.dimension = trackDimension.dimension;
            secondaryContent.dimension = trackDimension.dimension;
            gantt.loadContent(primaryContent);
            gantt.loadContent(secondaryContent);

            expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
            expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
            expect(gantt.tracks[0]).toBe(primaryContent.key);
            expect(gantt.tracks[1]).toBe(secondaryContent.key);
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(2);
            expect(gantt.config.height).toBe(200);
            expect(gantt.config.canvasHeight).toBe(
                200 + BASE_CANVAS_HEIGHT_PADDING
            );
        });
        it("Loads content correctly with different heights - 3", () => {
            const primaryContent = getData();
            const secondaryContent = utils.deepClone(getData());
            secondaryContent.key = "uid_2";
            const tertiaryContent = utils.deepClone(getData());
            tertiaryContent.key = "uid_3";
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            primaryContent.dimension = trackDimension.dimension;
            secondaryContent.dimension = trackDimension.dimension;
            gantt.loadContent(primaryContent);
            gantt.loadContent(secondaryContent);
            gantt.loadContent(tertiaryContent);
            expect(gantt.trackConfig[0] instanceof Track).toBeTruthy();
            expect(gantt.trackConfig[1] instanceof Track).toBeTruthy();
            expect(gantt.trackConfig[2] instanceof Track).toBeTruthy();
            expect(gantt.tracks[0]).toBe(primaryContent.key);
            expect(gantt.tracks[1]).toBe(secondaryContent.key);
            expect(gantt.tracks[2]).toBe(tertiaryContent.key);
            expect(gantt.config.axis.y.domain.lowerLimit).toBe(0);
            expect(gantt.config.axis.y.domain.upperLimit).toBe(3);
            expect(gantt.config.height).toBe(241);
            expect(gantt.config.canvasHeight).toBe(
                241 + BASE_CANVAS_HEIGHT_PADDING
            );
        });
        it("Custom Padding input with Custom Track Heights", () => {
            gantt.destroy();
            const ganttConfig = getAxes(axisJSON);
            ganttConfig.padding = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            };
            gantt = new Gantt(ganttConfig);
            const primaryContent = getData();
            const secondaryContent = utils.deepClone(getData());
            secondaryContent.key = "uid_2";
            const tertiaryContent = utils.deepClone(getData());
            tertiaryContent.key = "uid_3";
            primaryContent.dimension = trackDimension.dimension;
            secondaryContent.dimension = trackDimension.dimension;
            gantt.loadContent(primaryContent);
            gantt.loadContent(secondaryContent);
            gantt.loadContent(tertiaryContent);
            const contentContainer = d3.select(`.${styles.contentContainer}`);
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
            expect(gantt.config.axisSizes.y).toEqual(0);
            expect(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            ).toEqual(0);
            const canvas = d3.select(`.${styles.canvas}`);
            expect(gantt.config.height).toEqual(
                toNumber(canvas.attr("height"), 10)
            );
            expect(getXAxisWidth(gantt.config)).toEqual(
                toNumber(canvas.attr("width"), 10)
            );
            expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
            );
            expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
                (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
            );
        });
    });
    /**
     * CH02152019.01 - Verify when the track is loading, the system positions the track according to the index position.
     */
    describe("Track loading at a index", () => {
        describe("Validation", () => {
            it("Throws error if input index is not valid", () => {
                const content = utils.deepClone(primaryContent);
                content.loadAtIndex = -2;
                expect(() => {
                    gantt.loadContent(content);
                }).toThrow(
                    new Error(errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX)
                );
            });
            it("Doesn't Throw an error if input index is valid", () => {
                const content = utils.deepClone(primaryContent);
                content.loadAtIndex = 1;
                expect(() => {
                    gantt.loadContent(content);
                }).not.toThrow(
                    new Error(errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX)
                );
            });
            it("Doesn't throw an error if loadAtIndex is not used", () => {
                const content = utils.deepClone(primaryContent);
                expect(() => {
                    gantt.loadContent(content);
                }).not.toThrow(
                    new Error(errors.THROW_MSG_INVALID_LOAD_CONTENT_AT_INDEX)
                );
            });
        });
        it("Inserts at head, if index is 0", (done) => {
            const content = utils.deepClone(primaryContent);
            content.key = "track 2";
            content.trackLabel.display = "Project B";
            content.loadAtIndex = 0;
            gantt.loadContent(content);
            expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                "track 2"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                "track 1"
            );
            gantt.resize();
            delay(() => {
                const trackGroups = fetchAllElementsByClass(
                    ganttChartContainer,
                    `${styles.trackGroup}`
                );
                expect(
                    trackGroups[0].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("42");
                expect(
                    trackGroups[1].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("1");
                done();
            }, TRANSITION_DELAY);
        });
        it("Inserts in between, if index is less than trackLength", (done) => {
            const secondaryContent = utils.deepClone(primaryContent);
            secondaryContent.key = "track 2";
            secondaryContent.trackLabel.display = "Project B";
            gantt.loadContent(secondaryContent);
            const ternaryContent = utils.deepClone(primaryContent);
            ternaryContent.key = "track 3";
            ternaryContent.trackLabel.display = "Project C";
            ternaryContent.loadAtIndex = 1;
            gantt.loadContent(ternaryContent);
            expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                "track 1"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                "track 3"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[2]).toBe(
                "track 2"
            );
            delay(() => {
                const trackGroups = fetchAllElementsByClass(
                    ganttChartContainer,
                    `${styles.trackGroup}`
                );
                expect(
                    trackGroups[0].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("1");
                expect(
                    trackGroups[1].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("83");
                expect(
                    trackGroups[2].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("42");
                done();
            }, TRANSITION_DELAY);
        });
        it("Inserts at end, if index is equal to trackLength", (done) => {
            const secondaryContent = utils.deepClone(primaryContent);
            secondaryContent.key = "track 2";
            secondaryContent.trackLabel.display = "Project B";
            gantt.loadContent(secondaryContent);
            const ternaryContent = utils.deepClone(primaryContent);
            ternaryContent.key = "track 3";
            ternaryContent.trackLabel.display = "Project C";
            ternaryContent.loadAtIndex = 2;
            gantt.loadContent(ternaryContent);
            expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                "track 1"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                "track 2"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[2]).toBe(
                "track 3"
            );
            delay(() => {
                const trackGroups = fetchAllElementsByClass(
                    ganttChartContainer,
                    `${styles.trackGroup}`
                );
                expect(
                    trackGroups[0].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("1");
                expect(
                    trackGroups[1].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("42");
                expect(
                    trackGroups[2].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("83");
                done();
            }, TRANSITION_DELAY);
        });
        it("Inserts at end, if index is too big than trackLength", (done) => {
            const secondaryContent = utils.deepClone(primaryContent);
            secondaryContent.key = "track 2";
            secondaryContent.trackLabel.display = "Project B";
            gantt.loadContent(secondaryContent);
            const ternaryContent = utils.deepClone(primaryContent);
            ternaryContent.key = "track 3";
            ternaryContent.trackLabel.display = "Project C";
            ternaryContent.loadAtIndex = 99;
            gantt.loadContent(ternaryContent);
            expect(Object.keys(gantt.config.axis.y.trackList)[0]).toBe(
                "track 1"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[1]).toBe(
                "track 2"
            );
            expect(Object.keys(gantt.config.axis.y.trackList)[2]).toBe(
                "track 3"
            );
            delay(() => {
                const trackGroups = fetchAllElementsByClass(
                    ganttChartContainer,
                    `${styles.trackGroup}`
                );
                expect(
                    trackGroups[0].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("1");
                expect(
                    trackGroups[1].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("42");
                expect(
                    trackGroups[2].childNodes[0].childNodes[0].getAttribute("y")
                ).toBe("83");
                done();
            }, TRANSITION_DELAY);
        });
    });
    describe("Validates content for unique keys", () => {
        it("Throws error if content doesn't have a unique key", () => {
            gantt = new Gantt(Object.assign(getAxes(axisJSON)));
            gantt.loadContent(getData());
            expect(() => {
                gantt.loadContent(getData());
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("doesn't throws error if content has unique keys", () => {
            gantt = new Gantt(Object.assign(getAxes(axisJSON)));
            gantt.loadContent(getData());
            expect(() => {
                const uniqueData = getData();
                uniqueData.key = "uid_2";
                gantt.loadContent(uniqueData);
            }).not.toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
    });
    describe("Content container", () => {
        it("Increases the height when content is loaded dynamically", (done) => {
            const canvasElement = fetchElementByClass(styles.canvas);
            delay(() => {
                const containerElement = canvasElement.querySelector(
                    `.${styles.contentContainer}`
                );
                expect(+containerElement.getAttribute("height")).toBe(41);
                done();
            }, TRANSITION_DELAY);
        });
        it("Increases the height when content is loaded dynamically with different height", (done) => {
            gantt.destroy();
            gantt = new Gantt(getAxes(axisJSON));
            const data = utils.deepClone(getData());
            data.dimension = trackDimension.dimension;
            gantt.loadContent(data);
            const canvasElement = fetchElementByClass(styles.canvas);
            delay(() => {
                const containerElement = canvasElement.querySelector(
                    `.${styles.contentContainer}`
                );
                expect(+containerElement.getAttribute("height")).toBe(100);
                done();
            }, TRANSITION_DELAY);
        });
    });
});
/**
 * BF12182018.01 - Verify the consumer has the option to provide custom padding for the graph-container.
 */
describe("Gantt - Load - When custom padding is used", () => {
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
    it("default padding is applied when no custom padding is used", () => {
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        gantt = new Gantt(ganttConfig);
        const expectedOutput = {
            top: 10,
            bottom: 5,
            left: 100, // defaults to constants trackLabel
            right: 50,
            hasCustomPadding: false
        };
        expect(gantt.config.padding).toEqual(expectedOutput);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            toNumber(
                gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y,
                10
            )
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual((5 + 10) * 2);
    });
    it("default padding applied when custom padding half used", () => {
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            top: 50
        };
        gantt = new Gantt(ganttConfig);
        const expectedOutput = {
            top: 50,
            bottom: 5,
            left: 100,
            right: 50,
            hasCustomPadding: true
        };
        expect(gantt.config.padding).toEqual(expectedOutput);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual((50 + 5) * 2);
    });
    it("position of content container starts where canvas starts", () => {
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
        };
        gantt = new Gantt(ganttConfig);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        );
    });
    it("position of content container shifts right, when left padding is applied", () => {
        // Ideally, Gantt wouldn't be using left and right padding, but it uses trackLabel.
        // When custom padding is applied, trackLabel's value is defaulted to left padding value.
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            left: 20,
            right: 0,
            bottom: 0,
            top: 0
        };
        gantt = new Gantt(ganttConfig);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        );
    });
    it("position of content container shifts bottom, when top padding is applied", () => {
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            left: 0,
            right: 0,
            bottom: 0,
            top: 20
        };
        gantt = new Gantt(ganttConfig);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        );
    });
    it("position of content container shifts top, when bottom padding is applied", () => {
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            left: 0,
            right: 0,
            bottom: 20,
            top: 0
        };
        gantt = new Gantt(ganttConfig);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        expect(toNumber(contentContainer.attr("x"), 10)).toEqual(
            gantt.config.axisSizes.y + gantt.config.axisLabelWidths.y
        );
        expect(toNumber(contentContainer.attr("y"), 10)).toEqual(
            (ganttConfig.padding.top + ganttConfig.padding.bottom) * 2
        );
    });
    it("width and height of the content container is equal to width and height of the canvas when no padding", () => {
        const primaryContent = getData();
        const ganttConfig = getAxes(axisJSON);
        ganttConfig.padding = {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
        };
        gantt = new Gantt(ganttConfig);
        gantt.loadContent(primaryContent);
        const contentContainer = d3.select(`.${styles.contentContainer}`);
        const canvas = d3.select(`.${styles.canvas}`);
        expect(contentContainer.attr("width")).toEqual(canvas.attr("width"));
        expect(gantt.config.canvasHeight).toEqual(gantt.config.height);
    });
});
