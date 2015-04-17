//globals.js
/*
	noinfopath-data@0.1.0
*/
(function(angular, undefined){
	var noInfoPath = {
		noFilterExpression: function (type, key, operator, match, logic){
			this.type = type;
			this.key = key;
			this.operator = operator;
			this.match = match;
			this.logic = logic;
		}	
	}

	window.noInfoPath = noInfoPath;

	angular.module("noinfopath.data", [
		'noinfopath.storage',
		'noinfopath.configuration',
		'noinfopath.http',
		'noinfopath.manifest',
		'noinfopath.indexeddb'
	]);
})(angular);
//storage.js
(function(){
	function mockStorage(){
		var _store = {},_len=0;
	    
		Object.defineProperties(this,{
	      "length": {
	        "get": function(){
	          var l=0;
	          for(var x in _store){l++;}
	          return l;
	        }
	      }
	    });
						
		this.key = function (i){
			var l=0;
			for(var x in _store){
			  if(i==l) return x;
			}
		};
	  
		this.setItem = function (k,v){
			_store[k] = v;
		};
	  
		this.getItem = function (k){
			return _store[k];
		};
	  
		this.removeItem = function (k){
			delete _store[k];
		};
	  
		this.clear = function (){
			_store = {};
		};
	}

	function noStorage(storetype){
		var _store;


		if(typeof window[storetype]=== "object")
		{
			_store = window[storetype];
		}else{

			_store = new mockStorage();
		}	
	    
	    
		Object.defineProperties(this,{
	      "length": {
	        "get": function(){
	          return _store.length;
	        }
	      }
	    });
						
		this.key = function (i){
			return _store.key(i);
		};

		this.setItem = function (k,v){
			_store.setItem(k,angular.toJson(v));
		};

		this.getItem = function (k){
			return angular.fromJson(_store.getItem(k));
		};

		this.removeItem = function (k){
			delete _store.removeItem(k);
		};

		this.clear = function (){
			_store.clear();
		};
	}

	angular.module("noinfopath.storage",[])
		.factory("noSessionStorage",[function(){
			return new noStorage("sessionStorage");
		}])

		.factory("noLocalStorage",[function(){			
			return new noStorage("localStorage");
		}])
		;
})(angular);

//configuration.js
(function(angular, undefined){
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.configuration", [])
		.config([function(){
			
		}])

		.run(['$rootScope', 'noConfig', function($rootScope, noConfig){

			noConfig.load()
				.then(function(){
					$rootScope.noConfigReady = true;
					//$rootScope.$emit("noConfig::ready")
				})
				.catch(function(err){
					console.error(err);
				})
		}])

		.provider("noConfig", [function(){
			var _currentConfig;
			
			function noConfig($http, $q, $timeout, $rootScope, noLocalStorage){
				Object.defineProperties(this, {
					"current": {
						"get": function() {return _currentConfig;}
					}
				});

				this.load = function (){
					return $http.get("/config.json")
						.then(function(resp){ 
							_currentConfig = resp.data;
							noLocalStorage.setItem("noConfig", _currentConfig);
						})
						.catch(function(){
							_currentConfig = noLocalStorage.get("noConfig");
						});
				};

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noConfigReady)
						{
							console.log("config Ready");
							deferred.resolve();
						}else{	
							$rootScope.$watch("noConfigReady", function(newval){
								if(newval){
									console.log("config Ready");
									deferred.resolve();								
								}

							});					
						}					
					});	

					return deferred.promise;			
				};				
			}

			this.$get = ['$http','$q', '$timeout', '$rootScope', 'noLocalStorage', function($http, $q, $timeout, $rootScope, noLocalStorage){
				return new noConfig($http, $q, $timeout, $rootScope, noLocalStorage);
			}];
		}])

	;
})(angular);

//http.js
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.http',[])
		.provider("noHTTP",[function(){
			
			this.configure = function(){
				angular.noop();
			}

			this.createTransport = function(){
				return new noREST();
			}

			function noREST($q, $http){
				var SELF = this;

				this.create = function(resourceURI, formdata){
					var json = angular.toJson(formdata);
					console.log(resourceURI);

					var deferred = $q.defer(),
						req = {
							method: "POST",
							url: resourceURI,
							data: json,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							withCredentials: true
						};
				
					$http(req)
						.success(function(data){
							//console.log(angular.toJson(data) );

							deferred.resolve(data);
						})
						.error(function(reason){
							console.error(reason);
							deferred.reject(reason);
						});

				
	
					return deferred.promise;
				}

				this.read = function(resourceURI, query){
					//console.log(!!query);

					var deferred = $q.defer(),
						url = resourceURI + (!!query ? query : ""),
						req = {
							method: "GET",
							url: url,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							withCredentials: true
						};
					
					$http(req)
						.success(function(data){
							//console.log( angular.toJson(data));
							deferred.resolve(data.value);
						})
						.error(function(reason){
							deferred.reject(reason);
						});

					return deferred.promise;
				}

				this.update = function(){
					var deferred = $q.defer();
					$timeout(function(){
						console.warn("TODO: Implement INOCRUD::update.");
						deferred.resolve();
					})
					return deferred.promise;
				}

				this.destroy = function(){
					var deferred = $q.defer();
					$timeout(function(){
						console.warn("TODO: Implement INOCRUD::destroy.");
						deferred.resolve();
					})					
					return deferred.promise;
				}
			}

			this.$get = ['$q', '$http', function($q, $http){
				return new noREST($q, $http)
			}]
		}])
	;
})(angular);

//manifest.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.manifest", ['ngLodash','noinfopath.configuration', 'noinfopath.http', 'noinfopath.helpers', 'noinfopath.storage'])
		.config([function(){
		}])

		.run(['$rootScope', 'noConfig', 'noManifest', function($rootScope, noConfig, noManifest){
			noConfig.whenReady()
				.then(_start)
				.catch(function(err){
					console.error(err);
				});

			function _start(){	
				noManifest.load()
					.then(function(data){
						$rootScope.noManifest = data;
						//$rootScope.$emit("noManifest::ready");
					})
					.catch(function(){
						console.log("noManifest connection failed.")
					});
			}	
		}])

		.provider("noManifest",[function(){
			var _manifestMap = {
				localStorage:{},
				sessionStorage: {},
				indexedDB: {}
			}, _deltas = {
				localStorage: {},
				sessionStorage: {},
				indexedDB: {}
			}, _dbConfig, _tableNames = [];

			function noManifest(_, noHTTP, noUrl, noLocalStorage, $rootScope, $q, $timeout, noConfig){
				Object.defineProperties(this, {
					"current": {
						"get": function() {return _manifestMap;}
					},
					"deltas": {
						"get": function() {return _deltas;}
					},
					"dbConfig": {
						"get": function() {return _dbConfig; }
					},
					"lookupTables": {
						"get": function() {return _tableNames; }
					}
				});

				function _createManifestMap(cacheManifest){
					function _isTable(obj, name){
						return obj.TableName === name;
					}
					var keys =  _.pluck(cacheManifest, "TableName");

					for(var i in keys)
					{	
						var tn = keys[i],
							item =  _.find(cacheManifest, {"TableName": tn});
						
						if(tn.indexOf("LU") === 0) {
							_tableNames.push({ text: item.EntityName, value: tn });
						}
						

						_manifestMap[item.StorageLocation][tn] = item;
					}
				};

				function _deltaManifest(newManifest){

					var oldCacheManifest = noLocalStorage.getItem("NoCacheManifest") || {
						localStorage:{},
						sessionStorage: {},
						indexedDB: {}					
					};
						//oldKeys = _.pluck(oldCacheManifest[storageType], "TableName"),
						//newKeys = _.pluck(_manifestMap[storageType], "TableName"),
						//diffOld = _.difference(oldKeys, newKeys),
						//diffNew = _.difference(newKeys, oldKeys)
						//;

					_.each(["localStorage", "indexedDB"], function(storageType){
						var keys = _.pluck(_manifestMap[storageType], "TableName")
						_.each(keys, function(key){
							var local = oldCacheManifest[storageType][key],
								localTime = local ? Date.parse(local.LastTransaction) : null,
								serv = _manifestMap[storageType][key],
								servTime =  Date.parse(serv.LastTransaction);

							if(!local){
								_deltas[storageType][key] = _manifestMap[storageType][key];
							}else{
								if(!_.isEqual(local, serv))
								{
									if(servTime > localTime)
									{
										_deltas[storageType][key] = _deltas[storageType][key] = _manifestMap[key];;
									}
								}
							}

						});					
					});
				}

				function _makeDBConfig(){
					var config = {};

					_.each(_manifestMap.indexedDB, function(table){
						var cfg = angular.fromJson(table.IndexedDB);
						config[table.TableName] = cfg.keys;
					});
					//console.debug(config);
					
					_dbConfig = config;
				};

				this.load = function (){
					return noHTTP.read(noUrl.makeResourceUrl(noConfig.current.RESTURI, "NoCacheManifest"))
						.then(function(data){
							noLocalStorage.setItem("noManifest", data);
							_createManifestMap(data);
							//this._deltaManifest();
							_makeDBConfig();
							$rootScope.noManifestReady = true;
						})
						.catch(function(){
							//Assume offline or no connection to REST Service
							var data = noLocalStorage.getItem("noManifest")
							if(data){
								_createManifestMap(data);
								//this._deltaManifest();
								_makeDBConfig();
							}else{
								throw "No Configuration, please again when online."
							}
						});
				};

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noManifestReady)
						{
							console.log("Manifest Ready");
							deferred.resolve();
						}else{	
							$rootScope.$watch("noManifestReady", function(newval){
								if(newval){
									console.log("Manifest Ready");
									deferred.resolve();									
								}

							});					
						}					
					});	

					return deferred.promise;			
				};				
			}
	
			this.$get = ['lodash', 'noHTTP', 'noUrl', 'noLocalStorage', '$rootScope', '$q', '$timeout', 'noConfig', function(_, noHTTP, noUrl, noLocalStorage, $rootScope, $q, $timeout, noConfig){
				return new noManifest(_, noHTTP, noUrl, noLocalStorage, $rootScope, $q, $timeout, noConfig);
			}]
		}])
	;
})(angular);

//indexeddb.js
(function(angular, Dexie, undefined){

	angular.module("noinfopath.indexeddb", ['ngLodash', 'noinfopath.manifest'])

		.factory("noIndexedDB", ['$rootScope','lodash', 'noManifest', '$q', '$timeout', function($rootScope, _, noManifest, $q, $timeout){
			var SELF = this, dex;

			function queryBuilder(table, options){

				var operators = {
					"eq": function(a, b){
						return a === b;
					}
				}, _total = 0;

				function _filter(table, filter){

					var deferred = $q.defer(),
						fields,
						values,
						logic;

					$timeout(function(){
						if(filter)
						{
							fields = _.pluck(filter.filters, "field");
							values = _.pluck(filter.filters, "value");
							logic = filter.logic;

							//console.log(fields, values, filter)
							console.warn("TODO: This is hard coded to only work with keys. Expand to full where clause functionality.")
							var w = fields.length === 1 ? fields.join("+") : "[" + fields.join("+") + "]",
								v = values.length === 1 ? values[0] : values,
								collection = table.where(w).equals(v);

							deferred.resolve(collection);
						}else{
							deferred.resolve(table.toCollection());
						}
					});


					return deferred.promise;
				}

				function _count(collection){
					var deferred = $q.defer();

					collection.count()
						.then(function(total){
							_total = total;
							deferred.resolve(collection);
						})
						.catch(function(err){
							deferred.reject(err);
						});

					return deferred.promise;
				}

				function _sort(collection, sort){	
					var deferred = $q.defer(),
						arry = [];

					$timeout(function(){
						if(sort && sort.length > 0){
							if(sort[0].dir === "desc")
							{
								collection.reverse();
							}

							collection.sortBy(sort[0].field)
								.then(function(array){
									console.warn("TODO: Implement multi-column sorting.");
									deferred.resolve(array);
								})
								.catch(function(err){
									console.error(err);
									deferred.reject(err);
								})
						}else{
							collection.toArray()
								.then(function(array){
									deferred.resolve(array);
								})
								.catch(function(err){
									console.error(err);
									deferred.reject(err);
								});
						}
					});

					return deferred.promise;
				}

				function _page(array, skip, take){
					var deferred = $q.defer();

					$timeout(function(){
						if(take){	

							deferred.resolve(array.slice(skip, skip+take));
						}else{
							deferred.resolve(collection);
						}
					})

					return deferred.promise;
				}

				_filter(table, options.data.filter)
					.then(function(collection){
						return _count(collection);
					})
					.then(function(collection){
						return _sort(collection,options.data.sort)
					})
					.then(function(array){
						return _page(array, options.data.skip, options.data.take);
					})
					.then(function(array){
						array.__no_total__ = _total;
						options.success(array);
					})
					.catch(function(err){
						console.error(err);
						options.error(err);
					})					
			};

			function _bind(tables){
				function _import(table, data, deferred, progress){
					var total = data ? data.length : 0;
						
					$timeout(function(){progress.rows.start({max: total})});
					var currentItem = 0;

					dex.transaction('rw', table, function (){
						_next();
					});	
					
					
					function _next(){
						if(currentItem < data.length){
							var datum = data[currentItem];

							table.add(datum).then(function(){
								$timeout(function(){ progress.rows.update.call(progress.rows); });
							})
							.catch(function(err){
								console.error(err);
								throw err;
							})
							.finally(function(){
								currentItem++;
								_next();								
							});	

						}else{
							deferred.resolve(table.name);
						}
					}											
				}

				_.each(tables, function(table){
					var tmp = dex[table.TableName];
					tmp.noCRUD = new noCRUD(table);
					//tmp.IndexedDB = angular.fromJson(table.IndexedDB);
					//this[table.TableName].noInfoPath = table;
					tmp.bulkLoad = function(data, progress){
						//console.info("bulkLoad: ", table.TableName)
						var deferred = $q.defer();

						this[table.TableName].clear()
							.then(function(){
								_import.call(this, this[table.TableName], data, deferred, progress);
							}.bind(this));

						return deferred.promise;
					}.bind(dex);
				});
			}			

			Dexie.prototype.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noIndexedDBReady)
					{
						console.log("IndexedDB Ready");
						deferred.resolve();
					}else{	
						$rootScope.$watch("noIndexedDBReady", function(newval){
							if(newval){
								console.log("IndexedDB Ready");
								deferred.resolve();								
							}
						});					
					}					
				});	

				return deferred.promise;			
			};

			Dexie.prototype.configure = function(dbinfo, stores){
				var deferred = $q.defer();

				dex.on('error', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.error("Uncaught error: " + err);
				    deferred.reject(err);
				});
				dex.on('blocked', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.warn("IndedexDB is currently execting a blocking operation.");
				});	

				dex.on('versionchange', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.error("IndexedDB as detected a version change");
				});

				dex.on('populate', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.warn("IndedexDB populate...  not implemented.");
				});	

				dex.on('ready', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.info("IndedexDB is ready");
					_bind(noManifest.current.indexedDB);	
					$rootScope.noIndexedDBReady = true;
				    deferred.resolve();
				});	

				if(dbinfo.name !== dex.name) throw "DB Name is invalid.";

				if(!dex.isOpen()){
					dex.version(dbinfo.version).stores(stores);
					dex.open();
				}

				return deferred.promise;
			}.bind(dex);


			function noCRUD(noTable, type) {
				var SELF = this;

				this.type = type || "kendo";
				this.tableName = noTable.TableName;
				this.noTable = noTable;
				this.noTable.IndexedDB = angular.fromJson(this.noTable.IndexedDB);
				this.create = function(options) {
					console.log(options);
					if(options){
						var tbl = dex[SELF.tableName];

						dex.transaction("rw", tbl, function(){
							//tbl.add(options.data);

							if(SELF.noTable.IndexedDB.pk){
								tbl.orderBy(SELF.noTable.IndexedDB.pk).last()
									.then(function(lastOne){
										//This is a temporary hack.  Will be moving to
										//using UUID's soon.
										var newKey =  Number(lastOne[SELF.noTable.IndexedDB.pk]) + 1;
										options.data[SELF.noTable.IndexedDB.pk] = newKey;
										tbl.add(options.data);
									});								
							}else{
								tbl.add(options.data);
							}

						})
						.then(function(resp){
							console.log("Transaction complete. ", resp || "");
							options.success(options.data);
						})
						.catch(function(err){
							console.error(err);
							options.error(err);
						})
					}					
				};

				this.read = function(options) {
					var deferred = $q.defer();

					//console.debug(options);

					var tbl = dex[SELF.tableName];

					dex.transaction("r", tbl, function(){
						if(options){
							queryBuilder(tbl, options);
						}else{
							tbl.toArray();
						}
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
						deferred.resolve(resp);
					})
					.catch(function(err){
						console.error(err);
						deferred.reject(err);
					})	

					return deferred.promise;					
				};

				this.update = function(options) {
					console.log(options);
					if(options){
						var tbl = dex[SELF.tableName],
							key = options.data[SELF.noTable.IndexedDB.pk];

						dex.transaction("rw", tbl, function(){
							tbl.update(key, options.data)
								.then(function(resp){
									if(resp === 1)
									{
										options.success(options.data);
									}else{
										options.error("Record not updated.");
									}									
								});
						})
						.then(function(resp){
							console.log("Transaction complete. ", resp || "");
						})
						.catch(function(err){
							console.error(err);
							options.error(err);
						})
					}						
				};

				this.destroy = function(options) {
					console.log(options);
					if(options){
						var tbl = dex[SELF.tableName],
							key = options.data[SELF.noTable.IndexedDB.pk];

						dex.transaction("rw", tbl, function(){
							tbl.delete(key)
								.then(options.success)
								.catch(options.error);
						})
						.then(function(resp){
							console.log("Transaction complete. ", resp || "");
						})
						.catch(function(err){
							console.error(err);
							options.error(err);
						})
					}		
				};
			}

			Dexie.prototype.createTransport = function(tableName){
				if(angular.isObject(tableName)){
					return new noCrud(tableName);
				}else{
					return new noCRUD(noManifest.current.indexedDB[tableName]);
				}
				
			}

			return 	dex = new Dexie("NoInfoPath-v3");
		}])

		.service("noBulkData", ['$q', '$timeout','noConfig', 'noUrl', 'noIndexedDB', function($q, $timeout, noConfig, noUrl, noIndexedDB){
				var _tasks = [], _datasvc;

				function _queue(manifest){
					var urls = noUrl.makeResourceUrls(noConfig.current.RESTURI, manifest);

					for(var k in urls){
						var task = manifest[k];
						task.url = urls[k];
						_tasks.push(task);
					}
				}

				function _recurse(deferred, progress) {
					var task = _tasks.shift(), table;

					if(task){
						$timeout(function(){
							progress.tables.update("Downloading " + task.TableName);
							progress.tables.changeCss("progress-bar-success progress-bar-striped active");							
						})
						console.info("Downloading " + task.TableName);

						table = noIndexedDB[task.TableName];

						if(table)
						{
							_datasvc.read(task.url)
								.then(function(data){
									if(data){
										console.info("\t" + data.length + " " + task.TableName + " downloaded.")
										$timeout(function(){
											progress.tables.changeMessage("Importing " + data.length + " items from " + task.TableName, false);
											progress.tables.changeCss("progress-bar-info progress-bar-striped active");
										});
										console.info("\tImporting " + data.length + " items from " + task.TableName);
										noIndexedDB[task.TableName].bulkLoad(data, progress)
											.then(function(info){
												//deferred.notify(info);
												console.info("\t" + info + " import completed.");									
												_recurse(deferred, progress);
											})
											.catch(function(err){
												console.error(err);
												_recurse(deferred, progress);
											})
											.finally(angular.noop, function(info){
												console.info(info);
											});								
									}else{
										console.info("\tError downloading " + task.TableName);
										$timeout(function(){
											progress.rows.start({min: 1, max: 1, showProgress: false})
											progress.rows.update("Error downloading " + task.TableName);
											progress.rows.changeCss("progress-bar-warning");
										});
										_recurse(deferred, progress);
									}
							})
							.catch(function(err){
								$timeout(function(){
									progress.rows.start({min: 1, max: 1, showProgress: false})
									progress.rows.update("Error downloading " + task.TableName);
									progress.rows.changeCss("progress-bar-warning");												
								})
								_recurse(deferred, progress);

							});
						}
						
					}else{
						deferred.resolve();  //Nothing left to do
					}
				}

				this.load = function(noManifest, datasvc, progress){
					var deferred = $q.defer();

					_datasvc = datasvc;
					_queue(noManifest);
					_recurse(deferred, progress);

					return deferred.promise;
				}.bind(this);
		}])
		;
})(angular, Dexie);