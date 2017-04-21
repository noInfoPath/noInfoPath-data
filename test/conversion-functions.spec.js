var
  TO_PROVIDER_CONVERSION_FUNCTIONS,
  FROM_PROVIDER_CONVERSION_FUNCTIONS;

describe("Testing noDataSource", function () {
  beforeEach(function () {
    module("noinfopath.data");

    inject(function ($injector) {
      TO_PROVIDER_CONVERSION_FUNCTIONS = $injector.get("TO_PROVIDER_CONVERSION_FUNCTIONS");
      FROM_PROVIDER_CONVERSION_FUNCTIONS = $injector.get("FROM_PROVIDER_CONVERSION_FUNCTIONS");
    });

  });

  describe("Testing Conversion Functions.", function () {
    it("should have been injected", function () {
      expect(TO_PROVIDER_CONVERSION_FUNCTIONS);
      expect(FROM_PROVIDER_CONVERSION_FUNCTIONS);
    });

    function createToTest(property, source, expected) {
      describe("Testing saving property " + property, function () {
        it("should exist in injected version " + property, function () {
          var actual = TO_PROVIDER_CONVERSION_FUNCTIONS[property];

          expect(actual);
        });

        it("expected value should match the injected version", function () {
          var actual = TO_PROVIDER_CONVERSION_FUNCTIONS[property](source);
          expect(actual)
            .toBe(expected);
        });
      });
    }

    function createFromTest(property, source, expected) {
      describe("Testing read property " + property, function () {
        it("should exist in injected version " + property, function () {
          var actual = FROM_PROVIDER_CONVERSION_FUNCTIONS[property];

          expect(actual);
        });

        it("expected value should match the injected version", function () {
          var actual = FROM_PROVIDER_CONVERSION_FUNCTIONS[property](source);
          expect(actual)
            .toBe(expected);
        });
      });
    }

    // Convert to Database Friendly Fields.
    for(var wi in MOCK_TO_PROVIDER_DATA) {
      var expected = MOCK_FROM_PROVIDER_DATA[wi];

      createToTest(wi, MOCK_TO_PROVIDER_DATA[wi], expected);
    }

    // Convert from Database Friendly Fields to UI friendly fields.
    for(var yi in MOCK_FROM_PROVIDER_DATA) {
      var expected = MOCK_TO_PROVIDER_DATA[yi];

      createFromTest(yi, MOCK_FROM_PROVIDER_DATA[yi], expected);
    }
  });
});