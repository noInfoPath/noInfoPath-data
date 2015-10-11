//globals.js
/*
*	# noinfopath-data
*	@version 0.2.24
*
*	## Overview
*	NoInfoPath data provides several services to access data from local storage or remote XHR or WebSocket data services.
*
*	[![Build Status](http://192.168.254.94:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://192.168.254.94:8081/job/noinfopath-data/6/)
*
*	## Dependencies
*
*	- AngularJS
*	- jQuery
*	- ngLodash
*	- Dexie
*	- Dexie Observable
*	- Dexie Syncable
*
*	## Development Dependencies
*
*	> See `package.json` for exact version requirements.
*
*	- indexedDB.polyfill
*	- angular-mocks
*	- es5-shim
*	- grunt
*	- grunt-bumpup
*   - grunt-version
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
*
*	## Developers' Remarks
*
*	|Who|When|What|
*	|---|----|----|
*	|Jeff|2015-06-20T22:25:00Z|Whaaat?|
*
* ## @interface noInfoPath
*
* ### Overview
*
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
(noInfoPath.data = {});
(function(angular, undefined){
 	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers', 'noinfopath.logger'])


		.run(['$injector', '$parse', '$timeout', '$q', '$rootScope', '$browser', '$filter',  function($injector, $parse, $timeout, $q, $rootScope, $browser, $filter){

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

            function _toDbDate(date){
                return $filter("date")(date, "yyyy-MM-ddTHH:mm:ssZ");
            }

			var _data = {
				getItem: _getItem,
				setItem: _setItem,
				digest: _digest,
				digestError: _digestError,
				digestTimeout: _digestTimeout,
                toDbDate: _toDbDate
			};

			angular.extend(noInfoPath, _data);
		}])
	;
})(angular);

//classes.js
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
 *
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
 *
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
 *
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
 *
 *
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
 *
 *
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
 * |----|----|-----------|
 * |total|Number|The total number of items in the array|
 *
 * ### Methods
 *
 * #### page(options)
 *
 * ##### Parameters
 *
 * |Name|Type|Description|
 * |----|----|-----------|
 * |options|NoPage|A NoPage object that contains the paging instructions|
 *
 * ##### Parameters
 *
 * |Name|Type|Description|
 * |----|----|-----------|
 * |arrayOfThings|Array|(optional) An array of object that is used to populate the object on creation.|
 *
 * ##### Returns
 * void
 */
(function(angular, undefined) {
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
    function NoFilterExpression(operator, value, logic) {

        if (!operator) throw "INoFilterExpression requires a operator to filter by.";
        if (!value) throw "INoFilterExpression requires a value(s) to filter for.";

        this.operator = operator;
        this.value = value;
        this.logic = logic;

        this.toSQL = function() {
            var sqlOperators = {
                    "eq": "=",
                    "ne": "!=",
                    "gt": ">",
                    "ge": ">=",
                    "lt": "<",
                    "le": "<=",
                    "contains": "CONTAINS",
                    "startswith": "" // TODO: FIND SQL EQUIVILANT OF STARTS WITH
                },
                rs = "";

            if (!sqlOperators[operator]) throw "NoFilters::NoFilterExpression required a valid operator";

            if (angular.isString(value)) {
                rs = sqlOperators[operator] + " '" + this.value + "'" + (this.logic ? " " + this.logic : "");
            } else {
                rs = sqlOperators[operator] + " " + this.value + "" + (this.logic ? " " + this.logic : "");
            }

            return rs;
        };
    }

    /*
     * ## Class NoFilters : Array
     *
     * NoFilters is an array of NoFilter objects.
     *
     * ### Constructors
     *
     * #### NoFilters()
     *
     * ##### Usage
     *
     * ```js
     * var x = new noInfoPath.data.NoFilters()
     * ```
     *
     * ### Properties
     *
     * |Name|Type|Description|
     * |----|----|------------|
     * |length|Number|Number of elements in the array.|
     *
     * ### Methods
     *
     * #### add(column, logic, beginning, end, filters)
     *
     * Creates and adds a new NoFilter into the underlying array that NoFilters represents.
     *
     * ##### Parameters
     *
     * |Name|Type|Description|
     * |----|----|------------|
     * |column|String|The name of the column to filter on.|
     * |logic|String|One of the following values: 'and', 'or'|
     * |beginning|Boolean|If the NoFilter is the beginning of the filter expression|
     * |end|Boolean|If the NoFilter is the end of the filter expression|
     * |filters|Array|Array of NoFilterExpressions|
     *
     * #### toSQL()
     *
     * Converts the NoFilters array to a partial SQL statement. It calls the toSQL() method on every NoFilter object within the NoFilters array.
     *
     * ##### Parameters
     *
     * None
     */
    function NoFilters(kendoFilter) {
        var arr = [];

        Object.defineProperties(this, {
            "__type": {
                "get": function() {
                    return "NoFilters";
                }
            }
        });

        noInfoPath.setPrototypeOf(this, arr);

        //filter { logic: "and", filters: [ { field: "name", operator: "startswith", value: "Jane" } ] }
        //{"take":10,"skip":0,"page":1,"pageSize":10,"filter":{"logic":"and","filters":[{"value":"apple","operator":"startswith","ignoreCase":true}]}}

        if (kendoFilter) {
            for (var i in kendoFilter.filters) {
                var filter = kendoFilter.filters[i],
                    fe = new NoFilterExpression(filter.operator, filter.value),
                    f = new NoFilter(filter.field, kendoFilter.logic, true, true, [fe]);

                this.unshift(f);
            }
        }
        //arr.push.apply(arr, arguments);

        this.toSQL = function() {
            var rs = "",
                rsArray = [];

            angular.forEach(this, function(value, key) {

                if (this.length == key + 1) {
                    value.logic = null;
                }

                rsArray.push(value.toSQL());
            }, this);

            rs = rsArray.join("");

            return rs;
        };

        this.add = function(column, logic, beginning, end, filters) {
            if (!column) throw "NoFilters::add requires a column to filter on.";
            if (!filters) throw "NoFilters::add requires a value(s) to filter for.";

            this.unshift(new NoFilter(column, logic, beginning, end, filters));
        };


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
     * |column|String|The column that will be filtered on|
     * |logic|String|One of the following values: 'and', 'or'|
     * |beginning|Boolean|If the NoFilter is the beginning of the filter expression|
     * |end|Boolean|If the NoFilter is the end of the filter expression|
     * |filters|Array|Array of NoFilterExpressions|
     *
     * ### Methods
     *
     * #### toSQL()
     *
     * Converts the current NoFilter object to a partial SQL statement. It calls the NoFilterExpression toSQL() method for every NoFilterExpression within the filters array.
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
    function NoFilter(column, logic, beginning, end, filters) {
        Object.defineProperties(this, {
            "__type": {
                "get": function() {
                    return "NoFilter";
                }
            }
        });

        this.column = column;
        this.logic = logic;
        this.beginning = beginning;
        this.end = end;
        this.filters = [];

        angular.forEach(filters, function(value, key) {
            this.filters.unshift(new NoFilterExpression(value.operator, value.value, value.logic));
        }, this);



        this.toSQL = function() {
            var rs = "",
                filterArray = [],
                filterArrayString = "";

            angular.forEach(this.filters, function(value, key) {
                filterArray.push(this.column + " " + value.toSQL());
            }, this);

            filterArrayString = filterArray.join(" ");

            if (!!this.beginning) rs = "(";
            rs += filterArrayString;
            if (!!this.end) rs += ")";
            if (!!this.logic) rs += " " + logic + " ";

            return rs;
        };
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
     * ## Class NoSort : Array
     *
     * NoSort is an array of NoSortExpression objects.
     *
     * ### Properties
     *
     * |Name|Type|Description|
     * |----|----|------------|
     * |length|Number|Number of elements in the array.|
     * |total|Number|Total number of rows available given the current filters.|
     * |paged|Array|An array of object sliced on the skip and take parameters passed into the constructor.|
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
    function NoSortExpression(column, dir) {

        if (!column) throw "NoFilters::add requires a column to sort on.";

        this.column = column;
        this.dir = dir;

        this.toSQL = function() {
            return this.column + (this.dir ? " " + this.dir : "");
        };
    }

    function NoSort() {
        var arr = [];

        Object.defineProperties(arr, {
            "__type": {
                "get": function() {
                    return "NoSort";
                }
            }
        });

        if (arguments.length) {
            var raw = arguments[0];

            for (var s in raw) {
                var sort = raw[s];
                arr.push(new NoSortExpression(sort.field, sort.dir));
            }

        }

        //arr.push.apply(arr, arguments.length ? arguments[0] : []);
        arr.add = function(column, dir) {
            if (!column) throw "NoSort::add requires a column to filter on.";

            this.push(new NoSortExpression(column, dir));
        };

        arr.toSQL = function() {

            var sqlOrder = "ORDER BY ",
                sortExpressions = [];

            angular.forEach(this, function(sort) {
                sortExpressions.push(sort.toSQL());
            });


            return sqlOrder + sortExpressions.join(',');
        };
        noInfoPath.setPrototypeOf(this, arr);
    }

    function NoPage(skip, take) {
        Object.defineProperties(this, {
            "__type": {
                "get": function() {
                    return "NoPage";
                }
            }
        });

        this.skip = skip;
        this.take = take;

        this.toSQL = function() {
            return "LIMIT " + this.take + " OFFSET " + this.skip;
        };
    }

    function NoResults(arrayOfThings) {
        //Capture the length of the arrayOfThings before any changes are made to it.
        var _total = arrayOfThings.length,
            _page = arrayOfThings,
            arr = arrayOfThings;

        //arr.push.apply(arr, arguments);

        Object.defineProperties(arr, {
            "total": {
                "get": function() {
                    return _total;
                }
            },
            "paged": {
                "get": function() {
                    return _page;
                }
            }
        });

        arr.page = function(nopage) {
            if (!nopage) throw "nopage is a required parameter for NoResults::page";
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

//query-builder.js
/*
* ## @interface INoQueryParser
*
* > INoQueryParser is a conceptual entity, it does not really exist
* > the reality. This is because JavaScript does not implement interfaces
* > like other languages do. This documentation should be considered a
* > guide for creating query parsers compatible with NoInfoPath.
*
* ### Overview
* INoQueryParser provides a service interface definition for converting a set
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
*
*	## noQueryParser
*
*	### Overview
*	The noQueryParser takes the `data` property of the options
*	parameter passed to the Kendo DataSources transport.read method. The
*	data object is inspected and its filter, sort, and paging values are
*	converted to NoInfoPath compatible versions.
*
*	### Methods
*
*	#### parse(options)
*	Parses provided filter, sort and paging options into NoInfoPath compatible
*   objects. Stores the results internally for future use.
*
*   ##### Returns
*	Any/all filters, sorts or paging data as an array compatible
*	with a call to `function.prototype.array`.
*
*	### Properties
*   None.
*
*
* ##  noQueryParser : INoQueryParser
*
* ### Overview
*
* Implements a INoQueryBuilder compatible service that converts NoFilters,
* NoSort, NoPage into ODATA compatible query object.
*
*/
(function(angular, undefined){
	angular.module("noinfopath.data")
        .service("noQueryParser",[function(){
            var filters, sort, paging;

            this.parse = function(options){
                var filters, sort, paging;

                //filter { logic: "and", filters: [ { field: "name", operator: "startswith", value: "Jane" } ] }
                //{"take":10,"skip":0,"page":1,"pageSize":10,"filter":{"logic":"and","filters":[{"value":"apple","operator":"startswith","ignoreCase":true}]}}
                if(!!options.take) paging = new noInfoPath.data.NoPage(options.skip, options.take);
                if(!!options.sort) sort = new noInfoPath.data.NoSort(options.sort);
                if(!!options.filter) filters = new noInfoPath.data.NoFilters(options.filter);

                return toArray(filters, sort, paging);
            };

            function toArray(filters, sort, paging){
                var arr = [];

                if(!!filters) arr.push(filters);

                if(!!sort) arr.push(sort);

                if(!!paging) arr.push(paging);

                if(arr.length === 0) arr = undefined;

                return arr;
            }
        }])

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
					console.log(value);
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
/**
	### @class MockStorage
*/
(function(){
	"use strict";

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
/*
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
* Once the config.json is resolved is it stored on $rootScope as $rootScope.noConfig
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
(function(angular, undefined){
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.data")
		.config([function(){
		}])

		.provider("noConfig", [function(){
			var _currentConfig, _status;

			function NoConfig($http, $q, $timeout, $rootScope, noLocalStorage){
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
					var url = uri || "/config.json";
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
				};

				this.whenReady = function(uri){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noConfig)
						{
							deferred.resolve();
						}else{
							$rootScope.$watch("noConfig", function(newval){
								if(newval){
									deferred.resolve();
								}
							});

							SELF.load(uri)
								.then(function(){
									_currentConfig = noLocalStorage.getItem("noConfig");
									$rootScope.noConfig = _currentConfig;
								})
								.catch(function(err){
									SELF.fromCache();

									if(_currentConfig){
										$rootScope.noConfig = _currentConfig;
									}else{
										deferred.reject("noConfig");
									}
								});
						}
					});

					return deferred.promise;
				};
			}

			this.$get = ['$http','$q', '$timeout', '$rootScope', 'noLocalStorage', function($http, $q, $timeout, $rootScope, noLocalStorage){
				return new NoConfig($http, $q, $timeout, $rootScope, noLocalStorage);
			}];
		}])
	;
})(angular);

//http.js
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
*
*
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
*
*
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
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.data')

		.provider("noHTTP",[function(){
			this.$get = ['$rootScope', '$q', '$timeout', '$http', '$filter', 'noUrl', 'noConfig', 'noDbSchema', 'noOdataQueryBuilder', 'noLogService', function($rootScope, $q, $timeout, $http, $filter, noUrl, noConfig, noDbSchema, noOdataQueryBuilder, noLogService){

				function NoHTTP(queryBuilder){
					var THIS = this;

					console.warn("TODO: make sure noHTTP conforms to the same interface as noIndexedDb and noWebSQL");

					this.whenReady = function(tables){
						var deferred = $q.defer();

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

							}
						});

						return deferred.promise;
					};

					this.configure = function(noUser, config, schema){

						return $timeout(function(){
							for(var t in schema.tables){
								var table = schema.tables[t];
								THIS[t] = new NoTable(t, table, queryBuilder);
							}
							$rootScope.noHTTPInitialized = true;
							noLogService.log("noHTTP_" + schema.config.dbName + " ready.");
						});

					};

				}

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
				return new NoHTTP(noOdataQueryBuilder.makeQuery);
			}];
		}])
	;
})(angular);

//schema.js
/*
* ## noDbSchema
* The noDbSchema service provides access to the database configuration that
* defines how to configure the local IndexedDB data store.
*
*
*	### Properties
*
*	|Name|Type|Description|
*	|----|----|-----------|
*	|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
*	|tables|Object|A hash table of NoInfoPath database schema definitions|
*	|isReady|Boolean|Returns true if the size of the tables object is greater than zero|
*
*
*	### Methods
*
*	#### \_processDbJson
*	Converts the schema received from the noinfopath-rest service and converts it to a Dexie compatible object.
*
*	##### Parameters
*	|Name|Type|Descriptions|
*	|----|----|------------|
*	|resp|Object|The raw HTTP response received from the noinfopath-rest service|
*
*	### load()
*	Loads and processes the database schema from the noinfopath-rest service.
*
*	#### Returns
*	AngularJS::Promise
*
*
*	### whenReady
*	whenReady is used to check if this service has completed its load phase. If it has not is calls the internal load method.
*
*	#### Returns
*	AngularJS::Promise
*/
var GloboTest = {};
(function (angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")

		/*
		 * ## noDbSchema
		 * The noDbSchema service provides access to the database configuration that defines how to configure the local IndexedDB data store.
		*/
		/*
			### Properties

			|Name|Type|Description|
			|----|----|-----------|
			|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
			|tables|Object|A hash table of NoInfoPath database schema definitions|
			|isReady|Boolean|Returns true if the size of the tables object is greater than zero|
		*/

		.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "$filter", "noLocalStorage", "$injector", function($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector){
			// TODO: Finish documentation
			/*
			 * ## NoDbSchema : Class
			 * This provides
			 *
			 * ### Constructors
			 *
			 * #### Constructor()
			 *
			 * ##### Usage
			 * ```js
			 * var x = new NoDbSchema();
			 * ```
			 *
			 * ##### Parameters
			 *
			 * None
			 *
			 * ### Methods
			 *
			 * #### createSqlTableStmt(tableName, tableConfig)
			 * Returns a SQL query string that creates a table given the provided tableName and tableConfig
			 *
			 * ##### Usage
			 * ```js
			 * var x = createSqlTableStmt(tableName, tableConfig);
			 * ```
			 * ##### Parameters
			 *
			 * |Name|Type|Description|
			 * |----|----|-----------|
			 * |tableName|String|The name of the table to be created|
			 * |tableConfig|Object|The schema of the table to be created|
			 *
			 * ##### Returns
			 * Returns a SQL query string
			 *
			 * ### Properties
			 * |Name|Type|Description|
			 * |----|----|-----------|
			 * |queryString|String|Returns a SQL query string that creates a table given the provided tableName and tableConfig|
			*/
			/*
			* ```json
			* {
			*		"dbName": "NoInfoPath_dtc_v1",
			*		"provider": "noIndexedDB",
			*		"remoteProvider:": "noHTTP",
			*		"version": 1,
			*		"schemaSource": {
			*			"provider": "inline",
			*			"schema": {
			*				"store": {
			*					"NoInfoPath_Changes": "$$ChangeID"
			*				},
			*				"tables": {
			*					"NoInfoPath_Changes": {
			*						"primaryKey": "ChangeID"
			*					}
			*				}
			*			}
			*		}
			*	}
			* ```
			*/


			function NoDbSchema(noConfig, noDbConfig, rawDbSchema){
				//console.warn(rawDbSchema);

				var _config = {},
					_tables = rawDbSchema,
					_views = {},
					_sql = {},
					_schemaConfig = noDbConfig;

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
					},
					"views": {
						"get": function() { return _views; }
					},
					"config": {
						"get": function() { return _schemaConfig; }
					}
				});



				angular.forEach(_tables, function(table, tableName){
					var primKey = "$$" + table.primaryKey,
						foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");

					//Prep as a Dexie Store config
					_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
				});

			}

			/**
			*	### NoDbSchemaFactory
			*
			*	Creates unique instances of NoDbSchema based on noDBSchema configuration data.
			*/

			function NoDbSchemaFactory(){
				var noConfig,
					promises =[],
					schemaSourceProviders = {
						"inline": function(key, schemaConfig){
							return $timeout(function(){
								return schemaConfig.schemaSource.schema;
							});
						},
						"noDBSchema": function(key, schemaConfig) {
							return getRemoteSchema(noConfig)
								.then(function(resp){
									return resp.data;
								})
								.catch(function(err){
									throw err;
								});
						},
						"cached": function(key, schemaConfig){
							var schemaKey = "noDbSchema_" + schemaConfig.schemaSource.sourceDB;

							return $q(function(resolve, reject){
								$rootScope.$watch(schemaKey, function(newval){
									if(newval){
										resolve(newval.tables);
									}
								});

							});
						}
					};

				function getRemoteSchema(config){
					var req = {
						method: "GET",
						url: noConfig.NODBSCHEMAURI, //TODO: change this to use the real noinfopath-rest endpoint
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						withCredentials: true
					};

					return $http(req)
						.then(function(resp){
							return resp;
						})
						.catch(function(resp){
							throw resp;
						});
				}

				function checkCache(schemaKey){
					return  noLocalStorage.getItem(schemaKey);
				}

				function getSchema(schemaKey, schemaConfig){
					var deferred = $q.defer(),
						schemaProvider = schemaConfig.schemaSource.provider;

					if($rootScope[schemaKey])
					{
						deferred.resolve(schemaKey);
					}else{
						$rootScope.$watch(schemaKey, function(newval, oldval){
							if(newval){
								noLocalStorage.setItem(schemaKey, newval.tables);
								deferred.resolve(schemaKey);
							}
						});

						schemaSourceProviders[schemaProvider](schemaKey, schemaConfig)
							.then(function (schema){
								$rootScope[schemaKey] = new NoDbSchema(noConfig, schemaConfig, schema);
							})
							.catch(function(){
								var schema = checkCache(schemaKey);
								if(schema){
									$rootScope[schemaKey] = new NoDbSchema(noConfig, schemaConfig, schema);
								}else{
									deferred.reject("noDbSchemaServiceOffline");
								}
							});
					}

					return deferred.promise;
				}

				// when calling noDbSchema.whenReady you need to bind the call
				// with the configuration.

				/**
				 * > NOTE: noDbSchema property of noConfig is an array of NoInfoPath data provider configuration objects.
				*/
				this.whenReady = function(config){
					noConfig = config.current;

					var noDbSchemaConfig = noConfig.noDbSchema,
						promises = [];

					for(var c in noDbSchemaConfig){
						var schemaConfig = noDbSchemaConfig[c],
							schemaKey = "noDbSchema_" + schemaConfig.dbName;

						promises.push(getSchema(schemaKey, schemaConfig));
					}

					return $q.all(promises)
						.then(function(results){
							$rootScope.noDbSchema_names = results;
							return results;
						})
						.catch(function (err) {
							throw err;
						});

				};

				this.configureDatabases = function(noUser, noDbSchemaConfigs){
					var promises = [];

					for(var s in noDbSchemaConfigs){
						var schemaName = noDbSchemaConfigs[s],
							schema = $rootScope[schemaName],
							provider = $injector.get(schema.config.provider);

						promises.push(provider.configure(noUser, schemaName, schema));

					}

					return $q.all(promises);

				};

				this.getSchema = function(dbName){
					var schema = $rootScope["noDbSchema_" + dbName];
					return schema;
				};
			}

			return new NoDbSchemaFactory();
		}])
	;

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
(function(angular, undefined) {
    "use strict";


    function NoWebSQLParser() {
        var CREATETABLE = "CREATE TABLE IF NOT EXISTS ",
            CREATEVIEW = "CREATE VIEW IF NOT EXISTS ",
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
            _interface = {
                sqlConversion: {
                    "bigint": INTEGER,
                    "bit": INTEGER,
                    "decimal": NUMERIC,
                    "int": INTEGER,
                    "money": NUMERIC, // CHECK
                    "numeric": NUMERIC,
                    "smallint": INTEGER,
                    "smallmoney": NUMERIC, // CHECK
                    "tinyint": INTEGER,
                    "float": REAL,
                    "real": REAL,
                    "date": NUMERIC, // CHECK
                    "datetime": NUMERIC, // CHECK
                    "datetime2": NUMERIC, // CHECK
                    "datetimeoffset": NUMERIC, // CHECK
                    "smalldatetime": NUMERIC, // CHECK
                    "time": NUMERIC, // CHECK
                    "char": TEXT,
                    "nchar": TEXT,
                    "varchar": TEXT,
                    "nvarchar": TEXT,
                    "text": TEXT,
                    "ntext": TEXT,
                    "binary": BLOB, // CHECK
                    "varbinary": BLOB,
                    "image": BLOB,
                    "uniqueidentifier": TEXT
                },
                toSqlLiteConversionFunctions: {
                    "TEXT": function(s) {
                        return angular.isString(s) ? "'" + s + "'" : null;
                    },
                    "BLOB": function(b) {
                        return b;
                    },
                    "INTEGER": function(i) {
                        return angular.isNumber(i) ? i : null;
                    },
                    "NUMERIC": function(n) {
                        return angular.isNumber(n) ? n : null;
                    },
                    "REAL": function(r) {
                        return r;
                    }
                },
                fromSqlLiteConversionFunctions: {
                    "bigint": function(i) {
                        return angular.isNumber(i) ? i : null;
                    },
                    "bit": function(i) {
                        return angular.isNumber(i) ? i : null;
                    },
                    "decimal": function(n) {
                        return angular.isNumber(n) ? n : null;
                    },
                    "int": function(i) {
                        return angular.isNumber(i) ? i : null;
                    },
                    "money": function(n) {
                        return angular.isNumber(n) ? n : null;
                    },
                    "numeric": function(n) {
                        return angular.isNumber(n) ? n : null;
                    },
                    "smallint": function(i) {
                        return angular.isNumber(i) ? i : null;
                    },
                    "smallmoney": function(n) {
                        return angular.isNumber(n) ? n : null;
                    },
                    "tinyint": function(i) {
                        return angular.isNumber(i) ? i : null;
                    },
                    "float": function(r) {
                        return r;
                    },
                    "real": function(r) {
                        return r;
                    },
                    "date": function(n) {
                        return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
                    },
                    "datetime": function(n) {
                        return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
                    },
                    "datetime2": function(n) {
                        return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
                    },
                    "datetimeoffset": function(n) {
                        return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
                    },
                    "smalldatetime": function(n) {
                        return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
                    },
                    "time": function(n) {
                        return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
                    },
                    "char": function(t) {
                        return angular.isString(t) ? t : null;
                    },
                    "nchar": function(t) {
                        return angular.isString(t) ? t : null;
                    },
                    "varchar": function(t) {
                        return angular.isString(t) ? t : null;
                    },
                    "nvarchar": function(t) {
                        return angular.isString(t) ? t : null;
                    },
                    "text": function(t) {
                        return angular.isString(t) ? t : null;
                    },
                    "ntext": function(t) {
                        return angular.isString(t) ? t : null;
                    },
                    "binary": function(b) {
                        return b;
                    },
                    "varbinary": function(b) {
                        return b;
                    },
                    "image": function(b) {
                        return b;
                    },
                    "uniqueidentifier": function(t) {
                        return angular.isString(t) ? t : null;
                    }
                },
                "createTable": function(tableName, tableConfig) {
                    var rs = CREATETABLE;

                    rs += tableName + " (" + this.columnConstraints(tableConfig) + ")";

                    return rs;
                },
                "createView": function(viewName, viewConfig) {
                    var rs = viewConfig.entitySQL.replace("CREATE VIEW ", CREATEVIEW);

                    return rs;
                },
                "columnDef": function(columnName, columnConfig, tableConfig) {
                    return columnName + " " + this.typeName(columnConfig) + this.columnConstraint(columnName, columnConfig, tableConfig);
                },
                "columnConstraint": function(columnName, columnConfig, tableConfig) {
                    var isPrimaryKey = this.isPrimaryKey(columnName, tableConfig),
                        isForeignKey = this.isForeignKey(columnName, tableConfig),
                        isNullable = this.isNullable(columnConfig),
                        returnString = "";

                    returnString += this.primaryKeyClause(isPrimaryKey && (!isForeignKey && !isNullable)); // A PK cannot be a FK or nullable.
                    returnString += this.foreignKeyClause((isForeignKey && !isPrimaryKey), columnName, tableConfig.foreignKeys); // A FK cannot be a PK
                    returnString += this.nullableClause(isNullable && !isPrimaryKey); // A nullable field cannot be a PK

                    return returnString;
                },
                "typeName": function(columnConfig) {
                    return this.sqlConversion[columnConfig.type];
                },
                "expr": function(Expr) {
                    return "";
                },
                "foreignKeyClause": function(isForeignKey, columnName, foreignKeys) {
                    var rs = "";
                    if (isForeignKey) {
                        rs = " " + FOREIGNKEY + foreignKeys[columnName].table + " (" + foreignKeys[columnName].column + ")";
                    }
                    return rs;
                },
                "primaryKeyClause": function(isPrimaryKey) {
                    var rs = "";
                    if (isPrimaryKey) {
                        rs = " " + PRIMARYKEY;
                    }
                    return rs;
                },
                "nullableClause": function(isNullable) {
                    var rs = "";
                    if (isNullable) {
                        rs = " " + NULL;
                    }
                    return rs;
                },
                "columnConstraints": function(tableConfig) {
                    var colConst = [];
                    angular.forEach(tableConfig.columns, function(value, key) {
                        colConst.push(this.columnDef(key, value, tableConfig));
                    }, this);
                    return colConst.join(",");
                },
                "isPrimaryKey": function(columnName, tableConfig) {
                    var temp = false;

                    for (var x in tableConfig.primaryKey) {
                        if (columnName === tableConfig.primaryKey[x]) {
                            temp = true;
                            break;
                        }
                    }
                    return temp;
                },
                "isForeignKey": function(columnName, tableConfig) {
                    return !!tableConfig.foreignKeys[columnName];
                },
                "isNullable": function(columnConfig) {
                    return columnConfig.nullable;
                },
                "sqlInsert": function(tableName, data) {
                    var columnString = "",
                        placeholdersString = "",
                        returnObject = {},
                        val = {};

                    val = this.parseData(data);

                    columnString = val.columns.join(",");
                    placeholdersString = val.placeholders.join(",");

                    returnObject.queryString = INSERT + tableName + " (" + columnString + ") VALUES (" + placeholdersString + ");";
                    returnObject.valueArray = val.values;

                    return returnObject;
                },
                "sqlUpdate": function(tableName, data, filters) {
                    var val = {},
                        nvps = [],
                        nvpsString = "",
                        returnObject = {};

                    val = this.parseData(data);

                    nvps = this.sqlUpdateNameValuePair(val);

                    nvpsString = nvps.join(", ");

                    returnObject.queryString = UPDATE + tableName + " SET " + nvpsString + " WHERE " + filters.toSQL();
                    returnObject.valueArray = val.values;

                    return returnObject;
                },
                "sqlUpdateNameValuePair": function(values) {
                    var nvps = [];

                    angular.forEach(values.columns, function(col, key) {
                        nvps.push(col + " = ?");
                    });

                    return nvps;
                },
                "sqlDelete": function(tableName, filters) {
                    var returnObject = {},
                        where = filters && filters.length ? " WHERE " + filters.toSQL() : "";
                    returnObject.queryString = DELETE + tableName + where;
                    return returnObject;
                },
                "sqlRead": function(tableName, filters, sort, page) {
                    var fs, ss, ps, returnObject = {};
                    fs = !!filters ? " WHERE " + filters.toSQL() : "";
                    ss = !!sort ? " " + sort.toSQL() : "";
                    ps = !!page ? " " + page.toSQL() : "";
                    returnObject.queryString = READ + tableName + fs + ss + ps;
                    return returnObject;
                },
                "sqlOne": function(tableName, primKey, value) {
                    var returnObject = {};
                    returnObject.queryString = READ + tableName + " WHERE " + primKey + " = '" + value + "'";
                    return returnObject;
                },
                "parseData": function(data) {
                    var values = [],
                        placeholders = [],
                        columns = [],
                        r = {};
                    angular.forEach(data, function(value, key) {
                        columns.push(key);
                        placeholders.push("?");
                        values.push(value);
                    });

                    r.values = values;
                    r.placeholders = placeholders;
                    r.columns = columns;

                    return r;
                }
            };

        this._interface = _interface;

        this.createSqlTableStmt = function(tableName, tableConfig) {
            return _interface.createTable(tableName, tableConfig);
        };

        this.createSqlViewStmt = function(tableName, viewSql) {
            return _interface.createView(tableName, viewSql);
        };

        this.createSqlInsertStmt = function(tableName, data) {
            return _interface.sqlInsert(tableName, data);
        };

        this.createSqlUpdateStmt = function(tableName, data, filters) {
            return _interface.sqlUpdate(tableName, data, filters);
        };

        this.createSqlDeleteStmt = function(tableName, data, filters) {
            return _interface.sqlDelete(tableName, filters);
        };

        this.createSqlReadStmt = function(tableName, filters, sort, page) {
            return _interface.sqlRead(tableName, filters, sort, page);
        };

        this.createSqlOneStmt = function(tableName, primKey, value) {
            return _interface.sqlOne(tableName, primKey, value);
        };

        this.createSqlClearStmt = function(tableName) {
            return _interface.sqlDelete(tableName);
        };

    }

    function NoWebSQLService($parse, $rootScope, _, $q, $timeout, noLogService, noLoginService, noLocalStorage, noWebSQLParser) {
        var stmts = {
                "T": noWebSQLParser.createSqlTableStmt,
                "V": noWebSQLParser.createSqlViewStmt
            },
            _name;

        Object.defineProperties(this, {
            "isInitialized": {
                "get": function() {
                    return !!noLocalStorage.getItem(_name);
                }
            }
        });

        //TODO: modify config to also contain Views, as well as, Tables.
        this.configure = function(noUser, config, schema) {
            var _webSQL = null,
                promises = [],
                noWebSQLInitialized = "noWebSQL_" + schema.config.dbName,
                noConstructors = {
                    "T": NoTable,
                    "V": NoView
                };

            _webSQL = openDatabase(schema.config.dbName, schema.config.version, schema.config.description, schema.config.size);

            _webSQL.currentUser = noUser;
            _webSQL.name = schema.config.dbName;

            angular.forEach(schema.tables, function(table, name) {
                var t = new noConstructors[table.entityType](table, name, _webSQL);
                this[name] = t;
                promises.push(createEntity(table, _webSQL));
            }, _webSQL);

            return $q.all(promises)
                .then(function() {
                    $rootScope[noWebSQLInitialized] = _webSQL;
                    noLogService.log(noWebSQLInitialized + " Ready.");
                });
        };

        this.whenReady = function(config) {
            var deferred = $q.defer();

            $timeout(function() {
                var noWebSQLInitialized = "noWebSQL_" + config.dbName;

                if ($rootScope[noWebSQLInitialized]) {
                    deferred.resolve();
                } else {
                    $rootScope.$watch(noWebSQLInitialized, function(newval, oldval, scope) {
                        if (newval) {
                            deferred.resolve();
                        }
                    });
                }
            });

            return deferred.promise;
        };

        this.getDatabase = function(databaseName) {
            return $rootScope["noWebSQL_" + databaseName];
        };

        /**
         * ### createTable(tableName, table)
         *
         * #### Parameters
         *
         * |Name|Type|Description|
         * |----|----|-----------|
         * |type|String|One of T\|V|
         * |tableName|String|The table's name|
         * |table|Object|The table schema|
         */
        function createEntity(entity, database) {

            var deferred = $q.defer();


            database.transaction(function(tx) {
                tx.executeSql(stmts[entity.entityType](entity.entityName, entity), [],
                    function(t, r) {
                        deferred.resolve();
                    },
                    function(t, e) {
                        deferred.reject({
                            entity: entity,
                            error: e
                        });
                    });
            });

            return deferred.promise;
        }

        /**
         * ## NoTable
         * CRUD interface for WebSql
         */
        function NoTable(table, tableName, database) {
            if (!table) throw "table is a required parameter";
            if (!tableName) throw "tableName is a required parameter";
            if (!database) throw "database is a required parameter";

            var _table = table,
                _tableName = table.entityName,
                _db = database;

            Object.defineProperties(this, {
                "__type": {
                    "get": function() {
                        return "INoCRUD";
                    },
                },
                "primaryKey": {
                    "get": function() {
                        return _table.primaryKey;
                    }
                },
                "entityName": {
                    "get": function() {
                        return _tableName;
                    }
                }
            });

            /**
             * ### \_getOne(rowid)
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |rowid|Number or Object| When a number assume that you are filtering on "rowId". When an Object the object will have a key, and value property.|
             */
            function _getOne(rowid) {
                var deferred = $q.defer(),
                    filters = new noInfoPath.data.NoFilters(),
                    sqlExpressionData;

                if (angular.isObject(rowid)) {
                    filters.add(rowid.key, null, true, true, [{
                        "operator": "eq",
                        "value": rowid.value,
                        "logic": null
                    }]);
                } else {
                    filters.add("rowid", null, true, true, [{
                        "operator": "eq",
                        "value": rowid,
                        "logic": null
                    }]);
                }

                sqlExpressionData = noWebSQLParser.createSqlReadStmt(_tableName, filters);

                _exec(sqlExpressionData)
                    .then(function(resultset) {
                        if (resultset.rows.length === 0) {
                            deferred.resolve({});
                        } else {
                            deferred.resolve(resultset.rows[0]);
                        }
                    })
                    .catch(deferred.reject);

                return deferred.promise;
            }

            /**
             * ### \_exec(sqlExpressionData)
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |sqlExpressionData|Object|An object with two properties, queryString and valueArray. queryString is the SQL statement that will be executed, and the valueArray is the array of values for the replacement variables within the queryString.|
             */

            function _exec(sqlExpressionData) {
                var deferred = $q.defer(),
                    valueArray;

                if (sqlExpressionData.valueArray) {
                    valueArray = sqlExpressionData.valueArray;
                } else {
                    valueArray = [];
                }

                _db.transaction(function(tx) {
                    tx.executeSql(
                        sqlExpressionData.queryString,
                        valueArray,
                        function(t, resultset) {
                            deferred.resolve(resultset);
                        },
                        function(t, r, x) {
                            deferred.reject({
                                tx: t,
                                err: r
                            });
                        }

                    );
                });

                return deferred.promise;
            }

            /**
             * ### webSqlOperation(operation, noTransaction, data)
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |operation|String|Either one of (C\|U\|D\|BD\|BC)|
             * |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization. This parameter is required, but can be `null`.|
             * |data|Object|Name Value Pairs|
             *
             *
             */

            function webSqlOperation(operation, data, noTransaction) {
                // noTransaction is not required, but is needed to track transactions
                var sqlExpressionData, id,
                    deferred = $q.defer(),
                    createObject = noWebSQLParser.createSqlInsertStmt(_tableName, data),
                    sqlStmtFns = {
                        "C": noWebSQLParser.createSqlInsertStmt,
                        "U": noWebSQLParser.createSqlUpdateStmt,
                        "D": noWebSQLParser.createSqlDeleteStmt,
                        "BD": noWebSQLParser.createSqlClearStmt,
                        "BC": noWebSQLParser.createSqlInsertStmt
                    },
                    filterOps = {
                        "C": function(data) {
                            var noFilters = new noInfoPath.data.NoFilters(),
                                id;

                            if (data[_table.primaryKey]) {
                                id = data[_table.primaryKey];
                            } else {
                                id = noInfoPath.createUUID();
                                data[_table.primaryKey] = id;
                            }

                            noFilters.add(_table.primaryKey, null, true, true, [{
                                operator: "eq",
                                value: id
                            }]);

                            return noFilters;
                        },
                        "U": function(data) {
                            var noFilters = new noInfoPath.data.NoFilters(),
                                id;
                            id = data[_table.primaryKey];
                            noFilters.add(_table.primaryKey, null, true, true, [{
                                operator: "eq",
                                value: id
                            }]);

                            return noFilters;
                        },
                        "D": function(data) {
                            var noFilters = new noInfoPath.data.NoFilters(),
                                id;
                            id = data[_table.primaryKey];
                            noFilters.add(_table.primaryKey, null, true, true, [{
                                operator: "eq",
                                value: id
                            }]);

                            return noFilters;
                        },
                        "BD": function() {},
                        "BC": function() {}
                    },
                    sqlOps = {
                        "C": function(data, noFilters, noTransaction) {
                            data.CreatedBy = noLoginService.user.userId;
                            data.DateCreated = noInfoPath.toDbDate(new Date());
                            data.ModifiedBy = noLoginService.user.userId;
                            data.ModifiedDate = noInfoPath.toDbDate(new Date());

                            var sqlStmt = sqlStmtFns.C(_tableName, data, noFilters);

                            _exec(sqlStmt)
                                .then(function(result) {
                                    _getOne(result.insertId)
                                        .then(function(result) {
                                            if (noTransaction) noTransaction.addChange(_tableName, result, operation);
                                            deferred.resolve(result);
                                        })
                                        .catch(deferred.reject);
                                })
                                .catch(deferred.reject);
                        },
                        "U": function(data, noFilters, noTransaction) {
                            data.ModifiedBy = noLoginService.user.userId;
                            data.ModifiedDate = noInfoPath.toDbDate(new Date());

                            var sqlStmt = sqlStmtFns.U(_tableName, data, noFilters),
                                keys = [];

                            for (var k in _table.primaryKey) {
                                var key = _table.primaryKey[k];

                                keys.push(data[key]);
                            }

                            _getOne(keys.join(","))
                                .then(function(result) {
                                    _exec(sqlStmt)
                                        .then(function(result) {
                                            if (noTransaction) noTransaction.addChange(_tableName, this, "U");
                                            deferred.resolve(data);
                                        }.bind(result))
                                        .catch(deferred.reject);
                                })
                                .catch(deferred.reject);
                        },
                        "D": function(data, noFilters, noTransaction) {
                            var sqlStmt = sqlStmtFns.D(_tableName, data, noFilters);
                            _getOne({
                                    "key": _table.primaryKey,
                                    "value": data[_table.primaryKey]
                                })
                                .then(function(result) {
                                    _exec(sqlStmt)
                                        .then(function(result) {
                                            if (noTransaction) noTransaction.addChange(_tableName, this, "D");
                                            deferred.resolve(result);
                                        }.bind(result))
                                        .catch(deferred.reject);
                                })
                                .catch(deferred.reject);
                        },
                        "BD": function() {
                            var sqlStmt = sqlStmtFns.D(_tableName);
                            _exec(sqlStmt)
                                .then(deferred.resolve)
                                .catch(deferred.reject);

                        },
                        "BC": function(data) {
                            var sqlStmt = sqlStmtFns.C(_tableName, data, null);
                            _exec(sqlStmt, data)
                                .then(deferred.resolve)
                                .catch(deferred.reject);
                        }
                    },
                    filters = filterOps[operation](data);

                sqlOps[operation](data, filters, noTransaction);


                return deferred.promise;
            }

            /**
             * ### noCreate(data, noTransaction)
             *
             * Inserts a record into the websql database with the data provided.
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |data|Object|Name Value Pairs|
             * |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|
             */

            this.noCreate = function(data, noTransaction) {
                return webSqlOperation("C", data, noTransaction);
            };

            /**
             * ### noRead([NoFilters, NoSort, NoPage])
             *
             * Reads records from the websql database.
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |NoFilters|Object|(Optional) A noInfoPath NoFilters Array|
             * |NoSort|Object|(Optional) A noInfoPath NoSort Object|
             * |NoPage|Object|(Optional) A noInfoPath NoPage Object|
             */

            this.noRead = function() {

                var filters, sort, page,
                    deferred = $q.defer(),
                    readObject;

                for (var ai in arguments) {
                    var arg = arguments[ai];

                    //success and error must always be first, then
                    if (angular.isObject(arg)) {
                        switch (arg.__type) {
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

                readObject = noWebSQLParser.createSqlReadStmt(_tableName, filters, sort, page);

                function _txCallback(tx) {
                    tx.executeSql(
                        readObject.queryString, [],
                        function(t, r) {
                            var data = new noInfoPath.data.NoResults(_.toArray(r.rows));
                            if (page) data.page(page);
                            deferred.resolve(data);
                        },
                        function(t, e) {
                            deferred.reject(arguments);
                        });
                }

                function _txFailure(error) {
                    console.error("Tx Failure", error);
                }

                function _txSuccess(data) {
                    //console.log("Tx Success", data);
                }

                _db.transaction(_txCallback, _txFailure, _txSuccess);

                return deferred.promise;
            };

            /**
             * ### noUpdate(data, noTransaction)
             *
             * Updates a record from the websql database based on the Primary Key of the data provided.
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |data|Object|Name Value Pairs|
             * |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|
             */

            this.noUpdate = function(data, noTransaction) {
                // removed the filters parameter as we will most likely be updating one record at a time. Expand this by potentially renaming this to noUpdateOne and the replacement noUpdate be able to handle filters?
                return webSqlOperation("U", data, noTransaction);
            };

            /**
             * ### noDestroy(data, noTransaction)
             *
             * Deletes a record from the websql database based on the Primary Key of the data provided.
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |data|Object|Name Value Pairs|
             * |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|
             */

            this.noDestroy = function(data, noTransaction) {
                return webSqlOperation("D", data, noTransaction);
            };

            /**
             * ### noOne(data)
             *
             * Reads a record from the websql database based on the Primary Key of the data provided.
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |data|Object|Name Value Pairs|
             */
            this.noOne = function(data) {
                var deferred = $q.defer(),
                    key = data[_table.primaryKey],
                    oneObject = noWebSQLParser.createSqlOneStmt(_tableName, _table.primaryKey, key);

                function _txCallback(tx) {

                    tx.executeSql(oneObject.queryString,
                        oneObject.valueArray,
                        function(t, r) {
                            var data = r.rows.length ? r.rows[0] : undefined;
                            deferred.resolve(data);
                        },
                        function(t, e) {
                            deferred.reject(e);
                        });

                }

                function _txFailure(error) {
                    console.error("Tx Failure", error);
                }

                function _txSuccess(data) {
                    //console.log("Tx Success", data);
                }

                _db.transaction(_txCallback, _txFailure, _txSuccess);

                return deferred.promise;
            };

            this.bulkLoad = function(data, progress) {
                var deferred = $q.defer(),
                    table = this;
                //var table = this;
                function _import(data, progress) {
                    var total = data ? data.length : 0;

                    $timeout(function() {
                        //progress.rows.start({max: total});
                        deferred.notify(progress);
                    });

                    var currentItem = 0;

                    //_dexie.transaction('rw', table, function (){
                    _next();
                    //});

                    function _next() {
                        if (currentItem < data.length) {
                            var datum = data[currentItem];

                            table.noBulkCreate(datum)
                                .then(function(data) {
                                    //progress.updateRow(progress.rows);
                                    deferred.notify(data);
                                })
                                .catch(function() {
                                    deferred.reject({
                                        entity: table,
                                        error: arguments
                                    });
                                })
                                .finally(function() {
                                    currentItem++;
                                    _next();
                                });

                        } else {
                            deferred.resolve(table.name);
                        }
                    }

                }

                //console.info("bulkLoad: ", table.TableName)

                table.noClear()
                    .then(function() {
                        _import(data, progress);
                    }.bind(this));

                return deferred.promise;
            };

            /**
             * ### noClear()
             *
             * Delete all rows from the current table.
             *
             * #### Returns
             * AngularJS Promise.
             */
            this.noClear = function() {
                return webSqlOperation("BD", null);
            };

            this.noBulkCreate = function(data) {
                return webSqlOperation("BC", data);
            };
        }

        /**
         * ## NoView
         * An in memory representation of complex SQL operation that involes
         * multiple tables and joins, as well as grouping and aggregation
         * functions.
         *
         * ##### NoView JSON Prototype
         *
         * ```json
         *	{
         *		"sql": String,
         *		"primaryKey": String,
         *		"params": []
         *	}
         * ```
         *
         * ##### References
         * - https://www.sqlite.org/lang_createview.html
         *
         */
        function NoView(view, viewName, database) {
            if (!view) throw "view is a required parameter";
            if (!viewName) throw "viewName is a required parameter";
            if (!database) throw "database is a required parameter";

            var _view = view,
                _viewName = viewName,
                _db = database;

            Object.defineProperties(this, {
                "__type": {
                    "get": function() {
                        return "INoCRUD";
                    }
                },
                "primaryKey": {
                    "get": function() {
                        return _view.primaryKey;
                    }
                },
                "entityName": {
                    "get": function() {
                        return _viewName;
                    }
                }

            });

            this.noCreate = angular.noop;

            this.noRead = function() {

                var filters, sort, page,
                    deferred = $q.defer(),
                    readObject;

                for (var ai in arguments) {
                    var arg = arguments[ai];

                    //success and error must always be first, then
                    if (angular.isObject(arg)) {
                        switch (arg.__type) {
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

                readObject = noWebSQLParser.createSqlReadStmt(_viewName, filters, sort, page);

                function _txCallback(tx) {
                    tx.executeSql(
                        readObject.queryString, [],
                        function(t, r) {
                            var data = new noInfoPath.data.NoResults(_.toArray(r.rows));
                            if (page) data.page(page);
                            deferred.resolve(data);
                        },
                        function(t, e) {
                            throw e;
                        });
                }

                function _txFailure(error) {
                    throw error;
                }

                function _txSuccess(data) {
                    //console.log("Tx Success", data);
                }

                _db.transaction(_txCallback, _txFailure, _txSuccess);

                return deferred.promise;
            };

            /**
             * ### noOne(data)
             *
             * Reads a record from the websql database based on the Primary Key of the data provided.
             *
             * #### Parameters
             *
             * |Name|Type|Description|
             * |----|----|-----------|
             * |data|Object|Name Value Pairs|
             */
            this.noOne = function(data, primaryKey) {
                var deferred = $q.defer(),
                    key = data[primaryKey],
                    oneObject = noWebSQLParser.createSqlOneStmt(_viewName, primaryKey, key);

                function _txCallback(tx) {

                    tx.executeSql(oneObject.queryString,
                        oneObject.valueArray,
                        function(t, r) {
                            var data = r.rows.length ? r.rows[0] : undefined;
                            deferred.resolve(data);
                        },
                        function(t, e) {
                            deferred.reject(e);
                        });

                }

                function _txFailure(error) {
                    console.error("Tx Failure", error);
                }

                function _txSuccess(data) {
                    //console.log("Tx Success", data);
                }

                _db.transaction(_txCallback, _txFailure, _txSuccess);

                return deferred.promise;
            };

            this.noUpdate = angular.noop;

            this.noDestroy = angular.noop;

            this.bulkLoad = angular.noop;

            this.noClear = angular.noop;
        }
    }

    angular.module("noinfopath.data")
        .factory("noWebSQL", ["$parse", "$rootScope", "lodash", "$q", "$timeout", "noLogService", "noLoginService", "noLocalStorage", "noWebSQLParser", function($parse, $rootScope, _, $q, $timeout, noLogService, noLoginService, noLocalStorage, noWebSQLParser) {
            return new NoWebSQLService($parse, $rootScope, _, $q, $timeout, noLogService, noLoginService, noLocalStorage, noWebSQLParser);
        }])
        .service("noWebSQLParser", [function() {
            return new NoWebSQLParser();
        }]);
})(angular);

//transaction.js
/*  ## noTransactionCache service
*
*
*
*  #### noConfig notation example.
*
*   ```json
*    "noTransaction": {
*        "create": {
*            [
*               {
*                    "entityName": "Observations",
*                    "identityInsert": "lazy",
*                    "identityType": "guid",
*                    "order": 1
*                }
*            ]
*        },
*        "update": {
*            [
*               {
*                    "entityName": "Observations",
*                    "order": 1
*                }
*            ]
*        },
*        "destroy": {
*            [
*               {
*                    "entityName": "Observations",
*                    "order": 1
*                }
*            ]
*        }
*    }
*   ```
*   Each top-level property represents a crud operation that must
*   be handled in a specific manner in order to ensure consistency.
*   Within each operation is a list of NoTables that are part of the
*   transaction.
*
*   For each table in the operation are instructions as to which entity are
*   involved, how to carry out the transaction, and in what order.
*
*/
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$q","noIndexedDb", "lodash", "noDataSource", function($q, noIndexedDb, _, noDataSource){

			function NoTransaction(userId, noTransConfig){
				var transCfg = noTransConfig;

				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoTransaction";
						}
					}
				});

				this.transactionId = noInfoPath.createUUID();
				this.timestamp = new Date().valueOf();
				this.userId = userId;
				this.changes = new NoChanges();

				this.addChange = function(tableName, data, changeType){
					this.changes.add(tableName, data, changeType);
				};

				this.toObject = function(){
					var json = angular.fromJson(angular.toJson(this));
					json.changes = _.toArray(json.changes);

					return json;
				};

                this.upsert = function upsert(entityName, scope){
                    var THIS = this,
                        deferred = $q.defer(),
                        entityCfg = transCfg.entities[entityName],
                        data = scope[entityCfg.source.property],
                        opType = data[entityCfg.source.primaryKey] ? "update" : "create",
                        opEntites = entityCfg.operations[opType],
                        curOpEntity = 0;

                    function _recurse(entityCfg){
                        var curEntity = opEntites[curOpEntity++],
                            dsConfig, dataSource;

                        if(curEntity){
                            dsConfig = angular.merge({entityName: curEntity.entityName}, transCfg.noDataSource);
                            dataSource = noDataSource.create(dsConfig, scope);

                            dataSource[opType](data, THIS)
                                .then(function(){
                                    _recurse(entityCfg);
                                })
                                .catch(deferred.reject);

                        }else{
                            deferred.resolve();
                        }
                    }

                    _recurse(entityCfg);

                    return deferred.promise;
                };

                this.destroy = function(entityName, data){
                    var entityTxCfg = noTxConfig[entityName];

                };
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
				};
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

			function NoTransactionCache(){
				var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
                    entity = db.NoInfoPath_Changes;


                this.beginTransaction = function(userId, noTransConfig){
                    return new NoTransaction(userId, noTransConfig);
                };

				this.endTransaction = function(transaction){
					return entity.noCreate(transaction.toObject());
				};

			}

			// // These classes are exposed for testing purposes
			// noInfoPath.data.NoTransaction = NoTransaction;
			// noInfoPath.data.NoChanges = NoChanges;
			// noInfoPath.data.NoChange = NoChange;
			// noInfoPath.data.NoTransactionCache = NoTransactionCache;

			return new NoTransactionCache($q, noIndexedDb);
		}])
		;
})(angular);

//indexeddb.js
/*
*	## noIndexedDB
*	The noIndexedDB factory creates and configures a new instance of Dexie.
*	Dexie is a wrapper around IndexedDB.  noIndexedDB is a Dexie AddOn that
*	extends the query capabilites of Dexie, and exposes a CRUD interface
*	on the WriteableTable class.
*
*
*	### Class noDatum
*	This is a contructor function used by Dexie when creating and returning data objects.
*
*
*	### Class noDexie
*	This is the classed used to construct the Dexie AddOn.
*
*
*	#### noCreate
*	Adds a new record to the database. If the primary key is provided in that will be used when adding otherwise a new UUID will be created by Dexie.
*
*	##### Parameters
*
*	|Name|Type|Description|
*	|data|Object|An object contains the properties that match the schema for the underlying WriteableTable.
*
*	##### Returns
*	AngularJS:Promise
*
*
*	#### noRead
*
*	The read operation takes a complex set of parameters that allow
*	for filtering, sorting and paging of data.
*
*	##### Parameters
*
*	|Name|Type|Descriptions|
*	|----|----|------------|
*	|filters|NoFilters|(Optional) Any `NofilterExpression` objects that need to be applied to the the current table.|
*	|sort|NoSort|(Optional) Any `NoSortExpression` objects that need to be applied to the result set. The will be applied in the order supplied.|
*	|page|NoPage|(Optional) Paging information, if paging is reqired by the read operation.|
*
*	##### Returns
*	AngularJS::Promise
*
*
*	#### Internal Values
*
*	|Name|Type|Description|
*	|------|-----|-------------|
*	|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
*	|_resolve|Function|Call to resolve `Dexie::Promise` upon successful completion of `_applyFilters()`. This function is returned while resolving the underlying IDBObjectStore from the `table` parameter.|
*	|_reject|Function|Call to resolve the `Dexie::Promise` when an unexpected for un recoverable error occurs during processing.|
*	|_store|IDBObjectStore|This underlying `IDBObjectStore` that the `table` parameter represents.|
*	|_trans|IDBTransaction|This is the underlying `IDBTransaction` that the current object store is bound to.|
*
*
*	##### nonIndexedOperators
*	This hash table allows for quick access to the operations that can be applied to a property on a target object and the value(s) being filtered on.
*
*	NOTE:  The "a" parameter will always be the value tested, and "b" will always be the value being filter for.
*
*
*	#### \_applyFilters
*	This function develops an array of objects that has had all of the filters provided in the original request applied to them.  The schema matches the schema of the `table` parameter.
*
*	##### Parameters
*
*	|Name|Type|Description|
*	|----|----|------|
*	|iNofilters|[iNoFilterExpression]|An array of filter expressions. Contains both indexed and non-indexed filters|
*	|table|Dexie::Table|A reference to the `Dexie::Table` being filtered.
*
*	##### Internal variables
*
*	|Name|Type|Description|
*	|------|-----|-------------|
*	|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
*	|iNoFilterHash|Collection<iNoFilters>|Used to organize the filters received in the `iNoFilters` in to a set of indexed and non-indexed filter object The collection is created by a call to `_sortOutFilters()`.|
*	|resultsKeys|Array\<guid\>|This will be use to collect the final set of results. It will be an array of keys that will be used to query the final result set.|
*
*	##### Returns
*	AngularJS::Promise (Maybe)
*
*
*	### \_filterByIndex
*
*	This method of filtering goes against a predefined index. Basically we are doing a MapReduce techique angaist each indexed filter we come across. Using the `filter` parameter provided the index is reduced by matching against the `value` property of the `INoFilterExpression`.  See the `INoFilterExpression` for more details.
*
*	#### Parameters
*
*	|Name|Type|Description|
*	|------|-----|-------------|
*	|filter|INoFilterExpression|A single indexed filter the contains the column, operator, and value to apply to the index.|
*
*	#### Returns
*	AngularJS::Promise
*
*
*	### \_filterByPrimaryKey  -- Being Deprecated
*
*	This method of of filterig goes against the `IDBObjectStore`'s primary key.
*
*
*	\_filterHasIndex uses the iNoFilter parameter to determine
*	if there is an index available for the give filter. it returns
*	true if there is, false if not.
*
*	To determine if and index exists, we look at the table.schema.primKey,
*	and table.schema.indexes properties.
*
*
*	### \_recurseIndexedFilters
*
*
*	This method of filtering compares the supplied set of
*	filters against each object return in the Dexie colletion.
*	This is a much slower than filtering against an index.
*
*
*	While Dexie supports a put operation which is similar to upsert,
*	we're going with upsert which decides whether an insert or an
*	update is required and calls the appropreiate function.
*
*
*	### configure
*
*
*	This function splits up the filters by indexed verses not. The
*	return value is a INoFilterHash.
*
*	interface INoFilterHash {
*		indexedFilters: [INoFilterExpression]
*		nonIndexedFilters: [INoFilterExpression]
*	}
*
*
*	This function applies the provided sort items to the supplied
*	Dexie:Collection. It should always sort on indexed columns and
*	return a DexieCollection.
*
*	NOTE: Need to research how to apply multi-column sorting.
*
*
*	Applies the specified skip and take values to the final
*	Dexie::Collection, if supplied.
*
*	Note that this is the function returns the final Array of items
*	based on all of the properties applied prior to this call.
*
*
*	The promise should resolve to a Dexie::Collection that will result in
*	a set of data that matches the supplied filters, reject errors.
*
*
*	The update function expects the key to be within the update object.
*
*
*	Maps to the Dexie.Table.get method.
*
*
*	### \_extendDexieTables
*/
(function (angular, Dexie, undefined){
	"use strict";

	function NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage, noQueryParser){

		var _name;

		Object.defineProperties(this, {
			"isInitialized": {
				"get" : function(){
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		this.configure = function(noUser, config, schema){
			var deferred = $q.defer(),
				_dexie = new Dexie(schema.config.dbName),
				noIndexedDbInitialized = "noIndexedDb_" + schema.config.dbName;

			$timeout(function(){
				_dexie.currentUser = noUser;
				_dexie.on('error', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    noLogService.error("Dexie Error: " + err);
				   	deferred.reject(err);
				});

				_dexie.on('blocked', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    noLogService.warn("IndexedDB is currently execting a blocking operation.");
				   	deferred.reject(err);
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
					noLogService.log("noIndexedDb_" + schema.config.dbName + " ready.");
				    // Log to console or show en error indicator somewhere in your GUI...
					$rootScope[noIndexedDbInitialized] = _dexie;
					deferred.resolve();
				});

				if(_dexie.isOpen()){
					$timeout(function(){
						//noLogService.log("Dexie already open.")
						window.noInfoPath.digest(deferred.resolve);
					});
				}else{
					if(_.size(schema.store)){
						_dexie.version(schema.config.version).stores(schema.store);
						_extendDexieTables.call(_dexie, schema.tables);
						_dexie.open();
					}else{
						noLogService.warn("Waiting for noDbSchema data.");
					}

				}
			});

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
					//dexieTable.mapToClass(noDatum, _toDexieClass(table));
					dexieTable.noInfoPath = table;
				});
			}

			return deferred.promise;
		};

		this.whenReady = function(config){
			var deferred = $q.defer();

			$timeout(function(){
				var noIndexedDbInitialized = "noIndexedDb_" + config.dbName;

				if($rootScope[noIndexedDbInitialized])
				{
					deferred.resolve();
				}else{
					$rootScope.$watch(noIndexedDbInitialized, function(newval, oldval, scope){
						if(newval){
							deferred.resolve();
						}
					});
				}
			});

			return deferred.promise;
		};

		this.getDatabase = function(databaseName){
			return $rootScope["noIndexedDb_" + databaseName];
		};

		function noDexie(db){
			var _dexie = db;

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

			db.Table.prototype.noRead = function(){

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
                    logic = {
                        "and": function(a, b){
                            return a && b;
                        },
                        "or": function(a, b){
                            return a || b;
                        }
                    },
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
								// case "or":
								// 	keys = _.union(keys, _.pluck(items.data, "pk"));
								// 	break;
								// case "and":
								// 	keys = _.intersection(keys, _.pluck(items.data, "pk"));
								// 	break;
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


				function _filterByIndex(filter, table) {
					var deferred = $q.defer(),
						matchedKeys = [];


					table._idbstore("readonly", function(resolve, reject, store, trans){
						var ndx = store.index(filter.column),
							req = ndx.openCursor();

						req.onsuccess = function(event){
							var cursor = event.target.result,
                                //When AND assume success look for failure. When OR assume failure until any match is found.
                                matched = false;
							if(cursor){

                                for(var f in filter.filters){
                                    var fltr = filter.filters[f],
                                        operator = operators[fltr.operator];

                                    matched = operator(cursor.key, fltr.value);

                                    if(filter.logic === "and"){
                                        if(!matched){
                                            break;
                                        }
                                    }else{ //Assume OR operator
                                        if(matched){
                                            break;
                                        }
                                    }

                                }

                                if(matched){
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

				function _filterByProperties(iNoFilters, collection) {

					return collection.and(function(obj){
						angular.forEach(iNoFilters, function(iNoFilterExpression){
							_filterByProperty(iNoFilters, obj);
						});
					});
				}

				function _filterHasIndex(iNoFilterExpression) {
					return _.findIndex(table.schema.indexes, {keyPath: iNoFilterExpression.column}) > -1;
				}


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


				function _applySort(iNoSort, data) {
					noLogService.warn("TODO: Fully implement _applySort");
				}


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


				return deferred.promise;
			};

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
		*	### Class noDatum
		*	This is a contructor function used by Dexie when creating and returning data objects.
		*/
		function noDatum(){
			noLogService.log("noDatum::constructor"); //NOTE: This never seems to get called.
		}



		Dexie.addons.push(noDexie);

	}

	//noInfoPath.data.noIndexedDb = noIndexedDb;

	// The application will create the factories that expose the noDb service. Will be renaming noDb service to noIndexedDb
	angular.module("noinfopath.data")
		.factory("noIndexedDb", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function($timeout, $q, $rootScope, _, noLogService, noLocalStorage){
			return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}])
	;

})(angular, Dexie);

//data-source.js
/*
*	## noDataSource Service
*
*	Provides a generic service that exposes the NoInfoPath data providers'
*	underlying CRUD interface.
*
*	```json
*
*	"noDataSource": {
*        "dataProvider": "noWebSQL",
*        "databaseName": "FCFNv2",
*        "entityName": "LU_PercentColor",
*        "primaryKey": "PercentColorID",
*        "queryParser": "noQueryParser",
*        "sort":  [{"field": "Percentage", "dir": "asc"}]
*    }
*
*	```
*/
(function(angular, undefined){

	function NoDataSource($injector, $q, dsConfig, scope){
		var provider = $injector.get(dsConfig.dataProvider),
			db = provider.getDatabase(dsConfig.databaseName),
			entity = db[dsConfig.entityName],
			qp = $injector.get("noQueryParser"),
			isNoView = entity.constructor.name === "NoView",
            _scope = scope
		;

        Object.defineProperties(this, {
            "entity": {
                "get": function() { return entity; }
            }
        });

        /**
        *   ### resolveFilterValues(filters)
        *   #### This is more information
		*
		*	> Note of some kind
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|Foo|Number|Does something fun.|
		*
        *   > TODO: Implement support for delayed (waitFor) filter values.
        *
        *   > NOTE: If a filter.value is an object and it has a source
        *   > property set to `scope` then use the directives scope variable. Otherwise assume source is an injectable.
        */
        function resolveFilterValues(filters, scope){
            var values = {};

            for(var f in filters){
                var filter = filters[f],
                    source, value;

                if(angular.isObject(filter.value)){
                    source = filter.value.source === "scope" ? scope : $injector.get(filter.value.source);
                    values[filter.field] = noInfoPath.getItem(source, filter.value.property);
                }else{
                    values[filter.field] = filter.value;
                }
            }

            return values;
        }

		this.create = function(data, noTrans) {
			if(isNoView) throw "create operation not support on entities of type NoView";

			return entity.noCreate(data, noTrans);
		};

		this.read = function(options) {
            function requestData(scope, config, entity, queryParser, resolve, reject){
                var params = angular.merge({}, options),
                    filterValues = resolveFilterValues(dsConfig.filter, _scope);

                if(config.filter){
                    var filters = [];
                    for(var f in config.filter){
                        var filter = config.filter[f],
                            value = angular.isObject(filter.value) ? filterValues[filter.field] : filter.value;

                        filters.push({field: filter.field, operator: filter.operator, value: value});

                    }

                    params.filter = { filters:  filters.length ? filters : undefined };
                }

                if(config.sort){
                    params.sort = config.sort;
                }

                return entity.noRead.apply(entity, queryParser.parse(params))
                    .then(function(data){
                        resolve(data);
                    })
                    .catch(function(err){
                        reject(err);
                    });

            }

            return $q(function(resolve, reject){
                var waitFor, filterValues;

                if(dsConfig.waitFor){
                    waitFor = _scope.$watch(dsConfig.waitFor.property, function(newval, oldval, scope){
                        if(newval){
                            requestData(scope, dsConfig, entity, qp, resolve, reject);

                            waitFor();
                        }
                    });
                }else{
                    requestData(scope, dsConfig, entity, qp, resolve, reject);
                }

            });

		};

		this.update = function(data, noTrans) {
			if(isNoView) throw "update operation not support on entities of type NoView";

			return entity.noUpdate(data, noTrans);
		};

		this.destroy = function(data, noTrans) {
			if(isNoView) throw "destroy operation not support on entities of type NoView";

			return entity.noUpdate(data, noTrans);
		};

        this.one = function(options) {
            function requestData(scope, config, entity, resolve, reject){
                var params = [];

                if(dsConfig.lookup){
                    filterValues =  $injector.get(dsConfig.lookup.source, _scope);

                }else if(dsConfig.filter){
                    filterValues = resolveFilterValues(config.filter, _scope);
                }

                if(entity.constructor.name === "NoView"){
                    params[0] = filterValues;
                    params[1] = config.primaryKey;
                }else{
                    params[0]  = filterValues;
                }


                return entity.noOne.apply(null, params)
                    .then(function(data){
                        resolve(data);
                    })
                    .catch(function(err){
                        reject(err);
                    });

            }


            return $q(function(resolve, reject){
                var waitFor, filterValues;



                if(dsConfig.waitFor){
                    waitFor = _scope.$watch(dsConfig.waitFor.property, function(newval, oldval, scope){
                        if(newval){

                            requestData(scope, dsConfig, entity, resolve, reject);

                            waitFor();
                        }
                    });
                }else{
                    requestData(scope, dsConfig, entity, resolve, reject);
                }

            });

		};

	}

	angular.module("noinfopath.data")

		.service("noDataSource", ["$injector", "$q", function($injector, $q){
			/*
			*	#### create(dsConfigKey)
			*
			*	create a new instance of a NoDataSource object configured
			*	based on the datasource configuration found in noConfig
			*	at the given `dsConfigKey` location.
			*
			*	##### Parameters
			*
			*	|Name|Type|Description|
			*	|----|----|-----------|
			*	|dsConfigKey|String|The location in noConfig where the data source's configuration can be found.  Can be a complex name like the following.  `noForms.myForm1.noComponents.foo.noDataSource`|
			*
			*	##### Returns
			*
			*	An instance of a NoDataSource object.
			*
			*/
			this.create = function(dsConfig, scope){
				return new NoDataSource($injector, $q, dsConfig, scope);
			};
		}])
	;
})(angular);
