describe("Testing noDbSchema", function(){
	var $httpBackend, $timeout, $rootScope, noConfig, noDbSchema, dbJsonMock, noWebSQL;

	beforeEach(function(){

		module("noinfopath.logger");
		module("noinfopath.data.mocks");
		module("noinfopath.user");
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
		expect(noDbSchema.configureDatabases).toBeDefined();

	});

	describe("Testing noDbSchma::create method", function(){
		var noDbSchemaObj;

		it("should exists", function(){
			expect(noDbSchema.create);
		});


		it("should return a NoDbSchema object", function(){
			noDbSchemaObj = noDbSchema.create(mockConfig, mockConfig.noDbSchema[1],  noDbSchemaMock);

			expect(noDbSchemaObj);

			expect(noDbSchemaObj.constructor.name).toBe("NoDbSchema");
		});

		it("should have a `store` property", function(){
			expect(noDbSchemaObj.store);
			expect(noDbSchemaObj.store).toEqual({"foo":"$$fooID,barID","vw_foo":"$$"});
		});

		it("should have a `tables` property", function(){
			expect(noDbSchemaObj.tables);
			//expect(noDbSchemaObj.tables).toEqual(tablesMock);
		});

		it("should have a `lookups` property", function(){
			console.warn("Looking for LU tables is FallCreek implementation only, need to redesign this property.");
			expect(noDbSchemaObj.lookups);
			expect(noDbSchemaObj.lookups).toEqual([]);
		});

		it("should have a `isReady` property that returns a boolean value.", function(){
			expect(noDbSchemaObj.isReady);
			expect(typeof noDbSchemaObj.isReady).toBe("boolean");
		});

		it("should have a `sql` property that returns a boolean value.", function(){
			console.warn("NOTE: This method never seems to get called by other code.");
			expect(noDbSchemaObj.sql);
			expect(typeof noDbSchemaObj.sql).toBe("object");
		});

		it("should have a `views` property that returns a value.", function(){
			console.warn("NOTE: This method never seems to get called by other code.");
			expect(noDbSchemaObj.views);
			expect(typeof noDbSchemaObj.views.length).toBeTruthy();
		});

		it("should have a `config` property that returns a value.", function(){
			expect(noDbSchemaObj.config);
			expect(noDbSchemaObj.config).toEqual({"dbName":"FCFNv2","provider":"noWebSql","remoteProvider":"noHTTP","version":1,"description":"Fall Creek Variety Development Database","size":51200,"schemaSource":{"provider":"noDBSchema","sourceDB":"fcfn2"}});
		});
	});

});
