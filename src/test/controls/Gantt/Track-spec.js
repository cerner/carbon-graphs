"use strict";
import d3 from "d3";
import sinon from "sinon";
import Gantt from "../../../main/js/controls/Gantt";
import errors from "../../../main/js/helpers/errors";
import styles from "../../../main/js/helpers/styles";
import constants from "../../../main/js/helpers/constants";
import { triggerEvent } from "../helpers/commonHelpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    TRANSITION_DELAY,
    onClickFunctionSpy
} from "./helpers";
import {
    getXAxisXPosition,
    getXAxisWidth
} from "../../../main/js/controls/Gantt/helpers/creationHelpers";

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
        it("Truncates if too long", () => {
            expect(
                document.querySelectorAll(
                    `.${styles.axisYTrackLabel} .tick text`
                )[0].textContent
            ).toBe("Project long...");
        });
        it("Does not truncate if not long", () => {
            expect(
                document.querySelectorAll(
                    `.${styles.axisYTrackLabel} .tick text`
                )[1].textContent
            ).toBe("Project A");
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
                    expect(onClickPrimaryFunctionSpy.calledOnce).toBeTruthy();
                    expect(onClickPrimaryFunctionSpy.getCall(0).args[0]).toBe(
                        smallLabel
                    );
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
        it("Truncates label on exceeding max length", () => {
            const truncatedLabelElement = document.querySelectorAll(
                `.${styles.axisYTrackLabel} .tick text`
            )[1];
            expect(truncatedLabelElement.textContent).toBe("Project long...");
        });
    });
    describe("Track selection", () => {
        it("Selecter bar has aria-disabled property set to true", () => {
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
                        setTimeout(() => {
                            const ganttTrackSelectionBar = fetchElementByClass(
                                `${styles.ganttTrackBarSelection}`
                            );
                            expect(
                                ganttTrackSelectionBar.getAttribute(
                                    "aria-selected"
                                )
                            ).toBe("true");
                            done();
                        }, TRANSITION_DELAY);
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
                        expect(
                            Number.parseInt(selectionBar.attr("x"))
                        ).toBeGreaterThan(Number.parseInt(container.attr("x")));
                        expect(Number.parseInt(selectionBar.attr("x"))).toEqual(
                            getXAxisXPosition(gantt.config) +
                                constants.DEFAULT_GANTT_TRACK_SELECTION.x
                        );
                        expect(
                            Number.parseInt(selectionBar.attr("y"))
                        ).toBeGreaterThan(Number.parseInt(container.attr("y")));
                        expect(Number.parseInt(selectionBar.attr("y"))).toEqual(
                            31
                        );
                        expect(
                            Number.parseInt(selectionBar.attr("width"))
                        ).toBeLessThan(
                            Number.parseInt(container.attr("width"))
                        );
                        expect(
                            Number.parseInt(selectionBar.attr("width"))
                        ).toEqual(
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
                            Number.parseInt(selectionBar.attr("height"))
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
                gantt.resize();
                triggerEvent(
                    window,
                    "resize",
                    () => {
                        const selectionBar = d3.select(
                            `.${styles.ganttTrackBarSelection}`
                        );
                        expect(
                            Number.parseInt(selectionBar.attr("width"))
                        ).toEqual(
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
                        expect(
                            Number.parseInt(selectionBar.attr("x"))
                        ).toBeGreaterThan(Number.parseInt(container.attr("x")));
                        expect(Number.parseInt(selectionBar.attr("x"))).toEqual(
                            getXAxisXPosition(gantt.config) +
                                constants.DEFAULT_GANTT_TRACK_SELECTION.x
                        );
                        // intially config height would be 0, so (top + bottom) * 2 padding + 1
                        expect(Number.parseInt(selectionBar.attr("y"))).toEqual(
                            31
                        );
                        expect(
                            Number.parseInt(selectionBar.attr("y"))
                        ).toBeGreaterThan(Number.parseInt(container.attr("y")));
                        expect(
                            Number.parseInt(selectionBar.attr("width"))
                        ).toBeLessThan(
                            Number.parseInt(container.attr("width"))
                        );
                        expect(
                            Number.parseInt(selectionBar.attr("width"))
                        ).toEqual(
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
                            Number.parseInt(selectionBar.attr("height"))
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
                        expect(
                            Number.parseInt(selectionBar.attr("width"))
                        ).toEqual(
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
                        done();
                    },
                    TRANSITION_DELAY
                );
            });
        });
    });
});
