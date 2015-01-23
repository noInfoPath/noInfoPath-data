(function(angular, undefined){
	angular.module('noinfopath.data.init',['xc.indexedDB','noinfopath.logger'])
		.service('noDbInit', ['$q','$http', '$timeout', '$indexedDB', 'noLogService', function($q, $http, $timeout, $indexedDB, log){
			

			var tasks,
				internal_version = 0,
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
				}				
			;

			this.dbPromise = function dbPromise(upgrade, revision) {
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


			this.setVersion = function setVersion(version){
				internal_version = version * 1000;
			};

			this.checkDbVersion = function checkDbVersion(version){
			    var deferred = $q.defer(),
			    	revision = (version * 1000) - tasks.length,
			    	request = $indexedDB.open(NODB.DBNAME, revision),
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
			};

			this.requestDbUpgrades = function requestDbUpgrades(uri){
				var deferred = $q.defer();

				$http.get(url)
					.success(function(data){
						//currentUpgrade = data;
						deferred.resolve(data);
					})
					.error(function(err){
						deferred.reject(err);
					})
				return deferred.promise;
			};

			this.queueUpgradeTasks = function queueUpgradeTasks(currentUpgrade){
				var deferred = $q.defer(), 
					queue = [],
					upgrades = currentUpgrade;

				$timeout(function(){
					angular.forEach(upgrades.collections, function(collection, name){
						angular.forEach(collection, function(upgrade){
							var fn = upgradeActions[upgrade.action];
							queue.push([name, upgrade, fn]);
						});
					});	
					//tasks = queue;
					deferred.resolve(queue);	
				},1);

				return deferred.promise;
			};

			this.start = function start(queue){ 
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
			};

			this.run = function run(whenDone){

				var task = tasks.shift();

				if(!!task){
					var p = new this.dbPromise(task, internal_version++);
					p.then(function(data){
						run(whenDone);
					}).catch(function(err){
						whenDone.reject(err);
					});								
				}


				return whenDone.promise;
			};

			this.initDb = function initDb(){
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
			};

			this.initCollections = function initCollections(){
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
			};

			this.exec = function exec(){
				var deferred = $q.defer();

				this.requestDbUpgrades(config.id)
					.then(queueUpgradeTasks)
					.then(initCollections)
					.then(initDb)
					.then(deferred.resolve)
					.catch(deferred.reject);	

				return deferred.promise;				
			};

		}])
})(angular);

