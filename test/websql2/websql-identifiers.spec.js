var
	WEBSQL_IDENTIFIERS,
	WEBSQL_STATEMENT_BUILDERS;

describe("Tesing WebSQL constants", function() {
	beforeEach(function() {
		module("noinfopath.data");

		inject(function($injector) {
			WEBSQL_IDENTIFIERS = $injector.get("WEBSQL_IDENTIFIERS");
			WEBSQL_STATEMENT_BUILDERS = $injector.get("WEBSQL_STATEMENT_BUILDERS");
		});

	});

	describe("Injected version of WEBSQL_IDENTIFIERS should match test version.", function() {
		it("should have been injected", function() {
			expect(WEBSQL_IDENTIFIERS);
		});

		function createTest(property, expected) {
			describe("Testing property " + property, function() {
				it("should exist in injected version" + property, function() {
					var actual = WEBSQL_IDENTIFIERS[property];

					expect(actual);
				});

				it("expected value should match the injected version", function() {
					var actual = WEBSQL_IDENTIFIERS[property];
					expect(actual).toBe(expected);
				});
			});
		}

		for (var wi in WEBSQL_IDENTIFIERS_MOCK) {
			var expected = WEBSQL_IDENTIFIERS_MOCK[wi];

			createTest(wi, expected);

		}
	});

});
