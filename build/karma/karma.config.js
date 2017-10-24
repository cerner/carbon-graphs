const path = require("path");
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
    config.set({
        browsers: [ "ChromeHeadless" ],
        coverageReporter: {
            dir: "../../.coverage",
            reporters: [
                {
                    type: "html",
                    subdir: "html"
                },
                {
                    type: "cobertura",
                    subdir: "."
                }
            ]
        },
        singleRun: true,
        files: [
            "../../node_modules/babel-polyfill/dist/polyfill.js",
            "../webpack/tests.webpack.js"
        ],
        frameworks: [
            "jasmine"
        ],
        preprocessors: {
            "../webpack/tests.webpack.js": [ "webpack", "sourcemap" ]
        },
        reporters: [ "progress", "coverage" ],
        webpackMiddleware: {
            noInfo: true
        },
        webpack: {
            cache: true,
            devtool: "inline-source-map",
            resolve: {
                modules: [
                    "node_modules"
                ]
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        include: path.resolve(__dirname, "../../src"),
                        exclude: /(node_modules)/,
                        use: [
                            {
                                loader: "babel-loader",
                                options: {
                                    presets: [ [ "es2015" ] ],
                                    plugins: [
                                        [ "transform-es2015-classes", { loose: true } ],
                                        [ "babel-plugin-minify-replace", {
                                            "replacements": [
                                                {
                                                    "identifierName": "VERSION",
                                                    "replacement": {
                                                        type: "StringLiteral",
                                                        value: "__TEST__"
                                                    }
                                                }
                                            ]
                                        } ],
                                        [ "istanbul", {
                                            "exclude": [
                                                "**/test/**"
                                            ]
                                        } ]
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    });
};
