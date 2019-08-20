import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";

export const renderCombinationSimple = (id) => {
    const combGraph = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT")
    );
    combGraph.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[0])
    );
    combGraph.loadContent(
        Carbon.api.pairedResult(
            getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[1]
        )
    );
    return combGraph;
};
export const renderCombinationRegion = (id) => {
    const lineData = getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[0];
    lineData.regions = [
        {
            axis: "y",
            start: 6,
            end: 18
        }
    ];
    const pairedData = getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[1];
    pairedData.regions = {
        high: [
            {
                axis: "y2",
                start: 120,
                end: 180,
                color: "#c8cacb"
            }
        ],
        low: [
            {
                axis: "y2",
                start: 20,
                end: 80
            }
        ]
    };
    const combGraph = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT")
    );
    combGraph.loadContent(Carbon.api.pairedResult(pairedData));
    combGraph.loadContent(Carbon.api.line(lineData));
    return combGraph;
};
export const renderCombinationBar = (id) => {
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = {
        values: [1, 2, 3, 4, 5, 6, 7],
        format: ".0f"
    };
    axisData.showVGrid = false;
    axisData.axis.y2.show = true;
    axisData.axis.y2.padDomain = false;
    const barTest = Carbon.api.graph(axisData);
    barTest.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    barTest.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "BAR_DEFAULT").data[6])
    );
    return barTest;
};

export const combinationRegionInput = (id) => ({
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
            label: "Line Paired Combo",
            lowerLimit: 0,
            upperLimit: 20
        }
    }
});

export const renderCombinationIdenticalDatasetRegion = (id) => {
    const lineData = getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[0];
    lineData.regions = [
        {
            axis: "y",
            start: 6,
            end: 100
        }
    ];
    const pairedData = getDemoData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[2];
    pairedData.regions = {
        high: [
            {
                axis: "y",
                start: 6,
                end: 100
            }
        ],
        low: [
            {
                axis: "y",
                start: 6,
                end: 100
            }
        ],
        mid: [
            {
                axis: "y",
                start: 6,
                end: 100
            }
        ]
    };
    const combGraph = Carbon.api.graph(combinationRegionInput(`#${id}`));
    combGraph.loadContent(Carbon.api.line(lineData));
    combGraph.loadContent(Carbon.api.pairedResult(pairedData));
    return combGraph;
};
