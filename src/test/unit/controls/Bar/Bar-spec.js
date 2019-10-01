"use strict";
import Carbon from "../../../../main/js/carbon";
import Bar from "../../../../main/js/controls/Bar/Bar";
import Graph from "../../../../main/js/controls/Graph/Graph";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { loadCustomJasmineMatcher } from "../../helpers/commonHelpers";
import {
    axisDefault,
    axisInfoRowDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Bar", () => {
    let graphDefault = null;
    let barGraphContainer;
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
        document.body.innerHTML = "";
    });
    describe("When constructed", () => {
        it("initializes properly", () => {
            const bar = new Bar(getInput(valuesDefault));
            expect(bar.config).not.toBeNull();
            expect(bar.valuesRange).not.toBeNull();
            expect(bar.dataTarget).toEqual({});
        });
        it("throws error when no input is provided", () => {
            expect(() => {
                graphDefault.loadContent(new Bar());
            }).toThrowError(errors.THROW_MSG_NO_CONTENT_DATA_LOADED);
        });
        it("throws error when invalid input is provided", () => {
            expect(() => {
                graphDefault.loadContent(
                    new Bar({
                        label: { display: "data label" },
                        dummy: "dummy"
                    })
                );
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("throws error when no values are provided", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = undefined;
            expect(() => {
                graphDefault.loadContent(new Bar(input));
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("does not throw error when empty array is provided", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = [];
            expect(() => {
                graphDefault.loadContent(new Bar(input));
            }).not.toThrow();
        });
        it("display the legend when empty array is provided as input", () => {
            graphDefault.loadContent(new Bar(getInput([])));
            const legendContainer = fetchElementByClass(
                barGraphContainer,
                styles.legend
            );
            const legendItems = legendContainer.children;
            expect(legendContainer).not.toBeNull();
            expect(legendContainer.tagName).toBe("UL");
            expect(legendItems.length).toBe(1);
            const legendItem = document.body.querySelector(
                `.${styles.legendItem}`
            );
            expect(legendItem.getAttribute("aria-disabled")).toBe("true");
            expect(legendItem.getAttribute("aria-current")).toBe("true");
        });
        it("throws error when no ticks are provided for x-axis", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.axis.x.ticks = {};
            const graphNoTicks = new Graph(axisData);
            expect(() => {
                graphNoTicks.loadContent(new Bar(getInput(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_EMPTY_X_AXIS_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when x-axis type doesn't match with input type", () => {
            const graph = new Graph(getAxes(axisDefault));
            expect(() => {
                graph.loadContent(new Bar(getInput(valuesTimeSeries)));
            }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
            graph.destroy();
        });
        it("throws error when x-axis ticks are missing for input values", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.axis.x.ticks = {
                values: [1, 2, 4, 5]
            };
            const graphNoTicks = new Graph(axisData);
            expect(() => {
                graphNoTicks.loadContent(new Bar(getInput(valuesDefault)));
            }).toThrowError(errors.THROW_MSG_INVALID_X_AXIS_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when x-axis ticks are missing for input axis info row", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            axisData.axis.x.ticks = {
                values: [1, 2]
            };
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.values = [
                {
                    x: 1,
                    y: 10
                },
                {
                    x: 2,
                    y: 15
                }
            ];
            data.axisInfoRow = axisInfoRowDefault;
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_INVALID_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row is empty", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_EMPTY_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row tick values do not match with X Axis tick values", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 6,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {
                            path: {
                                d: "M24,0l24,24L24,48L0,24L24,0z",
                                fill: Carbon.helpers.COLORS.ORANGE
                            },
                            options: {
                                x: -6,
                                y: -6,
                                scale: 0.25
                            }
                        },
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_INVALID_TICK_VALUES);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row does not have value property", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {
                            path: {
                                d: "M24,0l24,24L24,48L0,24L24,0z",
                                fill: Carbon.helpers.COLORS.ORANGE
                            },
                            options: {
                                x: -6,
                                y: -6,
                                scale: 0.25
                            }
                        },
                        label: {
                            display: "51",
                            secondaryDisplay: "ICU"
                        }
                    }
                },
                {
                    axis: "x",
                    x: 2
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(errors.THROW_MSG_AXIS_INFO_ROW_VALUE_NOT_PROVIDED);
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row label property is not provided", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {}
                    }
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(
                errors.THROW_MSG_AXIS_INFO_ROW_LABEL_DISPLAY_NOT_PROVIDED
            );
            graphNoTicks.destroy();
        });
        it("throws error when input axis info row label property does not have display", () => {
            const axisData = utils.deepClone(getAxes(axisDefault));
            const graphNoTicks = new Graph(axisData);
            const data = utils.deepClone(getInput(valuesDefault, false, false));
            data.axisInfoRow = [
                {
                    axis: "x",
                    x: 1,
                    value: {
                        onClick: () => {},
                        characterCount: 9,
                        color: Carbon.helpers.COLORS.ORANGE,
                        shape: {},
                        label: {}
                    }
                }
            ];
            const bar = new Bar(data);
            expect(() => {
                graphNoTicks.loadContent(bar);
            }).toThrowError(
                errors.THROW_MSG_AXIS_INFO_ROW_LABEL_DISPLAY_NOT_PROVIDED
            );
            graphNoTicks.destroy();
        });
        it("clones the input object correctly", () => {
            const input = getInput(valuesDefault, false, false);
            const bar = new Bar(input);
            expect(bar.config.key).toBe(input.key);
            expect(bar.config.color).toBe(input.color);
            expect(bar.config.shape).toBe(input.shape);
            expect(bar.config.label).toEqual(input.label);
            expect(bar.config.onClick).toEqual(jasmine.any(Function));
            expect(bar.config.values.length).toBe(3);
            expect(
                bar.config.values.every(
                    (i, index) => i.x === input.values[index].x
                )
            ).toBeTruthy();
            expect(
                bar.config.values.every(
                    (i, index) => i.y === input.values[index].y
                )
            ).toBeTruthy();
        });
        it("any changes to input object doesn't affect the config", () => {
            const input = getInput(valuesDefault, false, false);
            const bar = new Bar(input);
            input.key = "";
            input.color = "";
            input.shape = "";
            input.onClick = null;
            input.label = {};
            input.values = [];

            expect(bar.config.key).not.toBe(input.key);
            expect(bar.config.color).not.toBe(input.color);
            expect(bar.config.shape).not.toBe(input.shape);
            expect(bar.config.label).not.toEqual(input.label);
            expect(bar.config.onClick).toEqual(jasmine.any(Function));
            expect(bar.config.values).not.toBe(input.values);
            expect(bar.config.values.length).toBe(3);
        });
        it("calculates min and max values correctly for y axis", () => {
            const input = getInput(valuesDefault, false, false);
            const bar = new Bar(input);
            expect(bar.valuesRange.y.min).toBe(0);
            expect(bar.valuesRange.y.max).toBe(15);
            expect(bar.valuesRange.y2).toBeUndefined();
            expect(bar.valuesRange.y2).toBeUndefined();
        });
    });
});
