"use strict";
const version = require("../../../package.json").version;
const browsers = require("../../../package.json").browsers;
const autoprefixer = require("autoprefixer");
const cssLoader = {
    loader: "css-loader",
    options: { minimize: true }
};
const postCssLoader = {
    loader: 'postcss-loader',
    options: {
        ident: 'postcss',
        plugins: () => [
            autoprefixer({
                browsers
            })
        ]
    }
};

const jsOptions = (type) => {
    const config = {
        loader: "babel-loader",
        options: {
            presets: [
                [ "es2015", { "modules": false } ]
            ],
            plugins: [
                [ "transform-es2015-classes", { loose: true } ],
                [ "transform-runtime", {
                    "helpers": (type !== "LIB"),
                    "polyfill": (type !== "LIB"),
                    "regenerator": (type !== "LIB"),
                    "moduleName": "babel-runtime"
                } ],
                [ "babel-plugin-minify-replace", {
                    "replacements": [
                        {
                            "identifierName": "VERSION",
                            "replacement": {
                                type: "StringLiteral",
                                value: version
                            }
                        }
                    ]
                } ]
            ]
        }
    };
    if (type !== "DEV") {
        config.options.presets.push([ "babili" ]);
    }
    return [ config ];
};

const cssOptions = (type) => {
    if (type === "DEV") {
        return [
            "style-loader",
            cssLoader,
            postCssLoader,
            "less-loader"
        ];
    }
    return [
        cssLoader,
        postCssLoader,
        "less-loader"
    ];
};

module.exports = {
    jsOptions,
    cssOptions
};
