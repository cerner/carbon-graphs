import c3 from "c3";
import errors from "../../helpers/errors";
import utils from "../../helpers/utils";
import PieConfig, { processInput } from "./PieConfig";
/**
 * TODO: NOT INCLUDED IN DIST, PROOF OF CONCEPT only.
 *  * Add unit tests
 *  * Validation
 *  * Extend from GraphContent
 *  * Remove this TODO
 */

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 * @private
 * @throws {module:errors.THROW_MSG_NO_DATA_LOADED}
 * @param {Object} inputJSON - Input JSON provided by the consumer
 * @returns {Object} configuration JSON
 */
const getConfig = (inputJSON) => {
    if (utils.isEmpty(inputJSON)) {
        throw new Error(errors.THROW_MSG_NO_DATA_LOADED);
    }
    return processInput(new PieConfig()
        .setInput(inputJSON)
        .validateInput()
        .clone()
        .getConfig());
};

/**
 * A Pie chart, with following properties
 * @class Pie
 * @example
 {
	 bindTo: id,
	 dimension: {
		 height: 300
	 },
	 data: [
		 {
			 key: "uid_1",
			 label: "Apple",
			 color: COLORS.BLUE,
			 onClick: (d) => {},
			 values: [100]
		 }
	 ],
	 pie: {
		 label: {
			 format: function (value, ratio, id) {
				 return d3.format("$")(value);
			 }
		 }
	 }
 }
 */
class Pie {
    constructor() {
        this.config = {};
        this.context = null;
    }

    /**
     * Generates the pie chart
     * @param {Object} input - Input JSON
     * @returns {Object} c3 object
     */
    generate(input) {
        this.context = c3.generate(getConfig(input));
        return this.context;
    }

    /**
     * Loads data points
     * @todo Implement load function
     * @param {Object} input - Input JSON
     * @returns {Object} c3 object
     */
    load(input) {
        return c3.load(input, this);
    }

    /**
     * Unloads data points
     * @todo Implement unload function
     * @param {Object} input - Input JSON
     * @returns {Object} c3 object
     */
    unload(input) {
        return c3.unload(input, this);
    }

    /**
     * Destroys the rendered pie chart
     * @returns {undefined} returns nothing
     */
    destroy() {
        this.context.destroy();
    }
}

export default Pie;
