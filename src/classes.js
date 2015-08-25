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

			var sqlOrder = "ORDER BY ";

			this.forEach(function(o, index, array){

				sqlOrder += o.toSQL();

				if (array.length > (index + 1))

				{
				
				//JAG: This does not work.  You are creating a trialing comma that
				//will cause an error on the WebSql side.  Better approach,
				//develop an array of strings then use the `.join` function
				//outside of the loop.
					sqlOrder += ", ";
				}

			});

			return sqlOrder += ";";
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

		arr.push.apply(arr, arguments);

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

	function NoTransactions(){
		Object.defineProperties(this, {
			"__type": {
				"get" : function(){
					return "NoTransactions";
				}
			}
		});

		this.add = function(){
			this.unshift(new NoTransaction());
		}
	}
	NoTransactions.prototype = Object.create(Array.prototype);

	function NoTransaction(userID){
		Object.defineProperties(this, {
			"__type": {
				"get" : function(){
					return "NoTransaction";
				}
			}
		});

		// this.transactionID = new GUID(); GET THIS CODE MIGRATED INTO NOINFOPATH DATA
		this.timestamp = new Date();
		this.userID = userID;
		this.changeset = new NoChangeSet(tableName);
	}

	function NoChangeSet(tableName){
		Object.defineProperties(this, {
			"__type": {
				"get" : function(){
					return "NoChangeSet";
				}
			}
		});

		this.tableName = tableName;
		
	}

	function NoChanges(){
		Object.defineProperties(this, {
			"__type": {
				"get" : function(){
					return "NoChanges";
				}
			}
		});

		this.add = function(){
			this.unshift(new NoChange(changeType, changeObject, relatedChangeSet));
		}
	}
	NoChanges.prototype = Object.create(Array.prototype);

	function NoChange(changeType, changeObject, relatedChangeSet){
		Object.defineProperties(this, {
			"__type": {
				"get" : function(){
					return "NoChange";
				}
			}
		});	

		this.changeType = changeType;
		this.changeObject = changeObject;
		this.relatedChangeSet = new noChangeSet(tableName);
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
			NoTransactions: NoTransactions,
			NoTransaction: NoTransaction,
			NoChangeSet: NoChangeSet,
			NoChanges: NoChanges,
			NoChange: NoChange
		};

	noInfoPath.data = angular.extend(noInfoPath.data, _interface);

})(angular);