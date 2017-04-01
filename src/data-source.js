//data-source.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.53*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	## noDataSource Service
 *
 *	Provides a generic service that exposes the NoInfoPath data providers'
 *	underlying CRUD interface.
 *
 *	```json
 *
 *	"noDataSource": {
 *        "dataProvider": "noWebSQL",
 *        "databaseName": "FCFNv2",
 *        "entityName": "LU_PercentColor",
 *        "primaryKey": "PercentColorID",
 *        "queryParser": "noQueryParser",
 *        "sort":  [{"field": "Percentage", "dir": "asc"}],
 *        "aggregation": {
 *             "actions": [
 *					{
 *						"provider": "aCustomProvider",
 *						"method": "aMethod",
 *						"params": [
 *
 *						],
 *						"noContextParams": true
 *					}
 *             ]
 *        }
 *    }
 *
 *	```
 */
(function (angular, undefined) {

	function NoDataSource($injector, $q, $timeout, noConfig, noDynamicFilters, dsConfig, scope, noCalculatedFields, noFileSystem, watch) {
		var provider = $injector.get(dsConfig.dataProvider),
			db = provider.getDatabase(dsConfig.databaseName),
			noReadOptions = new noInfoPath.data.NoReadOptions(dsConfig.noReadOptions),
			entity = db[dsConfig.entityName],
			qp = $injector.get("noQueryParser"),
			isNoView = entity.constructor.name === "NoView",
			_scope = scope,
			noFileCache = noFileSystem.getDatabase(entity.noInfoPath).NoFileCache;

		function _makeRemoteFileUrl(resource) {
			return noConfig.current.FILECACHEURL + "/" + resource;
		}

		Object.defineProperties(this, {
			"entity": {
				"get": function () {
					return entity;
				}
			}
		});

		// var tmpFilters = noDynamicFilters.configure(dsCfg, scope, watch);
		// ds.filter = tmpFilters ? {
		// 	filters: tmpFilters
		// } : undefined;
		//
		this.create = function (data, noTrans) {
			if(isNoView) throw "create operation not supported on entities of type NoView";

			return entity.noCreate(data, noTrans);

		};

		this.createDocument = function (data, file, trans) {
			return this.create(data,trans)
				.then(function(fileObj) {
					file.DocumentID = fileObj[entity.noInfoPath.primaryKey];
					return noFileCache.noCreate(file);
				});
		};

		this.deleteDocument = function (doc, trans, deleteFile) {
			var promise;

			if (angular.isObject(doc) && deleteFile && doc.ID) {
				promise = this.destroy(doc, trans);
			} else if (angular.isObject(doc) && !deleteFile) {
				promise = this.destroy(doc);
			} else {
				promise = $q.when(true);
			}

			return promise;
		};

		this.readDocument = function(fileObj) {
			var promise;

			if (angular.isObject(fileObj) && fileObj.ID) {
				promise = noFileCache.noOne(fileObj);
			} else {
				promise = $q.when(true);
			}

			return promise;
		}

		this.read = function (options, follow) {
			function requestData(scope, config, entity, queryParser, resolve, reject) {
				var params = angular.merge({}, options);

				params.filter = noDynamicFilters.configure(config, scope, watch);

				if(config.sort) {
					params.sort = config.sort;
				}

				if(config.take) {
					params.take = config.take;
					params.skip = config.skip;
				}

				var x = queryParser.parse(params) || [];
				if(!angular.isUndefined(follow)) {
					noReadOptions.followForeignKeys = follow;
				}


				x.push(noReadOptions);

				return entity.noRead.apply(entity, x)
					.then(function (data) {
						data = noCalculatedFields.calculate(config, data);
						//If there is an ActionQueue then execute it.
						if(config.aggregation && config.aggregation.actions) {
							var execQueue = noActionQueue.createQueue(data, scope, {}, config.aggregation.action);

							noActionQueue.synchronize(execQueue)
								.then(function(results){
									resolve(results);
								});
						}else{
							resolve(data);
						}

					})
					.catch(function (err) {
						reject(err);
					});

			}

			return $q(function (resolve, reject) {
				var waitFor, filterValues;

				if(dsConfig.waitFor) {
					waitFor = _scope.$watch(dsConfig.waitFor.property, function (newval, oldval, scope) {
						if(newval) {
							requestData(scope, dsConfig, entity, qp, resolve, reject);
							waitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, entity, qp, resolve, reject);
				}
			});
		};

		this.update = function (data, noTrans) {
			if(isNoView) throw "update operation not supported on entities of type NoView";

			return entity.noUpdate(data, noTrans);
		};

		this.destroy = function (data, noTrans, filters) {
			if(isNoView) throw "destroy operation not supported on entities of type NoView";
			var p = data ? entity.noDestroy(data, noTrans, filters) : entity.noClear();
			return p.then(function(){
				if(entity.noInfoPath.NoInfoPath_FileUploadCache) {
					return noFileCache.noDestroy(data);
				} else {
					return;
				}
			});
		};

		this.one = function (id) {
			function requestData(scope, config, entity, resolve, reject) {
				var params = [], filterValues;

				if(id) {
					filterValues = {};
					filterValues[config.primaryKey] = id;
				} else if(dsConfig.lookup) {
					filterValues = $injector.get(dsConfig.lookup.source, _scope);

				} else if(dsConfig.filter) {
					filterValues = new noInfoPath.data.NoFilters(noDynamicFilters.configure(config, _scope));
				}

				if(entity.constructor.name === "NoView") {
					params[0] = filterValues;
					params[1] = config.primaryKey;
				} else {
					params[0] = filterValues;
					params[1] = noReadOptions;
				}

				return entity.noOne.apply(entity, params)
					.then(function (data) {
						resolve(data);
					})
					.catch(function (err) {
						reject(err);
					});
			}

			return $q(function (resolve, reject) {
				var endWaitFor;
				/*
				 *	@property noDataSource.waitFor
				 *
				 *	Use this property when you want the data source wait for some other
				 *	NoInfoPath component to update the `scope`.
				 */
				if(dsConfig.waitFor) {
					endWaitFor = _scope.$watch(dsConfig.waitFor.property, function (newval, oldval, scope) {
						if(newval) {
							requestData(scope, dsConfig, entity, resolve, reject);
							endWaitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, entity, resolve, reject);
				}

			});

		};

		this.bulkLoad = function (data) {
			var THIS = this,
				deferred = $q.defer(),
				table = entity;

			function _downloadFile(fileObj) {
				return $q(function(resolve, reject){
					if(table.noInfoPath.NoInfoPath_FileUploadCache) {
						if(fileObj && fileObj.name && fileObj.type) {
							//var x = 
								// .then(resolve)
								// .catch(reject);

							// $timeout(function(){
								noFileCache.downloadFile(_makeRemoteFileUrl(fileObj.name), fileObj.type, fileObj.name).then(resolve).catch(reject);
							// }, 100);
						} else {
							reject(new Error("Invalid document object.  Missing file name and or type properties"));
						}
					} else {
						resolve();
					}
				});
			}

			function _saveParent(fileObj, file) {
				if(table.noInfoPath.NoInfoPath_FileUploadCache) {
					if(file) {
						return THIS.create(fileObj);
					} else {
						return $q.when(null);	//Don't save parent
					}
				} else {
					return THIS.bulkImportOne(fileObj);
				}
			}

			function _saveFile(fileObj, file) {
				if(file) {
					file.DocumentID = fileObj[table.noInfoPath.primaryKey];
					return noFileCache.noCreate(file);
				} else {
					return $q.when(null);
				}
			}

			function _import(data) {
				var total = data ? data.length : 0,
				 	currentItem = 0;

				function _next() {
					if (currentItem < data.length) {
						var datum = data[currentItem];

						_downloadFile(datum)
							.then(_saveFile.bind(THIS, datum))
							.then(_saveParent.bind(THIS, datum))
							.then(deferred.notify)
							.catch(deferred.notify.bind(null, {"error": "error importing data.", "data": datum}))
							.finally(function () {
								currentItem++;
								_next();
							});

					} else {
						deferred.resolve(table.name);
					}
				}

				_next();
			}

			function _clearLocalFileSystem(table) {
				if(table.noInfoPath.NoInfoPath_FileUploadCache) {
					return noFileCache.noClear();
				} else {
					return $q.when();
				}
			}
			//console.info("bulkLoad: ", table.TableName)

			THIS.entity.noClear()
				.then(_clearLocalFileSystem.bind(null, table))
				.then(_import.bind(null, data))
				.catch(function (err) {
					console.error(err);
				});

			return deferred.promise;
		};

		this.bulkImportOne = function (datum) {
			return entity.bulkLoadOne(datum);
		};
	}


	angular.module("noinfopath.data")

	.service("noDataSource", ["$injector", "$q", "$timeout", "noConfig", "noDynamicFilters", "noCalculatedFields", "noFileSystem", function ($injector, $q, $timeout, noConfig, noDynamicFilters, noCalculatedFields, noFileSystem) {
		/*
		 *	#### create(dsConfigKey)
		 *
		 *	create a new instance of a NoDataSource object configured
		 *	based on the datasource configuration found in noConfig
		 *	at the given `dsConfigKey` location.
		 *
		 *	##### Parameters
		 *
		 *	|Name|Type|Description|
		 *	|----|----|-----------|
		 *	|dsConfigKey|String|The location in noConfig where the data source's configuration can be found.  Can be a complex name like the following.  `noForms.myForm1.noComponents.foo.noDataSource`|
		 *
		 *	##### Returns
		 *
		 *	An instance of a NoDataSource object.
		 *
		 */
		this.create = function (dsConfig, scope, watch) {
			return new NoDataSource($injector, $q, $timeout, noConfig, noDynamicFilters, dsConfig, scope, noCalculatedFields, noFileSystem, watch);
		};
	}])

	;


})(angular);
