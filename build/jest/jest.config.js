// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    name: "carbon-graphs",
    globals: {
        VERSION: true
    },
    collectCoverage: true,
    rootDir: "../..",
    coverageDirectory: "<rootDir>/.coverage/html",
    coverageReporters: ["json", "html", "lcov", "clover"],
    collectCoverageFrom: [
        "<rootDir>/src/main/**/*.js",
        "!<rootDir>/**/node_modules/**"
    ],
    errorOnDeprecated: true,
    runner: "@jest-runner/electron",
    setupFilesAfterEnv: [`${__dirname}/jest.environment.setup.js`],
    testEnvironment: "@jest-runner/electron/environment",
    testRegex: "(./src/test/*/*.*-spec)\\.js?$",
    timers: "real",
    transform: {
        "^.+\\.(js|jsx|ts)$": require.resolve(`${__dirname}/jest.transform.js`)
    },
    verbose: false,
    watchman: true
};
