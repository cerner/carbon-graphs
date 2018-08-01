import BaseConfig from "../../core/BaseConfig";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Processes the input and converts it to a JSON that c3 understands
 * @private
 * @param {Object} config - Cloned input JSON
 * @returns {Object} JSON compatible with c3 generate
 */
export const processInput = (config) => ({
    bindto: config.bindTo,
    pie: config.pie,
    size: config.dimension,
    tooltip: {
        show: false
    },
    data: {
        columns: config.data.map((i) => [i.label.display, ...i.values]),
        type: "pie",
        onclick: config.data[0].onClick,
        colors: Object.assign(
            {},
            ...config.data.map((i) => ({
                [i.label.display]: i.color
            }))
        )
    }
});
/**
 * Validates the newly added content into the graph before rendering
 * @private
 * @param {Array} content - Current set of graph contents, already rendered
 * @param {Object} data - Newly added graph content
 * @returns {undefined} - returns nothing
 */
export const validateContent = (content, data) => {
    if (utils.isEmpty(data)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    if (utils.isEmpty(data.key)) {
        throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
    }
    if (utils.isEmpty(data.label) || utils.isEmpty(data.label.display)) {
        throw new Error(errors.THROW_MSG_UNIQUE_LABEL_NOT_PROVIDED);
    }
    if (utils.isEmpty(data.values)) {
        throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
    }
    if (
        content.some(
            (i) => i.key === data.key || i.label.display === data.label.display
        )
    ) {
        throw new Error(errors.THROW_MSG_NON_UNIQUE_PROPERTY);
    }
};
/**
 * Processes the content when data values are loaded onto an existing graph
 * @private
 * @param {Array<Object>} content - Existing list of graph content already generated
 * @param {Object} data - Newly added graph content
 * @returns {Object} - JSON compatible with c3 load
 */
export const processContent = (content, data) => ({
    columns: [[data.label.display, ...data.values]],
    colors: {
        [data.label.display]: data.color
    }
});
/**
 * Process configuration information for Pie Chart
 * @class PieConfig
 * @private
 */
export default class PieConfig extends BaseConfig {
    /**
     * @inheritDoc
     */
    constructor() {
        super();
        this.config = null;
        this.input = null;
    }

    /**
     * @inheritDoc
     */
    getConfig() {
        return this.config;
    }

    /**
     * @inheritDoc
     */
    setInput(inputJSON) {
        this.input = inputJSON;
        return this;
    }

    /**
     * @inheritDoc
     */
    validateInput() {
        if (utils.isEmpty(this.input)) {
            throw new Error(errors.THROW_MSG_INVALID_INPUT);
        }
        if (utils.isEmpty(this.input.bindTo)) {
            throw new Error(errors.THROW_MSG_NO_BIND);
        }
        if (utils.isEmpty(this.input.data)) {
            throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
        }
        this.input.data.forEach((d) => validateContent([], d));
        return this;
    }

    /**
     * Clones the input JSON into the config object
     * @returns {PieConfig} instance object
     */
    clone() {
        this.config = utils.deepClone(this.input);
        return this;
    }
}
