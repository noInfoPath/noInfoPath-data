// User clicks save button

var trans = ,
	addressRecord = {
		"Address Line 1": "404 Road rd"
	},
	contactRecord = {
		"ContactName": "Adarian"
	},
	contactAddress = {};

	//records on create get a new GUID ID for their PK



(function(angular){
	"use strict";

	angular.module("sudo", ["noinfopath.data", "noinfopath.user"])
		.controller("contactFormController", ["noWebSQL", "noLoginService", "$q", "noTransactionCache", "$scope", function(noWebSQL, noLoginService, $q, noTransactionCache, $scope){


			// save
			$scope.save = function(){
				noTransactionCache.beginTransaction(noWebSQL)
					.then(function(tx){
						db.Contacts.noCreate(contactRecord, tx)
							.then(function(data){
								contactAddress.ContactID = data.ContactID;
								db.Addresses.noCreate(addressRecord, tx)
									.then(function(data){
										contactAddress.AddressID = data.AddressID;
										db.ContactAddress.noCreate(contactAddress, tx)
											.then(function(data){
												tx.endTransaction()
													.then(function(){
														console.log("success");
													})
													.catch(function(err){
														console.error(err);
													});
											})
											.catch(function(err){
												console.error(err);
											})
									})
									.catch(function(err){
										console.error(err);
									})
							})
							.catch(function(err){
								console.error(err);
							})
					})
					.catch(function(err){
						console.error(err);
					});
				}
		}])
		;
})(angular);

// .run(["noDataTransactionCache", function(noDataTransactionCache){
// 	var user = noLoginService.user,
// 		version = {"name":"NoInfoPath-Changes-v1","version":1},
// 		store = {"NoInfoPath_Changes": "$$ChangeID"},
// 		tables = {
// 			"NoInfoPath_Changes": {
// 				"primaryKey": "ChangeID"
// 			}
// 		};
//
// 	noDataTransactionCache.configure(user, version, store, tables)
// 		.catch(function(err){
// 			console.error(err);
// 		});
// }])
