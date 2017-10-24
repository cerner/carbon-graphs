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

export const renderPairedResultExample = (root) => {
    const sect = section.render(root);
    h2.render(sect, "Paired Result");
    div.render(sect, "graph-data-3", "carbon-graph", "");
    h2.render(sect, "Paired Result - Timeseries");
    div.render(sect, "graph-data-4", "carbon-graph", "");
    let pairedGraph = Carbon.api.graph(getAxes("#graph-data-3", "PAIRED_DEFAULT"));
    pairedGraph.loadContent(Carbon.api.pairedResult(getData("#graph-data-3", "PAIRED_DEFAULT").data[ 0 ]));

    pairedGraph = Carbon.api.graph(getAxes("#graph-data-4", "PAIRED_TIMESERIES"));
    pairedGraph.loadContent(Carbon.api.pairedResult(getData("#graph-data-4", "PAIRED_TIMESERIES").data[ 0 ]));
};
