//globals.js
/*
	*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
	*
	*	NoInfoPath Data (noinfopath-data)
	*	=============================================
	*
	*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
	*
	*	Copyright (c) 2017 The NoInfoPath Group, LLC.
	*
	*	Licensed under the MIT License. (MIT)
	*	___
	*
	*	Overview
	*	--------
	*
	*	NoInfoPath Data provides serveral service that all an application to
	*	interact with the various local storage systems found in HTML5 compliant
	*	Web browsers.
	*
	*	### Installation
	*
	*	> npm install @noinfopath/noinfopath-data
	*
	*	### Services
	*
	*	|Name|Description|
	*	|----|-----------|
	*	|[noDataSource](data-source)|Provides a abstracted CRUD interface that sits in front of actual NoInfoPath CRUD provider services.|
	*	|[noFileStoreageCRUD](file-storage)|Establishes a CRUD interface in front of `noLocalFileStorage`.|
	*	|[noHTTP](http)|Establishes a CRUD interface in front of the AngularJS `$http` service|
	*	|[noIndexedDb](indexeddb)|Prodvides a CRUD interface for the Browser's native IndexedDB database. (Not fully supported by all browsers.)|
	*	|[noLocalFileStorage](no-local-file-storage)|Reads a File object retrieved from a standard `input:file` element and saves the data to an IndexedDB object store called NoInfoPath_FileUploadCache. The file blob is stored as `binary string`|
	*	|[noLocalFileSystem](file-storage)|Stores files within the Brower's Temporary Local File System.|
	*	|[noLocalStorage](storage)|Provides access to the Browser's localStorage service.|
	*	|[noMimeTypes](no-local-file-storage)|Helper service that returns a mime type given a file extention and vice versa.|
	*	|[noSessionStorage](storage)|Provides access to the Browser's sessionStorage service.|
	*	|[noTemplateCache](template-cache)|Sits in front of Angular Template cache, but allows files to be retrieve directly without using `ngInclude` or a directives `templateUrl` property.|
	*	|[noTransactionCache](transaction-cache)|Manages data transaction by tracking changes made by a CRUD provider service, and stores the changes in the NoInfoPath_Changes object store.|
	*	|[noWebSQL](websql-2)|Provides a CRUD interface for the Browser's native WebSQL database. (Not supported by all Browsers.)|
	*
	*	### [Helper Functions](helper-functions)
	*
	*	NoInfoPath Data exposes several helper function on the global noInfoPath object
	*	that is placed on the browser's instrinsic `window` object.
	*
	*	|Name|Description|
	*	|----|-----------|
	*	|digest|Deprecated; will be removed in a future release.|
	*	|digestError|Deprecated; will be removed in a future release.|
	*	|digestTimeout|Deprecated; will be removed in a future release.|
	*	|fromScopeSafeGuid|Convertes a "Scope Safe GUID" to a standard GUID.|
	*	|getItem(store, key)|Using the parameters provided, retrieves a value from the `store` using the `key`.|
	*	|isCompoundFilter|Checks the provided `indexName` for a string that match the compound key format.|
	*	|setItem(store, key, value)|Sets the `value`, on the `store` using the `key`.|
	*	|toDbDate(date)|Converts a JavaScript Date to a database compliant date String.|
	*	|toDisplayDate|Converts a JavaScript Date to a human readable date string.|
	*	|toScopeSafeGuid|Converts standards GUID to one that is safe to use as a property name in a JavaScript Object.|
	*	|resolveID|Creates and returns a NoFilters object.|
	*
	*	### [Classes](classes)
	*
	*	|Name|Description|
	*	|----|-----------|
	*	|NoDataModel|TODO|
	*	|NoFilter|TODO|
	*	|NoFilters|TODO|
	*	|NoFilterExpression|TODO|
	*	|NoPage|TODO|
	*	|NoReadOptions|TODO|
	*	|NoResults|TODO|
	*	|NoSort|TODO|
	*	|NoSortExpression|TODO|
*/

(noInfoPath.data = {});
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath', 'noinfopath.helpers', 'noinfopath.user'])
	;
})(angular);

angular.module("noinfopath.data")

/*
	*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
	*
	*	___
	*
	*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
	*
	*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
	*
	*	Copyright (c) 2017 The NoInfoPath Group, LLC.
	*
	*	Licensed under the MIT License. (MIT)
	*
	*	___
	*
	*	Helper Functions
	*	----------------
	*
	*	NoInfoPath Data exposes several helper function on the global noInfoPath object
	*	that is placed on the browser's instrinsic `window` object.
*/
.run(['$injector', '$parse', '$timeout', '$q', '$rootScope', '$browser', '$filter', "lodash", function ($injector, $parse, $timeout, $q, $rootScope, $browser, $filter, _) {
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

	function _digestError(fn, error) {
		var digestError = error;

		if(angular.isObject(error)) {
			digestError = error.toString();
		}

		//console.error(digestError);

		_digest(fn, digestError);
	}

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

	/*
		*	### fromScopeSafeGuid(ssuid)
		*
		*	Given a GUID that was previously converted to a "Scope Safe GUID",
		*	converts the underscores back to dashes.
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|ssguid|String|A string that is a standard GUID with the dashes converted to underscores.|
		*
		*	#### Returns
		*	Return a GUID suitable for use in Microsoft code where a GUID is
		*	expected. Or, for use and `uniqueidentifier` in Microsoft SQL Server.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var ssguid = "d4cf39d2_df46_46be_9058_daa0cc060a29",
		*			result = noInfoPath.fromScopeSafeGuid(ssguid);
		*
		*		expect(result).toBe("d4cf39d2-df46-46be-9058-daa0cc060a29");
		*
		*	```
	*/
	function _fromScopeSafeGuid(ssguid) {
		return(ssguid || "").replace(/_/g, "-");
	}

	/*
		*	### isCompoundFilter(indexName)
		*
		*	Checks the provided `indexName` for a string that match the compound
		*	key format.  The format specifications is a plus sign separated
		*	list of field names, enclosed in square brackets.
		*
		*	`(i.e "[key1+key2]" or "[key1+key2+key3]", etc.)`
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|indexName|String|A string the meets the index name format specifications.|
		*
		*	#### Returns
		*	True is the string matches the pattern.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var indexName = "[color+size]",
		8			result = noInfoPath.isCompoundFilter(indexName);
		*
		*		expect(result).toBeTrue();
		*
		*	```
	*/
	function _isCompoundFilter(indexName) {
		return indexName.match(/^\[.*\+.*\]$/gi);
	}

	/*
		*	### getItem(store, key)
		*
		*	Using the parameters provided, retrieves a value from the `store` using the `key`.
		*	The value is retrieved using the AngularJS `$parse` service, which allows
		*	the use of dot separated keys. `$parse` will locate the value from a nested object
		*	based on the depth of the `key`.
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|store|Object|A javascript object from which the value is to be retrieved.|
		*	|key|String|An optionally dotted notation string that specifies where to get the `value` from the `store`.|
		*
		*	#### Returns
		*	A value of any type; `Object`, `Array`, `Function`, `String`, `Number`, `Boolean`, `Date`, `null` or `Undefined`.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var key = "foo.bar.test",
		*			store = {
		*				foo: {
		*					bar: {
		*						test: "Hello World"
		*					}
		*				}
		*			},
		*			value = "Hello World",
		*			result = noInfoPath.getItem(store, key);
		*
		*		expect(result).toBe("Hello World");
		*
		*	```
	*/
	function _getItem(store, key) {
		var getter = $parse(key);
		return getter(store);
	}

	/*
		*	### setItem(store, key, value)
		*
		*	Using the parameters provided, sets the `value`, on the `store` using the `key`.
		*	The value is set using the AngularJS `$parse` service, which allows
		*	the use of dot separated keys. `$parse` will create a nested object
		*	based on the depth of the `key`.
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|store|Object|A javascript object on which the value is to be store.|
		*	|key|String|An optionally dotted notation string that specifies where to set the `value` on the `store`.|
		*	|value|any|This can be a value of any type; Object, Array, Function, String, Number, Date, or Boolean|
		*
		*	#### Returns
		*	Undefined
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var key = "foo.bar.test",
		*			store = {},
		*			value = "Hello World";
		*
		*		//The expected operations should not fail with the error,
		*		//"Cannot access property `foo`, `bar` or `test` of `Undefined`."
		*		noInfoPath.setItem(store, key, value);
		*		expect(store.foo.bar.test).toBe("Hello World");
		*
		*		//Result object should resemble the following.
		*		var expected = {
		*			foo: {
		*				bar: {
		*					test: "Hello World"
		*				}
		*			}
		*		};
		*	```
	*/
	function _setItem(store, key, value) {
		var getter = $parse(key),
			setter = getter.assign;

		setter(store, value);
	}

	/*
		*	### toDbDate(date)
		*
		*	Using the `moment` NPM library, converts a JavaScript Date to a database compliant date String.
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|date|Date|A javascript Date object to be converted.|
		*
		*	#### Returns
		*	A String that is in  the following format: `YYYY-MM-DDTHH:mm:ss.sss`.
		*	If `date` is falsey or moment cannot parse the date provided,
		*	a `null` value is returned.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var d = new Date("3/6/2017 13:15:00"),
		*			result = noInfoPath.toDbDate(date)
		*
		*		expect(result).toBe("2017-03-06T18:15:00.000Z");
		*
		*	```
	*/
	function _toDbDate(date) {
		var dateResult;

		if(!date) {
			dateResult = null;
		} else {
			dateResult = moment.utc(date)
				.format("YYYY-MM-DDTHH:mm:ss.SSS");
		}

		if(dateResult === "Invalid date") {
			dateResult = null;
		}

		return dateResult;
	}

	/*
		*	### toDisplayDate(date)
		*
		*	Using the `moment` NPM library, converts a JavaScript Date to a
		*	human readable date string.
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|date|Date|A javascript Date object to be converted.|
		*	|format|String|(optional) Defines the format pattern to use when formatting the date|
		*
		*	#### Returns
		*	A String that is in the format `YYYY-MM-DD HH:mm:ss.sss` or the
		*	`format` pattern provided.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var d = new Date("3/6/2017 13:15:00"),
		*			result = noInfoPath.toDbDate(date)
		*
		*		expect(result).toBe("2017-03-06 18:15:00.000");
		*
		*	```
	*/
	function _toDisplayDate(date, format) {
		var dateResult = moment.utc(date)
			.format(format || "YYYY-MM-DD HH:mm:ss.sss");

		        
		return dateResult;
	}

	/*
		*	### toScopeSafeGuid(guid)
		*
		*	Given a standard GUID, return a "Scope Safe" GUID that can be used
		*	as a property name in an object or hash table. (See example for more details.)
		*	Because JavaScript does not allow dashes in property names, this
		*	function replaces the dashes with underscores.
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|guid|String|A string that is a standard GUID. (i.e `d4cf39d2-df46-46be-9058-daa0cc060a29`)|
		*
		*	#### Returns
		*
		*	Return a "Scope Safe" GUID suitable for use as a property name in
		*	a JavaScript object.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var guid = "d4cf39d2-df46-46be-9058-daa0cc060a29",
		*			result = noInfoPath.toScopeSafeGuid(guid);
		*
		*		expect(result).toBe("d4cf39d2_df46_46be_9058_daa0cc060a29");
		*
		*	```
	*/
	function _toScopeSafeGuid(guid) {
		return(guid || "").replace(/-/g, "_");
	}

	/*
		*	### resolveID(query, entityConfig)
		*
		*	When `query` is a number, a filter is created on the instrinsic
		*	filters object using the `rowid`  WebSQL column as the column
		*	to filter on. Query will be the target
		*	value of query.
		*
		*	When the `query` is a string it is assumed a table is being queried
		*	by it's primary key.
		*
		*	When `query` is an Object is tested for the existence of `__type`
		*	property, and that it is equal to "NoFilters". If it is then that
		*	is the return value.  If `query` is a plain JavaScript Object then
		*	it is expected to contain one or more name/value pairs (NVP).
		*
		*	When the entityConfig contain a primaryKey then the key value is
		*	extracted from the query object using the primaryKey name. Otherwise,
		*	all of the NVP's are added to the NoFilters object as "equal"
		*	operations, and all filters and'ed together.
		*
		* 	> Passing a string when the entity is a SQL View is not allowed.
		*
		*	#### Parameters
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|query|Number, String, or Object|The query data that needs to be resolved into a NoFilters instance.|
		*	|entityConfig|Object|A plain JavaScript Object that contains configuration information for the entity that is being queried.|
		*
		*	#### Returns
		*	An `NoFilters` object.
		*
		*	**Example**
		*
		*	```js
		*		//Given the following test data.
		*		var query = "d4cf39d2-df46-46be-9058-daa0cc060a29",
		*			entityConfig = {
		*				"entityName": "Contractors",
		*				"entityType": "T",
		*				"primaryKey": "ID",
		*				"foreignKeys": {},
		*				"columns": {},
		*				"indexes": [
		*					"ContractorName"
		*				]
		*			},
		*			result = noInfoPath.resolveID(query, entityConfig);
		*
		*		expect(result.__type).toBe("NoFilters");
		*
		*	```
	*/
	function _resolveID(query, entityConfig) {
		var filters = new noInfoPath.data.NoFilters();

		if(angular.isNumber(query)) {
			//Assume rowid
			filters.quickAdd("rowid", "eq", query);

		} else if(angular.isString(query)) {
			//Assume guid
			/*
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

//classes.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
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
			var tmp = [], groups = [], curGroup;

			for(var fi = 0; fi < this.length; fi++) {
				var fltr = this[fi];

				if(fltr.beginning) {
					curGroup = []
				}

				if(curGroup) curGroup.push(fltr);

				if(fltr.end) {
					groups.push(curGroup);
				}
			}


			if(groups.length > 0) {

				var parts = [];
				groups.forEach(function(group, gi){
					filters = group.map(function(filter, fi){

						var os = filter.toODATA();

						if(filter.logic && this.length > 1 && fi !== this.length-1 ) os = os + " " + filter.logic + " ";

						return os;
					}, group);

					parts.push("(" + filters.join("") + ")");

					if(gi !== groups.length-1) {
						parts.push(group[group.length - 1].logic);
					}


				});

				return parts.join(" ");

			} else {
				for(var fi = 0; fi < this.length; fi++) {
					var fltr = this[fi],
						os = fltr.toODATA();

					if(fltr.logic && this.length > 1 && fi !== this.length-1 ) os = os + " " + fltr.logic + " ";

					tmp.push(os);
				}

				tmp = tmp.join("");
				return tmp;
			}

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
			var tmp;

			if(arguments.length === 1 && column.__type === "NoFilter") {
				tmp = column;
			} else {
				if(!column) throw "NoFilters::add requires a column to filter on.";
				if(!filters) throw "NoFilters::add requires a value(s) to filter for.";
				tmp = new NoFilter(column, logic, beginning, end, filters, this.msOdata);
			}


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

(function (angular, undefined) {
	"use strict";

	/*
	 *	### Class NoDataModel
	 *
	 *  This class provides functionality to help other NoInfoPath services to
	 *	access and utilitze data in a consistant way. It provides a pristine
	 *	attribute to the data so a directive can 'roll back' a change, for example.
	 *
	 *	#### Properties
	 *
	 *	|Name|Type|Description|
	 *	|----|----|-----------|
	 *	|data|NoResults Object|Returns the data wrapped in a NoInfoPath NoResults object|
	 *	|pristine|NoResults Object|Returns the pristine data wrapped in a NoInfoPath NoResults object|
	 *	|__type|String|Returns the type of NoInfoPath object. In this case, it will return "NoDataModel"|
	 *
	 *	##### data
	 *
	 *	Returns an object that is saved within the NoDataModel.
	 *
	 *	##### pristine
	 *
	 *	Returns an object that is the pristine version of the data. This enables data rollbacks using the undo() method.
	 *
	 *	##### __type
	 *
	 *	Returns a string that explains that this is an object that was created by the NoDataModel class. Always returns "NoDataModel".
	 *
	 *
	 *	#### Methods
	 *
	 *	|Name|Description|
	 *	|----|-----------|
	 *  |clean()|Removes any Angular properties off the data object, and cleans up 'falsy' values to null|
	 *	|undo()|Sets the data property back to what is stored in the pristine property|
	 *	|update(data)|Updtes the data with a matching data object|
	 *
	 *	##### clean()
	 *
	 *	This method removes any Angular or Kendo data model properties off the data object. It also cleans up any
	 *	falsy values and returns them as null.
	 *
	 *	**Parameters**
	 *
	 *	None
	 *
	 *	**Returns**
	 *
	 *	Undefined
	 *
	 *	##### undo()
	 *
	 *	This method returns the value contained within the NoDataModel back to the current pristine value.
	 *
	 *	**Parameters**
	 *
	 *	None
	 *
	 *	##### update(data)
	 *
	 *	This method updates the data contained within the data model to the data being passed in.
	 *
	 *	**Parameters*
	 *
	 *	|Name|Type|Description|
	 *	|----|----|-----------|
	 *	|data|Object|An object that will be saved within NoDataModel|
	 *
	 *	data
	 *
	 *	An object that is to be saved within the NoDataModel object. This data does not need to be flat.
	 *
	 *	```js
	 *	{
	 *		PersonID: "6a2bfe0f-29da-440d-e5b9-62262ac0345c",
	 *		PersonFirstName: "Foo",
	 *		PersonLastName: "Bar",
	 *		PersonAge: 25,
	 *		Mother: {
	 *			PersonID: "54dd9168-0111-43e3-9db8-77dc33169b41",
	 *			PersonFirstName: "Bridget",
	 *			PersonLastName: "Bar",
	 *			PersonAge: 50
	 *    }
	 *  }
	 *  ```
	 *
	 *	**Returns**
	 *
	 *	Undefined
	 *
	 *
	 */

	 function _unfollow_data(data, schema) {
		var foreignKeys = schema.foreignKeys || {},
		 	outdata = angular.copy(data);

		 for (var fks in foreignKeys) {

			 var fk = foreignKeys[fks],
				 datum = data[fk.column];

			 if (datum) {
				 outdata[fk.column] = datum[fk.refColumn] || datum;
			 }
		 }

		 return outdata;
	 }

	 function _update_ngModelController(ctrl, value) {
		 ctrl.$setViewValue(value);
		 ctrl.$setPristine();
		 ctrl.$setUntouched();
		 ctrl.$render();
	 }

	 function _purify(schema, data) {
		 if(!schema || !schema.columns) throw "schema required for noDataModel::purify";
		 if(!data) throw "data required for noDataModel::purify";

		 var returnObj = {};

		 for(var key in schema.columns){
			 returnObj[key] = data[key];
		 }

		 return returnObj;
	 }

	function NoDataModel(schema, model) {
		if (!schema) throw new Error("schema is required contructor parameter.");
		if (!model) throw new Error("model is required contructor parameter.");

		var _schema = schema, _pristine;

		Object.setPrototypeOf(this, model);

		_pristine = _pureModel(this);

		function _isProperty(value, prop) {
			return Object.is(value[prop], null) || value.hasOwnProperty(prop);
		}

		function _resolve(value, notAnArray) {
			var outval;

			if(value && value.$$unwrapTrustedValue) {
				value = value.toString();
			}

			if (!!value && notAnArray) {
				outval = value;
			} else if (typeof (value) === "boolean") {
				outval = value;
			} else if (angular.isNumber(value)) {
				outval = value;
			} else {
				outval = null;
			}

			return outval;
		}

		function _updateView(THIS, data) {

			for (var k in data) {
				var value = data[k],
					model = THIS[k],
					validKey = k.indexOf("$") === -1 && !angular.isFunction(model),
					notAnArray = !angular.isArray(model),
					haveModelValue = validKey && model ? _isProperty(model, "$viewValue") : false,
					fk = schema.foreignKeys ? schema.foreignKeys[k] : null;

				//console.log(k, data);

				// if (value && value.constructor && (value.constructor.name === "TrustedValueHolderType")){
				// 	value = value.toString();
				// }

				if (!!model && validKey) {

					if (haveModelValue) {
						model.$setViewValue( _resolve(value, notAnArray) );
					} else if (angular.isObject(value)) {
						THIS[k] = fk ? value[fk.refColumn] : value;
					} else {
						THIS[k] = _resolve(value, notAnArray);
					}

				}

			}

			//Second pass to clean up [object Object] anamoly.
			// for(var p in THIS){
			// 	var model2 = THIS[p],
			// 		validKey2 = p.indexOf("$") === -1 && !angular.isFunction(model2),
			// 		hasModelValue2 = validKey2 && model2 ? _isProperty(model2, "$viewValue") : false;
			//
			// 	if(validKey2) {
			// 		if(hasModelValue2) {
			// 			if(model2.$viewValue === "[object Object]") {
			// 				_updateViewValue(THIS, p, null) ;
			//
			// 			}
			// 		}
			// 	}
			// }
		}

		function _pureView(data) {
			var values = {};

			for (var k in data) {
				var value = data[k],
					validKey = k.indexOf("$") === -1 && !angular.isFunction(value),
					notAnArray = !angular.isArray(value),
					haveModelValue = validKey && value ? _isProperty(value, "$viewValue") : false,
					fk = schema.foreignKeys ? schema.foreignKeys[k] : null;

				if (!!value && validKey) {
					if (haveModelValue) {
						values[k] = _resolve(value.$viewValue, notAnArray);
					} else if (angular.isObject(value)) {
						values[k] = fk ? value[fk.refColumn] : value;
					} else {
						values[k] = _resolve(value, notAnArray);
					}

				}

			}

			return values;

		}

		function _pureModel(data) {
			var values = {};

			for (var k in data) {
				var value = data[k],
					validKey = k.indexOf("$") === -1 && !angular.isFunction(value),
					notAnArray = !angular.isArray(value),
					haveModelValue = validKey && value ? _isProperty(value, "$modelValue") : false,
					fk = schema.foreignKeys ? schema.foreignKeys[k] : null;

				if (!!value && validKey) {

					if (haveModelValue) {
						values[k] = _resolve(value.$modelValue, notAnArray);
					} else if (angular.isObject(value)) {
						values[k] = fk ? value[fk.refColumn] : value;
					} else {
						values[k] = _resolve(value, notAnArray);
					}

				}

				// //Check for missing properties using the schema.colums hash.
				// for(var c in _schema.columns) {
				// 	if(!values.hasOwnProperty(c)) {
				// 		values[c] = ""; //This is to make sure that [Object object] does not appear in the controlls.
				// 	}
				//}

			}

			return values;

		}

		function _updateViewValue(THIS, k, value) {
			var ctrl = THIS[k];
			if (ctrl && ctrl.$setViewValue) {
				ctrl.$setViewValue(value);
				ctrl.$setPristine();
				ctrl.$setUntouched();
				ctrl.$render();
			} else {
				THIS[k] = value;
			}
		}

		function _normalizeProperties(THIS, schema) {
			return;

		}

		Object.defineProperties(this, {
			"__type": {
				"get": function () {
					return "NoDataModel";
				}
			}
		});

		Object.defineProperty(this, "pristine", {
			get: function () {
				return _pristine || {};
			},
			set: function (v) {
				throw new Error("NoDataModel::pristine is readonly.");
			}
		});

		Object.defineProperty(this, "current", {
			get: function () {
				return _pureView(this);
			},
			set: function (src) {
				var THIS = this, keys;

				if(angular.isObject(src)) {
					keys = Object.keys(src).filter(function (v, k) {
						if (v.indexOf("$") === -1) return v;
					});

					keys.forEach(function (k) {
						_updateViewValue(THIS, k, src[k]);
					});
				}
				//if(!_pristine) _pristine = _pureView(this);
			}
		});

		this.undo = function () {
			_updateView(this, _pristine);

			if (this.$rollbackViewValue) {
				this.$rollbackViewValue();
				this.$setPristine();
				this.$setUntouched();
			}
		};

		this.commit = function () {
			if (this.$commitViewValue) {
				_normalizeProperties(this, _schema);
				this.$commitViewValue();
				this.$setPristine();
				this.$setUntouched();
				_pristine = _pureModel(this);
			}
		};

		this.update = function (data) {
			_updateView(this, _unfollow_data(data, _schema));
			this.commit();
		};
	}

	NoDataModel.clean = _unfollow_data;
	NoDataModel.ngModelHack = _update_ngModelController;
	NoDataModel.purify = _purify;

	//Expose these classes on the global namespace so that they can be used by
	//other modules.
	var _interface = {
		NoDataModel: NoDataModel
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
						default:

						 	if(angular.isArray(arg)){
								query.$select = arg.join(",");
							}
					}
				}
			}
			return query;
		};
	}])

	;
})(angular);

//storage.js

/*
*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
*
*	___
*
*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
*
*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
*
*	Copyright (c) 2017 The NoInfoPath Group, LLC.
*
*	Licensed under the MIT License. (MIT)
*
*	___
*
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
			if(angular.isObject(v)) {
				_store.setItem(k, JSON.stringify(v));
			} else {
				_store.setItem(k, v);
			}

		};

		this.getItem = function (k) {
			var x = _store.getItem(k), o;

			if(x) {
				try{
					o = angular.fromJson(x);
				}catch(ex) {
					o = x;
				}
			}

			return o;

		};

		this.removeItem = function (k) {
			_store.removeItem(k);
		};

		this.clear = function () {
			_store.clear();
		};
	}

	angular.module("noinfopath.data")
		/*
			*	noLocalStorage
			*	--------------
		*/
		.factory("noLocalStorage", [function () {
			return new NoStorage("localStorage");
		}])

		/*
			*	noSessionStorage
			*	--------------
		*/
		.factory("noSessionStorage", [function () {
			return new NoStorage("sessionStorage");
		}])

		;
})(angular);

//configuration.js
/*
*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
*
*	___
*
*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
*
*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
*
*	Copyright (c) 2017 The NoInfoPath Group, LLC.
*
*	Licensed under the MIT License. (MIT)
*
*	___
*
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
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
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
			this.$get = ['$injector', '$rootScope', '$q', '$timeout', '$http', '$filter', 'noUrl', 'noDbSchema', 'noOdataQueryBuilder', 'noConfig', "noParameterParser", "lodash", function ($injector, $rootScope, $q, $timeout, $http, $filter, noUrl, noDbSchema, noOdataQueryBuilder, noConfig, noParameterParser, _) {
				var _currentUser;
				function NoHTTP(queryBuilder) {
					 var THIS = this; //,	_currentUser;
					console.warn("TODO: make sure noHTTP conforms to the same interface as noIndexedDb and noWebSQL");
					this.whenReady = function (tables) {
						return $q(function (resolve, reject) {
							if($rootScope.noHTTPInitialized) {
								console.log("noHTTP Ready.");
								resolve();
							} else {
								//console.log("noDbSchema is not ready yet.")
								$rootScope.$watch("noHTTPInitialized", function (newval) {
									if(newval) {
										console.log("noHTTP ready.");
										resolve();
									}
								});
							}
						});
					};
					this.configure = function (noUser, schema) {
						_currentUser = schema.config.creds || noUser.data || noUser;

						//console.log(schema);
						//_currentUser = noUser.data || noUser;
						// if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _currentUser.token_type + " " + _currentUser.access_token;


						//console.log("noHTTP::configure", schema);
						var promise = $q(function (resolve, reject) {
							for(var t in schema.tables) {
								var table = schema.tables[t];
								THIS[t] = new NoTable(t, table, queryBuilder, schema);
							}
							$rootScope.noHTTPInitialized = true;
							console.log("noHTTP_" + schema.config.dbName + " ready.");
							$rootScope["noHTTP_" + schema.config.dbName] = THIS;
							resolve(THIS);
						});
						return promise;
					};
					this.getDatabase = function (databaseName) {
						return $rootScope["noHTTP_" + databaseName];
					};
					this.noRequestJSON = function (url, method, data, useCreds, authHeader) {
						var json = angular.toJson(noParameterParser.parse(data || {}));
					//	if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);
						var deferred = $q.defer(),
							req = {
								method: method,
								url: url,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: authHeader
								},
								withCredentials: !!useCreds
							};
						if(!!data) {
							req.data =  json;
						}
						$http(req)
							.then(function (resp) {
								deferred.resolve(resp.data || data);
							})
							.catch(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});
						return deferred.promise;
					};
					this.noRequestForm = function (url, method, data, useCreds) {
						var deferred = $q.defer(),
							json = $.param(noParameterParser.parse(data)),
							req = {
								method: method,
								url: url,
								data: json,
								headers: {
									"Content-Type": "application/x-www-form-urlencoded"
								},
								withCredentials: !!useCreds
							};
						$http(req)
							.then(function (data) {
								deferred.resolve(data);
							})
							.catch(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});
						return deferred.promise;
					};
					this.noRequest = function(url, options, data, authHeader) {
						//if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization =
						var deferred = $q.defer(),
							req = angular.extend({}, {
								url: url,
								withCredentials: true,
								headers: {
									Authorization: authHeader //_authProvider.resolveAuthorization(_currentUser)
								}
							}, options);
						if(!!data) {
							req.data =  data;
						}
						$http(req)
							.then(function (data) {
								deferred.resolve(data);
							})
							.catch(function (reason) {
								deferred.reject(reason);
							});
						return deferred.promise;
					};
				}

				function NoTable(tableName, table, queryBuilder, schema) {

					function _resolveUrl(uri, table) {
						if(angular.isString(uri)) {
							if(RegExp("^(http|https):\/\/", "gi").test(uri)){
								return uri + (table || "");
							} else {
								return noConfig.current.RESTURI + uri + (table || "");
							}
						} else if(angular.isObject(uri)){
							return noConfig.current.RESTURI + uri.url;
						} else {
							return;
						}
					}

					function _resolveQueryParams(schema, filters, sort, page, select) {
						function _makeQp() {
							if(filters) {
								var ret	= {};
								_.flatten(filters.toQueryString()).forEach(function(v, k){
									var parm = {};
									ret[v.column] = v.value;
									return parm;
								});
								return ret;
							} else {
								return;
							}
						}

						if(schema.uri && _table.useQueryParams === false) {
							return queryBuilder(filters, sort, page, select);
						} else if(schema.uri && _table.useQueryParams !== false) {
							return _makeQp();
						} else if(!schema.uri && _table.useQueryParams !== true){
							return queryBuilder(filters, sort, page, select);
						} else if(!schema.uri && _table.useQueryParams === true ) {
							return _makeQp();
						}
					}

					var THIS = this,
						_table = table,
						_authProvider = schema.config.authProvider && $injector.get(schema.config.authProvider);

					this.noInfoPath = table;
					_table.parentSchema = schema;

					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url = _table.uri ? _resolveUrl(_table.uri) : noUrl.makeResourceUrl(noConfig.current.RESTURI + (schema.config.restPrefix || ""), tableName);
					console.log(url);
					Object.defineProperties(this, {
						entity: {
							get: function () {
								return this.noInfoPath;
							}
						}
					});
					this.noCreate = function (data) {
						data.CreatedBy = _currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _currentUser.userId;

						/*
						*	#### primaryKey
						*
						*	This configuration option is found in db configuraiton files. It is a
						*	sibling property to schema source, and allows the definition of the
						*	type of primary key used on tables to create new records.
						*
						*	Currently this feature is only available for the noHTTP provider.
						*	It has two child properties; 	`type` and `createLocal`.
						*
						*	|Name|Description|
						*	|----|-----------|
						*	|type|Defines the type of value that defines the primary key. Can be `guid` or `int`|
						*	|createLocal|When `true` and the `type` is `guid` the primary key is generated before sending the data to the remote server.|
						*
						*	For backwards compatibility the default value for this property is as follows:
						*
						*	```json
						*	{
						*		"type": "guid",
						*		"createLocal": true
						*	}
						*	```
						*/
						var pkTmp = this.noInfoPath.parentSchema.config.primaryKey || {
							"type": "guid",
							"createLocal": true
						};

						if(pkTmp.createLocal) {
							if (pkTmp.createLocal && !data[table.primaryKey]) {
								data[table.primaryKey] = noInfoPath.createUUID();
							}
						}
						//msWebApiLargeNumberHack(data, this.noInfoPath.columns);

						var json = angular.toJson(data);

						//if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);

						var deferred = $q.defer(),
							req = {
								method: "POST",
								url: url,
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: ""
								},
								withCredentials: true
							};

						_authProvider.resolveAuthorization(_currentUser)
							.then(function(authHeader){
								req.headers.Authorization = authHeader;
								$http(req)
									.then(function (results) {
										//console.log(angular.toJson(data) );
										deferred.resolve(results.data || results);
									})
									.catch(function (reason) {
										//console.error(reason);
										deferred.reject(reason);
									});
							});

						return deferred.promise;
					};

					this.noRead = function () {
						//console.debug("noRead say's, 'swag!'");
						var filters, sort, page, select;
						for(var ai in arguments) {
							var arg = arguments[ai];
							//success and error must always be first, then
							if(angular.isObject(arg)) {
								switch(arg.__type) {
									case "NoFilters":
										filters = arg;
										filters.msOdata = _table.parentSchema.msOdata !== false;
										break;
									case "NoSort":
										sort = arg;
										break;
									case "NoPage":
										page = arg;
										break;
									default:
										if(angular.isArray(arg)) {
											select = arg;
										}
										break;
								}
							}
						}
						var deferred = $q.defer(),
							req = {
								method: "GET",
								url: url,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: ""
								},
								withCredentials: true
							};

					//	if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);

						req.params = _resolveQueryParams(_table, filters, sort, page, select);

						_authProvider.resolveAuthorization(_currentUser)
							.then(function(authHeader){
								req.headers.Authorization = authHeader;
								$http(req)
									.then(function (results) {
										//console.log( angular.toJson(results));
										var resp = new noInfoPath.data.NoResults(results.data || results);
										deferred.resolve(resp);
									})
									.catch(function (reason) {
										//console.error(arguments);
										if(reason.status === 404) {
											deferred.resolve(new noInfoPath.data.NoResults([]));
										} else {
											console.error(reason);
											deferred.reject(reason);
										}
									});
							});

						return deferred.promise;
					};

					this.noUpdate = function (data) {
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _currentUser.userId;

						var json = angular.toJson(data);

						//if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);

						var deferred = $q.defer(),
							req = {
								method: "PUT",
								url: _table.parentSchema.config.msOdata === false ? url + "/" + data[table.primaryKey] : url + "(guid'" + data[table.primaryKey] + "')",
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: ""
								},
								withCredentials: true
							};

							_authProvider.resolveAuthorization(_currentUser)
								.then(function(authHeader){
									req.headers.Authorization = authHeader;

									$http(req)
										.then(function (results, status) {
											//console.log("noHTTP::noUpdate", data, status);
											deferred.resolve(results.data || results);
										})
										.catch(function (reason) {
											if(reason.status !== 404) console.error(reason);
											deferred.reject(reason);
										});
								});

						return deferred.promise;
					};

					this.noDestroy = function (data) {
						var ourl;
						if(this.entity.useQueryParams) {
							//Temporary hack. This needs to be refactor to hand params to the Nth degree.
							ourl = url + "?" + table.primaryKey + "=" + data[table.primaryKey];
						} else {
							ourl = _table.parentSchema.config.msOdata === false ? url + "/" + data[table.primaryKey] : url + "(guid'" + data[table.primaryKey] + "')";
						}
						if(data.__type === "NoFilters" && this.entity.useQueryParams === false) {
							ourl = url + "?$filter=" + data.toODATA();
						}

						var deferred = $q.defer(),
							req = {
								method: "DELETE",
								url: ourl,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						_authProvider.resolveAuthorization(_currentUser)
							.then(function(authHeader){
								req.headers.Authorization = authHeader;

								$http(req)
									.then(function (data, status) {
										console.log("noHTTP::noDestory", data, status);
										deferred.resolve(status);
									})
									.catch(function (reason) {
										if(reason.status !== 404) console.error(reason);
										deferred.reject(reason);
									});
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
							/*
							 *	When query a number, a filter is created on the instrinsic
							 *	filters object using the `rowid`  WebSQL column as the column
							 *	to filter on. Query will be the target
							 *	value of query.
							 */
							filters.quickAdd("rowid", "eq", query);
						} else if(angular.isString(query)) {
							/*
							 * When the query is a string it is assumed a table is being queried
							 * by it's primary key.
							 *
							 * > Passing a string when the entity is
							 * a SQL View is not allowed.
							 */
							if(THIS.noInfoPath.entityType === "V") throw "One operation not supported by SQL Views when query parameter is a string. Use the simple key/value pair object instead.";
							filters.quickAdd(THIS.noInfoPath.primaryKey, "eq", query);

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
							throw new Error("noOne requires a query parameter. May be a Number, String or Object");
						}

						//Internal _getOne requires and NoFilters object.
						return THIS.noRead(filters)
							.then(function (data) {
								//console.log("noHTTP.noRead", data);
								if(data.length) {
									return data[0];
								} else if(data.paged && data.paged.length) {
									return data.paged[0];
								} else {
									//console.warn("noHTTP::noOne: Record Not Found", _table.entityName, filters.toODATA(), data);
									//throw new Error("noHTTP::noOne: Record Not Found");
									return null;
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

			table.uri = table.uri || noDbConfig.uri;


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
				"noDBSchema": function (key, schemaConfig, noConfig) {
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
			//console.log($rootScope);
			var req = {
				method: "GET",
				url: config.NODBSCHEMAURI, //TODO: change this to use the real noinfopath-rest endpoint
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": "Bearer " + $rootScope.noUser.access_token

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

		function resolveSchema(schemaKey, schemaConfig, noConfig) {
			var deferred = $q.defer(),
				schemaProvider = schemaConfig.schemaSource.provider;

			if($rootScope[schemaKey]) {
				deferred.resolve(schemaKey);
			} else {
				var unWatch = $rootScope.$watch(schemaKey, function (newval, oldval) {
					if(newval) {
						noLocalStorage.setItem(schemaKey, newval.tables);
						if(unWatch) unWatch();
						deferred.resolve(schemaKey);
					}
				});

				schemaSourceProviders[schemaProvider](schemaKey, schemaConfig, noConfig)
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

				promises.push(resolveSchema(schemaKey, schemaConfig, noConfig));
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

	.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "$filter", "noLocalStorage", "$injector",
	function ($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector) {

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
	*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
	*
	*	___
	*
	*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
	*
	*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
	*
	*	Copyright (c) 2017 The NoInfoPath Group, LLC.
	*
	*	Licensed under the MIT License. (MIT)
	*
	*	___
	*
	*	noWebSql
	*	--------
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
		function scrubData(data, keepRecordStats) {
			var scrubbed = {},
				ignore = keepRecordStats ? [] : ["ModifiedBy", "ModifiedDate", "CreatedBy", "DateCreated"];

			for(var ck in _entityConfig.columns) {
				var col = _entityConfig.columns[ck],
					val = data[ck];

				if( _.indexOf(ignore, ck) === -1) {
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
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	noTransactionCache service
 *	--------------------------
 *
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

	function msWebApiLargeNumberHack(data, colSchemas) {
		for(var c in data) {
			var colschema = colSchemas[c];
			if(colschema && ["decimal"].indexOf(colschema.type) > -1) {
				data[c] = data[c] ? String(data[c]) : null;
			}
		}
	}

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$injector", "$q", "$rootScope", "noIndexedDb", "lodash", "noDataSource", "noDbSchema", "noLocalStorage", "noParameterParser", "noActionQueue", function ($injector, $q, $rootScope, noIndexedDb, _, noDataSource, noDbSchema, noLocalStorage, noParameterParser, noActionQueue) {

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
				this.cachedFiles = [];

				this.addChange = function (tableName, data, changeType, dbName) {
					var tableCfg = scope["noDbSchema_" + (dbName || config.noDataSource.databaseName)],
						schema = tableCfg.entity(tableName);

					msWebApiLargeNumberHack(data, schema.columns);

					this.changes.add(tableName, data, changeType, tableCfg, (dbName || config.noDataSource.databaseName));

					if(schema.NoInfoPath_FileUploadCache) this.cachedFiles.push({schema: schema, data: data, changeType: changeType});

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

					for (var t in noTransactions) {
						var transaction = noTransactions[t],
							en = config.noDataSource.crudEntity ? config.noDataSource.crudEntity : config.noDataSource.entityName;

						if (_.isBoolean(transaction)) {
							noTransactions[t] = [
								{
									entityName: en,
									scopeKey: config.scopeKey ? config.scopeKey : undefined
										//omit_fields: keysd
								}];
						}
					}

					//console.log(noTransactions);
				}

				function resolveProvider(provider, scope, data) {
					var prov;

					switch (provider) {
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
					//if(!data.current) data = new noInfoPath.data.NoDataModel(table.noInfoPath, data);
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

									if (curEntity.fields) {
										for (var f in curEntity.fields) {
											var fld = curEntity.fields[f],
												fldName, prov, val;

											//When field value is get remote values then store on
											//the writableData object.

											if (angular.isString(fld)) {
												/*
												 *	When a field is a string then the value will be the
												 *	property on the data object provider to the call
												 *	the `basic` preOp
												 */
												fldName = fld;
												val = data[fld];

											} else if (angular.isObject(fld)) {
												/*
												 *	When a field is an object then confgure as if the
												 *	value will be coming from a trusted provider like
												 *	scope, or $stateParams.
												 */
												fldName = fld.field;

												if (angular.isObject(fld.value)) {
													/*
													 *	When `scope` is the provider then the directive scope is used.
													 *	Otherwise the supplied injecable provider will be used.
													 */

													prov = resolveProvider(fld.value.provider, scope, data);

													if (prov && fld.value.method) {
														var params = [];

														for (var pi = 0; pi < fld.value.method.params.length; pi++) {
															var cfg = fld.value.method.params[pi],
																prov2 = resolveProvider(cfg.provider, scope, data);

															params.push(noInfoPath.getItem(prov2, cfg.property));
														}

														val = prov[fld.value.method.name].apply(null, params);
													} else if (prov && fld.value.property) {
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
											if (fld.type === "date") {
												val = noInfoPath.toDbDate(val);
											}

											writableData[fldName] = val;
										}

										writableData = angular.merge(data, writableData);

									} else if (curEntity.dataService) {
										var service = $injector.get(curEntity.dataService.provider),
											method = service[curEntity.dataService.method];

										writableData = method(data);

									} else {
										writableData = data;
									}

									if (curEntity.omit_fields) {
										writableData = _.omit(writableData, curEntity.omit_fields);
									}

									//console.log(writableData);

									return writableData;

								},
								"joiner": function (curEntity, data, scope) {
									var writableData = {};

									if (curEntity.fields) {
										for (var f in curEntity.fields) {
											var fld = curEntity.fields[f],
												prov, value;

											switch (fld.value.provider) {
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
									} else if (curEntity.dataService) {
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

									if (sourceDataDrop) {
										for (var dd = 0; dd < sourceDataDrop.length; dd++) {
											var sdd = sourceDataDrop[dd];
											writableData.drop.push(createJoin(curEntity, sdd, scope));
										}
									}

									if (sourceDataAdd) {
										for (var da = 0; da < sourceDataAdd.length; da++) {
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
									for (var d = 0; d < data.length; d++) {
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

									if (datum) {

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

									if (datum) {
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

									dataSource.one(data[dataSource.entity.primaryKey])
										.then(function (scope, datum) {
											var sk = curEntity.scopeKey ? curEntity.scopeKey : curEntity.entityName,
												pure = noParameterParser.parse(datum);

											//foo = angular.copy(scope[sk]);
											results[sk] = pure;

											if (scope[sk]) {
												noParameterParser.update(datum, scope[sk]);


												if (curEntity.cacheOnScope) {
													scope[curEntity.entityName] = pure;
												}

												/*
												 *	#### @property scopeKey
												 *
												 *	Use this property allow NoTransaction to store a reference
												 *	to the entity upon which this data operation was performed.
												 *	This is useful when you have tables that rely on a one to one
												 *	relationship.
												 *
												 *	It is best practice use this property when ever possible,
												 *	but it not a required configuration property.
												 *
												 */

												//scope[sk] = foo;


											}

											//If there is an ActionQueue then execute it.
											if (curEntity.actions && curEntity.actions.post) {
												//support post operation actions for now.
												var execQueue = noActionQueue.createQueue(datum, scope, {}, curEntity.actions.post);

												noActionQueue.synchronize(execQueue)
													.then(_recurse);
											} else {
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
							switch (preOp) {
							case "joiner-many":
								/*
								 *	### joiner-many
								 *
								 *	`joiner-many` assumes that it represents a multiple choice question.
								 *	In order to keep the algorithm simple we drop all joiner items
								 *	that match the parent key. (i.e. SelectionID)
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
							if ((opType === "update" && !curEntity.createOnly) || opType == "create") {
								exec(dataSource, curEntity, opType, writableData);
							} else {
								_recurse();
							}
						}

						function _entity_bulk(curEntity) {
							function _resolveMethod(curEntity, sdProv, sdProp) {
								var method;

								if (angular.isFunction(sdProp)) {
									method = sdProp;
								} else if (sdProp === undefined && curEntity.bulk.sourceData.method) {
									method = sdProv[curEntity.bulk.sourceData.method].bind(sdProv);
								} else if (sdProp !== undefined && curEntity.bulk.sourceData.method) {
									method = sdProp[curEntity.bulk.sourceData.method].bind(sdProp);
								}

								return method;
							}

							//Current version requires an objectFactory when using bulk feature.
							if (!curEntity.objectFactory) throw "objectFactory property is required when using bulk upsert feature.";

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

								console.log("_doTheUpserts", data.length);


								for (var i = 0; i < data.length; i++) {
									var model = data[i];
									opType = model[primaryKey] ? "update" : "create";

									if (curEntity.bulk.ignoreDirtyFlag === true || model.dirty) {
										promises.push(executeDataOperationBulk(dataSource, curEntity, opType, new classConstructor(model, results)));
									}
								}

								$q.all(promises)
									.then(_recurse)
									.catch(reject);
							}


							if (data.then) {
								data
									.then(_doTheUpserts)
									.catch(function (e) {
										reject(e);
									});
							} else {
								_doTheUpserts(data);
							}

						}

						function _recurse() {

							var curEntity = opEntites[curOpEntity];

							//Check to see if we have run out of entities to recurse.
							if (!curEntity || curOpEntity >= opEntites.length) {
								resolve(results);
								return;
							}

							if (curEntity.bulk) {
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

						for (var i = 0; i < data.length; i++) {
							var model = data[i];

							if (ignoreDirtyFlag === true || model.dirty) {
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

							if (!curEntity || curOpEntity >= opEntites.length) {
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
				this.add = function (tableName, data, changeType, tableCfg, ns) {
					var syncVer = noLocalStorage.getItem("noSync_lastSyncVersion"),
						change = new NoChange(tableName, data, changeType, tableCfg, !!syncVer ? syncVer.version : 0, ns);

					this.unshift(change);
				};
			}

			function NoChange(tableName, data, changeType, tableCfg, version, ns) {
				var tblSchema = tableCfg.tables[tableName];

				function normalizeValues(inData) {
					var data = angular.copy(inData),
						converters = {
							"bit": function (d) {
								return !!d;
							},
							"decimal": function (d) {
								var r = d;
								if (r) {
									r = String(r);
								}

								return r;
							},
							"undefined": function (d) {
								return d;
							}
						};

					for (var c in data) {
						var dt,
							col = tblSchema.columns[c];

						if (col) {
							dt = converters[col.type];

							if (!dt) {
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

				this.namespace = ns;
				this.tableName = tableName;
				this.data = !!tblSchema ? normalizeValues(data) : data;
				this.changeType = changeType;
				this.version = version;
			}

			function NoTransactionCache() {


				this.beginTransaction = function (userId, noTransConfig, scope) {
					if (angular.isObject(noTransConfig)) {
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
							for (var d in data) {
								var datum = data[d];

								entity.noDestroy(datum);
							}
						})
						.catch(function (err) {
							console.error(err);
						});
				};

				this.logException = function (transaction) {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					return entity.noCreate(transaction);
				};

			}

			return new NoTransactionCache($q, noIndexedDb);
			}]);
})(angular);

//indexeddb.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	noIndexedDB
 *	------------------
 *	## noIndexedDB
 *
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
 *	|----|----|-----------|
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
 *	|Name|Type|Description|
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

	function NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {

		var _name, _noIndexedDb = this;

		function _recordTransaction(resolve, tableName, operation, trans, rawData, result1, result2) {
			//console.log(arguments);

			var transData = result2 && result2.rows && result2.rows.length ? result2 : angular.isObject(result1) ? result1 : rawData;

			if (trans) trans.addChange(tableName, transData, operation);
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
						switch (column.type) {
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
					dexieTable.noInfoPath = Object.assign({}, table);
					dexieTable.noInfoPath.parentSchema = schema;
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
				// _dexie.on('error', function (err) {
				// 	// Log to console or show en error indicator somewhere in your GUI...
				// 	console.error("Dexie Error: ", arguments);
				// 	_reject($rootScope, reject, err);
				// });

				function handler(event) {
					event.preventDefault(); // Prevents default handler (would log to console).
					var reason = event.reason;
					console.error("Unhandled promise rejection:", (reason && (reason.stack || reason)));
				}

				window.addEventListener("unhandledrejection", handler);

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

				if (_dexie.isOpen()) {
					//Do nothing, `ready` event should bubble up.

					// $timeout(function() {
					// 	//noLogService.log("Dexie already open.")
					// 	window.noInfoPath.digest(deferred.resolve);
					// });
				} else {
					if (_.size(schema.store)) {
						console.log(schema.config.dbName, schema.store);
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

				if ($rootScope[noIndexedDbInitialized]) {
					deferred.resolve();
				} else {
					$rootScope.$watch(noIndexedDbInitialized, function (newval, oldval, scope) {
						if (newval) {
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
				},
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
				};

			db.WriteableTable.prototype.noCreate = function (data, trans) {
				var deferred = $q.defer(),
					table = this;

				data = _unfollow_data(table, data);

				//console.warn(data);
				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function () {
						data.CreatedBy = _dexie.currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;

						if (!data[table.schema.primKey.name]) {
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
					aliases = table.noInfoPath.parentSchema.config.tableAliases || {},
					filters, sort, page, follow = true,
					exclusions = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.followExceptions ? table.noInfoPath.parentSchema.config.followExceptions : [],
					nogroup;


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


							if (fi === 0) {
								//When `fi` is 0 create the WhereClause, extract the evaluator
								//that will be used to create a collection based on the filter.
								where = table.where(filter.column);

								if(!ex.value)  throw new Error("Invalid filter value for expression: " + filter.column + " " + ex.operator + " " + ex.value);

								//NOTE: Dexie changed they way they are handling primKey, they now require that the name be prefixed with $$
								if (table.schema.primKey.keyPath === filter.column || table.schema.idxByName[filter.column]) {
									evaluator = where[indexedOperators[ex.operator]];

									collection = evaluator.call(where, ex.value);
								} else {
									collection = table.toCollection();
								}

								logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
							} else {
								// logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
								if (filter.logic) {
									logic = collection[filter.logic].bind(collection);
									collection = logic(_logicCB.bind(null, filter, ex));
								}

							}
						} catch (err) {
							throw {
								error: err,
								collection: collection,
								arguments: [fi, filter, ex]
							};
						}
					}

					function _filterCompound(fi, filter, ex) {
						console.log("Compound", fi, filter, ex);
					}

					if (!!filters) {
						for (var fi = 0; fi < filters.length; fi++) {
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


						if (s.dir === "desc") {
							if (aval < bval) {
								return 1;
							}
							if (aval > bval) {
								return -1;
							}
						} else {
							if (aval > bval) {
								return 1;
							}
							if (aval < bval) {
								return -1;
							}
						}

						// a must be equal to b
						return 0;

					}

					if (sorts) {
						for (var s = 0; s < sorts.length; s++) {
							var sort = sorts[s];

							arrayOfThings = arrayOfThings.sort(_compare.bind(null, sort));
						}
					}

					return arrayOfThings;
				}

				function _page(page, arrayOfThings) {
					if (page) {
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

				function _expand_success(col, keys, filters, results) {
					//console.log("_expand_success", arguments);
					return results;
				}

				function _expand2_success(col, keys, filters, results) {
					//console.log("_expand_success", arguments);
					//if(!nogroup) console.groupEnd();
					return {
						results: results,
						col: col
					};
				}

				function _expand(col, keys) {

					var theDb = col.refDatabaseName ? _noIndexedDb.getDatabase(col.refDatabaseName) : db,
						filters = new noInfoPath.data.NoFilters(),
						ft = theDb[col.refTable];

					//If we don't have a foreign key table, then try  to dereference it using the aliases hash.
					if (!ft) {
						ft = theDb[aliases[col.refTable]];
					}

					if (!ft) throw "Invalid refTable " + aliases[col.refTable];

					if (exclusions.indexOf(col.column) > -1) {
						return $q.when(new noInfoPath.data.NoResults());
					}
					// if(tableCache[col.refTable]) {
					// 	tbl = tableCache[col.refTable];
					// } else {
					// 	tableCache[col.refTable] = tbl;
					// }

					if (!keys) {
						throw {
							error: "Invalid key value",
							col: col,
							item: item
						};
					}

					//Configure foreign key filter
					filters.quickAdd(col.refColumn, "in", keys);

					//follow the foreign key and get is data.
					if (keys.length > 0) {
						return ft.noRead(filters, 1)
							.then(_expand_success.bind(table, col, keys, filters))
							.catch(_expand_fault.bind(table, col, keys, filters));
					} else {
						return $q.when(new noInfoPath.data.NoResults());
					}

				}

				function _expand2(col, keys) {
					var theDb = col.refDatabaseName ? _noIndexedDb.getDatabase(col.refDatabaseName) : db,
						filters = new noInfoPath.data.NoFilters(),
						ft = theDb[col.refTable];

					//If we don't have a foreign key table, then try  to dereference it using the aliases hash.
					if (!ft) {
						ft = theDb[aliases[col.refTable]];
					}

					if (!ft) throw "Invalid refTable " + col.refTable;

					if (exclusions.indexOf(col.column) > -1) {
						return $q.when(new noInfoPath.data.NoResults());
					}
					// if(tableCache[col.refTable]) {
					// 	tbl = tableCache[col.refTable];
					// } else {
					// 	tableCache[col.refTable] = tbl;
					// }

					if (!keys) {
						throw {
							error: "Invalid key value",
							col: col,
							item: item
						};
					}

					//Configure foreign key filter
					filters.quickAdd(col.refColumn, "in", keys);

					//follow the foreign key and get is data.
					if (keys.length > 0) {
						return ft.noRead(filters, false, 1)
							.then(_expand2_success.bind(table, col, keys, filters))
							.catch(_expand_fault.bind(table, col, keys, filters));
					} else {
						return $q.when(new noInfoPath.data.NoResults());
					}

				}

				function _finalResults(finalResults) {
					if (finalResults.exception) {
						console.warn(finalResults.exception);
						resolve(new noInfoPath.data.NoResults([]));
					} else {
						resolve(new noInfoPath.data.NoResults(finalResults));
					}
				}

				function _fault(ctx, reject, err) {
					//if(!nogroup) console.groupEnd();

					ctx.error = err;
					//console.error(ctx);
					reject(ctx);
				}

				function _finished_following_fk(columns, arrayOfThings, refData) {

					for (var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for (var c in columns) {
							var col = columns[c],
								key = item[col.column],
								refTable = !col.noFollow && refData[col.refTable].paged,
								filter = {},
								refItem;

							if (col.noFollow) continue;

							filter[col.refColumn] = key;

							refItem = _.find(refTable, filter);

							item[col.column] = refItem || key;
						}
					}
					//console.log("finished following FK for", table.noInfoPath.entityName);
					return arrayOfThings;

				}


				function _finished_following_meta(columns, arrayOfThings, refData) {
					//console.log(columns, arrayOfThings, refData);
					for (var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for (var c in columns) {
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

					var promises = {},
						allKeys = {},
						queue = [],
						columns = table.noInfoPath.foreignKeys;

					if (follow) {
						for (var c in columns) {
							var col = columns[c],
								keys = _.compact(_.pluck(arrayOfThings, col.column)); //need to remove falsey values

							if (col.noFollow) continue;

							if (!allKeys[col.refTable]) {
								allKeys[col.refTable] = {
									col: col,
									keys: []
								};
							}

							// group keys by ref table
							allKeys[col.refTable].keys = allKeys[col.refTable].keys.concat(keys);
							//promises[col.refTable] = _expand(col, keys);
						}

						for (var k in allKeys) {
							var keys2 = allKeys[k];
							//console.log("Following Foreign Key for", table.noInfoPath.entityName, keys2.col.refTable, keys2.col.column, keys2.keys.join());

							promises[k] = _expand(keys2.col, keys2.keys);
						}

						if (_.size(promises) > 0) {
							//console.group();

							return $q.all(promises)
								.then(_finished_following_fk.bind(table, columns, arrayOfThings))
								.catch(_fault);
						} else {
							return $q.when(arrayOfThings);
						}

					} else {
						return $q.when(arrayOfThings);
					}

				}

				/*
				 *	### relationships
				 *
				 *	This property controls operations that require cascadeing
				 *	deletes or reads.
				 *
				 *	*Prototypical entry in the array of relationships.*
				 *
				 *	```json
				 *	{
				 *		"column": "ID",
				 *		"refTable": "ReportBidItemAttributes",
				 *		"refColumn": "ReportBidItemValueID",
				 *		"cascadeDeletes": true,
				 *		"followOnRead": true,
				 *		"pivotMetaDataResults": true
				 *		"sort": {"column": "Order", "dir", "asc"}
				 *	}
				 *	```
				 *	#### Properties
				 *
				 *	|Name|Type|Description|
				 *	|----|----|-----------|
				 *	|column|String|The name of the column in the host table that is to be looked up in the `refTable`.|
				 *	|refTable|String|Table that contains the related table.|
				 *	|refColumn|String|Name of the column that contains the data to match value in the host table, pointed to by `column`.
				 *	|cascadeDeletes|Boolean|When true, indicates that all related row should be delete when the host row is deleted.|
				 *	|followOnRead|Boolean|Populated the relationship on the host record when read a host record.  NOTE: you must set the `refColumn` to `noFollow: true` on the foreigh key configuration, when this property is set to true|
				 *	|sort|Object|Specifies the column and direction to sort by.|
				 */
				function _followOneToManyRelations(arrayOfThings) {

					//console.log("new call to follow relations for", table.noInfoPath.entityName);

					var promises = {},
						allKeys = {},
						queue = [],
						columns = table.noInfoPath.relationships || [];

					if (columns.length > 0) {
						// console.log("processing relations");
						for (var c in columns) {
							var col = columns[c],
								keys = _.compact(_.pluck(arrayOfThings, col.column)); //need to remove falsey values


							if (!col.followOnRead) continue;


							if (!allKeys[col.refTable]) {
								allKeys[col.refTable] = {
									col: col,
									keys: []
								};
							}

							// group keys by ref table
							allKeys[col.refTable].keys = allKeys[col.refTable].keys.concat(keys);
							console.log("Following relation for", table.noInfoPath.entityName, col.refTable, col.column, allKeys[col.refTable].keys.join());
							//promises[col.refTable] = _expand(col, keys);
						}

						for (var k in allKeys) {
							var keys2 = allKeys[k];
							//Need to call read without follow flag.
							promises[k] = _expand(keys2.col, keys2.keys);
						}

						var p = _.size(promises) > 0 ?
							$q.all(promises)
							.then(function (table, columns, arrayOfThings, data) {
								//console.log(data);
								for (var t = 0; t < arrayOfThings.length; t++) {
									var thing = arrayOfThings[t];

									for (var c = 0; c < columns.length; c++) {
										var col = columns[c],
											filter = {},
											values;

										filter[col.refColumn] = thing[col.column];

										values = _.filter(data[col.refTable], filter);
										if (col.sort) {
											values = _sort([col.sort], values);
										}

										if (col.pivotMetaDataResults) {
											thing.metadata = {};
											for (var v = 0; v < values.length; v++) {
												var value = values[v],
													meta = value.MetaDataDefinitionID;

												if (angular.isObject(value.Value)) {
													value = value.Value[meta.TextField];
												} else {
													value = value.Value;
												}
												thing.metadata[meta.Name] = value;
											}
										} else {
											thing[col.refTable] = values;
										}
									}


								}
								return arrayOfThings;
							}.bind(null, table, columns, arrayOfThings))
							.catch(_fault) : $q.when(arrayOfThings);
						return p;
					} else {
						//console.log("no relationships to process for", table.noInfoPath.entityName);
						return $q.when(arrayOfThings);
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

					for (var colName in columns) {
						var col = columns[colName];

						if (col.followMetaDataKeys) {
							for (var i = 0; i < arrayOfThings.length; i++) {
								var thing = arrayOfThings[i],
									meta = thing.MetaDataDefinitionID,
									filters;

								//Only folow lookup columns.
								if (meta.InputType === "combobox") {
									if (!!thing[colName]) {
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

					//console.log("_finish noRead for", table.noInfoPath.entityName);

					//if(!nogroup) console.groupEnd();
					resolve(results);


				}



				for (var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if (angular.isObject(arg) || typeof (arg) === "boolean") {
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
						default:
							if (typeof (arg) === "boolean") {
								follow = arg;
							}

							if (angular.isNumber(arg)) {
								nogroup = !!arg;
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
					//if(!nogroup) console.group();
					//console.log("starting noRead for", table.noInfoPath.entityName);
					var collection,
						data,
						promise;

					try {
						collection = _filter(filters, table);

						collection.toArray()
							.then(_followRelations.bind(ctx, follow))
							.then(_followOneToManyRelations.bind(ctx))
							.then(_followMetaData.bind(ctx, ctx))
							.then(_finish.bind(ctx, resolve, reject))
							.catch(_fault.bind(ctx, ctx, reject));
						//.then(_finish(collection, table, resolve, reject));

					} catch (err) {
						console.error("NoRead_new", err);
						reject(err);
					}

					//_sort(table, sort, collection);

					//_page(page, collection);

					//_finish(collection, table, resolve, reject);

				});
			}

			function NoRead_basic() {
				var table = this,
					aliases = table.noInfoPath.parentSchema.config.tableAliases || {},
					filters, sort, page, follow = true,
					exclusions = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.followExceptions ? table.noInfoPath.parentSchema.config.followExceptions : [],
					nogroup, options;

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


							if (fi === 0) {
								//When `fi` is 0 create the WhereClause, extract the evaluator
								//that will be used to create a collection based on the filter.
								where = table.where(filter.column);

								//NOTE: Dexie changed they way they are handling primKey, they now require that the name be prefixed with $$
								if (table.schema.primKey.keyPath === filter.column || table.schema.idxByName[filter.column]) {
									evaluator = where[indexedOperators[ex.operator]];
									collection = evaluator.call(where, ex.value);
								} else {
									collection = table.toCollection();
								}

								logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
							} else {
								// logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
								if (filter.logic) {
									logic = collection[filter.logic].bind(collection);
									collection = logic(_logicCB.bind(null, filter, ex));
								}

							}
						} catch (err) {
							throw {
								error: err,
								collection: collection,
								arguments: [fi, filter, ex]
							};
						}
					}

					function _filterCompound(fi, filter, ex) {
						console.log("Compound", fi, filter, ex);
					}

					if (!!filters) {
						for (var fi = 0; fi < filters.length; fi++) {
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


				for (var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if (angular.isObject(arg) || typeof (arg) === "boolean") {
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
							case "NoReadOptions":
								options = arg;
								break;
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
							.then(resolve)
							.catch(reject);

					} catch (err) {
						console.error("NoRead_basic", err);
						reject(err);
					}

				});

			}

			function NoRead_scripted(filter, scriptName) {
				var table = this,
					script = table.noInfoPath.scripts[scriptName];

				function _sort(sorts, arrayOfThings) {
					function _compare(s, a, b) {
						var aval = noInfoPath.getItem(a, s.column),
							bval = noInfoPath.getItem(b, s.column);


						if (s.dir === "desc") {
							if (aval < bval) {
								return 1;
							}
							if (aval > bval) {
								return -1;
							}
						} else {
							if (aval > bval) {
								return 1;
							}
							if (aval < bval) {
								return -1;
							}
						}

						// a must be equal to b
						return 0;

					}

					if (sorts) {
						for (var s = 0; s < sorts.length; s++) {
							var sort = sorts[s];

							arrayOfThings = arrayOfThings.sort(_compare.bind(null, sort));
						}
					}

					return arrayOfThings;
				}

				function _read(resolver, rootData) {
					var refTable = db[resolver.refTable],
						keyValues = _.compact(_.pluck(rootData, resolver.column)),
						filters = new noInfoPath.data.NoFilters()
						;

					filters.quickAdd(resolver.refColumn, "in", keyValues);

					return refTable.__read(filters, new noInfoPath.data.NoReadOptions())
						.then(function(results){
							rootData.forEach(function(datum){
								var filter = {};

								filter[resolver.refColumn] = datum[resolver.column];

								switch(resolver.type) {
									case "foreignKey":
										datum[resolver.column] = _.find(results, filter);
										break;

									case "relation":
										if(resolver.sort) {
											datum[resolver.refTable] = _sort(resolver.sort, _.select(results, filter));
										} else {
											datum[resolver.refTable] = _.select(results, filter);
										}
										break;
								}

							});

							return {resolver: resolver, data: results};
						});
				}

				function _continue(result) {
					//console.log(parentResolver.refTable);
					if(result.resolver.resolver) {
						return _recurse(result.resolver.resolver, result.data);

					} else {
						return $q.when(result);
					}
				}

				function _recurse(resolverArray, rootData) {
					return $q(function(resolve, reject){

						var promises = [];

						resolverArray.forEach(function(resolver){
							promises.push(_read(resolver, rootData)
								.then(_continue));
						});

						$q.all(promises)
							.then(resolve)
							.catch(reject);
					});
				}

				return $q(function (resolve, reject) {
					var rootData;
					console.log("Starting", table.noInfoPath.entityName);
					table.__read(filter)
						.then(function(data){
							rootData = data;
							return rootData;
						})
						.then(_recurse.bind(table, script))
						.then(function(){
							resolve(rootData);
						})
						.catch(reject);

				});


			}

			db.Table.prototype.__read = NoRead_basic;

			db.Table.prototype.noRead = NoRead_new; //NoRead_strategic;

			db.Table.prototype.noReadScripted = NoRead_scripted;

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

			db.WriteableTable.prototype.__delete = function _delete(data, trans, filters) {
				var deferred = $q.defer(),
					table = this,
					key = angular.isString(data) ? data : data[table.noInfoPath.primaryKey],
					collection;

				_dexie.transaction("rw", table, function () {

						Dexie.currentTransaction.nosync = true;

						if (!!filters) {
							//First filter will use where();
							var filter = filters[0],
								where = table.where(filter.column),
								ex = filter.filters[0],
								method = where[indexedOperators[ex.operator]];

							collection = method.call(where, ex.value);

							collection.delete()
								//.then(_deleteCachedFile.bind(null, data, trans))
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans, data))
								.catch(_transactionFault.bind(null, deferred.reject.bind(null, data)));

						} else {
							table.delete(key)
								//.then(_deleteCachedFile.bind(null, data, trans))
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans, data))
								.catch(_transactionFault.bind(null, deferred.reject.bind(null, data)));
						}
					}.bind(null, data))
					.then(angular.noop())
					.catch(function (err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noDestroy = function (data, trans, filters) {
				var table = this;

				function _followRelations(tableSchema, rootDatum) {
					var rootRelation = {
							schema: tableSchema,
							table: table,
							deletionKeys: [rootDatum[table.noInfoPath.primaryKey]]
						},
						relations = [rootRelation],
						parentKeys = {};

					parentKeys[rootRelation.schema.entityName] = rootRelation.deletionKeys;

					function _flatten(parentSchema) {
						for (var si = 0; si < parentSchema.relationships.length; si++) {
							var relation = parentSchema.relationships[si],
								ro = {
									parent: parentSchema,
									relation: relation,
									schema: table.noInfoPath.parentSchema.entity(relation.refTable),
									table: db[relation.refTable],
									deletionKeys: [],
									fileKeys: []
								};

							relations.unshift(ro);

							if (!!ro.schema.relationships) {
								_flatten.call(table, ro.schema);
							}

						}
					}

					function _resolveOnToManyRelationship(deferred, childIndex) {
						var childRelation = relations[childIndex],
							f = new noInfoPath.data.NoFilters();

						if (childRelation) {

							f.quickAdd(childRelation.relation.refColumn, "in", parentKeys[childRelation.parent.entityName]);

							//console.log(childRelation.parent.entityName, f.toSQL());
							childRelation.table.noRead(f, 1)
								.then(function (data) {
									var keys = _.pluck(data, childRelation.schema.primaryKey);
									if (childRelation.schema.relationships) parentKeys[childRelation.schema.entityName] = keys;
									childRelation.deletionKeys = data;

									// if (childRelation.schema.NoInfoPath_FileUploadCache) {
									// 	childRelation.fileKeys = data;
									//
									// 	console.log(childRelation.fileKeys);
									// }

									_resolveOnToManyRelationship(deferred, childIndex - 1);
								})
								.catch(function (err) {
									_resolveOnToManyRelationship(deferred, childIndex - 1);
									console.error(err);
								});

						} else {
							if (childIndex > -1) {
								deferred.reject("Something might have gone wrong @ index ", childIndex);
							} else {
								//console.log(childIndex, relations);
								deferred.resolve(relations);
							}
						}

					}

					function _cascadeDeletes(results) {
						var deleteTargets = results,
							deferred = $q.defer();

						function _recurseRelations(curIndex) {
							var deleteTarget = deleteTargets[curIndex],
								deleteData = {};

							// deleteData[deleteTarget.schema.primaryKey] =
							if (deleteTarget) {
								_recurseDeletions(deleteTarget)
									.then(function (result) {
										_recurseRelations(curIndex + 1);
									})
									.catch(function (err) {
										console.error(err);
									});
							} else {
								deferred.resolve();
							}


						}

						function _recurseDeletions(deleteTarget) {
							var deferred = $q.defer();

							function _recurse(curIndex) {
								var deleteItem = deleteTarget.deletionKeys[curIndex];

								if (deleteItem) {
									//deleteItem[deleteTarget.schema.primaryKey] = key[deleteTarget.schema.primaryKey];

									deleteTarget.table.__delete(deleteItem, trans)
										.then(function (results) {
											_recurse(curIndex + 1);
										})
										.catch(function (err) {
											deferred.reject(err);
										});
								} else {
									deferred.resolve("all done.");
								}
							}

							_recurse(0);

							return deferred.promise;

						}

						_recurseRelations(0);

						return deferred.promise;
					}

					return $q(function (resolve, reject) {
						var resolveOneToManyDeferred = $q.defer(),
							resolveDeletes = $q.defer();

						_flatten.call(this, this.noInfoPath);

						//console.log(relations);

						if (relations.length < 2) throw "Error occured resolving deletion data.";

						_resolveOnToManyRelationship(resolveOneToManyDeferred, relations.length - 2);

						resolveOneToManyDeferred.promise
							.then(_cascadeDeletes.bind(this))
							.then(resolve)
							.catch(reject);


					}.bind(table));
				}

				function _execute(data, trans, filters) {
					if (!!table.noInfoPath.relationships) {
						return _followRelations.call(table, table.noInfoPath, data);
					} else {
						return table.__delete.call(table, data, trans, filters)
							.catch(function (err) {
								console.error(err);
							});
					}

				}

				return _execute.call(table, data, trans, filters);
			};

			db.WriteableTable.prototype.noClear = function () {
				var deferred = $q.defer(),
					table = this,
					collection;

				//noLogService.log("adding: ", _dexie.currentUser);
				//noLogService.log(key);

				_dexie.transaction("rw", table, function () {
						Dexie.currentTransaction.nosync = true;
						collection = table.toCollection();

						collection.delete()
							.then(deferred.resolve)
							.catch(deferred.reject);

					})
					.then(angular.noop())
					.catch(function (err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noOne = function (query, noReadOptions) {
				//console.log("noReadOptions", noReadOptions);
				var noFilters = noInfoPath.resolveID(query, this.noInfoPath);

				return this.noRead(noFilters, noReadOptions)
					.then(function (resultset) {
						var data;

						if (resultset.length === 0) {
							//throw "noIndexedDb::noOne: Record Not Found";
							return null;
						} else {
							data = resultset[0];
						}

						return data;
					});
			};

			db.WriteableTable.prototype.loadData = function (data) {
				var deferred = $q.defer(),
					table = this;

				//data = _unfollow_data(table, data);

				//console.warn(data);
				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function () {
					_dexie.nosync = true;

					table.add(data)
						.then(deferred.resolve)
						.catch(function (table, data, err) {
							//console.error(err);
							deferred.reject({table: table, data: data, error: err});
						}.bind(null, table, data));
				});

				return deferred.promise;

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
						if (currentItem < data.length) {
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

					return $q(function (resolve, reject) {
						THIS.noOne(id)
							.then(resolve)
							.catch(function (err) {
								//console.error(err);
								resolve(false);
								return false;
							});
					});
				}

				function isSame(data, changes) {
					if (!!data) {
						var localDate = new Date(data.ModifiedDate),
							remoteDate = new Date(changes.ModifiedDate),
							same = moment(localDate).isSame(remoteDate, 'second');

						return same;
					} else {
						return false;
					}
				}

				function save(changes, data, resolve, reject) {
					var ops = {
						"I": THIS.noCreate.bind(THIS),
						"U": THIS.noUpdate.bind(THIS)
					};
					//console.log(data, changes);
					if (isSame(data, changes.values)) {
						//console.warn("not updating local data because the ModifiedDate is the same or newer than the data being synced.");
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
						//console.log(data);
						resolve(data);
					}

					function fault(err) {
						//console.error(err);
						reject(err);
					}

					checkForExisting()
						.then(function (data) {
							//console.log("checkForExisting", !!data);
							// if(data) {
							switch (noChange.operation) {
							case "D":
								var t = {};

								t[THIS.noInfoPath.primaryKey] = noChange.changedPKID;

								THIS.noDestroy(t)
									.then(ok)
									.catch(fault);
								break;

							case "I":
								if (!data) {
									save(noChange, data, ok, fault);
								} else {
									noChange.isSame = true;
									resolve(noChange);
								}
								break;
							case "U":
								if (data) {
									save(noChange, data, ok, fault);
								} else {
									resolve(data);
								}
								break;
							}
							// }else{
							// 	resolve({});
							// }

						});
				});
			};

			db.WriteableTable.prototype.bulkLoadOne = function (datum) {
				var table = this;

				_dexie.transaction('rw', table, function () {
					Dexie.currentTransaction.nosync = true;
					_next();
				});

				function _next() {
					return table.add(datum);
				}
			};

			db.WriteableTable.prototype.hasPrimaryKeys = function (keyList) {
				return this.where(":id").anyOfIgnoreCase(keyList).primaryKeys();
			};

			function _unfollow_data(table, data) {
				var foreignKeys = table.noInfoPath.foreignKeys || {};

				for (var fks in foreignKeys) {

					var fk = foreignKeys[fks],
						datum = data[fk.column];

					if (datum) {
						data[fk.column] = datum[fk.refColumn] || datum;
					}
				}

				return data;
			}

		}

		this.destroyDb = function (databaseName) {
			var deferred = $q.defer();
			var db = _noIndexedDb.getDatabase(databaseName);
			if (db) {
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
			console.log("noDatum::constructor"); //NOTE: This never seems to get called.
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
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
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
 *        "sort":  [{"field": "Percentage", "dir": "asc"}],
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
	function isNumber(i) {
		return !Number.isNaN(Number(i)) && i !== null;
	}
	var toDatabaseConversionFunctions = {
				"bigint": function (i) {
					return isNumber(i) ? i : null;
				},
				"bit": function (i) {
					return isNumber(i) ? i : null;
				},
				"decimal": function (n) {
					return isNumber(n) ? n : null;
				},
				"int": function (i) {
					return isNumber(i) ? i : null;
				},
				"money": function (n) {
					return isNumber(n) ? n : null;
				},
				"numeric": function (n) {
					return isNumber(n) ? n : null;
				},
				"smallint": function (i) {
					return isNumber(i) ? i : null;
				},
				"smallmoney": function (n) {
					return isNumber(n) ? n : null;
				},
				"tinyint": function (i) {
					return isNumber(i) ? i : null;
				},
				"float": function (i) {
					return isNumber(i) ? i : null;
				},
				"real": function (i) {
					return isNumber(i) ? i : null;
				},
				"date": function (n) {
					var d = null;

					if(n) {
						// Convert JS date to moment UTC, then stringify it to strip out offset and then make it a dbDate... otherwise assume it's already a dbdate
						d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
					}

					return d;
				},
				"datetime": function (n) {
					var d = null;

					if(n) {
						d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
					}

					return d;
				},
				"datetime2": function (n) {
					var d = null;

					if(n) {
						d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
					}

					return d;
				},
				"datetimeoffset": function (n) {
					var d = null;

					if(n) {
						d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
					}

					return d;
				},
				"smalldatetime": function (n) {
					var d = null;

					if(n) {
						d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
					}

					return d;
				},
				"time": function (n) {
					var d = null;

					if(n) {
						d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
					}

					return d;
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
				},
				"mediumtext": function (t) {
					return angular.isString(t) ? t : null;
				}
			},
			fromDatabaseConversionFunctions = {
				"bigint": function (i) {
					return i;
				},
				"bit": function (i) {
					return i;
				},
				"decimal": function (n) {
					return n;
				},
				"int": function (i) {
					return i;
				},
				"money": function (n) {
					return n;
				},
				"numeric": function (n) {
					return n;
				},
				"smallint": function (i) {
					return i;
				},
				"smallmoney": function (n) {
					return n;
				},
				"tinyint": function (i) {
					return i;
				},
				"float": function (i) {
					return i;
				},
				"real": function (i) {
					return i;
				},
				"date": function (n) {
					return n ? new Date(n) : null;
				},
				"datetime": function (n) {
					return n ? new Date(n) : null;
				},
				"datetime2": function (n) {
					return n ? new Date(n) : null;
				},
				"datetimeoffset": function (n) {
					return n ? new Date(n) : null;
				},
				"smalldatetime": function (n) {
					return n ? new Date(n) : null;
				},
				"time": function (n) {
					return n ? new Date(n) : null;
				},
				"char": function (t) {
					return t;
				},
				"nchar": function (t) {
					return t;
				},
				"varchar": function (t) {
					return t;
				},
				"nvarchar": function (t) {
					return t;
				},
				"text": function (t) {
					return t;
				},
				"ntext": function (t) {
					return t;
				},
				"binary": function (i) {
					return i;
				},
				"varbinary": function (i) {
					return i;
				},
				"image": function (i) {
					return i;
				},
				"uniqueidentifier": function (t) {
					return t;
				},
				"mediumtext": function (t) {
					return t;
				},
				"longtext": function (t) {
					return t;
				}
			};

	function NoDataSource($injector, $q, $timeout, noConfig, noDynamicFilters, dsConfig, scope, noCalculatedFields, noFileSystem, noMimeTypes, watch, DATASOURCE_TO_CONVERSION_FUNCTIONS, DATASOURCE_FROM_CONVERSION_FUNCTIONS) {
		var provider = $injector.get(dsConfig.dataProvider),
			db = provider.getDatabase(dsConfig.databaseName),
			noReadOptions = new noInfoPath.data.NoReadOptions(dsConfig.noReadOptions),
			_entity = db[dsConfig.entityName],
			qp = $injector.get("noQueryParser"),
			isNoView = _entity.constructor.name === "NoView",
			_scope = scope,
			fsDb = noFileSystem.getDatabase(_entity.noInfoPath),
			noFileCache = fsDb ? fsDb.NoFileCache : null;

		function _makeRemoteFileUrl(resource) {
			return noConfig.current.FILECACHEURL + "/" + resource.ID + "." + noMimeTypes.fromMimeType(resource.type);
		}

		Object.defineProperties(this, {
			"entity": {
				"get": function () {
					return _entity.noInfoPath;
				}
			},
			"underlyingEntity": {
				"get": function() {
					return _entity;
				}
			}
		});

		// The following two functions only change columns defined in the table configuration, it does not touch any columns that are not defined. This does not scrub out other columns!
		function cleanSaveFields(data) {
			var columns = _entity.noInfoPath && _entity.noInfoPath.columns ? _entity.noInfoPath.columns : [],
				cleaned = noInfoPath.data.NoDataModel.clean(data, _entity.noInfoPath);

			for(var ck in columns) {
				var col = columns[ck],
					val = cleaned[ck];

				val = val === "undefined" || val === undefined ? null : val;

				//perform data conversion
				val = col.type ? DATASOURCE_TO_CONVERSION_FUNCTIONS[col.type](val) : val;

				//clean up NaN's
				val = isNaN(val) && typeof val === "number" ? null : val;

				cleaned[ck] = val;
			}

			return cleaned;
		}

		function cleanReadFields(data) {
			var columns = _entity.noInfoPath && _entity.noInfoPath.columns ? _entity.noInfoPath.columns : [];

			if(data.length){
				for(var i = 0; i < data.length; i++){
					data[i] = _cleanRecord(data[i]);
				}
			} else {
				data = _cleanRecord(data);
			}

			return data;

			function _cleanRecord(datum){
				for(var ck in columns) {
					var col = columns[ck],
						val = datum[ck];

					val = val === "undefined" || val === undefined ? null : val;

					//perform data conversion
					val = col.type ? DATASOURCE_FROM_CONVERSION_FUNCTIONS[col.type](val) : val;

					//clean up NaN's
					val = isNaN(val) && typeof val === "number" ? null : val;

					datum[ck] = val;
				}

				return datum;
			}
		}

		// var tmpFilters = noDynamicFilters.configure(dsCfg, scope, watch);
		// ds.filter = tmpFilters ? {
		// 	filters: tmpFilters
		// } : undefined;
		//
		this.create = function (data, noTrans) {
			if(isNoView) throw "create operation not supported on entities of type NoView";

			data = cleanSaveFields(data);

			return _entity.noCreate(data, noTrans);

		};


		//This function are for use by what???
		this.createDocument = function (data, file, trans) {
			return this.create(data,trans)
				.then(function(fileObj) {
					file.DocumentID = fileObj[_entity.noInfoPath.primaryKey];
					return noFileCache.noCreate(file);
				});
		};

		this.deleteDocument = function (doc, trans, deleteFile) {
			return $q(function(resolve, reject){
				if (angular.isObject(doc) && deleteFile && doc.ID) {
					this.destroy(doc, trans).then(resolve);  //This way will delete the metadata and the file
				} else if (angular.isObject(doc) && !deleteFile) {
					_entity.noDestroy(data, noTrans, filters) //This way will only delete the document. The file will remain.
						.then(resolve);
				} else {
					resolve();
				}
			}.bind(this));
		};

		this.readDocument = function(fileObj) {
			var promise;

			if (angular.isObject(fileObj) && fileObj.ID) {
				promise = noFileCache.noOne(fileObj);
			} else {
				promise = $q.when(true);
			}

			return promise;
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

				var x = queryParser.parse(params) || [];
				if(!angular.isUndefined(follow)) {
					noReadOptions.followForeignKeys = follow;
				}


				x.push(noReadOptions);

				return _entity.noRead.apply(_entity, x)
					.then(function (data) {
						data = noCalculatedFields.calculate(config, data);

						data = data ? cleanReadFields(data) : data;
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
							requestData(scope, dsConfig, _entity, qp, resolve, reject);
							waitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, _entity, qp, resolve, reject);
				}
			});
		};

		this.update = function (data, noTrans) {
			if(isNoView) throw "update operation not supported on entities of type NoView";

			data = cleanSaveFields(data);

			return _entity.noUpdate(data, noTrans);
		};

		/*
		*	## destroy
		*
		*	Deletes the entity supplied as data.  If the current entity supports NoInfoPath_FileUploadCache
		*	then delete the associated file.  if `filters` is a bool and false, then it indicates that the
		*	associated file should be delete. If it is a bool and true the file should be preserved.
		*
		*/
		this.destroy = function (data, noTrans, filters) {
			if(isNoView) throw "destroy operation not supported on entities of type NoView";

			/*
			*	> This method also doubles as the `clear` method when it is called with no parameters.
			*/


			var p = data ? _entity.noDestroy(data, noTrans, filters) : _entity.noClear();

			return p.then(function(r1){
				if(_entity.noInfoPath.NoInfoPath_FileUploadCache) {
					return noFileCache.noDestroy(data)
						.then(function(r2){
							console.log(r2);
							return r2;
						});
				} else {
					return r1;
				}
			})
			.catch(function(err){
				console.error(err);
			});
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
					params[1] = noReadOptions;
				}

				return entity.noOne.apply(entity, params)
					.then(function (data) {
						data = data ? cleanReadFields(data) : data;
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
							requestData(scope, dsConfig, _entity, resolve, reject);
							endWaitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, _entity, resolve, reject);
				}

			});

		};

		this.bulkLoad = function (data) {
			var THIS = this,
				deferred = $q.defer(),
				table = _entity;

			function _downloadFile(fileObj) {
				return $q(function(resolve, reject){
					if(table.noInfoPath.NoInfoPath_FileUploadCache) {
						if(fileObj && fileObj.name && fileObj.type) {
							//var x =
								// .then(resolve)
								// .catch(reject);

							// $timeout(function(){
								noFileCache.downloadFile(_makeRemoteFileUrl(fileObj), fileObj.type, fileObj.name).then(resolve).catch(reject);
							// }, 100);
						} else {
							reject(new Error("Invalid document object.  Missing file name and or type properties"));
						}
					} else {
						resolve();
					}
				});
			}

			function _saveParent(fileObj, file) {
				if(table.noInfoPath.NoInfoPath_FileUploadCache) {
					if(file) {
						return THIS.create(fileObj);
					} else {
						return $q.when(null);	//Don't save parent
					}
				} else {
					return THIS.bulkImportOne(fileObj);
				}
			}

			function _saveFile(fileObj, file) {
				if(file) {
					file.DocumentID = fileObj[table.noInfoPath.primaryKey];
					return noFileCache.noCreate(file);
				} else {
					return $q.when(null);
				}
			}

			function _import(data) {
				var total = data ? data.length : 0,
				 	currentItem = 0;

				function _next() {
					if (currentItem < data.length) {
						var datum = data[currentItem];

						_downloadFile(datum)
							.then(_saveFile.bind(THIS, datum))
							.then(_saveParent.bind(THIS, datum))
							.then(deferred.notify)
							.catch(deferred.notify.bind(null, {"error": "error importing data.", "data": datum}))
							.finally(function () {
								currentItem++;
								_next();
							});

					} else {
						deferred.resolve(table.name);
					}
				}

				_next();
			}

			function _clearLocalFileSystem(table) {
				if(table.noInfoPath.NoInfoPath_FileUploadCache) {
					return noFileCache.noClear();
				} else {
					return $q.when();
				}
			}
			//console.info("bulkLoad: ", table.TableName)

			_entity.noClear()
				.then(_clearLocalFileSystem.bind(null, table))
				.then(_import.bind(null, data))
				.catch(function (err) {
					console.error(err);
				});

			return deferred.promise;
		};

		this.bulkImportOne = function (datum) {
			return _entity.bulkLoadOne(datum);
		};
	}


	angular.module("noinfopath.data")
		.constant("DATASOURCE_TO_CONVERSION_FUNCTIONS", toDatabaseConversionFunctions)
		.constant("DATASOURCE_FROM_CONVERSION_FUNCTIONS", fromDatabaseConversionFunctions)
		.service("noDataSource", ["$injector", "$q", "$timeout", "noConfig", "noDynamicFilters", "noCalculatedFields", "noFileSystem", "noMimeTypes", "DATASOURCE_TO_CONVERSION_FUNCTIONS", "DATASOURCE_FROM_CONVERSION_FUNCTIONS", function ($injector, $q, $timeout, noConfig, noDynamicFilters, noCalculatedFields, noFileSystem, noMimeTypes, DATASOURCE_TO_CONVERSION_FUNCTIONS, DATASOURCE_FROM_CONVERSION_FUNCTIONS) {
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
			return new NoDataSource($injector, $q, $timeout, noConfig, noDynamicFilters, dsConfig, scope, noCalculatedFields, noFileSystem, noMimeTypes, watch, DATASOURCE_TO_CONVERSION_FUNCTIONS, DATASOURCE_FROM_CONVERSION_FUNCTIONS);
		};
	}])

	;


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
				rd = 0;

			if(angular.isObject(d1) && angular.isDate(d1) && angular.isObject(d2) &&  angular.isDate(d2)) {
				rd = (d1 - d2) / 1000 / 60 / 60 / 24;
			}

			return rd;
		}

		function timespanHours(parserCfg, data){
			var d1 = data[parserCfg.parser.fields.date1] ? moment(new Date(data[parserCfg.parser.fields.date1])) : "",
				d2 = data[parserCfg.parser.fields.date2] ? moment(new Date(data[parserCfg.parser.fields.date2])) : "",
				rd = 0;

				if(angular.isObject(d1) && d1.isValid() && angular.isObject(d2) && d2.isValid()) {
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
/*
*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
*
*	___
*
*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
*
*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
*
*	Copyright (c) 2017 The NoInfoPath Group, LLC.
*
*	Licensed under the MIT License. (MIT)
*
*	___
*
*/
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
	*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
	*
	*	___
	*
	*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
	*
	*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
	*
	*	Copyright (c) 2017 The NoInfoPath Group, LLC.
	*
	*	Licensed under the MIT License. (MIT)
	*
	*	___
	*
	*	noTemplateCache
	*	---------------
	*
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

	function NoMockHTTPService($injector, $q, $rootScope) {
		var THIS = this;

		this.whenReady = function (tables) {

			return $q(function (resolve, reject) {
				if($rootScope.noMockHTTPInitialized) {
					console.log("noMockHTTP Ready.");
					resolve();
				} else {
					$rootScope.$watch("noMockHTTPServiceInitialized", function (newval) {
						if(newval) {
							console.log("noMockHTTP ready.");
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
				console.log("noMockHTTP_" + schema.config.dbName + " ready.");

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
		this.$get = ['$injector', '$q', '$rootScope', 'noLogService', function ($injector, $q, $rootScope) {
			return new NoMockHTTPService($injector, $q, $rootScope);
			}];
		}]);
})(angular);

// no-local-file-storage.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	noLocalFileSystem
 *	-----------------
 *
 */
(function (angular, undefined) {
	// This method of user agent detection also works, though it means you might have to maintain this UA list
	// if (!storageInfo && !requestFileSystem && navigator.userAgent.match(/(iOS|iPhone|iPod|iPad|Android|BlackBerry)/)) {
	// 	document.addEventListener("deviceready", function(){
	// 		storageInfo = navigator.webkitPersistentStorage;
	// 		requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	// 	}, false);
	// } else if(!storageInfo && !requestFileSystem) {
	// 	throw new Error("Could not resolve storageInfo and/or requestFileSystem interfaces.");
	// }

	function NoLocalFileSystemService($q, $http, noLocalStorage, noHTTP, noMimeTypes, noConfig) {
		var storageInfo = navigator.webkitPersistentStorage;
		var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

		var requestedBytes, fileSystem, root;

		var ENCODING_ERR = "5",
			INVALID_MODIFICATION_ERR = "9",
			INVALID_STATE_ERR = "7",
			NO_MODIFICATION_ALLOWED_ERR = "6",
			NOT_FOUND_ERR = "1",
			NOT_READABLE_ERR = "4",
			PATH_EXISTS_ERR = "12",
			QUOTA_EXCEEDED_ERR = "10",
			SECURITY_ERR = "2",
			TYPE_MISMATCH_ERR = "11",
			errorMessages = {};

		errorMessages[ENCODING_ERR] = "The URL is malformed. Make sure that the URL is complete and valid."
		errorMessages[INVALID_MODIFICATION_ERR] = "The modification requested is not allowed. For example, the app might be trying to move a directory into its own child or moving a file into its parent directory without changing its name.";
		errorMessages[INVALID_STATE_ERR] = "The operation cannot be performed on the current state of the interface object. For example, the state that was cached in an interface object has changed since it was last read from disk.";
		errorMessages[NO_MODIFICATION_ALLOWED_ERR] = "The state of the underlying file system prevents any writing to a file or a directory.";
		errorMessages[NOT_FOUND_ERR] = "A required file or directory could not be found at the time an operation was processed. For example, a file did not exist but was being opened.";
		errorMessages[NOT_READABLE_ERR] = "The file or directory cannot be read, typically due to permission problems that occur after a reference to a file has been acquired (for example, the file or directory is concurrently locked by another application).";
		errorMessages[PATH_EXISTS_ERR] = "The file or directory with the same path already exists.";
		errorMessages[QUOTA_EXCEEDED_ERR] = "Either there's not enough remaining storage space or the storage quota was reached and the user declined to give more space to the database. To ask for more storage, see Managing HTML5 Offline Storage.";
		errorMessages[SECURITY_ERR] = "Access to the files were denied for one of the following reasons: \nThe files might be unsafe for access within a Web application.\nToo many calls are being made on file resources.\nOther unspecified security error code or situations.";
		errorMessages[TYPE_MISMATCH_ERR] = "The app looked up an entry, but the entry found is of the wrong type. For example, the app is asking for a directory, when the entry is really a file.";




		function fileSystemErrors(errCode) {
			var e = errorMessages[String(errCode)];

			return e ? new Error(e) : new Error("Unknown  FileError code " + errCode);
		}

		/**
		 *	@method read(file)
		 *
		 *	Reads a file from a DOM File object and converts to a binary
		 *	string compatible with the local, and upstream file systems.
		 */
		function _readFileObject(file) {
			var deferred = $q.defer();

			var fileObj = {},
				reader = new FileReader();

			reader.onloadstart = function (e) {
				fileObj.name = file.name;
				fileObj.size = file.size;
				fileObj.type = file.type;
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader.onload = function (e) {
				//fileObj.blob = e.target.result;
				deferred.resolve(e.target.result);
			};

			reader.onerror = function (err) {
				deferred.reject(err);
			};

			reader.onprogress = function (e) {
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader.readAsBinaryString(file);

			return deferred.promise;
		}
		this.getBinaryString = _readFileObject;

		function _requestStorageQuota() {
			requestedBytes = noConfig.current.localFileSystem.quota;
			if (navigator.webkitPersistentStorage) {
				if (!noLocalStorage.getItem("noLocalFileSystemQuota")) {

					return $q(function (resolve, reject) {
						storageInfo.requestQuota(
							requestedBytes,
							function (grantedBytes) {
								console.log('Requested ', requestedBytes, 'bytes, were granted ', grantedBytes, 'bytes');
								noLocalStorage.setItem("noLocalFileSystemQuota", grantedBytes);
								resolve(grantedBytes);
							},
							function (e) {
								console.log('Error', e);
								reject(e);
							}
						);
					});
				}
			} else {
				noLocalStorage.setItem("noLocalFileSystemQuota", noConfig.current.localFileSystem.quota);
				return Promise.resolve();
			}





		}
		this.requestStorageQuota = _requestStorageQuota;

		function _requestFileSystem() {
			var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem,
				deferred = $q.defer();

			requestFileSystem(
				window.PERSISTENT,
				requestedBytes,
				function (fs) {

					fileSystem = fs;

					fs.root.getDirectory('NoFileCache', {
						create: true
					}, function (directoryEntry) {
						root = directoryEntry;
						deferred.resolve();
					}, deferred.reject);

					deferred.resolve(fs);
				},
				function (e) {
					console.log(e);
					deferred.reject(fileSystemErrors(e.code));
				}
			);

			return deferred.promise;
		}
		this.requestFileSystem = _requestFileSystem;

		function str2ab(str) {
			var buf = new ArrayBuffer(str.length); // 2 bytes for each char
			var bufView = new Uint8Array(buf);
			for (var i = 0, strLen = str.length; i < strLen; i++) {
				bufView[i] = str.charCodeAt(i);
			}
			return buf;
		}

		function _count() {
			var deferred = $q.defer(),
				noFileCacheReader = root.createReader();

			noFileCacheReader.readEntries(function (results) {
				deferred.resolve(results.length);
			}, deferred.reject);

			return deferred.promise;
		}

		function _dir() {
			var deferred = $q.defer(),
				noFileCacheReader = root.createReader();

			noFileCacheReader.readEntries(function (results) {
				deferred.resolve(new noInfoPath.data.NoResults(results));
			}, deferred.reject);

			return deferred.promise;
		}
		this.dir = _dir;

		function _save(fileObj, fileIdKey) {

			return $q(function (resolve, reject) {
				if (!root || fileObj === null) {
					reject("File not found in File Cache.");
					return;
				}

				var path = fileObj.DocumentID + "." + noMimeTypes.fromMimeType(fileObj.type);

				_readFileObject(fileObj)
					.then(function (fileBlob) {
						root.getFile(path, {
							create: true
						}, function (fileEntry) {
							fileEntry.createWriter(function (writer) {
								var arr = [str2ab(fileBlob)],
									blob = new Blob(arr, {
										type: fileObj.type
									});
								writer.write(blob);

								resolve(fileObj);
							}, reject);
						}, reject);
					})
					.catch(function (err) {

						throw fileSystemErrors(err.target.error.code);
						//console.error(err);
					});



			});

		}
		this.save = _save;

		function _read(fileObj, fileNameField) {
			return $q(function (resolve, reject) {
				var path = fileObj[fileNameField || "DocumentID"] + "." + noMimeTypes.fromMimeType(fileObj.type);

				if (!root) reject(new Error("Root folder missing."));

				root.getFile(path, null, function (fileEntry) {
					resolve({
						fileObj: fileObj,
						fileEntry: fileEntry
					});
				}, reject);
			});

		}
		this.read = _read;

		// function _getFileUrls(docs, resolver) {
		// 	var promises = [];
		//
		//
		//
		// 	for (var d = 0; d < docs.length; d++) {
		//
		// 		var doc = docs[d],
		// 			fileId = null,
		// 			useDoc = false;
		//
		// 		if (angular.isFunction(resolver)) {
		// 			doc = resolver(doc);
		// 			fileId = doc ? doc.FileID : "";
		// 		} else if (angular.isObject(resolver)) {
		// 			useDoc = noInfoPath.getItem(doc, resolver.key) === resolver.value;
		// 			if (useDoc) {
		// 				fileId = doc.FileID;
		// 			}
		// 		} else {
		// 			fileId = doc.FileID;
		// 		}
		//
		// 		if (!!fileId) {
		// 			promises.push(_toUrl(fileId)
		// 				.then(function (doc, results) {
		// 					return {
		// 						url: results ? results.url : "",
		// 						name: doc.name
		// 					};
		// 				}.bind(null, docs[d])));
		//
		// 		}
		// 	}
		//
		// 	return $q.all(promises);
		// }
		// this.getFileUrls = _getFileUrls;
		//
		// function _toUrl(fileObj) {
		// 	return noLocalFileStorage.get(angular.isObject(fileObj) ? fileObj.FileID : fileObj)
		// 		.then(_save)
		// 		.then(_read)
		// 		.then(function (result) {
		// 			result.url = result.fileEntry.toURL();
		// 			return result;
		// 		})
		// 		.catch(function (err) {
		// 			console.error(err);
		// 		});
		// }
		// this.getUrl = _toUrl;

		function _get(fileObj, schema) {
			var options = {
				headers: {
					"Content-Type": fileObj.type,
					"Accept": fileObj.type
				},
				method: "GET",
				responseType: "arraybuffer"
			};

			return _read(fileObj, schema.primaryKey)
				.then(function (file) {
					return _download(file.fileEntry.toURL(), fileObj.type, fileObj.name)
						.then(function (resp) {
							return resp.data || resp;
						});
				})
				.catch(function (err) {
					//err.target.error.code
					throw err; //fileSystemErrors(err.code)

				});

		}
		this.getFile = _get;

		function _delete(fileObj, fileNameField) {
			if (!fileObj.type) {
				return $q.when("fileObj does not have type provided.");
			} else {
				return $q(function (resolve, reject) {
					var path = fileObj[fileNameField || "DocumentID"] + "." + noMimeTypes.fromMimeType(fileObj.type);
					if (!root) reject("Local file system is not initialized.");
					if (!fileObj) reject("File metadata object is missing");

					root.getFile(path, null, function (fileEntry) {
						fileEntry.remove(resolve, reject);
					}, reject);
				});
			}
		}
		this.deleteFile = _delete;

		function _clear() {
			var deferred = $q.defer(),
				noFileCacheReader = root.createReader();

			noFileCacheReader.readEntries(function (results) {
				if (!!results.length) {
					var count = 0;
					console.log("Deleteing", results.length);

					results.forEach(function (f) {
						f.remove(function () {
							count++;
							if (count >= results.length) deferred.resolve();
						}, function (err) {
							console.log(err);
							count++;
							if (count >= results.length) deferred.resolve();
						});
					});

				} else {
					deferred.resolve();
				}

			});

			return deferred.promise;

		}
		this.clear = _clear;

		function _download(url, mimeType, fileName) {
			return $q(function (resolve, reject) {
				var options = {
					headers: {
						"Content-Type": mimeType,
						"Accept": mimeType
					},
					method: "GET",
					responseType: "arraybuffer"
				};

				noHTTP.noRequest(url, options)
					.then(function (resp) {
						//console.log(x.readAsArrayBuffer(resp.data));
						var file = new Blob([resp.data], { type: mimeType });
						file.name = fileName;

						// if(cordova) {
						//
						// } else {
						// 	file = new File(, fileName, {
						// 		type: mimeType
						// 	});
						// }
						console.log("noLocalFileSystem::download", file.name, mimeType, file.type, file.size);
						resolve(file);
					})
					.catch(function (err) {
						resolve(null);
					});
			});

		}
		this.downloadFile = _download;
	}



	/*
	 *	noMimeTypes
	 *	-----------
	 */
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

		for (var m in mimeTypes) {
			var mime = mimeTypes[m];
			mimeTypesInverted[mime] = m;
		}

		this.fromFileName = function (fileName) {
			var ext = fileName.substring(fileName.lastIndexOf(".") + 1);
			return mimeTypes[ext.toLowerCase()];
		};


		this.fromExtention = function (ext) {
			return mimeTypes[ext.toLowerCase()];
		};

		this.fromMimeType = function (mimeType) {
			return mimeTypesInverted[mimeType.toLowerCase()];
		};

		this.isImage = function (mimeType) {
			return mimeType.indexOf("image/") > -1;
		};
	}

	function NoFileSystemService($q, $rootScope, noLocalFileSystem) {
		var THIS = this;

		function _recordTransaction(resolve, tableName, operation, trans, rawData, result1, result2) {
			//console.log(arguments);

			var transData = result2 && result2.rows && result2.rows.length ? result2 : angular.isObject(result1) ? result1 : rawData;

			if (trans) trans.addChange(tableName, transData, operation, "NoInfoPath_dtc_v1_files");

			resolve(transData);
		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		this.whenReady = function (config) {
			return $q(function (resolve, reject) {
				var dbInitialized = "noFileSystemInitialized";

				if ($rootScope[dbInitialized]) {
					resolve();
				} else {
					$rootScope.$watch(dbInitialized, function (newval) {
						if (newval) {
							resolve();
						}
					});

				}
			});
		};

		this.configure = function () {
			var schema = {
					"dbName": "rmEFR2",
					"provider": "LocalFileSystem",
					"schemaSource": {
						"provider": "inline",
						"schema": {
							"NoFileCache": {
								"entityName": "NoFileCache",
								"entityType": "T",
								"primaryKey": "name",
								"foreignKeys": {},
								"columns": {},
								"indexes": []
							}
						}
					}
				},
				db = new noFileSystemDb(),
				dbInitialized = "noFileSystem_rmEFR2";

			return $q(function (resolve, reject) {
				db.NoFileCache = new NoTable($q, "NoFileCache", schema, noLocalFileSystem);
				$rootScope[dbInitialized] = db;
				console.log(dbInitialized + " ready.");
				resolve(THIS);
			});

		};

		this.getDatabase = function (backerSchema) {
			var dbInitialized = "noFileSystem_rmEFR2",
				db = $rootScope[dbInitialized];

			if (db && db.NoFileCache) {
				db.NoFileCache.backerSchema = backerSchema;
			}

			return db;
		};

		this.destroyDb = function (databaseName) {
			return $q.when();
		};

		function noFileSystemDb() {}

		function NoTable($q, tableName, table, noLocalFileSystem) {
			var THIS = this,
				schema = table,
				SQLOPS = {};

			Object.defineProperties(this, {
				entity: {
					get: function () {
						return _table;
					}
				},
				backerSchema: {
					set: function (v) {
						schema = v;
					}
				}
			});

			function noCreate(data, trans) {
				return $q(function (resolve, reject) {

					noLocalFileSystem.save(data, schema.primaryKey)
						.then(_recordTransaction.bind(null, resolve, schema.entityName, "C", trans, data))
						.catch(_transactionFault.bind(null, reject));
				});
			}
			this.noCreate = noCreate;

			function noDestroy(data) {
				return $q(function (resolve, reject) {
					noLocalFileSystem.deleteFile(data, schema.primaryKey)
						.then(resolve)
						.catch(resolve);
				});
			}
			this.noDestroy = noDestroy;

			this.noRead = function () {
				return noLocalFileSystem.dir();
			};

			this.noUpdate = function (data, trans) {
				return noLocalFileSystem.deleteFile(data, schema.primaryKey)
					.then(function (data) {
						return noLocalFileSystem.save(data, schema.primaryKey)
							.catch(function (err) {
								return err;
							});
					})
					.catch(function (err) {
						return err;
					});

			};

			this.noOne = function (query) {
				return noLocalFileSystem.getFile(query, schema);
			};

			/*
			 * ### @method noClear()
			 *
			 * Delete all files from the cache, without recording each delete transaction.
			 *
			 * #### Returns
			 * AngularJS Promise.
			 */
			this.noClear = function () {
				if (schema.entityType === "V") throw "Clear operation not supported by SQL Views.";

				return noLocalFileSystem.clear();
			};

			/*
			 *	### @method noBulkCreate(data)
			 *
			 *	Inserts a file in to cache without logging a transaction.
			 */
			this.noBulkCreate = function (data) {
				return $q.when("noBulkCreate not supported by noFileSystem");
			};

			/*
			 *	### @method bulkload(data, progress)
			 *
			 *	Returns an AngularJS Promise.  Takes advantage of
			 *	Promise.notify to report project of the bulkLoad operation.
			 */
			this.bulkload = function (data, progress, remoteDataSvc) {
				if (_table.entityType === "V") throw "BulkLoad operation not supported by SQL Views.";

				return $q.when("bulkload not supported by noFileSystem");
			};

			SQLOPS.I = this.noCreate;
			SQLOPS.U = this.noUpdate;
			SQLOPS.D = this.noDestroy;

			this.noImport = function (noChange) {
				return $q.when("noImport not supported by noFileSystem");
			};

			this.hasPrimaryKeys = function (keyList) {
				return $q.when("hasPrimaryKeys not supported by noFileSystem");
			};

			this.downloadFile = noLocalFileSystem.downloadFile;
		}

	}


	angular.module("noinfopath.data")
		.service("noMimeTypes", [NoMimeTypeService])
		.service("noLocalFileSystem", ["$q", "$http", "noLocalStorage", "noHTTP", "noMimeTypes", "noConfig", NoLocalFileSystemService])
		.service("noFileSystem", ["$q", "$rootScope", "noLocalFileSystem", NoFileSystemService]);

})(angular);

//parameter-parser.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.service("noParameterParser", [function () {
			this.parse = function (data) {
				var keys = Object.keys(data).filter(function (v, k) {
						if(v.indexOf("$") === -1 && v.indexOf(".") === -1) return v;
					}),
					values = {};
				keys.forEach(function (k) {
					var haveSomething = !!data[k],
						notAnArray = !angular.isArray(data[k]),
						haveModelValue = haveSomething && data[k].hasOwnProperty("$modelValue");

					if(haveModelValue) {
						values[k] = data[k].$modelValue;
					} else if(haveSomething && notAnArray) {
						values[k] = data[k];
					} else {
						values[k] = null;
					}

				});

				return values;
			};
			this.update = function (src, dest) {
				var THIS = this,
					keys = Object.keys(src).filter(function (v, k) {
					if(v.indexOf("$") === -1) return v;
				});
				keys.forEach(function (k) {
					var d = dest[k];
					if(d && d.hasOwnProperty("$viewValue")) {
						THIS.updateOne(d, src[k]);
					} else {
						dest[k] = src[k];
					}
				});

				if(dest.$setPristine) {
					dest.$setPristine();
					dest.$setUntouched();
					dest.$commitViewValue();
				}
			};

			this.updateOne = function(ctrl, value) {
				if(ctrl) {
					ctrl.$setViewValue(value);
					ctrl.$setPristine();
					ctrl.$setUntouched();
					ctrl.$render();
				}
			}
		}]);
})(angular);

(function (angular, undefined) {
	"use strict";

	/*
	*	{
	*		"dataProvider": "noIndexedDb",
	*		"databaseName": "rmEFR2",
	*		"entityName": "ReportBidItemValues",
	*		"primaryKey": "ID"
	*	}
	*/
	function MetaDataService($injector, $q, noDataSource, _) {

		function _followMetaData(cfg, arrayOfThings, pivotMetaDataName) {
			var dprov = $injector.get(cfg.dataProvider),
				db = dprov.getDatabase(cfg.databaseName),
				promises = {},
				keys = {};

			arrayOfThings.forEach(function(thing){
				thing[pivotMetaDataName].forEach(function(metaDataItem){
					var meta = metaDataItem.MetaDataDefinitionID,
						filters;

						//Only need follow lookup columns.
						if (meta.InputType === "combobox") {
							if (!!metaDataItem.Value) {
								filters = new noInfoPath.data.NoFilters();
								filters.quickAdd(meta.ValueField, "eq", metaDataItem.Value);

								//use the current `db` for looking up the meta data.
								promises[metaDataItem.Value] = db[meta.ListSource].noOne(filters);
							}
						}
				});
			});

			return _.size(promises) > 0 ?
				$q.all(promises)
					.then(function(refData){
						arrayOfThings.forEach(function(item){
							item[pivotMetaDataName].forEach(function(metaItem){
								var valueCadidate = refData[metaItem.Value];
								metaItem.Value = valueCadidate ? valueCadidate[metaItem.MetaDataDefinitionID.TextField] : metaItem.Value;
							});
						});

						if(pivotMetaDataName) {
							return _pivotMetaData(arrayOfThings, pivotMetaDataName);
						} else {
							return arrayOfThings;
						}
					})
					.catch(function(err){
						console.error(err);
					}) :
				$q.when(arrayOfThings);

		}
		this.follow = _followMetaData;

		function _pivotMetaData(arrayOfThings, metaDataName){
			arrayOfThings.forEach(function(thing){
				thing.metadata = {};
				thing[metaDataName].forEach(function(value){
					var meta = value.MetaDataDefinitionID;

					if (angular.isObject(value.Value)) {
						value = value.Value[meta.TextField];
					} else {
						value = value.Value;
					}
					thing.metadata[meta.Name] = value;
				});

			});

			return arrayOfThings;
		}

	}

	angular.module("noinfopath.data")
		.service("noMetaData", ["$injector", "$q", "noDataSource", "lodash", MetaDataService])
		;

})(angular);
