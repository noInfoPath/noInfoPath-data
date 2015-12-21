var noWebSqlStatementFactory,
	methods = {
		"createSqlTableStmt": {
			params: ["foo", noDbSchemaMock.foo],
			expected: "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC)"
		},
		"createSqlViewStmt": {
			params: ["vw_foo", noDbSchemaMock.vw_foo],
			expected: "CREATE VIEW IF NOT EXISTS vw_cooperator_summary AS SELECT Cooperators.CooperatorID, Cooperators.Account, Cooperators.CooperatorName, Cooperators.Inactive, Users.UserName AS CreatedBy, Users_1.UserName AS ModifiedBy, Cooperators.DateCreated, Cooperators.ModifiedDate, Cooperators.Notes FROM Cooperators INNER JOIN Users ON Cooperators.CreatedBy = Users.UserID INNER JOIN Users AS Users_1 ON Cooperators.ModifiedBy = Users_1.UserID"
		},
		"createSqlInsertStmt": {
			params: ["foo", insertData],
			expected: {
				queryString: "INSERT INTO foo (fooID,Description,barID,number,price) VALUES (?,?,?,?,?);",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083","Test",null,12,4.87]
			}
		},
		"createSqlUpdateStmt": {
			params: ["foo", updateData, testFilter],
			expected: {
				queryString: "UPDATE foo SET fooID = ?, Description = ?, barID = ?, number = ?, price = ? WHERE (fooID = ?)",
				valueArray: ["0eec54c3-1c7e-48af-a9da-d7da62820083","noTest","128f28ca-e926-4259-d202-b754fe5b11c7",42,19.95, "0eec54c3-1c7e-48af-a9da-d7da62820083"]
			}
		},
		"createSqlDeleteStmt": {
			params: ["foo", updateData,  testFilter],
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

describe("Tesing noWebSqlStatementFactory", function() {
	beforeEach(function() {
		module("noinfopath.data");

		inject(function($injector) {
			noWebSqlStatementFactory = $injector.get("noWebSqlStatementFactory");
		});
	});


	it("should have been injectded.", function() {
		expect(noWebSqlStatementFactory);
	});

	describe("each public method should exist", function(){
		function createTest(method, data){
			describe("testing " + method, function(){
				it("should exist", function(){
					expect(noWebSqlStatementFactory[method]);
				});

				it("should return expected results", function(){
					//console.log(data);

					var fn = noWebSqlStatementFactory[method],
						r = fn.apply(null, data.params);

					expect(r);

					expect(r).toEqual(data.expected);
				});
			});
		}

		for(var m in methods){
			var data = methods[m];

			createTest(m, data);

		}
	});


});
