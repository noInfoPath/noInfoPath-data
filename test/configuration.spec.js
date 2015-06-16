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

	xit("Testing noConfig.ping", function(done){
		$httpBackend
			.when("GET", "/ver.json")
			.respond(200,mockConfig);

		noConfig.ping()
			.then(function(){
				expect(noConfig.current)
				done();
			})
			.catch(function(err){
				console.error("NoInfoPath: ", err);
				done();
			})

		$timeout.flush();
		$httpBackend.flush();
	});
});