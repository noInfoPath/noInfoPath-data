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
			DATA_CHANGED: "NoInfoPath::dataChanged",
			DB_READY: "NoInfoPath::dbReady",
			SYNC_COMPLETE: "NoInfoPath::dbSyncComplete",
			COLLECTION: {        
				"NODBUPGRADES": "nodbupgrades"
			}
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

			function _crudUrl(collectionName,id){
				var url = endpointUri + "/entity/mongodb/" + collectionName;
				if(id) url = url + "/" + id;
				return url;
			}

			this.$get = [
				'$q',
				'$window', 
				'$http',
				'$indexedDB', 
				'NODB_CONSTANTS', 
				'noLogService', 
				'$rootScope',
				'noOnlineStatus',
				'NOSYNC_CONSTANTS',
				function($q, $window, $http, $indexedDB, NODB, log,$rootScope, noStatus, NOSYNC){

					if(!endpointUri) throw {"error": 10000, "message": "noDB requires that you call setEndPointUri during the angular.config phase."}
					
					var SELF = this,
						objectStore,
						queue,
						upgradeActions = {
							createStore: function(name, action, deferred){
								log.write('Create object store: ' + name);
								var db = this.result, 
									objectStore,
								 	storeExists = _.values(this.result.objectStoreNames).indexOf(name) > -1;
									
								if(storeExists){
									objectStore = this.transaction.objectStore(name);
								}else{
									try{
										objectStore = db.createObjectStore(name, action.options);	
									}catch(err){
										deferred.reject(err);
									}
								}
								deferred.resolve(objectStore);						
							},
							createIndex: function(name, action, deferred){
								log.write('Create Index: ' + name);

								var tx = this.transaction,
									ndx = action.property + "_ndx",
									objectStore;
								
								tx.onerror = function(e){
									log.write('Create Index Error: ' + name);
									deferred.reject(e);							
								};

								tx.oncomplete = function(e){
									deferred.resolve();					
								}
	
								objectStore = tx.objectStore(name);

								if(_.values(objectStore.indexNames).indexOf(ndx) == -1){
									objectStore.createIndex(ndx, action.property, action.options);
								}					
							},
							deleteStore: function(name, action, deferred){
								log.write('Delete object store: ' + name);
								var db = this.result,
								 	storeExists = _.values(this.result.objectStoreNames).indexOf(name) > -1;
									
								if(storeExists){
									try{
										db.deleteObjectStore(name);
										deferred.resolve(true);
									}catch(err){
										deferred.reject(err);
									}
								}else{
									deferred.resolve(objectStore);	
								}
							},
							deleteIndex: function(name, action, deferred){
								log.write('Delete Index: ' + name);

								var tx = this.transaction,
									ndx = action.property + "_ndx",
									objectStore;
								
								tx.onerror = function(e){
									log.write('delete Index Error: ' + name);
									deferred.reject(e);							
								};

								tx.oncomplete = function(e){
									deferred.resolve();					
								}
	
								objectStore = tx.objectStore(name);

								if(_.values(objectStore.indexNames).indexOf(ndx) > -1){
									objectStore.deleteIndex(ndx, action.property, action.options);
								}		
							},						
							populateStore: function(name, action, deferred){								
								var entity = SELF.collection[name],
									db = this.result;

								$http.get(_crudUrl(name))
									.success(function(data){
										//log.write(data);
										var list = data.results || data;
										entity.upsert(db, list)
											.then(deferred.resolve)
											.finally(function(d){
												log.write("finally:" + d);
											}, function(info){
												log.write(info);
											});										
									})
									.error(deferred.reject);								
							},
							clear: function(name,action, deferred){
								if(!objectStore){
									var tx = e.target.transaction;
									
									tx.onerror = function(e){
										log.write(e.target.error.message)
									};

									tx.oncomplete = function(e){
										log.write('Clear completed successfully.')
									}

									objectStore = tx.objectStore(name);
								}
							}
						},
						currentUpgrade;

					this.collection = {};

					function dbPromise(upgrade, revision) {
				        var deferred = $q.defer(),
				        	request = indexedDB.open(NODB.DBNAME, revision),
				        	fn = upgrade.pop();

					        request.onupgradeneeded = function onupgradeneeded(event) {
					            var db = request.result,
					            	tx = db.transaction;

						        tx.oncomplete = function oncomplete(ev) { 
						        	log.write("tx.oncomplete");
						        	deferred.resolve(); 
						        }
						      
						        tx.onabort = function onabort(ev) { 
						        	log.write("tx.onabort")
						        	deferred.reject(transaction.error.toString()); 
						        };

								upgrade.push(deferred);		

						       	if(fn) fn.apply(request, upgrade);
					        };

					        request.onerror = function onerror(ev) { deferred.reject(request.error); };

					        return deferred.promise.then(function(){
					        	request.result.close();
					        });
					};					

					function _ceateQueue(upgrades){
						queue = [];
						angular.forEach(upgrades.collections, function(collection, name){
							angular.forEach(collection, function(upgrade){
								queue.unshift([name, upgrade, upgradeActions[upgrade.action]]);
							});
						});		
					}

					function _broadcast(event){
						$rootScope.$broadcast(event || NODB.DB_READY, true);
					}

					/**
					 * Initialize or upgrade the IndexedDB from provided
					 * configuration data.
					 * @param  {object} config object that contains information
					 * @return {void}        [description]
					 */
					function init(config, cb){
						var deferred = $q.defer();

						noStatus.update(NOSYNC.STATUS_CODES.DBINIT);

						var tasks,
							internal_version = (config.ver * 1000)
						;

						function checkDbVersion(version){
					        var deferred = $q.defer(),
					        	revision = (version * 1000) - tasks.length,
					        	request = indexedDB.open(NODB.DBNAME, revision),
					        	db;

					        request.onerror = function onerror(ev) { 
					        	if(ev.target.error.name == "AbortError"){
					        		//Assume this was because we explictly
					        		//called abort() in the upgradeneeded event.
					        		deferred.resolve(true); 
					        	}else if(ev.target.error.name == "VersionError"){
					        		//assume this means that the version does
					        		//already exist.
					        		deferred.resolve(false);
					        	}				         	
					     	};

					     	request.onsuccess = function onsuccess(ev){
								db = request.result;
								db.close();
								deferred.resolve(false);
					     	};

					     	request.onupgradeneeded = function onupgradeneeded(ev){
					     		event.target.transaction.abort();
					     	};

					        return deferred.promise;
						}

						function requestDbUpgrades(upgradeId){
							var deferred = $q.defer();

							log.write("getting upgradeid " + upgradeId);
							$http.get(_crudUrl(NODB.COLLECTION.NODBUPGRADES, upgradeId))
								.success(function(data){
									currentUpgrade = data;
									deferred.resolve();
								})
								.error(function(err){
									deferred.reject(err);
								})
							return deferred.promise;
						}

						function queueUpgradeTasks(){
							var deferred = $q.defer(), 
								queue = [],
								upgrades = currentUpgrade;

							setTimeout(function(){
								angular.forEach(upgrades.collections, function(collection, name){
									angular.forEach(collection, function(upgrade){
										var fn = upgradeActions[upgrade.action];
										queue.push([name, upgrade, fn]);
									});
								});	
								tasks = queue;
								deferred.resolve(queue);	
							},1);

							return deferred.promise;
						}

						function start(queue){ 
							internal_version = internal_version - tasks.length + 1;
							var deferred = $q.defer();
							run(deferred)
								.then(function(data){
									log.write(data);
								})
								.catch(function(err){
									log.write(err.name + ": " + err.message);
								})
								.finally(function(){
									log.write("run, finally...");
								});				

							var deferred = $q.defer();
							
							return deferred.promise;
						}

						function run(whenDone){

							var task = tasks.shift();

							if(!!task){
								var p = new dbPromise(task, internal_version++);
								p.then(function(data){
									run(whenDone);
								}).catch(function(err){
									whenDone.reject(err);
								});								
							}


							return whenDone.promise;
						}

						function initDb(){
							var deferred = $q.defer();
							
							checkDbVersion(config.ver)							
								.then(function(startUpgrade){
									if(startUpgrade){
										log.write("db upgrade required");
										start(tasks)
											.then(function(){
												log.write("db upgrade completed at version: " + internal_version);
												deferred.resolve(true)
											})
											.catch(function(err){
												deferred.reject(err);
											})
									}else{
										log.write("db upgrade is not required");
										deferred.resolve(true);
									}
								});

							return deferred.promise;
						}

						function initCollections(){
							var deferred = $q.defer();
							
							setTimeout(function(){
								angular.forEach(currentUpgrade.collections, function(col, name){
									SELF.collection[name] = new collection(name, col);
								});
								
								log.write('NoInfoPath collection interfaces initialized.')
								//_broadcast(NODB.DB_READY);
								deferred.resolve(true);
							},1);							

							
							return deferred.promise;
						}

						requestDbUpgrades(config.id)
							.then(queueUpgradeTasks)
							.then(initCollections)
							.then(initDb)
							.then(deferred.resolve)
							.catch(deferred.reject);	

						return deferred.promise;										
					}
					this.init = init;



					function collection(name, config){
						var SELF = this, createNode = _.findWhere(config, {"action": "createStore"});
						this.store = name;
						this.primaryKey = createNode &&  createNode.options.keyPath  ? createNode.options.keyPath + "_ndx" : "ID";

						this.indecies = function(db){
						}

						this.one = function(db, id, cb){
							var tx = db.transaction([this.store], "readwrite");
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

						this.query = function(db, criteria, cb){
							log.write('TODO: implement queries that use criteria.')
							var tx = db.transaction([this.store], "readwrite");
								tx.onerror = function(e){
								log.write(e.target.error.message)
								$rootScope.$apply();
							};

							tx.oncomplete = function(e){
								log.write('Query completed successfully.')
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

						this.upsert = function(db, data, cb){

							var deferred = $q.defer(),
								items = angular.isArray(data) ? data : [data];

							function _index(db, name){
								var deferred = $q.defer(),
									ndxName = !!name ? (name + "_ndx") : "ID",
									tx = db.transaction([SELF.store], "readwrite"),
									os = tx.objectStore(SELF.store), 
									ndx = os.index(name);

								tx.onerror = function(e){
									//log.write(e.target.error.message);
									//$rootScope.$apply();
									
									deferred.reject(e.target.error);
								};

								tx.oncomplete = function(e){
									//log.write('Transaction completed successfully.')
									//$rootScope.$apply();
									deferred.resolve(ndx);
								}

								os.onsuccess = function(e){
									
									debugger;
									deferred.resolve(ndx);
								}
								//log.write(os.indexNames);
								return deferred.promise;							
							}

							function _add(db, datum){

								var deferred = $q.defer(),
									tx = db.transaction([SELF.store], "readwrite"),
									os = tx.objectStore(SELF.store),
									r = os.add(datum);

								tx.onerror = function(e){
									//log.write(e.target.error.message);
									//$rootScope.$apply();
									deferred.notify(e.target.error);
								};

								tx.oncomplete = function(e){
									//log.write('Transaction completed successfully.')
									//$rootScope.$apply();
									deferred.notify(e);
								}

								r.onsuccess = function(e){
									deferred.resolve(e.target.result);
								};

								r.onerror = function(e){
									deferred.reject(e.target.error);
								};

								return deferred.promise;
							}

							_index(db, SELF.primaryKey)
								.then(function(ndx){
									log.write(ndx);
								})
								.catch(function(err){
									log.write(err);
								});

							// angular.forEach(items, function(item,k){
							// 	_add(db, item)
							// 		.then(deferred.notify)
							// 		.catch(deferred.notify);
							// });							


							return deferred.promise;
						};

						this.del = function(db, id, cb){
							var tx = db.transaction([this.store], "readwrite");
							
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

						this.sync = function(){

							var deferred = $q.defer()
							
							var eag = {
								adds: [],
								update: [],
								deletes: []
							}

							this.query({},function(r){
								angular.forEach(r, function(obj, key){
									eag.adds.push({
										key: {"indexedDB": key},
										doc: obj
									})									
								})
								deferred.resolve(eag);
							})

							
							return deferred.promise;
						}
					}
				
					log.write('initialized noDBProvider')

					return this;
				}
			];
		}])	
	;
})(angular);

