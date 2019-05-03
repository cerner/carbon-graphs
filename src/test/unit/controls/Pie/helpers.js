import sinon from "sinon";
import Carbon from "../../../../main/js/carbon";

export const labelFormatSpy = sinon.spy();
export const onClickFunctionSpy = sinon.spy();
export const inputDefault = (id) => ({
    bindTo: `#${id}`,
    dimension: {
        height: 300
    },
    data: [
        {
            key: "uid_1",
            label: {
                display: "Apple"
            },
            color: Carbon.helpers.COLORS.BLUE,
            onClick: onClickFunctionSpy,
            values: [100, 100]
        }
    ],
    pie: {
        label: {
            format: () => labelFormatSpy
        }
    }
});
export const dataSecondary = {
    key: "uid_2",
    label: {
        display: "Orange"
    },
    color: Carbon.helpers.COLORS.GREEN,
    values: [50, 25]
};
export const dataTertiary = {
    key: "uid_3",
    label: {
        display: "Grey"
    },
    color: Carbon.helpers.COLORS.GREY,
    values: [50]
};
