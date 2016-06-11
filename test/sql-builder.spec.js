//sql-builder.spec.js
describe("Testing noSQLQueryBuilder", function () {
	var noSQLQueryBuilder;

	beforeEach(function () {
		module("noinfopath.helpers");
		module("noinfopath.filters");
		module("noinfopath.data");

		inject(function ($injector) {
			noSQLQueryBuilder = $injector.get("noSQLQueryBuilder");
		});
	});

});
