import Carbon from "../../../../main/js/carbon";

export const LIBRARY_LIST = [
    "gantt",
    "graph",
    "line",
    "pairedResult",
    "timeline",
    "bar",
    "pie",
    "scatter",
    "bubble"
];
export const TOOLS_LIST = ["shape", "defaultSVGProps"];
export const nativeInput = {
    bindTo: "#testGraph_carbon",
    axis: {
        x: {
            label: "Some X Label",
            lowerLimit: 0,
            upperLimit: 100
        },
        y: {
            label: "Some Y Label",
            lowerLimit: 0,
            upperLimit: 20
        }
    }
};
export const pieInput = {
    bindTo: "#testPie_carbon",
    data: [
        {
            key: "uid_1",
            label: {
                display: "Apple"
            },
            color: Carbon.helpers.COLORS.BLUE,
            onClick: () => {},
            values: 100
        },
        {
            key: "uid_2",
            label: {
                display: "Orange"
            },
            color: Carbon.helpers.COLORS.GREEN,
            values: 50
        }
    ]
};
export const ganttInput = {
    bindTo: "#testGraph_carbon",
    axis: {
        x: {
            lowerLimit: "2016-01-01T12:00:00Z",
            upperLimit: "2017-01-01T12:00:00Z"
        }
    }
};
export const timelineInput = {
    bindTo: "#testGraph_carbon",
    axis: {
        x: {
            lowerLimit: "2016-01-01T12:00:00Z",
            upperLimit: "2017-01-01T12:00:00Z"
        }
    }
};
