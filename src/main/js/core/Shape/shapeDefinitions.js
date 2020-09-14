/* eslint-disable max-len */
"use strict";

/**
 * The S_0001_circle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CIRCLE = {
    path: {
        d: "M24 48C10.7 48 0 37.3 0 24S10.7 0 24 0s24 10.7 24 24-10.7 24-24 24z"
    },
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0002_diamond.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const RHOMBUS = {
    path: { d: "M24 0l24 24-24 24L0 24 24 0z" },
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0003_plus.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CROSS = {
    path: { d: "M0 16h16V0h16v16h16v16H32v16H16V32H0V16z" },
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0004_rectangle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const VERTICAL_BAR = {
    path: { d: "M14 0h20v48H14V0" },
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0005_square.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const SQUARE = {
    path: { d: "M0 0h48v48H0V0z" },
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0006_teardrop.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_DROP = {
    path: {
        d:
            "M24 0s4.8 5.9 14.5 17.6c6.4 8.1 5.1 19.9-2.9 26.3s-19.6 5.1-26-3c-5.4-6.8-5.4-16.5 0-23.4C19.2 5.9 24 0 24 0z"
    },
    options: { x: -6.1, y: -6, scale: 0.24 }
};
/**
 * The S_0007_teardropUp.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_ALT = {
    path: {
        d:
            "M24 48s-4.8-5.9-14.5-17.6c-6.4-8.1-5.1-19.9 2.9-26.3s19.6-5.1 26 3c5.4 6.8 5.4 16.5 0 23.4C28.8 42.1 24 48 24 48z"
    },
    options: { x: -6.1, y: -6, scale: 0.24 }
};
/**
 * The S_0008_thinDiamond.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const DIAMOND = {
    path: { d: "M24 0l12 24-12 24-12-24L24 0z" },
    options: { x: -8.2, y: -8, scale: 0.33 }
};
/**
 * The S_0009_triangle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE = {
    path: { d: "M24 4l24 40H0L24 4z" },
    options: { x: -6.3, y: -6, scale: 0.25 }
};
/**
 * The S_0010_triangleDown.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_DOWN = {
    path: { d: "M24 44L0 4h48L24 44z" },
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0011_x.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const X = {
    path: {
        d:
            "M0 12L12 0l12 12L36 0l12 12-12 12 12 12-12 12-12-12-12 12L0 36l12-12L0 12z"
    },
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0001_circle_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CIRCLE_LIGHT = {
    circle: { cx: "24", cy: "24", r: "21", fill: "#FFF" },
    path: {
        d:
            "M24.1 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24C48 10.8 37.3 0 24.1 0zM24 45C12.4 45 3 35.6 3 24S12.4 3 24 3s21 9.4 21 21-9.4 21-21 21z"
    },
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0002_rhombus_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const RHOMBUS_LIGHT = {
    path: [
        { fill: "#FFF", d: "M4.2 24L24 4.201 43.798 24 24 43.799z" },
        {
            d:
                "M24 0L0 24l24 24 24-24L24 0zm19.8 24L24 43.8 4.2 24 24 4.2 43.8 24z"
        }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0003_plus_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CROSS_LIGHT = {
    path: [
        { fill: "#FFF", d: "M45 19v10H29v16H19V29H3V19h16V3h10v16z" },
        {
            d:
                "M32 16V0H16v16H0v16h16v16h16V32h16V16H32zm13 13H29v16H19V29H3V19h16V3h10v16h16v10z"
        }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0004_rectangle_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const VERTICAL_BAR_LIGHT = {
    path: [
        { fill: "#FFF", d: "M17 3h14v42H17z" },
        { d: "M14 0v48h20V0H14zm17 45H17V3h14v42z" }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0005_square_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const SQUARE_LIGHT = {
    path: [
        { fill: "#FFF", d: "M3 3h42v42H3z" },
        { d: "M0 0v48h48V0H0zm45 45H3V3h42v42z" }
    ],
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0006_teardrop_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_DROP_LIGHT = {
    path: [
        {
            fill: "#FFF",
            d:
                "M33.7 41.6C27 46.9 17.4 45.9 12 39.2c0-.1-.1-.1-.1-.2-4.6-5.8-4.6-13.9 0-19.7 5.7-6.8 9.7-11.7 12-14.5 2.3 2.8 6.4 7.8 12.2 14.7 5.4 6.8 4.3 16.6-2.4 22.1z"
        },
        {
            d:
                "M38.4 17.6C28.7 5.9 23.9 0 23.9 0S19.1 5.9 9.5 17.5c-5.4 6.9-5.4 16.5 0 23.4 6.3 8 17.8 9.4 25.8 3.2.1 0 .1-.1.2-.2 8-6.5 9.3-18.2 2.9-26.3zM12 39.2c0-.1-.1-.1-.1-.2-4.6-5.8-4.6-13.9 0-19.7 5.7-6.8 9.7-11.7 12-14.5 2.3 2.8 6.4 7.8 12.2 14.7 5.4 6.8 4.3 16.6-2.4 22.1-6.7 5.3-16.3 4.3-21.7-2.4z"
        }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0007_teardropUp_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_ALT_LIGHT = {
    path: [
        {
            fill: "#FFF",
            d:
                "M36.1 28.6c-5.7 6.9-9.7 11.8-12.1 14.6-2.3-2.8-6.4-7.8-12.2-14.7-5.4-6.8-4.3-16.6 2.4-22.1C17.1 4.2 20.5 3 24 3c4.7 0 9.2 2.2 12.1 5.9 4.6 5.8 4.6 13.9 0 19.7z"
        },
        {
            d:
                "M38.5 7.1C35 2.6 29.6 0 24 0c-4.2 0-8.2 1.4-11.5 4.1-8 6.5-9.3 18.2-2.9 26.3C19.3 42.1 24.1 48 24.1 48s4.8-5.9 14.4-17.5c5.4-6.9 5.4-16.5 0-23.4zM11.8 28.5c-5.4-6.8-4.3-16.6 2.4-22.1C17.1 4.2 20.5 3 24 3c4.7 0 9.2 2.2 12.1 5.9 4.6 5.8 4.6 13.9 0 19.7-5.7 6.9-9.7 11.8-12.1 14.6-2.3-2.8-6.4-7.8-12.2-14.7z"
        }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0008_thinDiamond_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const DIAMOND_LIGHT = {
    path: [
        { fill: "#FFF", d: "M34.5 24L24 42 13.5 24 24 6z" },
        { d: "M24 0L10 24l14 24 14-24L24 0zm0 6l10.5 18L24 42 13.5 24 24 6z" }
    ],
    options: { x: -8.2, y: -8, scale: 0.33 }
};
/**
 * The S_0009_triangle_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_LIGHT = {
    path: [
        { fill: "#FFF", d: "M42.7 41H5.3L24 9.8z" },
        { d: "M24 4L0 44h48L24 4zm0 5.8L42.7 41H5.3L24 9.8z" }
    ],
    options: { x: -6.3, y: -6, scale: 0.25 }
};
/**
 * The S_0010_triangleDown_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_DOWN_LIGHT = {
    path: [
        { fill: "#FFF", d: "M42.7 7L24 38.2 5.3 7z" },
        { d: "M0 4l24 40L48 4H0zm42.7 3L24 38.2 5.3 7h37.4z" }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0011_x_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const X_LIGHT = {
    path: [
        {
            fill: "#FFF",
            d:
                "M33.9 26.1l9.9 9.9-7.8 7.8-9.9-9.9-2.1-2.1-2.1 2.1-9.9 9.9L4.2 36l9.9-9.9 2.1-2.1-2.1-2.1L4.2 12 12 4.2l9.9 9.9 2.1 2.1 2.1-2.1L36 4.2l7.8 7.8-9.9 9.9-2.1 2.1z"
        },
        {
            d:
                "M48 12L36 0 24 12 12 0 0 12l12 12L0 36l12 12 12-12 12 12 12-12-12-12 12-12zM36 43.8l-9.9-9.9-2.1-2.1-2.1 2.1-9.9 9.9L4.2 36l9.9-9.9 2.1-2.1-2.1-2.1L4.2 12 12 4.2l9.9 9.9 2.1 2.1 2.1-2.1L36 4.2l7.8 7.8-9.9 9.9-2.1 2.1 2.1 2.1 9.9 9.9-7.8 7.8z"
        }
    ],
    options: { x: -6.2, y: -6, scale: 0.25 }
};
/**
 * The S_0012_circleLines.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CIRCLE_HASHED = {
    circle: { fill: "#FFF", cx: "24", cy: "24", r: "23.5" },
    path: {
        d:
            "M45.49 34.685c.116-.233.227-.468.336-.705.1-.211.2-.419.285-.632.185-.437.353-.883.513-1.333.055-.157.108-.316.161-.475.353-1.068.629-2.16.828-3.267.006-.033.015-.065.021-.1a24.225 24.225 0 00.244-6.605 23.548 23.548 0 00-.329-2.191c-.014-.074-.025-.15-.04-.225a24.73 24.73 0 00-.22-.95c-.018-.074-.033-.149-.052-.222-.09-.349-.19-.694-.3-1.037l-.026-.092c-.022-.069-.039-.14-.062-.21l-.007.008a23.733 23.733 0 00-1.939-4.425l.014-.014c-.087-.154-.19-.3-.281-.45a23.504 23.504 0 00-.43-.693 23.802 23.802 0 00-.9-1.314l-.193-.257c-.206-.272-.4-.554-.615-.816l-.017.017A23.978 23.978 0 0039.3 5.514l.017-.017c-.262-.217-.544-.409-.816-.615l-.257-.193a23.46 23.46 0 00-1.314-.9 23.504 23.504 0 00-.693-.43c-.152-.091-.3-.194-.45-.281l-.014.014a23.733 23.733 0 00-4.425-1.939l.008-.007c-.07-.023-.142-.04-.212-.062-.027-.009-.055-.016-.082-.024a27.896 27.896 0 00-1.046-.3c-.071-.019-.143-.033-.214-.051a25.09 25.09 0 00-.957-.221L28.624.45a25.584 25.584 0 00-2.191-.329A24.21 24.21 0 0019.82.37c-.033.006-.064.015-.1.021a23.75 23.75 0 00-3.742.989c-.451.159-.9.328-1.334.513-.213.09-.42.189-.63.285a24.1 24.1 0 00-3.346 1.864l-.208.142a23.937 23.937 0 00-6.422 6.492 24.1 24.1 0 00-1.864 3.346c-.1.21-.195.417-.285.63a23.25 23.25 0 00-.673 1.807 23.75 23.75 0 00-.829 3.269c-.006.033-.015.064-.021.1a24.204 24.204 0 00-.244 6.604c.078.743.187 1.468.328 2.192.014.074.025.15.04.225.066.322.143.64.221.957.018.071.032.143.051.214.09.352.191.7.3 1.046.008.027.015.055.024.082.022.07.039.142.062.212l.007-.008a23.733 23.733 0 001.939 4.425l-.014.014c.087.154.19.3.281.45.139.234.283.464.43.693.286.449.586.887.9 1.314l.193.257c.206.272.4.554.615.816l.017-.017A23.993 23.993 0 008.7 42.486l-.017.017c.262.217.544.409.816.615l.257.193c.428.315.866.615 1.314.9.229.147.459.291.693.43.152.091.3.194.45.281l.014-.014a23.733 23.733 0 004.425 1.939l-.008.007c.07.023.141.04.21.062l.092.026c.343.105.688.205 1.037.3.073.019.148.034.222.052.315.078.63.154.95.22.075.015.151.026.225.04.72.141 1.449.255 2.191.329a24.21 24.21 0 006.609-.253c.033-.006.065-.015.1-.021a23.864 23.864 0 003.267-.828c.159-.053.318-.106.475-.161.45-.16.9-.328 1.333-.513.213-.09.421-.189.632-.285a23.733 23.733 0 003.345-1.865l.206-.14a23.967 23.967 0 006.43-6.496 23.873 23.873 0 001.522-2.636zM1 24c0-1.844.223-3.682.663-5.473L18.527 1.663A22.943 22.943 0 0124 1c.5 0 1 .022 1.5.054L1.054 25.5C1.022 25 1 24.505 1 24zm.955 6.549L30.549 1.955a22.896 22.896 0 014.49 1.874l-31.21 31.21a22.896 22.896 0 01-1.874-4.49zm4.276 8.038L38.587 6.231a23.225 23.225 0 013.182 3.182L9.413 41.769a23.225 23.225 0 01-3.182-3.182zm6.73 5.584l31.21-31.21a22.896 22.896 0 011.874 4.49L17.451 46.045a22.896 22.896 0 01-4.49-1.874zM24 47c-.5 0-1-.022-1.5-.054L46.946 22.5c.032.5.054 1 .054 1.5a22.994 22.994 0 01-.663 5.473L29.473 46.337c-1.791.44-3.629.662-5.473.663z"
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The 0026_chevronLeft_a.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const LEFT_CHEVRON = {
    path: { d: "M10.3 24L33.8 0l3.9 3.8L18 24l19.7 20.2-3.9 3.8z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The 0026_chevronRight_a.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const RIGHT_CHEVRON = {
    path: { d: "M37.7 24L14.2 48l-3.9-3.8L30 24 10.3 3.8 14.2 0z" },
    options: { x: -6, y: -6, scale: 0.25 }
};

/**
 * The S_0013_line.svg SVG file as an object.
 *
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const LINE = {
    path: { d: "M15 0h48v5H10V0" },
    options: { x: -1, y: -1, scale: 0.25 }
};

/**
 * The S_0014_dashed_line.svg SVG file as an object.
 *
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const LINE_DASHED = {
    path: [
        {
            d: "M-22 0h48v7H8V0"
        },
        {
            d: "M-28 0h80v7H35V0"
        },
        {
            d: "M-18 0h80v7H80V0"
        }
    ],
    options: { x: -1, y: -1, scale: 0.2 }
};
/* eslint-enable max-len */
