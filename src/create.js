//create.js
(function(angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.service("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", function($q, $timeout, $http, $rootScope, _){
			var _config = {}, SELF = this;

			Object.defineProperties(this, {
				"config": {
					"get": function() { return _config; }
				}
			});

			function _processDbJson(resp){
				//console.log(resp)
				var tables = resp.data;

				angular.forEach(tables, function(table, tableName){
					
					var primKey = "$$" + table.primaryKey,
						foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");
		
					_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
				})

				console.log(angular.toJson(_config));
				return;
			}


			this.load = function (){
				var req = {
					method: "GET",
					url: "/db.json",
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
			};

			this.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noDbSchemaInitialized)
					{
						console.log("noDbSchema Ready.");
						deferred.resolve();
					}else{	
						console.log("noDbSchema is not ready yet.")
						$rootScope.$watch("noDbSchemaInitialized", function(newval){
							if(newval){
								console.log("noDbSchema ready.");
								deferred.resolve();									
							}
						});	

						SELF.load()
							.then(function(resp){
								$rootScope.noDbSchemaInitialized = true;
								//for testing
								// $timeout(function(){
								// 	$rootScope.$digest();
								// });
								//deferred.resolve();
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