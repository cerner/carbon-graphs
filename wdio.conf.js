const wdioConf = require('terra-toolkit/config/wdio/wdio.conf.js');
const webpackConfig = require('./build/webpack/site.webpack.js');

const wdioConfig = wdioConf.config;

const travis = process.env.TRAVIS;

if (travis) {
    wdioConfig.host = 'localhost';
}

const config = {
    ...wdioConf.config,
    webpackConfig,
    /*    seleniumDocker: {
            // Disable if running in CI pipeline
            enabled: !process.env.CI,
        },*/
    /* capabilities : [{
         browserName: 'chrome',
         maxInstances: 1,
         loggingPrefs: {
             performance: 'ALL',
         },
         'goog:chromeOptions': {
             /!** Run in headless mode since Chrome 69 cannot reach the tiny viewport size due to a omnibox size changexx
              * made by the chrome team. See https://bugs.chromium.org/p/chromedriver/issues/detail?id=2626#c1 &&
              * https://bugs.chromium.org/p/chromium/issues/detail?id=849784.
              *!/
             args: ['headless', 'disable-gpu'],
             perfLoggingPrefs: {
                 traceCategories: 'blink.console, devtools.timeline, toplevel, disabled-by-default-devtools.timeline, disabled-by-default-devtools.timeline.frame',
             },
         },
     },
         {
             browserName: 'firefox',
             maxInstances: 1,
             'moz:firefoxOptions': {
                 prefs: {
                     'dom.disable_beforeunload': false,
                 },
             },
         }]
         /!*,
         {
             browserName: 'internet explorer',
             maxInstances: 1,
             /!** IE Driver custom capabilities must be passed as a sub-object specified under 'se:ieOptions' key for
              * version ^3.3.0.1. and Webdriver.io does not pass these as a sub-options.
              * See https://github.com/SeleniumHQ/selenium/blob/master/cpp/iedriverserver/CHANGELOG#L782.
              *!/
             'se:ieOptions': {
                 javascriptEnabled: true,
                 locationContextEnabled: true,
                 handlesAlerts: true,
                 rotatable: true,
             },
         }],*!/
 };*/
};
exports.config = config;
