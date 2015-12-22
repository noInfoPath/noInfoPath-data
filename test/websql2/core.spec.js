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

	describe("Injected version of WEBSQL_STATEMENT_BUILDERS should match test version", function() {
		it("should have been injected", function() {
			expect(WEBSQL_STATEMENT_BUILDERS);
		});



		describe("Testing WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions conversion functions", function() {
			describe("all expected function should exist.", function() {
				function createTest(fi, fn) {
					it("should have a " + fi + " function", function() {
						var fn = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions[fi];
						expect(fn);
					});
				}

				for (var fi in toSqlLiteConversionFunctionsMock) {
					createTest(fi);
				}

			});

			describe("Test the injected version of each method returns the correct results", function() {

				it("Testing TEXT with proper datatype, expecting a string", function() {
					var result,
						input = "Test String",
						expected = "Test String";

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.TEXT(input);

					expect(result).toEqual(expected);
				});

				it("Testing TEXT without proper datatype, expecting a null", function() {
					var result,
						input = 15.5,
						expected = null;

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.TEXT(input);

					expect(result).toEqual(expected);
				});

				it("Testing BLOB with proper datatype, expecting a blob", function() {
					console.warn("This might not be a valid test");
					var result,
						input = "IMABLOB",
						expected = "IMABLOB";

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.BLOB(input);

					expect(result).toEqual(expected);
				});

				it("Testing INTEGER with proper datatype, expecting an integer", function() {
					var result,
						input = 15,
						expected = 15;

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.INTEGER(input);

					expect(result).toEqual(expected);
				});

				it("Testing INTEGER without proper datatype, expecting null", function() {
					var result,
						input = "hi",
						expected = null;

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.INTEGER(input);

					expect(result).toEqual(expected);
				});

				it("Testing NUMERIC with proper datatype, expecting a numeric", function() {
					var result,
						input = 15.5,
						expected = 15.5;

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.NUMERIC(input);

					expect(result).toEqual(expected);
				});

				it("Testing NUMERIC without proper datatype, expecting 0", function() {
					expect(WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.NUMERIC).toBeDefined();
					var result,
						input = "hi",
						expected = NaN;

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.NUMERIC(input);

					expect(result).toEqual(expected);
				});

				it("Testing REAL with proper datatype, expecting a real", function() {
					var result,
						input = 1.0,
						expected = 1.0;

					result = WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.REAL(input);

					expect(result).toEqual(expected);
				});
			});

		});

		describe("Testing WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions conversion functions", function() {
			describe("all expected function should exist and return expected result.", function() {
				function createTest(fi, test) {

					describe("testing function " + fi, function(){
						it("should exist", function() {
							var fn = WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions[fi];
							expect(fn);
						});

						it("give the proper datatype and value should return a value of the expected type", function(){
							var fn = WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions[fi],
								result = fn.apply(null, test.params);

							expect(typeof result).toEqual(test.expected.type);

							expect(result).toEqual(test.expected.result);
						});

						it("given an improper datatype and value should return null", function(){
							var fn = WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions[fi],
								result = fn.apply(null, test.antiParams);

							expect(result).toBe(test.antiExpected);
						});

					});
				}

				for (var fi in fromSqlLiteConversionFunctionsMock) {
					createTest(fi, fromSqlLiteConversionFunctionsMock[fi]);
				}

			});


		});

	});

	describe("Testing Statement Creation Functions", function(){

		describe("each public method should exist and work as expected.", function(){
			function createTest(method, data){
				describe("testing " + method, function(){
					it("should exist", function(){
						expect(WEBSQL_STATEMENT_BUILDERS[method]);
					});

					it("should return expected results", function(){
						//console.log(data);

						var fn = noWebSqlStatementFactory[method],
							r = fn.apply(null, data.params);

						expect(r);

						expect(r).toEqual(data.expected);
					});
				});
			}

			for(var m in methods){
				var data = methods[m];

				createTest(m, data);

			}
		});

		describe("Testing SQL Insert Strings", function(){
			function createTest(){
				result = WEBSQL_STATEMENT_BUILDERS.sqlInsert("foo", insertData);
			}

			it("should make a sql insert object from a noDbSchemaMock", function(){
				var result,
					expected = {
						"queryString" : "INSERT INTO foo (fooID,Description,barID,number,price) VALUES (?,?,?,?,?);",
						"valueArray" : ['0eec54c3-1c7e-48af-a9da-d7da62820083','Test',null,12,4.87]
					};

				result = WEBSQL_STATEMENT_BUILDERS.sqlInsert("foo", insertData);

				expect(result).toEqual(expected);
			});
		});

		describe("Testing SQL delete strings", function(){
			it("should make a sql delete statement with a filter from a mock", function(){
				var result,
					expected = {
						"queryString" : "DELETE FROM foo WHERE (FooID = ?)"
					},
					noFilters = new noInfoPath.data.NoFilters();

				noFilters.add("FooID",null,true,true,
						[{
							"operator" : "eq",
							"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
							"logic" : null
						}]
					);

				result = WEBSQL_STATEMENT_BUILDERS.sqlDelete("foo", noFilters);

				expect(result).toEqual(expected);
			});
		});

		describe("Testing SQL update strings", function(){
			it("should make a sql update statement from a mock", function(){
				var result,
					expected = {
						"queryString" : "UPDATE foo SET Description = ?, barID = ?, number = ?, price = ? WHERE (FooID = ?)",
						"valueArray" : ['noTest','128f28ca-e926-4259-d202-b754fe5b11c7',42,19.95]
					},
					noFilters = new noInfoPath.data.NoFilters();

				noFilters.add("FooID",null,true,true,
						[{
							"operator" : "eq",
							"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
							"logic" : null
						}]
					);

				result = WEBSQL_STATEMENT_BUILDERS.sqlUpdate("foo", updateData, noFilters);

				expect(result).toEqual(expected);
			});
		});

		describe("testing SQL Read strings", function(){
			it("should create a sql select statement to read one record based on the PK", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo WHERE FooID = ?"
					};

				result = WEBSQL_STATEMENT_BUILDERS.sqlOne("foo", "FooID", "0eec54c3-1c7e-48af-a9da-d7da62820083");

				expect(result).toEqual(expected);
			});

			it("should create a sql select statement to read all records from a table", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo"
					};

				result = WEBSQL_STATEMENT_BUILDERS.sqlRead("foo");

				expect(result).toEqual(expected);
			});

			it("should create a sql select statement to read all records from a table with a NoFilter", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo WHERE (FooID = ?)"
					},
					noFilters = new noInfoPath.data.NoFilters();

					noFilters.add("FooID",null,true,true,
						[{
							"operator" : "eq",
							"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
							"logic" : null
						}]
					);

				result = WEBSQL_STATEMENT_BUILDERS.sqlRead("foo", noFilters);

				expect(result).toEqual(expected);
			});

			it("should create a sql select statement to read all records from a table with a NoSort", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo ORDER BY FooID desc",
					},
					noSort = new noInfoPath.data.NoSort();

					noSort.add("FooID", "desc");

				result = WEBSQL_STATEMENT_BUILDERS.sqlRead("foo", null, noSort);

				expect(result).toEqual(expected);
			});

		});

	});

});
