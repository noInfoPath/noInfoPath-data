/**
 * noinfopath-odata@0.0.5
 */

(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.http',[])
		.provider("noHTTP",[function(){
			var PROV = this;

			function noREST($q, $http){
				var SELF = this;

				this.create = function(resourceURI, formdata){
					var json = angular.toJson(formdata);

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
							deferred.resolve(data.d);
						})
						.error(function(reason){
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
					console.warn("TODO: Implement INOCRUD::update.");
					return deferred.promise;
				}

				this.destroy = function(){
					var deferred = $q.defer();
					console.warn("TODO: Implement INOCRUD::destroy.");
					return deferred.promise;
				}
			}

			this.$get = ['$q', '$http', function($q, $http){
				return new noREST($q, $http);
			}];
		}])
	;
})(angular)