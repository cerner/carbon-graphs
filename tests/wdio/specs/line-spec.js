Terra.describeViewports('Case Details Container', ['medium'], () => {
    describe('Reports List', () => {
        describe('Loading', () => {
            before(() => {
                browser.url('#/line/simple');
            });
            it('Other Reports should expand', () => {
                console.log("url"+browser.getUrl());
            });
            it('Other Reports should expand', () => {
                browser.saveScreenshot("./src/sample.png");
            });
            it('Other Reports should expand', () => {
                //expect($('.carbon-graph-container')).to.exist();
                expect($(".carbon-legend .carbon-legend-item-text").getText()).to.equal(
                    "Data Label 1"
                );
            });
        });
    });
});
