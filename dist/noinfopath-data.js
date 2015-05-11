/*
	noinfopath-data@0.1.7
*/

//globals.js
(function(angular, undefined){
	"use strict";
	
	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers']);

	var noInfoPath = {
		noFilterExpression: function (type, key, operator, match, logic){
			this.type = type || "indexed";
			this.field = key;
			this.operator = operator;
			this.value = match;
			this.logic = logic;
		},	

		noFilter: function (table){
			var _table = table,
				_filters = [],
				_logic = "and";

			Object.defineProperties(this, {
				"filters": {
					"get": function(){
						return _filters;
					}
				},
				"logic": {
					"get": function(){ return _logic;},
					"set": function(value){ _logic = value }
				}
			});

			this.__proto__.type = "noFilter";
			this.__proto__.add = function (key, operator, match, logic){
				var index = _table.schema.indexes.filter(function(a){ return a.name === key; }),
					isIndexed = index.length == 1 || _table.schema.primKey.name === key,
					type = isIndexed ? "indexed" : "filtered";
				
				_filters.push( new noInfoPath.noFilterExpression(type, key, operator, match, logic));
			};
		},

		noDataReadRequest: function($q, table){
			var deferred = $q.defer(), _table = table;

			Object.defineProperties(this, {
				"promise": {
					"get": function(){
						return deferred.promise;
					}
				}
			});

			this.data = {
				filter: undefined,
				page: undefined,
				pageSize: undefined,
				sort: undefined,
				skip: undefined,
				take: undefined,
			};

			this.__proto__.addFilter = function(key, operator, match, logic){
				if(this.data.filter === undefined){
					this.data.filter = new noInfoPath.noFilter(_table);
				}

				this.data.filter.add(key, operator, match, logic);
			};

			this.__proto__.removeFilter = function(indexOf){
				if(!this.data.filter)
					return;

				
				delete this.data.filter[indexOf];
			
				if(this.data.filter.length === 0){
					delete this.data.filter;
				}	
			};

			this.__proto__.indexOfFilter = function(key){
				if(this.data.filter === undefined){
					return -1;
				}

				for(var i in this.data.filter){
					var f = this.data.filter[i];
					if(f.key === key){
						return Number(i);
					}
				}

				return -1;
			};

			this.__proto__.addSort = function(sort){
				if(this.data.sort === undefined){
					this.data.sort = [];
				}

				this.data.sort.push(sort);
			};

			this.__proto__.removeSort = function(indexOf){
				if(!this.data.sort)
					return;

				
				delete this.data.sort[indexOf];
			
				if(this.data.sort.length === 0){
					delete this.data.sort;
				}	
			};

			this.__proto__.indexOfSort = function(key){
				if(this.data.sort === undefined){
					return -1;
				}

				for(var i in this.data.sort){
					var f = this.data.sort[i];
					if(f.key === key){
						return Number(i);
					}
				}

				return -1;
			};

			this.__proto__.success  = deferred.resolve;
			this.__proto__.error = deferred.reject;
		}
	}

	window.noInfoPath = angular.extend(window.noInfoPath || {}, noInfoPath);

})(angular);
//storage.js
(function(){
	"use strict";

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
			if(v){
				_store.setItem(k,angular.toJson(v));
			}else{
				_store.setItem(k,undefined);
			}
			
		};

		this.getItem = function (k){
			var x = _store.getItem(k)
			
			if(x === "undefined"){
				return undefined;
			}else{
				return angular.fromJson(x);	
			}
			
		};

		this.removeItem = function (k){
			delete _store.removeItem(k);
		};

		this.clear = function (){
			_store.clear();
		};
	}

	angular.module("noinfopath.data")
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

	angular.module("noinfopath.data")
		.config([function(){
		}])

		.provider("noConfig", [function(){
			var _currentConfig, _status;
			
			function noConfig($http, $q, $timeout, $rootScope, noLocalStorage){
				var SELF = this;

				Object.defineProperties(this, {
					"current": {
						"get": function() { return _currentConfig; }
					},
					"status": {
						"get": function() { return _status; }
					}
				});

				this.load = function (){
					return $http.get("/config.json")
						.then(function(resp){ 
							noLocalStorage.setItem("noConfig", resp.data);
						})
						.catch(function(err){
							throw err;
						});
				};

				this.fromCache = function(){
					_currentConfig = noLocalStorage.getItem("noConfig");
				}

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noConfigReady)
						{
							deferred.resolve();
						}else{	
							$rootScope.$watch("noConfigReady", function(newval){
								if(newval){
									deferred.resolve();								
								}
							});	

							SELF.load()
								.then(function(){
									_currentConfig = noLocalStorage.getItem("noConfig");
									$rootScope.noConfigReady = true;
								})
								.catch(function(err){
									SELF.fromCache();

									if(_currentConfig){
										$rootScope.noConfigReady = true;
									}else{
										deferred.reject("noConfig is offline, and no cached version was available.");
									}
								})			
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

	angular.module('noinfopath.data')
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

	angular.module("noinfopath.data")
		.config([function(){
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
				var SELF = this;

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
					},
					"isCached": {
						"get": function(){
							return noLocalStorage.getItem("noManifest");
						}
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

				this.fromCache = function(){
					var tmp = noLocalStorage.getItem("noManifest");
					_createManifestMap(tmp);
					_makeDBConfig();
				}

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
								$rootScope.noManifestReady = true;
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

							SELF.load()
								.catch(function(err){
									deferred.reject(err);
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
	"user strict";
	
	angular.module("noinfopath.data")

		.factory("noIndexedDB", ['$rootScope','lodash', 'noManifest', '$q', '$timeout', function($rootScope, _, noManifest, $q, $timeout){
			var SELF = this, dex;

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
					tmp.noCRUD = new noCRUD(dex, $q, $timeout, _, table, queryBuilder);
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

	function noCRUD(dex, $q, $timeout, lodash, noTable, querySvc) {
		if(!noTable) throw "noTable is a required parameter";
		
		this.$q = $q;
		this.$timeout = $timeout;
		this._ = lodash;
		this.dex = dex;
		this.type = "kendo";
		this.tableName = noTable.TableName;
		this.noTable = noTable;
		this.noTable.IndexedDB = angular.fromJson(this.noTable.IndexedDB);
		this.querySvc = querySvc;
	}

		noCRUD.prototype.create = function(options) {
			
			if(options){
				var tbl = this.dex[this.tableName],
					THAT = this;

				this.dex.transaction("rw", tbl, function(){
					//tbl.add(options.data);

					if(THAT.noTable.IndexedDB.pk){
						tbl.orderBy(THAT.noTable.IndexedDB.pk).last()
							.then(function(lastOne){
								//This is a temporary hack.  Will be moving to
								//using UUID's soon.
								var newKey =  Number(lastOne[THAT.noTable.IndexedDB.pk]) + 1;
								options.data[THAT.noTable.IndexedDB.pk] = newKey;
								tbl.add(options.data);
							});								
					}else{
						tbl.add(options.data);
					}
				})
				.then(function(resp){
					options.success(options.data);
				})
				.catch(function(err){
					console.error(err);
					options.error(err);
				})
			}					
		};

		noCRUD.prototype.read = function(options) {


			var deferred = this.$q.defer(),
				THAT = this;

			//console.debug(options);

			var tbl = this.dex[this.tableName];

			this.dex.transaction("r", tbl, function(){
				if(options){
					THAT.querySvc(tbl, options);
				}else{
					tbl.toArray()
						.then(function(data){
							deferred.resolve(data);
						})
						.catch(deferred.reject);
				}
			})
			.then(function(resp){
				//console.log("Transaction complete. ", resp || "");

				if(resp) deferred.resolve(resp);
			})
			.catch(function(err){
				console.error(err);
				deferred.reject(err);
			})	

			return deferred.promise;					
		};

		noCRUD.prototype.one = function(options){
			var deferred = this.$q.defer(), SELF = this;

			this.$timeout(function(){
				SELF.read(options)
					.catch(function(err){
						console.error(err);
					});

				options.promise
					.then(function(data){
						if(data.length > 0){
							deferred.resolve(data[0]);
						}else{
							deferred.reject("Item not found.")
						}
					})
					.catch(deferred.reject);				
			});


			return deferred.promise;
		};

		noCRUD.prototype.update = function(options) {
			console.log(options);
			if(options){
				var tbl = this.dex[this.tableName],
					key = options.data[this.noTable.IndexedDB.pk];

				this.dex.transaction("rw", tbl, function(){
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

		noCRUD.prototype.destroy = function(options) {
			console.log(options);
			if(options){
				var tbl = this.dex[this.tableName],
					key = options.data[this.noTable.IndexedDB.pk];

				this.dex.transaction("rw", tbl, function(){
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

	function queryBuilder(table, options){

		var operators = {
			"eq": function(a, b){
				return a === b;
			}
		}, _total = 0, 
		filters = options.data.filter;

		function _filter(table, filter){

			var deferred = table.noCRUD.$q.defer(),
				fields,
				values,
				logic;

			table.noCRUD.$timeout(function(){
				if(filter)
				{
					fields = table.noCRUD._.pluck(filter.filters, "field");
					values = table.noCRUD._.pluck(filter.filters, "value");
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
			var deferred = table.noCRUD.$q.defer();

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
			var deferred = table.noCRUD.$q.defer(),
				arry = [];

			table.noCRUD.$timeout(function(){
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
			var deferred = table.noCRUD.$q.defer();

			table.noCRUD.$timeout(function(){
				if(take){	

					deferred.resolve(array.slice(skip, skip+take));
				}else{
					deferred.resolve(array);
				}
			})

			return deferred.promise;
		}

		_filter(table, filters)
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
})(angular, Dexie);

