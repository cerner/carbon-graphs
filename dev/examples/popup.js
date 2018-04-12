import d3 from "d3";
import utils from "../../src/main/js/helpers/utils";

const renderPopup = (fn) => {
    const tip = document.querySelector("#tooltip");
    const clickHandler = () => {
        d3
            .select(tip)
            .attr("style", "display:none;")
            .selectAll("g")
            .remove();
        if (utils.isFunction(fn)) {
            fn();
        }
        d3.select("#overlay").remove();
        tip.removeEventListener("click", clickHandler);
        window.removeEventListener("resize", clickHandler);
    };
    // Add new popup
    d3
        .select(".root-content")
        .append("div", "#tooltip")
        .attr("id", "overlay")
        .classed("overlay", true)
        .on("click", clickHandler);
    // Position popup
    return d3
        .select("#tooltip")
        .style("left", `${d3.event.pageX + 5}px`)
        .style("top", `${d3.event.pageY + 5}px`);
};
const removeOldPopup = () => {
    // Remove old popup
    d3.select("#overlay").remove();
    d3
        .select("#tooltip")
        .attr("style", "")
        .selectAll("g")
        .remove();
};
export const loadPopup = (onCloseCB, key, index, value) => {
    const getPairData = (value) =>
        value
            ? checkDate(value)
                ? new Date(value).toLocaleString()
                : value
            : null;
    const checkDate = (date) => date instanceof Date;
    const createItem = (pair, label, value) => {
        const item = pair.append("g").classed("popup-item", true);
        item
            .append("label")
            .classed("popup-label", true)
            .text(label);
        item
            .append("g")
            .classed("popup-text", true)
            .text(value);
    };

    removeOldPopup();

    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    if (value.x) {
        // Line
        createItem(
            pair,
            "X axis",
            `${
                checkDate(value.x)
                    ? new Date(value.x).toLocaleString()
                    : value.x
            }`
        );
        createItem(pair, `${value.label.display}`, value.y);
    } else {
        // Paired Result
        createItem(
            pair,
            "X axis",
            `${
                value.high
                    ? getPairData(value.high.x)
                    : value.mid
                        ? getPairData(value.mid.x)
                        : value.low
                            ? getPairData(value.low.x)
                            : "N/A"
            }`
        );

        if (value.high) {
            createItem(pair, "High", getPairData(value.high.y));
        }
        if (value.mid) {
            createItem(pair, "Mid", getPairData(value.mid.y));
        }
        if (value.low) {
            createItem(pair, "Low", getPairData(value.low.y));
        }
    }
};
export const loadTrackLabelPopup = (d) => {
    removeOldPopup();
    const path = renderPopup();
    path
        .append("g")
        .append("g")
        .classed("popup-item", true)
        .append("g")
        .classed("popup-text", true)
        .text(d);
};
