const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { jsOptions, cssOptions } = require("./helpers/rules");
const webpackConfig = (env) => ({
    entry: [
        "./dev/demo.js"
    ],
    output: {
        path: path.resolve(__dirname, "../..", ".site"),
        filename: "carbon-graphs.js",
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
    devtool: "eval-source-map",
    module: {
        rules: [
            {
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract(cssOptions(env.TYPE))
            },
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.join(__dirname, "../../src/main/js"),
                    path.join(__dirname, "../..", "dev")
                ],
                use: jsOptions(env.TYPE)
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("carbon-graphs.css"),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new HtmlWebpackPlugin({
            template: "build/assets/index.ejs",
            title: "Carbon",
            filename: "index.html",
            inject: "body",
            favicon: "build/icon.png"
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
    return webpackConfig(env);
};
