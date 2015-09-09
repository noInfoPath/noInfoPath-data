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
*/

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

			if(!sqlOperators[operator]) throw "NoFilters::NoFilterExpression required a valid operator";

			if(angular.isString(value)){
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
	* ####NoFilters()
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
	function NoFilters(kendoFilter){
		var arr = [];

		Object.defineProperties(this, {
			"__type": {
				"get": function(){
					return "NoFilters";
				}
			}
		});

		noInfoPath.setPrototypeOf(this, arr);

		//filter { logic: "and", filters: [ { field: "name", operator: "startswith", value: "Jane" } ] }
		//{"take":10,"skip":0,"page":1,"pageSize":10,"filter":{"logic":"and","filters":[{"value":"apple","operator":"startswith","ignoreCase":true}]}}

		if(kendoFilter){
			for(var i in kendoFilter.filters){
				var filter = kendoFilter.filters[i],
					fe = new NoFilterExpression(filter.operator, filter.value),
					f = new NoFilter(filter.field, kendoFilter.logic, true, true, [fe]);

					this.unshift(f);
			}
		}
		//arr.push.apply(arr, arguments);

		this.toSQL = function(){
			var rs = "",
			rsArray = [];

			angular.forEach(this, function(value, key){

				if(this.length == key + 1){
					value.logic = null;
				}

				rsArray.push(value.toSQL());
			}, this);

			rs = rsArray.join("");

			return rs;
		};

		this.add = function(column, logic, beginning, end, filters) {
			if(!column) throw "NoFilters::add requires a column to filter on.";
			if(!filters) throw "NoFilters::add requires a value(s) to filter for.";

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
	function NoFilter(column, logic, beginning, end, filters){
		Object.defineProperties(this, {
			"__type": {
				"get": function(){
					return "NoFilter";
				}
			}
		});

		this.column = column;
		this.logic = logic;
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

	function NoSort() {
		var arr = [ ];

		Object.defineProperties(arr, {
			"__type": {
				"get": function(){
					return "NoSort";
				}
			}
		});

		arr.push.apply(arr, arguments.length ? arguments[0] : []);
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

	function NoPage(skip, take) {
		Object.defineProperties(this, {
			"__type": {
				"get": function(){
					return "NoPage";
				}
			}
		});

		this.skip = skip;
		this.take = take;
	}

	function NoResults(arrayOfThings){
		//Capture the length of the arrayOfThings before any changes are made to it.
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
			if(!nopage) throw "nopage is a required parameter for NoResults::page";
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
