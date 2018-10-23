const WebpackDevServer = require("webpack-dev-server");
const path = require("path");
const webpack = require("webpack");
const { jsOptions, cssOptions } = require("./helpers/rules");
const compiler = webpack({
    devtool: "inline-source-map",
    entry: [
        "webpack-dev-server/client?http://localhost:9991/",
        "./dev/demo.js"
    ],
    output: {
        path: path.join(process.cwd(), "dist"),
        filename: "bundle.js",
        publicPath: "/dist/"
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
                test: /\.(js|jsx)$/,
                include: [
                    path.join(__dirname, "../..", "src"),
                    path.join(__dirname, "../..", "dev")
                ],
                use: jsOptions("DEV")
            },
            {
                test: /\.(less|css)$/,
                use: cssOptions("DEV")
            }
        ]
    },
    plugins: [new webpack.optimize.ModuleConcatenationPlugin()]
});
const port = Number(process.env.PORT || 9991);

const server = new WebpackDevServer(compiler, {
    publicPath: "/dist/",
    historyApiFallback: true,
    noInfo: true,
    disableHostCheck: true,
    overlay: true,
    contentBase: "./build"
});

server.listen(port, "localhost", () => {
    console.log(`Server started. Please go to http://localhost:${port}`);
});
