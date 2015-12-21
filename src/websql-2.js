//websql.js
/*
*	# @module NoInfoPath WebSql
*
*	> noinfopath.data @version 0.0.1 #websql
*
*	This module provides full CRUD operations, along with the ability to bulk
*	bulkload data into the WebSql database, and to perform a lookup for a single item,
*	and the abilty to perform upserts.
*/
(function(angular, undefined) {
	"use strict";

	var
		/*
		*	## @constant WEBSQL_IDENTIFIERS
		*
		*	Exposes a set of JavaScript idetentified that map to WebSQL DDL and DML expressions.
		*/
		WEBSQL_IDENTIFIERS = {
			CREATETABLE: "CREATE TABLE IF NOT EXISTS ",
			CREATEVIEW: "CREATE VIEW IF NOT EXISTS ",
			INSERT: "INSERT INTO ",
			UPDATE: "UPDATE ",
			DELETE: "DELETE FROM ",
			READ: "SELECT * FROM ",
			COLUMNDEF: "{0}",
			PRIMARYKEY: "PRIMARY KEY ASC",
			FOREIGNKEY: "REFERENCES ",
			NULL: "NULL",
			INTEGER: "INTEGER",
			REAL: "REAL",
			TEXT: "TEXT",
			BLOB: "BLOB",
			DATE: "DATE",
			NUMERIC: "NUMERIC",
			WITHOUTROWID: "WITHOUT ROWID"
		},

		/*
		*	## @constant WEBSQL_STATEMENT_BUILDERS
		*
		*	Exposes a setup of helper function that construct safe, WebSQL DDL and DML expressions.
		*/
		WEBSQL_STATEMENT_BUILDERS = {
			sqlConversion: {
				"bigint": WEBSQL_IDENTIFIERS.INTEGER,
				"bit": WEBSQL_IDENTIFIERS.INTEGER,
				"decimal": WEBSQL_IDENTIFIERS.NUMERIC,
				"int": WEBSQL_IDENTIFIERS.INTEGER,
				"money": WEBSQL_IDENTIFIERS.NUMERIC, // CHECK
				"numeric": WEBSQL_IDENTIFIERS.NUMERIC,
				"smallint": WEBSQL_IDENTIFIERS.INTEGER,
				"smallmoney": WEBSQL_IDENTIFIERS.NUMERIC, // CHECK
				"tinyint": WEBSQL_IDENTIFIERS.INTEGER,
				"float": WEBSQL_IDENTIFIERS.REAL,
				"real": WEBSQL_IDENTIFIERS.REAL,
				"date": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"datetime": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"datetime2": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"datetimeoffset": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"smalldatetime": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"time": WEBSQL_IDENTIFIERS.DATE, // CHECK
				"char": WEBSQL_IDENTIFIERS.TEXT,
				"nchar": WEBSQL_IDENTIFIERS.TEXT,
				"varchar": WEBSQL_IDENTIFIERS.TEXT,
				"nvarchar": WEBSQL_IDENTIFIERS.TEXT,
				"text": WEBSQL_IDENTIFIERS.TEXT,
				"ntext": WEBSQL_IDENTIFIERS.TEXT,
				"binary": WEBSQL_IDENTIFIERS.BLOB, // CHECK
				"varbinary": WEBSQL_IDENTIFIERS.BLOB,
				"image": WEBSQL_IDENTIFIERS.BLOB,
				"uniqueidentifier": WEBSQL_IDENTIFIERS.TEXT
			},
			toSqlLiteConversionFunctions: {
				"TEXT": function(s) {
					return angular.isString(s) ? s : null;
				},
				"BLOB": function(b) {
					return b;
				},
				"INTEGER": function(i) {
					if (typeof i === "boolean") // typeof null is object, thanks javascript!
						return i ? 1 : 0; // converts true to 1 and false to 0
					else
						return angular.isNumber(i) ? i : null;
				},
				"NUMERIC": function(n) {
					var c = n === null ? null : Number(n);
					return c;
				},
				"REAL": function(r) {
					return r;
				},
				"DATE": function(d) {
					var r = null;
					if (angular.isString(d)) {
						r = noInfoPath.toDbDate(new Date(d));
					}

					return r;
				}
			},
			fromSqlLiteConversionFunctions: {
				"bigint": function(i) {
					return angular.isNumber(i) ? i : null;
				},
				"bit": function(i) {
					return angular.isNumber(i) ? i : null;
				},
				"decimal": function(n) {
					return angular.isNumber(n) ? n : null;
				},
				"int": function(i) {
					return angular.isNumber(i) ? i : null;
				},
				"money": function(n) {
					return angular.isNumber(n) ? n : null;
				},
				"numeric": function(n) {
					return angular.isNumber(n) ? n : null;
				},
				"smallint": function(i) {
					return angular.isNumber(i) ? i : null;
				},
				"smallmoney": function(n) {
					return angular.isNumber(n) ? n : null;
				},
				"tinyint": function(i) {
					return angular.isNumber(i) ? i : null;
				},
				"float": function(r) {
					return r;
				},
				"real": function(r) {
					return r;
				},
				"date": function(n) {
					return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
				},
				"datetime": function(n) {
					return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
				},
				"datetime2": function(n) {
					return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
				},
				"datetimeoffset": function(n) {
					return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
				},
				"smalldatetime": function(n) {
					return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
				},
				"time": function(n) {
					return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
				},
				"char": function(t) {
					return angular.isString(t) ? t : null;
				},
				"nchar": function(t) {
					return angular.isString(t) ? t : null;
				},
				"varchar": function(t) {
					return angular.isString(t) ? t : null;
				},
				"nvarchar": function(t) {
					return angular.isString(t) ? t : null;
				},
				"text": function(t) {
					return angular.isString(t) ? t : null;
				},
				"ntext": function(t) {
					return angular.isString(t) ? t : null;
				},
				"binary": function(b) {
					return b;
				},
				"varbinary": function(b) {
					return b;
				},
				"image": function(b) {
					return b;
				},
				"uniqueidentifier": function(t) {
					return angular.isString(t) ? t : null;
				}
			},
			"createTable": function(tableName, tableConfig) {
				var rs = WEBSQL_IDENTIFIERS.CREATETABLE;

				rs += tableName + " (" + WEBSQL_STATEMENT_BUILDERS.columnConstraints(tableConfig) + ")";

				return rs;
			},
			"createView": function(viewName, viewConfig) {
				var rs = viewConfig.entitySQL.replace("CREATE VIEW ", WEBSQL_IDENTIFIERS.CREATEVIEW);

				return rs;
			},
			"columnDef": function(columnName, columnConfig, tableConfig) {
				return columnName + " " + WEBSQL_STATEMENT_BUILDERS.typeName(columnConfig) + WEBSQL_STATEMENT_BUILDERS.columnConstraint(columnName, columnConfig, tableConfig);
			},
			"columnConstraint": function(columnName, columnConfig, tableConfig) {
				var isPrimaryKey = WEBSQL_STATEMENT_BUILDERS.isPrimaryKey(columnName, tableConfig),
					isForeignKey = WEBSQL_STATEMENT_BUILDERS.isForeignKey(columnName, tableConfig),
					isNullable = WEBSQL_STATEMENT_BUILDERS.isNullable(columnConfig),
					returnString = "";

				returnString += WEBSQL_STATEMENT_BUILDERS.primaryKeyClause(isPrimaryKey && (!isForeignKey && !isNullable)); // A PK cannot be a FK or nullable.
				returnString += WEBSQL_STATEMENT_BUILDERS.foreignKeyClause((isForeignKey && !isPrimaryKey), columnName, tableConfig.foreignKeys); // A FK cannot be a PK
				returnString += WEBSQL_STATEMENT_BUILDERS.nullableClause(isNullable && !isPrimaryKey); // A nullable field cannot be a PK

				return returnString;
			},
			"typeName": function(columnConfig) {
				return WEBSQL_STATEMENT_BUILDERS.sqlConversion[columnConfig.type];
			},
			"expr": function(Expr) {
				console.warn("TODO: Determine why this function exists.");
				return "";
			},
			"foreignKeyClause": function(isForeignKey, columnName, foreignKeys) {
				var rs = "";
				if (isForeignKey) {
					rs = " " + WEBSQL_IDENTIFIERS.FOREIGNKEY + foreignKeys[columnName].table + " (" + foreignKeys[columnName].column + ")";
				}
				return rs;
			},
			"primaryKeyClause": function(isPrimaryKey) {
				var rs = "";
				if (isPrimaryKey) {
					rs = " " + WEBSQL_IDENTIFIERS.PRIMARYKEY;
				}
				return rs;
			},
			"nullableClause": function(isNullable) {
				var rs = "";
				if (isNullable) {
					rs = " " + WEBSQL_IDENTIFIERS.NULL;
				}
				return rs;
			},
			"columnConstraints": function(tableConfig) {
				var colConst = [];
				angular.forEach(tableConfig.columns, function(value, key) {
					colConst.push(WEBSQL_STATEMENT_BUILDERS.columnDef(key, value, tableConfig));
				}, this);
				return colConst.join(",");
			},
			"isPrimaryKey": function(columnName, tableConfig) {
				var temp = false;

				for (var x in tableConfig.primaryKey) {
					if (columnName === tableConfig.primaryKey[x]) {
						temp = true;
						break;
					}
				}
				return temp;
			},
			"isForeignKey": function(columnName, tableConfig) {
				return !!tableConfig.foreignKeys[columnName];
			},
			"isNullable": function(columnConfig) {
				return columnConfig.nullable;
			},
			"sqlInsert": function(tableName, data) {
				var columnString = "",
					placeholdersString = "",
					returnObject = {},
					val = {};

				val = WEBSQL_STATEMENT_BUILDERS.parseData(data);

				columnString = val.columns.join(",");
				placeholdersString = val.placeholders.join(",");

				returnObject.queryString = WEBSQL_IDENTIFIERS.INSERT + tableName + " (" + columnString + ") VALUES (" + placeholdersString + ");";
				returnObject.valueArray = val.values;

				return returnObject;
			},
			"sqlUpdate": function(tableName, data, filters) {
				var val = {},
					nvps = [],
					nvpsString = "",
					returnObject = {},
					safeFilter = filters.toSafeSQL();

				//console.log(safeFilter);

				val = WEBSQL_STATEMENT_BUILDERS.parseData(data);

				nvps = WEBSQL_STATEMENT_BUILDERS.sqlUpdateNameValuePair(val);

				nvpsString = nvps.join(", ");


				returnObject.queryString = WEBSQL_IDENTIFIERS.UPDATE + tableName + " SET " + nvpsString + " WHERE " + safeFilter.queryString;
				returnObject.valueArray = val.values.concat(safeFilter.valueArray);

				return returnObject;
			},
			"sqlUpdateNameValuePair": function(values) {
				var nvps = [];

				angular.forEach(values.columns, function(col, key) {
					nvps.push(col + " = ?");
				});

				return nvps;
			},
			"sqlDelete": function(tableName, filters) {
				var val = {},
					nvps = [],
					nvpsString = "",
					returnObject = {},
					safeFilter = filters ? filters.toSafeSQL() : (new noInfoPath.data.NoFilters()).toSafeSQL(),
					where;

				nvps = WEBSQL_STATEMENT_BUILDERS.sqlUpdateNameValuePair(safeFilter.valueArray);

				nvpsString = nvps.join(", ");

				//console.log(safeFilter, nvps, nvpsString);

				// var returnObject = {},
				// 	safeSql = filters.toSaveSQL(),
				where = safeFilter.queryString ? " WHERE " + safeFilter.queryString : "";

				returnObject.queryString = WEBSQL_IDENTIFIERS.DELETE + tableName + where;
				returnObject.valueArray = safeFilter.valueArray;
				return returnObject;
			},
			"sqlRead": function(tableName, filters, sort, page) {
				var fs, ss, ps, returnObject = {}, safeFilter = filters.toSafeSQL();
				fs = !!filters ? " WHERE " +  safeFilter.queryString : "";
				ss = !!sort ? " " + sort.toSQL() : "";
				ps = !!page ? " " + page.toSQL() : "";
				returnObject.queryString = WEBSQL_IDENTIFIERS.READ + tableName + fs + ss + ps;
				returnObject.valueArray = safeFilter.valueArray;
				return returnObject;
			},
			"sqlOne": function(tableName, primKey, value) {
				var returnObject = {};
				console.warn("TODO: Need to detect if the value is a string or number");

				returnObject.queryString = WEBSQL_IDENTIFIERS.READ + tableName + " WHERE " + primKey + " = '" + value + "'";
				return returnObject;
			},
			"parseData": function(data) {
				var values = [],
					placeholders = [],
					columns = [],
					r = {};
				angular.forEach(data, function(value, key) {
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
	;

	/*
	*	### @class NoWebSqlStatementFactory
	*
	*	This class is an injecton container that uses WEBSQL_IDENTIFIERS, and
	*	WEBSQL_STATEMENT_BUILDERS to construct the various SQL statements
	*	required to create and use a WebSQL database.
	*
	*/
	function NoWebSqlStatementFactory(WEBSQL_IDENTIFIERS, WEBSQL_STATEMENT_BUILDERS) {

		this.createSqlTableStmt = function(tableName, tableConfig) {
			return WEBSQL_STATEMENT_BUILDERS.createTable(tableName, tableConfig);
		};

		this.createSqlViewStmt = function(tableName, viewSql) {
			return WEBSQL_STATEMENT_BUILDERS.createView(tableName, viewSql);
		};

		this.createSqlInsertStmt = function(tableName, data) {
			return WEBSQL_STATEMENT_BUILDERS.sqlInsert(tableName, data);
		};

		this.createSqlUpdateStmt = function(tableName, data, filters) {
			return WEBSQL_STATEMENT_BUILDERS.sqlUpdate(tableName, data, filters);
		};

		this.createSqlDeleteStmt = function(tableName, data, filters) {
			return WEBSQL_STATEMENT_BUILDERS.sqlDelete(tableName, filters);
		};

		this.createSqlReadStmt = function(tableName, filters, sort, page) {
			return WEBSQL_STATEMENT_BUILDERS.sqlRead(tableName, filters, sort, page);
		};

		//console.warn("This method does not ever get used.");
		this.createSqlOneStmt = function(tableName, primKey, value) {
			return WEBSQL_STATEMENT_BUILDERS.sqlOne(tableName, primKey, value);
		};

		this.createSqlClearStmt = function(tableName) {
			return WEBSQL_STATEMENT_BUILDERS.sqlDelete(tableName);
		};

		this.convertToWebSQL = function(sqlColumn, sqlData) {
			var sqliteColumn = WEBSQL_STATEMENT_BUILDERS.sqlConversion[sqlColumn];

			return WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions[sqliteColumn](sqlData);
		};

	}

	/**
	*	### @class NoWebSqlEntity
	*
	*	This class encapulates the CRUD functionality for NoInfoPath's implementation
	*	of WebSQL. It abstracts the fundimental differences between SQL Views and Tables.
	*	Exceptions will be thrown when a method is called that a SQL View connot support.
	*/
	function NoWebSqlEntity(noWebSQLStatementFactory, entityConfig, entityName, database) {
		var _entityConfig, _entityName, _db;

		if (!entityConfig) throw "entityConfig is a required parameter";
		if (!entityName) throw "entityName is a required parameter";
		if (!database) throw "database is a required parameter";

		_entityConfig = entityConfig;
		_entityName = table.entityName;
		_db = database;

		Object.defineProperties(this, {
			"__type": {
				"get": function() {
					return "INoCRUD";
				},
			},
			"primaryKey": {
				"get": function() {
					return _entityConfig.primaryKey;
				}
			},
			"entityName": {
				"get": function() {
					return _entityName;
				}
			}
		});

		/*-
		 * ### @method private \_exec(sqlExpressionData)
		 *
		 * #### Parameters
		 *
		 * |Name|Type|Description|
		 * |----|----|-----------|
		 * |sqlExpressionData|Object|An object with two properties, queryString and valueArray. queryString is the SQL statement that will be executed, and the valueArray is the array of values for the replacement variables within the queryString.|
		 */
		function _exec(sqlExpressionData) {
			var
				deferred = $q.defer(),
				valueArray = sqlExpressionData.valueArray  ? sqlExpressionData.valueArray : [];

			_db.transaction(function(tx) {
				tx.executeSql(
					sqlExpressionData.queryString,
					valueArray,
					function(t, resultset) {
						deferred.resolve(resultset);
					},
					function(t, r, x) {
						deferred.reject({
							tx: t,
							err: r
						});
					}
				);
			});

			return deferred.promise;
		}

		/*-
		 * ### \_getOne(rowid)
		 *
		 * #### Parameters
		 *
		 * |Name|Type|Description|
		 * |----|----|-----------|
		 * |filters|NoFilters||
		 *
		 * #### Remarks
		 *
		 */
		function _getOne(filters) {
			var
				deferred = $q.defer(),
				sqlExpressionData = noWebSQLStatementFactory.createSqlReadStmt(_tableName, filters);

			_exec(sqlExpressionData)
				.then(function(resultset) {
					if (resultset.rows.length === 0) {
						deferred.resolve({});
					} else {
						deferred.resolve(resultset.rows[0]);
					}
				})
				.catch(deferred.reject);

			return deferred.promise;
		}

		function _recordTransaction(deferred, tableName, operation, trans, result1, result2){
			var transData = result2 ? result2 : result1;

			if (trans) trans.addChange(tableName, transData, operation);
			deferred.resolve(transData);
		}

		function _txFailure(recject, err) {
			recject(err);
		}

		function _txSuccess(data) {
			//console.log("Tx Success", data);
		}

		/*
		 * ### @method configure()
		 *
		 * Creates the WebSQL Entity based on the configuration data and the database passed in
		 * during the construction of the NoWebSqlEntity object.
		 *
		 *	This method returns an Angular Promise.
		 */
		this.configure = function () {

			var
				stmts = {
					"T": WEBSQL_STATEMENT_BUILDERS.createSqlTableStmt,
					"V": WEBSQL_STATEMENT_BUILDERS.createSqlViewStmt
				},
				deferred = $q.defer();

			_db.transaction(function(tx) {
				tx.executeSql(stmts[_entityConfig.entityType](_entityConfig.entityName, _entityConfig), [],
					function(t, r) {
						deferred.resolve();
					},
					function(t, e) {
						deferred.reject({
							entity: _entityConfig,
							error: e
						});
					});
			});

			return deferred.promise;
		};

		/*
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
		 *
		 *	#### Remarks
		 */
		this.noCreate = function(data, noTransaction) {
			if(entityConfig.entityType === "V") throw "Create operation not support by SQL Views.";

			/*
			*	When resolving the primary key for the purpose of createing a new record, it is
			*	required that a primary key exist on the given table. Once discovered, if the
			*	value already exists that value will be used as the primary value. If the key
			*	value is undefined that a new UUID is created.
			*
			*	> NOTE: Bug #00001
			*	> There is a bug with current implementation that does not take into account
			*	> the case when the primary key is a compond key. In the current implementation
			*	> this results in the primary key resolving to `Undefined`.
			*/

			console.warm("TODO: See document note `Bug #00001`");

			var pk = angular.isArray(_table.primaryKey) ?
				_table.primaryKey.length > 1 ? undefined : _table.primaryKey[0] : _table.primaryKey,
				sqlStmt;

			if (pk && !data[pk]) {
				data[_table.primaryKey] = noInfoPath.createUUID();
			}else{
				throw "All noWebSQL tables must have a primary key";
			}

			/*
			*
			*	When creating a new record in the WebSQL DB all tables are expected to have
			*	the `tracking columns`: CreatedBy, DateCreated, ModifiedBy, ModifiedDate.
			*	The values for these column are automatically added to the new data being
			*	added to the DB.
			*/
			data.CreatedBy = _db.currentUser.userId;
			data.DateCreated = noInfoPath.toDbDate(new Date());
			data.ModifiedBy = _db.currentUser.userId;
			data.ModifiedDate = noInfoPath.toDbDate(new Date());

			sqlStmt = noWebSQLStatementFactory.createSqlInsertStmt(_tableName, data, noFilters);

			return _exec(sqlStmt)
				.then(function(result) {
					return _getOne(result.insertId)
						.then(_recordTransaction.bind(null, deferred, _tableName, "C", noTransaction))
						.catch(deferred.reject);
				})
				.catch(deferred.reject);

		};

		/*
		 * ### noRead([NoFilters, NoSort, NoPage])
		 *
		 * Reads records from the websql database filtering, sorting and paging
		 * as required by the provied parameters.
		 *
		 * #### Parameters
		 *
		 *	> NOTE: All parameters are optional and may be provided in any order, as long as,
		 *	> they are of one of the known NoInfoPath query classes: NoFilters,
		 *	> NoSort, and NoPage
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

			for (var ai in arguments) {
				var arg = arguments[ai];

				//success and error must always be first, then
				if (angular.isObject(arg)) {
					switch (arg.__type) {
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

			readObject = noWebSQLParser.createSqlReadStmt(_tableName, filters, sort, page);

			function _txCallback(tx) {
				tx.executeSql(
					readObject.queryString, [],
					function(t, r) {
						var data = new noInfoPath.data.NoResults(_.toArray(r.rows));
						if (page) data.page(page);
						deferred.resolve(data);
					},function(err){
						throw err; //Fail the transaction.
					});
			}

			_db.transaction(_txCallback, _txFailure.bind(null, deferred.reject), _txSuccess);

			return deferred.promise;
		};

		/*
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
		 *
		 *	Returns an AngularJS Promise.
		 */
		this.noUpdate = function(data, noTransaction) {
			if(entityConfig.entityType === "V") throw "Update operation not support by SQL Views.";

			/*
			*	When resolving the primary key of the object to update
			*	the id value must exist. If it does not an exception is thrown.
			*/
			var noFilters = new noInfoPath.data.NoFilters(),
				id = data[_table.primaryKey], sqlStmt;

			if(!id) throw "Primary key value must exist an object being updated.";

			noFilters.quickAdd(_table.primaryKey, "eq", id);

			/*
			*	When updating a record in the WebSQL DB all tables are expected to have
			*	the `tracking columns`: ModifiedBy, ModifiedDate.
			*	The values for these column are automatically set on the object
			*	being updated in the DB.
			*/
			data.ModifiedBy = _db.currentUser.userId;
			data.ModifiedDate = noInfoPath.toDbDate(new Date());

			sqlStmt = noWebSqlStatementFactory.createSqlUpdateStmt(_tableName, data, noFilters);

			return _exec(sqlStmt)
				.then(_recordTransaction.bind(null, deferred, _tableName, "U", noTransaction, data))
				.catch(deferred.reject);
		};

		/*
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
		this.noDestroy = function(data, noTransaction, filters) {
			if(entityConfig.entityType === "V") throw "Delete operation not support by SQL Views.";

			var
				noFilters = new noInfoPath.data.NoFilters(filters),
				id = data[_table.primaryKey],
				sqlStmt, deleted;

			if(!id) throw "Could not resolve primary key for delete operation.";

			if(!noFilters.length)
			{
				noFilters.quickAdd(_table.primaryKey, "eq", id);
			}

			sqlStmt = noWebSqlStatementFactory.createSqlDeleteStmt(_tableName, data, noFilters);

			_getOne(noFilters)
				.then(function(datum) {
					_exec(sqlStmt)
						.then(_recordTransaction.bind(null, deferred, _tableName, "D", noTransaction, datum))
						.catch(deferred.reject);
				})
				.catch(deferred.reject);
		};

		/*
		* ### @method noOne(data)
		*
		* Reads exactly one record from the websql database based on the filter derived the data provided.
		*
		* > NOTE: Returns single object, not an array of objects. When more than one result is found it returns
		* > the first item in the array of results.  If none are found, returns an single empty object.
		*
		* #### Parameters
		*
		*	##### @parameter `query`
		*
		*	The `query` parameter can be a Number, String or Object. When it
		*	is as Number the it is a WebSQL `RowId`. When a String the value
		*	is expectd to be the guid that is the primary key for the given
		*	entity.  When an object, and is of the NoFilters class it is treated
		*	as such. When not, then it expected to be a special object.
		*
		*	*Expected Types*
		*	- Number
		*	- String
		*	- Object
		*
		* #### Remarks
		*
		*/
		this.noOne = function(query) {
			/**
			 *	When 'query' is an object then check to see if it is a
			 *	NoFilters object.  If not, add a filter to the intrinsic filters object
			 *	based on the query's key property, and the query's value.
			 */
			var filters = new noInfoPath.data.NoFilters();

			if(angular.isNumber(query)){
				//Assume rowid
				/*
				*	When query a number, a filter is created on the instrinsic
				*	filters object using the `rowid`  WebSQL column as the column
				*	to filter on. Query will be the target
				*	value of query.
				*/
				filters.quickAdd("rowid", "eq", query);

			}else if(angular.isString(query)){
				//Assume guid
				/*
				* When the query is a string it is assumed a table is being queried
				* by it's primary key.
				*
				* > Passing a string when the entity is
				* a SQL View is not allowed.
				*/
				if(entityConfig.entityType === "V") throw "One operation not support by SQL Views when query parameter is a string. Use the simple key/value pair object instead.";

				filters.quickAdd(_entityConfig.primaryKey, "eq", query);

			}else if (angular.isObject(query)) {
				if (query.__type === "NoFilters") {
					filters = query;
				} else {
					//Simple key/value pair
					filters.quickAdd(query.key, "eq", query.value);
				}

			} else {
				throw "One requires a query parameter. May be a Number, String or Object";
			}

			//Internal _getOne requires and NoFilters object.
			return _getOne(filters);
		};

		/*
		*	### @method bulkload(data, progress)
		*
		*	Returns an AngularJS Promise.  Takes advantage of
		*	Promise.notify to report project of the bulkLoad operation.
		*/
		this.bulkLoad = function(data, progress) {
			if(entityConfig.entityType === "V") throw "BulkLoad operation not support by SQL Views.";

			var deferred = $q.defer(),
				table = this;
			//var table = this;
			function _import(data, progress) {
				var total = data ? data.length : 0;

				$timeout(function() {
					//progress.rows.start({max: total});
					deferred.notify(progress);
				});

				var currentItem = 0;

				//_dexie.transaction('rw', table, function (){
				_next();
				//});

				function _next() {
					if (currentItem < data.length) {
						var datum = data[currentItem];

						table.noBulkCreate(datum)
							.then(function(data) {
								//progress.updateRow(progress.rows);
								deferred.notify(data);
							})
							.catch(function() {
								deferred.reject({
									entity: table,
									error: arguments
								});
							})
							.finally(function() {
								currentItem++;
								_next();
							});

					} else {
						deferred.resolve(table.name);
					}
				}

			}

			//console.info("bulkLoad: ", table.TableName)

			table.noClear()
				.then(function() {
					_import(data, progress);
				}.bind(this));

			return deferred.promise;
		};

		/*
		*	### @method noUpsert(data)
		*/
		this.noUpsert = function(data) {
			if(entityConfig.entityType === "V") throw "Upsert operation not support by SQL Views.";

			if (data[this.primaryKey]) {
				return this.noUpdate(data);
			} else {
				return this.noCreate(data);
			}
		};

		/*
		 * ### @method noClear()
		 *
		 * Delete all rows from the current table, without recording each delete transaction.
		 *
		 * #### Returns
		 * AngularJS Promise.
		 */
		this.noClear = function() {
			if(entityConfig.entityType === "V") throw "Clear operation not support by SQL Views.";

			var sqlStmt = noWebSqlStatementFactory.createSqlClearStmt(_tableName);

			return _exec(sqlStmt)
				.then(deferred.resolve)
				.catch(deferred.reject);


		};

		/*
		*	### @method noBulkCreate(data)
		*
		*	Inserts object in to the WebSQL database, converting data from
		*	ANSI SQL to WebSQL.  No transactions are recorded during this operation.
		*/
		this.noBulkCreate = function(data) {
			if(entityConfig.entityType === "V") throw "BulkCreate operation not support by SQL Views.";
			for (var c in _tableConfig.columns) {
				var col = _tableConfig.columns[c];
				data[c] = noWebSqlStatementFactory.convertToWebSQL(col.type, data[c]);
			}

			var sqlStmt = noWebSqlStatementFactory.createSqlInsertStmt(_tableName, data, null);

			_exec(sqlStmt)
				.then(deferred.resolve)
				.catch(deferred.reject);
		};
	}

	/*
	*	## @class NoWebSqlEntityFactory
	*
	*	Creates instances of the NoWebSqlEntity class, providing an Entity
	*	configuration object, name of the entity, and a reference to the database.
	*
	*
	*/
	function NoWebSqlEntityFactory(NoWebSQLStatementFactory){
		/*
		*	### @method create(entityConfig, entityName, database)
		*
		*	Returns a new instance of the NoWebSqlEntity object configured with the
		*	supplied Entity Configuration and Datbase.
		*
		*/
		this.create = function (entityConfig, entityName, database) {
			return new NoWebSqlEntity(noWebSQLStatementFactory, entityConfig, entityName, database);
		};
	}
	/*
	*	## @class NoWebSqlService
	*/
	function NoWebSqlService($rootScope, _, $q, $timeout, noLogService, noLoginService, noLocalStorage, noWebSQLParser) {
		var _name;

		Object.defineProperties(this, {
			"isInitialized": {
				"get": function() {
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		//TODO: modify config to also contain Views, as well as, Tables.
		this.configure = function(noUser, config, schema) {
			var _webSQL = null,
				promises = [],
				noWebSQLInitialized = "noWebSQL_" + schema.config.dbName,
				noConstructors = {
					"T": NoTable,
					"V": NoView
				};

			_webSQL = openDatabase(schema.config.dbName, schema.config.version, schema.config.description, schema.config.size);

			_webSQL.currentUser = noUser;
			_webSQL.name = schema.config.dbName;

			angular.forEach(schema.tables, function(table, name) {

				var
					db = this;
					t = new NoWebSqlEntity(table, name, db);

				db[name] = t;
				promises.push(t.configure());
			}, _webSQL);

			return $q.all(promises)
				.then(function() {
					$rootScope[noWebSQLInitialized] = _webSQL;
				});
		};

		this.whenReady = function(config) {
			return $q(function(resolve, reject){
				var noWebSQLInitialized = "noWebSQL_" + config.dbName;

				if ($rootScope[noWebSQLInitialized]) {
					resolve();
				} else {
					$rootScope.$watch(noWebSQLInitialized, function(newval, oldval, scope) {
						if (newval) {
							resolve();
						}
					});
				}
			});
		};

		this.getDatabase = function(databaseName) {
			return $rootScope["noWebSQL_" + databaseName];
		};

	}

	angular.module("noinfopath.data")
		.constant("WEBSQL_IDENTIFIERS", WEBSQL_IDENTIFIERS)

		.constant("WEBSQL_STATEMENT_BUILDERS", WEBSQL_STATEMENT_BUILDERS)

		.factory("noWebSqlStatementFactory", ["WEBSQL_IDENTIFIERS", "WEBSQL_STATEMENT_BUILDERS", function(WEBSQL_IDENTIFIERS, WEBSQL_STATEMENT_BUILDERS){
			return new NoWebSqlStatementFactory(WEBSQL_IDENTIFIERS, WEBSQL_STATEMENT_BUILDERS);
		}])

		.factory("noWebSqlEntityFactory", ["noWebSqlStatementFactory", function(noWebSqlStatementFactory){
			return new NoWebSqlEntityFactory(noWebSqlStatementFactory);
		}])

		.factory("noWebSQL", ["$rootScope", "lodash", "$q", "$timeout", "noLocalStorage", "noWebSqlStatementFactory", function($rootScope, _, $q, $timeout, noLocalStorage, noWebSqlStatementFactory) {
			return new NoWebSQLService($rootScope, _, $q, $timeout, noLocalStorage, noWebSqlStatementFactory);
		}])
	;
})(angular);
