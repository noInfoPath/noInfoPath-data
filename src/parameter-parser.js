//parameter-parser.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.service("noParameterParser", [function () {
			this.parse = function (data) {
				var keys = Object.keys(data).filter(function (v, k) {
						if(v.indexOf("$") === -1 && v.indexOf(".") === -1) return v;
					}),
					values = {};
				keys.forEach(function (k) {
					var haveSomething = !!data[k],
						haveModelValue = haveSomething && data[k].hasOwnProperty("$modelValue");

					if(haveModelValue) {
						values[k] = data[k].$modelValue;
					} else if(haveSomething) {
						values[k] = data[k];
					} else {
						values[k] = null;
					}

				});

				return values;
			};
			this.update = function (src, dest) {
				var THIS = this,
					keys = Object.keys(src).filter(function (v, k) {
					if(v.indexOf("$") === -1) return v;
				});
				keys.forEach(function (k) {
					var d = dest[k];
					if(d && d.hasOwnProperty("$viewValue")) {
						THIS.updateOne(d, src[k]);
					} else {
						dest[k] = src[k];
					}
				});

				if(dest.$setPristine) {
					dest.$setPristine();
					dest.$setUntouched();
					dest.$commitViewValue();
				}
			};

			this.updateOne = function(ctrl, value) {
				if(ctrl) {
					ctrl.$setViewValue(value);
					ctrl.$setPristine();
					ctrl.$setUntouched();
					ctrl.$render();
				}
			}
		}]);
})(angular);
