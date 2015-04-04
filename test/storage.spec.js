//storage.spec.js

var storeTypes = ["noLocalStorage","noSessionStorage"];

describe("Testing noStorage", function(){
	beforeEach(function(){
		module("noinfopath.storage");
	});

	for(var k in storeTypes){

		console.log(k);
		var storeName = storeTypes[k], store;
		beforeEach(function(){
			inject(function($injector){
				store = $injector.get(storeName);
			});
		});

		describe("Testing " + storeName, function(){
			it("should have been injected", function(){
				expect(store).toBeDefined();
			});	

			describe("Testing length property", function(){

				it("should have a length property", function(){
					expect(store.length).toBeDefined();
				});

				it("should return a number", function(done){
					console.log(store.length);
					expect(store.length).toBe(0);
					done();
				});				
			});

			describe("Testing setItem method", function(){
				it("should exist on store", function(){
					expect(store.setItem).toBeDefined();
				});

				it("should setItem without errors", function(){
					store.setItem("Test", "Hello World");
				})
			});

			describe("Testing getItem method", function(){
				it("should exist on store", function(){
					expect(store.getItem).toBeDefined();
				});

				it("should getItem by key", function(){
					var actual = store.getItem("Test");
					expect(actual).toBe("Hello World");
				})
			});	

			describe("Testing key method", function(){
				it("should exist on store", function(){
					expect(store.key).toBeDefined();
				});

				it("should return key based on index", function(){
					var actual = store.key(0);
					expect(actual).toBe("Test");
				})
			});	

			describe("Testing removeItem method", function(){
				it("should exist on store", function(){
					expect(store.removeItem).toBeDefined();
				});

				it("should remove item specified.", function(){
					store.removeItem("Test");
					var actual = store.getItem("Test")
					console.log(actual);
					expect(actual).toBeNull();
				})
			});			

			describe("Testing clear method", function(){
				it("should exist on store", function(){
					expect(store.clear).toBeDefined();
				});

				it("should remove item specified.", function(){
					store.setItem("Test", "Hello World");
					store.clear();
					expect(store.length).toBe(0);
				})
			});

											
		});
	}
});