//globals.js
/*
 *	# noinfopath-data
 *	@version 2.0.21
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
 */
(noInfoPath.data = {});
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers', 'noinfopath.logger'])


	.run(['$injector', '$parse', '$timeout', '$q', '$rootScope', '$browser', '$filter', function ($injector, $parse, $timeout, $q, $rootScope, $browser, $filter) {

		function _digestTimeout() {


			if($timeout.flush && $browser.deferredFns.length) {
				if($rootScope.$$phase) {
					setTimeout(function () {
						$timeout.flush();
					}, 10);
				} else {
					$timeout.flush();
				}
				//console.log($timeout.verifyNoPendingTasks());

			}
		}

		function _digestError(fn, error) {
			var digestError = error;

			if(angular.isObject(error)) {
				digestError = error.toString();
			}

			//console.error(digestError);

			_digest(fn, digestError);
		}

		function _digest(fn, data) {
			var message = [];

			if(angular.isArray(data)) {
				message = data;
			} else {
				message = [data];
			}

			if(window.jasmine) {
				$timeout(function () {
					fn.apply(null, message);
				});
				$timeout.flush();
			} else {
				fn.apply(null, message);
			}

		}

		function _setItem(store, key, value) {
			var getter = $parse(key),
				setter = getter.assign;

			setter(store, value);
		}

		function _getItem(store, key) {
			var getter = $parse(key);
			return getter(store);
		}

		function _toDbDate(date) {
			var dateResult;

			if(!date) {
				dateResult = null;
			} else {
				dateResult = moment.utc(date)
					.format("YYYY-MM-DDTHH:mm:ss.sss");
			}

			if(dateResult === "Invalid date") {
				dateResult = null;
			}

			return dateResult;
		}

		function _toDisplayDate(date) {
			var dateResult = moment.utc(date)
				.format("YYYY-MM-DD HH:mm:ss.sss");

			        
			return dateResult;
		}

		function _isCompoundFilter(indexName) {
			return indexName.match(/^\[.*\+.*\]$/gi);
		}

		function _resolveID(query, entityConfig) {
			var filters = new noInfoPath.data.NoFilters();

			if(angular.isNumber(query)) {
				//Assume rowid
				/*
				 *	When query a number, a filter is created on the instrinsic
				 *	filters object using the `rowid`  WebSQL column as the column
				 *	to filter on. Query will be the target
				 *	value of query.
				 */
				filters.quickAdd("rowid", "eq", query);

			} else if(angular.isString(query)) {
				//Assume guid
				/*
				 * When the query is a string it is assumed a table is being queried
				 * by it's primary key.
				 *
				 * > Passing a string when the entity is
				 * a SQL View is not allowed.
				 */
				if(entityConfig.entityType === "V") throw "One operation not supported by SQL Views when query parameter is a string. Use the simple key/value pair object instead.";

				filters.quickAdd(entityConfig.primaryKey, "eq", query);

			} else if(angular.isObject(query)) {
				if(query.__type === "NoFilters") {
					filters = query;
				} else {
					if(entityConfig.primaryKey) {
						filters.quickAdd(entityConfig.primaryKey, "eq", query[entityConfig.primaryKey]);
					} else {
						//Simple key/value pairs. Assuming all are equal operators and are anded.
						for(var k in query) {
							filters.quickAdd(k, "eq", query[k]);
						}
					}
				}

			} else {
				throw "One requires a query parameter. May be a Number, String or Object";
			}

			return filters;
		}

		function _toScopeSafeGuid(uid) {
			return(uid || "").replace(/-/g, "_");
		}

		function _fromScopeSafeGuid(ssuid) {
			return(ssuid || "").replace(/_/g, "-");
		}

		var _data = {
			getItem: _getItem,
			setItem: _setItem,
			digest: _digest,
			digestError: _digestError,
			digestTimeout: _digestTimeout,
			toDbDate: _toDbDate,
			toDisplayDate: _toDisplayDate,
			isCompoundFilter: _isCompoundFilter,
			resolveID: _resolveID,
			toScopeSafeGuid: _toScopeSafeGuid,
			fromScopeSafeGuid: _fromScopeSafeGuid
		};

		angular.extend(noInfoPath, _data);
	}]);
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
(function (angular, undefined) {
	"use strict";
	var
		stringSearch = {
			"contains": true,
			"notcontains": true,
			"startswith": true,
			"endswith": true
		},

		filters = {
			"is null": "is null",
			"is not null": "is not null",
			eq: "eq",
			neq: "ne",
			gt: "gt",
			ge: "ge",
			gte: "ge",
			lt: "lt",
			le: "le",
			lte: "le",
			contains: "contains",
			doesnotcontain: "notcontains",
			endswith: "endswith",
			startswith: "startswith",
			"in": "in"
		},

		sqlOperators = {
			"is null": function () {
				return "is null";
			},
			"is not null": function () {
				return "is not null";
			},
			"eq": function (v) {
				return "= " + normalizeSafeValue(v);
			},
			"ne": function (v) {
				return "!= " + normalizeSafeValue(v);
			},
			"gt": function (v) {
				return "> " + normalizeSafeValue(v);
			},
			"ge": function (v) {
				return ">= " + normalizeSafeValue(v);
			},
			"lt": function (v) {
				return "< " + normalizeSafeValue(v);
			},
			"le": function (v) {
				return "<= " + normalizeSafeValue(v);
			},
			"contains": function (v) {
				return "LIKE '%" + String(v) + "%'";
			},
			"notcontains": function (v) {
				return "NOT LIKE '%" + String(v) + "%'";
			},
			"startswith": function (v) {
				return "LIKE '" + String(v) + "%'";
			},
			"endswith": function (v) {
				return "LIKE '%" + String(v) + "'";
			},
			"in": function (v) {
				return "IN (" + String(v) + ")";
			}
		},

		odataOperators = {
			"eq": function (v) {
				return "{0} eq " + normalizeValue(v);
			},
			"ne": function (v) {
				return "{0} ne " + normalizeValue(v);
			},
			"gt": function (v) {
				return "{0} gt " + normalizeValue(v);
			},
			"ge": function (v) {
				return "{0} ge " + normalizeValue(v);
			},
			"lt": function (v) {
				return "{0} lt " + normalizeValue(v);
			},
			"le": function (v) {
				return "{0} le " + normalizeValue(v);
			},
			"contains": function (v) {
				return "substringof(" + normalizeValue(v) + ", {0})";
			},
			"notcontains": function (v) {
				return "not substringof(" + normalizeValue(v) + ", {0})";
			},
			"startswith": function (v) {
				return "startswith(" + "{0}, " + normalizeValue(v) + ")";
			},
			"endswith": function (v) {
				return "endswith(" + "{0}, " + normalizeValue(v) + ")";
			}
		};
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
	function normalizeValue(inval) {
		var outval = inval;

		if(angular.isDate(inval)) {
			outval = "datetime('" + noInfoPath.toDbDate(inval) + "', 'utc')";
		} else if(angular.isString(inval)) {
			outval = "'" + inval + "'";
		}

		if(noInfoPath.isGuid(inval)) {
			outval = "guid" + outval;
		}

		return outval;
	}

	function normalizeSafeValue(inval) {
		var outval = inval;

		if(angular.isDate(inval)) {
			outval = "datetime( ?, 'utc')";
		} else if(angular.isString(inval)) {
			outval = "?";
		}

		return outval;
	}

	function safeValue(inval) {
		var outval = "?";

		return outval;
	}

	function normalizeLogic(inval) {
		return inval ? " " + inval : "";
	}

	function normalizeOperator(inop) {
		var op = filters[inop];

		return sqlOperators[op];
	}

	function normalizeOdataOperator(inop) {
		var op = filters[inop];

		return odataOperators[op];
	}

	function NoFilterExpression(operator, value, logic) {

		if(!operator) throw "INoFilterExpression requires a operator to filter by.";
		//if (!value) throw "INoFilterExpression requires a value(s) to filter for.";


		this.operator = operator;
		this.value = value;
		this.logic = logic;

		this.toODATA = function () {
			var opFn = normalizeOdataOperator(this.operator),
				rs = opFn(this.value) + normalizeLogic(this.logic);

			return rs;

		};

		this.toSQL = function () {
			var opFn = normalizeOperator(this.operator),
				rs = opFn(this.value) + normalizeLogic(this.logic);

			return rs;
		};

		this.toSafeSQL = function () {
			var opFn = normalizeOperator(this.operator),
				v = stringSearch[this.operator] ? this.value : "?",
				rs = opFn(v) + normalizeLogic(this.logic);

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
				"get": function () {
					return "NoFilters";
				}
			}
		});

		noInfoPath.setPrototypeOf(this, arr);

		//filter { logic: "and", filters: [ { field: "name", operator: "startswith", value: "Jane" } ] }
		//{"take":10,"skip":0,"page":1,"pageSize":10,"filter":{"logic":"and","filters":[{"value":"apple","operator":"startswith","ignoreCase":true}]}}

		//arr.push.apply(arr, arguments);
		this.toODATA = function () {
			var tmp = [];
			for(var fi = 0; fi < this.length; fi++) {
				var fltr = this[fi],
					os = fltr.toODATA();

				if(fltr.logic && this.length > 1) os = os + " " + fltr.logic + " ";

				tmp.push(os);
			}

			tmp = tmp.join("");
			return tmp;
		};

		this.toKendo = function () {
			var ra = [];
			for(var j = 0; j < this.length; j++) {
				var f = this[j];

				ra.push(f.toKendo());
			}
			return ra;
		};

		this.toSQL = function () {
			var rs = "",
				rsArray = [];

			angular.forEach(this, function (value, key) {

				if(this.length == key + 1) {
					value.logic = null;
				}

				rsArray.push(value.toSQL());
			}, this);

			rs = rsArray.join("");

			return rs;
		};

		this.toSafeSQL = function () {
			var rs = "",
				rsArray = [],
				values = [];

			angular.forEach(this, function (filter, key) {

				if(this.length == key + 1) {
					filter.logic = null;
				}

				var tmp = filter.toSafeSQL();

				rsArray.push(tmp.sql);
				if(tmp.sql.indexOf("?") > -1) {
					values = values.concat(tmp.values);
				}
			}, this);

			rs = rsArray.join("");

			return {
				queryString: rs,
				valueArray: values
			};
		};

		this.add = function (column, logic, beginning, end, filters) {
			if(!column) throw "NoFilters::add requires a column to filter on.";
			if(!filters) throw "NoFilters::add requires a value(s) to filter for.";

			var tmp = new NoFilter(column, logic, beginning, end, filters);

			this.push(tmp);

			return tmp;
		};

		this.quickAdd = function (column, operator, value, logic) {
			return this.add(column, logic, true, true, [{
				"operator": operator,
				"value": value,
				"logic": null
			}]);
		};

		if(kendoFilter) {

			var filters = kendoFilter.filters || kendoFilter;

			if(!kendoFilter.logic) kendoFilter.logic = "and";

			for(var i = 0; i < filters.length; i++) {
				var filter = filters[i],
					logic1;
				// fe = new NoFilterExpression(filter.operator, filter.value),
				//f = new NoFilter(filter.field, filter.logic ? filter.logic : kendoFilter.logic, true, true, [fe]);

				if(filter.filters) {
					for(var j = 0; j < filter.filters.length; j++) {
						var filter2 = filter.filters[j],
							logic2;

						if(j < filter.filters.length) {
							logic2 = filter2.logic ? filter2.logic : kendoFilter.logic;
						}

						this.quickAdd(filter2.field, filter2.operator, filter2.value, logic2);
					}
				} else {
					if(i < filters.length) {
						logic1 = filter.logic ? filter.logic : kendoFilter.logic;
					}

					this.quickAdd(filter.field, filter.operator, filter.value, logic1);
				}

				//this.push(f);
			}


		}

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
				"get": function () {
					return "NoFilter";
				}
			}
		});

		this.column = column;
		this.logic = logic;
		this.beginning = beginning;
		this.end = end;
		this.filters = [];

		angular.forEach(filters, function (value, key) {
			this.filters.push(new NoFilterExpression(value.operator, value.value, value.logic));
		}, this);

		function normalizeColumn(incol, val) {
			var ocol = incol;

			if(angular.isDate(val)) {
				ocol = "datetime(" + incol + ",'utc')";
			}

			return ocol;
		}

		function normalizeInValue(exp) {

			if(exp.operator.toLowerCase() === "in") {
				for(var i = 0; i < exp.value.length; i++) {
					var valum = exp.value[i];

					exp.value[i] = "'" + valum + "'";
				}

				exp.value = exp.value.join(",");
			}
		}

		this.toODATA = function () {
			var tmp = [],
				os = "";
			for(var ei = 0; ei < this.filters.length; ei++) {
				var expr = this.filters[ei],
					od = expr.toODATA()
					.replace("{0}", this.column);

				tmp.push(od);
			}

			if(this.logic) {
				os = tmp.join(" " + this.logic + " ");
			} else {
				if(tmp.length > 0) {
					os = tmp[0];
				}
			}

			if(this.beginning) os = "(" + os;
			if(this.end) os = os + ")";

			return os;
		};

		this.toKendo = function () {
			// filter: {
			// 	logic: "or",
			// 	filters: [{
			// 		field: "category",
			// 		operator: "eq",
			// 		value: "Food"
			// 	}, {
			// 		field: "name",
			// 		operator: "eq",
			// 		value: "Tea"
			// 	}]
			// }

			var ro = {},
				logic;

			ro.filters = [];

			for(var f = 0; f < this.filters.length; f++) {
				var exp = this.filters[f],
					newFilter = {};

				if(exp.logic && !ro.logic) {
					ro.logic = exp.logic;
				}

				newFilter.field = this.column;
				newFilter.column = this.column;
				newFilter.operator = exp.operator;
				newFilter.value = exp.value;

				ro.filters.push(newFilter);
			}
			return ro;
		};

		this.toSQL = function () {
			var rs = "",
				filterArray = [],
				filterArrayString = "";

			angular.forEach(this.filters, function (value, key) {
				filterArray.push(normalizeColumn(this.column, value.value) + " " + value.toSQL());
			}, this);

			filterArrayString = filterArray.join(" ");

			if(!!this.beginning) rs = "(";
			rs += filterArrayString;
			if(!!this.end) rs += ")";
			if(!!this.logic) rs += " " + logic + " ";

			return rs;
		};

		this.toSafeSQL = function () {
			var rs = "",
				filterArray = [],
				filterArrayString = "",
				values = [];

			angular.forEach(this.filters, function (exp, key) {
				normalizeInValue(exp);

				if(exp.operator.toLowerCase() === "in") {
					filterArray.push(normalizeColumn(this.column, exp.value) + " " + exp.toSQL());
				} else {
					filterArray.push(normalizeColumn(this.column, exp.value) + " " + exp.toSafeSQL());
				}

				if(!stringSearch[exp.operator]) {
					if(exp.operator.toLowerCase() !== "in") {
						values.push(exp.value);
					}
				}
			}, this);

			filterArrayString = filterArray.join(" ");

			if(!!this.beginning) rs = "(";
			rs += filterArrayString;
			if(!!this.end) rs += ")";
			if(!!this.logic) rs += " " + logic + " ";

			return {
				sql: rs,
				values: values
			};
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

		if(!column) throw "NoFilters::add requires a column to sort on.";

		this.column = column;
		this.dir = dir;

		this.toSQL = function () {
			return this.column + (this.dir ? " " + this.dir : "");
		};
	}

	function NoSort() {
		var arr = [];

		Object.defineProperties(arr, {
			"__type": {
				"get": function () {
					return "NoSort";
				}
			}
		});

		if(arguments.length) {
			var raw = arguments[0];

			for(var s in raw) {
				var sort = raw[s];
				arr.push(new NoSortExpression(sort.field, sort.dir));
			}

		}

		//arr.push.apply(arr, arguments.length ? arguments[0] : []);
		arr.add = function (column, dir) {
			if(!column) throw "NoSort::add requires a column to filter on.";

			this.push(new NoSortExpression(column, dir));
		};

		arr.toSQL = function () {

			var sqlOrder = "ORDER BY ",
				sortExpressions = [];

			angular.forEach(this, function (sort) {
				sortExpressions.push(sort.toSQL());
			});


			return sortExpressions.length ? sqlOrder + sortExpressions.join(',') : "";
		};

		noInfoPath.setPrototypeOf(this, arr);
	}

	function NoPage(skip, take) {
		Object.defineProperties(this, {
			"__type": {
				"get": function () {
					return "NoPage";
				}
			}
		});

		this.skip = skip;
		this.take = take;

		this.toSQL = function () {
			return "LIMIT " + this.take + " OFFSET " + this.skip;
		};
	}

	function NoResults(arrayOfThings) {
		//Capture the length of the arrayOfThings before any changes are made to it.
		var _raw, _total, _page, arr;

		if(arrayOfThings) {
			if(arrayOfThings["odata.metadata"]) {
				_raw = arrayOfThings.value;
				if(arrayOfThings["odata.count"]) {
					_total = Number(arrayOfThings["odata.count"]);
				} else {
					_total = _raw.length;
				}

			} else {
				_raw = arrayOfThings;
				_total = _raw.length;
			}
		} else {
			_raw = [];
			_total = 0;
		}

		arr = angular.copy(_raw);
		_page = _raw;

		Object.defineProperties(arr, {
			"total": {
				"get": function () {
					return _total;
				},
				"set": function (value) {
					_total = value;
				}
			},
			"paged": {
				"get": function () {
					return _page;
				}
			}
		});

		arr.page = function (nopage) {
			if(!nopage) throw "nopage is a required parameter for NoResults::page";

			if(nopage.take >= _raw.length) {
				_page = _raw;
			} else {
				_page = _raw.slice(nopage.skip, nopage.skip + nopage.take);
			}
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
(function (angular, undefined) {
	angular.module("noinfopath.data")
		.service("noQueryParser", [function () {
			var filters, sort, paging;

			this.parse = function (options) {
				var filters, sort, paging;

				//filter { logic: "and", filters: [ { field: "name", operator: "startswith", value: "Jane" } ] }
				//{"take":10,"skip":0,"page":1,"pageSize":10,"filter":{"logic":"and","filters":[{"value":"apple","operator":"startswith","ignoreCase":true}]}}
				if(!!options.take) paging = new noInfoPath.data.NoPage(options.skip, options.take);
				if(!!options.sort) sort = new noInfoPath.data.NoSort(options.sort);
				if(!!options.filter) filters = new noInfoPath.data.NoFilters(options.filter);

				return toArray(filters, sort, paging);
			};

			function toArray(filters, sort, paging) {
				var arr = [];

				if(!!filters) arr.push(filters);

				if(!!sort) arr.push(sort);

				if(!!paging) arr.push(paging);

				if(arr.length === 0) arr = undefined;

				return arr;
			}
		}])

	.service("noOdataQueryBuilder", ['$filter', function ($filter) {
		var odataFilters = {
				eq: "eq",
				neq: "ne",
				gt: "gt",
				gte: "ge",
				lt: "lt",
				lte: "le",
				contains: "substringof",
				doesnotcontain: "substringof",
				endswith: "endswith",
				startswith: "startswith"
			},
			mappers = {
				pageSize: angular.noop,
				page: angular.noop,
				filter: function (params, filter, useVersionFour) {
					if(filter) {
						params.$filter = toOdataFilter(filter, useVersionFour);
					}
				},
				data: function (params, filter, useVersionFour) {
					mappers.filter(params, filter.filter, useVersionFour);
				},
				// filter: function(params, filter, useVersionFour) {
				//     if (filter) {
				//         params.$filter = SELF.toOdataFilter(filter, useVersionFour);
				//     }
				// },
				sort: function (params, orderby) {
					var sorts = angular.forEach(orderby, function (value) {
							var order = value.field.replace(/\./g, "/");

							if(value.dir === "desc") {
								order += " desc";
							}

							return order;
						}),
						expr = sorts ? sorts.join(",") : undefined;

					if(expr) {
						params.$orderby = expr;
					}
				},
				skip: function (params, skip) {
					if(skip) {
						params.$skip = skip;
					}
				},
				take: function (params, take) {
					if(take) {
						params.$top = take;
					}
				}
			};



		function toOdataFilter(filters, useOdataFour) {
			var result = [],
				field,
				type,
				format,
				operator,
				value,
				ignoreCase,
				filter,
				origFilter;

			console.log(filters);

			if(filters.__type === "NoFilters") {
				filters = filters.toKendo();
				filters = filters.length > 0 ? filters[0] : {
					filters: []
				};
			}

			if(filters.__type === "NoFilter") {
				filters = filters.toKendo();
			}

			for(var idx = 0; idx < filters.filters.length; idx++) {
				filter = origFilter = filters.filters[idx];
				field = filter.column;
				value = filter.value;
				operator = filter.operator;
				logic = filter.logic;

				if(filter.filters) {
					filter = toOdataFilter(filter, useOdataFour);
				} else {
					ignoreCase = filter.ignoreCase;
					field = field.replace(/\./g, "/");
					filter = odataFilters[operator];

					// if (useOdataFour) {
					//     filter = odataFiltersVersionFour[operator];
					// }

					if(filter && value !== undefined) {

						if(angular.isString(value)) {
							if(noInfoPath.isGuid(value)) {
								format = "guid'{1}'";
							} else {
								format = "'{1}'";
							}

							value = value.replace(/'/g, "''");


							// if (ignoreCase === true) {
							//     field = "tolower(" + field + ")";
							// }

						} else if(angular.isDate(value)) {
							if(useOdataFour) {
								format = "yyyy-MM-ddTHH:mm:ss+00:00";
							} else {
								value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
								format = "{1}";
							}
						} else {
							format = "{1}";
						}

						if(filter.length > 3) {
							if(filter !== "substringof") {
								format = "{0}({2}," + format + ")";
							} else {
								format = "{0}(" + format + ",{2})";
								if(operator === "doesnotcontain") {
									if(useOdataFour) {
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

						filter = !!value ? $filter("format")(format, filter, value, field) : $filter("format")(format, filter, undefined, field);
					}
				}

				origFilter.compiledFilter = filter;
				result.push(origFilter);
			}

			//loop until there are no more filters or logic.
			var odataFilter = "",
				f;

			do {
				f = result.pop();

				if(f) {

					odataFilter = odataFilter + "(" + f.compiledFilter + ")";

					if(f.logic) {
						odataFilter = odataFilter + " " + f.logic + " ";
					} else {
						f = null;
					}
				}

			}
			while (f);

			odataFilter = odataFilter.trim();

			return odataFilter;
		}

		function toOdataSort(sort) {
			var sorts = [],
				expr;

			angular.forEach(sort, function (value) {
				console.log(value);
				var order = value.column.replace(/\./g, "/");

				if(value.dir === "desc") {
					order += " desc";
				}

				sorts.push(order);
			});

			expr = sorts ? sorts.join(",") : undefined;

			return expr;
		}

		this.makeQuery = function () {
			var query = {};

			for(var ai in arguments) {
				var arg = arguments[ai];

				//success and error must always be first, then
				if(angular.isObject(arg)) {
					switch(arg.__type) {
						case "NoFilters":
							query.$filter = arg.toODATA();
							break;
						case "NoSort":
							query.$orderby = toOdataSort(arg);
							break;
						case "NoPage":
							query.$skip = arg.skip;
							query.$top = arg.take;
							query.$inlinecount = "allpages";
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
(function () {
	"use strict";

	function MockStorage() {
		var _store = {},
			_len = 0;

		Object.defineProperties(this, {
			"length": {
				"get": function () {
					var l = 0;
					for(var x in _store) {
						l++;
					}
					return l;
				}
			}
		});

		this.key = function (i) {
			var l = 0;
			for(var x in _store) {
				if(i == l) return x;
			}
		};

		this.setItem = function (k, v) {
			_store[k] = v;
		};

		this.getItem = function (k) {
			return _store[k];
		};

		this.removeItem = function (k) {
			delete _store[k];
		};

		this.clear = function () {
			_store = {};
		};
	}

	/**
		### @class NoStorage
	*/
	function NoStorage(storetype) {
		var _store;


		if(typeof window[storetype] === "object") {
			_store = window[storetype];
		} else {

			_store = new MockStorage();
		}


		Object.defineProperties(this, {
			"length": {
				"get": function () {
					return _store.length;
				}
			}
		});

		this.key = function (i) {
			return _store.key(i);
		};

		this.setItem = function (k, v) {
			if(v) {
				_store.setItem(k, angular.toJson(v));
			} else {
				_store.setItem(k, undefined);
			}

		};

		this.getItem = function (k) {
			var x = _store.getItem(k);

			if(x === "undefined") {
				return undefined;
			} else {
				return angular.fromJson(x);
			}

		};

		this.removeItem = function (k) {
			_store.removeItem(k);
		};

		this.clear = function () {
			_store.clear();
		};
	}

	angular.module("noinfopath.data")
		.factory("noSessionStorage", [function () {
			return new NoStorage("sessionStorage");
		}])

	.factory("noLocalStorage", [function () {
		return new NoStorage("localStorage");
		}]);
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
(function (angular, undefined) {
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.data")
		.config([function () {}])

	.provider("noConfig", [function () {
		var _currentConfig, _status;

		function NoConfig($http, $q, $rootScope, noLocalStorage) {
			var SELF = this;

			Object.defineProperties(this, {
				"current": {
					"get": function () {
						return _currentConfig;
					}
				},
				"status": {
					"get": function () {
						return _status;
					}
				}
			});

			this.load = function (uri) {
				var url = uri || "/config.json";
				return $http.get(url)
					.then(function (resp) {
						noLocalStorage.setItem("noConfig", resp.data);
						return resp.data;
					})
					.catch(function (err) {
						throw err;
					});
			};

			this.fromCache = function () {
				_currentConfig = noLocalStorage.getItem("noConfig");
			};

			this.whenReady = function (uri) {

				return $q(function (resolve, reject) {
					if($rootScope.noConfig) {
						resolve($rootScope.noConfig);
					} else {
						$rootScope.$watch("noConfig", function (newval) {
							if(newval) {
								resolve(newval);
							}
						});

						SELF.load(uri)
							.then(function () {
								_currentConfig = noLocalStorage.getItem("noConfig");
								$rootScope.noConfig = _currentConfig;
							})
							.catch(function (err) {
								SELF.fromCache();

								if(_currentConfig) {
									$rootScope.noConfig = _currentConfig;
								} else {
									reject("noConfig");
								}
							});
					}
				});


			};
		}

		this.$get = ['$http', '$q', '$rootScope', 'noLocalStorage', function ($http, $q, $rootScope, noLocalStorage) {
			return new NoConfig($http, $q, $rootScope, noLocalStorage);
		}];
	}]);
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
(function (angular, undefined) {
	"use strict";
	var $httpProviderRef;

	angular.module('noinfopath.data')
		.config(["$httpProvider", function ($httpProvider) {
			$httpProviderRef = $httpProvider;
	}])
		.provider("noHTTP", [function () {
			this.$get = ['$rootScope', '$q', '$timeout', '$http', '$filter', 'noUrl', 'noDbSchema', 'noOdataQueryBuilder', 'noLogService', 'noConfig', function ($rootScope, $q, $timeout, $http, $filter, noUrl, noDbSchema, noOdataQueryBuilder, noLogService, noConfig) {

				function NoHTTP(queryBuilder) {
					var THIS = this,
						_currentUser;

					console.warn("TODO: make sure noHTTP conforms to the same interface as noIndexedDb and noWebSQL");

					this.whenReady = function (tables) {

						return $q(function (resolve, reject) {
							if($rootScope.noHTTPInitialized) {
								noLogService.log("noHTTP Ready.");
								resolve();
							} else {
								//noLogService.log("noDbSchema is not ready yet.")
								$rootScope.$watch("noHTTPInitialized", function (newval) {
									if(newval) {
										noLogService.log("noHTTP ready.");
										resolve();
									}
								});

							}
						});
					};

					this.configure = function (noUser, schema) {
						_currentUser = noUser;
						//console.log("noHTTP::configure", schema);
						var promise = $q(function (resolve, reject) {
							for(var t in schema.tables) {
								var table = schema.tables[t];
								THIS[t] = new NoTable(t, table, queryBuilder);
							}
							$rootScope.noHTTPInitialized = true;
							noLogService.log("noHTTP_" + schema.config.dbName + " ready.");

							$rootScope["noHTTP_" + schema.config.dbName] = THIS;

							resolve(THIS);
						});

						return promise;
					};

					this.getDatabase = function (databaseName) {
						return $rootScope["noHTTP_" + databaseName];
					};

					this.noRequestJSON = function (url, method, data, useCreds) {
						var json = angular.toJson(data);

						if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _currentUser.token_type + " " + _currentUser.access_token;

						var deferred = $q.defer(),
							req = {
								method: method,
								url: url,
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: !!useCreds
							};

						$http(req)
							.success(function (data) {
								deferred.resolve(data);
							})
							.error(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;
					};

					this.noRequestForm = function (url, method, data, useCreds) {
						var deferred = $q.defer(),
							req = {
								method: method,
								url: url,
								data: $.param(data),
								headers: {
									"Content-Type": "application/x-www-form-urlencoded"
								},
								withCredentials: !!useCreds
							};

						$http(req)
							.success(function (data) {
								deferred.resolve(data);
							})
							.error(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;
					};
				}

				function NoTable(tableName, table, queryBuilder) {
					var THIS = this,
						_table = table;

					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url = noUrl.makeResourceUrl(_table.uri || noConfig.current.RESTURI, tableName);

					Object.defineProperties(this, {
						entity: {
							get: function () {
								return _table;
							}
						}
					});

					this.noCreate = function (data) {
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
							.success(function (data) {
								//console.log(angular.toJson(data) );

								deferred.resolve(data);
							})
							.error(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;
					};

					this.noRead = function () {
						//noLogService.debug("noRead say's, 'swag!'");
						var filters, sort, page;

						for(var ai in arguments) {
							var arg = arguments[ai];

							//success and error must always be first, then
							if(angular.isObject(arg)) {
								switch(arg.__type) {
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
								params: queryBuilder(filters, sort, page),
								url: url,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function (data) {
								//console.log( angular.toJson(data));
								var resp = new noInfoPath.data.NoResults(data);
								deferred.resolve(resp);
							})
							.error(function (reason) {
								noLogService.error(arguments);
								deferred.reject(reason);
							});

						return deferred.promise;
					};

					this.noUpdate = function (data) {
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
							.success(function (data, status) {
								deferred.resolve(status);
							})
							.error(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;

					};

					this.noDestroy = function (data) {
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
							.success(function (data, status) {
								deferred.resolve(status);
							})
							.error(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;
					};

					this.noOne = function (query) {
						/**
						 *	When 'query' is an object then check to see if it is a
						 *	NoFilters object.  If not, add a filter to the intrinsic filters object
						 *	based on the query's key property, and the query's value.
						 */
						var filters = new noInfoPath.data.NoFilters();

						if(angular.isNumber(query)) {
							//Assume rowid
							/*
							 *	When query a number, a filter is created on the instrinsic
							 *	filters object using the `rowid`  WebSQL column as the column
							 *	to filter on. Query will be the target
							 *	value of query.
							 */
							filters.quickAdd("rowid", "eq", query);

						} else if(angular.isString(query)) {
							//Assume guid
							/*
							 * When the query is a string it is assumed a table is being queried
							 * by it's primary key.
							 *
							 * > Passing a string when the entity is
							 * a SQL View is not allowed.
							 */
							if(_entityConfig.entityType === "V") throw "One operation not supported by SQL Views when query parameter is a string. Use the simple key/value pair object instead.";

							filters.quickAdd(_entityConfig.primaryKey, "eq", query);

						} else if(angular.isObject(query)) {
							if(query.__type === "NoFilters") {
								filters = query;
							} else {
								//Simple key/value pairs. Assuming all are equal operators and are anded.
								for(var k in query) {
									filters.quickAdd(k, "eq", query[k]);
								}
							}

						} else {
							throw "One requires a query parameter. May be a Number, String or Object";
						}

						//Internal _getOne requires and NoFilters object.
						return THIS.noRead(filters)
							.then(function (data) {
								if(data.length) {
									return data[0];
								} else if(data.paged && data.paged.length) {
									return data.paged[0];
								} else {
									throw "noHTTP::noOne: Record Not Found";
								}
							});

					};
				}

				//return new noREST($q, $http, $filter, noUrl, noConfig)
				return new NoHTTP(noOdataQueryBuilder.makeQuery);
			}];
		}]);
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
(function (angular, Dexie, undefined) {
	"use strict";
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
	 * ```url
	 */


	function NoDbSchema(_, noConfig, noDbConfig, rawDbSchema) {
		//console.warn("NoDbSchema", noDbConfig);

		var _config = {},
			_tables = rawDbSchema,
			_views = {},
			_sql = {},
			_schemaConfig = noDbConfig;



		Object.defineProperties(this, {
			"store": {
				"get": function () {
					return _config;
				}
			},
			"tables": {
				"get": function () {
					return _tables;
				}
			},
			"lookups": {
				"get": function () {
					return _.filter(_tables, function (o) {
						return o.entityName.indexOf("LU") === 0;
					});
				}
			},
			"isReady": {
				"get": function () {
					return _.size(_tables) > 0;
				}
			},
			"sql": {
				"get": function () {
					return _sql;
				}
			},
			"views": {
				"get": function () {
					return _views;
				}
			},
			"config": {
				"get": function () {
					return _schemaConfig;
				}
			}
		});

		this.entity = function (name) {
			return _.find(_tables, function (v) {
				return v.entityName === name;
			});
		};

		_views = _.filter(_tables, function (o) {
			return o.entityType == "V";
		});

		angular.forEach(_tables, function (table, tableName) {
			var keys = [table.primaryKey];

			keys = keys.concat(_.uniq(_.pluck(table.foreignKeys, "column")), table.indexes || []);


			//Prep as a Dexie Store config
			_config[tableName] = keys.join(",");

			table.uri = noDbConfig.uri;
		});


	}

	/**
	 *	### NoDbSchemaFactory
	 *
	 *	Creates unique instances of NoDbSchema based on noDBSchema configuration data.
	 */

	function NoDbSchemaFactory($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector) {
		var noConfig,
			promises = [],
			schemaSourceProviders = {
				"inline": function (key, schemaConfig) {
					return $q.when(schemaConfig.schemaSource.schema);
				},
				"noDBSchema": function (key, schemaConfig) {
					return getRemoteSchema(noConfig)
						.then(function (resp) {
							return resp.data;
						})
						.catch(function (err) {
							throw err;
						});
				},
				"cached": function (key, schemaConfig) {
					var schemaKey = "noDbSchema_" + schemaConfig.schemaSource.sourceDB;

					return $q(function (resolve, reject) {
						$rootScope.$watch(schemaKey, function (newval) {
							if(newval) {
								resolve(newval.tables);
							}
						});

					});
				}
			};

		function getRemoteSchema(config) {
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
				.then(function (resp) {
					return resp;
				})
				.catch(function (resp) {
					throw resp;
				});
		}

		function checkCache(schemaKey) {
			return noLocalStorage.getItem(schemaKey);
		}

		function resolveSchema(schemaKey, schemaConfig) {
			var deferred = $q.defer(),
				schemaProvider = schemaConfig.schemaSource.provider;

			if($rootScope[schemaKey]) {
				deferred.resolve(schemaKey);
			} else {
				$rootScope.$watch(schemaKey, function (newval, oldval) {
					if(newval) {
						noLocalStorage.setItem(schemaKey, newval.tables);
						deferred.resolve(schemaKey);
					}
				});

				schemaSourceProviders[schemaProvider](schemaKey, schemaConfig)
					.then(function (schema) {
						$rootScope[schemaKey] = new NoDbSchema(_, noConfig, schemaConfig, schema);
					})
					.catch(function () {
						var schema = checkCache(schemaKey);
						if(schema) {
							$rootScope[schemaKey] = new NoDbSchema(_, noConfig, schemaConfig, schema);
						} else {
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
		this.whenReady = function (config) {


			var noConfig = config.current,
				noDbSchemaConfig = noConfig.noDbSchema,
				promises = [];

			for(var c in noDbSchemaConfig) {
				var schemaConfig = noDbSchemaConfig[c],
					schemaKey = "noDbSchema_" + schemaConfig.dbName;

				promises.push(resolveSchema(schemaKey, schemaConfig));
			}

			return $q.all(promises)
				.then(function (results) {
					$rootScope.noDbSchema_names = results;
					return results;
				})
				.catch(function (err) {
					throw err;
				});

		};

		this.configureDatabases = function (noUser, noDbSchemaConfigs) {
			var promises = [];

			for(var s in noDbSchemaConfigs) {
				var schemaName = noDbSchemaConfigs[s],
					schema = $rootScope[schemaName],
					provider = $injector.get(schema.config.provider);

				promises.push(provider.configure(noUser, schema));

			}

			return $q.all(promises)
				.then(function (resp) {
					console.log("NoDbSchemaFactory::configureDatabases complete");
				})
				.catch(function (err) {
					console.error(err);
				});

		};

		this.deleteDatabases = function(noDbSchemaConfigs) {
			var promises = [];

			for(var s in noDbSchemaConfigs) {
				var schemaName = noDbSchemaConfigs[s],
					schema = $rootScope[schemaName],
					provider;

				if(schema) {
					provider = $injector.get(schema.config.provider);
					promises.push(provider.destroyDb(schema.config.dbName));
				}
			}

			return $q.all(promises)
				.then(function(resp) {
					console.log("NoDbSchemaFactory::deleteDatabases complete");
				})
				.catch(function (err) {
					console.error(err);
				});
		};

		this.getSchema = function (dbName) {
			var schema = $rootScope["noDbSchema_" + dbName];
			return schema;
		};

		this.create = function (noConfig, noDbConfig, rawDbSchema) {
			return new NoDbSchema(_, noConfig, noDbConfig, rawDbSchema);
		};
	}

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

	.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "$filter", "noLocalStorage", "$injector", function ($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector) {

		return new NoDbSchemaFactory($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector);
	}]);

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

(function (angular, undefined) {
	angular.module("noinfopath.data")
		/*
		 * ## @service noSQLQueryBuilder : INoQueryBuilder `Deprecated`
		 *
		 * ### Overview
		 *
		 * Implements a INoQueryBuilder compatible service that converts NoFilters,
		 * NoSort, NoPage into a WebSQL compatible query string.
		 *
		 */
		.service("noSQLQueryBuilder", ['$filter', function ($filter) {
			var sqlFilters = {
					eq: "==",
					neq: "!=",
					gt: ">",
					gte: ">=",
					lt: "<",
					lte: "<=",
					contains: "CONTAINS",
					doesnotcontain: "NOT CONTAINS",
					"in": "in"
						//endswith: "endswith",
						//startswith: "startswith"
				},
				mappers = {
					pageSize: angular.noop,
					page: angular.noop,
					filter: function (params, filter) {
						if(filter) {
							params.$filter = toSQLFilter(filter);
						}
					},
					data: function (params, filter) {
						mappers.filter(params, filter.filter);
					},
					sort: function (params, orderby) {
						var sorts = angular.forEach(orderby, function (value) {
								var order = value.field.replace(/\./g, "/");

								if(value.dir === "desc") {
									order += " desc";
								}

								return order;
							}),
							expr = sorts ? sorts.join(",") : undefined;

						if(expr) {
							params.$orderby = expr;
						}
					},
					skip: function (params, skip) {
						if(skip) {
							params.$skip = skip;
						}
					},
					take: function (params, take) {
						if(take) {
							params.$top = take;
						}
					}
				};

			function isGuid(val) {
				return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
			}

			function toSQLFilter(filters) {
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



				for(idx = 0, length = filters.length; idx < length; idx++) {
					filter = origFilter = filters[idx];
					field = filter.column;
					value = filter.value;
					operator = filter.operator;
					logic = filter.logic;

					if(filter.filters) {
						filter = toSQLFilter(filter);
					} else {
						ignoreCase = filter.ignoreCase;
						field = field.replace(/\./g, "/");
						filter = sqlFilters[operator];

						if(filter && value !== undefined) {

							if(angular.isString(value)) {
								if(isGuid(value)) {
									format = "guid'{1}'";
								} else {
									format = "'{1}'";
								}

								value = value.replace(/'/g, "''");


								// if (ignoreCase === true) {
								//     field = "tolower(" + field + ")";
								// }

							} else if(angular.isDate(value)) {

								value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
								format = "{1}";

							} else if(angular.isArray(value)) {
								var tmpValue = "";

								for(var i = 0; i < value.length; i++) {
									var valum = value[i];

									tmpValue = tmpValue + "'" + valum + "'";

									if(i + 1 != value.length) {
										tmpValue = tmpValue + ",";
									}
								}

								value = tmpValue;
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

				var SQLFilter = "",
					f;

				do {

				} while (f);

				SQLFilter = SQLFilter.trim();

				return SQLFilter;
			}

			function toSQLSort(sort) {
				var sorts = [],
					expr;

				angular.forEach(sort, function (value) {
					var order = value.column.replace(/\./g, "/");

					if(value.dir === "desc") {
						order += " desc";
					}

					sorts.push(order);
				});

				expr = sorts ? sorts.join(",") : undefined;

				return expr;
			}

			this.makeQuery = function () {
				var query = {};

				for(var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg)) {
						switch(arg.__type) {
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
		}]);
})(angular);

//websql.js
/*
 *	# @module NoInfoPath WebSql
 *
 *	> noinfopath.data @version 0.0.1 #websql
 *
 *	This module provides full CRUD operations, along with the ability to bulk
 *	bulkload data into the WebSql database, and to perform a lookup for a single item,
 *	and the abilty to perform upserts.
 */
(function (angular, undefined) {
	"use strict";

	var
	/*
	 *	## @constant WEBSQL_IDENTIFIERS
	 *
	 *	Exposes a set of JavaScript idetentified that map to WebSQL DDL and DML expressions.
	 */
		WEBSQL_IDENTIFIERS = {
			CREATETABLE: "CREATE TABLE IF NOT EXISTS ",
			CREATEVIEW: "CREATE VIEW IF NOT EXISTS ",
			INSERT: "INSERT INTO ",
			UPDATE: "UPDATE ",
			DELETE: "DELETE FROM ",
			READ: "SELECT * FROM ",
			COLUMNDEF: "{0}",
			PRIMARYKEY: "PRIMARY KEY ASC",
			FOREIGNKEY: "REFERENCES ",
			NULL: "NULL",
			INTEGER: "INTEGER",
			REAL: "REAL",
			TEXT: "TEXT",
			BLOB: "BLOB",
			DATE: "DATE",
			NUMERIC: "NUMERIC",
			WITHOUTROWID: "WITHOUT ROWID"
		},

		/*
		 *	## @constant WEBSQL_STATEMENT_BUILDERS
		 *
		 *	Exposes a setup of helper function that construct safe, WebSQL DDL and DML expressions.
		 */
		WEBSQL_STATEMENT_BUILDERS = {
			sqlConversion: {
				"bigint": WEBSQL_IDENTIFIERS.INTEGER,
				"bit": WEBSQL_IDENTIFIERS.INTEGER,
				"decimal": WEBSQL_IDENTIFIERS.NUMERIC,
				"int": WEBSQL_IDENTIFIERS.INTEGER,
				"money": WEBSQL_IDENTIFIERS.NUMERIC, // CHECK
				"numeric": WEBSQL_IDENTIFIERS.NUMERIC,
				"smallint": WEBSQL_IDENTIFIERS.INTEGER,
				"smallmoney": WEBSQL_IDENTIFIERS.NUMERIC, // CHECK
				"tinyint": WEBSQL_IDENTIFIERS.INTEGER,
				"float": WEBSQL_IDENTIFIERS.REAL,
				"real": WEBSQL_IDENTIFIERS.REAL,
				"date": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"datetime": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"datetime2": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"datetimeoffset": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"smalldatetime": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"time": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"char": WEBSQL_IDENTIFIERS.TEXT,
				"nchar": WEBSQL_IDENTIFIERS.TEXT,
				"varchar": WEBSQL_IDENTIFIERS.TEXT,
				"nvarchar": WEBSQL_IDENTIFIERS.TEXT,
				"text": WEBSQL_IDENTIFIERS.TEXT,
				"ntext": WEBSQL_IDENTIFIERS.TEXT,
				"binary": WEBSQL_IDENTIFIERS.BLOB, // CHECK
				"varbinary": WEBSQL_IDENTIFIERS.BLOB,
				"image": WEBSQL_IDENTIFIERS.BLOB,
				"uniqueidentifier": WEBSQL_IDENTIFIERS.TEXT
			},
			toSqlLiteConversionFunctions: {
				"TEXT": function (s) {
					return angular.isString(s) ? s : null;
				},
				"BLOB": function (b) {
					return b;
				},
				"INTEGER": function (i) {
					if(typeof i === "boolean") // typeof null is object, thanks javascript!
						return i ? 1 : 0; // converts true to 1 and false to 0
					else
						return angular.isNumber(i) ? i : null;
				},
				"NUMERIC": function (n) {
					var c = n === null ? null : Number(n);
					return c;
				},
				"REAL": function (r) {
					return r;
				},
				"DATE": function (d) {
					var r = null;
					if(!!d) {
						r = noInfoPath.toDbDate(new Date(d));
					}

					return r;
				}
			},
			fromSqlLiteConversionFunctions: {
				"bigint": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"bit": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"decimal": function (n) {
					return angular.isNumber(n) ? n : null;
				},
				"int": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"money": function (n) {
					return angular.isNumber(n) ? n : null;
				},
				"numeric": function (n) {
					return angular.isNumber(n) ? n : null;
				},
				"smallint": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"smallmoney": function (n) {
					return angular.isNumber(n) ? n : null;
				},
				"tinyint": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"float": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"real": function (i) {
					return angular.isNumber(i) ? i : null;
				},
				"date": function (n) {
					return angular.isDate(n) ? noInfoPath.toDbDate(n) : null;
				},
				"datetime": function (n) {
					return angular.isDate(n) ? noInfoPath.toDbDate(n) : null;
				},
				"datetime2": function (n) {
					return angular.isDate(n) ? noInfoPath.toDbDate(n) : null;
				},
				"datetimeoffset": function (n) {
					return angular.isDate(n) ? noInfoPath.toDbDate(n) : null;
				},
				"smalldatetime": function (n) {
					return angular.isDate(n) ? noInfoPath.toDbDate(n) : null;
				},
				"time": function (n) {
					return angular.isDate(n) ? noInfoPath.toDbDate(n) : null;
				},
				"char": function (t) {
					return angular.isString(t) ? t : null;
				},
				"nchar": function (t) {
					return angular.isString(t) ? t : null;
				},
				"varchar": function (t) {
					return angular.isString(t) ? t : null;
				},
				"nvarchar": function (t) {
					return angular.isString(t) ? t : null;
				},
				"text": function (t) {
					return angular.isString(t) ? t : null;
				},
				"ntext": function (t) {
					return angular.isString(t) ? t : null;
				},
				"binary": function (i) {
					return !angular.isNumber(i) ? i : null;
				},
				"varbinary": function (i) {
					return !angular.isNumber(i) ? i : null;
				},
				"image": function (i) {
					return !angular.isNumber(i) ? i : null;
				},
				"uniqueidentifier": function (t) {
					return angular.isString(t) ? t : null;
				}
			},
			"createTable": function (tableName, tableConfig) {
				var rs = WEBSQL_IDENTIFIERS.CREATETABLE;

				rs += tableName + " (" + WEBSQL_STATEMENT_BUILDERS.columnConstraints(tableConfig) + ")";

				return rs;
			},
			"createView": function (viewName, viewConfig) {
				var rs = viewConfig.entitySQL.replace("CREATE VIEW ", WEBSQL_IDENTIFIERS.CREATEVIEW);

				return rs;
			},
			"columnDef": function (columnName, columnConfig, tableConfig) {
				return columnName + " " + WEBSQL_STATEMENT_BUILDERS.typeName(columnConfig) + WEBSQL_STATEMENT_BUILDERS.columnConstraint(columnName, columnConfig, tableConfig);
			},
			"columnConstraint": function (columnName, columnConfig, tableConfig) {
				var isPrimaryKey = WEBSQL_STATEMENT_BUILDERS.isPrimaryKey(columnName, tableConfig),
					isForeignKey = WEBSQL_STATEMENT_BUILDERS.isForeignKey(columnName, tableConfig),
					isNullable = WEBSQL_STATEMENT_BUILDERS.isNullable(columnConfig),
					returnString = "";

				returnString += WEBSQL_STATEMENT_BUILDERS.primaryKeyClause(isPrimaryKey && (!isForeignKey && !isNullable)); // A PK cannot be a FK or nullable.
				returnString += WEBSQL_STATEMENT_BUILDERS.foreignKeyClause((isForeignKey && !isPrimaryKey), columnName, tableConfig.foreignKeys); // A FK cannot be a PK
				returnString += WEBSQL_STATEMENT_BUILDERS.nullableClause(isNullable && !isPrimaryKey); // A nullable field cannot be a PK

				return returnString;
			},
			"typeName": function (columnConfig) {
				return WEBSQL_STATEMENT_BUILDERS.sqlConversion[columnConfig.type.toLowerCase()];
			},
			"expr": function (Expr) {
				console.warn("TODO: Determine why this function exists.");
				return "";
			},
			"foreignKeyClause": function (isForeignKey, columnName, foreignKeys) {
				var rs = "";
				if(isForeignKey) {
					rs = " " + WEBSQL_IDENTIFIERS.FOREIGNKEY + foreignKeys[columnName].table + " (" + foreignKeys[columnName].column + ")";
				}
				return rs;
			},
			"primaryKeyClause": function (isPrimaryKey) {
				var rs = "";
				if(isPrimaryKey) {
					rs = " " + WEBSQL_IDENTIFIERS.PRIMARYKEY;
				}
				return rs;
			},
			"nullableClause": function (isNullable) {
				var rs = "";
				if(isNullable) {
					rs = " " + WEBSQL_IDENTIFIERS.NULL;
				}
				return rs;
			},
			"columnConstraints": function (tableConfig) {
				var colConst = [];
				angular.forEach(tableConfig.columns, function (value, key) {
					colConst.push(WEBSQL_STATEMENT_BUILDERS.columnDef(key, value, tableConfig));
				}, this);
				return colConst.join(",");
			},
			"isPrimaryKey": function (columnName, tableConfig) {
				var temp = false;

				for(var x in tableConfig.primaryKey) {
					if(columnName === tableConfig.primaryKey[x]) {
						temp = true;
						break;
					}
				}
				return temp;
			},
			"isForeignKey": function (columnName, tableConfig) {
				return !!tableConfig.foreignKeys[columnName];
			},
			"isNullable": function (columnConfig) {
				return columnConfig.nullable;
			},
			"sqlInsert": function (tableName, data) {
				var columnString = "",
					placeholdersString = "",
					returnObject = {},
					val = {};

				val = WEBSQL_STATEMENT_BUILDERS.parseData(data);

				columnString = val.columns.join(",");
				placeholdersString = val.placeholders.join(",");

				returnObject.queryString = WEBSQL_IDENTIFIERS.INSERT + tableName + " (" + columnString + ") VALUES (" + placeholdersString + ");";
				returnObject.valueArray = val.values;

				return returnObject;
			},
			"sqlUpdate": function (tableName, data, filters) {
				var val = {},
					nvps = [],
					nvpsString = "",
					returnObject = {},
					safeFilter = filters.toSafeSQL();

				//console.log(safeFilter);

				val = WEBSQL_STATEMENT_BUILDERS.parseData(data);

				nvps = WEBSQL_STATEMENT_BUILDERS.sqlUpdateNameValuePair(val);

				nvpsString = nvps.join(", ");


				returnObject.queryString = WEBSQL_IDENTIFIERS.UPDATE + tableName + " SET " + nvpsString + " WHERE " + safeFilter.queryString;
				returnObject.valueArray = val.values.concat(safeFilter.valueArray);

				return returnObject;
			},
			"sqlUpdateNameValuePair": function (values) {
				var nvps = [];

				angular.forEach(values.columns, function (col, key) {
					nvps.push(col + " = ?");
				});

				return nvps;
			},
			"sqlDelete": function (tableName, filters) {
				var val = {},
					nvps = [],
					nvpsString = "",
					returnObject = {},
					safeFilter = filters ? filters.toSafeSQL() : (new noInfoPath.data.NoFilters())
					.toSafeSQL(),
					where;

				nvps = WEBSQL_STATEMENT_BUILDERS.sqlUpdateNameValuePair(safeFilter.valueArray);

				nvpsString = nvps.join(", ");

				//console.log(safeFilter, nvps, nvpsString);

				// var returnObject = {},
				// 	safeSql = filters.toSaveSQL(),
				where = safeFilter.queryString ? " WHERE " + safeFilter.queryString : "";

				returnObject.queryString = WEBSQL_IDENTIFIERS.DELETE + tableName + where;
				returnObject.valueArray = safeFilter.valueArray;
				return returnObject;
			},
			"sqlRead": function (tableName, filters, sort, page) {
				var fs, ss, ps, returnObject = {},
					safeFilter = filters ? filters.toSafeSQL() : undefined;
				fs = !!filters ? " WHERE " + safeFilter.queryString : "";
				ss = !!sort ? " " + sort.toSQL() : "";
				ps = !!page ? " " + page.toSQL() : "";
				returnObject.queryString = WEBSQL_IDENTIFIERS.READ + tableName + fs + ss + ps;
				returnObject.valueArray = safeFilter ? safeFilter.valueArray : [];
				return returnObject;
			},
			"sqlOne": function (tableName, primKey, value) {
				var returnObject = {};
				console.warn("TODO: Need to detect if the value is a string or number");

				returnObject.queryString = WEBSQL_IDENTIFIERS.READ + tableName + " WHERE " + primKey + " = '" + value + "'";
				return returnObject;
			},
			"parseData": function (data) {

				var values = [],
					placeholders = [],
					columns = [],
					r = {};

				angular.forEach(data, function (value, key) {
					//var datum = value === "undefined" || value === undefined ? "" : value;

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

	/*
	 *	### @class NoWebSqlStatementFactory
	 *
	 *	This class is an injecton container that uses WEBSQL_IDENTIFIERS, and
	 *	WEBSQL_STATEMENT_BUILDERS to construct the various SQL statements
	 *	required to create and use a WebSQL database.
	 *
	 */
	function NoWebSqlStatementFactory(WEBSQL_IDENTIFIERS, WEBSQL_STATEMENT_BUILDERS) {

		this.createSqlTableStmt = function (tableName, tableConfig) {
			return WEBSQL_STATEMENT_BUILDERS.createTable(tableName, tableConfig);
		};

		this.createSqlViewStmt = function (tableName, viewSql) {
			return WEBSQL_STATEMENT_BUILDERS.createView(tableName, viewSql);
		};

		this.createSqlInsertStmt = function (tableName, data) {
			return WEBSQL_STATEMENT_BUILDERS.sqlInsert(tableName, data);
		};

		this.createSqlUpdateStmt = function (tableName, data, filters) {
			return WEBSQL_STATEMENT_BUILDERS.sqlUpdate(tableName, data, filters);
		};

		this.createSqlDeleteStmt = function (tableName, filters) {
			return WEBSQL_STATEMENT_BUILDERS.sqlDelete(tableName, filters);
		};

		this.createSqlReadStmt = function (tableName, filters, sort, page) {
			return WEBSQL_STATEMENT_BUILDERS.sqlRead(tableName, filters, sort, page);
		};

		//console.warn("This method does not ever get used.");
		this.createSqlOneStmt = function (tableName, primKey, value) {
			return WEBSQL_STATEMENT_BUILDERS.sqlOne(tableName, primKey, value);
		};

		this.createSqlClearStmt = function (tableName) {
			return WEBSQL_STATEMENT_BUILDERS.sqlDelete(tableName);
		};

		this.convertToWebSQL = function (sqlColumn, sqlData) {
			var sqliteColumn = WEBSQL_STATEMENT_BUILDERS.sqlConversion[sqlColumn.toLowerCase()];

			return WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions[sqliteColumn](sqlData);
		};

	}

	/**
	 *	### @class NoWebSqlEntity
	 *
	 *	This class encapulates the CRUD functionality for NoInfoPath's implementation
	 *	of WebSQL. It abstracts the fundimental differences between SQL Views and Tables.
	 *	Exceptions will be thrown when a method is called that a SQL View connot supported.
	 */
	function NoWebSqlEntity($rootScope, $q, $timeout, _, noWebSQLStatementFactory, entityConfig, entityName, database, noDbSchema) {
		var THIS = this,
			_entityConfig, _entityName, _db,
			SQLOPS = {};

		if(!entityConfig) throw "entityConfig is a required parameter";
		if(!entityName) throw "entityName is a required parameter";
		if(!database) throw "database is a required parameter";

		_entityConfig = entityConfig;
		_entityName = _entityConfig.entityName;
		_db = database;

		var _schema = noDbSchema.getSchema(database);
		_entityConfig.parentSchema = _schema ? _schema : {};

		Object.defineProperties(this, {
			"__type": {
				"get": function () {
					return "INoCRUD";
				},
			},
			"primaryKey": {
				"get": function () {
					return _entityConfig.primaryKey;
				}
			},
			"entityName": {
				"get": function () {
					return _entityName;
				}
			},
			"noInfoPath": {
				"get": function () {
					return _entityConfig;
				}
			}
		});

		/**
		 *   Data is scrubed for undesirable data artifacts such as `undefined`.
		 */
		function scrubData(data) {
			var scrubbed = {},
				ignore = ["ModifiedBy", "ModifiedDate", "CreatedBy", "DateCreated"];

			for(var ck in _entityConfig.columns) {
				var col = _entityConfig.columns[ck],
					val = data[ck];

				if(_.indexOf(ignore, ck) === -1) {
					//scrub undefined.
					val = val === "undefined" || val === undefined ? null : val;

					//perform data conversion
					val = noWebSQLStatementFactory.convertToWebSQL(col.type, data[ck]);

					//clean up NaN's
					val = isNaN(val) && typeof val === "number" ? null : val;

					scrubbed[col.columnName] = val;
				}
			}

			return scrubbed;
		}

		/*-
		 * ### @method private \_exec(sqlExpressionData)
		 *
		 * #### Parameters
		 *
		 * |Name|Type|Description|
		 * |----|----|-----------|
		 * |sqlExpressionData|Object|An object with two properties, queryString and valueArray. queryString is the SQL statement that will be executed, and the valueArray is the array of values for the replacement variables within the queryString.|
		 */
		function _exec(sqlExpressionData) {
			var
				deferred = $q.defer(),
				valueArray = sqlExpressionData.valueArray ? sqlExpressionData.valueArray : [];

			_db.transaction(function (tx) {
				tx.executeSql(
					sqlExpressionData.queryString,
					valueArray,
					function (t, resultset) {
						deferred.resolve(resultset);
						$rootScope.$digest();
					},
					function (t, r, x) {
						deferred.reject({
							entity: _entityConfig,
							error: r.message,
							sql: sqlExpressionData
						});
						$rootScope.$digest();
					}
				);
			});

			return deferred.promise;
		}

		/*-
		 * ### \_getOne(rowid)
		 *
		 * #### Parameters
		 *
		 * |Name|Type|Description|
		 * |----|----|-----------|
		 * |filters|NoFilters||
		 *
		 * #### Remarks
		 *
		 */
		function _getTotal(noFilter) {
			return $q(function (resolve, reject) {
				var
					safeFilter = noFilter ? noFilter.toSafeSQL() : false,
					filterExpression = safeFilter ? " WHERE " + safeFilter.queryString : "",
					sqlExpressionData = {
						"queryString": "SELECT COUNT() AS total FROM " + _entityName + filterExpression,
						"valueArray": safeFilter.valueArray
					};

				_exec(sqlExpressionData)
					.then(function (resultset) {
						if(resultset.rows.length === 0) {
							resolve(0);
						} else {
							resolve(resultset.rows[0].total);
						}
					})
					.catch(function (err) {
						console.error(err);
					});
			});
		}

		function _getOne(filters) {
			var sqlExpressionData = noWebSQLStatementFactory.createSqlReadStmt(_entityName, filters);

			return _exec(sqlExpressionData)
				.then(function (resultset) {
					var data;

					if(resultset.rows.length === 0) {
						data = {};
					} else {
						data = resultset.rows[0];
					}

					return data;
				});
		}

		function _recordTransaction(resolve, tableName, operation, trans, result1, result2) {
			var transData = result2 && result2.rows.length ? result2 : result1;

			if(trans) trans.addChange(tableName, transData, operation);
			resolve(transData);

		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		function _txFailure(recject, err) {
			recject(err);
		}

		function _txSuccess(data) {
			//console.log("Tx Success", data);
		}

		/*
		 * ### @method configure()
		 *
		 * Creates the WebSQL Entity based on the configuration data and the database passed in
		 * during the construction of the NoWebSqlEntity object.
		 *
		 *	This method returns an Angular Promise.
		 */
		this.configure = function () {

			var
				stmts = {
					"T": WEBSQL_STATEMENT_BUILDERS.createTable,
					"V": WEBSQL_STATEMENT_BUILDERS.createView
				},
				deferred = $q.defer();

			_db.transaction(function (tx) {
				tx.executeSql(stmts[_entityConfig.entityType](_entityConfig.entityName, _entityConfig), [],
					function (t, r) {
						deferred.resolve();
						$rootScope.$digest();
					},
					function (t, e) {
						deferred.reject({
							entity: _entityConfig,
							error: e
						});

						$rootScope.$digest();
					});
			});

			return deferred.promise;
		};

		/*
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
		 *
		 *	#### Remarks
		 */
		this.noCreate = function (data, noTransaction) {

			if(_entityConfig.entityType === "V") throw "Create operation not supported by SQL Views.";

			/*
			 *	When resolving the primary key for the purpose of createing a new record, it is
			 *	required that a primary key exist on the given table. Once discovered, if the
			 *	value already exists that value will be used as the primary value. If the key
			 *	value is undefined that a new UUID is created.
			 *
			 *	> NOTE: Bug #00001
			 *	> There is a bug with current implementation that does not take into account
			 *	> the case when the primary key is a compond key. In the current implementation
			 *	> this results in the primary key resolving to `Undefined`.
			 */

			console.warn("TODO: See readme note `Bug #00001`");

			var
				pk = angular.isArray(_entityConfig.primaryKey) ?
				_entityConfig.primaryKey.length > 1 ? undefined :
				_entityConfig.primaryKey[0] : _entityConfig.primaryKey,
				sqlStmt, scrubbed;

			if(pk && !data[pk]) {
				data[_entityConfig.primaryKey] = noInfoPath.createUUID();
			}

			if(noTransaction) {
				data = scrubData(data);

				/*
				 *
				 *	When creating a new record in the WebSQL DB all tables are expected to have
				 *	the `tracking columns`: CreatedBy, DateCreated, ModifiedBy, ModifiedDate.
				 *	The values for these column are automatically added to the new data being
				 *	added to the DB.
				 */
				data.CreatedBy = _db.currentUser.userId;
				data.DateCreated = noInfoPath.toDbDate(new Date());
				data.ModifiedBy = _db.currentUser.userId;
				data.ModifiedDate = noInfoPath.toDbDate(new Date());
			}

			sqlStmt = noWebSQLStatementFactory.createSqlInsertStmt(_entityName, data);

			return $q(function (resolve, reject) {
				_exec(sqlStmt)
					.then(function (result) {
						return THIS.noOne(result.insertId)
							.then(_recordTransaction.bind(null, resolve, _entityName, "C", noTransaction))
							.catch(_transactionFault.bind(null, reject));
					})
					.catch(reject);
			});
		};

		/*
		 * ### noRead([NoFilters, NoSort, NoPage])
		 *
		 * Reads records from the websql database filtering, sorting and paging
		 * as required by the provied parameters.
		 *
		 * #### Parameters
		 *
		 *	> NOTE: All parameters are optional and may be provided in any order, as long as,
		 *	> they are of one of the known NoInfoPath query classes: NoFilters,
		 *	> NoSort, and NoPage
		 *
		 * |Name|Type|Description|
		 * |----|----|-----------|
		 * |NoFilters|Object|(Optional) A noInfoPath NoFilters Array|
		 * |NoSort|Object|(Optional) A noInfoPath NoSort Object|
		 * |NoPage|Object|(Optional) A noInfoPath NoPage Object|
		 */
		function noRead_old() {

			var filters, sort, page, readObject;

			for(var ai in arguments) {
				var arg = arguments[ai];

				//success and error must always be first, then
				if(angular.isObject(arg)) {
					switch(arg.__type) {
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

			readObject = noWebSQLStatementFactory.createSqlReadStmt(_entityName, filters, sort, page);

			return $q(function (resolve, reject) {
				var resp;

				_exec(readObject)
					.then(function (resultset) {
						resp = new noInfoPath.data.NoResults(_.toArray(resultset.rows));
						if(page) {
							_getTotal(filters)
								.then(function (total) {
									resp.total = total;
									resp.page(page);
									resolve(resp);
								})
								.catch(reject);
						} else {
							resolve(resp);
						}
					})
					.catch(reject);
			});
		}

		function NoRead_new() {

			var table = this,
				filters, sort, page, readObject,
				follow = true,
				aliases = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.tableAliases ? table.noInfoPath.parentSchema.config.tableAliases : {},
				exclusions = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.followExceptions ? table.noInfoPath.parentSchema.config.followExceptions : [];

			function _followRelations(follow, arrayOfThings) {
				var promises = {},
					columns = table.noInfoPath.foreignKeys,
					promiseKeys = {};

				if(follow) {
					for(var c in columns) {
						var col = columns[c],
							keys = _.pluck(arrayOfThings.rows, col.column),
							o = {
								col: col,
								keys: keys
							};

						if(promiseKeys[col.refTable]) {
							promiseKeys[col.refTable].keys = promiseKeys[col.refTable].keys.concat(o.keys);
						} else {
							promiseKeys[col.refTable] = o;
						}
					}

					for(var pk in promiseKeys) {
						var obj = promiseKeys[pk];

						promises[pk] = _expand(obj.col, obj.keys);
					}

					return _.size(promises) > 0 ?
						$q.all(promises)
						.then(_finished_following_fk.bind(table, columns, arrayOfThings))
						.catch(_fault) :
						$q.when(arrayOfThings);
				} else {
					return $q.when(arrayOfThings);
				}
			}

			function _expand(col, keys) {
				var theDb = col.refDatabaseName ? THIS.getDatabase(col.refDatabaseName) : _db,
					filters = new noInfoPath.data.NoFilters(),
					ft = theDb[col.refTable];

				if(!ft) {
					ft = theDb[aliases[col.refTable]];
				}

				if(!ft) throw "Invalid refTable " + aliases[col.refTable];

				if(exclusions.indexOf(col.column) > -1) {
					return $q.when(new noInfoPath.data.NoResults());
				}

				if(!keys) {
					throw {
						error: "Invalid key value",
						col: col,
						item: item
					};
				}

				filters.quickAdd(col.refColumn, "in", keys);

				if(keys.length > 0) {
					return ft.noRead(filters)
						.catch(_expand_fault.bind(table, col, keys, filters));
				} else {
					return $q.when(new noInfoPath.data.NoResults());
				}
			}

			function _expand_fault(col, keys, filters, err) {
				console.err({
					error: err,
					column: col,
					keys: keys,
					filters: filters
				});
				return err;
			}

			function _finished_following_fk(columns, arrayOfThings, refData) {
				var returnArray = _.toArray(arrayOfThings.rows);
				for(var i = 0; i < returnArray.length; i++) {
					var item = returnArray[i];

					for(var c in columns) {
						var col = columns[c],
							key = item[col.column],
							refTable = refData[col.refTable].paged,
							filter = {},
							refItem;

						filter[col.refColumn] = key;

						refItem = _.find(refTable, filter);

						item[col.refTable + col.column] = refItem || key;
					}
				}

				return returnArray;
			}

			function _fault(ctx, reject, err) {
				console.error(err);
			}

			function _page(page, arrayOfThings) {
				var ctx = this;

				return $q(function (resolve, reject) {
					var resp = new noInfoPath.data.NoResults(arrayOfThings.rows ? _.toArray(arrayOfThings.rows) : arrayOfThings);

					if(page) {
						_getTotal(ctx.filters)
							.then(function (total) {
								resp.total = total;
								resp.page(page);
								resolve(resp);
							})
							.catch(reject);
					} else {
						resolve(resp);
					}
				});
			}

			for(var ai in arguments) {
				var arg = arguments[ai];

				//success and error must always be first, then
				if(angular.isObject(arg) || typeof (arg) === "boolean") {
					switch(arg.__type) {
						case "NoFilters":
							filters = arg;
							break;
						case "NoSort":
							sort = arg;
							break;
						case "NoPage":
							page = arg;
							break;
						default:
							if(typeof (arg) === "boolean") {
								follow = arg;
							}
					}
				}
			}

			readObject = noWebSQLStatementFactory.createSqlReadStmt(_entityName, filters, sort, page);

			var _filter = _exec;

			var ctx = {
				table: table,
				filters: filters,
				page: page,
				sort: sort,
				readObject: readObject
			};

			return $q(function (resolve, reject) {
				var resp;

				_filter(readObject)
					.then(_followRelations.bind(ctx, follow))
					.then(_page.bind(ctx, page))
					.then(resolve)
					.catch(reject);
			});
		}


		this.noRead = NoRead_new;

		/*
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
		 *
		 *	Returns an AngularJS Promise.
		 */
		this.noUpdate = function (data, noTransaction) {
			if(_entityConfig.entityType === "V") throw "Update operation not supported by SQL Views.";

			/*
			 *	When resolving the primary key of the object to update
			 *	the id value must exist. If it does not an exception is thrown.
			 */
			var noFilters = new noInfoPath.data.NoFilters(),
				id = data[_entityConfig.primaryKey],
				sqlStmt, scrubbed;

			if(!id) throw "Primary key value must exist an object being updated.";

			noFilters.quickAdd(_entityConfig.primaryKey, "eq", id);

			if(noTransaction) {

				data = scrubData(data);

				/*
				 *	When updating a record in the WebSQL DB all tables are expected to have
				 *	the `tracking columns`: ModifiedBy, ModifiedDate.
				 *	The values for these column are automatically set on the object
				 *	being updated in the DB.
				 */
				data.ModifiedBy = _db.currentUser.userId;
				data.ModifiedDate = noInfoPath.toDbDate(new Date());
			}

			sqlStmt = noWebSQLStatementFactory.createSqlUpdateStmt(_entityName, data, noFilters);

			return $q(function (resolve, reject) {
				_exec(sqlStmt)
					.then(function (id, result) {
						return THIS.noOne(id)
							.then(_recordTransaction.bind(null, resolve, _entityName, "U", noTransaction))
							.catch(_transactionFault.bind(null, reject));
					}.bind(null, id))
					.catch(reject);

			});
		};

		/*
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
		this.noDestroy = function (data, noTransaction, filters) {

			if(_entityConfig.entityType === "V") throw "Delete operation not supported by SQL Views.";

			var
				noFilters = noInfoPath.resolveID(filters ? filters : data, _entityConfig),
				id = data ? data[_entityConfig.primaryKey] : false,
				sqlStmt, deleted;

			sqlStmt = noWebSQLStatementFactory.createSqlDeleteStmt(_entityName, noFilters);

			return $q(function (resolve, reject) {
				if(noTransaction) {
					_getOne(noFilters)
						.then(function (datum) {
							_exec(sqlStmt)
								.then(_recordTransaction.bind(null, resolve, _entityName, "D", noTransaction, datum))
								.catch(reject);
						})
						.catch(reject);
				} else {
					_exec(sqlStmt)
						.then(resolve)
						.catch(reject);
				}

			});


		};

		/*
		 * ### @method noOne(data)
		 *
		 * Reads exactly one record from the websql database based on the filter derived the data provided.
		 *
		 * > NOTE: Returns single object, not an array of objects. When more than one result is found it returns
		 * > the first item in the array of results.  If none are found, returns an single empty object.
		 *
		 * #### Parameters
		 *
		 *	##### @parameter `query`
		 *
		 *	The `query` parameter can be a Number, String or Object. When it
		 *	is as Number the it is a WebSQL `RowId`. When a String the value
		 *	is expectd to be the guid that is the primary key for the given
		 *	entity.  When an object, and is of the NoFilters class it is treated
		 *	as such. When not, then it expected to be a special object.
		 *
		 *	*Expected Types*
		 *	- Number
		 *	- String
		 *	- Object
		 *
		 * #### Remarks
		 *
		 * > NOTE: noinfopath-data only support primary keys that are strings. This
		 * > is because we are expecting GUID or UUID as primary key, as the are
		 * > inherently replicatable.
		 *
		 */
		this.noOne = function (query) {
			/**
			 *	When 'query' is an object then check to see if it is a
			 *	NoFilters object.  If not, add a filter to the intrinsic filters object
			 *	based on the query's key property, and the query's value.
			 */
			var filters = noInfoPath.resolveID(query, _entityConfig);

			//Internal _getOne requires and NoFilters object.
			//return _getOne(filters);
			return this.noRead(filters)
				.then(function (resultset) {
					var data;

					if(resultset.length === 0) {
						throw "noWebSQL::noOne: Record Not Found";
					} else {
						data = resultset[0];
					}

					return data;
				});
		};

		/*
		 *	### @method noUpsert(data)
		 */
		this.noUpsert = function (data, noTransaction) {
			if(_entityConfig.entityType === "V") throw "Upsert operation not supported by SQL Views.";

			if(data[this.primaryKey]) {
				return this.noUpdate(data, noTransaction);
			} else {
				return this.noCreate(data, noTransaction);
			}
		};

		/*
		 * ### @method noClear()
		 *
		 * Delete all rows from the current table, without recording each delete transaction.
		 *
		 * #### Returns
		 * AngularJS Promise.
		 */
		this.noClear = function () {
			if(_entityConfig.entityType === "V") throw "Clear operation not supported by SQL Views.";

			var sqlStmt = noWebSQLStatementFactory.createSqlClearStmt(_entityName);

			return $q(function (resolve, reject) {
				_exec(sqlStmt)
					.then(resolve)
					.catch(reject);
			});

		};

		/*
		 *	### @method noBulkCreate(data)
		 *
		 *	Inserts object in to the WebSQL database, converting data from
		 *	ANSI SQL to WebSQL.  No transactions are recorded during this operation.
		 */
		this.noBulkCreate = function (data) {
			if(_entityConfig.entityType === "V") throw "BulkCreate operation not supported by SQL Views.";

			for(var c in _entityConfig.columns) {
				var col = _entityConfig.columns[c];
				data[c] = noWebSQLStatementFactory.convertToWebSQL(col.type, data[c]);
			}

			var sqlStmt = noWebSQLStatementFactory.createSqlInsertStmt(_entityName, data, null);

			return $q(function (resolve, reject) {
				_exec(sqlStmt)
					.then(resolve)
					.catch(reject);
			});





		};

		/*
		 *	### @method bulkload(data, progress)
		 *
		 *	Returns an AngularJS Promise.  Takes advantage of
		 *	Promise.notify to report project of the bulkLoad operation.
		 */
		this.bulkLoad = function (data, progress) {
			if(entityConfig.entityType === "V") throw "BulkLoad operation not supported by SQL Views.";

			var deferred = $q.defer(),
				table = this;
			//var table = this;
			function _import(data, progress) {
				var total = data ? data.length : 0;

				$timeout(function () {
					//progress.rows.start({max: total});
					deferred.notify(progress);
				});

				var currentItem = 0;

				//_dexie.transaction('rw', table, function (){
				_next();
				//});

				function _next() {
					if(currentItem < data.length) {
						var datum = data[currentItem];

						table.noBulkCreate(datum)
							.then(function (data) {
								//progress.updateRow(progress.rows);
								deferred.notify(data);
							})
							.catch(function () {
								deferred.reject({
									entity: table,
									error: arguments
								});
							})
							.finally(function () {
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
				.then(function () {
					_import(data, progress);
				}.bind(this));

			return deferred.promise;
		};

		SQLOPS.I = this.noCreate;
		SQLOPS.U = this.noUpdate;
		SQLOPS.D = this.noDestroy;

		this.noImport = function (noChange) {
			function checkForExisting() {
				var id = noChange.changedPKID;

				return THIS.noOne(id);
			}

			function isSame(data, changes) {
				var
					localDate = new Date(data.ModifiedDate),
					remoteDate = new Date(changes.ModifiedDate),
					same = moment(localDate)
					.isSame(remoteDate, 'second');

				console.log(localDate, remoteDate, same);

				return same;
			}

			function save(changes, data, resolve, reject) {
				var ops = {
					"I": THIS.noCreate,
					"U": THIS.noUpdate
				};
				//console.log(data, changes);
				if(isSame(data, changes.values)) {
					console.warn("not updating local data because the ModifiedDate is the same or newer than the data being synced.");
					changes.isSame = true;
					resolve(changes);
				} else {
					ops[changes.operation](changes.values)
						.then(resolve)
						.catch(reject);
				}
			}



			return $q(function (resolve, reject) {

				function ok(data) {
					console.log(data);
					resolve(data);
				}

				function fault(err) {
					console.error(err);
					reject(err);
				}

				checkForExisting()
					.then(function (data) {

						switch(noChange.operation) {
							case "D":

								THIS.noDestroy(noChange.changedPKID)
									.then(ok)
									.catch(fault);
								break;

							case "I":
							case "U":
								save(noChange, data, ok, fault);
								break;
						}
					});



			});
		};

	}

	/*
	 *	## @class NoWebSqlEntityFactory
	 *
	 *	Creates instances of the NoWebSqlEntity class, providing an Entity
	 *	configuration object, name of the entity, and a reference to the database.
	 *
	 *
	 */
	function NoWebSqlEntityFactory($rootScope, $q, $timeout, _, noWebSqlStatementFactory, noDbSchema) {
		/*
		 *	### @method create(entityConfig, entityName, database)
		 *
		 *	Returns a new instance of the NoWebSqlEntity object configured with the
		 *	supplied Entity Configuration and Database.
		 *
		 */
		this.create = function (entityConfig, entityName, database) {
			var entity = new NoWebSqlEntity($rootScope, $q, $timeout, _, noWebSqlStatementFactory, entityConfig, entityName, database, noDbSchema);
			return entity;
		};
	}

	/*
	 *	## @class NoWebSqlService
	 */
	function NoWebSqlService($rootScope, _, $q, $timeout, noWebSqlEntityFactory, noLogService, noLoginService, noLocalStorage, noWebSQLParser) {
		var _name;

		Object.defineProperties(this, {
			"isInitialized": {
				"get": function () {
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		//TODO: modify config to also contain Views, as well as, Tables.
		this.configure = function (noUser, schema) {
			if(!noUser || noUser.constructor.name !== "NoInfoPathUser") throw "noWebSql::configure requires the first parameter to be a NoInfoPathUser object.";
			if(!schema || schema.constructor.name !== "NoDbSchema") throw "noWebSql::configure requires the second parameter to be a NoDbSchema object.";

			var _webSQL = null,
				promises = [],
				noWebSQLInitialized = "noWebSQL_" + schema.config.dbName;

			_webSQL = openDatabase(schema.config.dbName, schema.config.version, schema.config.description, schema.config.size);

			_webSQL.currentUser = noUser;
			_webSQL.name = schema.config.dbName;

			angular.forEach(schema.tables, function (table, name) {

				var
					db = this,
					t = noWebSqlEntityFactory.create(table, name, db);

				table.parentSchema = schema;
				//t.noInfoPath = table;
				t.provider = _webSQL;
				db[name] = t;
				promises.push(t.configure());
			}, _webSQL);

			return $q.all(promises)
				.then(function () {
					$rootScope[noWebSQLInitialized] = _webSQL;
					return _webSQL;
				})
				.catch(function (err) {
					console.error(err);
				});
		};

		this.whenReady = function () {
			return $q(function (resolve, reject) {
				var noWebSQLInitialized = "noWebSQL_" + config.dbName;

				if($rootScope[noWebSQLInitialized]) {
					resolve();
				} else {
					$rootScope.$watch(noWebSQLInitialized, function (newval, oldval, scope) {
						if(newval) {
							resolve();
						}
					});
				}
			});
		};

		this.getDatabase = function (databaseName) {
			return $rootScope["noWebSQL_" + databaseName];
		};

	}

	angular.module("noinfopath.data")
		.constant("WEBSQL_IDENTIFIERS", WEBSQL_IDENTIFIERS)

	.constant("WEBSQL_STATEMENT_BUILDERS", WEBSQL_STATEMENT_BUILDERS)

	.factory("noWebSqlStatementFactory", ["WEBSQL_IDENTIFIERS", "WEBSQL_STATEMENT_BUILDERS", function (WEBSQL_IDENTIFIERS, WEBSQL_STATEMENT_BUILDERS) {
		return new NoWebSqlStatementFactory(WEBSQL_IDENTIFIERS, WEBSQL_STATEMENT_BUILDERS);
	}])

	.factory("noWebSqlEntityFactory", ["$rootScope", "$q", "$timeout", "lodash", "noWebSqlStatementFactory", "noDbSchema", function ($rootScope, $q, $timeout, lodash, noWebSqlStatementFactory, noDbSchema) {
		return new NoWebSqlEntityFactory($rootScope, $q, $timeout, lodash, noWebSqlStatementFactory, noDbSchema);
	}])

	.factory("noWebSql", ["$rootScope", "lodash", "$q", "$timeout", "noWebSqlEntityFactory", "noLocalStorage", "noWebSqlStatementFactory", "noDbSchema", function ($rootScope, _, $q, $timeout, noWebSqlEntityFactory, noLocalStorage, noWebSqlStatementFactory, noDbSchema) {
		return new NoWebSqlService($rootScope, _, $q, $timeout, noWebSqlEntityFactory, noLocalStorage, noWebSqlStatementFactory, noDbSchema);
	}])

	.factory("noWebSQL", ["$rootScope", "lodash", "$q", "$timeout", "noWebSqlEntityFactory", "noLocalStorage", "noWebSqlStatementFactory", "noDbSchema", function ($rootScope, _, $q, $timeout, noWebSqlEntityFactory, noLocalStorage, noWebSqlStatementFactory, noDbSchema) {
		return new NoWebSqlService($rootScope, _, $q, $timeout, noWebSqlEntityFactory, noLocalStorage, noWebSqlStatementFactory, noDbSchema);
	}]);
})(angular);

//transaction-cache.js
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
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$injector", "$q", "$rootScope", "noIndexedDb", "lodash", "noDataSource", "noDbSchema", "noLocalStorage", "noParameterParser", "noActionQueue", function ($injector, $q, $rootScope, noIndexedDb, _, noDataSource, noDbSchema, noLocalStorage, noParameterParser, noActionQueue){

				function NoTransaction(userId, config, thescope) {
					//var transCfg = noTransConfig;
					var SELF = this,
						scope = thescope,
						schema = noDbSchema.getSchema(config.noDataSource.databaseName);

					Object.defineProperties(this, {
						"__type": {
							"get": function () {
								return "NoTransaction";
							}
						}
					});

					this.namespace = config.noDataSource.databaseName;
					this.transactionId = noInfoPath.createUUID();
					this.timestamp = (new Date()).toJSON();
					this.userId = userId;
					this.changes = new NoChanges();
					this.state = "pending";

					this.addChange = function (tableName, data, changeType) {
						var tableCfg = scope["noDbSchema_" + config.noDataSource.databaseName];
						this.changes.add(tableName, data, changeType, tableCfg);
					};

					this.toObject = function () {
						var json = angular.fromJson(angular.toJson(this));
						json.changes = _.toArray(json.changes);

						return json;
					};

					function normalizeTransactions(config, schema) {

						var noTransactions = config.noDataSource.noTransaction,
							vw = schema.entity(config.noDataSource.crudEntity),
							lu = schema.entity(config.noDataSource.entityName),
							keysv = _.keys(lu.columns),
							keyst = vw ? _.keys(vw.columns) : [],
							keysd = !config.noDataSource.crudEntity && !keyst.length ? [] : _.difference(keysv, keyst);

						keysd.push("DateCreated");
						keysd.push("CreatedBy");

						for(var t in noTransactions) {
							var transaction = noTransactions[t],
								en = config.noDataSource.crudEntity ? config.noDataSource.crudEntity : config.noDataSource.entityName;

							if(_.isBoolean(transaction)) {
								noTransactions[t] = [
									{
										entityName: en
											//omit_fields: keysd
									}];
							}
						}

						//console.log(noTransactions);
					}

					function resolveProvider(provider, scope, data) {
						var prov;

						switch(provider) {
							case "data":
								prov = data;
								break;
							case "scope":
								prov = scope;
								break;
							default:
								prov = $injector.get(provider);
								break;
						}

						return prov;
					}

					normalizeTransactions(config, schema);

					this.upsert = function upsert(data) {
						data = noParameterParser.parse(data ? data : {});

						return $q(function (resolve, reject) {
							var
								THIS = SELF,
								dsCfg = config.noDataSource,
								opType = data[dsCfg.primaryKey] ? "update" : "create",
								opEntites = dsCfg.noTransaction[opType],
								curOpEntity = 0,
								totOpEntity = angular.isArray(opEntites) ? opEntites.length : 1,
								results = {},
								preOps = {
									"noop": angular.noop,
									"basic": function (curEntity, data, scope) {
										var writableData = {};

										if(curEntity.fields) {
											for(var f in curEntity.fields) {
												var fld = curEntity.fields[f],
													fldName, prov, val;

												//When field value is get remote values then store on
												//the writableData object.

												if(angular.isString(fld)) {
													/*
													 *	When a field is a string then the value will be the
													 *	property on the data object provider to the call
													 *	the `basic` preOp
													 */
													fldName = fld;
													val = data[fld];

												} else if(angular.isObject(fld)) {
													/*
													 *	When a field is an object then confgure as if the
													 *	value will be coming from a trusted provider like
													 *	scope, or $stateParams.
													 */
													fldName = fld.field;

													if(angular.isObject(fld.value)) {
														/*
														 *	When `scope` is the provider then the directive scope is used.
														 *	Otherwise the supplied injecable provider will be used.
														 */

														prov = resolveProvider(fld.value.provider, scope, data);

														if(prov && fld.value.method) {
															var params = [];

															for(var pi = 0; pi < fld.value.method.params.length; pi++) {
																var cfg = fld.value.method.params[pi],
																	prov2 = resolveProvider(cfg.provider, scope, data);

																params.push(noInfoPath.getItem(prov2, cfg.property));
															}

															val = prov[fld.value.method.name].apply(null, params);
														} else if(prov && fld.value.property) {
															val = noInfoPath.getItem(prov, fld.value.property);
														}

													} else {
														/*
														 *	When field value is a primative type meaning not
														 *	an object. or array. Use the value as is.
														 */
														val = fld.value;
													}
												}


												//When field has a type convert before saving.
												//NOTE: This is temporary and should be refactored
												//      into the actual provider.  And be data
												//      driven not conditional.
												if(fld.type === "date") {
													val = noInfoPath.toDbDate(val);
												}

												writableData[fldName] = val;
											}

											writableData = angular.merge(data, writableData);

										} else if(curEntity.dataService) {
											var service = $injector.get(curEntity.dataService.provider),
												method = service[curEntity.dataService.method];

											writableData = method(data);

										} else {
											writableData = data;
										}

										if(curEntity.omit_fields) {
											writableData = _.omit(writableData, curEntity.omit_fields);
										}

										//console.log(writableData);

										return writableData;

									},
									"joiner": function (curEntity, data, scope) {
										var writableData = {};

										if(curEntity.fields) {
											for(var f in curEntity.fields) {
												var fld = curEntity.fields[f],
													prov, value;

												switch(fld.value.provider) {
													case "data":
														var t = {};
														t[fld.value.property] = data;
														prov = t;
														break;

													case "results":
														prov = results;
														break;

													case "scope":
														prov = scope;
														break;

													default:
														prov = $injector.get(fld.value.provider);
														break;
												}

												value = noInfoPath.getItem(prov, fld.value.property);

												writableData[fld.field] = value;
											}
										} else if(curEntity.dataService) {
											var service = $injector.get(curEntity.dataService.provider),
												method = service[curEntity.dataService.method];

											writableData = method(data);

										}
										return writableData;
									},
									"joiner-many": function (curEntity, data, scope) {
										var writableData = {
												drop: [],
												add: []
											},
											sourceDataDrop = _.pluck(scope[curEntity.source.drop.property], curEntity.source.drop.pluck),
											sourceDataAdd = scope[curEntity.source.add.property],
											createJoin = preOps.joiner;

										if(sourceDataDrop) {
											for(var dd = 0; dd < sourceDataDrop.length; dd++) {
												var sdd = sourceDataDrop[dd];
												writableData.drop.push(createJoin(curEntity, sdd, scope));
											}
										}

										if(sourceDataAdd) {
											for(var da = 0; da < sourceDataAdd.length; da++) {
												var sda = sourceDataAdd[da];
												writableData.add.push(createJoin(curEntity, sda, scope));
											}
										}

										return writableData;
									}
								};

							function getAllRelatedToParentKey(parentCfg, entity, data) {
								var filter = new noInfoPath.data.NoFilters();

								filter.quickAdd(parentCfg.primaryKey, "eq", data[parentCfg.primaryKey]);

								return entity.noRead(filter)
									.then(function (data) {
										console.log(data.paged);

										var ra = [];
										for(var d = 0; d < data.length; d++) {
											var datum = data[d];
											ra.push(datum[entity.primaryKey[0]]);
										}

										return ra;
									});
							}
							/*
							 * Drop each record one at a time so that the operations
							 * are recorded in the current transaction.
							 */
							function dropAllRelatedToParentKey(ds, curEntity, data) {
								return $q(function (resolve, reject) {
									var d = 0;

									function recurse() {
										var datum = data[d++],
											filter = new noInfoPath.data.NoFilters();

										if(datum) {

											filter.quickAdd(curEntity.primaryKey, "eq", datum);

											ds.destroy(null, SELF, filter)
												.then(function (r) {
													console.log(r);
													recurse();
												})
												.catch(function (err) {
													console.error(err);
													reject(err);
												});
										} else {
											resolve();
										}

									}

									recurse();
								});
							}
							/*
							 * Add each record one at a time to ensure that the transaction is recorded.
							 */
							function addAllRelatedToParentKey(ds, entity, data, scope) {
								return $q(function (resolve, reject) {
									var d = 0;

									function recurse() {
										var datum = data[d++];

										if(datum) {
											ds.create(datum, SELF)
												.then(function (r) {
													console.log(r);
													recurse();
												})
												.catch(function (err) {
													console.error(err);
													reject(err);
												});
										} else {
											resolve();
										}

									}

									recurse();
								});


							}
							//Perform create or update operation.
							function executeDataOperation(dataSource, curEntity, opType, writableData) {
								return dataSource[opType](writableData, curEntity.notSyncable ? undefined : SELF)
									.then(function (dataSource, data) {
										//get row from base data source

										//console.log("executeDataOperation - calling dataSource.one", dataSource.entity.noInfoPath.primaryKey, data[dataSource.entity.noInfoPath.primaryKey]);

										dataSource.one(data[dataSource.entity.noInfoPath.primaryKey])
											.then(function (scope, datum) {
												var sk = curEntity.scopeKey ? curEntity.scopeKey : curEntity.entityName,
													pure = noParameterParser.parse(datum);

												//foo = angular.copy(scope[sk]);
												results[sk] = pure;
												
												if(scope[sk]){
													noParameterParser.update(datum, scope[sk]);


													if(curEntity.cacheOnScope) {
														scope[curEntity.entityName] = pure;
													}

													/*
													 *   #### @property scopeKey
													 *
													 *   Use this property allow NoTransaction to store a reference
													 *   to the entity upon which this data operation was performed.
													 *   This is useful when you have tables that rely on a one to one
													 *   relationship.
													 *
													 *   It is best practice use this property when ever possible,
													 *   but it not a required configuration property.
													 *
													 */

													//scope[sk] = foo;


												}

												//If there is an ActionQueue then execute it.
												if(curEntity.actions && curEntity.actions.post) {
													//support post operation actions for now.
													var execQueue = noActionQueue.createQueue(datum, scope, {}, curEntity.actions.post);

													noActionQueue.synchronize(execQueue)
														.then(_recurse);
												}else{
													_recurse();
												}


											}.bind(null, scope));
									}.bind(null, dataSource))
									.catch(reject);
							}

							function executeDataOperationBulk(dataSource, curEntity, opType, writableData) {
								return dataSource[opType](writableData, curEntity.notSyncable ? undefined : SELF)
									.then(function (dataSource, data) {
										return data;
									}.bind(null, dataSource))
									.catch(reject);
							}

							function _entity_standard(curEntity) {
								var primaryKey, opType, preOp, dsConfig, dataSource, writableData, exec;

								//Resolve primary key
								primaryKey = curEntity.primaryKey ? curEntity.primaryKey : dsCfg.primaryKey;

								//Create or Update the curEntity.
								opType = data[primaryKey] ? "update" : "create";

								//check entity type, if none found use `basic`
								preOp = !!curEntity.type ? curEntity.type : "basic";

								//create the datasource config used to create datasource.
								// dsConfig = angular.merge({}, config.noDataSource, {
								// 	entityName: curEntity.entityName
								// });

								dsConfig = angular.merge({}, config.noDataSource, curEntity);
								//console.log(dsConfig);

								//create the noDataSource object.
								dataSource = noDataSource.create(dsConfig, scope);

								//resolve writeable data, execution function.
								switch(preOp) {
									case "joiner-many":
										/*
										 *  ### joiner-many
										 *
										 *  `joiner-many` assumes that it represents a multiple choice question.
										 *  In order to keep the algorithm simple we drop all joiner items
										 *  that match the parent key. (i.e. SelectionID)
										 */
										writableData = preOps[preOp](curEntity, data, scope);

										exec = function () {
											return getAllRelatedToParentKey(dsCfg, dataSource.entity, data)
												.then(dropAllRelatedToParentKey.bind(null, dataSource, curEntity))
												.then(addAllRelatedToParentKey.bind(null, dataSource, curEntity, writableData.add, scope))
												.then(_recurse)
												.catch(reject);
										};
										break;

									case "one-one":
										/*
										 *	### one-one
										 *
										 *	`one-one` enforces referential integrity between two table in a
										 *	transaction that share a one to one relationship.  When the child
										 *	data/table as defined in the noTransaction configuration and it's
										 *	primary key value is undefined a create is performed, otherwise
										 *	an update is performed.
										 *
										 */
										var keyData = preOps.joiner(curEntity, data, scope);

										opType = keyData[curEntity.primaryKey] ? "update" : "create";

										writableData = preOps.basic(curEntity, data, scope);

										writableData = angular.merge({}, writableData, keyData);

										exec = executeDataOperation;

										break;

									default:
										writableData = preOps[preOp](curEntity, data, scope);
										exec = executeDataOperation;
										break;
								}

								/*
								 *	@property createOnly
								 *
								 *	Use this property to `create` new related records in a transaction
								 *	member table when a matching item does not exist. So, this also
								 *	means that no `update` operations are performed on the designated
								 *	member table.
								 *
								 */
								if((opType === "update" && !curEntity.createOnly) || opType == "create") {
									exec(dataSource, curEntity, opType, writableData);
								} else {
									_recurse();
								}
							}

							function _entity_bulk(curEntity) {
								function _resolveMethod(curEntity, sdProv, sdProp) {
									var method;

									if(angular.isFunction(sdProp))
									{
									 	method = sdProp;
									} else if(sdProp === undefined && curEntity.bulk.sourceData.method) {
										method = sdProv[curEntity.bulk.sourceData.method].bind(sdProv);
									} else if(sdProp !== undefined && curEntity.bulk.sourceData.method) {
										method = sdProp[curEntity.bulk.sourceData.method].bind(sdProp);
									}

									return method;
								}

								//Current version requires an objectFactory when using bulk feature.
								if(!curEntity.objectFactory) throw "objectFactory property is required when using bulk upsert feature.";

								var ofProv = $injector.get(curEntity.objectFactory.provider),
									classConstructor = ofProv.get(curEntity.objectFactory.className),
									sdProv = curEntity.bulk.sourceData.provider === "scope" ? scope : $injector.get(curEntity.bulk.sourceData.provider),
									sdProp = sdProv[curEntity.bulk.sourceData.property],
									sdMeth = _resolveMethod(curEntity, sdProv, sdProp),
									data = sdMeth ? sdMeth() : sdProp,
									dataSource, primaryKey, opType, promises = [];

								primaryKey = curEntity.primaryKey ? curEntity.primaryKey : dsCfg.primaryKey;

								//Create or Update the curEntity.
								opType = data[primaryKey] ? "update" : "create";

								//create the datasource config used to create datasource.
								// dsConfig = angular.merge({}, config.noDataSource, {
								// 	entityName: curEntity.entityName
								// });

								//dsConfig = angular.merge({}, config.noDataSource, curEntity);
								//console.log(dsConfig);




								//SELF.bulkUpsert(data, classConstructor, curEntity.bulk.ignoreDirtyFlag, results)



								function _doTheUpserts(data) {
									//create the noDataSource object.
									dataSource = noDataSource.create(curEntity, scope);

									//console.log(data);


									for(var i = 0; i < data.length; i++) {
										var model = data[i];
										opType = model[primaryKey] ? "update" : "create";

										if(curEntity.bulk.ignoreDirtyFlag === true || model.dirty) {
											promises.push(executeDataOperationBulk(dataSource, curEntity, opType, new classConstructor(model, results)));
										}
									}

									$q.all(promises)
										.then(_recurse)
										.catch(reject);
								}


								if(data.then) {
									data
										.then(_doTheUpserts)
										.catch(function(e){
											reject(e);
										});
								} else {
									_doTheUpserts(data);
								}

							}

							function _recurse() {

								var curEntity = opEntites[curOpEntity];

								//Check to see if we have run out of entities to recurse.
								if(!curEntity || curOpEntity >= opEntites.length) {
									resolve(results);
									return;
								}

								if(curEntity.bulk) {
									_entity_bulk(curEntity, results);
								} else {
									_entity_standard(curEntity);
								}

								//Increment counter for next recursion.
								curOpEntity++;
							}

							_recurse();
						});
					};

					/**
					 *	### @method bulkUpsert
					 *
					 *	Inserts or updates and array of data items. Uses a provided
					 *	constructor to create the object that will be added to the
					 *	entity. This allows for custom data conversion and business
					 *	logic to be implement at the record level, before saving.
					 *
					 */
					this.bulkUpsert = function (data, constructor, ignoreDirtyFlag, results) {

						//console.log(data);
						return $q(function (resolve, reject) {
							var promises = [];

							for(var i = 0; i < data.length; i++) {
								var model = data[i];

								if(ignoreDirtyFlag === true || model.dirty) {
									promises.push(this.upsert(new constructor(model, results)));
								}
							}

							$q.all(promises)
								.then(resolve)
								.catch(reject);

						}.bind(this));
					};

					this.destroy = function (data, filters) {
						data = data ? data : {};

						return $q(function (resolve, reject) {
							var THIS = SELF,
								dsCfg = config.noDataSource,
								opType = "destroy",
								opEntites = dsCfg.noTransaction[opType],
								curOpEntity = 0,
								totOpEntity = angular.isArray(opEntites) ? opEntites.length : 1,
								results = {};

							function _recurse() {
								var curEntity = opEntites[curOpEntity],
									preOp, dsConfig, dataSource, writableData;

								if(!curEntity || curOpEntity >= opEntites.length) {
									resolve(results);
									return;
								}

								curOpEntity++;

								dsConfig = angular.merge({}, config.noDataSource, {
									entityName: curEntity.entityName
								});

								dataSource = noDataSource.create(dsConfig, scope);

								writableData = data; //preOps[preOp](curEntity, data, scope);

								dataSource[opType](writableData, SELF, filters)
									.then(function (data) {
										results[config.noDataSource.entityName] = writableData;
										_recurse();

									})
									.catch(reject);
							}

							_recurse();
						});
					};

				}

				function NoTransactionLite(userId, namespace, thecope) {
					//var transCfg = noTransConfig;
					var SELF = this,
						scope = thescope;

					Object.defineProperties(this, {
						"__type": {
							"get": function () {
								return "NoTransactionLite";
							}
						}
					});

					this.namespace = namespace;
					this.transactionId = noInfoPath.createUUID();
					this.timestamp = (new Date()).toJSON();
					this.userId = userId;
					this.changes = new NoChanges();
					this.state = "pending";

					this.addChange = function (tableName, data, changeType) {
						var tableCfg = scope["noDbSchema_" + namespace];
						this.changes.add(tableName, data, changeType, tableCfg);
					};

					this.toObject = function () {
						var json = angular.fromJson(angular.toJson(this));
						json.changes = _.toArray(json.changes);

						return json;
					};
				}


				function NoChanges() {
					Object.defineProperties(this, {
						"__type": {
							"get": function () {
								return "NoChanges";
							}
						}
					});
					var arr = [];
					noInfoPath.setPrototypeOf(this, arr);
					this.add = function (tableName, data, changeType, tableCfg) {
						var syncVer = noLocalStorage.getItem("noSync_lastSyncVersion"),
							change = new NoChange(tableName, data, changeType, tableCfg, !!syncVer ? syncVer.version : 0);

						this.unshift(change);
					};
				}

				function NoChange(tableName, data, changeType, tableCfg, version) {
					var tblSchema = tableCfg.tables[tableName];

					function normalizeValues(inData) {
						var data = angular.copy(inData),
							converters = {
								"bit": function (d) {
									return !!d;
								},
								"decimal": function (d) {
									var r = d;
									if(r) {
										r = String(r);
									}

									return r;
								},
								"undefined": function (d) {
									return d;
								}
							};

						for(var c in data) {
							var dt,
								col = tblSchema.columns[c];

							if(col) {
								dt = converters[col.type];

								if(!dt) {
									dt = converters["undefined"];
								}

								data[c] = dt(data[c]);
							}
						}
						return data;
					}

					Object.defineProperties(this, {
						"__type": {
							"get": function () {
								return "NoChange";
							}
						}
					});

					this.tableName = tableName;
					this.data = normalizeValues(data);
					this.changeType = changeType;
					this.version = version;
				}

				function NoTransactionCache() {


					this.beginTransaction = function (userId, noTransConfig, scope) {
						if(angular.isObject(noTransConfig)) {
							return new NoTransaction(userId, noTransConfig, scope);
						} else {
							return new NoTransactionLite(userId, noTransConfig, scope);
						}
					};

					this.endTransaction = function (transaction) {
						var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
							entity = db.NoInfoPath_Changes;

						//console.log(db);

						return entity.noCreate(transaction.toObject())
							.then(function () {
								$rootScope.$broadcast("noTransactionCache::localDataUpdated", transaction);
							});
					};

					this.getAllPending = function () {
						return $q(function (resolve, reject) {
							var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
								entity = db.NoInfoPath_Changes;

							entity
								.where("state")
								.equals("pending")
								.toArray()
								.then(resolve)
								.catch(reject);

						});
					};

					this.markTransactionSynced = function (t) {
						var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
							entity = db.NoInfoPath_Changes;

						t.state = "synced";

						return entity.noUpdate(t);

					};

					this.dropAllSynced = function () {
						var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
							entity = db.NoInfoPath_Changes;

						return entity
							.where("state")
							.equals("synced")
							.toArray()
							.then(function (data) {
								for(var d in data) {
									var datum = data[d];

									entity.noDestroy(datum);
								}
							})
							.catch(function (err) {
								console.error(err);
							});
					};

				}

				// // These classes are exposed for testing purposes
				// noInfoPath.data.NoTransaction = NoTransaction;
				// noInfoPath.data.NoChanges = NoChanges;
				// noInfoPath.data.NoChange = NoChange;
				// noInfoPath.data.NoTransactionCache = NoTransactionCache;

				return new NoTransactionCache($q, noIndexedDb);
			}]);
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
(function (angular, Dexie, undefined) {
	"use strict";

	function NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage, noQueryParser) {

		var _name, _noIndexedDb = this;

		function _recordTransaction(resolve, tableName, operation, trans, rawData, result1, result2) {
			//console.log(arguments);

			var transData = result2 && result2.rows && result2.rows.length ? result2 : angular.isObject(result1) ? result1 : rawData;

			if(trans) trans.addChange(tableName, transData, operation);
			resolve(transData);
		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		Object.defineProperties(this, {
			"isInitialized": {
				"get": function () {
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		this.configure = function (noUser, schema) {
			var _dexie = new Dexie(schema.config.dbName),
				noIndexedDbInitialized = "noIndexedDb_" + schema.config.dbName;

			function _extendDexieTables(dbSchema) {
				function _toDexieClass(tsqlTableSchema) {
					var _table = {};

					angular.forEach(tsqlTableSchema.columns, function (column, columnName) {
						switch(column.type) {
							case "uniqueidentifier":
							case "nvarchar":
							case "varchar":
								_table[columnName] = "String";
								break;

							case "date":
							case "datetime":
								_table[columnName] = "Date";
								break;

							case "bit":
								_table[columnName] = "Boolean";
								break;

							case "int":
							case "decimal":
								_table[columnName] = "Number";
								break;
						}
					});

					return _table;
				}

				angular.forEach(dbSchema, function (table, tableName) {
					var dexieTable = _dexie[table.entityName || tableName];
					dexieTable.mapToClass(noDatum, _toDexieClass(table));
					table.parentSchema = schema;
					dexieTable.noInfoPath = table;
					dexieTable.provider = _dexie;
				});
			}

			function _reject($rootScope, reject, err) {
				reject(err);
				$rootScope.$digest();
			}

			function _resolve($rootScope, resolve, data) {
				resolve(data);
				$rootScope.$digest();
			}

			return $q(function (resolve, reject) {
				_dexie.currentUser = noUser;
				_dexie.on('error', function (err) {
					// Log to console or show en error indicator somewhere in your GUI...
					console.error("Dexie Error: ", arguments);
					_reject($rootScope, reject, err);
				});

				_dexie.on('blocked', function (err) {
					// Log to console or show en error indicator somewhere in your GUI...
					console.warn("IndexedDB is currently execting a blocking operation.");
					_reject($rootScope, reject, err);
				});

				_dexie.on('versionchange', function (err) {
					// Log to console or show en error indicator somewhere in your GUI...
					//noLogService.error("IndexedDB as detected a version change");
					_reject($rootScope, reject, "IndexedDB as detected a version change");
				});

				_dexie.on('populate', function (err) {
					//Log to console or show en error indicator somewhere in your GUI...
					//noLogService.warn("IndedexDB populate...  not implemented.");
				});

				_dexie.on('ready', function (data) {
					console.log("noIndexedDb_" + schema.config.dbName + " ready.");
					// Log to console or show en error indicator somewhere in your GUI...
					$rootScope[noIndexedDbInitialized] = _dexie;

					_resolve($rootScope, resolve, _dexie);

				});

				if(_dexie.isOpen()) {
					//Do nothing, `ready` event should bubble up.

					// $timeout(function() {
					// 	//noLogService.log("Dexie already open.")
					// 	window.noInfoPath.digest(deferred.resolve);
					// });
				} else {
					if(_.size(schema.store)) {
						_dexie.version(schema.config.version)
							.stores(schema.store);
						_extendDexieTables.call(_dexie, schema.tables);
						_dexie.open();
					} else {
						console.warn("Waiting for noDbSchema data.");
					}

				}
			});


		};

		this.whenReady = function (config) {
			var deferred = $q.defer();

			$timeout(function () {
				var noIndexedDbInitialized = "noIndexedDb_" + config.dbName;

				if($rootScope[noIndexedDbInitialized]) {
					deferred.resolve();
				} else {
					$rootScope.$watch(noIndexedDbInitialized, function (newval, oldval, scope) {
						if(newval) {
							deferred.resolve();
						}
					});
				}
			});

			return deferred.promise;
		};

		this.getDatabase = function (databaseName) {
			return $rootScope["noIndexedDb_" + databaseName];
		};

		function noDexie(db) {
			var _dexie = db,
				indexedOperators = {
					"eq": "equals",
					"gt": "above",
					"ge": "aboveOrEqual",
					"lt": "below",
					"le": "belowOrEqual",
					"startswith": "startsWith",
					"bt": "between",
					"in": "anyOfIgnoreCase"
				};

			db.WriteableTable.prototype.noCreate = function (data, trans) {
				var deferred = $q.defer(),
					table = this;

				data = _unfollow_data(table, data);
				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function () {
						data.CreatedBy = _dexie.currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;

						if(!data[table.schema.primKey.name]) {
							data[table.schema.primKey.name] = noInfoPath.createUUID();
						}

						_dexie.nosync = true;

						table.add(data)
							.then(function (data) {
								//noLogService.log("addSuccessful", data);

								table.get(data)
									.then(_recordTransaction.bind(null, deferred.resolve, table.name, "C", trans, data))
									.catch(_transactionFault.bind(null, deferred.reject));

							})
							.catch(function (err) {
								//deferred.reject("noCRUD::create " + err);
								deferred.reject(err);
							});
					})
					.catch(function (err) {
						deferred.reject("noCRUD::createTrans " + err);
						deferred.reject(err);
					});

				return deferred.promise;
			};


			function NoRead_new() {
				var table = this,
					filterOps = {
						"is null": "is null",
						"is not null": "is not null",
						eq: "eq",
						neq: "ne",
						gt: "gt",
						ge: "ge",
						gte: "ge",
						lt: "lt",
						le: "le",
						lte: "le",
						contains: "contains",
						doesnotcontain: "notcontains",
						endswith: "endswith",
						startswith: "startswith",
						"in": "in"
					},
					compareOps = {
						"is null": function (a) {
							return a === null;
						},
						"is not null": function (a) {
							return a !== null;
						},
						"eq": function (a, b) {
							return a === b;
						},
						"ne": function (a, b) {
							return a !== b;
						},
						"gt": function (a, b) {
							return a > b;
						},
						"ge": function (a, b) {
							return a >= b;
						},
						"lt": function (a, b) {
							return a < b;
						},
						"le": function (a, b) {
							return a <= b;
						},
						"contains": function (a, b) {
							var areStrings = angular.isString(a) && angular.isString(b);
							return areString ? a.indexOf(b) > -1 : false;
						},
						"notcontains": function (a, b) {
							var areStrings = angular.isString(a) && angular.isString(b);
							return areString ? a.indexOf(b) === -1 : false;
						},
						"startswith": function (a, b) {
							var areStrings = angular.isString(a) && angular.isString(b);
							return areString ? a.indexOf(b) === 0 : false;
						},
						"endswith": function (a, b) {
							var areStrings = angular.isString(a) && angular.isString(b);
							return areString ? a.lastIndexOf(b) > -1 : false;
						},
						"in": function (a, b) {
							return b.indexOf(a) > -1;
						}
					},
					aliases = table.noInfoPath.parentSchema.config.tableAliases || {},
					filters, sort, page, follow = true,
					exclusions = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.followExceptions ? table.noInfoPath.parentSchema.config.followExceptions : [];

				function _filter(filters, table) {
					var collection;

					function _logicCB(filter, ex, value) {
						var val = noInfoPath.getItem(value, filter.column),
							op = compareOps[filterOps[ex.operator]],
							ok = op ? op(val, ex.value) : false;

						return ok;
					}

					function _filterNormal(fi, filter, ex) {

						var where, evaluator, logic;

						try {


							if(fi === 0) {
								//When `fi` is 0 create the WhereClause, extract the evaluator
								//that will be used to create a collection based on the filter.
								where = table.where(filter.column);

								//NOTE: Dexie changed they way they are handling primKey, they now require that the name be prefixed with $$
								if(table.schema.primKey.keyPath === filter.column || table.schema.idxByName[filter.column]) {
									evaluator = where[indexedOperators[ex.operator]];
									collection = evaluator.call(where, ex.value);
								} else {
									collection = table.toCollection();
								}

								logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
							} else {
								// logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
								if(filter.logic) {
									logic = collection[filter.logic].bind(collection);
									collection = logic(_logicCB.bind(null, filter, ex));
								}

							}
						} catch(err) {
							throw {error: err, collection: collection, arguments: [fi, filter, ex]};
						}
					}

					function _filterCompound(fi, filter, ex) {
						console.log("Compound", fi, filter, ex);
					}

					if(!!filters) {
						for(var fi = 0; fi < filters.length; fi++) {
							var filter = filters[fi],
								ex = filter.filters[0];

							// if(noInfoPath.isCompoundFilter(filter.column)){
							// 	_filterCompound(fi, filter, ex);
							// }else{
							_filterNormal(fi, filter, ex);
							// }
						}
						//More indexed filters
					} else {
						collection = table.toCollection();
					}

					return collection;
				}

				function _sort(sorts, arrayOfThings) {
					function _compare(s, a, b) {
						var aval = noInfoPath.getItem(a, s.column),
							bval = noInfoPath.getItem(b, s.column);


						if(s.dir === "desc") {
							if(aval < bval) {
								return 1;
							}
							if(aval > bval) {
								return -1;
							}
						} else {
							if(aval > bval) {
								return 1;
							}
							if(aval < bval) {
								return -1;
							}
						}

						// a must be equal to b
						return 0;

					}

					if(sorts) {
						for(var s = 0; s < sorts.length; s++) {
							var sort = sorts[s];

							arrayOfThings.sort(_compare.bind(null, sort));
						}
					}
				}

				function _page(page, arrayOfThings) {
					if(page) {
						arrayOfThings.page(page);
					}
				}

				function _expand_fault(col, keys, filters, err) {
					console.error({
						error: err,
						column: col,
						keys: keys,
						filters: filters
					});
					return err;
				}

				function _expand_success(col, keys, filters, results)	{
					//console.log("_expand_success", arguments);
					return results;
				}

				function _expand(col, keys) {
					var theDb = col.refDatabaseName ? _noIndexedDb.getDatabase(col.refDatabaseName) : db,
						filters = new noInfoPath.data.NoFilters(),
						ft = theDb[col.refTable];

					//If we don't have a foreign key table, then try  to dereference it using the aliases hash.
					if(!ft) {
						ft = theDb[aliases[col.refTable]];
					}

					if(!ft) throw "Invalid refTable " + aliases[col.refTable];

					if(exclusions.indexOf(col.column) > -1) {
						return $q.when(new noInfoPath.data.NoResults());
					}
					// if(tableCache[col.refTable]) {
					// 	tbl = tableCache[col.refTable];
					// } else {
					// 	tableCache[col.refTable] = tbl;
					// }

					if(!keys) {
						throw {
							error: "Invalid key value",
							col: col,
							item: item
						};
					}

					//Configure foreign key filter
					filters.quickAdd(col.refColumn, "in", keys);

					//follow the foreign key and get is data.
					if(keys.length > 0) {
						return ft.noRead(filters)
							.then(_expand_success.bind(table, col, keys, filters))
							.catch(_expand_fault.bind(table, col, keys, filters));
					} else {
						return $q.when(new noInfoPath.data.NoResults());
					}

				}

				function _finalResults(finalResults) {
					if(finalResults.exception) {
						console.warn(finalResults.exception);
						resolve(new noInfoPath.data.NoResults([]));
					} else {
						resolve(new noInfoPath.data.NoResults(finalResults));
					}
				}

				function _fault(ctx, reject, err) {
					ctx.error = err;
					//console.error(ctx);
					reject(ctx);
				}

				function _finished_following_fk(columns, arrayOfThings, refData) {

					for(var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for(var c in columns) {
							var col = columns[c],
								key = item[col.column],
								refTable = !col.noFollow && refData[col.refTable].paged,
								filter = {},
								refItem;

							if(col.noFollow) continue;

							filter[col.refColumn] = key;

							refItem = _.find(refTable, filter);

							item[col.column] = refItem || key;
						}
					}

					return arrayOfThings;

				}


				function _finished_following_meta(columns, arrayOfThings, refData) {
					//console.log(columns, arrayOfThings, refData);
					for(var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for(var c in columns) {
							var col = columns[c],
								key = item[col.columnName],
								data = refData[key];

							item[col.columnName] = data || key;
						}
					}

					return arrayOfThings;

					// function(arrayOfThings, results) {
					// 	console.log(table, tableCache, arrayOfThings);
					// 	return arrayOfThings;
					// }.bind(null, arrayOfThings)
					// item[col.column] = data;
					// tableCache[col.refTable][data[col.refColumn]]  = data;
					// return item;
				}

				function _followRelations(follow, arrayOfThings) {

					//console.log(table.noInfoPath);
					var promises = {},
						allKeys = {},
						queue = [],
						columns = table.noInfoPath.foreignKeys;

					if(follow) {
						for(var c in columns) {
							var col = columns[c],
								keys = _.compact(_.pluck(arrayOfThings, col.column)); //need to remove falsey values

							if(col.noFollow) continue;

							if(!allKeys[col.refTable]) {
								allKeys[col.refTable] = {
									col: col,
									keys: []
								};
							}

							// group keys by ref table
							allKeys[col.refTable].keys = allKeys[col.refTable].keys.concat(keys);
							//promises[col.refTable] = _expand(col, keys);
						}

						for(var k in allKeys) {
							var keys2 = allKeys[k];

							promises[k] = _expand(keys2.col, keys2.keys);
						}

						return _.size(promises) > 0 ?
							$q.all(promises)
							.then(_finished_following_fk.bind(table, columns, arrayOfThings))
							.catch(_fault) :
							$q.when(arrayOfThings);
					} else {
						$q.when(arrayOfThings);
					}

				}

				/**
				 *	### followMetaDataKeys
				 *
				 *	This feature of NoInfoPath allows for a special type of
				 *	data column that can contain heterogenuous data. Meaning on
				 *	any given row of data the value of the meta column could be
				 *	a string, a number, date or a foreign key reference to a
				 *	lookup table.
				 *
				 *	#### Sample MetaDataDefinition record
				 *
				 *	```json
				 *	{
				 * 	"ID": "67c373ac-a003-402a-9689-45c37fc2afa8",
				 * 	"MetaDataSchemaID": "16187a97-31d7-40e3-b33f-64b55471ee3f",
				 * 	"Title": "Unit",
				 * 	"DataType": "string",
				 * 	"InputType": "combobox",
				 * 	"ListSource": "lu_UOM",
				 * 	"TextField": "Description",
				 * 	"ValueField": "ID",
				 * 	"DateCreated": "2016-05-04T16:43:00.001",
				 * 	"CreatedBy": "79689b1e-6627-47c1-baa5-34be228cf06d",
				 * 	"ModifiedDate": "2016-05-04T16:43:00.001",
				 * 	"ModifiedBy": "79689b1e-6627-47c1-baa5-34be228cf06d"
				 * }
				 * ```
				 */
				function _followMetaData(ctx, arrayOfThings) {

					var promises = {},
						keys = {},
						noEntity = ctx.table.noInfoPath,
						columns = noEntity.columns;

					for(var colName in columns) {
						var col = columns[colName];

						if(col.followMetaDataKeys) {
							for(var i = 0; i < arrayOfThings.length; i++) {
								var thing = arrayOfThings[i],
									meta = thing.MetaDataDefinitionID,
									filters;

								//Only folow lookup columns.
								if(meta.InputType === "combobox") {
									if(!!thing[colName]) {
										filters = new noInfoPath.data.NoFilters();
										filters.quickAdd(meta.ValueField, "eq", thing[colName]);

										//use the current `db` for looking up the meta data.
										promises[thing[colName]] = db[meta.ListSource].noOne(filters);
									}

								}

							}
						}
					}

					//console.log(keys);

					return _.size(promises) > 0 ?
						$q.all(promises)
						.then(_finished_following_meta.bind(table, columns, arrayOfThings))
						.catch(_fault) :
						$q.when(arrayOfThings);

				}

				function _finish(resolve, reject, arrayOfThings) {

					_sort(sort, arrayOfThings);

					var results = new noInfoPath.data.NoResults(arrayOfThings);

					_page(page, results);

					//console.log(this, results.paged);

					resolve(results);
					// collection.toArray()
					// 	.then(_followRelations.bind(table, table))
					// 	.then(_finish_expand.bind(null, columns, arrayOfThings, refData))
					// 	.then(resolve)
					// 	.catch(reject);

				}

				for(var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg) || typeof (arg) === "boolean") {
						switch(arg.__type) {
							case "NoFilters":
								filters = arg;
								break;
							case "NoSort":
								sort = arg;
								break;
							case "NoPage":
								page = arg;
								break;
							default:
								if(typeof (arg) === "boolean") {
									follow = arg;
								}
						}
					}

				}

				var ctx = {
					table: table,
					filters: filters,
					page: page,
					sort: sort
				};

				return $q(function (resolve, reject) {
					var collection,
						data,
						promise;

					try {
						collection = _filter(filters, table);

						collection.toArray()
							.then(_followRelations.bind(ctx, follow))
							.then(_followMetaData.bind(ctx, ctx))
							.then(_finish.bind(ctx, resolve, reject))
							.catch(_fault.bind(ctx, ctx, reject));
						//.then(_finish(collection, table, resolve, reject));

					} catch(err) {
						console.error("NoRead_new", err);
						reject(err);
					}

					//_sort(table, sort, collection);

					//_page(page, collection);

					//_finish(collection, table, resolve, reject);

				});
			}

			db.Table.prototype.noRead = NoRead_new;

			db.WriteableTable.prototype.noUpdate = function (data, trans) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey];

				data = angular.copy(data);

				//noLogService.log("adding: ", _dexie.currentUser);

				data = _unfollow_data(table, data);

				_dexie.transaction("rw", table, function () {
						Dexie.currentTransaction.nosync = true;
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;
						table.update(key, data)
							// .then(table.noOne.bind(table, key))
							.then(_recordTransaction.bind(null, deferred.resolve, table.name, "U", trans, data))
							.catch(_transactionFault.bind(null, deferred.reject));
					})
					.then(angular.noop())
					.catch(function (err) {
						window.noInfoPath.digestError(deferred.reject, err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noDestroy = function (data, trans, filters) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey],
					collection;

				//noLogService.log("adding: ", _dexie.currentUser);
				//noLogService.log(key);

				_dexie.transaction("rw", table, function () {
						Dexie.currentTransaction.nosync = true;

						if(!!filters) {
							//First filter will use where();
							var filter = filters[0],
								where = table.where(filter.column),
								ex = filter.filters[0],
								method = where[indexedOperators[ex.operator]];

							collection = method.call(where, ex.value);

							collection.delete()
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans, data))
								.catch(_transactionFault.bind(null, deferred.reject));

						} else {
							table.delete(key)
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans, data))
								.catch(_transactionFault.bind(null, deferred.reject));
						}
					})
					.then(angular.noop())
					.catch(function (err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noOne = function (query) {
				var noFilters = noInfoPath.resolveID(query, this.noInfoPath);

				return this.noRead(noFilters)
					.then(function (resultset) {
						var data;

						if(resultset.length === 0) {
							throw "noIndexedDb::noOne: Record Not Found";
						} else {
							data = resultset[0];
						}

						return data;
					});
			};

			db.WriteableTable.prototype.bulkLoad = function (data, progress) {
				var deferred = $q.defer(),
					table = this;
				//var table = this;
				function _import(data, progress) {
					var total = data ? data.length : 0;

					$timeout(function () {
						//progress.rows.start({max: total});
						deferred.notify(progress);
					});

					var currentItem = 0;

					_dexie.transaction('rw', table, function () {
						Dexie.currentTransaction.nosync = true;
						_next();
					});


					function _next() {
						if(currentItem < data.length) {
							var datum = data[currentItem];

							table.add(datum)
								.then(function (data) {
									//progress.updateRow(progress.rows);
									deferred.notify(data);
								})
								.catch(function (err) {
									deferred.reject(err);
								})
								.finally(function () {
									currentItem++;
									_next();
								});

						} else {
							deferred.resolve(table.name);
						}
					}

				}

				//console.info("bulkLoad: ", table.TableName)

				table.clear()
					.then(function () {
						_import(data, progress);
					}.bind(this))
					.catch(function (err) {
						console.error(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noImport = function (noChange) {
				var THIS = this;

				function checkForExisting() {
					var id = noChange.changedPKID;

					return THIS.noOne(id)
						.catch(function (err) {
							//console.error(err);
							return false;
						});
				}

				function isSame(data, changes) {
					var
						localDate = new Date(data.ModifiedDate),
						remoteDate = new Date(changes.ModifiedDate),
						same = moment(localDate).isSame(remoteDate, 'second');

					console.log(localDate, remoteDate, same);

					return same;
				}

				function save(changes, data, resolve, reject) {
					var ops = {
						"I": THIS.noCreate.bind(THIS),
						"U": THIS.noUpdate.bind(THIS)
					};
					//console.log(data, changes);
					if(isSame(data, changes.values)) {
						console.warn("not updating local data because the ModifiedDate is the same or newer than the data being synced.");
						changes.isSame = true;
						resolve(changes);
					} else {
						ops[changes.operation](changes.values)
							.then(resolve)
							.catch(reject);
					}
				}


				return $q(function (resolve, reject) {

					function ok(data) {
						console.log(data);
						resolve(data);
					}

					function fault(err) {
						console.error(err);
						reject(err);
					}

					checkForExisting()
						.then(function (data) {
							console.log("XXXXX", data);
							// if(data) {
							switch(noChange.operation) {
								case "D":
									THIS.noDestroy(noChange.changedPKID)
										.then(ok)
										.catch(fault);
									break;

								case "I":
									if(!data) save(noChange, data, ok, fault);
									break;
								case "U":
									if(data) save(noChange, data, ok, fault);
									break;
							}
							// }else{
							// 	resolve({});
							// }

						});
				});
			};

			function _unfollow_data(table, data) {
				var foreignKeys = table.noInfoPath.foreignKeys || {};

				for(var fks in foreignKeys) {

					var fk = foreignKeys[fks],
						datum = data[fk.column];

					if(datum) {
						data[fk.column] = datum[fk.refColumn] || datum;
					}
				}

				return data;
			}

		}

		this.destroyDb = function (databaseName) {
			var deferred = $q.defer();
			var db = _noIndexedDb.getDatabase(databaseName);
			if(db) {
				db.delete()
					.then(function (res) {
						delete $rootScope["noIndexedDb_" + databaseName];
						deferred.resolve(res);
					});
			} else {
				deferred.resolve(false);
			}
			return deferred.promise;
		};

		/**
		 *	### Class noDatum
		 *	This is a contructor function used by Dexie when creating and returning data objects.
		 */
		function noDatum() {
			noLogService.log("noDatum::constructor"); //NOTE: This never seems to get called.
		}

		Dexie.addons.push(noDexie);

	}

	angular.module("noinfopath.data")
		.factory("noIndexedDb", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function ($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {
			return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}])

	.factory("noIndexedDB", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function ($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {
		return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}]);

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
 *        "aggregation": {
 *             "actions": [
 *					{
 *						"provider": "aCustomProvider",
 *						"method": "aMethod",
 *						"params": [
 *
 *						],
 *						"noContextParams": true
 *					}
 *             ]
 *        }
 *    }
 *
 *	```
 */
(function (angular, undefined) {

	function NoDataSource($injector, $q, noDynamicFilters, dsConfig, scope, noCalculatedFields, watch) {
		var provider = $injector.get(dsConfig.dataProvider),
			db = provider.getDatabase(dsConfig.databaseName),
			entity = db[dsConfig.entityName],
			qp = $injector.get("noQueryParser"),
			isNoView = entity.constructor.name === "NoView",
			_scope = scope;

		Object.defineProperties(this, {
			"entity": {
				"get": function () {
					return entity;
				}
			}
		});

		// var tmpFilters = noDynamicFilters.configure(dsCfg, scope, watch);
		// ds.filter = tmpFilters ? {
		// 	filters: tmpFilters
		// } : undefined;
		//
		this.create = function (data, noTrans) {
			if(isNoView) throw "create operation not supported on entities of type NoView";

			return entity.noCreate(data, noTrans);

		};

		this.read = function (options, follow) {
			function requestData(scope, config, entity, queryParser, resolve, reject) {
				var params = angular.merge({}, options);

				params.filter = noDynamicFilters.configure(config, scope, watch);

				if(config.sort) {
					params.sort = config.sort;
				}

				if(config.take) {
					params.take = config.take;
					params.skip = config.skip;
				}

				var x = queryParser.parse(params);
					if(follow === false) x.push(false);

				return entity.noRead.apply(entity, x)
					.then(function (data) {
						data = noCalculatedFields.calculate(config, data);
						//If there is an ActionQueue then execute it.
						if(config.aggregation && config.aggregation.actions) {
							var execQueue = noActionQueue.createQueue(data, scope, {}, config.aggregation.action);

							noActionQueue.synchronize(execQueue)
								.then(function(results){
									resolve(results);
								});
						}else{
							resolve(data);
						}

					})
					.catch(function (err) {
						reject(err);
					});

			}


			return $q(function (resolve, reject) {
				var waitFor, filterValues;

				if(dsConfig.waitFor) {
					waitFor = _scope.$watch(dsConfig.waitFor.property, function (newval, oldval, scope) {
						if(newval) {
							requestData(scope, dsConfig, entity, qp, resolve, reject);

							waitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, entity, qp, resolve, reject);
				}

			});

		};

		this.update = function (data, noTrans) {
			if(isNoView) throw "update operation not supported on entities of type NoView";

			return entity.noUpdate(data, noTrans);
		};

		this.destroy = function (data, noTrans, filters) {
			if(isNoView) throw "destroy operation not supported on entities of type NoView";

			return entity.noDestroy(data, noTrans, filters);
		};

		this.one = function (id) {
			function requestData(scope, config, entity, resolve, reject) {
				var params = [], filterValues;

				if(id) {
					filterValues = {};
					filterValues[config.primaryKey] = id;
				} else if(dsConfig.lookup) {
					filterValues = $injector.get(dsConfig.lookup.source, _scope);

				} else if(dsConfig.filter) {
					filterValues = new noInfoPath.data.NoFilters(noDynamicFilters.configure(config, _scope));
				}

				if(entity.constructor.name === "NoView") {
					params[0] = filterValues;
					params[1] = config.primaryKey;
				} else {
					params[0] = filterValues;
				}

				return entity.noOne.apply(entity, params)
					.then(function (data) {
						resolve(data);
					})
					.catch(function (err) {
						reject(err);
					});

			}


			return $q(function (resolve, reject) {
				var endWaitFor;
				/*
				 *	@property noDataSource.waitFor
				 *
				 *	Use this property when you want the data source wait for some other
				 *	NoInfoPath component to update the `scope`.
				 */
				if(dsConfig.waitFor) {
					endWaitFor = _scope.$watch(dsConfig.waitFor.property, function (newval, oldval, scope) {
						if(newval) {
							requestData(scope, dsConfig, entity, resolve, reject);
							endWaitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, entity, resolve, reject);
				}

			});

		};

	}

	angular.module("noinfopath.data")

	.service("noDataSource", ["$injector", "$q", "noDynamicFilters", "noCalculatedFields", function ($injector, $q, noDynamicFilters, noCalculatedFields) {
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
		this.create = function (dsConfig, scope, watch) {
			return new NoDataSource($injector, $q, noDynamicFilters, dsConfig, scope, noCalculatedFields, watch);
		};
	}]);


})(angular);

//misc.js
(function (angular, undefined) {
	angular.module("noinfopath.data")
		.service("noFullName", [function () {
			var temp;

			function parse(inval) {
				temp = inval.split(" ");
			}

			this.firstName = function (fullName) {
				parse(fullName);
				if(temp && temp.length > 0) {
					return temp[0];
				} else {
					return "";
				}
			};

			this.lastName = function (fullName) {
				parse(fullName);
				if(temp && temp.length > 1) {
					return temp[1];
				} else {
					return "";
				}
			};
	}])

	/*
	 *	noDateFunctions Service
	 *
	 *	```json
	 *	"calculatedFields":[{
	 *		"field": "Days",
	 *		"parser": {
	 *			"provider": "noDateFunctions",
	 *			"method": "dateDiff",
	 *			"fields": {
	 *				"date1": "ObservationDate",
	 *				"date2": "HarvestDate"
	 *			}
	 *		}
	 *	}]
	 *	```
	 */

	.service("noCalculatedFields", [function () {

		function timespanDays(parserCfg, data) {
			var d1 = data[parserCfg.parser.fields.date1] ? new Date(data[parserCfg.parser.fields.date1]) : "",
				d2 = data[parserCfg.parser.fields.date2] ? new Date(data[parserCfg.parser.fields.date2]) : "",
				rd;

			if(angular.isDate(d1) && angular.isDate(d2)) {
				rd = (d1 - d2) / 1000 / 60 / 60 / 24;
			}

			return rd;
		}

		function timespanHours(parserCfg, data){
			var d1 = data[parserCfg.parser.fields.date1] ? moment(new Date(data[parserCfg.parser.fields.date1])) : "",
				d2 = data[parserCfg.parser.fields.date2] ? moment(new Date(data[parserCfg.parser.fields.date2])) : "",
				rd;

				if(d1.isValid() && d2.isValid()) {
					rd = d1.diff(d2, 'hours', true);
					rd = Math.round(rd * 100) / 100; // moment does not round when diffing. It floors.
				}

			return rd;
		}

		var fns = {
			"timespanDays": timespanDays,
			"timespanHours": timespanHours
		};

		this.calculate = function (dsConfig, data) {

			var calculatedFields = dsConfig.calculatedFields;

			if(calculatedFields && calculatedFields.length && data && data.length) {

				for(var d = 0; d < data.length; d++) {
					var datum = data[d];

					for(var i = 0; i < calculatedFields.length; i++) {
						var cf = calculatedFields[i],
							provider = cf.parser.provider ? $injector.get(cf.parser.provider) : fns,
							method = provider[cf.parser.method];

						datum[cf.field] = method(cf, datum);
					}
				}
			}

			return data;

		};
	}])

	;
})(angular);

//dynamic-filter.js
(function (angular, undefined) {
	"use strict";

	function NoDynamicFilterService($injector) {
		/*
		 *	@method normalizeFilterValue
		 *
		 *	Evaluates the type parameter looking for know types, and converts
		 *	converts the value parameter to explicitly be of the type provied.
		 *
		 *	If the type is not a supported type then value is returned unchanged.
		 */
		function normalizeFilterValue(value, type) {
			var outval = value;
			switch(type) {
				case "date":
					outval = noInfoPath.toDbDate(value);
					break;
				case "number":
					outval = Number(value);
					break;
				default:
					break;
			}
			return outval;
		}

		function resolveValueSource(valueCfg, scope) {
			var source, tmp = {};

			if(valueCfg.source) {
				if(["$rootScope", "$stateParams"].indexOf(valueCfg.source) > -1 || valueCfg.source !== "scope") {
					source = $injector.get(valueCfg.source);
				} else {
					source = scope;
				}
			}

			return source;
		}

		function resolveParams(prov, valueCfg) {
			var val, meth;

			if(valueCfg.method) {
				meth = prov[valueCfg.method];
				val = meth();
			} else if(valueCfg.property) {
				val = noInfoPath.getItem(prov, valueCfg.property);
			}

			return val;
		}

		// function resolveParams(valueCfg) {
		// 	var params = [];
		//
		// 	if(valueCfg.params) {
		// 		for(var i=0; i < valueCfg.params.length, i++) {
		// 			var param = valueCfg.params[i];
		//
		// 			if(angular.isObject(param)) {
		// 				var source = resolveValueSource(param, scope);
		// 			} else {
		//
		// 			}
		// 		}
		//
		// 	}
		// }

		/*
		 *	@method configureFilterWatch
		 *
		 *	If the filterCfg parameter's value property, has a watch property, and
		 *	the value's source property is an AngularJS  observable object
		 *	a watch is configured on the source. The cb parameter is used
		 *	for the watch's callback.
		 *
		 *	When the source is "scope", the scope parameter is used, otherwise
		 *	the source is injected using the $injector service.
		 *
		 *	> NOTE: Currently $rootScope is the only supported injectable source.
		 */
		function configureValueWatch(dsConfig, filterCfg, value, source, cb) {
			if(source && source.$watch && value.watch && cb) {
				if(value.default) noInfoPath.setItem(source, value.property, value.default);

				var filter = angular.copy(filterCfg);
				source.$watch(value.property, cb.bind(filter, dsConfig, filterCfg, value));
			}
		}

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
		 *   > property set to `scope` then use the directives scope variable.
		 *   > Otherwise assume source is an injectable.
		 */
		function resolveFilterValues(dsConfig, filters, scope, watchCB) {
			var values = {}, compoundValues = [];
			/*
			 *	@property noDataSource.filter
			 *
			 *	An array of NoInfoPath dynamic filters. Each filter defines what
			 *	the provider of the filter data is, and what property to filter on.
			 *
			 *	The filter property has a child property called `value`. When it
			 *	is an object then a dynamic filter is assumed. Otherwise it is treated
			 *	as the filter value.
			 *
			 *	When `value` is an object it is expected to have a `source` and a
			 *	`property` property. Source is always a string that is either the
			 *	string "scope" or the name of an AngularJS injectable service that
			 *	is a JavaScript object. Possible services could be $rootScope or $stateParams.
			 */
			for(var f in filters) {
				var filter = filters[f],
					source, value;
				if(angular.isObject(filter.value)) {
					if(angular.isArray(filter.value)) {
						if(noInfoPath.isCompoundFilter(filter.field)){
							for(var vi=0; vi < filter.value.length; vi++){
								var valObj = filter.value[vi];
								source = resolveValueSource(valObj, scope);
								if(source) {
									if(valObj.watch) {
										configureValueWatch(dsConfig, filter, valObj, source, watchCB);
										compoundValues.push(normalizeFilterValue(noInfoPath.getItem(source, valObj.property), valObj.type));
									} else {
										//The following is a hack. This is needs to replacedw with a Generic
										//ParameterResolver in the future.
										var meth = source[valObj.method]
										if(valObj.method) {
											compoundValues.push(source[valObj.method](scope));
										} else if(valObj.property){
											compoundValues.push(source[valObj.property]);
										} else {
											console.warn("Need to implent the source is not a function case.", source);
										}
										//var tmp = resolveValue(source, valObj);
										//compoundValues.push(tmp);
									}
								} else {
									compoundValues.push(valObj);
								}
							}
							//Will assume guids and wrap them in quotes
							values[filter.field] = compoundValues;
						}else{
							values[filter.field] = normalizeFilterValue(filter.value); // in statement
						}
					} else {
						source = resolveValueSource(filter.value, scope);
						configureValueWatch(dsConfig, filter, filter.value, source, watchCB);
						values[filter.field] = normalizeFilterValue(noInfoPath.getItem(source, filter.value.property), filter.value.type);
					}
				} else {
					values[filter.field] = normalizeFilterValue(filter.value);
				}
			}
			return values;
		}

		function makeFilters(dsConfig, scope, watchCB) {
			var filters = [],
				filterValues;
			if(dsConfig.filter) {
				filterValues = resolveFilterValues(dsConfig, dsConfig.filter, scope, watchCB);
				for(var f in dsConfig.filter) {
					var filter = dsConfig.filter[f],
						value;
					if(angular.isObject(filter.value)) {

						if(angular.isArray(filter.value) && !noInfoPath.isCompoundFilter(filter.field)) {
							value = filter.value; // in statement
						} else {
							value = filterValues[filter.field];
						}
					} else {
						value = filter.value;
					}
					filters.push({
						field: filter.field,
						operator: filter.operator,
						value: value
					});
				}
			}
			return filters.length ? filters : undefined;
		}
		//this.resolveFilterValues = resolveFilterValues;
		this.configure = makeFilters;
	}

	angular.module("noinfopath.data")
		.service("noDynamicFilters", ["$injector", NoDynamicFilterService]);
})(angular);

//template-cache.js
/*
 *	NoInfoPath abstraction of $templateCache. Added the actual $http calls that are
 *	inferred in the documentation or perform by ngInclude.
 */
(function (angular, undefined) {
	angular.module("noinfopath.data")
		.service("noTemplateCache", ["$q", "$templateRequest", "$templateCache", function ($q, $templateRequest, $templateCache) {
			this.get = function (url) {

				return $q(function (resolve, reject) {
					var tmp = $templateCache.get(url);

					if(tmp) {
						resolve(tmp);
					} else {
						$templateRequest(url)
							.then($templateCache.get.bind(this, url))
							.then(resolve)
							.catch(reject);
					}
				});
			};
		}]);
})(angular);

//mock-http.js
(function (angular, undefined) {
	"use strict";

	function NoMockHTTPService($injector, $q, $rootScope, noLogService) {
		var THIS = this;

		this.whenReady = function (tables) {

			return $q(function (resolve, reject) {
				if($rootScope.noMockHTTPInitialized) {
					noLogService.log("noMockHTTP Ready.");
					resolve();
				} else {
					$rootScope.$watch("noMockHTTPServiceInitialized", function (newval) {
						if(newval) {
							noLogService.log("noMockHTTP ready.");
							resolve();
						}
					});

				}
			});
		};

		this.configure = function (noUser, schema) {
			var jsonDataProvider = $injector.get(schema.config.dataProvider);
			return $q(function (resolve, reject) {
				for(var t in schema.tables) {
					var table = schema.tables[t];
					THIS[t] = new NoTable($q, t, table, jsonDataProvider[t]);
				}
				$rootScope.noHTTPInitialized = true;
				noLogService.log("noMockHTTP_" + schema.config.dbName + " ready.");

				$rootScope["noMockHTTP_" + schema.config.dbName] = THIS;

				resolve(THIS);
			});

		};

		this.getDatabase = function (databaseName) {
			return $rootScope["noMockHTTP_" + databaseName];
		};

	}

	function NoTable($q, tableName, table, data) {
		var THIS = this,
			_table = table,
			_data = data;

		Object.defineProperties(this, {
			entity: {
				get: function () {
					return _table;
				}
			}
		});

		this.noCreate = function (data) {

			return $q.when({});
		};

		this.noRead = function () {
			return $q.when(new noInfoPath.data.NoResults(data));
		};

		this.noUpdate = function (data) {

			return $q.when({});

		};

		this.noDestroy = function (data) {
			return $q.when("200");
		};

		this.noOne = function (query) {
			return $q.when({});

		};
	}


	angular.module('noinfopath.data')

	.provider("noMockHTTP", [function () {
		this.$get = ['$injector', '$q', '$rootScope', 'noLogService', function ($injector, $q, $rootScope, noLogService) {
			return new NoMockHTTPService($injector, $q, $rootScope, noLogService);
			}];
		}]);
})(angular);

//file-storage.js
(function () {
	"use strict";


	function NoLocalFileStorageService($q, noDataSource) {

		/**
		 *	@method cache(file)
		 *
		 *	Saves a file to the noDataSource defined in the config object.
		 *
		 *	> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.
		 *
		 */
		this.cache = function saveToCache(fileObj) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID",
				"noTransaction": {
					"create": true,
					"update": true,
					"destroy": true
				}
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.create(fileObj);
		};

		/**
		 *	@method cache(file)
		 *
		 *	Saves a file to the noDataSource defined in the config object.
		 *
		 *	> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.
		 *
		 */
		this.get = function loadFromCache(fileID) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID"
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.one(fileID);
		};

		/**
		 *	@method removeFromCache(file)
		 *
		 *	Deletes a file by FileID from the NoInfoPath_FileUploadCache.
		 */
		this.removeFromCache = function (fileID) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID",
				"noTransaction": {
					"create": true,
					"update": true,
					"destroy": true
				}
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.destroy(fileID);
		};

		/**
		 *	@method read(file)
		 *
		 *	Reads a file from a DOM File object and converts to a binary
		 *	string compatible with the local, and upstream file systems.
		 */
		this.read = function (file, comp) {
			var deferred = $q.defer();

			var fileObj = {},
				reader = new FileReader();

			reader.onloadstart = function(e) {
				fileObj.name = file.name;
				fileObj.size = file.size;
				fileObj.type = file.type;
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};


			reader.onload = function (e) {
				fileObj.blob = e.target.result;

				deferred.resolve(fileObj);
			};

			reader.onerror = function (err) {
				deferred.reject(err);
			};

			reader.onprogress = function (e) {
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader.readAsBinaryString(file);
			//reader[comp.readMethod || "readAsArrayBuffer"](file);
			//reader.readAsArrayBuffer(file);

			return deferred.promise;
		};

	}


	angular.module("noinfopath.data")
		.service("noLocalFileStorage", ["$q", "noDataSource", NoLocalFileStorageService]);

})();

(function(angular, storageInfo, requestFileSystem, undefined) {
    function NoLocalFileSystemService($q, noLocalFileStorage, noMimeTypes) {

        var requestedBytes = 1024 * 1024 * 280,
        	fileSystem;


        function _requestStorageQuota() {

            return $q(function(resolve, reject) {
                storageInfo.requestQuota(
                    requestedBytes,
                    function(grantedBytes) {
                        console.log('we were granted ', grantedBytes, 'bytes');
                        resolve(grantedBytes);
                    },
                    function(e) {
                        console.log('Error', e);
                        reject(e);
                    }
                );
            });


        }
        this.requestStorageQuota = _requestStorageQuota;

        function _requestFileSystem() {
            var deferred = $q.defer();

            requestFileSystem(
                window.TEMPORARY,
                requestedBytes,
                function(fs) {
                    fileSystem = fs;
                    deferred.resolve(fs);
                },
                function(e) {
                    deferred.reject(e);
                }
            );

            return deferred.promise;
        }
        this.requestFileSystem = _requestFileSystem;

		function str2ab(str) {
		  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
		  var bufView = new Uint8Array(buf);
		  for (var i=0, strLen=str.length; i<strLen; i++) {
		    bufView[i] = str.charCodeAt(i);
		  }
		  return buf;
		}

        function _save(fileObj) {

            return $q(function(resolve, reject) {
				var path = fileObj.FileID + "." + noMimeTypes.fromMimeType(fileObj.type)
                if (!fileSystem) reject();

                fileSystem.root.getFile(path, {
                    create: true
                }, function(fileEntry) {
                    fileEntry.createWriter(function(writer) {
						var arr = [str2ab(fileObj.blob)],
							blob = new Blob(arr, {type: fileObj.type});
                        writer.write(blob);

						 resolve(fileObj);
                    }, reject);
                }, reject);
            });

        }
        this.save = _save;

        function _read(fileObj) {
            return $q(function(resolve, reject) {
				var path = fileObj.FileID + "." + noMimeTypes.fromMimeType(fileObj.type);
                if (!fileSystem) reject();

                fileSystem.root.getFile(path, null, function(fileEntry) {
                    resolve({fileObj: fileObj, fileEntry: fileEntry});
                }, reject);
            });

        }
        this.read = _read;

		function _toUrl(fileObj) {
			return noLocalFileStorage.get(angular.isObject(fileObj) ? fileObj.FileID : fileObj)
				.then(_save)
				.then(_read)
				.then(function(result){
					result.url = result.fileEntry.toURL();
					return result;
				})
				.catch(function(err){
					console.error(err);
				});
		}
		this.getUrl = _toUrl;
    }

	function NoMimeTypeService() {
		var mimeTypes = {
                'a': 'application/octet-stream',
                'ai': 'application/postscript',
                'aif': 'audio/x-aiff',
                'aifc': 'audio/x-aiff',
                'aiff': 'audio/x-aiff',
                'au': 'audio/basic',
                'avi': 'video/x-msvideo',
                'bat': 'text/plain',
                'bin': 'application/octet-stream',
                'bmp': 'image/x-ms-bmp',
                'c': 'text/plain',
                'cdf': 'application/x-cdf',
                'csh': 'application/x-csh',
                'css': 'text/css',
				'csv': 'text/csv',
                'dll': 'application/octet-stream',
                'doc': 'application/msword',
                'dvi': 'application/x-dvi',
                'eml': 'message/rfc822',
                'eps': 'application/postscript',
                'etx': 'text/x-setext',
                'exe': 'application/octet-stream',
                'gif': 'image/gif',
                'gtar': 'application/x-gtar',
                'h': 'text/plain',
                'hdf': 'application/x-hdf',
                'htm': 'text/html',
                'html': 'text/html',
                'jpe': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'jpg': 'image/jpeg',
                'js': 'application/x-javascript',
                'ksh': 'text/plain',
                'latex': 'application/x-latex',
                'm1v': 'video/mpeg',
                'man': 'application/x-troff-man',
                'me': 'application/x-troff-me',
                'mht': 'message/rfc822',
                'mhtml': 'message/rfc822',
                'mif': 'application/x-mif',
                'mov': 'video/quicktime',
                'movie': 'video/x-sgi-movie',
                'mp2': 'audio/mpeg',
                'mp3': 'audio/mpeg',
                'mp4': 'video/mp4',
                'mpa': 'video/mpeg',
                'mpe': 'video/mpeg',
                'mpeg': 'video/mpeg',
                'mpg': 'video/mpeg',
                'ms': 'application/x-troff-ms',
                'nc': 'application/x-netcdf',
                'nws': 'message/rfc822',
                'o': 'application/octet-stream',
                'obj': 'application/octet-stream',
                'oda': 'application/oda',
                'pbm': 'image/x-portable-bitmap',
                'pdf': 'application/pdf',
                'pfx': 'application/x-pkcs12',
                'pgm': 'image/x-portable-graymap',
                'png': 'image/png',
                'pnm': 'image/x-portable-anymap',
                'pot': 'application/vnd.ms-powerpoint',
                'ppa': 'application/vnd.ms-powerpoint',
                'ppm': 'image/x-portable-pixmap',
                'pps': 'application/vnd.ms-powerpoint',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.ms-powerpoint',
                'ps': 'application/postscript',
                'pwz': 'application/vnd.ms-powerpoint',
                'py': 'text/x-python',
                'pyc': 'application/x-python-code',
                'pyo': 'application/x-python-code',
                'qt': 'video/quicktime',
                'ra': 'audio/x-pn-realaudio',
                'ram': 'application/x-pn-realaudio',
                'ras': 'image/x-cmu-raster',
                'rdf': 'application/xml',
                'rgb': 'image/x-rgb',
                'roff': 'application/x-troff',
                'rtx': 'text/richtext',
                'sgm': 'text/x-sgml',
                'sgml': 'text/x-sgml',
                'sh': 'application/x-sh',
                'shar': 'application/x-shar',
                'snd': 'audio/basic',
                'so': 'application/octet-stream',
                'src': 'application/x-wais-source',
                'swf': 'application/x-shockwave-flash',
                't': 'application/x-troff',
                'tar': 'application/x-tar',
                'tcl': 'application/x-tcl',
                'tex': 'application/x-tex',
                'texi': 'application/x-texinfo',
                'texinfo': 'application/x-texinfo',
                'tif': 'image/tiff',
                'tiff': 'image/tiff',
                'tr': 'application/x-troff',
                'tsv': 'text/tab-separated-values',
                'txt': 'text/plain',
                'ustar': 'application/x-ustar',
                'vcf': 'text/x-vcard',
                'wav': 'audio/x-wav',
                'wsdl': 'application/xml',
                'xbm': 'image/x-xbitmap',
                'xlb': 'application/vnd.ms-excel',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'xml': 'text/xml',
                'xpdl': 'application/xml',
                'xpm': 'image/x-xpixmap',
                'xsl': 'application/xml',
                'xwd': 'image/x-xwindowdump',
                'zip': 'application/zip'
            },
			mimeTypesInverted = {};

		for(var m in mimeTypes) {
			var mime = mimeTypes[m];
			mimeTypesInverted[mime] = m;
		}

		this.fromExtention = function(ext) {
			return mimeTypes[ext];
		}

		this.fromMimeType = function(mimeType) {
			return mimeTypesInverted[mimeType];
		}
    }


    angular.module("noinfopath.data")
		.service("noMimeTypes", [NoMimeTypeService])
        .service("noLocalFileSystem", ["$q", "noLocalFileStorage", "noMimeTypes", NoLocalFileSystemService])
		;
})(angular, navigator.webkitPersistentStorage, window.requestFileSystem || window.webkitRequestFileSystem)
