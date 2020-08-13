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
            it('Other Reports should expand', () => {
                //expect($('.carbon-graph-container')).to.exist();
                expect($(".carbon-legend .carbon-legend-item-text").getText()).to.equal(
                    "Data Label 1"
                );
            });
            it("should have correct tick values in x-axis", () => {
                // eslint-disable-next-line no-undef
                const elem = $$(".carbon-axis.carbon-axis-x .tick");
                expect(elem[0].getText()).to.equal("100");
                expect(elem[1].getText()).to.equal("150");
                expect(elem[2].getText()).to.equal("200");
                expect(elem[3].getText()).to.equal("250");
            });
            it("should have correct tick values in y-axis", () => {
                // eslint-disable-next-line no-undef
                const elem = $$(".carbon-axis.carbon-axis-y .tick");
                expect(elem[0].getText()).to.equal("-20");
                expect(elem[1].getText()).to.equal("-15");
                expect(elem[2].getText()).to.equal("-10");
                expect(elem[3].getText()).to.equal("-5");
                expect(elem[4].getText()).to.equal("0");
                expect(elem[5].getText()).to.equal("5");
                expect(elem[6].getText()).to.equal("10");
                expect(elem[7].getText()).to.equal("15");
                expect(elem[8].getText()).to.equal("20");
            });
            beforeEach(() => {
                // eslint-disable-next-line no-undef
            });
            it("checks legend element existence in graph", () => {
                browser.refresh();
                browser.click('.carbon-legend');
                // eslint-disable-next-line no-undef
                expect($(".carbon-legend .carbon-legend-item-text").getText()).to.equal(
                    "Data Label 1"
                );
                const screenshots = browser.checkElement('.carbon-graph-container', { viewports });
                expect(screenshots).to.matchReference();
            });
            it("should disable content line when legend item is clicked", () => {
                expect(
                    $(".carbon-data-lines-group .carbon-line")
                        .$("<path />")
                        .getAttribute("aria-hidden")
                ).to.equal("true");
            });
        });
    });
});
