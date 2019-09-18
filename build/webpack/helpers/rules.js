"use strict";
const version = require("../../../package.json").version;
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const postCssLoader = {
    loader: "postcss-loader",
    options: {
        ident: "postcss",
        plugins: () => [autoprefixer(), cssnano()]
    }
};

const jsOptions = (type) => {
    const config = {
        loader: "babel-loader",
        options: {
            presets: [["@babel/preset-env", { modules: false }]],
            plugins: [
                ["@babel/plugin-transform-classes", { loose: true }],
                [
                    "@babel/plugin-transform-runtime",
                    {
                        helpers: type !== "LIB",
                        regenerator: type !== "LIB"
                    }
                ],
                [
                    "minify-replace",
                    {
                        replacements: [
                            {
                                identifierName: "VERSION",
                                replacement: {
                                    type: "StringLiteral",
                                    value: version
                                }
                            }
                        ]
                    }
                ]
            ]
        }
    };
    return [config];
};

const cssOptions = (type) => {
    if (type === "DEV") {
        return ["style-loader", "css-loader", postCssLoader, "less-loader"];
    }
    return ["css-loader", postCssLoader, "less-loader"];
};

module.exports = {
    jsOptions,
    cssOptions
};
