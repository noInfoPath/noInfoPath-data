//http.js
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.data')
		/*
		* ## @service noHTTP
		*
		* ### Overview
		* Provides a RESTful compatible HTTP service.
		*
		* ### Methods
		*
		* #### create(uri, data)
		*
		* ##### Parameters
		*
		* |Name|Type|Description|
		* |----|----|-----------|
		* |uri|string|unique identifier of the table to operate against|
		* |data|object|the data to use to create the new obejct in the db|
		*
		* #### read(resourceURI, query)
		*
		* #### update(resourceURI, formdata)
		* TODO: Implementation required.
		*
		* #### destroy(resourceURI, formdata)
		* TODO: Implementation required.
		*/
		.provider("noHTTP",[function(){
			this.$get = ['$q', '$http', '$filter', 'noUrl', 'noConfig', 'noDbSchema', 'noOdataQueryBuilder', function($q, $http, $filter, noUrl, noConfig, noDbSchema, noOdataQueryBuilder){
				/**
				* ### @class NoDb
				*
				* #### Overview
				*
				* Creates and manages a set of NoTable objects.
				*
				* #### @constructor NoDb(tables, queryBuilder)
				*
				* ##### Parameters
				*
				* |Name|Type|Description|
				* |----|----|-----------|
				* |tables|object|A hash object that contains a collection of table configuration as provided by noDbScema|
				* |queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|
				*
				*/
				function NoDb(tables, queryBuilder){

					angular.forEach(tables, function(table, name){
						this[name] = new NoTable(name, table, queryBuilder);
					}, this);
				}


				/**
				* ### @class NoTable
				*
				* #### Overview
				*
				* Provides an interface that loosely matches that of the NoTable
				* class provided by noDexie.  This to ease the integration with
				* NoInfoPath component that consume data such as noKendo.
				*
				* #### @constructor NoTable(tableName, queryBuilder)
				*
				* ##### Parameters
				*
				* |Name|Type|Description|
				* |----|----|-----------|
				* |tableName|string|name of the table that this instance will interact with.|
				* |queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|
				*/
				function NoTable(tableName, table, queryBuilder){
					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url =  noUrl.makeResourceUrl(noConfig.current.RESTURI, tableName);

					this.noCreate = function(data){
						var json = angular.toJson(data);

						var deferred = $q.defer(),
							req = {
								method: "POST",
								url: url,
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function(data){
								//console.log(angular.toJson(data) );

								deferred.resolve(data);
							})
							.error(function(reason){
								console.error(reason);
								deferred.reject(reason);
							});

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

						var deferred = $q.defer(),
							req = {
								method: "GET",
								params: queryBuilder(filters,sort,page),
								url: url,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function(data){
								//console.log( angular.toJson(data));
								deferred.resolve(data.value);
							})
							.error(function(reason){
								deferred.reject(reason);
							});

						return deferred.promise;
					};

					this.noUpdate = function(data) {
						var json = angular.toJson(data);

						var deferred = $q.defer(),
							req = {
								method: "PUT",
								url: url + "(guid'" + data[table.primaryKey] + "')",
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function(data, status){
								deferred.resolve(status);
							})
							.error(function(reason){
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;

					};

					this.noDestroy = function(data) {
						var deferred = $q.defer(),
							req = {
								method: "DELETE",
								url: url + "(guid'" + data[table.primaryKey] + "')",
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						$http(req)
							.success(function(data, status){
								deferred.resolve(status);
							})
							.error(function(reason){
								console.error(reason);
								deferred.reject(reason);
							});

						return deferred.promise;
					};
				}

				//return new noREST($q, $http, $filter, noUrl, noConfig)
				return new NoDb(noDbSchema.tables, noOdataQueryBuilder.makeQuery);
			}];
		}])
	;
})(angular);
