import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import { shell } from "../helpers";

export const renderSplineLine = (el, id, title) => () => {
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(
        getDemoData(`#${id}`, "LINE_TIMESERIES")
    );
    lineDefault.loadContent(
        Carbon.api.line(
            Object.assign(
                {
                    type: Carbon.helpers.LINE_TYPE.SPLINE
                },
                getDemoData(`#${id}`, "LINE_TIMESERIES").data[0]
            )
        )
    );
    return lineDefault;
};
