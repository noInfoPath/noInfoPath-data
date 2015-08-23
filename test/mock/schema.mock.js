var mock = {
			"foo" : {
				"columns": {
					"Description": {
						"nullable": true,
						"type": "varchar",
						"length": 50
					},
					"fooID" : {
						"nullable": false,
						"type": "uniqueidentifier",
						"length": 0
					},
					"barID" : {
						"nullable": true,
						"type": "uniqueidentifier",
						"length": 0
					},
					"number": {
						"nullable": true,
						"type": "int",
						"length": 0
					},
					"price": {
						"nullable": false,
						"type": "decimal",
						"length": 0
					}
				},
				"foreignKeys": {
					"barID" : {
						"table": "bar",
						"column": "barID"
					}
				},
				"primaryKey": "fooID"
			}
		};

var insertData = {
	"fooID" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
	"Description" : "Test",
	"barID": null,
	"number": 12,
	"price": 4.87
}