//http.js
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.data')
		.provider("noHTTP",[function(){
			
			this.configure = function(){
				angular.noop();
			}

			this.createTransport = function(){
				return new noREST();
			}

			function noREST($q, $http){
				var SELF = this;

				this.create = function(resourceURI, formdata){
					var json = angular.toJson(formdata);
					console.log(resourceURI);

					var deferred = $q.defer(),
						req = {
							method: "POST",
							url: resourceURI,
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
				}

				this.read = function(resourceURI, query){
					//console.log(!!query);

					var deferred = $q.defer(),
						url = resourceURI + (!!query ? query : ""),
						req = {
							method: "GET",
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
				}

				this.update = function(){
					var deferred = $q.defer();
					$timeout(function(){
						console.warn("TODO: Implement INOCRUD::update.");
						deferred.resolve();
					})
					return deferred.promise;
				}

				this.destroy = function(){
					var deferred = $q.defer();
					$timeout(function(){
						console.warn("TODO: Implement INOCRUD::destroy.");
						deferred.resolve();
					})					
					return deferred.promise;
				}
			}

			this.$get = ['$q', '$http', function($q, $http){
				return new noREST($q, $http)
			}]
		}])
	;
})(angular);