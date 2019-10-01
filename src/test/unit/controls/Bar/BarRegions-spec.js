"use strict";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import constants from "../../../../main/js/helpers/constants";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisTimeSeries,
    fetchAllElementsByClass,
    fetchElementByClass,
    getAxes,
    getInput,
    regionsDefault,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Bar - Region", () => {
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
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        graphDefault.destroy();
        document.body.innerHTML = "";
    });

    describe("On load", () => {
        afterEach(() => {
            graphDefault.destroy();
        });
        describe("Ideally", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = regionsDefault;
                bar = new Bar(data);
                graphDefault.loadContent(bar);
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Creates region when present", () => {
                const regionElement = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement.length).toBe(2);
                expect(regionElement[0].nodeName).toBe("rect");
            });
            it("shows region by default", () => {
                const regionElement = fetchElementByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement.getAttribute("class")).toBe(
                    `${styles.region} ${styles.barGoalLine}`
                );
                expect(regionElement.getAttribute("aria-hidden")).toBe("false");
                expect(regionElement.getAttribute("aria-describedby")).toBe(
                    `region_${data.key}`
                );
            });
        });
        it("Creates region only if present", () => {
            data = utils.deepClone(getInput(valuesDefault, false, false));
            data.regions = null;
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionGroupElement = fetchElementByClass(
                barGraphContainer,
                `${styles.goalGroup}-${data.key}`
            );
            expect(regionGroupElement).toBeNull();
        });
        describe("Creates region when there are multiple regions", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = regionsDefault;
                bar = new Bar(data);
                graphDefault.loadContent(bar);
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Renders all regions", () => {
                const regionElement = fetchAllElementsByClass(
                    barGraphContainer,
                    styles.region
                );
                expect(regionElement.length).toBe(2);
                expect(regionElement[0].nodeName).toBe("rect");
            });
            it("shows all regions face-up by default", () => {
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );
                expect(regionsElement.length).toBe(2);
                expect(regionsElement[0].getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(regionsElement[1].getAttribute("aria-hidden")).toBe(
                    "false"
                );
                expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                    `region_${data.key}`
                );
                expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                    `region_${data.key}`
                );
            });
        });
        describe("Validates each region", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
            });
            afterEach(() => {
                data = null;
                graphDefault.destroy();
            });
            it("Throws error when empty", () => {
                data.regions = [{}];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_EMPTY);
            });
            it("Throws error when both start and end are empty", () => {
                data.regions = [
                    {
                        start: null,
                        end: null
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_START_END_MISSING);
            });
            it("Throws error when axis info is invalid", () => {
                data.regions = [
                    {
                        axis: "x",
                        start: 10,
                        end: 10
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when axis provided is different than data-set axis", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 20
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when axis is not and data-set axis is Y2", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = [
                    {
                        start: 10,
                        end: 20
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when start value is invalid", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: "10",
                        end: 20
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(
                    errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                );
            });
            it("Throws error when end value is invalid", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: "20"
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(
                    errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                );
            });
            it("Throws error when start is more than end", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 20,
                        end: 10
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_START_MORE_END);
            });
            it("Throws error when x value is not provided", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_BAR_REGION_EMPTY_X_VALUE);
            });
            it("Throws error when x type is invalid", () => {
                const timeData = utils.deepClone(
                    getInput(valuesTimeSeries, false, false)
                );
                graphDefault.destroy();
                graphDefault = new Graph(getAxes(axisTimeSeries));
                timeData.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(timeData);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_FORMAT);
            });
            it("Throws error when x value provided is not in x axis ticks", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        x: 10
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).toThrowError(errors.THROW_MSG_INVALID_REGION_X_AXIS_TICK);
            });
            it("Correctly passes validation", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        x: 2
                    }
                ];
                bar = new Bar(data);
                expect(() => {
                    graphDefault.loadContent(bar);
                }).not.toThrow();
            });
        });
        it("Translates region correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 10,
                    end: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(regionElement.nodeName).toBe("rect");
            expect(toNumber(regionElement.getAttribute("y"), 10)).toBe(
                toNumber(graphDefault.scale.y(15), 10)
            );
        });
        it("Does not hide regions if graph has more than 1 data-set", () => {
            const inputSecondary = utils.deepClone(getInput(valuesDefault));
            inputSecondary.key = "uid_2";
            inputSecondary.regions = [
                {
                    start: 1,
                    end: 5,
                    x: 1
                }
            ];
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 1,
                    end: 5,
                    x: 1
                }
            ];
            bar = new Bar(data);
            const barContent = new Bar(inputSecondary);
            graphDefault.loadContent(bar);
            graphDefault.loadContent(barContent);
            const regionGroupElement = fetchAllElementsByClass(
                barGraphContainer,
                styles.region
            );
            expect(regionGroupElement.length).toBe(2);
            expect(regionGroupElement[0].getAttribute("aria-describedby")).toBe(
                `region_${data.key}`
            );
            expect(regionGroupElement[1].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}`
            );
            expect(regionGroupElement[0].getAttribute("aria-hidden")).toBe(
                "false"
            );
            expect(regionGroupElement[1].getAttribute("aria-hidden")).toBe(
                "false"
            );
            graphDefault.unloadContent(barContent);
        });
        it("Sets the height correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 10,
                    end: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(
                toNumber(regionElement.getAttribute("height"))
            ).toBeGreaterThan(constants.PADDING.top);
        });
        it("Creates a goal bar when start and end are same", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 15,
                    end: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(toNumber(regionElement.getAttribute("height"))).toBe(
                constants.DEFAULT_GOAL_LINE_STROKE_WIDTH
            );
        });
        it("Creates region correctly when start is not provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    end: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(toNumber(regionElement.getAttribute("y"))).toBeGreaterThan(
                constants.PADDING.top
            );
            expect(toNumber(regionElement.getAttribute("y"))).toBeLessThan(
                toNumber(graphDefault.config.height)
            );
        });
        it("Creates region correctly when end is not provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(toNumber(regionElement.getAttribute("y"))).toBe(0);
        });
        it("Creates region with correct, color if provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 10,
                    end: 15,
                    color: "#f44444",
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(regionElement.getAttribute("style")).toBe("fill: #f44444;");
        });
        it("sets width correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 10,
                    end: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            const graph = graphDefault.loadContent(bar);
            bar.redraw(graph);
            const regionWidth = fetchElementByClass(
                barGraphContainer,
                styles.region
            ).getAttribute("width");
            const barWidth = fetchElementByClass(
                barGraphContainer,
                styles.taskBar
            ).getAttribute("width");
            expect(toNumber(regionWidth)).toBeCloseTo(
                toNumber(barWidth) * 1.25,
                0
            );
        });
    });
    describe("On unload", () => {
        afterEach(() => {
            graphDefault.destroy();
        });
        it("Removes all regions", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 10,
                    end: 15,
                    x: 1
                },
                {
                    start: 10,
                    end: 15,
                    x: 2
                }
            ];
            bar = new Bar(data);
            graphDefault.loadContent(bar);
            graphDefault.unloadContent(bar);
            const regionElement = fetchElementByClass(
                barGraphContainer,
                styles.region
            );
            expect(regionElement).toBe(null);
        });
    });
    describe("On legend item hover", () => {
        describe("When multi-bar", () => {
            let inputPrimary = null;
            let inputSecondary = null;
            let barPrimary = null;
            let barSecondary = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = [
                    {
                        start: 1,
                        end: 5,
                        x: 1
                    }
                ];
                inputSecondary = utils.deepClone(
                    getInput(valuesDefault, false, false)
                );
                inputSecondary.key = "uid_2";
                inputSecondary.regions = [
                    {
                        start: 1,
                        end: 5,
                        x: 1
                    }
                ];
                barPrimary = new Bar(inputPrimary);
                barSecondary = new Bar(inputSecondary);
                graphDefault.loadContent(barPrimary);
                graphDefault.loadContent(barSecondary);
            });
            afterEach(() => {
                graphDefault.destroy();
            });
            it("Hides all the regions except current on mouse hover", (done) => {
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const regionElements = fetchAllElementsByClass(
                        barGraphContainer,
                        styles.region
                    );
                    expect(regionElements[0].getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    expect(regionElements[1].getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    done();
                });
            });
            it("Shows all the regions on mouse leave", (done) => {
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const regionElements = fetchAllElementsByClass(
                            barGraphContainer,
                            styles.region
                        );
                        expect(
                            regionElements[0].getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            regionElements[1].getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    });
                });
            });
        });
    });
});
