var noWebSql, noDbSchema;

describe("Testing noWebSql", function(){
	beforeEach(function() {

		module("noinfopath.data");
		module("ngLodash");

		inject(function($injector) {
			noWebSql = $injector.get("noWebSql");
			noDbSchema = $injector.get("noDbSchema");
			$rootScope = $injector.get("$rootScope");
			_ = $injector.get("lodash");
			$timeout = $injector.get("$timeout");
		});


	});

	it("noWebSql should has been injected.", function(){
		expect("noWebSql");
	});

	describe("testing noWebSql::configure", function(){
		it("should existing on the noWebSql instance", function(){
			expect(noWebSql.configure);
		});

		var promise;
		it("should return a promise to configure a noWebSql database.", function(done){
			var schema = noDbSchema.create(mockConfig, mockConfig.noDbSchema[1], tablesMock);

			promise = noWebSql.configure(currentUser, schema);

			expect(JSON.stringify(promise)).toEqual(JSON.stringify({"$$state":{"status":0}}));

			promise.then(done).catch(done);
			
		});

	});
});
