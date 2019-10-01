"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Line from "../../../../main/js/controls/Line";
import {
    getXAxisWidth,
    getXAxisXPosition
} from "../../../../main/js/helpers/axis";
import constants from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import { toNumber, triggerEvent } from "../../helpers/commonHelpers";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    inputSecondary,
    valuesDefault,
    inputTertiary
} from "./helpers";

describe("Line - Region", () => {
    let line = null;
    let data = null;
    let graphDefault = null;
    let lineGraphContainer;
    beforeEach(() => {
        lineGraphContainer = document.createElement("div");
        lineGraphContainer.id = "testLine_carbon";
        lineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(lineGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("On load", () => {
        describe("Ideally", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 5,
                        end: 15,
                        color: "#f4f4f4"
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
            });
            it("Creates region when present", () => {
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                const regionElement = fetchElementByClass(
                    regionGroupElement,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(1);
                expect(regionElement.nodeName).toBe("rect");
            });
            it("shows region by default", () => {
                const regionElement = fetchElementByClass(
                    fetchElementByClass(lineGraphContainer, styles.regionGroup),
                    styles.region
                );
                expect(regionElement.getAttribute("class")).toBe(styles.region);
                expect(regionElement.getAttribute("aria-hidden")).toBe("false");
                expect(regionElement.getAttribute("aria-describedby")).toBe(
                    `region_${data.key}`
                );
            });
        });
        it("Creates region only if present", () => {
            data = utils.deepClone(getInput(valuesDefault, false, false));
            data.regions = null;
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionGroupElement = fetchElementByClass(
                lineGraphContainer,
                styles.regionGroup
            );
            const regionElement = fetchElementByClass(
                regionGroupElement,
                styles.region
            );
            expect(regionGroupElement.childNodes.length).toBe(0);
            expect(regionElement).toBeNull();
        });
        describe("Creates region when there are multiple regions", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 5,
                        end: 10
                    },
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                graphDefault.loadContent(line);
            });
            it("Correctly renders", () => {
                const regionGroupElement = fetchElementByClass(
                    lineGraphContainer,
                    styles.regionGroup
                );
                const regionElement = fetchElementByClass(
                    regionGroupElement,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(2);
                expect(regionElement.nodeName).toBe("rect");
            });
            it("shows multiple regions face-up by default", () => {
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
            });
            it("Throws error when empty", () => {
                data.regions = [{}];
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
                }).toThrowError(errors.THROW_MSG_REGION_EMPTY);
            });
            it("Throws error when both start and end are empty", () => {
                data.regions = [
                    {
                        start: null,
                        end: null
                    }
                ];
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
                }).toThrowError(errors.THROW_MSG_REGION_START_END_MISSING);
            });
            it("Throws error when axis info is invalid", () => {
                data.regions = [
                    {
                        axis: "x",
                        start: 10,
                        end: 20
                    }
                ];
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when axis info is invalid for Y2 axis", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = [
                    {
                        axis: "x",
                        start: 10,
                        end: 20
                    }
                ];
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
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
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
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
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
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
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
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
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
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
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
                }).toThrowError(errors.THROW_MSG_REGION_START_MORE_END);
            });
            it("Correctly passes validation", () => {
                data.regions = [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15
                    }
                ];
                line = new Line(data);
                expect(() => {
                    graphDefault.loadContent(line);
                }).not.toThrow();
            });
        });
        it("Translates region correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(regionElement.nodeName).toBe("rect");
            expect(+regionElement.getAttribute("x")).toBe(
                getXAxisXPosition(graphDefault.config)
            );
            expect(toNumber(regionElement.getAttribute("y"), 10)).toBe(
                toNumber(graphDefault.scale.y(15), 10) +
                    constants.PADDING.bottom
            );
        });
        it("Does not hide regions if graph has only 1 data-set", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 1,
                    end: 5
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionGroupElement = fetchElementByClass(
                lineGraphContainer,
                styles.regionGroup
            );
            const regionElement = fetchElementByClass(
                regionGroupElement,
                styles.region
            );
            expect(regionGroupElement.childNodes.length).toBe(1);
            expect(regionElement.getAttribute("aria-describedby")).toBe(
                `region_${data.key}`
            );
            expect(regionElement.getAttribute("aria-hidden")).toBe("false");
        });
        it("Hides all the regions if graph has more than 1 data-set", () => {
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    display: "Data Label B"
                },
                values: valuesDefault
            };
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 1,
                    end: 5
                },
                {
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            const lineContent = new Line(inputSecondary);
            graphDefault.loadContent(line);
            graphDefault.loadContent(lineContent);
            const regionGroupElement = fetchElementByClass(
                lineGraphContainer,
                styles.regionGroup
            );
            expect(regionGroupElement.childNodes.length).toBe(2);
            expect(
                regionGroupElement.childNodes[0].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}`);
            expect(
                regionGroupElement.childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}`);
            expect(
                regionGroupElement.childNodes[0].getAttribute("aria-hidden")
            ).toBe("true");
            expect(
                regionGroupElement.childNodes[1].getAttribute("aria-hidden")
            ).toBe("true");
            graphDefault.unloadContent(lineContent);
        });
        it("Sets the width correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("width")).toBe(
                getXAxisWidth(graphDefault.config)
            );
        });
        it("Sets the height correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("height")).toBeGreaterThan(
                constants.PADDING.top
            );
        });
        it("Creates a region line when start and end are same", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    axis: constants.Y_AXIS,
                    start: 15,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("height")).toBe(
                constants.DEFAULT_REGION_LINE_STROKE_WIDTH
            );
        });
        it("Creates region correctly when start is not provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("x")).toBe(
                getXAxisXPosition(graphDefault.config)
            );
            expect(+regionElement.getAttribute("y")).toBeGreaterThan(
                constants.PADDING.top
            );
            expect(+regionElement.getAttribute("y")).toBeLessThan(
                +graphDefault.config.height
            );
        });
        it("Creates region correctly when end is not provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("x")).toBe(
                getXAxisXPosition(graphDefault.config)
            );
            expect(+regionElement.getAttribute("y")).toBe(
                constants.PADDING.bottom
            );
        });
        it("Creates region correctly for y2 axis", () => {
            data = utils.deepClone(getInput(valuesDefault, false, false, true));
            data.regions = [
                {
                    axis: constants.Y2_AXIS,
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(regionElement.nodeName).toBe("rect");
            expect(+regionElement.getAttribute("x")).toBe(
                getXAxisXPosition(graphDefault.config)
            );
            expect(toNumber(regionElement.getAttribute("y"), 10)).toBe(
                toNumber(graphDefault.scale.y2(15), 10) +
                    constants.PADDING.bottom
            );
        });
        it("Creates region with correct, color if provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 10,
                    end: 15,
                    color: "#f44444"
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            const regionElement = fetchElementByClass(
                lineGraphContainer,
                styles.region
            );
            expect(regionElement.getAttribute("style")).toBe("fill: #f44444;");
        });
    });
    describe("On unload", () => {
        it("Removes any region", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            graphDefault.unloadContent(line);
            const regionGroupElement = fetchElementByClass(
                lineGraphContainer,
                styles.regionGroup
            );
            expect(regionGroupElement.childNodes.length).toBe(0);
        });
        it("Removes all regions", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = [
                {
                    start: 1,
                    end: 5
                },
                {
                    start: 10,
                    end: 15
                }
            ];
            line = new Line(data);
            graphDefault.loadContent(line);
            graphDefault.unloadContent(line);
            const regionGroupElement = fetchElementByClass(
                lineGraphContainer,
                styles.regionGroup
            );
            expect(regionGroupElement.childNodes.length).toBe(0);
        });
    });
    describe("On legend item hover", () => {
        describe("When single-line", () => {
            let inputPrimary = null;
            let linePrimary = null;
            let lineSecondary = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = [
                    {
                        start: 1,
                        end: 5
                    }
                ];
                linePrimary = new Line(inputPrimary);
                lineSecondary = new Line(inputSecondary);
                graphDefault.loadContent(linePrimary);
                graphDefault.loadContent(lineSecondary);
            });
            it("Shows region on mouse enter", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="region_${inputPrimary.key}"]`
                            )
                            .classList.contains(styles.regionHighlight)
                    ).toBeTruthy();
                    done();
                });
            });
            it("Hides region on mouse exit", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}"]`
                                )
                                .classList.contains(styles.regionHighlight)
                        ).toBeFalsy();
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}"]`
                                )
                                .getAttribute("aria-hidden")
                        ).toBeTruthy();
                        done();
                    });
                });
            });
        });
        describe("When multi-line", () => {
            let inputPrimary = null;
            let linePrimary = null;
            let lineSecondary = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = [
                    {
                        start: 1,
                        end: 5
                    },
                    {
                        start: 10,
                        end: 15
                    }
                ];
                linePrimary = new Line(inputPrimary);
                lineSecondary = new Line(inputSecondary);
                graphDefault.loadContent(linePrimary);
                graphDefault.loadContent(lineSecondary);
            });
            it("Shows region on mouse enter", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const regionElements = document.querySelectorAll(
                        `rect[aria-describedby="region_${inputPrimary.key}"]`
                    );
                    expect(
                        regionElements[0].classList.contains(
                            styles.regionHighlight
                        )
                    ).toBeTruthy();
                    expect(
                        regionElements[1].classList.contains(
                            styles.regionHighlight
                        )
                    ).toBeTruthy();
                    done();
                });
            });
            it("Hides all the regions except current", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}"]`
                        );
                        expect(
                            regionElements[0].classList.contains(
                                styles.regionHighlight
                            )
                        ).toBeFalsy();
                        expect(
                            regionElements[1].classList.contains(
                                styles.regionHighlight
                            )
                        ).toBeFalsy();
                        done();
                    });
                });
            });
        });
    });
    describe("Check if region same for multiline with same dataset", () => {
        let inputPrimary = null;
        let linePrimary = null;
        let lineSecondary = null;
        let lineThird = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault, false, false);
            inputPrimary.regions = [
                {
                    start: 1,
                    end: 5
                }
            ];
            inputSecondary.regions = [
                {
                    start: 1,
                    end: 5
                }
            ];
            linePrimary = new Line(inputPrimary);
            lineSecondary = new Line(inputSecondary);
            graphDefault.loadContent(linePrimary);
            graphDefault.loadContent(lineSecondary);
        });
        it("Correctly renders", () => {
            const regionGroupElement = fetchElementByClass(
                lineGraphContainer,
                styles.regionGroup
            );
            const regionElement = fetchElementByClass(
                regionGroupElement,
                styles.region
            );
            expect(regionGroupElement.childNodes.length).toBe(2);
            expect(regionElement.nodeName).toBe("rect");
        });
        it("Hides region if one or more is missing", () => {
            inputTertiary.regions = null;
            lineThird = new Line(inputTertiary);
            graphDefault.loadContent(lineThird);
            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(2);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
            expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}`
            );
            expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}`
            );
        });
        it("Shows region if one or more are identical", () => {
            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(2);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("false");
            });
            expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}`
            );
            expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}`
            );
        });
        it("Hides region if one or more are not identical", () => {
            inputTertiary.regions = [
                {
                    start: 1,
                    end: 10
                }
            ];
            lineThird = new Line(inputTertiary);
            graphDefault.loadContent(lineThird);
            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(3);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
            expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}`
            );
            expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}`
            );
            expect(regionsElement[2].getAttribute("aria-describedby")).toBe(
                `region_${inputTertiary.key}`
            );
        });
    });
    describe("On legend item click", () => {
        let inputPrimary = null;
        let linePrimary = null;
        let lineSecondary = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault);
            inputPrimary.regions = [
                {
                    start: 1,
                    end: 5
                },
                {
                    start: 10,
                    end: 15
                }
            ];
            linePrimary = new Line(inputPrimary);
            graphDefault.loadContent(linePrimary);
        });
        describe("When single-line", () => {
            it("Hides region on toggle", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    const regionElement = document.querySelector(
                        `rect[aria-describedby="region_${inputPrimary.key}"]`
                    );
                    expect(regionElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    done();
                });
            });
            it("Hides regions on toggle", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    const regionElements = document.querySelectorAll(
                        `rect[aria-describedby="region_${inputPrimary.key}"]`
                    );
                    expect(regionElements[0].getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    expect(regionElements[1].getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    done();
                });
            });
            it("Shows region on re-toggle", (done) => {
                const legendItem = fetchElementByClass(
                    lineGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(
                        legendItem,
                        "click",
                        () => {
                            const regionElements = document.querySelectorAll(
                                `rect[aria-describedby="region_${inputPrimary.key}"]`
                            );
                            expect(
                                regionElements[0].getAttribute("aria-hidden")
                            ).toBe("false");
                            expect(
                                regionElements[1].getAttribute("aria-hidden")
                            ).toBe("false");
                            done();
                        },
                        200
                    );
                });
            });
        });
        describe("When multi-line", () => {
            it("Shows when data-sets shown === 1", (done) => {
                lineSecondary = new Line(inputSecondary);
                graphDefault.loadContent(lineSecondary);
                const legendItem = lineGraphContainer.querySelectorAll(
                    `.${styles.legendItem}`
                );
                triggerEvent(legendItem[1], "click", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="region_${inputPrimary.key}"]`
                            )
                            .getAttribute("aria-hidden")
                    ).toBe("false");
                    graphDefault.unloadContent(lineSecondary);
                    done();
                });
            });
        });
    });
});
