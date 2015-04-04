//noinfopath-configuration@0.0.4*
(function(angular, undefined){
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.configuration", [])
		.config([function(){
			
		}])

		.run(['$rootScope', 'noConfig', function($rootScope, noConfig){

			noConfig.load()
				.then(function(){
					$rootScope.noConfigReady = true;
					$rootScope.$emit("noConfig::ready")
				})
				.catch(function(err){
					console.error(err);
				})
		}])

		.service("noConfig", ['$http','$q', '$timeout', '$rootScope', 'noLocalStorage', function($http, $q, $timeout, $rootScope, noLocalStorage){
			var _currentConfig;
			Object.defineProperties(this, {
				"current": {
					"get": function() {return _currentConfig;}
				}
			});

			this.load = function (){
				return $http.get("/config.json")
					.then(function(resp){ 
						_currentConfig = resp.data;
						noLocalStorage.setItem("noConfig", _currentConfig);
					})
					.catch(function(){
						_currentConfig = noLocalStorage.get("noConfig");
					});
			};

			this.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noConfigReady)
					{
						console.log("config Ready");
						deferred.resolve();
					}else{	
						$rootScope.$on("noConfig::ready", function(){
							console.log("config Ready");
							deferred.resolve();
						});					
					}					
				});	

				return deferred.promise;			
			};
		}])

	;
})(angular)