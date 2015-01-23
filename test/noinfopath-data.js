describe("Testing NoInfoPath (Local) Data Module", function(){

	beforeEach(module("noinfopath.data"));
	


	describe("Test simple CUD functionality", function(){
		it("should add (create) a new object to the specified objectStore");
		it("should update the object specified by the primary key, on the specified objectStore.");
		it("should delete the object specified by the primary key, on the specified objectStore.");
	});

	describe("Test batch CUD functions", function(){
		it("should add (create) an array of new object to the specified objectStore");
		it("should update an array of objects specified by the primary key, on the specified objectStore.");
		it("should delete an array of objects specified by the primary key, on the specufied objectStore.");
	});
})