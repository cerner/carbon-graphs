const wdioConf = require('terra-toolkit/config/wdio/wdio.config.js');
const webpackConfig = require('./build/webpack/webpack.config.js');

const config = {
    ...wdioConf.config,
    webpackConfig,
    seleniumDocker: {
        // Disable if running in CI pipeline
        enabled: !process.env.CI,
    },
};

exports.config = config;
