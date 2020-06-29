describe("webdriver.io page", () => {
    const browser = null;
    it("should have the right title", () => {
        browser.url("https://webdriver.io");
        expect(browser).toHaveTitle(
            "WebdriverIO · Next-gen browser and mobile automation test framework for Node.js"
        );
    });
});

describe("chrome page", () => {
    const browser = null;
    it("should have the right title", () => {
        browser.url("https://chrome.com/");
        browser.saveScreenshot("./src/test/wdio/snapshots/screenshot1.png");
        console.log(browser.getTitle());
        expect(browser).toHaveTitle(
            "Google Chrome - Download the Fast, Secure Browser from Google"
        );
    });
});

describe("Line", () => {
    const browser = null;
    it("should have the right title", () => {
        browser.url("/#/line/simple");
        browser.saveScreenshot("./src/test/wdio/snapshots/screenshot.png");
        console.log(browser.getTitle());
        expect(browser).toHaveTitle("Carbon");
    });
});

/*
var webdriverio = require('webdriverio');
var browser = webdriverio
    // setup your selenium server address.
    // If you are using default settings, leave it empty
    .remote({ host: 'localhost', port: 4444 })
    // run browser that we want to test
    .init({ browserName: 'chrome', version: '45' });
*/
