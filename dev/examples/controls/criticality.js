import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import {
    getAxes,
    getData
} from "../data";
import { shell } from "../helpers";
import {
    multiRegion,
    multiRegionAlt
} from "./pairedResult";

export const renderCriticalityLineSimple = (el, id, title) => () => {
    shell.render(el, id, title, "* A simple Line based graph. By default, criticality indicators are shown face-up");
    const lineTime = Carbon.api.graph(getAxes(`#${id}`, "LINE_TIMESERIES"));
    const data = utils.deepClone(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]);
    data.regions = [ {
        axis: "y",
        start: 2,
        end: 10
    } ];
    data.values[ 0 ].isCritical = true;
    data.values[ 10 ].isCritical = true;
    lineTime.loadContent(Carbon.api.line(data));
    return lineTime;
};
export const renderCriticalityMultiLine = (el, id, title) => () => {
    shell.render(el, id, title, "* Indicators appear when only when there is one line in the graph, otherwise hidden");
    const lineDefault = Carbon.api.graph(getAxes(`#${id}`, "LINE_DEFAULT"));
    const data = utils.deepClone(getData(`#${id}`, "LINE_DEFAULT").data[ 0 ]);
    data.values[ 0 ].isCritical = true;
    data.values[ 5 ].isCritical = true;
    data.values[ 10 ].isCritical = true;
    data.regions = [
        {
            start: 2
        }
    ];
    const dataAlt = utils.deepClone(getData(`#${id}`, "LINE_DEFAULT").data[ 2 ]);
    dataAlt.values[ 6 ].isCritical = true;
    dataAlt.values[ 11 ].isCritical = true;
    dataAlt.regions = [
        {
            start: 2,
            end: 14
        }
    ];
    lineDefault.loadContent(Carbon.api.line(data));
    lineDefault.loadContent(Carbon.api.line(dataAlt));
    lineDefault.loadContent(Carbon.api.line(getData(`#${id}`, "LINE_DEFAULT").data[ 4 ]));
    return lineDefault;
};
export const renderCriticalityPairedResultSimple = (el, id, title) => () => {
    shell.render(el, id, title, "* A simple Paired Result based graph. By default, criticality indicators are shown face-up");
    const pairedTime = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]);
    data.regions = {
        high: [
            {
                axis: "y",
                start: 120,
                end: 170,
                color: "#c8cacb"
            }
        ],
        low: [
            {
                axis: "y",
                start: 20,
                end: 100
            }
        ]
    };
    data.values[ 3 ].high.isCritical = true;
    data.values[ 3 ].mid.isCritical = true;
    data.values[ 3 ].low.isCritical = true;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    return pairedTime;
};
export const renderCriticalityMultiPairedResult = (el, id, title) => () => {
    shell.render(el, id, title, "* Indicators appear when only when there is one paired result data-type in the graph, otherwise hidden");
    const axisData = utils.deepClone(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    axisData.axis.y2.show = true;
    const pairedTime = Carbon.api.graph(axisData);
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]);
    const dataAlt = utils.deepClone(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 1 ]);
    data.regions = multiRegion;
    data.values[ 3 ].high.isCritical = true;
    data.values[ 3 ].mid.isCritical = true;
    data.values[ 0 ].low.isCritical = true;

    dataAlt.regions = multiRegionAlt;
    dataAlt.values[ 1 ].high.isCritical = true;
    dataAlt.values[ 1 ].mid.isCritical = true;
    dataAlt.values[ 1 ].low.isCritical = true;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    pairedTime.loadContent(Carbon.api.pairedResult(dataAlt));
    return pairedTime;
};
