/*
* ## noDbSchema
* The noDbSchema service provides access to the database configuration that
* defines how to configure the local IndexedDB data store.
*/
/*
*	### Properties

*	|Name|Type|Description|
*	|----|----|-----------|
*	|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
*	|tables|Object|A hash table of NoInfoPath database schema definitions|
*	|isReady|Boolean|Returns true if the size of the tables object is greater than zero|
*/
/**
*	### Methods

*	#### \_processDbJson
*	Converts the schema received from the noinfopath-rest service and converts it to a Dexie compatible object.

*	##### Parameters
*	|Name|Type|Descriptions|
*	|----|----|------------|
*	|resp|Object|The raw HTTP response received from the noinfopath-rest service|

*	### load()
*	Loads and processes the database schema from the noinfopath-rest service.

*	#### Returns
*	AngularJS::Promise
*/
/*
*	### whenReady
*	whenReady is used to check if this service has completed its load phase. If it has not is calls the internal load method.

*	#### Returns
*	AngularJS::Promise
*/
var GloboTest = {};

(function (angular, Dexie, undefined){
	"use strict";

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

		.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "$filter", "noLocalStorage", "$injector", function($q, $timeout, $http, $rootScope, _, noLogService, $filter, noLocalStorage, $injector){
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
			* ```
			*/


			function NoDbSchema(noConfig, noDbConfig, rawDbSchema){
				//console.warn(rawDbSchema);

				var _config = {},
					_tables = {},
					_views = {},
					_sql = {};

				Object.defineProperties(this, {
					"store": {
						"get": function() { return _config; }
					},
					"tables": {
						"get": function() { return _tables; }
					},
					"isReady": {
						"get": function() { return _.size(_tables) > 0; }
					},
					"sql": {
						"get": function() { return _sql; }
					},
					"views": {
						"get": function() { return _views; }
					}
				});

				_tables = rawDbSchema;

				angular.forEach(_tables, function(table, tableName){
					var primKey = "$$" + table.primaryKey,
						foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");

					//Prep as a Dexie Store config
					_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
				});

			}

			/**
			*	### NoDbSchemaFactory
			*
			*	Creates unique instances of NoDbSchema based on noDBSchema configuration data.
			*/

			function NoDbSchemaFactory(){
				var noConfig,
					promises =[],
					schemaSourceProviders = {
						"inline": function(key, schemaConfig){
							return $timeout(function(){
								return schemaConfig.schemaSource.schema;
							});
						},
						"noDBSchema": function(key) {
							return getRemoteSchema(noConfig)
								.then(function(resp){
									return resp.data;
								})
								.catch(function(err){
									deferred.reject(err);
								});
						}
					};

				function getRemoteSchema(config){
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
						.then(function(resp){
							return resp;
						})
						.catch(function(resp){
							noLogService.error(resp);
						});
				}

				function checkCache(schemaKey){
					return  noLocalStorage.getItem(schemaKey);
				}

				function getSchema(schemaKey, schemaConfig){
					var deferred = $q.defer(),
						schemaProvider = schemaConfig.schemaSource.provider;

					if($rootScope[schemaKey])
					{
						deferred.resolve(schemaKey);
					}else{
						$rootScope.$watch(schemaKey, function(newval, oldval){
							if(newval){
								noLocalStorage.setItem(schemaKey, newval.tables);
								deferred.resolve(schemaKey);
							}
						});

						schemaSourceProviders[schemaProvider](schemaKey, schemaConfig)
							.then(function (schema){
								$rootScope[schemaKey] = new NoDbSchema(noConfig, schemaConfig, schema);
							})
							.catch(function(){
								var schema = checkCache(schemaKey);
								if(schema){
									$rootScope[schemaKey] = new NoDbSchema(noConfig, schemaConfig, schema);
								}else{
									deferred.reject();
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
				this.whenReady = function(config){
					noConfig = config;

					var noDbSchemaConfig = noConfig.noDbSchema,
						promises = [];

					for(var c in noDbSchemaConfig){
						var schemaConfig = noDbSchemaConfig[c],
							schemaKey = "noDbSchema_" + schemaConfig.dbName;

						promises.push(getSchema(schemaKey, schemaConfig));
					}

					return $q.all(promises)
						.then(function(results){
							$rootScope.noDbSchema_names = results;
							return results;
						})
						.catch(function (err) {
							console.error(err);
						});

				};

				this.configureDatabases = function(noUser, noDbSchemaConfigs){
					var promises = [];

					for(var s in noDbSchemaConfigs){
						var schemaConfig = noDbSchemaConfigs[s],
							schema = $rootScope["noDbSchema_" + schemaConfig.dbName],
							provider = $injector.get(schemaConfig.provider);

						promises.push(provider.configure(noUser, schemaConfig, schema));

					}

					return $q.all(promises);

				};

				this.getSchema = function(dbName){
					var schema = $rootScope["noDbSchema_" + dbName];
					return schema;
				};
			}

			return new NoDbSchemaFactory();
		}])
	;

})(angular);
