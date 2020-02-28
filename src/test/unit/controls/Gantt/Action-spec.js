"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import { COLORS, SHAPES } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import { TRANSITION_DELAY, triggerEvent } from "../../helpers/commonHelpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    legendJSON
} from "./helpers";

describe("Gantt -> Track -> Action", () => {
    let gantt = null;
    let ganttChartContainer;
    const axisData = Object.assign(getAxes(axisJSON), {
        showActionLegend: true,
        actionLegend: legendJSON
    });
    const getTranslate = (el) =>
        getSVGAnimatedTransformList(d3.select(el).attr("transform")).translate;
    const xVal = new Date(2018, 4, 1, 6, 15).toISOString();
    const xValAlt = new Date(2018, 4, 1, 9, 15).toISOString();
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
            expect(actionData.shape).toEqual(SHAPES.CIRCLE);
            expect(actionData.color).toBe(COLORS.BLUE);
            expect(actionData.label.display).toBe(legendJSON[0].label.display);
            expect(actionData.y).toBe("Project A");
            expect(actionData.x).toEqual(new Date(xVal));
            expect(actionData.clickPassThrough).toEqual(false);
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
            const groupElement = pointElement.firstChild;
            expect(pointElement.nodeName).toBe("svg");
            expect(pointElement.classList).toContain(styles.svgIcon);
            expect(pointElement.classList).toContain(styles.point);
            expect(pointElement.getAttribute("style")).toContain(COLORS.BLUE);
            expect(pointElement.getAttribute("aria-describedby")).toBe(
                "uid_action_1"
            );
            expect(pointElement.getAttribute("pointer-events")).toBe("auto");
            expect(pointElement.getAttribute("aria-hidden")).toBe("false");
            expect(groupElement.firstChild.getAttribute("d")).not.toBeNull();
            expect(groupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
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
            expect(pointElements[0].getAttribute("aria-hidden")).toBe("false");
            expect(pointElements[1].getAttribute("aria-hidden")).toBe("false");
            expect(pointElements[0].getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(pointElements[1].getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(
                pointElements[0].firstChild.getAttribute("transform")
            ).not.toBeNull();
            expect(
                pointElements[1].firstChild.getAttribute("transform")
            ).not.toBeNull();
            expect(
                pointElements[0].firstChild.getAttribute("transform")
            ).not.toBe(pointElements[1].firstChild.getAttribute("transform"));
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
            expect(pointElements[0].getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(pointElements[1].getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(
                pointElements[0].firstChild.getAttribute("transform")
            ).not.toBe(pointElements[1].firstChild.getAttribute("transform"));
            expect(
                pointElements[0].firstChild.getAttribute("transform")
            ).not.toBeNull();
            expect(
                pointElements[1].firstChild.getAttribute("transform")
            ).not.toBeNull();
        });
        it("Renders selection data points correctly", () => {
            loadData(gantt);
            const selectionPointElement = fetchElementByClass(
                styles.dataPointSelection
            );
            const groupElement = selectionPointElement.firstChild;
            expect(selectionPointElement.tagName).toBe("svg");
            expect(selectionPointElement.getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(groupElement.nodeName).toBe("g");
            expect(groupElement.firstChild.nodeName).toBe("path");
            expect(groupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
            expect(selectionPointElement.classList).toContain(
                styles.dataPointSelection
            );
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
            const pointElements = document.querySelectorAll(`.${styles.point}`);
            const firstPointElement = pointElements[0];
            const secondPointElement = pointElements[1];
            const firstPointGroupElement = firstPointElement.firstChild;
            const secondPointGroupElement = secondPointElement.firstChild;
            expect(firstPointElement.nodeName).toBe("svg");
            expect(firstPointElement.classList).toContain(styles.svgIcon);
            expect(firstPointElement.classList).toContain(styles.point);
            expect(firstPointElement.getAttribute("style")).toContain(
                COLORS.BLACK
            );
            expect(firstPointGroupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
            expect(secondPointElement.nodeName).toBe("svg");
            expect(firstPointElement.classList).toContain(styles.svgIcon);
            expect(firstPointElement.classList).toContain(styles.point);
            expect(secondPointElement.getAttribute("style")).toContain(
                COLORS.BLACK
            );
            expect(secondPointGroupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
        });
        describe("When clicked on a data point", () => {
            it("Does not do anything if no onClick callback is provided", (done) => {
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
                const pointElement = fetchElementByClass(styles.point);
                triggerEvent(pointElement, "click", () => {
                    expect(pointElement.getAttribute("aria-disabled")).toBe(
                        "true"
                    );
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
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-disabled")
                        ).toBe("false");
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
                        expect(pointElement.getAttribute("aria-disabled")).toBe(
                            "false"
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
                    expect(
                        fetchElementByClass(styles.point).getAttribute(
                            "aria-disabled"
                        )
                    ).toBe("false");
                    done();
                });
            });
            it("Emits correct parameters", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                values: [xVal, xValAlt]
                            }
                        ]
                    })
                );
                triggerEvent(
                    document.querySelectorAll(`.${styles.point}`)[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_action_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toEqual(new Date(xValAlt));
                        expect(args.target).not.toBeNull();
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
                        expect(pointElement.getAttribute("aria-disabled")).toBe(
                            "false"
                        );
                        expect(
                            pointElement.getAttribute("aria-describedby")
                        ).toBe("uid_action_1");
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
            it("Doesnt calls onClick callback on selection indicator if onClick is not provided", (done) => {
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
                triggerEvent(
                    fetchElementByClass(styles.dataPointSelection),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-disabled")
                        ).toBe("true");
                        done();
                    }
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
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-disabled")
                        ).toBe("false");
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
            it("Emits correct parameters", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        actions: [
                            {
                                key: "uid_action_1",
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                values: [xVal, xValAlt]
                            }
                        ]
                    })
                );
                triggerEvent(
                    document.querySelectorAll(
                        `.${styles.dataPointSelection}`
                    )[1],
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(args.key).toBe("uid_action_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toEqual(new Date(xValAlt));
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
        });
        describe("Pass through's", () => {
            const actions = [
                {
                    key: "uid_action_1",
                    values: [xVal]
                },
                {
                    key: "uid_action_2",
                    values: [xVal]
                }
            ];
            describe("clickPassThrough - undefined", () => {
                const axisData = Object.assign(getAxes(axisJSON), {
                    showActionLegend: true,
                    actionLegend: legendJSON
                });
                beforeEach(() => {
                    gantt.destroy();
                    gantt = new Gantt(axisData);
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions
                        })
                    );
                });
                it("Prepares actions with clickPassThrough", () => {
                    const d3DataPointElement = d3.select(`.${styles.point}`);
                    const actionData = d3DataPointElement.datum();
                    expect(actionData.clickPassThrough).toEqual(false);
                });
                it("Renders data points correctly with pointer-events", () => {
                    const pointElement = fetchElementByClass(styles.point);
                    expect(pointElement.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
            describe("clickPassThrough - true", () => {
                const axisData = Object.assign(getAxes(axisJSON), {
                    showActionLegend: true,
                    actionLegend: legendJSON,
                    clickPassThrough: {
                        actions: true
                    }
                });
                beforeEach(() => {
                    gantt.destroy();
                    gantt = new Gantt(axisData);
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions
                        })
                    );
                });
                it("Prepares actions with clickPassThrough", () => {
                    const d3DataPointElement = d3.select(`.${styles.point}`);
                    const actionData = d3DataPointElement.datum();
                    expect(actionData.clickPassThrough).toEqual(true);
                });
                it("Renders data points correctly with pointer-events", () => {
                    const pointElement = fetchElementByClass(styles.point);
                    expect(pointElement.getAttribute("pointer-events")).toBe(
                        "none"
                    );
                });
            });
            describe("clickPassThrough - false", () => {
                const axisData = Object.assign(getAxes(axisJSON), {
                    showActionLegend: true,
                    actionLegend: legendJSON,
                    clickPassThrough: {
                        actions: false
                    }
                });
                beforeEach(() => {
                    gantt.destroy();
                    gantt = new Gantt(axisData);
                    gantt.loadContent(
                        Object.assign(getData(), {
                            actions
                        })
                    );
                });
                it("Prepares actions with clickPassThrough", () => {
                    const d3DataPointElement = d3.select(`.${styles.point}`);
                    const actionData = d3DataPointElement.datum();
                    expect(actionData.clickPassThrough).toEqual(false);
                });
                it("Renders data points correctly with pointer-events", () => {
                    const pointElement = fetchElementByClass(styles.point);
                    expect(pointElement.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
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
            const currentPointPos = getTranslate(
                fetchElementByClass(styles.point).firstChild
            );
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 400px;"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(
                        getTranslate(
                            fetchElementByClass(styles.point).firstChild
                        )[0]
                    ).not.toEqual(currentPointPos[0]);
                    // currentPointPos[1] referes to y-value of translate. Since the updateTrackProps happen prior to loadActions, the y-value doesn't change.
                    expect(
                        getTranslate(
                            fetchElementByClass(styles.point).firstChild
                        )[1]
                    ).toEqual(currentPointPos[1]);
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Translates selection points correctly", (done) => {
            const currentPointPos = getTranslate(
                fetchElementByClass(styles.dataPointSelection).firstChild
            );
            ganttChartContainer.setAttribute(
                "style",
                "width: 800px; height: 400px;"
            );
            gantt.resize();
            triggerEvent(
                window,
                "resize",
                () => {
                    expect(
                        getTranslate(
                            fetchElementByClass(styles.dataPointSelection)
                                .firstChild
                        )[0]
                    ).not.toEqual(currentPointPos[0]);
                    // currentPointPos[1] refers to y-value of translate. Since the updateTrackProps happen prior to loadActions, the y-value doesn't change.
                    expect(
                        getTranslate(
                            fetchElementByClass(styles.dataPointSelection)
                                .firstChild
                        )[1]
                    ).toEqual(currentPointPos[1]);
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });
    describe("On Legend action", () => {
        beforeEach(() => {
            spyOn(window, "requestAnimationFrame");
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
                    const pointElements = document.querySelectorAll(
                        `.${styles.point}`
                    );
                    const pointElement = pointElements[0];
                    const secondaryPointElement = pointElements[1];
                    expect(pointElement.getAttribute("aria-describedby")).toBe(
                        "uid_action_1"
                    );
                    expect(pointElement.classList).toContain(styles.point);
                    expect(pointElement.classList).not.toContain(styles.blur);
                    expect(
                        secondaryPointElement.getAttribute("aria-describedby")
                    ).toBe("uid_action_2");
                    expect(secondaryPointElement.classList).toContain(
                        styles.point
                    );
                    expect(secondaryPointElement.classList).toContain(
                        styles.blur
                    );
                    done();
                },
                TRANSITION_DELAY
            );
        });
    });
});
