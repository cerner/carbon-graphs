import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { loadDatelinePopup, loadPopup } from "../popup";
import { createPanningControls } from "../panHelpers";

const tickValues = [
    new Date(2016, 0, 1, 1, 0).toISOString(),
    new Date(2016, 6, 1, 1, 0).toISOString(),
    new Date(2017, 0, 1, 1, 0).toISOString(),
    new Date(2017, 6, 1, 1, 0).toISOString(),
    new Date(2018, 0, 1, 1, 0).toISOString()
];
const regions = {
    high: [
        {
            axis: "y",
            start: 140,
            end: 220,
            color: "#c8cacb"
        },
        {
            axis: "y",
            start: 180,
            end: 230,
            color: "#d6d8d9"
        }
    ],
    low: [
        {
            axis: "y",
            start: 20,
            end: 70
        }
    ]
};
export const multiRegion = {
    high: [
        {
            axis: "y",
            start: 120,
            end: 170,
            color: "#c8cacb"
        }
    ],
    low: [
        {
            axis: "y",
            start: 20,
            end: 100
        }
    ]
};
export const multiRegionAlt = {
    high: [
        {
            axis: "y2",
            start: 210,
            end: 280,
            color: "#c8cacb"
        }
    ],
    low: [
        {
            axis: "y2",
            start: 175,
            end: 200
        }
    ]
};
const graphData = [
    {
        key: "uid_1",
        label: {
            high: {
                display: "High"
            },
            mid: {
                display: "Median"
            },
            low: {
                display: "Low"
            }
        },
        onClick: loadPopup,
        shape: {
            high: Carbon.helpers.SHAPES.DARK.TEAR_ALT,
            mid: Carbon.helpers.SHAPES.DARK.RHOMBUS,
            low: Carbon.helpers.SHAPES.DARK.TEAR_DROP
        },
        color: {
            high: Carbon.helpers.COLORS.BLACK,
            mid: Carbon.helpers.COLORS.BLUE,
            low: Carbon.helpers.COLORS.BLACK
        },
        values: [
            {
                high: {
                    x: "2016-01-01T00:30:00.000Z",
                    y: 150
                },
                mid: {
                    x: "2016-01-01T00:30:00.000Z",
                    y: 40
                },
                low: {
                    x: "2016-01-01T00:30:00.000Z",
                    y: 10
                }
            },
            {
                high: {
                    x: "2016-01-01T05:30:00.000Z",
                    y: 110
                },
                mid: {
                    x: "2016-01-01T05:30:00.000Z",
                    y: 70
                },
                low: {
                    x: "2016-01-01T05:30:00.000Z",
                    y: 30
                }
            }
        ]
    },
    {
        key: "uid_2",
        label: {
            high: {
                display: "High"
            },
            mid: {
                display: "Median"
            },
            low: {
                display: "Low"
            }
        },
        shape: {
            high: Carbon.helpers.SHAPES.DARK.TRIANGLE,
            mid: Carbon.helpers.SHAPES.DARK.SQUARE,
            low: Carbon.helpers.SHAPES.DARK.TRIANGLE_DOWN
        },
        color: {
            high: Carbon.helpers.COLORS.BLACK,
            mid: Carbon.helpers.COLORS.ORANGE,
            low: Carbon.helpers.COLORS.BLACK
        },
        onClick: loadPopup,
        yAxis: "y2",
        values: [
            {
                high: {
                    x: "2015-12-31T21:30:00.000Z",
                    y: 180
                },
                mid: {
                    x: "2015-12-31T21:30:00.000Z",
                    y: 60
                },
                low: {
                    x: "2015-12-31T21:30:00.000Z",
                    y: 20
                }
            },
            {
                high: {
                    x: "2015-12-31T23:30:00.000Z",
                    y: 90
                },
                mid: {
                    x: "2015-12-31T23:30:00.000Z",
                    y: 40
                },
                low: {
                    x: "2015-12-31T23:30:00.000Z",
                    y: 10
                }
            }
        ]
    },
    {
        key: "uid_1",
        values: [
            {
                high: {
                    x: "2015-12-31T20:30:00.000Z",
                    y: 160
                },
                mid: {
                    x: "2015-12-31T20:30:00.000Z",
                    y: 40
                },
                low: {
                    x: "2015-12-31T20:30:00.000Z",
                    y: 10
                }
            },
            {
                high: {
                    x: "2015-12-31T22:30:00.000Z",
                    y: 100
                },
                mid: {
                    x: "2015-12-31T22:30:00.000Z",
                    y: 30
                },
                low: {
                    x: "2015-12-31T22:30:00.000Z",
                    y: 10
                }
            },
            {
                high: {
                    x: "2015-12-31T23:30:00.000Z",
                    y: 100
                },
                mid: {
                    x: "2015-12-31T23:30:00.000Z",
                    y: 70
                },
                low: {
                    x: "2015-12-31T23:30:00.000Z",
                    y: 30
                }
            }
        ]
    }
];
export const renderPairedResult = (id) => {
    const pairedDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_DEFAULT")
    );
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultTimeseries = (id) => {
    const pairedTime = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    pairedTime.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedTime;
};
export const renderPairedResultTimeseriesDateline = (id) => {
    const pairedTimeDateline = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    pairedTimeDateline.dateline = [
        {
            showDatelineIndicator: true,
            label: {
                display: "Action Date"
            },
            color: "#C97318",
            shape: Carbon.helpers.SHAPES.SQUARE,
            onClick: loadDatelinePopup,
            value: new Date(2017, 10, 1).toISOString()
        }
    ];
    pairedTimeDateline.clickPassThrough = {
        dateline: false
    };
    const pairedTime = Carbon.api.graph(pairedTimeDateline);

    pairedTime.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedTime;
};

export const renderPairedResultTimeseriesEventline = (id) => {
    const pairedTimeDateline = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    pairedTimeDateline.eventline = [
        {
            color: Carbon.helpers.COLORS.GREY,
            style: {
                strokeDashArray: "4,4"
            },
            value: new Date(2016, 8, 1, 8).toISOString()
        },
        {
            color: Carbon.helpers.COLORS.BLACK,
            style: {
                strokeDashArray: "2,2"
            },
            value: new Date(2017, 5, 1, 12).toISOString()
        }
    ];
    pairedTimeDateline.clickPassThrough = {
        dateline: false
    };
    const pairedTime = Carbon.api.graph(pairedTimeDateline);

    pairedTime.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedTime;
};

export const renderPairedResultY2Axis = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.y2.show = true;
    const pairedTime = Carbon.api.graph(axisData);
    pairedTime.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    pairedTime.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[1]
        )
    );
    return pairedTime;
};
export const renderPairedResultXHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.axis.x.show = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultYHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.axis.y.show = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultXStaticTicks = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%a %b %e %X %Y"
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedDefault;
};
export const renderPairedResultXAxisFormatted = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%b, %X %Y"
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedDefault;
};
export const renderPairedResultXAlternateLocale = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.locale = Carbon.helpers.LOCALE.fr_FR;
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%A %e %B %Y"
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedDefault;
};
export const renderPairedResultLabelHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showLabel = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultLegendHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showLegend = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultLegendItemDisabled = (id) => {
    const pairedDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_DEFAULT")
    );
    const data = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0]
    );
    data.label.high.isDisabled = true;
    data.label.low.isDisabled = true;
    pairedDefault.loadContent(Carbon.api.pairedResult(data));
    return pairedDefault;
};
export const renderPairedResultGridHHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showHGrid = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultGridVHidden = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.showVGrid = false;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultRegionSimple = (id) => {
    const pairedDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_DEFAULT")
    );
    const data = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0]
    );
    data.regions = {
        high: [regions.high[0]],
        low: regions.low
    };
    pairedDefault.loadContent(Carbon.api.pairedResult(data));
    return pairedDefault;
};
export const renderPairedResultValueRegion = (id) => {
    const pairedDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_DEFAULT")
    );
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[2])
    );
    return pairedDefault;
};
export const renderMultiPairedResultRegion = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.y2.show = true;
    const pairedTime = Carbon.api.graph(axisData);
    const data = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
    );
    const dataAlt = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[1]
    );
    data.regions = multiRegion;
    dataAlt.regions = multiRegionAlt;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    pairedTime.loadContent(Carbon.api.pairedResult(dataAlt));
    return pairedTime;
};
export const renderPairedResultDateTimeBuckets = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.ticks = {
        values: tickValues,
        format: "%b %Y",
        lowerStepTickValues: [
            new Date(2016, 9).toISOString(),
            new Date(2017, 3).toISOString(),
            new Date(2017, 9).toISOString()
        ],
        midpointTickValues: [
            new Date(2016, 6).toISOString(),
            new Date(2017, 0).toISOString(),
            new Date(2017, 6).toISOString(),
            new Date(2018, 0).toISOString()
        ],
        upperStepTickValues: [
            new Date(2016, 3).toISOString(),
            new Date(2018, 3).toISOString()
        ]
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "PAIRED_TIMESERIES").data[0]
        )
    );
    return pairedDefault;
};
export const renderPairedResultXOrientationTop = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.axis.x.orientation = Carbon.helpers.AXES_ORIENTATION.X.TOP;
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
export const renderPairedResultWithPanning = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.pan = {
        enabled: true
    };
    axisData.axis.x.ticks = {};

    const createGraph = () => {
        graph.reflow();
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.pairedResult(graphData[0]));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};
export const renderPairedResultY2AxisWithPanning = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.pan = {
        enabled: true
    };
    axisData.axis.x.ticks = {};
    axisData.axis.y2.show = true;

    const createGraph = () => {
        graph.reflow();
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.pairedResult(graphData[0]));
    graph.loadContent(Carbon.api.pairedResult(graphData[1]));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderPairedResultPanningWithDynamicData = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.pan = {
        enabled: true
    };
    axisData.axis.x.ticks = {};
    axisData.axis.y.rangeRounding = false;

    const createGraph = () => {
        graph.reflow(graphData[2]);
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.pairedResult(graphData[0]));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderPairedResultPanningWithDynamicEventline = (id) => {
    const axisData = utils.deepClone(
        getDemoData(`#${id}`, "PAIRED_TIMESERIES")
    );
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.pan = {
        enabled: true
    };
    axisData.axis.x.ticks = {};
    axisData.axis.y.rangeRounding = false;
    axisData.eventline = [
        {
            color: Carbon.helpers.COLORS.GREY,
            style: {
                strokeDashArray: "4,4"
            },
            value: new Date(2016, 0, 1, 8).toISOString()
        }
    ];

    const createGraph = () => {
        graphData[0].eventline = [
            {
                color: Carbon.helpers.COLORS.BLACK,
                style: {
                    strokeDashArray: "2,2"
                },
                value: new Date(2016, 0, 1, 12).toISOString()
            }
        ];
        graph.reflow(graphData[0]);
    };

    const graph = Carbon.api.graph(axisData);
    graph.loadContent(Carbon.api.pairedResult(graphData[0]));
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderPairedResultWithLegendOptions = (id) => {
    const pairedDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "PAIRED_DEFAULT")
    );
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[1])
    );
    return pairedDefault;
};
export const renderPairedResultGraphAndLegendPaddingReduced = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "PAIRED_DEFAULT"));
    axisData.removeContainerPadding = true;
    axisData.legendPadding = {
        left: 2.5,
        right: 2.5,
        top: 2.5,
        bottom: 2.5
    };
    const pairedDefault = Carbon.api.graph(axisData);
    pairedDefault.loadContent(
        Carbon.api.pairedResult(getDemoData(`#${id}`, "PAIRED_DEFAULT").data[0])
    );
    return pairedDefault;
};
