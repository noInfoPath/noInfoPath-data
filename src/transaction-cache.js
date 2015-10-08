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
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$q","noIndexedDb", "lodash", "noDataSource", function($q, noIndexedDb, _, noDataSource){

			function NoTransaction(userId, noTransConfig){
				var transCfg = noTransConfig;

				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoTransaction";
						}
					}
				});

				this.transactionId = noInfoPath.createUUID();
				this.timestamp = new Date().valueOf();
				this.userId = userId;
				this.changes = new NoChanges();

				this.addChange = function(tableName, data, changeType){
					this.changes.add(tableName, data, changeType);
				};

				this.toObject = function(){
					var json = angular.fromJson(angular.toJson(this));
					json.changes = _.toArray(json.changes);

					return json;
				};

                this.upsert = function upsert(entityName, scope){
                    var THIS = this,
                        deferred = $q.defer(),
                        entityCfg = transCfg.entities[entityName],
                        data = scope[entityCfg.source.property],
                        opType = data[entityCfg.source.primaryKey] ? "update" : "create",
                        opEntites = entityCfg.operations[opType],
                        curOpEntity = 0;

                    function _recurse(entityCfg){
                        var curEntity = opEntites[curOpEntity++],
                            dsConfig, dataSource;

                        if(curEntity){
                            dsConfig = angular.merge({entityName: curEntity.entityName}, transCfg.noDataSource);
                            dataSource = noDataSource.create(dsConfig, scope);

                            dataSource[opType](data, THIS)
                                .then(function(){
                                    _recurse(entityCfg);
                                })
                                .catch(deferred.reject);

                        }else{
                            deferred.resolve();
                        }
                    }

                    _recurse(entityCfg);

                    return deferred.promise;
                };

                this.destroy = function(entityName, data){
                    var entityTxCfg = noTxConfig[entityName];

                };
			}

			function NoChanges(){
				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoChanges";
						}
					}
				});
				var arr = [];
				noInfoPath.setPrototypeOf(this, arr);
				this.add = function(tableName, data, changeType){
					this.unshift(new NoChange(tableName, data, changeType));
				};
			}

			function NoChange(tableName, data, changeType){
				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoChange";
						}
					}
				});

				this.tableName = tableName;
				this.data = data;
				this.changeType = changeType;
			}

			function NoTransactionCache(){
				var db = noIndexedDb.getDatabase("NoInfoPath_dtc_v1"),
                    entity = db.NoInfoPath_Changes;


                this.beginTransaction = function(userId, noTransConfig){
                    return new NoTransaction(userId, noTransConfig);
                };

				this.endTransaction = function(transaction){
					return entity.noCreate(transaction.toObject());
				};

			}

			// // These classes are exposed for testing purposes
			// noInfoPath.data.NoTransaction = NoTransaction;
			// noInfoPath.data.NoChanges = NoChanges;
			// noInfoPath.data.NoChange = NoChange;
			// noInfoPath.data.NoTransactionCache = NoTransactionCache;

			return new NoTransactionCache($q, noIndexedDb);
		}])
		;
})(angular);
