var GloboTest = {};

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
				CREATETABLE = "CREATE TABLE IF NOT EXISTS ",
				INSERT = "INSERT INTO ",
				UPDATE = "UPDATE ",
				DELETE = "DELETE FROM ",
				COLUMNDEF = "{0}",
				PRIMARYKEY = "PRIMARY KEY ASC",
				FOREIGNKEY = "REFERENCES ",
				NULL = "NULL",
				INTEGER = "INTEGER",
				REAL = "REAL",
				TEXT = "TEXT",
				BLOB = "BLOB",
				NUMERIC = "NUMERIC",
				WITHOUTROWID = "WITHOUT ROWID",
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
					"date" : NUMERIC, // CHECK
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
				},
				toSqlLiteConversionFunctions = {
					"TEXT" : function(s){return angular.isString(s) ? "'"+s+"'" : null;},
					"BLOB" : function(b){return b;},
					"INTEGER" : function(i){return angular.isNumber(i) ? i : null;},
					"NUMERIC" : function(n){return angular.isNumber(n) ? n : null;},
					"REAL" : function(r){return r;}
				},
				fromSqlLiteConversionFunctions = {
					"bigint" : function(i){return angular.isNumber(i) ? i : null;},
					"bit" : function(i){return angular.isNumber(i) ? i : null;},
					"decimal" : function(n){return angular.isNumber(n) ? n : null;},
					"int" : function(i){return angular.isNumber(i) ? i : null;},
					"money" : function(n){return angular.isNumber(n) ? n : null;}, 
					"numeric" : function(n){return angular.isNumber(n) ? n : null;},
					"smallint" : function(i){return angular.isNumber(i) ? i : null;},
					"smallmoney" : function(n){return angular.isNumber(n) ? n : null;}, 
					"tinyint" : function(i){return angular.isNumber(i) ? i : null;},
					"float" : function(r){return r;},
					"real" : function(r){return r;},
					"date" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"datetime" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"datetime2" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();},
					"datetimeoffset" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"smalldatetime" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();},
					"time" : function(n){return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();}, 
					"char" : function(t){return angular.isString(t) ? t : null;},
					"nchar" : function(t){return angular.isString(t) ? t : null;},
					"varchar" : function(t){return angular.isString(t) ? t : null;},
					"nvarchar" : function(t){return angular.isString(t) ? t : null;},
					"text" : function(t){return angular.isString(t) ? t : null;},
					"ntext" : function(t){return angular.isString(t) ? t : null;},
					"binary" : function(b){return b;}, 
					"varbinary" : function(b){return b;},
					"image" : function(b){return b;},
					"uniqueidentifier" : function(t){return angular.isString(t) ? t : null;}
				}
			;

			GloboTest.fromSqlLiteConversionFunctions = fromSqlLiteConversionFunctions;
			GloboTest.toSqlLiteConversionFunctions = toSqlLiteConversionFunctions;
			GloboTest.sqlConversion = sqlConversion;

			function NoDbSchema(){
				var _interface = {
					"createTable" : function(tableName, tableConfig){
						var rs = CREATETABLE;

						rs += tableName + " (" + this.columnConstraints(tableConfig) + ")";

						return rs;
					},
					"columnDef" : function(columnName, columnConfig, tableConfig){
						return columnName + " " + this.typeName(columnConfig) + this.columnConstraint(columnName, columnConfig, tableConfig);
					},
					"columnConstraint": function(columnName, columnConfig, tableConfig){
						var isPrimaryKey = this.isPrimaryKey(columnName, tableConfig),
							isForeignKey = this.isForeignKey(columnName, tableConfig),
							isNullable = this.isNullable(columnConfig),
							returnString = ""
						;

						returnString += this.primaryKeyClause(isPrimaryKey && (!isForeignKey && !isNullable)); // A PK cannot be a FK or nullable.
						returnString += this.foreignKeyClause((isForeignKey && !isPrimaryKey), columnName, tableConfig.foreignKeys); // A FK cannot be a PK
						returnString += this.nullableClause(isNullable && !isPrimaryKey); // A nullable field cannot be a PK

						return returnString;
					},
					"typeName": function(columnConfig){
						return sqlConversion[columnConfig.type];
					},
					"expr": function(Expr){return ""},
					"foreignKeyClause": function(isForeignKey, columnName, foreignKeys){
						var rs = "";
						if(isForeignKey){
							rs = " " + FOREIGNKEY + foreignKeys[columnName].table + " (" + foreignKeys[columnName].column + ")";
						}
						return rs;
					},
					"primaryKeyClause": function(isPrimaryKey){
						var rs = "";
						if(isPrimaryKey){
							rs = " " + PRIMARYKEY;
						}
						return rs;
					},
					"nullableClause": function(isNullable){
						var rs = "";
						if(isNullable){
							rs = " " + NULL;
						}
						return rs;
					},
					"columnConstraints": function(tableConfig){
						var colConst = [];
						angular.forEach(tableConfig.columns, function(value, key){
							colConst.push(this.columnDef(key, value, tableConfig));
						}, this);
						return colConst.join(",");
					},
					"isPrimaryKey": function(columnName, tableConfig){
						return (columnName === tableConfig.primaryKey);
					},
					"isForeignKey": function(columnName, tableConfig){
						return !!tableConfig.foreignKeys[columnName];
					},
					"isNullable": function(columnConfig){
						return columnConfig.nullable;
					},
					"sqlInsert": function(tableName, data){
						var columns = [],
							values = [],
							columnString = "",
							valuesString = ""
						;

						angular.forEach(data, function(value, key){
							columns.push(key);

							if(angular.isString(value))
							{
								values.push("'" + value + "'");
							} else {
								values.push(value);
							}
						});

						columnString = columns.join(",");
						valuesString = values.join(",");

						return INSERT + tableName + " (" + columnString + ") VALUES (" + valuesString + ");";
					},
					"sqlUpdate": function(tableName, data, filters){
						var nvp = [],
							nvpString,
							noFilters = new noInfoPath.data.NoFilters()
						;

						angular.forEach(filters, function(value, key){
							noFilters.add(value.name, value.logic, value.beginning, value.end, value.filters);
						});

						angular.forEach(data, function(value, key){

							nvp.push(this.sqlUpdateNameValuePair(value, key));

						});

						nvpString = nvp.join(",");

						return UPDATE + tableName + " SET " + nvpString + " WHERE " + noFilters.toSQL();
						
					},
					"sqlUpdateNameValuePair": function(value, key){
						var rs = "";

						if(angular.isString(value))
						{
							rs = key + " = '"  + value + "'";
						} 
						else 
						{
							rs = key + " = " + value;
						}

						return rs
					},
					"sqlDelete": function(tableName, filters){
						var noFilters = new noInfoPath.data.NoFilters();

						angular.forEach(filters, function(value, key){
							noFilters.add(value.name, value.logic, value.beginning, value.end, value.filters);
						});

						return DELETE + tableName + " WHERE " + noFilters.toSQL();
					}
				}

				this.createSqlTable = function(tableName, tableConfig){
					return _interface.createTable(tableName, tableConfig);
				}

				this.createSqlInsert = function(tableName, tableConfig){
					return _interface.SqlInsert(tableName, tableConfig);
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

				this.test = _interface;

			}

			return _interface;
		}])

	;

})(angular, Dexie);
