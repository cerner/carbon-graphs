"use strict";
import d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../main/js/controls/Gantt";
import { COLORS, SHAPES } from "../../../main/js/helpers/constants";
import errors from "../../../main/js/helpers/errors";
import styles from "../../../main/js/helpers/styles";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    legendJSON,
    TRANSITION_DELAY,
    triggerEvent
} from "./helpers";

describe("Gantt -> Track -> Action", () => {
    let gantt = null;
    let ganttChartContainer;
    const axisData = Object.assign(getAxes(axisJSON), {
        showActionLegend: true,
        actionLegend: legendJSON
    });
    const getTranslate = (el) =>
        d3.transform(d3.select(el).attr("transform")).translate;
    const xVal = new Date(2018, 4, 1, 6, 15).toISOString();
    const loadData = (gantt) =>
        gantt.loadContent(
            Object.assign(getData(), {
                actions: [
                    {
                        key: "uid_action_1",
                        onClick: sinon.spy(),
                        values: [xVal]
                    },
                    {
                        key: "uid_action_2",
                        onClick: sinon.spy(),
                        values: [xVal]
                    }
                ]
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
                            actions: [{}]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("Throws error when no key is loaded", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions: [
                                {
                                    key: "",
                                    values: []
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
            });
            it("Throws error when no values are loaded", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions: [
                                {
                                    key: "DummyKey",
                                    values: []
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
            });
            it("Throws error when key is not matching legend key", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions: [
                                {
                                    key: "uid_action_Dummy",
                                    values: [
                                        new Date(
                                            2018,
                                            4,
                                            1,
                                            6,
                                            15
                                        ).toISOString()
                                    ]
                                }
                            ]
                        })
                    );
                }).toThrowError(
                    errors.THROW_MSG_UNIQUE_ACTION_KEY_NOT_PROVIDED
                );
            });
            it("Throws error when values are invalid type", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions: [
                                {
                                    key: "uid_action_1",
                                    values: ["THIS IS CLEARLY NOT A DATE"]
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
            });
            it("Does not throw error when valid", () => {
                expect(() => {
                    loadData(gantt);
                }).not.toThrowError();
            });
        });
        it("Prepares actions", () => {
            loadData(gantt);
            const d3DataPointElement = d3.select(`.${styles.point}`);
            const actionData = d3DataPointElement.datum();
            expect(actionData.key).toBe(legendJSON[0].key);
            expect(actionData.onClick).toEqual(jasmine.any(Function));
            expect(actionData.shape).toBe(SHAPES.CIRCLE);
            expect(actionData.color).toBe(COLORS.BLUE);
            expect(actionData.label.display).toBe(legendJSON[0].label.display);
            expect(actionData.y).toBe("Project A");
            expect(actionData.x).toEqual(new Date(xVal));
        });
        it("Renders action groups correctly", () => {
            loadData(gantt);
            const pointsGroupElement = document.querySelectorAll(
                `.${styles.currentPointsGroup}`
            );
            expect(pointsGroupElement.length).toBe(2);
            expect(pointsGroupElement[0].childNodes.length).toBe(1);
            expect(pointsGroupElement[1].childNodes.length).toBe(1);
            expect(
                pointsGroupElement[0].getAttribute("transform")
            ).not.toBeNull();
        });
        it("Renders data points correctly", () => {
            loadData(gantt);
            const pointElement = fetchElementByClass(styles.point);
            expect(pointElement.nodeName).toBe("path");
            expect(pointElement.getAttribute("class")).toBe(styles.point);
            expect(pointElement.getAttribute("d")).not.toBeNull();
            expect(pointElement.getAttribute("style")).toContain(COLORS.BLUE);
            expect(pointElement.getAttribute("aria-describedby")).toBe(
                "uid_action_1"
            );
            expect(pointElement.getAttribute("aria-hidden")).toBe("false");
        });
        it("Renders multiple data sets correctly", () => {
            gantt.loadContent(
                Object.assign(getData(), {
                    actions: [
                        {
                            key: "uid_action_1",
                            onClick: sinon.spy(),
                            values: [new Date(2018, 4, 1).toISOString()]
                        },
                        {
                            key: "uid_action_2",
                            onClick: sinon.spy(),
                            values: [new Date(2018, 4, 10).toISOString()]
                        }
                    ]
                })
            );
            const pointElements = document.querySelectorAll(`.${styles.point}`);
            expect(pointElements.length).toBe(2);
            expect(pointElements[0].getAttribute("aria-describedby")).toBe(
                "uid_action_1"
            );
            expect(pointElements[1].getAttribute("aria-describedby")).toBe(
                "uid_action_2"
            );
            expect(pointElements[0].getAttribute("transform")).not.toBe(
                pointElements[1].getAttribute("transform")
            );
        });
        it("Renders data points in different tracks correctly", () => {
            gantt.loadContent(
                Object.assign(getData(), {
                    actions: [
                        {
                            key: "uid_action_1",
                            onClick: sinon.spy(),
                            values: [new Date(2018, 4, 1).toISOString()]
                        }
                    ]
                })
            );
            gantt.loadContent(
                Object.assign(getData(), {
                    key: "track 2",
                    actions: [
                        {
                            key: "uid_action_2",
                            onClick: sinon.spy(),
                            values: [new Date(2018, 4, 1).toISOString()]
                        }
                    ]
                })
            );
            const pointElements = document.querySelectorAll(`.${styles.point}`);
            expect(pointElements.length).toBe(2);
            expect(pointElements[0].getAttribute("aria-describedby")).toBe(
                "uid_action_1"
            );
            expect(pointElements[1].getAttribute("aria-describedby")).toBe(
                "uid_action_2"
            );
            expect(pointElements[0].getAttribute("transform")).not.toBe(
                pointElements[1].getAttribute("transform")
            );
        });
        it("Renders selection data points correctly", () => {
            loadData(gantt);
            const selectionPointElement = fetchElementByClass(
                styles.dataPointSelection
            );
            expect(selectionPointElement.nodeName).toBe("circle");
            expect(selectionPointElement.getAttribute("class")).toBe(
                styles.dataPointSelection
            );
            expect(selectionPointElement.getAttribute("d")).not.toBeNull();
            expect(selectionPointElement.getAttribute("aria-describedby")).toBe(
                "uid_action_1"
            );
            expect(selectionPointElement.getAttribute("aria-hidden")).toBe(
                "true"
            );
        });
        it("Renders data points correctly with default color and shape", () => {
            gantt.destroy();
            const axisData = Object.assign(getAxes(axisJSON), {
                actionLegend: [
                    {
                        key: "uid_action_1",
                        label: {
                            display: "Action A"
                        }
                    },
                    {
                        key: "uid_action_2",
                        label: {
                            display: "Action B"
                        }
                    }
                ]
            });
            gantt = new Gantt(axisData);
            loadData(gantt);
            const pointElement = fetchElementByClass(styles.point);
            expect(pointElement.nodeName).toBe("path");
            expect(pointElement.getAttribute("class")).toBe(styles.point);
            expect(pointElement.getAttribute("style")).toContain(COLORS.BLACK);
        });
        describe("When clicked on a data point", () => {
            it("Does not do anything if no onClick callback is provided", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(fetchElementByClass(styles.point), "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBeFalsy();
                    done();
                });
            });
            it("Removes highlight when data point is clicked again", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: onClickFunctionSpy,
                                values: [xVal]
                            }
                        ]
                    })
                );
                const point = fetchElementByClass(styles.point);
                triggerEvent(point, "click", () => {
                    triggerEvent(point, "click", () => {
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    });
                });
            });
            it("Hides data point selection when parameter callback is called", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: (clearSelectionCallback) =>
                                    clearSelectionCallback(),
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.point),
                    "click",
                    () => {
                        const pointElement = fetchElementByClass(
                            styles.dataPointSelection
                        );
                        expect(pointElement.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        expect(
                            pointElement.getAttribute("aria-describedby")
                        ).toBe("uid_action_1");
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
            it("Calls onClick callback", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: onClickFunctionSpy,
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(fetchElementByClass(styles.point), "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Highlights the data point", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: onClickFunctionSpy,
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(fetchElementByClass(styles.point), "click", () => {
                    expect(
                        fetchElementByClass(
                            styles.dataPointSelection
                        ).getAttribute("aria-hidden")
                    ).toBe("false");
                    done();
                });
            });
        });
        describe("When clicked on a selection point", () => {
            it("Hides data point selection when parameter callback is called", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: (clearSelectionCallback) =>
                                    clearSelectionCallback(),
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.dataPointSelection),
                    "click",
                    () => {
                        const pointElement = fetchElementByClass(
                            styles.dataPointSelection
                        );
                        expect(pointElement.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        expect(
                            pointElement.getAttribute("aria-describedby")
                        ).toBe("uid_action_1");
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
            it("Calls onClick callback", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: onClickFunctionSpy,
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.dataPointSelection),
                    "click",
                    () => {
                        expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                        done();
                    }
                );
            });
            it("Highlights the data point", (done) => {
                const onClickFunctionSpy = sinon.spy();
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: onClickFunctionSpy,
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(
                    fetchElementByClass(styles.dataPointSelection),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
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
                        display: "Project A"
                    }
                });
            }).not.toThrowError();
        });
        it("Removes actions", () => {
            gantt.unloadContent({
                key: "track 1",
                trackLabel: {
                    display: "Project A"
                }
            });
            expect(document.querySelectorAll(`.${styles.point}`).length).toBe(
                0
            );
            expect(
                document.querySelectorAll(`.${styles.dataPointSelection}`)
                    .length
            ).toBe(0);
        });
    });
    describe("On Resize", () => {
        beforeEach(() => {
            loadData(gantt);
        });
        it("Translates points correctly", (done) => {
            const pointElement = fetchElementByClass(styles.point);
            const currentPointPos = getTranslate(pointElement);
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 400px;"
            );
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(
                        getTranslate(fetchElementByClass(styles.point))[0]
                    ).not.toEqual(currentPointPos[0]);
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Translates selection points correctly", (done) => {
            const pointElement = fetchElementByClass(styles.dataPointSelection);
            const currentPointPos = getTranslate(pointElement);
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 400px;"
            );
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(
                        getTranslate(
                            fetchElementByClass(styles.dataPointSelection)
                        )[0]
                    ).not.toEqual(currentPointPos[0]);
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });
    describe("On Legend action", () => {
        beforeEach(() => {
            spyOn(window, "requestAnimationFrame").and.callThrough();
            loadData(gantt);
        });
        it("On click hides the points", (done) => {
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "click",
                () => {
                    const pointElement = fetchElementByClass(styles.point);
                    const secondaryPointElement = document.querySelectorAll(
                        `.${styles.point}`
                    )[1];
                    expect(pointElement.getAttribute("aria-describedby")).toBe(
                        "uid_action_1"
                    );
                    expect(pointElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    expect(
                        secondaryPointElement.getAttribute("aria-describedby")
                    ).toBe("uid_action_2");
                    expect(
                        secondaryPointElement.getAttribute("aria-hidden")
                    ).toBe("false");
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("On toggle displays the points again", (done) => {
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "click",
                () => {
                    triggerEvent(
                        fetchElementByClass(styles.legendItem),
                        "click",
                        () => {
                            const pointElement = fetchElementByClass(
                                styles.point
                            );
                            expect(
                                pointElement.getAttribute("aria-describedby")
                            ).toBe("uid_action_1");
                            expect(
                                pointElement.getAttribute("aria-hidden")
                            ).toBe("false");
                            done();
                        },
                        TRANSITION_DELAY
                    );
                },
                TRANSITION_DELAY
            );
        });
        it("On click hides the selection points", (done) => {
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "click",
                () => {
                    const pointElement = fetchElementByClass(
                        styles.dataPointSelection
                    );
                    const secondaryPointElement = document.querySelectorAll(
                        `.${styles.dataPointSelection}`
                    )[1];
                    expect(pointElement.getAttribute("aria-describedby")).toBe(
                        "uid_action_1"
                    );
                    expect(pointElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    expect(
                        secondaryPointElement.getAttribute("aria-describedby")
                    ).toBe("uid_action_2");
                    expect(
                        secondaryPointElement.getAttribute("aria-hidden")
                    ).toBe("true");
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("On hover blurs other points", (done) => {
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "mouseenter",
                () => {
                    const pointElement = fetchElementByClass(styles.point);
                    const secondaryPointElement = document.querySelectorAll(
                        `.${styles.point}`
                    )[1];
                    expect(pointElement.getAttribute("class")).toBe(
                        styles.point
                    );
                    expect(pointElement.getAttribute("aria-describedby")).toBe(
                        "uid_action_1"
                    );
                    expect(secondaryPointElement.classList.toString()).toBe(
                        `${styles.point} ${styles.blur}`
                    );
                    expect(
                        secondaryPointElement.getAttribute("aria-describedby")
                    ).toBe("uid_action_2");
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });
});
