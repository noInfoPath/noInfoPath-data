//globals.js
/*
*	NoInfoPath Data (@noinfopath/noinfopath-data)
*	===================
*	*@version 2.0.41* [![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
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
*	|noLocalStorage|Provides access to the Browser's localStorage service.|
*	|noSessionStorage|Provides access to the Browser's sessionStorage service.|
*	|noLocalFileSystem|Stores files within the Brower's Temporary Local File System.|
*	|noLocalFileStorage|Reads a File object retrieved from a standard `input:file` element and saves the data to an IndexedDB object store called NoInfoPath_FileUploadCache. The file blob is stored as `binary string`|
*	|noFileStoreageCRUD|Establishes a CRUD interface in front of `noLocalFileStorage`.|
*	|noMimeTypes|Helper service that returns a mime type given a file extention and vice versa.|
*	|noDataSource|Provides a abstracted CRUD interface that sits in front of actual NoInfoPath CRUD provider services.|
*	|noTransactionCache|Manages data transaction by tracking changes made by a CRUD provider service, and stores the changes in the NoInfoPath_Changes object store.|
*	|noTemplateCache|Sits in front of Angular Template cache, but allows files to be retrieve directly without using `ngInclude` or a directives `templateUrl` property.|
*	|noHTTP|Establishes a CRUD interface in front of the AngularJS `$http` service|
*	|noIndexedDb|Prodvides a CRUD interface for the Browser's native IndexedDB database. (Not fully supported by all browsers.)|
*	|noWebSQL|Provides a CRUD interface for the Browser's native WebSQL database. (Not supported by all Browsers.)|
*
*	### Helper Functions
*
*	|Name|Description|
*	|----|-----------|
*	|digestTimeout|Deprecated; will be removed in a future release.|
*	|digestError|Deprecated; will be removed in a future release.|
*	|digest|Deprecated; will be removed in a future release.|
*	|setItem(store, key, value)|Sets the `value`, on the `store` using the `key`.|
*	|getItem(store, key)|Using the parameters provided, retrieves a value from the `store` using the `key`.|
*	|toDbDate(date)|Converts a JavaScript Date to a database compliant date String.|
*	|||
*	|||
*	|||
*	|||
*	|||
*	|||

*
*/

(noInfoPath.data = {});
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers', 'noinfopath.logger'])

	/*
		*	Helper Functions
		*	----------------
		*
		*	NoInfoPath Data exposes several helper function on the global noInfoPath object
		*	that is placed on the browser's instrinsic `window` object.
	*/
	.run(['$injector', '$parse', '$timeout', '$q', '$rootScope', '$browser', '$filter', "lodash", function ($injector, $parse, $timeout, $q, $rootScope, $browser, $filter, _) {

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
					.format("YYYY-MM-DDTHH:mm:ss.sss");
			}

			if(dateResult === "Invalid date") {
				dateResult = null;
			}

			return dateResult;
		}

		/*
		*	### digestError(fn, error)
		*	*Deprecated*
		*/
		function _toDisplayDate(date) {
			var dateResult = moment.utc(date)
				.format("YYYY-MM-DD HH:mm:ss.sss");

			        
			return dateResult;
		}

		/*
		*	### digestError(fn, error)
		*	*Deprecated*
		*/
		function _isCompoundFilter(indexName) {
			return indexName.match(/^\[.*\+.*\]$/gi);
		}

		/*
		*	### digestError(fn, error)
		*	*Deprecated*
		*/
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

		/*
		*	### digestError(fn, error)
		*	*Deprecated*
		*/
		function _toScopeSafeGuid(uid) {
			return(uid || "").replace(/-/g, "_");
		}

		/*
		*	### digestError(fn, error)
		*	*Deprecated*
		*/
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
