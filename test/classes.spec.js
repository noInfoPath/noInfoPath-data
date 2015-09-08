//query-build.spec.js
describe("Testing Classes", function(){
	var noOdataQueryBuilder;

	beforeEach(function(){
		module("noinfopath.helpers");
		module("noinfopath.filters");
		module("noinfopath.data");
		module("noinfopath.logger");

		inject(function($injector){
			noOdataQueryBuilder = $injector.get("noOdataQueryBuilder");
			noTransactionCache = $injector.get("noTransactionCache");
		});
	});

	it("noOdataQueryBuilder should be instanciated.", function(){
		expect(noOdataQueryBuilder).toBeDefined();
	});

	it("should have makeQuery method", function(){
		expect(noOdataQueryBuilder.makeQuery).toBeDefined();
	});

	describe("Testing filters", function(){

		it("should have a filters object, with atleast one filter", function(){
			var filters = new noInfoPath.data.NoFilters();
			expect(filters).toBeDefined();
			filters.add("FlavorID", null, true, true, [{
				"operator" : "eq",
				"value": "128f28ca-e926-4259-d202-b754fe5b11c7",
				"logic": null
			}]);
			expect(filters.length).toBeGreaterThan(0);
		});

		xit("should process the filters (one filter) and return expect ODATA object", function(){
			var filters = new noInfoPath.data.NoFilters();
			filters.add("FlavorID", "eq", "915d0155-94b1-4d49-965c-3bd82ff236cf");
			var odata = JSON.stringify(noOdataQueryBuilder.makeQuery(filters)),
				expected = JSON.stringify({"$filter":"(FlavorID eq guid'915d0155-94b1-4d49-965c-3bd82ff236cf')"});

			expect(odata).toBe(expected);
		});

		xit("should process the filters (two or'd filters) and return expect ODATA object", function(){
			var filters = new noInfoPath.data.NoFilters();
			filters.add("FlavorID", "eq", "915d0155-94b1-4d49-965c-3bd82ff236cf", "or");
			filters.add("FlavorID", "eq", "128f28ca-e926-4259-d202-b754fe5b11c7");
			var odata = JSON.stringify(noOdataQueryBuilder.makeQuery(filters)),
				expected = JSON.stringify({"$filter":"(FlavorID eq guid'915d0155-94b1-4d49-965c-3bd82ff236cf') or (FlavorID eq guid'128f28ca-e926-4259-d202-b754fe5b11c7')"});

			expect(odata).toBe(expected);
		});

		it("testing NoFilterExpression.toSQL()", function(){
			var filterExpression = new noInfoPath.data.NoFilterExpression("eq", 12, null);
			var expected = "= 12",
				actual = filterExpression.toSQL();

			expect(actual).toBe(expected);
		});

		it("testing NoFilter.toSQL()", function(){
			var filter = new noInfoPath.data.NoFilter(
				"FlavorID",
				null,
				true,
				true,
				[
					{
						"operator" : "eq",
						"value": "128f28ca-e926-4259-d202-b754fe5b11c7",
						"logic": null
					}
				]
			);
			var expected = "(FlavorID = '128f28ca-e926-4259-d202-b754fe5b11c7')",
				actual = filter.toSQL();

			expect(actual).toBe(expected);
		});

		it("testing single filter NoFilters.toSQL()", function(){
			var filters = new noInfoPath.data.NoFilters();
			filters.add("FlavorID", null, true, true, [{
				"operator" : "eq",
				"value": "128f28ca-e926-4259-d202-b754fe5b11c7",
				"logic": null
			}]);
			var actual = filters.toSQL();
			var expected = "(FlavorID = '128f28ca-e926-4259-d202-b754fe5b11c7')";

			expect(actual).toBe(expected);

		});

		it("testing multiple filters NoFilters.toSQL()", function(){
			var filters = new noInfoPath.data.NoFilters();
			filters.add("FlavorID", null, true, true, [{
				"operator" : "eq",
				"value": "128f28ca-e926-4259-d202-b754fe5b11c7",
				"logic": null
			}]);
			filters.add("Pie", "and", true, true, [{
				"operator" : "eq",
				"value": "Apple",
				"logic": null
			}]);
			var actual = filters.toSQL();
			var expected = "(Pie = 'Apple') and (FlavorID = '128f28ca-e926-4259-d202-b754fe5b11c7')";

			expect(actual).toBe(expected);
		});
	});

	describe("Testing sort", function(){

		it("should have a sort object, with atleast one sort", function(){
			var sort = new noInfoPath.data.NoSort();
			expect(sort).toBeDefined();
			sort.add("Description", "desc");
			expect(sort.length).toBeGreaterThan(0);
		});

		it("should return an ODATA compatible sort object, when sort supplied alone.", function(){
			var sort = new noInfoPath.data.NoSort();
			expect(sort).toBeDefined();
			sort.add("Description", "desc");
			var odata = JSON.stringify(noOdataQueryBuilder.makeQuery(sort)),
				expected = "{\"$orderby\":\"Description desc\"}";
			expect(odata).toBe(expected);
		});

		it("should return an ODATA compatible sort object, when 2 sorts are supplied alone.", function(){
			var sort = new noInfoPath.data.NoSort();
			expect(sort).toBeDefined();
			sort.add("Description", "desc");
			sort.add("OrderBy", "asc");
			var odata = JSON.stringify(noOdataQueryBuilder.makeQuery(sort)),
				expected = "{\"$orderby\":\"Description desc,OrderBy\"}";
			expect(odata).toBe(expected);
		});

	});

	describe("Testing page", function(){
		it("should have a page object, with a skip and take value", function(){
			var page = new noInfoPath.data.NoPage(10, 10);
			expect(page).toBeDefined();
			expect(page.skip).toBe(10);
			expect(page.take).toBe(10);
		});
	});

	describe("Testing transactions", function(){
		it("should have all relevant classes exposed", function(){
			expect(noInfoPath.data.NoTransaction).toBeDefined();
			expect(noInfoPath.data.NoChanges).toBeDefined();
			expect(noInfoPath.data.NoChange).toBeDefined();
		});

		it("should create a NoChange object with the proper properties", function(){
			var result = new noInfoPath.data.NoChange("Pies", {"Pie": "Apple"}, "U");

			expect(result).toBeDefined();
			expect(result.changeType).toBeDefined();
			expect(result.data).toBeDefined();
			expect(result.tableName).toBeDefined();
			expect(result.changeType).toBe("U");
			expect(result.data).toEqual({"Pie": "Apple"});
			expect(result.tableName).toBe("Pies");


		});

		it("should create a NoChanges array", function(){
			var result = new noInfoPath.data.NoChanges();

			expect(result).toBeDefined();
		});

		it("should create a NoChanges array and add a NoChange Object with .add()", function(){
			var noChanges = new noInfoPath.data.NoChanges(),
				result;

			noChanges.add("Pies", {"Pie": "Apple"}, "U");

			expect(noChanges).toBeDefined();
			expect(noChanges.length).toBe(1);

			result = noChanges[0];

			expect(result).toBeDefined();
			expect(result.changeType).toBeDefined();
			expect(result.data).toBeDefined();
			expect(result.tableName).toBeDefined();
			expect(result.changeType).toBe("U");
			expect(result.data).toEqual({"Pie": "Apple"});
			expect(result.tableName).toBe("Pies");
		});

		it("should create a NoTransaction object with the proper properties", function(){
			var result = new noInfoPath.data.NoTransaction("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");

			expect(result).toBeDefined();
			expect(result.userID).toBe("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");
			expect(result.timestamp).toBeDefined();
		});
	});
});
