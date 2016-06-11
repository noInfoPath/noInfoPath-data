//configuration.spec.js
describe("Testing noConfig", function () {
	var noConfig, $timeout, $httpBackend, $rootScope;

	beforeEach(function () {
		module("noinfopath.data");

		inject(function ($injector) {
			noConfig = $injector.get("noConfig");
			$timeout = $injector.get("$timeout");
			$httpBackend = $injector.get("$httpBackend");
			$rootScope = $injector.get("$rootScope");
		});
	});

	it("should exist and be initialized.", function () {
		expect(noConfig)
			.toBeDefined();
	});

	it("should expose all expected methods", function () {
		expect(noConfig.whenReady)
			.toBeDefined();
	});

	it("should place noConfig on $rootScope when ready", function (done) {
		$httpBackend
			.when("GET", "/config.json")
			.respond(200, mockConfig);

		noConfig.whenReady()
			.then(function () {
				expect($rootScope.noConfig)
					.toBeDefined();
				expect($rootScope.noConfig.RESTURI)
					.toBe("http://fcfn-rest.img.local/odata");
				expect($rootScope.noConfig.AUTHURI)
					.toBe("http://fcfn-rest.img.local");
				expect($rootScope.noConfig.NODBSCHEMAURI)
					.toBe("http://noinfopath-rest.img.local/api/NoDbSchema");
			})
			.catch(function (err) {
				console.error(err);
			})
			.finally(function () {
				done();
			});

		$timeout.flush();

		$httpBackend.flush();
	});
});
