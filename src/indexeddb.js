//indexeddb.js
(function(angular, Dexie, undefined){
	"user strict";
	
	angular.module("noinfopath.data")

		.factory("noIndexedDB", ['$parse','$rootScope','lodash', 'noManifest', '$q', '$timeout', function($parse, $rootScope, _, noManifest, $q, $timeout){
			var SELF = this, dex;

			function _bind(tables){
				function _import(table, data, deferred, progress){
					var total = data ? data.length : 0;
						
					$timeout(function(){progress.rows.start({max: total})});
					var currentItem = 0;

					dex.transaction('rw', table, function (){
						_next();
					});	
					
					
					function _next(){
						if(currentItem < data.length){
							var datum = data[currentItem];

							table.add(datum).then(function(){
								$timeout(function(){ progress.rows.update.call(progress.rows); });
							})
							.catch(function(err){
								console.error(err);
								throw err;
							})
							.finally(function(){
								currentItem++;
								_next();								
							});	

						}else{
							deferred.resolve(table.name);
						}
					}											
				}

				_.each(tables, function(table){
					var tmp = dex[table.TableName];
					tmp.noCRUD = new noCRUD(dex, $q, $timeout, _, table, queryBuilder);
					//tmp.IndexedDB = angular.fromJson(table.IndexedDB);
					//this[table.TableName].noInfoPath = table;
					tmp.bulkLoad = function(data, progress){
						//console.info("bulkLoad: ", table.TableName)
						var deferred = $q.defer();

						this[table.TableName].clear()
							.then(function(){
								_import.call(this, this[table.TableName], data, deferred, progress);
							}.bind(this));

						return deferred.promise;
					}.bind(dex);
				});
			}			

			Dexie.prototype.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noIndexedDBReady)
					{
						console.log("IndexedDB Ready");
						deferred.resolve();
					}else{	
						$rootScope.$watch("noIndexedDBReady", function(newval){
							if(newval){
								console.log("IndexedDB Ready");
								deferred.resolve();								
							}
						});					
					}					
				});	

				return deferred.promise;			
			};

			Dexie.prototype.configure = function(dbinfo, stores){
				var deferred = $q.defer();

				dex.on('error', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.error("Uncaught error: " + err);
				    deferred.reject(err);
				});
				dex.on('blocked', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.warn("IndedexDB is currently execting a blocking operation.");
				});	

				dex.on('versionchange', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.error("IndexedDB as detected a version change");
				});

				dex.on('populate', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.warn("IndedexDB populate...  not implemented.");
				});	

				dex.on('ready', function(err) {
				    // Log to console or show en error indicator somewhere in your GUI...
				    console.info("IndedexDB is ready");
					_bind(noManifest.current.indexedDB);	
					$rootScope.noIndexedDBReady = true;
				    deferred.resolve();
				});	

				if(dbinfo.name !== dex.name) throw "DB Name is invalid.";

				if(!dex.isOpen()){
					dex.version(dbinfo.version).stores(stores);
					dex.open();
				}

				return deferred.promise;
			}.bind(dex);

			Dexie.prototype.createTransport = function(tableName){
				if(angular.isObject(tableName)){
					return new noCrud(tableName);
				}else{
					return new noCRUD(noManifest.current.indexedDB[tableName]);
				}
			}

			function queryBuilder(table, options){


				var operators = {
						"eq": function(a, b){
							return a === b;
						}
					}, _total = 0, 
					filters = options.data.filter;

				function _filter(table, filter){


					function _indexFilter(fields, values, operators){
						

						var w = fields.length === 1 ? fields.join("+") : "[" + fields.join("+") + "]",
							v = values.length === 1 ? values[0] : values,
							o = operators.join(""),
							collection;

						if(w === "[]"){
							w = table.schema.primKey.keyPath;
						}

						if(Number.isNaN(v)){
							collection = table.toCollection();
						}else{
							if(v === undefined){
								v = "";
							}

							switch(o){
								case "startswith":
				 					collection = table.where(w).startsWithIgnoreCase(v);					
									break;

								default:
				 					collection = table.where(w).equals(v);					
									break;
							}
						}

						return collection;
					}

					function _jsFilter(filter){
						var collection = table.filter(function(obj){
							//console.log("_jsFilter", value[this.field], this.field, value[this.field].indexOf(this.value));
							var result = false;
									
							for(var fi in filter.filters){
								var fltr = filter.filters[fi],
									tmp = obj[fltr.field],
									val = tmp ? tmp : null;

								val = angular.isString(val) ? val.toLowerCase() : val;

								switch(fltr.operator.toLowerCase()){
									case "neq":
										result = (val !== fltr.value);
										break;
									case "eq":
										result = (val === fltr.value);
										break;
									case "contains":
										result = val.indexOf(fltr.value) > -1;
										break;
									case "startswith":
										result = val.indexOf(fltr.value) === 0;
										break;
								}

								if(!result){
									break;
								}
							}

							return result;
						});

						return collection;
					}

					var deferred = table.noCRUD.$q.defer(),
						fields,
						values,
						logic,
						types;

					table.noCRUD.$timeout(function(){

						if(filter)
						{
							//console.log("filter", filter);
							
							fields = table.noCRUD._.pluck(filter.filters, "field");
							values = table.noCRUD._.pluck(filter.filters, "value");
							types = table.noCRUD._.pluck(filter.filters, "type");
							operators = table.noCRUD._.pluck(filter.filters, "operator");
							logic = filter.logic;

							//If any of the filters are type filtered then all
							//must be treated that way.
							if(types && table.noCRUD._.contains(types, "filtered")){
								deferred.resolve(_jsFilter(filter));
							}else{
								//Performing simple primary key lookup
								deferred.resolve(_indexFilter(fields, values, operators));
							}				

						}else{
							deferred.resolve(table.toCollection());
						}
					});


					return deferred.promise;
				}

				function _count(collection){
					var deferred = table.noCRUD.$q.defer();

					collection.count()
						.then(function(total){
							_total = total;
							deferred.resolve(collection);
						})
						.catch(function(err){
							deferred.reject(err);
						});

					return deferred.promise;
				}

				function _sort(collection, sort){	
					var deferred = table.noCRUD.$q.defer(),
						arry = [];

					table.noCRUD.$timeout(function(){
						if(sort && sort.length > 0){
							if(sort[0].dir === "desc")
							{
								collection.reverse();
							}

							collection.sortBy(sort[0].field)
								.then(function(array){
									console.warn("TODO: Implement multi-column sorting.");
									deferred.resolve(array);
								})
								.catch(function(err){
									console.error(err);
									deferred.reject(err);
								})
						}else{
							collection.toArray()
								.then(function(array){
									deferred.resolve(array);
								})
								.catch(function(err){
									console.error(err);
									deferred.reject(err);
								});
						}
					});

					return deferred.promise;
				}

				function _page(array, skip, take){
					var deferred = table.noCRUD.$q.defer();

					table.noCRUD.$timeout(function(){
						if(take){	

							deferred.resolve(array.slice(skip, skip+take));
						}else{
							deferred.resolve(array);
						}
					})

					return deferred.promise;
				}

				function _expand(array) {
					var promises = [],
						refData = {};

					for(var i in options.expand){
						var expand = options.expand[i],
							table = dex[expand.tableName],
							_ = table.noCRUD._,
							target = {},
							keys;

						target[i] = null;
						keys = _.pluck(_.reject(array, target), i);

						if(!keys || keys.length === 0) {
							continue;
						}

						promises.push($q(function(resolve, reject){
							table.where(expand.foreignKey).anyOf(keys).toArray()
							.then(function(array){
								var THAT = this,
									hash = {};

								angular.forEach(array, function(item){
									hash[item[THAT.options.foreignKey]] = item;
								});

								//refData[THAT.primaryKey] = hash;


								resolve({primaryKey: THAT.primaryKey, hash: hash});
							}.bind({primaryKey: i, options: expand, data:array}))
							.catch(function(err){
								console.error(err);
								reject(err);
							});
						}));
					}


					return $q.all(promises)
						.then(function(data){
						
							var tmp, hash = {};
							do{
								tmp = data.pop();
								if(tmp){
									hash[tmp.primaryKey] = tmp.hash;
								}
							}while(tmp);


							angular.forEach(array, function(item){
								angular.forEach(options.expand, function(expand, pk){
									var newRefItem = {};

									if(item[pk] !== null) {
										var refItem = hash[pk][item[pk]] ? hash[pk][item[pk]] : {};
											
										if(expand.fields){
											angular.forEach(expand.fields, function(field){
												newRefItem[field] = refItem[field];
											});							
										}else{
											newRefItem = refItem;
										}
									}

									if(expand.merge) {
										item = angular.extend(item, newRefItem);
									} else {
										item[expand.name] = newRefItem;							
									}

									
									//console.log(field, refItem, newRefItem)
								});
							});

						return array;
						
					});
				}

				function _expandOne(array, expand) {
					var table = dex[expand.tableName],
						_ = table.noCRUD._,
						keys = _.pluck(array, expand.foreignKey);
					
					return $q(function(resolve, reject){
						table.where(expand.foreignKey).anyOf(keys).toArray()
							.then(function(array){
								var hash = {};

								angular.forEach(array, function(item){
									hash[item[this.options.foreignKey]] = item;
								}, this);

								resolve({primaryKey: this.primaryKey, hash: hash});
							}.bind({primaryKey: expand.foreignKey, options: expand, data:array}))
							.catch(function(err){
								console.error(err);
								reject(err);
							});
						});
				}

				function _projection(rootArray, projections){
					var _results = {}, curRootItem;

					function _waitForProjection(array, projectee){
						var deferred = $q.defer();

			 			_projectOne(array, projectee)
							.then(function(data){
								_results[data.projectee.name] = data;

								if(projectee.projections){
									_project(data.projected, projectee.projections)
										.then(function(){
											deferred.resolve();
										});
								}else{
									deferred.resolve();
								}

							})
							.catch(function(err){
								console.error(err);
								deferred.reject(err);
							});
						
						return deferred.promise;
					}

					function _projectOne(array, projectee){
						var deferred = $q.defer(),
							table = dex[projectee.tableName],
							_ = table.noCRUD._,
							keys = _.pluck(array, projectee.foreignKey);
						
						return table.where(projectee.foreignKey).anyOf(keys).toArray()
							.then(function(projected){
								var hash = {};

								//hash the projected on primaryKey
								angular.forEach(projected, function(item){
									if(!hash[item[this.options.primaryKey]]){
										hash[item[this.options.primaryKey]] = [];
									}
									hash[item[this.options.primaryKey]].push(item);
								}, this);

								angular.forEach(array, function(item){
									var key = item[this.primaryKey],
										projectedItems = hash[key] || [];


									item["_" + this.options.name] = projectedItems;
						
								}, this);

								return {projectee: projectee, hashed: hash, projected: projected};
								
							}.bind({primaryKey: projectee.primaryKey, options: projectee, data:array}))
							.catch(function(err){
								console.error(err);
								deferred.reject(err);
							});
					}

					function _project(array, projections){
						var promises = [];

						angular.forEach(projections, function(projection){
							promises.push(_waitForProjection(array, projection)
								.then(function(data){
									return data;
								}));
						});

						return $q.all(promises)
							.then(function(data){
								return data;
							});
					}	


					return _project(rootArray, projections)
						.then(function(){
			
							// angular.forEach(rootArray, function(cooperator){
							// 	var fieldSites = _aggregate(cooperator.fieldSites, {operation: "count"}),
							// 		trials = 0,
							// 		trialPlots = 0,
							// 		observations = 0;

							// 	angular.forEach(cooperator.fieldSites, function(fieldSite){
							// 		trials +=  _aggregate(fieldSite.trials, {operation: "count"});

							// 		angular.forEach(fieldSite.trials, function(trial){
							// 			trialPlots +=  _aggregate(trial.trialPlots, {operation: "count"});

							// 			angular.forEach(trial.trialPlots, function(trialPlot){
							// 				observations +=  _aggregate(trialPlot.observations, {operation: "count"});
							// 			});
							// 		});
							// 	});

							// 	cooperator.FieldSites = fieldSites;
							// 	cooperator.Trials = trials;
							// 	cooperator.TrialPlots = trialPlots;
							// 	cooperator.Observations = observations;
							// });

							return _results;
						});
				}

				function _aggregator(rootArray, aggregate){
					var currentRootItem;

					function _aggregate(array, aggregation){
						var operations = {
							"count": function(array){
								return array ? array.length : 0;
							}
						}

						return operations[aggregation.operation](array);
					}

					function _recurseAggregations(item, aggregations){
						angular.forEach(aggregations, function(aggregation){
							var items = item[aggregation.path],
								val = _aggregate(items, aggregation);

							if(!currentRootItem[aggregation.name]) { 
								currentRootItem[aggregation.name] = 0; 
							}

							currentRootItem[aggregation.name] += val;

							if(aggregation.aggregations){
								angular.forEach(items, function(item){
									_recurseAggregations(item, aggregation.aggregations);
								});								
							}
						});
					}

					angular.forEach(rootArray, function(item){
						currentRootItem = item;
						angular.forEach(aggregate.fields, function(field){
							currentRootItem[field] = 0;
						})
						_recurseAggregations(item, aggregate.aggregations);
					});
				}

				function _postProcessing(array, config){
					var deferred = $q.defer(),
						promises = [],
						nothingToDo = !options.expand && !options.projections;

					if(nothingToDo){
						promises.push($q(function(resolve,reject){
							resolve(array);
						}));
					}else{
						if(options.expand){
							promises.push(_expand(array, options.expand));
						}

						if(options.projections){
							//Same goes for projections
							promises.push(_projection(array, options.projections));
						}
					}


					return $q.all(promises).then(function(data){
						//console.log(data);
						if(options.aggregators){
							_aggregator(array, options.aggregators);
						}
						return array;
					});
				}

				this.query = function(){
					var deferred = $q.defer();

					_filter(table, options.data.filter)
						.then(function(collection){
							return _count(collection);
						})
						.then(function(collection){
							return _sort(collection,options.data.sort)
						})
						.then(function(array){
							return _page(array, options.data.skip, options.data.take);
						})
						.then(function(array){
							array.__no_total__ = _total;
							_postProcessing(array, options)
								.then(function(array){
									deferred.resolve(array||[]);
								})
								.catch(function(err){
									deferred.reject(err);
								});

						})
						.catch(function(err){
							deferred.reject(err);
						});

					return deferred.promise;
				}	 					
			};

			function noCRUD(dex, $q, $timeout, lodash, noTable, querySvc) {
				if(!noTable) throw "noTable is a required parameter";
				
				this.$q = $q;
				this.$timeout = $timeout;
				this._ = lodash;
				this.dex = dex;
				this.type = "kendo";
				this.tableName = noTable.TableName;
				this.noTable = noTable;
				this.noTable.IndexedDB = angular.fromJson(this.noTable.IndexedDB);
				this.querySvc = querySvc;

				this.__proto__.create = function(options) {
					var deferred = this.$q.defer();

					if(!options) throw "noCRUD::update requires options parameter";
					
				
					var tbl = this.dex[this.tableName],
						THAT = this;

					this.dex.transaction("rw", tbl, function(){
						//tbl.add(options.data);

						// if(THAT.noTable.IndexedDB.pk){
						// 	tbl.orderBy(THAT.noTable.IndexedDB.pk).last()
						// 		.then(function(lastOne){
						// 			//This is a temporary hack.  Will be moving to
						// 			//using UUID's soon.
						// 			var newKey =  Number(lastOne[THAT.noTable.IndexedDB.pk]) + 1;
						// 			options.data[THAT.noTable.IndexedDB.pk] = newKey;
						// 			tbl.add(options.data);
						// 		});								
						// }else{
							tbl.add(options.data);
						// }
					})
					.then(function(resp){
						deferred.resolve(options.data);
					})
					.catch(function(err){
						deferred.reject(err);
					})
						
					return deferred.promise;				
				};

				this.__proto__.read = function(options) {
					var deferred = this.$q.defer(),
						tbl = this.dex[this.tableName],
						THAT = this;


					this.dex.transaction("r", tbl, function(){
						if(options){
							var q = new THAT.querySvc(tbl, options,THAT.$timeout, THAT.$q, THAT.dex, THAT._);

								q.query()
									.then(deferred.resolve)
									.catch(deferred.reject);
						}else{
							tbl.toArray()
								.then(deferred.resolve)
								.catch(deferred.reject);
						}
					})
					.then(function(resp){
						//console.log("Transaction complete. ", resp || "");

						if(resp) deferred.resolve(resp);
					})
					.catch(function(err){
						console.error(err);
						deferred.reject(err);
					})	

					return deferred.promise;						
				};

				this.__proto__.one = function(options){
					var deferred = this.$q.defer(), SELF = this;

					this.$timeout(function(){
						SELF.read(options)
							.then(function(data){
								if(data.length > 0){
									deferred.resolve(data[0]);
								}else{
									deferred.reject("Item not found.")
								}
							})
							.catch(function(err){
								deferred.reject(err);
							});				
					});


					return deferred.promise;
				};

				this.__proto__.update = function(options) {
					var deferred = this.$q.defer();

					if(!options) throw "noCRUD::update requires options parameter";
					
					var tbl = this.dex[this.tableName],
						key = options.data[this.noTable.IndexedDB.pk];

					this.dex.transaction("rw", tbl, function(){
						tbl.update(key, options.data)
							.then(function(resp){
								if(resp === 1)
								{
									deferred.resolve(options.data);
								}else{
									deferred.reject("Record not updated.");
								}									
							});
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
					})
					.catch(function(err){
						console.error(err);
						deferred.reject(err);
					})
					

					return deferred.promise;						
				};

				this.__proto__.destroy = function(options) {
					var deferred = this.$q.defer(),
						tbl = this.dex[this.tableName],
						key = options.data[this.noTable.IndexedDB.pk];

					this.dex.transaction("rw", tbl, function(){
						tbl.delete(key)
							.then(deferred.resolve)
							.catch(deferred.reject);
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
					})
					.catch(function(err){
						console.error(err);
						deferred.reject(err);
					})

					return deferred.promise;		
				};

				this.__proto__.upsert = function(options){
					if(!options) throw "noCRUD::update requires options parameter";
					
					var tbl = this.dex[this.tableName],
						key = options.data[this.noTable.IndexedDB.pk];

					if(key){
						return this.update(options);
					}else{
						return this.create(options);
					}
				}
			}

			return 	dex = new Dexie("NoInfoPath-v3");
		}])

		.service("noBulkData", ['$q', '$timeout','noConfig', 'noUrl', 'noIndexedDB', function($q, $timeout, noConfig, noUrl, noIndexedDB){
				var _tasks = [], _datasvc;

				function _queue(manifest){
					//var urls = noUrl.makeResourceUrls(noConfig.current.RESTURI, manifest);

					for(var k in manifest){
						var task = manifest[k];
						task.url = task.TableName;
						_tasks.push(task);
					}
				}

				function _recurse(deferred, progress) {
					var task = _tasks.shift(), table;

					if(task){
						$timeout(function(){
							progress.tables.update("Downloading " + task.TableName);
							progress.tables.changeCss("progress-bar-success progress-bar-striped active");							
						})
						console.info("Downloading " + task.TableName);

						table = noIndexedDB[task.TableName];

						if(table)
						{
							_datasvc.read(task.url)
								.then(function(data){
									if(data){
										console.info("\t" + data.length + " " + task.TableName + " downloaded.")
										$timeout(function(){
											progress.tables.changeMessage("Importing " + data.length + " items from " + task.TableName, false);
											progress.tables.changeCss("progress-bar-info progress-bar-striped active");
										});
										console.info("\tImporting " + data.length + " items from " + task.TableName);
										noIndexedDB[task.TableName].bulkLoad(data, progress)
											.then(function(info){
												//deferred.notify(info);
												console.info("\t" + info + " import completed.");									
												_recurse(deferred, progress);
											})
											.catch(function(err){
												console.error(err);
												_recurse(deferred, progress);
											})
											.finally(angular.noop, function(info){
												console.info(info);
											});								
									}else{
										console.info("\tError downloading " + task.TableName);
										$timeout(function(){
											progress.rows.start({min: 1, max: 1, showProgress: false})
											progress.rows.update("Error downloading " + task.TableName);
											progress.rows.changeCss("progress-bar-warning");
										});
										_recurse(deferred, progress);
									}
							})
							.catch(function(err){
								$timeout(function(){
									progress.rows.start({min: 1, max: 1, showProgress: false})
									progress.rows.update("Error downloading " + task.TableName);
									progress.rows.changeCss("progress-bar-warning");												
								})
								_recurse(deferred, progress);

							});
						}
						
					}else{
						deferred.resolve();  //Nothing left to do
					}
				}

				this.load = function(noManifest, datasvc, progress){
					var deferred = $q.defer();

					_datasvc = datasvc;
					_queue(noManifest);
					_recurse(deferred, progress);

					return deferred.promise;
				}.bind(this);
		}])
		;
})(angular, Dexie);
