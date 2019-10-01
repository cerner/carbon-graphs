"use strict";
import Carbon from "../../../src/main/js/carbon";
import { COLORS } from "../../../src/main/js/helpers/constants";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import {
    loadPopup,
    loadTaskPopup,
    loadTrackLabelPopup,
    loadTrackPopup
} from "../popup";
import { createPanningControls } from "./panHelpers";

const daysToMilliseconds = (d) => 24 * 60 * 60 * 1000 * d;
const caretUp = {
    path: {
        id: "caretUp",
        d: "M0,36l24-24l24,24H0z"
    },
    options: {
        x: -7,
        y: -7,
        scale: 0.3
    }
};
const caretDown = {
    path: {
        id: "caretDown",
        d: "M48,12L24,36L0,12H48z"
    },
    options: {
        x: -7.5,
        y: -7,
        scale: 0.3
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
    ]
];
const events = [
    [
        {
            key: "uid_event_1",
            label: {
                display: "Defect A"
            },
            shape: caretUp,
            values: [new Date(2018, 4, 30).toISOString()]
        },
        {
            key: "uid_event_2",
            label: {
                display: "Defect B"
            },
            shape: caretDown,
            color: Carbon.helpers.COLORS.GREEN,
            values: [new Date(2018, 5, 4).toISOString()]
        },
        {
            key: "uid_event_3",
            label: {
                display: "Defect C"
            },
            onClick: loadPopup,
            shape: caretDown,
            color: Carbon.helpers.COLORS.GREEN,
            values: [new Date(2018, 9, 5).toISOString()]
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
            values: [new Date(2018, 7, 1, 6, 15).toISOString()]
        }
    ]
];
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
export const renderGanttPercentage = (id) => {
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = [];
    const ganttDefault = Carbon.api.gantt(data);

    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Percentage",
            onClick: loadTrackLabelPopup
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
    let graph;
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
            color: Carbon.helpers.COLORS.GREEN,
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
            onClick: loadTrackLabelPopup
        },
        tasks: tasks2[0]
    };
    const createGraph = (axis, values) => {
        if (graph) {
            graph.destroy();
        }
        graph = Carbon.api.gantt(axis);
        graph.loadContent(values);
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
                "Really really long project name that cannot be shown realistically",
            onClick: loadTrackLabelPopup
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
            onClick: loadTrackLabelPopup
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
            onClick: loadTrackLabelPopup
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
            display: "Dotted, Hollow",
            onClick: loadTrackLabelPopup
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
            onClick: loadTrackLabelPopup
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
            onClick: loadTrackLabelPopup
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
            onClick: loadTrackLabelPopup
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
            display: "Activity Hashed",
            onClick: loadTrackLabelPopup
        },
        activities: [
            {
                key: "Hash",
                label: {
                    display: "Story Apex Activity hash"
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
        key: "track 7",
        trackLabel: {
            display: "Activity and Task",
            onClick: loadTrackLabelPopup
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
            onClick: loadTrackLabelPopup
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
export const renderGanttCustomPadding = (id) => {
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
            color: "#D3D4D5",
            shape: Carbon.helpers.SHAPES.TRIANGLE,
            value: new Date(2018, 2, 10).toISOString()
        },
        {
            showDatelineIndicator: true,
            label: {
                display: "Current Date"
            },
            color: "#FFDF00",
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
                shape: caretUp,
                values: [new Date(2018, 4, 30).toISOString()]
            },
            {
                key: "uid_event_2",
                label: {
                    display: "Defect B"
                },
                shape: caretDown,
                color: Carbon.helpers.COLORS.GREEN,
                values: [new Date(2018, 5, 4).toISOString()]
            },
            {
                key: "uid_event_3",
                label: {
                    display: "Defect C"
                },
                shape: caretDown,
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
 * @param {Array} actions - gannt actions that needs to be loaded
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
                onClick: loadTrackLabelPopup
            },
            tasks: tasks[each] ? tasks[each] : {},
            activities: activities[each] ? activities[each] : {},
            events: events[each] ? events[each] : {},
            actions: actions[each] ? actions[each] : {}
        });
    }
    /*gantt.unloadContent({
        key: "track 3",
        trackLabel: {
            display: "Project C"
        }
    });*/
};
