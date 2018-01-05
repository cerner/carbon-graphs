const path = require("path");
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
    config.set({
        browsers: [ "ChromeHeadlessCustom" ],
        customLaunchers: {
            ChromeHeadlessCustom: {
                base: "ChromeHeadless",
                flags: [ "--disable-web-security", "--no-sandbox" ],
                debug: false
            }
        },
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
        browserNoActivityTimeout: 120000, // default: 10000; doing this for jenkins
        captureTimeout: 120000, // default: 60000; doing this for jenkins
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
