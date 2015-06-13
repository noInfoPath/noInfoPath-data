/* Minimalistic IndexedDB Wrapper with Bullet Proof Transactions
   =============================================================

   By David Fahlander, david.fahlander@gmail.com

   Version 1.1 - May 26, 2015.

   Tested successfully on Chrome, IE, Firefox and Opera.

   Official Website: https://github.com/dfahlander/Dexie.js/wiki/Dexie.js

   Licensed under the Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
*/
(function (global, publish, undefined) {

    "use strict";

    function extend(obj, extension) {
        if (typeof extension !== 'object') extension = extension(); // Allow to supply a function returning the extension. Useful for simplifying private scopes.
        Object.keys(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
        return obj;
    }

    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                Child.prototype.constructor = Child;
                return {
                    extend: function (extension) {
                        extend(Child.prototype, typeof extension !== 'object' ? extension(Parent.prototype) : extension);
                    }
                };
            }
        };
    }

    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }

    function Dexie(dbName, options) {
        /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
        var addons = (options && options.addons) || Dexie.addons;
        // Resolve all external dependencies:
        var deps = Dexie.dependencies;
        var indexedDB = deps.indexedDB,
            IDBKeyRange = deps.IDBKeyRange,
            IDBTransaction = deps.IDBTransaction;

        var DOMError = deps.DOMError,
            TypeError = deps.TypeError,
            Error = deps.Error;

        var globalSchema = this._dbSchema = {};
        var versions = [];
        var dbStoreNames = [];
        var allTables = {};
        var notInTransFallbackTables = {};
        ///<var type="IDBDatabase" />
        var idbdb = null; // Instance of IDBDatabase
        var db_is_blocked = true;
        var dbOpenError = null;
        var isBeingOpened = false;
        var READONLY = "readonly", READWRITE = "readwrite";
        var db = this;
        var pausedResumeables = [];
        var autoSchema = false;
        var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn();

        function init() {
            // If browser (not node.js or other), subscribe to versionchange event and reload page
            db.on("versionchange", function (ev) {
                // Default behavior for versionchange event is to close database connection.
                // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
                // Let's not block the other window from making it's delete() or open() call.
                db.close();
                db.on('error').fire(new Error("Database version changed by other database connection."));
                // In many web applications, it would be recommended to force window.reload()
                // when this event occurs. Do do that, subscribe to the versionchange event
                // and call window.location.reload(true);
            });
        }

        //
        //
        //
        // ------------------------- Versioning Framework---------------------------
        //
        //
        //

        this.version = function (versionNumber) {
            /// <param name="versionNumber" type="Number"></param>
            /// <returns type="Version"></returns>
            if (idbdb) throw new Error("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            var versionInstance = versions.filter(function (v) { return v._cfg.version === versionNumber; })[0];
            if (versionInstance) return versionInstance;
            versionInstance = new Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            return versionInstance;
        }; 

        function Version(versionNumber) {
            this._cfg = {
                version: versionNumber,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null
            }; 
            this.stores({}); // Derive earlier schemas by default.
        }

        extend(Version.prototype, {
            stores: function (stores) {
                /// <summary>
                ///   Defines the schema for a particular version
                /// </summary>
                /// <param name="stores" type="Object">
                /// Example: <br/>
                ///   {users: "id++,first,last,&amp;username,*email", <br/>
                ///   passwords: "id++,&amp;username"}<br/>
                /// <br/>
                /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
                /// Special characters:<br/>
                ///  "&amp;"  means unique key, <br/>
                ///  "*"  means value is multiEntry, <br/>
                ///  "++" means auto-increment and only applicable for primary key <br/>
                /// </param>
                this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;

                // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
                var storesSpec = {};
                versions.forEach(function (version) { // 'versions' is always sorted by lowest version first.
                    extend(storesSpec, version._cfg.storesSource);
                });

                var dbschema = (this._cfg.dbschema = {});
                this._parseStoresSpec(storesSpec, dbschema);
                // Update the latest schema to this version
                // Update API
                globalSchema = db._dbSchema = dbschema;
                removeTablesApi([allTables, db, notInTransFallbackTables]);
                setApiOnPlace([notInTransFallbackTables], tableNotInTransaction, Object.keys(dbschema), READWRITE, dbschema);
                setApiOnPlace([allTables, db, this._cfg.tables], db._transPromiseFactory, Object.keys(dbschema), READWRITE, dbschema, true);
                dbStoreNames = Object.keys(dbschema);
                return this;
            },
            upgrade: function (upgradeFunction) {
                /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
                var self = this;
                fakeAutoComplete(function () {
                    upgradeFunction(db._createTransaction(READWRITE, Object.keys(self._cfg.dbschema), self._cfg.dbschema));// BUGBUG: No code completion for prev version's tables wont appear.
                });
                this._cfg.contentUpgrade = upgradeFunction;
                return this;
            },
            _parseStoresSpec: function (stores, outSchema) {
                Object.keys(stores).forEach(function (tableName) {
                    if (stores[tableName] !== null) {
                        var instanceTemplate = {};
                        var indexes = parseIndexSyntax(stores[tableName]);
                        var primKey = indexes.shift();
                        if (primKey.multi) throw new Error("Primary key cannot be multi-valued");
                        if (primKey.keyPath && primKey.auto) setByKeyPath(instanceTemplate, primKey.keyPath, 0);
                        indexes.forEach(function (idx) {
                            if (idx.auto) throw new Error("Only primary key can be marked as autoIncrement (++)");
                            if (!idx.keyPath) throw new Error("Index must have a name and cannot be an empty string");
                            setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () { return ""; }) : "");
                        });
                        outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                    }
                });
            }
        });

        function runUpgraders(oldVersion, idbtrans, reject, openReq) {
            if (oldVersion === 0) {
                //globalSchema = versions[versions.length - 1]._cfg.dbschema;
                // Create tables:
                Object.keys(globalSchema).forEach(function (tableName) {
                    createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                // Populate data
                var t = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
                t.idbtrans = idbtrans;
                t.idbtrans.onerror = eventRejectHandler(reject, ["populating database"]);
                t.on('error').subscribe(reject);
                Promise.newPSD(function () {
                    Promise.PSD.trans = t;
                    try {
                        db.on("populate").fire(t);
                    } catch (err) {
                        openReq.onerror = idbtrans.onerror = function (ev) { ev.preventDefault(); };  // Prohibit AbortError fire on db.on("error") in Firefox.
                        try { idbtrans.abort(); } catch (e) { }
                        idbtrans.db.close();
                        reject(err);
                    }
                });
            } else {
                // Upgrade version to version, step-by-step from oldest to newest version.
                // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
                var queue = [];
                var oldVersionStruct = versions.filter(function (version) { return version._cfg.version === oldVersion; })[0];
                if (!oldVersionStruct) throw new Error("Dexie specification of currently installed DB version is missing");
                globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
                var anyContentUpgraderHasRun = false;

                var versToRun = versions.filter(function (v) { return v._cfg.version > oldVersion; });
                versToRun.forEach(function (version) {
                    /// <param name="version" type="Version"></param>
                    var oldSchema = globalSchema;
                    var newSchema = version._cfg.dbschema;
                    adjustToExistingIndexNames(oldSchema, idbtrans);
                    adjustToExistingIndexNames(newSchema, idbtrans);
                    globalSchema = db._dbSchema = newSchema;
                    {
                        var diff = getSchemaDiff(oldSchema, newSchema);
                        diff.add.forEach(function (tuple) {
                            queue.push(function (idbtrans, cb) {
                                createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                                cb();
                            });
                        });
                        diff.change.forEach(function (change) {
                            if (change.recreate) {
                                throw new Error("Not yet support for changing primary key");
                            } else {
                                queue.push(function (idbtrans, cb) {
                                    var store = idbtrans.objectStore(change.name);
                                    change.add.forEach(function (idx) {
                                        addIndex(store, idx);
                                    });
                                    change.change.forEach(function (idx) {
                                        store.deleteIndex(idx.name);
                                        addIndex(store, idx);
                                    });
                                    change.del.forEach(function (idxName) {
                                        store.deleteIndex(idxName);
                                    });
                                    cb();
                                });
                            }
                        });
                        if (version._cfg.contentUpgrade) {
                            queue.push(function (idbtrans, cb) {
                                anyContentUpgraderHasRun = true;
                                var t = db._createTransaction(READWRITE, [].slice.call(idbtrans.db.objectStoreNames, 0), newSchema);
                                t.idbtrans = idbtrans;
                                var uncompletedRequests = 0;
                                t._promise = override(t._promise, function (orig_promise) {
                                    return function (mode, fn, writeLock) {
                                        ++uncompletedRequests;
                                        function proxy(fn) {
                                            return function () {
                                                fn.apply(this, arguments);
                                                if (--uncompletedRequests === 0) cb(); // A called db operation has completed without starting a new operation. The flow is finished, now run next upgrader.
                                            }
                                        }
                                        return orig_promise.call(this, mode, function (resolve, reject, trans) {
                                            arguments[0] = proxy(resolve);
                                            arguments[1] = proxy(reject);
                                            fn.apply(this, arguments);
                                        }, writeLock);
                                    };
                                });
                                idbtrans.onerror = eventRejectHandler(reject, ["running upgrader function for version", version._cfg.version]);
                                t.on('error').subscribe(reject);
                                version._cfg.contentUpgrade(t);
                                if (uncompletedRequests === 0) cb(); // contentUpgrade() didnt call any db operations at all.
                            });
                        }
                        if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug()) { // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
                            queue.push(function (idbtrans, cb) {
                                // Delete old tables
                                deleteRemovedTables(newSchema, idbtrans);
                                cb();
                            });
                        }
                    }
                });

                // Now, create a queue execution engine
                var runNextQueuedFunction = function () {
                    try {
                        if (queue.length)
                            queue.shift()(idbtrans, runNextQueuedFunction);
                        else
                            createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
                    } catch (err) {
                        openReq.onerror = idbtrans.onerror = function (ev) { ev.preventDefault(); };  // Prohibit AbortError fire on db.on("error") in Firefox.
                        try { idbtrans.abort(); } catch(e) {}
                        idbtrans.db.close();
                        reject(err);
                    }
                };
                runNextQueuedFunction();
            }
        }

        function getSchemaDiff(oldSchema, newSchema) {
            var diff = {
                del: [], // Array of table names
                add: [], // Array of [tableName, newDefinition]
                change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
            };
            for (var table in oldSchema) {
                if (!newSchema[table]) diff.del.push(table);
            }
            for (var table in newSchema) {
                var oldDef = oldSchema[table],
                    newDef = newSchema[table];
                if (!oldDef) diff.add.push([table, newDef]);
                else {
                    var change = {
                        name: table,
                        def: newSchema[table],
                        recreate: false,
                        del: [],
                        add: [],
                        change: []
                    };
                    if (oldDef.primKey.src !== newDef.primKey.src) {
                        // Primary key has changed. Remove and re-add table.
                        change.recreate = true;
                        diff.change.push(change);
                    } else {
                        var oldIndexes = oldDef.indexes.reduce(function (prev, current) { prev[current.name] = current; return prev; }, {});
                        var newIndexes = newDef.indexes.reduce(function (prev, current) { prev[current.name] = current; return prev; }, {});
                        for (var idxName in oldIndexes) {
                            if (!newIndexes[idxName]) change.del.push(idxName);
                        }
                        for (var idxName in newIndexes) {
                            var oldIdx = oldIndexes[idxName],
                                newIdx = newIndexes[idxName];
                            if (!oldIdx) change.add.push(newIdx);
                            else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
                        }
                        if (change.recreate || change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                            diff.change.push(change);
                        }
                    }
                }
            }
            return diff;
        }

        function createTable(idbtrans, tableName, primKey, indexes) {
            /// <param name="idbtrans" type="IDBTransaction"></param>
            var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
            indexes.forEach(function (idx) { addIndex(store, idx); });
            return store;
        }

        function createMissingTables(newSchema, idbtrans) {
            Object.keys(newSchema).forEach(function (tableName) {
                if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                    createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
                }
            });
        }

        function deleteRemovedTables(newSchema, idbtrans) {
            for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
                var storeName = idbtrans.db.objectStoreNames[i];
                if (newSchema[storeName] === null || newSchema[storeName] === undefined) {
                    idbtrans.db.deleteObjectStore(storeName);
                }
            }
        }

        function addIndex(store, idx) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
        }

        //
        //
        //      Dexie Protected API
        //
        //

        this._allTables = allTables;

        this._tableFactory = function createTable(mode, tableSchema, transactionPromiseFactory) {
            /// <param name="tableSchema" type="TableSchema"></param>
            if (mode === READONLY)
                return new Table(tableSchema.name, transactionPromiseFactory, tableSchema, Collection);
            else
                return new WriteableTable(tableSchema.name, transactionPromiseFactory, tableSchema);
        }; 

        this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
            return new Transaction(mode, storeNames, dbschema, parentTransaction);
        }; 

        function tableNotInTransaction(mode, storeNames) {
            throw new Error("Table " + storeNames[0] + " not part of transaction. Original Scope Function Source: " + Dexie.Promise.PSD.trans.scopeFunc.toString());
        }

        this._transPromiseFactory = function transactionPromiseFactory(mode, storeNames, fn) { // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
            if (db_is_blocked && (!Promise.PSD || !Promise.PSD.letThrough)) {
                // Database is paused. Wait til resumed.
                var blockedPromise = new Promise(function (resolve, reject) {
                    pausedResumeables.push({
                        resume: function () {
                            var p = db._transPromiseFactory(mode, storeNames, fn);
                            blockedPromise.onuncatched = p.onuncatched;
                            p.then(resolve, reject);
                        }
                    });
                });
                return blockedPromise;
            } else {
                var trans = db._createTransaction(mode, storeNames, globalSchema);
                return trans._promise(mode, function (resolve, reject) {
                    // An uncatched operation will bubble to this anonymous transaction. Make sure
                    // to continue bubbling it up to db.on('error'):
                    trans.error(function (err) {
                        db.on('error').fire(err);
                    });
                    fn(function (value) {
                        // Instead of resolving value directly, wait with resolving it until transaction has completed.
                        // Otherwise the data would not be in the DB if requesting it in the then() operation.
                        // Specifically, to ensure that the following expression will work:
                        //
                        //   db.friends.put({name: "Arne"}).then(function () {
                        //       db.friends.where("name").equals("Arne").count(function(count) {
                        //           assert (count === 1);
                        //       });
                        //   });
                        //
                        trans.complete(function () {
                            resolve(value);
                        });
                    }, reject, trans);
                });
            }
        }; 

        this._whenReady = function (fn) {
            if (db_is_blocked && (!Promise.PSD || !Promise.PSD.letThrough)) {
                return new Promise(function (resolve, reject) {
                    fakeAutoComplete(function () { new Promise(function () { fn(resolve, reject); }); });
                    pausedResumeables.push({
                        resume: function () {
                            fn(resolve, reject);
                        }
                    });
                });
            }
            return new Promise(fn);
        }; 

        //
        //
        //
        //
        //      Dexie API
        //
        //
        //

        this.verno = 0;

        this.open = function () {
            return new Promise(function (resolve, reject) {
                if (idbdb || isBeingOpened) throw new Error("Database already opened or being opened");
                var req, dbWasCreated = false;
                function openError(err) {
                    try { req.transaction.abort(); } catch (e) { }
                    /*if (dbWasCreated) {
                        // Workaround for issue with some browsers. Seem not to be needed though.
                        // Unit test "Issue#100 - not all indexes are created" works without it on chrome,FF,opera and IE.
                        idbdb.close();
                        indexedDB.deleteDatabase(db.name); 
                    }*/
                    isBeingOpened = false;
                    dbOpenError = err;
                    db_is_blocked = false;
                    reject(dbOpenError);
                    pausedResumeables.forEach(function (resumable) {
                        // Resume all stalled operations. They will fail once they wake up.
                        resumable.resume();
                    });
                    pausedResumeables = [];
                }
                try {
                    dbOpenError = null;
                    isBeingOpened = true;

                    // Make sure caller has specified at least one version
                    if (versions.length === 0) {
                        autoSchema = true;
                    }

                    // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE: 
                    // IE fails when deleting objectStore after reading from it.
                    // A future version of Dexie.js will stopover an intermediate version to workaround this.
                    // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
                    if (!indexedDB) throw new Error("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using Safari, make sure to include indexedDB polyfill.");
                    req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
                    req.onerror = eventRejectHandler(openError, ["opening database", dbName]);
                    req.onblocked = function (ev) {
                        db.on("blocked").fire(ev);
                    }; 
                    req.onupgradeneeded = trycatch (function (e) {
                        if (autoSchema && !db._allowEmptyDB) { // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
                            // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                            // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we 
                            // do not create a new database by accident here.
                            req.onerror = function (event) { event.preventDefault(); }; // Prohibit onabort error from firing before we're done!
                            req.transaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                            // Close database and delete it.
                            req.result.close();
                            var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                            delreq.onsuccess = delreq.onerror = function () {
                                openError(new Error("Database '" + dbName + "' doesnt exist"));
                            }; 
                        } else {
                            if (e.oldVersion === 0) dbWasCreated = true;
                            req.transaction.onerror = eventRejectHandler(openError);
                            var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                            runUpgraders(oldVer / 10, req.transaction, openError, req);
                        }
                    }, openError);
                    req.onsuccess = trycatch(function (e) {
                        isBeingOpened = false;
                        idbdb = req.result;
                        if (autoSchema) readGlobalSchema();
                        else if (idbdb.objectStoreNames.length > 0)
                            adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                        idbdb.onversionchange = db.on("versionchange").fire; // Not firing it here, just setting the function callback to any registered subscriber.
                        if (!hasNativeGetDatabaseNames) {
                            // Update localStorage with list of database names
                            globalDatabaseList(function (databaseNames) {
                                if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
                            });
                        }
                        // Now, let any subscribers to the on("ready") fire BEFORE any other db operations resume!
                        // If an the on("ready") subscriber returns a Promise, we will wait til promise completes or rejects before 
                        Promise.newPSD(function () {
                            Promise.PSD.letThrough = true; // Set a Promise-Specific Data property informing that onready is firing. This will make db._whenReady() let the subscribers use the DB but block all others (!). Quite cool ha?
                            try {
                                var res = db.on.ready.fire();
                                if (res && typeof res.then === 'function') {
                                    // If on('ready') returns a promise, wait for it to complete and then resume any pending operations.
                                    res.then(resume, function (err) {
                                        idbdb.close();
                                        idbdb = null;
                                        openError(err);
                                    });
                                } else {
                                    asap(resume); // Cannot call resume directly because then the pauseResumables would inherit from our PSD scope.
                                }
                            } catch (e) {
                                openError(e);
                            }

                            function resume() {
                                db_is_blocked = false;
                                pausedResumeables.forEach(function (resumable) {
                                    // If anyone has made operations on a table instance before the db was opened, the operations will start executing now.
                                    resumable.resume();
                                });
                                pausedResumeables = [];
                                resolve();
                            }
                        });
                    }, openError);
                } catch (err) {
                    openError(err);
                }
            });
        }; 

        this.close = function () {
            if (idbdb) {
                idbdb.close();
                idbdb = null;
                db_is_blocked = true;
                dbOpenError = null;
            }
        }; 

        this.delete = function () {
            var args = arguments;
            return new Promise(function (resolve, reject) {
                if (args.length > 0) throw new Error("Arguments not allowed in db.delete()");
                function doDelete() {
                    db.close();
                    var req = indexedDB.deleteDatabase(dbName);
                    req.onsuccess = function () {
                        if (!hasNativeGetDatabaseNames) {
                            globalDatabaseList(function(databaseNames) {
                                var pos = databaseNames.indexOf(dbName);
                                if (pos >= 0) return databaseNames.splice(pos, 1);
                            });
                        }
                        resolve();
                    };
                    req.onerror = eventRejectHandler(reject, ["deleting", dbName]);
                    req.onblocked = function() {
                        db.on("blocked").fire();
                    };
                }
                if (isBeingOpened) {
                    pausedResumeables.push({ resume: doDelete });
                } else {
                    doDelete();
                }
            });
        }; 

        this.backendDB = function () {
            return idbdb;
        }; 

        this.isOpen = function () {
            return idbdb !== null;
        }; 
        this.hasFailed = function () {
            return dbOpenError !== null;
        };
        this.dynamicallyOpened = function() {
            return autoSchema;
        }

        /*this.dbg = function (collection, counter) {
            if (!this._dbgResult || !this._dbgResult[counter]) {
                if (typeof collection === 'string') collection = this.table(collection).toCollection().limit(100);
                if (!this._dbgResult) this._dbgResult = [];
                var db = this;
                new Promise(function () {
                    Promise.PSD.letThrough = true;
                    db._dbgResult[counter] = collection.toArray();
                });
            }
            return this._dbgResult[counter]._value;
        }*/

        //
        // Properties
        //
        this.name = dbName;

        // db.tables - an array of all Table instances.
        // TODO: Change so that tables is a simple member and make sure to update it whenever allTables changes.
        Object.defineProperty(this, "tables", {
            get: function () {
                /// <returns type="Array" elementType="WriteableTable" />
                return Object.keys(allTables).map(function (name) { return allTables[name]; });
            }
        });

        //
        // Events
        //
        this.on = events(this, "error", "populate", "blocked", { "ready": [promisableChain, nop], "versionchange": [reverseStoppableEventChain, nop] });

        // Handle on('ready') specifically: If DB is already open, trigger the event immediately. Also, default to unsubscribe immediately after being triggered.
        this.on.ready.subscribe = override(this.on.ready.subscribe, function (origSubscribe) {
            return function (subscriber, bSticky) {
                function proxy () {
                    if (!bSticky) db.on.ready.unsubscribe(proxy);
                    return subscriber.apply(this, arguments);
                }
                origSubscribe.call(this, proxy);
                if (db.isOpen()) {
                    if (db_is_blocked) {
                        pausedResumeables.push({ resume: proxy });
                    } else {
                        proxy();
                    }
                }
            };
        });

        fakeAutoComplete(function () {
            db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
            db.on("error").fire(new Error());
        });

        this.transaction = function (mode, tableInstances, scopeFunc) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
            /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
            /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

            // Let table arguments be all arguments between mode and last argument.
            tableInstances = [].slice.call(arguments, 1, arguments.length - 1);
            // Let scopeFunc be the last argument
            scopeFunc = arguments[arguments.length - 1];
            var parentTransaction = Promise.PSD && Promise.PSD.trans;
            // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
            if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
            var onlyIfCompatible = mode.indexOf('?') !== -1;
            mode = mode.replace('!', '').replace('?', '');
            //
            // Get storeNames from arguments. Either through given table instances, or through given table names.
            //
            var tables = Array.isArray(tableInstances[0]) ? tableInstances.reduce(function (a, b) { return a.concat(b); }) : tableInstances;
            var error = null;
            var storeNames = tables.map(function (tableInstance) {
                if (typeof tableInstance === "string") {
                    return tableInstance;
                } else {
                    if (!(tableInstance instanceof Table)) error = error || new TypeError("Invalid type. Arguments following mode must be instances of Table or String");
                    return tableInstance.name;
                }
            });

            //
            // Resolve mode. Allow shortcuts "r" and "rw".
            //
            if (mode == "r" || mode == READONLY)
                mode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
                mode = READWRITE;
            else
                error = new Error("Invalid transaction mode: " + mode);

            if (parentTransaction) {
                // Basic checks
                if (!error) {
                    if (parentTransaction && parentTransaction.mode === READONLY && mode === READWRITE) {
                        if (onlyIfCompatible) parentTransaction = null; // Spawn new transaction instead.
                        else error = error || new Error("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                    }
                    if (parentTransaction) {
                        storeNames.forEach(function (storeName) {
                            if (!parentTransaction.tables.hasOwnProperty(storeName)) {
                                if (onlyIfCompatible) parentTransaction = null; // Spawn new transaction instead.
                                else error = error || new Error("Table " + storeName + " not included in parent transaction. Parent Transaction function: " + parentTransaction.scopeFunc.toString());
                            }
                        });
                    }
                }
            }
            if (parentTransaction) {
                // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
                return parentTransaction._promise(mode, enterTransactionScope, "lock");
            } else {
                // If this is a root-level transaction, wait til database is ready and then launch the transaction.
                return db._whenReady(enterTransactionScope);
            }

            function enterTransactionScope(resolve, reject) {
                // Our transaction. To be set later.
                var trans = null;

                try {
                    // Throw any error if any of the above checks failed.
                    // Real error defined some lines up. We throw it here from within a Promise to reject Promise
                    // rather than make caller need to both use try..catch and promise catching. The reason we still
                    // throw here rather than do Promise.reject(error) is that we like to have the stack attached to the
                    // error. Also because there is a catch() clause bound to this try() that will bubble the error
                    // to the parent transaction.
                    if (error) throw error;

                    //
                    // Create Transaction instance
                    //
                    trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);

                    // Provide arguments to the scope function (for backward compatibility)
                    var tableArgs = storeNames.map(function (name) { return trans.tables[name]; });
                    tableArgs.push(trans);

                    // If transaction completes, resolve the Promise with the return value of scopeFunc.
                    var returnValue;
                    var uncompletedRequests = 0;

                    // Create a new PSD frame to hold Promise.PSD.trans. Must not be bound to the current PSD frame since we want
                    // it to pop before then() callback is called of our returned Promise.
                    Promise.newPSD(function () {
                        // Let the transaction instance be part of a Promise-specific data (PSD) value.
                        Promise.PSD.trans = trans;
                        trans.scopeFunc = scopeFunc; // For Error ("Table " + storeNames[0] + " not part of transaction") when it happens. This may help localizing the code that started a transaction used on another place.

                        if (parentTransaction) {
                            // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                            trans.idbtrans = parentTransaction.idbtrans;
                            trans._promise = override(trans._promise, function (orig) {
                                return function (mode, fn, writeLock) {
                                    ++uncompletedRequests;
                                    function proxy(fn2) {
                                        return function (val) {
                                            var retval;
                                            // _rootExec needed so that we do not loose any IDBTransaction in a setTimeout() call.
                                            Promise._rootExec(function () {
                                                retval = fn2(val);
                                                // _tickFinalize makes sure to support lazy micro tasks executed in Promise._rootExec().
                                                // We certainly do not want to copy the bad pattern from IndexedDB but instead allow
                                                // execution of Promise.then() callbacks until the're all done.
                                                Promise._tickFinalize(function () {
                                                    if (--uncompletedRequests === 0 && trans.active) {
                                                        trans.active = false;
                                                        trans.on.complete.fire(); // A called db operation has completed without starting a new operation. The flow is finished
                                                    }
                                                });
                                            });
                                            return retval;
                                        }
                                    }
                                    return orig.call(this, mode, function (resolve2, reject2, trans) {
                                        return fn(proxy(resolve2), proxy(reject2), trans);
                                    }, writeLock);
                                };
                            });
                        }
                        trans.complete(function () {
                            resolve(returnValue);
                        });
                        // If transaction fails, reject the Promise and bubble to db if noone catched this rejection.
                        trans.error(function (e) {
                            if (trans.idbtrans) trans.idbtrans.onerror = preventDefault; // Prohibit AbortError from firing.
                            try {trans.abort();} catch(e2){}
                            if (parentTransaction) {
                                parentTransaction.active = false;
                                parentTransaction.on.error.fire(e); // Bubble to parent transaction
                            }
                            var catched = reject(e);
                            if (!parentTransaction && !catched) {
                                db.on.error.fire(e);// If not catched, bubble error to db.on("error").
                            }
                        });

                        // Finally, call the scope function with our table and transaction arguments.
                        Promise._rootExec(function() {
                            returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
                        });
                    });
                    if (!trans.idbtrans || (parentTransaction && uncompletedRequests === 0)) {
                        trans._nop(); // Make sure transaction is being used so that it will resolve.
                    }
                } catch (e) {
                    // If exception occur, abort the transaction and reject Promise.
                    if (trans && trans.idbtrans) trans.idbtrans.onerror = preventDefault; // Prohibit AbortError from firing.
                    if (trans) trans.abort();
                    if (parentTransaction) parentTransaction.on.error.fire(e);
                    asap(function () {
                        // Need to use asap(=setImmediate/setTimeout) before calling reject because we are in the Promise constructor and reject() will always return false if so.
                        if (!reject(e)) db.on("error").fire(e); // If not catched, bubble exception to db.on("error");
                    });
                }
            }
        }; 

        this.table = function (tableName) {
            /// <returns type="WriteableTable"></returns>
            if (!autoSchema && !allTables.hasOwnProperty(tableName)) { throw new Error("Table does not exist"); return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
            return allTables[tableName];
        }; 

        //
        //
        //
        // Table Class
        //
        //
        //
        function Table(name, transactionPromiseFactory, tableSchema, collClass) {
            /// <param name="name" type="String"></param>
            this.name = name;
            this.schema = tableSchema;
            this.hook = allTables[name] ? allTables[name].hook : events(null, {
                "creating": [hookCreatingChain, nop],
                "reading": [pureFunctionChain, mirror],
                "updating": [hookUpdatingChain, nop],
                "deleting": [nonStoppableEventChain, nop]
            });
            this._tpf = transactionPromiseFactory;
            this._collClass = collClass || Collection;
        }

        extend(Table.prototype, function () {
            function failReadonly() {
                throw new Error("Current Transaction is READONLY");
            }
            return {
                //
                // Table Protected Methods
                //

                _trans: function getTransaction(mode, fn, writeLocked) {
                    return this._tpf(mode, [this.name], fn, writeLocked);
                },
                _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
                    var self = this;
                    return this._tpf(mode, [this.name], function (resolve, reject, trans) {
                        fn(resolve, reject, trans.idbtrans.objectStore(self.name), trans);
                    }, writeLocked);
                },

                //
                // Table Public Methods
                //
                get: function (key, cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb(self.schema.instanceTemplate); });
                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                        var req = idbstore.get(key);
                        req.onerror = eventRejectHandler(reject, ["getting", key, "from", self.name]);
                        req.onsuccess = function () {
                            resolve(self.hook.reading.fire(req.result));
                        };
                    }).then(cb);
                },
                where: function (indexName) {
                    return new WhereClause(this, indexName);
                },
                count: function (cb) {
                    return this.toCollection().count(cb);
                },
                offset: function (offset) {
                    return this.toCollection().offset(offset);
                },
                limit: function (numRows) {
                    return this.toCollection().limit(numRows);
                },
                reverse: function () {
                    return this.toCollection().reverse();
                },
                filter: function (filterFunction) {
                    return this.toCollection().and(filterFunction);
                },
                each: function (fn) {
                    var self = this;
                    fakeAutoComplete(function () { fn(self.schema.instanceTemplate); });
                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                        var req = idbstore.openCursor();
                        req.onerror = eventRejectHandler(reject, ["calling", "Table.each()", "on", self.name]);
                        iterate(req, null, fn, resolve, reject, self.hook.reading.fire);
                    });
                },
                toArray: function (cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb([self.schema.instanceTemplate]); });
                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                        var a = [];
                        var req = idbstore.openCursor();
                        req.onerror = eventRejectHandler(reject, ["calling", "Table.toArray()", "on", self.name]);
                        iterate(req, null, function (item) { a.push(item); }, function () { resolve(a); }, reject, self.hook.reading.fire);
                    }).then(cb);
                },
                orderBy: function (index) {
                    return new this._collClass(new WhereClause(this, index));
                },

                toCollection: function () {
                    return new this._collClass(new WhereClause(this));
                },

                mapToClass: function (constructor, structure) {
                    /// <summary>
                    ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
                    ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
                    /// </summary>
                    /// <param name="constructor">Constructor function representing the class.</param>
                    /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                    /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
                    this.schema.mappedClass = constructor;
                    var instanceTemplate = Object.create(constructor.prototype);
                    if (this.schema.primKey.keyPath) {
                        // Make sure primary key is not part of prototype because add() and put() fails on Chrome if primKey template lies on prototype due to a bug in its implementation
                        // of getByKeyPath(), that it accepts getting from prototype chain.
                        setByKeyPath(instanceTemplate, this.schema.primKey.keyPath, this.schema.primKey.auto ? 0 : "");
                        delByKeyPath(constructor.prototype, this.schema.primKey.keyPath);
                    }
                    if (structure) {
                        // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                        applyStructure(instanceTemplate, structure);
                    }
                    this.schema.instanceTemplate = instanceTemplate;

                    // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
                    // no matter which method to use for reading (Table.get() or Table.where(...)... )
                    var readHook = Object.setPrototypeOf ?
                        function makeInherited(obj) {
                            if (!obj) return obj; // No valid object. (Value is null). Return as is.
                            // Object.setPrototypeOf() supported. Just change that pointer on the existing object. A little more efficient way.
                            Object.setPrototypeOf(obj, constructor.prototype);
                            return obj;
                        } : function makeInherited(obj) {
                            if (!obj) return obj; // No valid object. (Value is null). Return as is.
                            // Object.setPrototypeOf not supported (IE10)- return a new object and clone the members from the old one.
                            var res = Object.create(constructor.prototype);
                            for (var m in obj) if (obj.hasOwnProperty(m)) res[m] = obj[m];
                            return res;
                        };

                    if (this.schema.readHook) {
                        this.hook.reading.unsubscribe(this.schema.readHook);
                    }
                    this.schema.readHook = readHook;
                    this.hook("reading", readHook);
                    return constructor;
                },
                defineClass: function (structure) {
                    /// <summary>
                    ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
                    ///     as well as making it possible to extend the prototype of the returned constructor function.
                    /// </summary>
                    /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                    /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
                    return this.mapToClass(Dexie.defineClass(structure), structure);
                },
                add: failReadonly,
                put: failReadonly,
                'delete': failReadonly,
                clear: failReadonly,
                update: failReadonly
            };
        });

        //
        //
        //
        // WriteableTable Class (extends Table)
        //
        //
        //
        function WriteableTable(name, transactionPromiseFactory, tableSchema, collClass) {
            Table.call(this, name, transactionPromiseFactory, tableSchema, collClass || WriteableCollection);
        }

        derive(WriteableTable).from(Table).extend(function () {
            return {
                add: function (obj, key) {
                    /// <summary>
                    ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
                    /// </summary>
                    /// <param name="obj" type="Object">A javascript object to insert</param>
                    /// <param name="key" optional="true">Primary key</param>
                    var self = this,
                        creatingHook = this.hook.creating.fire;
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                        var thisCtx = {};
                        if (creatingHook !== nop) {
                            var effectiveKey = key || (idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined);
                            var keyToUse = creatingHook.call(thisCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                            if (effectiveKey === undefined && keyToUse !== undefined) {
                                if (idbstore.keyPath)
                                    setByKeyPath(obj, idbstore.keyPath, keyToUse);
                                else
                                    key = keyToUse;
                            }
                        }
                        //try {
                            var req = key ? idbstore.add(obj, key) : idbstore.add(obj);
                            req.onerror = eventRejectHandler(function (e) {
                                if (thisCtx.onerror) thisCtx.onerror(e);
                                return reject(e);
                            }, ["adding", obj, "into", self.name]);
                            req.onsuccess = function (ev) {
                                var keyPath = idbstore.keyPath;
                                if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                                if (thisCtx.onsuccess) thisCtx.onsuccess(ev.target.result);
                                resolve(req.result);
                            };
                        /*} catch (e) {
                            trans.on("error").fire(e);
                            trans.abort();
                            reject(e);
                        }*/
                    });
                },

                put: function (obj, key) {
                    /// <summary>
                    ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
                    /// </summary>
                    /// <param name="obj" type="Object">A javascript object to insert or update</param>
                    /// <param name="key" optional="true">Primary key</param>
                    var self = this,
                        creatingHook = this.hook.creating.fire,
                        updatingHook = this.hook.updating.fire;
                    if (creatingHook !== nop || updatingHook !== nop) {
                        //
                        // People listens to when("creating") or when("updating") events!
                        // We must know whether the put operation results in an CREATE or UPDATE.
                        //
                        return this._trans(READWRITE, function (resolve, reject, trans) {
                            // Since key is optional, make sure we get it from obj if not provided
                            var effectiveKey = key || (self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath));
                            if (effectiveKey === undefined) {
                                // No primary key. Must use add().
                                trans.tables[self.name].add(obj).then(resolve, reject);
                            } else {
                                // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                                trans._lock(); // Needed because operation is splitted into modify() and add().
                                // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                                obj = deepClone(obj);
                                trans.tables[self.name].where(":id").equals(effectiveKey).modify(function (value) {
                                    // Replace extisting value with our object
                                    // CRUD event firing handled in WriteableCollection.modify()
                                    this.value = obj;
                                }).then(function (count) {
                                    if (count === 0) {
                                        // Object's key was not found. Add the object instead.
                                        // CRUD event firing will be done in add()
                                        return trans.tables[self.name].add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
                                    } else {
                                        return effectiveKey; // Resolve with the provided key.
                                    }
                                }).finally(function () {
                                    trans._unlock();
                                }).then(resolve, reject);
                            }
                        });
                    } else {
                        // Use the standard IDB put() method.
                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                            var req = key ? idbstore.put(obj, key) : idbstore.put(obj);
                            req.onerror = eventRejectHandler(reject, ["putting", obj, "into", self.name]);
                            req.onsuccess = function (ev) {
                                var keyPath = idbstore.keyPath;
                                if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                                resolve(req.result);
                            };
                        });
                    }
                },

                'delete': function (key) {
                    /// <param name="key">Primary key of the object to delete</param>
                    if (this.hook.deleting.subscribers.length) {
                        // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                        // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
                        return this.where(":id").equals(key).delete();
                    } else {
                        // No one listens. Use standard IDB delete() method.
                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                            var req = idbstore.delete(key);
                            req.onerror = eventRejectHandler(reject, ["deleting", key, "from", idbstore.name]);
                            req.onsuccess = function (ev) {
                                resolve(req.result);
                            };
                        });
                    }
                },

                clear: function () {
                    if (this.hook.deleting.subscribers.length) {
                        // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                        // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
                        return this.toCollection().delete();
                    } else {
                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                            var req = idbstore.clear();
                            req.onerror = eventRejectHandler(reject, ["clearing", idbstore.name]);
                            req.onsuccess = function (ev) {
                                resolve(req.result);
                            };
                        });
                    }
                },

                update: function (keyOrObject, modifications) {
                    if (typeof modifications !== 'object' || Array.isArray(modifications)) throw new Error("db.update(keyOrObject, modifications). modifications must be an object.");
                    if (typeof keyOrObject === 'object' && !Array.isArray(keyOrObject)) {
                        // object to modify. Also modify given object with the modifications:
                        Object.keys(modifications).forEach(function (keyPath) {
                            setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                        });
                        var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                        if (key === undefined) Promise.reject(new Error("Object does not contain its primary key"));
                        return this.where(":id").equals(key).modify(modifications);
                    } else {
                        // key to modify
                        return this.where(":id").equals(keyOrObject).modify(modifications);
                    }
                },
            };
        });

        //
        //
        //
        // Transaction Class
        //
        //
        //
        function Transaction(mode, storeNames, dbschema, parent) {
            /// <summary>
            ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
            /// </summary>
            /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
            /// <param name="storeNames" type="Array">Array of table names to operate on</param>
            var self = this;
            this.db = db;
            this.mode = mode;
            this.storeNames = storeNames;
            this.idbtrans = null;
            this.on = events(this, ["complete", "error"], "abort");
            this._reculock = 0;
            this._blockedFuncs = [];
            this._psd = null;
            this.active = true;
            this._dbschema = dbschema;
            if (parent) this.parent = parent;
            this._tpf = transactionPromiseFactory;
            this.tables = Object.create(notInTransFallbackTables); // ...so that all non-included tables exists as instances (possible to call table.name for example) but will fail as soon as trying to execute a query on it.

            function transactionPromiseFactory(mode, storeNames, fn, writeLocked) {
                // Creates a Promise instance and calls fn (resolve, reject, trans) where trans is the instance of this transaction object.
                // Support for write-locking the transaction during the promise life time from creation to success/failure.
                // This is actually not needed when just using single operations on IDB, since IDB implements this internally.
                // However, when implementing a write operation as a series of operations on top of IDB(collection.delete() and collection.modify() for example),
                // lock is indeed needed if Dexie APIshould behave in a consistent manner for the API user.
                // Another example of this is if we want to support create/update/delete events,
                // we need to implement put() using a series of other IDB operations but still need to lock the transaction all the way.
                return self._promise(mode, fn, writeLocked);
            }

            for (var i = storeNames.length - 1; i !== -1; --i) {
                var name = storeNames[i];
                var table = db._tableFactory(mode, dbschema[name], transactionPromiseFactory);
                this.tables[name] = table;
                if (!this[name]) this[name] = table;
            }
        }

        extend(Transaction.prototype, {
            //
            // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
            //

            _lock: function () {
                // Temporary set all requests into a pending queue if they are called before database is ready.
                ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
                if (this._reculock === 1 && Promise.PSD) Promise.PSD.lockOwnerFor = this;
                return this;
            },
            _unlock: function () {
                if (--this._reculock === 0) {
                    if (Promise.PSD) Promise.PSD.lockOwnerFor = null;
                    while (this._blockedFuncs.length > 0 && !this._locked()) {
                        var fn = this._blockedFuncs.shift();
                        try { fn(); } catch (e) { }
                    }
                }
                return this;
            },
            _locked: function () {
                // Checks if any write-lock is applied on this transaction.
                // To simplify the Dexie API for extension implementations, we support recursive locks.
                // This is accomplished by using "Promise Specific Data" (PSD).
                // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
                // Promise.PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
                //         * callback given to the Promise() constructor  (function (resolve, reject){...})
                //         * callbacks given to then()/catch()/finally() methods (function (value){...})
                // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
                // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
                // Promise.PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
                return this._reculock && (!Promise.PSD || Promise.PSD.lockOwnerFor !== this);
            },
            _nop: function (cb) {
                // An asyncronic no-operation that may call given callback when done doing nothing. An alternative to asap() if we must not lose the transaction.
                this.tables[this.storeNames[0]].get(0).then(cb);
            },
            _promise: function (mode, fn, bWriteLock) {
                var self = this;
                return Promise.newPSD(function() {
                    var p;
                    // Read lock always
                    if (!self._locked()) {
                        p = self.active ? new Promise(function (resolve, reject) {
                            if (!self.idbtrans && mode) {
                                if (!idbdb) throw dbOpenError ? new Error("Database not open. Following error in populate, ready or upgrade function made Dexie.open() fail: " + dbOpenError) : new Error("Database not open");
                                var idbtrans = self.idbtrans = idbdb.transaction(safariMultiStoreFix(self.storeNames), self.mode);
                                idbtrans.onerror = function (e) {
                                    self.on("error").fire(e && e.target.error);
                                    e.preventDefault(); // Prohibit default bubbling to window.error
                                    self.abort(); // Make sure transaction is aborted since we preventDefault.
                                }; 
                                idbtrans.onabort = function (e) {
                                    self.active = false;
                                    self.on("abort").fire(e);
                                }; 
                                idbtrans.oncomplete = function (e) {
                                    self.active = false;
                                    self.on("complete").fire(e);
                                }; 
                            }
                            if (bWriteLock) self._lock(); // Write lock if write operation is requested
                            try {
                                fn(resolve, reject, self);
                            } catch (e) {
                                // Direct exception happened when doin operation.
                                // We must immediately fire the error and abort the transaction.
                                // When this happens we are still constructing the Promise so we don't yet know
                                // whether the caller is about to catch() the error or not. Have to make
                                // transaction fail. Catching such an error wont stop transaction from failing.
                                // This is a limitation we have to live with.
                                Dexie.ignoreTransaction(function () { self.on('error').fire(e); });
                                self.abort();
                                reject(e);
                            }
                        }) : Promise.reject(stack(new Error("Transaction is inactive. Original Scope Function Source: " + self.scopeFunc.toString())));
                        if (self.active && bWriteLock) p.finally(function () {
                            self._unlock();
                        });
                    } else {
                        // Transaction is write-locked. Wait for mutex.
                        p = new Promise(function (resolve, reject) {
                            self._blockedFuncs.push(function () {
                                self._promise(mode, fn, bWriteLock).then(resolve, reject);
                            });
                        });
                    }
                    p.onuncatched = function (e) {
                        // Bubble to transaction. Even though IDB does this internally, it would just do it for error events and not for caught exceptions.
                        Dexie.ignoreTransaction(function () { self.on("error").fire(e); });
                        self.abort();
                    };
                    return p;
                });
            },

            //
            // Transaction Public Methods
            //

            complete: function (cb) {
                return this.on("complete", cb);
            },
            error: function (cb) {
                return this.on("error", cb);
            },
            abort: function () {
                if (this.idbtrans && this.active) try { // TODO: if !this.idbtrans, enqueue an abort() operation.
                    this.active = false;
                    this.idbtrans.abort();
                    this.on.error.fire(new Error("Transaction Aborted"));
                } catch (e) { }
            },
            table: function (name) {
                if (!this.tables.hasOwnProperty(name)) { throw new Error("Table " + name + " not in transaction"); return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
                return this.tables[name];
            }
        });

        //
        //
        //
        // WhereClause
        //
        //
        //
        function WhereClause(table, index, orCollection) {
            /// <param name="table" type="Table"></param>
            /// <param name="index" type="String" optional="true"></param>
            /// <param name="orCollection" type="Collection" optional="true"></param>
            this._ctx = {
                table: table,
                index: index === ":id" ? null : index,
                collClass: table._collClass,
                or: orCollection
            }; 
        }

        extend(WhereClause.prototype, function () {

            // WhereClause private methods

            function fail(collection, err) {
                try { throw err; } catch (e) {
                    collection._ctx.error = e;
                }
                return collection;
            }

            function getSetArgs(args) {
                return Array.prototype.slice.call(args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
            }

            function upperFactory(dir) {
                return dir === "next" ? function (s) { return s.toUpperCase(); } : function (s) { return s.toLowerCase(); };
            }
            function lowerFactory(dir) {
                return dir === "next" ? function (s) { return s.toLowerCase(); } : function (s) { return s.toUpperCase(); };
            }
            function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
                var length = Math.min(key.length, lowerNeedle.length);
                var llp = -1;
                for (var i = 0; i < length; ++i) {
                    var lwrKeyChar = lowerKey[i];
                    if (lwrKeyChar !== lowerNeedle[i]) {
                        if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                        if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                        if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                        return null;
                    }
                    if (cmp(key[i], lwrKeyChar) < 0) llp = i;
                }
                if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
                if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
                return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
            }

            function addIgnoreCaseAlgorithm(c, match, needle) {
                /// <param name="needle" type="String"></param>
                var upper, lower, compare, upperNeedle, lowerNeedle, direction;
                function initDirection(dir) {
                    upper = upperFactory(dir);
                    lower = lowerFactory(dir);
                    compare = (dir === "next" ? ascending : descending);
                    upperNeedle = upper(needle);
                    lowerNeedle = lower(needle);
                    direction = dir;
                }
                initDirection("next");
                c._ondirectionchange = function (direction) {
                    // This event onlys occur before filter is called the first time.
                    initDirection(direction);
                };
                c._addAlgorithm(function (cursor, advance, resolve) {
                    /// <param name="cursor" type="IDBCursor"></param>
                    /// <param name="advance" type="Function"></param>
                    /// <param name="resolve" type="Function"></param>
                    var key = cursor.key;
                    if (typeof key !== 'string') return false;
                    var lowerKey = lower(key);
                    if (match(lowerKey, lowerNeedle)) {
                        advance(function () { cursor.continue(); });
                        return true;
                    } else {
                        var nextNeedle = nextCasing(key, lowerKey, upperNeedle, lowerNeedle, compare, direction);
                        if (nextNeedle) {
                            advance(function () { cursor.continue(nextNeedle); });
                        } else {
                            advance(resolve);
                        }
                        return false;
                    }
                });
            }

            //
            // WhereClause public methods
            //
            return {
                between: function (lower, upper, includeLower, includeUpper) {
                    /// <summary>
                    ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                    /// </summary>
                    /// <param name="lower"></param>
                    /// <param name="upper"></param>
                    /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                    /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                    /// <returns type="Collection"></returns>
                    includeLower = includeLower !== false;   // Default to true
                    includeUpper = includeUpper === true;    // Default to false
                    if ((lower > upper) ||
                        (lower === upper && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                        return new this._ctx.collClass(this, function() { return IDBKeyRange.only(lower); }).limit(0); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                    return new this._ctx.collClass(this, function() { return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper); });
                },
                equals: function (value) {
                    return new this._ctx.collClass(this, function() { return IDBKeyRange.only(value); });
                },
                above: function (value) {
                    return new this._ctx.collClass(this, function() { return IDBKeyRange.lowerBound(value, true); });
                },
                aboveOrEqual: function (value) {
                    return new this._ctx.collClass(this, function() { return IDBKeyRange.lowerBound(value); });
                },
                below: function (value) {
                    return new this._ctx.collClass(this, function() { return IDBKeyRange.upperBound(value, true); });
                },
                belowOrEqual: function (value) {
                    return new this._ctx.collClass(this, function() { return IDBKeyRange.upperBound(value); });
                },
                startsWith: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
                    return this.between(str, str + String.fromCharCode(65535), true, true);
                },
                startsWithIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
                    if (str === "") return this.startsWith(str);
                    var c = new this._ctx.collClass(this, function() { return IDBKeyRange.bound(str.toUpperCase(), str.toLowerCase() + String.fromCharCode(65535)); });
                    addIgnoreCaseAlgorithm(c, function (a, b) { return a.indexOf(b) === 0; }, str);
                    c._ondirectionchange = function () { fail(c, new Error("reverse() not supported with WhereClause.startsWithIgnoreCase()")); };
                    return c;
                },
                equalsIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
                    var c = new this._ctx.collClass(this, function() { return IDBKeyRange.bound(str.toUpperCase(), str.toLowerCase()); });
                    addIgnoreCaseAlgorithm(c, function (a, b) { return a === b; }, str);
                    return c;
                },
                anyOf: function (valueArray) {
                    var ctx = this._ctx,
                        schema = ctx.table.schema;
                    var idxSpec = ctx.index ? schema.idxByName[ctx.index] : schema.primKey;
                    var isCompound = idxSpec && idxSpec.compound;
                    var set = getSetArgs(arguments);
                    var compare = isCompound ? compoundCompare(ascending) : ascending;
                    set.sort(compare);
                    if (set.length === 0) return new this._ctx.collClass(this, function() { return IDBKeyRange.only(""); }).limit(0); // Return an empty collection.
                    var c = new this._ctx.collClass(this, function () { return IDBKeyRange.bound(set[0], set[set.length - 1]); });
                    
                    c._ondirectionchange = function (direction) {
                        compare = (direction === "next" ? ascending : descending);
                        if (isCompound) compare = compoundCompare(compare);
                        set.sort(compare);
                    };
                    var i = 0;
                    c._addAlgorithm(function (cursor, advance, resolve) {
                        var key = cursor.key;
                        while (compare(key, set[i]) > 0) {
                            // The cursor has passed beyond this key. Check next.
                            ++i;
                            if (i === set.length) {
                                // There is no next. Stop searching.
                                advance(resolve);
                                return false;
                            }
                        }
                        if (compare(key, set[i]) === 0) {
                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                            advance(function () { cursor.continue(); });
                            return true;
                        } else {
                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                            advance(function () { cursor.continue(set[i]); });
                            return false;
                        }
                    });
                    return c;
                }
            };
        });




        //
        //
        //
        // Collection Class
        //
        //
        //
        function Collection(whereClause, keyRangeGenerator) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="whereClause" type="WhereClause">Where clause instance</param>
            /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
            var keyRange = null, error = null;
            if (keyRangeGenerator) try {
                keyRange = keyRangeGenerator();
            } catch (ex) {
                error = ex;
            }

            var whereCtx = whereClause._ctx;
            this._ctx = {
                table: whereCtx.table,
                index: whereCtx.index,
                isPrimKey: (!whereCtx.index || (whereCtx.table.schema.primKey.keyPath && whereCtx.index === whereCtx.table.schema.primKey.name)),
                range: keyRange,
                op: "openCursor",
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                isMatch: null,
                offset: 0,
                limit: Infinity,
                error: error, // If set, any promise must be rejected with this error
                or: whereCtx.or
            };
        }

        extend(Collection.prototype, function () {

            //
            // Collection Private Functions
            //

            function addFilter(ctx, fn) {
                ctx.filter = combine(ctx.filter, fn);
            }

            function addMatchFilter(ctx, fn) {
                ctx.isMatch = combine(ctx.isMatch, fn);
            }

            function getIndexOrStore(ctx, store) {
                if (ctx.isPrimKey) return store;
                var indexSpec = ctx.table.schema.idxByName[ctx.index];
                if (!indexSpec) throw new Error("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
                return ctx.isPrimKey ? store : store.index(indexSpec.name);
            }

            function openCursor(ctx, store) {
                return getIndexOrStore(ctx, store)[ctx.op](ctx.range || null, ctx.dir + ctx.unique);
            }

            function iter(ctx, fn, resolve, reject, idbstore) {
                if (!ctx.or) {
                    iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, ctx.filter), fn, resolve, reject, ctx.table.hook.reading.fire);
                } else {
                    (function () {
                        var filter = ctx.filter;
                        var set = {};
                        var primKey = ctx.table.schema.primKey.keyPath;
                        var resolved = 0;

                        function resolveboth() {
                            if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                        }

                        function union(item, cursor, advance) {
                            if (!filter || filter(cursor, advance, resolveboth, reject)) {
                                var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                                if (!set.hasOwnProperty(key)) {
                                    set[key] = true;
                                    fn(item, cursor, advance);
                                }
                            }
                        }

                        ctx.or._iterate(union, resolveboth, reject, idbstore);
                        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, ctx.table.hook.reading.fire);
                    })();
                }
            }
            function getInstanceTemplate(ctx) {
                return ctx.table.schema.instanceTemplate;
            }


            return {

                //
                // Collection Protected Functions
                //

                _read: function (fn, cb) {
                    var ctx = this._ctx;
                    if (ctx.error)
                        return ctx.table._trans(null, function rejector(resolve, reject) { reject(ctx.error); });
                    else
                        return ctx.table._idbstore(READONLY, fn).then(cb);
                },
                _write: function (fn) {
                    var ctx = this._ctx;
                    if (ctx.error)
                        return ctx.table._trans(null, function rejector(resolve, reject) { reject(ctx.error); });
                    else
                        return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
                },
                _addAlgorithm: function (fn) {
                    var ctx = this._ctx;
                    ctx.algorithm = combine(ctx.algorithm, fn);
                },

                _iterate: function (fn, resolve, reject, idbstore) {
                    return iter(this._ctx, fn, resolve, reject, idbstore);
                },

                //
                // Collection Public methods
                //

                each: function (fn) {
                    var ctx = this._ctx;

                    fakeAutoComplete(function () { fn(getInstanceTemplate(ctx)); });

                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, fn, resolve, reject, idbstore);
                    });
                },

                count: function (cb) {
                    fakeAutoComplete(function () { cb(0); });
                    var self = this,
                        ctx = this._ctx;

                    if (ctx.filter || ctx.algorithm || ctx.or) {
                        // When filters are applied or 'ored' collections are used, we must count manually
                        var count = 0;
                        return this._read(function (resolve, reject, idbstore) {
                            iter(ctx, function () { ++count; return false; }, function () { resolve(count); }, reject, idbstore);
                        }, cb);
                    } else {
                        // Otherwise, we can use the count() method if the index.
                        return this._read(function (resolve, reject, idbstore) {
                            var idx = getIndexOrStore(ctx, idbstore);
                            var req = (ctx.range ? idx.count(ctx.range) : idx.count());
                            req.onerror = eventRejectHandler(reject, ["calling", "count()", "on", self.name]);
                            req.onsuccess = function (e) {
                                resolve(Math.min(e.target.result, Math.max(0, ctx.limit - ctx.offset)));
                            };
                        }, cb);
                    }
                },

                sortBy: function (keyPath, cb) {
                    /// <param name="keyPath" type="String"></param>
                    var ctx = this._ctx;
                    fakeAutoComplete(function () { cb([getInstanceTemplate(ctx)]); });
                    var parts = keyPath.split('.').reverse(),
                        lastPart = parts[0],
                        lastIndex = parts.length - 1;
                    function getval(obj, i) {
                        if (i) return getval(obj[parts[i]], i - 1);
                        return obj[lastPart];
                    }
                    var order = this._ctx.dir === "next" ? 1 : -1;

                    function sorter(a, b) {
                        var aVal = getval(a, lastIndex),
                            bVal = getval(b, lastIndex);
                        return aVal < bVal ? -order : aVal > bVal ? order : 0;
                    }
                    return this.toArray(function (a) {
                        return a.sort(sorter);
                    }).then(cb);
                },

                toArray: function (cb) {
                    var ctx = this._ctx;

                    fakeAutoComplete(function () { cb([getInstanceTemplate(ctx)]); });

                    return this._read(function (resolve, reject, idbstore) {
                        var a = [];
                        iter(ctx, function (item) { a.push(item); }, function arrayComplete() {
                            resolve(a);
                        }, reject, idbstore);
                    }, cb);
                },

                offset: function (offset) {
                    var ctx = this._ctx;
                    if (offset <= 0) return this;
                    ctx.offset += offset; // For count()
                    if (!ctx.or && !ctx.algorithm && !ctx.filter) {
                        addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
                            if (offset === 0) return true;
                            if (offset === 1) { --offset; return false; }
                            advance(function () { cursor.advance(offset); offset = 0; });
                            return false;
                        });
                    } else {
                        addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
                            return (--offset < 0);
                        });
                    }
                    return this;
                },

                limit: function (numRows) {
                    this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                    addFilter(this._ctx, function (cursor, advance, resolve) {
                        if (--numRows <= 0) advance(resolve); // Stop after this item has been included
                        return numRows >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                    });
                    return this;
                },

                until: function (filterFunction, bIncludeStopEntry) {
                    var ctx = this._ctx;
                    fakeAutoComplete(function () { filterFunction(getInstanceTemplate(ctx)); });
                    addFilter(this._ctx, function (cursor, advance, resolve) {
                        if (filterFunction(cursor.value)) {
                            advance(resolve);
                            return bIncludeStopEntry;
                        } else {
                            return true;
                        }
                    });
                    return this;
                },

                first: function (cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb(getInstanceTemplate(self._ctx)); });
                    return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
                },

                last: function (cb) {
                    return this.reverse().first(cb);
                },

                and: function (filterFunction) {
                    /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                    var self = this;
                    fakeAutoComplete(function () { filterFunction(getInstanceTemplate(self._ctx)); });
                    addFilter(this._ctx, function (cursor) {
                        return filterFunction(cursor.value);
                    });
                    addMatchFilter(this._ctx, filterFunction); // match filters not used in Dexie.js but can be used by 3rd part libraries to test a collection for a match without querying DB. Used by Dexie.Observable.
                    return this;
                },

                or: function (indexName) {
                    return new WhereClause(this._ctx.table, indexName, this);
                },

                reverse: function () {
                    this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
                    if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
                    return this;
                },

                desc: function () {
                    return this.reverse();
                },

                eachKey: function (cb) {
                    var self = this, ctx = this._ctx;
                    fakeAutoComplete(function () { cb(getInstanceTemplate(self._ctx)[self._ctx.index]); });
                    if (!ctx.isPrimKey) ctx.op = "openKeyCursor"; // Need the check because IDBObjectStore does not have "openKeyCursor()" while IDBIndex has.
                    return this.each(function (val, cursor) { cb(cursor.key, cursor); });
                },

                eachUniqueKey: function (cb) {
                    this._ctx.unique = "unique";
                    return this.eachKey(cb);
                },

                keys: function (cb) {
                    fakeAutoComplete(function () { cb([getInstanceTemplate(ctx)[self._ctx.index]]); });
                    var self = this,
                        ctx = this._ctx;
                    if (!ctx.isPrimKey) ctx.op = "openKeyCursor"; // Need the check because IDBObjectStore does not have "openKeyCursor()" while IDBIndex has.
                    var a = [];
                    return this.each(function (item, cursor) {
                        a.push(cursor.key);
                    }).then(function () {
                        return a;
                    }).then(cb);
                },

                uniqueKeys: function (cb) {
                    this._ctx.unique = "unique";
                    return this.keys(cb);
                },

                firstKey: function (cb) {
                    var self = this;
                    //fakeAutoComplete(function () { cb(getInstanceTemplate(self._ctx)[self._ctx.index]); });
                    //debugger;
                    return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
                },

                lastKey: function (cb) {
                    return this.reverse().firstKey(cb);
                },


                distinct: function () {
                    var set = {};
                    addFilter(this._ctx, function (cursor) {
                        var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                        var found = set.hasOwnProperty(strKey);
                        set[strKey] = true;
                        return !found;
                    });
                    return this;
                }
            };
        });

        //
        //
        // WriteableCollection Class
        //
        //
        function WriteableCollection() {
            Collection.apply(this, arguments);
        }

        derive(WriteableCollection).from(Collection).extend({

            //
            // WriteableCollection Public Methods
            //

            modify: function (changes) {
                var self = this,
                    ctx = this._ctx,
                    hook = ctx.table.hook,
                    updatingHook = hook.updating.fire,
                    deletingHook = hook.deleting.fire;

                fakeAutoComplete(function () {
                    if (typeof changes === 'function') {
                        changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);
                    }
                });

                return this._write(function (resolve, reject, idbstore, trans) {
                    var modifyer;
                    if (typeof changes === 'function') {
                        // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                        if (updatingHook === nop && deletingHook === nop) {
                            // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                            modifyer = changes;
                        } else {
                            // People want to know exactly what is being modified or deleted.
                            // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                            // and call the hooks accordingly!
                            modifyer = function (item) {
                                var origItem = deepClone(item); // Clone the item first so we can compare laters.
                                if (changes.call(this, item) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                                if (!this.hasOwnProperty("value")) {
                                    // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                    deletingHook.call(this, this.primKey, item, trans);
                                } else {
                                    // No deletion. Check what was changed
                                    var objectDiff = getObjectDiff(origItem, this.value);
                                    var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                    if (additionalChanges) {
                                        // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                        item = this.value;
                                        Object.keys(additionalChanges).forEach(function (keyPath) {
                                            setByKeyPath(item, keyPath, additionalChanges[keyPath]);  // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                        });
                                    }
                                }
                            }; 
                        }
                    } else if (updatingHook === nop) {
                        // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                        var keyPaths = Object.keys(changes);
                        var numKeys = keyPaths.length;
                        modifyer = function (item) {
                            var anythingModified = false;
                            for (var i = 0; i < numKeys; ++i) {
                                var keyPath = keyPaths[i], val = changes[keyPath];
                                if (getByKeyPath(item, keyPath) !== val) {
                                    setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                    anythingModified = true;
                                }
                            }
                            return anythingModified;
                        }; 
                    } else {
                        // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                        // allow it to add additional modifications to make.
                        var origChanges = changes;
                        changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                        modifyer = function (item) {
                            var anythingModified = false;
                            var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                            if (additionalChanges) extend(changes, additionalChanges);
                            Object.keys(changes).forEach(function (keyPath) {
                                var val = changes[keyPath];
                                if (getByKeyPath(item, keyPath) !== val) {
                                    setByKeyPath(item, keyPath, val);
                                    anythingModified = true;
                                }
                            });
                            if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
                            return anythingModified;
                        }; 
                    }

                    var count = 0;
                    var successCount = 0;
                    var iterationComplete = false;
                    var failures = [];
                    var failKeys = [];
                    var currentKey = null;

                    function modifyItem(item, cursor, advance) {
                        currentKey = cursor.primaryKey;
                        var thisContext = { primKey: cursor.primaryKey, value: item };
                        if (modifyer.call(thisContext, item) !== false) { // If a callback explicitely returns false, do not perform the update!
                            var bDelete = !thisContext.hasOwnProperty("value");
                            var req = (bDelete ? cursor.delete() : cursor.update(thisContext.value));
                            ++count;
                            req.onerror = eventRejectHandler(function (e) {
                                failures.push(e);
                                failKeys.push(thisContext.primKey);
                                if (thisContext.onerror) thisContext.onerror(e);
                                checkFinished();
                                return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                            }, bDelete ? ["deleting", item, "from", ctx.table.name] : ["modifying", item, "on", ctx.table.name]);
                            req.onsuccess = function (ev) {
                                if (thisContext.onsuccess) thisContext.onsuccess(thisContext.value);
                                ++successCount;
                                checkFinished();
                            }; 
                        } else if (thisContext.onsuccess) {
                            // Hook will expect either onerror or onsuccess to always be called!
                            thisContext.onsuccess(thisContext.value);
                        }
                    }

                    function doReject(e) {
                        if (e) {
                            failures.push(e);
                            failKeys.push(currentKey);
                        }
                        return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                    }

                    function checkFinished() {
                        if (iterationComplete && successCount + failures.length === count) {
                            if (failures.length > 0)
                                doReject();
                            else
                                resolve(successCount);
                        }
                    }
                    self._iterate(modifyItem, function () {
                        iterationComplete = true;
                        checkFinished();
                    }, doReject, idbstore);
                });
            },

            'delete': function () {
                return this.modify(function () { delete this.value; });
            }
        });


        //
        //
        //
        // ------------------------- Help functions ---------------------------
        //
        //
        //

        function lowerVersionFirst(a, b) {
            return a._cfg.version - b._cfg.version;
        }

        function setApiOnPlace(objs, transactionPromiseFactory, tableNames, mode, dbschema, enableProhibitedDB) {
            tableNames.forEach(function (tableName) {
                var tableInstance = db._tableFactory(mode, dbschema[tableName], transactionPromiseFactory);
                objs.forEach(function (obj) {
                    if (!obj[tableName]) {
                        if (enableProhibitedDB) {
                            Object.defineProperty(obj, tableName, {
                                configurable: true,
                                enumerable: true,
                                get: function () {
                                    var currentTrans = Promise.PSD && Promise.PSD.trans;
                                    if (currentTrans && currentTrans.db === db) {
                                        return currentTrans.tables[tableName];
                                    }
                                    return tableInstance;
                                }
                            });
                        } else {
                            obj[tableName] = tableInstance;
                        }
                    }
                });
            });
        }

        function removeTablesApi(objs) {
            objs.forEach(function (obj) {
                for (var key in obj) {
                    if (obj[key] instanceof Table) delete obj[key];
                }
            });
        }

        function iterate(req, filter, fn, resolve, reject, readingHook) {
            var psd = Promise.PSD;
            readingHook = readingHook || mirror;
            if (!req.onerror) req.onerror = eventRejectHandler(reject);
            if (filter) {
                req.onsuccess = trycatch(function filter_record(e) {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        if (filter(cursor, function (advancer) { c = advancer; }, resolve, reject))
                            fn(readingHook(cursor.value), cursor, function (advancer) { c = advancer; });
                        c();
                    } else {
                        resolve();
                    }
                }, reject, psd);
            } else {
                req.onsuccess = trycatch(function filter_record(e) {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        fn(readingHook(cursor.value), cursor, function (advancer) { c = advancer; });
                        c();
                    } else {
                        resolve();
                    }
                }, reject, psd);
            }
        }

        function parseIndexSyntax(indexes) {
            /// <param name="indexes" type="String"></param>
            /// <returns type="Array" elementType="IndexSpec"></returns>
            var rv = [];
            indexes.split(',').forEach(function (index) {
                index = index.trim();
                var name = index.replace("&", "").replace("++", "").replace("*", "");
                var keyPath = (name.indexOf('[') !== 0 ? name : index.substring(index.indexOf('[') + 1, index.indexOf(']')).split('+'));

                rv.push(new IndexSpec(
                    name,
                    keyPath || null,
                    index.indexOf('&') !== -1,
                    index.indexOf('*') !== -1,
                    index.indexOf("++") !== -1,
                    Array.isArray(keyPath),
                    keyPath.indexOf('.') !== -1
                ));
            });
            return rv;
        }

        function ascending(a, b) {
            return a < b ? -1 : a > b ? 1 : 0;
        }

        function descending(a, b) {
            return a < b ? 1 : a > b ? -1 : 0;
        }

        function compoundCompare(itemCompare) {
            return function (a, b) {
                var i = 0;
                while (true) {
                    var result = itemCompare(a[i], b[i]);
                    if (result !== 0) return result;
                    ++i;
                    if (i === a.length || i === b.length)
                        return itemCompare(a.length, b.length);
                }
            };
        }


        function combine(filter1, filter2) {
            return filter1 ? filter2 ? function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } : filter1 : filter2;
        }

        function hasIEDeleteObjectStoreBug() {
            // Assume bug is present in IE10 and IE11 but dont expect it in next version of IE (IE12)
            return navigator.userAgent.indexOf("Trident") >= 0 || navigator.userAgent.indexOf("MSIE") >= 0;
        }

        function readGlobalSchema() {
            db.verno = idbdb.version / 10;
            db._dbSchema = globalSchema = {};
            dbStoreNames = [].slice.call(idbdb.objectStoreNames, 0);
            if (dbStoreNames.length === 0) return; // Database contains no stores.
            var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
            dbStoreNames.forEach(function (storeName) {
                var store = trans.objectStore(storeName),
                    keyPath = store.keyPath,
                    dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
                var indexes = [];
                for (var j = 0; j < store.indexNames.length; ++j) {
                    var idbindex = store.index(store.indexNames[j]);
                    keyPath = idbindex.keyPath;
                    dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                    var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                    indexes.push(index);
                }
                globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
            });
            setApiOnPlace([allTables], db._transPromiseFactory, Object.keys(globalSchema), READWRITE, globalSchema);
        }

        function adjustToExistingIndexNames(schema, idbtrans) {
            /// <summary>
            /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
            /// </summary>
            /// <param name="schema" type="Object">Map between name and TableSchema</param>
            /// <param name="idbtrans" type="IDBTransaction"></param>
            var storeNames = idbtrans.db.objectStoreNames;
            for (var i = 0; i < storeNames.length; ++i) {
                var storeName = storeNames[i];
                var store = idbtrans.objectStore(storeName);
                for (var j = 0; j < store.indexNames.length; ++j) {
                    var indexName = store.indexNames[j];
                    var keyPath = store.index(indexName).keyPath;
                    var dexieName = typeof keyPath === 'string' ? keyPath : "[" + [].slice.call(keyPath).join('+') + "]";
                    if (schema[storeName]) {
                        var indexSpec = schema[storeName].idxByName[dexieName];
                        if (indexSpec) indexSpec.name = indexName;
                    }
                }
            }
        }

        extend(this, {
            Collection: Collection,
            Table: Table,
            Transaction: Transaction,
            Version: Version,
            WhereClause: WhereClause,
            WriteableCollection: WriteableCollection,
            WriteableTable: WriteableTable
        });

        init();

        addons.forEach(function (fn) {
            fn(db);
        });
    }

    //
    // Promise Class
    //
    // A variant of promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
    //
    // Modified by David Fahlander to be indexedDB compliant (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
    // This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
    // the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise. We fix this by using the member variable constructing to check
    // whether the object is being constructed when reject or resolve is called. If so, the use setTimeout/setImmediate to fulfill the promise, otherwise, we know that it's not needed.
    //
    // This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45 and this implementation solves that issue.
    //
    // Another feature with this Promise implementation is that reject will return false in case no one catched the reject call. This is used
    // to stopPropagation() on the IDBRequest error event in case it was catched but not otherwise.
    //
    // Also, the event new Promise().onuncatched is called in case no one catches a reject call. This is used for us to manually bubble any request
    // errors to the transaction. We must not rely on IndexedDB implementation to do this, because it only does so when the source of the rejection
    // is an error event on a request, not in case an ordinary exception is thrown.
    var Promise = (function () {

        // The use of asap in handle() is remarked because we must NOT use setTimeout(fn,0) because it causes premature commit of indexedDB transactions - which is according to indexedDB specification.
        var _slice = [].slice;
        var _asap = typeof (setImmediate) === 'undefined' ? function(fn, arg1, arg2, argN) {
            var args = arguments;
            setTimeout(function() { fn.apply(global, _slice.call(args, 1)); }, 0); // If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
        } : setImmediate; // IE10+ and node.

        var asap = _asap,
            isRootExecution = true;

        var operationsQueue = [];
        var tickFinalizers = [];
        function enqueueImmediate(fn, args) {
            operationsQueue.push([fn, _slice.call(arguments, 1)]);
        }

        function executeOperationsQueue() {
            var queue = operationsQueue;
            operationsQueue = [];
            for (var i = 0, l = queue.length; i < l; ++i) {
                var item = queue[i];
                item[0].apply(global, item[1]);
            }
        }

        //var PromiseID = 0;
        function Promise(fn) {
            if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
            if (typeof fn !== 'function') throw new TypeError('not a function');
            this._state = null; // null (=pending), false (=rejected) or true (=resolved)
            this._value = null; // error or result
            this._deferreds = [];
            this._catched = false; // for onuncatched
            //this._id = ++PromiseID;
            var self = this;
            var constructing = true;
            this._PSD = Promise.PSD;

            try {
                doResolve(this, fn, function (data) {
                    if (constructing)
                        asap(resolve, self, data);
                    else
                        resolve(self, data);
                }, function (reason) {
                    if (constructing) {
                        asap(reject, self, reason);
                        return false;
                    } else {
                        return reject(self, reason);
                    }
                });
            } finally {
                constructing = false;
            }
        }

        function handle(self, deferred) {
            if (self._state === null) {
                self._deferreds.push(deferred);
                return;
            }

            var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                // This Deferred doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
                return (self._state ? deferred.resolve : deferred.reject)(self._value);
            }
            var ret, isRootExec = isRootExecution;
            isRootExecution = false;
            asap = enqueueImmediate;
            try {
                var outerPSD = Promise.PSD;
                Promise.PSD = self._PSD;
                ret = cb(self._value);
                if (!self._state && (!ret || typeof ret.then !== 'function' || ret._state !== false)) setCatched(self); // Caller did 'return Promise.reject(err);' - don't regard it as catched!
                deferred.resolve(ret);
            } catch (e) {
                var catched = deferred.reject(e);
                if (!catched && self.onuncatched) {
                    try {
                        self.onuncatched(e);
                    } catch (e) {
                    }
                }
            } finally {
                Promise.PSD = outerPSD;
                if (isRootExec) {
                    do {
                        while (operationsQueue.length > 0) executeOperationsQueue();
                        var finalizer = tickFinalizers.pop();
                        if (finalizer) try {finalizer();} catch(e){}
                    } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
                    asap = _asap;
                    isRootExecution = true;
                }
            }
        }

        function _rootExec(fn) {
            var isRootExec = isRootExecution;
            isRootExecution = false;
            asap = enqueueImmediate;
            try {
                fn();
            } finally {
                if (isRootExec) {
                    do {
                        while (operationsQueue.length > 0) executeOperationsQueue();
                        var finalizer = tickFinalizers.pop();
                        if (finalizer) try { finalizer(); } catch (e) { }
                    } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
                    asap = _asap;
                    isRootExecution = true;
                }
            }
        }

        function setCatched(promise) {
            promise._catched = true;
            if (promise._parent) setCatched(promise._parent);
        }

        function resolve(promise, newValue) {
            var outerPSD = Promise.PSD;
            Promise.PSD = promise._PSD;
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === promise) throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                    if (typeof newValue.then === 'function') {
                        doResolve(promise, function (resolve, reject) {
                            //newValue instanceof Promise ? newValue._then(resolve, reject) : newValue.then(resolve, reject);
                            newValue.then(resolve, reject);
                        }, function (data) {
                            resolve(promise, data);
                        }, function (reason) {
                            reject(promise, reason);
                        });
                        return;
                    }
                }
                promise._state = true;
                promise._value = newValue;
                finale.call(promise);
            } catch (e) { reject(e); } finally {
                Promise.PSD = outerPSD;
            }
        }

        function reject(promise, newValue) {
            var outerPSD = Promise.PSD;
            Promise.PSD = promise._PSD;
            promise._state = false;
            promise._value = newValue;

            finale.call(promise);
            if (!promise._catched) {
                try {
                    if (promise.onuncatched)
                        promise.onuncatched(promise._value);
                    Promise.on.error.fire(promise._value);
                } catch (e) {
                }
            }
            Promise.PSD = outerPSD;
            return promise._catched;
        }

        function finale() {
            for (var i = 0, len = this._deferreds.length; i < len; i++) {
                handle(this, this._deferreds[i]);
            }
            this._deferreds = [];
        }

        function Deferred(onFulfilled, onRejected, resolve, reject) {
            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
            this.resolve = resolve;
            this.reject = reject;
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(promise, fn, onFulfilled, onRejected) {
            var done = false;
            try {
                fn(function Promise_resolve(value) {
                    if (done) return;
                    done = true;
                    onFulfilled(value);
                }, function Promise_reject(reason) {
                    if (done) return promise._catched;
                    done = true;
                    return onRejected(reason);
                });
            } catch (ex) {
                if (done) return;
                return onRejected(ex);
            }
        }

        Promise.on = events(null, "error");

        Promise.all = function () {
            var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);

            return new Promise(function (resolve, reject) {
                if (args.length === 0) return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    try {
                        if (val && (typeof val === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, function (val) { res(i, val); }, reject);
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };

        /* Prototype Methods */
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var self = this;
            var p = new Promise(function (resolve, reject) {
                if (self._state === null)
                    handle(self, new Deferred(onFulfilled, onRejected, resolve, reject));
                else
                    asap(handle, self, new Deferred(onFulfilled, onRejected, resolve, reject));
            });
            p._PSD = this._PSD;
            p.onuncatched = this.onuncatched; // Needed when exception occurs in a then() clause of a successful parent promise. Want onuncatched to be called even in callbacks of callbacks of the original promise.
            p._parent = this; // Used for recursively calling onuncatched event on self and all parents.
            return p;
        };

        Promise.prototype._then = function (onFulfilled, onRejected) {
            handle(this, new Deferred(onFulfilled, onRejected, nop,nop));
        };

        Promise.prototype['catch'] = function (onRejected) {
            if (arguments.length === 1) return this.then(null, onRejected);
            // First argument is the Error type to catch
            var type = arguments[0], callback = arguments[1];
            if (typeof type === 'function') return this.then(null, function (e) {
                // Catching errors by its constructor type (similar to java / c++ / c#)
                // Sample: promise.catch(TypeError, function (e) { ... });
                if (e instanceof type) return callback(e); else return Promise.reject(e);
            });
            else return this.then(null, function (e) {
                // Catching errors by the error.name property. Makes sense for indexedDB where error type
                // is always DOMError but where e.name tells the actual error type.
                // Sample: promise.catch('ConstraintError', function (e) { ... });
                if (e && e.name === type) return callback(e); else return Promise.reject(e);
            });
        };

        Promise.prototype['finally'] = function (onFinally) {
            return this.then(function (value) {
                onFinally();
                return value;
            }, function (err) {
                onFinally();
                return Promise.reject(err);
            });
        };

        Promise.prototype.onuncatched = null; // Optional event triggered if promise is rejected but no one listened.

        Promise.resolve = function (value) {
            var p = new Promise(function () { });
            p._state = true;
            p._value = value;
            return p;
        };

        Promise.reject = function (value) {
            var p = new Promise(function () { });
            p._state = false;
            p._value = value;
            return p;
        };

        Promise.race = function (values) {
            return new Promise(function (resolve, reject) {
                values.map(function (value) {
                    value.then(resolve, reject);
                });
            });
        };

        Promise.PSD = null; // Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises. TODO: Rename Promise.PSD to Promise.data

        Promise.newPSD = function (fn) {
            // Create new PSD scope (Promise Specific Data)
            var outerScope = Promise.PSD;
            Promise.PSD = outerScope ? Object.create(outerScope) : {};
            try {
                return fn();
            } finally {
                Promise.PSD = outerScope;
            }
        };

        Promise._rootExec = _rootExec;
        Promise._tickFinalize = function(callback) {
            if (isRootExecution) throw new Error("Not in a virtual tick");
            tickFinalizers.push(callback);
        };

        return Promise;
    })();


    //
    //
    // ------ Exportable Help Functions -------
    //
    //

    function nop() { }
    function mirror(val) { return val; }

    function pureFunctionChain(f1, f2) {
        // Enables chained events that takes ONE argument and returns it to the next function in chain.
        // This pattern is used in the hook("reading") event.
        if (f1 === mirror) return f2;
        return function (val) {
            return f2(f1(val));
        }; 
    }

    function callBoth(on1, on2) {
        return function () {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
        }; 
    }

    function hookCreatingChain(f1, f2) {
        // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
        // This pattern is used in the hook("creating") event.
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined) arguments[0] = res;
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
                onerror = this.onerror;     // In case event listener has set this.onerror
            delete this.onsuccess;
            delete this.onerror;
            var res2 = f2.apply(this, arguments);
            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== undefined ? res2 : res;
        }; 
    }

    function hookUpdatingChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined) extend(arguments[0], res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
                onerror = this.onerror;     // In case event listener has set this.onerror
            delete this.onsuccess;
            delete this.onerror;
            var res2 = f2.apply(this, arguments);
            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === undefined ?
                (res2 === undefined ? undefined : res2) :
                (res2 === undefined ? res : extend(res, res2));
        }; 
    }

    function stoppableEventChain(f1, f2) {
        // Enables chained events that may return false to stop the event chain.
        if (f1 === nop) return f2;
        return function () {
            if (f1.apply(this, arguments) === false) return false;
            return f2.apply(this, arguments);
        }; 
    }

    function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            if (f2.apply(this, arguments) === false) return false;
            return f1.apply(this, arguments);
        }; 
    }

    function nonStoppableEventChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            f1.apply(this, arguments);
            f2.apply(this, arguments);
        }; 
    }

    function promisableChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === 'function') {
                var thiz = this, args = arguments;
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        }; 
    }

    function events(ctx, eventNames) {
        var args = arguments;
        var evs = {};
        var rv = function (eventName, subscriber) {
            if (subscriber) {
                // Subscribe
                var args = [].slice.call(arguments, 1);
                var ev = evs[eventName];
                ev.subscribe.apply(ev, args);
                return ctx;
            } else if (typeof (eventName) === 'string') {
                // Return interface allowing to fire or unsubscribe from event
                return evs[eventName];
            }
        }; 
        rv.addEventType = add;

        function add(eventName, chainFunction, defaultFunction) {
            if (Array.isArray(eventName)) return addEventGroup(eventName);
            if (typeof eventName === 'object') return addConfiguredEvents(eventName);
            if (!chainFunction) chainFunction = stoppableEventChain;
            if (!defaultFunction) defaultFunction = nop;

            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    context.subscribers.push(cb);
                    context.fire = chainFunction(context.fire, cb);
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
        }

        function addConfiguredEvents(cfg) {
            // events(this, {reading: [functionChain, nop]});
            Object.keys(cfg).forEach(function (eventName) {
                var args = cfg[eventName];
                if (Array.isArray(args)) {
                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
                } else if (args === 'asap') {
                    // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                    // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                    var context = add(eventName, null, function fire() {
                        var args = arguments;
                        context.subscribers.forEach(function (fn) {
                            asap(function fireEvent() {
                                fn.apply(global, args);
                            });
                        });
                    });
                    context.subscribe = function (fn) {
                        // Change how subscribe works to not replace the fire function but to just add the subscriber to subscribers
                        if (context.subscribers.indexOf(fn) === -1)
                            context.subscribers.push(fn);
                    }; 
                    context.unsubscribe = function (fn) {
                        // Change how unsubscribe works for the same reason as above.
                        var idxOfFn = context.subscribers.indexOf(fn);
                        if (idxOfFn !== -1) context.subscribers.splice(idxOfFn, 1);
                    }; 
                } else throw new Error("Invalid event config");
            });
        }

        function addEventGroup(eventGroup) {
            // promise-based event group (i.e. we promise to call one and only one of the events in the pair, and to only call it once.
            var done = false;
            eventGroup.forEach(function (name) {
                add(name).subscribe(checkDone);
            });
            function checkDone() {
                if (done) return false;
                done = true;
            }
        }

        for (var i = 1, l = args.length; i < l; ++i) {
            add(args[i]);
        }

        return rv;
    }

    function assert(b) {
        if (!b) throw new Error("Assertion failed");
    }

    function asap(fn) {
        if (global.setImmediate) setImmediate(fn); else setTimeout(fn, 0);
    }

    var fakeAutoComplete = function() {};

    function doFakeAutoComplete(fn) {
        var to = setTimeout(fn, 1000);
        clearTimeout(to);
    }

    function trycatch(fn, reject, psd) {
        return function () {
            var outerPSD = Promise.PSD; // Support Promise-specific data (PSD) in callback calls
            Promise.PSD = psd;
            try {
                fn.apply(this, arguments);
            } catch (e) {
                reject(e);
            } finally {
                Promise.PSD = outerPSD;
            }
        };
    }

    function getByKeyPath(obj, keyPath) {
        // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
        if (obj.hasOwnProperty(keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
        if (!keyPath) return obj;
        if (typeof keyPath !== 'string') {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                var val = getByKeyPath(obj, keyPath[i]);
                rv.push(val);
            }
            return rv;
        }
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return undefined;
    }

    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined) return;
        if (typeof keyPath !== 'string' && 'length' in keyPath) {
            assert(typeof value !== 'string' && 'length' in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        } else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "")
                    if (value === undefined) delete obj[currentKeyPath]; else obj[currentKeyPath] = value;
                else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj) innerObj = (obj[currentKeyPath] = {});
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            } else {
                if (value === undefined) delete obj[keyPath]; else obj[keyPath] = value;
            }
        }
    }

    function delByKeyPath(obj, keyPath) {
        setByKeyPath(obj, keyPath, undefined);
    }

    function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
            if (obj.hasOwnProperty(m)) rv[m] = obj[m];
        }
        return rv;
    }

    function deepClone(any) {
        if (!any || typeof any !== 'object') return any;
        var rv;
        if (Array.isArray(any)) {
            rv = [];
            for (var i = 0, l = any.length; i < l; ++i) {
                rv.push(deepClone(any[i]));
            }
        } else if (any instanceof Date) {
            rv = new Date();
            rv.setTime(any.getTime());
        } else {
            rv = any.constructor ? Object.create(any.constructor.prototype) : {};
            for (var prop in any) {
                if (any.hasOwnProperty(prop)) {
                    rv[prop] = deepClone(any[prop]);
                }
            }
        }
        return rv;
    }

    function getObjectDiff(a, b) {
        // This is a simplified version that will always return keypaths on the root level.
        // If for example a and b differs by: (a.somePropsObject.x != b.somePropsObject.x), we will return that "somePropsObject" is changed
        // and not "somePropsObject.x". This is acceptable and true but could be optimized to support nestled changes if that would give a
        // big optimization benefit.
        var rv = {};
        for (var prop in a) if (a.hasOwnProperty(prop)) {
            if (!b.hasOwnProperty(prop))
                rv[prop] = undefined; // Property removed
            else if (a[prop] !== b[prop] && JSON.stringify(a[prop]) != JSON.stringify(b[prop]))
                rv[prop] = b[prop]; // Property changed
        }
        for (var prop in b) if (b.hasOwnProperty(prop) && !a.hasOwnProperty(prop)) {
            rv[prop] = b[prop]; // Property added
        }
        return rv;
    }

    function parseType(type) {
        if (typeof type === 'function') {
            return new type();
        } else if (Array.isArray(type)) {
            return [parseType(type[0])];
        } else if (type && typeof type === 'object') {
            var rv = {};
            applyStructure(rv, type);
            return rv;
        } else {
            return type;
        }
    }

    function applyStructure(obj, structure) {
        Object.keys(structure).forEach(function (member) {
            var value = parseType(structure[member]);
            obj[member] = value;
        });
    }

    function eventRejectHandler(reject, sentance) {
        return function (event) {
            var errObj = (event && event.target.error) || new Error();
            if (sentance) {
                var occurredWhen = " occurred when " + sentance.map(function (word) {
                    switch (typeof (word)) {
                        case 'function': return word();
                        case 'string': return word;
                        default: return JSON.stringify(word);
                    }
                }).join(" ");
                if (errObj.name) {
                    errObj.toString = function toString() {
                        return errObj.name + occurredWhen + (errObj.message ? ". " + errObj.message : "");
                        // Code below works for stacked exceptions, BUT! stack is never present in event errors (not in any of the browsers). So it's no use to include it!
                        /*delete this.toString; // Prohibiting endless recursiveness in IE.
                        if (errObj.stack) rv += (errObj.stack ? ". Stack: " + errObj.stack : "");
                        this.toString = toString;
                        return rv;*/
                    };
                } else {
                    errObj = errObj + occurredWhen;
                }
            };
            reject(errObj);

            if (event) {// Old versions of IndexedDBShim doesnt provide an error event
                // Stop error from propagating to IDBTransaction. Let us handle that manually instead.
                if (event.stopPropagation) // IndexedDBShim doesnt support this
                    event.stopPropagation();
                if (event.preventDefault) // IndexedDBShim doesnt support this
                    event.preventDefault();
            }

            return false;
        };
    }

    function stack(error) {
        try {
            throw error;
        } catch (e) {
            return e;
        }
    }
    function preventDefault(e) {
        e.preventDefault();
    }

    function globalDatabaseList(cb) {
        var val,
            localStorage = Dexie.dependencies.localStorage;
        if (!localStorage) return cb([]); // Envs without localStorage support
        try {
            val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
        } catch (e) {
            val = [];
        }
        if (cb(val)) {
            localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
        }
    }

    //
    // IndexSpec struct
    //
    function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
        /// <param name="name" type="String"></param>
        /// <param name="keyPath" type="String"></param>
        /// <param name="unique" type="Boolean"></param>
        /// <param name="multi" type="Boolean"></param>
        /// <param name="auto" type="Boolean"></param>
        /// <param name="compound" type="Boolean"></param>
        /// <param name="dotted" type="Boolean"></param>
        this.name = name;
        this.keyPath = keyPath;
        this.unique = unique;
        this.multi = multi;
        this.auto = auto;
        this.compound = compound;
        this.dotted = dotted;
        var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && ('[' + [].join.call(keyPath, '+') + ']');
        this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
    }

    //
    // TableSchema struct
    //
    function TableSchema(name, primKey, indexes, instanceTemplate) {
        /// <param name="name" type="String"></param>
        /// <param name="primKey" type="IndexSpec"></param>
        /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
        /// <param name="instanceTemplate" type="Object"></param>
        this.name = name;
        this.primKey = primKey || new IndexSpec();
        this.indexes = indexes || [new IndexSpec()];
        this.instanceTemplate = instanceTemplate;
        this.mappedClass = null;
        this.idxByName = indexes.reduce(function (hashSet, index) {
            hashSet[index.name] = index;
            return hashSet;
        }, {});
    }

    //
    // ModifyError Class (extends Error)
    //
    function ModifyError(msg, failures, successCount, failedKeys) {
        this.name = "ModifyError";
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = failures.join('\n');
    }
    derive(ModifyError).from(Error);

    //
    // Static delete() method.
    //
    Dexie.delete = function (databaseName) {
        var db = new Dexie(databaseName),
            promise = db.delete();
        promise.onblocked = function (fn) {
            db.on("blocked", fn);
            return this;
        };
        return promise;
    }; 

    //
    // Static method for retrieving a list of all existing databases at current host.
    //
    Dexie.getDatabaseNames = function (cb) {
        return new Promise(function (resolve, reject) {
            var getDatabaseNames = getNativeGetDatabaseNamesFn();
            if (getDatabaseNames) { // In case getDatabaseNames() becomes standard, let's prepare to support it:
                var req = getDatabaseNames();
                req.onsuccess = function (event) {
                    resolve([].slice.call(event.target.result, 0)); // Converst DOMStringList to Array<String>
                }; 
                req.onerror = eventRejectHandler(reject);
            } else {
                globalDatabaseList(function (val) {
                    resolve(val);
                    return false;
                });
            }
        }).then(cb);
    }; 

    Dexie.defineClass = function (structure) {
        /// <summary>
        ///     Create a javascript constructor based on given template for which properties to expect in the class.
        ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
        /// </summary>
        /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
        /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

        // Default constructor able to copy given properties into this object.
        function Class(properties) {
            /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
            /// </param>
            if (properties) extend(this, properties);
        }
        applyStructure(Class.prototype, structure);
        return Class;
    }; 

    Dexie.ignoreTransaction = function (scopeFunc) {
        // In case caller is within a transaction but needs to create a separate transaction.
        // Example of usage:
        // 
        // Let's say we have a logger function in our app. Other application-logic should be unaware of the
        // logger function and not need to include the 'logentries' table in all transaction it performs.
        // The logging should always be done in a separate transaction and not be dependant on the current
        // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
        //
        //     Dexie.ignoreTransaction(function() {
        //         db.logentries.add(newLogEntry);
        //     });
        //
        // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
        // in current Promise-scope.
        //
        // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
        // API for this because
        //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
        //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
        //  3) setImmediate() is not supported in the ES standard.
        return Promise.newPSD(function () {
            Promise.PSD.trans = null;
            return scopeFunc();
        });
    };
    Dexie.spawn = function () {
        if (global.console) console.warn("Dexie.spawn() is deprecated. Use Dexie.ignoreTransaction() instead.");
        return Dexie.ignoreTransaction.apply(this, arguments);
    }

    Dexie.vip = function (fn) {
        // To be used by subscribers to the on('ready') event.
        // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
        // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
        // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
        // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
        // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
        // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
        // the caller will not resolve until database is opened.
        return Promise.newPSD(function () {
            Promise.PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
            return fn();
        });
    }; 

    // Dexie.currentTransaction property. Only applicable for transactions entered using the new "transact()" method.
    Object.defineProperty(Dexie, "currentTransaction", {
        get: function () {
            /// <returns type="Transaction"></returns>
            return Promise.PSD && Promise.PSD.trans || null;
        }
    }); 

    function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
    }

    // Export our Promise implementation since it can be handy as a standalone Promise implementation
    Dexie.Promise = Promise;
    // Export our derive/extend/override methodology
    Dexie.derive = derive;
    Dexie.extend = extend;
    Dexie.override = override;
    // Export our events() function - can be handy as a toolkit
    Dexie.events = events;
    Dexie.getByKeyPath = getByKeyPath;
    Dexie.setByKeyPath = setByKeyPath;
    Dexie.delByKeyPath = delByKeyPath;
    Dexie.shallowClone = shallowClone;
    Dexie.deepClone = deepClone;
    Dexie.addons = [];
    Dexie.fakeAutoComplete = fakeAutoComplete;
    Dexie.asap = asap;
    // Export our static classes
    Dexie.ModifyError = ModifyError;
    Dexie.MultiModifyError = ModifyError; // Backward compatibility pre 0.9.8
    Dexie.IndexSpec = IndexSpec;
    Dexie.TableSchema = TableSchema;
    //
    // Dependencies
    //
    // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
    //
    // In node.js, however, these properties must be set "manually" before instansiating a new Dexie(). For node.js, you need to require indexeddb-js or similar and then set these deps.
    //
    var idbshim = global.idbModules && global.idbModules.shimIndexedDB ? global.idbModules : {};
    Dexie.dependencies = {
        // Required:
        // NOTE: The "_"-prefixed versions are for prioritizing IDB-shim on IOS8 before the native IDB in case the shim was included.
        indexedDB: idbshim.shimIndexedDB || global.indexedDB || global.mozIndexedDB || global.webkitIndexedDB || global.msIndexedDB,
        IDBKeyRange: idbshim.IDBKeyRange || global.IDBKeyRange || global.webkitIDBKeyRange,
        IDBTransaction: idbshim.IDBTransaction || global.IDBTransaction || global.webkitIDBTransaction,
        // Optional:
        Error: global.Error || String,
        SyntaxError: global.SyntaxError || String,
        TypeError: global.TypeError || String,
        DOMError: global.DOMError || String,
        localStorage: ((typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : global.localStorage)
    }; 

    // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
    Dexie.version = 1.10;

    function getNativeGetDatabaseNamesFn() {
        var indexedDB = Dexie.dependencies.indexedDB;
        var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
        return fn && fn.bind(indexedDB);
    }

    // Export Dexie to window or as a module depending on environment.
    publish("Dexie", Dexie);

    // Fool IDE to improve autocomplete. Tested with Visual Studio 2013 but should work with 2012 and 2015 as well.
    doFakeAutoComplete(function() {
        fakeAutoComplete = doFakeAutoComplete;
    });
}).apply(null,

    // AMD:
    typeof define === 'function' && define.amd ?
    [self || window, function (name, value) { define(name, function () { return value; }); }] :

    // CommonJS:
    typeof global !== 'undefined' && typeof module !== 'undefined' && module.exports ?
    [global, function (name, value) { module.exports = value; }]

    // Vanilla HTML and WebWorkers:
    : [self || window, function (name, value) { (self || window)[name] = value; }]);


/// <reference path="../../src/Dexie.js" />
/*
 * Disclaimber: This addon is in alpha status meaning that
 * its API and behavior may change.
 */

(function(window, define, undefined) {

    "use strict";

    define("Dexie.Observable", ["Dexie"], function(Dexie) {

        /** class DatabaseChange
         *
         *  Object contained by the _changes table.
         */
        var DatabaseChange = Dexie.defineClass({
            rev: Number, // Auto-incremented primary key
            source: String, // Optional source creating the change. Set if transaction.source was set when doing the operation.
            table: String, // Table name
            key: Object, // Primary key. Any type.
            type: Number, // 1 = CREATE, 2 = UPDATE, 3 = DELETE
            obj: Object, // CREATE: obj contains the object created.
            mods: Object, // UPDATE: mods contains the modifications made to the object.
            oldObj: Object // DELETE: oldObj contains the object deleted. UPDATE: oldObj contains the old object before updates applied.
        });


        // Import some usable helper functions
        var override = Dexie.override;
        var Promise = Dexie.Promise;
        var browserIsShuttingDown = false;

        function Observable(db) {
            /// <summary>
            ///   Extension to Dexie providing Syncronization capabilities to Dexie.
            /// </summary>
            /// <param name="db" type="Dexie"></param>

            var NODE_TIMEOUT = 20000, // 20 seconds before local db instances are timed out. This is so that old changes can be deleted when not needed and to garbage collect old _syncNodes objects.
                HIBERNATE_GRACE_PERIOD = 20000, // 20 seconds
                // LOCAL_POLL: The time to wait before polling local db for changes and cleaning up old nodes. 
                // Polling for changes is a fallback only needed in certain circomstances (when the onstorage event doesnt reach all listeners - when different browser windows doesnt share the same process)
                LOCAL_POLL = 2000, // 1 second. In real-world there will be this value + the time it takes to poll().
                CREATE = 1,
                UPDATE = 2,
                DELETE = 3;

            var localStorage = Observable.localStorageImpl;

            /** class SyncNode
             *
             * Object contained in the _syncNodes table.
             */
            var SyncNode = Dexie.defineClass({
                //id: Number,
                myRevision: Number,
                type: String, // "local" or "remote"
                lastHeartBeat: Number,
                deleteTimeStamp: Number, // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.
                url: String, // Only applicable for "remote" nodes. Only used in Dexie.Syncable.
                isMaster: Number, // 1 if true. Not using Boolean because it's not possible to index Booleans in IE implementation of IDB.

                // Below properties should be extended in Dexie.Syncable. Not here. They apply to remote nodes only (type == "remote"):
                syncProtocol: String, // Tells which implementation of ISyncProtocol to use for remote syncing. 
                syncContext: null,
                syncOptions: Object,
                connected: false, // FIXTHIS: Remove! Replace with status.
                status: Number,
                appliedRemoteRevision: null,
                remoteBaseRevisions: [{ local: Number, remote: null }],
                dbUploadState: {
                    tablesToUpload: [String],
                    currentTable: String,
                    currentKey: null,
                    localBaseRevision: Number
                }
            });


            var mySyncNode = null;

            // Allow other addons to access the local sync node. May be needed by Dexie.Syncable.
            Object.defineProperty(db, "_localSyncNode", {
                get: function() { return mySyncNode; }
            });

            var pollHandle = null;

            Dexie.fakeAutoComplete(function() {
                db.version(1).stores({
                    _syncNodes: "++id,myRevision,lastHeartBeat",
                    _changes: "++rev",
                    _intercomm: "++id,destinationNode",
                    _uncommittedChanges: "++id,node"
                });
                db._syncNodes.mapToClass(SyncNode);
                db._changes.mapToClass(DatabaseChange);
                mySyncNode = new SyncNode({
                    myRevision: 0,
                    type: "local",
                    lastHeartBeat: Date.now(),
                    deleteTimeStamp: null
                });
            });


            //
            // Override parsing the stores to add "_changes" and "_syncNodes" tables.
            //
            db.Version.prototype._parseStoresSpec = override(db.Version.prototype._parseStoresSpec, function(origFunc) {
                return function(stores, dbSchema) {
                    // Create the _changes and _syncNodes tables
                    stores["_changes"] = "++rev";
                    stores["_syncNodes"] = "++id,myRevision,lastHeartBeat,url,isMaster,type,status";
                    stores["_intercomm"] = "++id,destinationNode";
                    stores["_uncommittedChanges"] = "++id,node"; // For remote syncing when server returns a partial result.
                    // Call default implementation. Will populate the dbSchema structures.
                    origFunc.call(this, stores, dbSchema);
                    // Allow UUID primary keys using $$ prefix on primary key or indexes
                    Object.keys(dbSchema).forEach(function(tableName) {
                        var schema = dbSchema[tableName];
                        if (schema.primKey.name.indexOf('$$') === 0) {
                            schema.primKey.uuid = true;
                            schema.primKey.name = schema.primKey.name.substr(2);
                            schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
                        }
                    });
                    // Now mark all observable tables
                    Object.keys(dbSchema).forEach(function(tableName) {
                        // Marked observable tables with "observable" in their TableSchema.
                        if (tableName.indexOf('_') !== 0 && tableName.indexOf('$') !== 0) {
                            dbSchema[tableName].observable = true;
                        }
                    });
                };
            });

            //
            // Make sure to subscribe to "creating", "updating" and "deleting" hooks for all observable tables that were created in the stores() method.
            //
            db._tableFactory = override(db._tableFactory, function(origCreateTable) {
                return function createTable(mode, tableSchema, transactionPromiseFactory) {
                    var table = origCreateTable.apply(this, arguments);
                    if (table.schema.observable && transactionPromiseFactory === db._transPromiseFactory) { // Only crudMonitor when creating 
                        crudMonitor(table);
                    }
                    if (table.name === "_syncNodes" && transactionPromiseFactory === db._transPromiseFactory) {
                        table.mapToClass(SyncNode);
                    }
                    return table;
                };
            });

            // changes event on db:
            db.on.addEventType({
                changes: 'asap',
                cleanup: [promisableChain, nop], // fire (nodesTable, changesTable, trans). Hook called when cleaning up nodes. Subscribers may return a Promise to to more stuff. May do additional stuff if local sync node is master.
                message: 'asap'
            });

            //
            // Overide transaction creation to always include the "_changes" store when any observable store is involved.
            //
            db._createTransaction = override(db._createTransaction, function(origFunc) {
                return function(mode, storenames, dbschema, parent) {
                    var addChanges = false;
                    if (mode === 'readwrite' && storenames.some(function(storeName) { return dbschema[storeName] && dbschema[storeName].observable; })) {
                        // At least one included store is a observable store. Make sure to also include the _changes store.
                        addChanges = true;
                        storenames = storenames.slice(0); // Clone
                        if (storenames.indexOf("_changes") === -1)
                            storenames.push("_changes"); // Otherwise, firefox will hang... (I've reported the bug to Mozilla@Bugzilla)
                    }
                    // Call original db._createTransaction()
                    var trans = origFunc.call(this, mode, storenames, dbschema, parent);
                    // If this transaction is bound to any observable table, make sure to add changes when transaction completes.
                    if (addChanges) {
                        trans._lastWrittenRevision = 0;
                        trans.on('complete', function() {
                            if (trans._lastWrittenRevision) {
                                // Changes were written in this transaction.
                                if (!parent) {
                                    // This is root-level transaction, i.e. a physical commit has happened.
                                    // Delay-trigger a wakeup call:
                                    if (wakeupObservers.timeoutHandle) clearTimeout(wakeupObservers.timeoutHandle);
                                    wakeupObservers.timeoutHandle = setTimeout(function() {
                                        delete wakeupObservers.timeoutHandle;
                                        wakeupObservers(trans._lastWrittenRevision);
                                    }, 25);
                                } else {
                                    // This is just a virtual commit of a sub transaction.
                                    // Wait with waking up observers until root transaction has committed.
                                    // Make sure to mark root transaction so that it will wakeup observers upon commit.
                                    var rootTransaction = (function findRootTransaction(trans) {
                                        return trans.parent ? findRootTransaction(trans.parent) : trans;
                                    })(parent);
                                    rootTransaction._lastWrittenRevision = Math.max(
                                        trans._lastWrittenRevision,
                                        rootTransaction.lastWrittenRevision || 0);
                                }
                            }
                        });
                        // Derive "source" property from parent transaction by default
                        if (trans.parent && trans.parent.source) trans.source = trans.parent.source;
                    }
                    return trans;
                };
            });

            // If Observable.latestRevsion[db.name] is undefined, set it to 0 so that comparing against it always works.
            // You might think that it will always be undefined before this call, but in case another Dexie instance in the same
            // window with the same database name has been created already, this static property will already be set correctly.
            Observable.latestRevision[db.name] = Observable.latestRevision[db.name] || 0;

            function wakeupObservers(lastWrittenRevision) {
                // Make sure Observable.latestRevision[db.name] is still below our value, now when some time has elapsed and other db instances in same window possibly could have made changes too.
                if (Observable.latestRevision[db.name] < lastWrittenRevision) {
                    // Set the static property lastRevision[db.name] to the revision of the last written change.
                    Observable.latestRevision[db.name] = lastWrittenRevision;
                    // Wakeup ourselves, and any other db instances on this window:
                    Dexie.ignoreTransaction(function() {
                        Observable.on('latestRevisionIncremented').fire(db.name, lastWrittenRevision);
                    });
                    // Observable.on.latestRevisionIncremented will only wakeup db's in current window.
                    // We need a storage event to wakeup other windwos.
                    // Since indexedDB lacks storage events, let's use the storage event from WebStorage just for
                    // the purpose to wakeup db instances in other windows.
                    localStorage.setItem('Dexie.Observable/latestRevision/' + db.name, lastWrittenRevision); // In IE, this will also wakeup our own window. However, onLatestRevisionIncremented will work around this by only running once per revision id.
                }
            }

            db.close = override(db.close, function(origClose) {
                return function() {
                    // Teardown our framework.
                    if (wakeupObservers.timeoutHandle) {
                        clearTimeout(wakeupObservers.timeoutHandle);
                        delete wakeupObservers.timeoutHandle;
                    }
                    Observable.on('latestRevisionIncremented').unsubscribe(onLatestRevisionIncremented);
                    Observable.on('suicideNurseCall').unsubscribe(onSuicide);
                    Observable.on('intercomm').unsubscribe(onIntercomm);
                    Observable.on('beforeunload').unsubscribe(onBeforeUnload);
                    // Inform other db instances in same window that we are dying:
                    if (mySyncNode && mySyncNode.id) {
                        Observable.on.suicideNurseCall.fire(db.name, mySyncNode.id);
                        // Inform other windows as well:
                        localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. cleanup() may trigger twice per other db instance. But that doesnt to anything.
                        mySyncNode.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
                        mySyncNode.lastHeartBeat = 0;
                        db._syncNodes.put(mySyncNode); // This async operation may be cancelled since the browser is closing down now.
                        mySyncNode = null;
                    }

                    if (pollHandle) clearTimeout(pollHandle);
                    pollHandle = null;
                    return origClose.apply(this, arguments);
                };
            });

            // Override Dexie.delete() in order to delete Observable.latestRevision[db.name].
            db.delete = override(db.delete, function(origDelete) {
                return function() {
                    return origDelete.apply(this, arguments).then(function(result) {
                        // Reset Observable.latestRevision[db.name]
                        Observable.latestRevision[db.name] = 0;
                        return result;
                    });
                };
            });

            //
            // The Creating/Updating/Deleting hook will make sure any change is stored to the changes table
            //
            function crudMonitor(table) {
                /// <param name="table" type="db.Table"></param>
                var tableName = table.name;

                table.hook('creating').subscribe(function(primKey, obj, trans) {
                    /// <param name="trans" type="db.Transaction"></param>
                    var rv = undefined;
                    if (primKey === undefined && table.schema.primKey.uuid) {
                        primKey = rv = Observable.createUUID();
                        if (table.schema.primKey.keyPath) {
                            Dexie.setByKeyPath(obj, table.schema.primKey.keyPath, primKey);
                        }
                    }
                    if (trans.db.nosync) {
                        return;
                    }
                    var change = {
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey === undefined ? null : primKey,
                        type: CREATE,
                        obj: angular.toJson(obj),
                        transDate: (new Date()).toISOString()
                    };

                    var promise = trans.tables._changes.add(change).then(function(rev) {
                        trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                        return rev;
                    });

                    // Wait for onsuccess so that we have the primKey if it is auto-incremented and update the change item if so.
                    this.onsuccess = function(resultKey) {
                        if (primKey != resultKey)
                            promise._then(function() {
                                change.key = resultKey;
                                trans.tables._changes.put(change);
                            });
                    }
                    this.onerror = function(err) {
                        // If the main operation fails, make sure to regret the change
                        promise._then(function(rev) {
                            // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                            trans.tables._changes.delete(rev);
                        });
                    }

                    return rv;
                });

                table.hook('updating').subscribe(function(mods, primKey, oldObj, trans) {
                    /// <param name="trans" type="db.Transaction"></param>
                    // mods may contain property paths with undefined as value if the property
                    // is being deleted. Since we cannot persist undefined we need to act
                    // like those changes is setting the value to null instead.
                    var modsWithoutUndefined = {};
                    // As of current Dexie version (1.0.3) hook may be called even if it wouldnt really change.
                    // Therefore we may do that kind of optimization here - to not add change entries if
                    // there's nothing to change.
                    var anythingChanged = false;
                    var newObj = Dexie.deepClone(oldObj);
                    for (var propPath in mods) {
                        var mod = mods[propPath];
                        if (typeof mod === 'undefined') {
                            Dexie.delByKeyPath(newObj, propPath);
                            modsWithoutUndefined[propPath] = null; // Null is as close we could come to deleting a property when not allowing undefined.
                            anythingChanged = true;
                        } else {
                            var currentValue = Dexie.getByKeyPath(oldObj, propPath);
                            if (mod !== currentValue && JSON.stringify(mod) !== JSON.stringify(currentValue)) {
                                Dexie.setByKeyPath(newObj, propPath, mod);
                                modsWithoutUndefined[propPath] = mod;
                                anythingChanged = true;
                            }
                        }
                    }
                    if (anythingChanged) {
                        if (trans.db.nosync) {
                            return;
                        }                       
                        var change = {
                            source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                            table: tableName,
                            key: primKey,
                            type: UPDATE,
                            mods: angular.toJson(modsWithoutUndefined),
                            oldObj: angular.toJson(oldObj),
                            obj: angular.toJson(newObj),
                            transDate: (new Date()).toISOString()
                        };
                        var promise = trans.tables._changes.add(change); // Just so we get the correct revision order of the update...
                        this.onsuccess = function() {
                            promise._then(function(rev) {
                                trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                            });
                        };
                        this.onerror = function(err) {
                            // If the main operation fails, make sure to regret the change.
                            promise._then(function(rev) {
                                // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                                trans.tables._changes.delete(rev);
                            });
                        };
                    }
                });

                table.hook('deleting').subscribe(function(primKey, obj, trans) {
                    /// <param name="trans" type="db.Transaction"></param>
                    if (trans.db.nosync) {
                        return;
                    }
                    var promise = trans.tables._changes.add({
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey,
                        type: DELETE,
                        oldObj: angular.toJson(obj),
                        transDate: (new Date()).toISOString()
                    }).then(function(rev) {
                        trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                        return rev;
                    });
                    this.onerror = function() {
                        // If the main operation fails, make sure to regret the change.
                        // Using _then because if promise is already fullfilled, the standard then() would
                        // do setTimeout() and we would loose the transaction.
                        promise._then(function(rev) {
                            // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                            trans.tables._changes.delete(rev);
                        });
                    };
                });
            }

            // When db opens, make sure to start monitor any changes before other db operations will start.
            db.on("ready", function startObserving() {
                return db.table("_changes").orderBy("rev").last(function(lastChange) {
                    // Since startObserving() is called before database open() method, this will be the first database operation enqueued to db.
                    // Therefore we know that the retrieved value will be This query will
                    var latestRevision = (lastChange ? lastChange.rev : 0);
                    mySyncNode = new SyncNode({
                        myRevision: latestRevision,
                        type: "local",
                        lastHeartBeat: Date.now(),
                        deleteTimeStamp: null,
                        isMaster: 0
                    });
                    if (Observable.latestRevision[db.name] < latestRevision) {
                        // Side track . For correctness whenever setting Observable.latestRevision[db.name] we must make sure the event is fired if increased:
                        // There are other db instances in same window that hasnt yet been informed about a new revision
                        Observable.latestRevision[db.name] = latestRevision;
                        Dexie.ignoreTransaction(function() {
                            Observable.on.latestRevisionIncremented.fire(latestRevision);
                        });
                    }
                    // Add new sync node or if this is a reopening of the database after a close() call, update it.
                    return db.transaction('rw', '_syncNodes', function() {
                        db._syncNodes.where('isMaster').equals(1).count(function(anyMasterNode) {
                            if (!anyMasterNode) {
                                // There's no master node. Let's take that role then.
                                mySyncNode.isMaster = 1;
                            }
                            // Add our node to DB and start subscribing to events
                            db._syncNodes.add(mySyncNode).then(function() {
                                Observable.on('latestRevisionIncremented', onLatestRevisionIncremented); // Wakeup when a new revision is available.
                                Observable.on('beforeunload', onBeforeUnload);
                                Observable.on('suicideNurseCall', onSuicide);
                                Observable.on('intercomm', onIntercomm);
                                // Start polling for changes and do cleanups:
                                pollHandle = setTimeout(poll, LOCAL_POLL);
                            });
                        });
                    }).then(cleanup);
                    //cleanup();
                    //});
                });
            }, true); // True means the on(ready) event will survive a db reopening (db.close() / db.open()).

            var handledRevision = 0;

            function onLatestRevisionIncremented(dbname, latestRevision) {
                if (dbname === db.name) {
                    if (handledRevision >= latestRevision) return; // Make sure to only run once per revision. (Workaround for IE triggering storage event on same window)
                    handledRevision = latestRevision;
                    Dexie.vip(function() {
                        readChanges(latestRevision);
                    });
                }
            }

            function readChanges(latestRevision, recursion, wasPartial) {
                // Whenever changes are read, fire db.on("changes") with the array of changes. Eventually, limit the array to 1000 entries or so (an entire database is
                // downloaded from server AFTER we are initiated. For example, if first sync call fails, then after a while we get reconnected. However, that scenario
                // should be handled in case database is totally empty we should fail if sync is not available)
                if (!recursion && readChanges.ongoingOperation) {
                    // We are already reading changes. Prohibit a parallell execution of this which would lead to duplicate trigging of 'changes' event.
                    // Instead, the callback in toArray() will always check Observable.latestRevision[db.name] to see if it has changed and if so, re-launch readChanges().
                    // The caller should get the Promise instance from the ongoing operation so that the then() method will resolve when operation is finished.
                    return readChanges.ongoingOperation;
                }

                var partial = false;
                var ourSyncNode = mySyncNode; // Because mySyncNode can suddenly be set to null on database close, and worse, can be set to a new value if database is reopened.
                if (!ourSyncNode) {
                    return Promise.reject("Database closed");
                }
                var promise = db._changes.where("rev").above(ourSyncNode.myRevision).limit(1000).toArray(function(changes) {
                    if (changes.length > 0) {
                        var lastChange = changes[changes.length - 1];
                        partial = (changes.length === 1000); // Same as limit.
                        // Let all objects pass through the READING hook before notifying our listeners:
                        changes.forEach(function(change) {
                            var table = db.table(change.table);
                            if (change.obj) change.obj = table.hook.reading.fire(change.obj);
                            if (change.oldObj) change.oldObj = table.hook.reading.fire(change.oldObj);
                        });
                        db.on('changes').fire(changes, partial);
                        ourSyncNode.myRevision = lastChange.rev;
                    } else if (wasPartial) {
                        // No more changes, BUT since we have triggered on('changes') with partial = true,
                        // we HAVE TO trigger changes again with empty list and partial = false
                        db.on('changes').fire([], false);
                    }

                    return db.table("_syncNodes").update(ourSyncNode, {
                        lastHeartBeat: Date.now(),
                        deleteTimeStamp: null // Reset "deleteTimeStamp" flag if it was there.
                    });
                }).then(function(nodeWasUpdated) {
                    if (!nodeWasUpdated) {
                        // My node has been deleted. We must have been lazy and got removed by another node.
                        if (browserIsShuttingDown) {
                            throw new Error("Browser is shutting down");
                        } else {
                            db.close();
                            console.error("Out of sync"); // TODO: What to do? Reload the page?
                            if (window.location) window.location.reload(true);
                            throw new Error("Out of sync"); // Will make current promise reject
                        }
                    }

                    // Check if more changes have come since we started reading changes in the first place. If so, relaunch readChanges and let the ongoing promise not
                    // resolve until all changes have been read.
                    if (partial || Observable.latestRevision[db.name] > ourSyncNode.myRevision) {
                        // Either there were more than 1000 changes or additional changes where added while we were reading these changes,
                        // In either case, call readChanges() again until we're done.
                        return readChanges(Observable.latestRevision[db.name], (recursion || 0) + 1, partial);
                    }

                }).finally(function() {
                    delete readChanges.ongoingOperation;
                });

                if (!recursion) {
                    readChanges.ongoingOperation = promise;
                }
                return promise;
            }


            function poll() {
                pollHandle = null;
                var currentInstance = mySyncNode.id;
                Dexie.vip(function() { // VIP ourselves. Otherwise we might not be able to consume intercomm messages from master node before database has finished opening. This would make DB stall forever. Cannot rely on storage-event since it may not always work in some browsers of different processes.
                    readChanges(Observable.latestRevision[db.name]).then(cleanup).then(consumeIntercommMessages).finally(function() {
                        // Poll again in given interval:
                        if (mySyncNode && mySyncNode.id === currentInstance) {
                            pollHandle = setTimeout(poll, LOCAL_POLL);
                        }
                    });
                });
            }

            function cleanup() {
                var ourSyncNode = mySyncNode;
                if (!ourSyncNode) return Promise.reject("Database closed");
                return db.transaction('rw', '_syncNodes', '_changes', '_intercomm', function() {
                    // Cleanup dead local nodes that has no heartbeat for over a minute
                    // Dont do the following:
                    //nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).delete();
                    // Because client may have been in hybernate mode and recently woken up. That would lead to deletion of all nodes.
                    // Instead, we should mark any old nodes for deletion in a minute or so. If they still dont wakeup after that minute we could consider them dead.
                    var weBecameMaster = false;
                    db._syncNodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function(node) { return node.type === 'local'; }).modify(function(node) {
                        if (node.deleteTimeStamp && node.deleteTimeStamp < Date.now()) {
                            // Delete the node.
                            delete this.value;
                            // Cleanup localStorage "deadnode:" entry for this node (localStorage API was used to wakeup other windows (onstorage event) - an event type missing in indexedDB.)
                            localStorage.removeItem('Dexie.Observable/deadnode:' + node.id + '/' + db.name);
                            // Check if we are deleting a master node
                            if (node.isMaster) {
                                // The node we are deleting is master. We must take over that role.
                                // OK to call nodes.update(). No need to call Dexie.vip() because nodes is opened in existing transaction!
                                db._syncNodes.update(ourSyncNode, { isMaster: 1 });
                                weBecameMaster = true;
                            }
                            // Cleanup intercomm messages destinated to the node being deleted:
                            db._intercomm.where("destinationNode").equals(node.id).modify(function(msg) {
                                // OK to call intercomm. No need to call Dexie.vip() because intercomm is opened in existing transaction!
                                // Delete the message from DB and if someone is waiting for reply, let ourselved answer the request.
                                delete this.value;
                                if (msg.wantReply) {
                                    // Message wants a reply, meaning someone must take over its messages when it dies. Let us be that one!
                                    Dexie.ignoreTransaction(function() {
                                        consumeMessage(msg);
                                    });
                                }
                            });
                        } else if (!node.deleteTimeStamp) {
                            // Mark the node for deletion
                            node.deleteTimeStamp = Date.now() + HIBERNATE_GRACE_PERIOD;
                        }
                    }).then(function() {
                        // Cleanup old revisions that no node is interested of.
                        return db._syncNodes.orderBy("myRevision").first(function(oldestNode) {
                            return db._changes.where("rev").below(oldestNode.myRevision).delete();
                        });
                    }).then(function() {
                        return db.on("cleanup").fire(weBecameMaster);
                    });
                });
            }


            function onBeforeUnload(event) {
                // Mark our own sync node for deletion.
                if (!mySyncNode) return;
                browserIsShuttingDown = true;
                mySyncNode.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
                mySyncNode.lastHeartBeat = 0;
                db._syncNodes.put(mySyncNode); // This async operation may be cancelled since the browser is closing down now.
                Observable.wereTheOneDying = true; // If other nodes in same window wakes up by this call, make sure they dont start taking over mastership and stuff...
                // Inform other windows that we're gone, so that they may take over our role if needed. Setting localStorage item below will trigger Observable.onStorage, which will trigger onSuicie() below:
                localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. However, that is doublechecked in nursecall subscriber below.
            }

            function onSuicide(dbname, nodeID) {
                if (dbname === db.name && !Observable.wereTheOneDying) {
                    // Make sure it's dead indeed. Second bullet. Why? Because it has marked itself for deletion in the onbeforeunload event, which is fired just before window dies.
                    // It's own call to put() may have been cancelled.
                    // Note also that in IE, this event may be called twice, but that doesnt harm!
                    Dexie.vip(function() {
                        db._syncNodes.update(nodeID, { deleteTimeStamp: 1, lastHeartBeat: 0 }).then(cleanup);
                    });
                }
            }

            //
            // Intercommunication between nodes
            //
            // Enable inter-process communication between browser windows

            var requestsWaitingForReply = {};

            db.sendMessage = function(type, message, destinationNode, options) {
                /// <param name="type" type="String">Type of message</param>
                /// <param name="message">Message to send</param>
                /// <param name="destinationNode" type="Number">ID of destination node</param>
                /// <param name="options" type="Object" optional="true">{wantReply: Boolean, isFailure: Boolean, requestId: Number}. If wantReply, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
                if (!mySyncNode) return Promise.reject("Database closed");
                options = options || {};
                var msg = { message: message, destinationNode: destinationNode, sender: mySyncNode.id, type: type };
                Dexie.extend(msg, options); // wantReply: wantReply, success: !isFailure, requestId: ...
                var tables = ["_intercomm"];
                if (options.wantReply) tables.push("_syncNodes"); // If caller wants a reply, include "_syncNodes" in transaction to check that there's a reciever there. Otherwise, new master will get it.
                return db.transaction('rw', tables, function() {
                    if (options.wantReply) {
                        // Check that there is a reciever there to take the request.
                        return db._syncNodes.where('id').equals(destinationNode).count(function(recieverAlive) {
                            if (recieverAlive)
                                return addMessage(msg);
                            else
                                return db._syncNodes.where('isMaster').above(0).first(function(masterNode) {
                                    msg.destinationNode = masterNode.id;
                                    return addMessage(msg);
                                });
                        });
                    } else {
                        addMessage(msg); // No need to return Promise. Caller dont need a reply.
                    }

                    function addMessage(msg) {
                        return db._intercomm.add(msg).then(function(messageId) {
                            localStorage.setItem("Dexie.Observable/intercomm/" + db.name, messageId.toString());
                            Dexie.ignoreTransaction(function() {
                                Observable.on.intercomm.fire(db.name);
                            });
                            if (options.wantReply) {
                                return new Promise(function(resolve, reject) {
                                    requestsWaitingForReply[messageId.toString()] = { resolve: resolve, reject: reject };
                                });
                            }
                        });
                    }
                });
            };

            db.broadcastMessage = function(type, message, bIncludeSelf) {
                if (!mySyncNode) return Promise.reject("Database closed");
                var mySyncNodeId = mySyncNode.id;
                db._syncNodes.each(function(node) {
                    if (node.type === 'local' && (bIncludeSelf || node.id !== mySyncNodeId)) {
                        db.sendMessage(type, message, node.id);
                    }
                });
            };

            db.observable = {};
            db.observable.SyncNode = SyncNode;

            function consumeIntercommMessages() {
                // Check if we got messages:
                if (!mySyncNode) return Promise.reject("Database closed");
                return db.table('_intercomm').where("destinationNode").equals(mySyncNode.id).modify(function(msg) {
                    // For each message, fire the event and remove message.
                    delete this.value;
                    Dexie.ignoreTransaction(function() {
                        consumeMessage(msg);
                    });
                });
            }

            function consumeMessage(msg) {
                if (msg.type === 'response') {
                    // This is a response. Lookup pending request and fulfill it's promise.
                    var request = requestsWaitingForReply[msg.requestId.toString()];
                    if (request) {
                        if (msg.isFailure) {
                            request.reject(msg.message.error);
                        } else {
                            request.resolve(msg.message.result);
                        }
                        delete requestsWaitingForReply[msg.requestId.toString()];
                    }
                } else {
                    // This is a message or request. Fire the event and add an API for the subscriber to use if reply is requested
                    msg.resolve = function(result) {
                        db.sendMessage('response', { result: result }, msg.sender, { requestId: msg.id });
                    };
                    msg.reject = function(error) {
                        db.sendMessage('response', { error: error.toString() }, msg.sender, { isFailure: true, requestId: msg.id });
                    };
                    var message = msg.message;
                    delete msg.message;
                    Dexie.extend(msg, message);
                    db.on.message.fire(msg);
                }
            }

            function onIntercomm(dbname) {
                // When storage event trigger us to check
                if (dbname === db.name) {
                    consumeIntercommMessages();
                }
            }

        }


//
        // Help functions
        //

        function nop() {};

        function promisableChain(f1, f2) {
            if (f1 === nop) return f2;
            return function() {
                var res = f1.apply(this, arguments);
                if (res && typeof res.then === 'function') {
                    var thiz = this, args = arguments;
                    return res.then(function() {
                        return f2.apply(thiz, args);
                    });
                }
                return f2.apply(this, arguments);
            };
        }

        //
        // Static properties and methods
        // 

        Observable.latestRevision = {}; // Latest revision PER DATABASE. Example: Observable.latestRevision.FriendsDB = 37;
        Observable.on = Dexie.events(null, "latestRevisionIncremented", "suicideNurseCall", "intercomm", "beforeunload"); // fire(dbname, value);
        Observable.createUUID = function() {
            // Decent solution from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            var d = Date.now();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        };

        Observable._onStorage = function onStorage(event) {
            // We use the onstorage event to trigger onLatestRevisionIncremented since we will wake up when other windows modify the DB as well!
            if (event.key.indexOf("Dexie.Observable/") === 0) { // For example "Dexie.Observable/latestRevision/FriendsDB"
                var parts = event.key.split('/');
                var prop = parts[1];
                var dbname = parts[2];
                if (prop === 'latestRevision') {
                    var rev = parseInt(event.newValue, 10);
                    if (!isNaN(rev) && rev > Observable.latestRevision[dbname]) {
                        Observable.latestRevision[dbname] = rev;
                        Dexie.ignoreTransaction(function() {
                            Observable.on('latestRevisionIncremented').fire(dbname, rev);
                        });
                    }
                } else if (prop.indexOf("deadnode:") === 0) {
                    var nodeID = parseInt(prop.split(':')[1], 10);
                    if (event.newValue) {
                        Observable.on.suicideNurseCall.fire(dbname, nodeID);
                    }
                } else if (prop === 'intercomm') {
                    if (event.newValue) {
                        Observable.on.intercomm.fire(dbname);
                    }
                }
            }
        };

        Observable._onBeforeUnload = function() {
            Observable.on.beforeunload.fire();
        };

        Observable.localStorageImpl = window.localStorage;

        //
        // Map window events to static events in Dexie.Observable:
        //
        window.addEventListener("storage", Observable._onStorage);
        window.addEventListener("beforeunload", Observable._onBeforeUnload);

        return Observable;
    });
}).apply(null, 
    // AMD:
    typeof define === 'function' && define.amd ? [self || window, define] : 
    // CommonJS:
    typeof global !== 'undefined' && typeof module !== 'undefined' && typeof require != 'undefined' ?
        [global, function (name, modules, fn) { 
            module.exports = fn.apply(null, modules.map(function(id) { return require(id); }));
        }] :
    // Vanilla HTML and WebWorkers:
    [self || window, function (name, modules, fn) {   
        var addon = fn.apply(null,modules.map(function(m){return m.split('.').reduce(function(p,c){return p&&p[c];},self || window);})),
            path = name.split('.'),
            nsHost = path.slice(0,path.length-1).reduce(function(p,c){return p&&p[c];},self || window);
        Dexie.addons.push(addon);
        nsHost[path[path.length-1]] = addon;
    }]
);
/// <reference path="../../../src/Dexie.js" />
/// <reference path="../Dexie.Observable/Dexie.Observable.js" />
/// <reference path="Dexie.Syncable.SyncProtocolAPI.js" />
/*
 * Disclaimber: This addon is in alpha status meaning that
 * its API and behavior may change.
 */

(function (window, define, undefined) {

    "use strict";

    define("Dexie.Syncable", ["Dexie", "Dexie.Observable"], function(Dexie, Observable) {

        var override = Dexie.override,
            Promise = Dexie.Promise,
            setByKeyPath = Dexie.setByKeyPath;

        function Syncable (db) {
            /// <param name="db" type="Dexie"></param>

            var activePeers = [];

            // Change Types
            var CREATE = 1,
                UPDATE = 2,
                DELETE = 3;

            // Statuses
            var Statuses = Syncable.Statuses;

            var MAX_CHANGES_PER_CHUNK = 1000;

            db.on('message', function(msg) {
                // Message from other local node arrives...
                Dexie.vip(function() {
                    if (msg.type === 'connect') {
                        // We are master node and another non-master node wants us to do the connect.
                        db.syncable.connect(msg.protocolName, msg.url, msg.options).then(msg.resolve, msg.reject);
                    } else if (msg.type === 'disconnect') {
                        db.syncable.disconnect(msg.url).then(msg.resolve, msg.reject);
                    } else if (msg.type === 'syncStatusChanged') {
                        // We are client and a master node informs us about syncStatus change.
                        // Lookup the connectedProvider and call its event
                        db.syncable.on.statusChanged.fire(msg.newStatus, msg.url);
                    }
                });
            });

            db.on('cleanup', function(weBecameMaster) {
                // A cleanup (done in Dexie.Observable) may result in that a master node is removed and we become master.
                if (weBecameMaster) {
                    // We took over the master role in Observable's cleanup method
                    db._syncNodes.where('type').equals('remote')
                        .and(function(node) { return node.status !== Statuses.OFFLINE && node.status !== Statuses.ERROR; })
                        .each(function(connectedRemoteNode) {
                            // There are connected remote nodes that we must take over
                            // Since we may be in the on(ready) event, we must get VIPed to continue
                            Dexie.ignoreTransaction(function() {
                                Dexie.vip(function() {
                                    db.syncable.connect(connectedRemoteNode.syncProtocol, connectedRemoteNode.url, connectedRemoteNode.syncOptions);
                                });
                            });
                        });
                }
            });

            db.on('ready', function onReady() {
                // Again, in onReady: If we ARE master, make sure to connect to remote servers that is in a connected state.
                if (db._localSyncNode && db._localSyncNode.isMaster) {
                    // Make sure to connect to remote servers that is in a connected state (NOT OFFLINE or ERROR!)
                    return db._syncNodes.where('type').equals('remote')
                        .and(function(node) { return node.status !== Statuses.OFFLINE && node.status !== Statuses.ERROR; })
                        .toArray(function(connectedRemoteNodes) {
                            // There are connected remote nodes that we must take over
                            if (connectedRemoteNodes.length > 0) {
                                return Promise.all(connectedRemoteNodes.map(function(node) {
                                    return db.syncable.connect(node.syncProtocol, node.url, node.syncOptions)
                                        .catch(function(err) {
                                            return undefined; // If a node fails to connect, don't make db.open() reject. Accept it!
                                        });
                                }));
                            }
                        });
                }
            }, true); // True means the ready event will survive a db reopen - db.close()/db.open()


            db.syncable = {};

            db.syncable.getStatus = function(url, cb) {
                if (db.isOpen()) {
                    return Dexie.vip(function() {
                        return db._syncNodes.where('url').equals(url).first(function(node) {
                            return node ? node.status : Statuses.OFFLINE;
                        });
                    }).then(cb);
                } else {
                    return Promise.resolve(Syncable.Statuses.OFFLINE).then(cb);
                }
            };

            db.syncable.list = function() {
                return db._syncNodes.where('type').equals('remote').toArray(function(a) {
                    return a.map(function(node) { return node.url; });
                });
            };

            db.syncable.on = Dexie.events(db, { statusChanged: "asap" });

            db.syncable.disconnect = function(url) {
                if (db._localSyncNode && db._localSyncNode.isMaster) {
                    activePeers.filter(function(peer) { return peer.url === url; }).forEach(function(peer) {
                        peer.disconnect(Statuses.OFFLINE);
                    });
                } else {
                    db._syncNodes.where('isMaster').above(0).first(function(masterNode) {
                        db.sendMessage('disconnect', { url: url }, masterNode.id, { wantReply: true });
                    });
                }

                return db._syncNodes.where("url").equals(url).modify(function(node) {
                    node.status = Statuses.OFFLINE;
                });
            };

            db.syncable.connect = function(protocolName, url, options) {
                options = options || {}; // Make sure options is always an object because 1) Provider expects it to be. 2) We'll be persisting it and you cannot persist undefined.
                var protocolInstance = Syncable.registeredProtocols[protocolName];

                if (protocolInstance) {
                    if (db.isOpen() && db._localSyncNode) {
                        // Database is open
                        if (db._localSyncNode.isMaster) {
                            // We are master node
                            return connect(protocolInstance, protocolName, url, options, db._localSyncNode.id);
                        } else {
                            // We are not master node
                            // Request master node to do the connect:
                            db.table('_syncNodes').where('isMaster').above(0).first(function(masterNode) {
                                // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
                                return db.sendMessage('connect', { protocolName: protocolName, url: url, options: options }, masterNode.id, { wantReply: true });
                            });
                            return Promise.resolve();
                        }
                    } else {
                        // Database not yet open
                        // Wait for it to open
                        return new Promise(function(resolve, reject) {
                            db.on("ready", function syncWhenReady() {
                                return Dexie.vip(function() {
                                    return db.syncable.connect(protocolName, url, options).then(resolve).catch(function(err) {
                                        // Reject the promise returned to the caller of db.syncable.connect():
                                        reject(err);
                                        // but resolve the promise that db.on("ready") waits for, because database should succeed to open even if the connect operation fails!
                                    });
                                });
                            });
                        });
                    }
                } else {
                    throw new Error("ISyncProtocol '" + protocolName + "' is not registered in Dexie.Syncable.registerSyncProtocol()");
                    return new Promise(); // For code completion
                }
            };

            db.syncable.delete = function(url) {
                // Notice: Caller should call db.syncable.disconnect(url) and wait for it to finish before calling db.syncable.delete(url)
                // Surround with a readwrite-transaction
                return db.transaction('rw', db._syncNodes, db._changes, db._uncommittedChanges, function() {
                    // Find the node
                    db._syncNodes.where("url").equals(url).toArray(function(nodes) {
                        // If it's found (or even several found, as detected by @martindiphoorn),
                        // let's delete it (or them) and cleanup _changes and _uncommittedChanges
                        // accordingly.
                        if (nodes.length > 0) {
                            var nodeIDs = nodes.map(function(node) { return node.id; });
                            // The following 'return' statement is not needed right now, but I leave it 
                            // there because if we would like to add a 'then()' statement to the main ,
                            // operation above ( db._syncNodes.where("url").equals(url).toArray(...) ) , 
                            // this return statement will asure that the whole chain is waited for 
                            // before entering the then() callback.
                            return db._syncNodes.where('id').anyOf(nodeIDs).delete().then(function() {
                                // When theese nodes are gone, let's clear the _changes table
                                // from all revisions older than the oldest node.
                                // First check which is the currenly oldest node, now when we have deleted
                                // the given node:
                                return db._syncNodes.orderBy("myRevision").first();
                            }).then(function(oldestNode) {
                                // Delete all changes older than revision of oldest node:
                                return db._changes.where("rev").below(oldestNode.myRevision).delete();
                            }).then(function() {
                                // Also don't forget to delete all uncommittedChanges for the deleted node:
                                return db._uncommittedChanges.where('node').anyOf(nodeIDs).delete();
                            });
                        }
                    });
                });
            };

            db.syncable.unsyncedChanges = function(url) {
                return db._syncNodes.where("url").equals(url).first(function(node) {
                    return db._changes.where('rev').above(node.myRevision).toArray();
                });
            };

            function connect(protocolInstance, protocolName, url, options, dbAliveID) {
                /// <param name="protocolInstance" type="ISyncProtocol"></param>
                var existingPeer = activePeers.filter(function(peer) { return peer.url === url; });
                if (existingPeer.length > 0) {
                    // Never create multiple syncNodes with same protocolName and url. Instead, let the next call to connect() return the same promise that
                    // have already been started and eventually also resolved. If promise has already resolved (node connected), calling existing promise.then() will give a callback directly.
                    return existingPeer[0].connectPromise;
                }

                var connectPromise = getOrCreateSyncNode().then(function(node) {
                    return connectProtocol(node);
                });

                var rejectConnectPromise = null;
                var disconnected = false;
                var hasMoreToGive = true;
                var activePeer = {
                    url: url,
                    status: Statuses.OFFLINE,
                    connectPromise: connectPromise,
                    on: Dexie.events(null, "disconnect"),
                    disconnect: function(newStatus, error) {
                        if (!disconnected) {
                            activePeer.on.disconnect.fire(newStatus, error);
                            var pos = activePeers.indexOf(activePeer);
                            if (pos >= 0) activePeers.splice(pos, 1);
                            if (error && rejectConnectPromise) rejectConnectPromise(error);
                        }
                        disconnected = true;
                    }
                };
                activePeers.push(activePeer);

                return connectPromise;

                function stillAlive() {
                    // A better method than doing db.isOpen() because the same db instance may have been reopened, but then this sync call should be dead
                    // because the new instance should be considered a fresh instance and will have another local node.
                    return db._localSyncNode && db._localSyncNode.id === dbAliveID;
                }

                function getOrCreateSyncNode() {
                    return db.transaction('rw', db._syncNodes, function() {
                        if (!url) throw new Error("Url cannot be empty");
                        // Returning a promise from transaction scope will make the transaction promise resolve with the value of that promise.
                        return db._syncNodes.where("url").equalsIgnoreCase(url).first(function(node) {
                            if (node) {
                                // Node already there. Make syncContext become an instance of PersistedContext:
                                node.syncContext = Dexie.extend(new PersistedContext(node.id), node.syncContext);
                                node.syncProtocol = protocolName; // In case it was changed (would be very strange but...) could happen...
                                db._syncNodes.put(node);
                            } else {
                                // Create new node and sync everything
                                node = new db.observable.SyncNode();
                                node.myRevision = -1;
                                node.appliedRemoteRevision = null;
                                node.remoteBaseRevisions = [];
                                node.type = "remote";
                                node.syncProtocol = protocolName;
                                node.url = url;
                                node.syncOptions = options;
                                node.lastHeartBeat = Date.now();
                                node.dbUploadState = null;
                                db._syncNodes.put(node).then(function(nodeId) {
                                    node.syncContext = new PersistedContext(nodeId); // Update syncContext in db with correct nodeId.
                                    db._syncNodes.put(node);
                                });
                            }

                            //
                            // PersistedContext : IPersistedContext
                            //
                            function PersistedContext(nodeID) {
                                this.nodeID = nodeID;
                            }

                            PersistedContext.prototype.save = function() {
                                // Store this instance in the syncContext property of the node it belongs to.
                                return Dexie.vip(function() {
                                    return node.save();
                                });

                                //return db._syncNodes.update(this.nodeID, { syncContext: this });
                            };

                            return node; // returning node will make the db.transaction()-promise resolve with this value.
                        });
                    });
                }

                function connectProtocol(node) {
                    /// <param name="node" type="db.observable.SyncNode"></param>

                    function changeStatusTo(newStatus) {
                        if (node.status !== newStatus) {
                            node.status = newStatus;
                            node.save();
                            db.syncable.on.statusChanged.fire(newStatus, url);
                            // Also broadcast message to other nodes about the status
                            db.broadcastMessage("syncStatusChanged", { newStatus: newStatus, url: url }, false);
                        }
                    }

                    activePeer.on('disconnect', function(newStatus) {
                        if (!isNaN(newStatus)) changeStatusTo(newStatus);
                    });

                    var connectedContinuation;
                    changeStatusTo(Statuses.CONNECTING);
                    return doSync();

                    function doSync() {
                        // Use enque() to ensure only a single promise execution at a time.
                        return enque(doSync, function() {
                            // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                            return getLocalChangesForNode_autoAckIfEmpty(node, function sendChangesToProvider(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                                // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
                                // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
                                var finalSyncPromise = new Promise(function(resolve, reject) {
                                    rejectConnectPromise = function(err) {
                                        reject(err);
                                    };
                                    Dexie.asap(function() {
                                        try {
                                            protocolInstance.sync(
                                                node.syncContext,
                                                url,
                                                options,
                                                remoteBaseRevision,
                                                node.appliedRemoteRevision,
                                                changes,
                                                partial,
                                                applyRemoteChanges,
                                                onChangesAccepted,
                                                function(continuation) {
                                                    resolve(continuation);
                                                },
                                                onError);
                                        } catch (ex) {
                                            onError(ex, Infinity);
                                        }

                                        function onError(error, again) {
                                            reject(error);
                                            if (stillAlive()) {
                                                if (!isNaN(again) && again < Infinity) {
                                                    setTimeout(function() {
                                                        if (stillAlive()) {
                                                            changeStatusTo(Statuses.SYNCING);
                                                            doSync();
                                                        }
                                                    }, again);
                                                    changeStatusTo(Statuses.ERROR_WILL_RETRY, error);
                                                    if (connectedContinuation && connectedContinuation.disconnect) connectedContinuation.disconnect();
                                                    connectedContinuation = null;
                                                } else {
                                                    abortTheProvider(error); // Will fire ERROR on statusChanged event.
                                                }
                                            }
                                        }
                                    });
                                });

                                return finalSyncPromise.then(function() {
                                    // Resolve caller of db.syncable.connect() with undefined. Not with continuation!
                                });

                                function onChangesAccepted() {
                                    Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                                        Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                    });
                                    node.save();
                                    // We dont know if onSuccess() was called by provider yet. If it's already called, finalPromise.then() will execute immediately,
                                    // otherwise it will execute when finalSyncPromise resolves.
                                    finalSyncPromise.then(continueSendingChanges);
                                }
                            });
                        }, dbAliveID);
                    }

                    function abortTheProvider(error) {
                        activePeer.disconnect(Statuses.ERROR, error);
                    }

                    function getBaseRevisionAndMaxClientRevision(node) {
                        /// <param name="node" type="db.observable.SyncNode"></param>
                        if (node.remoteBaseRevisions.length === 0)
                            return {
                                // No remoteBaseRevisions have arrived yet. No limit on clientRevision and provide null as remoteBaseRevision:
                                maxClientRevision: Infinity,
                                remoteBaseRevision: null
                            };
                        for (var i = node.remoteBaseRevisions.length - 1; i >= 0; --i) {
                            if (node.myRevision >= node.remoteBaseRevisions[i].local) {
                                // Found a remoteBaseRevision that fits node.myRevision. Return remoteBaseRevision and eventually a roof maxClientRevision pointing out where next remoteBaseRevision bases its changes on.
                                return {
                                    maxClientRevision: i === node.remoteBaseRevisions.length - 1 ? Infinity : node.remoteBaseRevisions[i + 1].local,
                                    remoteBaseRevision: node.remoteBaseRevisions[i].remote
                                };
                            }
                        }
                        // There are at least one item in the list but the server hasnt yet become up-to-date with the 0 revision from client. 
                        return {
                            maxClientRevision: node.remoteBaseRevisions[0].local,
                            remoteBaseRevision: null
                        };
                    }

                    function getLocalChangesForNode_autoAckIfEmpty(node, cb) {
                        return getLocalChangesForNode(node, function autoAck(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                            if (changes.length === 0 && 'myRevision' in nodeModificationsOnAck && nodeModificationsOnAck.myRevision !== node.myRevision) {
                                Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                                    Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                });
                                node.save();
                                return getLocalChangesForNode(node, autoAck);
                            } else {
                                return cb(changes, remoteBaseRevision, partial, nodeModificationsOnAck);
                            }
                        });
                    }

                    function getLocalChangesForNode(node, cb) {
                        /// <summary>
                        ///     Based on given node's current revision and state, this function makes sure to retrieve next chunk of changes
                        ///     for that node.
                        /// </summary>
                        /// <param name="node"></param>
                        /// <param name="cb" value="function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>

                        if (node.myRevision >= 0) {
                            // Node is based on a revision in our local database and will just need to get the changes that has occurred since that revision.
                            var brmcr = getBaseRevisionAndMaxClientRevision(node);
                            return getChangesSinceRevision(node.myRevision, MAX_CHANGES_PER_CHUNK, brmcr.maxClientRevision, function(changes, partial, nodeModificationsOnAck) {
                                return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
                            });
                        } else {
                            // Node hasn't got anything from our local database yet. We will need to upload entire DB to the node in the form of CREATE changes.
                            // Check if we're in the middle of already doing that:
                            if (node.dbUploadState === null) {
                                // Initiatalize dbUploadState
                                var tablesToUpload = db.tables.filter(function(table) { return table.schema.observable; }).map(function(table) { return table.name; });
                                if (tablesToUpload.length === 0) return Promise.resolve(cb([], null, false, {})); // There are no synched tables at all.
                                var dbUploadState = {
                                    tablesToUpload: tablesToUpload,
                                    currentTable: tablesToUpload.shift(),
                                    currentKey: null
                                };
                                return db._changes.orderBy('rev').last(function(lastChange) {
                                    dbUploadState.localBaseRevision = (lastChange && lastChange.rev) || 0;
                                    var collection = db.table(dbUploadState.currentTable).orderBy(':id');
                                    return getTableObjectsAsChanges(dbUploadState, [], collection);
                                });
                            } else if (node.dbUploadState.currentKey) {
                                var collection = db.table(node.dbUploadState.currentTable).where(':id').above(node.dbUploadState.currentKey);
                                return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
                            } else {
                                var collection = db.table(dbUploadState.currentTable).orderBy(':id');
                                return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
                            }
                        }

                        function getTableObjectsAsChanges(state, changes, collection) {
                            /// <param name="state" value="{tablesToUpload:[''],currentTable:'_changes',currentKey:null,localBaseRevision:0}"></param>
                            /// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
                            /// <param name="collection" type="db.Collection"></param>
                            var limitReached = false;
                            return collection.until(function() {
                                if (changes.length === MAX_CHANGES_PER_CHUNK) {
                                    limitReached = true;
                                    return true;
                                }
                            }).each(function(item, cursor) {
                                changes.push({
                                    type: CREATE,
                                    table: state.currentTable,
                                    key: cursor.key,
                                    obj: cursor.value
                                });
                                state.currentKey = cursor.key;
                            }).then(function() {
                                if (limitReached) {
                                    // Limit reached. Send partial result.
                                    hasMoreToGive = true;
                                    return cb(changes, null, true, { dbUploadState: state });
                                } else {
                                    // Done iterating this table. Check if there are more tables to go through:
                                    if (state.tablesToUpload.length === 0) {
                                        // Done iterating all tables
                                        // Now append changes occurred during our dbUpload:
                                        var brmcr = getBaseRevisionAndMaxClientRevision(node);
                                        return getChangesSinceRevision(state.localBaseRevision, MAX_CHANGES_PER_CHUNK - changes.length, brmcr.maxClientRevision, function(additionalChanges, partial, nodeModificationsOnAck) {
                                            changes = changes.concat(additionalChanges);
                                            nodeModificationsOnAck.dbUploadState = null;
                                            return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
                                        });
                                    } else {
                                        // Not done iterating all tables. Continue on next table:
                                        state.currentTable = state.tablesToUpload.shift();
                                        return getTableObjectsAsChanges(state, changes, db.table(state.currentTable).orderBy(':id'));
                                    }
                                }
                            });
                        }

                        function getChangesSinceRevision(revision, maxChanges, maxRevision, cb) {
                            /// <param name="cb" value="function(changes, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>
                            var changeSet = {};
                            var numChanges = 0;
                            var partial = false;
                            var ignoreSource = node.id;
                            var nextRevision = revision;
                            return db.transaction('r', db._changes, function() {
                                var query = (maxRevision === Infinity ?
                                    db._changes.where('rev').above(revision) :
                                    db._changes.where('rev').between(revision, maxRevision, false, true));
                                query.until(function() {
                                    if (numChanges === maxChanges) {
                                        partial = true;
                                        return true;
                                    }
                                }).each(function(change) {
                                    // Note the revision in nextRevision:
                                    nextRevision = change.rev;
                                    if (change.source === ignoreSource) return;
                                    // Our _changes table contains more info than required (old objs, source etc). Just make sure to include the nescessary info:
                                    var changeToSend = {
                                        type: change.type,
                                        table: change.table,
                                        key: change.key
                                    };
                                    if (change.type === CREATE)
                                        changeToSend.obj = change.obj;
                                    else if (change.type === UPDATE)
                                        changeToSend.mods = change.mods;

                                    var id = change.table + ":" + change.key;
                                    var prevChange = changeSet[id];
                                    if (!prevChange) {
                                        // This is the first change on this key. Add it unless it comes from the source that we are working against
                                        changeSet[id] = changeToSend;
                                        ++numChanges;
                                    } else {
                                        // Merge the oldchange with the new change
                                        var nextChange = changeToSend;
                                        var mergedChange = (function() {
                                            switch (prevChange.type) {
                                            case CREATE:
                                                switch (nextChange.type) {
                                                case CREATE:
                                                    return nextChange; // Another CREATE replaces previous CREATE.
                                                case UPDATE:
                                                    return combineCreateAndUpdate(prevChange, nextChange); // Apply nextChange.mods into prevChange.obj
                                                case DELETE:
                                                    return nextChange; // Object created and then deleted. If it wasnt for that we MUST handle resent changes, we would skip entire change here. But what if the CREATE was sent earlier, and then CREATE/DELETE at later stage? It would become a ghost object in DB. Therefore, we MUST keep the delete change! If object doesnt exist, it wont harm!
                                                }
                                                break;
                                            case UPDATE:
                                                switch (nextChange.type) {
                                                case CREATE:
                                                    return nextChange; // Another CREATE replaces previous update.
                                                case UPDATE:
                                                    return combineUpdateAndUpdate(prevChange, nextChange); // Add the additional modifications to existing modification set.
                                                case DELETE:
                                                    return nextChange; // Only send the delete change. What was updated earlier is no longer of interest.
                                                }
                                                break;
                                            case DELETE:
                                                switch (nextChange.type) {
                                                case CREATE:
                                                    return nextChange; // A resurection occurred. Only create change is of interest.
                                                case UPDATE:
                                                    return prevChange; // Nothing to do. We cannot update an object that doesnt exist. Leave the delete change there.
                                                case DELETE:
                                                    return prevChange; // Still a delete change. Leave as is.
                                                }
                                                break;
                                            }
                                        })();
                                        changeSet[id] = mergedChange;
                                    }
                                });
                            }).then(function() {
                                var changes = Object.keys(changeSet).map(function(key) { return changeSet[key]; });
                                hasMoreToGive = partial;
                                return cb(changes, partial, { myRevision: nextRevision });
                            });
                        }
                    }


                    function applyRemoteChanges(remoteChanges, remoteRevision, partial, clear) {
                        return enque(applyRemoteChanges, function() {
                            if (!stillAlive()) return Promise.reject("Database not open");
                            // FIXTHIS: Check what to do if clear() is true!
                            return (partial ? saveToUncommitedChanges(remoteChanges) : finallyCommitAllChanges(remoteChanges, remoteRevision))
                                .catch(function(error) {
                                    abortTheProvider(error);
                                    return Promise.reject(error);
                                });
                        }, dbAliveID);


                        function saveToUncommitedChanges(changes) {
                            return db.transaction('rw', db._uncommittedChanges, function() {
                                changes.forEach(function(change) {
                                    var changeToAdd = {
                                        node: node.id,
                                        type: change.type,
                                        table: change.table,
                                        key: change.key
                                    };
                                    if (change.obj) changeToAdd.obj = change.obj;
                                    if (change.mods) changeToAdd.mods = change.mods;
                                    db._uncommittedChanges.add(changeToAdd);
                                });
                            }).then(function() {
                                node.appliedRemoteRevision = remoteRevision;
                                node.save();
                            });
                        }

                        function finallyCommitAllChanges(changes, remoteRevision) {
                            //alert("finallyCommitAllChanges() will now start its job.");
                            //var tick = Date.now();

                            // 1. Open a write transaction on all tables in DB
                            return db.transaction('rw', db.tables.filter(function(table) { return table.name === '_changes' || table.name === '_uncommittedChanges' || table.schema.observable; }), function() {
                                var trans = Dexie.currentTransaction;
                                var localRevisionBeforeChanges = 0;
                                db._changes.orderBy('rev').last(function(lastChange) {
                                    // Store what revision we were at before committing the changes
                                    localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
                                }).then(function() {
                                    // Specify the source. Important for the change consumer to ignore changes originated from self!
                                    trans.source = node.id;
                                    // 2. Apply uncommitted changes and delete each uncommitted change
                                    return db._uncommittedChanges.where('node').equals(node.id).toArray();
                                }).then(function(uncommittedChanges) {
                                    return applyChanges(uncommittedChanges, 0);
                                }).then(function() {
                                    return db._uncommittedChanges.where('node').equals(node.id).delete();
                                }).then(function() {
                                    // 3. Apply last chunk of changes
                                    return applyChanges(changes, 0);
                                }).then(function() {
                                    // Get what revision we are at now:
                                    return db._changes.orderBy('rev').last();
                                }).then(function(lastChange) {
                                    var currentLocalRevision = (lastChange && lastChange.rev) || 0;
                                    // 4. Update node states (appliedRemoteRevision, remoteBaseRevisions and eventually myRevision)
                                    node.appliedRemoteRevision = remoteRevision;
                                    node.remoteBaseRevisions.push({ remote: remoteRevision, local: currentLocalRevision });
                                    if (node.myRevision === localRevisionBeforeChanges) {
                                        // If server was up-to-date before we added new changes from the server, update myRevision to last change
                                        // because server is still up-to-date! This is also important in order to prohibit getLocalChangesForNode() from
                                        // ever sending an empty change list to server, which would otherwise be done every second time it would send changes.
                                        node.myRevision = currentLocalRevision;
                                    }
                                    // Garbage collect remoteBaseRevisions not in use anymore:
                                    if (node.remoteBaseRevisions.length > 1) {
                                        for (var i = node.remoteBaseRevisions.length - 1; i > 0; --i) {
                                            if (node.myRevision >= node.remoteBaseRevisions[i].local) {
                                                node.remoteBaseRevisions.splice(0, i);
                                                break;
                                            }
                                        }
                                    }
                                    node.save(); // We are not including _syncNodes in transaction, so this save() call will execute in its own transaction.
                                    //var tock = Date.now();
                                    //alert("finallyCommitAllChanges() has done its job. " + changes.length + " changes applied in " + ((tock - tick) / 1000) + "seconds");
                                });

                                function applyChanges(changes, offset) {
                                    /// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
                                    /// <param name="offset" type="Number"></param>
                                    var lastChangeType = 0;
                                    var lastCreatePromise = null;
                                    if (offset >= changes.length) return Promise.resolve(null);
                                    var change = changes[offset];
                                    var table = trans.tables[change.table];
                                    while (change && change.type === CREATE) {
                                        // Optimize CREATE changes because on initial sync with server, the entire DB will be downloaded in forms of CREATE changes.
                                        // Instead of waiting for each change to resolve, do all CREATE changes in bulks until another type of change is stepped upon.
                                        // This case is the only case that allows i to increment and the for-loop to continue since it does not return anything.
                                        var specifyKey = !table.schema.primKey.keyPath;
                                        lastCreatePromise = (function(change, table, specifyKey) {
                                            return (specifyKey ? table.add(change.obj, change.key) : table.add(change.obj)).catch("ConstraintError", function(e) {
                                                return (specifyKey ? table.put(change.obj, change.key) : table.put(change.obj));
                                            });
                                        })(change, table, specifyKey);
                                        change = changes[++offset];
                                        if (change) table = trans.tables[change.table];
                                    }

                                    if (lastCreatePromise) {
                                        // We did some CREATE changes but now stumbled upon another type of change.
                                        // Let's wait for the last CREATE change to resolve and then call applyChanges again at current position. Next time, lastCreatePromise will be null and a case below will happen.
                                        return lastCreatePromise.then(function() {
                                            return (offset < changes.length ? applyChanges(changes, offset) : null);
                                        });
                                    }

                                    if (change) {
                                        if (change.type === UPDATE) {
                                            return table.update(change.key, change.mods).then(function() {
                                                // Wait for update to resolve before taking next change. Why? Because it will lock transaction anyway since we are listening to CRUD events here.
                                                return applyChanges(changes, offset + 1);
                                            });
                                        }

                                        if (change.type === DELETE) {
                                            return table.delete(change.key).then(function() {
                                                // Wait for delete to resolve before taking next change. Why? Because it will lock transaction anyway since we are listening to CRUD events here.
                                                return applyChanges(changes, offset + 1);
                                            });
                                        }
                                    }

                                    return Promise.resolve(null); // Will return null or a Promise and make the entire applyChanges promise finally resolve.
                                }
                            });
                        }
                    }

                    //
                    //
                    //  Continuation Patterns Follows
                    //
                    //

                    function continueSendingChanges(continuation) {
                        if (!stillAlive()) { // Database was closed.
                            if (continuation.disconnect)
                                continuation.disconnect();
                            return;
                        }

                        connectedContinuation = continuation;
                        activePeer.on('disconnect', function() {
                            if (connectedContinuation) {
                                if (connectedContinuation.react) {
                                    try {
                                        // react pattern must provide a disconnect function.
                                        connectedContinuation.disconnect();
                                    } catch (e) {
                                    }
                                }
                                connectedContinuation = null; // Stop poll() pattern from polling again and abortTheProvider() from being called twice.
                            }
                        });

                        if (continuation.react) {
                            continueUsingReactPattern(continuation);
                        } else {
                            continueUsingPollPattern(continuation);
                        }
                    }

                    //  React Pattern (eager)
                    function continueUsingReactPattern(continuation) {
                        var changesWaiting, // Boolean
                            isWaitingForServer; // Boolean


                        function onChanges() {
                            if (connectedContinuation) {
                                changeStatusTo(Statuses.SYNCING);
                                if (isWaitingForServer)
                                    changesWaiting = true;
                                else {
                                    reactToChanges();
                                }
                            }
                        }

                        db.on('changes', onChanges);

                        // Override disconnect() to also unsubscribe to onChanges.
                        activePeer.on('disconnect', function() {
                            db.on.changes.unsubscribe(onChanges);
                        });

                        function reactToChanges() {
                            if (!connectedContinuation) return;
                            changesWaiting = false;
                            isWaitingForServer = true;
                            getLocalChangesForNode_autoAckIfEmpty(node, function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                                if (!connectedContinuation) return;
                                if (changes.length > 0) {
                                    continuation.react(changes, remoteBaseRevision, partial, function onChangesAccepted() {
                                        Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                                            Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                        });
                                        node.save();
                                        // More changes may be waiting:
                                        reactToChanges();
                                    });
                                } else {
                                    isWaitingForServer = false;
                                    if (changesWaiting) {
                                        // A change jumped in between the time-spot of quering _changes and getting called back with zero changes.
                                        // This is an expreemely rare scenario, and eventually impossible. But need to be here because it could happen in theory.
                                        reactToChanges();
                                    } else {
                                        changeStatusTo(Statuses.ONLINE);
                                    }
                                }
                            }).catch(abortTheProvider);
                        }

                        reactToChanges();
                    }

                    //  Poll Pattern
                    function continueUsingPollPattern() {

                        function syncAgain() {
                            getLocalChangesForNode_autoAckIfEmpty(node, function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {

                                protocolInstance.sync(node.syncContext, url, options, remoteBaseRevision, node.appliedRemoteRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError);

                                function onChangesAccepted() {
                                    Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                                        Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                    });
                                    node.save();
                                }

                                function onSuccess(continuation) {
                                    if (!connectedContinuation) {
                                        // Got disconnected before succeeding. Quit.
                                        return;
                                    }
                                    connectedContinuation = continuation;
                                    if (partial) {
                                        // We only sent partial changes. Need to do another round asap.
                                        syncAgain();
                                    } else {
                                        // We've sent all changes now (in sync!)
                                        if (!isNaN(continuation.again) && continuation.again < Infinity) {
                                            // Provider wants to keep polling. Set Status to ONLINE.
                                            changeStatusTo(Statuses.ONLINE);
                                            setTimeout(function() {
                                                if (connectedContinuation) {
                                                    changeStatusTo(Statuses.SYNCING);
                                                    syncAgain();
                                                }
                                            }, continuation.again);
                                        } else {
                                            // Provider seems finished polling. Since we are never going to poll again,
                                            // disconnect provider and set status to OFFLINE until another call to db.syncable.connect().
                                            activePeer.disconnect(Statuses.OFFLINE);
                                        }
                                    }
                                }

                                function onError(error, again) {
                                    if (!isNaN(again) && again < Infinity) {
                                        if (connectedContinuation) {
                                            setTimeout(function() {
                                                if (connectedContinuation) {
                                                    changeStatusTo(Statuses.SYNCING);
                                                    syncAgain();
                                                }
                                            }, again);
                                            changeStatusTo(Statuses.ERROR_WILL_RETRY);
                                        } // else status is already changed since we got disconnected.
                                    } else {
                                        abortTheProvider(error); // Will fire ERROR on onStatusChanged.
                                    }
                                }
                            }).catch(abortTheProvider);
                        }

                        if (hasMoreToGive) {
                            syncAgain();
                        } else if (connectedContinuation && !isNaN(connectedContinuation.again) && connectedContinuation.again < Infinity) {
                            changeStatusTo(Statuses.ONLINE);
                            setTimeout(function() {
                                if (connectedContinuation) {
                                    changeStatusTo(Statuses.SYNCING);
                                    syncAgain();
                                }
                            }, connectedContinuation.again);
                        }
                    }
                }
            }

            db.close = override(db.close, function(origClose) {
                return function() {
                    activePeers.forEach(function(peer) {
                        peer.disconnect();
                    });
                    return origClose.apply(this, arguments);
                };
            });

            var syncNodeSaveQueContexts = {};
            db.observable.SyncNode.prototype.save = function() {
                var self = this;
                return db.transaction('rw?', db._syncNodes, function() {
                    db._syncNodes.put(self);
                });
            };

            function enque(context, fn, instanceID) {
                function _enque() {
                    if (!context.ongoingOperation) {
                        context.ongoingOperation = Dexie.ignoreTransaction(function() {
                            return Dexie.vip(function() {
                                return fn();
                            });
                        }).then(function(res) {
                            delete context.ongoingOperation;
                            return res;
                        });
                    } else {
                        context.ongoingOperation = context.ongoingOperation.then(function() {
                            return enque(context, fn, instanceID);
                        });
                    }
                    return context.ongoingOperation;
                }

                if (!instanceID) {
                    // Caller wants to enque it until database becomes open.
                    if (db.isOpen()) {
                        return _enque();
                    } else {
                        return Promise.reject(new Error("Database was closed"));
                    }
                } else if (db._localSyncNode && instanceID === db._localSyncNode.id) {
                    // DB is already open but queuer doesnt want it to be queued if database has been closed (request bound to current instance of DB)
                    return _enque();
                } else {
                    return Promise.reject(new Error("Database was closed"));
                }
            }

            function combineCreateAndUpdate(prevChange, nextChange) {
                var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
                Object.keys(nextChange.mods).forEach(function (keyPath) {
                    setByKeyPath(clonedChange.obj, keyPath, nextChange.mods[keyPath]);
                });
                return clonedChange;
            }

            function combineUpdateAndUpdate(prevChange, nextChange) {
                var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
                Object.keys(nextChange.mods).forEach(function (keyPath) {
                    // If prev-change was changing a parent path of this keyPath, we must update the parent path rather than adding this keyPath
                    var hadParentPath = false;
                    Object.keys(prevChange.mods).filter(function (parentPath) { return keyPath.indexOf(parentPath + '.') === 0; }).forEach(function (parentPath) {
                        setByKeyPath(clonedChange[parentPath], keyPath.substr(parentPath.length + 1), nextChange.mods[keyPath]);
                        hadParentPath = true;
                    });
                    if (!hadParentPath) {
                        // Add or replace this keyPath and its new value
                        clonedChange.mods[keyPath] = nextChange.mods[keyPath];
                    }
                    // In case prevChange contained sub-paths to the new keyPath, we must make sure that those sub-paths are removed since
                    // we must mimic what would happen if applying the two changes after each other:
                    Object.keys(prevChange.mods).filter(function (subPath) { return subPath.indexOf(keyPath + '.') === 0; }).forEach(function (subPath) {
                        delete clonedChange[subPath];
                    });
                });
                return clonedChange;
            }
        };

        Syncable.Statuses = {
            ERROR: -1, // An irrepairable error occurred and the sync provider is dead.
            OFFLINE: 0, // The sync provider hasnt yet become online, or it has been disconnected.
            CONNECTING: 1, // Trying to connect to server
            ONLINE: 2, // Connected to server and currently in sync with server
            SYNCING: 3, // Syncing with server. For poll pattern, this is every poll call. For react pattern, this is when local changes are being sent to server.
            ERROR_WILL_RETRY: 4 // An error occured such as net down but the sync provider will retry to connect.
        };

        Syncable.StatusTexts = {
            "-1": "ERROR",
            "0": "OFFLINE",
            "1": "CONNECTING",
            "2": "ONLINE",
            "3": "SYNCING",
            "4": "ERROR_WILL_RETRY"
        };

        Syncable.registeredProtocols = {}; // Map<String,ISyncProviderFactory> when key is the provider name.

        Syncable.registerSyncProtocol = function(name, protocolInstance) {
            /// <summary>
            ///    Register a syncronization protocol that can syncronize databases with remote servers.
            /// </summary>
            /// <param name="name" type="String">Provider name</param>
            /// <param name="protocolInstance" type="ISyncProtocol">Implementation of ISyncProtocol</param>
            Syncable.registeredProtocols[name] = protocolInstance;
        };

        return Syncable;
    });

}).apply(null,
    // AMD:
    typeof define === 'function' && define.amd ? [self || window, define] :
    // CommonJS:
    typeof global !== 'undefined' && typeof module !== 'undefined' && typeof require != 'undefined' ?
        [global, function (name, modules, fn) {
            module.exports = fn.apply(null, modules.map(function (id) { return require(id); }));
        }] :
    // Vanilla HTML and WebWorkers:
    [self || window, function (name, modules, fn) {
        var addon = fn.apply(null, modules.map(function (m) { return m.split('.').reduce(function (p, c) { return p && p[c]; }, self || window); })),
            path = name.split('.'),
            nsHost = path.slice(0, path.length - 1).reduce(function (p, c) { return p && p[c]; }, self || window);
        Dexie.addons.push(addon);
        nsHost[path[path.length - 1]] = addon;
    }]
);