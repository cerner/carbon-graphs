"use strict";
import * as d3 from "d3";
import Gantt from "../../../../main/js/controls/Gantt";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    datelineAlt,
    datelineJSON,
    fetchAllElementsByClass,
    taskValuesJSON,
    activityValuesJSON,
    eventValuesJson,
    actionValuesJson,
    legendJSON
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
            const axisData = Object.assign(getAxes(axisJSON), {
                showActionLegend: true,
                actionLegend: legendJSON
            });
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
            d3.selectAll(`.${styles.datelinePoint}`).each(function () {
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
        it("Dynamic Data is updated correctly when key matches", () => {
            const primaryContent = getData(
                taskValuesJSON,
                activityValuesJSON,
                eventValuesJson,
                actionValuesJson
            );
            const panData = {
                key: "track 1",
                tasks: [
                    {
                        key: "taskNormal",
                        startDate: new Date(2018, 3, 1).toISOString(),
                        endDate: new Date(2018, 6, 10).toISOString()
                    },
                    {
                        key: "taskChunk",
                        startDate: new Date(2018, 3, 1).toISOString(),
                        endDate: new Date(2018, 6, 10).toISOString()
                    }
                ],
                activities: [
                    {
                        key: "activityNormal",
                        startDate: new Date(2018, 3, 1).toISOString(),
                        endDate: new Date(2018, 6, 10).toISOString()
                    }
                ],
                events: [
                    {
                        key: "uid_event_1",
                        values: [new Date(2018, 3, 5).toISOString()]
                    }
                ],
                actions: [
                    {
                        key: "uid_action_1",
                        values: [new Date(2018, 2, 1, 6, 15).toISOString()]
                    }
                ]
            };
            gantt.loadContent(primaryContent);
            let tasksContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.task
            );
            expect(tasksContent.length).toEqual(4);
            let activitiesContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.activity
            );
            expect(activitiesContent.length).toEqual(2);
            let eventsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="true"]`
            );
            expect(eventsContent.length).toEqual(2);
            let actionsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="false"]`
            );
            expect(actionsContent.length).toEqual(2);

            gantt.reflow(panData);

            tasksContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.task
            );
            expect(tasksContent.length).toEqual(2);
            activitiesContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.activity
            );
            expect(activitiesContent.length).toEqual(1);
            eventsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="true"]`
            );
            expect(eventsContent.length).toEqual(1);
            actionsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="false"]`
            );
            expect(actionsContent.length).toEqual(1);
        });
        it("Dynamic Data is not updated when key does not match", () => {
            const primaryContent = getData(
                taskValuesJSON,
                activityValuesJSON,
                eventValuesJson,
                actionValuesJson
            );
            const panData = {
                key: "track 0",
                tasks: [
                    {
                        key: "taskNormal",
                        startDate: new Date(2018, 3, 1).toISOString(),
                        endDate: new Date(2018, 6, 10).toISOString()
                    },
                    {
                        key: "taskChunk",
                        startDate: new Date(2018, 3, 1).toISOString(),
                        endDate: new Date(2018, 6, 10).toISOString()
                    }
                ],
                activities: [
                    {
                        key: "activityNormal",
                        startDate: new Date(2018, 3, 1).toISOString(),
                        endDate: new Date(2018, 6, 10).toISOString()
                    }
                ],
                events: [
                    {
                        key: "uid_event_1",
                        values: [new Date(2018, 3, 5).toISOString()]
                    }
                ],
                actions: [
                    {
                        key: "uid_action_1",
                        values: [new Date(2018, 2, 1, 6, 15).toISOString()]
                    }
                ]
            };
            gantt.loadContent(primaryContent);
            let tasksContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.task
            );
            expect(tasksContent.length).toEqual(4);
            let activitiesContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.activity
            );
            expect(activitiesContent.length).toEqual(2);
            let eventsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="true"]`
            );
            expect(eventsContent.length).toEqual(2);
            let actionsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="false"]`
            );
            expect(actionsContent.length).toEqual(2);

            gantt.reflow(panData);

            tasksContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.task
            );
            expect(tasksContent.length).toEqual(4);
            activitiesContent = fetchAllElementsByClass(
                ganttChartContainer,
                styles.activity
            );
            expect(activitiesContent.length).toEqual(2);
            eventsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="true"]`
            );
            expect(eventsContent.length).toEqual(2);
            actionsContent = fetchAllElementsByClass(
                ganttChartContainer,
                `${styles.currentPointsGroup}[event="false"]`
            );
            expect(actionsContent.length).toEqual(2);
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
