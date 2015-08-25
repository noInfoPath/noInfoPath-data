//websql.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.provider("noWebSQL", [function(){
			var _db;
			this.$get = ['$parse','$rootScope','lodash', '$q', '$timeout', 'noConfig', 'noSQLQueryBuilder', 'noDbSchema', 'noLogService', function($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService)
			{
				var CREATE = "",
					CREATETABLE = "",
					SELECT = "",
					UPDATE = "",
					DELETE = "",
					JOIN = "",
					WHERE = "",
					ORDERBY = ""
				;

				var noQueryBuilder = noSQLQueryBuilder;

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

				function NoView(){
				
				}


				function NoTable(table, tableName, queryBuilder){
					if(!table) throw "table is a required parameter";
					if(!tableName) throw "tableName is a required parameter";
					if(!queryBuilder) throw "queryBuilder is a required parameter";

					var _table = table,
						_tableName = tableName,
						_qb = queryBuilder
					;

					// Russ and I were discussing if the following commented out function was worth doing to avoid Dry because we're basically wrapping a wrapper.

					// function _executeSQLTrans(sqlStatement, params, callback, errorCallback){
					// 	_db.transaction(function(tx){
					// 		tx.executeSql(sqlStatement, params, callback, errorCallback); 
					// 	});
					// }

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

					}

					this.noCreate = function(data){

						_db.transaction(function(tx){
							tx.executeSql(noDbSchema.createSqlInsertStmt(_tableName, data), [],
						 	function(t, r){
								deferred.resolve(r);
						 	}, 
							function(t, e){
						 		deferred.reject(e);
						 	});  
						});

						var deferred = $q.defer();

						return deferred.promise;
					};

					this.noRead = function() {

						var filters, sort, page;

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

						var queryBuilderObject = queryBuilder(filters,sort,page);
						var queryBuilderString = queryBuilderObject.toSQL();
						var command = "SELECT * " + queryBuilderString;

						var deferred = $q.defer();

						_db.transaction(function(tx){
							tx.executeSql(command, [], success(), failure());
						});

						function success(){
							deferred.resolve();
						}

						function failure(){
							deferred.reject();
						}

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

					this.noCreateTable();

				}

		      	var db = new NoDb(noQueryBuilder);

		      	return db;
			}];
	    }])
  ;
})(angular);
