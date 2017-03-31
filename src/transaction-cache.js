//transaction-cache.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.51*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	noTransactionCache service
 *	--------------------------
 *
 *   Each top-level property represents a crud operation that must
 *   be handled in a specific manner in order to ensure consistency.
 *   Within each operation is a list of NoTables that are part of the
 *   transaction.
 *
 *   For each table in the operation are instructions as to which entity are
 *   involved, how to carry out the transaction, and in what order.
 *
 */
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$injector", "$q", "$rootScope", "noIndexedDb", "lodash", "noDataSource", "noDbSchema", "noLocalStorage", "noParameterParser", "noActionQueue", function ($injector, $q, $rootScope, noIndexedDb, _, noDataSource, noDbSchema, noLocalStorage, noParameterParser, noActionQueue) {

			function NoTransaction(userId, config, thescope) {
				//var transCfg = noTransConfig;
				var SELF = this,
					scope = thescope,
					schema = noDbSchema.getSchema(config.noDataSource.databaseName);

				Object.defineProperties(this, {
					"__type": {
						"get": function () {
							return "NoTransaction";
						}
					}
				});

				this.namespace = config.noDataSource.databaseName;
				this.transactionId = noInfoPath.createUUID();
				this.timestamp = (new Date()).toJSON();
				this.userId = userId;
				this.changes = new NoChanges();
				this.state = "pending";
				this.cachedFiles = [];

				this.addChange = function (tableName, data, changeType, dbName) {
					var tableCfg = scope["noDbSchema_" + (dbName || config.noDataSource.databaseName)],
						schema = tableCfg.entity(tableName);

					this.changes.add(tableName, data, changeType, tableCfg, (dbName || config.noDataSource.databaseName));

					if(schema.NoInfoPath_FileUploadCache) this.cachedFiles.push({schema: schema, data: data, changeType: changeType});

				};

				this.toObject = function () {
					var json = angular.fromJson(angular.toJson(this));
					json.changes = _.toArray(json.changes);

					return json;
				};

				function normalizeTransactions(config, schema) {

					var noTransactions = config.noDataSource.noTransaction,
						vw = schema.entity(config.noDataSource.crudEntity),
						lu = schema.entity(config.noDataSource.entityName),
						keysv = _.keys(lu.columns),
						keyst = vw ? _.keys(vw.columns) : [],
						keysd = !config.noDataSource.crudEntity && !keyst.length ? [] : _.difference(keysv, keyst);

					keysd.push("DateCreated");
					keysd.push("CreatedBy");

					for (var t in noTransactions) {
						var transaction = noTransactions[t],
							en = config.noDataSource.crudEntity ? config.noDataSource.crudEntity : config.noDataSource.entityName;

						if (_.isBoolean(transaction)) {
							noTransactions[t] = [
								{
									entityName: en,
									scopeKey: config.scopeKey ? config.scopeKey : undefined
										//omit_fields: keysd
								}];
						}
					}

					//console.log(noTransactions);
				}

				function resolveProvider(provider, scope, data) {
					var prov;

					switch (provider) {
					case "data":
						prov = data;
						break;
					case "scope":
						prov = scope;
						break;
					default:
						prov = $injector.get(provider);
						break;
					}

					return prov;
				}

				normalizeTransactions(config, schema);

				this.upsert = function upsert(data) {
					//if(!data.current) data = new noInfoPath.data.NoDataModel(table.noInfoPath, data);
					data = noParameterParser.parse(data ? data : {});

					return $q(function (resolve, reject) {
						var
							THIS = SELF,
							dsCfg = config.noDataSource,
							opType = data[dsCfg.primaryKey] ? "update" : "create",
							opEntites = dsCfg.noTransaction[opType],
							curOpEntity = 0,
							totOpEntity = angular.isArray(opEntites) ? opEntites.length : 1,
							results = {},
							preOps = {
								"noop": angular.noop,
								"basic": function (curEntity, data, scope) {
									var writableData = {};

									if (curEntity.fields) {
										for (var f in curEntity.fields) {
											var fld = curEntity.fields[f],
												fldName, prov, val;

											//When field value is get remote values then store on
											//the writableData object.

											if (angular.isString(fld)) {
												/*
												 *	When a field is a string then the value will be the
												 *	property on the data object provider to the call
												 *	the `basic` preOp
												 */
												fldName = fld;
												val = data[fld];

											} else if (angular.isObject(fld)) {
												/*
												 *	When a field is an object then confgure as if the
												 *	value will be coming from a trusted provider like
												 *	scope, or $stateParams.
												 */
												fldName = fld.field;

												if (angular.isObject(fld.value)) {
													/*
													 *	When `scope` is the provider then the directive scope is used.
													 *	Otherwise the supplied injecable provider will be used.
													 */

													prov = resolveProvider(fld.value.provider, scope, data);

													if (prov && fld.value.method) {
														var params = [];

														for (var pi = 0; pi < fld.value.method.params.length; pi++) {
															var cfg = fld.value.method.params[pi],
																prov2 = resolveProvider(cfg.provider, scope, data);

															params.push(noInfoPath.getItem(prov2, cfg.property));
														}

														val = prov[fld.value.method.name].apply(null, params);
													} else if (prov && fld.value.property) {
														val = noInfoPath.getItem(prov, fld.value.property);
													}

												} else {
													/*
													 *	When field value is a primative type meaning not
													 *	an object. or array. Use the value as is.
													 */
													val = fld.value;
												}
											}


											//When field has a type convert before saving.
											//NOTE: This is temporary and should be refactored
											//      into the actual provider.  And be data
											//      driven not conditional.
											if (fld.type === "date") {
												val = noInfoPath.toDbDate(val);
											}

											writableData[fldName] = val;
										}

										writableData = angular.merge(data, writableData);

									} else if (curEntity.dataService) {
										var service = $injector.get(curEntity.dataService.provider),
											method = service[curEntity.dataService.method];

										writableData = method(data);

									} else {
										writableData = data;
									}

									if (curEntity.omit_fields) {
										writableData = _.omit(writableData, curEntity.omit_fields);
									}

									//console.log(writableData);

									return writableData;

								},
								"joiner": function (curEntity, data, scope) {
									var writableData = {};

									if (curEntity.fields) {
										for (var f in curEntity.fields) {
											var fld = curEntity.fields[f],
												prov, value;

											switch (fld.value.provider) {
											case "data":
												var t = {};
												t[fld.value.property] = data;
												prov = t;
												break;

											case "results":
												prov = results;
												break;

											case "scope":
												prov = scope;
												break;

											default:
												prov = $injector.get(fld.value.provider);
												break;
											}

											value = noInfoPath.getItem(prov, fld.value.property);

											writableData[fld.field] = value;
										}
									} else if (curEntity.dataService) {
										var service = $injector.get(curEntity.dataService.provider),
											method = service[curEntity.dataService.method];

										writableData = method(data);

									}
									return writableData;
								},
								"joiner-many": function (curEntity, data, scope) {
									var writableData = {
											drop: [],
											add: []
										},
										sourceDataDrop = _.pluck(scope[curEntity.source.drop.property], curEntity.source.drop.pluck),
										sourceDataAdd = scope[curEntity.source.add.property],
										createJoin = preOps.joiner;

									if (sourceDataDrop) {
										for (var dd = 0; dd < sourceDataDrop.length; dd++) {
											var sdd = sourceDataDrop[dd];
											writableData.drop.push(createJoin(curEntity, sdd, scope));
										}
									}

									if (sourceDataAdd) {
										for (var da = 0; da < sourceDataAdd.length; da++) {
											var sda = sourceDataAdd[da];
											writableData.add.push(createJoin(curEntity, sda, scope));
										}
									}

									return writableData;
								}
							};

						function getAllRelatedToParentKey(parentCfg, entity, data) {
							var filter = new noInfoPath.data.NoFilters();

							filter.quickAdd(parentCfg.primaryKey, "eq", data[parentCfg.primaryKey]);

							return entity.noRead(filter)
								.then(function (data) {
									console.log(data.paged);

									var ra = [];
									for (var d = 0; d < data.length; d++) {
										var datum = data[d];
										ra.push(datum[entity.primaryKey[0]]);
									}

									return ra;
								});
						}
						/*
						 * Drop each record one at a time so that the operations
						 * are recorded in the current transaction.
						 */
						function dropAllRelatedToParentKey(ds, curEntity, data) {
							return $q(function (resolve, reject) {
								var d = 0;

								function recurse() {
									var datum = data[d++],
										filter = new noInfoPath.data.NoFilters();

									if (datum) {

										filter.quickAdd(curEntity.primaryKey, "eq", datum);

										ds.destroy(null, SELF, filter)
											.then(function (r) {
												console.log(r);
												recurse();
											})
											.catch(function (err) {
												console.error(err);
												reject(err);
											});
									} else {
										resolve();
									}

								}

								recurse();
							});
						}
						/*
						 * Add each record one at a time to ensure that the transaction is recorded.
						 */
						function addAllRelatedToParentKey(ds, entity, data, scope) {
							return $q(function (resolve, reject) {
								var d = 0;

								function recurse() {
									var datum = data[d++];

									if (datum) {
										ds.create(datum, SELF)
											.then(function (r) {
												console.log(r);
												recurse();
											})
											.catch(function (err) {
												console.error(err);
												reject(err);
											});
									} else {
										resolve();
									}

								}

								recurse();
							});


						}
						//Perform create or update operation.
						function executeDataOperation(dataSource, curEntity, opType, writableData) {
							return dataSource[opType](writableData, curEntity.notSyncable ? undefined : SELF)
								.then(function (dataSource, data) {
									//get row from base data source

									//console.log("executeDataOperation - calling dataSource.one", dataSource.entity.noInfoPath.primaryKey, data[dataSource.entity.noInfoPath.primaryKey]);

									dataSource.one(data[dataSource.entity.noInfoPath.primaryKey])
										.then(function (scope, datum) {
											var sk = curEntity.scopeKey ? curEntity.scopeKey : curEntity.entityName,
												pure = noParameterParser.parse(datum);

											//foo = angular.copy(scope[sk]);
											results[sk] = pure;

											if (scope[sk]) {
												noParameterParser.update(datum, scope[sk]);


												if (curEntity.cacheOnScope) {
													scope[curEntity.entityName] = pure;
												}

												/*
												 *	#### @property scopeKey
												 *
												 *	Use this property allow NoTransaction to store a reference
												 *	to the entity upon which this data operation was performed.
												 *	This is useful when you have tables that rely on a one to one
												 *	relationship.
												 *
												 *	It is best practice use this property when ever possible,
												 *	but it not a required configuration property.
												 *
												 */

												//scope[sk] = foo;


											}

											//If there is an ActionQueue then execute it.
											if (curEntity.actions && curEntity.actions.post) {
												//support post operation actions for now.
												var execQueue = noActionQueue.createQueue(datum, scope, {}, curEntity.actions.post);

												noActionQueue.synchronize(execQueue)
													.then(_recurse);
											} else {
												_recurse();
											}


										}.bind(null, scope));
								}.bind(null, dataSource))
								.catch(reject);
						}

						function executeDataOperationBulk(dataSource, curEntity, opType, writableData) {
							return dataSource[opType](writableData, curEntity.notSyncable ? undefined : SELF)
								.then(function (dataSource, data) {
									return data;
								}.bind(null, dataSource))
								.catch(reject);
						}

						function _entity_standard(curEntity) {
							var primaryKey, opType, preOp, dsConfig, dataSource, writableData, exec;

							//Resolve primary key
							primaryKey = curEntity.primaryKey ? curEntity.primaryKey : dsCfg.primaryKey;

							//Create or Update the curEntity.
							opType = data[primaryKey] ? "update" : "create";

							//check entity type, if none found use `basic`
							preOp = !!curEntity.type ? curEntity.type : "basic";

							//create the datasource config used to create datasource.
							// dsConfig = angular.merge({}, config.noDataSource, {
							// 	entityName: curEntity.entityName
							// });

							dsConfig = angular.merge({}, config.noDataSource, curEntity);
							//console.log(dsConfig);

							//create the noDataSource object.
							dataSource = noDataSource.create(dsConfig, scope);

							//resolve writeable data, execution function.
							switch (preOp) {
							case "joiner-many":
								/*
								 *	### joiner-many
								 *
								 *	`joiner-many` assumes that it represents a multiple choice question.
								 *	In order to keep the algorithm simple we drop all joiner items
								 *	that match the parent key. (i.e. SelectionID)
								 */
								writableData = preOps[preOp](curEntity, data, scope);

								exec = function () {
									return getAllRelatedToParentKey(dsCfg, dataSource.entity, data)
										.then(dropAllRelatedToParentKey.bind(null, dataSource, curEntity))
										.then(addAllRelatedToParentKey.bind(null, dataSource, curEntity, writableData.add, scope))
										.then(_recurse)
										.catch(reject);
								};
								break;

							case "one-one":
								/*
								 *	### one-one
								 *
								 *	`one-one` enforces referential integrity between two table in a
								 *	transaction that share a one to one relationship.  When the child
								 *	data/table as defined in the noTransaction configuration and it's
								 *	primary key value is undefined a create is performed, otherwise
								 *	an update is performed.
								 *
								 */
								var keyData = preOps.joiner(curEntity, data, scope);

								opType = keyData[curEntity.primaryKey] ? "update" : "create";

								writableData = preOps.basic(curEntity, data, scope);

								writableData = angular.merge({}, writableData, keyData);

								exec = executeDataOperation;

								break;

							default:
								writableData = preOps[preOp](curEntity, data, scope);
								exec = executeDataOperation;
								break;
							}

							/*
							 *	@property createOnly
							 *
							 *	Use this property to `create` new related records in a transaction
							 *	member table when a matching item does not exist. So, this also
							 *	means that no `update` operations are performed on the designated
							 *	member table.
							 *
							 */
							if ((opType === "update" && !curEntity.createOnly) || opType == "create") {
								exec(dataSource, curEntity, opType, writableData);
							} else {
								_recurse();
							}
						}

						function _entity_bulk(curEntity) {
							function _resolveMethod(curEntity, sdProv, sdProp) {
								var method;

								if (angular.isFunction(sdProp)) {
									method = sdProp;
								} else if (sdProp === undefined && curEntity.bulk.sourceData.method) {
									method = sdProv[curEntity.bulk.sourceData.method].bind(sdProv);
								} else if (sdProp !== undefined && curEntity.bulk.sourceData.method) {
									method = sdProp[curEntity.bulk.sourceData.method].bind(sdProp);
								}

								return method;
							}

							//Current version requires an objectFactory when using bulk feature.
							if (!curEntity.objectFactory) throw "objectFactory property is required when using bulk upsert feature.";

							var ofProv = $injector.get(curEntity.objectFactory.provider),
								classConstructor = ofProv.get(curEntity.objectFactory.className),
								sdProv = curEntity.bulk.sourceData.provider === "scope" ? scope : $injector.get(curEntity.bulk.sourceData.provider),
								sdProp = sdProv[curEntity.bulk.sourceData.property],
								sdMeth = _resolveMethod(curEntity, sdProv, sdProp),
								data = sdMeth ? sdMeth() : sdProp,
								dataSource, primaryKey, opType, promises = [];

							primaryKey = curEntity.primaryKey ? curEntity.primaryKey : dsCfg.primaryKey;

							//Create or Update the curEntity.
							opType = data[primaryKey] ? "update" : "create";

							//create the datasource config used to create datasource.
							// dsConfig = angular.merge({}, config.noDataSource, {
							// 	entityName: curEntity.entityName
							// });

							//dsConfig = angular.merge({}, config.noDataSource, curEntity);
							//console.log(dsConfig);




							//SELF.bulkUpsert(data, classConstructor, curEntity.bulk.ignoreDirtyFlag, results)



							function _doTheUpserts(data) {
								//create the noDataSource object.
								dataSource = noDataSource.create(curEntity, scope);

								//console.log(data);


								for (var i = 0; i < data.length; i++) {
									var model = data[i];
									opType = model[primaryKey] ? "update" : "create";

									if (curEntity.bulk.ignoreDirtyFlag === true || model.dirty) {
										promises.push(executeDataOperationBulk(dataSource, curEntity, opType, new classConstructor(model, results)));
									}
								}

								$q.all(promises)
									.then(_recurse)
									.catch(reject);
							}


							if (data.then) {
								data
									.then(_doTheUpserts)
									.catch(function (e) {
										reject(e);
									});
							} else {
								_doTheUpserts(data);
							}

						}

						function _recurse() {

							var curEntity = opEntites[curOpEntity];

							//Check to see if we have run out of entities to recurse.
							if (!curEntity || curOpEntity >= opEntites.length) {
								resolve(results);
								return;
							}

							if (curEntity.bulk) {
								_entity_bulk(curEntity, results);
							} else {
								_entity_standard(curEntity);
							}

							//Increment counter for next recursion.
							curOpEntity++;
						}

						_recurse();
					});
				};

				/**
				 *	### @method bulkUpsert
				 *
				 *	Inserts or updates and array of data items. Uses a provided
				 *	constructor to create the object that will be added to the
				 *	entity. This allows for custom data conversion and business
				 *	logic to be implement at the record level, before saving.
				 *
				 */
				this.bulkUpsert = function (data, constructor, ignoreDirtyFlag, results) {

					//console.log(data);
					return $q(function (resolve, reject) {
						var promises = [];

						for (var i = 0; i < data.length; i++) {
							var model = data[i];

							if (ignoreDirtyFlag === true || model.dirty) {
								promises.push(this.upsert(new constructor(model, results)));
							}
						}

						$q.all(promises)
							.then(resolve)
							.catch(reject);

					}.bind(this));
				};

				this.destroy = function (data, filters) {
					data = data ? data : {};

					return $q(function (resolve, reject) {
						var THIS = SELF,
							dsCfg = config.noDataSource,
							opType = "destroy",
							opEntites = dsCfg.noTransaction[opType],
							curOpEntity = 0,
							totOpEntity = angular.isArray(opEntites) ? opEntites.length : 1,
							results = {};

						function _recurse() {
							var curEntity = opEntites[curOpEntity],
								preOp, dsConfig, dataSource, writableData;

							if (!curEntity || curOpEntity >= opEntites.length) {
								resolve(results);
								return;
							}

							curOpEntity++;

							dsConfig = angular.merge({}, config.noDataSource, {
								entityName: curEntity.entityName
							});

							dataSource = noDataSource.create(dsConfig, scope);

							writableData = data; //preOps[preOp](curEntity, data, scope);

							dataSource[opType](writableData, SELF, filters)
								.then(function (data) {
									results[config.noDataSource.entityName] = writableData;
									_recurse();

								})
								.catch(reject);
						}

						_recurse();
					});
				};

			}

			function NoTransactionLite(userId, namespace, thecope) {
				//var transCfg = noTransConfig;
				var SELF = this,
					scope = thescope;

				Object.defineProperties(this, {
					"__type": {
						"get": function () {
							return "NoTransactionLite";
						}
					}
				});

				this.namespace = namespace;
				this.transactionId = noInfoPath.createUUID();
				this.timestamp = (new Date()).toJSON();
				this.userId = userId;
				this.changes = new NoChanges();
				this.state = "pending";

				this.addChange = function (tableName, data, changeType) {
					var tableCfg = scope["noDbSchema_" + namespace];
					this.changes.add(tableName, data, changeType, tableCfg);
				};

				this.toObject = function () {
					var json = angular.fromJson(angular.toJson(this));
					json.changes = _.toArray(json.changes);

					return json;
				};
			}


			function NoChanges() {
				Object.defineProperties(this, {
					"__type": {
						"get": function () {
							return "NoChanges";
						}
					}
				});
				var arr = [];
				noInfoPath.setPrototypeOf(this, arr);
				this.add = function (tableName, data, changeType, tableCfg, ns) {
					var syncVer = noLocalStorage.getItem("noSync_lastSyncVersion"),
						change = new NoChange(tableName, data, changeType, tableCfg, !!syncVer ? syncVer.version : 0, ns);

					this.unshift(change);
				};
			}

			function NoChange(tableName, data, changeType, tableCfg, version, ns) {
				var tblSchema = tableCfg.tables[tableName];

				function normalizeValues(inData) {
					var data = angular.copy(inData),
						converters = {
							"bit": function (d) {
								return !!d;
							},
							"decimal": function (d) {
								var r = d;
								if (r) {
									r = String(r);
								}

								return r;
							},
							"undefined": function (d) {
								return d;
							}
						};

					for (var c in data) {
						var dt,
							col = tblSchema.columns[c];

						if (col) {
							dt = converters[col.type];

							if (!dt) {
								dt = converters["undefined"];
							}

							data[c] = dt(data[c]);
						}
					}
					return data;
				}

				Object.defineProperties(this, {
					"__type": {
						"get": function () {
							return "NoChange";
						}
					}
				});

				this.namespace = ns;
				this.tableName = tableName;
				this.data = !!tblSchema ? normalizeValues(data) : data;
				this.changeType = changeType;
				this.version = version;
			}

			function NoTransactionCache() {


				this.beginTransaction = function (userId, noTransConfig, scope) {
					if (angular.isObject(noTransConfig)) {
						return new NoTransaction(userId, noTransConfig, scope);
					} else {
						return new NoTransactionLite(userId, noTransConfig, scope);
					}
				};

				this.endTransaction = function (transaction) {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					//console.log(db);

					return entity.noCreate(transaction.toObject())
						.then(function () {
							$rootScope.$broadcast("noTransactionCache::localDataUpdated", transaction);
						});
				};

				this.getAllPending = function () {
					return $q(function (resolve, reject) {
						var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
							entity = db.NoInfoPath_Changes;

						entity
							.where("state")
							.equals("pending")
							.toArray()
							.then(resolve)
							.catch(reject);

					});
				};

				this.markTransactionSynced = function (t) {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					t.state = "synced";

					return entity.noUpdate(t);

				};

				this.dropAllSynced = function () {

					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					return entity
						.where("state")
						.equals("synced")
						.toArray()
						.then(function (data) {
							for (var d in data) {
								var datum = data[d];

								entity.noDestroy(datum);
							}
						})
						.catch(function (err) {
							console.error(err);
						});
				};

				this.logException = function (transaction) {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					return entity.noCreate(transaction);
				};

			}

			return new NoTransactionCache($q, noIndexedDb);
			}]);
})(angular);
