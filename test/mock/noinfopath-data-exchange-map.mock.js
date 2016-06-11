var ContactInfoForm_Config = { //Type: noSqlTranslationConfig
		contactID: {
			type: String,
			destination: {
				table: "Contacts",
				column: "ContactID",
				type: "UniqueIdentifier",
				primaryKey: true
			}
		},
		firstName: {
			type: String,
			destination: {
				table: "Contacts",
				column: "FirstName",
				type: "varchar"
			}
		},
		lastName: {
			type: String,
			destination: {
				table: "Contacts",
				column: "LastName",
				type: "varchar"
			}
		},
		email: {
			type: String,
			destination: {
				table: "Contacts",
				column: "Email",
				type: "varchar"
			}
		},
		phoneNumbers: {
			phoneID: {
				type: String,
				destination: {
					table: "PhoneNumber",
					column: "phoneID",
					type: "UniqueIdentifier",
					primaryKey: true
				}
			},
			phone: {
				type: String,
				destination: {
					table: "PhoneNumber",
					column: "phone",
					type: "varchar"
				}
			},
			  phoneType: {
				type: Number,
				destination: {
					table: "PhoneNumber",
					column: "phoneTypeID",
					type: "int",
					foreignKeyConstraint: {
						table: "PhoneNumberTypes",
						column: "PhoneTypeID",
						unqiue: false,
						required: true
					}
				}
			},
			relationships: [
				{
					type: "joiner",
					table: "CustomerPhoneNumbers",
					columnA: {
						table: "Contacts",
						column: "ContactID"
					},
					columnB: {
						table: "PhoneNumbers",
						column: "PhoneID"
					}
			}
		]

		}
	},

	ContactInfoForm_Data = {  
		contactID: "0a1a0422d26f4ac9851ab1701def8b09",
		  firstName: "Jeff",
		  lastName: "Gochin",
		  email: "jeff@gochin.com",
		  phoneNumbers: [
   {
				phoneID: "3104afd2-3f49-47bc-ae5f-4a773ecbf6e3",
				phone: "2674752217",
				phoneType: {
					PhoneTypeID: 1,
					Desc: "Cell"
				}
			},
    {
				phoneID: "ff4ee803-5c32-442c-a0e6-ff29830cfc3b",
				phone: "2153712813",
				phoneType: {
					PhoneTypeID: 3,
					Desc: "Home"
				}
			},
    {
				phoneID: "2fc794b2-5ebe-46e5-88ea-0effb91d6d04",
				phone: "2153711520",
				phoneType: {
					PhoneTypeID: 5,
					Desc: "Work"
				}
			}
  ] 
	};

function _parseNoSqlDoc(noSqlTransConfig, doc, db) {
	var tableData = {},
		prevTable = "";

	_.each(noSqlTransConfig, function (value, key) {
		if(_.isUndefined(doc[key])) {
			//relationships probably handled here
		} else {
			var currentProp = doc[key];
			if(_.isArray(currentProp)) // this is where the code would handle phoneNumbers
			{
				db = _parseNoSqlDoc(value, currentProp, db);
			} else {
				tableData[key] = value.type(doc[key]); //js object that would go into the specifc table array, ie Contacts[tableData]
			}
		}
	});
	//console.log("add table",table);
	return db;
}
