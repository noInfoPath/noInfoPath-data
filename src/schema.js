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

		.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "noConfig", "$filter", function($q, $timeout, $http, $rootScope, _, noLogService, noConfig, $filter){
			var _config = {},
				_tables = {},
				_views = {},
				_sql = {};

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

			function NoDbSchema(){

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noDbSchemaInitialized)
						{
							noLogService.log("noDbSchema Ready.");
							deferred.resolve();
						}else{
							//noLogService.log("noDbSchema is not ready yet.")
							$rootScope.$watch("noDbSchemaInitialized", function(newval){
								if(newval){
									noLogService.log("noDbSchema ready.");
									deferred.resolve();
								}
							});

							load()
								.then(function(resp){
									$rootScope.noDbSchemaInitialized = true;
								})
								.catch(function(err){
									deferred.reject(err);
								});
						}
					});

					return deferred.promise;
				};

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

				function _processDbJson(resp){
					var deferred = $q.defer();

					_tables = resp.data;

					$timeout(function(){
						//save reference to the source data from the rest api.

						angular.forEach(_tables, function(table, tableName){
							var primKey = "$$" + table.primaryKey,
								foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");

							//Prep as a Dexie Store config
							_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
						});

						deferred.resolve();
					});

					//noLogService.log(angular.toJson(_config));
					return deferred.promise;
				}

				function load(){
					var req = {
						method: "GET",
						url: noConfig.current.NODBSCHEMAURI, //TODO: change this to use the real noinfopath-rest endpoint
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						withCredentials: true
					};

					return $http(req)
						.then(_processDbJson)
						.catch(function(resp){
							noLogService.error(resp);
						});
				}
			}

			return new NoDbSchema();
		}])
	;

})(angular, Dexie);
