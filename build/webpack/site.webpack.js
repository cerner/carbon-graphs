const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { jsOptions, cssOptions } = require("./helpers/rules");
const webpackConfig = (env) => ({
    mode: "development",
    entry: ["./dev/app.js"],
    output: {
        path: path.resolve(__dirname, "../..", ".site"),
        filename: "carbon-graphs.js",
        library: "Carbon",
        libraryExport: "default",
        libraryTarget: "umd"
    },
    resolve: {
        modules: [process.cwd(), "node_modules"]
    },
    module: {
        rules: [
            {
                test: /\.(png|svg)$/,
                use: "url-loader"
            },
            {
                test: /\.(less|css)$/,
                use: [MiniCssExtractPlugin.loader, ...cssOptions(env.TYPE)]
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
        new MiniCssExtractPlugin({
            filename: "carbon-graphs.css",
            chunkFilename: "carbon-graphs.css"
        }),
        new HtmlWebpackPlugin({
            template: "build/assets/index.ejs",
            title: "Carbon",
            filename: "index.html",
            inject: "body",
            favicon: "build/assets/icons/Carbon_48.png"
        })
    ],
    stats: {
        colors: true,
        errorDetails: true,
        chunks: false,
        entrypoints: false,
        chunkModules: false,
        chunkOrigins: false,
        modules: false,
        warnings: false
    }
});

module.exports = function(env) {
    return webpackConfig(env);
};
