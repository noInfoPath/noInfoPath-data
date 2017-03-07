//dynamic-filter.js
/*
*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
*
*	___
*
*	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.42*
*
*	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
*
*	Copyright (c) 2017 The NoInfoPath Group, LLC.
*
*	Licensed under the MIT License. (MIT)
*
*	___
*
*/
(function (angular, undefined) {
	"use strict";

	function NoDynamicFilterService($injector) {
		/*
		 *	@method normalizeFilterValue
		 *
		 *	Evaluates the type parameter looking for know types, and converts
		 *	converts the value parameter to explicitly be of the type provied.
		 *
		 *	If the type is not a supported type then value is returned unchanged.
		 */
		function normalizeFilterValue(value, type) {
			var outval = value;
			switch(type) {
				case "date":
					outval = noInfoPath.toDbDate(value);
					break;
				case "number":
					outval = Number(value);
					break;
				default:
					break;
			}
			return outval;
		}

		function resolveValueSource(valueCfg, scope) {
			var source, tmp = {};

			if(valueCfg.source) {
				if(["$rootScope", "$stateParams"].indexOf(valueCfg.source) > -1 || valueCfg.source !== "scope") {
					source = $injector.get(valueCfg.source);
				} else {
					source = scope;
				}
			}

			return source;
		}

		function resolveParams(prov, valueCfg) {
			var val, meth;

			if(valueCfg.method) {
				meth = prov[valueCfg.method];
				val = meth();
			} else if(valueCfg.property) {
				val = noInfoPath.getItem(prov, valueCfg.property);
			}

			return val;
		}

		// function resolveParams(valueCfg) {
		// 	var params = [];
		//
		// 	if(valueCfg.params) {
		// 		for(var i=0; i < valueCfg.params.length, i++) {
		// 			var param = valueCfg.params[i];
		//
		// 			if(angular.isObject(param)) {
		// 				var source = resolveValueSource(param, scope);
		// 			} else {
		//
		// 			}
		// 		}
		//
		// 	}
		// }

		/*
		 *	@method configureFilterWatch
		 *
		 *	If the filterCfg parameter's value property, has a watch property, and
		 *	the value's source property is an AngularJS  observable object
		 *	a watch is configured on the source. The cb parameter is used
		 *	for the watch's callback.
		 *
		 *	When the source is "scope", the scope parameter is used, otherwise
		 *	the source is injected using the $injector service.
		 *
		 *	> NOTE: Currently $rootScope is the only supported injectable source.
		 */
		function configureValueWatch(dsConfig, filterCfg, value, source, cb) {
			if(source && source.$watch && value.watch && cb) {
				if(value.default) noInfoPath.setItem(source, value.property, value.default);

				var filter = angular.copy(filterCfg);
				source.$watch(value.property, cb.bind(filter, dsConfig, filterCfg, value));
			}
		}

		/**
		 *   ### resolveFilterValues(filters)
		 *   #### This is more information
		 *
		 *	> Note of some kind
		 *
		 *	|Name|Type|Description|
		 *	|----|----|-----------|
		 *	|Foo|Number|Does something fun.|
		 *
		 *   > TODO: Implement support for delayed (waitFor) filter values.
		 *
		 *   > NOTE: If a filter.value is an object and it has a source
		 *   > property set to `scope` then use the directives scope variable.
		 *   > Otherwise assume source is an injectable.
		 */
		function resolveFilterValues(dsConfig, filters, scope, watchCB) {
			var values = {}, compoundValues = [];
			/*
			 *	@property noDataSource.filter
			 *
			 *	An array of NoInfoPath dynamic filters. Each filter defines what
			 *	the provider of the filter data is, and what property to filter on.
			 *
			 *	The filter property has a child property called `value`. When it
			 *	is an object then a dynamic filter is assumed. Otherwise it is treated
			 *	as the filter value.
			 *
			 *	When `value` is an object it is expected to have a `source` and a
			 *	`property` property. Source is always a string that is either the
			 *	string "scope" or the name of an AngularJS injectable service that
			 *	is a JavaScript object. Possible services could be $rootScope or $stateParams.
			 */
			for(var f in filters) {
				var filter = filters[f],
					source, value;
				if(angular.isObject(filter.value)) {
					if(angular.isArray(filter.value)) {
						if(noInfoPath.isCompoundFilter(filter.field)){
							for(var vi=0; vi < filter.value.length; vi++){
								var valObj = filter.value[vi];
								source = resolveValueSource(valObj, scope);
								if(source) {
									if(valObj.watch) {
										configureValueWatch(dsConfig, filter, valObj, source, watchCB);
										compoundValues.push(normalizeFilterValue(noInfoPath.getItem(source, valObj.property), valObj.type));
									} else {
										//The following is a hack. This is needs to replacedw with a Generic
										//ParameterResolver in the future.
										var meth = source[valObj.method]
										if(valObj.method) {
											compoundValues.push(source[valObj.method](scope));
										} else if(valObj.property){
											compoundValues.push(source[valObj.property]);
										} else {
											console.warn("Need to implent the source is not a function case.", source);
										}
										//var tmp = resolveValue(source, valObj);
										//compoundValues.push(tmp);
									}
								} else {
									compoundValues.push(valObj);
								}
							}
							//Will assume guids and wrap them in quotes
							values[filter.field] = compoundValues;
						}else{
							values[filter.field] = normalizeFilterValue(filter.value); // in statement
						}
					} else {
						source = resolveValueSource(filter.value, scope);
						configureValueWatch(dsConfig, filter, filter.value, source, watchCB);
						values[filter.field] = normalizeFilterValue(noInfoPath.getItem(source, filter.value.property), filter.value.type);
					}
				} else {
					values[filter.field] = normalizeFilterValue(filter.value);
				}
			}
			return values;
		}

		function makeFilters(dsConfig, scope, watchCB) {
			var filters = [],
				filterValues;
			if(dsConfig.filter) {
				filterValues = resolveFilterValues(dsConfig, dsConfig.filter, scope, watchCB);
				for(var f in dsConfig.filter) {
					var filter = dsConfig.filter[f],
						value;
					if(angular.isObject(filter.value)) {

						if(angular.isArray(filter.value) && !noInfoPath.isCompoundFilter(filter.field)) {
							value = filter.value; // in statement
						} else {
							value = filterValues[filter.field];
						}
					} else {
						value = filter.value;
					}
					filters.push({
						field: filter.field,
						operator: filter.operator,
						value: value
					});
				}
			}
			return filters.length ? filters : undefined;
		}
		//this.resolveFilterValues = resolveFilterValues;
		this.configure = makeFilters;
	}

	angular.module("noinfopath.data")
		.service("noDynamicFilters", ["$injector", NoDynamicFilterService]);
})(angular);
