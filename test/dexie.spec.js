//create.spec.js

describe("Testing noinfopath-data", function(){
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
			$rootScope = $injector.get("$rootScope");
			noDbSchema = $injector.get("noDbSchema");
	       	dbJsonMock = $injector.get("dbJsonMock");
	       	noUserMock = $injector.get("noUserMock");
	       	noDexie = $injector.get("noDexie");
		});
	});	

	// afterEach(function(){
	// 	if(!$rootScope.$$phase) $rootScope.$digest();
	// });

	describe("Testing noDbSchema", function(){
		it("noDbSchema should exist and be initialized.", function(){
			expect(noDbSchema).toBeDefined();
			expect(noDbSchema.whenReady).toBeDefined();
			expect(noDbSchema.load).toBeDefined();
			//expect(noDbSchema.store).toBeDefined();
		});

		it("dbJsonMock should exist and be initialized", function(){
			expect(dbJsonMock).toBeDefined();
			expect(dbJsonMock.request).toBeDefined();
			expect(dbJsonMock.response).toBeDefined();
		});

		it("noDbSchema.whenReady should load the db.json (/nodbschema) and return when done", function(done){
			$httpBackend
				.when(dbJsonMock.request.method, dbJsonMock.request.url)
				.respond(dbJsonMock.response.status, dbJsonMock.response.body, dbJsonMock.response.headers);

			noDbSchema.whenReady()
				.then(function(){
					expect(noDbSchema.store).toBeDefined();
					expect(dbJsonMock.config, angular.toJson(noDbSchema.store));
				})
				.catch(function(err){
					console.error(err);
					expect(err).not.toBeDefined();
				})
				.finally(function(){
					done();
				});

			$timeout.flush();
			$httpBackend.flush();
		});		
	});

	describe("Testing noDexie", function(){
		it("Configure noDexie", function(done){
			expect(noDexie).toBeDefined();
			expect(noDexie.configure).toBeDefined();

			noDexie.configure(noUserMock, {"name":"NoInfoPath-v4","version":1}, dbJsonMock.store, dbJsonMock.response.body)
				.then(function(){
					expect(noDexie.isOpen()).toBeTruthy();
					done();
				})
				.catch(function(err){
					console.error(err);
					expect(err).not.toBeDefined();
					done();
				});

			$timeout.flush();

		});

		it("noDexie.noTable.create should return a new id", function(done){
			noDexie.configure(noUserMock, {"name":"NoInfoPath-v4","version":1}, dbJsonMock.store, dbJsonMock.response.body)
				.then(function(){
					expect(noDexie.LU_Firmness).toBeDefined();
					expect(noDexie.LU_Firmness.create).toBeDefined();
				
					noDexie.LU_Firmness.create({Description: "Hello", FirmnessID: "ddf5993e-0c72-417c-83fb-62f5612e191c"})
						.then(function(data){
							expect(data).toBeDefined();
							done();

						})
						.catch(function(err){
							console.error(err);
							done();
						});

					//done();
					$timeout.flush();
					
				})
				.catch(function(err){
					console.error("XXX" + err);			
					expect("Failed to create indexedDB object. See Dexie Error above.").toBe(null);
		
					done();
				});

			$timeout.flush();
		});
	});


	// noDexie.transaction("rw", "LU_Firmness", function(tbl){

	// 	tbl.add({Description: "Hello"})
	// 		.then(function(data){
	// 			tbl.get(data)
	// 				.then(function(item){
	// 					item.test();
	// 					done();	
	// 				})
				
	// 		})
	// 		.catch(function(err){
	// 			console.error(err);
	// 			done();
	// 		});					
	// 	})


});