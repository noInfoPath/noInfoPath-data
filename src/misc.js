//misc.js
(function (angular, undefined) {
	angular.module("noinfopath.data")
		.service("noFullName", [function () {
			var temp;

			function parse(inval) {
				temp = inval.split(" ");
			}

			this.firstName = function (fullName) {
				parse(fullName);
				if(temp && temp.length > 0) {
					return temp[0];
				} else {
					return "";
				}
			};

			this.lastName = function (fullName) {
				parse(fullName);
				if(temp && temp.length > 1) {
					return temp[1];
				} else {
					return "";
				}
			};
	}])

	/*
	 *	noDateFunctions Service
	 *
	 *	```json
	 *	"calculatedFields":[{
	 *		"field": "Days",
	 *		"parser": {
	 *			"provider": "noDateFunctions",
	 *			"method": "dateDiff",
	 *			"fields": {
	 *				"date1": "ObservationDate",
	 *				"date2": "HarvestDate"
	 *			}
	 *		}
	 *	}]
	 *	```
	 */

	.service("noCalculatedFields", [function () {

		function timespanDays(parserCfg, data) {
			var d1 = data[parserCfg.parser.fields.date1] ? new Date(data[parserCfg.parser.fields.date1]) : "",
				d2 = data[parserCfg.parser.fields.date2] ? new Date(data[parserCfg.parser.fields.date2]) : "",
				rd;

			if(angular.isDate(d1) && angular.isDate(d2)) {
				rd = (d1 - d2) / 1000 / 60 / 60 / 24;
			}

			return rd;
		}

		function timespanHours(parserCfg, data){
			var d1 = data[parserCfg.parser.fields.date1] ? moment(new Date(data[parserCfg.parser.fields.date1])) : "",
				d2 = data[parserCfg.parser.fields.date2] ? moment(new Date(data[parserCfg.parser.fields.date2])) : "",
				rd;

				if(d1.isValid() && d2.isValid()) {
					rd = d1.diff(d2, 'hours', true);
					rd = Math.round(rd * 100) / 100; // moment does not round when diffing. It floors.
				}

			return rd;
		}

		var fns = {
			"timespanDays": timespanDays,
			"timespanHours": timespanHours
		};

		this.calculate = function (dsConfig, data) {

			var calculatedFields = dsConfig.calculatedFields;

			if(calculatedFields) {

				for(var d = 0; d < data.length; d++) {
					var datum = data[d];

					for(var i = 0; i < calculatedFields.length; i++) {
						var cf = calculatedFields[i],
							provider = cf.parser.provider ? $injector.get(cf.parser.provider) : fns,
							method = provider[cf.parser.method];

						datum[cf.field] = method(cf, datum);
					}
				}
			}

			return data;

		};
	}])

	;
})(angular);
