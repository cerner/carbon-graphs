"use strict";
import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import { shell } from "../helpers";

export const renderGantt = (el, id, title) => () => {
    shell.render(el, id, title);
    const ganttDefault = Carbon.api.gantt(getDemoData(`#${id}`, "GANTT"));
    ganttDefault.loadContent({
        key: "track 1",
        trackLabel: {
            display: "Project A",
            onClick: (displayValue) => {
                console.log(displayValue);
            }
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
    setTimeout(() => {
        ganttDefault.loadContent({
            key: "track 2",
            trackLabel: {
                display: "Project B",
                onClick: (displayValue) => {
                    console.log(displayValue);
                }
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
    }, 1000);
    setTimeout(() => {
        ganttDefault.loadContent({
            key: "track 3",
            dimension: {
                trackHeight: 80
            },
            trackLabel: {
                display: "Project C",
                onClick: (displayValue) => {
                    console.log(displayValue);
                }
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
    }, 2000);
    setTimeout(() => {
        ganttDefault.loadContent({
            key: "track 4",
            dimension: {
                trackHeight: 100
            },
            trackLabel: {
                display: "Project D",
                onClick: (displayValue) => {
                    console.log(displayValue);
                }
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
    }, 3000);
    /*setTimeout(() => {
		ganttDefault.unloadContent({
			key: "track 3",
			trackLabel: {
				display: "Project C"
			}
		});
	}, 4000);*/
    return ganttDefault;
};
