import Carbon from "../../../main/js/carbon";

export const LIBRARY_LIST = ["graph", "line", "pairedResult"];
export const TOOLS_LIST = ["shape"];
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
            onClick: (d, i) => {},
            values: [100, 100]
        },
        {
            key: "uid_2",
            label: {
                display: "Orange"
            },
            color: Carbon.helpers.COLORS.GREEN,
            values: [50, 25]
        }
    ]
};
