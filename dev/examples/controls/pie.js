import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import { shell } from "../helpers";

export const renderPieSimple = (el, id, title) => () => {
    shell.render(el, id, title, "* A C3 Pie chart with a single data set. ");
    return Carbon.api.pie(getDemoData(`#${id}`, "PIE"));
};
export const renderPieMultiple = (el, id, title) => () => {
    shell.render(el, id, title, "* A C3 Pie chart with multiple data sets. ");
    const pieChart = Carbon.api.pie(getDemoData(`#${id}`, "PIE"));
    pieChart.loadContent({
        key: "uid_2",
        label: {
            display: "Green Apple"
        },
        color: Carbon.helpers.COLORS.GREEN,
        values: [400]
    });
    return pieChart;
};
export const renderPieUnload = (el, id, title) => () => {
    shell.render(
        el,
        id,
        title,
        "* A C3 Pie chart with data sets removed at regular intervals. "
    );
    let pieChart = null;
    const runAtInterval = () => {
        document.querySelector(`#${id}`).innerHTML = "";
        document
            .querySelector(`#${id}`)
            .parentNode.setAttribute("style", "height: 400px;");
        pieChart = Carbon.api.pie(getDemoData(`#${id}`, "PIE"));
        setTimeout(
            () =>
                pieChart.loadContent({
                    key: "uid_2",
                    label: {
                        display: "Orange"
                    },
                    color: Carbon.helpers.COLORS.ORANGE,
                    values: [50, 25]
                }),
            1000
        );
        setTimeout(
            () =>
                pieChart.loadContent({
                    key: "uid_3",
                    label: { display: "Grape" },
                    color: Carbon.helpers.COLORS.PURPLE,
                    values: [60]
                }),
            2000
        );
        setTimeout(
            () =>
                pieChart.unloadContent({
                    key: "uid_2"
                }),
            3500
        );
        setTimeout(
            () =>
                pieChart.unloadContent({
                    key: "uid_1"
                }),
            5000
        );
    };
    runAtInterval();
    setInterval(runAtInterval, 7000);
    return pieChart;
};
