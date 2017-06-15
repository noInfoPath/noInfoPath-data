//template-cache.js
/*
	*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
	*
	*	___
	*
	*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.75*
	*
	*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
	*
	*	Copyright (c) 2017 The NoInfoPath Group, LLC.
	*
	*	Licensed under the MIT License. (MIT)
	*
	*	___
	*
	*	noTemplateCache
	*	---------------
	*
	*	NoInfoPath abstraction of $templateCache. Added the actual $http calls that are
	*	inferred in the documentation or perform by ngInclude.
*/
(function (angular, undefined) {
	angular.module("noinfopath.data")
		.service("noTemplateCache", ["$q", "$templateRequest", "$templateCache", function ($q, $templateRequest, $templateCache) {
			this.get = function (url) {

				return $q(function (resolve, reject) {
					var tmp = $templateCache.get(url);

					if(tmp) {
						resolve(tmp);
					} else {
						$templateRequest(url)
							.then($templateCache.get.bind(this, url))
							.then(resolve)
							.catch(reject);
					}
				});
			};
		}]);
})(angular);
