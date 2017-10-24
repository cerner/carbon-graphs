import Carbon from "../../../src/main/js/carbon";
import {
    getAxes,
    getData
} from "../data";
import {
    div,
    h2,
    section
} from "../helpers";

export const renderCombinationExample = (root) => {
    const sect = section.render(root);
    h2.render(sect, "Combination chart");
    div.render(sect, "graph-data-5", "carbon-graph", "");
    const combGraph = Carbon.api.graph(getAxes("#graph-data-5", "LINE_PAIR_COMB_DEFAULT"));
    combGraph.loadContent(Carbon.api.line(getData("#graph-data-5", "LINE_PAIR_COMB_DEFAULT").data[ 0 ]));
    combGraph.loadContent(Carbon.api.pairedResult(getData("#graph-data-5", "LINE_PAIR_COMB_DEFAULT").data[ 1 ]));
};

