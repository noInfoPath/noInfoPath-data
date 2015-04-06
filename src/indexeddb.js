//indexeddb.js
(function(angular, Dexie, undefined){

	angular.module("noinfopath.indexeddb", ['ngLodash', 'noinfopath.manifest'])

		.factory("noIndexedDB", ['$rootScope','lodash', 'noManifest', '$q', '$timeout', function($rootScope, _, noManifest, $q, $timeout){
			var SELF = this, dex;

			function queryBuilder(table, options){

				var operators = {
					"eq": function(a, b){
						return a === b;
					}
				}, _total = 0;

				function _filter(table, filter){

					var deferred = $q.defer(),
						fields,
						values,
						logic;

					$timeout(function(){
						if(filter)
						{
							fields = _.pluck(filter.filters, "field");
							values = _.pluck(filter.filters, "value");
							logic = filter.logic;

							//console.log(fields, values, filter)
							console.warn("TODO: This is hard coded to only work with keys. Expand to full where clause functionality.")
							var w = fields.length === 1 ? fields.join("+") : "[" + fields.join("+") + "]",
								v = values.length === 1 ? values[0] : values,
								collection = table.where(w).equals(v);

							deferred.resolve(collection);
						}else{
							deferred.resolve(table.toCollection());
						}
					});


					return deferred.promise;
				}

				function _count(collection){
					var deferred = $q.defer();

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
					var deferred = $q.defer(),
						arry = [];

					$timeout(function(){
						if(sort.length > 0){
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
								.then(function(){
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
					var deferred = $q.defer();

					$timeout(function(){
						if(take){							
							deferred.resolve(array.slice(skip, take));
						}else{
							deferred.resolve(array);
						}
					})

					return deferred.promise;
				}

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
						options.success(array);
					})
					.catch(function(err){
						console.error(err);
						options.error(err);
					})
			};

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
					tmp.noCRUD = new noCRUD(table);
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
				    deferred.resolve();
				});	

				if(dbinfo.name !== dex.name) throw "DB Name is invalid.";

				if(!dex.isOpen()){
					dex.version(dbinfo.version).stores(stores);
					dex.open();
				}

				return deferred.promise;
			}.bind(dex);


			function noCRUD(noTable, type) {
				var SELF = this;

				this.type = type || "kendo";
				this.tableName = noTable.TableName;
				this.noTable = noTable;
				this.noTable.IndexedDB = angular.fromJson(this.noTable.IndexedDB);
				this.create = function(options) {
					console.log(options);
					if(options){
						var tbl = dex[SELF.tableName];

						dex.transaction("rw", tbl, function(){
							//tbl.add(options.data);

							if(SELF.noTable.IndexedDB.pk){
								tbl.orderBy(SELF.noTable.IndexedDB.pk).last()
									.then(function(lastOne){
										//This is a temporary hack.  Will be moving to
										//using UUID's soon.
										var newKey =  Number(lastOne[SELF.noTable.IndexedDB.pk]) + 1;
										options.data[SELF.noTable.IndexedDB.pk] = newKey;
										tbl.add(options.data);
									});								
							}else{
								tbl.add(options.data);
							}

						})
						.then(function(resp){
							console.log("Transaction complete. ", resp || "");
							options.success(options.data);
						})
						.catch(function(err){
							console.error(err);
							options.error(err);
						})
					}					
				};

				this.read = function(options) {
					//console.debug(options);

					var tbl = dex[SELF.tableName];

					dex.transaction("r", tbl, function(){
						if(options){
							queryBuilder(tbl, options);
						}else{
							options.error("options parameter cannot be null.")
						}
					})
					.then(function(resp){
						console.log("Transaction complete. ", resp || "");
					})
					.catch(function(err){
						console.error(err);
					})						
				};

				this.update = function(options) {
					console.log(options);
					if(options){
						var tbl = dex[SELF.tableName],
							key = options.data[SELF.noTable.IndexedDB.pk];

						dex.transaction("rw", tbl, function(){
							tbl.update(key, options.data)
								.then(function(resp){
									if(resp === 1)
									{
										options.success(options.data);
									}else{
										options.error("Record not updated.");
									}									
								});
						})
						.then(function(resp){
							console.log("Transaction complete. ", resp || "");
						})
						.catch(function(err){
							console.error(err);
							options.error(err);
						})
					}						
				};

				this.destroy = function(options) {
					console.log(options);
					if(options){
						var tbl = dex[SELF.tableName],
							key = options.data[SELF.noTable.IndexedDB.pk];

						dex.transaction("rw", tbl, function(){
							tbl.delete(key)
								.then(options.success)
								.catch(options.error);
						})
						.then(function(resp){
							console.log("Transaction complete. ", resp || "");
						})
						.catch(function(err){
							console.error(err);
							options.error(err);
						})
					}		
				};
			}

			Dexie.prototype.createTransport = function(tableName){
				return new noCRUD(noManifest.current.indexedDB[tableName]);
			}

			return 	dex = new Dexie("NoInfoPath-v3");
		}])

		.service("noBulkData", ['$q', '$timeout','noConfig', 'noUrl', 'noIndexedDB', function($q, $timeout, noConfig, noUrl, noIndexedDB){
				var _tasks = [], _datasvc;

				function _queue(manifest){
					var urls = noUrl.makeResourceUrls(noConfig.current.RESTURI, manifest);

					for(var k in urls){
						var task = manifest[k];
						task.url = urls[k];
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
