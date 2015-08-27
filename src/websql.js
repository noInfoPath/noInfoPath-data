//websql.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.provider("noWebSQL", [function(){
			var _db;
			this.$get = ['$parse','$rootScope','lodash', '$q', '$timeout', 'noConfig', 'noSQLQueryBuilder', 'noDbSchema', 'noLogService', function($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService)
			{

				var noQueryBuilder = noSQLQueryBuilder;

				function NoTransactions(){
					Object.defineProperties(this, {
						"__type": {
							"get" : function(){
								return "NoTransactions";
							}
						}
					});

					var arr = [];
					noInfoPath.setPrototypeOf(this, arr);

					this.add = function(db, userID){
						this.unshift(new NoTransaction(userID));
					}
				}

				function NoTransaction(db, userID){
					var SELF = this,
						_db = db,
						_tx;

					Object.defineProperties(this, {
						"__type": {
							"get" : function(){
								return "NoTransaction";
							}
						},
						"webSQLTrans": {
							"get": function(){
								return _tx;
							}
						}
					});

					this.transactionID = noInfoPath.createUUID();
					this.timestamp = new Date(); //TODO: NEeds to be UTC date
					this.userID = userID;
					this.changes = new NoChanges();

					this.beginTransaction = function(){

						var deferred = $q.defer();

						_db.transaction(function(tx){
							_tx = tx;

							deferred.resolve(SELF);
						});

						return deferred.promise;
					}

					this.addChange = function(tableName, data, changeType){
						this.changes.add(tableName, data, changeType);
					}

					this.endTransaction = function(){
						// commit angular.toJson(this) to the noinfopath _changes table
					}
				}

				function NoChanges(){
					Object.defineProperties(this, {
						"__type": {
							"get" : function(){
								return "NoChanges";
							}
						}
					});
					var arr = [];
					noInfoPath.setPrototypeOf(this, arr);
					this.add = function(tableName, data, changeType){
						this.unshift(new NoChange(tableName, data, changeType));
					}
				}

				function NoChange(tableName, data, changeType){
					Object.defineProperties(this, {
						"__type": {
							"get" : function(){
								return "NoChange";
							}
						}
					});	

					this.tableName = tableName;
					this.data = data;
					this.changeType = changeType;
				}

				function NoDb(queryBuilder){
					var THIS = this;

					this.whenReady = function(){
						var deferred = $q.defer(),
							tables = noDbSchema.tables;

						$timeout(function(){
							if($rootScope.noWebSQLInitialized)
							{
								noLogService.log("noWebSQL Ready.");
								deferred.resolve();
							}else{
								
								$rootScope.$watch("noWebSQLInitialized", function(newval){
									if(newval){
										noLogService.log("noWebSQL Ready.");
										deferred.resolve();
									}
								});

								THIS.configure(tables)
									.then(function(resp){
										$rootScope.noWebSQLInitialized = true;
									})
									.catch(function(err){
										deferred.reject(err);
									});
							}
						});

						return deferred.promise;
					};

					this.configure = function(tables){
						var deferred = $q.defer();

						noConfig.whenReady()
							.then(function(){
								_db = openDatabase(noConfig.current.WebSQL.name, noConfig.current.WebSQL.version, noConfig.current.WebSQL.description, noConfig.current.WebSQL.size, _createDBSchema);
							})
							.then(function(){
								$timeout(function(){
									angular.forEach(tables, function(table, name){
										this[name] = new NoTable(table, name, queryBuilder);
									}, THIS);

									deferred.resolve();
								});
							});

						function _createDBSchema(){
							
						}

						return deferred.promise;
					};

				}

				function NoTable(table, tableName, queryBuilder){
					if(!table) throw "table is a required parameter";
					if(!tableName) throw "tableName is a required parameter";
					if(!queryBuilder) throw "queryBuilder is a required parameter";

					var _table = table,
						_tableName = tableName,
						_qb = queryBuilder
					;

					this.noCreateTable = function(){

						var deferred = $q.defer();

						_db.transaction(function(tx){
							tx.executeSql(noDbSchema.createSqlTableStmt(_tableName, _table), [],
						 	function(t, r){
								deferred.resolve();
						 	}, 
							function(t, e){
						 		deferred.reject();
						 	});  
						});

						// _executeSQLTrans(noDbSchema.createSqlTableStmt(_tableName, _table), [], 
						// 	function(t, r){
						// 		deferred.resolve();
						// 	},
						// 	function(t, e){
						// 		deferred.reject();
						// 	});


						return deferred.promise;

					};

					this.noCreate = function(data, noTransaction){
						// noTransaction is not required, but is needed to track transactions
						var deferred = $q.defer();

						noTransaction.webSQLTrans.executeSql(
							noDbSchema.createSqlInsertStmt(_tableName, data), 
							[],
						 	function(t, r){
						 		var result = r.rows[0];

						 		noTransaction.addChange(_tableName, result, "C");

								deferred.resolve(result);
						 	}, 
							function(t, e){
						 		deferred.reject(e);
						 	}
						);

						return deferred.promise;
					};

					this.noRead = function() {

						var filters, sort, page,
							deferred = $q.defer();

						for(var ai in arguments){
							var arg = arguments[ai];

							//success and error must always be first, then
							if(angular.isObject(arg)){
								switch(arg.constructor.name){
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

						// var queryBuilderObject = queryBuilder(filters,sort,page);
						// var queryBuilderString = queryBuilderObject.toSQL();

						// var command = "SELECT * " + queryBuilderString;

						

						_db.transaction(function(tx){
							tx.executeSql(noDbSchema.createSqlReadStmt(_tableName, filters, sort, page), [], 
								function(t, r){
									deferred.resolve(r);
								}, 
								function(t, e){
									deferred.reject(e);
								});
						});

						return deferred.promise;
					};

					this.noUpdate = function(data, filters) {
						// UPDATE

						var deferred = $q.defer();

						_db.transaction(function(tx){
							tx.executeSql(noDbSchema.createSqlUpdateStmt(_tableName, data, filters), [],
						 	function(t, r){
								deferred.resolve(r);
						 	}, 
							function(t, e){
						 		deferred.reject(e);
						 	});  
						});

						return deferred.promise;
					};

					this.noDestroy = function(filters) {
						// DELETE FROM TABLE WHERE DATA = FILTER
						var deferred = $q.defer()

						_db.transaction(function(tx){
							tx.executeSql(noDbSchema.createSqlDeleteStmt(_tableName, filters), [],
						 	function(t, r){
								deferred.resolve(r);
						 	}, 
							function(t, e){
						 		deferred.reject(e);
						 	});  
						});

						return deferred.promise;
					};

					this.noOne = function(data) {
						var deferred = $q.defer(),
				 		table = this,
						key = data[_table.primaryKey];

						_db.transaction(function(tx){
							tx.executeSql(noDbSchema.createSqlOneStmt(_tableName, _table.primaryKey, key), [], 
								function(t, r){
									deferred.resolve(r);
								}, 
								function(t, e){
									deferred.reject(e);
								});
						});

					 	return deferred.promise;
					};

					this.noCreateTable();

				}

		      	var db = new NoDb(noQueryBuilder);

		      	return db;
			}];
	    }])
  ;
})(angular);
