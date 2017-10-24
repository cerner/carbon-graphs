export const header = {
    render: (el, content) => {
        el.appendChild(document.createElement("header")).innerHTML = content;
    }
};
export const section = {
    render: (el) => el.appendChild(document.createElement("section"))
};
export const div = {
    render: (el, id, cls, style) => {
        const elem = el.appendChild(document.createElement("div"));
        elem.id = id;
        elem.setAttribute("class", cls);
        elem.setAttribute("style", style);
    }
};
export const vector = {
    render: (el, id, vb) => {
        const elem = el.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        elem.id = id;
        elem.setAttribute("viewBox", vb);
    }
};
export const h2 = {
    render: (el, content) => {
        el.appendChild(document.createElement("h2")).innerHTML = content;
    }
};
export const h3 = {
    render: (el, content) => {
        el.appendChild(document.createElement("h3")).innerHTML = content;
    }
};
export const showHideButton = {
    render: (el, content, callback) => {
        const elem = document.createElement("button");
        el.appendChild(elem).innerHTML = content;
        elem.addEventListener("click", callback);
    }
};
