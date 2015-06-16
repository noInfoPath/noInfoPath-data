//create.js
(function(angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.service("noDbSchema", ["$q", "$timeout", "$http", "$rootScope", "lodash", function($q, $timeout, $http, $rootScope, _){
			var _config = {}, _tables = {}, SELF = this;

			Object.defineProperties(this, {
				"store": {
					"get": function() { return _config; }
				}
			});

			function _processDbJson(resp){
				//save reference to the source data from the rest api.
				var _tables = resp.data;

				angular.forEach(_tables, function(table, tableName){
					var primKey = "$$" + table.primaryKey,
						foreignKeys = _.uniq(_.pluck(table.foreignKeys, "column")).join(",");
		
					//Prep as a Dexie Store config
					_config[tableName] = primKey + (!!foreignKeys ? "," + foreignKeys : "");
				})

				//console.log(angular.toJson(_config));
				return {};
			}

			this.load = function (){
				var req = {
					method: "GET",
					url: "/db.json",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					withCredentials: true
				};

				return $http(req)
					.then(_processDbJson)
					.catch(function(resp){
						console.error(resp);
					});
			};

			this.whenReady = function(){
				var deferred = $q.defer();

				$timeout(function(){
					if($rootScope.noDbSchemaInitialized)
					{
						console.log("noDbSchema Ready.");
						deferred.resolve();
					}else{	
						console.log("noDbSchema is not ready yet.")
						$rootScope.$watch("noDbSchemaInitialized", function(newval){
							if(newval){
								console.log("noDbSchema ready.");
								deferred.resolve();									
							}
						});	

						SELF.load()
							.then(function(resp){
								$rootScope.noDbSchemaInitialized = true;
								//for testing
								// $timeout(function(){
								// 	$rootScope.$digest();
								// });
								//deferred.resolve();
							})
							.catch(function(err){
								deferred.reject(err);
							});				
					}					
				});	

				return deferred.promise;			
			};	
		}])

		.factory("noDexie", ['$timeout', '$q', '$rootScope', function($timeout, $q, $rootScope){

			function noTable(){
				console.log("Hello");
			}

			function noDexie(db){
				db.WriteableTable.prototype.create = function(data){
					var deferred = $q.defer(),
						table = this;	
						
					//console.log("adding: ", _dexie.currentUser);
					
					_dexie.transaction("rw", table, function(){
						data.CreatedBy =  _dexie.currentUser.userId;
						data.DateCreated = new Date(Date.now());
						data.ModifiedDate = new Date(Date.now());
						data.ModifiedBy =  _dexie.currentUser.userId; 
						table.add(data)
							.then(function(data){ 
								table.get(data)
									.then(function(data){
										deferred.resolve(data); 
										$rootScope.$digest();
									})
									.catch(function(err){
										deferred.reject("noCRUD::get " + err);
										$rootScope.$digest();								
									});
								
							})
							.catch(function(err){
								deferred.reject("noCRUD::create " + err);
								$rootScope.$digest();
							});					
					})
					.then(angular.noop())
					.catch(function(err){
						deferred.reject("noCRUD::createTrans " + err);
						$rootScope.$digest();
					})
						
					return deferred.promise;
				}	

				/*
					The read operation take a complex set of parameters that allow
					for filtering, sorting and paging of data.

						Parameters:
							filters: INoFilters,
							sort: INoSort,
							skip: Number,
							take: Number

					interface INoFilters [INoFilterExpression]

					interface INoFilterExpression {
						column: String,
						operation: Enum("eq", "ne", "gt", "ge", "lt", "le", "contains", "startswith" )
						value: String | Number | Date | Boolean
						logic: Enum("and", "or", undefined)
					}

					interface INoSort [INoSortExpressions]

					interface INoSortExpression {
						column: String,
						dir: Enum("asc", "desc")
					}
					

				*/
				db.WriteableTable.prototype.read = function(filters, sort, skip, take){

				}				


				db.WriteableTable.prototype.update = function(key, data){
					var deferred = $q.defer(),
						table = this,
						key = data[table.noInfoPath.primaryKey];
						
					//console.log("adding: ", _dexie.currentUser);
					
					_dexie.transaction("rw", table, function(){
						data.ModifiedDate = new Date(Date.now());
						data.ModifiedBy =  _dexie.currentUser.userId; 
						table.update(key, data)
							.then(function(data){ 
								deferred.resolve(data); 
								$rootScope.$digest();
							})
							.catch(function(err){
								deferred.reject("noCRUD::update " + err);
								$rootScope.$digest();
							});
							
					})
					.then(angular.noop())
					.catch(function(err){
						deferred.reject("noCRUD::updateTrans " + err);
						$rootScope.$digest();
					});
						
					return deferred.promise;
				}

				db.WriteableTable.prototype.destroy = function(key){
					var deferred = $q.defer(),
						table = this,
						key = data[table.noInfoPath.primaryKey];
						
					//console.log("adding: ", _dexie.currentUser);
					
					_dexie.transaction("rw", table, function(){ 
						table.delete(key)
							.then(function(data){ 
								deferred.resolve(data); 
								$rootScope.$digest();
							})
							.catch(function(err){
								deferred.reject("noCRUD::destroy " + err);
								$rootScope.$digest();
							});
							
					})
					.then(angular.noop())
					.catch(function(err){
						deferred.reject("noCRUD::destroyTrans " + err);
						$rootScope.$digest();
					});
						
					return deferred.promise;
				}

				/*
					Maps the Dexie.Table.get method.
				*/
				db.WriteableTable.prototype.one = function(key){
					var deferred = $q.defer(),
						table = this,
						key = data[table.noInfoPath.primaryKey];
						
					//console.log("adding: ", _dexie.currentUser);
					
					_dexie.transaction("r", table, function(){
						table.get(key)
							.then(function(data){ 
								deferred.resolve(data); 
								$rootScope.$digest();
							})
							.catch(function(err){
								deferred.reject("noCRUD::one " + err);
								$rootScope.$digest();
							});
							
					})
					.then(angular.noop())
					.catch(function(err){
						deferred.reject("noCRUD::oneTrans " + err);
						$rootScope.$digest();
					});
						
					return deferred.promise;				}

				/*
					While Dexie supports a put operation which is similar to upsert,
					we're going with upsert which decides whether an insert or an
					update is required and calls the appropreiate function.
				*/
				db.WriteableTable.prototype.upsert = function(data){

				}
			}

			function _extendDexieTables(dbSchema){
				function _toDexieClass(tsqlTableSchema){
					var _table = {};

					angular.forEach(tsqlTableSchema.columns, function(column,tableName){
						switch(column.type){
							case "uniqueidentifier":
							case "nvarchar":
							case "varchar":
								_table[tableName] = "String";
								break;

							case "date":
							case "datetime":
								_table[tableName] = "Date";
								break;

							case "bit":
								_table[tableName] = "Boolean";
								break;

							case "int":
							case "decimal":
								_table[tableName] = "Number";
								break;
						}
					});

					return _table;
				}
				angular.forEach(dbSchema, function(table, tableName){
					var dexieTable = _dexie[tableName];
					dexieTable.mapToClass(noTable, _toDexieClass(table));
					dexieTable.noInfoPath = table;
				});
			}

			Dexie.prototype.configure = function(noUser, dbVersion, dexieStores, dbSchema){
				var deferred = $q.defer();

				$timeout(function(){
					_dexie.currentUser = noUser;
					_dexie.on('error', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    console.error("Dexie Error: " + err);
					   	deferred.reject(err);
					   	$rootScope.$digest();
					});

					_dexie.on('blocked', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    console.warn("IndedexDB is currently execting a blocking operation.");
					   	deferred.reject(err);
					   	$rootScope.$digest();
					});	

					_dexie.on('versionchange', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    console.error("IndexedDB as detected a version change");
					});

					_dexie.on('populate', function(err) {
					    // Log to console or show en error indicator somewhere in your GUI...
					    console.warn("IndedexDB populate...  not implemented.");
					});	

					_dexie.on('ready', function(err) {
						console.log("Dexie ready");
					    // Log to console or show en error indicator somewhere in your GUI...
						$rootScope.noIndexedDBReady = true;
					    deferred.resolve();

					    $rootScope.$digest();
					});	

					if(_dexie.isOpen()){
						$timeout(function(){ 
							console.log("Dexie already open.")
							deferred.resolve();
						});
					}else{
						_dexie.version(dbVersion.version).stores(dexieStores);
						_extendDexieTables.call(_dexie, dbSchema);
						_dexie.open();
					}	
				});
		

				return deferred.promise;
			}

			Dexie.addons.push(noDexie);
			
			var _dexie = new Dexie("NoInfoPath-v4");		

			return  _dexie;
		}])
	;

})(angular, Dexie);