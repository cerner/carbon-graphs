import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import {
    getAxes,
    getData
} from "../data";
import { shell } from "../helpers";

export const renderCriticalityLineSimple = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineTime = Carbon.api.graph(getAxes(`#${id}`, "LINE_TIMESERIES"));
    const data = utils.deepClone(getData(`#${id}`, "LINE_TIMESERIES").data[ 0 ]);
    data.values[ 0 ].isCritical = true;
    data.values[ 10 ].isCritical = true;
    lineTime.loadContent(Carbon.api.line(data));
    return lineTime;
};
export const renderCriticalityPairedResultSimple = (el, id, title) => () => {
    shell.render(el, id, title);
    const pairedTime = Carbon.api.graph(getAxes(`#${id}`, "PAIRED_TIMESERIES"));
    const data = utils.deepClone(getData(`#${id}`, "PAIRED_TIMESERIES").data[ 0 ]);
    data.values[ 3 ].high.isCritical = true;
    data.values[ 3 ].mid.isCritical = true;
    data.values[ 3 ].low.isCritical = true;
    pairedTime.loadContent(Carbon.api.pairedResult(data));
    return pairedTime;
};
