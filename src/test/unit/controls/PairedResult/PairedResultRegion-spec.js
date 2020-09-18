"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import PairedResult from "../../../../main/js/controls/PairedResult";
import {
    getXAxisWidth,
    getXAxisXPosition
} from "../../../../main/js/helpers/axis";
import constants from "../../../../main/js/helpers/constants";
import errors from "../../../../main/js/helpers/errors";
import styles from "../../../../main/js/helpers/styles";
import utils from "../../../../main/js/helpers/utils";
import {
    loadCustomJasmineMatcher,
    toNumber,
    triggerEvent
} from "../../helpers/commonHelpers";
import {
    axisDefault,
    fetchElementByClass,
    getAxes,
    getInput,
    multiRegion,
    multiRegionNotSame,
    simpleRegion,
    valuesDefault,
    multiRegionSameData,
    regionMissing
} from "./helpers";

describe("Paired Result - Region", () => {
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    let pairedResultPrimaryContent = null;
    let data = null;
    const inputSecondary = {
        key: `uid_2`,
        regions: simpleRegion,
        label: {
            high: {
                display: "Data Label 2 High"
            },
            mid: {
                display: "Data Label 2 Median"
            },
            low: {
                display: "Data Label 2 Low"
            }
        },
        values: valuesDefault
    };
    let graphDefault = null;
    let pairedResultGraphContainer;
    beforeEach(() => {
        pairedResultGraphContainer = document.createElement("div");
        pairedResultGraphContainer.id = "testPairedResult_carbon";
        pairedResultGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(pairedResultGraphContainer);
        graphDefault = new Graph(getAxes(axisDefault));
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("On load", () => {
        describe("Ideally", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
            });
            it("Creates a pair group for each data-set region", () => {
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.firstChild).not.toBeNull();
                expect(
                    regionGroupElement.firstChild.getAttribute("class")
                ).toBe(styles.regionPairGroup);
                expect(
                    regionGroupElement.firstChild.getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}`);
            });
            it("Creates a pair group for each data-set region for multi pair", () => {
                const pairedResultSecondaryContent = new PairedResult(
                    inputSecondary
                );
                graphDefault.loadContent(pairedResultSecondaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                expect(regionGroupElement.firstChild).not.toBeNull();
                expect(
                    regionGroupElement.firstChild.getAttribute("class")
                ).toBe(styles.regionPairGroup);
                expect(
                    regionGroupElement.firstChild.getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}`);
                expect(
                    regionGroupElement.childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${inputSecondary.key}`);
            });
            it("Creates region when present", () => {
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
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
                const regionPairGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionPairGroup
                );
                expect(
                    regionPairGroupElement.childNodes[0].getAttribute("class")
                ).toBe(styles.region);
                expect(
                    regionPairGroupElement.childNodes[0].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("false");
                expect(
                    regionPairGroupElement.childNodes[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_high`);

                expect(
                    regionPairGroupElement.childNodes[1].getAttribute("class")
                ).toBe(styles.region);
                expect(
                    regionPairGroupElement.childNodes[1].getAttribute(
                        "aria-hidden"
                    )
                ).toBe("false");
                expect(
                    regionPairGroupElement.childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_low`);
            });
        });
        it("Creates region only if present", () => {
            data = utils.deepClone(getInput(valuesDefault, false, false));
            data.regions = null;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionGroupElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.regionGroup
            );
            const regionElement = fetchElementByClass(
                regionGroupElement,
                styles.region
            );
            expect(regionGroupElement.childNodes.length).toBe(0);
            expect(regionElement).toBeNull();
        });
        describe("Value region", () => {
            let values;
            beforeEach(() => {
                values = utils.deepClone(valuesDefault);
                values[0].high.region = {
                    start: 140,
                    end: 220,
                    color: "#c8cacb"
                };
                values[0].low.region = {
                    start: 20,
                    end: 70
                };
            });
            it("Creates value region, when the values contain region object", () => {
                values[1].high.region = {
                    start: 140,
                    end: 220,
                    color: "#c8cacb"
                };
                values[1].low.region = {
                    start: 20,
                    end: 70
                };

                pairedResultPrimaryContent = new PairedResult(
                    getInput(values, false, false)
                );
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                const pairedResultGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionPairGroup
                );
                const regionElement = fetchElementByClass(
                    pairedResultGroupElement,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(1);
                expect(pairedResultGroupElement.childNodes.length).toBe(6);
                expect(regionElement.nodeName).toBe("path");
            });
            it("Precedence over legend level regions", () => {
                data = utils.deepClone(getInput(values, false, false));
                data.regions = multiRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                const regionElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.region
                );
                expect(regionGroupElement.childNodes.length).toBe(1);
                expect(regionElement.nodeName).toBe("path");
            });
            it("Splits value region if the colors are different", () => {
                values[1].high.region = {
                    start: 140,
                    end: 220,
                    color: "#a8a8a8"
                };
                values[1].low.region = {
                    start: 20,
                    end: 70,
                    color: "#f3f3f3"
                };

                pairedResultPrimaryContent = new PairedResult(
                    getInput(values, false, false)
                );
                graphDefault.loadContent(pairedResultPrimaryContent);
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionGroup
                );
                const pairedResultGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionPairGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(1);
                expect(pairedResultGroupElement.childNodes.length).toBe(4);
            });
        });
        describe("Creates region when there are multiple regions", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
                data.regions = multiRegion;
                pairedResultPrimaryContent = new PairedResult(data);
                graphDefault.loadContent(pairedResultPrimaryContent);
            });
            it("Correctly renders", () => {
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionPairGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(3);
                expect(regionGroupElement.childNodes[0].nodeName).toBe("rect");
                expect(regionGroupElement.childNodes[1].nodeName).toBe("rect");
                expect(regionGroupElement.childNodes[2].nodeName).toBe("rect");
                expect(
                    regionGroupElement.childNodes[0].getAttribute("class")
                ).toBe(styles.region);
                expect(
                    regionGroupElement.childNodes[1].getAttribute("class")
                ).toBe(styles.region);
                expect(
                    regionGroupElement.childNodes[2].getAttribute("class")
                ).toBe(styles.region);
            });
            it("shows multiple regions face-up by default", () => {
                const regionGroupElement = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.regionPairGroup
                );
                expect(regionGroupElement.childNodes.length).toBe(3);
                expect(
                    regionGroupElement.childNodes[0].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_high`);
                expect(
                    regionGroupElement.childNodes[1].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_high`);
                expect(
                    regionGroupElement.childNodes[2].getAttribute(
                        "aria-describedby"
                    )
                ).toBe(`region_${data.key}_low`);
                expect(
                    regionGroupElement.childNodes[0].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    regionGroupElement.childNodes[1].getAttribute("aria-hidden")
                ).toBe("false");
                expect(
                    regionGroupElement.childNodes[2].getAttribute("aria-hidden")
                ).toBe("false");
            });
        });
        it("Shows region if only one paired result shows face-up", () => {
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    high: {
                        display: "Data Label 2 High"
                    },
                    mid: {
                        display: "Data Label 2 Median"
                    },
                    low: {
                        display: "Data Label 2 Low"
                    }
                },
                regions: multiRegion,
                values: []
            };
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            const pairedResultSecondaryContent = new PairedResult(
                inputSecondary
            );
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.loadContent(pairedResultSecondaryContent);
            const regionGroupElements = pairedResultGraphContainer.querySelectorAll(
                `.${styles.regionPairGroup}`
            );

            expect(regionGroupElements.length).toBe(1);
            expect(regionGroupElements[0].childNodes.length).toBe(2); // Regions from primary

            expect(
                regionGroupElements[0].childNodes[0].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}_high`);
            expect(
                regionGroupElements[0].childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}_low`);

            expect(
                regionGroupElements[0].childNodes[0].getAttribute("aria-hidden")
            ).toBe("false");
            expect(
                regionGroupElements[0].childNodes[1].getAttribute("aria-hidden")
            ).toBe("false");
            graphDefault.unloadContent(pairedResultSecondaryContent);
        });
        describe("Validates each region", () => {
            beforeEach(() => {
                data = utils.deepClone(getInput(valuesDefault, false, false));
            });
            afterEach(() => {
                data = null;
            });
            it("Throws error when empty", () => {
                data.regions = { high: {} };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_EMPTY);
            });
            it("Throws error when both start and end are empty", () => {
                data.regions = {
                    high: [
                        {
                            start: null,
                            end: null
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_START_END_MISSING);
            });
            it("Throws error when axis info is invalid", () => {
                data.regions = {
                    high: [
                        {
                            axis: "x",
                            start: 10,
                            end: 20
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when axis info is invalid for Y2 axis", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = {
                    high: [
                        {
                            axis: "x",
                            start: 10,
                            end: 20
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when axis provided is different than data-set axis", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = {
                    high: [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 20
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when axis is not and data-set axis is Y2", () => {
                data = utils.deepClone(
                    getInput(valuesDefault, false, false, true)
                );
                data.regions = {
                    high: [
                        {
                            start: 10,
                            end: 20
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_INVALID_AXIS_PROVIDED);
            });
            it("Throws error when start value is invalid", () => {
                data.regions = {
                    high: [
                        {
                            start: "10",
                            end: 20
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(
                    errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                );
            });
            it("Throws error when end value is invalid", () => {
                data.regions = {
                    high: [
                        {
                            start: 10,
                            end: "20"
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(
                    errors.THROW_MSG_REGION_INVALID_VALUE_TYPE_PROVIDED
                );
            });
            it("Throws error when start is more than end", () => {
                data.regions = {
                    high: [
                        {
                            start: 20,
                            end: 10
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).toThrowError(errors.THROW_MSG_REGION_START_MORE_END);
            });
            it("Correctly passes validation", () => {
                data.regions = {
                    high: [
                        {
                            axis: constants.Y_AXIS,
                            start: 10,
                            end: 15
                        }
                    ]
                };
                pairedResultPrimaryContent = new PairedResult(data);
                expect(() => {
                    graphDefault.loadContent(pairedResultPrimaryContent);
                }).not.toThrow();
            });
        });
        it("Translates region correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.region
            );
            expect(regionElement.nodeName).toBe("rect");
            expect(toNumber(regionElement.getAttribute("x"))).toBe(
                getXAxisXPosition(graphDefault.config)
            );
            expect(toNumber(regionElement.getAttribute("y"))).toBe(
                toNumber(graphDefault.scale.y(220), 10) +
                    constants.PADDING.bottom
            );
        });
        it("Does not hide regions is graph has only 1 data-set", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionGroupElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.regionPairGroup
            );
            expect(regionGroupElement.childNodes.length).toBe(2);
            expect(
                regionGroupElement.childNodes[0].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}_high`);
            expect(
                regionGroupElement.childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}_low`);
            expect(
                regionGroupElement.childNodes[0].getAttribute("aria-hidden")
            ).toBe("false");
            expect(
                regionGroupElement.childNodes[1].getAttribute("aria-hidden")
            ).toBe("false");
        });
        it("Hides all the regions if region is not same for any value has more than 1 data-set", () => {
            const inputSecondary = {
                key: `uid_2`,
                label: {
                    high: {
                        display: "Data Label 2 High"
                    },
                    mid: {
                        display: "Data Label 2 Median"
                    },
                    low: {
                        display: "Data Label 2 Low"
                    }
                },
                regions: multiRegion,
                values: valuesDefault
            };
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            const pairedResultSecondaryContent = new PairedResult(
                inputSecondary
            );
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.loadContent(pairedResultSecondaryContent);
            const regionGroupElements = pairedResultGraphContainer.querySelectorAll(
                `.${styles.regionPairGroup}`
            );

            expect(regionGroupElements[0].childNodes.length).toBe(2); // Regions from primary
            expect(regionGroupElements[1].childNodes.length).toBe(3); // Regions from secondary

            expect(
                regionGroupElements[0].childNodes[0].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}_high`);
            expect(
                regionGroupElements[0].childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${data.key}_low`);
            expect(
                regionGroupElements[1].childNodes[0].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${inputSecondary.key}_high`);
            expect(
                regionGroupElements[1].childNodes[1].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${inputSecondary.key}_high`);
            expect(
                regionGroupElements[1].childNodes[2].getAttribute(
                    "aria-describedby"
                )
            ).toBe(`region_${inputSecondary.key}_low`);

            expect(
                regionGroupElements[0].childNodes[0].getAttribute("aria-hidden")
            ).toBe("true");
            expect(
                regionGroupElements[0].childNodes[1].getAttribute("aria-hidden")
            ).toBe("true");
            expect(
                regionGroupElements[1].childNodes[0].getAttribute("aria-hidden")
            ).toBe("true");
            expect(
                regionGroupElements[1].childNodes[1].getAttribute("aria-hidden")
            ).toBe("true");
            expect(
                regionGroupElements[1].childNodes[2].getAttribute("aria-hidden")
            ).toBe("true");
            graphDefault.unloadContent(pairedResultSecondaryContent);
        });
        it("Sets the width correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.region
            );
            expect(toNumber(regionElement.getAttribute("width"))).toBe(
                getXAxisWidth(graphDefault.config)
            );
        });
        it("Sets the height correctly", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("height")).toBeGreaterThan(
                constants.PADDING.top
            );
        });
        it("Creates a goal pairedResult when start and end are same", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = {
                high: [
                    {
                        start: 15,
                        end: 15
                    }
                ]
            };
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.region
            );
            expect(+regionElement.getAttribute("height")).toBe(
                constants.DEFAULT_REGION_LINE_STROKE_WIDTH
            );
        });
        it("Creates region correctly when start is not provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = {
                high: [
                    {
                        end: 15
                    }
                ]
            };
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
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
            data.regions = {
                high: [
                    {
                        start: 10
                    }
                ]
            };
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
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
            data.regions = {
                high: [
                    {
                        axis: constants.Y2_AXIS,
                        start: 10,
                        end: 15
                    }
                ]
            };
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.region
            );
            expect(regionElement.nodeName).toBe("rect");
            expect(+regionElement.getAttribute("x")).toBe(
                getXAxisXPosition(graphDefault.config)
            );
            expect(toNumber(regionElement.getAttribute("y"), 10)).toBeCloserTo(
                toNumber(graphDefault.scale.y2(15), 10) +
                    constants.PADDING.bottom
            );
        });
        it("Creates region with correct, color if provided", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = {
                high: [
                    {
                        axis: constants.Y_AXIS,
                        start: 10,
                        end: 15,
                        color: "#f44444"
                    }
                ]
            };
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            const regionElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.region
            );
            expect(regionElement.getAttribute("style")).toBe("fill: #f44444;");
        });
    });
    describe("On unload", () => {
        it("Removes any region", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.unloadContent(pairedResultPrimaryContent);
            const regionGroupElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.regionGroup
            );
            expect(regionGroupElement.childNodes.length).toBe(0);
        });
        it("Removes all regions", () => {
            data = utils.deepClone(getInput(valuesDefault));
            data.regions = multiRegion;
            pairedResultPrimaryContent = new PairedResult(data);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.unloadContent(pairedResultPrimaryContent);
            const regionGroupElement = fetchElementByClass(
                pairedResultGraphContainer,
                styles.regionGroup
            );
            expect(regionGroupElement.childNodes.length).toBe(0);
        });
    });
    describe("On legend item hover", () => {
        describe("When single-paired result", () => {
            let inputPrimary = null;
            let pairedResultPrimaryContent = null;
            let pairedResultSecondaryContent = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault);
                inputPrimary.regions = simpleRegion;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                pairedResultSecondaryContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.loadContent(pairedResultSecondaryContent);
            });
            it("Shows region on mouse enter", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                            )
                            .classList.contains(styles.regionHighlight)
                    ).toBeTruthy();
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                            )
                            .classList.contains(styles.regionBlur)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                            )
                            .classList.contains(styles.regionHighlight)
                    ).toBeFalsy();
                    expect(
                        document
                            .querySelector(
                                `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                            )
                            .classList.contains(styles.regionBlur)
                    ).toBeTruthy();
                    done();
                });
            });
            it("Hides region on mouse exit", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                                )
                                .classList.contains(styles.regionHighlight)
                        ).toBeFalsy();
                        expect(
                            document
                                .querySelector(
                                    `rect[aria-describedby="region_${inputPrimary.key}_low"]`
                                )
                                .classList.contains(styles.regionBlur)
                        ).toBeFalsy();
                        done();
                    });
                });
            });
        });
        describe("When multi-paired result", () => {
            let inputPrimary = null;
            let pairedResultPrimaryContent = null;
            let pairedResultSecondaryContent = null;
            beforeEach(() => {
                inputPrimary = getInput(valuesDefault, false, false);
                inputPrimary.regions = multiRegion;
                pairedResultPrimaryContent = new PairedResult(inputPrimary);
                pairedResultSecondaryContent = new PairedResult(inputSecondary);
                graphDefault.loadContent(pairedResultPrimaryContent);
                graphDefault.loadContent(pairedResultSecondaryContent);
            });
            it("Shows region on mouse enter", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    const regionElements = document.querySelectorAll(
                        `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "mouseenter", () => {
                    triggerEvent(legendItem, "mouseleave", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
    describe("When multi-paired result with multi-regions with same data", () => {
        let inputPrimary = null;
        let inputThird = null;
        let pairedResultPrimaryContent = null;
        let pairedResultSecondaryContent = null;
        let pairedResultThirdContent = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault, false, false);
            inputPrimary.regions = multiRegionSameData;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            inputSecondary.regions = multiRegionSameData;
            pairedResultSecondaryContent = new PairedResult(inputSecondary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.loadContent(pairedResultSecondaryContent);
        });
        it("Show all region face-up with same data always", () => {
            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(6);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("false");
            });
            expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_high`
            );
            expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_mid`
            );
            expect(regionsElement[2].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_low`
            );
            expect(regionsElement[3].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}_high`
            );
            expect(regionsElement[4].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}_mid`
            );
            expect(regionsElement[5].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}_low`
            );
        });
        it("Hide region if region is missing for any value(high, mid, low) even if regions are same", () => {
            inputThird = {
                key: `uid_3`,
                label: {
                    high: {
                        display: "Data Label 3 High"
                    },
                    mid: {
                        display: "Data Label 3 Median"
                    },
                    low: {
                        display: "Data Label 3 Low"
                    }
                },
                values: valuesDefault
            };
            inputThird.regions = regionMissing;
            pairedResultThirdContent = new PairedResult(inputThird);
            graphDefault.loadContent(pairedResultThirdContent);
            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(8);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
        });
    });
    describe("When multi-paired result with multi-regions not same", () => {
        let inputPrimary = null;
        let pairedResultPrimaryContent = null;
        let pairedResultSecondaryContent = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault, false, false);
            inputPrimary.regions = multiRegionNotSame;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            inputSecondary.regions = multiRegionSameData;
            pairedResultSecondaryContent = new PairedResult(inputSecondary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.loadContent(pairedResultSecondaryContent);
        });
        it("Not show region face-up", () => {
            const regionsElement = document.querySelectorAll(
                `.${styles.region}`
            );
            expect(regionsElement.length).toBe(7);
            regionsElement.forEach((element) => {
                expect(element.getAttribute("aria-hidden")).toBe("true");
            });
            expect(regionsElement[0].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_high`
            );
            expect(regionsElement[1].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_high`
            );
            expect(regionsElement[2].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_mid`
            );
            expect(regionsElement[3].getAttribute("aria-describedby")).toBe(
                `region_${inputPrimary.key}_low`
            );
            expect(regionsElement[4].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}_high`
            );
            expect(regionsElement[5].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}_mid`
            );
            expect(regionsElement[6].getAttribute("aria-describedby")).toBe(
                `region_${inputSecondary.key}_low`
            );
        });
    });
    describe("On legend item click", () => {
        let inputPrimary = null;
        let pairedResultPrimaryContent = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault);
            inputPrimary.regions = multiRegion;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            graphDefault.loadContent(pairedResultPrimaryContent);
        });
        describe("When single-paired result", () => {
            it("Hides region on toggle", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    const regionElement = document.querySelector(
                        `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                    );
                    expect(regionElement.getAttribute("aria-hidden")).toBe(
                        "true"
                    );
                    done();
                });
            });
            it("Hides regions on toggle", (done) => {
                const legendItem = fetchElementByClass(
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    const regionElements = document.querySelectorAll(
                        `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
                    pairedResultGraphContainer,
                    styles.legendItem
                );
                triggerEvent(legendItem, "click", () => {
                    triggerEvent(legendItem, "click", () => {
                        const regionElements = document.querySelectorAll(
                            `rect[aria-describedby="region_${inputPrimary.key}_high"]`
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
    describe("Show regions when only one paired result is displayed", () => {
        let inputPrimary = null;
        let pairedResultPrimaryContent = null;
        let pairedResultSecondaryContent = null;
        beforeEach(() => {
            inputPrimary = getInput(valuesDefault, false, false);
            inputPrimary.regions = simpleRegion;
            inputSecondary.regions = simpleRegion;
            pairedResultPrimaryContent = new PairedResult(inputPrimary);
            pairedResultSecondaryContent = new PairedResult(inputSecondary);
            graphDefault.loadContent(pairedResultPrimaryContent);
            graphDefault.loadContent(pairedResultSecondaryContent);
        });
        describe("Regions shown when only one paired result is displayed", () => {
            it("All regions initially hidden", () => {
                const regionsElement = document.querySelectorAll(
                    `.${styles.region}`
                );

                regionsElement.forEach((element) => {
                    expect(element.getAttribute("aria-hidden")).toBe("true");
                });
            });

            it("Primary regions are displayed when it is the only pair result content displayed", (done) => {
                const legendItemHigh = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_high"]`
                );

                const legendItemMid = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_mid"]`
                );

                const legendItemLow = pairedResultGraphContainer.querySelector(
                    `.${styles.legendItem}[aria-describedby="${inputSecondary.key}_low"]`
                );

                triggerEvent(legendItemHigh, "click", () => {
                    const regionsElement = document.querySelectorAll(
                        `.${styles.region}`
                    );

                    regionsElement.forEach((element) => {
                        expect(element.getAttribute("aria-hidden")).toBe(
                            "true"
                        );
                    });

                    triggerEvent(legendItemMid, "click", () => {
                        const regionsElement = document.querySelectorAll(
                            `.${styles.region}`
                        );

                        regionsElement.forEach((element) => {
                            expect(element.getAttribute("aria-hidden")).toBe(
                                "true"
                            );
                        });

                        triggerEvent(legendItemLow, "click", () => {
                            const regionElement = document.querySelectorAll(
                                `rect[aria-describedby="region_${inputPrimary.key}_high"]`
                            );

                            regionElement.forEach((element) => {
                                expect(
                                    element.getAttribute("aria-hidden")
                                ).toBe("false");
                            });
                            done();
                        });
                    });
                });
            });
        });
    });
});
