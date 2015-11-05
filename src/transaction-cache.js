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
		.factory("noTransactionCache", ["$injector", "$q", "noIndexedDb", "lodash", "noDataSource", function($injector, $q, noIndexedDb, _, noDataSource) {

			function NoTransaction(userId, config, thescope) {
				//var transCfg = noTransConfig;
				var scope = thescope;

				Object.defineProperties(this, {
					"__type": {
						"get": function() {
							return "NoTransaction";
						}
					}
				});

				this.transactionId = noInfoPath.createUUID();
				this.timestamp = new Date().valueOf();
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

				this.upsert = function upsert(data) {
					var THIS = this,
						deferred = $q.defer(),
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
											prov = data;
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
							}
						};

					function _recurse(entityCfg) {
						var curEntity = angular.isObject(opEntites) ? opEntites[curOpEntity] : {
								entityName: config.noDataSource.entityName
							},
							preOp = !!curEntity.type ? curEntity.type : "basic",
							dsConfig, dataSource, writableData;
						writableData = preOps[preOp](curEntity, data, scope);


						curOpEntity++;
						dsConfig = angular.merge(config.noDataSource, {
							entityName: curEntity.entityName
						});
						dataSource = noDataSource.create(dsConfig, scope);

						dataSource[opType](writableData, THIS)
							.then(function(result) {
								results[curEntity.entityName] = result;

								if (curOpEntity < totOpEntity) {
									_recurse();
								} else {
									deferred.resolve();
								}

							})
							.catch(deferred.reject);


					}

					_recurse();

					return deferred.promise;
				};

				this.destroy = function(entityName, data) {
					var entityTxCfg = noTxConfig[entityName];
					console.warn("TODO: implement  NoTransaction::destroy");
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

                function normalizeValues(data){
                    for(var c in data){
                        var col = tblSchema.columns[c];
                        if(col){
                            if(col.type === "bit"){
                                data[c] = !!data[c];
                            }
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
					return entity.noCreate(transaction.toObject());
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

					entity
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
