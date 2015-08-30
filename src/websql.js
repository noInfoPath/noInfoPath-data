//websql.js
(function(angular, undefined){
	"use strict";

	function noDbService($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService){
		var _webSQL = openDatabase(noConfig.current.WebSQL.name, noConfig.current.WebSQL.version, noConfig.current.WebSQL.description, noConfig.current.WebSQL.size);

		_webSQL.whenReady = function(){
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

					this.configure(tables)
						.then(function(resp){
							$rootScope.noWebSQLInitialized = true;
						})
						.catch(function(err){
							deferred.reject(err);
						});
				}
			}.bind(this));

			return deferred.promise;
		}.bind(_webSQL);

		_webSQL.configure = function(tables){
			var promises = [];
		
			angular.forEach(tables, function(table, name){
				var t = new NoTable(table, name, noSQLQueryBuilder, _webSQL);
				this[name] = t;
				promises.push(createTable(name, table));
			}, this);
			
			return $q.all(promises);
		}.bind(_webSQL);

		var createTable = function(tableName, table){

			var deferred = $q.defer();

			this.transaction(function(tx){
				tx.executeSql(noDbSchema.createSqlTableStmt(tableName, table), [],
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

		}.bind(_webSQL);

		function NoTable(table, tableName, queryBuilder, database){
			if(!table) throw "table is a required parameter";
			if(!tableName) throw "tableName is a required parameter";
			if(!queryBuilder) throw "queryBuilder is a required parameter";

			var _table = table,
				_tableName = tableName,
				_qb = queryBuilder
			;

			

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

			// this.noRead = function() {

			// 	var filters, sort, page,
			// 		deferred = $q.defer();

			// 	for(var ai in arguments){
			// 		var arg = arguments[ai];

			// 		//success and error must always be first, then
			// 		if(angular.isObject(arg)){
			// 			switch(arg.constructor.name){
			// 				case "NoFilters":
			// 					filters = arg;
			// 					break;
			// 				case "NoSort":
			// 					sort = arg;
			// 					break;
			// 				case "NoPage":
			// 					page = arg;
			// 					break;
			// 			}
			// 		}
			// 	}

			// 	// var queryBuilderObject = queryBuilder(filters,sort,page);
			// 	// var queryBuilderString = queryBuilderObject.toSQL();

			// 	// var command = "SELECT * " + queryBuilderString;

				

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlReadStmt(_tableName, filters, sort, page), [], 
			// 			function(t, r){
			// 				deferred.resolve(r);
			// 			}, 
			// 			function(t, e){
			// 				deferred.reject(e);
			// 			});
			// 	});

			// 	return deferred.promise;
			// };

			// this.noUpdate = function(data, filters) {
			// 	// UPDATE

			// 	var deferred = $q.defer();

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlUpdateStmt(_tableName, data, filters), [],
			// 	 	function(t, r){
			// 			deferred.resolve(r);
			// 	 	}, 
			// 		function(t, e){
			// 	 		deferred.reject(e);
			// 	 	});  
			// 	});

			// 	return deferred.promise;
			// };

			// this.noDestroy = function(filters) {
			// 	// DELETE FROM TABLE WHERE DATA = FILTER
			// 	var deferred = $q.defer()

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlDeleteStmt(_tableName, filters), [],
			// 	 	function(t, r){
			// 			deferred.resolve(r);
			// 	 	}, 
			// 		function(t, e){
			// 	 		deferred.reject(e);
			// 	 	});  
			// 	});

			// 	return deferred.promise;
			// };

			// this.noOne = function(data) {
			// 	var deferred = $q.defer(),
		 // 		table = this,
			// 	key = data[_table.primaryKey];

			// 	_db.transaction(function(tx){
			// 		tx.executeSql(noDbSchema.createSqlOneStmt(_tableName, _table.primaryKey, key), [], 
			// 			function(t, r){
			// 				deferred.resolve(r);
			// 			}, 
			// 			function(t, e){
			// 				deferred.reject(e);
			// 			});
			// 	});

			//  	return deferred.promise;
			// };

		}
		
		return _webSQL;
	}

	

	angular.module("noinfopath.data")
		.factory("noWebSQL",['$parse','$rootScope','lodash', '$q', '$timeout', 'noConfig', 'noSQLQueryBuilder', 'noDbSchema', 'noLogService', function($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService)
		{
	      	return noDbService($parse, $rootScope, _, $q, $timeout, noConfig, noSQLQueryBuilder, noDbSchema, noLogService);
		}])
		;
})(angular);
