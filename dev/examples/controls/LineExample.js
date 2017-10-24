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

export const renderLineExample = (root) => {
    const sect = section.render(root);
    h2.render(sect, "Line");
    div.render(sect, "graph-data-1", "carbon-graph", "");
    h2.render(sect, "Line - Timeseries");
    div.render(sect, "graph-data-2", "carbon-graph", "");

    const lineDefault = Carbon.api.graph(getAxes("#graph-data-1", "LINE_DEFAULT"));
    lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 0 ]));
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 1 ]))
        , 1000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 2 ]))
        , 2000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 3 ]))
        , 3000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 4 ]))
        , 4000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 5 ]))
        , 5000);
    setTimeout(() =>
            lineDefault.loadContent(Carbon.api.line(getData("#graph-data-1", "LINE_DEFAULT").data[ 6 ]))
        , 6000);
    const lineTime = Carbon.api.graph(getAxes("#graph-data-2", "LINE_TIMESERIES"));
    lineTime.loadContent(Carbon.api.line(getData("#graph-data-2", "LINE_TIMESERIES").data[ 0 ]));
};

