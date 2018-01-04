import Carbon from "../../../src/main/js/carbon";
import {
    getAxes,
    getData
} from "../data";
import { shell } from "../helpers";

export const renderCombinationExample = (el, id, title) => () => {
    shell.render(el, id, title);
    const combGraph = Carbon.api.graph(getAxes(`#${id}`, "LINE_PAIR_COMB_DEFAULT"));
    combGraph.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[ 0 ]));
    combGraph.loadContent(Carbon.api.pairedResult(getData(`#${id}`, "LINE_PAIR_COMB_DEFAULT").data[ 1 ]));
    return combGraph;
};
