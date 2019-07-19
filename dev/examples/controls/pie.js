import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";

export const renderPieSimple = (id) => {
    const pieDefault = Carbon.api.pie(getDemoData(`#${id}`, "PIE"));
    pieDefault.loadContent(getDemoData(`#${id}`, "PIE").data);
};
export const renderPieLegendTo = () => {
    const pieGenerateData = utils.deepClone(
        getDemoData(`#graphContainer`, "PIE")
    );
    pieGenerateData.bindLegendTo = "#legendContainer";
    const pieDefault = Carbon.api.pie(pieGenerateData);
    pieDefault.loadContent(pieGenerateData.data);
    return pieDefault;
};
