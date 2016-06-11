//query-builder.js
/*
 * ## @interface INoQueryParser
 *
 * > INoQueryParser is a conceptual entity, it does not really exist
 * > the reality. This is because JavaScript does not implement interfaces
 * > like other languages do. This documentation should be considered a
 * > guide for creating query parsers compatible with NoInfoPath.
 *
 * ### Overview
 * INoQueryParser provides a service interface definition for converting a set
 * of NoInfoPath class related to querying data into a given query protocol.
 * An example of this is the ODATA 2.0 specification.
 *
 * ### Methods
 *
 * #### makeQuery(filters, sort, page)
 *
 * ##### Parameters
 *
 * |Name|Type|Descriptions|
 * |----|----|------------|
 * |filters|NoFilters|(Optional) Instance of a NoFilters class|
 * |sort|NoSort|(Optional) Instance of NoSort class|
 * |page|NoPage|(Optional) Instance of NoPage class|
 *
 * ##### Returns
 * Object
 *
 *
 *	## noQueryParser
 *
 *	### Overview
 *	The noQueryParser takes the `data` property of the options
 *	parameter passed to the Kendo DataSources transport.read method. The
 *	data object is inspected and its filter, sort, and paging values are
 *	converted to NoInfoPath compatible versions.
 *
 *	### Methods
 *
 *	#### parse(options)
 *	Parses provided filter, sort and paging options into NoInfoPath compatible
 *   objects. Stores the results internally for future use.
 *
 *   ##### Returns
 *	Any/all filters, sorts or paging data as an array compatible
 *	with a call to `function.prototype.array`.
 *
 *	### Properties
 *   None.
 *
 *
 * ##  noQueryParser : INoQueryParser
 *
 * ### Overview
 *
 * Implements a INoQueryBuilder compatible service that converts NoFilters,
 * NoSort, NoPage into ODATA compatible query object.
 *
 */
(function (angular, undefined) {
	angular.module("noinfopath.data")
		.service("noQueryParser", [function () {
			var filters, sort, paging;

			this.parse = function (options) {
				var filters, sort, paging;

				//filter { logic: "and", filters: [ { field: "name", operator: "startswith", value: "Jane" } ] }
				//{"take":10,"skip":0,"page":1,"pageSize":10,"filter":{"logic":"and","filters":[{"value":"apple","operator":"startswith","ignoreCase":true}]}}
				if(!!options.take) paging = new noInfoPath.data.NoPage(options.skip, options.take);
				if(!!options.sort) sort = new noInfoPath.data.NoSort(options.sort);
				if(!!options.filter) filters = new noInfoPath.data.NoFilters(options.filter);

				return toArray(filters, sort, paging);
			};

			function toArray(filters, sort, paging) {
				var arr = [];

				if(!!filters) arr.push(filters);

				if(!!sort) arr.push(sort);

				if(!!paging) arr.push(paging);

				if(arr.length === 0) arr = undefined;

				return arr;
			}
		}])

	.service("noOdataQueryBuilder", ['$filter', function ($filter) {
		var odataFilters = {
				eq: "eq",
				neq: "ne",
				gt: "gt",
				gte: "ge",
				lt: "lt",
				lte: "le",
				contains: "substringof",
				doesnotcontain: "substringof",
				endswith: "endswith",
				startswith: "startswith"
			},
			mappers = {
				pageSize: angular.noop,
				page: angular.noop,
				filter: function (params, filter, useVersionFour) {
					if(filter) {
						params.$filter = toOdataFilter(filter, useVersionFour);
					}
				},
				data: function (params, filter, useVersionFour) {
					mappers.filter(params, filter.filter, useVersionFour);
				},
				// filter: function(params, filter, useVersionFour) {
				//     if (filter) {
				//         params.$filter = SELF.toOdataFilter(filter, useVersionFour);
				//     }
				// },
				sort: function (params, orderby) {
					var sorts = angular.forEach(orderby, function (value) {
							var order = value.field.replace(/\./g, "/");

							if(value.dir === "desc") {
								order += " desc";
							}

							return order;
						}),
						expr = sorts ? sorts.join(",") : undefined;

					if(expr) {
						params.$orderby = expr;
					}
				},
				skip: function (params, skip) {
					if(skip) {
						params.$skip = skip;
					}
				},
				take: function (params, take) {
					if(take) {
						params.$top = take;
					}
				}
			};



		function toOdataFilter(filters, useOdataFour) {
			var result = [],
				field,
				type,
				format,
				operator,
				value,
				ignoreCase,
				filter,
				origFilter;

			console.log(filters);

			if(filters.__type === "NoFilters") {
				filters = filters.toKendo();
				filters = filters.length > 0 ? filters[0] : {
					filters: []
				};
			}

			if(filters.__type === "NoFilter") {
				filters = filters.toKendo();
			}

			for(var idx = 0; idx < filters.filters.length; idx++) {
				filter = origFilter = filters.filters[idx];
				field = filter.column;
				value = filter.value;
				operator = filter.operator;
				logic = filter.logic;

				if(filter.filters) {
					filter = toOdataFilter(filter, useOdataFour);
				} else {
					ignoreCase = filter.ignoreCase;
					field = field.replace(/\./g, "/");
					filter = odataFilters[operator];

					// if (useOdataFour) {
					//     filter = odataFiltersVersionFour[operator];
					// }

					if(filter && value !== undefined) {

						if(angular.isString(value)) {
							if(noInfoPath.isGuid(value)) {
								format = "guid'{1}'";
							} else {
								format = "'{1}'";
							}

							value = value.replace(/'/g, "''");


							// if (ignoreCase === true) {
							//     field = "tolower(" + field + ")";
							// }

						} else if(angular.isDate(value)) {
							if(useOdataFour) {
								format = "yyyy-MM-ddTHH:mm:ss+00:00";
							} else {
								value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
								format = "{1}";
							}
						} else {
							format = "{1}";
						}

						if(filter.length > 3) {
							if(filter !== "substringof") {
								format = "{0}({2}," + format + ")";
							} else {
								format = "{0}(" + format + ",{2})";
								if(operator === "doesnotcontain") {
									if(useOdataFour) {
										format = "{0}({2},'{1}') eq -1";
										filter = "indexof";
									} else {
										format += " eq false";
									}
								}
							}
						} else {
							format = "{2} {0} " + format;
						}

						filter = !!value ? $filter("format")(format, filter, value, field) : $filter("format")(format, filter, undefined, field);
					}
				}

				origFilter.compiledFilter = filter;
				result.push(origFilter);
			}

			//loop until there are no more filters or logic.
			var odataFilter = "",
				f;

			do {
				f = result.pop();

				if(f) {

					odataFilter = odataFilter + "(" + f.compiledFilter + ")";

					if(f.logic) {
						odataFilter = odataFilter + " " + f.logic + " ";
					} else {
						f = null;
					}
				}

			}
			while (f);

			odataFilter = odataFilter.trim();

			return odataFilter;
		}

		function toOdataSort(sort) {
			var sorts = [],
				expr;

			angular.forEach(sort, function (value) {
				console.log(value);
				var order = value.column.replace(/\./g, "/");

				if(value.dir === "desc") {
					order += " desc";
				}

				sorts.push(order);
			});

			expr = sorts ? sorts.join(",") : undefined;

			return expr;
		}

		this.makeQuery = function () {
			var query = {};

			for(var ai in arguments) {
				var arg = arguments[ai];

				//success and error must always be first, then
				if(angular.isObject(arg)) {
					switch(arg.__type) {
						case "NoFilters":
							query.$filter = arg.toODATA();
							break;
						case "NoSort":
							query.$orderby = toOdataSort(arg);
							break;
						case "NoPage":
							query.$skip = arg.skip;
							query.$top = arg.take;
							query.$inlinecount = "allpages";
							break;
					}
				}
			}

			return query;
		};
	}])

	;
})(angular);
