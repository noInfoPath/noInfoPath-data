(function (angular, undefined) {
	"use strict";

	/*
	 *	### Class NoDataModel
	 *
	 *  This class provides functionality to help other NoInfoPath services to
	 *	access and utilitze data in a consistant way. It provides a pristine
	 *	attribute to the data so a directive can 'roll back' a change, for example.
	 *
	 *	#### Properties
	 *
	 *	|Name|Type|Description|
	 *	|----|----|-----------|
	 *	|data|NoResults Object|Returns the data wrapped in a NoInfoPath NoResults object|
	 *	|pristine|NoResults Object|Returns the pristine data wrapped in a NoInfoPath NoResults object|
	 *	|__type|String|Returns the type of NoInfoPath object. In this case, it will return "NoDataModel"|
	 *
	 *	##### data
	 *
	 *	Returns an object that is saved within the NoDataModel.
	 *
	 *	##### pristine
	 *
	 *	Returns an object that is the pristine version of the data. This enables data rollbacks using the undo() method.
	 *
	 *	##### __type
	 *
	 *	Returns a string that explains that this is an object that was created by the NoDataModel class. Always returns "NoDataModel".
	 *
	 *
	 *	#### Methods
	 *
	 *	|Name|Description|
	 *	|----|-----------|
	 *  |clean()|Removes any Angular properties off the data object, and cleans up 'falsy' values to null|
	 *	|undo()|Sets the data property back to what is stored in the pristine property|
	 *	|update(data)|Updtes the data with a matching data object|
	 *
	 *	##### clean()
	 *
	 *	This method removes any Angular or Kendo data model properties off the data object. It also cleans up any
	 *	falsy values and returns them as null.
	 *
	 *	**Parameters**
	 *
	 *	None
	 *
	 *	**Returns**
	 *
	 *	Undefined
	 *
	 *	##### undo()
	 *
	 *	This method returns the value contained within the NoDataModel back to the current pristine value.
	 *
	 *	**Parameters**
	 *
	 *	None
	 *
	 *	##### update(data)
	 *
	 *	This method updates the data contained within the data model to the data being passed in.
	 *
	 *	**Parameters*
	 *
	 *	|Name|Type|Description|
	 *	|----|----|-----------|
	 *	|data|Object|An object that will be saved within NoDataModel|
	 *
	 *	data
	 *
	 *	An object that is to be saved within the NoDataModel object. This data does not need to be flat.
	 *
	 *	```js
	 *	{
	 *		PersonID: "6a2bfe0f-29da-440d-e5b9-62262ac0345c",
	 *		PersonFirstName: "Foo",
	 *		PersonLastName: "Bar",
	 *		PersonAge: 25,
	 *		Mother: {
	 *			PersonID: "54dd9168-0111-43e3-9db8-77dc33169b41",
	 *			PersonFirstName: "Bridget",
	 *			PersonLastName: "Bar",
	 *			PersonAge: 50
	 *    }
	 *  }
	 *  ```
	 *
	 *	**Returns**
	 *
	 *	Undefined
	 *
	 *
	 */

	 function _unfollow_data(data, schema) {
		var foreignKeys = schema.foreignKeys || {},
		 	outdata = angular.copy(data);

		 for (var fks in foreignKeys) {

			 var fk = foreignKeys[fks],
				 datum = data[fk.column];

			 if (datum) {
				 outdata[fk.column] = datum[fk.refColumn] || datum;
			 }
		 }

		 return outdata;
	 }

	 function _update_ngModelController(ctrl, value) {
		 ctrl.$setViewValue(value);
		 ctrl.$setPristine();
		 ctrl.$setUntouched();
		 ctrl.$render();
	 }

	function NoDataModel(schema, model) {
		if (!schema) throw "schema is required contructor parameter.";
		if (!model) throw "model is required contructor parameter.";

		var _schema = schema, _pristine;

		Object.setPrototypeOf(this, model);

		_pristine = _pureModel(this);

		function _isProperty(value, prop) {
			return Object.is(value[prop], null) || value.hasOwnProperty(prop);
		}

		function _resolve(value, notAnArray) {
			if (!!value && notAnArray) {
				return value;
			} else if (typeof (value) === "boolean") {
				return value;
			} else if (angular.isNumber(value)) {
				return value;
			} else {
				return null;
			}
		}

		function _updateView(THIS, data) {

			for (var k in data) {
				var value = data[k],
					model = THIS[k],
					validKey = k.indexOf("$") === -1 && !angular.isFunction(model),
					notAnArray = !angular.isArray(model),
					haveModelValue = validKey && model ? _isProperty(model, "$viewValue") : false,
					fk = schema.foreignKeys ? schema.foreignKeys[k] : null;

				//console.log(k, data);

				if (!!model && validKey) {

					if (haveModelValue) {
						model.$setViewValue( _resolve(value, notAnArray) );
					} else if (angular.isObject(value)) {
						THIS[k] = fk ? value[fk.refColumn] : value;
					} else {
						THIS[k] = _resolve(value, notAnArray);
					}

				}

			}

			//Second pass to clean up [object Object] anamoly.
			// for(var p in THIS){
			// 	var model2 = THIS[p],
			// 		validKey2 = p.indexOf("$") === -1 && !angular.isFunction(model2),
			// 		hasModelValue2 = validKey2 && model2 ? _isProperty(model2, "$viewValue") : false;
			//
			// 	if(validKey2) {
			// 		if(hasModelValue2) {
			// 			if(model2.$viewValue === "[object Object]") {
			// 				_updateViewValue(THIS, p, null) ;
			//
			// 			}
			// 		}
			// 	}
			// }
		}

		function _pureView(data) {
			var values = {};

			for (var k in data) {
				var value = data[k],
					validKey = k.indexOf("$") === -1 && !angular.isFunction(value),
					notAnArray = !angular.isArray(value),
					haveModelValue = validKey && value ? _isProperty(value, "$viewValue") : false,
					fk = schema.foreignKeys ? schema.foreignKeys[k] : null;

				if (!!value && validKey) {

					if (haveModelValue) {
						values[k] = _resolve(value.$viewValue, notAnArray);
					} else if (angular.isObject(value)) {
						values[k] = fk ? value[fk.refColumn] : value;
					} else {
						values[k] = _resolve(value, notAnArray);
					}

				}

			}

			return values;

		}

		function _pureModel(data) {
			var values = {};

			for (var k in data) {
				var value = data[k],
					validKey = k.indexOf("$") === -1 && !angular.isFunction(value),
					notAnArray = !angular.isArray(value),
					haveModelValue = validKey && value ? _isProperty(value, "$modelValue") : false,
					fk = schema.foreignKeys ? schema.foreignKeys[k] : null;

				if (!!value && validKey) {

					if (haveModelValue) {
						values[k] = _resolve(value.$modelValue, notAnArray);
					} else if (angular.isObject(value)) {
						values[k] = fk ? value[fk.refColumn] : value;
					} else {
						values[k] = _resolve(value, notAnArray);
					}

				}

				// //Check for missing properties using the schema.colums hash.
				// for(var c in _schema.columns) {
				// 	if(!values.hasOwnProperty(c)) {
				// 		values[c] = ""; //This is to make sure that [Object object] does not appear in the controlls.
				// 	}
				//}

			}

			return values;

		}

		function _updateViewValue(THIS, k, value) {
			var ctrl = THIS[k];
			if (ctrl && ctrl.$setViewValue) {
				ctrl.$setViewValue(value);
				ctrl.$setPristine();
				ctrl.$setUntouched();
				ctrl.$render();
			} else {
				THIS[k] = value;
			}
		}

		function _normalizeProperties(THIS, schema) {
			return;

		}

		Object.defineProperties(this, {
			"__type": {
				"get": function () {
					return "NoDataModel";
				}
			}
		});

		Object.defineProperty(this, "pristine", {
			get: function () {
				return _pristine || {};
			},
			set: function (v) {
				throw new Error("NoDataModel::pristine is readonly.");
			}
		});

		Object.defineProperty(this, "current", {
			get: function () {
				return _pureView(this);
			},
			set: function (src) {
				var THIS = this, keys;

				if(angular.isObject(src)) {
					keys = Object.keys(src).filter(function (v, k) {
						if (v.indexOf("$") === -1) return v;
					});

					keys.forEach(function (k) {
						_updateViewValue(THIS, k, src[k]);
					});
				}
				//if(!_pristine) _pristine = _pureView(this);
			}
		});

		this.undo = function () {
			_updateView(this, _pristine);

			if (this.$rollbackViewValue) {
				this.$rollbackViewValue();
				this.$setPristine();
				this.$setUntouched();
			}
		};

		this.commit = function () {
			if (this.$commitViewValue) {
				_normalizeProperties(this, _schema);
				this.$commitViewValue();
				this.$setPristine();
				this.$setUntouched();
				_pristine = _pureModel(this);
			}
		};



		this.update = function (data) {
			_updateView(this, _unfollow_data(data, _schema));
			this.commit();
		};


	}

	NoDataModel.clean = _unfollow_data;
	NoDataModel.ngModelHack = _update_ngModelController;

	//Expose these classes on the global namespace so that they can be used by
	//other modules.
	var _interface = {
		NoDataModel: NoDataModel
	};

	noInfoPath.data = angular.extend(noInfoPath.data, _interface);

})(angular);
