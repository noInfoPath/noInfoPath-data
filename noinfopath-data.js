/**
 * @module  
 */
(function(angular,undefined){
	"use strict";

	var indexedDBProviderRef;

	angular.module('noinfopath.data', ['xc.indexedDB'])

		.constant('NODB_CONSTANTS', {
			DBNAME: "NoInfoPath",
			DATA_READY: "NoInfoPath::dataReady",
			DATA_CHANGED: "NoInfoPath::dataChanged"
		})
		
		.config(['$indexedDBProvider', function($indexedDBProvider){
			//Expose the $indexedDBProvider globally within this
			//namespace so that we can delay the configuration of 
			//the DB provider until, the configuration
			//has been downloaded from the server.
			indexedDBProviderRef = $indexedDBProvider;
		}])

		.provider('noDB', [function() {
			var endpointUri;

			function _setEndPointUri(uri){
				endpointUri = uri;
			}
			this.setEndPointUri = _setEndPointUri;

			this.$get = [
				'$window', 
				'$indexedDB', 
				'NODB_CONSTANTS', 
				'noLogService', 
				'$rootScope',
				function($window, $indexedDB, NODB, log,$rootScope){

					if(!endpointUri) throw {"error": 10000, "message": "noDB requires that you call setEndPointUri during the angular.config phase."}
					
					var SELF = this;
					this.collection = {};

					/**
					 * Initialize or upgrade the IndexedDB from provided
					 * configuration data.
					 * @param  {object} config object that contains information
					 * @return {void}        [description]
					 */
					function init(config, cb){

						//Define actions that can be performed on the database.
						var dbActions = {
								drop: function (){
									$window.indexedDB.deleteDatabase(NODB.DBNAME);
									log.write("Database has been dropped.")
								}
							},
							currentUpgrade = config.database.upgrades[config.database.version];

						//Run any db actions that exist in the current config.
						//Typically this array is empty. But, useful if you want
						//to start over with version 1 of the NoInfoPath database.
						//This can be accomplished by adding {action: "drop"}
						//to the array.
						angular.forEach(currentUpgrade.db, function(upgrade){
							dbActions[upgrade.action](upgrade);
						});


						//Next open and upgrade the database if possible and required.
						var dbOpenReq = $window.indexedDB.open(NODB.DBNAME, config.database.version)
							dbOpenReq.onerror = function(e){
								log.write(event.target.error.message);			
							};

							dbOpenReq.onsuccess = function(e){
								log.write('Database opened successfully.');
								var db = e.target.result;
								
								angular.forEach(db.objectStoreNames, function(name){
									SELF.collection[name] = new collection(db, name);
								});
								log.write('NoInfoPath interfaces initialized.')

								if(cb) cb();
							};

							dbOpenReq.onupgradeneeded = function(e){

								log.write('Upgrade needed.')
								
								var db = e.target.result,
									upgradeActions = {
										createStore: function(name, action){
											log.write('Create object store.')
											objectStore = db.createObjectStore(name, action.options);
										},
										createIndex: function(name, action){
											log.write('Create Index.')

											if(!objectStore){
												var tx = e.target.transaction;
												
												tx.onerror = function(e){
													log.write(e.target.error.message)
												};

												tx.oncomplete = function(e){
													log.write('Transaction completed successfully.')
												}

												objectStore = tx.objectStore(name);
											}

											objectStore.createIndex(
												action.property + "_ndx", 
												action.property, action.options);
										}
									}, objectStore;

								db.onerror = function(e){
									log.write(e.target.error.message)
								}

								angular.forEach(currentUpgrade.collections, function(store, name){
									angular.forEach(store, function(upgrade){
										upgradeActions[upgrade.action](name, upgrade);
									});
								});
							};
					}
					this.init = init;

					function collection(db, store){
						var SELF = this;
						this.db = db;
						this.store = store;

						this.one = function(id, cb){
							var tx = this.db.transaction([this.store], "readwrite");
								tx.onerror = function(e){
								log.write(e.target.error.message)
								$rootScope.$apply();
							};

							tx.oncomplete = function(e){
								log.write('Transaction completed successfully.')
								$rootScope.$apply();
							}

							var os = tx.objectStore(this.store);		

							var r = os.get(id);


							r.onsuccess = function(e){
								$rootScope.$broadcast(NODB.DATA_READY, {collection: SELF.store,  data: e.target.result});
								if(cb) cb(e.target.result);
							} 
						};

						this.query = function(criteria, cb){
							log.write('TODO: implement queries that use criteria.')
							var tx = this.db.transaction([this.store], "readwrite");
								tx.onerror = function(e){
								log.write(e.target.error.message)
								$rootScope.$apply();
							};

							tx.oncomplete = function(e){
								log.write('Transaction completed successfully.')
								$rootScope.$apply();
							}

							var os = tx.objectStore(this.store);		

							var r = os.openCursor(), results= [];

							r.onsuccess = function(event) {
							  var cursor = event.target.result;
							  if(cursor) {
							    // cursor.value contains the current record being iterated through
							    // this is where you'd do something with the result
							    if(cursor.value){
								    cursor.value.ID = cursor.primaryKey;
								    results.push(cursor.value);							    	
							    }
							    cursor.continue();
							  } else {
								$rootScope.$broadcast(NODB.DATA_READY, {collection: SELF.store,  data:results});
							    if(cb) cb(results);
							  }
							};
						};

						this.upsert = function(data, cb){
							var tx = this.db.transaction([this.store], "readwrite");

							tx.onerror = function(e){
								log.write(e.target.error.message);
								$rootScope.$apply();
							};

							tx.oncomplete = function(e){
								log.write('Transaction completed successfully.')
								$rootScope.$apply();
							}

							var os = tx.objectStore(this.store);

							var r = os.add(data);

							r.onsuccess = function(e){							
								$rootScope.$broadcast(NODB.DATA_CHANGED, {collection: SELF.store,  data: e.target.result});
								if(cb) cb(e.target.result);
							} 
						};

						this.del = function(id, cb){
							var tx = this.db.transaction([this.store], "readwrite");
							
							tx.onerror = function(e){
								log.write(e.target.error.message)
								$rootScope.$apply();
							};

							tx.oncomplete = function(e){
								log.write('Transaction completed successfully.')
								$rootScope.$apply();
							}

							var os = tx.objectStore(this.store);		

							var r = os.delete(id);


							r.onsuccess = function(e){
								if(cb) cb(e.target.result);
							} 							
						};
					}

				
					log.write('initialized noDBProvider')


					return this;
				}
			];
		}])	
	;
})(angular);

