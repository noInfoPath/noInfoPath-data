//configuration.js
(function(angular, undefined){
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.data")
		.config([function(){
			
		}])

		.run(['$rootScope', 'noConfig', function($rootScope, noConfig){
			noConfig.load()
				.then(function(){
					$rootScope.noConfigReady = true;
					//$rootScope.$emit("noConfig::ready")
				})
				.catch(function(err){
					console.error(err);
				})
		}])

		.provider("noConfig", [function(){
			var _currentConfig;
			
			function noConfig($http, $q, $timeout, $rootScope, noLocalStorage){
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
							$rootScope.$watch("noConfigReady", function(newval){
								if(newval){
									console.log("config Ready");
									deferred.resolve();								
								}

							});					
						}					
					});	

					return deferred.promise;			
				};				
			}

			this.$get = ['$http','$q', '$timeout', '$rootScope', 'noLocalStorage', function($http, $q, $timeout, $rootScope, noLocalStorage){
				return new noConfig($http, $q, $timeout, $rootScope, noLocalStorage);
			}];
		}])

	;
})(angular);
