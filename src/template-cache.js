//template-cache.js
/*
*	NoInfoPath abstraction of $templateCache. Added the actual $http calls that are
*	inferred in the documentation or perform by ngInclude.
*/
(function(angular, undefined) {
	angular.module("noinfopath.data")
		.service("noTemplateCache", ["$q", "$templateRequest", "$templateCache", function($q, $templateRequest, $templateCache){
			this.get = function(url){

				return $q(function(resolve, reject){
					var tmp = $templateCache.get(url);

					if(tmp) {
						resolve(tmp);
					}else{
						$templateRequest(url)
							.then($templateCache.get.bind(this, url))
							.then(resolve)
							.catch(reject);
					}
				});
			};
		}]);
})(angular);
