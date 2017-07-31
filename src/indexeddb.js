//indexeddb.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.80*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	noIndexedDB
 *	------------------
 *	## noIndexedDB
 *
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
 *	|----|----|-----------|
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
 *	|Name|Type|Description|
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
(function (angular, Dexie, undefined) {
	"use strict";

	function NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {

		var _name, _noIndexedDb = this;

		function _recordTransaction(resolve, tableName, operation, trans, rawData, result1, result2) {
			//console.log(arguments);

			var transData = result2 && result2.rows && result2.rows.length ? result2 : angular.isObject(result1) ? result1 : rawData;

			if (trans) trans.addChange(tableName, transData, operation);
			resolve(transData);
		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		Object.defineProperties(this, {
			"isInitialized": {
				"get": function () {
					return !!noLocalStorage.getItem(_name);
				}
			}
		});

		this.configure = function (noUser, schema) {
			var _dexie = new Dexie(schema.config.dbName),
				noIndexedDbInitialized = "noIndexedDb_" + schema.config.dbName;

			function _extendDexieTables(dbSchema) {
				function _toDexieClass(tsqlTableSchema) {
					var _table = {};

					angular.forEach(tsqlTableSchema.columns, function (column, columnName) {
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

				angular.forEach(dbSchema, function (table, tableName) {
					var dexieTable = _dexie[table.entityName || tableName];
					dexieTable.mapToClass(noDatum, _toDexieClass(table));
					dexieTable.noInfoPath = Object.assign({}, table);
					dexieTable.noInfoPath.parentSchema = schema;
					dexieTable.provider = _dexie;
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

			return $q(function (resolve, reject) {
				_dexie.currentUser = noUser;
				// _dexie.on('error', function (err) {
				// 	// Log to console or show en error indicator somewhere in your GUI...
				// 	console.error("Dexie Error: ", arguments);
				// 	_reject($rootScope, reject, err);
				// });

				function handler(event) {
					event.preventDefault(); // Prevents default handler (would log to console).
					var reason = event.reason;
					console.error("Unhandled promise rejection:", (reason && (reason.stack || reason)));
				}

				window.addEventListener("unhandledrejection", handler);

				_dexie.on('blocked', function (err) {
					// Log to console or show en error indicator somewhere in your GUI...
					console.warn("IndexedDB is currently execting a blocking operation.");
					_reject($rootScope, reject, err);
				});

				_dexie.on('versionchange', function (err) {
					// Log to console or show en error indicator somewhere in your GUI...
					//noLogService.error("IndexedDB as detected a version change");
					_reject($rootScope, reject, "IndexedDB as detected a version change");
				});

				_dexie.on('populate', function (err) {
					//Log to console or show en error indicator somewhere in your GUI...
					//noLogService.warn("IndedexDB populate...  not implemented.");
				});

				_dexie.on('ready', function (data) {
					console.log("noIndexedDb_" + schema.config.dbName + " ready.");
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
						console.log(schema.config.dbName, schema.store);
						_dexie.version(schema.config.version)
							.stores(schema.store);
						_extendDexieTables.call(_dexie, schema.tables);
						_dexie.open();
					} else {
						console.warn("Waiting for noDbSchema data.");
					}

				}
			});


		};

		this.whenReady = function (config) {
			var deferred = $q.defer();

			$timeout(function () {
				var noIndexedDbInitialized = "noIndexedDb_" + config.dbName;

				if ($rootScope[noIndexedDbInitialized]) {
					deferred.resolve();
				} else {
					$rootScope.$watch(noIndexedDbInitialized, function (newval, oldval, scope) {
						if (newval) {
							deferred.resolve();
						}
					});
				}
			});

			return deferred.promise;
		};

		this.getDatabase = function (databaseName) {
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
				},
				filterOps = {
					"is null": "is null",
					"is not null": "is not null",
					eq: "eq",
					neq: "ne",
					gt: "gt",
					ge: "ge",
					gte: "ge",
					lt: "lt",
					le: "le",
					lte: "le",
					contains: "contains",
					doesnotcontain: "notcontains",
					endswith: "endswith",
					startswith: "startswith",
					"in": "in"
				},
				compareOps = {
					"is null": function (a) {
						return a === null;
					},
					"is not null": function (a) {
						return a !== null;
					},
					"eq": function (a, b) {
						return a === b;
					},
					"ne": function (a, b) {
						return a !== b;
					},
					"gt": function (a, b) {
						return a > b;
					},
					"ge": function (a, b) {
						return a >= b;
					},
					"lt": function (a, b) {
						return a < b;
					},
					"le": function (a, b) {
						return a <= b;
					},
					"contains": function (a, b) {
						var areStrings = angular.isString(a) && angular.isString(b);
						return areString ? a.indexOf(b) > -1 : false;
					},
					"notcontains": function (a, b) {
						var areStrings = angular.isString(a) && angular.isString(b);
						return areString ? a.indexOf(b) === -1 : false;
					},
					"startswith": function (a, b) {
						var areStrings = angular.isString(a) && angular.isString(b);
						return areString ? a.indexOf(b) === 0 : false;
					},
					"endswith": function (a, b) {
						var areStrings = angular.isString(a) && angular.isString(b);
						return areString ? a.lastIndexOf(b) > -1 : false;
					},
					"in": function (a, b) {
						return b.indexOf(a) > -1;
					}
				};

			db.WriteableTable.prototype.noCreate = function (data, trans) {
				var deferred = $q.defer(),
					table = this;

				data = _unfollow_data(table, data);

				//console.warn(data);
				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function () {
						data.CreatedBy = _dexie.currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;

						if (!data[table.schema.primKey.name]) {
							data[table.schema.primKey.name] = noInfoPath.createUUID();
						}

						_dexie.nosync = true;

						table.add(data)
							.then(function (data) {
								//noLogService.log("addSuccessful", data);

								table.get(data)
									.then(_recordTransaction.bind(null, deferred.resolve, table.name, "C", trans, data))
									.catch(_transactionFault.bind(null, deferred.reject));

							})
							.catch(function (err) {
								//deferred.reject("noCRUD::create " + err);
								deferred.reject(err);
							});
					})
					.catch(function (err) {
						deferred.reject("noCRUD::createTrans " + err);
						deferred.reject(err);
					});

				return deferred.promise;
			};

			function NoRead_new() {
				var table = this,
					aliases = table.noInfoPath.parentSchema.config.tableAliases || {},
					filters, sort, page, follow = true,
					exclusions = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.followExceptions ? table.noInfoPath.parentSchema.config.followExceptions : [],
					nogroup;


				function _filter(filters, table) {
					var collection;

					function _logicCB(filter, ex, value) {
						var val = noInfoPath.getItem(value, filter.column),
							op = compareOps[filterOps[ex.operator]],
							ok = op ? op(val, ex.value) : false;

						return ok;
					}

					function _filterNormal(fi, filter, ex) {

						var where, evaluator, logic;

						try {


							if (fi === 0) {
								//When `fi` is 0 create the WhereClause, extract the evaluator
								//that will be used to create a collection based on the filter.
								where = table.where(filter.column);

								if(!ex.value)  throw new Error("Invalid filter value for expression: " + filter.column + " " + ex.operator + " " + ex.value);

								//NOTE: Dexie changed they way they are handling primKey, they now require that the name be prefixed with $$
								if (table.schema.primKey.keyPath === filter.column || table.schema.idxByName[filter.column]) {
									evaluator = where[indexedOperators[ex.operator]];

									collection = evaluator.call(where, ex.value);
								} else {
									collection = table.toCollection();
								}

								logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
							} else {
								// logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
								if (filter.logic) {
									logic = collection[filter.logic].bind(collection);
									collection = logic(_logicCB.bind(null, filter, ex));
								}

							}
						} catch (err) {
							throw {
								error: err,
								collection: collection,
								arguments: [fi, filter, ex]
							};
						}
					}

					function _filterCompound(fi, filter, ex) {
						console.log("Compound", fi, filter, ex);
					}

					if (!!filters) {
						for (var fi = 0; fi < filters.length; fi++) {
							var filter = filters[fi],
								ex = filter.filters[0];

							// if(noInfoPath.isCompoundFilter(filter.column)){
							// 	_filterCompound(fi, filter, ex);
							// }else{
							_filterNormal(fi, filter, ex);
							// }
						}
						//More indexed filters
					} else {
						collection = table.toCollection();
					}

					return collection;
				}

				function _sort(sorts, arrayOfThings) {
					function _compare(s, a, b) {
						var aval = noInfoPath.getItem(a, s.column),
							bval = noInfoPath.getItem(b, s.column);


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

							arrayOfThings = arrayOfThings.sort(_compare.bind(null, sort));
						}
					}

					return arrayOfThings;
				}

				function _page(page, arrayOfThings) {
					if (page) {
						arrayOfThings.page(page);
					}
				}

				function _expand_fault(col, keys, filters, err) {
					console.error({
						error: err,
						column: col,
						keys: keys,
						filters: filters
					});
					return err;
				}

				function _expand_success(col, keys, filters, results) {
					//console.log("_expand_success", arguments);
					return results;
				}

				function _expand2_success(col, keys, filters, results) {
					//console.log("_expand_success", arguments);
					//if(!nogroup) console.groupEnd();
					return {
						results: results,
						col: col
					};
				}

				function _expand(col, keys) {

					var theDb = col.refDatabaseName ? _noIndexedDb.getDatabase(col.refDatabaseName) : db,
						filters = new noInfoPath.data.NoFilters(),
						ft = theDb[col.refTable];

					//If we don't have a foreign key table, then try  to dereference it using the aliases hash.
					if (!ft) {
						ft = theDb[aliases[col.refTable]];
					}

					if (!ft) throw "Invalid refTable " + aliases[col.refTable];

					if (exclusions.indexOf(col.column) > -1) {
						return $q.when(new noInfoPath.data.NoResults());
					}
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
						return ft.noRead(filters, 1)
							.then(_expand_success.bind(table, col, keys, filters))
							.catch(_expand_fault.bind(table, col, keys, filters));
					} else {
						return $q.when(new noInfoPath.data.NoResults());
					}

				}

				function _expand2(col, keys) {
					var theDb = col.refDatabaseName ? _noIndexedDb.getDatabase(col.refDatabaseName) : db,
						filters = new noInfoPath.data.NoFilters(),
						ft = theDb[col.refTable];

					//If we don't have a foreign key table, then try  to dereference it using the aliases hash.
					if (!ft) {
						ft = theDb[aliases[col.refTable]];
					}

					if (!ft) throw "Invalid refTable " + col.refTable;

					if (exclusions.indexOf(col.column) > -1) {
						return $q.when(new noInfoPath.data.NoResults());
					}
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
						return ft.noRead(filters, false, 1)
							.then(_expand2_success.bind(table, col, keys, filters))
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
					//if(!nogroup) console.groupEnd();

					ctx.error = err;
					//console.error(ctx);
					reject(ctx);
				}

				function _finished_following_fk(columns, arrayOfThings, refData) {

					for (var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for (var c in columns) {
							var col = columns[c],
								key = item[col.column],
								refTable = !col.noFollow && refData[col.refTable].paged,
								filter = {},
								refItem;

							if (col.noFollow) continue;

							filter[col.refColumn] = key;

							refItem = _.find(refTable, filter);

							item[col.column] = refItem || key;
						}
					}
					//console.log("finished following FK for", table.noInfoPath.entityName);
					return arrayOfThings;

				}


				function _finished_following_meta(columns, arrayOfThings, refData) {
					//console.log(columns, arrayOfThings, refData);
					for (var i = 0; i < arrayOfThings.length; i++) {
						var item = arrayOfThings[i];

						for (var c in columns) {
							var col = columns[c],
								key = item[col.columnName],
								data = refData[key];

							item[col.columnName] = data || key;
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

				function _followRelations(follow, arrayOfThings) {

					var promises = {},
						allKeys = {},
						queue = [],
						columns = table.noInfoPath.foreignKeys;

					if (follow) {
						for (var c in columns) {
							var col = columns[c],
								keys = _.compact(_.pluck(arrayOfThings, col.column)); //need to remove falsey values

							if (col.noFollow) continue;

							if (!allKeys[col.refTable]) {
								allKeys[col.refTable] = {
									col: col,
									keys: []
								};
							}

							// group keys by ref table
							allKeys[col.refTable].keys = allKeys[col.refTable].keys.concat(keys);
							//promises[col.refTable] = _expand(col, keys);
						}

						for (var k in allKeys) {
							var keys2 = allKeys[k];
							//console.log("Following Foreign Key for", table.noInfoPath.entityName, keys2.col.refTable, keys2.col.column, keys2.keys.join());

							promises[k] = _expand(keys2.col, keys2.keys);
						}

						if (_.size(promises) > 0) {
							//console.group();

							return $q.all(promises)
								.then(_finished_following_fk.bind(table, columns, arrayOfThings))
								.catch(_fault);
						} else {
							return $q.when(arrayOfThings);
						}

					} else {
						return $q.when(arrayOfThings);
					}

				}

				/*
				 *	### relationships
				 *
				 *	This property controls operations that require cascadeing
				 *	deletes or reads.
				 *
				 *	*Prototypical entry in the array of relationships.*
				 *
				 *	```json
				 *	{
				 *		"column": "ID",
				 *		"refTable": "ReportBidItemAttributes",
				 *		"refColumn": "ReportBidItemValueID",
				 *		"cascadeDeletes": true,
				 *		"followOnRead": true,
				 *		"pivotMetaDataResults": true
				 *		"sort": {"column": "Order", "dir", "asc"}
				 *	}
				 *	```
				 *	#### Properties
				 *
				 *	|Name|Type|Description|
				 *	|----|----|-----------|
				 *	|column|String|The name of the column in the host table that is to be looked up in the `refTable`.|
				 *	|refTable|String|Table that contains the related table.|
				 *	|refColumn|String|Name of the column that contains the data to match value in the host table, pointed to by `column`.
				 *	|cascadeDeletes|Boolean|When true, indicates that all related row should be delete when the host row is deleted.|
				 *	|followOnRead|Boolean|Populated the relationship on the host record when read a host record.  NOTE: you must set the `refColumn` to `noFollow: true` on the foreigh key configuration, when this property is set to true|
				 *	|sort|Object|Specifies the column and direction to sort by.|
				 */
				function _followOneToManyRelations(arrayOfThings) {

					//console.log("new call to follow relations for", table.noInfoPath.entityName);

					var promises = {},
						allKeys = {},
						queue = [],
						columns = table.noInfoPath.relationships || [];

					if (columns.length > 0) {
						// console.log("processing relations");
						for (var c in columns) {
							var col = columns[c],
								keys = _.compact(_.pluck(arrayOfThings, col.column)); //need to remove falsey values


							if (!col.followOnRead) continue;


							if (!allKeys[col.refTable]) {
								allKeys[col.refTable] = {
									col: col,
									keys: []
								};
							}

							// group keys by ref table
							allKeys[col.refTable].keys = allKeys[col.refTable].keys.concat(keys);
							console.log("Following relation for", table.noInfoPath.entityName, col.refTable, col.column, allKeys[col.refTable].keys.join());
							//promises[col.refTable] = _expand(col, keys);
						}

						for (var k in allKeys) {
							var keys2 = allKeys[k];
							//Need to call read without follow flag.
							promises[k] = _expand(keys2.col, keys2.keys);
						}

						var p = _.size(promises) > 0 ?
							$q.all(promises)
							.then(function (table, columns, arrayOfThings, data) {
								//console.log(data);
								for (var t = 0; t < arrayOfThings.length; t++) {
									var thing = arrayOfThings[t];

									for (var c = 0; c < columns.length; c++) {
										var col = columns[c],
											filter = {},
											values;

										filter[col.refColumn] = thing[col.column];

										values = _.filter(data[col.refTable], filter);
										if (col.sort) {
											values = _sort([col.sort], values);
										}

										if (col.pivotMetaDataResults) {
											thing.metadata = {};
											for (var v = 0; v < values.length; v++) {
												var value = values[v],
													meta = value.MetaDataDefinitionID;

												if (angular.isObject(value.Value)) {
													value = value.Value[meta.TextField];
												} else {
													value = value.Value;
												}
												thing.metadata[meta.Name] = value;
											}
										} else {
											thing[col.refTable] = values;
										}
									}


								}
								return arrayOfThings;
							}.bind(null, table, columns, arrayOfThings))
							.catch(_fault) : $q.when(arrayOfThings);
						return p;
					} else {
						//console.log("no relationships to process for", table.noInfoPath.entityName);
						return $q.when(arrayOfThings);
					}

				}

				/**
				 *	### followMetaDataKeys
				 *
				 *	This feature of NoInfoPath allows for a special type of
				 *	data column that can contain heterogenuous data. Meaning on
				 *	any given row of data the value of the meta column could be
				 *	a string, a number, date or a foreign key reference to a
				 *	lookup table.
				 *
				 *	#### Sample MetaDataDefinition record
				 *
				 *	```json
				 *	{
				 * 	"ID": "67c373ac-a003-402a-9689-45c37fc2afa8",
				 * 	"MetaDataSchemaID": "16187a97-31d7-40e3-b33f-64b55471ee3f",
				 * 	"Title": "Unit",
				 * 	"DataType": "string",
				 * 	"InputType": "combobox",
				 * 	"ListSource": "lu_UOM",
				 * 	"TextField": "Description",
				 * 	"ValueField": "ID",
				 * 	"DateCreated": "2016-05-04T16:43:00.001",
				 * 	"CreatedBy": "79689b1e-6627-47c1-baa5-34be228cf06d",
				 * 	"ModifiedDate": "2016-05-04T16:43:00.001",
				 * 	"ModifiedBy": "79689b1e-6627-47c1-baa5-34be228cf06d"
				 * }
				 * ```
				 */
				function _followMetaData(ctx, arrayOfThings) {

					var promises = {},
						keys = {},
						noEntity = ctx.table.noInfoPath,
						columns = noEntity.columns;

					for (var colName in columns) {
						var col = columns[colName];

						if (col.followMetaDataKeys) {
							for (var i = 0; i < arrayOfThings.length; i++) {
								var thing = arrayOfThings[i],
									meta = thing.MetaDataDefinitionID,
									filters;

								//Only folow lookup columns.
								if (meta.InputType === "combobox") {
									if (!!thing[colName]) {
										filters = new noInfoPath.data.NoFilters();
										filters.quickAdd(meta.ValueField, "eq", thing[colName]);

										//use the current `db` for looking up the meta data.
										promises[thing[colName]] = db[meta.ListSource].noOne(filters);
									}

								}

							}
						}
					}

					//console.log(keys);

					return _.size(promises) > 0 ?
						$q.all(promises)
						.then(_finished_following_meta.bind(table, columns, arrayOfThings))
						.catch(_fault) :
						$q.when(arrayOfThings);

				}

				function _finish(resolve, reject, arrayOfThings) {

					_sort(sort, arrayOfThings);

					var results = new noInfoPath.data.NoResults(arrayOfThings);

					_page(page, results);

					//console.log("_finish noRead for", table.noInfoPath.entityName);

					//if(!nogroup) console.groupEnd();
					resolve(results);


				}



				for (var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if (angular.isObject(arg) || typeof (arg) === "boolean") {
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
						default:
							if (typeof (arg) === "boolean") {
								follow = arg;
							}

							if (angular.isNumber(arg)) {
								nogroup = !!arg;
							}
						}
					}

				}

				var ctx = {
					table: table,
					filters: filters,
					page: page,
					sort: sort
				};

				return $q(function (resolve, reject) {
					//if(!nogroup) console.group();
					//console.log("starting noRead for", table.noInfoPath.entityName);
					var collection,
						data,
						promise;

					try {
						collection = _filter(filters, table);

						collection.toArray()
							.then(_followRelations.bind(ctx, follow))
							.then(_followOneToManyRelations.bind(ctx))
							.then(_followMetaData.bind(ctx, ctx))
							.then(_finish.bind(ctx, resolve, reject))
							.catch(_fault.bind(ctx, ctx, reject));
						//.then(_finish(collection, table, resolve, reject));

					} catch (err) {
						console.error("NoRead_new", err);
						reject(err);
					}

					//_sort(table, sort, collection);

					//_page(page, collection);

					//_finish(collection, table, resolve, reject);

				});
			}

			function NoRead_basic() {
				var table = this,
					aliases = table.noInfoPath.parentSchema.config.tableAliases || {},
					filters, sort, page, follow = true,
					exclusions = table.noInfoPath.parentSchema.config && table.noInfoPath.parentSchema.config.followExceptions ? table.noInfoPath.parentSchema.config.followExceptions : [],
					nogroup, options;

				function _filter(filters, table) {
					var collection;

					function _logicCB(filter, ex, value) {
						var val = noInfoPath.getItem(value, filter.column),
							op = compareOps[filterOps[ex.operator]],
							ok = op ? op(val, ex.value) : false;

						return ok;
					}

					function _filterNormal(fi, filter, ex) {

						var where, evaluator, logic;

						try {


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

								logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
							} else {
								// logic = filters.length > 1 ? collection[filter.logic].bind(collection) : undefined;
								if (filter.logic) {
									logic = collection[filter.logic].bind(collection);
									collection = logic(_logicCB.bind(null, filter, ex));
								}

							}
						} catch (err) {
							throw {
								error: err,
								collection: collection,
								arguments: [fi, filter, ex]
							};
						}
					}

					function _filterCompound(fi, filter, ex) {
						console.log("Compound", fi, filter, ex);
					}

					if (!!filters) {
						for (var fi = 0; fi < filters.length; fi++) {
							var filter = filters[fi],
								ex = filter.filters[0];

							// if(noInfoPath.isCompoundFilter(filter.column)){
							// 	_filterCompound(fi, filter, ex);
							// }else{
							_filterNormal(fi, filter, ex);
							// }
						}
						//More indexed filters
					} else {
						collection = table.toCollection();
					}

					return collection;
				}


				for (var ai in arguments) {
					var arg = arguments[ai];

					//success and error must always be first, then
					if (angular.isObject(arg) || typeof (arg) === "boolean") {
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
							case "NoReadOptions":
								options = arg;
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

				return $q(function (resolve, reject) {
					var collection,
						data,
						promise;

					try {
						collection = _filter(filters, table);

						collection.toArray()
							.then(resolve)
							.catch(reject);

					} catch (err) {
						console.error("NoRead_basic", err);
						reject(err);
					}

				});

			}

			function NoRead_scripted(filter, scriptName) {
				var table = this,
					script = table.noInfoPath.scripts[scriptName];

				function _sort(sorts, arrayOfThings) {
					function _compare(s, a, b) {
						var aval = noInfoPath.getItem(a, s.column),
							bval = noInfoPath.getItem(b, s.column);


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

							arrayOfThings = arrayOfThings.sort(_compare.bind(null, sort));
						}
					}

					return arrayOfThings;
				}

				function _read(resolver, rootData) {
					var refTable = db[resolver.refTable],
						keyValues = _.compact(_.pluck(rootData, resolver.column)),
						filters = new noInfoPath.data.NoFilters()
						;

					filters.quickAdd(resolver.refColumn, "in", keyValues);

					return refTable.__read(filters, new noInfoPath.data.NoReadOptions())
						.then(function(results){
							rootData.forEach(function(datum){
								var filter = {};

								filter[resolver.refColumn] = datum[resolver.column];

								switch(resolver.type) {
									case "foreignKey":
										datum[resolver.column] = _.find(results, filter);
										break;

									case "relation":
										if(resolver.sort) {
											datum[resolver.refTable] = _sort(resolver.sort, _.select(results, filter));
										} else {
											datum[resolver.refTable] = _.select(results, filter);
										}
										break;
								}

							});

							return {resolver: resolver, data: results};
						});
				}

				function _continue(result) {
					//console.log(parentResolver.refTable);
					if(result.resolver.resolver) {
						return _recurse(result.resolver.resolver, result.data);

					} else {
						return $q.when(result);
					}
				}

				function _recurse(resolverArray, rootData) {
					return $q(function(resolve, reject){

						var promises = [];

						resolverArray.forEach(function(resolver){
							promises.push(_read(resolver, rootData)
								.then(_continue));
						});

						$q.all(promises)
							.then(resolve)
							.catch(reject);
					});
				}

				return $q(function (resolve, reject) {
					var rootData;
					console.log("Starting", table.noInfoPath.entityName);
					table.__read(filter)
						.then(function(data){
							rootData = data;
							return rootData;
						})
						.then(_recurse.bind(table, script))
						.then(function(){
							resolve(rootData);
						})
						.catch(reject);

				});


			}

			db.Table.prototype.__read = NoRead_basic;

			db.Table.prototype.noRead = NoRead_new; //NoRead_strategic;

			db.Table.prototype.noReadScripted = NoRead_scripted;

			db.WriteableTable.prototype.noUpdate = function (data, trans) {
				var deferred = $q.defer(),
					table = this,
					key = data[table.noInfoPath.primaryKey];

				data = angular.copy(data);

				//noLogService.log("adding: ", _dexie.currentUser);

				data = _unfollow_data(table, data);

				_dexie.transaction("rw", table, function () {
						Dexie.currentTransaction.nosync = true;
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _dexie.currentUser.userId;
						table.update(key, data)
							// .then(table.noOne.bind(table, key))
							.then(_recordTransaction.bind(null, deferred.resolve, table.name, "U", trans, data))
							.catch(_transactionFault.bind(null, deferred.reject));
					})
					.then(angular.noop())
					.catch(function (err) {
						window.noInfoPath.digestError(deferred.reject, err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.__delete = function _delete(data, trans, filters) {
				var deferred = $q.defer(),
					table = this,
					key = angular.isString(data) ? data : data[table.noInfoPath.primaryKey],
					collection;

				_dexie.transaction("rw", table, function () {

						Dexie.currentTransaction.nosync = true;

						if (!!filters) {
							//First filter will use where();
							var filter = filters[0],
								where = table.where(filter.column),
								ex = filter.filters[0],
								method = where[indexedOperators[ex.operator]];

							collection = method.call(where, ex.value);

							collection.delete()
								//.then(_deleteCachedFile.bind(null, data, trans))
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans, data))
								.catch(_transactionFault.bind(null, deferred.reject.bind(null, data)));

						} else {
							table.delete(key)
								//.then(_deleteCachedFile.bind(null, data, trans))
								.then(_recordTransaction.bind(null, deferred.resolve, table.name, "D", trans, data))
								.catch(_transactionFault.bind(null, deferred.reject.bind(null, data)));
						}
					}.bind(null, data))
					.then(angular.noop())
					.catch(function (err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noDestroy = function (data, trans, filters) {
				var table = this;

				function _followRelations(tableSchema, rootDatum) {
					var rootRelation = {
							schema: tableSchema,
							table: table,
							deletionKeys: [rootDatum[table.noInfoPath.primaryKey]]
						},
						relations = [rootRelation],
						parentKeys = {};

					parentKeys[rootRelation.schema.entityName] = rootRelation.deletionKeys;

					function _flatten(parentSchema) {
						for (var si = 0; si < parentSchema.relationships.length; si++) {
							var relation = parentSchema.relationships[si],
								ro = {
									parent: parentSchema,
									relation: relation,
									schema: table.noInfoPath.parentSchema.entity(relation.refTable),
									table: db[relation.refTable],
									deletionKeys: [],
									fileKeys: []
								};

							relations.unshift(ro);

							if (!!ro.schema.relationships) {
								_flatten.call(table, ro.schema);
							}

						}
					}

					function _resolveOnToManyRelationship(deferred, childIndex) {
						var childRelation = relations[childIndex],
							f = new noInfoPath.data.NoFilters();

						if (childRelation) {

							f.quickAdd(childRelation.relation.refColumn, "in", parentKeys[childRelation.parent.entityName]);

							//console.log(childRelation.parent.entityName, f.toSQL());
							childRelation.table.noRead(f, 1)
								.then(function (data) {
									var keys = _.pluck(data, childRelation.schema.primaryKey);
									if (childRelation.schema.relationships) parentKeys[childRelation.schema.entityName] = keys;
									childRelation.deletionKeys = data;

									// if (childRelation.schema.NoInfoPath_FileUploadCache) {
									// 	childRelation.fileKeys = data;
									//
									// 	console.log(childRelation.fileKeys);
									// }

									_resolveOnToManyRelationship(deferred, childIndex - 1);
								})
								.catch(function (err) {
									_resolveOnToManyRelationship(deferred, childIndex - 1);
									console.error(err);
								});

						} else {
							if (childIndex > -1) {
								deferred.reject("Something might have gone wrong @ index ", childIndex);
							} else {
								//console.log(childIndex, relations);
								deferred.resolve(relations);
							}
						}

					}

					function _cascadeDeletes(results) {
						var deleteTargets = results,
							deferred = $q.defer();

						function _recurseRelations(curIndex) {
							var deleteTarget = deleteTargets[curIndex],
								deleteData = {};

							// deleteData[deleteTarget.schema.primaryKey] =
							if (deleteTarget) {
								_recurseDeletions(deleteTarget)
									.then(function (result) {
										_recurseRelations(curIndex + 1);
									})
									.catch(function (err) {
										console.error(err);
									});
							} else {
								deferred.resolve();
							}


						}

						function _recurseDeletions(deleteTarget) {
							var deferred = $q.defer();

							function _recurse(curIndex) {
								var deleteItem = deleteTarget.deletionKeys[curIndex];

								if (deleteItem) {
									//deleteItem[deleteTarget.schema.primaryKey] = key[deleteTarget.schema.primaryKey];

									deleteTarget.table.__delete(deleteItem, trans)
										.then(function (results) {
											_recurse(curIndex + 1);
										})
										.catch(function (err) {
											deferred.reject(err);
										});
								} else {
									deferred.resolve("all done.");
								}
							}

							_recurse(0);

							return deferred.promise;

						}

						_recurseRelations(0);

						return deferred.promise;
					}

					return $q(function (resolve, reject) {
						var resolveOneToManyDeferred = $q.defer(),
							resolveDeletes = $q.defer();

						_flatten.call(this, this.noInfoPath);

						//console.log(relations);

						if (relations.length < 2) throw "Error occured resolving deletion data.";

						_resolveOnToManyRelationship(resolveOneToManyDeferred, relations.length - 2);

						resolveOneToManyDeferred.promise
							.then(_cascadeDeletes.bind(this))
							.then(resolve)
							.catch(reject);


					}.bind(table));
				}

				function _execute(data, trans, filters) {
					if (!!table.noInfoPath.relationships) {
						return _followRelations.call(table, table.noInfoPath, data);
					} else {
						return table.__delete.call(table, data, trans, filters)
							.catch(function (err) {
								console.error(err);
							});
					}

				}

				return _execute.call(table, data, trans, filters);
			};

			db.WriteableTable.prototype.noClear = function () {
				var deferred = $q.defer(),
					table = this,
					collection;

				//noLogService.log("adding: ", _dexie.currentUser);
				//noLogService.log(key);

				_dexie.transaction("rw", table, function () {
						Dexie.currentTransaction.nosync = true;
						collection = table.toCollection();

						collection.delete()
							.then(deferred.resolve)
							.catch(deferred.reject);

					})
					.then(angular.noop())
					.catch(function (err) {
						deferred.reject(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noOne = function (query, noReadOptions) {
				//console.log("noReadOptions", noReadOptions);
				var noFilters = noInfoPath.resolveID(query, this.noInfoPath);

				return this.noRead(noFilters, noReadOptions)
					.then(function (resultset) {
						var data;

						if (resultset.length === 0) {
							//throw "noIndexedDb::noOne: Record Not Found";
							return null;
						} else {
							data = resultset[0];
						}

						return data;
					});
			};

			db.WriteableTable.prototype.loadData = function (data) {
				var deferred = $q.defer(),
					table = this;

				//data = _unfollow_data(table, data);

				//console.warn(data);
				//noLogService.log("adding: ", _dexie.currentUser);

				_dexie.transaction("rw", table, function () {
					_dexie.nosync = true;

					table.add(data)
						.then(deferred.resolve)
						.catch(function (table, data, err) {
							//console.error(err);
							deferred.reject({table: table, data: data, error: err});
						}.bind(null, table, data));
				});

				return deferred.promise;

			};

			db.WriteableTable.prototype.bulkLoad = function (data, progress) {
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

					_dexie.transaction('rw', table, function () {
						Dexie.currentTransaction.nosync = true;
						_next();
					});


					function _next() {
						if (currentItem < data.length) {
							var datum = data[currentItem];

							table.add(datum)
								.then(function (data) {
									//progress.updateRow(progress.rows);
									deferred.notify(data);
								})
								.catch(function (err) {
									deferred.reject(err);
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

				table.clear()
					.then(function () {
						_import(data, progress);
					}.bind(this))
					.catch(function (err) {
						console.error(err);
					});

				return deferred.promise;
			};

			db.WriteableTable.prototype.noImport = function (noChange) {
				var THIS = this;

				function checkForExisting() {
					var id = noChange.changedPKID;

					return $q(function (resolve, reject) {
						THIS.noOne(id)
							.then(resolve)
							.catch(function (err) {
								//console.error(err);
								resolve(false);
								return false;
							});
					});
				}

				function isSame(data, changes) {
					if (!!data) {
						var localDate = new Date(data.ModifiedDate),
							remoteDate = new Date(changes.ModifiedDate),
							same = moment(localDate).isSame(remoteDate, 'second');

						return same;
					} else {
						return false;
					}
				}

				function save(changes, data, resolve, reject) {
					var ops = {
						"I": THIS.noCreate.bind(THIS),
						"U": THIS.noUpdate.bind(THIS)
					};
					//console.log(data, changes);
					if (isSame(data, changes.values)) {
						//console.warn("not updating local data because the ModifiedDate is the same or newer than the data being synced.");
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
						//console.log(data);
						resolve(data);
					}

					function fault(err) {
						//console.error(err);
						reject(err);
					}

					checkForExisting()
						.then(function (data) {
							//console.log("checkForExisting", !!data);
							// if(data) {
							switch (noChange.operation) {
							case "D":
								var t = {};

								t[THIS.noInfoPath.primaryKey] = noChange.changedPKID;

								THIS.noDestroy(t)
									.then(ok)
									.catch(fault);
								break;

							case "I":
								if (!data) {
									save(noChange, data, ok, fault);
								} else {
									noChange.isSame = true;
									resolve(noChange);
								}
								break;
							case "U":
								if (data) {
									save(noChange, data, ok, fault);
								} else {
									resolve(data);
								}
								break;
							}
							// }else{
							// 	resolve({});
							// }

						});
				});
			};

			db.WriteableTable.prototype.bulkLoadOne = function (datum) {
				var table = this;

				_dexie.transaction('rw', table, function () {
					Dexie.currentTransaction.nosync = true;
					_next();
				});

				function _next() {
					return table.add(datum);
				}
			};

			db.WriteableTable.prototype.hasPrimaryKeys = function (keyList) {
				return this.where(":id").anyOfIgnoreCase(keyList).primaryKeys();
			};

			function _unfollow_data(table, data) {
				var foreignKeys = table.noInfoPath.foreignKeys || {};

				for (var fks in foreignKeys) {

					var fk = foreignKeys[fks],
						datum = data[fk.column];

					if (datum) {
						data[fk.column] = datum[fk.refColumn] || datum;
					}
				}

				return data;
			}

		}

		this.destroyDb = function (databaseName) {
			var deferred = $q.defer();
			var db = _noIndexedDb.getDatabase(databaseName);
			if (db) {
				db.delete()
					.then(function (res) {
						delete $rootScope["noIndexedDb_" + databaseName];
						deferred.resolve(res);
					});
			} else {
				deferred.resolve(false);
			}
			return deferred.promise;
		};


		/**
		 *	### Class noDatum
		 *	This is a contructor function used by Dexie when creating and returning data objects.
		 */
		function noDatum() {
			console.log("noDatum::constructor"); //NOTE: This never seems to get called.
		}

		Dexie.addons.push(noDexie);

	}

	angular.module("noinfopath.data")
		.factory("noIndexedDb", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function ($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {
			return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}])

	.factory("noIndexedDB", ['$timeout', '$q', '$rootScope', "lodash", "noLogService", "noLocalStorage", function ($timeout, $q, $rootScope, _, noLogService, noLocalStorage) {
		return new NoIndexedDbService($timeout, $q, $rootScope, _, noLogService, noLocalStorage);
		}]);

})(angular, Dexie);
