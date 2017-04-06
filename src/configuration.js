//configuration.js
/*
*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
*
*	___
*
*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.57*
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
