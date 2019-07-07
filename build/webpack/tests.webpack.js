const testFiles = require.context("../../src/test", true, /\.js$/);
testFiles.keys().forEach(testFiles);
const srcFiles = require.context("../../src/main", true, /\.js$/);
srcFiles.keys().forEach(srcFiles);

