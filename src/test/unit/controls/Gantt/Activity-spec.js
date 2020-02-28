"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import { getActivityStyle } from "../../../../main/js/controls/Gantt/helpers/durationHelpers";
import constants, { COLORS } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import {
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    activityValuesJSON,
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    onClickFunctionSpy,
    taskEndDate,
    taskStartDate
} from "./helpers";

describe("Gantt -> Track -> Activity", () => {
    let gantt = null;
    let ganttChartContainer;
    const daysToMilliseconds = (d) => 24 * 60 * 60 * 1000 * d;
    const axisData = Object.assign(getAxes(axisJSON), {
        showActionLegend: false
    });
    const loadData = (gantt) =>
        gantt.loadContent(
            Object.assign(getData(), {
                trackLabel: {
                    display: "Project A Really long",
                    onClick: onClickFunctionSpy
                },
                activities: activityValuesJSON
            })
        );
    beforeEach(() => {
        ganttChartContainer = document.createElement("div");
        ganttChartContainer.id = "testCarbonGantt";
        ganttChartContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        ganttChartContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(ganttChartContainer);
        gantt = new Gantt(axisData);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("On Load", () => {
        describe("Validates", () => {
            it("Throws error when no data is loaded", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [{}]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("Throws error when no key is loaded", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: ""
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_UNIQUE_KEY_NOT_PROVIDED
                );
            });
            it("Throws error when no start date and no end date is provided", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "DummyKey"
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_START_AND_END_NOT_PROVIDED
                );
            });
            it("Throws error when no start date is provided", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "DummyKey",
                                    endDate: new Date(2018, 3, 1).toISOString()
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_DURATION_NOT_PROVIDED
                );
            });
            it("Throws error when no end date is provided", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "DummyKey",
                                    startDate: new Date(
                                        2018,
                                        3,
                                        1
                                    ).toISOString()
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_DURATION_NOT_PROVIDED
                );
            });
            it("Throws error when start date is invalid type", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    startDate: "Different Type",
                                    duration: () => daysToMilliseconds(1)
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_START_AND_END_TYPE_NOT_VALID
                );
            });
            it("Throws error when end date is invalid type", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    endDate: "Different Type",
                                    duration: () => daysToMilliseconds(1)
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_START_AND_END_TYPE_NOT_VALID
                );
            });
            it("Throws error when duration is not a function", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    startDate: new Date(
                                        2018,
                                        3,
                                        1
                                    ).toISOString(),
                                    duration: "Date"
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_ACTIVITIES_DURATION_NOT_FUNCTION
                );
            });
            it("Throws error when duration function does not return a function", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    startDate: new Date(
                                        2018,
                                        3,
                                        1
                                    ).toISOString(),
                                    duration: () => "Date"
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_ACTIVITIES_DURATION_NOT_VALID);
            });
            it("Throws error when start date is larger than end date", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    startDate: new Date(
                                        2018,
                                        7,
                                        1
                                    ).toISOString(),
                                    endDate: new Date(2018, 1, 1).toISOString()
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_ACTIVITIES_START_MORE_END);
            });
            it("Does not throw error when duration is provided and no start date", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    endDate: new Date(2018, 7, 1).toISOString(),
                                    duration: () => daysToMilliseconds(10)
                                }
                            ]
                        })
                    );
                }).not.toThrowError();
            });
            it("Does not throw error when duration is provided and no end date", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            activities: [
                                {
                                    key: "uid_activity_1",
                                    startDate: new Date(
                                        2018,
                                        7,
                                        1
                                    ).toISOString(),
                                    duration: () => daysToMilliseconds(10)
                                }
                            ]
                        })
                    );
                }).not.toThrowError();
            });
            it("Does not throw error when valid", () => {
                expect(() => {
                    loadData(gantt);
                }).not.toThrowError();
            });
        });

        it("Renders Activity group correctly", () => {
            loadData(gantt);
            const activityGroup = document.querySelectorAll(
                `.${styles.activityGroup}`
            );
            expect(activityGroup.length).toBe(1);
            expect(activityGroup[0].childNodes.length).toBe(2);
            expect(activityGroup[0].getAttribute("transform")).not.toBeNull();
            expect(
                activityGroup[0].childNodes[0].getAttribute("pointer-events")
            ).toBe("auto");
        });
        it("Adds data to each activity correctly", () => {
            loadData(gantt);
            const activityGroupElement = document.querySelectorAll(
                `.${styles.activity}`
            );
            activityGroupElement.forEach((t) => {
                expect(d3.select(t).datum()).not.toBeUndefined();
            });
        });
        it("Prepares activity", () => {
            loadData(gantt);
            const d3ActivityElement = d3.select(`.${styles.activity}`);
            const activityData = d3ActivityElement.datum();
            expect(activityData.key).toBe(activityValuesJSON[0].key);
            expect(activityData.y).toBe("Project A Really long");
            expect(activityData.color).toBe(COLORS.BLUE);
            expect(activityData.startDate).toEqual(
                new Date(activityValuesJSON[0].startDate)
            );
            expect(activityData.endDate).toEqual(
                new Date(activityValuesJSON[0].endDate)
            );
            expect(activityData.dependancies).toEqual(
                activityValuesJSON[0].dependancies
            );
            expect(activityData.label).toEqual(activityValuesJSON[0].label);
            expect(activityData.style).toContain("fill");
            expect(activityData.style).toContain(COLORS.BLUE);
            expect(activityData.style).toContain("opacity");
            expect(activityData.clickPassThrough).toBe(false);
        });

        /**
         * CH07252018.05    Verify duration can be displayed using a default (filled) background bar
         * CH07252018.07    Verify the height of the background bar is taller than the foreground bar
         * CH07252018.08    Verify opacity is applied to the background bar
         * CH07252018.09    Verify the background bars layer above grid lines
         */
        it("Renders background bar correctly", () => {
            const tasks = [
                {
                    key: "Task",
                    onClick: sinon.spy(),
                    label: {
                        display: "Story Dino"
                    },
                    startDate: taskStartDate,
                    endDate: taskEndDate
                }
            ];
            const activities = [
                {
                    key: "Activity",
                    label: {
                        display: "Story Dino background"
                    },
                    startDate: taskStartDate,
                    endDate: taskEndDate
                }
            ];
            gantt.loadContent(
                Object.assign(getData(), {
                    trackLabel: {
                        display: "Project A Really long",
                        onClick: onClickFunctionSpy
                    },
                    tasks,
                    activities
                })
            );
            const activityElement = fetchElementByClass(styles.activityBar);
            expect(activityElement.getAttribute("style")).toContain("fill");
            // Opacity ensures, it is layered above grid lines.
            expect(activityElement.getAttribute("style")).toContain(
                "opacity: 0.5"
            );
            expect(activityElement.getAttribute("style")).toContain(
                "stroke-width: 1px"
            );
            expect(activityElement.getAttribute("style")).toContain(
                "stroke: #007cc3"
            );
            expect(toNumber(activityElement.getAttribute("x"))).toBeGreaterThan(
                0
            );
            expect(toNumber(activityElement.getAttribute("y"))).toBeGreaterThan(
                0
            );
            expect(
                toNumber(activityElement.getAttribute("width"))
            ).toBeGreaterThan(0);
            expect(
                toNumber(activityElement.getAttribute("height"))
            ).toBeGreaterThan(0);
            expect(
                toNumber(activityElement.getAttribute("height"))
            ).toBeGreaterThan(23);

            const taskElement = fetchElementByClass(styles.taskBar);
            expect(taskElement.getAttribute("height")).toEqual("23");
        });

        /**
         * CH07252018.10    Verify the background bar displays at the top of the row
         */
        it("Renders background bar at the top", () => {
            const activities = [
                {
                    key: "activity",
                    label: {
                        display: "Story Dino"
                    },
                    startDate: taskStartDate,
                    endDate: taskEndDate
                }
            ];
            gantt.loadContent(
                Object.assign(getData(), {
                    trackLabel: {
                        display: "Project A Really long",
                        onClick: onClickFunctionSpy
                    },
                    activities,
                    dimension: {
                        trackHeight: 160
                    }
                })
            );
            const activityElement = fetchElementByClass(styles.activityBar);
            // 31 px height, even when track length is 160, it should not expand.
            expect(activityElement.getAttribute("height")).toEqual("31");
        });

        /**
         * CH07252018.06    Verify duration can be displayed using a hashed, default (filled) background bar
         */
        it("Renders background hashed bar correctly", () => {
            const activities = [
                {
                    key: "Activity",
                    label: {
                        display: "Story Dino"
                    },
                    startDate: taskStartDate,
                    endDate: taskEndDate,
                    style: {
                        isHashed: true
                    }
                }
            ];
            gantt.loadContent(
                Object.assign(getData(), {
                    trackLabel: {
                        display: "Project A Really long",
                        onClick: onClickFunctionSpy
                    },
                    activities
                })
            );

            const activityElement = fetchElementByClass(styles.activity);
            const defsElement = document.getElementById(
                "pattern-stripe-gantt-activity"
            );

            expect(defsElement.getAttribute("patternUnits")).toBe(
                "userSpaceOnUse"
            );
            expect(defsElement.getAttribute("patternTransform")).toBe(
                "rotate(135)"
            );
            expect(defsElement.getAttribute("style")).toBe("fill: #fff;");
            expect(defsElement.childNodes.length).toBe(1);
            expect(defsElement.childNodes[0].nodeName).toBe("rect");
            expect(activityElement.getAttribute("aria-selected")).toEqual(
                "false"
            );
            expect(activityElement.getAttribute("aria-describedby")).toEqual(
                "Activity"
            );
            expect(
                activityElement.childNodes[1].getAttribute("style")
            ).toContain("fill: url(#pattern-stripe-gantt-activity);");
            expect(activityElement.getAttribute("pointer-events")).toBe("auto");
        });

        /**
         * CH07252018.02    Verify the foreground bars layer on top of the background bars and grid lines
         */
        it("Renders both foreground and background", () => {
            const tasks = [
                {
                    key: "task",
                    onClick: sinon.spy(),
                    label: {
                        display: "Story Dino foreground"
                    },
                    startDate: taskStartDate,
                    endDate: taskEndDate
                }
            ];

            const activities = [
                {
                    key: "activity",
                    label: {
                        display: "Story Dino background"
                    },
                    startDate: taskStartDate,
                    endDate: taskEndDate
                }
            ];
            gantt.loadContent(
                Object.assign(getData(), {
                    trackLabel: {
                        display: "Project A Really long",
                        onClick: onClickFunctionSpy
                    },
                    tasks,
                    activities,
                    dimension: {
                        trackHeight: 80
                    }
                })
            );
            const trackElement = d3.select(`.${styles.trackGroup}`);
            expect(
                trackElement.node().childNodes[1].getAttribute("class")
            ).toBe("carbon-data-activity-group");
            expect(
                trackElement.node().childNodes[2].getAttribute("class")
            ).toBe("carbon-data-task-group");
        });

        /**
         * CH05012018.31    Verify a foreground bar that is centered within a background bar is selectable
         * CH07252018.04    Verify the foreground bar displays centered within the background bar
         */
        it("Calls onClick function for foreground bar when foreground and background overlap and foreground is selectable", (done) => {
            const onClickSpy = sinon.spy();
            gantt.loadContent(
                Object.assign(getData(), {
                    trackLabel: {
                        display: "A"
                    },
                    tasks: [
                        {
                            key: "Task",
                            onClick: onClickSpy,
                            label: {
                                display: "Story Dino foreground"
                            },
                            startDate: taskStartDate,
                            endDate: taskEndDate
                        }
                    ],
                    activities: [
                        {
                            key: "Activity",
                            label: {
                                display: "Story Dino background"
                            },
                            startDate: taskStartDate,
                            endDate: taskEndDate
                        }
                    ]
                })
            );
            const trackElement = d3.select(`.${styles.trackGroup}`);
            expect(
                trackElement
                    .node()
                    .childNodes[1].childNodes[0].childNodes[0].getAttribute(
                        "height"
                    )
            ).toBe("31");
            expect(
                trackElement
                    .node()
                    .childNodes[2].childNodes[0].childNodes[1].getAttribute(
                        "height"
                    )
            ).toBe("23");

            triggerEvent(fetchElementByClass(styles.taskBar), "click", () => {
                expect(onClickSpy.calledOnce).toBeTruthy();
                expect(
                    fetchElementByClass(styles.task).getAttribute(
                        "aria-disabled"
                    )
                ).toBe("false");
                done();
            });
        });
    });

    describe("On Unload", () => {
        beforeEach(() => {
            loadData(gantt);
        });
        it("Does not throw error", () => {
            expect(() => {
                gantt.unloadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "Project A Really long"
                    }
                });
            }).not.toThrowError();
        });
        it("Removes tasks", () => {
            gantt.unloadContent({
                key: "track 1",
                trackLabel: {
                    display: "Project A Really long"
                }
            });
            expect(
                document.querySelectorAll(`.${styles.activityGroup}`).length
            ).toBe(0);
            expect(
                document.querySelectorAll(`.${styles.activity}`).length
            ).toBe(0);
        });
    });

    describe("On Resize", () => {
        beforeEach(() => {
            loadData(gantt);
        });
        it("Translates activities correctly", (done) => {
            const activityElement = fetchElementByClass(styles.activity);
            const barElement = activityElement.querySelector("rect");
            const currentTaskPosX = barElement.getAttribute("x");
            const currentTaskPosWidth = barElement.getAttribute("width");
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 400px;"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    const resizedBarElement = ganttChartContainer.querySelector(
                        `.${styles.activity} rect`
                    );
                    expect(resizedBarElement.getAttribute("x")).not.toEqual(
                        currentTaskPosX
                    );
                    expect(resizedBarElement.getAttribute("width")).not.toEqual(
                        currentTaskPosWidth
                    );
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });

    describe("helpers", () => {
        it("Returns stock color style if no style settings are provided", () => {
            expect(getActivityStyle()).toContain("fill");
            expect(getActivityStyle()).toContain(COLORS.BLUE);
        });
        it("Returns correct color as needed", () => {
            const styleSettings = getActivityStyle({
                color: COLORS.ORANGE
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(COLORS.ORANGE);
            expect(styleSettings).toContain("opacity");
        });
        it("Returns correct style when dotted bar is needed", () => {
            const styleSettings = getActivityStyle({
                style: {
                    isHashed: true
                }
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(
                constants.DEFAULT_ACTIVITY_BAR_HASH_COLOR
            );
            expect(styleSettings).toContain("opacity");
        });
    });

    describe("Pass Through's", () => {
        const activities = [
            {
                key: "activity",
                label: {
                    display: "Story Dino background"
                },
                startDate: taskStartDate,
                endDate: taskEndDate
            },
            {
                key: "activity",
                label: {
                    display: "Story Dino background"
                },
                startDate: taskStartDate,
                endDate: taskStartDate
            }
        ];
        describe("clickPassThrough - undefined", () => {
            beforeEach(() => {
                gantt.destroy();
                ganttChartContainer = document.createElement("div");
                ganttChartContainer.id = "testCarbonGantt";
                ganttChartContainer.setAttribute(
                    "style",
                    "width: 1024px; height: 400px;"
                );
                ganttChartContainer.setAttribute("class", "carbon-test-class");
                document.body.appendChild(ganttChartContainer);
                const globalPassThroughData = Object.assign(getAxes(axisJSON), {
                    showActionLegend: false
                });
                gantt = new Gantt(globalPassThroughData);
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "Project A Really long",
                            onClick: onClickFunctionSpy
                        },
                        activities
                    })
                );
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Prepares data with enableTaskPassThrough", () => {
                const d3ActivityElement = d3.select(`.${styles.activity}`);
                const activityData = d3ActivityElement.datum();
                expect(activityData.clickPassThrough).toEqual(false);
            });
            it("Renders bar correctly with pass through", () => {
                const activityElement = fetchElementByClass(styles.activity);
                expect(activityElement.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
            it("Renders chunk correctly with pass through", () => {
                const activityElement = document.querySelectorAll(
                    `.${styles.activity}`
                )[1];
                expect(activityElement.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
        });
        describe("clickPassThrough - true", () => {
            beforeEach(() => {
                gantt.destroy();
                ganttChartContainer = document.createElement("div");
                ganttChartContainer.id = "testCarbonGantt";
                ganttChartContainer.setAttribute(
                    "style",
                    "width: 1024px; height: 400px;"
                );
                ganttChartContainer.setAttribute("class", "carbon-test-class");
                document.body.appendChild(ganttChartContainer);
                const globalPassThroughData = Object.assign(getAxes(axisJSON), {
                    showActionLegend: false,
                    clickPassThrough: {
                        activities: true
                    }
                });
                gantt = new Gantt(globalPassThroughData);
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "Project A Really long",
                            onClick: onClickFunctionSpy
                        },
                        activities
                    })
                );
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Prepares data with enableTaskPassThrough", () => {
                const d3ActivityElement = d3.select(`.${styles.activity}`);
                const activityData = d3ActivityElement.datum();
                expect(activityData.clickPassThrough).toEqual(true);
            });
            it("Renders bar correctly with pass through", () => {
                const activityElement = fetchElementByClass(styles.activity);
                expect(activityElement.getAttribute("pointer-events")).toBe(
                    "none"
                );
            });
            it("Renders chunk correctly with pass through", () => {
                const activityElement = document.querySelectorAll(
                    `.${styles.activity}`
                )[1];
                expect(activityElement.getAttribute("pointer-events")).toBe(
                    "none"
                );
            });
        });
        describe("clickPassThrough - false", () => {
            beforeEach(() => {
                gantt.destroy();
                ganttChartContainer = document.createElement("div");
                ganttChartContainer.id = "testCarbonGantt";
                ganttChartContainer.setAttribute(
                    "style",
                    "width: 1024px; height: 400px;"
                );
                ganttChartContainer.setAttribute("class", "carbon-test-class");
                document.body.appendChild(ganttChartContainer);
                const globalPassThroughData = Object.assign(getAxes(axisJSON), {
                    showActionLegend: false,
                    clickPassThrough: {
                        activities: false
                    }
                });
                gantt = new Gantt(globalPassThroughData);
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "Project A Really long",
                            onClick: onClickFunctionSpy
                        },
                        activities
                    })
                );
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Prepares data with enableTaskPassThrough", () => {
                const d3ActivityElement = d3.select(`.${styles.activity}`);
                const activityData = d3ActivityElement.datum();
                expect(activityData.clickPassThrough).toEqual(false);
            });
            it("Renders bar correctly with pass through", () => {
                const activityElement = fetchElementByClass(styles.activity);
                expect(activityElement.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
            it("Renders chunk correctly with pass through", () => {
                const activityElement = document.querySelectorAll(
                    `.${styles.activity}`
                )[1];
                expect(activityElement.getAttribute("pointer-events")).toBe(
                    "auto"
                );
            });
        });
    });
});
