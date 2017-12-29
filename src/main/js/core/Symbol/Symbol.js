"use strict";
import d3 from "d3";
import constants from "../../helpers/constants";
import errors from "../../helpers/errors";

/**
 * Checks if the symbol is an inbuilt symbol
 * @private
 * @param {string} symbol - symbol to display in the point
 * @returns {boolean} true if inbuilt symbol
 */
export const isD3InbuiltSymbol = (symbol) => symbol in constants.D3_INBUILT_SYMBOL;
/**
 * Checks if the symbol is an custom  symbol
 * @private
 * @param {string} symbol - symbol to display in the point
 * @returns {boolean} true if custom symbol
 */
export const isNativeSymbol = (symbol) => symbol in constants.CUSTOM_PATH;

/**
 * Checks if the symbol is a d3 inbuilt symbol or one of the Carbon custom symbols.
 * @protected
 * @param {string} symbol - symbol to display in the point
 * @returns {boolean} true if inbuilt or custom symbol, false otherwise
 */
export const isValidCarbonSymbol = (symbol) => ((isD3InbuiltSymbol(symbol)) || (isNativeSymbol(symbol)));

/**
 * A Symbol is a data point representation in a graph.
 * This is also used as a point in the legend
 * @class Symbol
 */
class Symbol {
    constructor(symbol) {
        this.symbol = symbol;
    }

    /**
     * Returns the Moveto path for the symbol.
     * @throws {module:errors.THROW_MSG_UNKNOWN_SYMBOL}
     * @param {number} [size] - size of the symbol. Used for d3 inbuilt symbols only.
     * Custom symbols would need separate scaling
     * @returns {string} Moveto paths for the symbol set in the Symbol class
     */
    getPathElement(size) {
        const getCustomPath = (symbol) => {
            if (isNativeSymbol(symbol)) {
                return constants.CUSTOM_PATH[ symbol ];
            }
            throw errors.THROW_MSG_UNKNOWN_SYMBOL;
        };
        const getD3Symbol = (symbol) =>
            d3.svg.symbol().type(constants.D3_INBUILT_SYMBOL[ symbol ]).size(size || constants.DEFAULT_PLOT_SIZE)();

        return isD3InbuiltSymbol(this.symbol) ? getD3Symbol(this.symbol) : getCustomPath(this.symbol);
    }
}

export default Symbol;
