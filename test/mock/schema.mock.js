var noDbSchemaMock = {
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
		"foreignKeys": {

		},
		"primaryKey": [

		],
		"entityType": "V",
		"entityName": "vw_cooperator_summary",
		"entitySQL": "CREATE VIEW vw_cooperator_summary AS SELECT Cooperators.CooperatorID, Cooperators.Account, Cooperators.CooperatorName, Cooperators.Inactive, Users.UserName AS CreatedBy, Users_1.UserName AS ModifiedBy, Cooperators.DateCreated, Cooperators.ModifiedDate, Cooperators.Notes FROM Cooperators INNER JOIN Users ON Cooperators.CreatedBy = Users.UserID INNER JOIN Users AS Users_1 ON Cooperators.ModifiedBy = Users_1.UserID"
	}
};

var noDbSchemaResults = {
	"noDbSchema_NoInfoPath_dtc_v1": {
		"NoInfoPath_Changes": {
			"primaryKey": "ChangeID"
		}
	},
	"noDbSchema_FCFNv2": noDbSchemaMock
};

var insertData = {
	"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820083",
	"Description": "Test",
	"barID": null,
	"number": 12,
	"price": 4.87
};

var updateData = {
	"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820083",
	"Description": "noTest",
	"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
	"number": 42,
	"price": 19.95
};

var testFilter = new noInfoPath.data.NoFilters();
testFilter.quickAdd("fooID", "eq", "0eec54c3-1c7e-48af-a9da-d7da62820083");

var testSort = new noInfoPath.data.NoSort();
testSort.add("Description", "desc");

var testPage = new noInfoPath.data.NoPage(10, 20);
