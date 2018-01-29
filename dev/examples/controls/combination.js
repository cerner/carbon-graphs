import Carbon from "../../../src/main/js/carbon";
import {
    getAxes,
    getData
} from "../data";
import { shell } from "../helpers";

export const renderCombinationSimple = (el, id, title) => () => {
    shell.render(el, id, title);
    const combGraph = Carbon.api.graph(getAxes(`#${id}`, "LINE_PAIR_COMB_DEFAULT"));
    combGraph.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[ 0 ]));
    combGraph.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[ 1 ]));
    return combGraph;
};
export const renderCombinationRegion = (el, id, title) => () => {
    shell.render(el, id, title,
        "* A Combination graph containing Line and Paired Result. Regions are provided for Line data set, " +
        "High and Low data types for Paired Result. " +
        "By default, region is hidden unless hovered upon in the legend.");
    const lineData = getData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[ 0 ];
    lineData.regions = [
        {
            axis: "y",
            start: 6,
            end: 18
        }
    ];
    const pairedData = getData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[ 1 ];
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
    const combGraph = Carbon.api.graph(getAxes(`#${id}`, "LINE_PAIR_COMB_DEFAULT"));
    combGraph.loadContent(Carbon.api.line(lineData));
    combGraph.loadContent(Carbon.api.pairedResult(pairedData));
    return combGraph;
};
