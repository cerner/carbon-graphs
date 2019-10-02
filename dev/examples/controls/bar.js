/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { loadDatelinePopup, loadTextLabelPopup, loadBarPopup } from "../popup";
import { createPanningControls } from "./panHelpers";

const tickValues = [
    new Date(2018, 0, 1).toISOString(),
    new Date(2018, 0, 2).toISOString(),
    new Date(2018, 0, 3).toISOString(),
    new Date(2018, 0, 4).toISOString(),
    new Date(2018, 0, 5).toISOString(),
    new Date(2018, 0, 6).toISOString(),
    new Date(2018, 0, 7).toISOString()
];
const numberedTicks = {
    values: [1, 2, 3, 4, 5, 6, 7],
    format: ".0f"
};
const regions = [
    {
        axis: "y",
        x: 1,
        start: 7,
        end: 7
    },
    {
        axis: "y",
        x: 2,
        start: 13,
        end: 13
    },
    {
        axis: "y",
        x: 3,
        start: 17,
        end: 17
    },
    {
        axis: "y",
        x: 4,
        start: 4,
        end: 4
    }
];
const regions2 = [
    {
        axis: "y",
        x: 1,
        start: 10,
        end: 10
    },
    {
        axis: "y",
        x: 2,
        start: 40,
        end: 40
    },
    {
        axis: "y",
        x: 3,
        start: 55,
        end: 55
    },
    {
        axis: "y",
        x: 4,
        start: 30,
        end: 30
    }
];
const axisInfoRow = [
    {
        axis: "x",
        x: 1,
        value: {
            onClick: loadTextLabelPopup,
            characterCount: 4,
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
                display: "1234567",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: 2,
        value: {
            onClick: loadTextLabelPopup,
            color: Carbon.helpers.COLORS.BLACK,
            shape: {
                path: {
                    d: "M24,0l24,24L24,48L0,24L24,0z",
                    fill: Carbon.helpers.COLORS.PURPLE
                },
                options: {
                    x: -6,
                    y: -6,
                    scale: 0.25
                }
            },
            label: {
                display: "65",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: 3,
        value: {
            onClick: loadTextLabelPopup,
            color: Carbon.helpers.COLORS.GREEN,
            shape: {
                path: {
                    d: "M24,0l24,24L24,48L0,24L24,0z"
                },
                options: {
                    x: -6,
                    y: -6,
                    scale: 0.25
                }
            },
            label: {
                display: "42",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: 4,
        value: {
            onClick: loadTextLabelPopup,
            color: Carbon.helpers.COLORS.BLACK,
            shape: {},
            label: {
                display: "23",
                secondaryDisplay: ""
            }
        }
    },
    {
        axis: "x",
        x: 5,
        value: {
            onClick: loadTextLabelPopup,
            color: Carbon.helpers.COLORS.BLACK,
            shape: {},
            label: {
                display: "",
                secondaryDisplay: "ICU"
            }
        }
    },
    {
        axis: "x",
        x: 6,
        value: {
            onClick: loadTextLabelPopup,
            color: Carbon.helpers.COLORS.BLACK,
            shape: {},
            label: {
                display: "25",
                secondaryDisplay: "ICU"
            }
        }
    }
];

export const renderBarDefault = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    const barSimple = Carbon.api.graph(axisData);
    barSimple.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    return barSimple;
};
export const renderBarTimeSeries = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e"
    };
    axisData.showVGrid = false;

    const barTime = Carbon.api.graph(axisData);
    barTime.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_TIMESERIES").data[0])
    );
    return barTime;
};
export const renderBarTimeSeriesWithDateline = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e"
    };
    (axisData.dateline = [
        {
            showDatelineIndicator: true,
            label: {
                display: "Action Date"
            },
            color: "#FFDF00",
            shape: Carbon.helpers.SHAPES.SQUARE,
            onClick: loadDatelinePopup,
            value: new Date(2017, 12, 2).toISOString()
        }
    ]),
        (axisData.clickPassThrough = {
            dateline: false
        }),
        (axisData.showVGrid = false);

    const barTimeDateline = Carbon.api.graph(axisData);
    barTimeDateline.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_TIMESERIES").data[0])
    );
    return barTimeDateline;
};
export const renderBarGroup = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.showVGrid = false;

    const barGroup = Carbon.api.graph(axisData);
    barGroup.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[1])
    );
    barGroup.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    const content2 = Carbon.api.bar(
        getDemoData(`#${id}`, "BAR_DEFAULT").data[2]
    );
    barGroup.loadContent(content2);
    return barGroup;
};
export const renderBarStacked = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.showVGrid = false;

    const barStacked = Carbon.api.graph(axisData);
    barStacked.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    barStacked.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[3])
    );
    barStacked.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[4])
    );
    return barStacked;
};
export const renderBarNegative = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.showVGrid = false;
    axisData.axis.y.lowerLimit = -15;
    axisData.axis.y.upperLimit = 0;
    const barNegative = Carbon.api.graph(axisData);
    barNegative.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[5])
    );
    return barNegative;
};
export const renderBarDefaultWithGoal = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.showVGrid = false;

    const barSimple = Carbon.api.graph(axisData);
    const data = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[0]);
    data.regions = regions;
    barSimple.loadContent(Carbon.api.bar(data));
    return barSimple;
};
export const renderBarGroupWithGoal = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.showVGrid = false;

    const barGroup = Carbon.api.graph(axisData);
    barGroup.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[1]);
    data.regions = regions;
    barGroup.loadContent(Carbon.api.bar(data));
    const data2 = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[2]);
    data2.regions = regions;
    barGroup.loadContent(Carbon.api.bar(data2));
    return barGroup;
};
export const renderBarStackedWithGoal = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.showVGrid = false;
    const barStacked = Carbon.api.graph(axisData);

    const data2 = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[0]);
    data2.regions = regions2;
    barStacked.loadContent(Carbon.api.bar(data2));
    const data = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[3]);
    data.regions = regions2;
    barStacked.loadContent(Carbon.api.bar(data));
    const data3 = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[4]);
    data3.regions = regions2;
    barStacked.loadContent(Carbon.api.bar(data3));
    return barStacked;
};
export const renderBarTimeSeriesXOrientationTop = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_TIMESERIES"));
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e"
    };
    axisData.showVGrid = false;
    axisData.axis.x.orientation = Carbon.helpers.AXES_ORIENTATION.X.TOP;

    const barTime = Carbon.api.graph(axisData);
    barTime.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_TIMESERIES").data[0])
    );
    return barTime;
};
export const renderSimpleBarAxisInfoTextLabels = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    const barSimpleAxisInfoRow = Carbon.api.graph(axisData);
    const data = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[7]);
    data.axisInfoRow = axisInfoRow;
    barSimpleAxisInfoRow.loadContent(Carbon.api.bar(data));
    return barSimpleAxisInfoRow;
};
export const renderStackedBarAxisInfoTextLabels = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = numberedTicks;
    axisData.axis.x.orientation = Carbon.helpers.AXES_ORIENTATION.X.TOP;
    const barStackedAxisInfoRow = Carbon.api.graph(axisData);
    const data = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[0]);
    data.label.isDisabled = true;
    data.axisInfoRow = axisInfoRow;
    barStackedAxisInfoRow.loadContent(Carbon.api.bar(data));
    const data2 = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[3]);
    data2.label.isDisabled = true;
    barStackedAxisInfoRow.loadContent(Carbon.api.bar(data2));
    const data3 = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT").data[4]);
    data3.label.isDisabled = true;
    barStackedAxisInfoRow.loadContent(Carbon.api.bar(data3));
    return barStackedAxisInfoRow;
};
export const renderBarWithPanning = (id) => {
    let graph;
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_TIMESERIES"));
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.pan = {
        enabled: true
    };
    axisData.axis.x.ticks = {
        values: [
            new Date(2016, 0, 1, 3).toISOString(),
            new Date(2016, 0, 1, 6).toISOString(),
            new Date(2016, 0, 1, 9).toISOString(),
            new Date(2016, 0, 1, 12).toISOString(),
            new Date(2016, 0, 1, 15).toISOString()
        ],
        format: "%H"
    };
    const graphData = {
        key: "uid_bar_t1",
        label: {
            display: "Data Label"
        },
        color: Carbon.helpers.COLORS.BLUE,
        onClick: loadBarPopup,
        values: [
            {
                x: new Date(2016, 0, 1, 3).toISOString(),
                y: 15
            },
            {
                x: new Date(2016, 0, 1, 6).toISOString(),
                y: 19
            },
            {
                x: new Date(2016, 0, 1, 9).toISOString(),
                y: 10
            },
            {
                x: new Date(2016, 0, 1, 12).toISOString(),
                y: 13
            },
            {
                x: new Date(2016, 0, 1, 15).toISOString(),
                y: 15
            }
        ]
    };
    const createGraph = (axis, values) => {
        if (graph) {
            graph.destroy();
        }
        graph = Carbon.api.graph(axis);
        graph.loadContent(Carbon.api.bar(values));
        return graph;
    };
    graph = createGraph(axisData, graphData);
    createPanningControls(id, {
        axisData,
        graphData,
        creationHandler: createGraph
    });
    return graph;
};
