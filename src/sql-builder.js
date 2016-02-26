/*
* ## @interface INoQueryBuilder
*
* > INoQueryBuilder is a conceptual entity, it does not really exist
* > the reality. This is because JavaScript does not implement interfaces
* > like other languages do. This documentation should be considered as a
* > guide for creating query providers compatible with NoInfoPath.
*
* ### Overview
* INoQueryBuilder provides a service interface definition for converting a set
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
*/

(function(angular, undefined){
	angular.module("noinfopath.data")
		/*
		* ## @service noSQLQueryBuilder : INoQueryBuilder `Deprecated`
		*
		* ### Overview
		*
		* Implements a INoQueryBuilder compatible service that converts NoFilters,
		* NoSort, NoPage into a WebSQL compatible query string.
		*
		*/
		.service("noSQLQueryBuilder", ['$filter', function($filter){
			var sqlFilters = {
					eq: "==",
					neq: "!=",
					gt: ">",
					gte: ">=",
					lt: "<",
					lte: "<=",
					contains : "CONTAINS",
					doesnotcontain: "NOT CONTAINS"
					//endswith: "endswith",
					//startswith: "startswith"
				},
				mappers = {
					pageSize: angular.noop,
					page: angular.noop,
					filter: function(params, filter) {
						if (filter) {
							params.$filter = toSQLFilter(filter);
						}
					},
					data: function(params, filter){
						mappers.filter(params, filter.filter);
					},
					sort: function(params, orderby) {
						var sorts = angular.forEach(orderby, function(value) {
							var order = value.field.replace(/\./g, "/");

							if (value.dir === "desc") {
								order += " desc";
							}

							return order;
						}),
						expr = sorts ? sorts.join(",") : undefined;

						if (expr) {
							params.$orderby = expr;
						}
					},
					skip: function(params, skip) {
						if (skip) {
							params.$skip = skip;
						}
					},
					take: function(params, take) {
						if (take) {
							params.$top = take;
						}
					}
				};

			function isGuid(val){
		    	return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
		    }

			function toSQLFilter (filters) {
			    var result = [],
			        idx,
			        length,
			        field,
			        type,
			        format,
			        operator,
			        value,
			        ignoreCase,
					filter,
					origFilter;



			    for (idx = 0, length = filters.length; idx < length; idx++) {
			    	filter = origFilter = filters[idx];
			    	field = filter.column;
			        value = filter.value;
			        operator = filter.operator;
					logic = filter.logic;

			    	if (filter.filters)
			    	{
			    		filter = toSQLFilter(filter);
			    	}
			    	else
			    	{
			    		ignoreCase = filter.ignoreCase;
			            field = field.replace(/\./g, "/");
			            filter = sqlFilters[operator];

			             if (filter && value !== undefined) {

			                if (angular.isString(value)) {
			                	if(isGuid(value)){
									format = "guid'{1}'";
			                	}else{
			                		format = "'{1}'";
			                	}

			                    value = value.replace(/'/g, "''");


			                    // if (ignoreCase === true) {
			                    //     field = "tolower(" + field + ")";
			                    // }

			                } else if (angular.isDate(value)) {

		                    	value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
		                        format = "{1}";

			                } else {
			                    format = "{1}";
			                }

			                // if (filter.length > 3) {
			                //     if (filter !== "substringof") {
			                //         format = "{0}({2}," + format + ")";
			                //     } else {
			                //         format = "{0}(" + format + ",{2})";
			                //         // if (operator === "doesnotcontain") {
			                //         //     if (useOdataFour) {
			                //         //         format = "{0}({2},'{1}') eq -1";
			                //         //         filter = "indexof";
			                //         //     } else {
			                //         //         format += " eq false";
			                //         //     }
			                //         // }
			                //     }
			                // } else {
			                //     format = "{2} {0} " + format;
			                // }

			                filter = $filter("format")(format, filter, value, field);
			            }
			    	}

			    	origFilter.compiledFilter = filter;
			        result.push(origFilter);
			    }

 				var SQLFilter = "", f;

 				do{

 				}while(f);

 				SQLFilter = SQLFilter.trim();

		        return SQLFilter;
			}

			function toSQLSort(sort){
				var sorts = [], expr;

				angular.forEach(sort, function(value) {
					var order = value.column.replace(/\./g, "/");

					if (value.dir === "desc") {
						order += " desc";
					}

					sorts.push(order);
				});

				expr = sorts ? sorts.join(",") : undefined;

				return expr;
			}

			this.makeQuery = function(){
				var query = {};

				for(var ai in arguments){
					var arg = arguments[ai];

					//success and error must always be first, then
					if(angular.isObject(arg)){
						switch(arg.__type){
							case "NoFilters":
								query.$filter = toSQLFilter(arg);
								break;
							case "NoSort":
								query.$orderby = toSQLSort(arg);
								break;
							case "NoPage":
								page = arg;
								break;
						}
					}
				}

				return query;
			};
		}])
	;
})(angular);
