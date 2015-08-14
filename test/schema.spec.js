describe("Testing noDbSchema", function(){
	var $httpBackend, noDbSchema, dbJsonMock,
		expected = {

		}
	;

	beforeEach(function(){

		module("noinfopath.data");
		module("noinfopath.logger");
		//module("noinfopath.data.mocks");
		inject(function($injector){
			$httpBackend = $injector.get("$httpBackend");
			noDbSchema = $injector.get("noDbSchema");
	       	//dbJsonMock = $injector.get("dbJsonMock");
		});
	});


	it("noDbSchema should exist and be initialized.", function(){
		expect(noDbSchema).toBeDefined();
		expect(noDbSchema.whenReady).toBeDefined();
		expect(noDbSchema.test).toBeDefined();
		expect(noDbSchema.test.createTable).toBeDefined();
		expect(noDbSchema.test.columnDef).toBeDefined();
		expect(noDbSchema.test.columnConstraint).toBeDefined();
		expect(noDbSchema.test.typeName).toBeDefined();
		expect(noDbSchema.test.expr).toBeDefined();
		expect(noDbSchema.test.foreignKeyClause).toBeDefined();
		//expect(noDbSchema.store).toBeDefined();
	});

	describe("Testing Create Table Strings", function(){
		var mock = {
			"foo" : {
				"noinfopath": {
					"displayName": "Foo"
				},
				"columns": {
					"Description": {
						"nullable": "true",
						"type": "varchar",
						"length": 50
					},
					"fooID" : {
						"nullable": "false",
						"type": "uniqueidentifier",
						"length": 0
					},
					"barID" : {
						"nullable": "true",
						"type": "uniqueidentifier",
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

		it("should return a column's type", function(){
			var result,
				expected = "TEXT";

			result = noDbSchema.test.typeName(mock.foo.columns.Description);

			expect(result).toEqual(expected);
		});

		it("should return a non-PK non-FK nullible columnConstraint", function(){
			var result,
				expected = " NULL";

			result = noDbSchema.test.columnConstraint("Description", mock.foo.columns.Description, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a PK non-FK non-nullible columnConstraint", function(){
			var result,
				expected = " PRIMARY KEY ASC";

			result = noDbSchema.test.columnConstraint("fooID", mock.foo.columns.fooID, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a FK clause", function(){
			var result,
				expected = "REFERENCES bar (barID)";

			result = noDbSchema.test.foreignKeyClause("barID", mock.foo.foreignKeys);

			expect(result).toEqual(expected);
		});

		it("should return a non-PK FK nullible columnConstraint", function(){
			var result,
				expected = " REFERENCES bar (barID) NULL";

			result = noDbSchema.test.columnConstraint("barID", mock.foo.columns.barID, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column definition", function(){			
			var result,
				expected = "barID TEXT REFERENCES bar (barID) NULL";

			result = noDbSchema.test.columnDef("barID", mock.foo.columns.barID, mock.foo);

			expect(result).toEqual(expected);
		});

	});

});