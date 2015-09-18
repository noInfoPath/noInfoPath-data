//websql.js
(function(angular, undefined){
	"use strict";


	function NoWebSQLParser(){
		var CREATETABLE = "CREATE TABLE IF NOT EXISTS ",
			CREATEVIEW = "CREATE VIEW IF NOT EXISTS ",
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
		_interface = {
				sqlConversion : {
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
				toSqlLiteConversionFunctions : {
					"TEXT" : function(s){return angular.isString(s) ? "'"+s+"'" : null;},
					"BLOB" : function(b){return b;},
					"INTEGER" : function(i){return angular.isNumber(i) ? i : null;},
					"NUMERIC" : function(n){return angular.isNumber(n) ? n : null;},
					"REAL" : function(r){return r;}
				},
				fromSqlLiteConversionFunctions : {
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
				},
				"createTable" : function(tableName, tableConfig){
					var rs = CREATETABLE;

					rs += tableName + " (" + this.columnConstraints(tableConfig) + ")";

					return rs;
				},
				"createView" : function(viewName, viewConfig){
					var rs = viewConfig.entitySQL.replace("CREATE VIEW ", CREATEVIEW);

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
					return this.sqlConversion[columnConfig.type];
				},
				"expr": function(Expr){return "";},
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
					var temp = false;

					for (var x in tableConfig.primaryKey){
						if(columnName === tableConfig.primaryKey[x])
						{
							temp = true;
							break;
						}
					}
					return temp;
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

					nvps = this.sqlUpdateNameValuePair(val);

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
					var returnObject = {},
						where = filters && filters.length ? " WHERE " + filters.toSQL() : "";
					returnObject.queryString = DELETE + tableName + where;
					return returnObject;
				},
				"sqlRead": function(tableName, filters, sort){
					var fs, ss, ps, returnObject = {};
					fs = !!filters ? " WHERE " + filters.toSQL() : "";
					ss = !!sort ? " " + sort.toSQL() : "";
					returnObject.queryString = READ + tableName + fs + ss;
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
			};

		this._interface = _interface;

		this.createSqlTableStmt = function(tableName, tableConfig){
			return _interface.createTable(tableName, tableConfig);
		};

		this.createSqlViewStmt = function(tableName, viewSql){
			return _interface.createView(tableName, viewSql);
		};

		this.createSqlInsertStmt = function(tableName, data){
			return _interface.sqlInsert(tableName, data);
		};

		this.createSqlUpdateStmt = function(tableName, data, filters){
			return _interface.sqlUpdate(tableName, data, filters);
		};

		this.createSqlDeleteStmt = function(tableName, data, filters){
			return _interface.sqlDelete(tableName, filters);
		};

		this.createSqlReadStmt = function(tableName, filters, sort){
			return _interface.sqlRead(tableName, filters, sort);
		};

		this.createSqlOneStmt = function(tableName, primKey, value){
			return _interface.sqlOne(tableName, primKey, value);
		};

		this.createSqlClearStmt = function(tableName){
			return _interface.sqlDelete(tableName);
		};

	}

	function NoWebSQLService($parse, $rootScope, _, $q, $timeout, noLogService, noLocalStorage, noWebSQLParser){
		var stmts = {
			"T": noWebSQLParser.createSqlTableStmt,
			"V": noWebSQLParser.createSqlViewStmt
		}, _name;

		Object.defineProperties(this, {
			"isInitialized": {
				"get" : function(){
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		//TODO: modify config to also contain Views, as well as, Tables.
		this.configure = function(noUser, config, schema){
			var _webSQL = null,
				promises = [],
				noWebSQLInitialized = "noWebSQL_" + config.dbName,
				noConstructors = {
					"T": NoTable,
					"V": NoView
				};

			_webSQL = openDatabase(config.dbName, config.version, config.description, config.size);

			_webSQL.currentUser = noUser;
			_webSQL.name = config.dbName;

			angular.forEach(schema.tables, function(table, name){
				var t = new noConstructors[table.entityType](table, name, _webSQL);
				this[name] = t;
				promises.push(createEntity(table, _webSQL));
			}, _webSQL);

			return $q.all(promises)
				.then(function(){
					$rootScope[noWebSQLInitialized] = _webSQL;
					noLogService.log(noWebSQLInitialized + " Ready.");
				});
		};

		this.whenReady = function(config){
			var deferred = $q.defer();

			$timeout(function(){
				var noWebSQLInitialized = "noWebSQL_" + config.dbName;

				if($rootScope[noWebSQLInitialized])
				{
					deferred.resolve();
				}else{
					$rootScope.$watch(noWebSQLInitialized, function(newval, oldval, scope){
						if(newval){
							deferred.resolve();
						}
					});
				}
			});

			return deferred.promise;
		};

		this.getDatabase = function(databaseName){
			return $rootScope["noWebSQL_" + databaseName];
		};

		/**
		* ### createTable(tableName, table)
		*
		* #### Parameters
		*
		* |Name|Type|Description|
		* |----|----|-----------|
		* |type|String|One of T\|V|
		* |tableName|String|The table's name|
		* |table|Object|The table schema|
		*/
		function createEntity(entity, database){

			var deferred = $q.defer();


			database.transaction(function(tx){
				tx.executeSql(stmts[entity.entityType](entity.entityName, entity), [],
			 	function(t, r){
					deferred.resolve();
			 	},
				function(t, e){
			 		deferred.reject(e);
			 	});
			});

			return deferred.promise;
		}

		/**
		 * ## NoTable
		 * CRUD interface for WebSql
		*/
		function NoTable(table, tableName, database){
			if(!table) throw "table is a required parameter";
			if(!tableName) throw "tableName is a required parameter";
			if(!database) throw "database is a required parameter";

			var _table = table,
				_tableName = table.entityName,
				_db = database
			;

			Object.defineProperties(this, {
				"__type": {
					"get": function() { return "INoCRUD"; }
				},
				"primaryKey": {
					"get": function(){ return _table.primaryKey; }
				}
			});

			/**
			* ### \_getOne(rowid)
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |rowid|Number or Object| When a number assume that you are filtering on "rowId". When an Object the object will have a key, and value property.|
			*/
			function _getOne(rowid){
				var deferred = $q.defer(),
					filters = new noInfoPath.data.NoFilters(),
					sqlExpressionData;

				if(angular.isObject(rowid)){
					filters.add(rowid.key, null, true, true, [{
						"operator" : "eq",
						"value": rowid.value,
						"logic": null
					}]);
				}else{
					filters.add("rowid", null, true, true, [{
						"operator" : "eq",
						"value": rowid,
						"logic": null
					}]);
				}

				sqlExpressionData = noWebSQLParser.createSqlReadStmt(_tableName, filters);

				_exec(sqlExpressionData)
					.then(function(resultset){
						if(resultset.rows.length === 0){
							deferred.resolve({});
						}else{
							deferred.resolve(resultset.rows[0]);
						}
					})
					.catch(deferred.reject);

				return deferred.promise;
			}

			/**
			* ### \_exec(sqlExpressionData)
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |sqlExpressionData|Object|An object with two properties, queryString and valueArray. queryString is the SQL statement that will be executed, and the valueArray is the array of values for the replacement variables within the queryString.|
			*/

			function _exec(sqlExpressionData){
				var deferred = $q.defer(), valueArray;

				if(sqlExpressionData.valueArray){
					valueArray = sqlExpressionData.valueArray;
				} else {
					valueArray = [];
				}

				_db.transaction(function(tx){
					tx.executeSql(
						sqlExpressionData.queryString,
						valueArray,
						function(t, resultset){
							deferred.resolve(resultset);
						},
						deferred.reject
					);
				});

				return deferred.promise;
			}

			/**
			* ### webSqlOperation(operation, noTransaction, data)
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |operation|String|Either one of (C\|U\|D\|BD\|BC)|
			* |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization. This parameter is required, but can be `null`.|
			* |data|Object|Name Value Pairs|
			*/

			function webSqlOperation(operation, data, noTransaction){
				// noTransaction is not required, but is needed to track transactions
				var sqlExpressionData, id,
					deferred = $q.defer(),
					createObject = noWebSQLParser.createSqlInsertStmt(_tableName, data),
					sqlStmtFns = {
						"C": noWebSQLParser.createSqlInsertStmt,
						"U": noWebSQLParser.createSqlUpdateStmt,
						"D": noWebSQLParser.createSqlDeleteStmt,
						"BD": noWebSQLParser.createSqlClearStmt,
						"BC": noWebSQLParser.createSqlInsertStmt
					},
					filterOps = {
						"C": function(data){
							var noFilters = new noInfoPath.data.NoFilters(), id;

							if(data[_table.primaryKey]){
								id = data[_table.primaryKey];
							}else{
								id = noInfoPath.createUUID();
								data[_table.primaryKey] = id;
							}

							noFilters.add(_table.primaryKey, null, true, true, [{operator: "eq", value: id}]);

							return noFilters;
						},
						"U": function(data){
							var noFilters = new noInfoPath.data.NoFilters(), id;
							id = data[_table.primaryKey];
							noFilters.add(_table.primaryKey, null, true, true, [{operator: "eq", value: id}]);

							return noFilters;
						},
						"D": function(data){
							var noFilters = new noInfoPath.data.NoFilters(), id;
							id = data[_table.primaryKey];
							noFilters.add(_table.primaryKey, null, true, true, [{operator: "eq", value: id}]);

							return noFilters;
						},
						"BD":function(){},
						"BC": function(){}
					},
					sqlOps = {
						"C": function(data, noFilters, noTransaction){
							var sqlStmt = sqlStmtFns.C(_tableName, data, noFilters);
							_exec(sqlStmt)
								.then(function(result){
									_getOne(result.insertId)
										.then(function(result){
											if(noTransaction) noTransaction.addChange(_tableName, result, operation);
											deferred.resolve(result);
										})
										.catch(deferred.reject);
								})
								.catch(deferred.reject);
						},
						"U": function(data, noFilters, noTransaction){
							sqlOps.C(data, noFilters);
						},
						"D": function(data, noFilters, noTransaction){
							var sqlStmt = sqlStmtFns.D(_tableName, data, noFilters);
							 _getOne({"key": _table.primaryKey, "value": data[_table.primaryKey]}, tx)
								.then(function(result){
									_exec(sqlStmt)
										.then(function(result){
											if(noTransaction) noTransaction.addChange(_tableName, this, "D");
											deferred.resolve(result);
										}.bind(result))
										.catch(deferred.reject);
								})
								.catch(deferred.reject);
						},
						"BD":function(){
							var sqlStmt = sqlStmtFns.D(_tableName);
							_exec(sqlStmt)
								.then(deferred.resolve)
								.catch(deferred.reject);

						},
						"BC": function(data){
							var sqlStmt = sqlStmtFns.C(_tableName, data, null);
							_exec(sqlStmt, data)
								.then(deferred.resolve)
								.catch(deferred.reject);
						}
					},
					filters = filterOps[operation](data);

				sqlOps[operation](data, filters, noTransaction);


				return deferred.promise;
			}

			/**
			* ### noCreate(data, noTransaction)
			*
			* Inserts a record into the websql database with the data provided.
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |data|Object|Name Value Pairs|
			* |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|
			*/

			this.noCreate = function(data, noTransaction){
				return webSqlOperation("C",  data, noTransaction);
			};

			/**
			* ### noRead([NoFilters, NoSort, NoPage])
			*
			* Reads records from the websql database.
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |NoFilters|Object|(Optional) A noInfoPath NoFilters Array|
			* |NoSort|Object|(Optional) A noInfoPath NoSort Object|
			* |NoPage|Object|(Optional) A noInfoPath NoPage Object|
			*/

			this.noRead = function() {

				var filters, sort, page,
					deferred = $q.defer(),
					readObject;

				for(var ai in arguments){
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg)){
						switch(arg.__type){
							case "NoFilters":
								filters = arg;
								break;
							case "NoSort":
								sort = arg;
								break;
							case "NoPage":
								page = arg;
								break;
						}
					}
				}

				readObject = noWebSQLParser.createSqlReadStmt(_tableName, filters, sort);

				function _txCallback(tx){
					tx.executeSql(
						readObject.queryString,
						[],
						function(t, r){
							var data = new noInfoPath.data.NoResults(_.toArray(r.rows));
							if(page) data.page(page);
							deferred.resolve(data);
						},
						function(t, e){
							deferred.reject(e);
						});
				}

				function _txFailure(error){
					console.error("Tx Failure", error);
				}

				function _txSuccess(data){
					console.log("Tx Success", data);
				}

				_db.transaction(_txCallback, _txFailure, _txSuccess);

				return deferred.promise;
			};

			/**
			* ### noUpdate(data, noTransaction)
			*
			* Updates a record from the websql database based on the Primary Key of the data provided.
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |data|Object|Name Value Pairs|
			* |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|
			*/

			this.noUpdate = function(data, noTransaction) {
				// removed the filters parameter as we will most likely be updating one record at a time. Expand this by potentially renaming this to noUpdateOne and the replacement noUpdate be able to handle filters?
				return webSqlOperation("U", data, noTransaction);
			};

			/**
			* ### noDestroy(data, noTransaction)
			*
			* Deletes a record from the websql database based on the Primary Key of the data provided.
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |data|Object|Name Value Pairs|
			* |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|
			*/

			this.noDestroy = function(data, noTransaction) {
				return webSqlOperation("D", data, noTransaction);
			};

			/**
			* ### noOne(data)
			*
			* Reads a record from the websql database based on the Primary Key of the data provided.
			*
			* #### Parameters
			*
			* |Name|Type|Description|
			* |----|----|-----------|
			* |data|Object|Name Value Pairs|
			*/
			this.noOne = function(data) {
				var deferred = $q.defer(),
					key = data[_table.primaryKey],
					oneObject = noWebSQLParser.createSqlOneStmt(_tableName, _table.primaryKey, key);

				function _txCallback(tx){

					tx.executeSql(oneObject.queryString,
						oneObject.valueArray,
						function(t, r){
							deferred.resolve(r);
						},
						function(t, e){
							deferred.reject(e);
						});

				}

				function _txFailure(error){
					console.error("Tx Failure", error);
				}

				function _txSuccess(data){
					console.log("Tx Success", data);
				}

				_db.transaction(_txCallback, _txFailure, _txSuccess);

				return deferred.promise;
			};

			this.bulkLoad = function(data, progress){
				var deferred = $q.defer(), table = this;
				//var table = this;
				function _import(data, progress){
					var total = data ? data.length : 0;

					$timeout(function(){
						//progress.rows.start({max: total});
						deferred.notify(progress);
					});

					var currentItem = 0;

					//_dexie.transaction('rw', table, function (){
					_next();
					//});

					function _next(){
						if(currentItem < data.length){
							var datum = data[currentItem];

							table.noBulkCreate(datum)
								.then(function(data){
									//progress.updateRow(progress.rows);
									deferred.notify(data);
								})
								.catch(function(err){
									deferred.reject(err);
								})
								.finally(function(){
									currentItem++;
									_next();
								});

						}else{
							deferred.resolve(table.name);
						}
					}

				}

				//console.info("bulkLoad: ", table.TableName)

				table.noClear()
					.then(function(){
						_import(data, progress);
					}.bind(this));

				return deferred.promise;
			};

			/**
			* ### noClear()
			*
			* Delete all rows from the current table.
			*
			* #### Returns
			* AngularJS Promise.
			*/
			this.noClear = function(){
				return webSqlOperation("BD", null);
			};

			this.noBulkCreate = function(data){
					return webSqlOperation("BC", data);
			};
		}

		/**
		 * ## NoView
		 * An in memory representation of complex SQL operation that involes
		 * multiple tables and joins, as well as grouping and aggregation
		 * functions.
		 *
		 * ##### NoView JSON Prototype
		 *
		 * ```json
		 *	{
		 *		"sql": String,
		 *		"primaryKey": String,
		 *		"params": []
		 *	}
		 * ```
		 *
		 * ##### References
		 * - https://www.sqlite.org/lang_createview.html
		 *
		*/
		function NoView(view, viewName, database) {
			if(!view) throw "view is a required parameter";
			if(!viewName) throw "viewName is a required parameter";
			if(!database) throw "database is a required parameter";

			var _view = view,
				_viewName = viewName,
				_db = database
			;

			Object.defineProperties(this, {
				"__type": {
					"get": function() { return "INoCRUD"; }
				},
				"primaryKey": {
					"get": function(){ return _view.primaryKey; }
				}
			});

			this.noCreate = angular.noop;

			this.noRead = function() {

				var filters, sort, page,
					deferred = $q.defer(),
					readObject;

				for(var ai in arguments){
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg)){
						switch(arg.__type){
							case "NoFilters":
								filters = arg;
								break;
							case "NoSort":
								sort = arg;
								break;
							case "NoPage":
								page = arg;
								break;
						}
					}
				}

				readObject = noWebSQLParser.createSqlReadStmt(_viewName, filters, sort);

				function _txCallback(tx){
					tx.executeSql(
						readObject.queryString,
						[],
						function(t, r){
							var data = new noInfoPath.data.NoResults(_.toArray(r.rows));
							if(page) data.page(page);
							deferred.resolve(data);
						},
						function(t, e){
							deferred.reject(e);
						});
				}

				function _txFailure(error){
					console.error("Tx Failure", error);
				}

				function _txSuccess(data){
					console.log("Tx Success", data);
				}

				_db.transaction(_txCallback, _txFailure, _txSuccess);

				return deferred.promise;
			};

			this.noUpdate = angular.noop;

			this.noDestroy = angular.noop;

			this.bulkLoad = angular.noop;

			this.noClear = angular.noop;
		}
	}

	angular.module("noinfopath.data")
		.factory("noWebSQL",["$parse","$rootScope","lodash", "$q", "$timeout", "noLogService", "noLocalStorage", "noWebSQLParser", function($parse, $rootScope, _, $q, $timeout, noLogService, noLocalStorage, noWebSQLParser){
	      	return new NoWebSQLService($parse, $rootScope, _, $q, $timeout, noLogService, noLocalStorage, noWebSQLParser);
		}])
		.service("noWebSQLParser", [function(){
			return new NoWebSQLParser();
		}])
	;
})(angular);
