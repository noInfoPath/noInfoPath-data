//http.js
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.data')
		.provider("noHTTP",[function(){

			this.configure = function(){
					angular.noop();
			}

			this.createTransport = function(){
				return new noREST();
			}

			function noREST($q, $http, $filter, noUrl, noConfig){
				var SELF = this,
					odataFilters = {
			            eq: "eq",
			            neq: "ne",
			            gt: "gt",
			            gte: "ge",
			            lt: "lt",
			            lte: "le",
			            contains : "substringof",
			            doesnotcontain: "substringof",
			            endswith: "endswith",
			            startswith: "startswith"
			        },				
					mappers = {
			            pageSize: angular.noop,
			            page: angular.noop,
			            filter: function(params, filter, useVersionFour) {
			                if (filter) {
			                    params.$filter = toOdataFilter(filter, useVersionFour);
			                }
			            },
			            data: function(params, filter, useVersionFour){
			            	mappers.filter(params, filter.filter, useVersionFour)
			            },
			            // filter: function(params, filter, useVersionFour) {
			            //     if (filter) {
			            //         params.$filter = SELF.toOdataFilter(filter, useVersionFour);
			            //     }
			            // },
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
				function toOdataFilter (filter, useOdataFour) {
				    var result = [],
				        logic = filter.logic || "and",
				        idx,
				        length,
				        field,
				        type,
				        format,
				        operator,
				        value,
				        ignoreCase,
				        filters = filter.filters;
					
				    for (idx = 0, length = filters.length; idx < length; idx++) {
				        filter = filters[idx];
				        field = filter.field;
				        value = filter.value;
				        operator = filter.operator;

				        if (filter.filters) {
				            filter = toOdataFilter(filter, useOdataFour);
				        } else {
				            ignoreCase = filter.ignoreCase;
				            field = field.replace(/\./g, "/");
				            filter = odataFilters[operator];
				            // if (useOdataFour) {
				            //     filter = odataFiltersVersionFour[operator];
				            // }

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
				                    if (useOdataFour) {
				                        format = "yyyy-MM-ddTHH:mm:ss+00:00";
				                    } else {
				                    	value = $filter("date")(value, "DateTime'yyyy-MM-ddT0hh:mm:ss'");
				                        format = "{1}";
				                    }
				                } else {
				                    format = "{1}";
				                }

				                if (filter.length > 3) {
				                    if (filter !== "substringof") {
				                        format = "{0}({2}," + format + ")";
				                    } else {
				                        format = "{0}(" + format + ",{2})";
				                        if (operator === "doesnotcontain") {
				                            if (useOdataFour) {
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

				                filter = $filter("format")(format, filter, value, field);
				            }
				        }

				        result.push(filter);
				    }

			      	filter = result.join(" " + logic + " ");

			        if (result.length > 1) {
			            filter = "(" + filter + ")";
			        }

			        return filter;
				}

				function mapParams (options, type, useVersionFour) {
	                var params,
	                    value,
	                    option,
	                    dataType;

	                options = options || {};
	                type = type || "read";
	                dataType = "json";

	                if (type === "read") {
	                	if(angular.isNumber(options) || angular.isString(options)){
	                		return "(" + noUrl.normalizeValue(options) + ")";
	                	}

	                    params = {
	                        $inlinecount: "allpages"
	                    };

	                    //params.$format = "json";

	                    for (option in options) {
	                    	console.log(option, options[option]);
	                        if (mappers[option]) {
	                            mappers[option](params, options[option], useVersionFour);
	                        } else {
	                            params[option] = options[option];
	                        }
	                    }
	                } else {
	                    if (dataType !== "json") {
	                        throw new Error("Only json dataType can be used for " + type + " operation.");
	                    }

	                    if (type !== "destroy") {
	                        for (option in options) {
	                            value = options[option];
	                            if (typeof value === "number") {
	                                options[option] = value + "";
	                            }
	                        }

	                        params = options;
	                    }
	                }

	                return noUrl.serialize(params); 
	            }
	
				this.create = function(resourceURI, formdata){
					var json = angular.toJson(formdata);
					console.log(resourceURI);

					var deferred = $q.defer(),
						req = {
							method: "POST",
							url: resourceURI,
							data: json,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							withCredentials: true
						};
				
					$http(req)
						.success(function(data){
							//console.log(angular.toJson(data) );

							deferred.resolve(data);
						})
						.error(function(reason){
							console.error(reason);
							deferred.reject(reason);
						});

				
	
					return deferred.promise;
				}

				this.read = function(resourceURI, query){
					//console.log(!!query);
					var q = angular.isObject(query) ? mapParams(query.data) : query;


					var deferred = $q.defer(),
						url = noUrl.makeResourceUrl(noConfig.current.RESTURI, resourceURI, q),
						req = {
							method: "GET",
							url: url,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							withCredentials: true
						};
					
					$http(req)
						.success(function(data){
							//console.log( angular.toJson(data));
							deferred.resolve(data.value);
						})
						.error(function(reason){
							deferred.reject(reason);
						});

					return deferred.promise;
				}

				this.update = function(){
					var deferred = $q.defer();
					$timeout(function(){
						console.warn("TODO: Implement INOCRUD::update.");
						deferred.resolve();
					})
					return deferred.promise;
				}

				this.destroy = function(){
					var deferred = $q.defer();
					$timeout(function(){
						console.warn("TODO: Implement INOCRUD::destroy.");
						deferred.resolve();
					})					
					return deferred.promise;
				}
			}

			this.$get = ['$q', '$http', '$filter', 'noUrl', 'noConfig', function($q, $http, $filter, noUrl, noConfig){
				return new noREST($q, $http, $filter, noUrl, noConfig)
			}]
		}])
	;
})(angular);
