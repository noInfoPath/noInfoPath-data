//configuration.js
(function(angular, undefined){
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.data")
		.config([function(){
		}])

		.provider("noConfig", [function(){
			var _currentConfig, _status;
			
			function noConfig($http, $q, $timeout, $rootScope, noLocalStorage){
				var SELF = this;

				Object.defineProperties(this, {
					"current": {
						"get": function() { return _currentConfig; }
					},
					"status": {
						"get": function() { return _status; }
					}
				});

				this.load = function (){
					return $http.get("/config.json")
						.then(function(resp){ 
							noLocalStorage.setItem("noConfig", resp.data);
						})
						.catch(function(err){
							throw err;
						});
				};

				this.fromCache = function(){
					_currentConfig = noLocalStorage.getItem("noConfig");
				}

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noConfigReady)
						{
							deferred.resolve();
						}else{	
							$rootScope.$watch("noConfigReady", function(newval){
								if(newval){
									deferred.resolve();								
								}
							});	

							SELF.load()
								.then(function(){
									_currentConfig = noLocalStorage.getItem("noConfig");
									$rootScope.noConfigReady = true;
								})
								.catch(function(err){
									SELF.fromCache();

									if(_currentConfig){
										$rootScope.noConfigReady = true;
									}else{
										deferred.reject("noConfig is offline, and no cached version was available.");
									}
								})			
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