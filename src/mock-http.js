//mock-http.js
(function(angular, undefined) {
	"use strict";

	function NoMockHTTPService($injector, $q, $rootScope, noLogService) {
		var THIS = this;

		this.whenReady = function(tables) {

			return $q(function(resolve, reject) {
				if ($rootScope.noMockHTTPInitialized) {
					noLogService.log("noMockHTTP Ready.");
					resolve();
				} else {
					$rootScope.$watch("noMockHTTPServiceInitialized", function(newval) {
						if (newval) {
							noLogService.log("noMockHTTP ready.");
							resolve();
						}
					});

				}
			});
		};

		this.configure = function(noUser, schema ) {
			var jsonDataProvider = $injector.get(schema.config.dataProvider);
			return $q(function(resolve, reject) {
				for (var t in schema.tables) {
					var table = schema.tables[t];
					THIS[t] = new NoTable($q, t, table, jsonDataProvider[t]);
				}
				$rootScope.noHTTPInitialized = true;
				noLogService.log("noMockHTTP_" + schema.config.dbName + " ready.");

				$rootScope["noMockHTTP_" + schema.config.dbName] = THIS;

				resolve(THIS);
			});

		};

		this.getDatabase = function(databaseName) {
			return $rootScope["noMockHTTP_" + databaseName];
		};

	}

	function NoTable($q, tableName, table, data) {
		var THIS = this,
			_table = table,
			_data = data;

		Object.defineProperties(this, {
			entity: {
				get: function() {
					return _table;
				}
			}
		});

		this.noCreate = function(data) {

			return $q.when({});
		};

		this.noRead = function() {
			return $q.when(new noInfoPath.data.NoResults(data));
		};

		this.noUpdate = function(data) {

			return $q.when({});

		};

		this.noDestroy = function(data) {
			return $q.when("200");
		};

		this.noOne = function(query) {
			return $q.when({});

		};
	}


	angular.module('noinfopath.data')

		.provider("noMockHTTP", [function() {
			this.$get = ['$injector', '$q', '$rootScope', 'noLogService', function($injector, $q, $rootScope, noLogService) {
				return new NoMockHTTPService($injector, $q, $rootScope, noLogService);
			}];
		}]);
})(angular);
