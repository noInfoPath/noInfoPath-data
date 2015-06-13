/*
	noinfopath-data
	@version 0.1.26
*/

//globals.js
(function(angular, undefined){
	"use strict";
	
	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers'])

		.run(['$injector', '$parse', '$q', function($injector, $parse, $q){

			function _setItem(store, key, value){
				 var getter = $parse(key),
		             setter = getter.assign;

		         setter(store, value);
			}

			function _getItem(store, key){
		 		var getter = $parse(key);
		 		return getter(store);
			}

			function _noFilterExpression(type, key, operator, match, logic){
				this.type = type || "indexed";
				this.field = key;
				this.operator = operator;
				this.value = match;
				this.logic = logic;
			}

			function _noFilter(table){
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
					var k, o, m, l;

					if(angular.isObject(key)){
						k = key.field;
						o = key.operator;
						m = key.value;
						l = "and";
					}else{
						k = key;
						o = operator;
						m = match;
						l = logic;
					}

					if(_table){
						var index = _table.schema.indexes.filter(function(a){ return a.name === k; }),
						isIndexed = index.length == 1 || _table.schema.primKey.name === k,
						type = isIndexed ? "indexed" : "filtered";
					}else{
						type = "odata"
					}
					_filters.push( new window.noInfoPath.noFilterExpression(type, k, o, m, l));
				};
			}

			function _noDataReadRequest(table, options){
				var deferred = $q.defer(), _table = table;

				Object.defineProperties(this, {
					"__type": { 
						"get": function () { return "noDataReadRequest"; }
					},
					"promise": {
						"get": function (){
							return deferred.promise;
						}
					}
				});



				this.__proto__.addFilter = function(key, operator, match, logic){
					if(this.data.filter === undefined){
						this.data.filter = new window.noInfoPath.noFilter(_table);
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

				if(options){

					this.data = {
						filter: undefined,
						page: undefined,
						pageSize: undefined,
						sort: undefined,
						skip: undefined,
						take: undefined,
					};

					angular.extend(this.data, options.data);

					if(this.data.filter){
						var tmp = new window.noInfoPath.noFilter(table);

						angular.forEach(this.data.filter.filters, function(filter){
							tmp.add(filter);
						},this);	

						this.data.filter = tmp;				
					}



				}else{
					this.data = {
						filter: undefined,
						page: undefined,
						pageSize: undefined,
						sort: undefined,
						skip: undefined,
						take: undefined,
					};
				}

				this.__proto__.success  = deferred.resolve;
				this.__proto__.error = deferred.reject;	
				this.expand = options.expand;
				this.projections = options.projections;	
				this.aggregators = options.aggregators;		
			}

            function _noDataSource(component, config, stateParams, scope){
                var service = $injector.get(component),
                    provider = $injector.get(config.provider);

                var ds = service.noDataSource(config.tableName, provider, config);
                ds.expand = config.expand || undefined;
                ds.projections = config.projections;
                ds.aggregators = config.aggregators;

                if(config.sort){
                    ds.sort = config.sort;
                }       
               
               	if(config.filter){
               		//Check for early binding filters.
               		var _filters = [];
               		angular.forEach(config.filter, function(fltr){
               			if(angular.isObject(fltr.value)){
               				var source;
               				if(fltr.value.source === "state"){
               					source = stateParams;
               				}else{
               					source = scope;
               				}
               				
           					var val = window.noInfoPath.getItem(source, fltr.value.property);
            					val = fltr.value.type === "number" ? Number(val) : val;
               				_filters.push({field: fltr.field, operator: fltr.operator, value: val});
         
               			}else{
               				_filters.push({field: fltr.field, operator: fltr.operator, value: fltr.value});
               			}
               		});

               		ds.filter = _filters;
               	}


               
               	angular.extend(this, ds);
            }

            function _makeFilters(filters, scope, stateParams){
                var _filters = [];

                angular.forEach(filters, function(filter){
                    var ctx, v;

                    if(angular.isObject(filter.value)){
                        //When it is an object the value is coming
                        //from a source.
                        switch(filter.value.source){
                            case "state":
                            	ctx = stateParams;
                                break;
                            case "scope":
                               	ctx = scope;
                                break;
                        }  

            	        v =  window.noInfoPath.getItem(ctx, filter.value.property);
            
                        if(v){
                            v =  filter.value.type === "number" ? Number(v) : v;
                            _filters.push({field: filter.field, operator: filter.operator, value: v});                             
                        }
                    }else{
                        //static value
                        _filters.push(filter);
                    }
                });

                return _filters;
            }

			var noInfoPath = {
				getItem: _getItem,
				setItem: _setItem,
				bindFilters: _makeFilters,
				noFilterExpression: _noFilterExpression,
				noFilter: _noFilter,
				noDataReadRequest: _noDataReadRequest,
				noDataSource: _noDataSource
			};

			window.noInfoPath = angular.extend(window.noInfoPath || {}, noInfoPath);
		}])

		.service("noDataService", ['$q', function($q){
			this.noDataSource = function(uri, datasvc, options){
         		
				function _noHTTP(){


					return { 
	         			transport: {
							read: function(options){			
								return datasvc.read(uri, options);
							},
							create: function(options){
								return datasvc.create(uri, options);
							},
							update: function(options){
								return datasvc.update(uri, options);
							},
							destroy: function(options){
								return crudOp(_ds, "destroy", options);
							},
							one: function(options){
								return datasvc.read(uri, options)
									.then(function(data){
										if(data.length > 0){
											return data[0];
										}else{
											return {};
										}
									});
							},
							upsert: function(options){
								console.warn("TODO: implement noHTTP upsert");
								return datasvc.update(uri, options);
							}
						}
	         		}
				}


				function _noIndexedDB(){
					function crudOp(table, operation, options){
						var 	crud = table.noCRUD,
								ndrr = new window.noInfoPath.noDataReadRequest(table, options);			

						return crud[operation](ndrr);
					}

	         		if(!uri) throw "uri is a required parameter for makeKendoDataSource";
	         		var _ds = datasvc[uri];

					return { 
	         			transport: {
							read: function(options){
								var deferred = _ds.noCRUD.$q.defer();
								crudOp(_ds, "read", options)
									.then(function(data){
										this.data = data;

										deferred.resolve(data);
									}.bind(this));

								return deferred.promise;
							},
							create: function(options){
								return crudOp(_ds, "create", options);
							},
							update: function(options){
								return crudOp(_ds, "update", options);
							},
							destroy: function(options){
								return crudOp(_ds, "destroy", options);
							},
							one: function(options){
								return _ds.noCRUD.one(options);
							},
							upsert: function(options){
								return _ds.noCRUD.upsert(options);
							}
						},
	         			table: _ds,
	         			data: [],
	         			expand: options.expand,
	         			projections: options.projections,
	         			aggregators: options.aggregators
	         		}				
				}

				var ds;

				if(datasvc.name == "NoInfoPath-v3"){
					ds = _noIndexedDB();
				}else{
					ds = _noHTTP();
				}
         		return ds; 
         	}
		}])
	;
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

			function noREST($q, $http, $filter, noUrl, noConfig){
				var SELF = this,
					odataFilters = {
			            eq: "eq",
			            neq: "ne",
			            gt: "gt",
			            gte: "ge",
			            lt: "lt",
			            lte: "le",
			            contains : "substringof",
			            doesnotcontain: "substringof",
			            endswith: "endswith",
			            startswith: "startswith"
			        },				
					mappers = {
			            pageSize: angular.noop,
			            page: angular.noop,
			            filter: function(params, filter, useVersionFour) {
			                if (filter) {
			                    params.$filter = toOdataFilter(filter, useVersionFour);
			                }
			            },
			            data: function(params, filter, useVersionFour){
			            	mappers.filter(params, filter.filter, useVersionFour)
			            },
			            // filter: function(params, filter, useVersionFour) {
			            //     if (filter) {
			            //         params.$filter = SELF.toOdataFilter(filter, useVersionFour);
			            //     }
			            // },
			            sort: function(params, orderby) {
			                var sorts = angular.forEach(orderby, function(value) {
			                    var order = value.field.replace(/\./g, "/");

			                    if (value.dir === "desc") {
			                        order += " desc";
			                    }

			                    return order;
			                }),
			                expr = sorts ? sorts.join(",") : undefined;

			                if (expr) {
			                    params.$orderby = expr;
			                }
			            },
			            skip: function(params, skip) {
			                if (skip) {
			                    params.$skip = skip;
			                }
			            },
			            take: function(params, take) {
			                if (take) {
			                    params.$top = take;
			                }
			            }
			        };
			    function isGuid(val){
			    	return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
			    }
				function toOdataFilter (filter, useOdataFour) {
				    var result = [],
				        logic = filter.logic || "and",
				        idx,
				        length,
				        field,
				        type,
				        format,
				        operator,
				        value,
				        ignoreCase,
				        filters = filter.filters;
					
				    for (idx = 0, length = filters.length; idx < length; idx++) {
				        filter = filters[idx];
				        field = filter.field;
				        value = filter.value;
				        operator = filter.operator;

				        if (filter.filters) {
				            filter = toOdataFilter(filter, useOdataFour);
				        } else {
				            ignoreCase = filter.ignoreCase;
				            field = field.replace(/\./g, "/");
				            filter = odataFilters[operator];
				            // if (useOdataFour) {
				            //     filter = odataFiltersVersionFour[operator];
				            // }

				            if (filter && value !== undefined) {
				               
				                if (angular.isString(value)) {
				                	if(isGuid(value)){
										format = "guid'{1}'";
				                	}else{
				                		format = "'{1}'";
				                	}
				                    
				                    value = value.replace(/'/g, "''");


				                    // if (ignoreCase === true) {
				                    //     field = "tolower(" + field + ")";
				                    // }

				                } else if (angular.isDate(value)) {
				                    if (useOdataFour) {
				                        format = "yyyy-MM-ddTHH:mm:ss+00:00";
				                    } else {
				                    	value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
				                        format = "{1}";
				                    }
				                } else {
				                    format = "{1}";
				                }

				                if (filter.length > 3) {
				                    if (filter !== "substringof") {
				                        format = "{0}({2}," + format + ")";
				                    } else {
				                        format = "{0}(" + format + ",{2})";
				                        if (operator === "doesnotcontain") {
				                            if (useOdataFour) {
				                                format = "{0}({2},'{1}') eq -1";
				                                filter = "indexof";
				                            } else {
				                                format += " eq false";
				                            }
				                        }
				                    }
				                } else {
				                    format = "{2} {0} " + format;
				                }

				                filter = $filter("format")(format, filter, value, field);
				            }
				        }

				        result.push(filter);
				    }

			      	filter = result.join(" " + logic + " ");

			        if (result.length > 1) {
			            filter = "(" + filter + ")";
			        }

			        return filter;
				}

				function mapParams (options, type, useVersionFour) {
	                var params,
	                    value,
	                    option,
	                    dataType;

	                options = options || {};
	                type = type || "read";
	                dataType = "json";

	                if (type === "read") {
	                	if(angular.isNumber(options) || angular.isString(options)){
	                		return "(" + noUrl.normalizeValue(options) + ")";
	                	}

	                    params = {
	                        $inlinecount: "allpages"
	                    };

	                    //params.$format = "json";

	                    for (option in options) {
	                    	console.log(option, options[option]);
	                        if (mappers[option]) {
	                            mappers[option](params, options[option], useVersionFour);
	                        } else {
	                            params[option] = options[option];
	                        }
	                    }
	                } else {
	                    if (dataType !== "json") {
	                        throw new Error("Only json dataType can be used for " + type + " operation.");
	                    }

	                    if (type !== "destroy") {
	                        for (option in options) {
	                            value = options[option];
	                            if (typeof value === "number") {
	                                options[option] = value + "";
	                            }
	                        }

	                        params = options;
	                    }
	                }

	                return noUrl.serialize(params); 
	            }
	
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
					var q = angular.isObject(query) ? mapParams(query.data) : query;


					var deferred = $q.defer(),
						url = noUrl.makeResourceUrl(noConfig.current.RESTURI, resourceURI, q),
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

			this.$get = ['$q', '$http', '$filter', 'noUrl', 'noConfig', function($q, $http, $filter, noUrl, noConfig){
				return new noREST($q, $http, $filter, noUrl, noConfig)
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
							var tmp = noLocalStorage.getItem("noManifest");
							return tmp && tmp.length > 0;
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
					return noHTTP.read("NoCacheManifest","$filter=StorageLocation ne ''&$orderby=TableName")
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

		.factory("noIndexedDB", ['$parse','$rootScope','lodash', 'noManifest', '$q', '$timeout', function($parse, $rootScope, _, noManifest, $q, $timeout){
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
					dex.open()
						.then(function(resp){
							console.log("hello");
						})
						.catch(function(err){
							console.error(err);
						});
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

			function queryBuilder(table, options){


				var operators = {
						"eq": function(a, b){
							return a === b;
						}
					}, _total = 0, 
					filters = options.data.filter;

				function _filter(table, filter){


					function _indexFilter(fields, values, operators){
						

						var w = fields.length === 1 ? fields.join("+") : "[" + fields.join("+") + "]",
							v = values.length === 1 ? values[0] : values,
							o = operators.join(""),
							collection;

						if(w === "[]"){
							w = table.schema.primKey.keyPath;
						}

						if(Number.isNaN(v)){
							collection = table.toCollection();
						}else{
							if(v === undefined){
								v = "";
							}

							switch(o){
								case "startswith":
				 					collection = table.where(w).startsWithIgnoreCase(v);					
									break;

								default:
				 					collection = table.where(w).equals(v);					
									break;
							}
						}

						return collection;
					}

					function _jsFilter(filter){
						var collection = table.filter(function(obj){
							//console.log("_jsFilter", value[this.field], this.field, value[this.field].indexOf(this.value));
							var result = false;
									
							for(var fi in filter.filters){
								var fltr = filter.filters[fi],
									tmp = obj[fltr.field],
									val = tmp ? tmp : null;

								val = angular.isString(val) ? val.toLowerCase() : val;

								switch(fltr.operator.toLowerCase()){
									case "neq":
										result = (val !== fltr.value);
										break;
									case "eq":
										result = (val === fltr.value);
										break;
									case "contains":
										result = val.indexOf(fltr.value) > -1;
										break;
									case "startswith":
										result = val.indexOf(fltr.value) === 0;
										break;
								}

								if(!result){
									break;
								}
							}

							return result;
						});

						return collection;
					}

					var deferred = table.noCRUD.$q.defer(),
						fields,
						values,
						logic,
						types;

					table.noCRUD.$timeout(function(){

						if(filter)
						{
							//console.log("filter", filter);
							
							fields = table.noCRUD._.pluck(filter.filters, "field");
							values = table.noCRUD._.pluck(filter.filters, "value");
							types = table.noCRUD._.pluck(filter.filters, "type");
							operators = table.noCRUD._.pluck(filter.filters, "operator");
							logic = filter.logic;

							//If any of the filters are type filtered then all
							//must be treated that way.
							if(types && table.noCRUD._.contains(types, "filtered")){
								deferred.resolve(_jsFilter(filter));
							}else{
								//Performing simple primary key lookup
								deferred.resolve(_indexFilter(fields, values, operators));
							}				

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

				function _expand(array, expands){
					var promises = [];

					//expands can typicalally happend asynchronously
					//here at level one so spawn them all now. Any
					//subqueries will be exected before this promise
					//returns with the final results
					angular.forEach(expands, function(expand){
						promises.push(_expandOne(array, expand));						
					});	

					return $q.all(promises)
						.then(function(data){

							var tmp, hash = {};
							do{
								tmp = data.pop();
								if(tmp){
									hash[tmp.primaryKey] = tmp.hash;
								}
							}while(tmp);

							angular.forEach(array, function(item){
								angular.forEach(options.expand, function(expand, pk){
									var refItem = hash[pk][item[pk]],
										newRefItem = {};

									if(expand.fields){
										angular.forEach(expand.fields, function(field){
											newRefItem[field] = refItem[field];
										});							
									}else{
										newRefItem = refItem;
									}


									if(expand.merge){
										item = angular.extend(item, newRefItem);
									}else{
										item[expand.name] = newRefItem;							
									}
									//console.log(field, refItem, newRefItem)
								});
							});

							return;
						});					
				}

				function _expandOne(array, expand) {
					var table = dex[expand.tableName],
						_ = table.noCRUD._,
						keys = _.pluck(array, expand.foreignKey);
					
					return $q(function(resolve, reject){
						table.where(expand.foreignKey).anyOf(keys).toArray()
							.then(function(array){
								var hash = {};

								angular.forEach(array, function(item){
									hash[item[this.options.foreignKey]] = item;
								}, this);

								resolve({primaryKey: this.primaryKey, hash: hash});
							}.bind({primaryKey: expand.foreignKey, options: expand, data:array}))
							.catch(function(err){
								console.error(err);
								reject(err);
							});
						});
				}

				function _projection(rootArray, projections){
					var _results = {}, curRootItem;

					function _waitForProjection(array, projectee){
						var deferred = $q.defer();

			 			_projectOne(array, projectee)
							.then(function(data){
								_results[data.projectee.name] = data;

								if(projectee.projections){
									_project(data.projected, projectee.projections)
										.then(function(){
											deferred.resolve();
										});
								}else{
									deferred.resolve();
								}

							})
							.catch(function(err){
								console.error(err);
								deferred.reject(err);
							});
						
						return deferred.promise;
					}

					function _projectOne(array, projectee){
						var deferred = $q.defer(),
							table = dex[projectee.tableName],
							_ = table.noCRUD._,
							keys = _.pluck(array, projectee.foreignKey);
						
						return table.where(projectee.foreignKey).anyOf(keys).toArray()
							.then(function(projected){
								var hash = {};

								//hash the projected on primaryKey
								angular.forEach(projected, function(item){
									if(!hash[item[this.options.primaryKey]]){
										hash[item[this.options.primaryKey]] = [];
									}
									hash[item[this.options.primaryKey]].push(item);
								}, this);

								angular.forEach(array, function(item){
									var key = item[this.primaryKey],
										projectedItems = hash[key] || [];


									item["_" + this.options.name] = projectedItems;
						
								}, this);

								return {projectee: projectee, hashed: hash, projected: projected};
								
							}.bind({primaryKey: projectee.primaryKey, options: projectee, data:array}))
							.catch(function(err){
								console.error(err);
								deferred.reject(err);
							});
					}

					function _project(array, projections){
						var promises = [];

						angular.forEach(projections, function(projection){
							promises.push(_waitForProjection(array, projection)
								.then(function(data){
									return data;
								}));
						});

						return $q.all(promises)
							.then(function(data){
								return data;
							});
					}	


					return _project(rootArray, projections)
						.then(function(){
			
							// angular.forEach(rootArray, function(cooperator){
							// 	var fieldSites = _aggregate(cooperator.fieldSites, {operation: "count"}),
							// 		trials = 0,
							// 		trialPlots = 0,
							// 		observations = 0;

							// 	angular.forEach(cooperator.fieldSites, function(fieldSite){
							// 		trials +=  _aggregate(fieldSite.trials, {operation: "count"});

							// 		angular.forEach(fieldSite.trials, function(trial){
							// 			trialPlots +=  _aggregate(trial.trialPlots, {operation: "count"});

							// 			angular.forEach(trial.trialPlots, function(trialPlot){
							// 				observations +=  _aggregate(trialPlot.observations, {operation: "count"});
							// 			});
							// 		});
							// 	});

							// 	cooperator.FieldSites = fieldSites;
							// 	cooperator.Trials = trials;
							// 	cooperator.TrialPlots = trialPlots;
							// 	cooperator.Observations = observations;
							// });

							return _results;
						});
				}

				function _aggregator(rootArray, aggregate){
					var currentRootItem;

					function _aggregate(array, aggregation){
						var operations = {
							"count": function(array){
								return array ? array.length : 0;
							}
						}

						return operations[aggregation.operation](array);
					}

					function _recurseAggregations(item, aggregations){
						angular.forEach(aggregations, function(aggregation){
							var items = item[aggregation.path],
								val = _aggregate(items, aggregation);

							if(!currentRootItem[aggregation.name]) { 
								currentRootItem[aggregation.name] = 0; 
							}

							currentRootItem[aggregation.name] += val;

							if(aggregation.aggregations){
								angular.forEach(items, function(item){
									_recurseAggregations(item, aggregation.aggregations);
								});								
							}
						});
					}

					angular.forEach(rootArray, function(item){
						currentRootItem = item;
						angular.forEach(aggregate.fields, function(field){
							currentRootItem[field] = 0;
						})
						_recurseAggregations(item, aggregate.aggregations);
					});
				}

				function _postProcessing(array, config){
					var deferred = $q.defer(),
						promises = [],
						nothingToDo = !options.expand && !options.projections;

					if(nothingToDo){
						promises.push($q(function(resolve,reject){
							resolve(array);
						}));
					}else{
						if(options.expand){
							promises.push(_expand(array, options.expand));
						}

						if(options.projections){
							//Same goes for projections
							promises.push(_projection(array, options.projections));
						}
					}


					return $q.all(promises).then(function(data){
						//console.log(data);
						if(options.aggregators){
							_aggregator(array, options.aggregators);
						}
						return array;
					});
				}

				this.query = function(){
					var deferred = $q.defer();

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
							_postProcessing(array, options)
								.then(function(array){
									deferred.resolve(array||[]);
								})
								.catch(function(err){
									deferred.reject(err);
								});

						})
						.catch(function(err){
							deferred.reject(err);
						});

					return deferred.promise;
				}	 					
			};

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

				this.__proto__.create = function(options) {
					var deferred = this.$q.defer();

					if(!options) throw "noCRUD::update requires options parameter";
					
				
					var tbl = this.dex[this.tableName],
						THAT = this;

					this.dex.transaction("rw", tbl, function(){
						//tbl.add(options.data);

						// if(THAT.noTable.IndexedDB.pk){
						// 	tbl.orderBy(THAT.noTable.IndexedDB.pk).last()
						// 		.then(function(lastOne){
						// 			//This is a temporary hack.  Will be moving to
						// 			//using UUID's soon.
						// 			var newKey =  Number(lastOne[THAT.noTable.IndexedDB.pk]) + 1;
						// 			options.data[THAT.noTable.IndexedDB.pk] = newKey;
						// 			tbl.add(options.data);
						// 		});								
						// }else{
							tbl.add(options.data);
						// }
					})
					.then(function(resp){
						deferred.resolve(options.data);
					})
					.catch(function(err){
						deferred.reject(err);
					})
						
					return deferred.promise;				
				};

				this.__proto__.read = function(options) {
					var deferred = this.$q.defer(),
						tbl = this.dex[this.tableName],
						THAT = this;


					this.dex.transaction("r", tbl, function(){
						if(options){
							var q = new THAT.querySvc(tbl, options,THAT.$timeout, THAT.$q, THAT.dex, THAT._);

								q.query()
									.then(deferred.resolve)
									.catch(deferred.reject);
						}else{
							tbl.toArray()
								.then(deferred.resolve)
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

				this.__proto__.one = function(options){
					var deferred = this.$q.defer(), SELF = this;

					this.$timeout(function(){
						SELF.read(options)
							.then(function(data){
								if(data.length > 0){
									deferred.resolve(data[0]);
								}else{
									deferred.reject("Item not found.")
								}
							})
							.catch(function(err){
								deferred.reject(err);
							});				
					});


					return deferred.promise;
				};

				this.__proto__.update = function(options) {
					var deferred = this.$q.defer();

					if(!options) throw "noCRUD::update requires options parameter";
					
					var tbl = this.dex[this.tableName],
						key = options.data[this.noTable.IndexedDB.pk];

					this.dex.transaction("rw", tbl, function(){
						tbl.update(key, options.data)
							.then(function(resp){
								if(resp === 1)
								{
									deferred.resolve(options.data);
								}else{
									deferred.reject("Record not updated.");
								}									
							});
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
					})
					.catch(function(err){
						console.error(err);
						deferred.reject(err);
					})
					

					return deferred.promise;						
				};

				this.__proto__.destroy = function(options) {
					var deferred = this.$q.defer(),
						tbl = this.dex[this.tableName],
						key = options.data[this.noTable.IndexedDB.pk];

					this.dex.transaction("rw", tbl, function(){
						tbl.delete(key)
							.then(deferred.resolve)
							.catch(deferred.reject);
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
					})
					.catch(function(err){
						console.error(err);
						deferred.reject(err);
					})

					return deferred.promise;		
				};

				this.__proto__.upsert = function(options){
					if(!options) throw "noCRUD::update requires options parameter";
					
					var tbl = this.dex[this.tableName],
						key = options.data[this.noTable.IndexedDB.pk];

					if(key){
						return this.update(options);
					}else{
						return this.create(options);
					}
				}
			}

			return 	dex = new Dexie("NoInfoPath-v3");
		}])

		.service("noBulkData", ['$q', '$timeout','noConfig', 'noUrl', 'noIndexedDB', function($q, $timeout, noConfig, noUrl, noIndexedDB){
				var _tasks = [], _datasvc;

				function _queue(manifest){
					//var urls = noUrl.makeResourceUrls(noConfig.current.RESTURI, manifest);

					for(var k in manifest){
						var task = manifest[k];
						task.url = task.TableName;
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

//create.js
(function(angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.service("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", function($q, $timeout, $http, $rootScope, _){
			var _config = {}, SELF = this;

			Object.defineProperties(this, {
				"config": {
					"get": function() { return _config; }
				}
			});

			function _processDbJson(resp){
				//console.log(resp)
				var tables = resp.data;

				angular.forEach(tables, function(table, tableName){
					
					var primKey = "$$" + table.primaryKey,
						foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");
		
					_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
				})

				console.log(angular.toJson(_config));
				return;
			}


			this.load = function (){
				var req = {
					method: "GET",
					url: "/db.json",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					withCredentials: true
				};

				return $http(req)
					.then(_processDbJson)
					.catch(function(resp){
						console.error(resp);
					});
			};

			this.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noDbSchemaInitialized)
					{
						console.log("noDbSchema Ready.");
						deferred.resolve();
					}else{	
						console.log("noDbSchema is not ready yet.")
						$rootScope.$watch("noDbSchemaInitialized", function(newval){
							if(newval){
								console.log("noDbSchema ready.");
								deferred.resolve();									
							}
						});	

						SELF.load()
							.then(function(resp){
								$rootScope.noDbSchemaInitialized = true;
								//for testing
								// $timeout(function(){
								// 	$rootScope.$digest();
								// });
								//deferred.resolve();
							})
							.catch(function(err){
								deferred.reject(err);
							});				
					}					
				});	

				return deferred.promise;			
			};	
		}])
	;

})(angular, Dexie);