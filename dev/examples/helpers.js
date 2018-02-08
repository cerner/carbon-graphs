import utils from "../../src/main/js/helpers/utils";

const init = (instance) => {
    instance.instanceList = [];
    instance.exampleSet = [];
};

export class ExampleControl {
    constructor() {
        init(this);
    }

    load(fn) {
        this.exampleSet.push(fn);
        return this;
    }

    render() {
        Promise.all(this.exampleSet.map((fn) => new Promise((resolve) => {
                   resolve(fn);
               })))
               .then((fn) => fn.map((i) => this.instanceList.push(i())));
        return this;
    }

    destruct() {
        this.instanceList.map((fn) => fn.destroy());
        init(this);
        return this;
    }
}

export const clearContent = (target, instance) => {
    target.innerHTML = "";
    if (utils.notEmpty(instance)) {
        instance.destruct();
    }
};
export const toggleSectionAsActive = (target) => {
    const parentElement = target.parentElement;
    Array.from(parentElement.querySelectorAll(".carbon-btn"))
         .forEach((i) => i.removeAttribute("disabled"));
    target.setAttribute("disabled", "disabled");
};
export const header = {
    render: (el, content) => {
        const elem = el.appendChild(document.createElement("h1"));
        elem.innerHTML = content;
        elem.setAttribute("class", "graph-banner");
    }
};
export const section = {
    render: (el, cls = "") => {
        const elem = el.appendChild(document.createElement("div"));
        elem.setAttribute("class", `graph-section ${cls}`);
        return elem;
    }
};
export const div = {
    render: (el, id, cls = "", style = "") => {
        const elem = el.appendChild(document.createElement("div"));
        elem.id = id;
        elem.setAttribute("class", cls);
        elem.setAttribute("style", style);
        return elem;
    }
};
export const vector = {
    render: (el, id, vb) => {
        const elem = el.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        elem.id = id;
        elem.setAttribute("viewBox", vb);
        return elem;
    }
};
export const h2 = {
    render: (el, content) => {
        const elem = el.appendChild(document.createElement("h2"));
        elem.innerHTML = content;
        elem.setAttribute("class", "graph-header");
        return elem;
    }
};
export const paragraph = {
    render: (el, content) => {
        const elem = el.appendChild(document.createElement("p"));
        elem.setAttribute("class", "graph-subHeader");
        elem.innerHTML = content;
        return elem;
    }
};
export const btn = {
    render: (el, display, contentCallback) => {
        const elem = document.createElement("button");
        elem.setAttribute("class", "carbon-btn");
        el.appendChild(elem).innerHTML = display;
        elem.addEventListener("click", contentCallback);
    }
};
export const shell = {
    render: (el, id, title, supportingTitle = "") => {
        const sect = section.render(el);
        h2.render(sect, title);
        supportingTitle ? paragraph.render(sect, supportingTitle) : "";
        div.render(sect, id, "carbon-graph");
        return sect;
    }
};
export const small = {
    render: (el, display) => {
        const elem = document.createElement("small");
        el.appendChild(elem).innerHTML = display;
        return elem;
    }
};
export const renderRoot = (el) => {
    header.render(el, "Carbon");

};
export const renderTooltip = (el) => {
    div.render(el, "tooltip", "tooltip", "display: none;");
};
export const renderRootSection = (el) => {
    const rootSection = div.render(el, "rootContent", "root-content");
    section.render(rootSection, "nav-section");
    section.render(rootSection, "content-section");
};
