"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../../main/js/controls/Gantt";
import { getXAxisWidth } from "../../../../main/js/controls/Gantt/helpers/creationHelpers";
import constants from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import {
    delay,
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import { fetchAllElementsByClass } from "../Bar/helpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    onClickFunctionSpy
} from "./helpers";

describe("Gantt -> Track", () => {
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
        gantt = new Gantt(getAxes(axisJSON));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("Validates input", () => {
        it("Throws error on empty input", () => {
            expect(() => {
                gantt.loadContent({});
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("Throws error on null input", () => {
            expect(() => {
                gantt.loadContent(null);
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("Throws error on empty key", () => {
            expect(() => {
                const data = getData();
                data.key = null;
                gantt.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Throws error on undefined key", () => {
            expect(() => {
                const data = getData();
                data.key = undefined;
                gantt.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Throws error on null track label", () => {
            expect(() => {
                const data = getData();
                data.trackLabel = null;
                gantt.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
        });
        it("Throws error on null track label display", () => {
            expect(() => {
                const data = getData();
                data.trackLabel = {};
                gantt.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);

            expect(() => {
                const data = getData();
                data.trackLabel = {
                    trackLabel: null
                };
                gantt.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            expect(() => {
                const data = getData();
                data.trackLabel = {
                    trackLabel: ""
                };
                gantt.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
        });
    });
    describe("Track label", () => {
        const smallLabel = "Project A";
        const largeLabel =
            "Project long display value which is only for testing";
        beforeEach(() => {
            gantt.loadContent({
                key: "track 1",
                trackLabel: {
                    display: largeLabel
                }
            });
            gantt.loadContent({
                key: "track 2",
                trackLabel: {
                    display: smallLabel
                }
            });
        });
        it("Truncates if too long", (done) => {
            delay(() => {
                expect(
                    document.querySelectorAll(
                        `.${styles.axisYTrackLabel} .tick text`
                    )[0].textContent
                ).toBe("Project long...");
                expect(
                    document
                        .querySelectorAll(
                            `.${styles.axisYTrackLabel} .tick text`
                        )[0]
                        .getAttribute("aria-disabled")
                ).toBe(null);
                done();
            });
        });
        it("Does not truncate if not long", (done) => {
            delay(() => {
                expect(
                    document.querySelectorAll(
                        `.${styles.axisYTrackLabel} .tick text`
                    )[1].textContent
                ).toBe("Project A");
                done();
            });
        });
    });
    describe("Adds clickHandler for Label", () => {
        const smallLabel = "Project A";
        const largeLabel =
            "Project long display value which is only for testing";
        const onClickPrimaryFunctionSpy = sinon.spy();
        const onClickSecondaryFunctionSpy = sinon.spy();
        beforeEach(() => {
            gantt.loadContent({
                key: "track 1",
                trackLabel: {
                    display: smallLabel,
                    onClick: onClickPrimaryFunctionSpy
                }
            });
            gantt.loadContent({
                key: "track 2",
                trackLabel: {
                    display: largeLabel,
                    onClick: onClickSecondaryFunctionSpy
                }
            });
        });
        it("Executes callback when clicked on label", (done) => {
            triggerEvent(
                fetchElementByClass(`${styles.axisYTrackLabel} .tick text`),
                "click",
                () => {
                    const labelPath = fetchElementByClass(
                        `${styles.axisYTrackLabel} .tick text`
                    );
                    expect(labelPath.getAttribute("aria-disabled")).toBeFalsy();
                    expect(onClickPrimaryFunctionSpy.calledOnce).toBeFalsy();
                    done();
                }
            );
        });
        it("Executes callback when clicked on truncated label", (done) => {
            triggerEvent(
                document.querySelectorAll(
                    `.${styles.axisYTrackLabel} .tick text`
                )[1],
                "click",
                () => {
                    expect(onClickSecondaryFunctionSpy.calledOnce).toBeTruthy();
                    expect(onClickSecondaryFunctionSpy.getCall(0).args[0]).toBe(
                        largeLabel
                    );
                    done();
                }
            );
        });
        it("Truncates label on exceeding max length", (done) => {
            delay(() => {
                const truncatedLabelElement = document.querySelectorAll(
                    `.${styles.axisYTrackLabel} .tick text`
                )[1];
                expect(truncatedLabelElement.textContent).toBe(
                    "Project long..."
                );
                done();
            });
        });
    });
    describe("Track selection", () => {
        it("Selected bar has aria-disabled property set to true", () => {
            gantt.loadContent({
                key: "track 1",
                trackLabel: {
                    display: "label"
                },
                tasks: [],
                activities: []
            });
            const selectionBar = d3.select(`.${styles.ganttTrackBarSelection}`);
            expect(selectionBar.attr("aria-selected")).toEqual("false");
            expect(selectionBar.attr("aria-describedby")).toEqual("track 1");
            expect(selectionBar.attr("aria-disabled")).toEqual("true");
        });
        it("Doesn't show pointer when onClick is undefined", () => {
            gantt.loadContent({
                key: "track 1",
                onClick: undefined,
                trackLabel: {
                    display: "label"
                },
                tasks: [],
                activities: []
            });
            const selectionBar = d3.select(`.${styles.ganttTrackBarSelection}`);
            expect(selectionBar.attr("aria-selected")).toEqual("false");
            expect(selectionBar.attr("aria-describedby")).toEqual("track 1");
            expect(selectionBar.attr("aria-disabled")).toEqual("true");
        });
        /**
         * BF01142019.07 - Verify the system allows the consumer to determine if tracks are select-able.
         * BF01142019.09 - Verify the system will only select the track when an empty part of the track can be selected.
         */
        it("Shows pointer when onClick is defined", () => {
            gantt.loadContent({
                key: "track 1",
                onClick: () => {},
                trackLabel: {
                    display: "label"
                },
                tasks: [],
                activities: []
            });
            const selectionBar = d3.select(`.${styles.ganttTrackBarSelection}`);
            expect(selectionBar.attr("aria-selected")).toEqual("false");
            expect(selectionBar.attr("aria-describedby")).toEqual("track 1");
            expect(selectionBar.attr("aria-disabled")).toEqual("false");
        });
        describe("When default track height", () => {
            beforeEach(() => {
                gantt.loadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    },
                    onClick: onClickFunctionSpy,
                    tasks: [],
                    activities: []
                });
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Selection Bar is not selected", () => {
                const selectionBar = d3.select(
                    `.${styles.ganttTrackBarSelection}`
                );
                expect(selectionBar.attr("aria-selected")).toEqual("false");
                expect(selectionBar.attr("aria-describedby")).toEqual(
                    "track 1"
                );
                expect(selectionBar.attr("aria-disabled")).toEqual("false");
            });
            it("Selection Bar is selected", (done) => {
                expect(
                    fetchElementByClass(
                        `${styles.ganttTrackBarSelection}`
                    ).getAttribute("aria-selected")
                ).toBe("false");
                triggerEvent(
                    fetchElementByClass(`${styles.ganttTrackBarSelection}`),
                    "click",
                    () => {
                        delay(() => {
                            const ganttTrackSelectionBar = fetchElementByClass(
                                `${styles.ganttTrackBarSelection}`
                            );
                            expect(
                                ganttTrackSelectionBar.getAttribute(
                                    "aria-selected"
                                )
                            ).toBe("true");
                            done();
                        });
                    }
                );
            });
            /**
             * BF01142019.09 - Verify upon the selection, the system displays an outline (border) inset within the track.
             */
            it("Selection Bar is inside the track", (done) => {
                triggerEvent(
                    fetchElementByClass(`${styles.ganttTrackBarSelection}`),
                    "click",
                    () => {
                        const selectionBar = d3.select(
                            `.${styles.ganttTrackBarSelection}`
                        );
                        const container = d3.select(
                            `.${styles.contentContainer}`
                        );
                        expect(toNumber(selectionBar.attr("x"))).toEqual(
                            constants.DEFAULT_GANTT_TRACK_SELECTION.x
                        );
                        expect(toNumber(selectionBar.attr("y"))).toEqual(
                            constants.DEFAULT_GANTT_TRACK_SELECTION.y
                        );
                        expect(
                            toNumber(selectionBar.attr("width"))
                        ).toBeLessThan(toNumber(container.attr("width")));
                        expect(toNumber(selectionBar.attr("width"))).toEqual(
                            getXAxisWidth(gantt.config) -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.width
                        );
                        const canvasElement = fetchElementByClass(
                            styles.canvas
                        );
                        const containerElement = canvasElement.querySelector(
                            `.${styles.contentContainer}`
                        );
                        expect(
                            toNumber(selectionBar.attr("height"))
                        ).toBeLessThan(
                            +containerElement.getAttribute("height")
                        );
                        expect(
                            Number.parseFloat(selectionBar.attr("height"))
                        ).toEqual(
                            gantt.config.axis.y.trackList["track 1"]
                                .trackHeight -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.height
                        );
                        done();
                    }
                );
            });
            /**
             * BF01142019.09 - Verify upon selection, the system will execute the operation established by the consumer.
             */
            it("Callback function is called", (done) => {
                triggerEvent(
                    fetchElementByClass(`${styles.ganttTrackBarSelection}`),
                    "click",
                    () => {
                        expect(
                            fetchElementByClass(
                                `${styles.ganttTrackBarSelection}`
                            ).getAttribute("aria-selected")
                        ).toBe("true");
                        expect(onClickFunctionSpy.called).toBe(true);
                        done();
                    }
                );
            });
            /**
             * BF01142019.09 - Verify upon selection, the data store within the track will be provided by the consumer.
             */
            it("Right values are passed for callback function", (done) => {
                gantt.destroy();
                let args = {};
                gantt = new Gantt(getAxes(axisJSON));
                gantt.loadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    },
                    onClick: (cb, key, val, target) => {
                        args = {
                            cb,
                            key,
                            val,
                            target
                        };
                    },
                    tasks: [],
                    activities: []
                });
                triggerEvent(
                    fetchElementByClass(`${styles.ganttTrackBarSelection}`),
                    "click",
                    () => {
                        expect(args).not.toBeNull();
                        expect(args.cb).toEqual(jasmine.any(Function));
                        expect(
                            fetchElementByClass(
                                `${styles.ganttTrackBarSelection}`
                            ).getAttribute("aria-selected")
                        ).toBe("true");
                        args.cb();
                        expect(
                            fetchElementByClass(
                                `${styles.ganttTrackBarSelection}`
                            ).getAttribute("aria-selected")
                        ).toBe("false");
                        expect(args.key).toBe("track 1");
                        expect(args.val).not.toBeNull();
                        expect(args.val.tasks).toEqual([]);
                        expect(args.val.activities).toEqual([]);
                        expect(args.target).not.toBeNull();
                        done();
                    }
                );
            });
            it("Translates selection bars", (done) => {
                ganttChartContainer.setAttribute(
                    "style",
                    "width: 800px; height: 400px;"
                );
                const rafSpy = spyOn(window, "requestAnimationFrame");
                gantt.resize();
                triggerEvent(
                    window,
                    "resize",
                    () => {
                        const selectionBar = d3.select(
                            `.${styles.ganttTrackBarSelection}`
                        );
                        expect(toNumber(selectionBar.attr("width"))).toEqual(
                            getXAxisWidth(gantt.config) -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.width
                        );
                        expect(
                            Number.parseFloat(selectionBar.attr("height"))
                        ).toEqual(
                            gantt.config.axis.y.trackList["track 1"]
                                .trackHeight -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.height
                        );
                        rafSpy.calls.reset();
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
        });
        describe("When custom track height is used", () => {
            beforeEach(() => {
                gantt.loadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    },
                    dimension: {
                        trackHeight: 160
                    },
                    onClick: onClickFunctionSpy,
                    tasks: [],
                    activities: []
                });
            });
            afterEach(() => {
                document.body.innerHTML = "";
            });
            it("Selection Bar is inside the track", (done) => {
                triggerEvent(
                    fetchElementByClass(`${styles.ganttTrackBarSelection}`),
                    "click",
                    () => {
                        const selectionBar = d3.select(
                            `.${styles.ganttTrackBarSelection}`
                        );
                        const container = d3.select(
                            `.${styles.contentContainer}`
                        );
                        expect(toNumber(selectionBar.attr("x"))).toEqual(
                            constants.DEFAULT_GANTT_TRACK_SELECTION.x
                        );
                        expect(toNumber(selectionBar.attr("y"))).toEqual(
                            constants.DEFAULT_GANTT_TRACK_SELECTION.y
                        );
                        expect(
                            toNumber(selectionBar.attr("width"))
                        ).toBeLessThan(toNumber(container.attr("width")));
                        expect(toNumber(selectionBar.attr("width"))).toEqual(
                            getXAxisWidth(gantt.config) -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.width
                        );
                        const canvasElement = fetchElementByClass(
                            styles.canvas
                        );
                        const containerElement = canvasElement.querySelector(
                            `.${styles.contentContainer}`
                        );
                        expect(
                            toNumber(selectionBar.attr("height"))
                        ).toBeLessThan(
                            +containerElement.getAttribute("height")
                        );
                        expect(
                            Number.parseFloat(selectionBar.attr("height"))
                        ).toEqual(
                            gantt.config.axis.y.trackList["track 1"]
                                .trackHeight -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.height
                        );
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
            it("Translates selection bars", (done) => {
                const rafSpy = spyOn(window, "requestAnimationFrame");
                ganttChartContainer.setAttribute(
                    "style",
                    "width: 800px; height: 400px;"
                );
                gantt.resize();
                triggerEvent(
                    window,
                    "resize",
                    () => {
                        const selectionBar = d3.select(
                            `.${styles.ganttTrackBarSelection}`
                        );
                        expect(toNumber(selectionBar.attr("width"))).toEqual(
                            getXAxisWidth(gantt.config) -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.width
                        );
                        expect(
                            Number.parseFloat(selectionBar.attr("height"))
                        ).toEqual(
                            gantt.config.axis.y.trackList["track 1"]
                                .trackHeight -
                                constants.DEFAULT_GANTT_TRACK_SELECTION.height
                        );
                        rafSpy.calls.reset();
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
        });
        describe("When unloaded", () => {
            it("Removes selection-bar", () => {
                gantt.loadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    },
                    dimension: {
                        trackHeight: 160
                    },
                    onClick: onClickFunctionSpy,
                    tasks: [],
                    activities: []
                });
                gantt.unloadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    }
                });
                expect(
                    fetchElementByClass(`${styles.ganttTrackBarSelection}`)
                ).toBe(null);
            });
            it("Translates to new location when one of the tracks is unloaded", (done) => {
                gantt.loadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    },
                    dimension: {
                        trackHeight: 160
                    },
                    onClick: onClickFunctionSpy,
                    tasks: [],
                    activities: []
                });
                gantt.loadContent({
                    key: "track 2",
                    trackLabel: {
                        display: "label 2"
                    },
                    dimension: {
                        trackHeight: 160
                    },
                    onClick: onClickFunctionSpy,
                    tasks: [],
                    activities: []
                });
                const beforeUnload = fetchAllElementsByClass(
                    ganttChartContainer,
                    `${styles.ganttTrackBarSelection}`
                );
                expect(beforeUnload.length).toBe(2);
                expect(beforeUnload[0].getAttribute("x")).toBe("1");
                expect(beforeUnload[0].getAttribute("y")).toBe("1");
                expect(beforeUnload[0].getAttribute("aria-describedby")).toBe(
                    "track 1"
                );
                expect(beforeUnload[1].getAttribute("x")).toBe("1");
                expect(beforeUnload[1].getAttribute("y")).toBe("161");
                expect(beforeUnload[1].getAttribute("aria-describedby")).toBe(
                    "track 2"
                );
                gantt.unloadContent({
                    key: "track 1",
                    trackLabel: {
                        display: "label"
                    }
                });
                delay(() => {
                    const afterUnload = fetchAllElementsByClass(
                        ganttChartContainer,
                        `${styles.ganttTrackBarSelection}`
                    );
                    expect(afterUnload.length).toBe(1);
                    expect(afterUnload[0].getAttribute("x")).toBe("1");
                    expect(afterUnload[0].getAttribute("y")).toBe("1");
                    expect(
                        afterUnload[0].getAttribute("aria-describedby")
                    ).toBe("track 2");
                    done();
                }, TRANSITION_DELAY);
            });
        });
    });
});
