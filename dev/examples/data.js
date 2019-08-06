"use strict";
import Carbon from "../../src/main/js/carbon";
import {
    loadBarPopup,
    loadDatelinePopup,
    loadPiePopup,
    loadPopup,
    loadTimelinePopup
} from "./popup";

const daysToMilliseconds = (d) => 24 * 60 * 60 * 1000 * d;
const bobRossIpsum =
    "Just use the old one inch brush. It's so important to do something every day that will make you happy. " +
    "I sincerely wish for you every possible joy life could bring. Water's like me. It's laaazy ... Boy, it " +
    "always looks for the easiest way to do things\n\nWe're trying to teach you a technique here and how to use it. " +
    "The least little bit can do so much. There we go.\n\nNo worries. No cares. Just float and wait for the wind to blow you around. " +
    "These trees are so much fun. I get started on them and I have a hard time stopping. We'll make some happy little bushes here. " +
    "Absolutely no pressure. You are just a whisper floating across a mountain. There are no limits in this world. " +
    "A thin paint will stick to a thick paint.\n";

const DATA = [
    {
        LINE_DEFAULT: (id) => ({
            bindTo: id,
            bindLegendTo: null,
            axis: {
                x: {
                    show: true,
                    label: "Data",
                    lowerLimit: 80,
                    upperLimit: 280,
                    ticks: {
                        show: true, // TODO Future implementation
                        count: 10, // TODO Future implementation
                        format: "",
                        values: []
                    }
                },
                y: {
                    show: true,
                    label: "Line Set A",
                    lowerLimit: 0,
                    upperLimit: 20
                },
                y2: {
                    show: false,
                    label: "Line Set B",
                    lowerLimit: 0,
                    upperLimit: 250
                }
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Data Label 1"
                    },
                    color: Carbon.helpers.COLORS.BLACK,
                    onClick: loadPopup,
                    values: new Array(20).fill("").map((_, i) => ({
                        y: Math.sin(i) * Math.PI,
                        x: 85 + i * 10
                    }))
                },
                {
                    key: "uid_2",
                    label: {
                        display: "Data Label 2"
                    },
                    shape: Carbon.helpers.SHAPES.TRIANGLE,
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPopup,
                    values: new Array(18).fill("").map((_, i) => ({
                        y: Math.sin(i) * Math.PI * 2,
                        x: 85 + i * 10
                    }))
                },
                {
                    key: "uid_3",
                    label: {
                        display: "Data Label 3"
                    },
                    shape: Carbon.helpers.SHAPES.X,
                    color: Carbon.helpers.COLORS.GREEN,
                    onClick: loadPopup,
                    values: new Array(12).fill("").map((_, i) => ({
                        y: Math.sin(i) * Math.PI * 3,
                        x: 85 + i * 10
                    }))
                },
                {
                    key: "uid_4",
                    label: {
                        display: "Data Label 4"
                    },
                    shape: Carbon.helpers.SHAPES.CROSS,
                    color: Carbon.helpers.COLORS.LIGHT_PURPLE,
                    onClick: loadPopup,
                    values: new Array(15).fill("").map((_, i) => ({
                        y: Math.sin(i) * Math.PI * 4,
                        x: 85 + i * 10
                    }))
                },
                {
                    key: "uid_5",
                    label: {
                        display: "Data Label 5"
                    },
                    shape: Carbon.helpers.SHAPES.SQUARE,
                    color: Carbon.helpers.COLORS.ORANGE,
                    onClick: loadPopup,
                    values: new Array(20).fill("").map((_, i) => ({
                        y: Math.cos(i) * Math.PI * 5,
                        x: 85 + i * 10
                    }))
                },
                {
                    key: "uid_6",
                    label: {
                        display: "Data Label 6"
                    },
                    shape: Carbon.helpers.SHAPES.CIRCLE,
                    color: Carbon.helpers.COLORS.LIGHT_BLUE,
                    onClick: loadPopup,
                    values: new Array(14).fill("").map((_, i) => ({
                        y: Math.cos(i) * Math.PI * 6,
                        x: 85 + i * 10
                    }))
                },
                {
                    key: "uid_7",
                    label: {
                        display: "Data Label 7"
                    },
                    shape: Carbon.helpers.SHAPES.TRIANGLE_DOWN,
                    color: Carbon.helpers.COLORS.GREY,
                    onClick: loadPopup,
                    values: new Array(18).fill("").map((_, i) => ({
                        y: Math.cos(i) * Math.PI * 7,
                        x: 85 + i * 10
                    }))
                }
            ],
            showLabel: true,
            showLegend: true,
            showShapes: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        LINE_TIMESERIES: (id) => ({
            bindTo: id,
            axis: {
                x: {
                    type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
                    label: "Datetime",
                    lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
                    upperLimit: new Date(2016, 0, 1, 23, 59).toISOString()
                },
                y: {
                    label: "Line Set A",
                    lowerLimit: 10,
                    upperLimit: 30
                },
                y2: {
                    show: false,
                    label: "Line Set B",
                    lowerLimit: 0,
                    upperLimit: 250
                }
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Data Label 1"
                    },
                    shape: Carbon.helpers.SHAPES.CIRCLE,
                    onClick: loadPopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 1, 5).toISOString(),
                            y: 5,
                            isCritical: false
                        },
                        {
                            x: new Date(2016, 0, 1, 2, 15).toISOString(),
                            y: 11
                        },
                        {
                            x: new Date(2016, 0, 1, 3, 15).toISOString(),
                            y: 12
                        },
                        {
                            x: new Date(2016, 0, 1, 4, 15).toISOString(),
                            y: 16
                        },
                        {
                            x: new Date(2016, 0, 1, 5, 15).toISOString(),
                            y: 17
                        },
                        {
                            x: new Date(2016, 0, 1, 6, 15).toISOString(),
                            y: 9
                        },
                        {
                            x: new Date(2016, 0, 1, 7, 0).toISOString(),
                            y: 11
                        },
                        {
                            x: new Date(2016, 0, 1, 8, 15).toISOString(),
                            y: 12
                        },
                        {
                            x: new Date(2016, 0, 1, 9, 45).toISOString(),
                            y: 16
                        },
                        {
                            x: new Date(2016, 0, 1, 12, 15).toISOString(),
                            y: 17
                        },
                        {
                            x: new Date(2016, 0, 1, 13, 15).toISOString(),
                            y: 28
                        },
                        {
                            x: new Date(2016, 0, 1, 14, 15).toISOString(),
                            y: 12
                        },
                        {
                            x: new Date(2016, 0, 1, 19, 45).toISOString(),
                            y: 13
                        },
                        {
                            x: new Date(2016, 0, 1, 21, 15).toISOString(),
                            y: 14
                        }
                    ],
                    yAxis: "y"
                },
                {
                    key: "uid_2",
                    label: {
                        display: "Data Label 2"
                    },
                    shape: Carbon.helpers.SHAPES.RHOMBUS,
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 1, 5).toISOString(),
                            y: 0
                        },
                        {
                            x: new Date(2016, 0, 1, 2, 15).toISOString(),
                            y: 50
                        },
                        {
                            x: new Date(2016, 0, 1, 3, 15).toISOString(),
                            y: 60
                        },
                        {
                            x: new Date(2016, 0, 1, 4, 15).toISOString(),
                            y: 80
                        },
                        {
                            x: new Date(2016, 0, 1, 5, 15).toISOString(),
                            y: 120
                        },
                        {
                            x: new Date(2016, 0, 1, 6, 15).toISOString(),
                            y: 130
                        },
                        {
                            x: new Date(2016, 0, 1, 7, 0).toISOString(),
                            y: 180
                        },
                        {
                            x: new Date(2016, 0, 1, 8, 15).toISOString(),
                            y: 185
                        },
                        {
                            x: new Date(2016, 0, 1, 9, 45).toISOString(),
                            y: 200
                        },
                        {
                            x: new Date(2016, 0, 1, 12, 15).toISOString(),
                            y: 220
                        }
                    ],
                    yAxis: "y2"
                },
                {
                    key: "uid_3",
                    label: {
                        display: "Data Label 3"
                    },
                    shape: Carbon.helpers.SHAPES.CIRCLE,
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 1, 5).toISOString(),
                            y: 15
                        },
                        {
                            x: new Date(2016, 0, 1, 2, 15).toISOString(),
                            y: 21
                        },
                        {
                            x: new Date(2016, 0, 1, 3, 15).toISOString(),
                            y: null
                        },
                        {
                            x: new Date(2016, 0, 1, 4, 15).toISOString(),
                            y: 16
                        },
                        {
                            x: new Date(2016, 0, 1, 5, 15).toISOString(),
                            y: 17
                        },
                        {
                            x: new Date(2016, 0, 1, 6, 15).toISOString(),
                            y: 19
                        },
                        {
                            x: new Date(2016, 0, 1, 9, 45).toISOString(),
                            y: 16
                        },
                        {
                            x: new Date(2016, 0, 1, 12, 15).toISOString(),
                            y: 17
                        },
                        {
                            x: new Date(2016, 0, 1, 13, 15).toISOString(),
                            y: 28
                        },
                        {
                            x: new Date(2016, 0, 1, 14, 15).toISOString(),
                            y: 22
                        },
                        {
                            x: new Date(2016, 0, 1, 19, 45).toISOString(),
                            y: 23
                        }
                    ],
                    yAxis: "y"
                }
            ],
            showLabel: true,
            showLegend: true,
            showShapes: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        LINE_TIMESERIES_DATELINE: (id) => ({
            bindTo: id,
            axis: {
                x: {
                    type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
                    label: "Datetime",
                    lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
                    upperLimit: new Date(2016, 0, 1, 23, 59).toISOString(),
                    orientation: Carbon.helpers.AXES_ORIENTATION.X.BOTTOM
                },
                y: {
                    label: "Line Set A",
                    lowerLimit: 10,
                    upperLimit: 30
                },
                y2: {
                    show: false,
                    label: "Line Set B",
                    lowerLimit: 0,
                    upperLimit: 250
                }
            },
            dateline: [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Current Date"
                    },
                    color: "#FFDF00",
                    shape: Carbon.helpers.SHAPES.SQUARE,
                    onClick: loadDatelinePopup,
                    value: new Date(2016, 0, 1, 6).toISOString()
                }
            ],
            clickPassThrough: {
                dateline: false
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Data Label 1"
                    },
                    shape: Carbon.helpers.SHAPES.CIRCLE,
                    onClick: loadPopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 1, 5).toISOString(),
                            y: 5,
                            isCritical: false
                        },
                        {
                            x: new Date(2016, 0, 1, 2, 15).toISOString(),
                            y: 11
                        },
                        {
                            x: new Date(2016, 0, 1, 3, 15).toISOString(),
                            y: 12
                        },
                        {
                            x: new Date(2016, 0, 1, 4, 15).toISOString(),
                            y: 16
                        },
                        {
                            x: new Date(2016, 0, 1, 5, 15).toISOString(),
                            y: 17
                        },
                        {
                            x: new Date(2016, 0, 1, 6, 15).toISOString(),
                            y: 9
                        },
                        {
                            x: new Date(2016, 0, 1, 7, 0).toISOString(),
                            y: 11
                        },
                        {
                            x: new Date(2016, 0, 1, 8, 15).toISOString(),
                            y: 12
                        },
                        {
                            x: new Date(2016, 0, 1, 9, 45).toISOString(),
                            y: 16
                        },
                        {
                            x: new Date(2016, 0, 1, 12, 15).toISOString(),
                            y: 17
                        },
                        {
                            x: new Date(2016, 0, 1, 13, 15).toISOString(),
                            y: 28
                        },
                        {
                            x: new Date(2016, 0, 1, 14, 15).toISOString(),
                            y: 12
                        },
                        {
                            x: new Date(2016, 0, 1, 19, 45).toISOString(),
                            y: 13
                        },
                        {
                            x: new Date(2016, 0, 1, 21, 15).toISOString(),
                            y: 14
                        }
                    ],
                    yAxis: "y"
                }
            ],
            showLabel: true,
            showLegend: true,
            showShapes: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        PAIRED_DEFAULT: (id) => ({
            bindTo: id, //"#graph-data-5"
            axis: {
                x: {
                    label: "Data",
                    lowerLimit: 0,
                    upperLimit: 1000
                },
                y: {
                    label: "Paired",
                    lowerLimit: 0,
                    upperLimit: 200
                }
            },
            data: [
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
                    shape: {
                        high: Carbon.helpers.SHAPES.TEAR_ALT,
                        mid: Carbon.helpers.SHAPES.RHOMBUS,
                        low: Carbon.helpers.SHAPES.TEAR_DROP
                    },
                    color: {
                        high: Carbon.helpers.COLORS.BLACK,
                        mid: Carbon.helpers.COLORS.PURPLE,
                        low: Carbon.helpers.COLORS.BLACK
                    },
                    onClick: loadPopup,
                    values: [
                        {
                            high: {
                                x: 20,
                                y: 150
                            },
                            mid: {
                                x: 20,
                                y: 40
                            },
                            low: {
                                x: 20,
                                y: 10
                            }
                        },
                        {
                            high: {
                                x: 80,
                                y: 100
                            },
                            mid: {
                                x: 80,
                                y: 75
                            },
                            low: {
                                x: 80,
                                y: 50
                            }
                        },
                        {
                            high: {
                                x: 150,
                                y: 110
                            },
                            mid: {
                                x: 150,
                                y: 70
                            },
                            low: {
                                x: 150,
                                y: 30
                            }
                        },
                        {
                            high: {
                                x: 175,
                                y: 160
                            },
                            mid: {
                                x: 175,
                                y: 120
                            },
                            low: {
                                x: 175,
                                y: 100
                            }
                        },
                        {
                            high: {
                                x: 300,
                                y: 190
                            },
                            mid: {
                                x: 300,
                                y: 90
                            },
                            low: {
                                x: 300,
                                y: 60
                            }
                        },
                        {
                            high: {
                                x: 560,
                                y: 150
                            },
                            mid: {
                                x: 560,
                                y: 40
                            },
                            low: {
                                x: 560,
                                y: 10
                            }
                        },
                        {
                            high: {
                                x: 800,
                                y: 180
                            },
                            mid: {
                                x: 800,
                                y: 100
                            },
                            low: {
                                x: 800,
                                y: 100
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
                        high: Carbon.helpers.SHAPES.TEAR_ALT,
                        mid: Carbon.helpers.SHAPES.RHOMBUS,
                        low: Carbon.helpers.SHAPES.TEAR_DROP
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
                                x: 45,
                                y: 350
                            },
                            mid: {
                                x: 45,
                                y: 146
                            },
                            low: {
                                x: 45,
                                y: 75
                            }
                        },
                        {
                            high: {
                                x: 470,
                                y: 110
                            },
                            mid: {
                                x: 470,
                                y: 70
                            },
                            low: {
                                x: 470,
                                y: 30
                            }
                        }
                    ]
                }
            ],
            showLabel: true,
            showLegend: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        PAIRED_TIMESERIES: (id) => ({
            bindTo: id,
            axis: {
                x: {
                    type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
                    label: "Datetime",
                    lowerLimit: "2016-03-02T12:00:00Z",
                    upperLimit: "2018-12-10T12:00:00Z",
                    ticks: {
                        format: "%b %Y"
                    }
                },
                y: {
                    label: "Paired Set A",
                    lowerLimit: 0,
                    upperLimit: 200
                },
                y2: {
                    show: false,
                    label: "Paired Set B",
                    lowerLimit: 100,
                    upperLimit: 350
                }
            },
            data: [
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
                    shape: {
                        high: Carbon.helpers.SHAPES.TEAR_ALT,
                        mid: Carbon.helpers.SHAPES.RHOMBUS,
                        low: Carbon.helpers.SHAPES.TEAR_DROP
                    },
                    color: {
                        high: Carbon.helpers.COLORS.BLACK,
                        mid: Carbon.helpers.COLORS.BLUE,
                        low: Carbon.helpers.COLORS.BLACK
                    },
                    onClick: loadPopup,
                    values: [
                        {
                            high: {
                                x: "2016-05-01T12:00:00Z",
                                y: 150,
                                isCritical: false
                            },
                            mid: {
                                x: "2016-05-01T12:00:00Z",
                                y: 40
                            },
                            low: {
                                x: "2016-05-01T12:00:00Z",
                                y: 10,
                                isCritical: false
                            }
                        },
                        {
                            high: {
                                x: "2016-08-17T12:00:00Z",
                                y: 110
                            },
                            mid: {
                                x: "2016-08-17T12:00:00Z",
                                y: 70
                            },
                            low: {
                                x: "2016-08-17T12:00:00Z",
                                y: 30
                            }
                        },
                        {
                            high: {
                                x: "2016-10-17T12:00:00Z",
                                y: 160
                            },
                            mid: {
                                x: "2016-10-17T12:00:00Z",
                                y: 120
                            },
                            low: {
                                x: "2016-10-17T12:00:00Z",
                                y: 100
                            }
                        },
                        {
                            high: {
                                x: "2017-03-17T12:00:00Z",
                                y: 190
                            },
                            mid: {
                                x: "2017-03-17T12:00:00Z",
                                y: 90
                            },
                            low: {
                                x: "2017-03-17T12:00:00Z",
                                y: 60
                            }
                        },
                        {
                            low: {
                                x: "2017-07-17T12:00:00Z",
                                y: 10
                            }
                        },
                        {
                            high: {
                                x: "2018-02-17T12:00:00Z",
                                y: 180
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
                        high: Carbon.helpers.SHAPES.TRIANGLE,
                        mid: Carbon.helpers.SHAPES.SQUARE,
                        low: Carbon.helpers.SHAPES.TRIANGLE_DOWN
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
                                x: "2017-05-01T11:00:00Z",
                                y: 300
                            },
                            mid: {
                                x: "2017-05-01T11:00:00Z",
                                y: 250
                            },
                            low: {
                                x: "2017-05-01T11:00:00Z",
                                y: 175
                            }
                        },
                        {
                            high: {
                                x: "2017-08-17T13:00:00Z",
                                y: 300
                            },
                            mid: {
                                x: "2017-08-17T13:00:00Z",
                                y: 170
                            },
                            low: {
                                x: "2017-08-17T13:00:00Z",
                                y: 130
                            }
                        },
                        {
                            high: {
                                x: "2017-10-17T15:00:00Z",
                                y: 250
                            },
                            mid: {
                                x: "2017-10-17T15:00:00Z",
                                y: 220
                            },
                            low: {
                                x: "2017-10-17T15:00:00Z",
                                y: 200
                            }
                        }
                    ]
                }
            ],
            showLabel: true,
            showLegend: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        LINE_PAIR_COMB_DEFAULT: (id) => ({
            bindTo: id,
            axis: {
                x: {
                    show: true,
                    label: "Data",
                    lowerLimit: 0,
                    upperLimit: 300
                },
                y: {
                    show: true,
                    label: "Line",
                    lowerLimit: 0,
                    upperLimit: 20
                },
                y2: {
                    show: true,
                    label: "Paired",
                    lowerLimit: 40,
                    upperLimit: 180
                }
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Line"
                    },
                    shape: Carbon.helpers.SHAPES.RHOMBUS,
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPopup,
                    values: new Array(50).fill("").map((_, i) => ({
                        y: Math.sin(i) * 5 + 10,
                        x: 10 + i * 5
                    }))
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
                    yAxis: "y2",
                    shape: {
                        high: Carbon.helpers.SHAPES.TEAR_ALT,
                        mid: Carbon.helpers.SHAPES.RHOMBUS,
                        low: Carbon.helpers.SHAPES.TEAR_DROP
                    },
                    color: {
                        high: Carbon.helpers.COLORS.BLACK,
                        mid: Carbon.helpers.COLORS.BLACK,
                        low: Carbon.helpers.COLORS.BLACK
                    },
                    onClick: loadPopup,
                    values: [
                        {
                            high: {
                                x: 45,
                                y: 200
                            },
                            mid: {
                                x: 45,
                                y: 146
                            },
                            low: {
                                x: 45,
                                y: 75
                            }
                        },
                        {
                            high: {
                                x: 160,
                                y: 110
                            },
                            mid: {
                                x: 160,
                                y: 70
                            },
                            low: {
                                x: 160,
                                y: 30
                            }
                        },
                        {
                            high: {
                                x: 220,
                                y: 110
                            },
                            mid: {
                                x: 220,
                                y: 70
                            },
                            low: {
                                x: 220,
                                y: 30
                            }
                        }
                    ]
                }
            ],
            showLabel: true,
            showLegend: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        PIE: (id) => ({
            bindTo: id,
            dimension: {
                height: 300
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Blue",
                        format: (display, val) =>
                            `${display}: ${val.toFixed()}%`
                    },
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPiePopup,
                    value: 60
                },
                {
                    key: "uid_2",
                    label: {
                        display: "Green"
                    },
                    color: Carbon.helpers.COLORS.GREEN,
                    onClick: loadPiePopup,
                    value: 10
                },
                {
                    key: "uid_3",
                    label: {
                        display: "Light Purple"
                    },
                    color: Carbon.helpers.COLORS.LIGHT_PURPLE,
                    onClick: loadPiePopup,
                    value: 30
                }
            ],
            showLegend: true
        })
    },
    {
        GANTT: (id) => ({
            bindTo: id,
            axis: {
                x: {
                    show: true,
                    lowerLimit: new Date(2018, 1, 1, 12).toISOString(),
                    upperLimit: new Date(2019, 1, 1, 12).toISOString(),
                    rangeRounding: true // If set to false, we don't extend the domain
                }
            },
            clickPassThrough: {
                task: false,
                activity: false,
                event: false,
                action: false,
                dateline: false
            },
            tracks: [
                {
                    key: "track 1",
                    dimension: {
                        trackHeight: 80
                    },
                    trackLabel: {
                        display: "Project A",
                        onClick: () => {
                            // Call consumer implementation here or NOP
                        }
                    },
                    tasks: [
                        {
                            key: "task1",
                            label: {
                                display: "Story A"
                            },
                            onClick: () => {},
                            color: "#007cc3",
                            startDate: new Date(2018, 1, 1).toISOString(),
                            endDate: new Date(2018, 1, 10).toISOString(),
                            duration: () => daysToMilliseconds(10),
                            percentage: 40,
                            dependencies: null, // TODO FUTURE implementation
                            style: {
                                isDotted: true,
                                isHollow: true
                            }
                        }
                    ],
                    activities: [
                        // Optional, consumer can skip this to get a valid gantt chart.
                        {
                            key: "uid_activity_1",
                            label: {
                                display: "Support"
                            },
                            onClick: () => {},
                            color: "#007cc3",
                            startDate: new Date(2018, 1, 1).toISOString(),
                            endDate: new Date(2018, 1, 10).toISOString(),
                            duration: () => daysToMilliseconds(12),
                            style: {
                                isDotted: false,
                                isHollow: false
                            }
                        }
                    ],
                    events: [
                        {
                            key: "uid_event_1",
                            label: {
                                display: "Defect A"
                            },
                            onClick: () => {},
                            shape: {
                                path: {
                                    id: "caretUp",
                                    d: "M0,36l24-24l24,24H0z"
                                },
                                options: {
                                    x: -12,
                                    y: -12,
                                    scale: 0.5
                                }
                            },
                            color: Carbon.helpers.COLORS.BLUE,
                            values: [new Date(2018, 3, 1, 7, 0).toISOString()]
                        }
                    ],
                    actions: [
                        {
                            key: "uid_action_1",
                            onClick: () => {},
                            values: [
                                new Date(2018, 2, 1, 6, 15).toISOString(),
                                new Date(2018, 3, 1, 6, 15).toISOString(),
                                new Date(2018, 4, 1, 6, 15).toISOString()
                            ]
                        },
                        {
                            key: "uid_action_2",
                            onClick: () => {},
                            values: [new Date(2018, 6, 1, 6, 15).toISOString()]
                        }
                    ]
                }
            ],
            actionLegend: [
                {
                    key: "uid_action_1",
                    label: {
                        display: "Action A"
                    }
                },
                {
                    key: "uid_action_2",
                    label: {
                        display: "Action B"
                    },
                    shape: Carbon.helpers.SHAPES.TRIANGLE,
                    color: Carbon.helpers.COLORS.GREEN
                }
            ],
            dateline: [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "DST Start"
                    },
                    color: "#D3D4D5",
                    shape: Carbon.helpers.SHAPES.TRIANGLE,
                    onClick: loadDatelinePopup,
                    value: new Date(2018, 2, 10).toISOString()
                },
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Current Date"
                    },
                    color: "#FFDF00",
                    shape: Carbon.helpers.SHAPES.SQUARE,
                    onClick: loadDatelinePopup,
                    value: new Date(2018, 8, 5).toISOString()
                },
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "DST End"
                    },
                    color: "#D3D4D5",
                    shape: Carbon.helpers.SHAPES.TRIANGLE,
                    onClick: loadDatelinePopup,
                    value: new Date(2018, 10, 3).toISOString()
                }
            ],
            showActionLegend: true
        })
    },
    {
        TIMELINE: (id) => ({
            bindTo: id,
            bindLegendTo: null,
            axis: {
                x: {
                    label: "Datetime",
                    lowerLimit: new Date(2016, 0, 1, 1, 0).toISOString(),
                    upperLimit: new Date(2016, 0, 1, 15, 59).toISOString(),
                    ticks: {
                        format: "",
                        values: []
                    }
                }
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Timeline A"
                    },
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadTimelinePopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 1, 30).toISOString(),
                            content: bobRossIpsum
                        },
                        {
                            x: new Date(2016, 0, 1, 2, 15).toISOString(),
                            content: bobRossIpsum
                        },
                        {
                            x: new Date(2016, 0, 1, 3, 15).toISOString(),
                            content: bobRossIpsum
                        },
                        {
                            x: new Date(2016, 0, 1, 4, 15).toISOString(),
                            content: bobRossIpsum
                        },
                        {
                            x: new Date(2016, 0, 1, 5, 15).toISOString(),
                            content: bobRossIpsum
                        }
                    ]
                },
                {
                    key: "uid_2",
                    label: {
                        display: "Timeline B"
                    },
                    shape: Carbon.helpers.SHAPES.RHOMBUS,
                    color: Carbon.helpers.COLORS.GREEN,
                    onClick: loadTimelinePopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 8, 15).toISOString(),
                            content: "This is custom value of another unit"
                        },
                        {
                            x: new Date(2016, 0, 1, 9, 45).toISOString(),
                            content: "This is custom value of another unit"
                        },
                        {
                            x: new Date(2016, 0, 1, 12).toISOString(),
                            content: "This is custom value of another unit"
                        }
                    ]
                }
            ],
            showLabel: true,
            showLegend: true
        })
    },
    {
        BAR_DEFAULT: (id) => ({
            bindTo: id,
            bindLegendTo: null,
            axis: {
                x: {
                    show: true,
                    label: "Data",
                    lowerLimit: 0,
                    upperLimit: 8
                },
                y: {
                    show: true,
                    label: "Bar Set A",
                    lowerLimit: 0,
                    upperLimit: 35
                },
                y2: {
                    show: false,
                    label: "Line Set B",
                    lowerLimit: 0,
                    upperLimit: 30
                }
            },
            data: [
                {
                    key: "uid_bar_1",
                    label: {
                        display: "Data Label 1"
                    },
                    color: Carbon.helpers.COLORS.GREEN,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: 30
                        },
                        {
                            x: 2,
                            y: 10
                        },
                        {
                            x: 3,
                            y: 13
                        },
                        {
                            x: 4,
                            y: 15
                        },
                        {
                            x: 5,
                            y: 18
                        }
                    ]
                },
                {
                    key: "uid_bar_2",
                    label: {
                        display: "Data Label 2"
                    },
                    color: Carbon.helpers.COLORS.LIGHT_PURPLE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: 10
                        },
                        {
                            x: 2,
                            y: 15
                        },
                        {
                            x: 3,
                            y: 18
                        },
                        {
                            x: 4,
                            y: 6
                        },
                        {
                            x: 6,
                            y: 10
                        }
                    ]
                },
                {
                    key: "uid_bar_3",
                    label: {
                        display: "Data Label 3"
                    },
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: 15
                        },
                        {
                            x: 2,
                            y: 10
                        },
                        {
                            x: 3,
                            y: 13
                        },
                        {
                            x: 4,
                            y: 8
                        }
                    ]
                },
                {
                    key: "uid_bar_4",
                    label: {
                        display: "Data Label 4"
                    },
                    group: "uid_bar_1",
                    color: Carbon.helpers.COLORS.LIGHT_PURPLE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: 30
                        },
                        {
                            x: 2,
                            y: 5
                        },
                        {
                            x: 3,
                            y: 8
                        },
                        {
                            x: 4,
                            y: 10
                        },
                        {
                            x: 5,
                            y: 10
                        },
                        {
                            x: 6,
                            y: 10
                        }
                    ]
                },
                {
                    key: "uid_bar_5",
                    label: {
                        display: "Data Label 5"
                    },
                    group: "uid_bar_1",
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: 30
                        },
                        {
                            x: 2,
                            y: 8
                        },
                        {
                            x: 3,
                            y: 9
                        },
                        {
                            x: 4,
                            y: 10
                        },
                        {
                            x: 5,
                            y: 7
                        }
                    ]
                },
                {
                    key: "uid_bar_6",
                    label: {
                        display: "Data Label 6"
                    },
                    group: "uid_bar_1",
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: -15
                        },
                        {
                            x: 2,
                            y: -8
                        },
                        {
                            x: 3,
                            y: -9
                        },
                        {
                            x: 4,
                            y: -10
                        },
                        {
                            x: 5,
                            y: -7
                        }
                    ]
                },
                {
                    key: "uid_barline_1",
                    label: {
                        display: "Data Bar Line 1"
                    },
                    yAxis: "y2",
                    color: Carbon.helpers.COLORS.BLACK,
                    onClick: loadPopup,
                    values: new Array(7).fill("").map((_, i) => ({
                        y: Math.sin(i) * Math.PI + 20,
                        x: i + 0.5
                    }))
                },
                {
                    key: "uid_bar_7",
                    label: {
                        display: "Data Label 7"
                    },
                    group: "uid_bar_1",
                    color: Carbon.helpers.COLORS.YELLOW,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: 1,
                            y: 10
                        },
                        {
                            x: 2,
                            y: 15
                        },
                        {
                            x: 3,
                            y: 18
                        },
                        {
                            x: 4,
                            y: 6
                        },
                        {
                            x: 5,
                            y: 0
                        },
                        {
                            x: 6,
                            y: 10
                        }
                    ]
                }
            ],
            showLabel: true,
            showLegend: true,
            showShapes: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        BAR_TIMESERIES: (id) => ({
            bindTo: id,
            bindLegendTo: null,
            axis: {
                x: {
                    show: true,
                    type: Carbon.helpers.AXIS_TYPE.TIME_SERIES,
                    label: "Data",
                    lowerLimit: new Date(2017, 11, 31).toISOString(),
                    upperLimit: new Date(2018, 0, 8).toISOString()
                },
                y: {
                    show: true,
                    label: "Bar Set A",
                    lowerLimit: 0,
                    upperLimit: 20
                },
                y2: {
                    show: false,
                    label: "Line Set B",
                    lowerLimit: 0,
                    upperLimit: 20
                }
            },
            data: [
                {
                    key: "uid_bar_t1",
                    label: {
                        display: "Data Label t1"
                    },
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: new Date(2018, 0, 1).toISOString(),
                            y: 15
                        },
                        {
                            x: new Date(2018, 0, 2).toISOString(),
                            y: 19
                        },
                        {
                            x: new Date(2018, 0, 3).toISOString(),
                            y: 10
                        },
                        {
                            x: new Date(2018, 0, 4).toISOString(),
                            y: 13
                        },
                        {
                            x: new Date(2018, 0, 5).toISOString(),
                            y: 15
                        }
                    ]
                },
                {
                    key: "uid_bar_t2",
                    label: {
                        display: "Data Label t2"
                    },
                    color: Carbon.helpers.COLORS.ORANGE,
                    onClick: loadBarPopup,
                    values: [
                        {
                            x: new Date(2018, 0, 2).toISOString(),
                            y: 10
                        },
                        {
                            x: new Date(2018, 0, 3).toISOString(),
                            y: 10
                        },
                        {
                            x: new Date(2018, 0, 4).toISOString(),
                            y: 15
                        }
                    ]
                }
            ],
            showLabel: true,
            showLegend: true,
            showShapes: true,
            showVGrid: true,
            showHGrid: true
        })
    }
];
export const getDemoData = (id, type) => {
    const res = DATA.find((t) => t[type]);
    return res ? res[type](id) : null;
};
export const getShapes = () => Object.keys(Carbon.helpers.SHAPES);
