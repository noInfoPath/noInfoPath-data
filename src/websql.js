//websql.js
(function(angular, undefined){
	"use strict";

	function NoDbService($parse, $rootScope, _, $q, $timeout, noLogService, noDbSchema){
		var stmts = {
			"T": noDbSchema.createSqlTableStmt,
			"V": noDbSchema.createSqlViewStmt
		};

		this.wait = function(noWebSQLInitialized){
			var deferred = $q.defer();

			$timeout(function(){

				if($rootScope[noWebSQLInitialized])
				{
					noLogService.log("noWebSQL Ready.");
					deferred.resolve();
				}else{

					$rootScope.$watch(noWebSQLInitialized, function(newval, oldval, scope){
						if(newval){
							noLogService.log("noWebSQL Ready.");
							deferred.resolve(newval);
						}
						console.info(newval);
					});
				}
			});

			return deferred.promise;
		};

		this.whenReady = function(config){
			var deferred = $q.defer();

			$timeout(function(){
				var noWebSQLInitialized = "noWebSQL_" + config.name;

				if($rootScope[noWebSQLInitialized])
				{
					noLogService.log("noWebSQL Ready.");
					deferred.resolve();
				}else{

					$rootScope.$watch(noWebSQLInitialized, function(newval, oldval, scope){
						if(newval){
							noLogService.log("noWebSQL Ready.");
							deferred.resolve(newval);
						}
					});

					this.configure(config)
						.then(function(db){
							$rootScope[noWebSQLInitialized] = db;
						})
						.catch(function(err){
							deferred.reject(err);
						});
				}
			}.bind(this));

			return deferred.promise;
		};

		//TODO: modify config to also contain Views, as well as, Tables.
		this.configure = function(config){
			var _webSQL = null,
				promises = [];

			_webSQL = openDatabase(config.name, config.version, config.description, config.size);

			angular.forEach(noDbSchema.tables, function(table, name){
				var t = new NoTable(table, name, _webSQL);
				this[name] = t;
				promises.push(createEntity("T", name, table, _webSQL));
			}, _webSQL);

			angular.forEach(noDbSchema.views, function(view, name){
				var t = new NoView(view, name, _webSQL);
				this[name] = t;
				promises.push(createEntity("V", name, view, _webSQL));
			}, _webSQL);

			return $q.all(promises)
				.then(function(){
					return _webSQL;
				});
		};

		//TODO: Add this method to noIndexedDb also.
		this.getDatabase = function(databaseName){
			return $rootScope[databaseName];
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
		function createEntity(type, tableName, table, database){

			var deferred = $q.defer();


			database.transaction(function(tx){
				tx.executeSql(stmts[type](tableName, table), [],
			 	function(t, r){
					deferred.resolve();
			 	},
				function(t, e){
			 		deferred.reject();
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
				_tableName = tableName,
				_db = database
			;

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

				sqlExpressionData = noDbSchema.createSqlReadStmt(_tableName, filters);

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
			* |operation|String|Either a "C" "U" or "D"|
			* |noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization. This parameter is required, but can be `null`.|
			* |data|Object|Name Value Pairs|
			*/

			function webSqlOperation(operation, noTransaction, data){
				// noTransaction is not required, but is needed to track transactions
				var deferred = $q.defer(),
					createObject = noDbSchema.createSqlInsertStmt(_tableName, data),
					ops = {
						"C": noDbSchema.createSqlInsertStmt,
						"U": noDbSchema.createSqlUpdateStmt,
						"D": noDbSchema.createSqlDeleteStmt,
						"B": noDbScema.createSqlClearStmt
					},
					opFns = {
						"C": null,
						"U": null,
						"D": null,
						"B": null
					},
					sqlExpressionData,
					noFilters = new noInfoPath.data.NoFilters(),
					id;

					if(operation === "C"){
						id = data[_table.primaryKey] = noInfoPath.createUUID();
					} else {
						id = data[_table.primaryKey];
					}

					noFilters.add(_table.primaryKey, null, true, true, [{operator: "eq", value: id}]);

					sqlExpressionData = ops[operation](_tableName, data, noFilters);

					_db.transaction(function(tx){
						switch(operation){
							case "C":
							case "U":
								sqlExpressionData = ops[operation](_tableName, data, noFilters);
								_exec(sqlExpressionData)
									.then(function(result){
										_getOne(result.insertId)
											.then(function(result){
												if(noTransaction) noTransaction.addChange(_tableName, result, operation);
												deferred.resolve(result);
											})
											.catch(deferred.reject);
									})
									.catch(deferred.reject);
								break;
							case "D":
								sqlExpressionData = ops[operation](_tableName, data, noFilters);
								_getOne({"key": _table.primaryKey, "value": data[_table.primaryKey]}, tx)
									.then(function(result){
										_exec(sqlExpressionData)
											.then(function(result){
												if(noTransaction) noTransaction.addChange(_tableName, this, "D");
												deferred.resolve(result);
											}.bind(result))
											.catch(deferred.reject);
									})
									.catch(deferred.reject);
								break;
							case "B":
								sqlExpressionData = ops[operation](_tableName);
								_exec(sqlExpressionData)
									.then(deferred.resolve)
									.catch(deferred.reject);
								break;

						}
					});

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
				return webSqlOperation("C", noTransaction ? noTransaction : null, data);
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

				readObject = noDbSchema.createSqlReadStmt(_tableName, filters, sort);

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
				return webSqlOperation("U", noTransaction, data);
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
				return webSqlOperation("D", noTransaction ? noTransaction : null, data);
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
					oneObject = noDbSchema.createSqlOneStmt(_tableName, _table.primaryKey, key);

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

			this.bulkLoad = function(data, progress, db){
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

							table.noCreate(datum)
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
				return webSqlOperation("B", null);
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
		 *		"sql": String
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

				readObject = noDbSchema.createSqlReadStmt(_viewName, filters, sort);

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
		.factory("noWebSQL",['$parse','$rootScope','lodash', '$q', '$timeout', 'noLogService', 'noDbSchema', function($parse, $rootScope, _, $q, $timeout, noLogService, noDbSchema){
	      	return new NoDbService($parse, $rootScope, _, $q, $timeout, noLogService, noDbSchema);
		}])
	;
})(angular);
