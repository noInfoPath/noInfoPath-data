"use strict";
var url = 'http://localhost:3002/entity/mongodb/noupgrades/54b9a2dcd2a8e3e80e626ce9';

describe("when online", function(){
	var noDbInit, $httpBackend, $timeout, testUpgrades, testQueue;

	beforeEach(function(){
		module("noinfopath.data.init")
	});


	beforeEach(inject(function($injector){
		$httpBackend = $injector.get('$httpBackend');
		$timeout = $injector.get('$timeout');
		noDbInit = $injector.get("noDbInit");

	}));

	beforeEach(function(done){
		done();
	});

	it("should retrieve the 'upgrades' /entity/mongodb/noupgrades/:id", function(done){

		$httpBackend.when('GET', url).respond({
		  "_id": "54b9a2dcd2a8e3e80e626ce9",
		  "db": [
		    
		  ],
		  "collections": {
		    "UserData": [
		      {
		        "action": "createStore",
		        "options": {
		          "autoIncrement": true
		        }
		      },
		      {
		        "action": "createIndex",
		        "property": "LastName",
		        "options": {
		          "unique": true
		        }
		      }
		    ],
		    "Locations": [
		      {
		        "action": "createStore",
		        "options": {
		          "keyPath": "Location_Code"
		        }
		      }
		    ],
		    "Dept": [
		      {
		        "action": "createStore",
		        "options": {
		          "keyPath": "DepartmentId"
		        }
		      }
		    ],
		    "DMMS": [
		      {
		        "a ction": "createStore",
		        "options": {
		          "autoIncrement": true
		        }
		      }
		    ]
		  }
		});

		noDbInit.requestDbUpgrades(url).then(function(upgrades){
			testUpgrades = upgrades;
			expect(upgrades).toBeDefined();
			//console.log(testUpgrades);
			done();
		});

		$httpBackend.flush();

	});



	it("then queue all of the upgrade tasks", function(done){
		noDbInit.queueUpgradeTasks(testUpgrades)
			.then(function(queue){
				//console.log(queue);
				
				done();
			});			

		$timeout.flush();
	});

	it("then initalize all CRUD interface for all object stores.");
	describe("then initialize Db", function(){
		var upgradeRequired = true;
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
