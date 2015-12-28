var WEBSQL_STATEMENT_BUILDERS;

describe("Tesing WEBSQL_STATEMENT_BUILDERS.sqlConversion", function() {
	beforeEach(function() {
		module("noinfopath.data");

		inject(function($injector) {
			WEBSQL_STATEMENT_BUILDERS = $injector.get("WEBSQL_STATEMENT_BUILDERS");
		});
	});

	it("should exist", function() {
		expect(WEBSQL_STATEMENT_BUILDERS.sqlConversion);
	});

	describe("test each expected property against the injected version", function() {
		function createTest(property, expected) {
			describe("Testing property " + property, function() {
				it("should exist in injected version" + property, function() {
					var actual = WEBSQL_STATEMENT_BUILDERS.sqlConversion[property];

					expect(actual);
				});

				it("expected value should match the injected version", function() {
					var actual = WEBSQL_STATEMENT_BUILDERS.sqlConversion[property];
					expect(actual).toBe(expected);
				});
			});
		}

		for (var wi in sqlConversionMock) {
			var expected = sqlConversionMock[wi];

			createTest(wi, expected);

		}
	});

});
