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
