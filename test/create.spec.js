//create.spec.js

describe("Testing noDbSchema", function(){
	var $timeout, $httpBackend, $rootScope, noDbSchema, dbJsonMock, noIndexedDB;

	beforeEach(function(){

		// angular.module('dummyModule', [])
	 //  		.config(['noHTTPProvider', function(_noHTTPProvider_) {
	 //    		noHTTPProvider = _noHTTPProvider_;
	 //  		}]);

		// module('dummyModule');	
		module("noinfopath.data", "noinfopath.data.mocks");
		inject(function($injector){
			$timeout = $injector.get("$timeout");
			$httpBackend = $injector.get("$httpBackend");
			//$rootScope = $injector.get("$rootScope");
			noDbSchema = $injector.get("noDbSchema");
	       	dbJsonMock = $injector.get("dbJsonMock");
	       	noIndexedDB = $injector.get("noIndexedDB");
		});
	});	

	it("noDbSchema should exist and be initialized.", function(){
		expect(noDbSchema).toBeDefined();
		expect(noDbSchema.whenReady).toBeDefined();
		expect(noDbSchema.load).toBeDefined();
	});

	it("dbJsonMock should exist and be initialized", function(){
		expect(dbJsonMock).toBeDefined();
		expect(dbJsonMock.request).toBeDefined();
		expect(dbJsonMock.response).toBeDefined();
	});

	it("noDbSchema.whenReady shoud load the db.config and return when done", function(done){
		$httpBackend
			.when(dbJsonMock.request.method, dbJsonMock.request.url)
			.respond(dbJsonMock.response.status, dbJsonMock.response.body, dbJsonMock.response.headers);

		noDbSchema.whenReady()
			.then(function(){
				expect(noDbSchema.config).toBeDefined();
				expect(dbJsonMock.config, angular.toJson(noDbSchema.config));
			})
			.catch(function(err){
				console.error(err);
			})
			.finally(function(){
				done();
			});

		$timeout.flush();
		$httpBackend.flush();
	});

	it("Should play nice with noIndexedDB", function(done){

		$httpBackend
			.when(dbJsonMock.request.method, dbJsonMock.request.url)
			.respond(dbJsonMock.response.status, dbJsonMock.response.body, dbJsonMock.response.headers);

		noDbSchema.whenReady()
			.then(function(){
				expect(noDbSchema.config).toBeDefined();
				expect(dbJsonMock.config, angular.toJson(noDbSchema.config));
				expect(noIndexedDB).toBeDefined();
				expect(noIndexedDB.configure).toBeDefined();

				noIndexedDB.configure({"name":"NoInfoPath-v3","version":1}, noDbSchema.config)
					.then(function(resp){
						console.info("noIndexedDB is ready");
					});	
			})
			.catch(function(err){
				console.error(err);
			})
			.finally(function(){
				done();
			});

		$timeout.flush();
		$httpBackend.flush();

	});

});