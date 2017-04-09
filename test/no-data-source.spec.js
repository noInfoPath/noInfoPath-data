var
  DATASOURCE_TO_CONVERSION_FUNCTIONS,
  DATASOURCE_FROM_CONVERSION_FUNCTIONS;

describe("Testing noDataSource", function () {
  beforeEach(function () {
    module("noinfopath.data");

    inject(function ($injector) {
      DATASOURCE_TO_CONVERSION_FUNCTIONS = $injector.get("DATASOURCE_TO_CONVERSION_FUNCTIONS");
      DATASOURCE_FROM_CONVERSION_FUNCTIONS = $injector.get("DATASOURCE_FROM_CONVERSION_FUNCTIONS");
    });

  });

  describe("Testing Conversion Functions.", function () {
    it("should have been injected", function () {
      expect(DATASOURCE_TO_CONVERSION_FUNCTIONS);
      expect(DATASOURCE_FROM_CONVERSION_FUNCTIONS);
    });

    function createToTest(property, source, expected) {
      describe("Testing saving property " + property, function () {
        it("should exist in injected version " + property, function () {
          var actual = DATASOURCE_TO_CONVERSION_FUNCTIONS[property];

          expect(actual);
        });

        it("expected value should match the injected version", function () {
          var actual = DATASOURCE_TO_CONVERSION_FUNCTIONS[property](source);
          expect(actual)
            .toBe(expected);
        });
      });
    }

    function createFromTest(property, source, expected) {
      describe("Testing read property " + property, function () {
        it("should exist in injected version " + property, function () {
          var actual = DATASOURCE_FROM_CONVERSION_FUNCTIONS[property];

          expect(actual);
        });

        it("expected value should match the injected version", function () {
          var actual = DATASOURCE_FROM_CONVERSION_FUNCTIONS[property](source);
          expect(actual)
            .toBe(expected);
        });
      });
    }

    for(var wi in DATASOURCE_TO_CONVERSION_SOURCE) {
      var expected = DATASOURCE_TO_CONVERSION[wi];

      createToTest(wi, DATASOURCE_TO_CONVERSION_SOURCE[wi], expected);
    }

    for(var yi in DATASOURCE_TO_CONVERSION) {
      var expected = DATASOURCE_TO_CONVERSION_SOURCE[yi];

      createFromTest(yi, DATASOURCE_TO_CONVERSION[yi], expected);
    }
  });
});