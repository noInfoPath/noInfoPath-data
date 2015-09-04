(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.factory("noTransactionCache", ["$q", "noDataTransactionCache", "lodash", function($q, noDataTransactionCache, _){


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


			function NoTransactionCache($q, noDataTransactionCache){
				var SELF = this;

				this.beginTransaction = function(db, userId){

					var deferred = $q.defer();

					db.transaction(function(tx){
						var t = new NoTransaction(userId, tx);

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

			// These classes are exposed for testing purposes
			noInfoPath.data.NoTransaction = NoTransaction;
			noInfoPath.data.NoChanges = NoChanges;
			noInfoPath.data.NoChange = NoChange;
			noInfoPath.data.NoTransactionCache = NoTransactionCache;

			return new NoTransactionCache($q, noDataTransactionCache);
		}])
		;
})(angular);
