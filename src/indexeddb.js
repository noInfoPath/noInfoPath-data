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
					table.parentSchema = schema;
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
			var _dexie = db,
				indexedOperators = {
					"eq": "equals",
					"gt": "above",
					"ge": "aboveOrEqual",
					"lt": "below",
					"le": "belowOrEqual",
					"startswith": "startsWith",
					"bt": "between",
					"in": "anyOfIgnoreCase"
				};

			db.WriteableTable.prototype.noCreate = function(data, trans) {
				var deferred = $q.defer(),
					table = this;


				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function() {
						data.CreatedBy = _dexie.currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;

						if (!data[table.schema.primKey.name]) {
							data[table.schema.primKey.name] = noInfoPath.createUUID();
						}

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


			function NoRead_new() {
				var table = this,
					filters, sort, page;

				function _filter(filters, table) {
					var collection;

					if (!!filters) {
						for (var fi = 0; fi < filters.length; fi++) {
							var filter = filters[fi],
								ex = filter.filters[fi],
								where, evaluator, logic;

							if (fi === 0) {
								//When `fi` is 0 create the WhereClause, extract the evaluator
								//that will be used to create a collection based on the filter.
								where = table.where(filter.column);

								//NOTE: Dexie changed they way they are handling primKey, they now require that the name be prefixed with $$
								if (table.schema.primKey.keyPath === filter.column || table.schema.idxByName[filter.column]) {
									evaluator = where[indexedOperators[ex.operator]];
									collection = evaluator.call(where, ex.value);
								} else {
									collection = table.toCollection();
								}
							} else {
								evaluator = collection[ex.operator];
								console.warn("TODO: Implement advanced filtering.");
								console.log(ex, evaluator);
							}


						}
						//More indexed filters
					} else {
						collection = table.toCollection();
					}

					return collection;
				}

				function _sort(sorts, arrayOfThings) {
					function _compare(s, a, b) {
						var aval = a[s.column],
							bval = b[s.column];

						if (s.dir === "desc") {
							if (aval < bval) {
								return 1;
							}
							if (aval > bval) {
								return -1;
							}
						} else {
							if (aval > bval) {
								return 1;
							}
							if (aval < bval) {
								return -1;
							}
						}

						// a must be equal to b
						return 0;

					}

					if (sorts) {
						for (var s = 0; s < sorts.length; s++) {
							var sort = sorts[s];

							arrayOfThings.sort(_compare.bind(null, sort));
						}
					}
				}

				function _page(page, arrayOfThings) {
					if (page) {
						arrayOfThings.page(page);
					}
				}

				function _expand_fault(col, keys, fitlers, err) {
					console.error({
						error: err,
						column: col,
						keys: keys,
						filters: filters
					});
					return err;
				}

				function _expand(col, keys) {
					var filters = new noInfoPath.data.NoFilters(),
						ft = db[col.refTable];

					//If we don't have a foreign key table, then try  to dereference it using the aliases hash.
					if (!ft) {
						ft = db[aliases[col.refTable]];
					}

					if (!ft) throw "Invalid refTable " + aliases[col.refTable];

					// if(tableCache[col.refTable]) {
					// 	tbl = tableCache[col.refTable];
					// } else {
					// 	tableCache[col.refTable] = tbl;
					// }

					if (!keys) {
						throw {
							error: "Invalid key value",
							col: col,
							item: item
						};
					}

					//Configure foreign key filter
					filters.quickAdd(col.refColumn, "in", keys);

					//follow the foreign key and get is data.
					if (keys.length > 0) {
						return ft.noRead(filters)
							.catch(_expand_fault.bind(table, col, keys, filters));
					} else {
						return $q.when(new noInfoPath.data.NoResults());
					}

				}

				function _finalResults(finalResults) {
					if (finalResults.exception) {
						console.warn(finalResults.exception);
						resolve(new noInfoPath.data.NoResults([]));
					} else {
						resolve(new noInfoPath.data.NoResults(finalResults));
					}
				}

				function _fault(ctx, reject, err) {
					ctx.error = err;
					console.error(ctx);
					reject(ctx);
				}

				function _finished_following(columns, arrayOfThings, refData) {

					for (var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for (var c in columns) {
							var col = columns[c],
								key = item[col.column],
								refTable = refData[col.refTable].paged,
								filter = {},
								refItem;

							filter[col.refColumn] = key;

							refItem = _.find(refTable, filter);

							item[col.column] = refItem || key;
						}
					}

					return arrayOfThings;

					// function(arrayOfThings, results) {
					// 	console.log(table, tableCache, arrayOfThings);
					// 	return arrayOfThings;
					// }.bind(null, arrayOfThings)
					// item[col.column] = data;
					// tableCache[col.refTable][data[col.refColumn]]  = data;
					// return item;
				}

				function _followRelations(arrayOfThings) {
					var promises = {},
						columns = table.noInfoPath.foreignKeys,
						aliases = table.noInfoPath.parentSchema.config.tableAliases;


					for (var c in columns) {
						var col = columns[c],
							keys = _.pluck(arrayOfThings, col.column);

						promises[col.refTable] = _expand(col, keys);

					}

					return _.size(promises) > 0 ?
						$q.all(promises)
						.then(_finished_following.bind(table, columns, arrayOfThings))
						.catch(_fault) :
						$q.when(arrayOfThings);
				}

				function _finish(resolve, reject, arrayOfThings) {

					_sort(sort, arrayOfThings);

					var results = new noInfoPath.data.NoResults(arrayOfThings);

					_page(page, results);

					//console.log(this, results.paged);

					resolve(results);
					// collection.toArray()
					// 	.then(_followRelations.bind(table, table))
					// 	.then(_finish_expand.bind(null, columns, arrayOfThings, refData))
					// 	.then(resolve)
					// 	.catch(reject);

				}

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

				var ctx = {
					table: table,
					filters: filters,
					page: page,
					sort: sort
				};
				return $q(function(resolve, reject) {
					var collection,
						data,
						promise;

					try {
						collection = _filter(filters, table);

						collection.toArray()
							.then(_followRelations.bind(ctx))
							.then(_finish.bind(ctx, resolve, reject))
							.catch(_fault.bind(ctx, ctx, reject));
						//.then(_finish(collection, table, resolve, reject));

					} catch (err) {
						reject(err);
					}

					//_sort(table, sort, collection);

					//_page(page, collection);

					//_finish(collection, table, resolve, reject);

				});
			}

			db.Table.prototype.noRead = NoRead_new;

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

			db.WriteableTable.prototype.noDestroy = function(data, trans, filters) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey],
					collection;

				//noLogService.log("adding: ", _dexie.currentUser);
				//noLogService.log(key);

				_dexie.transaction("rw", table, function() {
						Dexie.currentTransaction.nosync = true;

						if (!!filters) {
							//First filter will use where();
							var filter = filters[0],
								where = table.where(filter.column),
								ex = filter.filters[0],
								method = where[indexedOperators[ex.operator]];

							collection = method.call(where, ex.value);

							collection.delete()
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans))
								.catch(_transactionFault.bind(null, deferred.reject));

						} else {
							table.delete(key)
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans))
								.catch(_transactionFault.bind(null, deferred.reject));
						}
					})
					.then(angular.noop())
					.catch(function(err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noOne = function(data) {
				var table = this,
					key = data[table.noInfoPath.primaryKey];

				return $q(function(resolve, reject) {
					table.noRead(data)
						.then(function(results) {
							resolve(results.length > 0 ? results[0] : {});
						})
						.catch(function(err) {
							reject(err);
						});

				});

			};

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
					}.bind(this))
					.catch(function(err) {
						console.error(err);
					});

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
		}])

	.factory("noIndexedDB", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {
		return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}]);

})(angular, Dexie);
