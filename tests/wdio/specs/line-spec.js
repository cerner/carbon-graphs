Terra.describeViewports('Case Details Container', ['medium'], () => {
    describe('Reports List', () => {
        describe('Loading', () => {
            const viewports = Terra.viewports('tiny', 'huge');
            before(() => {
                browser.url('#/line/simple');
            });
            it('Other Reports should expand', () => {
                console.log("url"+browser.getUrl());
            });
            it('Other Reports should expand', () => {
                const screenshots = browser.checkElement('.carbon-graph-container', { viewports });
                expect(screenshots).to.matchReference();
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
