//transaction.js
/*  ## noTransactionCache service
 *
 *
 *
 *  #### noConfig notation example.
 *
 *   ```json
 *    "noTransaction": {
 *        "create": {
 *            [
 *               {
 *                    "entityName": "Observations",
 *                    "identityInsert": "lazy",
 *                    "identityType": "guid",
 *                    "order": 1
 *                }
 *            ]
 *        },
 *        "update": {
 *            [
 *               {
 *                    "entityName": "Observations",
 *                    "order": 1
 *                }
 *            ]
 *        },
 *        "destroy": {
 *            [
 *               {
 *                    "entityName": "Observations",
 *                    "order": 1
 *                }
 *            ]
 *        }
 *    }
 *   ```
 *   Each top-level property represents a crud operation that must
 *   be handled in a specific manner in order to ensure consistency.
 *   Within each operation is a list of NoTables that are part of the
 *   transaction.
 *
 *   For each table in the operation are instructions as to which entity are
 *   involved, how to carry out the transaction, and in what order.
 *
 */
(function(angular, undefined) {
	"use strict";

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$injector", "$q", "$rootScope", "noIndexedDb", "lodash", "noDataSource", "noDbSchema", function($injector, $q, $rootScope, noIndexedDb, _, noDataSource, noDbSchema) {

			function NoTransaction(userId, config, thescope) {
				//var transCfg = noTransConfig;
				var SELF = this,
					scope = thescope,
					schema = noDbSchema.getSchema(config.noDataSource.databaseName);

				Object.defineProperties(this, {
					"__type": {
						"get": function() {
							return "NoTransaction";
						}
					}
				});

				this.transactionId = noInfoPath.createUUID();
				this.timestamp = new Date()
					.valueOf();
				this.userId = userId;
				this.changes = new NoChanges();
				this.state = "pending";

				this.addChange = function(tableName, data, changeType) {
					var tableCfg = scope["noDbSchema_" + config.noDataSource.databaseName];
					this.changes.add(tableName, data, changeType, tableCfg);
				};

				this.toObject = function() {
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
							noTransactions[t] = [{
								entityName: en,
								omit_fields: keysd
							}];
						}
					}

					console.log(noTransactions);
				}

				normalizeTransactions(config, schema);

				this.upsert = function upsert(data) {
					data = data ? data : {};

					return $q(function(resolve, reject) {
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
								"basic": function(curEntity, data, scope) {
									var writableData = curEntity.omit_fields ? _.omit(data, curEntity.omit_fields) : data;

									if (curEntity.fields) {
										for (var f in curEntity.fields) {
											var fld = curEntity.fields[f],
												prov;

											//When field value is get remote values then store on
											//the writableData object.
											if (angular.isObject(fld.value)) {
												if (fld.value.provider === "scope") {
													prov = scope;
												} else {
													prov = $injector.get(fld.value.provider);
												}
												writableData[fld.field] = noInfoPath.getItem(prov, fld.value.property);
											}

											//When field has a type convert before saving.
											//NOTE: This is temporary and should be refactored
											//      into the actual provider.  And be data
											//      driven not conditional.
											if (fld.type === "date") {
												writableData[fld.field] = noInfoPath.toDbDate(writableData[fld.field]);
											}
										}
									}

									return writableData;

								},
								"joiner": function(curEntity, data, scope) {
									var writableData = {};

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

									return writableData;
								},
								"joiner-many": function(curEntity, data, scope) {
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

						/*
						 * Drop each record one at a time so that the operations
						 * are recorded in the current transaction.
						 */
						function dropAllRelatedToParentKey(ds, curEntity, data) {
							return $q(function(resolve, reject) {
								var d = 0;

								function recurse() {
									var datum = data[d++],
										filter = {
											logic: "and",
											filters: []
										};

									if (datum) {
										for (var p in datum) {
											var v = datum[p];

											filter.filters.push({
												field: p,
												operator: "eq",
												value: v
											});
										}

										ds.destroy(null, SELF, filter)
											.then(function(r) {
												console.log(r);
												recurse();
											})
											.catch(function(err) {
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
							return $q(function(resolve, reject) {
								var d = 0;

								function recurse() {
									var datum = data[d++];

									if (datum) {
										ds.create(datum, SELF)
											.then(function(r) {
												console.log(r);
												recurse();
											})
											.catch(function(err) {
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
                        function executeDataOperation(dataSource, curEntity, opType, writableData){
                            return dataSource[opType](writableData, SELF)
                                .then(function(data) {
                                    //get row from base data source

                                    //TODO: see where and when this is used.
                                    if (curEntity.cacheOnScope) {
                                        scope[curEntity.entityName] = data;
                                    }

                                    /*
                                    *   #### @property scopeKey
                                    *
                                    *   Use this property allow NoTransaction to store a reference
                                    *   to the entity upon which this data operation was performed.
                                    *   This is useful when you have tables that rely on a one to one
                                    *   relationship.
                                    *
                                    *   It is best practice use this property when ever possible,
                                    *   but it not a required configuration property.
                                    *
                                    */
                                    if(curEntity.scopeKey){
                                        scope[curEntity.scopeKey] = data;
                                    }

                                    results[config.noDataSource.entityName] = data;

                                    _recurse();

                                })
                                .catch(reject);
                        }

						function _recurse() {

							var curEntity = opEntites[curOpEntity],
                                primaryKey,
                                opType,
								preOp, dsConfig, dataSource, writableData, exec;

                            //Check to see if we have run out of entities to recurse.
							if (!curEntity || curOpEntity >= opEntites.length) {
								resolve(results);
								return;
							}

                            //Increment counter for next recursion.
							curOpEntity++;

                            //Resolve primary key
                            primaryKey = curEntity.primaryKey ? curEntity.primaryKey : dsCfg.primaryKey;

                            //Create or Update the curEntity.
                            opType = data[primaryKey] ? "update" : "create";

                            //check entity type, if none found use `basic`
							preOp = !!curEntity.type ? curEntity.type : "basic";

                            //create the datasource config used to create datasource.
							dsConfig = angular.merge({}, config.noDataSource, {
								entityName: curEntity.entityName
							});

                            //create the noDataSource object.
							dataSource = noDataSource.create(dsConfig, scope);

                            //resolve writeable data, execution function.
							switch (preOp) {
								case "joiner-many":
									/*
									 *  ### joiner-many
									 *
									 *  `joiner-many` assumes that it represents a multiple choice question.
									 *  In order to keep the algorithm simple we drop all joiner items
									 *  that match the parent key. (i.e. SelectionID)
									 */
									writableData = preOps[preOp](curEntity, data, scope);

									exec = function() {
                                        return dropAllRelatedToParentKey(dataSource, curEntity, writableData.drop)
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

                            exec(dataSource, curEntity, opType, writableData);
						}

						_recurse();
					});
				};

				this.destroy = function(data) {
					data = data ? data : {};

					return $q(function(resolve, reject) {
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

							dataSource[opType](writableData, SELF)
								.then(function(data) {
									results[config.noDataSource.entityName] = writableData;
									_recurse();

								})
								.catch(reject);
						}

						_recurse();
					});
				};
			}

			function NoChanges() {
				Object.defineProperties(this, {
					"__type": {
						"get": function() {
							return "NoChanges";
						}
					}
				});
				var arr = [];
				noInfoPath.setPrototypeOf(this, arr);
				this.add = function(tableName, data, changeType, tableCfg) {
					this.unshift(new NoChange(tableName, data, changeType, tableCfg));
				};
			}

			function NoChange(tableName, data, changeType, tableCfg) {
				var tblSchema = tableCfg.tables[tableName];

				function normalizeValues(data) {
					var converters = {
						"bit": function(d) {
							return !!d;
						},
						"decimal": function(d) {
							var r = d;
							if (r) {
								r = String(r);
							}

							return r;
						},
						"undefined": function(d) {
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
						"get": function() {
							return "NoChange";
						}
					}
				});

				this.tableName = tableName;
				this.data = normalizeValues(data);
				this.changeType = changeType;
			}

			function NoTransactionCache() {


				this.beginTransaction = function(userId, noTransConfig, scope) {
					return new NoTransaction(userId, noTransConfig, scope);
				};

				this.endTransaction = function(transaction) {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;
					return entity.noCreate(transaction.toObject())
						.then(function() {
							$rootScope.$broadcast("noTransactionCache::localDataUpdated");
						});
				};

				this.getAllPending = function() {
					return $q(function(resolve, reject) {
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

				this.markTransactionSynced = function(t) {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					t.state = "synced";

					return entity.noUpdate(t);

				};

				this.dropAllSynced = function() {
					var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
						entity = db.NoInfoPath_Changes;

					return entity
						.where("state")
						.equals("synced")
						.toArray()
						.then(function(data) {
							for (var d in data) {
								var datum = data[d];

								entity.noDestroy(datum);
							}
						})
						.catch(function(err) {
							console.error(err);
						});
				};

			}

			// // These classes are exposed for testing purposes
			// noInfoPath.data.NoTransaction = NoTransaction;
			// noInfoPath.data.NoChanges = NoChanges;
			// noInfoPath.data.NoChange = NoChange;
			// noInfoPath.data.NoTransactionCache = NoTransactionCache;

			return new NoTransactionCache($q, noIndexedDb);
		}]);
})(angular);
