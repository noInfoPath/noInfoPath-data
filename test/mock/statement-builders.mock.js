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
			"foreignKeys": {

			},
			"primaryKey": [

			],
			"entityType": "V",
			"entityName": "vw_foo",
			"entitySQL": "CREATE VIEW vw_foo AS SELECT * from foo"
		}
	},
	noDbConfig = {
		"dbName": "FCFNv2",
		"provider": "noWebSQL",
		"remoteProvider": "noHTTP",
		"version": 1,
		"description": "Fall Creek Variety Development Database",
		"size": 51200,
		"schemaSource": {
			"provider": "noDBSchema",
			"sourceDB": "fcfn2"
		}
	},
	sampleCreateData = {
		"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820083",
		"Description": "Test",
		"barID": null,
		"number": 12,
		"price": 4.87
	},
	sampleUpsertData1 = {
		"Description": "Test1",
		"barID": null,
		"number": 1111,
		"price": 111.87
	},
	sampleUpsertData2 = {
		"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820090",
		"Description": "Test2",
		"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
		"number": 2222,
		"price": 222.87
	},
	sampleUpdateData = {
		"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820083",
		"Description": "noTest",
		"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
		"number": 42,
		"price": 19.95
	},
	bulkLoadData = [
		{
			"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820090",
			"Description": "Test1",
			"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
			"number": 111,
			"price": 111.87,
			"CreatedBy": "228f28ca-e926-4259-d202-b754fe5b11c7",
			"DateCreated": "2015-12-24T15:52:00",
			"ModifiedBy": "328f28ca-e926-4259-d202-b754fe5b11c7",
			"ModifiedDate": "2015-12-24T15:52:00"
		},
		{
			"fooID": "0eec54c3-1c7e-48af-a9da-d7da62820091",
			"Description": "Test2",
			"barID": "128f28ca-e926-4259-d202-b754fe5b11c7",
			"number": 2222,
			"price": 222.87,
			"CreatedBy": "228f28ca-e926-4259-d202-b754fe5b11c7",
			"DateCreated": "2015-12-24T15:52:00",
			"ModifiedBy": "328f28ca-e926-4259-d202-b754fe5b11c7",
			"ModifiedDate": "2015-12-24T15:52:00"
		}
	],
	WEBSQL_STATEMENT_BUILDERS_MOCKS = {
		"createTable": {
			params: ["foo", noDbSchemaMock.foo],
			expected: "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC,CreatedBy TEXT,DateCreated DATE,ModifiedBy TEXT,ModifiedDate DATE)"
		},
		"createView": {
			params: ["vw_foo", noDbSchemaMock.vw_foo],
			expected: "CREATE VIEW IF NOT EXISTS vw_foo AS SELECT * from foo"
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
	},
	currentUser = new noInfoPath.NoInfoPathUser({
		"access_token": "zB4X8TUL9SLdXq3ccmlzY65rD4fXyJ_fZYnmGC_f4_NTcykq1U_l9Amva73-39x5tEoWFIX0B7jD-nTCK9gxYXoK_pti16odGavFGH61tUrtSIeDR7bmHZTa5sW-c5h3n7gomqznSIWkMwjimU-Z6caKLpBTRtrjfoOJ8uR47FaJ83fd2TVDGwo2o7KJmn2J0QnyVn22PIuId66sMqvzw-aa21s8RyFz7qpvvSKRUXQCV6dwIcnDbtXbfcVB2mwhoNoblHvtE5DskZ6L0Z5_yqJf9x66uKRinmzKQ2vQKJVN9csZ8CNjrZ2QkWX_96V_fKaaLrSSEIA7dvjip_5NH07ef1dG_D0OUhHfYmbngvyK_lSiefkz522Mb1FTYdeuetyGu7FvcbN00SMdzKUewYr8awXNgaot2wE7LQP1hhZ7I35luhUUj1_FFqZfNxWdnz4B0IZ6xUAZc_1pjCLY5cpi09ecVDJ2khPWgBNfUrpsBaGPiSZjMM2qoihYC76LTmvXS7M_7Ypw6Cmaun2_kNj6Bz8onHbYus4pEKc9rpGIJW8LhBp_O8PnD9Y6fUnvHJDCm2j7XuamBATTrCZiWaUARLy7QGoFOpYNQ1H6eFKbJwA0qvYpcHmwFQmC5SsUk_8PooPGh9Fdm_OSgu52j29161lSjgwytf17PObLg2kWZ2e7c_uT5Xk274S9Y4M7qfi0v8RGzFXos1kJvXPatBxp4kv2K0fcaXxeyXe_eaCul5P8ZkcSF9P1psTnP2bxkxA8upEGyMdQpeZK-n4hqvQMPgnBZnP2QEECPRKOKSHRwQjxnzEpd_0ztF_yYjxRSNvIjkfE7t9P9JJN04trk0iUxXfFjC9Jxe03r7UjJ0S6m064CSmBOdFBJJMEi3kP4oiUMRGApnxHk4715H01Rp0gEbuue82Dg3DGi8pYckkRXyYy6NuBghqzCuu1WY6MSZKmwXJItJ9jeqH8LXIRS_DA1jFB4-3Ra0Xryv9c5eIKbg_9FI1rJpmV9mm1mxVf7VYjcVVCepABzuUPWhHIkt0mikc7DQN3iBjh4JE_-fuLqsco3rqNxaRpIMNLxeBLAcSURgQubwevVGoL2I_nOw",
		"token_type": "bearer",
		"expires_in": 1209599,
		"userId": "2a1e4ce8-22de-4642-acda-e32ce81a76b9",
		"acl": [
			"276d677e-f1be-43ce-9f03-0c264aa7737d",
			"f1b29985-cb5f-4447-9322-10722b20475f",
			"bea3ae3f-1244-40aa-8076-165d9ffdae0a",
			"950470d7-df00-4be2-b7cf-45e31d161199",
			"230a963f-0515-40be-b2de-56309e77f5bd",
			"b7a277c4-543b-4d1d-bb14-66ae7214376c",
			"7c4f6d12-6717-41cc-8277-7febe97bbb7a",
			"61f663a9-656c-402e-93e0-8e0e7a1c6e8c",
			"18952aa8-0e92-4e53-a30f-8ec10cda0d27",
			"1add6cde-23b1-46df-97b5-983209e2f830",
			"1ce8e849-ff97-41b6-a859-aead9c705bca",
			"ad628c16-1ffe-45d9-ac2d-cb09fd430a50",
			"5004a316-36b3-4bb8-bb91-dacc2d403d8b",
			"f131453f-9b3c-4b58-8083-e5a0bb9e2cd9",
			"5ae45ddc-079e-4139-90ed-e70511d93077",
			"e3e8985d-3208-44ad-8225-eb3471bb9dc9",
			"ee4e70ee-4a51-4246-88cc-ebf78accf9a7",
			"86e4a293-2809-4c46-bad4-f213049f3bca"
		],
		"username": "jeff@gochin.com",
		"email": "jeff@gochin.com",
		".issued": "Mon, 15 Jun 2015 17:42:43 GMT",
		".expires": "Mon, 29 Jun 2015 17:42:43 GMT",
		"expires": Date.parse("2015-06-29T17:42:43.000Z")
	})

;
