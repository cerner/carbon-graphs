const WebpackDevServer = require("webpack-dev-server");
const path = require("path");
const webpack = require("webpack");
const { jsOptions, cssOptions } = require("./helpers/rules");
const port = Number(process.argv[2] || 9991);
const compiler = webpack({
    mode: "development",
    devtool: "inline-source-map",
    entry: [
        `webpack-dev-server/client?http://localhost:${port}/`,
        "./dev/app.js"
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
    }
});

const server = new WebpackDevServer(compiler, {
    publicPath: "/dist/",
    historyApiFallback: true,
    noInfo: true,
    disableHostCheck: true,
    open: true,
    overlay: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    contentBase: "./build"
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Server started. Please go to http://localhost:${port}`);
});
