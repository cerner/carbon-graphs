const jest = require("jest-cli");
const config = require("./jest.config.js");

const debugMode = process.argv[2];

const updatedConfig =
    debugMode === "--debug"
        ? Object.assign(config, { runInBand: true })
        : config;

jest.runCLI(updatedConfig, ".").then(({ results }) => {
    const { numFailedTests, numRuntimeErrorTestSuites } = results;

    if (numFailedTests === 0 && numRuntimeErrorTestSuites === 0) {
        process.exitCode = 0;
    } else {
        process.exitCode = 1;
    }
});
