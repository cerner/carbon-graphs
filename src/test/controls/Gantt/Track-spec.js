"use strict";
import sinon from "sinon";
import Gantt from "../../../main/js/controls/Gantt";
import errors from "../../../main/js/helpers/errors";
import styles from "../../../main/js/helpers/styles";
import { triggerEvent } from "../helpers/commonHelpers";
import { axisJSON, fetchElementByClass, getAxes, getData } from "./helpers";

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
});
