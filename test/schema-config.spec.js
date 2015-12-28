describe("Testing noDbSchema Full Database Configuration functionality", function(){
	var $httpBackend, $timeout, $rootScope, noConfig, noDbSchema, dbJsonMock, noWebSQL;

	beforeEach(function(){

		module("noinfopath.logger");
		module("noinfopath.data.mocks");
		module("noinfopath.user");
		module("noinfopath.data");

		inject(function($injector){
			$httpBackend = $injector.get("$httpBackend");
			noDbSchema = $injector.get("noDbSchema");
			noConfig = $injector.get("noConfigMock");
			$timeout = $injector.get("$timeout");
			$rootScope = $injector.get("$rootScope");
		});
	});


	var results;
	it("noDbSchema.whenReady should yeild two NoDbSchema instances on $rootScope.", function(done){
		$httpBackend
			.when("GET", "http://noinfopath-rest.img.local/api/NoDbSchema")
			.respond(200, noDbSchemaMock);

		noConfig.whenReady()
			.then(function(config){
				noDbSchema.whenReady(noConfig)
					.then(function(resp){
						results = resp;
						//console.warn(results);
						expect(results).toEqual(['noDbSchema_NoInfoPath_dtc_v1', 'noDbSchema_FCFNv2']);
						expect($rootScope.noDbSchema_names).toEqual(results);
						expect($rootScope.noDbSchema_NoInfoPath_dtc_v1);
						expect($rootScope.noDbSchema_FCFNv2);
						console.info("Async operation completed successfully");
						done();
					})
					.catch(function(err){
						console.error(err);
						done();
					});
			});

		$timeout.flush();

		$httpBackend.flush();
	});

	it("Testing noDbSchema::configureDatabases", function(done){
		$rootScope.noDbSchema_NoInfoPath_dtc_v1 = noDbSchema.create(mockConfig, mockConfig.noDbSchema[0], mockConfig.noDbSchema[0].schemaSource.schema);
		$rootScope.noDbSchema_FCFNv2 =  noDbSchema.create(mockConfig, mockConfig.noDbSchema[1], tablesMock);

		noDbSchema.configureDatabases(currentUser, results)
			.then(function(resp){
				console.log(resp);
				console.info("Async operation completed successfully");
				done();
			})
			.catch(function(err){
				console.error(err);
				done();
			});

	});
});
