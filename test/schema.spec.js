describe("Testing noDbSchema", function(){
	var $httpBackend, noDbSchema, dbJsonMock, noWebSQL,
		expected = {

		}
	;

	beforeEach(function(){

		module("noinfopath.data");
		module("noinfopath.logger");

		inject(function($injector){
			$httpBackend = $injector.get("$httpBackend");
			noDbSchema = $injector.get("noDbSchema");
		});
	});


	it("noDbSchema should exist and be initialized.", function(){
		expect(noDbSchema).toBeDefined();
		expect(noDbSchema.whenReady).toBeDefined();
	});

});
