import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { shell } from "../helpers";
export const renderSplineLine = (el, id, title) => () => {
    const data = Object.assign(
        {
            type: Carbon.helpers.LINE_TYPE.SPLINE
        },
        getDemoData(`#${id}`, "LINE_DEFAULT").data[5]
    );
    shell.render(el, id, title);
    const lineDefault = Carbon.api.graph(getDemoData(`#${id}`, "LINE_DEFAULT"));
    lineDefault.loadContent(Carbon.api.line(data));
    return lineDefault;
};
