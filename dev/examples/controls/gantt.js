"use strict";
import Carbon from "../../../src/main/js/carbon";
import { COLORS } from "../../../src/main/js/helpers/constants";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { shell } from "../helpers";
import { loadPopup, loadTaskPopup, loadTrackLabelPopup } from "../popup";

const daysToMilliseconds = (d) => 24 * 60 * 60 * 1000 * d;
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
        }
    ]
];
export const renderGantt = (el, id, title) => () => {
    shell.render(el, id, title);
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    const ganttDefault = Carbon.api.gantt(data);
    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Project A",
            onClick: loadTrackLabelPopup
        },
        tasks: tasks[0]
    });
    ganttDefault.loadContent({
        key: "track 2",
        trackLabel: {
            display: "Project B",
            onClick: loadTrackLabelPopup
        },
        tasks: tasks[1]
    });
    ganttDefault.loadContent({
        key: "track 3",
        trackLabel: {
            display: "Project C",
            onClick: loadTrackLabelPopup
        },
        tasks: tasks[2]
    });
    ganttDefault.loadContent({
        key: "track 4",
        trackLabel: {
            display: "Project D",
            onClick: loadTrackLabelPopup
        },
        tasks: tasks[3]
    });
    /*ganttDefault.unloadContent({
        key: "track 3",
        trackLabel: {
            display: "Project C"
        }
    });*/
    return ganttDefault;
};
export const renderGanttPercentage = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Gantt chart with a task showing progress in terms of percentage."
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = {};
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
export const renderGanttAction = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Gantt chart showing actions/milestones that can occur within a project."
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.dateline = {};
    const ganttDefault = Carbon.api.gantt(data);
    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Day 1",
            onClick: loadTrackLabelPopup
        },
        actions: [
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
        ]
    });
    ganttDefault.loadContent({
        key: "track 2",
        trackLabel: {
            display: "Day 2",
            onClick: loadTrackLabelPopup
        },
        actions: [
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
    });
    return ganttDefault;
};
export const renderGanttTruncate = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Gantt chart with truncated track label; information shown on click of the label."
    );
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = {};
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
export const renderGanttStyle = (el, id, title) => () => {
    shell.render(el, id, title);
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.showActionLegend = false;
    data.dateline = {};
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
    return ganttDefault;
};
