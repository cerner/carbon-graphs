"use strict";
import sinon from "sinon";
import Carbon from "../../../../main/js/carbon";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import { AXES_ORIENTATION } from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisInfoRowDefault,
    axisInfoRowTimeSeries,
    axisTimeSeries,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getInput,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Bar - Axis Info Row", () => {
    let graphDefault = null;
    let barGraphContainer;
    let bar;
    let data;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        barGraphContainer = document.createElement("div");
        barGraphContainer.id = "testBar_carbon";
        barGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(barGraphContainer);
        graphDefault = new Graph(utils.deepClone(getAxes(axisDefault)));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("On load", () => {
        beforeEach(() => {
            data = utils.deepClone(getInput(valuesDefault, false, false));
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Creates text labels only if present", () => {
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchElementByClass(
                barGraphContainer,
                `${styles.axisInfoRowItem}`
            );
            expect(axisInfoRowElement).toBeNull();
        });
        it("Creates text labels when present", () => {
            data.axisInfoRow = axisInfoRowDefault;
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(3);
            axisInfoRowElement.forEach((i) => {
                expect(i.nodeName === "g").toBeTruthy();
            });
        });
        it("Creates text label correctly for time series axis type", () => {
            graphDefault.destroy();
            graphDefault = new Graph(utils.deepClone(getAxes(axisTimeSeries)));
            data = getInput(valuesTimeSeries, false, false);
            data.axisInfoRow = axisInfoRowTimeSeries;
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(3);
            axisInfoRowElement.forEach((i) => {
                expect(i.nodeName === "g").toBeTruthy();
            });
        });
        it("creates axis info row elements in order", () => {
            data.axisInfoRow = axisInfoRowDefault;
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            const iconElement = axisInfoRowElement[0].childNodes[0];
            const svgIconElement = iconElement.childNodes[0];
            const primaryDisplayElement = axisInfoRowElement[0].childNodes[1];
            const secondaryDisplay = axisInfoRowElement[0].childNodes[2];

            expect(svgIconElement).not.toBeNull();
            expect(primaryDisplayElement).not.toBeNull();
            expect(secondaryDisplay).not.toBeNull();

            expect(iconElement.nodeName).toBe("g");
            expect(svgIconElement.nodeName).toBe("svg");
            expect(primaryDisplayElement.nodeName).toBe("text");
            expect(secondaryDisplay.nodeName).toBe("text");

            expect(iconElement.getAttribute("class")).toBe(
                styles.axisInfoRowIcon
            );
            expect(primaryDisplayElement.getAttribute("class")).toBe(
                styles.axisInfoRowDisplay
            );
            expect(secondaryDisplay.getAttribute("class")).toBe(
                styles.axisInfoRowSecondaryDisplay
            );
        });
        it("Creates text label correctly when character Count is not provided", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
        });
        it("Creates text label correctly when secondary display is not provided", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
        });
        it("Creates text label correctly when color is not provided", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        shape: {},
                        label: {
                            display: "51"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
        });
        it("Creates text label correctly when on click function is not provided", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        color: Carbon.helpers.COLORS.ORANGE,
                        characterCount: 9,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
        });
        it("Creates text label correctly when X Axis Orientation is set to top", () => {
            const xAxisTopOrientation = utils.deepClone(axisDefault);
            xAxisTopOrientation.x.orientation = AXES_ORIENTATION.X.TOP;
            const input = utils.deepClone(getAxes(xAxisTopOrientation));
            const graph = new Graph(input);
            data = utils.deepClone(getInput(valuesDefault));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graph.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
        });
        it("Truncates only primary display if the provided character count is less than primary display length ", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 4,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "12345",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
            expect(
                axisInfoRowElement[0].querySelectorAll(
                    `.${styles.axisInfoRowDisplay}`
                )[0].textContent
            ).toBe("1234...");
            expect(
                axisInfoRowElement[0].querySelectorAll(
                    `.${styles.axisInfoRowSecondaryDisplay}`
                )[0].textContent
            ).toBe("ICU");
        });
        it("Truncates both primary and secondary display if the provided character count is less than their resp. lengths ", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 2,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "12345",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(1);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
            expect(
                axisInfoRowElement[0].querySelectorAll(
                    `.${styles.axisInfoRowDisplay}`
                )[0].textContent
            ).toBe("12...");
            expect(
                axisInfoRowElement[0].querySelectorAll(
                    `.${styles.axisInfoRowSecondaryDisplay}`
                )[0].textContent
            ).toBe("IC...");
        });
        it("shows text labels by default and sets attributes correctly", () => {
            data.axisInfoRow = axisInfoRowDefault;
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchElementByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.getAttribute("class")).toBe(
                `${styles.axisInfoRowItem}`
            );
            expect(axisInfoRowElement.getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(axisInfoRowElement.getAttribute("aria-disabled")).toBe(
                "false"
            );
            expect(axisInfoRowElement.getAttribute("text-anchor")).toBe(
                "middle"
            );
            expect(axisInfoRowElement.getAttribute("aria-describedby")).toBe(
                `text_label_${data.key}`
            );
        });
    });
    describe("Creates text labels when there are multiple text labels", () => {
        beforeEach(() => {
            data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = axisInfoRowDefault;
            bar = new Bar(data);
            graphDefault.loadContent(bar);
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Renders all text labels", () => {
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(3);
            expect(axisInfoRowElement[0].nodeName).toBe("g");
        });
        it("shows all text labels face-up by default", () => {
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.length).toBe(3);
            axisInfoRowElement.forEach((i) => {
                expect(i.getAttribute("aria-hidden") === "false").toBeTruthy();
                expect(
                    i.getAttribute("aria-describedby") ===
                        `text_label_${data.key}`
                ).toBeTruthy();
            });
        });
    });
    describe("When clicked on data point", () => {
        beforeEach(() => {
            data = utils.deepClone(getInput(valuesDefault, false, false));
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Does not do anything if no onClick callback is provided", (done) => {
            const onClickFunctionSpy = sinon.spy();
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        characterCount: 9,
                        shape: {},
                        label: {
                            display: "51"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            bar.redraw(graphDefault);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            triggerEvent(axisInfoRowElement[0], "click", () => {
                expect(onClickFunctionSpy.calledOnce).toBeFalsy();
                done();
            });
        });
        it("Hides data point selection when parameter callback is called", (done) => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: (clearSelectionCallback) =>
                            clearSelectionCallback(),
                        characterCount: 9,
                        shape: {},
                        label: {
                            display: "51"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            bar.redraw(graphDefault);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            triggerEvent(
                axisInfoRowElement[0],
                "click",
                () => {
                    expect(
                        axisInfoRowElement[0].getAttribute("aria-selected")
                    ).toBe("false");
                    done();
                },
                TRANSITION_DELAY
            );
        });
        it("Emits correct parameters", (done) => {
            let args = {};
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: (
                            cb,
                            value,
                            index,
                            uniqueKey,
                            selectedTarget
                        ) => {
                            args = {
                                cb,
                                value,
                                index,
                                uniqueKey,
                                selectedTarget
                            };
                        },
                        characterCount: 9,
                        shape: {},
                        label: {
                            display: "51"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            bar.redraw(graphDefault);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            triggerEvent(axisInfoRowElement[0], "click", () => {
                expect(args).not.toBeNull();
                expect(args.cb).toEqual(jasmine.any(Function));
                expect(args.value).not.toBeNull();
                expect(args.index).toBe(0);
                expect(args.uniqueKey).toBe("uid_1");
                expect(args.selectedTarget).not.toBeNull();
                done();
            });
        });
        it("Sets svg as disabled when onClick is not provided", () => {
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        characterCount: 9,
                        shape: {},
                        label: {
                            display: "51"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            bar.redraw(graphDefault);
            const axisInfoRowElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );

            expect(axisInfoRowElement[0].getAttribute("aria-disabled")).toBe(
                "true"
            );
        });
    });
    describe("On unload", () => {
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Removes all axisInfoRow", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            graphDefault.unloadContent(bar);
            const axisInfoRow = fetchElementByClass(
                barGraphContainer,
                styles.axisInfoRow
            );
            const axisInfoRowElement = fetchElementByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRow.children.length).toBe(1);
            expect(axisInfoRow.children[0].nodeName).toBe("path");
            expect(axisInfoRowElement).toBe(null);
        });
    });
    describe("On resize", () => {
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Translates Text Labels correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const axisInfoRowElement = fetchElementByClass(
                barGraphContainer,
                styles.axisInfoRowItem
            );
            expect(axisInfoRowElement.nodeName).toBe("g");
            const translate = getSVGAnimatedTransformList(
                axisInfoRowElement.getAttribute("transform")
            ).translate;
            expect(toNumber(translate[0], 10)).toBeCloserTo(142);
            expect(toNumber(translate[1], 10)).toBeCloserTo(-10);
        });
    });
});
