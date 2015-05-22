/*
	noinfopath-data
	@version 0.1.12
*/

//globals.js
(function(angular, undefined){
	"use strict";
	
	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers'])

		.run(['$parse', '$q', function($parse, $q){

			function _setItem(store, key, value){
				 var getter = $parse(key),
		             setter = getter.assign;

		         setter(store, value);
			}

			function _getItem(store, key){
		 		var getter = $parse(key);
		 		return getter(store);
			}

			function _noFilterExpression(type, key, operator, match, logic){
				this.type = type || "indexed";
				this.field = key;
				this.operator = operator;
				this.value = match;
				this.logic = logic;
			}

			function _noFilter(table){
				var _table = table,
					_filters = [],
					_logic = "and";

				Object.defineProperties(this, {
					"filters": {
						"get": function(){
							return _filters;
						}
					},
					"logic": {
						"get": function(){ return _logic;},
						"set": function(value){ _logic = value }
					}
				});

				this.__proto__.type = "noFilter";
				this.__proto__.add = function (key, operator, match, logic){
					var k, o, m, l;

					if(angular.isObject(key)){
						k = key.field;
						o = key.operator;
						m = key.value;
						l = "and";
					}else{
						k = key;
						o = operator;
						m = match;
						l = logic;
					}

					var index = _table.schema.indexes.filter(function(a){ return a.name === k; }),
						isIndexed = index.length == 1 || _table.schema.primKey.name === k,
						type = isIndexed ? "indexed" : "filtered";
						
					_filters.push( new window.noInfoPath.noFilterExpression(type, k, o, m, l));
				};
			}

			function _noDataReadRequest(table, options){
				var deferred = $q.defer(), _table = table;

				Object.defineProperties(this, {
					"__type": { 
						"get": function () { return "noDataReadRequest"; }
					},
					"promise": {
						"get": function (){
							return deferred.promise;
						}
					}
				});



				this.__proto__.addFilter = function(key, operator, match, logic){
					if(this.data.filter === undefined){
						this.data.filter = new window.noInfoPath.noFilter(_table);
					}

					this.data.filter.add(key, operator, match, logic);
					

				};

				this.__proto__.removeFilter = function(indexOf){
					if(!this.data.filter)
						return;

					
					delete this.data.filter[indexOf];
				
					if(this.data.filter.length === 0){
						delete this.data.filter;
					}	
				};

				this.__proto__.indexOfFilter = function(key){
					if(this.data.filter === undefined){
						return -1;
					}

					for(var i in this.data.filter){
						var f = this.data.filter[i];
						if(f.key === key){
							return Number(i);
						}
					}

					return -1;
				};

				this.__proto__.addSort = function(sort){
					if(this.data.sort === undefined){
						this.data.sort = [];
					}

					this.data.sort.push(sort);
				};

				this.__proto__.removeSort = function(indexOf){
					if(!this.data.sort)
						return;

					
					delete this.data.sort[indexOf];
				
					if(this.data.sort.length === 0){
						delete this.data.sort;
					}	
				};

				this.__proto__.indexOfSort = function(key){
					if(this.data.sort === undefined){
						return -1;
					}

					for(var i in this.data.sort){
						var f = this.data.sort[i];
						if(f.key === key){
							return Number(i);
						}
					}

					return -1;
				};

				if(options){

					this.data = {
						filter: undefined,
						page: undefined,
						pageSize: undefined,
						sort: undefined,
						skip: undefined,
						take: undefined,
					};

					angular.extend(this.data, options.data);

					if(options.data.filter){
						this.data.filter = new window.noInfoPath.noFilter(table);

						angular.forEach(options.data.filter.filters, function(filter){
							this.data.filter.add(filter)
						},this);					
					}

				}else{
					this.data = {
						filter: undefined,
						page: undefined,
						pageSize: undefined,
						sort: undefined,
						skip: undefined,
						take: undefined,
					};
				}

				this.__proto__.success  = deferred.resolve;
				this.__proto__.error = deferred.reject;				
			}

			var noInfoPath = {
				getItem: _getItem,
				setItem: _setItem,
				noFilterExpression: _noFilterExpression,
				noFilter: _noFilter,
				noDataReadRequest: _noDataReadRequest
			};

			window.noInfoPath = angular.extend(window.noInfoPath || {}, noInfoPath);
		}])
})(angular);

