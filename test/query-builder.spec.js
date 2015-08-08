//query-build.spec.js
describe("Testing noOdataQueryBuilder", function(){
	var noOdataQueryBuilder;

	beforeEach(function(){
		module("noinfopath.helpers");
		module("noinfopath.filters");
		module("noinfopath.logger");
		module("noinfopath.data");

		inject(function($injector){
			noOdataQueryBuilder = $injector.get("noOdataQueryBuilder");
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
			filters.add("FlavorID", "eq", "7b0c61ae-9cfd-4753-9268-3c218388abf6");
			expect(filters.length).toBeGreaterThan(0);
		});

		it("should process the filters (one filter) and return expect ODATA object", function(){
			var filters = new noInfoPath.data.NoFilters();
			filters.add("FlavorID", "eq", "915d0155-94b1-4d49-965c-3bd82ff236cf");
			var odata = JSON.stringify(noOdataQueryBuilder.makeQuery(filters)),
				expected = JSON.stringify({"$filter":"(FlavorID eq guid'915d0155-94b1-4d49-965c-3bd82ff236cf')"});

			expect(odata).toBe(expected);
		});

		it("should process the filters (two or'd filters) and return expect ODATA object", function(){
			var filters = new noInfoPath.data.NoFilters();
			filters.add("FlavorID", "eq", "915d0155-94b1-4d49-965c-3bd82ff236cf", "or");
			filters.add("FlavorID", "eq", "128f28ca-e926-4259-d202-b754fe5b11c7");
			var odata = JSON.stringify(noOdataQueryBuilder.makeQuery(filters)),
				expected = JSON.stringify({"$filter":"(FlavorID eq guid'915d0155-94b1-4d49-965c-3bd82ff236cf') or (FlavorID eq guid'128f28ca-e926-4259-d202-b754fe5b11c7')"});

			expect(odata).toBe(expected);
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
});
