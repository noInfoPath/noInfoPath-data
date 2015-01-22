
describe("Testing NoInfoPath (Local) Data Module", function(){
	describe("when online", function(){
		it("should retrieve the 'upgrades' from $http::~/noupgrades/:id");
		it("then queue all of the upgrade tasks");
		it("then initalize all CRUD interface for all object stores.");
		describe("then initialize Db", function(){
			var upgradeRequired = false;
			it("should checkDbVersion", function(){
				if(upgradeRequired){
					describe("when upgrade needed", function(){
						describe("for each queued upgrade task ...  ", function(){
							it("when createStore, it should create a new objectStore");
							it("when createIndex, it should create a new index on the specificed objectStore");
							it("when deleteStore, given an objectStore name, it should delete the specified objectStore.");
							it("when createIndex, given an objectStore, and an index name, it should delete the specified index.");
						});
					});
				}
			});
		});

	});

	describe("Test simple CUD functionality", function(){
		it("should add (create) a new object to the specified objectStore");
		it("should update the object specified by the primary key, on the specified objectStore.");
		it("should delete the object specified by the primary key, on the specufied objectStore.");
	});

	describe("Test batch CUD functions", function(){
		it("should add (create) an array of new object to the specified objectStore");
		it("should update an array of objects specified by the primary key, on the specified objectStore.");
		it("should delete an array of objects specified by the primary key, on the specufied objectStore.");
	});
})