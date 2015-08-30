//globals.js

/*
 *	# noinfopath-data
 *	@version 0.2.7
 *
 *	## Overview
 *	NoInfoPath data provides several services to access data from local storage or remote XHR or WebSocket data services.
 *
 *	[![Build Status](http://192.168.254.99:8081/job/noinfopath-data/badge/icon)](http://192.168.254.99:8081/job/noinfopath-data)
 *
 *	## Dependencies
 *
 *	- AngularJS
 *	- jQuery
 *	- ngLodash
 *	- Dexie
 *	- Dexie Observable
 *	- Dexie Syncable
*/

/**
 *	## Development Dependencies
 *
 *	> See `package.json` for exact version requirements.
 *
 *	- indexedDB.polyfill
 *	- angular-mocks
 *	- es5-shim
 *	- grunt
 *	- grunt-bumpup
 * - grunt-version
 *	- grunt-contrib-concat
 *	- grunt-contrib-copy
 *	- grunt-contrib-watch
 *	- grunt-karma
 *	- jasmine-ajax
 *	- jasmine-core
 *	- jshint-stylish
 *	- karma
 *	- karma-chrome-launcher
 *	- karma-coverage
 *	- karma-firefox-launcher
 *	- karma-html-reporter
 *	- karma-ie-launcher
 *	- karma-jasmine
 *	- karma-phantomjs-launcher
 *	- karma-safari-launcher
 *	- karma-verbose-reporter
 *	- noinfopath-helpers
 *	- phantomjs
*/

/**
 *	## Developers' Remarks
 *
 *	|Who|When|What|
 *	|---|----|----|
 *	|Jeff|2015-06-20T22:25:00Z|Whaaat?|
*/

//(noInfoPath = noInfoPath || {});
(noInfoPath.data = {});
console.log(noInfoPath);
(function(angular, undefined){
 	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers'])

		/*
        * ## @interface noInfoPath
        *
        * ### Overview
        * This interface exposes some useful funtions on the global scope
        * by attaching it to the `window` object as ```window.noInfoPath```
        *
        * ### Methods
        *
        * #### getItem
        *
        * #### setItem
        *
        * #### bindFilters `deprecated`
        *
        * #### noFilter `deprecated`
        *
        * #### noFilterExpression `deprecated`
        *
        * #### noDataReadRequest `deprecated`
        *
        * #### noDataSource `deprecated`
        *
        * #### digest `deprecated`
        *
        * #### digestError `deprecated`
        *
        * #### digestTimeout `deprecated`
		 */
		.run(['$injector', '$parse', '$timeout', '$q', '$rootScope', '$browser',  function($injector, $parse, $timeout, $q, $rootScope, $browser){

			function _digestTimeout(){


				if($timeout.flush && $browser.deferredFns.length){
					if($rootScope.$$phase){
						setTimeout(function(){
							$timeout.flush();
						},10);
					}else{
						$timeout.flush();
					}
					//console.log($timeout.verifyNoPendingTasks());

		        }
			}

			function _digestError(fn, error){
				var digestError = error;

				if(angular.isObject(error)){
					digestError = error.toString();
				}

				//console.error(digestError);

				_digest(fn, digestError);
			}

			function _digest(fn, data){
				var message = [];

				if(angular.isArray(data)){
					message = data;
				} else {
					message = [data];
				}

	        	if(window.jasmine){
        			$timeout(function(){
						fn.apply(null, message);
					});
					$timeout.flush();
	        	}else{
	        		fn.apply(null, message);
	        	}

			}

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

			var _data = {
				getItem: _getItem,
				setItem: _setItem,
				bindFilters: _makeFilters,
				noFilterExpression: _noFilterExpression,
				noFilter: _noFilter,
				noDataReadRequest: _noDataReadRequest,
				noDataSource: _noDataSource,
				digest: _digest,
				digestError: _digestError,
				digestTimeout: _digestTimeout
			};

			window.noInfoPath = angular.extend(window.noInfoPath || {}, _data);
		}])

		/**
		 * ## @service noDataService `deprecated`
		 *
		 */
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
	         		};
				}

				var ds;

				if(datasvc.name == "NoInfoPath-v3"){
					ds = _noIndexedDB();
				}else{
					ds = _noHTTP();
				}
         		return ds;
         	};
		}])
	;
})(angular);

//classes.js

(function(angular, undefined){
	"use strict";

	/*
	* ## @class NoFilterExpression : Object
	*
	* Represents an single filter expression that can be applied to an `IDBObjectStore`.
	*
	* ### Constructor
	*
	* NoFilterExpression(column, operator, value [, logic])
	*
	* |Name|Type|Description|
	* |----|----|-----------|
	* |column|String|The name of the column filter on.|
	* |operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
	* |value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
	* |logic|String|(Optional) One of the following values: `and`, `or`.|
	*
	* ### Properties
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |column|String|The name of the column filter on.|
	* |operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
	* |value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
	* |logic|String|(Optional) One of the following values: `and`, `or`.|
	*/
	function NoFilterExpression(operator, value, logic){

		if(!operator) throw "INoFilterExpression requires a operator to filter by.";
		if(!value) throw "INoFilterExpression requires a value(s) to filter for.";

		this.operator = operator;
		this.value = value;
		this.logic = logic;

		this.toSQL = function()
		{
			var sqlOperators = {
					"eq" : "=",
					"ne" : "!=",
					"gt" : ">",
					"ge" : ">=",
					"lt" : "<",
					"le" : "<=",
					"contains" : "CONTAINS",
					"startswith": "" // TODO: FIND SQL EQUIVILANT OF STARTS WITH
				},
				rs = "";

			// TODO: HAVE WAY TO DIFFERENTIATE BETWEEN DIFFERENT DATA TYPES (STRING, INT, DATE, GUID, ETC ETC ETC)
			//
			// JAG: Use angular.isString etc, to do this. You could use typeOf, 
			// in switch statement, but using angular is safer.  
			// Also this, "sqlOperators[operator]" is bad.  what if the operator 
			// does not exist in the hash table.  (i.e. not supported)
			if(!sqlOperators[operator]) throw "NoFilters::NoFilterExpression required a valid operator";

			if(angular.isString(value)){
				rs = sqlOperators[operator] + " '" + this.value + "'" + (this.logic ? " " + this.logic : "");
			} else {
				rs = sqlOperators[operator] + " " + this.value + "" + (this.logic ? " " + this.logic : "");
			}

			return rs;
		}
	}

	/*
	* ## Class NoFilters : Array
	*
	* NoFilters is an array of NoFilterExpression objects.
	*
	* ### Properties
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |length|Number|Number of elements in the array.|
	*
	* ### Methods
	*
	* #### add(column, operator, value[, logic])
	*
	* Creates and adds a new NoFilterExpression into the underlying array that NoFilters represents.
	*
	* #### Parameters
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |column|String|The name of the column filter on.|
	* |operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
	* |value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
	* |logic|String|(Optional) One of the following values: `and`, `or`.|
	*/
	function NoFilters(){
		Object.defineProperties(this, {
			"__type": {
				"get": function(){
					return "NoFilters";
				}
			}
		});

		var arr = [];
		arr.push.apply(arr, arguments);
		
		this.toSQL = function(){
			var rs = "",
				rsArray = [];

			angular.forEach(this, function(value, key){
				rsArray.push(value.toSQL());
			});

			rs = rsArray.join("");

			return rs;
		};

		this.add = function(column, logic, beginning, end, filters) {
			if(!column) throw "NoFilters::add requires a column to filter on.";
			if(!filters) throw "NoFilters::add requires a value(s) to filter for.";

			this.unshift(new NoFilter(column, logic, beginning, end, filters));
		};

		noInfoPath.setPrototypeOf(this, arr);
	}
	

/*
	* ## Class NoFilter : Object
	*
	* NoFilter is an object with some properties that has an array of NoFilterExpressions hanging off of it.
	*
	* ### Properties
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |length|Number|Number of elements in the array.|
	*
	* ### Methods
	*
	* #### toSQL()
	*
	* Converts the current NoFilter object to a partial SQL statement. It calls the NoFilterExpression toSQL() method for every NoFilterExpression 
	*
	* #### Parameters
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |column|String|The name of the column filter on.|
	* |operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
	* |value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
	* |logic|String|(Optional) One of the following values: `and`, `or`.|
	*/
	function NoFilter(column, logic, beginning, end, filters){
		Object.defineProperties(this, {
			"__type": {
				"get": function(){
					return "NoFilter";
				}
			}
		});

		this.column = column;
		this.logic = logic
		this.beginning = beginning;
		this.end = end;
		this.filters = [];

		angular.forEach(filters, function(value, key){
			this.filters.unshift(new NoFilterExpression(value.operator, value.value, value.logic));
		}, this);

		this.toSQL = function(){
			var rs = "",
				filterArray = [],
				filterArrayString = "";

			angular.forEach(this.filters, function(value, key){
				filterArray.push(this.column + " " + value.toSQL());
			}, this);

			filterArrayString = filterArray.join(" ");

			if(!!this.beginning) rs = "(";
			rs += filterArrayString;
			if(!!this.end) rs += ")";
			if(!!this.logic) rs += " " + logic + " ";

			return rs;
		}

		// this.add = function(column, logic, beginning, end, filters) {
		// 	this.column = column;
		// 	this.logic = logic;
		// 	this.beginning = beginning;
		// 	this.end = end;
		// 	this.filters = [];

		// 	angular.forEach(filters, function(value, key){
		// 		this.filters.add(new NoFilterExpression(value.operator, value.value, value.logic));
		// 	});

		// }
	}

	/*
	* ## Class NoSortExpression : Object
	*
	* Represents a single sort expression that can be applied to an `IDBObjectStore`.
	*
	* ### Constructor
	*
	* NoFilterExpression(column[, dir])
	*
	* ### Properties
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |column|String|The name of the column filter on.|
	* |dir|String|(Optional) One of the following values: `asc`, `desc`.|
	*/
	function NoSortExpression(column, dir){

		if(!column) throw "NoFilters::add requires a column to sort on.";

		this.column = column;
		this.dir = dir;

		this.toSQL = function(){
			return this.column + (this.dir ? " " + this.dir : "");
		};
	}

	/*
	* ## Class NoSort : Array
	*
	* NoSort is an array of NoSortExpression objects.
	*
	* ### Properties
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |length|Number|Number of elements in the array.|
	*
	* ### Methods
	*
	* #### add(column[, dir])
	*
	* Creates and adds a new NoSortExpression into the underlying array that NoSort represents.
	*
	* #### Parameters
	*
	* |Name|Type|Description|
	* |----|----|------------|
	* |column|String|The name of the column filter on.|
	* |dir|String|(Optional) One of the following values: `asc`, `desc`.|
	*/



	function NoSort() {
		var arr = [ ];

		Object.defineProperties(arr, {
			"__type": {
				"get": function(){
					return "NoSort";
				}
			}
		});


		arr.push.apply(arr, arguments);
		arr.add = function(column, dir) {
			if(!column) throw "NoSort::add requires a column to filter on.";

			this.push(new NoSortExpression(column, dir));
		};

		arr.toSQL = function(){

			var sqlOrder = "ORDER BY ",
				sortExpressions = [];

			this.forEach(function(o, index, array){

				sortExpressions.push(o.toSQL());

			});

			return sqlOrder + sortExpressions.join(',');
		};
		noInfoPath.setPrototypeOf(this, arr);
	}

	/*
	* ## Class NoPage : Object
	*
	* NoPage represent that information required to support paging of a data set.
	*
	* ### Constructor
	*
	* NoPage(skip, take)
	*
	* ### Properties
	*
	* |Name|Type|Description|
	* |-|-|-|
	* |skip|Number|Number of objects to skip before returning the desired amount specified in `take`.|
	* |take|Number|Number of objects records to return when paging data.|
	*
	*/
	function NoPage(skip, take) {
		this.skip = skip;
		this.take = take;

		this.toSQL = function(){
			return "LIMIT " + this.skip + "," + this.take;
		}
	}

	/*
	* ## Class NoResults : Object
	*
	* NoResults is a wrapper around a standard JavaScript Array instance. It inherits all properties and method offered by Array, but adds support for paged queries.
	*
	* ### @constructor NoResults(arrayOfThings)
	*
	* #### Parameters
	*
	* |Name|Type|Description|
	* |----|----|-----------|
	* |arrayOfThings|Array|(optional) An array of object that is used to populate the object on creation.|
	*
	* ### Properties
	*
	* > Inherited properties are omitted.
	*
	* |Name|Type|Description|
	* |-|-|-|
	* |total|Number|The total number of items in the array|
	*
	* ### Methods
	*
	* #### page(options)
	*
	* ##### Parameters
	*
	* |Name|Type|Description|
	* |-|-|-|
	* |options|NoPage|A NoPage object that contains the paging instructions|
	*
	* ##### Parameters
	*
	* |Name|Type|Description|
	* |-|-|-|
	* |arrayOfThings|Array|(optional) An array of object that is used to populate the object on creation.|
	*
	* ##### Returns
	* void
	*/
	function NoResults(arrayOfThings){
		//Capture the lenght of the arrayOfThings before any changes are made to it.
		var _total = arrayOfThings.length,
		 	_page = arrayOfThings,
			arr = arrayOfThings;

		//arr.push.apply(arr, arguments);

		Object.defineProperties(arr, {
			"total": {
				"get": function(){
					return _total;
				}
			},
			"paged": {
				"get": function(){
					return _page;
				}
			}
		});

		arr.page = function(nopage){
			if(!nopage) throw "nopage is a required parameter for NoResults:page";
			_page = this.slice(nopage.skip, nopage.skip + nopage.take);
		};

		noInfoPath.setPrototypeOf(this, arr);
	}

	

	//Expose these classes on the global namespace so that they can be used by
	//other modules.
	var _interface = {
			NoFilterExpression: NoFilterExpression,
			NoFilter: NoFilter,
			NoFilters: NoFilters,
			NoSortExpression: NoSortExpression,
			NoSort: NoSort,
			NoPage: NoPage,
			NoResults: NoResults
		};

	noInfoPath.data = angular.extend(noInfoPath.data, _interface);

})(angular);

/*
* ## @interface INoQueryBuilder
*
* > INoQueryBuilder is a conceptual entity, it does not really exist
* > the reality. This is because JavaScript does not implement interfaces
* > like other languages do. This documentation should be considered as a
* > guide for creating query providers compatible with NoInfoPath.
*
* ### Overview
* INoQueryBuilder provides a service interface definition for converting a set
* of NoInfoPath class related to querying data into a given query protocol.
* An example of this is the ODATA 2.0 specification.
*
* ### Methods
*
* #### makeQuery(filters, sort, page)
*
* ##### Parameters
*
* |Name|Type|Descriptions|
* |----|----|------------|
* |filters|NoFilters|(Optional) Instance of a NoFilters class|
* |sort|NoSort|(Optional) Instance of NoSort class|
* |page|NoPage|(Optional) Instance of NoPage class|
*
* ##### Returns
* Object
*
*/

(function(angular, undefined){
	angular.module("noinfopath.data")
		/*
		* ## @service noOdataQueryBuilder : INoQueryBuilder
		*
		* ### Overview
		*
		* Implements a INoQueryBuilder compatible service that converts NoFilters,
		* NoSort, NoPage into ODATA compatible query object.
		*
		*/
		.service("noOdataQueryBuilder", ['$filter', function($filter){
			var odataFilters = {
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
						mappers.filter(params, filter.filter, useVersionFour);
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

			function toOdataFilter (filters, useOdataFour) {
			    var result = [],
			        idx,
			        length,
			        field,
			        type,
			        format,
			        operator,
			        value,
			        ignoreCase,
					filter,
					origFilter;
			        //filters = filter.filters;

			    for (idx = 0, length = filters.length; idx < length; idx++) {
					filter = origFilter = filters[idx];
			        field = filter.column;
			        value = filter.value;
			        operator = filter.operator;
					logic = filter.logic;

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
			                	if(noInfoPath.isGuid(value)){
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

					origFilter.compiledFilter = filter;
			        result.push(origFilter);
			    }

				//loop until there are no more filters or logic.
				var odataFilter = "", f;

				do{
					f = result.pop();

					odataFilter = odataFilter + "(" + f.compiledFilter + ")";

					if(f.logic){
						odataFilter = odataFilter + " " + f.logic + " ";
					}else{
						f = null;
					}

				}while(f);

				odataFilter = odataFilter.trim();

		        return odataFilter;
			}

			function toOdataSort(sort){
				var sorts = [], expr;

				angular.forEach(sort, function(value) {
					var order = value.column.replace(/\./g, "/");

					if (value.dir === "desc") {
						order += " desc";
					}

					sorts.push(order);
				});

				expr = sorts ? sorts.join(",") : undefined;

				return expr;
			}

			this.makeQuery = function(){
				var query = {};

				for(var ai in arguments){
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg)){
						switch(arg.__type){
							case "NoFilters":
								query.$filter = toOdataFilter(arg);
								break;
							case "NoSort":
								query.$orderby = toOdataSort(arg);
								break;
							case "NoPage":
								page = arg;
								break;
						}
					}
				}

				return query;
			};
		}])
	;
})(angular);

//storage.js
(function(){
	"use strict";

	/**
		### @class MockStorage
	*/
	function MockStorage(){
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

	/**
		### @class NoStorage
	*/
	function NoStorage(storetype){
		var _store;


		if(typeof window[storetype]=== "object")
		{
			_store = window[storetype];
		}else{

			_store = new MockStorage();
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
			var x = _store.getItem(k);

			if(x === "undefined"){
				return undefined;
			}else{
				return angular.fromJson(x);
			}

		};

		this.removeItem = function (k){
			_store.removeItem(k);
		};

		this.clear = function (){
			_store.clear();
		};
	}

	angular.module("noinfopath.data")
		.factory("noSessionStorage",[function(){
			return new NoStorage("sessionStorage");
		}])

		.factory("noLocalStorage",[function(){
			return new NoStorage("localStorage");
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

		/**
		* ## @service noConfig
		*
		* ### Overview
		* The noConfig service downloads the application's `config.json` and
		* exposes its contents via the `noConfig.current` property. If the
		* application's server is offline noConfig will try to load config.json
		* from `LocalStorage`.
		*
		* ### Properties
		*
		* |Name|Type|Description|
		* |----|----|-----------|
		* |current|object|exposes the entire download `config.json`|
		*
		* ### Methods
		*
		* #### fromCache()
		* Loads the configuration from `LocalStorage`.
		*
		* ##### Parameters
		* none
		*
		* ##### Returns
		* String
		*
		* #### load(uri)
		* Loads the conifiguration data from and HTTP endpoint.
		*
		* ##### Parameters
		*
		* |Name|Type|Description|
		* |----|----|-----------|
		* |uri|string|(optional) A relative or fully qualified location of the configuration file. If not provided the default value is ```/config.json```|
		*
		* ##### Returns
		* AngularJS::promise
		*
		* #### whenReady(uri)
		* Returns a promise to notify when the configuration has been loaded.
		* If the server is online, whenReady will call load, if not it will try
		* to load it from `LocalStorage`. If there is no cached version
		* available then an error is returned.
		*
		* ##### Parameters
		*
		* |Name|Type|Description|
		* |----|----|-----------|
		* |uri|string|(optional)A relative or fully qualified location of the configuration file. If not provided the default value is ```/config.json```|
		*
		* ##### Returns
		* AngularJS::promise
		*
		*/
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

				this.load = function (uri){
					var url = uri || "/config.json"
					return $http.get(url)
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

				this.whenReady = function(uri){
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

							SELF.load(uri)
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
		/*
		* ## @service noHTTP
		*
		* ### Overview
		* Provides a RESTful compatible HTTP service.
		*
		* ### Methods
		*
		* #### create(uri, data)
		*
		* ##### Parameters
		*
		* |Name|Type|Description|
		* |----|----|-----------|
		* |uri|string|unique identifier of the table to operate against|
		* |data|object|the data to use to create the new obejct in the db|
		*
		* #### read(resourceURI, query)
		*
		* #### update(resourceURI, formdata)
		* TODO: Implementation required.
		*
		* #### destroy(resourceURI, formdata)
		* TODO: Implementation required.
		*/
		.provider("noHTTP",[function(){
			this.$get = ['$rootScope', '$q', '$timeout', '$http', '$filter', 'noUrl', 'noConfig', 'noDbSchema', 'noOdataQueryBuilder', 'noLogService', function($rootScope, $q, $timeout, $http, $filter, noUrl, noConfig, noDbSchema, noOdataQueryBuilder, noLogService){
				/**
				* ### @class NoDb
				*
				* #### Overview
				*
				* Creates and manages a set of NoTable objects.
				*
				* #### @constructor NoDb(tables, queryBuilder)
				*
				* ##### Parameters
				*
				* |Name|Type|Description|
				* |----|----|-----------|
				* |tables|object|A hash object that contains a collection of table configuration as provided by noDbScema|
				* |queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|
				*
				*/
				function NoDb(queryBuilder){
					var THIS = this;

					this.whenReady = function(){
						var deferred = $q.defer(),
							tables = noDbSchema.tables;

						$timeout(function(){
							if($rootScope.noHTTPInitialized)
							{
								noLogService.log("noHTTP Ready.");
								deferred.resolve();
							}else{
								//noLogService.log("noDbSchema is not ready yet.")
								$rootScope.$watch("noHTTPInitialized", function(newval){
									if(newval){
										noLogService.log("noHTTP ready.");
										deferred.resolve();
									}
								});

								configure(tables)
									.then(function(resp){
										$rootScope.noHTTPInitialized = true;
									})
									.catch(function(err){
										deferred.reject(err);
									});
							}
						});

						return deferred.promise;
					};

					function configure(tables){
						var deferred = $q.defer();

						$timeout(function(){
							angular.forEach(tables, function(table, name){
								this[name] = new NoTable(name, table, queryBuilder);
							}, THIS);

							deferred.resolve();
						});

						return deferred.promise;
					}

				}


				/**
				* ### @class NoTable
				*
				* #### Overview
				*
				* Provides an interface that loosely matches that of the NoTable
				* class provided by noDexie.  This to ease the integration with
				* NoInfoPath component that consume data such as noKendo.
				*
				* #### @constructor NoTable(tableName, queryBuilder)
				*
				* ##### Parameters
				*
				* |Name|Type|Description|
				* |----|----|-----------|
				* |tableName|string|name of the table that this instance will interact with.|
				* |queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|
				*/
				function NoTable(tableName, table, queryBuilder){
					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url =  noUrl.makeResourceUrl(noConfig.current.RESTURI, tableName);

					this.noCreate = function(data){
						var json = angular.toJson(data);

						var deferred = $q.defer(),
							req = {
								method: "POST",
								url: url,
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
					};

					this.noRead = function() {
						//noLogService.debug("noRead say's, 'swag!'");
						var filters, sort, page;

						for(var ai in arguments){
							var arg = arguments[ai];

							//success and error must always be first, then
							if(angular.isObject(arg)){
								switch(arg.constructor.name){
									case "NoFilters":
										filters = arg;
										break;
									case "NoSort":
										sort = arg;
										break;
									case "NoPage":
										page = arg;
										break;
								}
							}
						}

						var deferred = $q.defer(),
							req = {
								method: "GET",
								params: queryBuilder(filters,sort,page),
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
								noLogService.error(arguments);
								deferred.reject(reason);
							});

						return deferred.promise;
					};

					this.noUpdate = function(data) {
						var json = angular.toJson(data);

						var deferred = $q.defer(),
							req = {
								method: "PUT",
								url: url + "(guid'" + data[table.primaryKey] + "')",
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function(data, status){
								deferred.resolve(status);
							})
							.error(function(reason){
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;

					};

					this.noDestroy = function(data) {
						var deferred = $q.defer(),
							req = {
								method: "DELETE",
								url: url + "(guid'" + data[table.primaryKey] + "')",
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function(data, status){
								deferred.resolve(status);
							})
							.error(function(reason){
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;
					};
				}

				//return new noREST($q, $http, $filter, noUrl, noConfig)
				return new NoDb(noOdataQueryBuilder.makeQuery);
			}];
		}])
	;
})(angular);

var GloboTest = {};

(function (angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")

		/*
		 * ## noDbSchema
		 *The noDbSchema service provides access to the database configuration that defines how to configure the local IndexedDB data store.
		*/
		.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "noConfig", "$filter", function($q, $timeout, $http, $rootScope, _, noLogService, noConfig, $filter){
			var _interface = new NoDbSchema(),  
				_config = {}, 
				_tables = {}, 
				_sql = {}, 
				CREATETABLE = "CREATE TABLE IF NOT EXISTS ",
				INSERT = "INSERT INTO ",
				UPDATE = "UPDATE ",
				DELETE = "DELETE FROM ",
				READ = "SELECT * FROM ",
				COLUMNDEF = "{0}",
				PRIMARYKEY = "PRIMARY KEY ASC",
				FOREIGNKEY = "REFERENCES ",
				NULL = "NULL",
				INTEGER = "INTEGER",
				REAL = "REAL",
				TEXT = "TEXT",
				BLOB = "BLOB",
				NUMERIC = "NUMERIC",
				WITHOUTROWID = "WITHOUT ROWID",
				sqlConversion = {
					"bigint" : INTEGER,
					"bit" : INTEGER,
					"decimal" : NUMERIC,
					"int" : INTEGER,
					"money" : NUMERIC, // CHECK
					"numeric" : NUMERIC,
					"smallint" : INTEGER,
					"smallmoney" : NUMERIC, // CHECK
					"tinyint" : INTEGER,
					"float" : REAL,
					"real" : REAL,
					"date" : NUMERIC, // CHECK
					"datetime" : NUMERIC, // CHECK
					"datetime2" : NUMERIC, // CHECK
					"datetimeoffset" : NUMERIC, // CHECK
					"smalldatetime" : NUMERIC, // CHECK
					"time" : NUMERIC, // CHECK
					"char" : TEXT,
					"nchar" : TEXT,
					"varchar" : TEXT,
					"nvarchar" : TEXT,
					"text" : TEXT,
					"ntext" : TEXT,
					"binary" : BLOB, // CHECK
					"varbinary" : BLOB,
					"image" : BLOB,
					"uniqueidentifier" : TEXT
				},
				toSqlLiteConversionFunctions = {
					"TEXT" : function(s){return angular.isString(s) ? "'"+s+"'" : null;},
					"BLOB" : function(b){return b;},
					"INTEGER" : function(i){return angular.isNumber(i) ? i : null;},
					"NUMERIC" : function(n){return angular.isNumber(n) ? n : null;},
					"REAL" : function(r){return r;}
				},
				fromSqlLiteConversionFunctions = {
					"bigint" : function(i){return angular.isNumber(i) ? i : null;},
					"bit" : function(i){return angular.isNumber(i) ? i : null;},
					"decimal" : function(n){return angular.isNumber(n) ? n : null;},
					"int" : function(i){return angular.isNumber(i) ? i : null;},
					"money" : function(n){return angular.isNumber(n) ? n : null;}, 
					"numeric" : function(n){return angular.isNumber(n) ? n : null;},
					"smallint" : function(i){return angular.isNumber(i) ? i : null;},
					"smallmoney" : function(n){return angular.isNumber(n) ? n : null;}, 
					"tinyint" : function(i){return angular.isNumber(i) ? i : null;},
					"float" : function(r){return r;},
					"real" : function(r){return r;},
					"date" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"datetime" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"datetime2" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();},
					"datetimeoffset" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"smalldatetime" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();},
					"time" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"char" : function(t){return angular.isString(t) ? t : null;},
					"nchar" : function(t){return angular.isString(t) ? t : null;},
					"varchar" : function(t){return angular.isString(t) ? t : null;},
					"nvarchar" : function(t){return angular.isString(t) ? t : null;},
					"text" : function(t){return angular.isString(t) ? t : null;},
					"ntext" : function(t){return angular.isString(t) ? t : null;},
					"binary" : function(b){return b;}, 
					"varbinary" : function(b){return b;},
					"image" : function(b){return b;},
					"uniqueidentifier" : function(t){return angular.isString(t) ? t : null;}
				}
			;

			GloboTest.fromSqlLiteConversionFunctions = fromSqlLiteConversionFunctions;
			GloboTest.toSqlLiteConversionFunctions = toSqlLiteConversionFunctions;
			GloboTest.sqlConversion = sqlConversion;

			function NoDbSchema(){
				var _interface = {
					"createTable" : function(tableName, tableConfig){
						var rs = CREATETABLE;

						rs += tableName + " (" + this.columnConstraints(tableConfig) + ")";

						return rs;
					},
					"columnDef" : function(columnName, columnConfig, tableConfig){
						return columnName + " " + this.typeName(columnConfig) + this.columnConstraint(columnName, columnConfig, tableConfig);
					},
					"columnConstraint": function(columnName, columnConfig, tableConfig){
						var isPrimaryKey = this.isPrimaryKey(columnName, tableConfig),
							isForeignKey = this.isForeignKey(columnName, tableConfig),
							isNullable = this.isNullable(columnConfig),
							returnString = ""
						;

						returnString += this.primaryKeyClause(isPrimaryKey && (!isForeignKey && !isNullable)); // A PK cannot be a FK or nullable.
						returnString += this.foreignKeyClause((isForeignKey && !isPrimaryKey), columnName, tableConfig.foreignKeys); // A FK cannot be a PK
						returnString += this.nullableClause(isNullable && !isPrimaryKey); // A nullable field cannot be a PK

						return returnString;
					},
					"typeName": function(columnConfig){
						return sqlConversion[columnConfig.type];
					},
					"expr": function(Expr){return ""},
					"foreignKeyClause": function(isForeignKey, columnName, foreignKeys){
						var rs = "";
						if(isForeignKey){
							rs = " " + FOREIGNKEY + foreignKeys[columnName].table + " (" + foreignKeys[columnName].column + ")";
						}
						return rs;
					},
					"primaryKeyClause": function(isPrimaryKey){
						var rs = "";
						if(isPrimaryKey){
							rs = " " + PRIMARYKEY;
						}
						return rs;
					},
					"nullableClause": function(isNullable){
						var rs = "";
						if(isNullable){
							rs = " " + NULL;
						}
						return rs;
					},
					"columnConstraints": function(tableConfig){
						var colConst = [];
						angular.forEach(tableConfig.columns, function(value, key){
							colConst.push(this.columnDef(key, value, tableConfig));
						}, this);
						return colConst.join(",");
					},
					"isPrimaryKey": function(columnName, tableConfig){
						return (columnName === tableConfig.primaryKey);
					},
					"isForeignKey": function(columnName, tableConfig){
						return !!tableConfig.foreignKeys[columnName];
					},
					"isNullable": function(columnConfig){
						return columnConfig.nullable;
					},
					"sqlInsert": function(tableName, data){
						var columns = [],
							values = [],
							columnString = "",
							valuesString = ""
						;

						angular.forEach(data, function(value, key){
							columns.push(key);

							if(angular.isString(value))
							{
								values.push("'" + value + "'");
							} else {
								values.push(value);
							}
						});

						columnString = columns.join(",");
						valuesString = values.join(",");

						return INSERT + tableName + " (" + columnString + ") VALUES (" + valuesString + ");";
					},
					"sqlUpdate": function(tableName, data, filters){
						var nvp = [],
							nvpString;

						angular.forEach(data, function(value, key){

							nvp.push(this.sqlUpdateNameValuePair(value, key));

						}, this);

						nvpString = nvp.join(", ");

						return UPDATE + tableName + " SET " + nvpString + " WHERE " + filters.toSQL();
						
					},
					"sqlUpdateNameValuePair": function(value, key){
						var rs = "";

						if(angular.isString(value))
						{
							rs = key + " = '"  + value + "'";
						} 
						else 
						{
							rs = key + " = " + value;
						}

						return rs
					},
					"sqlDelete": function(tableName, filters){
						return DELETE + tableName + " WHERE " + filters.toSQL();
					},
					"sqlRead": function(tableName, filters, sort, page){
						var fs, ss, ps;
						fs = !!filters ? " WHERE " + filters.toSQL() : "";
						ss = !!sort ? " " + sort.toSQL() : "";
						ps = !!page ? " " + page.toSQL() : "";
						return READ + tableName + fs + ss + ps;
					},
					"sqlOne": function(tableName, primKey, value){
						return READ + tableName + " WHERE " + primKey + " = '" + value + "'";
					}
				}

				this.createSqlTableStmt = function(tableName, tableConfig){
					return _interface.createTable(tableName, tableConfig);
				}

				this.createSqlInsertStmt = function(tableName, tableConfig){
					return _interface.sqlInsert(tableName, tableConfig);
				}

				this.createSqlUpdateStmt = function(tableName, data, filters){
					return _interface.sqlUpdate(tableName, data, filters);
				}

				this.createSqlDeleteStmt = function(tableName, filters){
					return _interface.sqlDelete(tableName, filters);
				}

				this.createSqlReadStmt = function(tableName, filters, sort, page){
					return _interface.sqlRead(tableName, filters, sort, page);
				}

				this.createSqlOneStmt = function(tableName, primKey, value){
					return _interface.sqlOne(tableName, primKey, value);
				}

				/*
					### Properties

					|Name|Type|Description|
					|----|----|-----------|
					|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
					|tables|Object|A hash table of NoInfoPath database schema definitions|
					|isReady|Boolean|Returns true if the size of the tables object is greater than zero|
				*/
				Object.defineProperties(this, {
					"store": {
						"get": function() { return _config; }
					},
					"tables": {
						"get": function() { return _tables; }
					},
					"isReady": {
						"get": function() { return _.size(_tables) > 0; }
					},
					"sql": {
						"get": function() { return _sql; }
					}
				});

				/**
					### Methods

					#### _processDbJson
					Converts the schema received from the noinfopath-rest service and converts it to a Dexie compatible object.

					##### Parameters
					|Name|Type|Descriptions|
					|resp|Object|The raw HTTP response received from the noinfopath-rest service|
				*/
				function _processDbJson(resp){
					var deferred = $q.defer();

					_tables = resp.data;

					$timeout(function(){
						//save reference to the source data from the rest api.

						angular.forEach(_tables, function(table, tableName){
							var primKey = "$$" + table.primaryKey,
								foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");

							//Prep as a Dexie Store config
							_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
						});

						deferred.resolve();
					});

					//noLogService.log(angular.toJson(_config));
					return deferred.promise;
				}

				/**
					### load()
					Loads and processes the database schema from the noinfopath-rest service.

					#### Returns
					AngularJS::Promise
				*/
				function load(){
					var req = {
						method: "GET",
						url: noConfig.current.NODBSCHEMAURI, //TODO: change this to use the real noinfopath-rest endpoint
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						withCredentials: true
					};

					return $http(req)
						.then(_processDbJson)
						.catch(function(resp){
							noLogService.error(resp);
						});
				}

				/*
					### whenReady
					whenReady is used to check if this service has completed its load phase. If it has not is calls the internal load method.

					#### Returns
					AngularJS::Promise
				*/

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noDbSchemaInitialized)
						{
							noLogService.log("noDbSchema Ready.");
							deferred.resolve();
						}else{
							//noLogService.log("noDbSchema is not ready yet.")
							$rootScope.$watch("noDbSchemaInitialized", function(newval){
								if(newval){
									noLogService.log("noDbSchema ready.");
									deferred.resolve();
								}
							});

							load()
								.then(function(resp){
									$rootScope.noDbSchemaInitialized = true;
								})
								.catch(function(err){
									deferred.reject(err);
								});
						}
					});

					return deferred.promise;
				};

				this.test = _interface;

			}

			return _interface;
		}])

	;

})(angular, Dexie);

/*
* ## @interface INoQueryBuilder
*
* > INoQueryBuilder is a conceptual entity, it does not really exist
* > the reality. This is because JavaScript does not implement interfaces
* > like other languages do. This documentation should be considered as a
* > guide for creating query providers compatible with NoInfoPath.
*
* ### Overview
* INoQueryBuilder provides a service interface definition for converting a set
* of NoInfoPath class related to querying data into a given query protocol.
* An example of this is the ODATA 2.0 specification.
*
* ### Methods
*
* #### makeQuery(filters, sort, page)
*
* ##### Parameters
*
* |Name|Type|Descriptions|
* |----|----|------------|
* |filters|NoFilters|(Optional) Instance of a NoFilters class|
* |sort|NoSort|(Optional) Instance of NoSort class|
* |page|NoPage|(Optional) Instance of NoPage class|
*
* ##### Returns
* Object
*
*/

(function(angular, undefined){
	angular.module("noinfopath.data")
		/*
		* ## @service noSQLQueryBuilder : INoQueryBuilder
		*
		* ### Overview
		*
		* Implements a INoQueryBuilder compatible service that converts NoFilters,
		* NoSort, NoPage into a WebSQL compatible query string.
		*
		*/
		.service("noSQLQueryBuilder", ['$filter', function($filter){
			var sqlFilters = {
					eq: "==",
					neq: "!=",
					gt: ">",
					gte: ">=",
					lt: "<",
					lte: "<=",
					contains : "CONTAINS",
					doesnotcontain: "NOT CONTAINS"
					//endswith: "endswith",
					//startswith: "startswith"
				},
				mappers = {
					pageSize: angular.noop,
					page: angular.noop,
					filter: function(params, filter) {
						if (filter) {
							params.$filter = toSQLFilter(filter);
						}
					},
					data: function(params, filter){
						mappers.filter(params, filter.filter);
					},
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

			function toSQLFilter (filters) {
			    var result = [],
			        idx,
			        length,
			        field,
			        type,
			        format,
			        operator,
			        value,
			        ignoreCase,
					filter,
					origFilter;

			   

			    for (idx = 0, length = filters.length; idx < length; idx++) {
			    	filter = origFilter = filters[idx];
			    	field = filter.column;
			        value = filter.value;
			        operator = filter.operator;
					logic = filter.logic;

			    	if (filter.filters)
			    	{
			    		filter = toSQLFilter(filter);
			    	}
			    	else
			    	{
			    		ignoreCase = filter.ignoreCase;
			            field = field.replace(/\./g, "/");
			            filter = sqlFilters[operator];

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
			                   
		                    	value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
		                        format = "{1}";
			                    
			                } else {
			                    format = "{1}";
			                }

			                // if (filter.length > 3) {
			                //     if (filter !== "substringof") {
			                //         format = "{0}({2}," + format + ")";
			                //     } else {
			                //         format = "{0}(" + format + ",{2})";
			                //         // if (operator === "doesnotcontain") {
			                //         //     if (useOdataFour) {
			                //         //         format = "{0}({2},'{1}') eq -1";
			                //         //         filter = "indexof";
			                //         //     } else {
			                //         //         format += " eq false";
			                //         //     }
			                //         // }
			                //     }
			                // } else {
			                //     format = "{2} {0} " + format;
			                // }

			                filter = $filter("format")(format, filter, value, field);
			            }
			    	}

			    	origFilter.compiledFilter = filter;
			        result.push(origFilter);
			    }

 				var SQLFilter = "", f;

 				do{

 				}while(f);

 				SQLFilter = SQLFilter.trim();

		        return SQLFilter;
			}

			function toSQLSort(sort){
				var sorts = [], expr;

				angular.forEach(sort, function(value) {
					var order = value.column.replace(/\./g, "/");

					if (value.dir === "desc") {
						order += " desc";
					}

					sorts.push(order);
				});

				expr = sorts ? sorts.join(",") : undefined;

				return expr;
			}

			this.makeQuery = function(){
				var query = {};

				for(var ai in arguments){
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg)){
						switch(arg.__type){
							case "NoFilters":
								query.$filter = toSQLFilter(arg);
								break;
							case "NoSort":
								query.$orderby = toSQLSort(arg);
								break;
							case "NoPage":
								page = arg;
								break;
						}
					}
				}

				return query;
			};
		}])
	;
})(angular);

//websql.js
(function(angular, undefined){
	"use strict";

	function noDbService($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService){
		var _webSQL = openDatabase(noConfig.current.WebSQL.name, noConfig.current.WebSQL.version, noConfig.current.WebSQL.description, noConfig.current.WebSQL.size);

		_webSQL.whenReady = function(){
			var deferred = $q.defer(),
				tables = noDbSchema.tables;

			$timeout(function(){
				if($rootScope.noWebSQLInitialized)
				{
					noLogService.log("noWebSQL Ready.");
					deferred.resolve();
				}else{
					
					$rootScope.$watch("noWebSQLInitialized", function(newval){
						if(newval){
							noLogService.log("noWebSQL Ready.");
							deferred.resolve();
						}
					});

					this.configure(tables)
						.then(function(resp){
							$rootScope.noWebSQLInitialized = true;
						})
						.catch(function(err){
							deferred.reject(err);
						});
				}
			}.bind(this));

			return deferred.promise;
		}.bind(_webSQL);

		_webSQL.configure = function(tables){
			var promises = [];
		
			angular.forEach(tables, function(table, name){
				var t = new NoTable(table, name, noSQLQueryBuilder, _webSQL);
				this[name] = t;
				promises.push(createTable(name, table));
			}, this);
			
			return $q.all(promises);
		}.bind(_webSQL);

		var createTable = function(tableName, table){

			var deferred = $q.defer();

			this.transaction(function(tx){
				tx.executeSql(noDbSchema.createSqlTableStmt(tableName, table), [],
			 	function(t, r){
					deferred.resolve();
			 	}, 
				function(t, e){
			 		deferred.reject();
			 	});  
			});

			// _executeSQLTrans(noDbSchema.createSqlTableStmt(_tableName, _table), [], 
			// 	function(t, r){
			// 		deferred.resolve();
			// 	},
			// 	function(t, e){
			// 		deferred.reject();
			// 	});


			return deferred.promise;

		}.bind(_webSQL);

		function NoTable(table, tableName, queryBuilder, database){
			if(!table) throw "table is a required parameter";
			if(!tableName) throw "tableName is a required parameter";
			if(!queryBuilder) throw "queryBuilder is a required parameter";

			var _table = table,
				_tableName = tableName,
				_qb = queryBuilder
			;

			

			this.noCreate = function(data, noTransaction){
				// noTransaction is not required, but is needed to track transactions
				var deferred = $q.defer();

				noTransaction.webSQLTrans.executeSql(
					noDbSchema.createSqlInsertStmt(_tableName, data), 
					[],
				 	function(t, r){
				 		var result = r.rows[0];

				 		noTransaction.addChange(_tableName, result, "C");

						deferred.resolve(result);
				 	}, 
					function(t, e){
				 		deferred.reject(e);
				 	}
				);

				return deferred.promise;
			};

			// this.noRead = function() {

			// 	var filters, sort, page,
			// 		deferred = $q.defer();

			// 	for(var ai in arguments){
			// 		var arg = arguments[ai];

			// 		//success and error must always be first, then
			// 		if(angular.isObject(arg)){
			// 			switch(arg.constructor.name){
			// 				case "NoFilters":
			// 					filters = arg;
			// 					break;
			// 				case "NoSort":
			// 					sort = arg;
			// 					break;
			// 				case "NoPage":
			// 					page = arg;
			// 					break;
			// 			}
			// 		}
			// 	}

			// 	// var queryBuilderObject = queryBuilder(filters,sort,page);
			// 	// var queryBuilderString = queryBuilderObject.toSQL();

			// 	// var command = "SELECT * " + queryBuilderString;

				

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlReadStmt(_tableName, filters, sort, page), [], 
			// 			function(t, r){
			// 				deferred.resolve(r);
			// 			}, 
			// 			function(t, e){
			// 				deferred.reject(e);
			// 			});
			// 	});

			// 	return deferred.promise;
			// };

			// this.noUpdate = function(data, filters) {
			// 	// UPDATE

			// 	var deferred = $q.defer();

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlUpdateStmt(_tableName, data, filters), [],
			// 	 	function(t, r){
			// 			deferred.resolve(r);
			// 	 	}, 
			// 		function(t, e){
			// 	 		deferred.reject(e);
			// 	 	});  
			// 	});

			// 	return deferred.promise;
			// };

			// this.noDestroy = function(filters) {
			// 	// DELETE FROM TABLE WHERE DATA = FILTER
			// 	var deferred = $q.defer()

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlDeleteStmt(_tableName, filters), [],
			// 	 	function(t, r){
			// 			deferred.resolve(r);
			// 	 	}, 
			// 		function(t, e){
			// 	 		deferred.reject(e);
			// 	 	});  
			// 	});

			// 	return deferred.promise;
			// };

			// this.noOne = function(data) {
			// 	var deferred = $q.defer(),
		 // 		table = this,
			// 	key = data[_table.primaryKey];

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlOneStmt(_tableName, _table.primaryKey, key), [], 
			// 			function(t, r){
			// 				deferred.resolve(r);
			// 			}, 
			// 			function(t, e){
			// 				deferred.reject(e);
			// 			});
			// 	});

			//  	return deferred.promise;
			// };

		}
		
		return _webSQL;
	}

	

	angular.module("noinfopath.data")
		.factory("noWebSQL",['$parse','$rootScope','lodash', '$q', '$timeout', 'noConfig', 'noSQLQueryBuilder', 'noDbSchema', 'noLogService', function($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService)
		{
	      	return noDbService($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService);
		}])
		;
})(angular);

(function(angular, undefined){
	"use strict";
	angular.module("noinfopath.data")
		.run(["noDataTransactionCache", "noLoginService", function(noDataTransactionCache, noLoginService){
			var user = noLoginService.user, 
				version = {"name":"NoInfoPath-Changes-v1","version":1}, 
				store = {"NoInfoPath_Changes": "$$ChangeID"}, 
				tables = {
					"NoInfoPath_Changes": {
						"primaryKey": "ChangeID"
					}
				};

			noDataTransactionCache.configure(user, version, store, tables)
				.catch(function(err){
					console.error(err);
				});
		}])
		.factory("noTransactionCache", ["$q", "noDataTransactionCache", "noLoginService", function($q, noDataTransactionCache, noLoginService){

			function NoTransaction(userID, transaction){
				var SELF = this,
					_tx = transaction;

				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoTransaction";
						}
					},
					"webSQLTrans": {
						"get": function(){
							return _tx;
						}
					}
				});

				this.transactionID = noInfoPath.createUUID();
				this.timestamp = new Date().valueOf();
				this.userID = userID;
				this.changes = new NoChanges();
			
				this.addChange = function(tableName, data, changeType){
					this.changes.add(tableName, data, changeType);
				}

			}

			function NoChanges(){
				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoChanges";
						}
					}
				});
				var arr = [];
				noInfoPath.setPrototypeOf(this, arr);
				this.add = function(tableName, data, changeType){
					this.unshift(new NoChange(tableName, data, changeType));
				}
			}

			function NoChange(tableName, data, changeType){
				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoChange";
						}
					}
				});	

				this.tableName = tableName;
				this.data = data;
				this.changeType = changeType;
			}

			function _noTransactionCache($q, noDataTransactionCache, noLoginService){
				var SELF = this;

				this.beginTransaction = function(db){

					var deferred = $q.defer();

					db.transaction(function(tx){
						var t = new NoTransaction(noLoginService.user.userId, tx);

						deferred.resolve(t);
					});

					return deferred.promise;
				}

				this.addChange = function(tableName, data, changeType){
					_transaction.addChange(tableName, data, changeType);
				}

				this.endTransaction = function(){
					noDataTransactionCache.NoInfoPath_Changes.noCreate(_transaction);
				}
			}

			return new _noTransactionCache($q, noDataTransactionCache, noLoginService);

		}])
		;	
})(angular);


(function (angular, Dexie, undefined){
	"use strict";

	function noDbService($timeout, $q, $rootScope, _, noLogService, databaseName){
			/**
				### Class noDatum
				This is a contructor function used by Dexie when creating and returning data objects.
			*/
			function noDatum(){
				noLogService.log("noDatum::constructor"); //NOTE: This never seems to get called.
			}

			/**
				### Class noDexie
				This is the classed used to construct the Dexie AddOn.
			*/
			function noDexie(db){

				/*
					#### noCreate
					Adds a new record to the database. If the primary key is provided in that will be used when adding otherwise a new UUID will be created by Dexie.

					##### Parameters

					|Name|Type|Description|
					|data|Object|An object contains the properties that match the schema for the underlying WriteableTable.

					##### Returns
					AngularJS:Promise
				*/
				db.WriteableTable.prototype.noCreate = function(data){
					var deferred = $q.defer(),
						table = this;


					//noLogService.log("adding: ", _dexie.currentUser);

					_dexie.transaction("rw", table, function(){
						data.CreatedBy =  _dexie.currentUser.userId;
						data.DateCreated = new Date(Date.now());
						data.ModifiedDate = new Date(Date.now());
						data.ModifiedBy =  _dexie.currentUser.userId;

						table.add(data)
							.then(function(data){
								noLogService.log("addSuccessful", data);
								table.get(data)
									.then(function(data){
										//deferred.resolve(data);
										window.noInfoPath.digest(deferred.resolve, data);
									})
									.catch(function(err){
										//deferred.reject("noCRUD::create::get " + err);
										window.noInfoPath.digestError(deferred.reject, err);
									});

							})
							.catch(function(err){
								//deferred.reject("noCRUD::create " + err);
								window.noInfoPath.digestError(deferred.reject, err);
							});
					})
					.then(function(){
						noLogService.log("transaction successful for Create");
					})
					.catch(function(err){
						deferred.reject("noCRUD::createTrans " + err);
						window.noInfoPath.digestError(deferred.reject, err);
					});

					return deferred.promise;
				};

				/*
					#### noRead

					The read operation takes a complex set of parameters that allow
					for filtering, sorting and paging of data.

					##### Parameters

					|Name|Type|Descriptions|
					|----|----|------------|
					|filters|NoFilters|(Optional) Any `NofilterExpression` objects that need to be applied to the the current table.|
					|sort|NoSort|(Optional) Any `NoSortExpression` objects that need to be applied to the result set. The will be applied in the order supplied.|
					|page|NoPage|(Optional) Paging information, if paging is reqired by the read operation.|

					##### Returns
					AngularJS::Promise
				*/
				db.Table.prototype.noRead = function(){
					/**
						#### Internal Values

						|Name|Type|Description|
						|------|-----|-------------|
						|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
						|_resolve|Function|Call to resolve `Dexie::Promise` upon successful completion of `_applyFilters()`. This function is returned while resolving the underlying IDBObjectStore from the `table` parameter.|
						|_reject|Function|Call to resolve the `Dexie::Promise` when an unexpected for un recoverable error occurs during processing.|
						|_store|IDBObjectStore|This underlying `IDBObjectStore` that the `table` parameter represents.|
						|_trans|IDBTransaction|This is the underlying `IDBTransaction` that the current object store is bound to.|
					*/
					var deferred = $q.defer(),
						table = this,
						store, _resolve, _reject, _store, _trans,
						filters, sort, page,
						indexedOperators = {
							"eq": "equals",
							"gt": "above",
							"ge": "aboveOrEqual",
							"lt": "below",
							"le": "belowOrEqual",
							"startswith": "startsWith",
							"bt": "between"
						},

						/**
							##### nonIndexedOperators
							This hash table allows for quick access to the operations that can be applied to a property on a target object and the value(s) being filtered on.

							NOTE:  The "a" parameter will always be the value tested, and "b" will always be the value being filter for.
						*/
						operators = {
							"in": function(a, b){
								return _.indexOf(b,a) > -1;
							},
							"eq": function(a, b){
								return a === b;
							},
							"neq": function(a, b){
								return a !== b;
							},
							"gt": function(a, b){
								return a > b;
							},
							"ge": function(a, b){
								return a >= b;
							},
							"lt": function(a, b){
								return a < b;
							},
							"le": function(a, b){
								return a <= b;
							},
							"startswith": function(a, b){
								var a1 = a ? a.toLowerCase() : "",
									b1 = b ? b.toLowerCase() : "";

								return a1.indexOf(b1) === 0;
							},
							"contains": function(a, b){
								var a1 = a ? a.toLowerCase() : "",
									b1 = b ? b.toLowerCase() : "";

								return a1.indexOf(b1) >= -1;
							}
						}, buckets = {};


					//sort out the parameters
					for(var ai in arguments){
						var arg = arguments[ai];

						//success and error must always be first, then
						if(angular.isObject(arg)){
							switch(arg.__type){
								case "NoFilters":
									filters = arg;
									break;
								case "NoSort":
									sort = arg;
									break;
								case "NoPage":
									page = arg;
									break;
							}
						}
					}

					/**
						#### _applyFilters
						This function develops an array of objects that has had all of the filters provided in the original request applied to them.  The schema matches the schema of the `table` parameter.

						##### Parameters

						|Name|Type|Description|
						|----|----|------|
						|iNofilters|[iNoFilterExpression]|An array of filter expressions. Contains both indexed and non-indexed filters|
						|table|Dexie::Table|A reference to the `Dexie::Table` being filtered.

						##### Internal variables

						|Name|Type|Description|
						|------|-----|-------------|
						|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
						|iNoFilterHash|Collection<iNoFilters>|Used to organize the filters received in the `iNoFilters` in to a set of indexed and non-indexed filter object The collection is created by a call to `_sortOutFilters()`.|
						|resultsKeys|Array\<guid\>|This will be use to collect the final set of results. It will be an array of keys that will be used to query the final result set.|

						##### Returns
						AngularJS::Promise (Maybe)
					*/
					function _applyFilters(iNoFilters, store){
					    var deferred = $q.defer(),
					    	iNoFiltersHash = _sortOutFilters(iNoFilters),
							resultKeys = [];

						if(iNoFilters){
							//Filter on the indexed filters first.  That should reduce the
							//set to make the non-indexed filters more performant.
							_recurseIndexedFilters(iNoFiltersHash.indexedFilters, table)
								.then(function(data){
									// _applyNonIndexedFilters()
									// 	.then(function(data){
									// 		deferred.resolve(data);
									// 	});
									deferred.resolve(new noInfoPath.data.NoResults(data));
								})
								.catch(function(err){
									deferred.reject(err);
								});
						}else{
							table.toArray()
								.then(deferred.resolve)
								.catch(deferred.reject);
						}


						return deferred.promise;
					}

					/**
						### _recurseIndexedFilters
					*/
					function _recurseIndexedFilters(filters, table){

						var deferred = $q.defer(),
							map = {};

						function _reduce(map){
							var keys = [], all = [], results = [];
								// ors = _.filter( _.pluck(map, "filter"), {logic: "or"}),
								// ands = _.filter( _.pluck(map, "filter"), {logic: "and"}),
								// mergedOrs = _merge(map, ors)
							for(var k in map){
								var items = map[k];

								//noLogService.log(items);

								switch(items.filter.logic){
									case "or":
										keys = _.union(keys, _.pluck(items.data, "pk"));
										break;
									case "and":
										keys = _.intersection(keys, _.pluck(items.data, "pk"));
										break;
									default:
										keys = keys.concat(_.pluck(items.data, "pk"));
										break;

								}
								//noLogService.log( _.pluck(items.data, "pk").length)
								all = _.union(all, items.data);
							}

							for(var ka in all){
								var item = all[ka].obj,
									key = item[table.schema.primKey.name];

								if(keys.indexOf(key) > -1){
									results.push(item);
								}
							}

							return results;
						}

						function _map(){
							var filter = filters.pop(),
								promise;

							if(filter){
								if(table.schema.primKey === filter.column){
									promise = _filterByPrimaryKey(filter, table);
								}else{
									promise = _filterByIndex(filter, table);
								}

								promise
									.then(function(data){
										map[filter.column] = {pk: table.schema.primKey.name, filter: filter, data: data};
										_map();
									})
									.catch(function(err){
										//deferred.reject(err);
										noLogService.error(err);
									});
							}else{
								deferred.resolve(_reduce(map));
							}
						}

						$timeout(_map);

						window.noInfoPath.digestTimeout();

						return deferred.promise;
					}

					/**
						### _filterByPrimaryKey  -- Being Deprecated

						This method of of filterig goes against the `IDBObjectStore`'s primary key.
					*/
					function _filterByPrimaryKey(filter, store){
						var deferred = $q.defer(),
							req = store.openKeyCursor(),
							operator = operators[filter.operator],
							matchedKeys = [];

						req.onsuccess = function(event){
							var cursor = event.target.result;
							if(cursor){
								if(operator(cursor.key, filter.value)){
									matchedKeys.push(cursor.primaryKey);
								}
								cursor.continue();
							}else{
								deferred.resolve(matchedKeys);
							}
						};

						req.onerror = function(){
							deferred.reject(req.error);
						};

						return deferred.promise;
					}

					/**
						### _filterByIndex

						This method of filtering goes against a predefined index. Basically we are doing a MapReduce techique angaist each indexed filter we come across. Using the `filter` parameter provided the index is reduced by matching against the `value` property of the `INoFilterExpression`.  See the `INoFilterExpression` for more details.

						#### Parameters

						|Name|Type|Description|
						|------|-----|-------------|
						|filter|INoFilterExpression|A single indexed filter the contains the column, operator, and value to apply to the index.|

						#### Returns
						AngularJS::Promise
					*/
					function _filterByIndex(filter, table) {
						var deferred = $q.defer(),
							operator = operators[filter.operator],
							matchedKeys = [];


						table._idbstore("readonly", function(resolve, reject, store, trans){
							var ndx = store.index(filter.column),
								req = ndx.openCursor();

							req.onsuccess = function(event){
								var cursor = event.target.result;
								if(cursor){
									if(operator(cursor.key, filter.value)){
										matchedKeys.push({pk: cursor.primaryKey, fk: cursor.key, obj: cursor.value});
									}
									cursor.continue();
								}else{
									//noLogService.info(matchedKeys);
									resolve(matchedKeys);
								}
							};

							req.onerror = function(event){
								reject(event);
							};

							trans.on("complete", function(event){
								deferred.resolve(matchedKeys);
							});

							trans.on("error", function(event){
								deferred.reject(trans.error());
							});
						});

						return deferred.promise;
					}

					function _filterByProperty(iNoFilterExpression, obj){
						return nonIndexedOperators[iNoFilterExpression.operator](obj, iNoFilter.column, iNoFilter.value);
					}

					/*
						This method of filtering compares the supplied set of
						filters against each object return in the Dexie colletion.
						This is a much slower than filtering against an index.
					*/
					function _filterByProperties(iNoFilters, collection) {

						return collection.and(function(obj){
							angular.forEach(iNoFilters, function(iNoFilterExpression){
								_filterByProperty(iNoFilters, obj);
							});
						});
					}


					/*
						_filterHasIndex uses the iNoFilter parameter to determine
						if there is an index available for the give filter. it returns
						true if there is, false if not.

						To determine if and index exists, we look at the table.schema.primKey,
						and table.schema.indexes properties.
					*/
					function _filterHasIndex(iNoFilterExpression) {
						return _.findIndex(table.schema.indexes, {keyPath: iNoFilterExpression.column}) > -1;
					}

					/*
						This function splits up the filters by indexed verses not. The
						return value is a INoFilterHash.

						interface INoFilterHash {
							indexedFilters: [INoFilterExpression]
							nonIndexedFilters: [INoFilterExpression]
						}
					*/
					function _sortOutFilters(iNoFilters) {
						//noLogService.log("Start of sort",table.schema.indexes);

						var iNoFilterHash = {
							indexedFilters: [],
							nonIndexedFilters: []
						};

						angular.forEach(iNoFilters, function(iNoFilterExpression){

							if(table.schema.primKey.keyPath === iNoFilterExpression.column){
								iNoFilterHash.indexedFilters.push(iNoFilterExpression);
							} else {
								if(_filterHasIndex(iNoFilterExpression)){
									iNoFilterHash.indexedFilters.push(iNoFilterExpression);
								} else {
									iNoFilterHash.nonIndexedFilters.push(iNoFilterExpression);
								}
							}

						});

						//noLogService.log("Before the return",table.schema.indexes);

						return iNoFilterHash;
					}

					/*
						This function applies the provided sort items to the supplied
						Dexie:Collection. It should always sort on indexed columns and
						return a DexieCollection.

						NOTE: Need to research how to apply multi-column sorting.
					*/
					function _applySort(iNoSort, data) {
						noLogService.warn("TODO: Fully implement _applySort");
					}

					/*
						Applies the specified skip and take values to the final
						Dexie::Collection, if supplied.

						Note that this is the function returns the final Array of items
						based on all of the properties applied prior to this call.
					*/
					function _applyPaging(page, data){
						return $q(function(resolve, reject){
							if(page) data.page(page);

							resolve(data);
						});
					}

					$timeout(function(){
						_applyFilters(filters, table)
							.then(function(data){
								_applyPaging(page, data)
									.then(deferred.resolve)
								;
							})
							.catch(function(err){
								deferred.reject(err);
							});
					});

					window.noInfoPath.digestTimeout();

					/*
						The promise should resolve to a Dexie::Collection that will result in
						a set of data that matches the supplied filters, reject errors.
					*/
					return deferred.promise;
				};

				/*
					The update function expects the key to be within the update object.
				*/
				db.WriteableTable.prototype.noUpdate = function(data){
					var deferred = $q.defer(),
						table = this,
						key = data[table.noInfoPath.primaryKey];

					//noLogService.log("adding: ", _dexie.currentUser);

					_dexie.transaction("rw", table, function(){
						data.ModifiedDate = new Date(Date.now());
						data.ModifiedBy =  _dexie.currentUser.userId;
						table.update(key, data)
							.then(function(data){
								window.noInfoPath.digest(deferred.resolve, data);
							})
							.catch(function(err){
								window.noInfoPath.digestError(deferred.reject, err);
							});

					})
					.then(angular.noop())
					.catch(function(err){
						window.noInfoPath.digestError(deferred.reject, err);
					});

					return deferred.promise;
				};

				db.WriteableTable.prototype.noDestroy = function(data){
					var deferred = $q.defer(),
						table = this,
						key = data[table.noInfoPath.primaryKey];

					//noLogService.log("adding: ", _dexie.currentUser);
					noLogService.log(key);
					_dexie.transaction("rw", table, function(){

						table.delete(key)
							.then(function(data){
								window.noInfoPath.digest(deferred.resolve, data);
							})
							.catch(function(err){
								window.noInfoPath.digestError(deferred.reject, err);
							});

					})
					.then(angular.noop())
					.catch(function(err){
						window.noInfoPath.digestError(deferred.reject, err);
					});

					return deferred.promise;
				};

				/*
					Maps to the Dexie.Table.get method.
				*/
				db.WriteableTable.prototype.noOne = function(data){
				 	var deferred = $q.defer(),
				 		table = this,
						key = data[table.noInfoPath.primaryKey];

				 	//noLogService.log("adding: ", _dexie.currentUser);

				 	_dexie.transaction("r", table, function(){
				 		table.get(key)
				 			.then(function(data){
				 				window.noInfoPath.digest(deferred.resolve, data);
				 			})
				 			.catch(function(err){
				 				window.noInfoPath.digestError(deferred.reject, err);
				 			});

				 	})
				 	.then(angular.noop())
				 	.catch(function(err){
				 		window.noInfoPath.digestError(deferred.reject, err);
				 	});

				 	return deferred.promise;
				};

				/*
					While Dexie supports a put operation which is similar to upsert,
					we're going with upsert which decides whether an insert or an
					update is required and calls the appropreiate function.
				*/
				// db.WriteableTable.prototype.upsert = function(data){
				// }

				db.WriteableTable.prototype.bulkLoad = function(data, progress){
					var deferred = $q.defer(), table = this;
				//var table = this;
					function _import(data, progress){
						var total = data ? data.length : 0;

						$timeout(function(){
							//progress.rows.start({max: total});
							deferred.notify(progress);
						});

						var currentItem = 0;

						_dexie.transaction('rw', table, function (){
							_next();
						});


						function _next(){
							if(currentItem < data.length){
								var datum = data[currentItem];

								table.add(datum).then(function(data){
									//progress.updateRow(progress.rows);
									deferred.notify(data);
								})
								.catch(function(err){
									deferred.reject(err);
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

					//console.info("bulkLoad: ", table.TableName)

					table.clear()
						.then(function(){
							_import(data, progress);
						}.bind(this));

					return deferred.promise;
				};

			}

			/**
				### _extendDexieTables
			*/
			function _extendDexieTables(dbSchema){
				function _toDexieClass(tsqlTableSchema){
					var _table = {};

					angular.forEach(tsqlTableSchema.columns, function(column,tableName){
						switch(column.type){
							case "uniqueidentifier":
							case "nvarchar":
							case "varchar":
								_table[tableName] = "String";
								break;

							case "date":
							case "datetime":
								_table[tableName] = "Date";
								break;

							case "bit":
								_table[tableName] = "Boolean";
								break;

							case "int":
							case "decimal":
								_table[tableName] = "Number";
								break;
						}
					});

					return _table;
				}

				angular.forEach(dbSchema, function(table, tableName){
					var dexieTable = _dexie[tableName];
					dexieTable.mapToClass(noDatum, _toDexieClass(table));
					dexieTable.noInfoPath = table;
				});
			}

			/**
				### configure
			*/
			Dexie.prototype.configure = function(noUser, dbVersion, dexieStores, dbSchema){
				var deferred = $q.defer();

				$timeout(function(){
					_dexie.currentUser = noUser;
					_dexie.on('error', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    noLogService.error("Dexie Error: " + err);
					   	window.noInfoPath.digestError(deferred.reject, err);
					});

					_dexie.on('blocked', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    noLogService.warn("IndedexDB is currently execting a blocking operation.");
					   	window.noInfoPath.digestError(deferred.reject, err);
					});

					_dexie.on('versionchange', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    noLogService.error("IndexedDB as detected a version change");
					});

					_dexie.on('populate', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    noLogService.warn("IndedexDB populate...  not implemented.");
					});

					_dexie.on('ready', function(data) {
						noLogService.log("Dexie ready");
					    // Log to console or show en error indicator somewhere in your GUI...
						$rootScope.noIndexedDBReady = true;
					    window.noInfoPath.digest(deferred.resolve, data);
					});

					if(_dexie.isOpen()){
						$timeout(function(){
							//noLogService.log("Dexie already open.")
							window.noInfoPath.digest(deferred.resolve);
						});
					}else{
						if(_.size(dexieStores)){
							_dexie.version(dbVersion.version).stores(dexieStores);
							_extendDexieTables.call(_dexie, dbSchema);
							_dexie.open();
						}else{
							noLogService.warn("Waiting for noDbSchema data.");
						}

					}
				});

				window.noInfoPath.digestTimeout();

				return deferred.promise;
			};

			Dexie.prototype.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noIndexedDBReady)
					{
						deferred.resolve();
					}else{
						$rootScope.$watch("noIndexedDBReady", function(newval){
							if(newval){
								deferred.resolve();
							}
						});
					}
				});

				return deferred.promise;
			};


			Dexie.addons.push(noDexie);

			var _dexie = new Dexie(databaseName);

			return  _dexie;
		}

	angular.module("noinfopath.data")
		/*
			## noDb
			The noDb factory creates and configures a new instance of Dexie.  Dexie is a wrapper about IndexedDB.  noDb is a Dexie AddOn that extends the query capabilites of Dexie.
		*/
		.factory("noDb", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", function($timeout, $q, $rootScope, _, noLogService){
			return noDbService($timeout, $q, $rootScope, _, noLogService, "NoInfoPath-v3");
		}])
		.factory("noDataTransactionCache", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", function($timeout, $q, $rootScope, _, noLogService){
			return noDbService($timeout, $q, $rootScope, _, noLogService, "NoInfoPath_dtc-v1");
		}])
	;

})(angular, Dexie);
