import Carbon from "../../../src/main/js/carbon";
import utils from "../../../src/main/js/helpers/utils";
import { getDemoData } from "../data";
import { CUSTOM_CONTAINER_LEGEND_STYLE } from "../helpers";

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
export const renderPieGraphAndLegendPaddingReduced = (id) => {
    const containerElement = document.querySelector(`#${id}`);
    containerElement.setAttribute(
        "class",
        `${containerElement.getAttribute(
            "class"
        )} ${CUSTOM_CONTAINER_LEGEND_STYLE}`
    );
    const pieGenerateData = utils.deepClone(
        getDemoData(`#graphContainer`, "PIE")
    );
    pieGenerateData.bindLegendTo = "#legendContainer";
    pieGenerateData.removeContainerPadding = true;
    pieGenerateData.legendPadding = {
        left: 2.5,
        right: 2.5,
        top: 2.5,
        bottom: 2.5
    };
    const pieDefault = Carbon.api.pie(pieGenerateData);
    pieDefault.loadContent(pieGenerateData.data);
    return pieDefault;
};
