import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { shell } from "../helpers";

export const renderCombinationSimple = (el, id, title) => () => {
    shell.render(el, id, title);
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
export const renderCombinationRegion = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A Combination graph containing Line and Paired Result. Regions are provided for Line data set, " +
            "High and Low data types for Paired Result. " +
            "By default, region is hidden unless hovered upon in the legend."
    );
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
    combGraph.loadContent(Carbon.api.line(lineData));
    combGraph.loadContent(Carbon.api.pairedResult(pairedData));
    return combGraph;
};
export const renderCombinationBar = (el, id, title) => () => {
    shell.render(el, id, title);
    const axisData = utils.deepClone(getDemoData(`#${id}`, "BAR_DEFAULT"));
    axisData.axis.x.ticks = {
        values: [1, 2, 3, 4, 5, 6, 7],
        format: ".0f"
    };
    axisData.showVGrid = false;
    axisData.axis.y2.show = true;
    const barTest = Carbon.api.graph(axisData);
    barTest.loadContent(
        Carbon.api.bar(getDemoData(`#${id}`, "BAR_DEFAULT").data[0])
    );
    barTest.loadContent(
        Carbon.api.line(getDemoData(`#${id}`, "BAR_DEFAULT").data[6])
    );
    return barTest;
};
