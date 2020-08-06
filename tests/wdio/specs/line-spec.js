Terra.describeViewports('Case Details Container', ['medium'], () => {
    describe('Reports List', () => {
        describe('Loading', () => {
            before(() => {
                browser.url('/#/line/simple');
            });
            it('Other Reports should expand', () => {
                expect(browser.getUrl()).to.equal("http://192.168.1.250:8080/#/line/simple");
            });
            it('Other Reports should expand', () => {
                browser.saveScreenshot("./src/sample.png");
            });
            it('Other Reports should expand', () => {
                //expect($('.carbon-graph-container')).to.exist();
                expect($("#root").getText()).to.equal(
                    "Data Label 1"
                );
            });
        });
    });
});
