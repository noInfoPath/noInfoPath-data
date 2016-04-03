//misc.js
(function(angular, undefined) {
	angular.module("noinfopath.data")
		.service("noFullName", [function() {
			var temp;

			function parse(inval) {
				temp = inval.split(" ");
			}

			this.firstName = function(fullName) {
				parse(fullName);
				if (temp && temp.length > 0) {
					return temp[0];
				} else {
					return "";
				}
			};

			this.lastName = function(fullName) {
				parse(fullName);
				if (temp && temp.length > 1) {
					return temp[1];
				} else {
					return "";
				}
			};
	}]);
})(angular);
