import d3 from "d3";

export const loadPopup = (onCloseCB, key, index, value) => {
    const tip = document.querySelector("#tooltip");
    const getPairData = (value) => value ? (checkDate(value) ? new Date(value).toLocaleString() : value) : null;
    const checkDate = (date) => date instanceof Date;
    const clickHandler = () => {
        d3.select(tip)
          .attr("style", "display:none;")
          .selectAll("g")
          .remove();
        onCloseCB();
        d3.select("#overlay").remove();
        tip.removeEventListener("click", clickHandler);
        window.removeEventListener("resize", clickHandler);
    };
    // Remove old popup
    d3.select("#overlay").remove();
    d3.select(tip)
      .attr("style", "")
      .selectAll("g")
      .remove();

    // Add new popup
    d3.select("section")
      .insert("div", "#tooltip")
      .attr("id", "overlay")
      .classed("overlay", true)
      .on("click", clickHandler);
    const path = d3.select(tip)
                   .style("left", `${d3.event.pageX + 5}px`)
                   .style("top", `${d3.event.pageY + 5}px`);
    const createItem = (pair, label, value) => {
        const item = pair.append("g")
                         .classed("popup-item", true);
        item.append("label")
            .classed("popup-label", true)
            .text(label);
        item.append("g")
            .classed("popup-text", true)
            .text(value);
    };

    const pair = path.append("g");
    if (value.x) {
        // Line
        createItem(pair, "X axis", `${checkDate(value.x) ? new Date(value.x).toLocaleString() : value.x}`);
        createItem(pair, `${value.label.display}`, value.y);
    }
    else {
        // Paired Result
        createItem(pair, "X axis", `${value.high ? getPairData(value.high.x) : value.mid ? getPairData(value.mid.x) : value.low ? getPairData(value.low.x) : "N/A"}`);

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
