//websql.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.provider("noWebSQL", [function(){
			var _db;
			this.$get = ['$parse','$rootScope','lodash', '$q', '$timeout', 'noConfig', function($parse, $rootScope, _, $q, $timeout, noConfig)
			{

				function NoDb(queryBuilder){
					var THIS = this;

					this.whenReady = function(){
						var deferred = $q.defer(),
							tables = noDbSchema.tables;

						$timeout(function(){
							if($rootScope.noHTTPInitialized)
							{
								noLogService.log("noWebSQL Ready.");
								deferred.resolve();
							}else{
								//noLogService.log("noDbSchema is not ready yet.")
								$rootScope.$watch("noWebSQLInitialized", function(newval){
									if(newval){
										noLogService.log("noWebSQL Ready.");
										deferred.resolve();
									}
								});

								configure(tables)
									.then(function(resp){
										$rootScope.noHTTPInitialized = true;
									})
									.catch(function(err){
										deferred.reject(err);
									});
							}
						});

						return deferred.promise;
					};

					function configure(tables){
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


				function NoTable(tableName, table, queryBuilder){
					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url =  noUrl.makeResourceUrl(noConfig.current.RESTURI, tableName);

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

						var queryBuilderString = queryBuilder(filters,sort,page);
						var command = "SELECT * " + queryBuilderString;

						var deferred = $q.defer();

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
				}

		      
		      	return createDatabase();

			}];
	    }])
  ;
})(angular);
