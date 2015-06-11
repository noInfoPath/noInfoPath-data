/*
	noinfopath-data
	@version 0.1.28
*/

//globals.js
(function(angular, undefined){
	"use strict";
	
	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers'])

		.run(['$injector', '$parse', '$q', function($injector, $parse, $q){

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

					if(_table){
						var index = _table.schema.indexes.filter(function(a){ return a.name === k; }),
						isIndexed = index.length == 1 || _table.schema.primKey.name === k,
						type = isIndexed ? "indexed" : "filtered";
					}else{
						type = "odata"
					}
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

					if(this.data.filter){
						var tmp = new window.noInfoPath.noFilter(table);

						angular.forEach(this.data.filter.filters, function(filter){
							tmp.add(filter);
						},this);	

						this.data.filter = tmp;				
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
				this.expand = options.expand;
				this.projections = options.projections;	
				this.aggregators = options.aggregators;		
			}

            function _noDataSource(component, config, stateParams, scope){
                var service = $injector.get(component),
                    provider = $injector.get(config.provider);

                var ds = service.noDataSource(config.tableName, provider, config);
                ds.expand = config.expand || undefined;
                ds.projections = config.projections;
                ds.aggregators = config.aggregators;

                if(config.sort){
                    ds.sort = config.sort;
                }       
               
               	if(config.filter){
               		//Check for early binding filters.
               		var _filters = [];
               		angular.forEach(config.filter, function(fltr){
               			if(angular.isObject(fltr.value)){
               				var source;
               				if(fltr.value.source === "state"){
               					source = stateParams;
               				}else{
               					source = scope;
               				}
               				
           					var val = window.noInfoPath.getItem(source, fltr.value.property);
            					val = fltr.value.type === "number" ? Number(val) : val;
               				_filters.push({field: fltr.field, operator: fltr.operator, value: val});
         
               			}else{
               				_filters.push({field: fltr.field, operator: fltr.operator, value: fltr.value});
               			}
               		});

               		ds.filter = _filters;
               	}


               
               	angular.extend(this, ds);
            }

            function _makeFilters(filters, scope, stateParams){
                var _filters = [];

                angular.forEach(filters, function(filter){
                    var ctx, v;

                    if(angular.isObject(filter.value)){
                        //When it is an object the value is coming
                        //from a source.
                        switch(filter.value.source){
                            case "state":
                            	ctx = stateParams;
                                break;
                            case "scope":
                               	ctx = scope;
                                break;
                        }  

            	        v =  window.noInfoPath.getItem(ctx, filter.value.property);
            
                        if(v){
                            v =  filter.value.type === "number" ? Number(v) : v;
                            _filters.push({field: filter.field, operator: filter.operator, value: v});                             
                        }
                    }else{
                        //static value
                        _filters.push(filter);
                    }
                });

                return _filters;
            }

			var noInfoPath = {
				getItem: _getItem,
				setItem: _setItem,
				bindFilters: _makeFilters,
				noFilterExpression: _noFilterExpression,
				noFilter: _noFilter,
				noDataReadRequest: _noDataReadRequest,
				noDataSource: _noDataSource
			};

			window.noInfoPath = angular.extend(window.noInfoPath || {}, noInfoPath);
		}])

		.service("noDataService", ['$q', function($q){
			this.noDataSource = function(uri, datasvc, options){
         		
				function _noHTTP(){


					return { 
	         			transport: {
							read: function(options){			
								return datasvc.read(uri, options);
							},
							create: function(options){
								return datasvc.create(uri, options);
							},
							update: function(options){
								return datasvc.update(uri, options);
							},
							destroy: function(options){
								return crudOp(_ds, "destroy", options);
							},
							one: function(options){
								return datasvc.read(uri, options)
									.then(function(data){
										if(data.length > 0){
											return data[0];
										}else{
											return {};
										}
									});
							},
							upsert: function(options){
								console.warn("TODO: implement noHTTP upsert");
								return datasvc.update(uri, options);
							}
						}
	         		}
				}


				function _noIndexedDB(){
					function crudOp(table, operation, options){
						var 	crud = table.noCRUD,
								ndrr = new window.noInfoPath.noDataReadRequest(table, options);			

						return crud[operation](ndrr);
					}

	         		if(!uri) throw "uri is a required parameter for makeKendoDataSource";
	         		var _ds = datasvc[uri];

					return { 
	         			transport: {
							read: function(options){
								var deferred = _ds.noCRUD.$q.defer();
								crudOp(_ds, "read", options)
									.then(function(data){
										this.data = data;

										deferred.resolve(data);
									}.bind(this));

								return deferred.promise;
							},
							create: function(options){
								return crudOp(_ds, "create", options);
							},
							update: function(options){
								return crudOp(_ds, "update", options);
							},
							destroy: function(options){
								return crudOp(_ds, "destroy", options);
							},
							one: function(options){
								return _ds.noCRUD.one(options);
							},
							upsert: function(options){
								return _ds.noCRUD.upsert(options);
							}
						},
	         			table: _ds,
	         			data: [],
	         			expand: options.expand,
	         			projections: options.projections,
	         			aggregators: options.aggregators
	         		}				
				}

				var ds;

				if(datasvc.name == "NoInfoPath-v3"){
					ds = _noIndexedDB();
				}else{
					ds = _noHTTP();
				}
         		return ds; 
         	}
		}])
	;
})(angular);
