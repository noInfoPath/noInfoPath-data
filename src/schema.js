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
				"noDBSchema": function (key, schemaConfig) {
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
			var req = {
				method: "GET",
				url: noConfig.NODBSCHEMAURI, //TODO: change this to use the real noinfopath-rest endpoint
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json"
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

		function resolveSchema(schemaKey, schemaConfig) {
			var deferred = $q.defer(),
				schemaProvider = schemaConfig.schemaSource.provider;

			if($rootScope[schemaKey]) {
				deferred.resolve(schemaKey);
			} else {
				$rootScope.$watch(schemaKey, function (newval, oldval) {
					if(newval) {
						noLocalStorage.setItem(schemaKey, newval.tables);
						deferred.resolve(schemaKey);
					}
				});

				schemaSourceProviders[schemaProvider](schemaKey, schemaConfig)
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

				promises.push(resolveSchema(schemaKey, schemaConfig));
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

	.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "$filter", "noLocalStorage", "$injector", function ($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector) {

		return new NoDbSchemaFactory($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector);
	}]);

})(angular);
