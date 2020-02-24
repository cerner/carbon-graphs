/* eslint-disable */
import d3 from "d3";
import constants from "../../src/main/js/helpers/constants";
import utils from "../../src/main/js/helpers/utils";

const getDate = (d) => new Date(d).toLocaleString();
const getPairData = (value) =>
    value ? (checkDate(value) ? getDate(value) : value) : null;
const checkDate = (date) => date instanceof Date;
const createItem = (pair, label, value) => {
    const item = pair.append("g").classed("popup-item", true);
    item.append("label")
        .classed("popup-label", true)
        .text(label);
    item.append("g")
        .classed("popup-text", true)
        .text(value);
};
const createTrackItem = (pair, label, items) => {
    const item = pair.append("g").classed("popup-item", true);
    item.append("label")
        .classed("popup-label", true)
        .text(label);
    const section = item.append("g").classed("section", true);
    for (const value of Object.values(items)) {
        const content = section.append("g").classed("content", true);
        Object.entries(value).forEach(([subLabel, subItem]) => {
            const subContent = content.append("g").classed("popup-item", true);
            subContent
                .append("label")
                .classed("popup-label", true)
                .text(
                    subLabel
                        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                        .replace(/(\b[a-z](?!\s))/g, (x) => x.toUpperCase())
                );
            subContent
                .append("g")
                .classed("popup-text", true)
                .text(subItem);
        });
    }
};
const renderPopup = (fn) => {
    const tip = document.querySelector("#tooltip");
    const clickHandler = () => {
        d3.select(tip)
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
    d3.select("body")
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
    d3.select("#tooltip")
        .attr("style", "")
        .selectAll("g")
        .remove();
};
export const loadPopup = (onCloseCB, key, index, value) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    if (value.x) {
        // Line
        createItem(
            pair,
            "X axis",
            `${checkDate(value.x) ? getDate(value.x) : value.x}`
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
export const loadBubblePopup = (onCloseCB, key, index, value) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    if (value.x) {
        // Line
        createItem(
            pair,
            "X axis",
            `${checkDate(value.x) ? getDate(value.x) : value.x}`
        );
        createItem(pair, `year`, value.y);
    }
    if (value.weight) {
        createItem(pair, `${value.label.display}`, `${value.weight}`);
    }
};
export const loadBarPopup = (onCloseCB, key, index, values) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    values.forEach((value) =>
        createItem(pair, `${value.label.display}`, `${value.y}`)
    );
};
export const loadTextLabelPopup = (onCloseCB, value, index) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path
        .append("g")
        .classed("popup-item", true)
        .append("g")
        .attr("style", `display: inline-block;`);
    if (utils.notEmpty(value.shape)) {
        pair.append("svg")
            .attr("width", "15")
            .attr("height", "12")
            .append("path")
            .attr(
                "transform",
                `translate(${0}, ${0}) scale(${value.shape.options.scale})`
            )
            .attr("d", value.shape.path.d)
            .attr("fill", value.shape.path.fill || constants.DEFAULT_COLOR)
            .attr("id", value.shape.path.id);
    }
    if (value.label.display) {
        pair.append("text")
            .classed("popup-text", true)
            .attr("style", `color: ${value.color};`)
            .text(`${value.label.display}`);
    }
    if (value.label.secondaryDisplay) {
        pair.append("tspan")
            .attr("style", `color: ${constants.DEFAULT_COLOR};`)
            .text(` ${value.label.secondaryDisplay}`);
    }
};
export const loadTrackLabelPopup = (d) => {
    removeOldPopup();
    const path = renderPopup();
    path.append("g")
        .append("g")
        .classed("popup-item", true)
        .append("g")
        .classed("popup-text", true)
        .text(d);
};
export const loadTrackPopup = (onCloseCB, key, value) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    if (value.tasks && value.tasks.length > 0) {
        const tasks = [];
        value.tasks.forEach((task) => {
            tasks.push({
                name: task.key,
                startDate: task.startDate,
                endDate: task.endDate
            });
        });
        createTrackItem(pair, "Tasks", tasks);
    }
    if (value.activities && value.activities.length > 0) {
        const activities = [];
        value.activities.forEach((activity) => {
            activities.push({
                name: activity.key,
                startDate: activity.startDate,
                endDate: activity.endDate
            });
        });
        createTrackItem(pair, "Activities", activities);
    }
    if (value.events && value.events.length > 0) {
        const events = [];
        value.events.forEach((event) => {
            events.push({
                name: event.key,
                values: event.values.join(", ")
            });
        });
        createTrackItem(pair, "Events", events);
    }
    if (value.actions && value.actions.length > 0) {
        const actions = [];
        value.actions.forEach((action) => {
            actions.push({
                name: action.key,
                values: action.values.join(", ")
            });
        });
        createTrackItem(pair, "Actions", actions);
    }
};
export const loadTaskPopup = (onCloseCB, key, index, value) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    if (value.label) {
        createItem(pair, "Task Name", value.label.display);
    }
    createItem(pair, "Track", value.y);
    createItem(pair, "Start Date", getDate(value.startDate));
    createItem(pair, "End Date", getDate(value.endDate));
    if (value.percentage) {
        createItem(pair, "Percentage", value.percentage);
    }
};
export const loadDatelinePopup = (onCloseCB, payload) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    if (payload.label) {
        createItem(pair, "Milestone", payload.label.display);
    }
    createItem(pair, "Date", getDate(payload.value));
};
export const loadTimelinePopup = (onCloseCB, key, index, value) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    createItem(
        pair,
        "X axis",
        `${checkDate(value.x) ? getDate(value.x) : value.x}`
    );
    createItem(pair, `${value.label.display}`, value.content);
};
export const loadPiePopup = (onCloseCB, key, index, val) => {
    removeOldPopup();
    const path = renderPopup(onCloseCB);
    const pair = path.append("g");
    createItem(pair, val.label.display, val.value);
};
