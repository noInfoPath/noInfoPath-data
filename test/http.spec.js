//http.spec.js
describe("Testing noHTTP service", function(){
	var noHTTP, noHTTPProvider, $httpBackend, $rootScope, scope, createController, $controller;

	beforeEach(function(){
		module("noinfopath.http");

		angular.module('dummyModule', [])
	  		.config(['noHTTPProvider', function(_noHTTPProvider_) {
	    		noHTTPProvider = _noHTTPProvider_;
	  		}]);

		module('dummyModule');	

		inject(function($injector){
			$httpBackend = $injector.get("$httpBackend");
			noHTTP = $injector.get("noHTTP");
			$rootScope = $injector.get("$rootScope");
			$controller = $injector.get("$controller");
	       		
		})	;
	});	

	it("provider should have a configure method", function(){
		expect(noHTTPProvider.configure).toBeDefined();
	});

	var iNoCRUD;
	describe("Testing noHTTPProvider.createTransport", function(){
		it("should exist", function(){
			expect(noHTTPProvider.createTransport).toBeDefined();
		});

		it("should return an instance of an INOCRUD interface", function(){
			iNoCRUD = noHTTPProvider.createTransport();
			expect(iNoCRUD).toBeDefined(describe);
		})
	});

	describe("Testing INOCRUD inteface", function(){
		it("should expose a create method", function(){
			expect(noHTTP.create).toBeDefined();
		});

		it("should successfully post a new record to the create endpoint.", function(){
			
			$httpBackend
				.when("POST", CRUD.POST.request.url, angular.toJson(CRUD.POST.request.data))
				.respond(201, CRUD.POST.response, CRUD.POST.request.headers );

			$rootScope.$apply(function(){
				noHTTP.create(CRUD.POST.request.url, CRUD.POST.request.data)
					.then(function(data){
						expect(data).toEqual(CRUD.POST.response);
						//done();					
					})
					.catch(function(err){					
						console.log(err);				
						//done();	
					});				
			})



			$httpBackend.flush();
		})
	})
})