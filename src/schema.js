(function (angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")

		/*
		 * ## noDbSchema
		 *The noDbSchema service provides access to the database configuration that defines how to configure the local IndexedDB data store.
		*/
		.factory("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", "noLogService", "noConfig", "$filter", function($q, $timeout, $http, $rootScope, _, noLogService, noConfig, $filter){
			var _interface = new NoDbSchema(),  
				_config = {}, 
				_tables = {}, 
				_sql = {}, 
				CREATETABLE = "CREATE TABLE IF NOT EXISTS {0} ({1}) ",
				COLUMNDEF = "{0}"
				PRIMARYKEY = "PRIMARY KEY ",
				NULL = "NULL",
				INTEGER = "INTEGER",
				REAL = "REAL",
				TEXT = "TEXT",
				BLOB = "BLOB",
				NUMERIC = "NUMERIC",
				sqlConversion = {
					"bigint" : INTEGER,
					"bit" : INTEGER,
					"decimal" : NUMERIC,
					"int" : INTEGER,
					"money" : NUMERIC, // CHECK
					"numeric" : NUMERIC,
					"smallint" : INTEGER,
					"smallmoney" : NUMERIC, // CHECK
					"tinyint" : INTEGER,
					"float" : REAL,
					"real" : REAL,
					"date" : NUMERIC // CHECK
					"datetime" : NUMERIC, // CHECK
					"datetime2" : NUMERIC, // CHECK
					"datetimeoffset" : NUMERIC, // CHECK
					"smalldatetime" : NUMERIC, // CHECK
					"time" : NUMERIC, // CHECK
					"char" : TEXT,
					"nchar" : TEXT,
					"varchar" : TEXT,
					"nvarchar" : TEXT,
					"text" : TEXT,
					"ntext" : TEXT,
					"binary" : BLOB, // CHECK
					"varbinary" : BLOB,
					"image" : BLOB,
					"uniqueidentifier" : TEXT
				}
			;

			function NoDbSchema(){
				var _interface = {
					"createTable" : function(tableConfig){return ""},
					"columnDef" : function(columnName, columnConfig, tableConfig){

						var isPrimaryKey = columnConfig === tableConfig.primaryKey;


						return ""
					},
					"columnConstraint": function(columnConstraint){return ""},
					"typeName": function(columnType){return ""},
					"expr": function(Expr){return ""},
					"forignKeyClause": function(foreignKeys){return ""}
				}

				/*
					### Properties

					|Name|Type|Description|
					|----|----|-----------|
					|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
					|tables|Object|A hash table of NoInfoPath database schema definitions|
					|isReady|Boolean|Returns true if the size of the tables object is greater than zero|
				*/
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
					}
				});

				/**
					### Methods

					#### _processDbJson
					Converts the schema received from the noinfopath-rest service and converts it to a Dexie compatible object.

					##### Parameters
					|Name|Type|Descriptions|
					|resp|Object|The raw HTTP response received from the noinfopath-rest service|
				*/
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

				/**
					### load()
					Loads and processes the database schema from the noinfopath-rest service.

					#### Returns
					AngularJS::Promise
				*/
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

				/*
					### whenReady
					whenReady is used to check if this service has completed its load phase. If it has not is calls the internal load method.

					#### Returns
					AngularJS::Promise
				*/

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

			}

			return _interface;
		}])

	;

})(angular, Dexie);
