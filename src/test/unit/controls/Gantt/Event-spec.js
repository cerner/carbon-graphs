"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import { COLORS, SHAPES } from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import { TRANSITION_DELAY, triggerEvent } from "../../helpers/commonHelpers";
import { axisJSON, fetchElementByClass, getAxes, getData } from "./helpers";

/**
 * BF11272018.02 - Verify the system will allow consumers to utilize events within the Gantt Chart.
 */
describe("Gantt -> Track -> Event", () => {
    let gantt = null;
    let ganttChartContainer;
    const axisData = getAxes(axisJSON);
    const getTranslate = (el) =>
        getSVGAnimatedTransformList(d3.select(el).attr("transform")).translate;
    const xVal = new Date(2018, 4, 1, 6, 15).toISOString();
    const xValAlt = new Date(2018, 4, 1, 9, 15).toISOString();
    const loadData = (gantt) =>
        gantt.loadContent(
            Object.assign(getData(), {
                events: [
                    {
                        key: "uid_event_1",
                        onClick: sinon.spy(),
                        shape: SHAPES.CIRCLE,
                        color: COLORS.BLUE,
                        values: [xVal]
                    },
                    {
                        key: "uid_event_2",
                        onClick: sinon.spy(),
                        shape: SHAPES.DIAMOND,
                        color: COLORS.BLUE,
                        values: [xVal]
                    }
                ]
            })
        );
    let onClickFunctionSpy = null;
    let events = null;

    beforeEach(() => {
        ganttChartContainer = document.createElement("div");
        ganttChartContainer.id = "testCarbonGantt";
        ganttChartContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        ganttChartContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(ganttChartContainer);
        onClickFunctionSpy = sinon.spy();
        events = [
            {
                key: "uid_event_1",
                onClick: onClickFunctionSpy,
                shape: SHAPES.CIRCLE,
                color: COLORS.BLUE,
                values: [xVal]
            }
        ];
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
                            events: [{}]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
            });
            it("Throws error when no key is loaded", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            events: [
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
                            events: [
                                {
                                    key: "DummyKey",
                                    values: []
                                }
                            ]
                        })
                    );
                }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
            });
            it("Throws error when values are invalid type", () => {
                expect(() => {
                    gantt.loadContent(
                        Object.assign(getData(), {
                            events: [
                                {
                                    key: "uid_event_1",
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
        /**
         * BF11272018.05 - Verify the system allows the consumer to specify the color of the event
         * BF11272018.04 - Verify the system will allow the consumer to determine the positioning and size of the event
         */
        it("Prepares events", () => {
            loadData(gantt);
            const d3DataPointElement = d3.select(`.${styles.point}`);
            const eventData = d3DataPointElement.datum();
            expect(eventData.onClick).toEqual(jasmine.any(Function));
            expect(eventData.shape).toEqual(SHAPES.CIRCLE);
            expect(eventData.color).toBe(COLORS.BLUE);
            expect(eventData.y).toBe("Project A");
            expect(eventData.x).toEqual(new Date(xVal));
            expect(eventData.clickPassThrough).toEqual(false);
        });
        /**
         * BF11272018.03 - Verify the (Events) are displayed as a shape.
         */
        it("Renders event groups correctly", () => {
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
                "uid_event_1"
            );
            expect(pointElement.getAttribute("pointer-events")).toBe("auto");
            expect(pointElement.getAttribute("aria-hidden")).toBe("false");
            expect(groupElement.firstChild.getAttribute("d")).not.toBeNull();
            expect(groupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
        });
        it("Renders multiple data sets correctly", () => {
            loadData(gantt);
            const pointElements = document.querySelectorAll(`.${styles.point}`);
            expect(pointElements.length).toBe(2);
            expect(pointElements[0].getAttribute("aria-describedby")).toBe(
                "uid_event_1"
            );
            expect(pointElements[1].getAttribute("aria-describedby")).toBe(
                "uid_event_2"
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
                    events: [
                        {
                            key: "uid_event_1",
                            onClick: sinon.spy(),
                            shape: SHAPES.CIRCLE,
                            color: COLORS.BLUE,
                            values: [new Date(2018, 4, 1).toISOString()]
                        }
                    ]
                })
            );
            gantt.loadContent(
                Object.assign(getData(), {
                    key: "track 2",
                    events: [
                        {
                            key: "uid_event_2",
                            onClick: sinon.spy(),
                            shape: SHAPES.CIRCLE,
                            color: COLORS.BLUE,
                            values: [new Date(2018, 4, 1).toISOString()]
                        }
                    ]
                })
            );
            const pointElements = document.querySelectorAll(`.${styles.point}`);
            expect(pointElements.length).toBe(2);
            expect(pointElements[0].getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(pointElements[0].getAttribute("aria-describedby")).toBe(
                "uid_event_1"
            );
            expect(pointElements[1].getAttribute("pointer-events")).toBe(
                "auto"
            );
            expect(pointElements[1].getAttribute("aria-describedby")).toBe(
                "uid_event_2"
            );
            expect(pointElements[0].firstChild.getAttribute("transform")).toBe(
                pointElements[1].firstChild.getAttribute("transform")
            );
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
            expect(groupElement.firstChild.nodeName).toBe("path");
            expect(groupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
            expect(groupElement.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
            expect(selectionPointElement.classList).toContain(
                styles.dataPointSelection
            );
            expect(selectionPointElement.getAttribute("aria-describedby")).toBe(
                "uid_event_1"
            );
            expect(selectionPointElement.getAttribute("aria-hidden")).toBe(
                "true"
            );
        });
        describe("When clicked on data point", () => {
            it("Does not do anything if no onClick callback is provided", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events: [
                            {
                                key: "uid_event_1",
                                shape: SHAPES.DIAMOND,
                                color: COLORS.BLUE,
                                values: [xVal]
                            }
                        ]
                    })
                );
                triggerEvent(fetchElementByClass(styles.point), "click", () => {
                    expect(
                        fetchElementByClass(styles.point).getAttribute(
                            "aria-disabled"
                        )
                    ).toBe("true");
                    done();
                });
            });
            it("Removes highlight when data point is clicked again", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events
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
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: (clearSelectionCallback) =>
                                    clearSelectionCallback(),
                                values: [xVal],
                                shape: SHAPES.DIAMOND,
                                color: COLORS.BLUE
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
                        ).toBe("uid_event_1");
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
            /**
             * BF11272018.15 - Verify upon selection, the system will execute the operation established by the consumer
             */
            it("Calls onClick callback", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events
                    })
                );
                triggerEvent(fetchElementByClass(styles.point), "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBe(true);
                    done();
                });
            });
            /** BF11272018.06 - Verify the system will allow the consumer to provide a lists of events. */
            it("Emits correct parameters", (done) => {
                let args = {};
                gantt.loadContent(
                    Object.assign(getData(), {
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                shape: SHAPES.DIAMOND,
                                color: COLORS.BLUE,
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
                        expect(args.key).toBe("uid_event_1");
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
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: onClickFunctionSpy,
                                shape: SHAPES.DIAMOND,
                                color: COLORS.BLUE,
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
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: (clearSelectionCallback) =>
                                    clearSelectionCallback(),
                                shape: SHAPES.CIRCLE,
                                color: COLORS.BLUE,
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
                        ).toBe("uid_event_1");
                        done();
                    },
                    TRANSITION_DELAY
                );
            });

            it("Calls onClick callback", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events
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
                gantt.loadContent(
                    Object.assign(getData(), {
                        events
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
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: (cb, key, index, val, target) => {
                                    args = {
                                        cb,
                                        key,
                                        index,
                                        val,
                                        target
                                    };
                                },
                                shape: SHAPES.CIRCLE,
                                color: COLORS.BLUE,
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
                        expect(args.key).toBe("uid_event_1");
                        expect(args.index).toBe(1);
                        expect(args.val).not.toBeNull();
                        expect(args.val.x).toEqual(new Date(xValAlt));
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            /**
             * BF11272018.1 - Verify the system allows an event to be select-able.
             */
            it("Calls onClick when selected, if provided", (done) => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: onClickFunctionSpy,
                                shape: SHAPES.CIRCLE,
                                color: COLORS.BLUE,
                                values: [xVal]
                            }
                        ]
                    })
                );
                const selectedPointElement = fetchElementByClass(
                    styles.dataPointSelection
                );
                triggerEvent(selectedPointElement, "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBe(true);
                    expect(
                        selectedPointElement.getAttribute("aria-disabled")
                    ).toBe("false");
                    done();
                });
            });
            it("Sets svg as disabled when onClick is not provided", () => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events: [
                            {
                                key: "uid_event_1",
                                shape: SHAPES.CIRCLE,
                                color: COLORS.BLUE,
                                values: [xVal]
                            }
                        ]
                    })
                );
                const pointElement = fetchElementByClass(styles.point);

                expect(fetchElementByClass(styles.dataPointSelection)).toBe(
                    null
                );
                expect(pointElement.getAttribute("aria-disabled")).toBe("true");
                expect(pointElement.getAttribute("aria-hidden")).toBe("false");
                expect(pointElement.getAttribute("style")).toContain(
                    COLORS.BLUE
                );
            });
        });
        describe("Pass Through's", () => {
            describe("clickPassThrough - undefined", () => {
                const axisData = getAxes(axisJSON);
                beforeEach(() => {
                    gantt.destroy();
                    gantt = new Gantt(axisData);
                    gantt.loadContent(
                        Object.assign(getData(), {
                            events: [
                                {
                                    key: "uid_event_1",
                                    shape: SHAPES.CIRCLE,
                                    color: COLORS.BLUE,
                                    values: [xVal]
                                }
                            ]
                        })
                    );
                });
                it("Prepares events with clickPassThrough", () => {
                    const d3DataPointElement = d3.select(`.${styles.point}`);
                    const eventData = d3DataPointElement.datum();
                    expect(eventData.clickPassThrough).toEqual(false);
                });
                it("Renders data points correctly with pointer-events", () => {
                    const pointElement = fetchElementByClass(styles.point);
                    expect(pointElement.nodeName).toBe("svg");
                    expect(pointElement.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
            describe("clickPassThrough - true", () => {
                const axisData = Object.assign(getAxes(axisJSON), {
                    clickPassThrough: {
                        events: true
                    }
                });
                beforeEach(() => {
                    gantt.destroy();
                    gantt = new Gantt(axisData);
                    gantt.loadContent(
                        Object.assign(getData(), {
                            events: [
                                {
                                    key: "uid_event_1",
                                    shape: SHAPES.CIRCLE,
                                    color: COLORS.BLUE,
                                    values: [xVal]
                                }
                            ]
                        })
                    );
                });
                it("Prepares events with clickPassThrough", () => {
                    const d3DataPointElement = d3.select(`.${styles.point}`);
                    const eventData = d3DataPointElement.datum();
                    expect(eventData.clickPassThrough).toEqual(true);
                });
                it("Renders data points correctly with pointer-events", () => {
                    const pointElement = fetchElementByClass(styles.point);
                    expect(pointElement.nodeName).toBe("svg");
                    expect(pointElement.getAttribute("pointer-events")).toBe(
                        "none"
                    );
                });
            });
            describe("clickPassThrough - false", () => {
                const axisData = Object.assign(getAxes(axisJSON), {
                    clickPassThrough: {
                        events: false
                    }
                });
                beforeEach(() => {
                    gantt.destroy();
                    gantt = new Gantt(axisData);
                    gantt.loadContent(
                        Object.assign(getData(), {
                            events: [
                                {
                                    key: "uid_event_1",
                                    shape: SHAPES.CIRCLE,
                                    color: COLORS.BLUE,
                                    values: [xVal]
                                }
                            ]
                        })
                    );
                });
                it("Prepares events with clickPassThrough", () => {
                    const d3DataPointElement = d3.select(`.${styles.point}`);
                    const eventData = d3DataPointElement.datum();
                    expect(eventData.clickPassThrough).toEqual(false);
                });
                it("Renders data points correctly with pointer-events", () => {
                    const pointElement = fetchElementByClass(styles.point);
                    expect(pointElement.nodeName).toBe("svg");
                    expect(pointElement.getAttribute("pointer-events")).toBe(
                        "auto"
                    );
                });
            });
        });
        describe("Renders data points with default values", () => {
            const caretUp = {
                path: {
                    id: "caretUp",
                    d: "M0,36l24-24l24,24H0z"
                },
                options: {
                    x: -7,
                    y: -7,
                    scale: 0.3
                }
            };
            it("Renders data point when no color", () => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: () => {},
                                shape: caretUp,
                                values: [xVal]
                            }
                        ]
                    })
                );
                const d3DataPointElement = d3.select(`.${styles.point}`);
                const eventData = d3DataPointElement.datum();
                expect(eventData.color).toEqual("");
            });
            it("Renders data point when no shape", () => {
                gantt.loadContent(
                    Object.assign(getData(), {
                        events: [
                            {
                                key: "uid_event_1",
                                onClick: () => {},
                                values: [xVal]
                            }
                        ]
                    })
                );
                const d3DataPointElement = d3.select(`.${styles.point}`);
                const eventData = d3DataPointElement.datum();
                expect(eventData.shape).toEqual(SHAPES.CIRCLE);
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
                    // currentPointPos[1] referes to y-value of translate. Since the updateTrackProps happen prior to loadEvents, the y-value doesn't change.
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
                    // currentPointPos[1] referes to y-value of translate. Since the updateTrackProps happen prior to loadEvents, the y-value doesn't change.
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
});
