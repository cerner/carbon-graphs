"use strict";
import * as d3 from "d3";
import sinon from "sinon";
import Timeline from "../../../../main/js/controls/Timeline";
import {
    getShapeForTarget,
    getXAxisYPosition
} from "../../../../main/js/controls/Timeline/helpers/creationHelpers";
import { getYAxisHeight } from "../../../../main/js/helpers/axis";
import constants, {
    COLORS,
    SHAPES
} from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import {
    delay,
    toNumber,
    TRANSITION_DELAY,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisJSON,
    fetchElementByClass,
    getAxes,
    getData,
    secondaryValuesJSON,
    valuesJSON
} from "./helpers";

describe("Timeline - Load", () => {
    let input;
    let timeline = null;
    let TimelineGraphContainer;
    beforeEach(() => {
        TimelineGraphContainer = document.createElement("div");
        TimelineGraphContainer.id = "testCarbonTimeline";
        TimelineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        TimelineGraphContainer.setAttribute("class", "carbon-test-class");
        document.body.appendChild(TimelineGraphContainer);

        input = getData(valuesJSON);
        timeline = new Timeline(getAxes(axisJSON));
        timeline.loadContent(input);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("Validates input", () => {
        it("Throws error on empty input", () => {
            expect(() => {
                timeline.loadContent({});
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("Throws error on null input", () => {
            expect(() => {
                timeline.loadContent(null);
            }).toThrowError(errors.THROW_MSG_NO_DATA_LOADED);
        });
        it("Throws error on empty key", () => {
            expect(() => {
                const data = getData(valuesJSON);
                data.key = null;
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Throws error on undefined key", () => {
            expect(() => {
                const data = getData(valuesJSON);
                data.key = undefined;
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
        it("Throws error on invalid label", () => {
            expect(() => {
                const data = getData(valuesJSON);
                data.label = null;
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
        });
        it("Throws error on invalid label display", () => {
            expect(() => {
                const data = getData(valuesJSON);
                data.label = {};
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            expect(() => {
                const data = getData(valuesJSON);
                data.label = {
                    display: null
                };
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
            expect(() => {
                const data = getData(valuesJSON);
                data.label = {
                    display: ""
                };
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
        });
        it("Throws error for invalid values", () => {
            expect(() => {
                const data = getData(valuesJSON);
                data.values = null;
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_NO_DATA_POINTS);
        });
        it("Throws error for invalid values type", () => {
            timeline.destroy();
            timeline = new Timeline(getAxes(axisJSON));
            expect(() => {
                const data = getData(valuesJSON);
                data.values = [
                    {
                        x: 10
                    }
                ];
                timeline.loadContent(data);
            }).toThrowError(errors.THROW_MSG_INVALID_FORMAT_TYPE);
        });
        it("Throws error for duplicate keys", () => {
            expect(() => {
                timeline.loadContent(getData(valuesJSON));
            }).toThrowError(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        });
    });
    it("Clones the input object correctly", () => {
        expect(timeline.contentConfig[0].config.key).toBe(input.key);
        expect(timeline.contentConfig[0].config.color).toBe(input.color);
        expect(timeline.contentConfig[0].config.shape).toBe(input.shape);
        expect(timeline.contentConfig[0].config.label).toEqual(input.label);
        expect(timeline.contentConfig[0].config.onClick).toEqual(
            jasmine.any(Function)
        );
        expect(timeline.contentConfig[0].config.values.length).toBe(2);
        expect(
            timeline.contentConfig[0].config.values.every(
                (i, index) => i.x === input.values[index].x
            )
        ).toBeTruthy();
        expect(
            timeline.contentConfig[0].config.values.every(
                (i, index) => i.y === input.values[index].y
            )
        ).toBeTruthy();
    });
    it("Any changes to input object doesn't affect the config", () => {
        timeline.destroy();
        const mutatedInput = getData(valuesJSON, false, false);
        timeline = new Timeline(getAxes(axisJSON));
        timeline.loadContent(mutatedInput);
        mutatedInput.key = "";
        mutatedInput.color = "";
        mutatedInput.shape = "";
        mutatedInput.onClick = null;
        mutatedInput.label = {};
        mutatedInput.values = [];

        expect(timeline.contentConfig[0].config.key).not.toBe(mutatedInput.key);
        expect(timeline.contentConfig[0].config.color).not.toBe(
            mutatedInput.color
        );
        expect(timeline.contentConfig[0].config.shape).not.toBe(
            mutatedInput.shape
        );
        expect(timeline.contentConfig[0].config.label).not.toEqual(
            mutatedInput.label
        );
        expect(timeline.contentConfig[0].config.onClick).toEqual(
            jasmine.any(Function)
        );
        expect(timeline.contentConfig[0].config.values).not.toBe(
            mutatedInput.values
        );
        expect(timeline.contentConfig[0].config.values.length).toBe(2);
    });
    it("Defaults color to black when not provided", () => {
        const data = timeline.contentConfig[0].dataTarget;
        expect(
            data.internalValuesSubset.every(
                (j) => j.color === constants.DEFAULT_COLOR
            )
        ).toBeTruthy();
    });
    it("Defaults shapes to circle when not provided", () => {
        const data = timeline.contentConfig[0].dataTarget;
        expect(
            data.internalValuesSubset.every((j) => j.shape === SHAPES.CIRCLE)
        ).toBeTruthy();
    });
    it("when custom padding is used", () => {
        timeline.destroy();
        input = getData(valuesJSON);
        const config = getAxes(axisJSON);
        config.padding = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        };
        timeline = new Timeline(config);
        timeline.loadContent(input);
        const canvas = d3.select(`.${styles.canvas}`);
        const canvasHeight =
            getYAxisHeight(timeline.config) +
            (config.padding.bottom * 2 + config.padding.top) * 2;
        expect(toNumber(canvas.attr("height"), 10)).toEqual(canvasHeight);
        expect(getXAxisYPosition(timeline.config)).toEqual(
            (config.padding.top + config.padding.bottom) * 2
        );
    });
    describe("Draws the graph", () => {
        let input = null;
        let secondaryInput = null;
        beforeEach(() => {
            timeline.destroy();
            input = getData(valuesJSON, false, false);
            secondaryInput = getData(secondaryValuesJSON, false, false);
            secondaryInput.key = "uid_2";
            timeline = new Timeline(getAxes(axisJSON));
            timeline.loadContent(input);
        });
        it("Adds content container for each content", () => {
            const contentContainer = fetchElementByClass(
                styles.timelineContentGroup
            );
            expect(contentContainer).not.toBeNull();
            expect(contentContainer.tagName).toBe("g");
            expect(contentContainer.getAttribute("aria-describedby")).toBe(
                input.key
            );
        });
        it("Adds container for each data points sets for each line", () => {
            timeline.loadContent(secondaryInput);
            const graphContent = document.body.querySelectorAll(
                `.${styles.timelineContentGroup}`
            );
            expect(graphContent.length).toBe(2);
        });
        it("Adds legend for each data points sets for each line", () => {
            timeline.loadContent(secondaryInput);
            const legendItems = document.body.querySelectorAll(
                `.${styles.legendItem}`
            );
            expect(legendItems.length).toBe(2);
        });
        it("Disables legend when disabled flag is set", () => {
            timeline.destroy();
            timeline = new Timeline(getAxes(axisJSON));
            input = getData(valuesJSON, false, false);
            input.label.isDisabled = true;
            timeline.loadContent(input);
            const legendItem = document.body.querySelector(
                `.${styles.legendItem}`
            );
            expect(legendItem.getAttribute("aria-disabled")).toBe("true");
        });
        it("Adds points for each data point", () => {
            const pointsGroup = fetchElementByClass(
                styles.timelineContentGroup
            );
            const points = pointsGroup.querySelectorAll(`.${styles.point}`);
            expect(points.length).toBe(valuesJSON.length);
        });
        it("Points have correct color", () => {
            const points = fetchElementByClass(styles.point);
            expect(points.attributes.getNamedItem("style").value).toBe(
                `fill: ${COLORS.GREEN};`
            );
        });
        it("Points have correct shape", () => {
            const points = fetchElementByClass(styles.point);
            expect(
                points.firstChild.firstChild.attributes.getNamedItem("d").value
            ).toBe(SHAPES.RHOMBUS.path.d);
        });
        it("Points have correct unique key assigned", () => {
            const points = fetchElementByClass(styles.point);
            expect(points.getAttribute("aria-describedby")).toBe(input.key);
        });
        it("Adds a selected data point for each point", () => {
            const pointsGroup = fetchElementByClass(
                styles.timelineContentGroup
            );
            const selectedPoints = pointsGroup.querySelectorAll(
                `.${styles.dataPointSelection}`
            );
            expect(selectedPoints.length).toBe(valuesJSON.length);
        });
        it("Selected data point is hidden by default", () => {
            const selectedPoints = fetchElementByClass(
                styles.dataPointSelection
            );
            expect(selectedPoints.getAttribute("aria-hidden")).toBe("true");
        });
        it("Selected data point has circle as shape", () => {
            const selectedPoints = fetchElementByClass(
                styles.dataPointSelection
            );
            expect(selectedPoints.tagName).toBe("svg");
            expect(selectedPoints.firstChild.nodeName).toBe("g");
            expect(selectedPoints.firstChild.firstChild.nodeName).toBe("path");
            expect(selectedPoints.firstChild.firstChild.getAttribute("d")).toBe(
                SHAPES.CIRCLE.path.d
            );
        });
        it("Selected data point has correct unique key assigned", () => {
            const selectedPoints = fetchElementByClass(
                styles.dataPointSelection
            );
            expect(selectedPoints.getAttribute("aria-describedby")).toBe(
                input.key
            );
        });
        describe("When clicked on a data point", () => {
            it("Does not do anything if no onClick callback is provided", (done) => {
                const onClickFunctionSpy = sinon.spy();
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                input = getData(valuesJSON, false, false);
                input.onClick = null;
                timeline.loadContent(input);
                const point = fetchElementByClass(styles.point);
                triggerEvent(point, "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBeFalsy();
                    expect(point.getAttribute("aria-disabled")).toBe("true");
                    done();
                });
            });
            it("Hides data point selection when parameter callback is called", (done) => {
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                input = getData(valuesJSON, false, false);
                input.onClick = (clearSelectionCallback) => {
                    clearSelectionCallback();
                };
                timeline.loadContent(input);
                const point = fetchElementByClass(styles.point);
                triggerEvent(point, "click", () => {
                    const selectionPoint = fetchElementByClass(
                        styles.dataPointSelection
                    );
                    expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    done();
                });
            });
            it("Calls onClick callback", (done) => {
                const onClickFunctionSpy = sinon.spy();
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                input = getData(valuesJSON, false, false);
                input.onClick = onClickFunctionSpy;
                timeline.loadContent(input);
                const point = fetchElementByClass(styles.point);
                triggerEvent(point, "click", () => {
                    expect(onClickFunctionSpy.calledOnce).toBeTruthy();
                    done();
                });
            });
            it("Emits correct parameters", (done) => {
                let args = {};
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                input = getData(valuesJSON, false, false);
                input.onClick = (cb, key, index, val, target) => {
                    args = {
                        cb,
                        key,
                        index,
                        val,
                        target
                    };
                };
                timeline.loadContent(input);
                const point = document.querySelectorAll(`.${styles.point}`)[1];
                triggerEvent(point, "click", () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.x).toEqual(new Date(valuesJSON[1].x));
                    expect(args.target).not.toBeNull();
                    done();
                });
            });
            it("Highlights the data point", (done) => {
                const selectionPoint = fetchElementByClass(
                    styles.dataPointSelection
                );
                const point = fetchElementByClass(styles.point);
                triggerEvent(point, "click", () => {
                    expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    done();
                });
            });
            it("Removes highlight when data point is clicked again", (done) => {
                const selectionPoint = fetchElementByClass(
                    styles.dataPointSelection
                );
                const point = fetchElementByClass(styles.point);
                triggerEvent(point, "click", () => {
                    triggerEvent(point, "click", () => {
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
            });
        });
        describe("When clicked on a data point's near surrounding area", () => {
            it("highlights the data point", (done) => {
                const selectionPoint = fetchElementByClass(
                    styles.dataPointSelection
                );
                triggerEvent(selectionPoint, "click", () => {
                    expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                        "false"
                    );
                    done();
                });
            });
            it("removes highlight when clicked again", (done) => {
                const selectionPoint = fetchElementByClass(
                    styles.dataPointSelection
                );
                triggerEvent(selectionPoint, "click", () => {
                    triggerEvent(selectionPoint, "click", () => {
                        expect(selectionPoint.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                        done();
                    });
                });
            });
            it("Emits correct parameters", (done) => {
                let args = {};
                timeline.destroy();
                timeline = new Timeline(getAxes(axisJSON));
                input = getData(valuesJSON, false, false);
                input.onClick = (cb, key, index, val, target) => {
                    args = {
                        cb,
                        key,
                        index,
                        val,
                        target
                    };
                };
                timeline.loadContent(input);
                const point = document.querySelectorAll(
                    `.${styles.dataPointSelection}`
                )[1];
                triggerEvent(point, "click", () => {
                    expect(args).not.toBeNull();
                    expect(args.cb).toEqual(jasmine.any(Function));
                    expect(args.key).toBe("uid_1");
                    expect(args.index).toBe(1);
                    expect(args.val).not.toBeNull();
                    expect(args.val.x).toEqual(new Date(valuesJSON[1].x));
                    expect(args.target).not.toBeNull();
                    done();
                });
            });
        });
    });
    describe("Prepares to load legend item", () => {
        beforeEach(() => {
            timeline.destroy();
            timeline = new Timeline(getAxes(axisJSON));
        });
        it("Does not load if legend is opted to be hidden", () => {
            timeline.destroy();
            const input = getAxes(axisJSON);
            input.showLegend = false;
            const noLegendGraph = new Timeline(input);
            noLegendGraph.loadContent(getData(valuesJSON));
            const legendContainer = fetchElementByClass(styles.legend);
            expect(legendContainer).toBeNull();
            noLegendGraph.destroy();
        });
        it("Loads item with a shape and text", () => {
            const input = getData(valuesJSON, false, false);
            timeline.loadContent(input);
            const legendItem = fetchElementByClass(styles.legendItem);
            const legendItemBtn = fetchElementByClass(styles.legendItemBtn);
            const iconSVG = legendItemBtn.children[0].firstChild;
            expect(legendItem).not.toBeNull();
            expect(legendItem.getAttribute("aria-current")).toBe("true");
            expect(legendItem.getAttribute("aria-disabled")).toBe("false");
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
            expect(iconSVG.tagName).toBe("svg");
            expect(
                iconSVG.classList.contains(styles.legendItemIcon)
            ).toBeTruthy();
        });
        it("Loads the correct shape", () => {
            const input = getData(valuesJSON, false, false);
            timeline.loadContent(input);
            const legendItem = fetchElementByClass(styles.legendItem);
            const iconSVG = legendItem.querySelector("svg");
            const iconPath = legendItem.querySelector("path");
            expect(iconSVG).not.toBeNull();
            expect(iconSVG.classList).toContain(styles.legendItemIcon);
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
            expect(iconPath.getAttribute("d")).toBe(SHAPES.RHOMBUS.path.d);
        });
        it("Loads the correct color", () => {
            const input = getData(valuesJSON, false, false);
            timeline.loadContent(input);
            const legendItem = fetchElementByClass(styles.legendItem);
            const iconSVG = legendItem.querySelector("svg");
            const iconPath = legendItem.querySelector("path");
            expect(iconPath).not.toBeNull();
            expect(iconPath.getAttribute("d")).not.toBeNull();
            expect(iconPath.getAttribute("d")).toEqual(
                getShapeForTarget(input).path.d
            );
            expect(iconSVG.getAttribute("style")).toBe(
                `fill: ${COLORS.GREEN};`
            );
        });
        it("Attaches click event handlers correctly", (done) => {
            const input = getData(valuesJSON, false, false);
            timeline.loadContent(input);
            const legendItem = fetchElementByClass(styles.legendItem);
            triggerEvent(legendItem, "click", () => {
                expect(legendItem.getAttribute("aria-current")).toBe("false");
                done();
            });
        });
        it("On click hides data points", (done) => {
            const rafSpy = spyOn(
                window,
                "requestAnimationFrame"
            ).and.callThrough();
            timeline.loadContent(getData(valuesJSON, false, false));
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "click",
                () => {
                    timeline.resize();
                    delay(() => {
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(1);
                        expect(
                            fetchElementByClass(styles.point).getAttribute(
                                "aria-hidden"
                            )
                        ).toBe("true");
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        rafSpy.calls.reset();
                        done();
                    }, TRANSITION_DELAY);
                }
            );
        });
        it("On click, removes the first data point set but keeps the rest", (done) => {
            const inputPrimary = getData(valuesJSON, false, false);
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Timeline B"
                },
                values: valuesJSON
            };
            timeline.loadContent(inputPrimary);
            timeline.loadContent(inputSecondary);
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "click",
                () => {
                    timeline.resize();
                    delay(() => {
                        const primaryElement = document.querySelector(
                            `.${styles.timelineContentGroup}[aria-describedby="${inputPrimary.key}"]`
                        );
                        const secondaryElement = document.querySelector(
                            `.${styles.timelineContentGroup}[aria-describedby="${inputSecondary.key}"]`
                        );
                        expect(timeline.config.shownTargets.length).toBe(1);
                        expect(
                            primaryElement
                                .querySelector(`.${styles.point}`)
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            primaryElement
                                .querySelector(`.${styles.dataPointSelection}`)
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        expect(
                            secondaryElement
                                .querySelector(`.${styles.point}`)
                                .getAttribute("aria-hidden")
                        ).toBe("false");
                        expect(
                            secondaryElement
                                .querySelector(`.${styles.dataPointSelection}`)
                                .getAttribute("aria-hidden")
                        ).toBe("true");
                        done();
                    }, TRANSITION_DELAY);
                }
            );
        });
        it("On clicking twice toggles points back to visible", (done) => {
            const rafSpy = spyOn(
                window,
                "requestAnimationFrame"
            ).and.callThrough();
            timeline.loadContent(getData(valuesJSON, false, false));
            const legendItem = fetchElementByClass(styles.legendItem);
            triggerEvent(legendItem, "click", () => {
                timeline.resize();
                triggerEvent(legendItem, "click", () => {
                    timeline.resize();
                    delay(() => {
                        expect(
                            window.requestAnimationFrame
                        ).toHaveBeenCalledTimes(2);
                        expect(
                            fetchElementByClass(styles.point).getAttribute(
                                "aria-hidden"
                            )
                        ).toBe("false");
                        expect(
                            fetchElementByClass(
                                styles.dataPointSelection
                            ).getAttribute("aria-hidden")
                        ).toBe("true");
                        rafSpy.calls.reset();
                        done();
                    }, TRANSITION_DELAY);
                });
            });
        });
        it("Shown targets are removed from Graph", (done) => {
            timeline.loadContent(getData(valuesJSON, false, false));
            triggerEvent(
                fetchElementByClass(styles.legendItem),
                "click",
                () => {
                    expect(timeline.config.shownTargets.length).toBe(0);
                    done();
                }
            );
        });
        it("Shown targets are updated back when toggled", (done) => {
            timeline.loadContent(getData(valuesJSON, false, false));
            const legendItem = fetchElementByClass(styles.legendItem);
            triggerEvent(legendItem, "click", () => {
                triggerEvent(legendItem, "click", () => {
                    expect(timeline.config.shownTargets.length).toBe(1);
                    done();
                });
            });
        });
        it("Attaches mouse enter event handlers correctly", (done) => {
            const inputPrimary = getData(valuesJSON, false, false);
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                },
                values: valuesJSON
            };
            timeline.loadContent(inputPrimary);
            timeline.loadContent(inputSecondary);
            const legendItem = fetchElementByClass(styles.legendItem);
            triggerEvent(legendItem, "mouseenter", () => {
                expect(
                    document
                        .querySelector(
                            `.${styles.point}[aria-describedby="${inputSecondary.key}"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeTruthy();
                done();
            });
        });
        it("Attaches mouse leave event handlers correctly", (done) => {
            const inputPrimary = getData(valuesJSON, false, false);
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                },
                values: valuesJSON
            };
            timeline.loadContent(inputPrimary);
            timeline.loadContent(inputSecondary);
            const legendItem = fetchElementByClass(styles.legendItem);
            triggerEvent(legendItem, "mouseleave", () => {
                expect(
                    document
                        .querySelector(
                            `.${styles.point}[aria-describedby="${inputSecondary.key}"]`
                        )
                        .classList.contains(styles.blur)
                ).toBeFalsy();
                done();
            });
        });
    });
    describe("When legend item is clicked", () => {
        it("Preserves the DOM order", () => {
            timeline.destroy();
            timeline = new Timeline(getAxes(axisJSON));
            const inputPrimary = getData(valuesJSON, false, false);
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                },
                values: valuesJSON
            };
            timeline.loadContent(inputPrimary);
            timeline.loadContent(inputSecondary);
            const legendItem = document.querySelector(
                `.${styles.legendItem}[aria-describedby="${inputPrimary.key}"]`
            );
            expect(timeline.config.shownTargets).toEqual(["uid_1", "uid_2"]);
            triggerEvent(legendItem, "click");
            triggerEvent(legendItem, "click");
            expect(timeline.config.shownTargets).toEqual(["uid_2", "uid_1"]);
            expect(
                document
                    .querySelector(`.${styles.timelineContentGroup}`)
                    .getAttribute("aria-describedby")
            ).toEqual(inputPrimary.key);
        });
    });
});
