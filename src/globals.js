//globals.js
/*
 *	# noinfopath-data
 *	@version 1.2.10
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
(function(angular, undefined) {
	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers', 'noinfopath.logger'])


	.run(['$injector', '$parse', '$timeout', '$q', '$rootScope', '$browser', '$filter', function($injector, $parse, $timeout, $q, $rootScope, $browser, $filter) {

		function _digestTimeout() {


			if ($timeout.flush && $browser.deferredFns.length) {
				if ($rootScope.$$phase) {
					setTimeout(function() {
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

			if (angular.isObject(error)) {
				digestError = error.toString();
			}

			//console.error(digestError);

			_digest(fn, digestError);
		}

		function _digest(fn, data) {
			var message = [];

			if (angular.isArray(data)) {
				message = data;
			} else {
				message = [data];
			}

			if (window.jasmine) {
				$timeout(function() {
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
			var dateResult = moment.utc(date).format("YYYY-MM-DDTHH:mm:ss.sss");

			        
			return dateResult;
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
		}]);
})(angular);
