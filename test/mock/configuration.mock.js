//configuration.mock.js
//console.warn("TODO: Refactor actual noConfig service to work more like this mock");

var mockConfig = {
	"RESTURI": "http://fcfn-rest.img.local/odata",
	"AUTHURI": "http://fcfn-rest.img.local",
	"NODBSCHEMAURI": "http://noinfopath-rest.img.local/api/NoDbSchema",
	"noDbSchema": [
		{
			"dbName": "NoInfoPath_dtc_v1",
			"provider": "noIndexedDb",
			"remoteProvider:": "noHTTP",
			"version": 1,
			"schemaSource": {
				"provider": "inline",
				"schema": {
					"NoInfoPath_Changes": {
						"primaryKey": "ChangeID"
					}
				}
			}
		},
		{
			"dbName": "FCFNv2",
			"provider": "noWebSql",
			"remoteProvider": "noHTTP",
			"version": 1,
			"description": "Fall Creek Variety Development Database",
			"size": 51200,
			"schemaSource": {
				"provider": "noDBSchema",
				"sourceDB": "fcfn2"
			}
		}
	],
	"IndexedDB" : {
		"name": "NoInfoPath-v3",
		"version": 1
	},

	"WebSQL" : {
		"name": "NoInfoPath-v3",
		"version" : "1.0",
		"description" : "noinfopath",
		"size": 500000000
	}
},
tablesMock = {
	"foo": {
		"columns": {
			"Description": {
				"nullable": true,
				"type": "varchar",
				"length": 50,
				"columnName": "Description"
			},
			"fooID": {
				"nullable": false,
				"type": "uniqueidentifier",
				"length": 0,
				"columnName": "fooID"
			},
			"barID": {
				"nullable": true,
				"type": "uniqueidentifier",
				"length": 0,
				"columnName": "barID"
			},
			"number": {
				"nullable": true,
				"type": "int",
				"length": 0,
				"columnName": "number"
			},
			"price": {
				"nullable": false,
				"type": "decimal",
				"length": 0,
				"columnName": "price"
			},
			"CreatedBy": {
				"nullable": false,
				"type": "uniqueidentifier",
				"length": 0,
				"columnName": "CreatedBy"
			},
			"DateCreated": {
				"nullable": false,
				"type": "Date",
				"length": 0,
				"columnName": "DateCreated"
			},
			"ModifiedBy": {
				"nullable": false,
				"type": "uniqueidentifier",
				"length": 0,
				"columnName": "CreatedBy"
			},
			"ModifiedDate": {
				"nullable": false,
				"type": "Date",
				"length": 0,
				"columnName": "DateCreated"
			}
		},
		"foreignKeys": {
			"barID": {
				"table": "bar",
				"column": "barID"
			}
		},
		"primaryKey": ["fooID"],
		"entityType": "T",
		"entityName": "foo"
	},
	"vw_foo": {
		"columns": {
			"CooperatorID": {
				"nullable": false,
				"type": "uniqueidentifier",
				"length": 16,
				"columnName": "CooperatorID"
			},
			"Account": {
				"nullable": true,
				"type": "nvarchar",
				"length": 510,
				"columnName": "Account"
			},
			"CooperatorName": {
				"nullable": true,
				"type": "nvarchar",
				"length": 100,
				"columnName": "CooperatorName"
			},
			"Inactive": {
				"nullable": true,
				"type": "bit",
				"length": 1,
				"columnName": "Inactive"
			},
			"CreatedBy": {
				"nullable": true,
				"type": "nvarchar",
				"length": 100,
				"columnName": "CreatedBy"
			},
			"ModifiedBy": {
				"nullable": true,
				"type": "nvarchar",
				"length": 100,
				"columnName": "ModifiedBy"
			},
			"DateCreated": {
				"nullable": true,
				"type": "datetime",
				"length": 8,
				"columnName": "DateCreated"
			},
			"ModifiedDate": {
				"nullable": true,
				"type": "datetime",
				"length": 8,
				"columnName": "ModifiedDate"
			},
			"Notes": {
				"nullable": true,
				"type": "nvarchar",
				"length": -1,
				"columnName": "Notes"
			}
		},
		"foreignKeys": {},
		"primaryKey": [],
		"entityType": "V",
		"entityName": "vw_foo",
		"entitySQL": "CREATE VIEW vw_foo AS SELECT * from foo"
	}
};


(function(angular, undefined){
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.data.mocks", [])
		.provider("noConfig", [function(){
			var _currentConfig = mockConfig, _status;

			function NoConfig($http, $q, $timeout, $rootScope, noLocalStorage){
				var SELF = this;

				Object.defineProperties(this, {
					"current": {
						"get": function() { return _currentConfig; }
					},
					"status": {
						"get": function() { return _status; }
					}
				});

				this.load = function (uri){
					return $timeout(function (){
						noLocalStorage.setItem("noConfig", mockConfig);
					});
				};

				this.fromCache = function(){
					_currentConfig = noLocalStorage.getItem("noConfig");
				};

				this.whenReady = function(uri){
					var deferred = $q.defer();

					$timeout(function(){
						if($rootScope.noConfigReady)
						{
							deferred.resolve();
						}else{
							$rootScope.$watch("noConfig", function(newval){
								if(newval){
									deferred.resolve();
								}
							});

							SELF.load(uri)
								.then(function(){
									_currentConfig = noLocalStorage.getItem("noConfig");
									$rootScope.noConfig = _currentConfig;
								})
								.catch(function(err){
									SELF.fromCache();

									if(_currentConfig){
										$rootScope.noConfig = _currentConfig;
									}else{
										deferred.reject("noConfig is offline, and no cached version was available.");
									}
								});
						}
					});

					return deferred.promise;
				};
			}

			this.$get = ['$http','$q', '$timeout', '$rootScope', 'noLocalStorage', function($http, $q, $timeout, $rootScope, noLocalStorage){
				return new NoConfig($http, $q, $timeout, $rootScope, noLocalStorage);
			}];
		}])


	;
})(angular);
