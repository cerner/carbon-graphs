const wdioConf = require('terra-toolkit/config/wdio/wdio.conf.js');
const webpackConfig = require('./build/webpack/site.webpack.js');

const config = {
    ...wdioConf.config,
    webpackConfig,
/*    seleniumDocker: {
        // Disable if running in CI pipeline
        enabled: !process.env.CI,
    },*/
};

exports.config = config;
