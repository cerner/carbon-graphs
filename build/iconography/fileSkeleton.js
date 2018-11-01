const parserOptions = {
    fileHeader: () =>
        `
        /* eslint-disable */
        "use strict";
        `,
    commentBlock: (originalName) =>
        `/**
         * The ${originalName} SVG file as an object.
         * @private
         * @type {{path: {d: string}, options: {x: number, y: number, scale: number}}}
         */`,
    startDefinition: (givenName) => `export const ${givenName} = `,
    openNode: (attributes) => JSON.stringify(attributes),
    endDefinition: () => `;`,
    fileFooter: () => `/* eslint-enable */`
};

module.exports = {
    parserOptions
};
