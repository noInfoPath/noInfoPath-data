//file-storage.js
(function() {
	"use strict";


	function NoLocalFileStorageService($q, noDataSource) {

		/**
		*	@method cache(file)
		*
		*	Saves a file to the noDataSource defined in the config object.
		*
		*	> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.
		*
		*/
		this.cache = function saveToCache(fileObj, trans) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID",
				"noTransaction": {
					"create": true,
					"update": true,
					"destroy": true
				}
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.create(fileObj, trans);
		};

		/**
		*	@method cache(file)
		*
		*	Saves a file to the noDataSource defined in the config object.
		*
		*	> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.
		*
		*/
		this.get = function loadFromCache(fileID) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID"
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.one(fileID);
		};

		/**
		*	@method removeFromCache(file)
		*
		*	Deletes a file by FileID from the NoInfoPath_FileUploadCache.
		*/
		this.removeFromCache = function(fileID, trans) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID",
				"noTransaction": {
					"create": true,
					"update": true,
					"destroy": true
				}
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.destroy(fileID, trans);
		};

		/**
		*	@method read(file)
		*
		*	Reads a file from a DOM File object and converts to a binary
		*	string compatible with the local, and upstream file systems.
		*/
		this.read = function(file, comp) {
			var deferred = $q.defer();

			var fileObj = {},
			reader = new FileReader();

			reader.onloadstart = function(e) {
				fileObj.name = file.name;
				fileObj.size = file.size;
				fileObj.type = file.type;
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};


			reader.onload = function(e) {
				fileObj.blob = e.target.result;
				deferred.resolve(fileObj);
			};

			reader.onerror = function(err) {
				deferred.reject(err);
			};

			reader.onprogress = function(e) {
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader.readAsBinaryString(file);
			//reader[comp.readMethod || "readAsArrayBuffer"](file);
			//reader.readAsArrayBuffer(file);

			return deferred.promise;
		};

	}

	function NoFileStorageCRUDProvider($timeout, $q, $rootScope, noLocalFileStorage) {
		var THIS = this;

		function _recordTransaction(resolve, tableName, operation, trans, rawData, result1, result2) {
			//console.log(arguments);

			var transData = result2 && result2.rows && result2.rows.length ? result2 : angular.isObject(result1) ? result1 : rawData;

			if (trans) trans.addChange(tableName, transData, operation, "NoInfoPath_dtc_v1_files");

			resolve(transData);
		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		this.whenReady = function(config) {
			return $q(function(resolve, reject) {
				var dbInitialized = "noFileStorageCRUDInitialized";

				if ($rootScope[dbInitialized]) {
					resolve();
				} else {
					$rootScope.$watch(dbInitialized, function(newval) {
						if (newval) {
							resolve();
						}
					});

				}
			});
		};

		this.configure = function(noUser, schema) {
			var db = new NoFileStorageDb(),
				dbInitialized = "noFileStorageCRUD_" + schema.config.dbName;

			return $q(function(resolve, reject) {
				for (var t in schema.tables) {
					var table = schema.tables[t];
					db[t] = new NoTable($q, t, table, noLocalFileStorage);
				}

				console.log(dbInitialized + " ready.");

				$rootScope[dbInitialized] = db;

				resolve(THIS);
			});

		};

		this.getDatabase = function(databaseName) {
			var dbInitialized = "noFileStorageCRUD_" + databaseName;
			return $rootScope[dbInitialized];
		};

		this.destroyDb = function(databaseName) {
			var deferred = $q.defer();
			var db = THIS.getDatabase(databaseName);
			if (db) {
				db.delete()
				.then(function(res) {
					delete $rootScope["noFileStoreageCRUD_" + databaseName];
					deferred.resolve(res);
				});
			} else {
				deferred.resolve(false);
			}
			return deferred.promise;
		};

		function NoFileStorageDb() {}


		function NoTable($q, tableName, table, noLocalFileStorage) {
			var THIS = this,
				_table = table,
				SQLOPS = {};

			Object.defineProperties(this, {
				entity: {
					get: function() {
						return _table;
					}
				}
			});

			function noCreate(data, trans) {
				return $q(function(resolve, reject) {
					noLocalFileStorage.cache(data)
						.then(_recordTransaction.bind(null, resolve, _table.entityName, "C", trans, data))
						.catch(_transactionFault.bind(null, reject));
				});
			};
			this.noCreate = noCreate;

			function noDestroy(data, trans) {
				return $q(function(resolve, reject) {
					noLocalFileStorage.removeFromCache(data.FileID)
						.then(_recordTransaction.bind(null, resolve, _table.entityName, "D", trans, data))
						.catch(_transactionFault.bind(null, reject));
				});
			}
			this.noDestroy = noDestroy;

			this.noRead = function() {
				return $q.when([{
					"message": "TODO: Implment multi-row queries."
				}]);
			};

			this.noUpdate = function(data, trans) {
				return noDestroy(data, trans)
				.then(function(data) {
					return noCreate(data, trans)
					.catch(function(err) {
						return err;
					});
				})
				.catch(function(err) {
					return err;
				});

			};

			this.noOne = function(query) {
				return noLocalFileStorage.get(query);
			};

			/*
			 * ### @method noClear()
			 *
			 * Delete all files from the cache, without recording each delete transaction.
			 *
			 * #### Returns
			 * AngularJS Promise.
			 */
			this.noClear = function () {
				if(_table.entityType === "V") throw "Clear operation not supported by SQL Views.";

				return $q(function (resolve, reject) {
					noLocalFileStorage.removeFromCache()
						.then(resolve)
						.catch(reject);

				});

			};

			/*
			 *	### @method noBulkCreate(data)
			 *
			 *	Inserts a file in to cache without logging a transaction.
			 */
			this.noBulkCreate = function (data) {
				if(_table.entityType === "V") throw "BulkCreate operation not supported by SQL Views.";

				return $q(function (resolve, reject) {
					noLocalFileStorage.cache(data)
						.then(resolve)
						.catch(reject);
				});
			};

			/*
			 *	### @method bulkload(data, progress)
			 *
			 *	Returns an AngularJS Promise.  Takes advantage of
			 *	Promise.notify to report project of the bulkLoad operation.
			 */
			this.bulkLoad = function (data, progress) {
				if(_table.entityType === "V") throw "BulkLoad operation not supported by SQL Views.";

				var deferred = $q.defer(),
					table = this;

				//var table = this;
				function _import(data, progress) {
					var total = data ? data.length : 0;

					$timeout(function () {
						//progress.rows.start({max: total});
						deferred.notify(progress);
					});

					var currentItem = 0;

					//_dexie.transaction('rw', table, function (){
					_next();
					//});

					function _next() {
						if(currentItem < data.length) {
							var datum = data[currentItem];

							table.noBulkCreate(datum)
								.then(function (data) {
									//progress.updateRow(progress.rows);
									deferred.notify(data);
								})
								.catch(function () {
									deferred.reject({
										entity: table,
										error: arguments
									});
								})
								.finally(function () {
									currentItem++;
									_next();
								});

						} else {
							deferred.resolve(table.name);
						}
					}

				}

				//console.info("bulkLoad: ", table.TableName)

				table.noClear()
					.then(function () {
						_import(data, progress);
					}.bind(this));

				return deferred.promise;
			};

			SQLOPS.I = this.noCreate;
			SQLOPS.U = this.noUpdate;
			SQLOPS.D = this.noDestroy;

			this.noImport = function (noChange) {
				function checkForExisting() {
					var id = noChange.changedPKID;

					return THIS.noOne(id);
				}

				function isSame(data, changes) {
					var
						localDate = new Date(data.ModifiedDate),
						remoteDate = new Date(changes.ModifiedDate),
						same = moment(localDate)
							.isSame(remoteDate, 'second');

					console.log(localDate, remoteDate, same);

					return same;
				}

				function save(changes, data, resolve, reject) {
					var ops = {
						"I": THIS.noCreate,
						"U": THIS.noUpdate
					};
					//console.log(data, changes);
					if(isSame(data, changes.values)) {
						console.warn("not updating local data because the ModifiedDate is the same or newer than the data being synced.");
						changes.isSame = true;
						resolve(changes);
					} else {
						ops[changes.operation](changes.values)
							.then(resolve)
							.catch(reject);
					}
				}



				return $q(function (resolve, reject) {

					function ok(data) {
						console.log(data);
						resolve(data);
					}

					function fault(err) {
						console.error(err);
						reject(err);
					}

					checkForExisting()
						.then(function (data) {

							switch(noChange.operation) {
								case "D":

									THIS.noDestroy(noChange.changedPKID)
										.then(ok)
										.catch(fault);
									break;

								case "I":
								case "U":
									save(noChange, data, ok, fault);
									break;
							}
						});



				});
			};


		}

	}

	angular.module("noinfopath.data")
		.service("noLocalFileStorage", ["$q", "noDataSource", NoLocalFileStorageService])
		.factory("noFileStoreageCRUD", ["$timeout", "$q", "$rootScope", "noLocalFileStorage",function ($timeout, $q, $rootScope, noLocalFileStorage) {
			return new NoFileStorageCRUDProvider($timeout, $q, $rootScope, noLocalFileStorage);
		}]);

})();
