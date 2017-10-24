"use strict";
import d3 from "d3";
import Carbon from "../../src/main/js/carbon";
import { loadPopup } from "./popup";

const JSON = {
    data: [],
    showLabel: true,
    showLegend: true,
    showSymbols: true,
    showVGrid: true,
    showHGrid: true
};
const today = () => new Date();
const getDate = (diff) => new Date().setDate(today().getDate() - diff);
const getISO = (d) => d.split(".")[ 0 ].concat("Z");
export const generateData = (id, sets, graph, type) => {
    const isTimeSeries = (t) => t === Carbon.helpers.AXIS_TYPE.TIME_SERIES;
    const lb = isTimeSeries(type) ? getDate(25) : 25;
    const ub = isTimeSeries(type) ? getDate(-200) : 200;
    const yLB = 2;
    const yUB = 60;
    const rangeX = () => Math.floor(Math.random() * (ub - lb)) + lb;
    const sym = Object.keys(Carbon.helpers.SYMBOLS);
    const loadData = () =>
        new Array(sets).fill("").map((_, i) => Object.assign({},
            {
                key: `uid_${i}`,
                label: {
                    display: `Data item ${i + 1}`
                },
                symbol: sym[ Math.floor(Math.random() * 10) ],
                color: Carbon.helpers.COLORS[ Object.keys(Carbon.helpers.COLORS)[ i ] ],
                onClick: loadPopup,
                values: new Array(sets).fill("").map((_, j) => Object.assign({}, {
                    x: isTimeSeries(type) ? getISO(new Date(rangeX()).toISOString()) : rangeX(),
                    y: Math.floor(Math.random() * (yUB - yLB)) + yLB
                })).sort((a, b) => a.x > b.x)
            })
        );
    return Object.assign({}, JSON, {
        bindTo: id,
        data: loadData(),
        axis: {
            x: {
                type,
                label: "Label Axis X",
                lowerLimit: isTimeSeries(type) ? getISO(new Date(lb).toISOString()) : lb,
                upperLimit: isTimeSeries(type) ? getISO(new Date(ub).toISOString()) : ub
            },
            y: {
                label: "Label Axis Y",
                lowerLimit: yLB,
                upperLimit: yUB
            }
        }
    });
};

const DATA = [
    {
        LINE_DEFAULT: (id) => ({
            bindTo: id,
            axis: {
                x: {
                    show: true,
                    label: "Data",
                    lowerLimit: 80,
                    upperLimit: 280,
                    ticks: {
                        // TODO Future implementation
                        show: true,
                        count: 10,
                        format: "",
                        values: []
                    }
                },
                y: {
                    show: true,
                    label: "Line",
                    lowerLimit: 0,
                    upperLimit: 20
                },
                y2: {
                    show: false,
                    label: "Some Y2 Label",
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
                    symbol: Carbon.helpers.SYMBOLS.RHOMBUS,
                    color: Carbon.helpers.COLORS.BLACK,
                    onClick: loadPopup,
                    values: new Array(18).fill("").map((_, i) => Object.assign({}, {
                        y: Math.sin(i) * Math.PI,
                        x: 90 + i * 10
                    }))
                },
                {
                    key: "uid_2",
                    label: {
                        display: "Data Label 2"
                    },
                    symbol: Carbon.helpers.SYMBOLS.TRIANGLE,
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPopup,
                    values: new Array(18).fill("").map((_, i) => Object.assign({}, {
                        y: Math.sin(i) * Math.PI * 2,
                        x: 90 + i * 10
                    }))
                },
                {
                    key: "uid_3",
                    label: {
                        display: "Data Label 3"
                    },
                    symbol: Carbon.helpers.SYMBOLS.X,
                    color: Carbon.helpers.COLORS.GREEN,
                    onClick: loadPopup,
                    values: new Array(10).fill("").map((_, i) => Object.assign({}, {
                        y: Math.sin(i) * Math.PI * 3,
                        x: 90 + i * 10
                    }))
                },
                {
                    key: "uid_4",
                    label: {
                        display: "Data Label 4"
                    },
                    symbol: Carbon.helpers.SYMBOLS.CROSS,
                    color: Carbon.helpers.COLORS.LIGHT_PURPLE,
                    onClick: loadPopup,
                    values: new Array(15).fill("").map((_, i) => Object.assign({}, {
                        y: Math.sin(i) * Math.PI * 4,
                        x: 90 + i * 10
                    }))
                },
                {
                    key: "uid_5",
                    label: {
                        display: "Data Label 5"
                    },
                    symbol: Carbon.helpers.SYMBOLS.SQUARE,
                    color: Carbon.helpers.COLORS.ORANGE,
                    onClick: loadPopup,
                    values: new Array(15).fill("").map((_, i) => Object.assign({}, {
                        y: Math.cos(i) * Math.PI * 5,
                        x: 90 + i * 10
                    }))
                },
                {
                    key: "uid_6",
                    label: {
                        display: "Data Label 6"
                    },
                    symbol: Carbon.helpers.SYMBOLS.CIRCLE,
                    color: Carbon.helpers.COLORS.LIGHT_BLUE,
                    onClick: loadPopup,
                    values: new Array(13).fill("").map((_, i) => Object.assign({}, {
                        y: Math.cos(i) * Math.PI * 6,
                        x: 90 + i * 10
                    }))
                },
                {
                    key: "uid_7",
                    label: {
                        display: "Data Label 7"
                    },
                    symbol: Carbon.helpers.SYMBOLS.TRIANGLE_DOWN,
                    color: Carbon.helpers.COLORS.GREY,
                    onClick: loadPopup,
                    values: new Array(15).fill("").map((_, i) => Object.assign({}, {
                        y: Math.cos(i) * Math.PI * 7,
                        x: 90 + i * 10
                    }))
                }
            ],
            showLabel: true,
            showLegend: true,
            showSymbols: true,
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
                    upperLimit: new Date(2016, 0, 1, 23, 59).toISOString(),
                    ticks: {}
                },
                y: {
                    label: "Line",
                    lowerLimit: 0,
                    upperLimit: 30
                },
                y2: {
                    show: false,
                    label: "Some Y2 Label",
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
                    symbol: Carbon.helpers.SYMBOLS.CIRCLE,
                    onClick: loadPopup,
                    values: [
                        {
                            x: new Date(2016, 0, 1, 1, 5).toISOString(),
                            y: 1
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
                            y: 2
                        },
                        {
                            x: new Date(2016, 0, 1, 19, 45).toISOString(),
                            y: 3
                        },
                        {
                            x: new Date(2016, 0, 1, 21, 15).toISOString(),
                            y: 4
                        }
                    ],
                    yAxis: "y" // Default is "y", only need to specify if "y2"
                }
            ],
            showLabel: true,
            showLegend: true,
            showSymbols: true,
            showVGrid: true,
            showHGrid: true
        })
    },
    {
        PAIRED_DEFAULT: (id) => ({
            bindTo: id, //"#graph-data-5"
            locale: Carbon.helpers.LOCALE.de_DE,
            axis: {
                x: {
                    label: "Data",
                    lowerLimit: 0,
                    upperLimit: 1000,
                    ticks: {
                        // under development
                        show: true,
                        count: 10,
                        format: "n",
                        values: []
                    }
                },
                y: {
                    label: "Paired",
                    lowerLimit: 0,
                    upperLimit: 200,
                    ticks: {
                        // under development
                        show: true,
                        count: 10,
                        format: "",
                        values: []
                    }
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
                    symbol: {
                        high: Carbon.helpers.SYMBOLS.TEAR_ALT,
                        mid: Carbon.helpers.SYMBOLS.RHOMBUS,
                        low: Carbon.helpers.SYMBOLS.TEAR_DROP
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
                    symbol: {
                        high: Carbon.helpers.SYMBOLS.TEAR_ALT,
                        mid: Carbon.helpers.SYMBOLS.RHOMBUS,
                        low: Carbon.helpers.SYMBOLS.TEAR_DROP
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
            bindTo: id, //"#graph-data-5"
            locale: Carbon.helpers.LOCALE.fr_FR,
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
                    label: "Paired",
                    lowerLimit: 0,
                    upperLimit: 200
                }
            },
            data: [
                {
                    key: "uid_1",
                    regions: [ // TODO Future implementation
                        {
                            axis: "y",
                            start: 0,
                            end: 50,
                            color: Carbon.helpers.COLORS.BLACK
                        }
                    ],
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
                    symbol: {
                        high: Carbon.helpers.SYMBOLS.TEAR_ALT,
                        mid: Carbon.helpers.SYMBOLS.RHOMBUS,
                        low: Carbon.helpers.SYMBOLS.TEAR_DROP
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
                                y: 150
                            },
                            mid: {
                                x: "2016-05-01T12:00:00Z",
                                y: 40
                            },
                            low: {
                                x: "2016-05-01T12:00:00Z",
                                y: 10
                            },
                            isCritical: false // TODO Future implementation
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
                    lowerLimit: 0,
                    upperLimit: 250
                }
            },
            data: [
                {
                    key: "uid_1",
                    label: {
                        display: "Line"
                    },
                    symbol: Carbon.helpers.SYMBOLS.RHOMBUS,
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: loadPopup,
                    values: new Array(50).fill("").map((_, i) => Object.assign({}, {
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
                    symbol: {
                        high: Carbon.helpers.SYMBOLS.TEAR_ALT,
                        mid: Carbon.helpers.SYMBOLS.RHOMBUS,
                        low: Carbon.helpers.SYMBOLS.TEAR_DROP
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
                                x: 85,
                                y: 110
                            },
                            mid: {
                                x: 85,
                                y: 70
                            },
                            low: {
                                x: 85,
                                y: 30
                            }
                        },
                        {
                            high: {
                                x: 115,
                                y: 110
                            },
                            mid: {
                                x: 115,
                                y: 70
                            },
                            low: {
                                x: 115,
                                y: 30
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
            showSymbols: true,
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
                    label: "Apple",
                    color: Carbon.helpers.COLORS.BLUE,
                    onClick: (d, i) => {
                        console.log(d);
                        console.log(i);
                    },
                    values: [ 100, 100 ]
                },
                {
                    key: "uid_2",
                    label: "Orange",
                    color: Carbon.helpers.COLORS.GREEN,
                    values: [ 50, 25 ]
                }
            ],
            pie: {
                label: {
                    format: (value, ratio, id) => d3.format("$")(value)
                }
            }
        })
    }
];
export const getData = (id, type) => {
    const res = DATA.find((t) => t[ type ]);
    return res ? res[ type ](id) : null;
};
export const getAxes = (id, type) => {
    const res = DATA.find((t) => t[ type ]);
    return res ? res[ type ](id) : null;
};
export const getSymbols = () => Object.keys(Carbon.helpers.SYMBOLS);
