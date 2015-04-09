//globals.js
(function(angular, undefined){
	var noInfoPath = {
		noFilterExpression: function (type, key, operator, match, logic){
			this.type = type;
			this.key = key;
			this.operator = operator;
			this.match = match;
			this.logic = logic;
		}	
	}

	window.noInfoPath = noInfoPath;

	angular.module("noinfopath-data", [
		'noinfopath-storage',
		'noinfopath-configuration',
		'noinfopath-http',
		'noinfopath-manifest',
		'noinfopath-indexeddb'
	]);
})(angular);
