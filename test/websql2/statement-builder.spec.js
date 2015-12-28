var WEBSQL_STATEMENT_BUILDERS;

describe("Tesing WEBSQL_STATEMENT_BUILDERS", function() {
	beforeEach(function() {
		module("noinfopath.data");

		inject(function($injector) {
			WEBSQL_STATEMENT_BUILDERS = $injector.get("WEBSQL_STATEMENT_BUILDERS");
		});
	});

	it("should have been injected.", function() {
		expect(WEBSQL_STATEMENT_BUILDERS);
	});

	describe("each public method should exist and work as expected.", function(){
		function createTest(method, data){
			describe("testing " + method, function(){
				it("should exist", function(){
					expect(WEBSQL_STATEMENT_BUILDERS[method]);
				});

				it("should return expected results", function(){
					//console.log(data);

					var fn = WEBSQL_STATEMENT_BUILDERS[method],
						r = fn.apply(null, data.params);

					expect(r);

					expect(r).toEqual(data.expected);
				});
			});
		}

		for(var m in WEBSQL_STATEMENT_BUILDERS_MOCKS){
			var data = WEBSQL_STATEMENT_BUILDERS_MOCKS[m];

			createTest(m, data);
		}
	});


});
