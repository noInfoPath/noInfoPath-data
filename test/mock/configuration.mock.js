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
		"IndexedDB": {
			"name": "NoInfoPath-v3",
			"version": 1
		},

		"WebSQL": {
			"name": "NoInfoPath-v3",
			"version": "1.0",
			"description": "noinfopath",
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


(function (angular, undefined) {
	"use strict";

	var noODATAProv;

	angular.module("noinfopath.data.mocks", [])
		.provider("noConfig", [function () {
			var _currentConfig = mockConfig,
				_status;

			function NoConfig($http, $q, $timeout, $rootScope, noLocalStorage) {
				var SELF = this;

				Object.defineProperties(this, {
					"current": {
						"get": function () {
							return _currentConfig;
						}
					},
					"status": {
						"get": function () {
							return _status;
						}
					}
				});

				this.load = function (uri) {
					return $timeout(function () {
						noLocalStorage.setItem("noConfig", mockConfig);
					});
				};

				this.fromCache = function () {
					_currentConfig = noLocalStorage.getItem("noConfig");
				};

				this.whenReady = function (uri) {
					var deferred = $q.defer();

					$timeout(function () {
						if($rootScope.noConfigReady) {
							deferred.resolve();
						} else {
							$rootScope.$watch("noConfig", function (newval) {
								if(newval) {
									deferred.resolve();
								}
							});

							SELF.load(uri)
								.then(function () {
									_currentConfig = noLocalStorage.getItem("noConfig");
									$rootScope.noConfig = _currentConfig;
								})
								.catch(function (err) {
									SELF.fromCache();

									if(_currentConfig) {
										$rootScope.noConfig = _currentConfig;
									} else {
										deferred.reject("noConfig is offline, and no cached version was available.");
									}
								});
						}
					});

					return deferred.promise;
				};
			}

			this.$get = ['$http', '$q', '$timeout', '$rootScope', 'noLocalStorage', function ($http, $q, $timeout, $rootScope, noLocalStorage) {
				return new NoConfig($http, $q, $timeout, $rootScope, noLocalStorage);
			}];
		}])

		.service("noLoginService", ["lodash", "noConfig", function (_, noConfig) {
			this.user = new noInfoPath.NoInfoPathUser(_, noConfig, {
				"access_token": "zB4X8TUL9SLdXq3ccmlzY65rD4fXyJ_fZYnmGC_f4_NTcykq1U_l9Amva73-39x5tEoWFIX0B7jD-nTCK9gxYXoK_pti16odGavFGH61tUrtSIeDR7bmHZTa5sW-c5h3n7gomqznSIWkMwjimU-Z6caKLpBTRtrjfoOJ8uR47FaJ83fd2TVDGwo2o7KJmn2J0QnyVn22PIuId66sMqvzw-aa21s8RyFz7qpvvSKRUXQCV6dwIcnDbtXbfcVB2mwhoNoblHvtE5DskZ6L0Z5_yqJf9x66uKRinmzKQ2vQKJVN9csZ8CNjrZ2QkWX_96V_fKaaLrSSEIA7dvjip_5NH07ef1dG_D0OUhHfYmbngvyK_lSiefkz522Mb1FTYdeuetyGu7FvcbN00SMdzKUewYr8awXNgaot2wE7LQP1hhZ7I35luhUUj1_FFqZfNxWdnz4B0IZ6xUAZc_1pjCLY5cpi09ecVDJ2khPWgBNfUrpsBaGPiSZjMM2qoihYC76LTmvXS7M_7Ypw6Cmaun2_kNj6Bz8onHbYus4pEKc9rpGIJW8LhBp_O8PnD9Y6fUnvHJDCm2j7XuamBATTrCZiWaUARLy7QGoFOpYNQ1H6eFKbJwA0qvYpcHmwFQmC5SsUk_8PooPGh9Fdm_OSgu52j29161lSjgwytf17PObLg2kWZ2e7c_uT5Xk274S9Y4M7qfi0v8RGzFXos1kJvXPatBxp4kv2K0fcaXxeyXe_eaCul5P8ZkcSF9P1psTnP2bxkxA8upEGyMdQpeZK-n4hqvQMPgnBZnP2QEECPRKOKSHRwQjxnzEpd_0ztF_yYjxRSNvIjkfE7t9P9JJN04trk0iUxXfFjC9Jxe03r7UjJ0S6m064CSmBOdFBJJMEi3kP4oiUMRGApnxHk4715H01Rp0gEbuue82Dg3DGi8pYckkRXyYy6NuBghqzCuu1WY6MSZKmwXJItJ9jeqH8LXIRS_DA1jFB4-3Ra0Xryv9c5eIKbg_9FI1rJpmV9mm1mxVf7VYjcVVCepABzuUPWhHIkt0mikc7DQN3iBjh4JE_-fuLqsco3rqNxaRpIMNLxeBLAcSURgQubwevVGoL2I_nOw",
				"token_type": "bearer",
				"expires_in": 1209599,
				"userId": "2a1e4ce8-22de-4642-acda-e32ce81a76b9",
				"acl": [],
				"username": "jeff@gochin.com",
				"email": "jeff@gochin.com",
				".issued": "Mon, 15 Jun 2015 17:42:43 GMT",
				".expires": "Mon, 29 Jun 2015 17:42:43 GMT",
				"expires": Date.parse("2015-06-29T17:42:43.000Z")
			});
		}]);
})(angular);
