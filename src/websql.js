//websql.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.provider("noWebSQL", [function(){
			var _db;
			this.$get = ['$parse','$rootScope','lodash', '$q', '$timeout', 'noConfig', 'noQueryBuilder', 'noDbSchema', function($parse, $rootScope, _, $q, $timeout, noConfig, noQueryBuilder, noDbSchema)
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

								configure(tables)
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
										this[name] = new NoTable(name, table, queryBuilder);
									}, THIS);

									deferred.resolve();
								});
							});

						function _createDBSchema(){
							
						}

						return deferred.promise;
					}

				}

				function NoView(){
				
				}


				function NoTable(database, tableName, queryBuilder){
					if(!database) throw "database is a required parameter";
					if(!tableName) throw "tableName is a required parameter";
					if(!queryBuilder) throw "queryBuilder is a required parameter";

					var _db = database,
						_tableName = tableName,
						_qb = queryBuilder
					;

					_db.transaction(function(tx){
						tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' '+ schemaParser(table));
					});

					this.noCreate = function(data){
						var command = "INSERT INTO ";

						command = command + tableName;

						// DATA IS WHAT YOU GET BACK FROM THE KENDO GRID

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

					this.noUpdate = function(data) {
						// UPDATE

						var deferred = $q.defer();

						return deferred.promise;

					};

					this.noDestroy = function(data) {
						// DELETE FROM TABLE WHERE DATA = FILTER
						var deferred = $q.defer()

						return deferred.promise;
					};

					function _createTable(tableName){
						noDbSchema.tables
					}

				}
					
				

					



		      	var db = new NoDb(noQueryBuilder);

		      	return db;
			}];
	    }])
  ;
})(angular);
