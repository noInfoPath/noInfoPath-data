//manifest.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.data")
		.config([function(){
		}])

		.provider("noManifest",[function(){
			var _manifestMap = {
				localStorage:{},
				sessionStorage: {},
				indexedDB: {}
			}, _deltas = {
				localStorage: {},
				sessionStorage: {},
				indexedDB: {}
			}, _dbConfig, _tableNames = [];

			function noManifest(_, noHTTP, noUrl, noLocalStorage, $rootScope, $q, $timeout, noConfig){
				var SELF = this;

				Object.defineProperties(this, {
					"current": {
						"get": function() {return _manifestMap;}
					},
					"deltas": {
						"get": function() {return _deltas;}
					},
					"dbConfig": {
						"get": function() {return _dbConfig; }
					},
					"lookupTables": {
						"get": function() {return _tableNames; }
					},
					"isCached": {
						"get": function(){
							var tmp = noLocalStorage.getItem("noManifest");
							return tmp && tmp.length > 0;
						}
					}
				});

				function _createManifestMap(cacheManifest){
					function _isTable(obj, name){
						return obj.TableName === name;
					}
					var keys =  _.pluck(cacheManifest, "TableName");

					for(var i in keys)
					{	
						var tn = keys[i],
							item =  _.find(cacheManifest, {"TableName": tn});
						
						if(tn.indexOf("LU") === 0) {
							_tableNames.push({ text: item.EntityName, value: tn });
						}
						

						_manifestMap[item.StorageLocation][tn] = item;
					}
				};

				function _deltaManifest(newManifest){

					var oldCacheManifest = noLocalStorage.getItem("NoCacheManifest") || {
						localStorage:{},
						sessionStorage: {},
						indexedDB: {}					
					};
						//oldKeys = _.pluck(oldCacheManifest[storageType], "TableName"),
						//newKeys = _.pluck(_manifestMap[storageType], "TableName"),
						//diffOld = _.difference(oldKeys, newKeys),
						//diffNew = _.difference(newKeys, oldKeys)
						//;

					_.each(["localStorage", "indexedDB"], function(storageType){
						var keys = _.pluck(_manifestMap[storageType], "TableName")
						_.each(keys, function(key){
							var local = oldCacheManifest[storageType][key],
								localTime = local ? Date.parse(local.LastTransaction) : null,
								serv = _manifestMap[storageType][key],
								servTime =  Date.parse(serv.LastTransaction);

							if(!local){
								_deltas[storageType][key] = _manifestMap[storageType][key];
							}else{
								if(!_.isEqual(local, serv))
								{
									if(servTime > localTime)
									{
										_deltas[storageType][key] = _deltas[storageType][key] = _manifestMap[key];;
									}
								}
							}

						});					
					});
				}

				function _makeDBConfig(){
					var config = {};

					_.each(_manifestMap.indexedDB, function(table){
						var cfg = angular.fromJson(table.IndexedDB);
						config[table.TableName] = cfg.keys;
					});
					//console.debug(config);
					
					_dbConfig = config;
				};

				this.fromCache = function(){
					var tmp = noLocalStorage.getItem("noManifest");
					_createManifestMap(tmp);
					_makeDBConfig();
				}

				this.load = function (){
					return noHTTP.read(noUrl.makeResourceUrl(noConfig.current.RESTURI, "NoCacheManifest","$filter=StorageLocation ne ''&$orderby=TableName"))
						.then(function(data){
							noLocalStorage.setItem("noManifest", data);
							_createManifestMap(data);
							//this._deltaManifest();
							_makeDBConfig();
							$rootScope.noManifestReady = true;
						})
						.catch(function(){
							//Assume offline or no connection to REST Service
							var data = noLocalStorage.getItem("noManifest")
							if(data){
								_createManifestMap(data);
								//this._deltaManifest();
								_makeDBConfig();
								$rootScope.noManifestReady = true;
							}else{
								throw "No Configuration, please again when online."
							}
						});
				};

				this.whenReady = function(){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noManifestReady)
						{
							console.log("Manifest Ready");
							deferred.resolve();
						}else{	
							$rootScope.$watch("noManifestReady", function(newval){
								if(newval){
									console.log("Manifest Ready");
									deferred.resolve();									
								}
							});	

							SELF.load()
								.catch(function(err){
									deferred.reject(err);
								});				
						}					
					});	

					return deferred.promise;			
				};				
			}
	
			this.$get = ['lodash', 'noHTTP', 'noUrl', 'noLocalStorage', '$rootScope', '$q', '$timeout', 'noConfig', function(_, noHTTP, noUrl, noLocalStorage, $rootScope, $q, $timeout, noConfig){
				return new noManifest(_, noHTTP, noUrl, noLocalStorage, $rootScope, $q, $timeout, noConfig);
			}]
		}])
	;
})(angular);
