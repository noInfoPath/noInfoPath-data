var testFilter = new noInfoPath.data.NoFilters();
testFilter.quickAdd("fooID", "eq", "0eec54c3-1c7e-48af-a9da-d7da62820083");

var testSort = new noInfoPath.data.NoSort();
testSort.add("Description", "desc");

var testPage = new noInfoPath.data.NoPage(10, 20);

var
	noDbSchemaMock = {
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
	},
	sampleCreateData = {
		"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820083",
		"Description": "Test",
		"barID": null,
		"number": 12,
		"price": 4.87
	},
	sampleUpdateData = {
		"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820083",
		"Description": "noTest",
		"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
		"number": 42,
		"price": 19.95
	},
	WEBSQL_STATEMENT_BUILDERS_MOCKS = {
		"createTable": {
			params: ["foo", noDbSchemaMock.foo],
			expected: "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC)"
		},
		"createView": {
			params: ["vw_foo", noDbSchemaMock.vw_foo],
			expected: "CREATE VIEW IF NOT EXISTS vw_cooperator_summary AS SELECT Cooperators.CooperatorID, Cooperators.Account, Cooperators.CooperatorName, Cooperators.Inactive, Users.UserName AS CreatedBy, Users_1.UserName AS ModifiedBy, Cooperators.DateCreated, Cooperators.ModifiedDate, Cooperators.Notes FROM Cooperators INNER JOIN Users ON Cooperators.CreatedBy = Users.UserID INNER JOIN Users AS Users_1 ON Cooperators.ModifiedBy = Users_1.UserID"
		},
		"sqlInsert": {
			params: ["foo", sampleCreateData],
			expected: {
				queryString: "INSERT INTO foo (fooID,Description,barID,number,price) VALUES (?,?,?,?,?);",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083","Test",null,12,4.87]
			}
		},
		"sqlUpdate": {
			params: ["foo", sampleUpdateData, testFilter],
			expected: {
				queryString: "UPDATE foo SET fooID = ?, Description = ?, barID = ?, number = ?, price = ? WHERE (fooID = ?)",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083","noTest","128f28ca-e926-4259-d202-b754fe5b11c7",42,19.95, "0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		},
		"sqlDelete": {
			//tableName, filters
			params: ["foo",  testFilter],
			expected: {
				queryString: "DELETE FROM foo WHERE (fooID = ?)",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		},
		"sqlRead": {
			params: ["foo", testFilter, testSort, testPage],
			expected: {
				queryString: "SELECT * FROM foo WHERE (fooID = ?) ORDER BY Description desc LIMIT 20 OFFSET 10",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		}
	},
	toSqlLiteConversionFunctionsMock = {
		"TEXT": "",
		"BLOB": "",
		"INTEGER": 0,
		"NUMERIC": 0,
		"REAL": 0,
		"DATE": new Date()
	},
	fromSqlLiteConversionFunctionsMock = {
		"bigint": {
			params: [10],
			expected: {
				type:  "number",
				result: 10
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"bit": {
			params: [1],
			expected: {
				type:  "number",
				result: 1
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"decimal": {
			params: [10.2],
			expected: {
				type:  "number",
				result: 10.2
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"int": {
			params: [10],
			expected: {
				type:  "number",
				result: 10
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"money": {
			params: [10.2],
			expected: {
				type:  "number",
				result: 10.2
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"numeric": {
			params: [10.2],
			expected: {
				type:  "number",
				result: 10.2
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"smallint": {
			params: [1],
			expected: {
				type:  "number",
				result: 1
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"smallmoney": {
			params: [10.2],
			expected: {
				type:  "number",
				result: 10.2
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"tinyint": {
			params: [1],
			expected: {
				type:  "number",
				result: 1
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"float": {
			params: [10.2],
			expected: {
				type:  "number",
				result: 10.2
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"real": {
			params: [10.2],
			expected: {
				type:  "number",
				result: 10.2
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"date": {
			params: [new Date(2015, 08, 18, 10, 30, 50, 100)],
			expected: {
				type: "string",
				result: "2015-09-18T10:30:50.100"
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"datetime": {
			params: [new Date(2015, 08, 18, 10, 30, 50, 100)],
			expected: {
				type: "string",
				result: "2015-09-18T10:30:50.100"
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"datetime2": {
			params: [new Date(2015, 08, 18, 10, 30, 50, 100)],
			expected: {
				type: "string",
				result: "2015-09-18T10:30:50.100"
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"datetimeoffset": {
			params: [new Date(2015, 08, 18, 10, 30, 50, 100)],
			expected: {
				type: "string",
				result: "2015-09-18T10:30:50.100"
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"smalldatetime": {
			params: [new Date(2015, 08, 18, 10, 30, 50, 100)],
			expected: {
				type: "string",
				result: "2015-09-18T10:30:50.100"
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"time": {
			params: [new Date(2015, 08, 18, 10, 30, 50, 100)],
			expected: {
				type: "string",
				result: "2015-09-18T10:30:50.100"
			},
			antiParams: ["x"],
			antiExpected: null
		},
		"char": {
			params: ["c"],
			expected: {
				type:  "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"varchar": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"nvarchar": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"text": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"ntext": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"binary": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"varbinary": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"image": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		},
		"uniqueidentifier": {
			params: ["c"],
			expected: {
				type: "string",
				result: "c"
			},
			antiParams: [0],
			antiExpected: null
		}
	}

;
