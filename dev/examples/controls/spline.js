import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";

export const renderSplineLine = (id) => {
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
