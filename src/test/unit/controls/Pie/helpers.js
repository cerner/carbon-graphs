import sinon from "sinon";
import Carbon from "../../../../main/js/carbon";
import utils from "../../../../main/js/helpers/utils";

export const labelFormatSpy = sinon.spy();
export const onClickFunctionSpy = sinon.spy();
export const inputDefault = (id) =>
    utils.deepClone({
        bindTo: `#${id}`,
        dimension: {
            height: 300
        }
    });
export const dataPrimary = {
    key: "uid_1",
    label: {
        display: "Banana"
    },
    color: Carbon.helpers.COLORS.LIGHT_YELLOW,
    onClick: onClickFunctionSpy,
    value: 100
};
export const dataSecondary = {
    key: "uid_2",
    label: {
        display: "Grape"
    },
    color: Carbon.helpers.COLORS.GREEN,
    value: 5
};
export const dataTertiary = {
    key: "uid_3",
    label: {
        display: "Orange"
    },
    color: Carbon.helpers.COLORS.ORANGE,
    value: 25
};
/**
 * Returns the DOM element queried by Class
 *
 * @param {string} cls - Class attribute name
 * @returns {HTMLElement} - DOM element
 */
export const fetchElementByClass = (cls) => document.querySelector(`.${cls}`);
