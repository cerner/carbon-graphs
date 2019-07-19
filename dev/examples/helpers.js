export const createElementLegendBindTo = (id) => {
    const parentContainerElem = document.querySelector(`#${id}`);
    const container = document.createElement("div");
    container.setAttribute("class", "bindto-container");
    // Prepare legend container
    const legendContainer = document.createElement("div");
    const graphContainer = document.createElement("div");
    legendContainer.setAttribute("id", "legendContainer");
    legendContainer.setAttribute("class", "legend-bindto-container");
    //Prepare graph container
    graphContainer.setAttribute("id", "graphContainer");
    graphContainer.setAttribute("class", "legend-bindto-graph-container");
    container.appendChild(legendContainer);
    container.appendChild(graphContainer);

    parentContainerElem.appendChild(container);
};
export const vector = {
    render: (el, id, vb = "", style = "") => {
        const elem = el.appendChild(
            document.createElementNS("http://www.w3.org/2000/svg", "svg")
        );
        elem.id = id;
        elem.setAttribute("style", style);
        vb ? elem.setAttribute("viewBox", vb) : "";
        return elem;
    }
};
export const h3 = {
    render: (el, content) => {
        const elem = el.appendChild(document.createElement("h3"));
        elem.innerHTML = content;
        elem.setAttribute("class", "graph-header");
        return elem;
    }
};
