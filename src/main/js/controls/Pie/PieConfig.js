import BaseConfig, {
    isDataValidFormat,
    isUniqueKey
} from "../../core/BaseConfig";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";

/**
 * Processes the input and converts it to a JSON that c3 understands
 * @private
 * @param {Object} config - Cloned input JSON
 * @returns {Object} JSON compatible with c3
 */
export const processInput = (config) =>
    Object.assign({}, {
        bindto: config.bindTo,
        pie: config.pie,
        size: config.dimension,
        tooltip: {
            show: false
        },
        data: {
            columns: config.data.map((i) => [ i.label, ...i.values ]),
            type: "pie",
            onclick: config.data[ 0 ].onClick,
            colors: Object.assign({}, ...config.data.map((i) => Object.assign({}, {
                [ i.label ]: i.color
            })))
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
    validateInput() {
        if (utils.isEmpty(this.input.bindTo)) {
            throw new Error(errors.THROW_MSG_NO_BIND);
        }
        if (utils.isEmpty(this.input.data)) {
            throw new Error(errors.THROW_MSG_NO_DATA_POINTS);
        }
        if (!isDataValidFormat(this.input.data)) {
            throw new Error(errors.THROW_MSG_INVALID_DATA_PROPERTY);
        }
        if (!isUniqueKey(this.input.data)) {
            throw new Error(errors.THROW_MSG_NON_UNIQUE_KEY);
        }
        return this;
    }
}
