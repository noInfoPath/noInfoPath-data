(function (angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")

		/*
		 * ## noDbSchema
		 *The noDbSchema service provides access to the database configuration that defines how to configure the local IndexedDB data store.
		*/
		.service("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", function($q, $timeout, $http, $rootScope, _){
			var _config = {}, _tables = {}, SELF = this;

			/*
				### Properties

				|Name|Type|Description|
				|----|----|-----------|
				|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
				|tables|Object|A hash table of NoInfoPath database schema definitions|
				|isReady|Boolean|Returns true if the size of the tables object is greater than zero|
			*/
			Object.defineProperties(this, {
				"store": {
					"get": function() { return _config; }
				},
				"tables": {
					"get": function() { return _tables; }
				},
				"isReady": {
					"get": function() { return _.size(_tables) > 0; }
				}
			});

			/**
				### Methods

				#### _processDbJson
				Converts the schema received from the noinfopath-rest service and converts it to a Dexie compatible object.

				##### Parameters
				|Name|Type|Descriptions|
				|resp|Object|The raw HTTP response received from the noinfopath-rest service|
			*/
			function _processDbJson(resp){
				//save reference to the source data from the rest api.
				_tables = resp.data;

				angular.forEach(_tables, function(table, tableName){
					var primKey = "$$" + table.primaryKey,
						foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");

					//Prep as a Dexie Store config
					_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
				});

				//console.log(angular.toJson(_config));
				return;
			}

			/**
				### load()
				Loads and processes the database schema from the noinfopath-rest service.

				#### Returns
				AngularJS::Promise
			*/
			function load(){
				var req = {
					method: "GET",
					url: "/db.json", //TODO: change this to use the real noinfopath-rest endpoint
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					withCredentials: true
				};

				return $http(req)
					.then(_processDbJson)
					.catch(function(resp){
						console.error(resp);
					});
			}

			/*
				### whenReady
				whenReady is used to check if this service has completed its load phase. If it has not is calls the internal load method.

				#### Returns
				AngularJS::Promise
			*/
			this.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noDbSchemaInitialized)
					{
						console.log("noDbSchema Ready.");
						deferred.resolve();
					}else{
						//console.log("noDbSchema is not ready yet.")
						$rootScope.$watch("noDbSchemaInitialized", function(newval){
							if(newval){
								console.log("noDbSchema ready.");
								deferred.resolve();
							}
						});

						load()
							.then(function(resp){
								$rootScope.noDbSchemaInitialized = true;
							})
							.catch(function(err){
								deferred.reject(err);
							});
					}
				});

				return deferred.promise;
			};
		}])

	;

})(angular, Dexie);
