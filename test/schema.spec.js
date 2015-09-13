describe("Testing noDbSchema", function(){
	var $httpBackend, $timeout, $rootScope, noConfig, noDbSchema, dbJsonMock, noWebSQL;

	beforeEach(function(){

		module("noinfopath.logger");
		module("noinfopath.data.mocks");
		module("noinfopath.data");

		inject(function($injector){
			$httpBackend = $injector.get("$httpBackend");
			noDbSchema = $injector.get("noDbSchema");
			noConfig = $injector.get("noConfig");
			$timeout = $injector.get("$timeout");
			$rootScope = $injector.get("$rootScope");
		});
	});


	it("noDbSchema should exist and be initialized.", function(){
		expect(noDbSchema).toBeDefined();
		expect(noDbSchema.whenReady).toBeDefined();
	});

	it("noDbSchema.whenReady should yeild two NoDbSchema instaces on $rootScope.", function(done){
		$httpBackend
			.when("GET", "http://noinfopath-rest.img.local/api/NoDbSchema")
			.respond(200, noDbSchemaMock);

		noConfig.whenReady()
			.then(function(config){
				noDbSchema.whenReady(noConfig.current)
					.then(function(results){
						console.warn(results);
						for(var r in results){
							var result = results[r];
							expect($rootScope[result]).toBeDefined();
							expect($rootScope[result].store).toEqual(noDbSchemaResults[result].store);
							expect($rootScope[result].tables).toEqual(noDbSchemaResults[result].tables);
						}
					})
					.catch(function(err){
						console.error(err);
					})
					.finally(function(){
						done();
					});
			});
			
		$timeout.flush();

		$httpBackend.flush();
	});

});
