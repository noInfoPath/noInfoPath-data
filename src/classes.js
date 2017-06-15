//classes.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.74*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 * NoInfoPath Data Classes
 * -----------------------
 *
 * TODO: Description
 *
 * |
 *
 * ### @class NoFilterExpression : Object
 *
 * Represents an single filter expression that can be applied to an `IDBObjectStore`.
 *
 * #### Constructor
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
 * #### Properties
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
			"in": "in",
			"fulltext": "fulltext"
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
			"contains": function (v, msOdata) {
				return true ? "substringof(" + normalizeValue(v) + ", {0})" : "{0} has " + normalizeValue("%" + v + "%");
			},
			"notcontains": function (v, msOdata) {
				return true ? "not substringof(" + normalizeValue(v) + ", {0})" : "not {0} has " + normalizeValue("%" + v + "%");
			},
			"startswith": function (v) {
				return "startswith(" + "{0}, " + normalizeValue(v) + ")";
			},
			"endswith": function (v) {
				return "endswith(" + "{0}, " + normalizeValue(v) + ")";
			},
			"in": function(v) {
				return "{0} in (" + normalizeValue(v) + ")";
			},
			"fulltext": function(v) {
				return "fulltext('{0}', " + normalizeValue(v) + ")"
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

	function NoFilterExpression(operator, value, logic, msOdata) {

		if(!operator) throw "INoFilterExpression requires a operator to filter by.";
		//if (!value) throw "INoFilterExpression requires a value(s) to filter for.";


		this.operator = operator;
		this.value = value;
		this.logic = logic;




		this.toODATA = function () {
			var opFn = normalizeOdataOperator(this.operator, this.msOdata),
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

				if(fltr.logic && this.length > 1 && fi !== this.length-1 ) os = os + " " + fltr.logic + " ";

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

		this.toQueryString = function () {
			var ra = [];
			for(var j = 0; j < this.length; j++) {
				var f = this[j];

				ra.push(f.toQueryString());
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

			var tmp = new NoFilter(column, logic, beginning, end, filters, this.msOdata);

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
	function NoFilter(column, logic, beginning, end, filters, msOdata) {
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
		this.msOdata = msOdata;

		angular.forEach(filters, function (value, key) {
			this.filters.push(new NoFilterExpression(value.operator, value.value, value.logic, this.msOdata));
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

			if(this.filters.length > 1) {
				if(this.beginning) os = "(" + os;
				if(this.end) os = os + ")";
			}

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

		this.toQueryString = function () {
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

			var filters = [];

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

				filters.push(newFilter);
			}
			return filters;
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
			}  else {
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
			"__type": {
				"get": function() {
					return "NoResults";
				}
			},
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
					var s = !angular.isArray(_page) ? [_page] : _page,
						o = [];

					s.forEach(function(e, i){
						o[i] = e;
					});

					return o;
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

	function NoReadOptions(options) {
		var ops = options || {};

		Object.defineProperties(this, {
			"__type": {
				"get": function () {
					return "NoReadOptions";
				}
			}
		});

		this.followForeignKeys = ops.followForeignKeys || true;
		this.followRelations = ops.followRelations || false;
		this.followParentKeys = ops.followParentKeys || true;
		this.deepFollowParentKeys = ops.deepFollowParentKeys || false;
		this.deepFollowRelations = ops.deepFollowRelations || false;
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
		NoResults: NoResults,
		NoReadOptions: NoReadOptions
	};

	noInfoPath.data = angular.extend(noInfoPath.data, _interface);

})(angular);
