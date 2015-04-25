/*
	noinfopath-data@0.1.4
*/

//globals.js
(function(angular, undefined){
	"use strict";
	
	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers']);

	var noInfoPath = {
		noFilterExpression: function (type, key, operator, match, logic){
			this.type = type || "indexed";
			this.field = key;
			this.operator = operator;
			this.value = match;
			this.logic = logic;
		},	

		noFilter: function (table){
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
				var index = _table.schema.indexes.filter(function(a){ return a.name === key; }),
					isIndexed = index.length == 1 || _table.schema.primKey.name === key,
					type = isIndexed ? "indexed" : "filtered";
				
				_filters.push( new noInfoPath.noFilterExpression(type, key, operator, match, logic));
			};
		},

		noDataReadRequest: function($q, table){
			var deferred = $q.defer(), _table = table;

			Object.defineProperties(this, {
				"promise": {
					"get": function(){
						return deferred.promise;
					}
				}
			});

			this.data = {
				filter: undefined,
				page: undefined,
				pageSize: undefined,
				sort: undefined,
				skip: undefined,
				take: undefined,
			};

			this.__proto__.addFilter = function(key, operator, match, logic){
				if(this.data.filter === undefined){
					this.data.filter = new noInfoPath.noFilter(_table);
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

			this.__proto__.success  = deferred.resolve;
			this.__proto__.error = deferred.reject;
		}
	}

	window.noInfoPath = angular.extend(window.noInfoPath || {}, noInfoPath);

})(angular);