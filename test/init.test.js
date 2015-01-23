"use strict";
var noUpgradesURI = 'http://localhost:3002/entity/mongodb/noupgrades/54b9a2dcd2a8e3e80e626ce9';

describe("Testing noinfopath.data.init", function(){
	var noDbInit, $httpBackend, $timeout, $indexedDB, 
		testUpgrades = {
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
					}, 
		testQueue;

	beforeEach(function(){
		module("noinfopath.data.init")
	});


	beforeEach(inject(function($injector){
		resetIndexedDBMock();
		$httpBackend = $injector.get('$httpBackend');
		$timeout = $injector.get('$timeout');
		noDbInit = $injector.get("noDbInit");
		//$indexedDB = $injector.get('$indexedDB');
		//spyOn(noDbInit, 'getIndexedDBReference').and.returnValue(mockIndexedDB);
	}));


	describe("Testing noDbInit service", function(){

		it("Interfaces should exist off of noDbInit", function(){
			expect(noDbInit.dbPromise).toBeDefined();
			expect(noDbInit.setVersion).toBeDefined();
			expect(noDbInit.getVersion).toBeDefined();
			expect(noDbInit.checkDbVersion).toBeDefined();
			expect(noDbInit.requestDbUpgrades).toBeDefined();
			expect(noDbInit.queueUpgradeTasks).toBeDefined();
			expect(noDbInit.start).toBeDefined();
			expect(noDbInit.run).toBeDefined();
			expect(noDbInit.initDb).toBeDefined();
			expect(noDbInit.initCollections).toBeDefined();
			expect(noDbInit.exec).toBeDefined();
			//expect(noDbInit.getIndexedDBReference).toBeDefined();
		});

		describe("when online", function(){

			describe("Testing noDbInit.setVersion() and noDbInit.getVersion()", function(){
				it("should set the internal version of noDb by noDbInit.setVersion() and read the version number by calling noDbInit.getVersion()", function(){
					var dbVersion;

					noDbInit.setVersion(1);
					dbVersion = noDbInit.getVersion();

					expect(dbVersion).toEqual(1000);
				});
			});

			describe("Testing noDbInit.requestDbUpgrades()", function(){
				it("noDbInit.requestDbUpgrades() should retrieve the 'upgrades' from /entity/mongodb/noupgrades/:id", function(done){

					$httpBackend.when('GET', noUpgradesURI).respond(testUpgrades);

					noDbInit.requestDbUpgrades(noUpgradesURI).then(function(upgrades){
						expect(upgrades).toEqual(testUpgrades);
						//console.log(upgrades);
						done();
					});

					$httpBackend.flush();
				});
			});

			describe("Testing noDbInit.queueUpgradeTasks()", function(){
				it("noDbInit.queueUpgradeTasks() should queue all of the upgrade tasks", function(done){

					noDbInit.queueUpgradeTasks(testUpgrades)
						.then(function(queue){
							//console.log(queue);
							expect(queue).toBeDefined();
							expect(queue.length).toEqual(5);
							expect(queue[0].length).toEqual(3);
							expect(queue[0][0]).toEqual('UserData');
							expect(queue[0][1]).toBeTruthy(typeof queue[0][1] === "object");
							expect(queue[0][2]).toBeTruthy(typeof queue[0][2] === "function");
							done();
						});			

					$timeout.flush();
				});
			});

			describe("Testing noDbInit.checkDbVersion()", function(){
				it("", function(done){
					noDbInit.setVersion(1);

					noDbInit.queueUpgradeTasks(testUpgrades)
					.then(noDbInit.checkDbVersion)
					.then(function(startUpgrade){
						expect(testUpgrades).toEqual(true);
					}).catch(function(err){
						console.log(err);
					}).finally(done);

					$timeout.flush();
				});
			});
			// describe("then initialize Db", function(){
			// 	var upgradeRequired = true;



			// 	describe("should checkDbVersion", function(){
			// 		if(upgradeRequired){
			// 			describe("when upgrade needed", function(){
			// 				describe("for each queued upgrade task ...  ", function(){
			// 					it("when createStore, it should create a new objectStore");
			// 					it("when createIndex, it should create a new index on the specificed objectStore");
			// 					it("when deleteStore, given an objectStore name, it should delete the specified objectStore.");
			// 					it("when createIndex, given an objectStore, and an index name, it should delete the specified index.");
			// 				});
			// 			});
			// 		}
			// 	});
		});

		describe("when offline", function(){

		});
	});
	
});

