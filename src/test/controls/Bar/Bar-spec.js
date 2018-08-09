"use strict";
import Bar from "../../../main/js/controls/Bar/Bar";
import Graph from "../../../main/js/controls/Graph/Graph";
import constants, { COLORS } from "../../../main/js/helpers/constants";
import errors from "../../../main/js/helpers/errors";
import styles from "../../../main/js/helpers/styles";
import utils from "../../../main/js/helpers/utils";
import {
    axisDefault,
    axisTimeSeries,
    barClickHandlerSpy,
    fetchElementByClass,
    getAxes,
    getInput,
    triggerEvent,
    valuesDefault,
    valuesTimeSeries
} from "./helpers";

describe("Bar", () => {
    let graphDefault = null;
    let barGraphContainer;
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
    describe("when constructed", () => {
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
                        dummy: "dummy",
                        key: "bar_1"
                    })
                );
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("throws error when no values are provided", () => {
            const input = utils.deepClone(getInput(valuesDefault));
            input.values = [];
            expect(() => {
                graphDefault.loadContent(new Bar(input));
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
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
    describe("when graph is loaded with input", () => {
        it("returns the graph instance", () => {
            const loadedBar = new Bar(getInput(valuesDefault, false, false));
            loadedBar.load(graphDefault);
            expect(loadedBar instanceof Bar).toBeTruthy();
        });
        it("internal subsets gets created correctly for each data point", () => {
            const graph = graphDefault.loadContent(
                new Bar(getInput(valuesDefault, false, false))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) =>
                        j.onClick !== null &&
                        j.x !== null &&
                        j.y !== null &&
                        j.label !== null &&
                        j.color &&
                        j.yAxis &&
                        j.key === data.key
                )
            ).toBeTruthy();
            expect(graph.config.shownTargets.length).toBe(1);
        });
        it("internal subsets gets created successfully for time series", () => {
            const graphTimeSeries = new Graph(getAxes(axisTimeSeries));
            const graph = graphTimeSeries.loadContent(
                new Bar(getInput(valuesTimeSeries, false, false))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => typeof j.x === "object" && j.x instanceof Date
                )
            ).toBeTruthy();
        });
        it("defaults color to blue when not provided", () => {
            const graph = graphDefault.loadContent(
                new Bar(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every((j) => j.color === COLORS.BLUE)
            ).toBeTruthy();
        });
        it("defaults axis to Y axis when not provided", () => {
            const graph = graphDefault.loadContent(
                new Bar(getInput(valuesDefault))
            );
            const data = graph.content[0].dataTarget;
            expect(
                data.internalValuesSubset.every(
                    (j) => j.yAxis === constants.Y_AXIS
                )
            ).toBeTruthy();
        });
        it("defaults bar content cascade group to key value if no group is provided", () => {
            const input = getInput(valuesDefault);
            const graph = graphDefault.loadContent(new Bar(input));
            const data = graph.content[0].dataTarget;
            expect(data.group).toEqual(input.key);
        });
        describe("draws the graph", () => {
            let input = null;
            beforeEach(() => {
                input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
            });
            it("adds content container for bars", () => {
                const barContentContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                expect(barContentContainer).not.toBeNull();
                expect(barContentContainer.tagName).toBe("g");
                expect(
                    barContentContainer.getAttribute("aria-describedby")
                ).toBe(input.key);
            });
            it("adds legend for each bar content", () => {
                const secInput = utils.deepClone(input);
                secInput.key = "uid_2";
                graphDefault.loadContent(new Bar(secInput));
                const legendItems = document.body.querySelectorAll(
                    `.${styles.legendItem}`
                );
                expect(legendItems.length).toBe(2);
            });
            it("add bar group for bar content", () => {
                const barContentContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                const barGroup = fetchElementByClass(
                    barContentContainer,
                    styles.currentBarsGroup
                );
                expect(barGroup).not.toBeNull();
                expect(barGroup.tagName).toBe("g");
                expect(barGroup.getAttribute("transform")).not.toBeNull();
            });
            it("adds bar as an SVG", () => {
                const barContentContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                const barGroup = fetchElementByClass(
                    barContentContainer,
                    styles.currentBarsGroup
                );
                expect(barGroup.firstChild.tagName).toBe("g");
                expect(
                    barGroup.firstChild.classList.contains(styles.bar)
                ).toBeTruthy();
            });
            it("adds bars with correct color", () => {
                const barElement = fetchElementByClass(
                    barGraphContainer,
                    styles.bar
                );
                expect(barElement.firstChild.tagName).toBe("rect");
                expect(
                    barElement.firstChild.attributes.getNamedItem("style").value
                ).toBe("fill: #007cc3;stroke: #007cc3;");
            });
            it("adds bar content with correct unique key", () => {
                const barElement = fetchElementByClass(
                    barGraphContainer,
                    styles.barGraphContent
                );
                expect(
                    barElement.attributes.getNamedItem("aria-describedby").value
                ).toBe(input.key);
            });
            describe("when clicked on a data point", () => {
                it("does not do anything if no onClick callback is provided", (done) => {
                    graphDefault.destroy();
                    graphDefault = new Graph(getAxes(axisDefault));
                    input = getInput(valuesDefault, false, false);
                    input.onClick = null;
                    graphDefault.loadContent(new Bar(input));
                    const bar = fetchElementByClass(
                        barGraphContainer,
                        styles.bar
                    );
                    triggerEvent(bar, "click", () => {
                        expect(barClickHandlerSpy.calledOnce).toBeFalsy();
                        done();
                    });
                });
            });
        });
        describe("prepares to load legend item", () => {
            afterEach(() => {
                graphDefault.destroy();
            });
            it("does not load if legend is opted to be hidden", () => {
                graphDefault.destroy();
                const input = getAxes(axisDefault);
                input.showLegend = false;
                const noLegendGraph = new Graph(input);
                noLegendGraph.loadContent(new Bar(getInput(valuesDefault)));
                const legendContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.legend
                );
                expect(legendContainer).toBeNull();
                noLegendGraph.destroy();
            });
            it("does not load if label display value is not provided", () => {
                const input = getInput(valuesDefault);
                input.label.display = "";
                graphDefault.loadContent(new Bar(input));
                const legendContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(0);
            });
            it("sanitizes the legend display", () => {
                const input = getInput(valuesDefault);
                input.label.display = "<HELLO DUMMY X LABEL>";
                graphDefault.loadContent(new Bar(input));
                const legendContainer = fetchElementByClass(
                    barGraphContainer,
                    styles.legend
                );
                const legendItems = legendContainer.children;
                expect(legendContainer).not.toBeNull();
                expect(legendContainer.tagName).toBe("UL");
                expect(legendItems.length).toBe(1);
            });
            it("loads item with a shape and text", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                const legendItemBtn = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItemBtn
                );
                expect(legendItem).not.toBeNull();
                expect(legendItem.getAttribute("aria-selected")).toBe("true");
                expect(legendItem.children[1].className).toBe(
                    styles.legendItemText
                );
                expect(legendItem.children[1].tagName).toBe("LABEL");
                expect(legendItem.children[1].textContent).toBe(
                    input.label.display
                );
                expect(legendItemBtn).not.toBeNull();
                expect(legendItemBtn.getAttribute("class")).toBe(
                    styles.legendItemBtn
                );
                expect(legendItemBtn.children[0].tagName).toBe("svg");
                expect(
                    legendItemBtn.children[0].classList.contains(
                        styles.legendItemIcon
                    )
                ).toBeTruthy();
            });
            it("loads the correct color", () => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                const iconPath = legendItem.querySelector("path");
                expect(iconPath).not.toBeNull();
                expect(iconPath.getAttribute("d")).not.toBeNull();
                expect(iconPath.getAttribute("style")).toBe(
                    `fill: ${COLORS.BLUE}`
                );
            });
            it("attaches click event handlers correctly", (done) => {
                const input = getInput(valuesDefault, false, false);
                graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    expect(legendItem.getAttribute("aria-selected")).toBe(
                        "false"
                    );
                    done();
                });
            });
            it("on click hides the bars", (done) => {
                spyOn(window, "requestAnimationFrame").and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const bar = new Bar(input);
                const graph = graphDefault.loadContent(bar);
                triggerEvent(
                    fetchElementByClass(barGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        bar.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(1);
                        expect(
                            fetchElementByClass(
                                barGraphContainer,
                                styles.bar
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    }
                );
            });
            it("on click, removes the first bar content but keeps the rest", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryBar = new Bar(inputPrimary);
                const secondaryBar = new Bar(inputSecondary);
                graphDefault.loadContent(primaryBar);
                const graph = graphDefault.loadContent(secondaryBar);
                triggerEvent(
                    fetchElementByClass(barGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        primaryBar.redraw(graph);
                        secondaryBar.redraw(graph);
                        const primaryBarElement = barGraphContainer.querySelector(
                            `.${styles.barGraphContent}[aria-describedby="${
                                inputPrimary.key
                            }"]`
                        );
                        const secondaryBarElement = barGraphContainer.querySelector(
                            `.${styles.barGraphContent}[aria-describedby="${
                                inputSecondary.key
                            }"]`
                        );
                        expect(graph.config.shownTargets.length).toBe(1);
                        expect(
                            fetchElementByClass(
                                primaryBarElement,
                                styles.bar
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                secondaryBarElement,
                                styles.bar
                            ).firstChild.getAttribute("aria-hidden")
                        ).toBe("false");
                        done();
                    }
                );
            });
            it("on clicking twice toggles the bars back to visible", (done) => {
                spyOn(window, "requestAnimationFrame").and.callThrough();
                const input = getInput(valuesDefault, false, false);
                const bar = new Bar(input);
                const graph = graphDefault.loadContent(bar);
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    bar.redraw(graph);
                    triggerEvent(legendItem, "click", () => {
                        bar.redraw(graph);
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(2);
                        expect(
                            fetchElementByClass(barGraphContainer, styles.bar)
                                .firstChild.style.display
                        ).toBe("");
                        done();
                    });
                });
            });
            it("shown targets are removed from Graph", (done) => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Bar(input));
                triggerEvent(
                    fetchElementByClass(barGraphContainer, styles.legendItem),
                    "click",
                    () => {
                        expect(graph.config.shownTargets.length).toBe(0);
                        done();
                    }
                );
            });
            it("shown targets are updated back when toggled", (done) => {
                const input = getInput(valuesDefault, false, false);
                const graph = graphDefault.loadContent(new Bar(input));
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(legendItem, "click", () => {
                        expect(graph.config.shownTargets.length).toBe(1);
                        done();
                    });
                });
            });
            it("attaches mouse enter event handlers correctly", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryBar = new Bar(inputPrimary);
                const secondaryBar = new Bar(inputSecondary);
                graphDefault.loadContent(primaryBar);
                graphDefault.loadContent(secondaryBar);
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="${inputSecondary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeTruthy();
                    done();
                });
            });
            it("attaches mouse leave event handlers correctly", (done) => {
                const inputPrimary = getInput(valuesDefault, false, false);
                const inputSecondary = {
                    key: `uid_2`,
                    label: {
                        display: "Data Label B"
                    },
                    values: valuesDefault
                };
                const primaryBar = new Bar(inputPrimary);
                const secondaryBar = new Bar(inputSecondary);
                graphDefault.loadContent(primaryBar);
                graphDefault.loadContent(secondaryBar);
                const legendItem = fetchElementByClass(
                    barGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseleave", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="${inputSecondary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.blur)
                    ).toBeFalsy();
                    done();
                });
            });
        });
    });
    describe("when graph is unloaded off input", () => {
        let bar;
        beforeEach(() => {
            bar = new Bar(getInput(valuesDefault, false, false));
            graphDefault.loadContent(bar);
        });
        afterEach(() => {
            graphDefault.destroy();
        });
        it("returns the bar instance", () => {
            const unloadedBar = bar.unload(graphDefault);
            expect(unloadedBar instanceof Bar);
        });
        it("clears the graph", () => {
            graphDefault.unloadContent(bar);
            const barContentContainer = fetchElementByClass(
                barGraphContainer,
                styles.barGraphContent
            );
            expect(barContentContainer).toBeNull();
        });
        it("removes the legend from graph", () => {
            graphDefault.unloadContent(bar);
            const graphLegend = fetchElementByClass(
                barGraphContainer,
                styles.legend
            );
            const barLegendItem = fetchElementByClass(
                barGraphContainer,
                styles.legendItem
            );
            expect(graphLegend).not.toBeNull();
            expect(barLegendItem).toBeNull();
        });
        it("resets the bar graph instance properties", () => {
            graphDefault.unloadContent(bar);
            expect(bar.dataTarget).toEqual({});
            expect(bar.config).toEqual({});
        });
    });
});
