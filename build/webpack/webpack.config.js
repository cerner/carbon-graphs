const path = require("path");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { jsOptions, cssOptions } = require("./helpers/rules");

const webpackConfig = (env, folder = "") => ({
    mode: "production",
    bail: true,
    entry: {
        "carbon-graphs": "./src/main/js/carbon.js",
        style: "./src/main/less/carbon.less"
    },
    output: {
        path: path.resolve(__dirname, "../.."),
        filename: `./${folder}js/[name].js`,
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
                test: /\.(less|css)$/,
                use: [MiniCssExtractPlugin.loader, ...cssOptions(env.TYPE)]
            },
            {
                test: /\.(js|jsx)$/,
                include: [path.join(__dirname, "../../src/main/js")],
                use: jsOptions(env.TYPE)
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: `./${folder}css/carbon-graphs.css`,
            chunkFilename: `./${folder}css/carbon-graphs.css`
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
    const custom = {};
    if (env.TYPE === "LIB") {
        custom.externals = {
            d3: "d3",
            c3: "c3"
        };
        return merge(webpackConfig(env, "lib/"), custom);
    }
    return webpackConfig(env, "dist/");
};
