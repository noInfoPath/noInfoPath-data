//configuration.spec.js
describe("Testing noConfig", function(){
	var noConfig, $timeout, $httpBackend;

	beforeEach(function(){
		module("noinfopath.data");

		inject(function($injector){
			noConfig = $injector.get("noConfig");
			$timeout = $injector.get("$timeout");
			$httpBackend = $injector.get("$httpBackend");
		})
	});

	it("should exist and be initialized.", function(){
		expect(noConfig);
	});

	it("should expose all expected methods", function(){
		expect(noConfig.load);
		expect(noConfig.ping);		
		expect(noConfig.whenReady);
	});

	it("Testing noConfig.ping", function(done){
		noConfig.ping()
			.then(function(){
				expect(noConfig.current)
				done();
			})
			.catch(function(err){
				console.error(err);
				done();
			})

	});
});