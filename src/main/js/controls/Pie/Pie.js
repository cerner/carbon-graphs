import c3 from "c3";
import Construct from "../../core/Construct/Construct";
import errors from "../../helpers/errors";
import PieConfig, {
    processContent,
    processInput,
    validateContent
} from "./PieConfig";
/**
 * @typedef {Object} Pie
 * @typedef {Object} PieConfig
 */
/**
 * Initializes the necessary Pie constructor objects
 * @private
 * @param {Pie} control - Pie instance
 * @returns {Pie} Pie instance
 */
const initConfig = (control) => {
    control.config = {};
    control.content = [];
    control.c3Context = null;
    return control;
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
			 label: {
			    display: "Apple"
			 },
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
class Pie extends Construct {
    /**
     * @constructor
     * @param {PieConfig} input - Input JSON instance created using PieConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.generate(input);
    }

    /**
     * @inheritDoc
     */
    generate(input) {
        this.config = new PieConfig()
            .setInput(input)
            .validateInput()
            .clone()
            .getConfig();
        this.c3Context = c3.generate(processInput(this.config));
        this.content.push(...this.config.data);
        return this;
    }

    /**
     * @inheritDoc
     */
    loadContent(input) {
        validateContent(this.content, input);
        this.c3Context.load(processContent(this.content, input), this);
        this.content.push(input);
        return this;
    }

    /**
     * @inheritDoc
     */
    unloadContent(input) {
        const targetContent = this.content.filter(
            (k) => k.key === input.key
        )[0];
        if (!targetContent) {
            throw new Error(errors.THROW_MSG_UNIQUE_KEY_NOT_PROVIDED);
        }
        this.c3Context.unload(
            {
                ids: targetContent.label.display
            },
            this
        );
        this.content.splice(this.content.indexOf(targetContent), 1);
        return this;
    }

    /**
     * @inheritDoc
     */
    destroy() {
        this.c3Context.destroy();
        initConfig(this);
        return this;
    }
}

export default Pie;
