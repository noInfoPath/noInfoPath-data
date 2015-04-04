//indexeddb.js

(function(){

	angular.module("noinfopath.indexeddb",['ngLodash', 'noinfopath.odata'])
		
		.run(['$rootScope', 'noConfig', 'noCacheManifest', 'noIndexedDB', function($rootScope, noConfig, noCacheManifest, noIndexedDB){
			noCacheManifest.whenReady()
				.then(_start)
				.then(function(){
					$rootScope.noIndexedDBReady = true;
					$rootScope.$emit("noIndexedDB::ready");
				})
				.catch(function(err){
					console.error(err);
				});

			function _start(){	
				return noIndexedDB.configure(noConfig.current.IndexedDB, noCacheManifest.dbConfig);
			}	
		}])

		.factory("noIndexedDB", ['$rootScope','lodash', '$q', '$timeout', 'noCacheManifest', function($rootScope, _, $q, $timeout, noCacheManifest){
			var SELF = this, dex,
				queryBuilder = {
					kendo: function(table, options){

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
								if(sort.length > 0){
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
										.then(function(){
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
									deferred.resolve(array.slice(skip, take));
								}else{
									deferred.resolve(array);
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
					}
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
						$rootScope.$on("noIndexedDB::ready", function(){
							console.log("IndexedDB Ready");
							deferred.resolve();
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
					_bind(noCacheManifest.current.indexedDB);	
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
					//console.debug(options);

					var tbl = dex[SELF.tableName],
						qb = queryBuilder[SELF.type];

					dex.transaction("r", tbl, function(){
						if(options){
							qb(tbl, options);
						}else{
							options.error("options parameter cannot be null.")
						}
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
					})
					.catch(function(err){
						console.error(err);
					})						
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

			Dexie.prototype.createTransport = function(tableName, type){
				return new noCRUD(noCacheManifest.current.indexedDB[tableName], type);
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
})(angular);
//noinfopath-manifest.js
(function(angular, undefined){
	"use strict";

	var noODATAProv, noRefDataProv;

	angular.module("noinfopath.manifest", ['noinfopath.configuration', 'noinfopath-odata'])
		.config(['noODATAProvider',function(noODATAProvider){
			noODATAProv = noODATAProvider;
		}])

		.run(['$rootScope', 'noODATA', 'noConfig', 'noCacheManifest',
			function($rootScope, noODATA, noConfig, noCacheManifest){

				noConfig.whenReady()
					.then(_start)
					.catch(function(err){
						console.error(err);
					});
	
				function _start(){	
					noODATAProv.setEndPoint(noConfig.current.RESTURI);
					noCacheManifest.load()
						.then(function(){
							$rootScope.noCacheManifestReady = true;
							$rootScope.$emit("noCacheManifest::ready");
						})
						.catch(function(){
							console.log("noCacheManifest connection")
						});
				}	

		}])

		.service("noCacheManifest",['lodash', 'noODATA', 'noLocalStorage', '$rootScope', '$q', '$timeout', 'noConfig', function(_, noODATA, noLocalStorage, $rootScope, $q, $timeout, noConfig){
			var _manifestMap = {
				localStorage:{},
				sessionStorage: {},
				indexedDB: {}
			}, _deltas = {
				localStorage: {},
				sessionStorage: {},
				indexedDB: {}
			}, _dbConfig, _tableNames = [];

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

			this._createManifestMap = function(cacheManifest){
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

			this._deltaManifest = function(newManifest){

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
			}.bind(this);

			this._makeDBConfig = function (){
				var config = {};

				_.each(_manifestMap.indexedDB, function(table){
					var cfg = angular.fromJson(table.IndexedDB);
					config[table.TableName] = cfg.keys;
				});
				//console.debug(config);
				
				_dbConfig = config;
			};

			this.load = (function (){
				return noODATA.read(noODATA.makeResourceUrl("NoCacheManifest"))
					.then(function(data){
						noLocalStorage.setItem("NoCacheManifest", data);
						this._createManifestMap(data);
						//this._deltaManifest();
						this._makeDBConfig();
					}.bind(this))
					.catch(function(){
						//Assume offline or no connection to REST Service
						var data = noLocalStorage.getItem("NoCacheManifest")
						if(data){
							this._createManifestMap(data);
							//this._deltaManifest();
							this._makeDBConfig();
						}else{
							throw "No Configuration, please again when online."
						}
					}.bind(this));
			}).bind(this);

			this.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noCacheManifestReady)
					{
						console.log("cacheManifest Ready");
						deferred.resolve();
					}else{	
						$rootScope.$on("noCacheManifest::ready", function(){
							console.log("cacheManifest Ready");
							deferred.resolve();
						});					
					}					
				});	

				return deferred.promise;			
			};

		}])

	;
})(angular)
/**
 * noinfopath-odata@0.0.5
 */

(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.odata',['noinfopath.helpers'])
		.service("noODataQueryBulder",['$filter',function($filter){

			/**
			 * If value is a string then the value is returned
			 * with single quotes around it. This ensures compatibility
			 * the ODATA specification.
			 * @param  {string|number} value this is what should be wrapped if a string
			 * @return {string|number}       Either returns the original or a string wrapped in single quotes
			 */
			this.normalizeValue = function(value){
				if(typeof value === "string"){
					return "'" + value + "'";
				}else if(angular.isDate(value)){
					 return  $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
				}else{
					return value;
				}					
			};

			this.makeFilterExpression = function(filterObj, processor){
				console.log(angular.toJson(filterObj))
				var filter = "$filter=";
				if(angular.isObject(filterObj)){
					console.log("TODO: implement complex queries")
					filter = processor(filterObj);
				}else{
					//Assume primative string, or number as passed in as filterObj.
					//in this case return a simple identity filter
					filter = "(" + this.normalizeValue(filterObj) + ")";
				}
				return filter;
			};

			this.makeSelectExpression = function(colmnsArray){
				var select = "$select=";

				return select;
			};

			this.buildQueryString = function(filter, mapParams, type){
				var query;


				//function _makeFilter

				if(!filter){
					query = "";
				}else if(angular.isObject(filter)){
					if(!angular.isFunction(mapParams)) throw "Parameter mapper required."

					console.log("TODO: Do something with a query that is an object.");
					query = "?" + mapParams(filter, type);
				}else{
					query = "(" + queryBuilder.normalizeValue(filter) + ")";						
				}

				return query;
			}

			return this;
		}])

		.provider("noODATA",[function(){
			var PROV = this,
				endPoint = "";

			function _noODATA($q, $http, queryBulder){
				var SELF = this;

				this.makeResourceUrl = function(listname){
					return PROV.getEndPoint() + "/" + listname;
				};


				this.create = function(resourceURI, formdata){
					var json = angular.toJson(formdata);
					

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
							deferred.resolve(data.d);
						})
						.error(function(reason){
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
					
					console.log('\n' + url);
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

					return deferred.promise;
				}

				this.destroy = function(){
					var deferred = $q.defer();

					return deferred.promise;
				}
			}

			this.setEndPoint = function(uri) { endPoint = uri; };

			this.getEndPoint = function() { return endPoint; };

			this.$get = ['$q', '$http', 'noODataQueryBulder',  function($q, $http, queryBuilder){
				return new _noODATA($q, $http, queryBuilder);
			}];
		}])
	;
})(angular)
//storage.js
//noinfopath-storage@0.0.3

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

	angular.module("noinfopath.storage",['ngLodash', 'noinfopath.odata'])
		.factory("noSessionStorage",[function(){
			return new noStorage("sessionStorage");
		}])

		.factory("noLocalStorage",[function(){			
			return new noStorage("localStorage");
		}])
		;
})(angular);