var noWebSqlStatementFactory;

describe("Tesing noWebSqlStatementFactory", function () {
	beforeEach(function () {
		module("noinfopath.data");

		inject(function ($injector) {
			noWebSqlStatementFactory = $injector.get("noWebSqlStatementFactory");
		});
	});


	it("should have been injected.", function () {
		expect(noWebSqlStatementFactory);
	});

	describe("each public method should exist and work as expected.", function () {
		function createTest(method, data) {
			describe("testing " + method, function () {
				it("should exist", function () {
					expect(noWebSqlStatementFactory[method]);
				});

				it("should return expected results", function () {
					//console.log(data);

					var fn = noWebSqlStatementFactory[method],
						r = fn.apply(null, data.params);

					expect(r);

					expect(r)
						.toEqual(data.expected);
				});
			});
		}

		for(var m in noWebSqlStatmentFactoryMocks) {
			var data = noWebSqlStatmentFactoryMocks[m];

			createTest(m, data);

		}
	});


});
