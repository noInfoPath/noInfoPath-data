//http.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.1.1*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 * ## @service noHTTP
 *
 * ### Overview
 * Provides a RESTful compatible HTTP service.
 *
 * ### Methods
 *
 * #### create(uri, data)
 *
 * ##### Parameters
 *
 * |Name|Type|Description|
 * |----|----|-----------|
 * |uri|string|unique identifier of the table to operate against|
 * |data|object|the data to use to create the new obejct in the db|
 *
 * #### read(resourceURI, query)
 *
 * #### update(resourceURI, formdata)
 * TODO: Implementation required.
 *
 * #### destroy(resourceURI, formdata)
 * TODO: Implementation required.
 *
 *
 * ### @class NoDb
 *
 * #### Overview
 *
 * Creates and manages a set of NoTable objects.
 *
 * #### @constructor NoDb(tables, queryBuilder)
 *
 * ##### Parameters
 *
 * |Name|Type|Description|
 * |----|----|-----------|
 * |tables|object|A hash object that contains a collection of table configuration as provided by noDbScema|
 * |queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|
 *
 *
 *
 * ### @class NoTable
 *
 * #### Overview
 *
 * Provides an interface that loosely matches that of the NoTable
 * class provided by noDexie.  This to ease the integration with
 * NoInfoPath component that consume data such as noKendo.
 *
 * #### @constructor NoTable(tableName, queryBuilder)
 *
 * ##### Parameters
 *
 * |Name|Type|Description|
 * |----|----|-----------|
 * |tableName|string|name of the table that this instance will interact with.|
 * |queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|
 */
(function (angular, undefined) {
	"use strict";
	var $httpProviderRef;

	angular.module('noinfopath.data')
		.config(["$httpProvider", function ($httpProvider) {
			$httpProviderRef = $httpProvider;
		}])
		.provider("noHTTP", [function () {
			this.$get = ['$injector', '$rootScope', '$q', '$timeout', '$http', '$filter', 'noUrl', 'noDbSchema', 'noOdataQueryBuilder', 'noConfig', "noParameterParser", "lodash", function ($injector, $rootScope, $q, $timeout, $http, $filter, noUrl, noDbSchema, noOdataQueryBuilder, noConfig, noParameterParser, _) {
				var _currentUser;
				function NoHTTP(queryBuilder) {
					 var THIS = this; //,	_currentUser;
					console.warn("TODO: make sure noHTTP conforms to the same interface as noIndexedDb and noWebSQL");
					this.whenReady = function (tables) {
						return $q(function (resolve, reject) {
							if($rootScope.noHTTPInitialized) {
								console.log("noHTTP Ready.");
								resolve();
							} else {
								//console.log("noDbSchema is not ready yet.")
								$rootScope.$watch("noHTTPInitialized", function (newval) {
									if(newval) {
										console.log("noHTTP ready.");
										resolve();
									}
								});
							}
						});
					};
					this.configure = function (noUser, schema) {
						_currentUser = schema.config.creds || noUser.data || noUser;

						//console.log(schema);
						//_currentUser = noUser.data || noUser;
						// if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _currentUser.token_type + " " + _currentUser.access_token;


						//console.log("noHTTP::configure", schema);
						var promise = $q(function (resolve, reject) {
							for(var t in schema.tables) {
								var table = schema.tables[t];
								THIS[t] = new NoTable(t, table, queryBuilder, schema);
							}
							$rootScope.noHTTPInitialized = true;
							console.log("noHTTP_" + schema.config.dbName + " ready.");
							$rootScope["noHTTP_" + schema.config.dbName] = THIS;
							resolve(THIS);
						});
						return promise;
					};
					this.getDatabase = function (databaseName) {
						return $rootScope["noHTTP_" + databaseName];
					};
					this.noRequestJSON = function (url, method, data, useCreds, authHeader) {
						var json = angular.toJson(noParameterParser.parse(data || {}));
					//	if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);
						var deferred = $q.defer(),
							req = {
								method: method,
								url: url,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: authHeader
								},
								withCredentials: !!useCreds
							};
						if(!!data) {
							req.data =  json;
						}
						$http(req)
							.then(function (resp) {
								deferred.resolve(resp.data || data);
							})
							.catch(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});
						return deferred.promise;
					};
					this.noRequestForm = function (url, method, data, useCreds) {
						var deferred = $q.defer(),
							json = $.param(noParameterParser.parse(data)),
							req = {
								method: method,
								url: url,
								data: json,
								headers: {
									"Content-Type": "application/x-www-form-urlencoded"
								},
								withCredentials: !!useCreds
							};
						$http(req)
							.then(function (data) {
								deferred.resolve(data);
							})
							.catch(function (reason) {
								console.error(reason);
								deferred.reject(reason);
							});
						return deferred.promise;
					};
					this.noRequest = function(url, options, data, authHeader) {
						//if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization =
						var deferred = $q.defer(),
							req = angular.extend({}, {
								url: url,
								withCredentials: true,
								headers: {
									Authorization: authHeader //_authProvider.resolveAuthorization(_currentUser)
								}
							}, options);
						if(!!data) {
							req.data =  data;
						}
						$http(req)
							.then(function (data) {
								deferred.resolve(data);
							})
							.catch(function (reason) {
								deferred.reject(reason);
							});
						return deferred.promise;
					};
				}

				function NoTable(tableName, table, queryBuilder, schema) {

					function _resolveUrl(uri, table) {
						if(angular.isString(uri)) {
							if(RegExp("^(http|https):\/\/", "gi").test(uri)){
								return uri + (table || "");
							} else {
								return noConfig.current.RESTURI + uri + (table || "");
							}
						} else if(angular.isObject(uri)){
							return noConfig.current.RESTURI + uri.url;
						} else {
							return;
						}
					}

					function _resolveQueryParams(schema, filters, sort, page, select) {
						function _makeQp() {
							if(filters) {
								var ret	= {};
								_.flatten(filters.toQueryString()).forEach(function(v, k){
									var parm = {};
									ret[v.column] = v.value;
									return parm;
								});
								return ret;
							} else {
								return;
							}
						}

						if(schema.uri && _table.useQueryParams === false) {
							return queryBuilder(filters, sort, page, select);
						} else if(schema.uri && _table.useQueryParams !== false) {
							return _makeQp();
						} else if(!schema.uri && _table.useQueryParams !== true){
							return queryBuilder(filters, sort, page, select);
						} else if(!schema.uri && _table.useQueryParams === true ) {
							return _makeQp();
						}
					}

					var THIS = this,
						_table = table,
						_authProvider = schema.config.authProvider && $injector.get(schema.config.authProvider);

					this.noInfoPath = table;
					_table.parentSchema = schema;

					if(!queryBuilder) throw "TODO: implement default queryBuilder service";

					var url = _table.uri ? _resolveUrl(_table.uri) : noUrl.makeResourceUrl(noConfig.current.RESTURI + (schema.config.restPrefix || ""), tableName);
					console.log(url);
					Object.defineProperties(this, {
						entity: {
							get: function () {
								return this.noInfoPath;
							}
						}
					});
					this.noCreate = function (data) {
						data.CreatedBy = _currentUser.userId;
						data.DateCreated = noInfoPath.toDbDate(new Date());
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _currentUser.userId;

						/*
						*	#### primaryKey
						*
						*	This configuration option is found in db configuraiton files. It is a
						*	sibling property to schema source, and allows the definition of the
						*	type of primary key used on tables to create new records.
						*
						*	Currently this feature is only available for the noHTTP provider.
						*	It has two child properties; 	`type` and `createLocal`.
						*
						*	|Name|Description|
						*	|----|-----------|
						*	|type|Defines the type of value that defines the primary key. Can be `guid` or `int`|
						*	|createLocal|When `true` and the `type` is `guid` the primary key is generated before sending the data to the remote server.|
						*
						*	For backwards compatibility the default value for this property is as follows:
						*
						*	```json
						*	{
						*		"type": "guid",
						*		"createLocal": true
						*	}
						*	```
						*/
						var pkTmp = this.noInfoPath.parentSchema.config.primaryKey || {
							"type": "guid",
							"createLocal": true
						};

						if(pkTmp.createLocal) {
							if (pkTmp.createLocal && !data[table.primaryKey]) {
								data[table.primaryKey] = noInfoPath.createUUID();
							}
						}
						//msWebApiLargeNumberHack(data, this.noInfoPath.columns);

						var json = angular.toJson(data);

						//if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);

						var deferred = $q.defer(),
							req = {
								method: "POST",
								url: url,
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: ""
								},
								withCredentials: true
							};

						_authProvider.resolveAuthorization(_currentUser)
							.then(function(authHeader){
								req.headers.Authorization = authHeader;
								$http(req)
									.then(function (results) {
										//console.log(angular.toJson(data) );
										deferred.resolve(results.data || results);
									})
									.catch(function (reason) {
										//console.error(reason);
										deferred.reject(reason);
									});
							});

						return deferred.promise;
					};

					this.noRead = function () {
						//console.debug("noRead say's, 'swag!'");
						var filters, sort, page, select;
						for(var ai in arguments) {
							var arg = arguments[ai];
							//success and error must always be first, then
							if(angular.isObject(arg)) {
								switch(arg.__type) {
									case "NoFilters":
										filters = arg;
										filters.msOdata = _table.parentSchema.msOdata !== false;
										break;
									case "NoSort":
										sort = arg;
										break;
									case "NoPage":
										page = arg;
										break;
									default:
										if(angular.isArray(arg)) {
											select = arg;
										}
										break;
								}
							}
						}
						var deferred = $q.defer(),
							req = {
								method: "GET",
								url: url,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: ""
								},
								withCredentials: true
							};

					//	if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);

						req.params = _resolveQueryParams(_table, filters, sort, page, select);

						_authProvider.resolveAuthorization(_currentUser)
							.then(function(authHeader){
								req.headers.Authorization = authHeader;
								$http(req)
									.then(function (results) {
										//console.log( angular.toJson(results));
										var resp = new noInfoPath.data.NoResults(results.data || results);
										deferred.resolve(resp);
									})
									.catch(function (reason) {
										//console.error(arguments);
										if(reason.status === 404) {
											deferred.resolve(new noInfoPath.data.NoResults([]));
										} else {
											console.error(reason);
											deferred.reject(reason);
										}
									});
							});

						return deferred.promise;
					};

					this.noUpdate = function (data) {
						data.ModifiedDate = noInfoPath.toDbDate(new Date());
						data.ModifiedBy = _currentUser.userId;

						var json = angular.toJson(data);

						//if(_currentUser) $httpProviderRef.defaults.headers.common.Authorization = _authProvider.resolveAuthorization(_currentUser);

						var deferred = $q.defer(),
							req = {
								method: "PUT",
								url: _table.parentSchema.config.msOdata === false ? url + "/" + data[table.primaryKey] : url + "(guid'" + data[table.primaryKey] + "')",
								data: json,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json",
									Authorization: ""
								},
								withCredentials: true
							};

							_authProvider.resolveAuthorization(_currentUser)
								.then(function(authHeader){
									req.headers.Authorization = authHeader;

									$http(req)
										.then(function (results, status) {
											//console.log("noHTTP::noUpdate", data, status);
											deferred.resolve(results.data || results);
										})
										.catch(function (reason) {
											if(reason.status !== 404) console.error(reason);
											deferred.reject(reason);
										});
								});

						return deferred.promise;
					};

					this.noDestroy = function (data) {
						var ourl;
						if(this.entity.useQueryParams) {
							//Temporary hack. This needs to be refactor to hand params to the Nth degree.
							ourl = url + "?" + table.primaryKey + "=" + data[table.primaryKey];
						} else {
							ourl = _table.parentSchema.config.msOdata === false ? url + "/" + data[table.primaryKey] : url + "(guid'" + data[table.primaryKey] + "')";
						}
						if(data.__type === "NoFilters" && this.entity.useQueryParams === false) {
							ourl = url + "?$filter=" + data.toODATA();
						}

						var deferred = $q.defer(),
							req = {
								method: "DELETE",
								url: ourl,
								headers: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								withCredentials: true
							};

						_authProvider.resolveAuthorization(_currentUser)
							.then(function(authHeader){
								req.headers.Authorization = authHeader;

								$http(req)
									.then(function (data, status) {
										console.log("noHTTP::noDestory", data, status);
										deferred.resolve(status);
									})
									.catch(function (reason) {
										if(reason.status !== 404) console.error(reason);
										deferred.reject(reason);
									});
							});

						return deferred.promise;
					};

					this.noOne = function (query) {
						/**
						 *	When 'query' is an object then check to see if it is a
						 *	NoFilters object.  If not, add a filter to the intrinsic filters object
						 *	based on the query's key property, and the query's value.
						 */
						var filters = new noInfoPath.data.NoFilters();

						if(angular.isNumber(query)) {
							/*
							 *	When query a number, a filter is created on the instrinsic
							 *	filters object using the `rowid`  WebSQL column as the column
							 *	to filter on. Query will be the target
							 *	value of query.
							 */
							filters.quickAdd("rowid", "eq", query);
						} else if(angular.isString(query)) {
							/*
							 * When the query is a string it is assumed a table is being queried
							 * by it's primary key.
							 *
							 * > Passing a string when the entity is
							 * a SQL View is not allowed.
							 */
							if(THIS.noInfoPath.entityType === "V") throw "One operation not supported by SQL Views when query parameter is a string. Use the simple key/value pair object instead.";
							filters.quickAdd(THIS.noInfoPath.primaryKey, "eq", query);

						} else if(angular.isObject(query)) {
							if(query.__type === "NoFilters") {
								filters = query;
							} else {
								//Simple key/value pairs. Assuming all are equal operators and are anded.
								for(var k in query) {
									filters.quickAdd(k, "eq", query[k]);
								}
							}
						} else {
							throw new Error("noOne requires a query parameter. May be a Number, String or Object");
						}

						//Internal _getOne requires and NoFilters object.
						return THIS.noRead(filters)
							.then(function (data) {
								//console.log("noHTTP.noRead", data);
								if(data.length) {
									return data[0];
								} else if(data.paged && data.paged.length) {
									return data.paged[0];
								} else {
									//console.warn("noHTTP::noOne: Record Not Found", _table.entityName, filters.toODATA(), data);
									//throw new Error("noHTTP::noOne: Record Not Found");
									return null;
								}
							});
					};
				}
				//return new noREST($q, $http, $filter, noUrl, noConfig)
				return new NoHTTP(noOdataQueryBuilder.makeQuery);
			}];
		}]);
})(angular);
