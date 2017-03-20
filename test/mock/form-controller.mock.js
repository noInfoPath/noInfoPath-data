
function MockControlController(v) {
	this.$setViewValue = function (v) {
		this.$viewValue = v;
	};
	this.$setPristine = function () {
		this.$pristine = true;
	};
	this.$setUntouched = function () {
		this.$touched = false;
		this.$untouched = true;
	};
	this.$commitViewValue = function() {
		this.$modelValue = this.$viewValue;
		this.$touched = false;
		this.$untouched = true;
		this.$pristine = true;
	};
	this.$rollbackViewValue = function() {
		this.$viewValue = this.$modelValue;
		this.$touched = false;
		this.$untouched = true;
		this.$pristine = true;
	};
	this.$render = function () {};
	this.$modelValue = v;
	this.$viewValue = v;
	this.$pristine = true;
	this.$isDirty = false;
	this.$invalue = false;
	this.$touched = false;
	this.$untouched = true;

}

function MockFormController(data) {
	var _keys = [];

	this.$setPristine = function () {};
	this.$setUntouched = function () {};
	this.$commitViewValue = function () {
		_keys.forEach(function(k){
			var m = this[k];
			try {
				m.$commitViewValue();
			} catch(err) {
				console.log("ERROR", k, m);
			}
		}, this);
	};
	
	this.$rollbackViewValue = function() {
		_keys.forEach(function(k){
			var m = this[k];
			try {
				m.$rollbackViewValue();
			} catch(err) {
				console.log("ERROR", k, m);
			}
		}, this);
	};

	this.$pristine = true;
	this.$isDirty = false;
	this.$invalue = false;
	this.$touched = false;
	this.$untouched = true;

	for (var k in data) {
		var datum = data[k];
		this[k] = new MockControlController(datum);
		_keys.push(k);
	}

}
