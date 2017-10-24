const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const { jsOptions, cssOptions } = require("./helpers/rules");

const webpackConfig = (env, folder = "") => ({
    entry: {
        "carbon-graphs": "./src/main/js/carbon.js",
        "style": "./src/main/less/carbon.less"
    },
    output: {
        path: path.resolve(__dirname, "../.."),
        filename: `./dist/${folder}js/[name].js`,
        library: "Carbon",
        libraryExport: "default",
        libraryTarget: "umd"
    },
    resolve: {
        modules: [
            process.cwd(),
            "node_modules"
        ]
    },
    module: {
        rules: [
            {
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract(cssOptions(env.TYPE))
            },
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.join(__dirname, "../../src/main/js")
                ],
                use: jsOptions(env.TYPE)
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin(`./dist/${folder}css/carbon-graphs.css`),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: true,
            minimize: true
        })
    ],
    stats: {
        colors: true,
        errorDetails: true,
        chunks: false,
        chunkModules: false,
        chunkOrigins: false,
        modules: false
    }
});

module.exports = function(env) {
    const custom = {};
    if (env.TYPE === "LIB") {
        custom.externals = {
            d3: "d3",
            c3: "c3"
        };
        return merge(webpackConfig(env, "lib/"), custom);
    }
    return webpackConfig(env);
};
