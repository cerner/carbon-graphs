const path = require("path");
process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = function(config) {
    config.set({
        browsers: ["ChromeHeadlessCustom"],
        customLaunchers: {
            ChromeHeadlessCustom: {
                base: "ChromeHeadless",
                flags: ["--disable-web-security", "--no-sandbox"],
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
        files: [
            "../../node_modules/@babel/polyfill/dist/polyfill.js",
            "../webpack/tests.webpack.js"
        ],
        frameworks: ["parallel", "jasmine"],
        preprocessors: {
            "../webpack/tests.webpack.js": ["webpack", "sourcemap"]
        },
        reporters: ["progress", "coverage"],
        webpackMiddleware: {
            stats: "errors-only"
        },
        parallelOptions: {
            executors: 4,
            shardStrategy: "round-robin"
        },
        webpack: {
            mode: "development",
            devtool: "inline-source-map",
            resolve: {
                modules: ["node_modules"]
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
                                    presets: [["@babel/preset-env"]],
                                    plugins: [
                                        [
                                            "@babel/plugin-transform-classes",
                                            { loose: true }
                                        ],
                                        [
                                            "minify-replace",
                                            {
                                                replacements: [
                                                    {
                                                        identifierName:
                                                            "VERSION",
                                                        replacement: {
                                                            type:
                                                                "StringLiteral",
                                                            value: "__TEST__"
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        [
                                            "istanbul",
                                            {
                                                exclude: ["**/test/**"]
                                            }
                                        ]
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            stats: "errors-only"
        }
    });
};
