var
	noWebSqlStatmentFactoryMocks = {
		"createSqlTableStmt": {
			params: ["foo", noDbSchemaMock.foo],
			//expected: "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC,CreatedBy TEXT,DateCreated DATE,ModifiedBy TEXT,ModifiedDate DATE)"
			expected: "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT NULL,number INTEGER NULL,price NUMERIC,CreatedBy TEXT,DateCreated DATE,ModifiedBy TEXT,ModifiedDate DATE)"
		},
		"createSqlViewStmt": {
			params: ["vw_foo", noDbSchemaMock.vw_foo],
			expected: "CREATE VIEW IF NOT EXISTS vw_foo AS SELECT * from foo"
		},
		"createSqlInsertStmt": {
			params: ["foo", sampleCreateData],
			expected: {
				queryString: "INSERT INTO foo (fooID,Description,barID,number,price) VALUES (?,?,?,?,?);",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083", "Test", null, 12, 4.87]
			}
		},
		"createSqlUpdateStmt": {
			params: ["foo", sampleUpdateData, testFilter],
			expected: {
				queryString: "UPDATE foo SET fooID = ?, Description = ?, barID = ?, number = ?, price = ? WHERE (fooID = ?)",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083", "noTest", "128f28ca-e926-4259-d202-b754fe5b11c7", 42, 19.95, "0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		},
		"createSqlDeleteStmt": {
			params: ["foo", testFilter],
			expected: {
				queryString: "DELETE FROM foo WHERE (fooID = ?)",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		},
		"createSqlReadStmt": {
			params: ["foo", testFilter, testSort, testPage],
			expected: {
				queryString: "SELECT * FROM foo WHERE (fooID = ?) ORDER BY Description desc LIMIT 20 OFFSET 10",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		},
		"createSqlClearStmt": {
			params: ["foo"],
			expected: {
				queryString: "DELETE FROM foo",
				valueArray: []
			}

		},
		"convertToWebSQL": {
			params: ["varchar", "hello world"],
			expected: "hello world"
		}
	};
