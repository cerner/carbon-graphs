"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import {
    calculatePercentage,
    getEndDuration,
    getStartDuration,
    getTaskStyle,
    isAChunk
} from "../../../../main/js/controls/Gantt/helpers/durationHelpers";
import {
    getBar,
    getChunk,
    getHashedBar,
    getPercentageBar
} from "../../../../main/js/helpers/barType";
import constants, { COLORS } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import {
    delay,
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    onClickFunctionSpy,
    taskEndDate,
    taskStartDate,
    taskValuesJSON
} from "./helpers";

describe("Gantt -> Track -> Task", () => {
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
                tasks: taskValuesJSON
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
                            tasks: [{}]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("Throws error when no key is loaded", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: ""
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_TASKS_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("Throws error when no start date and no end date is provided", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "DummyKey"
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_TASKS_START_AND_END_NOT_PROVIDED
                );
            });
            it("Throws error when no start date is provided", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "DummyKey",
                                    endDate: new Date(2018, 3, 1).toISOString()
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_TASKS_DURATION_NOT_PROVIDED);
            });
            it("Throws error when no end date is provided", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
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
                }).toThrowError(errors.THROW_MSG_TASKS_DURATION_NOT_PROVIDED);
            });
            it("Throws error when start date is invalid type", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "uid_task_1",
                                    startDate: "Different Type",
                                    duration: () => daysToMilliseconds(1)
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_TASKS_START_AND_END_TYPE_NOT_VALID
                );
            });
            it("Throws error when end date is invalid type", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "uid_task_1",
                                    endDate: "Different Type",
                                    duration: () => daysToMilliseconds(1)
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_TASKS_START_AND_END_TYPE_NOT_VALID
                );
            });
            it("Throws error when duration is not a function", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "uid_task_1",
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
                }).toThrowError(errors.THROW_MSG_TASKS_DURATION_NOT_FUNCTION);
            });
            it("Throws error when duration function does not return a function", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "uid_task_1",
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
                }).toThrowError(errors.THROW_MSG_TASKS_DURATION_NOT_VALID);
            });
            it("Throws error when start date is larger than end date", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "uid_task_1",
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
                }).toThrowError(errors.THROW_MSG_TASKS_START_MORE_END);
            });
            it("Does not throw error when duration is provided and no start date", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            tasks: [
                                {
                                    key: "uid_task_1",
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
                            tasks: [
                                {
                                    key: "uid_task_1",
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
        it("Renders task group correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskGroup = document.querySelectorAll(
                    `.${styles.taskGroup}`
                );
                expect(taskGroup.length).toBe(1);
                expect(taskGroup[0].childNodes.length).toBe(4);
                expect(taskGroup[0].getAttribute("transform")).not.toBeNull();
                done();
            });
        });
        it("Adds data to each task correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskGroupElement = document.querySelectorAll(
                    `.${styles.task}`
                );
                taskGroupElement.forEach((t) => {
                    expect(d3.select(t).datum()).not.toBeUndefined();
                });
                done();
            });
        });
        it("Prepares task", (done) => {
            loadData(gantt);
            delay(() => {
                const d3TaskElement = d3.select(`.${styles.task}`);
                const taskData = d3TaskElement.datum();
                expect(taskData.key).toBe(taskValuesJSON[0].key);
                expect(taskData.y).toBe("Project A Really long");
                expect(taskData.onClick).toEqual(jasmine.any(Function));
                expect(taskData.color).toBe(COLORS.BLUE);
                expect(taskData.startDate).toEqual(
                    new Date(taskValuesJSON[0].startDate)
                );
                expect(taskData.endDate).toEqual(
                    new Date(taskValuesJSON[0].endDate)
                );
                expect(taskData.percentage).toEqual(
                    taskValuesJSON[0].percentage
                );
                expect(taskData.dependancies).toEqual(
                    taskValuesJSON[0].dependancies
                );
                expect(taskData.label).toEqual(taskValuesJSON[0].label);
                expect(taskData.style).toContain("fill");
                expect(taskData.style).toContain(COLORS.BLUE);
                expect(taskData.style).toContain("stroke");
                expect(taskData.clickPassThrough).toEqual(false);
                done();
            });
        });
        it("Renders bar correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.nodeName).toBe("g");
                expect(taskElement.getAttribute("class")).toBe(styles.task);
                expect(taskElement.getAttribute("aria-selected")).toBe("false");
                expect(taskElement.getAttribute("aria-describedby")).toBe(
                    taskValuesJSON[0].key
                );
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                expect(taskElement.childNodes.length).toBe(2);
                expect(taskElement.childNodes[1]).not.toBeNull();
                expect(taskElement.childNodes[1].nodeName).toBe("rect");
                expect(taskElement.childNodes[1].getAttribute("class")).toBe(
                    styles.taskBar
                );
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain(COLORS.BLUE);
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain("fill");
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain("stroke");
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("y"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("width"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("height"))
                ).toBeGreaterThan(0);
                done();
            });
        });
        it("Renders chunk correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.nodeName).toBe("g");
                expect(taskElement.getAttribute("class")).toBe(styles.task);
                expect(taskElement.getAttribute("aria-selected")).toBe("false");
                expect(taskElement.getAttribute("aria-describedby")).toBe(
                    taskValuesJSON[1].key
                );
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                expect(taskElement.childNodes.length).toBe(2);
                expect(taskElement.childNodes[1]).not.toBeNull();
                expect(taskElement.childNodes[1].nodeName).toBe("rect");
                expect(taskElement.childNodes[1].getAttribute("class")).toBe(
                    styles.taskBar
                );
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain(COLORS.BLUE);
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain("fill");
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain("stroke");
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("y"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("width"))
                ).toBe(5);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("height"))
                ).toBeGreaterThan(0);
                done();
            });
        });
        it("Renders percentage bar correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[2];
                expect(taskElement.nodeName).toBe("g");
                expect(taskElement.getAttribute("class")).toBe(styles.task);
                expect(taskElement.getAttribute("aria-describedby")).toBe(
                    taskValuesJSON[2].key
                );
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                expect(taskElement.getAttribute("aria-selected")).toBe("false");
                expect(taskElement.childNodes.length).toBe(3);
                expect(taskElement.childNodes[1]).not.toBeNull();
                expect(taskElement.childNodes[2]).not.toBeNull();

                expect(taskElement.childNodes[1].nodeName).toBe("rect");
                expect(taskElement.childNodes[2].nodeName).toBe("rect");

                expect(taskElement.childNodes[1].getAttribute("class")).toBe(
                    styles.taskBar
                );
                expect(taskElement.childNodes[2].getAttribute("class")).toBe(
                    styles.taskBarCompletion
                );

                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain(COLORS.WHITE);
                expect(
                    taskElement.childNodes[2].getAttribute("style")
                ).toContain("fill");
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain("stroke");
                expect(
                    taskElement.childNodes[1].getAttribute("style")
                ).toContain("stroke-width");
                expect(
                    taskElement.childNodes[2].getAttribute("style")
                ).toContain(COLORS.BLUE);

                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("y"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("width"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[1].getAttribute("height"))
                ).toBeGreaterThan(0);

                expect(
                    toNumber(taskElement.childNodes[2].getAttribute("x"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[2].getAttribute("y"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[2].getAttribute("width"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[2].getAttribute("height"))
                ).toBeGreaterThan(0);
                expect(
                    toNumber(taskElement.childNodes[2].getAttribute("width"))
                ).toBeLessThan(
                    toNumber(taskElement.childNodes[1].getAttribute("width"))
                );
                // Check if the percentage is actually 50% of the entire bar
                expect(
                    toNumber(
                        taskElement.childNodes[2].getAttribute("width"),
                        10
                    )
                ).toEqual(
                    toNumber(
                        taskElement.childNodes[1].getAttribute("width") / 2,
                        10
                    )
                );
                done();
            });
        });
        it("Renders selection for bar correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                const indicatorElement = taskElement.childNodes[0];
                const taskBarElement = taskElement.childNodes[1];
                expect(indicatorElement).not.toBeNull();
                expect(indicatorElement.nodeName).toBe("rect");
                expect(indicatorElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(indicatorElement.getAttribute("rx")).toBe("3");
                expect(indicatorElement.getAttribute("ry")).toBe("3");
                expect(indicatorElement.getAttribute("class")).toBe(
                    styles.taskBarSelection
                );
                expect(
                    toNumber(indicatorElement.getAttribute("x"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("x")));
                expect(
                    toNumber(indicatorElement.getAttribute("y"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("y")));
                expect(
                    toNumber(indicatorElement.getAttribute("width"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("width"))
                );
                expect(
                    toNumber(indicatorElement.getAttribute("height"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("height"))
                );
                done();
            }, TRANSITION_DELAY);
        });
        it("Renders selection for chunk correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                const indicatorElement = taskElement.childNodes[0];
                const taskBarElement = taskElement.childNodes[1];
                expect(indicatorElement).not.toBeNull();
                expect(indicatorElement.nodeName).toBe("rect");
                expect(indicatorElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(indicatorElement.getAttribute("rx")).toBe("3");
                expect(indicatorElement.getAttribute("ry")).toBe("3");
                expect(indicatorElement.getAttribute("class")).toBe(
                    styles.taskBarSelection
                );
                expect(
                    toNumber(indicatorElement.getAttribute("x"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("x")));
                expect(
                    toNumber(indicatorElement.getAttribute("y"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("y")));
                expect(
                    toNumber(indicatorElement.getAttribute("width"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("width"))
                );
                expect(
                    toNumber(indicatorElement.getAttribute("height"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("height"))
                );
                done();
            }, TRANSITION_DELAY);
        });
        it("Renders selection for percentage bar correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[2];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                const indicatorElement = taskElement.childNodes[0];
                const taskBarElement = taskElement.childNodes[1];
                expect(indicatorElement).not.toBeNull();
                expect(indicatorElement.nodeName).toBe("rect");
                expect(indicatorElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(indicatorElement.getAttribute("rx")).toBe("3");
                expect(indicatorElement.getAttribute("ry")).toBe("3");
                expect(indicatorElement.getAttribute("class")).toBe(
                    styles.taskBarSelection
                );
                expect(
                    toNumber(indicatorElement.getAttribute("x"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("x")));
                expect(
                    toNumber(indicatorElement.getAttribute("y"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("y")));
                expect(
                    toNumber(indicatorElement.getAttribute("width"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("width"))
                );
                expect(
                    toNumber(indicatorElement.getAttribute("height"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("height"))
                );
                done();
            }, TRANSITION_DELAY);
        });
        it("Renders selection for hashed tasks correctly", (done) => {
            loadData(gantt);
            delay(() => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[3];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
                const indicatorElement = taskElement.childNodes[0];
                const taskBarElement = taskElement.childNodes[1];
                expect(indicatorElement).not.toBeNull();
                expect(indicatorElement.nodeName).toBe("rect");
                expect(indicatorElement.getAttribute("aria-hidden")).toBe(
                    "true"
                );
                expect(indicatorElement.getAttribute("rx")).toBe("3");
                expect(indicatorElement.getAttribute("ry")).toBe("3");
                expect(indicatorElement.getAttribute("class")).toBe(
                    styles.taskBarSelection
                );
                expect(
                    toNumber(indicatorElement.getAttribute("x"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("x")));
                expect(
                    toNumber(indicatorElement.getAttribute("y"))
                ).toBeLessThan(toNumber(taskBarElement.getAttribute("y")));
                expect(
                    toNumber(indicatorElement.getAttribute("width"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("width"))
                );
                expect(
                    toNumber(indicatorElement.getAttribute("height"))
                ).toBeGreaterThan(
                    toNumber(taskBarElement.getAttribute("height"))
                );
                done();
            }, TRANSITION_DELAY);
        });
        describe("When clicked on a task", () => {
            it("Does not do anything if no onClick callback is provided - Normal", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("Does not do anything if invalid onClick callback is provided", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                label: {
                                    display: "Story Apex"
                                },
                                onClick: null,
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("Does not do anything if no onClick callback is provided - Chunk", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskChunk",
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskStartDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("Does not do anything if no onClick callback is provided - Percentage", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                label: {
                                    display: "Story Apex"
                                },
                                percentage: 30,
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("Calls onClick callback for a normal bar", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("Emits correct parameters for a normal bar", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            },
                            {
                                key: "taskNormal_2",
                                label: {
                                    display: "Story Beta"
                                },
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                startDate: new Date(2018, 3, 1).toISOString(),
                                endDate: new Date(2018, 6, 1).toISOString()
                            }
                        ]
                    })
                );
                triggerEvent(
                    document.querySelectorAll(`.${styles.taskBar}`)[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("taskNormal_2");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.label.display).toEqual("Story Beta");
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            it("Calls onClick callback for a chunk", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskChunk",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskStartDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("Emits correct parameters for a chunk", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskStartDate
                            },
                            {
                                key: "taskNormal_2",
                                label: {
                                    display: "Story Beta"
                                },
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                startDate: new Date(2018, 3, 1).toISOString(),
                                endDate: new Date(2018, 3, 1).toISOString()
                            }
                        ]
                    })
                );
                triggerEvent(
                    document.querySelectorAll(`.${styles.taskBar}`)[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("taskNormal_2");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.label.display).toEqual("Story Beta");
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            it("Calls onClick callback for a percentage bar", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                percentage: 30,
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("Calls onClick callback for hashed bar", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskEndDate,
                                style: {
                                    isHashed: true
                                }
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("Emits correct parameters for a percentage bar", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskPercentage_1",
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskStartDate
                            },
                            {
                                key: "taskPercentage_2",
                                label: {
                                    display: "Story Beta"
                                },
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                percentage: 30,
                                startDate: new Date(2018, 3, 1).toISOString(),
                                endDate: new Date(2018, 6, 1).toISOString()
                            }
                        ]
                    })
                );
                triggerEvent(
                    document.querySelectorAll(`.${styles.taskBar}`)[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("taskPercentage_2");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.label.display).toEqual("Story Beta");
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            it("Calls onClick callback for a percentage bar when clicked on completion bar", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                percentage: 30,
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBarCompletion),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("Emits correct parameters for a hashed task bar", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskHash_1",
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskStartDate,
                                style: {
                                    isHashed: true
                                }
                            },
                            {
                                key: "taskHash_2",
                                label: {
                                    display: "Story Beta"
                                },
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                startDate: new Date(2018, 3, 1).toISOString(),
                                endDate: new Date(2018, 6, 1).toISOString(),
                                style: {
                                    isHashed: true
                                }
                            }
                        ]
                    })
                );
                triggerEvent(
                    document.querySelectorAll(`.${styles.task}`)[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("taskHash_2");
                        expect(args.val).not.toBeNull();
                        expect(args.val.label.display).toEqual("Story Beta");
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            /**
             * CH05012018.31    Verify the hashed foreground bar is selectable
             */
            it("Calls onClick callback for a hashed task bar when clicked on completion bar", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskHash",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                percentage: 30,
                                startDate: taskStartDate,
                                endDate: taskEndDate,
                                style: {
                                    isHashed: true
                                }
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBarCompletion),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-disabled"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("Removes selection when task bar is clicked again", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "A"
                        },
                        tasks: [
                            {
                                key: "taskNormal",
                                onClick: onClickFunctionSpy,
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                const point = fetchElementByClass(styles.taskBar);
                triggerEvent(point, "click", () => {
                    triggerEvent(point, "click", () => {
                        expect(
                            fetchElementByClass(styles.task).getAttribute(
                                "aria-selected"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    });
                });
            });
            it("Removes task bar selection when parameter callback is called", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        tasks: [
                            {
                                key: "taskNormal",
                                onClick: (clearSelectionCallback) =>
                                    clearSelectionCallback(),
                                label: {
                                    display: "Story Apex"
                                },
                                startDate: taskStartDate,
                                endDate: taskEndDate
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.taskBar),
                    "click",
                    () => {
                        const taskElement = fetchElementByClass(styles.task);
                        expect(taskElement.getAttribute("aria-selected")).toBe(
                            "false"
                        );
                        expect(
                            taskElement.getAttribute("aria-describedby")
                        ).toBe("taskNormal");
                        expect(
                            fetchElementByClass(
                                styles.taskBarSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    },
                    TRANSITION_DELAY
                );
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
                document.querySelectorAll(`.${styles.taskGroup}`).length
            ).toBe(0);
            expect(document.querySelectorAll(`.${styles.task}`).length).toBe(0);
        });
    });
    describe("On Resize", () => {
        beforeEach(() => {
            loadData(gantt);
        });
        it("Translates tasks correctly", (done) => {
            const taskElement = fetchElementByClass(styles.task);
            const barElement = taskElement.querySelector("rect");
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
                        `.${styles.task} rect`
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
        it("Translates percentage bar correctly", (done) => {
            const percentageBar = document.querySelectorAll(
                `.${styles.task} rect`
            )[2];
            const completionBar = fetchElementByClass(styles.taskBarCompletion);
            const currentTaskPosX = percentageBar.getAttribute("x");
            const currentTaskPosWidth = percentageBar.getAttribute("width");
            const completionTaskPosX = completionBar.getAttribute("x");
            const completionTaskPosWidth = completionBar.getAttribute("width");
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 400px;"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    const resizedBarElement = ganttChartContainer.querySelectorAll(
                        `.${styles.taskBar}`
                    )[2];
                    const resizedCompletionBarElement = ganttChartContainer.querySelector(
                        `.${styles.taskBarCompletion}`
                    );
                    expect(resizedBarElement.getAttribute("x")).not.toEqual(
                        currentTaskPosX
                    );
                    expect(resizedBarElement.getAttribute("width")).not.toEqual(
                        currentTaskPosWidth
                    );
                    expect(
                        resizedCompletionBarElement.getAttribute("x")
                    ).not.toEqual(completionTaskPosX);
                    expect(
                        resizedCompletionBarElement.getAttribute("width")
                    ).not.toEqual(completionTaskPosWidth);
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });
    describe("Duration Helpers", () => {
        const duration = 2 * 24 * 60 * 60 * 1000;
        it("Gets end date correctly when no duration = Same as start Date", () => {
            expect(getEndDuration(undefined, taskStartDate, "")).toEqual(
                new Date(new Date(2018, 2, 1).getTime())
            );
        });
        it("Gets end date with duration", () => {
            expect(getEndDuration(duration, taskStartDate, "")).toEqual(
                new Date(new Date(2018, 2, 3).getTime())
            );
        });
        it("Returns end duration if date is already present", () => {
            expect(
                getEndDuration(undefined, taskStartDate, taskEndDate)
            ).toEqual(new Date(new Date(2018, 5, 10).getTime()));
        });
        it("Gets start date correctly when no duration", () => {
            expect(getStartDuration(undefined, "", taskEndDate)).toEqual(
                new Date(new Date(2018, 5, 10).getTime())
            );
        });
        it("Gets start date with duration", () => {
            expect(getStartDuration(duration, "", taskEndDate)).toEqual(
                new Date(new Date(2018, 5, 8).getTime())
            );
        });
        it("Returns start duration if date is already present", () => {
            expect(
                getStartDuration(duration, taskStartDate, taskEndDate)
            ).toEqual(new Date(new Date(2018, 2, 1).getTime()));
        });
        it("Checks if data is a chunk correctly", () => {
            expect(
                isAChunk(
                    new Date(2018, 2, 1).toISOString(),
                    new Date(2018, 2, 1).toISOString()
                )
            ).toBeTruthy();
            expect(
                isAChunk(
                    new Date(2018, 2, 1).toISOString(),
                    new Date(2018, 3, 1).toISOString()
                )
            ).toBeFalsy();
        });
        it("Calculates percentage correctly when end and start bounds are provided", () => {
            expect(calculatePercentage(0, 100, 50)).toBe(50);
        });
        it("Returns stock color style if no style settings are provided", () => {
            expect(getTaskStyle()).toContain("fill");
            expect(getTaskStyle()).toContain(COLORS.BLUE);
            expect(getTaskStyle()).toContain("stroke");
        });
        it("Returns correct color as needed", () => {
            const styleSettings = getTaskStyle({
                color: COLORS.ORANGE
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(COLORS.ORANGE);
        });
        it("Returns correct style when dotted bar is needed", () => {
            const styleSettings = getTaskStyle({
                style: {
                    isDotted: true
                }
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(COLORS.BLUE);
            expect(styleSettings).toContain("stroke-dasharray");
        });
        it("Returns correct style when dotted bar is needed", () => {
            const styleSettings = getTaskStyle({
                style: {
                    isHashed: true
                }
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(
                constants.DEFAULT_TASK_BAR_HASH_COLOR
            );
        });
        it("Returns correct style when hollow bar is needed", () => {
            const styleSettings = getTaskStyle({
                style: {
                    isHollow: true
                }
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(COLORS.WHITE);
            expect(styleSettings).toContain("stroke");
            expect(styleSettings).toContain(COLORS.BLUE);
        });
        it("Returns correct style when hollow dotted bar is needed", () => {
            const styleSettings = getTaskStyle({
                style: {
                    isHollow: true,
                    isDotted: true
                }
            });
            expect(styleSettings).toContain("fill");
            expect(styleSettings).toContain(COLORS.WHITE);
            expect(styleSettings).toContain("stroke-dasharray");
            expect(styleSettings).toContain(COLORS.BLUE);
        });
    });
    describe("On init of bars", () => {
        it("Renders Normal bar correctly", () => {
            gantt.destroy();
            getBar(
                d3.select(ganttChartContainer),
                0,
                0,
                400,
                50,
                getTaskStyle()
            );
            const taskElement = fetchElementByClass(styles.taskBar);
            expect(taskElement.nodeName).toBe("RECT");
            expect(taskElement.getAttribute("x")).toEqual("0");
            expect(taskElement.getAttribute("y")).toEqual("0");
            expect(taskElement.getAttribute("height")).toEqual("50");
            expect(taskElement.getAttribute("width")).toEqual("400");
            expect(taskElement.getAttribute("class")).toEqual(styles.taskBar);
        });
        it("Renders Chunk bar correctly", () => {
            gantt.destroy();
            getChunk(
                d3.select(ganttChartContainer),
                0,
                0,
                400,
                50,
                getTaskStyle()
            );
            const taskElement = fetchElementByClass(styles.taskBar);
            expect(taskElement.nodeName).toBe("RECT");
            expect(taskElement.getAttribute("x")).toEqual("0");
            expect(taskElement.getAttribute("y")).toEqual("0");
            expect(taskElement.getAttribute("height")).toEqual("50");
            expect(taskElement.getAttribute("width")).toEqual("5");
            expect(taskElement.getAttribute("class")).toEqual(styles.taskBar);
        });
        it("Renders Percentage bar correctly", () => {
            gantt.destroy();
            const percentageWidth = (50 * 400) / 100;
            getPercentageBar(
                d3.select(ganttChartContainer),
                0,
                0,
                400,
                50,
                percentageWidth,
                getTaskStyle()
            );
            const taskBar = fetchElementByClass(styles.taskBar);
            const completionBar = fetchElementByClass(styles.taskBarCompletion);
            expect(taskBar.nodeName).toBe("RECT");
            expect(taskBar.getAttribute("x")).toEqual("0");
            expect(taskBar.getAttribute("y")).toEqual("0");
            expect(taskBar.getAttribute("height")).toEqual("50");
            expect(taskBar.getAttribute("width")).toEqual("400");
            expect(taskBar.getAttribute("style")).toContain(COLORS.WHITE);

            expect(completionBar.nodeName).toBe("RECT");
            expect(completionBar.getAttribute("x")).toEqual("0");
            expect(completionBar.getAttribute("y")).toEqual("0");
            expect(completionBar.getAttribute("height")).toEqual("50");
            expect(toNumber(completionBar.getAttribute("width"))).toEqual(
                percentageWidth
            );
        });
        it("Renders Hashed bar correctly", () => {
            gantt.destroy();
            getHashedBar(
                d3.select(ganttChartContainer),
                d3.select(ganttChartContainer).append("defs"),
                d3.select(ganttChartContainer),
                0,
                0,
                400,
                50,
                COLORS.BLUE
            );
            const taskBarElements = document.querySelectorAll(
                `.${styles.taskBar}`
            );
            expect(taskBarElements[0].nodeName).toBe("RECT");
            expect(taskBarElements[0].getAttribute("style")).toContain(
                COLORS.BLUE
            );
            expect(taskBarElements[1].nodeName).toBe("RECT");
            expect(taskBarElements[1].getAttribute("style")).toContain("url");
        });
        /**
         * CH07252018.01    Verify duration can be displayed using a hashed, default (filled) task foreground bar
         */
        it("Renders hashed bar correctly with default color", () => {
            const tasks = [
                {
                    key: "task",
                    onClick: sinon.spy(),
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
                    tasks
                })
            );
            const taskElement = fetchElementByClass(styles.task);
            const defsElement = document.getElementById("pattern-stripe");

            expect(defsElement.getAttribute("patternUnits")).toBe(
                "userSpaceOnUse"
            );
            expect(defsElement.getAttribute("patternTransform")).toBe(
                "rotate(45)"
            );
            expect(defsElement.getAttribute("style")).toBe("fill: #fff;");
            expect(defsElement.childNodes.length).toBe(1);
            expect(defsElement.childNodes[0].nodeName).toBe("rect");
            expect(taskElement.getAttribute("aria-selected")).toEqual("false");
            expect(taskElement.getAttribute("aria-describedby")).toEqual(
                "task"
            );
            expect(taskElement.childNodes[2].getAttribute("style")).toEqual(
                "fill: url(#pattern-stripe);"
            );
        });

        /**
         * CH07252018.03    Verify the foreground bar displays at the top of the row
         */
        it("Renders task bar at the top", () => {
            const tasks = [
                {
                    key: "task",
                    onClick: sinon.spy(),
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
                    tasks,
                    dimension: {
                        trackHeight: 160
                    }
                })
            );
            const taskElement = fetchElementByClass(styles.taskBar);
            // 23 px height, even when track length is 160
            expect(taskElement.getAttribute("height")).toEqual("23");
        });
    });
    describe("Pass Through's", () => {
        const tasks = [
            {
                key: "taskNormal",
                label: {
                    display: "Story Apex Task Something"
                },
                startDate: taskStartDate,
                endDate: taskEndDate
            },
            {
                key: "taskChunk",
                label: {
                    display: "Story Broccoli"
                },
                startDate: taskStartDate,
                endDate: taskStartDate
            },
            {
                key: "taskPercentage",
                label: {
                    display: "Story Charming"
                },
                percentage: 50,
                startDate: taskStartDate,
                endDate: taskEndDate
            },
            {
                key: "taskHash",
                label: {
                    display: "Story Charming"
                },
                startDate: taskStartDate,
                endDate: taskEndDate,
                style: {
                    isHashed: true
                }
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
                        tasks
                    })
                );
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Prepares data with clickPassThrough", () => {
                const d3TaskElement = d3.select(`.${styles.task}`);
                const taskData = d3TaskElement.datum();
                expect(taskData.clickPassThrough).toEqual(false);
            });
            it("Renders bar correctly with pass through", () => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders chunk correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for bar correctly with pass through", () => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for chunk correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for percentage bar correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[2];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for hashed tasks correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[3];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
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
                        tasks: true
                    }
                });
                gantt = new Gantt(globalPassThroughData);
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "Project A Really long",
                            onClick: onClickFunctionSpy
                        },
                        tasks
                    })
                );
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Prepares data with clickPassThrough", () => {
                const d3TaskElement = d3.select(`.${styles.task}`);
                const taskData = d3TaskElement.datum();
                expect(taskData.clickPassThrough).toEqual(true);
            });
            it("Renders bar correctly with pass through", () => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("none");
            });
            it("Renders chunk correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("none");
            });
            it("Renders selection for bar correctly with pass through", () => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("none");
            });
            it("Renders selection for chunk correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("none");
            });
            it("Renders selection for percentage bar correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[2];
                expect(taskElement.getAttribute("pointer-events")).toBe("none");
            });
            it("Renders selection for hashed tasks correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[3];
                expect(taskElement.getAttribute("pointer-events")).toBe("none");
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
                        tasks: false
                    }
                });
                gantt = new Gantt(globalPassThroughData);
                gantt.loadContent(
                    Object.assign(getData(), {
                        trackLabel: {
                            display: "Project A Really long",
                            onClick: onClickFunctionSpy
                        },
                        tasks
                    })
                );
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Prepares data with clickPassThrough", () => {
                const d3TaskElement = d3.select(`.${styles.task}`);
                const taskData = d3TaskElement.datum();
                expect(taskData.clickPassThrough).toEqual(false);
            });
            it("Renders bar correctly with pass through", () => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders chunk correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for bar correctly with pass through", () => {
                const taskElement = fetchElementByClass(styles.task);
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for chunk correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[1];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for percentage bar correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[2];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
            it("Renders selection for hashed tasks correctly with pass through", () => {
                const taskElement = document.querySelectorAll(
                    `.${styles.task}`
                )[3];
                expect(taskElement.getAttribute("pointer-events")).toBe("auto");
            });
        });
    });
});
