import "babel-polyfill";
import "../src/main/less/carbon.less";
import "./demo.less";
import {
    DEFAULT_HOME_CONTENT,
    DEFAULT_HOME_CONTENT_ID,
    DICTIONARY,
    registerExamples
} from "./examples/contentDictionary";
import {
    contentSectionClass,
    getEventTarget,
    getWindowHref,
    navSectionClass,
    renderRoot,
    renderRootSection,
    renderTooltip
} from "./examples/helpers";

export default class Root {
    constructor() {
        this.root = document.querySelector("#root");
        this.state = {
            currentSection: null
        };
    }

    setCurrentSection(val) {
        this.state.currentSection = val;
    }

    getCurrentSection() {
        return this.state.currentSection;
    }

    renderContainer() {
        renderRoot(this.root);
        renderTooltip(this.root);
        renderRootSection(this.root);

        registerExamples(
            this.root.querySelector(`.${navSectionClass}`),
            this.root.querySelector(`.${contentSectionClass}`),
            this.setCurrentSection.bind(this),
            this.getCurrentSection.bind(this)
        );
        return this;
    }

    renderContent() {
        const contentId = getWindowHref() || DEFAULT_HOME_CONTENT_ID;
        const contentExample = DICTIONARY[contentId] || DEFAULT_HOME_CONTENT;
        contentExample.triggerFunction(
            new contentExample.Instance(),
            this.root.querySelector(`.${contentSectionClass}`),
            this.setCurrentSection.bind(this),
            this.getCurrentSection.bind(this)
        )(getEventTarget(contentId));
        return this;
    }
}
