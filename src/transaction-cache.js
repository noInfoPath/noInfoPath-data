(function(angular, undefined){
	"use strict";
	angular.module("noinfopath.data")
		.run(["noDataTransactionCache", "noLoginService", function(noDataTransactionCache, noLoginService){
			var user = noLoginService.user,
				version = {"name":"NoInfoPath-Changes-v1","version":1},
				store = {"NoInfoPath_Changes": "$$ChangeID"},
				tables = {
					"NoInfoPath_Changes": {
						"primaryKey": "ChangeID"
					}
				};

			noDataTransactionCache.configure(user, version, store, tables)
				.catch(function(err){
					console.error(err);
				});
		}])
		.factory("noTransactionCache", ["$q", "noDataTransactionCache", "noLoginService", "lodash", function($q, noDataTransactionCache, noLoginService, _){

			function NoTransaction(userID, transaction){
				var SELF = this;

				Object.defineProperties(this, {
					"__type": {
						"get" : function(){
							return "NoTransaction";
						}
					}
				});

				this.transactionID = noInfoPath.createUUID();
				this.timestamp = new Date().valueOf();
				this.userID = userID;
				this.changes = new NoChanges();

				this.addChange = function(tableName, data, changeType){
					this.changes.add(tableName, data, changeType);
				};

				this.toObject = function(){
					var json = angular.fromJson(angular.toJson(this));
					json.changes = _.toArray(json.changes);

					return json;
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

			function _noTransactionCache($q, noDataTransactionCache, noLoginService){
				var SELF = this;

				this.beginTransaction = function(db){

					var deferred = $q.defer();

					db.transaction(function(tx){
						var t = new NoTransaction(noLoginService.user.userId, tx);

						deferred.resolve(t);
					}, function(err){
						console.error(err);
					});

					return deferred.promise;
				};

				this.addChange = function(tableName, data, changeType){
					_transaction.addChange(tableName, data, changeType);
				};

				this.endTransaction = function(transaction){
					return noDataTransactionCache.NoInfoPath_Changes.noCreate(transaction.toObject());
				};
			}

			return new _noTransactionCache($q, noDataTransactionCache, noLoginService);

		}])
		;
})(angular);
