var noDbSchemaMock = {
	"foo" : {
		"columns": {
			"Description": {
				"nullable": true,
				"type": "varchar",
				"length": 50,
				"columnName": "Description"
			},
			"fooID" : {
				"nullable": false,
				"type": "uniqueidentifier",
				"length": 0,
				"columnName": "fooID"
			},
			"barID" : {
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
			"barID" : {
				"table": "bar",
				"column": "barID"
			}
		},
		"primaryKey": ["fooID"],
        "entityType": "T",
        "entityName": "foo"
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
	"fooID" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
	"Description" : "Test",
	"barID": null,
	"number": 12,
	"price": 4.87
};

var updateData = {
	"Description": "noTest",
	"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
	"number": 42,
	"price": 19.95
};
