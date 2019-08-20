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
        d: "M24,48C10.7,48,0,37.3,0,24S10.7,0,24,0s24,10.7,24,24S37.3,48,24,48z"
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
    path: { d: "M24,0l24,24L24,48L0,24L24,0z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0003_plus.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CROSS = {
    path: { d: "M0,16h16V0h16v16h16v16H32v16H16V32H0V16z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0004_rectangle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const VERTICAL_BAR = {
    path: { d: "M14,0h20v48H14V0" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0005_square.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const SQUARE = {
    path: { d: "M0,0h48v48H0V0z" },
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
            "M24,0c0,0,4.8,5.9,14.5,17.6c6.4,8.1,5.1,19.9-2.9,26.3s-19.6,5.1-26-3c-5.4-6.8-5.4-16.5,0-23.4C19.2,5.9,24,0,24,0z"
    },
    options: { x: -6, y: -6, scale: 0.25 }
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
            "M24,48c0,0-4.8-5.9-14.5-17.6c-6.4-8.1-5.1-19.9,2.9-26.3s19.6-5.1,26,3c5.4,6.8,5.4,16.5,0,23.4C28.8,42.1,24,48,24,48z"
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0008_thinDiamond.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const DIAMOND = {
    path: { d: "M24,0l14,24L24,48L10,24L24,0z" },
    options: { x: -8, y: -8, scale: 0.25 }
};
/**
 * The S_0009_triangle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE = {
    path: { d: "M24,4l24,40H0L24,4z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0010_triangleDown.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_DOWN = {
    path: { d: "M24,44L0,4h48L24,44z" },
    options: { x: -6, y: -6, scale: 0.25 }
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
            "M0,12L12,0l12,12L36,0l12,12L36,24l12,12L36,48L24,36L12,48L0,36l12-12L0,12z"
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0001_circle_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CIRCLE_LIGHT = {
    circle: { fill: "#FFFFFF", cx: "24", cy: "24", r: "21" },
    path: {
        d:
            "M24.1,0L24.1,0C10.7,0,0,10.7,0,24s10.7,24,24,24s24-10.7,24-24C48,10.8,37.3,0,24.1,0z M24,45C12.4,45,3,35.6,3,24\n\tS12.4,3,24,3s21,9.4,21,21S35.6,45,24,45z"
    },
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0002_diamond_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const RHOMBUS_LIGHT = {
    rect: {
        x: "10",
        y: "10",
        transform: "matrix(0.7071 -0.7071 0.7071 0.7071 -9.9411 24)",
        fill: "#FFFFFF",
        width: "28",
        height: "28"
    },
    path: {
        d:
            "M24,0L0,24l24,24l24-24L24,0z M43.8,24L24,43.8L4.2,24L24,4.2L43.8,24z"
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0003_plus_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CROSS_LIGHT = {
    polygon: {
        fill: "#FFFFFF",
        points:
            "45,19 45,29 29,29 29,45 19,45 19,29 3,29 3,19 19,19 19,3 29,3 29,19 "
    },
    path: {
        d:
            "M32,16V0H16v16H0v16h16v16h16V32h16V16H32z M45,29H29v16H19V29H3V19h16V3h10v16h16V29z"
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0004_rectangle_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const VERTICAL_BAR_LIGHT = {
    rect: { x: "17", y: "3", fill: "#FFFFFF", width: "14", height: "42" },
    path: { d: "M14,0v48h20V0H14z M31,45H17V3h14V45z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0005_square_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const SQUARE_LIGHT = {
    rect: { x: "3", y: "3", fill: "#FFFFFF", width: "42", height: "42" },
    path: { d: "M0,0v48h48V0H0z M45,45H3V3h42V45z" },
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
            fill: "#FFFFFF",
            d:
                "M33.7,41.6C27,46.9,17.4,45.9,12,39.2c0-0.1-0.1-0.1-0.1-0.2c-4.6-5.8-4.6-13.9,0-19.7\n\tc5.7-6.8,9.7-11.7,12-14.5c2.3,2.8,6.4,7.8,12.2,14.7C41.5,26.3,40.4,36.1,33.7,41.6z"
        },
        {
            d:
                "M38.4,17.6C28.7,5.9,23.9,0,23.9,0S19.1,5.9,9.5,17.5c-5.4,6.9-5.4,16.5,0,23.4c6.3,8,17.8,9.4,25.8,3.2\n\tc0.1,0,0.1-0.1,0.2-0.2C43.5,37.4,44.8,25.7,38.4,17.6z M12,39.2c0-0.1-0.1-0.1-0.1-0.2c-4.6-5.8-4.6-13.9,0-19.7\n\tc5.7-6.8,9.7-11.7,12-14.5c2.3,2.8,6.4,7.8,12.2,14.7c5.4,6.8,4.3,16.6-2.4,22.1C27,46.9,17.4,45.9,12,39.2z"
        }
    ],
    options: { x: -6, y: -6, scale: 0.25 }
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
            fill: "#FFFFFF",
            d:
                "M36.1,28.6c-5.7,6.9-9.7,11.8-12.1,14.6c-2.3-2.8-6.4-7.8-12.2-14.7c-5.4-6.8-4.3-16.6,2.4-22.1\n\tC17.1,4.2,20.5,3,24,3c4.7,0,9.2,2.2,12.1,5.9C40.7,14.7,40.7,22.8,36.1,28.6z"
        },
        {
            d:
                "M38.5,7.1C35,2.6,29.6,0,24,0c-4.2,0-8.2,1.4-11.5,4.1c-8,6.5-9.3,18.2-2.9,26.3C19.3,42.1,24.1,48,24.1,48\n\ts4.8-5.9,14.4-17.5C43.9,23.6,43.9,14,38.5,7.1z M11.8,28.5c-5.4-6.8-4.3-16.6,2.4-22.1C17.1,4.2,20.5,3,24,3\n\tc4.7,0,9.2,2.2,12.1,5.9c4.6,5.8,4.6,13.9,0,19.7c-5.7,6.9-9.7,11.8-12.1,14.6C21.7,40.4,17.6,35.4,11.8,28.5z"
        }
    ],
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0008_thinDiamond_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const DIAMOND_LIGHT = {
    polygon: { fill: "#FFFFFF", points: "34.5,24 24,42 13.5,24 24,6 " },
    path: {
        d: "M24,0L10,24l14,24l14-24L24,0z M24,6l10.5,18L24,42L13.5,24L24,6z"
    },
    options: { x: -8, y: -8, scale: 0.25 }
};
/**
 * The S_0009_triangle_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_LIGHT = {
    polygon: { fill: "#FFFFFF", points: "42.7,41 5.3,41 24,9.8 " },
    path: { d: "M24,4L0,44h48L24,4z M24,9.8L42.7,41H5.3L24,9.8z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0010_triangleDown_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_DOWN_LIGHT = {
    polygon: { fill: "#FFFFFF", points: "42.7,7 24,38.2 5.3,7 " },
    path: { d: "M0,4l24,40L48,4H0z M42.7,7L24,38.2L5.3,7H42.7z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0011_x_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const X_LIGHT = {
    polygon: {
        fill: "#FFFFFF",
        points:
            "33.9,26.1 43.8,36 36,43.8 26.1,33.9 24,31.8 21.9,33.9 12,43.8 4.2,36 14.1,26.1 16.2,24 \n\t14.1,21.9 4.2,12 12,4.2 21.9,14.1 24,16.2 26.1,14.1 36,4.2 43.8,12 33.9,21.9 31.8,24 "
    },
    path: {
        d:
            "M48,12L36,0L24,12L12,0L0,12l12,12L0,36l12,12l12-12l12,12l12-12L36,24L48,12z M36,43.8l-9.9-9.9L24,31.8l-2.1,2.1L12,43.8\n\tL4.2,36l9.9-9.9l2.1-2.1l-2.1-2.1L4.2,12L12,4.2l9.9,9.9l2.1,2.1l2.1-2.1L36,4.2l7.8,7.8l-9.9,9.9L31.8,24l2.1,2.1l9.9,9.9L36,43.8z\n\t"
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0012_circleLines.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CIRCLE_HASHED = {
    circle: { id: "fill", fill: "#FFFFFF", cx: "24", cy: "24", r: "23.5" },
    path: {
        id: "lines",
        d:
            "M45.49,34.685c0.116-0.233,0.227-0.468,0.336-0.705c0.1-0.211,0.2-0.419,0.285-0.632\n\tc0.185-0.437,0.353-0.883,0.513-1.333c0.055-0.157,0.108-0.316,0.161-0.475c0.353-1.068,0.629-2.16,0.828-3.267\n\tc0.006-0.033,0.015-0.065,0.021-0.1l0,0C47.876,26.795,47.999,25.399,48,24c0-0.821-0.041-1.632-0.122-2.432l0,0\n\tc-0.074-0.742-0.188-1.471-0.329-2.191c-0.014-0.074-0.025-0.15-0.04-0.225c-0.066-0.32-0.142-0.635-0.22-0.95\n\tc-0.018-0.074-0.033-0.149-0.052-0.222c-0.09-0.349-0.19-0.694-0.3-1.037l-0.026-0.092c-0.022-0.069-0.039-0.14-0.062-0.21\n\tl-0.007,0.008c-0.494-1.537-1.144-3.02-1.939-4.425l0.014-0.014c-0.087-0.154-0.19-0.3-0.281-0.45\n\tc-0.139-0.234-0.283-0.464-0.43-0.693c-0.286-0.449-0.586-0.887-0.9-1.314c-0.064-0.086-0.128-0.172-0.193-0.257\n\tc-0.206-0.272-0.4-0.554-0.615-0.816l-0.017,0.017c-0.958-1.158-2.023-2.224-3.181-3.183l0.017-0.017\n\tc-0.262-0.217-0.544-0.409-0.816-0.615c-0.085-0.065-0.171-0.129-0.257-0.193c-0.428-0.315-0.866-0.615-1.314-0.9\n\tc-0.229-0.147-0.459-0.291-0.693-0.43c-0.152-0.091-0.3-0.194-0.45-0.281l-0.014,0.014c-1.405-0.795-2.888-1.445-4.425-1.939\n\tl0.008-0.007c-0.07-0.023-0.142-0.04-0.212-0.062c-0.027-0.009-0.055-0.016-0.082-0.024c-0.346-0.106-0.694-0.207-1.046-0.3\n\tc-0.071-0.019-0.143-0.033-0.214-0.051c-0.317-0.078-0.635-0.155-0.957-0.221C28.774,0.475,28.7,0.464,28.624,0.45\n\tC27.9,0.309,27.175,0.2,26.433,0.121l0,0C25.632,0.04,24.821,0,24,0c-1.401,0.002-2.8,0.126-4.18,0.37l0,0\n\tc-0.033,0.006-0.064,0.015-0.1,0.021c-1.108,0.198-2.2,0.476-3.269,0.829c-0.158,0.052-0.316,0.105-0.473,0.16\n\tc-0.451,0.159-0.9,0.328-1.334,0.513c-0.213,0.09-0.42,0.189-0.63,0.285c-0.238,0.109-0.475,0.22-0.708,0.337\n\tc-0.911,0.453-1.792,0.963-2.638,1.527L10.46,4.184C7.993,5.868,5.863,8,4.18,10.468c-0.048,0.069-0.095,0.138-0.142,0.208\n\tc-0.564,0.846-1.074,1.727-1.527,2.638c-0.117,0.233-0.228,0.47-0.337,0.708c-0.1,0.21-0.195,0.417-0.285,0.63\n\tc-0.185,0.437-0.354,0.883-0.513,1.334c-0.055,0.157-0.109,0.314-0.16,0.473c-0.353,1.069-0.631,2.161-0.829,3.269\n\tc-0.006,0.033-0.015,0.064-0.021,0.1l0,0C0.124,21.205,0.001,22.601,0,24c0,0.821,0.041,1.632,0.122,2.432l0,0\n\tC0.2,27.175,0.309,27.9,0.45,28.624c0.014,0.074,0.025,0.15,0.04,0.225c0.066,0.322,0.143,0.64,0.221,0.957\n\tc0.018,0.071,0.032,0.143,0.051,0.214c0.09,0.352,0.191,0.7,0.3,1.046c0.008,0.027,0.015,0.055,0.024,0.082\n\tc0.022,0.07,0.039,0.142,0.062,0.212l0.007-0.008c0.494,1.537,1.144,3.02,1.939,4.425L3.08,35.791c0.087,0.154,0.19,0.3,0.281,0.45\n\tc0.139,0.234,0.283,0.464,0.43,0.693c0.286,0.449,0.586,0.887,0.9,1.314c0.064,0.086,0.128,0.172,0.193,0.257\n\tc0.206,0.272,0.4,0.554,0.615,0.816l0.017-0.017c0.959,1.158,2.025,2.223,3.184,3.182l-0.017,0.017\n\tc0.262,0.217,0.544,0.409,0.816,0.615c0.085,0.065,0.171,0.129,0.257,0.193c0.428,0.315,0.866,0.615,1.314,0.9\n\tc0.229,0.147,0.459,0.291,0.693,0.43c0.152,0.091,0.3,0.194,0.45,0.281l0.014-0.014c1.405,0.795,2.888,1.445,4.425,1.939\n\tl-0.008,0.007c0.07,0.023,0.141,0.04,0.21,0.062l0.092,0.026c0.343,0.105,0.688,0.205,1.037,0.3\n\tc0.073,0.019,0.148,0.034,0.222,0.052c0.315,0.078,0.63,0.154,0.95,0.22c0.075,0.015,0.151,0.026,0.225,0.04\n\tc0.72,0.141,1.449,0.255,2.191,0.329l0,0C22.369,47.961,23.179,48,24,48c1.401-0.002,2.8-0.126,4.18-0.37l0,0\n\tc0.033-0.006,0.065-0.015,0.1-0.021c1.107-0.199,2.199-0.475,3.267-0.828c0.159-0.053,0.318-0.106,0.475-0.161\n\tc0.45-0.16,0.9-0.328,1.333-0.513c0.213-0.09,0.421-0.189,0.632-0.285c0.237-0.109,0.472-0.22,0.705-0.336\n\tc0.912-0.453,1.794-0.963,2.64-1.529l0.206-0.14c2.471-1.686,4.604-3.819,6.29-6.29c0.047-0.068,0.094-0.137,0.14-0.206\n\tC44.531,36.476,45.039,35.595,45.49,34.685z M1,24c0-1.844,0.223-3.682,0.663-5.473L18.527,1.663C20.318,1.223,22.156,1,24,1\n\tc0.5,0,1,0.022,1.5,0.054L1.054,25.5C1.022,25,1,24.505,1,24z M1.955,30.549L30.549,1.955c1.559,0.463,3.064,1.092,4.49,1.874\n\tl-31.21,31.21C3.047,33.613,2.418,32.108,1.955,30.549z M6.231,38.587L38.587,6.231c1.161,0.955,2.227,2.021,3.182,3.182\n\tL9.413,41.769C8.252,40.814,7.186,39.748,6.231,38.587z M12.961,44.171l31.21-31.21c0.782,1.426,1.411,2.931,1.874,4.49\n\tL17.451,46.045C15.892,45.582,14.387,44.953,12.961,44.171z M24,47c-0.5,0-1-0.022-1.5-0.054L46.946,22.5C46.978,23,47,23.5,47,24\n\tc-0.001,1.844-0.223,3.682-0.663,5.473L29.473,46.337C27.682,46.777,25.844,46.999,24,47z"
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
    path: { d: "M10.3,24,33.8,0l3.9,3.8L18,24,37.7,44.2,33.8,48Z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The 0026_chevronRight_a.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const RIGHT_CHEVRON = {
    path: { d: "M37.7,24,14.2,48l-3.9-3.8L30,24,10.3,3.8,14.2,0Z" },
    options: { x: -6, y: -6, scale: 0.25 }
};
/* eslint-enable max-len */
