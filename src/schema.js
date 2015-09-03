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
				READ = "SELECT * FROM ",
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
						var columnString = "",
							placeholdersString = "",
							returnObject = {},
							val = {}
						;

						val = this.parseData(data);

						columnString = val.columns.join(",");
						placeholdersString = val.placeholders.join(",");

						returnObject.queryString = INSERT + tableName + " (" + columnString + ") VALUES (" + placeholdersString + ");";
						returnObject.valueArray = val.values;

						return returnObject;
					},
					"sqlUpdate": function(tableName, data, filters){
						var val = {},
							nvps = [],
							nvpsString = "",
							returnObject = {};

						val = this.parseData(data);

						nvps = this.sqlUpdateNameValuePairs(val);

						nvpsString = nvps.join(", ");

						returnObject.queryString = UPDATE + tableName + " SET " + nvpsString + " WHERE " + filters.toSQL();
						returnObject.valueArray = val.values;

						return returnObject;
						
					},
					"sqlUpdateNameValuePair": function(values){
						var nvps = [];

						angular.forEach(values.columns, function(col, key){
							nvps.push(col + " = ?");
						});

						return nvps;
					},
					"sqlDelete": function(tableName, filters){
						var returnObject = {};
						returnObject.queryString = DELETE + tableName + " WHERE " + filters.toSQL();
						return returnObject;
					},
					"sqlRead": function(tableName, filters, sort, page){
						var fs, ss, ps, returnObject = {};
						fs = !!filters ? " WHERE " + filters.toSQL() : "";
						ss = !!sort ? " " + sort.toSQL() : "";
						ps = !!page ? " " + page.toSQL() : "";
						returnObject.queryString = READ + tableName + fs + ss + ps;
						return returnObject;
					},
					"sqlOne": function(tableName, primKey, value){
						var returnObject = {};
						returnObject.queryString = READ + tableName + " WHERE " + primKey + " = '" + value + "'";
						return returnObject;
					},
					"parseData": function(data){
						var values = [], placeholders = [], columns = [], r = {};
						angular.forEach(data, function(value, key){
							columns.push(key);
							placeholders.push("?");
							values.push(value);
						});

						r.values = values;
						r.placeholders = placeholders;
						r.columns = columns;

						return r;
					}
				}

				this.createSqlTableStmt = function(tableName, tableConfig){
					return _interface.createTable(tableName, tableConfig);
				}

				this.createSqlInsertStmt = function(tableName, data, filters){
					return _interface.sqlInsert(tableName, data);
				}

				this.createSqlUpdateStmt = function(tableName, data, filters){
					return _interface.sqlUpdate(tableName, data, filters);
				}

				this.createSqlDeleteStmt = function(tableName, data, filters){
					return _interface.sqlDelete(tableName, filters);
				}

				this.createSqlReadStmt = function(tableName, filters, sort, page){
					return _interface.sqlRead(tableName, filters, sort, page);
				}

				this.createSqlOneStmt = function(tableName, primKey, value){
					return _interface.sqlOne(tableName, primKey, value);
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
