"use strict";
import Carbon from "../../../src/main/js/carbon";
import { COLORS } from "../../../src/main/js/helpers/constants";
import utils from "../../../src/main/js/helpers/utils";
import { CUSTOM_CONTAINER_STYLE } from "../helpers";
import { getDemoData } from "../data";
import {
    loadPopup,
    loadTaskPopup,
    loadXAndYAxisLabelPopup,
    loadTrackPopup
} from "../popup";
import { createPanningControls } from "../panHelpers";

const daysToMilliseconds = (d) => 24 * 60 * 60 * 1000 * d;
const scheduled = {
    path: [
        {
            id: "calendar",
            d:
                "M31 5V1.8c0-1-.8-1.8-1.8-1.8h-1.5c-1 0-1.8.8-1.8 1.8V5H11V1.8c0-1-.8-1.8-1.8-1.8H7.8C6.8" +
                " 0 6 .8 6 1.8V5H2v33h19.1c-.1-.7-.1-1.3-.1-2v-1H5V17h27v4.6c1-.3 2-.4 3-.5V5h-4z"
        },
        {
            id: "circle",
            fill: "#78C346",
            d:
                "M36 24c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12z"
        },
        {
            id: "check",
            fill: "#FFF",
            d: "M34.1 42.4l-6.5-6.5 2.1-2.1 4.4 4.3 8.2-8.1 2.1 2.1-10.3 10.3z"
        }
    ],
    options: {
        x: -7,
        y: -7,
        scale: 0.4
    }
};
const alert = {
    path: [
        {
            id: "triangle",
            fill: "#E50000",
            d:
                "M1.2 45c-1.1 0-1.6-.8-1-1.7L23 3.7c.5-1 1.4-1 2 0l22.8 39.6c.5 1 .1 1.7-1 1.7H1.2z"
        },
        {
            id: "exclamation",
            fill: "#FFF",
            d: "M21.5 36.7h5V42h-5v-5.3zm0-22.7h5v17.3h-5V14z"
        }
    ],
    options: {
        x: -6.5,
        y: -7.5,
        scale: 0.35
    }
};
const dueSoon = {
    path: [
        {
            id: "clock",
            d:
                "M25.3 25.9l-5.2-5.2v-8.5c.1-.7-.4-1.3-1-1.4-.7-.1-1.3.4-1.4 1V21c0 .5.2.9.5 " +
                "1.2l5.3 5.3c.5.5 1.2.6 1.8.2.5-.4.6-1.1.3-1.6-.1 0-.2-.1-.3-.2zm7.2-15l1.7-1.7c.6-.6.6-1.7 " +
                "0-2.3l-1.1-1.1c-.6-.6-1.7-.6-2.3 0L29 7.6c-1.5-1.1-3.3-2-5.1-2.6-.9-.3-1.8-.5-2.7-.6V1.6c0-.9-.7-" +
                "1.6-1.6-1.6h-1.5c-.9 0-1.6.7-1.6 1.6v2.7C7.2 5.7.9 14.4 2.3 23.7 3.6 32 10.7 38.1 19 38.1c1 0 1.9-.1 2.9" +
                "-.3l-1.4-1.4c-.2-.2-.4-.5-.5-.8-.3 0-.7.1-1 .1-8.1 0-14.6-6.5-14.6-14.6S10.9 6.5 19 6.5c1.5 0 2.9.2 4.3.7 " +
                "5.9 1.8 9.9 7.1 10.2 13.2.7-.5 1.6-.6 2.4-.2-.2-3.4-1.4-6.6-3.4-9.3z"
        },
        {
            id: "diamond",
            fill: "#E50000",
            d:
                "M47.6 34.1s0-.1 0 0L35.7 22.2c-.2-.2-.5-.4-.8-.4s-.6.1-.8.3l-12 12c-.5.4-.5 1.2-.1 1.6 0 0 0 " +
                ".1.1.1L34 47.6c.5.4 1.1.4 1.6 0l11.9-11.9c.5-.4.5-1.2.1-1.6z"
        },
        {
            id: "exclamation",
            fill: "#FFF",
            d: "M34 39h2v2h-2v-2zm0-11h2v9h-2v-9z"
        }
    ],
    options: {
        x: -7,
        y: -7,
        scale: 0.35
    }
};
const tasks = [
    [
        {
            key: "task1",
            onClick: loadTaskPopup,
            label: {
                display: "Story Apex"
            },
            startDate: new Date(2018, 2, 1).toISOString(),
            endDate: new Date(2018, 3, 10).toISOString()
        },
        {
            key: "task2",
            onClick: loadTaskPopup,
            label: {
                display: "Story Broccoli"
            },
            startDate: new Date(2018, 8, 1).toISOString(),
            endDate: new Date(2018, 9, 10).toISOString()
        }
    ],
    [
        {
            key: "task3",
            onClick: loadTaskPopup,
            label: {
                display: "Story Apex"
            },
            startDate: new Date(2018, 3, 1).toISOString(),
            endDate: new Date(2018, 7, 10).toISOString()
        }
    ],
    [
        {
            key: "task4",
            onClick: loadTaskPopup,
            label: {
                display: "Story Charming"
            },
            startDate: new Date(2018, 6, 1).toISOString(),
            endDate: new Date(2018, 7, 10).toISOString()
        },
        {
            key: "task5",
            onClick: loadTaskPopup,
            label: {
                display: "Story Broccoli"
            },
            startDate: new Date(2018, 10, 1).toISOString(),
            endDate: new Date(2018, 10, 1).toISOString()
        }
    ],
    [
        {
            key: "task6",
            onClick: loadTaskPopup,
            label: {
                display: "Story Apex"
            },
            startDate: new Date(2018, 6, 1).toISOString(),
            endDate: new Date(2018, 9, 10).toISOString()
        }
    ],
    [
        {
            key: "task7",
            onClick: loadTaskPopup,
            label: {
                display: "Story Donny"
            },
            startDate: new Date(2018, 3, 1).toISOString(),
            duration: () => daysToMilliseconds(14)
        },
        {
            key: "task8",
            onClick: loadTaskPopup,
            label: {
                display: "Story Fargo"
            },
            endDate: new Date(2018, 7, 1).toISOString(),
            duration: () => daysToMilliseconds(10)
        },
        {
            key: "Task 9",
            onClick: loadTaskPopup,
            label: {
                display: "Story Broccoli Task hash"
            },
            startDate: new Date(2018, 8, 1).toISOString(),
            endDate: new Date(2018, 9, 10).toISOString(),
            style: {
                isHashed: true
            }
        }
    ],
    [
        {
            key: "task10",
            onClick: loadTaskPopup,
            label: {
                display: "Story Apex"
            },
            startDate: new Date(2016, 0, 1, 8).toISOString(),
            endDate: new Date(2016, 0, 1, 12).toISOString()
        },
        {
            key: "task11",
            onClick: loadTaskPopup,
            label: {
                display: "Story Broccoli"
            },
            startDate: new Date(2016, 0, 1, 15).toISOString(),
            endDate: new Date(2016, 0, 1, 23).toISOString()
        }
    ]
];

const tasks2 = [
    [
        {
            key: "task1",
            onClick: loadTaskPopup,
            label: {
                display: "Story Apex"
            },
            startDate: new Date(2016, 0, 1, 8).toISOString(),
            endDate: new Date(2016, 0, 1, 12).toISOString()
        },
        {
            key: "task2",
            onClick: loadTaskPopup,
            label: {
                display: "Story Broccoli"
            },
            startDate: new Date(2016, 0, 1, 15).toISOString(),
            endDate: new Date(2016, 0, 1, 23).toISOString()
        }
    ]
];
const activities = [
    [
        {
            key: "activity1",
            label: {
                display: "activity1"
            },
            onClick: () => {},
            color: "#FFDF00",
            startDate: new Date(2018, 1, 1).toISOString(),
            endDate: new Date(2018, 4, 10).toISOString(),
            style: {
                isDotted: false,
                isHollow: false
            }
        }
    ],
    [
        {
            key: "activity2-hashed",
            label: {
                display: "Story Apex Hashed Activity"
            },
            color: "#000",
            startDate: new Date(2018, 0, 1).toISOString(),
            endDate: new Date(2018, 3, 1).toISOString(),
            style: {
                isDotted: false,
                isHollow: false,
                isHashed: true
            }
        },
        {
            key: "activity3",
            color: "#ff0000",
            label: {
                display: "Story Apex Activity"
            },
            startDate: new Date(2018, 3, 1).toISOString(),
            endDate: new Date(2018, 9, 10).toISOString(),
            style: {
                isDotted: false,
                isHollow: false
            }
        }
    ],
    [
        {
            key: "activity4",
            color: COLORS.LIGHT_BLUE,
            onMouseEnter: loadTaskPopup,
            onMouseMove: loadTaskPopup,
            label: {
                display: "Story Charming Activity"
            },
            startDate: new Date(2018, 5, 1).toISOString(),
            endDate: new Date(2018, 5, 31).toISOString(),
            style: {
                isDotted: false,
                isHollow: false
            }
        }
    ],
    [
        {
            key: "activity5",
            label: {
                display: "activity5"
            },
            onClick: () => {},
            color: "#FFDF00",
            startDate: new Date(2016, 0, 1, 12).toISOString(),
            endDate: new Date(2016, 0, 1, 15).toISOString(),
            style: {
                isDotted: false,
                isHollow: false
            }
        }
    ]
];
const events = [
    [
        {
            key: "uid_event_1",
            label: {
                display: "Defect A"
            },
            onClick: loadPopup,
            shape: scheduled,
            color: Carbon.helpers.COLORS.BLACK,
            values: [new Date(2018, 2, 5).toISOString()]
        },
        {
            key: "uid_event_2",
            label: {
                display: "Defect B"
            },
            shape: dueSoon,
            color: Carbon.helpers.COLORS.WHITE,
            values: [new Date(2018, 5, 4).toISOString()]
        },
        {
            key: "uid_event_3",
            label: {
                display: "Defect C"
            },
            shape: alert,
            values: [new Date(2018, 3, 30).toISOString()]
        }
    ],
    [
        {
            key: "uid_event_4",
            label: {
                display: "Defect A"
            },
            onClick: loadPopup,
            shape: scheduled,
            color: Carbon.helpers.COLORS.BLACK,
            values: [new Date(2016, 0, 1, 5, 15).toISOString()]
        }
    ]
];
const actions = [
    [
        {
            key: "uid_action_1",
            onClick: loadPopup,
            values: [new Date(2018, 2, 1, 6, 15).toISOString()]
        },
        {
            key: "uid_action_2",
            onClick: loadPopup,
            values: [new Date(2018, 7, 1, 6, 15).toISOString()]
        }
    ],
    [
        {
            key: "uid_action_1",
            onClick: loadPopup,
            values: [
                new Date(2018, 2, 1, 6, 15).toISOString(),
                new Date(2018, 4, 1, 6, 15).toISOString()
            ]
        },
        {
            key: "uid_action_2",
            onClick: loadPopup,
            values: [new Date(2016, 0, 1, 9, 15).toISOString()]
        }
    ],
    [
        {
            key: "uid_action_1",
            onClick: loadPopup,
            values: [new Date(2016, 0, 1, 6, 15).toISOString()]
        },
        {
            key: "uid_action_2",
            onClick: loadPopup,
            values: [new Date(2016, 0, 1, 7, 15).toISOString()]
        }
    ]
];
const panData = {
    actions: [
        {
            key: "uid_action_1",
            values: [
                new Date(2016, 0, 1, 7, 15).toISOString(),
                new Date(2016, 0, 1, 8, 15).toISOString()
            ]
        },
        {
            key: "uid_action_2",
            values: [new Date(2016, 0, 1, 9, 15).toISOString()]
        }
    ],
    tasks: [
        {
            key: "task10",
            startDate: new Date(2016, 0, 1, 9).toISOString(),
            endDate: new Date(2016, 0, 1, 12).toISOString()
        },
        {
            key: "task11",
            startDate: new Date(2016, 0, 1, 15).toISOString(),
            endDate: new Date(2016, 0, 1, 20).toISOString()
        }
    ],
    events: [
        {
            key: "uid_event_4",
            shape: scheduled,
            values: [new Date(2016, 0, 1, 2, 15).toISOString()]
        }
    ],
    activities: [
        {
            key: "activity5",
            startDate: new Date(2016, 0, 1, 3).toISOString(),
            endDate: new Date(2016, 0, 1, 6).toISOString()
        }
    ]
};
const lowerStepTickValues = [
    new Date(2018, 1, 2, 6).toISOString(),
    new Date(2018, 1, 2, 12).toISOString(),
    new Date(2018, 1, 2, 18).toISOString()
];
const midpointTickValues = [
    new Date(2018, 1, 2, 3).toISOString(),
    new Date(2018, 1, 2, 9).toISOString(),
    new Date(2018, 1, 2, 15).toISOString(),
    new Date(2018, 1, 2, 21).toISOString()
];
const upperStepTickValues = [
    new Date(2018, 1, 2, 0).toISOString(),
    new Date(2018, 1, 2, 24).toISOString()
];

export const renderGantt = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, tasks, [], [], [], 4);
    return ganttDefault;
};
export const renderGanttActivities = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, tasks, activities, [], [], 4);
    return ganttDefault;
};

export const renderGanttEventline = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.eventline = [
        {
            color: Carbon.helpers.COLORS.GREY,
            style: {
                strokeDashArray: "4,4"
            },
            value: new Date(2018, 10, 13).toISOString()
        },
        {
            color: Carbon.helpers.COLORS.BLACK,
            style: {
                strokeDashArray: "2,2"
            },
            value: new Date(2018, 10, 20).toISOString()
        }
    ];
    data.showActionLegend = false;
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, tasks, [], [], [], 4);
    return ganttDefault;
};

export const renderGanttPercentage = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = [];
    const ganttDefault = Carbon.api.gantt(data);

    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Percentage",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "task3",
                onClick: loadTaskPopup,
                color: COLORS.ORANGE,
                label: {
                    display: "Story Apex"
                },
                percentage: 20,
                startDate: new Date(2018, 8, 1).toISOString(),
                endDate: new Date(2019, 0, 12).toISOString()
            },
            {
                key: "task5",
                onClick: loadTaskPopup,
                color: COLORS.GREEN,
                label: {
                    display: "Story Zelda"
                },
                percentage: 60,
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 5, 12).toISOString()
            }
        ]
    });
    return ganttDefault;
};
export const renderGanttPanning = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    axisData.showActionLegend = false;
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.dateline = [
        {
            showDatelineIndicator: true,
            label: {
                display: "Release A"
            },
            color: "#C97318",
            shape: Carbon.helpers.SHAPES.SQUARE,
            value: new Date(2016, 0, 1, 9).toISOString()
        }
    ];
    axisData.pan = {
        enabled: true
    };
    const graphData = {
        key: "track 0",
        trackLabel: {
            display: "Default",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: tasks2[0]
    };
    const createGraph = () => {
        graph.reflow();
    };

    const graph = Carbon.api.gantt(axisData);
    graph.loadContent(graphData);
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderGanttPanningWithDynamicData = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    axisData.showActionLegend = true;
    axisData.axis.x.lowerLimit = new Date(2016, 0, 1, 0).toISOString();
    axisData.axis.x.upperLimit = new Date(2016, 0, 2, 0).toISOString();
    axisData.dateline = [
        {
            showDatelineIndicator: true,
            label: {
                display: "Release A"
            },
            color: "#C97318",
            shape: Carbon.helpers.SHAPES.SQUARE,
            value: new Date(2016, 0, 1, 9).toISOString()
        }
    ];
    axisData.pan = {
        enabled: true
    };
    const graphData = {
        key: "track 0",
        trackLabel: {
            display: "Default",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: tasks[5],
        actions: actions[2],
        events: events[1],
        activities: activities[3]
    };
    const graphDataY = {
        key: "track 0",
        actions: panData.actions,
        tasks: panData.tasks,
        events: panData.events,
        activities: panData.activities
    };
    const createGraph = () => {
        graph.reflow(graphDataY);
    };

    const graph = Carbon.api.gantt(axisData);
    graph.loadContent(graphData);
    axisData.axis = graph.config.axis;

    createPanningControls(id, {
        axisData,
        creationHandler: createGraph
    });
    return graph;
};

export const renderGanttAction = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.dateline = [];
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, [], [], [], actions, 2);
    return ganttDefault;
};
export const renderGanttEvents = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.dateline = [];
    data.showActionLegend = false;
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, [tasks[1]], [], [events[0]], [], 1);
    return ganttDefault;
};
export const renderGanttTruncate = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = [];
    const ganttDefault = Carbon.api.gantt(data);
    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display:
                "Really really long project name that cannot be shown realistically"
        }
    });
    return ganttDefault;
};
export const renderGanttStyle = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = [];
    const ganttDefault = Carbon.api.gantt(data);
    ganttDefault.loadContent({
        key: "track 0",
        trackLabel: {
            display: "Default",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "default",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString()
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Hollow only",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "default",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString(),
                style: {
                    isHollow: true
                }
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 2",
        trackLabel: {
            display: "Dotted, Hollow"
        },
        tasks: [
            {
                key: "default",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString(),
                style: {
                    isDotted: true,
                    isHollow: true
                }
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 3",
        trackLabel: {
            display: "Percentage",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "percentage",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString(),
                percentage: 30
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 4",
        trackLabel: {
            display: "Task Hashed",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "task_hash",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString(),
                style: {
                    isHashed: true
                }
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 5",
        trackLabel: {
            display: "Activity",
            onClick: loadXAndYAxisLabelPopup
        },
        activities: [
            {
                key: "Activity",
                label: {
                    display: "Story Apex Activity"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString()
            }
        ]
    });

    ganttDefault.loadContent({
        key: "track 6",
        trackLabel: {
            display: "Activity Hashed"
        },
        activities: [
            {
                key: "Hash",
                label: {
                    display: "Story Apex Activity hash"
                },
                color: "#000",
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString(),
                style: {
                    isHashed: true
                }
            }
        ]
    });

    ganttDefault.loadContent({
        key: "track 7",
        trackLabel: {
            display: "Activity and Task",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "Task",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex Task"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString()
            }
        ],
        activities: [
            {
                key: "Activity and Task",
                label: {
                    display: "Combination"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 11, 1).toISOString()
            }
        ]
    });
    return ganttDefault;
};
export const renderGanttDateTimeBuckets = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.axis.x.lowerLimit = new Date(2018, 1, 1, 23).toISOString();
    data.axis.x.upperLimit = new Date(2018, 1, 3, 1).toISOString();
    data.axis.x.ticks = {
        format: "%H",
        lowerStepTickValues,
        midpointTickValues,
        upperStepTickValues
    };
    data.showActionLegend = false;
    data.dateline = [];
    const ganttDefault = Carbon.api.gantt(data);
    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Project A",
            onClick: loadXAndYAxisLabelPopup
        },
        tasks: [
            {
                key: "task1",
                onClick: loadTaskPopup,
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 1, 2, 9).toISOString(),
                endDate: new Date(2018, 1, 2, 19).toISOString()
            }
        ]
    });
    return ganttDefault;
};
export const renderGanttCustomContentPadding = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.padding = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, tasks, [], [], [], 4);
    return ganttDefault;
};
export const renderGanttCustomContainerPadding = (id) => {
    const containerElement = document.querySelector(`#${id}`);
    containerElement.setAttribute(
        "class",
        `${containerElement.getAttribute("class")} ${CUSTOM_CONTAINER_STYLE}`
    );

    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, tasks, [], [], [], 4);
    return ganttDefault;
};
export const renderGanttTrackSelection = (id) => {
    const data = Object.assign(
        utils.deepClone(getDemoData(`#${id}`, "GANTT")),
        {
            clickPassThrough: {
                tasks: true,
                activities: true,
                events: true,
                actions: true,
                datelines: true
            }
        }
    );
    data.showActionLegend = true;
    data.dateline = [
        {
            showDatelineIndicator: true,
            label: {
                display: "DST Start"
            },
            color: "#405978",
            shape: Carbon.helpers.SHAPES.DIAMOND,
            value: new Date(2018, 2, 10).toISOString()
        },
        {
            showDatelineIndicator: true,
            label: {
                display: "Current Date"
            },
            color: "#C97318",
            shape: Carbon.helpers.SHAPES.SQUARE,
            value: new Date(2018, 8, 5).toISOString()
        }
    ];
    const ganttDefault = Carbon.api.gantt(data);
    const passThroughActivities = [
        [
            {
                key: "activity1",
                label: {
                    display: "activity1"
                },
                color: "#FFDF00",
                startDate: new Date(2018, 1, 1).toISOString(),
                endDate: new Date(2018, 4, 10).toISOString(),
                style: {
                    isDotted: false,
                    isHollow: false
                }
            }
        ]
    ];
    const passThroughTasks = [
        [
            {
                key: "task1",
                label: {
                    display: "Story Apex"
                },
                startDate: new Date(2018, 2, 1).toISOString(),
                endDate: new Date(2018, 3, 10).toISOString()
            },
            {
                key: "task2",
                label: {
                    display: "Story Broccoli"
                },
                startDate: new Date(2018, 8, 1).toISOString(),
                endDate: new Date(2018, 9, 10).toISOString()
            }
        ]
    ];
    const passThroughEvents = [
        [
            {
                key: "uid_event_1",
                label: {
                    display: "Defect A"
                },
                shape: dueSoon,
                values: [new Date(2018, 4, 30).toISOString()]
            },
            {
                key: "uid_event_2",
                label: {
                    display: "Defect B"
                },
                shape: alert,
                color: Carbon.helpers.COLORS.GREEN,
                values: [new Date(2018, 5, 4).toISOString()]
            },
            {
                key: "uid_event_3",
                label: {
                    display: "Defect C"
                },
                shape: alert,
                color: Carbon.helpers.COLORS.GREEN,
                values: [new Date(2018, 9, 5).toISOString()]
            }
        ]
    ];
    const passThroughActions = [
        [
            {
                key: "uid_action_1",
                values: [new Date(2018, 2, 1, 6, 15).toISOString()]
            },
            {
                key: "uid_action_2",
                values: [new Date(2018, 7, 1, 6, 15).toISOString()]
            }
        ]
    ];
    loadTracks(
        ganttDefault,
        passThroughTasks,
        passThroughActivities,
        passThroughEvents,
        passThroughActions,
        1,
        true
    );
    return ganttDefault;
};
/**
 * Helper function to load tracks.
 *
 * @private
 * @param {object} gantt - gantt object where its components needs to be loaded.
 * @param {Array} tasks - gantt tasks that needs to be loaded
 * @param {Array} activities - gantt activities that needs to be loaded
 * @param {Array} events - gantt events that needs to be loaded
 * @param {Array} actions - gantt actions that needs to be loaded
 * @param {number} totalTracks - total required number of tracks
 * @param {boolean} isTrackSelectable - indicator to specify if track is selectable or not.
 * @returns {undefined} - returns nothing
 */
const loadTracks = (
    gantt,
    tasks = [],
    activities = [],
    events = [],
    actions = [],
    totalTracks = 1,
    isTrackSelectable = false
) => {
    for (const each of Array(totalTracks).keys()) {
        gantt.loadContent({
            key: `track ${each}`,
            onClick: isTrackSelectable ? loadTrackPopup : undefined,
            trackLabel: {
                display: `Project ${String.fromCharCode(65 + each)}`,
                onClick: loadXAndYAxisLabelPopup
            },
            tasks: tasks[each] ? tasks[each] : {},
            activities: activities[each] ? activities[each] : {},
            events: events[each] ? events[each] : {},
            actions: actions[each] ? actions[each] : {}
        });
    }
    /* gantt.unloadContent({
        key: "track 3",
        trackLabel: {
            display: "Project C"
        }
    }); */
};
export const renderGanttGraphAndLegendPaddingReduced = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.removeContainerPadding = true;
    data.legendPadding = {
        left: 2.5,
        right: 2.5,
        top: 2.5,
        bottom: 2.5
    };
    const ganttDefault = Carbon.api.gantt(data);
    loadTracks(ganttDefault, [], [], [], actions, 2);
    return ganttDefault;
};
