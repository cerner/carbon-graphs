/* eslint-disable max-len */
"use strict";

/**
 * All shapes modified for stroke legibility at small sizes
 *
 * The S_0001_circle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CIRCLE = {
    circle: {
        cx: "24",
        cy: "24",
        r: "22",
        fill: "#1c1f21"
    },
    path: {
        d: "M24 5c10.5 0 19 8.5 19 19s-8.5 19-19 19S5 34.5 5 24 13.5 5 24 5m0-5C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0z",
        fill: "#fff"
    },
    options: { x: -5, y: -5, scale: 0.2 },
};
/**
 * The S_0002_diamond.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const RHOMBUS = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#1c1f21",
                d: "M24 1.373L46.627 24 24 46.627 1.373 24z"
            },
            {
                fill: "#fff",
                "fill-rule": "nonzero",
                d: "M24 0L0 24l24 24 24-24L24 0zm0 6.163l17.837 17.836L24 41.837 6.163 23.999 24 6.163z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0003_plus.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const CROSS = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#1c1f21",
                d: "M16.615 1.846v14.768H1.846v14.77h14.769v14.77h14.77v-14.77h14.768v-14.77H31.385V1.846z"
            },
            {
                fill: "#fff",
                "fill-rule": "nonzero",
                d: "M33.23 0H14.77v14.768H0V33.23h14.77V48h18.46V33.23H48V14.768H33.23V0zm-3.692 3.692v14.769h14.769v11.077H29.538v14.77H18.462v-14.77H3.692V18.46h14.77V3.692h11.076z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0004_rectangle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const VERTICAL_BAR = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#1c1f21",
                d: "M2.764 46.236h18.113V2.764H2.764z"
            },
            {
                fill: "#fff",
                "fill-rule": "nonzero",
                d: "M23.142.5H.5v48h22.642V.5zm-4.529 4.528v38.944H5.028V5.028h13.585z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0005_square.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const SQUARE = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
            fill: "#1c1f21",
            d: "M2.764 46.236h43.472V2.764H2.764z"
            },
            {
                fill: "#fff",
                "fill-rule": "nonzero",
                d: "M48.5.5H.5v48h48V.5zm-4.528 4.528v38.944H5.028V5.028h38.944z"
            }
        ]
    },
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0006_teardrop.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_DROP = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#1c1f21",
                d: "M31.439 18.856c5.585 7.069 4.45 17.367-2.531 22.953-6.982 5.585-17.106 4.45-22.691-2.619-4.713-5.934-4.713-14.4 0-20.421C14.595 8.645 18.784 3.496 18.784 3.496s4.19 5.149 12.655 15.36z"
            },
            {
                fill: "#fff",
                "fill-rule": "nonzero",
                d: "M18.784.039L15.612 3.93l-4.718 5.746a3984.842 3984.842 0 01-6.358 7.7c-5.37 6.86-5.37 16.443-.028 23.17 6.323 8.002 17.823 9.317 25.763 2.965 7.921-6.337 9.207-18 2.88-26.009l-5.384-6.509-5.292-6.431-1.998-2.444-1.693-2.08zm0 6.904l4.144 5.042c2.028 2.46 4.305 5.216 6.831 8.263 4.812 6.091 3.828 15.024-2.214 19.857-6.05 4.84-14.79 3.84-19.616-2.267-4.087-5.146-4.087-12.495.006-17.725l6.6-7.995 4.25-5.175z"
            }
        ]
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
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#1c1f21",
                d: "M31.439 29.221c5.585-7.069 4.45-17.367-2.531-22.952C21.926.683 11.802 1.818 6.217 8.887c-4.713 5.934-4.713 14.4 0 20.422C14.595 39.432 18.784 44.58 18.784 44.58s4.19-5.149 12.655-15.36z"
            },
            {
                fill: "#fff",
                "fill-rule": "nonzero",
                d: "M18.784 48.039l-3.172-3.893-4.718-5.746a3984.842 3984.842 0 00-6.358-7.7c-5.37-6.86-5.37-16.443-.028-23.17 6.323-8.002 17.823-9.317 25.763-2.965 7.921 6.337 9.207 18.001 2.88 26.009l-5.384 6.509-5.292 6.432-1.998 2.443-1.693 2.08zm0-6.905l4.144-5.042c2.028-2.46 4.305-5.216 6.831-8.263 4.812-6.091 3.828-15.023-2.214-19.857-6.05-4.84-14.79-3.84-19.616 2.267-4.087 5.147-4.087 12.495.006 17.725l6.6 7.995 4.25 5.175z"
            }
        ]
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
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#1c1f21",
                d: "M14.087 4.144l11.587 19.862-11.587 19.862L2.5 24.006z"
            },
            {
                fill: "#fff",
                d: "M28.069 24.007L14.087.038.106 24.007l13.981 23.968L28.07 24.007zM14.087 8.25l9.19 15.756-9.19 15.756-9.191-15.755L14.087 8.25z"
            }
        ]
    },
    options: { x: -8, y: -8, scale: 0.25 }
};
/**
 * The S_0009_triangle.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE = {
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#1c1f21",
                d: "M24.514 4.233l20.21 33.684H4.303z"
            },
            {
                fill: "#fff",
                d: "M48.442 40.022L24.513.141.585 40.022h47.857zM24.513 8.325l16.492 27.487H8.021L24.513 8.325z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0010_triangleDown.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_DOWN = {
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#1c1f21",
                d: "M24.514 36.47l20.21-33.684H4.303z"
            },
            {
                fill: "#fff",
                d: "M48.442.68L24.513 40.563.585.68h47.857zM24.513 32.379L41.005 4.891H8.021l16.492 27.487z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0011_x.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const X = {
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#1c1f21",
                d: "M3.494 13.78L13.78 3.494 24.066 13.78 34.352 3.494 44.637 13.78 34.352 24.066l10.285 10.286-10.285 10.285-10.286-10.285L13.78 44.637 3.494 34.352 13.78 24.066z"
            },
            {
                fill: "#fff",
                d: "M34.352.464L24.066 10.751 13.781.464.464 13.781l10.287 10.285L.464 34.352l13.317 13.316 10.285-10.286 10.286 10.286 13.316-13.316-10.286-10.286 10.286-10.285L34.352.464zm0 6.06l7.256 7.257-10.286 10.285 10.286 10.286-7.256 7.256-10.286-10.286-10.285 10.286-7.256-7.256L16.81 24.066 6.525 13.781l7.256-7.256L24.066 16.81 34.352 6.525z"
            }
        ]
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
    circle: {
        cx: "24",
        cy: "24",
        r: "22",
        fill: "#fff"
    },
    path: {
        d: "M24 5c10.5 0 19 8.5 19 19s-8.5 19-19 19S5 34.5 5 24 13.5 5 24 5m0-5C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0z",
        fill: "#1c1f21"
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
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#fff",
                d: "M24 1.373L46.627 24 24 46.627 1.373 24z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M24 0L0 24l24 24 24-24L24 0zm0 6.163l17.837 17.836L24 41.837 6.163 23.999 24 6.163z"
            }
        ]
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
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#fff",
                d: "M16.615 1.846v14.768H1.846v14.77h14.769v14.77h14.77v-14.77h14.768v-14.77H31.385V1.846z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M33.23 0H14.77v14.768H0V33.23h14.77V48h18.46V33.23H48V14.768H33.23V0zm-3.692 3.692v14.769h14.769v11.077H29.538v14.77H18.462v-14.77H3.692V18.46h14.77V3.692h11.076z"
            }
        ]
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
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#fff",
                d: "M2.764 46.236h18.113V2.764H2.764z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M23.142.5H.5v48h22.642V.5zm-4.529 4.528v38.944H5.028V5.028h13.585z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0005_square_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const SQUARE_LIGHT = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
            fill: "#fff",
            d: "M2.764 46.236h43.472V2.764H2.764z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M48.5.5H.5v48h48V.5zm-4.528 4.528v38.944H5.028V5.028h38.944z"
            }
        ]
    },
    options: { x: -5, y: -5, scale: 0.2 }
};
/**
 * The S_0006_teardrop_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_DROP_LIGHT = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#fff",
                d: "M31.439 18.856c5.585 7.069 4.45 17.367-2.531 22.953-6.982 5.585-17.106 4.45-22.691-2.619-4.713-5.934-4.713-14.4 0-20.421C14.595 8.645 18.784 3.496 18.784 3.496s4.19 5.149 12.655 15.36z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M18.784.039L15.612 3.93l-4.718 5.746a3984.842 3984.842 0 01-6.358 7.7c-5.37 6.86-5.37 16.443-.028 23.17 6.323 8.002 17.823 9.317 25.763 2.965 7.921-6.337 9.207-18 2.88-26.009l-5.384-6.509-5.292-6.431-1.998-2.444-1.693-2.08zm0 6.904l4.144 5.042c2.028 2.46 4.305 5.216 6.831 8.263 4.812 6.091 3.828 15.024-2.214 19.857-6.05 4.84-14.79 3.84-19.616-2.267-4.087-5.146-4.087-12.495.006-17.725l6.6-7.995 4.25-5.175z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0007_teardropUp_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TEAR_ALT_LIGHT = {
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#fff",
                d: "M31.439 29.221c5.585-7.069 4.45-17.367-2.531-22.952C21.926.683 11.802 1.818 6.217 8.887c-4.713 5.934-4.713 14.4 0 20.422C14.595 39.432 18.784 44.58 18.784 44.58s4.19-5.149 12.655-15.36z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M18.784 48.039l-3.172-3.893-4.718-5.746a3984.842 3984.842 0 00-6.358-7.7c-5.37-6.86-5.37-16.443-.028-23.17 6.323-8.002 17.823-9.317 25.763-2.965 7.921 6.337 9.207 18.001 2.88 26.009l-5.384 6.509-5.292 6.432-1.998 2.443-1.693 2.08zm0-6.905l4.144-5.042c2.028-2.46 4.305-5.216 6.831-8.263 4.812-6.091 3.828-15.023-2.214-19.857-6.05-4.84-14.79-3.84-19.616 2.267-4.087 5.147-4.087 12.495.006 17.725l6.6 7.995 4.25 5.175z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0008_thinDiamond_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const DIAMOND_LIGHT = {
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#fff",
                d: "M14.087 4.144l11.587 19.862-11.587 19.862L2.5 24.006z"
            },
            {
                fill: "#1c1f21",
                d: "M28.069 24.007L14.087.038.106 24.007l13.981 23.968L28.07 24.007zM14.087 8.25l9.19 15.756-9.19 15.756-9.191-15.755L14.087 8.25z"
            }
        ]
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
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#fff",
                d: "M24.514 4.233l20.21 33.684H4.303z"
            },
            {
                fill: "#1c1f21",
                d: "M48.442 40.022L24.513.141.585 40.022h47.857zM24.513 8.325l16.492 27.487H8.021L24.513 8.325z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0010_triangleDown_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const TRIANGLE_DOWN_LIGHT = {
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#fff",
                d: "M24.514 36.47l20.21-33.684H4.303z"
            },
            {
                fill: "#1c1f21",
                d: "M48.442.68L24.513 40.563.585.68h47.857zM24.513 32.379L41.005 4.891H8.021l16.492 27.487z"
            }
        ]
    },
    options: { x: -6, y: -6, scale: 0.25 }
};
/**
 * The S_0011_x_light.svg SVG file as an object.
 *
 * @private
 * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
 */
export const X_LIGHT = {
    g: {
        fill: "none",
        "fill-rule": "nonzero",
        path: [
            {
                fill: "#fff",
                d: "M3.494 13.78L13.78 3.494 24.066 13.78 34.352 3.494 44.637 13.78 34.352 24.066l10.285 10.286-10.285 10.285-10.286-10.285L13.78 44.637 3.494 34.352 13.78 24.066z"
            },
            {
                fill: "#1c1f21",
                d: "M34.352.464L24.066 10.751 13.781.464.464 13.781l10.287 10.285L.464 34.352l13.317 13.316 10.285-10.286 10.286 10.286 13.316-13.316-10.286-10.286 10.286-10.285L34.352.464zm0 6.06l7.256 7.257-10.286 10.285 10.286 10.286-7.256 7.256-10.286-10.286-10.285 10.286-7.256-7.256L16.81 24.066 6.525 13.781l7.256-7.256L24.066 16.81 34.352 6.525z"
            }
        ]
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
    g: {
        fill: "none",
        "fill-rule": "evenodd",
        path: [
            {
                fill: "#fff",
                d: "M24.5 46.193c11.98 0 21.693-9.712 21.693-21.693 0-11.98-9.712-21.692-21.693-21.692-11.98 0-21.692 9.712-21.692 21.692S12.52 46.193 24.5 46.193"
            },
            {
                fill: "#1c1f21",
                d: "M43.728 20.489a19.495 19.495 0 00-1.39-4.198L16.292 42.338c1.329.608 2.729 1.089 4.197 1.39l23.239-23.24zM12.013 39.69l27.676-27.677a19.756 19.756 0 00-2.793-2.794L9.219 36.896a19.756 19.756 0 002.794 2.793M5.181 28.42c.3 1.468.782 2.868 1.39 4.198L32.617 6.57a19.493 19.493 0 00-4.197-1.388L5.18 28.42zM21.674 5C13.04 6.225 6.225 13.04 5 21.674L21.674 5zM27.235 43.909c8.634-1.225 15.448-8.04 16.674-16.674L27.235 43.909z"
            },
            {
                fill: "#1c1f21",
                "fill-rule": "nonzero",
                d: "M24.5 48.5c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zm0-4.615c10.706 0 19.385-8.679 19.385-19.385 0-10.706-8.679-19.384-19.385-19.384-10.706 0-19.384 8.678-19.384 19.384S13.794 43.885 24.5 43.885z"
            }
        ]
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
/* eslint-enable max-len */
