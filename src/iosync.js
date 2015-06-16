//manifest.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.config([function(){
		}])

		.run([function(){

		}])

		.provider("noSyncable",[function(){
			
			function noSyncable(){

			}

			this.$get = [function(){
				return new noSyncable();
			}]
		}])
	;
})(angular);