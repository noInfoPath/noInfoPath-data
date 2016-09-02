//globals.js
/*
 *	# noinfopath-data
 *	@version 2.0.6
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
			var dateResult = moment.utc(date)
				.format("YYYY-MM-DDTHH:mm:ss.sss");

			        
			return dateResult;
		}

		function _isCompoundFilter(indexName){
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
					//Simple key/value pairs. Assuming all are equal operators and are anded.
					for(var k in query) {
						filters.quickAdd(k, "eq", query[k]);
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
			isCompoundFilter: _isCompoundFilter,
			resolveID: _resolveID
		};

		angular.extend(noInfoPath, _data);
	}]);
})(angular);
