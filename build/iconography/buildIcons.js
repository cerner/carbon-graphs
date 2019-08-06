"use strict";

const path = require("path");
const prettier = require("prettier");
const svgFolderToJSON = require("@cerner/svg-to-carbon").svgFolderToJSON;
const SHAPES = require("./shapesDictionary").CARBON_SHAPES;
const parserOptions = require("./fileSkeleton").parserOptions;
const fs = require("fs");
const iconPath = path.join(
    __dirname,
    "../../node_modules/one-cerner-style-icons/src/icons"
);
const outputPath = path.join(
    __dirname,
    "../../src/main/js/core/Shape",
    "shapeDefinitions.js"
);
const defaultPositionOptions = {
    x: -6,
    y: -6,
    scale: 0.25
};
const iconParserLogger = (msg) =>
    console.log(`----- Carbon SVG JSON parser: ${msg} -----`);
/**
 * Converts svg icons to JSON and returns only objects needed by Carbon
 *
 * @returns {Promise} A promise that is resolved once the icon update process
 * has been completed.
 */
const convertSVGToJSON = () => {
    iconParserLogger("Start building icons...");
    return svgFolderToJSON({
        dirPath: iconPath,
        options: defaultPositionOptions
    }).then((output) =>
        Object.keys(SHAPES).map((shape) => output.find((o) => shape in o))
    );
};

const writeDefinitionsIntoFile = (text) =>
    fs.writeFileSync(
        outputPath,
        prettier.format(text, {
            parser: "babel"
        }),
        (err) => {
            if (err) {
                throw new Error(
                    "There was an error writing to the shape definitions file. Please follow up and verify."
                );
            }
        }
    );

const buildFunction = (shapes) =>
    `${parserOptions.fileHeader()}
    ${shapes
        .map((i) =>
            Object.keys(i).map(
                (s) =>
                    `${parserOptions.commentBlock(s)}
                ${parserOptions.startDefinition(SHAPES[s])}
                ${parserOptions.openNode(i[s])}
                ${parserOptions.endDefinition()}`
            )
        )
        .join("")}
    ${parserOptions.fileFooter()}\n`;

convertSVGToJSON().then((processedShapes) => {
    writeDefinitionsIntoFile(buildFunction(processedShapes));
    iconParserLogger("Conversion completed!");
    iconParserLogger(
        "Ensure initial positioning of icons by loading the demo page."
    );
    iconParserLogger("Run 'npm run dev' in your console.");
});
