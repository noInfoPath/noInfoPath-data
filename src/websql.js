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
								noLogService.log("noHTTP Ready.");
								deferred.resolve();
							}else{
								//noLogService.log("noDbSchema is not ready yet.")
								$rootScope.$watch("noHTTPInitialized", function(newval){
									if(newval){
										noLogService.log("noHTTP ready.");
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

						$timeout(function(){
							angular.forEach(tables, function(table, name){
								this[name] = new NoTable(name, table, queryBuilder);
							}, THIS);

							deferred.resolve();
						});

						return deferred.promise;
					}

				}

				this.NoDb = function()
				{

					noConfig.whenReady()
						.then(function(){
							_db = openDatabase('s', '1.0', 'noinfopath', 1024 * 1024 * 500);
						});
					
					return deferred.promise;
				}

				function NoTable(tableName, table, queryBuilder){
					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url =  noUrl.makeResourceUrl(noConfig.current.RESTURI, tableName);

					this.noCreate = function(data){
						var command = "INSERT INTO ";

						command = command + tableName;

						// DATA IS WHAT YOU GET BACK FROM THE KENDO GRID


						// var deferred = $q.defer(),
						// 	req = {
						// 		method: "POST",
						// 		url: url,
						// 		data: json,
						// 		headers: {
						// 			"Content-Type": "application/json",
						// 			"Accept": "application/json"
						// 		},
						// 		withCredentials: true
						// 	};

						// $http(req)
						// 	.success(function(data){
						// 		//console.log(angular.toJson(data) );

						// 		deferred.resolve(data);
						// 	})
						// 	.error(function(reason){
						// 		console.error(reason);
						// 		deferred.reject(reason);
						// 	});

						// return deferred.promise;
					};

					this.noRead = function() {
						//noLogService.debug("noRead say's, 'swag!'");
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

						var deferred = $q.defer(),

						// var deferred = $q.defer(),
						// 	req = {
						// 		method: "GET",
						// 		params: queryBuilder(filters,sort,page),
						// 		url: url,
						// 		headers: {
						// 			"Content-Type": "application/json",
						// 			"Accept": "application/json"
						// 		},
						// 		withCredentials: true
						// 	};

						// $http(req)
						// 	.success(function(data){
						// 		//console.log( angular.toJson(data));
						// 		deferred.resolve(data.value);
						// 	})
						// 	.error(function(reason){
						// 		noLogService.error(arguments);
						// 		deferred.reject(reason);
						// 	});

						// return deferred.promise;
					};

					this.noUpdate = function(data) {
						// UPDATE

						// var json = angular.toJson(data);

						// var deferred = $q.defer(),
						// 	req = {
						// 		method: "PUT",
						// 		url: url + "(guid'" + data[table.primaryKey] + "')",
						// 		data: json,
						// 		headers: {
						// 			"Content-Type": "application/json",
						// 			"Accept": "application/json"
						// 		},
						// 		withCredentials: true
						// 	};

						// $http(req)
						// 	.success(function(data, status){
						// 		deferred.resolve(status);
						// 	})
						// 	.error(function(reason){
						// 		console.error(reason);
						// 		deferred.reject(reason);
						// 	});

						// return deferred.promise;

					};

					this.noDestroy = function(data) {
						// DELETE FROM TABLE WHERE DATA = FILTER
						// var deferred = $q.defer(),
						// 	req = {
						// 		method: "DELETE",
						// 		url: url + "(guid'" + data[table.primaryKey] + "')",
						// 		headers: {
						// 			"Content-Type": "application/json",
						// 			"Accept": "application/json"
						// 		},
						// 		withCredentials: true
						// 	};

						// $http(req)
						// 	.success(function(data, status){
						// 		deferred.resolve(status);
						// 	})
						// 	.error(function(reason){
						// 		console.error(reason);
						// 		deferred.reject(reason);
						// 	});

						// return deferred.promise;
					};
				}

		      
		      	return createDatabase();

			}];
	    }])
  ;
})(angular);
