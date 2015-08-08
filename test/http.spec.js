//http.spec.js
describe("Testing noHTTP service", function(){
	var noHTTP, noHTTPProvider, noDbSchema, $timeout, $httpBackend, $rootScope, scope, createController, $controller;

	beforeEach(function(){
		module("noinfopath.helpers");
		module("noinfopath.logger");
		module("noinfopath.data");
		module("noinfopath.data.mocks");

		// angular.module('dummyModule', [])
	 //  		.config(['noHTTPProvider', function(_noHTTPProvider_) {
	    // 		noHTTPProvider = _noHTTPProvider_;
	 //  		}]);
		//
		// module('dummyModule');

		inject(function($injector){
			noDbSchema = $injector.get("noDbSchema");
			noHTTP = $injector.get("noHTTP");
			$httpBackend = $injector.get("$httpBackend");
			$timeout = $injector.get("$timeout");

			// $rootScope = $injector.get("$rootScope");
			// $controller = $injector.get("$controller");



		});
	});

	describe("Testing service instanciation", function(){
		it("should exist", function(){
			expect(noHTTP).toBeDefined();
		});

		it("should have added tables specified by noDbSchema to the instance NoDb returned.", function(done){
			noHTTP.whenReady()
				.then(function(){
					expect(noHTTP.Addresses).toBeDefined();
					expect(noHTTP.CoolerTrials).toBeDefined();
					expect(noHTTP.Harvests).toBeDefined();
					expect(noHTTP.LU_Firmness).toBeDefined();
					expect(noHTTP.LU_Flavor).toBeDefined();
					expect(noHTTP.Selections).toBeDefined();

				})
				.catch(function(err){
					console.error(err);
				})
				.finally(function(){
					done();
				});

				$timeout.flush();
		});

		it("Any given table should be a NoTable class. Testing Addrsses.", function(){
			noHTTP.whenReady()
				.then(function(){
					expect(noHTTP.Addresses.constructor.name).toBe("NoTable");
					expect(noHTTP.Addresses.noCreate).toBeDefined();
					expect(noHTTP.Addresses.noRead).toBeDefined();
					expect(noHTTP.Addresses.noUpdate).toBeDefined();
					expect(noHTTP.Addresses.noDestroy).toBeDefined();
				})
				.catch(function(err){
					console.error(err);
				})
				.finally(function(){
					done();
				});

				$timeout.flush();

		});
	});

	xdescribe("Testing noCreate (using LU_Flavor for test.)", function(){

		it("should return a new LU_Flavor object", function(done){
			var expected = {
			    "odata.metadata": "http://fcfn-rest.img.local/odata/$metadata#LU_Flavor/@Element",
			    "Description": "Test",
			    "Value": 1234,
			    "FlavorID": "f463c00a-d96e-4786-a7b0-78bd62187143"
			};
			noHTTP.whenReady()
				.then(function(){
					expect(noHTTP).toBeDefined();
					expect(noHTTP.LU_Flavor).toBeDefined();

					$httpBackend
						.when("POST", "http://fcfn-rest.img.local/odata/LU_Flavor")
						.respond(expected);

					noHTTP.LU_Flavor.noCreate({Description: "Test",Value: 0})
						.then(function(data){
							expect(angular.toJson(data)).toBe(angular.toJson(expected));
						})
						.catch(function(err){
							console.error(err);
						})
						.finally(done);

					$httpBackend.flush();
				})
				.catch(function(err){
					console.error(err);
				});

				$timeout.flush();


		});

	});

	xdescribe("Testing noUpdate (using LU_Flavor for test.)", function(){

		it("should return a 204 status to indicate that LU_Flavor object was updated.", function(done){
			var expected = {
			    "Description": "Test",
			    "Value": 1234,
			    "FlavorID": "f463c00a-d96e-4786-a7b0-78bd62187143"
			};

			expect(noHTTP).toBeDefined();
			expect(noHTTP.LU_Flavor).toBeDefined();

			$httpBackend
				.when("PUT", "http://fcfn-rest.img.local/odata/LU_Flavor(guid'f463c00a-d96e-4786-a7b0-78bd62187143')")
				.respond(204);

			noHTTP.LU_Flavor.noUpdate(expected)
				.then(function(data){
					expect(data).toBe(204);
				})
				.catch(function(err){
					console.error(err);
				})
				.finally(done);

			$httpBackend.flush();
		});

	});

	xdescribe("Testing noDestroy (using LU_Flavor for test.)", function(){

		it("should return a 204 status to indicate that LU_Flavor object was deleted.", function(done){
			var expected = {
			    "Description": "Test",
			    "Value": 1234,
			    "FlavorID": "f463c00a-d96e-4786-a7b0-78bd62187143"
			};

			expect(noHTTP).toBeDefined();
			expect(noHTTP.LU_Flavor).toBeDefined();

			$httpBackend
				.when("DELETE", "http://fcfn-rest.img.local/odata/LU_Flavor(guid'f463c00a-d96e-4786-a7b0-78bd62187143')")
				.respond(204);

			noHTTP.LU_Flavor.noDestroy(expected)
				.then(function(data){
					expect(data).toBe(204);
				})
				.catch(function(err){
					console.error(err);
				})
				.finally(done);

			$httpBackend.flush();
		});

	});

});
