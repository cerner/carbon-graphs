module.exports = require("babel-jest").createTransformer({
    presets: [["@babel/preset-env"]],
    plugins: [
        [
            "@babel/plugin-transform-classes",
            {
                loose: true
            }
        ],
        [
            "@babel/plugin-transform-runtime",
            {
                helpers: true,
                regenerator: true
            }
        ]
    ]
});
