//indexeddb.js
/*
 *	## noIndexedDB
 *	The noIndexedDB factory creates and configures a new instance of Dexie.
 *	Dexie is a wrapper around IndexedDB.  noIndexedDB is a Dexie AddOn that
 *	extends the query capabilites of Dexie, and exposes a CRUD interface
 *	on the WriteableTable class.
 *
 *
 *	### Class noDatum
 *	This is a contructor function used by Dexie when creating and returning data objects.
 *
 *
 *	### Class noDexie
 *	This is the classed used to construct the Dexie AddOn.
 *
 *
 *	#### noCreate
 *	Adds a new record to the database. If the primary key is provided in that will be used when adding otherwise a new UUID will be created by Dexie.
 *
 *	##### Parameters
 *
 *	|Name|Type|Description|
 *	|data|Object|An object contains the properties that match the schema for the underlying WriteableTable.
 *
 *	##### Returns
 *	AngularJS:Promise
 *
 *
 *	#### noRead
 *
 *	The read operation takes a complex set of parameters that allow
 *	for filtering, sorting and paging of data.
 *
 *	##### Parameters
 *
 *	|Name|Type|Descriptions|
 *	|----|----|------------|
 *	|filters|NoFilters|(Optional) Any `NofilterExpression` objects that need to be applied to the the current table.|
 *	|sort|NoSort|(Optional) Any `NoSortExpression` objects that need to be applied to the result set. The will be applied in the order supplied.|
 *	|page|NoPage|(Optional) Paging information, if paging is reqired by the read operation.|
 *
 *	##### Returns
 *	AngularJS::Promise
 *
 *
 *	#### Internal Values
 *
 *	|Name|Type|Description|
 *	|------|-----|-------------|
 *	|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
 *	|_resolve|Function|Call to resolve `Dexie::Promise` upon successful completion of `_applyFilters()`. This function is returned while resolving the underlying IDBObjectStore from the `table` parameter.|
 *	|_reject|Function|Call to resolve the `Dexie::Promise` when an unexpected for un recoverable error occurs during processing.|
 *	|_store|IDBObjectStore|This underlying `IDBObjectStore` that the `table` parameter represents.|
 *	|_trans|IDBTransaction|This is the underlying `IDBTransaction` that the current object store is bound to.|
 *
 *
 *	##### nonIndexedOperators
 *	This hash table allows for quick access to the operations that can be applied to a property on a target object and the value(s) being filtered on.
 *
 *	NOTE:  The "a" parameter will always be the value tested, and "b" will always be the value being filter for.
 *
 *
 *	#### \_applyFilters
 *	This function develops an array of objects that has had all of the filters provided in the original request applied to them.  The schema matches the schema of the `table` parameter.
 *
 *	##### Parameters
 *
 *	|Name|Type|Description|
 *	|----|----|------|
 *	|iNofilters|[iNoFilterExpression]|An array of filter expressions. Contains both indexed and non-indexed filters|
 *	|table|Dexie::Table|A reference to the `Dexie::Table` being filtered.
 *
 *	##### Internal variables
 *
 *	|Name|Type|Description|
 *	|------|-----|-------------|
 *	|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
 *	|iNoFilterHash|Collection<iNoFilters>|Used to organize the filters received in the `iNoFilters` in to a set of indexed and non-indexed filter object The collection is created by a call to `_sortOutFilters()`.|
 *	|resultsKeys|Array\<guid\>|This will be use to collect the final set of results. It will be an array of keys that will be used to query the final result set.|
 *
 *	##### Returns
 *	AngularJS::Promise (Maybe)
 *
 *
 *	### \_filterByIndex
 *
 *	This method of filtering goes against a predefined index. Basically we are doing a MapReduce techique angaist each indexed filter we come across. Using the `filter` parameter provided the index is reduced by matching against the `value` property of the `INoFilterExpression`.  See the `INoFilterExpression` for more details.
 *
 *	#### Parameters
 *
 *	|Name|Type|Description|
 *	|------|-----|-------------|
 *	|filter|INoFilterExpression|A single indexed filter the contains the column, operator, and value to apply to the index.|
 *
 *	#### Returns
 *	AngularJS::Promise
 *
 *
 *	### \_filterByPrimaryKey  -- Being Deprecated
 *
 *	This method of of filterig goes against the `IDBObjectStore`'s primary key.
 *
 *
 *	\_filterHasIndex uses the iNoFilter parameter to determine
 *	if there is an index available for the give filter. it returns
 *	true if there is, false if not.
 *
 *	To determine if and index exists, we look at the table.schema.primKey,
 *	and table.schema.indexes properties.
 *
 *
 *	### \_recurseIndexedFilters
 *
 *
 *	This method of filtering compares the supplied set of
 *	filters against each object return in the Dexie colletion.
 *	This is a much slower than filtering against an index.
 *
 *
 *	While Dexie supports a put operation which is similar to upsert,
 *	we're going with upsert which decides whether an insert or an
 *	update is required and calls the appropreiate function.
 *
 *
 *	### configure
 *
 *
 *	This function splits up the filters by indexed verses not. The
 *	return value is a INoFilterHash.
 *
 *	interface INoFilterHash {
 *		indexedFilters: [INoFilterExpression]
 *		nonIndexedFilters: [INoFilterExpression]
 *	}
 *
 *
 *	This function applies the provided sort items to the supplied
 *	Dexie:Collection. It should always sort on indexed columns and
 *	return a DexieCollection.
 *
 *	NOTE: Need to research how to apply multi-column sorting.
 *
 *
 *	Applies the specified skip and take values to the final
 *	Dexie::Collection, if supplied.
 *
 *	Note that this is the function returns the final Array of items
 *	based on all of the properties applied prior to this call.
 *
 *
 *	The promise should resolve to a Dexie::Collection that will result in
 *	a set of data that matches the supplied filters, reject errors.
 *
 *
 *	The update function expects the key to be within the update object.
 *
 *
 *	Maps to the Dexie.Table.get method.
 *
 *
 *	### \_extendDexieTables
 */
(function(angular, Dexie, undefined) {
	"use strict";

	function NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage, noQueryParser) {

		var _name;

        function _recordTransaction(resolve, tableName, operation, trans, result1, result2) {
			var transData = result2 && result2.rows.length ? result2 : result1;

			if (trans) trans.addChange(tableName, transData, operation);
			resolve(transData);

		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		Object.defineProperties(this, {
			"isInitialized": {
				"get": function() {
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		this.configure = function(noUser, schema) {
			var _dexie = new Dexie(schema.config.dbName),
				noIndexedDbInitialized = "noIndexedDb_" + schema.config.dbName;

			function _extendDexieTables(dbSchema) {
				function _toDexieClass(tsqlTableSchema) {
					var _table = {};

					angular.forEach(tsqlTableSchema.columns, function(column, columnName) {
						switch (column.type) {
							case "uniqueidentifier":
							case "nvarchar":
							case "varchar":
								_table[columnName] = "String";
								break;

							case "date":
							case "datetime":
								_table[columnName] = "Date";
								break;

							case "bit":
								_table[columnName] = "Boolean";
								break;

							case "int":
							case "decimal":
								_table[columnName] = "Number";
								break;
						}
					});

					return _table;
				}

				angular.forEach(dbSchema, function(table, tableName) {
					var dexieTable = _dexie[table.entityName || tableName];
					//dexieTable.mapToClass(noDatum, _toDexieClass(table));
					dexieTable.noInfoPath = table;
				});
			}

			function _reject($rootScope, reject, err) {
				reject(err);
				$rootScope.$digest();
			}

			function _resolve($rootScope, resolve, data) {
				resolve(data);
				$rootScope.$digest();
			}

			return $q(function(resolve, reject) {
				_dexie.currentUser = noUser;
				_dexie.on('error', function(err) {
					// Log to console or show en error indicator somewhere in your GUI...
					noLogService.error("Dexie Error: " + err);
 					_reject($rootScope, reject, err);
				});

				_dexie.on('blocked', function(err) {
					// Log to console or show en error indicator somewhere in your GUI...
					noLogService.warn("IndexedDB is currently execting a blocking operation.");
					_reject($rootScope, reject, err);
				});

				_dexie.on('versionchange', function(err) {
					// Log to console or show en error indicator somewhere in your GUI...
					//noLogService.error("IndexedDB as detected a version change");
					_reject($rootScope, reject, "IndexedDB as detected a version change");
				});

				_dexie.on('populate', function(err) {
					//Log to console or show en error indicator somewhere in your GUI...
					//noLogService.warn("IndedexDB populate...  not implemented.");
				});

				_dexie.on('ready', function(data) {
					noLogService.log("noIndexedDb_" + schema.config.dbName + " ready.");
					// Log to console or show en error indicator somewhere in your GUI...
					$rootScope[noIndexedDbInitialized] = _dexie;

					_resolve($rootScope, resolve, _dexie);

				});

				if (_dexie.isOpen()) {
					//Do nothing, `ready` event should bubble up.

					// $timeout(function() {
					// 	//noLogService.log("Dexie already open.")
					// 	window.noInfoPath.digest(deferred.resolve);
					// });
				} else {
					if (_.size(schema.store)) {
						_dexie.version(schema.config.version)
							.stores(schema.store);
						_extendDexieTables.call(_dexie, schema.tables);
						_dexie.open();
					} else {
						noLogService.warn("Waiting for noDbSchema data.");
					}

				}
			});


		};

		this.whenReady = function(config) {
			var deferred = $q.defer();

			$timeout(function() {
				var noIndexedDbInitialized = "noIndexedDb_" + config.dbName;

				if ($rootScope[noIndexedDbInitialized]) {
					deferred.resolve();
				} else {
					$rootScope.$watch(noIndexedDbInitialized, function(newval, oldval, scope) {
						if (newval) {
							deferred.resolve();
						}
					});
				}
			});

			return deferred.promise;
		};

		this.getDatabase = function(databaseName) {
			return $rootScope["noIndexedDb_" + databaseName];
		};

		function noDexie(db) {
			var _dexie = db;

			db.WriteableTable.prototype.noCreate = function(data, trans) {
				var deferred = $q.defer(),
					table = this;


				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function() {
						data.CreatedBy = _dexie.currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;

						_dexie.nosync = true;

						table.add(data)
							.then(function(data) {
								//noLogService.log("addSuccessful", data);
								table.get(data)
									.then(_recordTransaction.bind(null, deferred.resolve, table.name, "C", trans))
									.catch(_transactionFault.bind(null, deferred.reject));

							})
							.catch(function(err) {
								//deferred.reject("noCRUD::create " + err);
								deferred.reject(err);
							});
					})
					.catch(function(err) {
						deferred.reject("noCRUD::createTrans " + err);
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.Table.prototype.noRead = function() {

				var deferred = $q.defer(),
					table = this,
					store, _resolve, _reject, _store, _trans,
					filters, sort, page,
					indexedOperators = {
						"eq": "equals",
						"gt": "above",
						"ge": "aboveOrEqual",
						"lt": "below",
						"le": "belowOrEqual",
						"startswith": "startsWith",
						"bt": "between"
					},
					logic = {
						"and": function(a, b) {
							return a && b;
						},
						"or": function(a, b) {
							return a || b;
						}
					},
					operators = {
						"in": function(a, b) {
							return _.indexOf(b, a) > -1;
						},
						"eq": function(a, b) {
							return a === b;
						},
						"neq": function(a, b) {
							return a !== b;
						},
						"gt": function(a, b) {
							return a > b;
						},
						"ge": function(a, b) {
							return a >= b;
						},
						"lt": function(a, b) {
							return a < b;
						},
						"le": function(a, b) {
							return a <= b;
						},
						"startswith": function(a, b) {
							var a1 = a ? a.toLowerCase() : "",
								b1 = b ? b.toLowerCase() : "";

							return a1.indexOf(b1) === 0;
						},
						"contains": function(a, b) {
							var a1 = a ? a.toLowerCase() : "",
								b1 = b ? b.toLowerCase() : "";

							return a1.indexOf(b1) >= -1;
						}
					},
					buckets = {};

				//sort out the parameters
				for (var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if (angular.isObject(arg)) {
						switch (arg.__type) {
							case "NoFilters":
								filters = arg;
								break;
							case "NoSort":
								sort = arg;
								break;
							case "NoPage":
								page = arg;
								break;
						}
					}
				}

				function _applyFilters(iNoFilters, store) {
					var deferred = $q.defer(),
						iNoFiltersHash = _sortOutFilters(iNoFilters),
						resultKeys = [];

					if (iNoFilters) {
						//Filter on the indexed filters first.  That should reduce the
						//set to make the non-indexed filters more performant.
						_recurseIndexedFilters(iNoFiltersHash.indexedFilters, table)
							.then(function(data) {
								// _applyNonIndexedFilters()
								// 	.then(function(data){
								// 		deferred.resolve(data);
								// 	});
								deferred.resolve(new noInfoPath.data.NoResults(data));
							})
							.catch(function(err) {
								deferred.reject(err);
							});
					} else {
						table.toArray()
							.then(function(data){
								deferred.resolve(new noInfoPath.data.NoResults(data));
							})
							.catch(deferred.reject);
					}


					return deferred.promise;
				}

				function _recurseIndexedFilters(filters, table) {

					var deferred = $q.defer(),
						map = {};

					function _reduce(map) {
						var keys = [],
							all = [],
							results = [];
						// ors = _.filter( _.pluck(map, "filter"), {logic: "or"}),
						// ands = _.filter( _.pluck(map, "filter"), {logic: "and"}),
						// mergedOrs = _merge(map, ors)
						for (var k in map) {
							var items = map[k];

							//noLogService.log(items);

							switch (items.filter.logic) {
								// case "or":
								// 	keys = _.union(keys, _.pluck(items.data, "pk"));
								// 	break;
								// case "and":
								// 	keys = _.intersection(keys, _.pluck(items.data, "pk"));
								// 	break;
								default: keys = keys.concat(_.pluck(items.data, "pk"));
								break;

							}
							//noLogService.log( _.pluck(items.data, "pk").length)
							all = _.union(all, items.data);
						}

						for (var ka in all) {
							var item = all[ka].obj,
								key = item[table.schema.primKey.name];

							if (keys.indexOf(key) > -1) {
								results.push(item);
							}
						}

						return results;
					}

					function _map() {
						var filter = filters.pop(),
							promise;

						if (filter) {
							if (table.schema.primKey === filter.column) {
								promise = _filterByPrimaryKey(filter, table);
							} else {
								promise = _filterByIndex(filter, table);
							}

							promise
								.then(function(data) {
									map[filter.column] = {
										pk: table.schema.primKey.name,
										filter: filter,
										data: data
									};
									_map();
								})
								.catch(function(err) {
									//deferred.reject(err);
									noLogService.error(err);
								});
						} else {
							deferred.resolve(_reduce(map));
						}
					}

					$timeout(_map);

					window.noInfoPath.digestTimeout();

					return deferred.promise;
				}


				function _filterByPrimaryKey(filter, store) {
					var deferred = $q.defer(),
						req = store.openKeyCursor(),
						operator = operators[filter.operator],
						matchedKeys = [];

					req.onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							if (operator(cursor.key, filter.value)) {
								matchedKeys.push(cursor.primaryKey);
							}
							cursor.continue();
						} else {
							deferred.resolve(matchedKeys);
						}
					};

					req.onerror = function() {
						deferred.reject(req.error);
					};

					return deferred.promise;
				}


				function _filterByIndex(filter, table) {
					var deferred = $q.defer(),
						matchedKeys = [];


					table._idbstore("readonly", function(resolve, reject, store, trans) {
						var ndx = store.index(filter.column),
							req = ndx.openCursor();

						req.onsuccess = function(event) {
							var cursor = event.target.result,
								//When AND assume success look for failure. When OR assume failure until any match is found.
								matched = false;
							if (cursor) {

								for (var f in filter.filters) {
									var fltr = filter.filters[f],
										operator = operators[fltr.operator];

									matched = operator(cursor.key, fltr.value);

									if (filter.logic === "and") {
										if (!matched) {
											break;
										}
									} else { //Assume OR operator
										if (matched) {
											break;
										}
									}

								}

								if (matched) {
									matchedKeys.push({
										pk: cursor.primaryKey,
										fk: cursor.key,
										obj: cursor.value
									});
								}

								cursor.continue();
							} else {
								//noLogService.info(matchedKeys);
								resolve(matchedKeys);
							}
						};

						req.onerror = function(event) {
							reject(event);
						};

						trans.on("complete", function(event) {
							deferred.resolve(matchedKeys);
						});

						trans.on("error", function(event) {
							deferred.reject(trans.error());
						});
					});

					return deferred.promise;
				}

				function _filterByProperty(iNoFilterExpression, obj) {
					return nonIndexedOperators[iNoFilterExpression.operator](obj, iNoFilter.column, iNoFilter.value);
				}

				function _filterByProperties(iNoFilters, collection) {

					return collection.and(function(obj) {
						angular.forEach(iNoFilters, function(iNoFilterExpression) {
							_filterByProperty(iNoFilters, obj);
						});
					});
				}

				function _filterHasIndex(iNoFilterExpression) {
					return _.findIndex(table.schema.indexes, {
						keyPath: iNoFilterExpression.column
					}) > -1;
				}


				function _sortOutFilters(iNoFilters) {
					//noLogService.log("Start of sort",table.schema.indexes);

					var iNoFilterHash = {
						indexedFilters: [],
						nonIndexedFilters: []
					};

					angular.forEach(iNoFilters, function(iNoFilterExpression) {

						if (table.schema.primKey.keyPath === iNoFilterExpression.column) {
							iNoFilterHash.indexedFilters.push(iNoFilterExpression);
						} else {
							if (_filterHasIndex(iNoFilterExpression)) {
								iNoFilterHash.indexedFilters.push(iNoFilterExpression);
							} else {
								iNoFilterHash.nonIndexedFilters.push(iNoFilterExpression);
							}
						}

					});

					//noLogService.log("Before the return",table.schema.indexes);

					return iNoFilterHash;
				}


				function _applySort(iNoSort, data) {
					noLogService.warn("TODO: Fully implement _applySort");
				}


				function _applyPaging(page, data) {
					return $q(function(resolve, reject) {
						if (page) data.page(page);

						resolve(data);
					});
				}

				$timeout(function() {
					_applyFilters(filters, table)
						.then(function(data) {
							_applyPaging(page, data)
								.then(deferred.resolve);
						})
						.catch(function(err) {
							deferred.reject(err);
						});
				});

				window.noInfoPath.digestTimeout();


				return deferred.promise;
			};

			db.WriteableTable.prototype.noUpdate = function(data, trans) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey];

				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function() {
						Dexie.currentTransaction.nosync = true;
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;
						table.update(key, data)
                            .then(_recordTransaction.bind(null, deferred.resolve, table.name, "C", trans))
                            .catch(_transactionFault.bind(null, deferred.reject));

					})
					.then(angular.noop())
					.catch(function(err) {
						window.noInfoPath.digestError(deferred.reject, err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noDestroy = function(data, trans) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey];

				//noLogService.log("adding: ", _dexie.currentUser);
				//noLogService.log(key);
				_dexie.transaction("rw", table, function() {
						Dexie.currentTransaction.nosync = true;
						table.delete(key)
                            .then(_recordTransaction.bind(null, deferred.resolve, table.name, "C", trans))
                            .catch(_transactionFault.bind(null, deferred.reject));

					})
					.then(angular.noop())
					.catch(function(err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noOne = function(data) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey];

				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("r", table, function() {
						Dexie.currentTransaction.nosync = true;
						table.get(key)
							.then(function(data) {
								deferred.resolve(data);
							})
							.catch(function(err) {
								deferred.reject(err);
							});

					})
					.then(angular.noop())
					.catch(function(err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			// db.WriteableTable.prototype.upsert = function(data){
			// }

			db.WriteableTable.prototype.bulkLoad = function(data, progress) {
				var deferred = $q.defer(),
					table = this;
				//var table = this;
				function _import(data, progress) {
					var total = data ? data.length : 0;

					$timeout(function() {
						//progress.rows.start({max: total});
						deferred.notify(progress);
					});

					var currentItem = 0;

					_dexie.transaction('rw', table, function() {
						Dexie.currentTransaction.nosync = true;
						_next();
					});


					function _next() {
						if (currentItem < data.length) {
							var datum = data[currentItem];

							table.add(datum)
								.then(function(data) {
									//progress.updateRow(progress.rows);
									deferred.notify(data);
								})
								.catch(function(err) {
									deferred.reject(err);
								})
								.finally(function() {
									currentItem++;
									_next();
								});

						} else {
							deferred.resolve(table.name);
						}
					}

				}

				//console.info("bulkLoad: ", table.TableName)

				table.clear()
					.then(function() {
						_import(data, progress);
					}.bind(this));

				return deferred.promise;
			};

		}

		/**
		 *	### Class noDatum
		 *	This is a contructor function used by Dexie when creating and returning data objects.
		 */
		function noDatum() {
			noLogService.log("noDatum::constructor"); //NOTE: This never seems to get called.
		}



		Dexie.addons.push(noDexie);

	}

	angular.module("noinfopath.data")
		.factory("noIndexedDb", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {
			return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}]);

})(angular, Dexie);
