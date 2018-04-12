"use strict";
import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { shell } from "../helpers";
import { loadPopup, loadTrackLabelPopup } from "../popup";

export const renderGantt = (el, id, title) => () => {
    shell.render(el, id, title);
    const data = utils.deepClone(getDemoData(`#${id}`, "GANTT"));
    data.actionLegend = [];
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
                label: {
                    display: "Story A"
                },
                startDate: new Date(2018, 1, 1).toISOString(),
                endDate: new Date(2018, 1, 10).toISOString()
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 2",
        trackLabel: {
            display: "Project B",
            onClick: loadTrackLabelPopup
        },
        tasks: [
            {
                key: "task1",
                label: {
                    display: "Story A"
                },
                startDate: new Date(2018, 1, 1).toISOString(),
                endDate: new Date(2018, 1, 10).toISOString()
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 3",
        dimension: {
            trackHeight: 80
        },
        trackLabel: {
            display: "Project C",
            onClick: loadTrackLabelPopup
        },
        tasks: [
            {
                key: "task1",
                label: {
                    display: "Story A"
                },
                startDate: new Date(2018, 1, 1).toISOString(),
                endDate: new Date(2018, 1, 10).toISOString()
            }
        ]
    });
    ganttDefault.loadContent({
        key: "track 4",
        dimension: {
            trackHeight: 100
        },
        trackLabel: {
            display: "Project D",
            onClick: loadTrackLabelPopup
        },
        tasks: [
            {
                key: "task1",
                label: {
                    display: "Story A"
                },
                startDate: new Date(2018, 1, 1).toISOString(),
                endDate: new Date(2018, 1, 10).toISOString()
            }
        ]
    });
    /*ganttDefault.unloadContent({
        key: "track 3",
        trackLabel: {
            display: "Project C"
        }
    });*/
    return ganttDefault;
};

export const renderGanttAction = (el, id, title) => () => {
    shell.render(el, id, title);
    const ganttDefault = Carbon.api.gantt(getDemoData(`#${id}`, "GANTT"));

    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Project A",
            onClick: loadTrackLabelPopup
        },
        tasks: [],
        actions: [
            {
                key: "uid_action_1",
                onClick: loadPopup,
                values: [
                    new Date(2018, 2, 1, 6, 15).toISOString(),
                    new Date(2018, 3, 1, 6, 15).toISOString(),
                    new Date(2018, 4, 1, 6, 15).toISOString()
                ]
            },
            {
                key: "uid_action_2",
                onClick: loadPopup,
                values: [new Date(2018, 6, 1, 6, 15).toISOString()]
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
    const ganttDefault = Carbon.api.gantt(data);

    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display:
                "Really really long project name that cannot be shown realistically",
            onClick: loadTrackLabelPopup
        },
        tasks: []
    });
    return ganttDefault;
};
