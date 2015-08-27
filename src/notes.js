// User clicks save button

var trans = new NoTransaction(noDb, noLoginService.user.userID),	
	addressRecord = {
		"Address Line 1": "404 Road rd"
	},
	contactRecord = {
		"ContactName": "Adarian"
	},
	contactAddress = {};

	//records on create get a new GUID ID for their PK

trans.beginTransaction()
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

(function(angular){
	"use strict";

	angular.module("sudo", ["noinfopath.data", "noinfopath.user"])
		.controller("contactFormController", ["noWebSQL", "noLoginService", "$q", function(noWebSQL, noLoginService, $q){

		}])
		;
})(angular);



