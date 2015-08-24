var customMatchers = {
	toBeCloseToTime: function(util, customEqualityTesters) {
		return { 
			compare: function(actual, expected) {

				var result = {};

				if(expected === undefined){
					expected = 0;
				}

				result.pass = ((this.actual == this.expected) || (this.actual == (this.expected + 1)));

				if (result.pass)
				{

					result.message = "Expected " + this.actual + "to be close to " + this.expected;
				
				}
				else
				{
					result.message = "Expected " + this.actual + "to be close to " + this.expected + ", but it was not";
				}
		
				return result;

			}
		}
	}
}



describe("Testing noDbSchema", function(){
	var $httpBackend, noDbSchema, dbJsonMock, noWebSQL,
		expected = {

		}
	;

	beforeEach(function(){
		jasmine.addMatchers(customMatchers);

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

	describe("Testing SQL conversion functions", function(){

		it("GloboTest should exist", function(){
			expect(GloboTest).toBeDefined();
			expect(GloboTest.fromSqlLiteConversionFunctions).toBeDefined();
			expect(GloboTest.toSqlLiteConversionFunctions).toBeDefined();
			expect(GloboTest.sqlConversion).toBeDefined();
		});

		describe("Testing toSqlLiteConversionFunctions conversion functions", function(){

			it("Testing TEXT with proper datatype, expecting a string", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.TEXT).toBeDefined();
				var result,
				input = "Test String",
				expected = "'Test String'";

				result = GloboTest.toSqlLiteConversionFunctions.TEXT(input);

				expect(result).toEqual(expected);
			});

			it("Testing TEXT without proper datatype, expecting a null", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.TEXT).toBeDefined();
				var result,
				input = 15.5,
				expected = null;

				result = GloboTest.toSqlLiteConversionFunctions.TEXT(input);

				expect(result).toEqual(expected);
			});

			it("Testing BLOB with proper datatype, expecting a blob", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.BLOB).toBeDefined();
				var result,
				input = "IMABLOB",
				expected = "IMABLOB";

				result = GloboTest.toSqlLiteConversionFunctions.BLOB(input);

				expect(result).toEqual(expected);
			});

			it("Testing INTEGER with proper datatype, expecting an integer", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.INTEGER).toBeDefined();
				var result,
				input = 15,
				expected = 15;

				result = GloboTest.toSqlLiteConversionFunctions.INTEGER(input);

				expect(result).toEqual(expected);
			});

			it("Testing INTEGER without proper datatype, expecting null", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.INTEGER).toBeDefined();
				var result,
				input = "hi",
				expected = null;

				result = GloboTest.toSqlLiteConversionFunctions.INTEGER(input);

				expect(result).toEqual(expected);
			});

			it("Testing NUMERIC with proper datatype, expecting a numeric", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.NUMERIC).toBeDefined();
				var result,
				input = 15.5,
				expected = 15.5;

				result = GloboTest.toSqlLiteConversionFunctions.NUMERIC(input);

				expect(result).toEqual(expected);
			});

			it("Testing NUMERIC without proper datatype, expecting null", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.NUMERIC).toBeDefined();
				var result,
				input = "hi",
				expected = null;

				result = GloboTest.toSqlLiteConversionFunctions.NUMERIC(input);

				expect(result).toEqual(expected);
			});

			it("Testing REAL with proper datatype, expecting a real", function(){
				expect(GloboTest.toSqlLiteConversionFunctions.REAL).toBeDefined();
				var result,
				input = "IMAREAL",
				expected = "IMAREAL";

				result = GloboTest.toSqlLiteConversionFunctions.REAL(input);

				expect(result).toEqual(expected);
			});

		});

		describe("Testing fromSqlLiteConversionFunctions conversion functions", function(){

			it("Testing bigint with proper datatype and value, expecting an int to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.bigint).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = GloboTest.fromSqlLiteConversionFunctions.bigint(input);

				expect(result).toEqual(expected);
				expect(typeof result).toEqual('number');
			});

			it("Testing bigint without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.bigint).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.bigint(input);

				expect(result).toEqual(expected);
			});

			it("Testing bit with proper datatype and value, expecting an int to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.bit).toBeDefined();
				var result,
				input = 1,
				expected = 1;

				result = GloboTest.fromSqlLiteConversionFunctions.bit(input);

				expect(result).toEqual(expected);
			});

			it("Testing bit without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.bit).toBeDefined();
				var result,
				input = "1",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.bit(input);

				expect(result).toEqual(expected);
			});

			it("Testing decimal with proper datatype and value, expecting a decimal to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.decimal).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = GloboTest.fromSqlLiteConversionFunctions.decimal(input);

				expect(result).toEqual(expected);
			});

			it("Testing decimal without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.decimal).toBeDefined();
				var result,
				input = "10.2",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.decimal(input);

				expect(result).toEqual(expected);
			});

			it("Testing int with proper datatype and value, expecting an int to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.int).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = GloboTest.fromSqlLiteConversionFunctions.int(input);

				expect(result).toEqual(expected);
			});

			it("Testing int without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.int).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.int(input);

				expect(result).toEqual(expected);
			});

			it("Testing money with proper datatype and value, expecting a decimal to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.money).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = GloboTest.fromSqlLiteConversionFunctions.money(input);

				expect(result).toEqual(expected);
			});

			it("Testing decimal without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.money).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.money(input);

				expect(result).toEqual(expected);
			});

			it("Testing numeric with proper datatype and value, expecting a decimal to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.numeric).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = GloboTest.fromSqlLiteConversionFunctions.numeric(input);

				expect(result).toEqual(expected);
			});

			it("Testing numeric without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.numeric).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.numeric(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallint with proper datatype and value, expecting an int to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.smallint).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = GloboTest.fromSqlLiteConversionFunctions.smallint(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallint without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.smallint).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.smallint(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallmoney with proper datatype and value, expecting a decimal to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.smallmoney).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = GloboTest.fromSqlLiteConversionFunctions.smallmoney(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallmoney without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.smallmoney).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.smallmoney(input);

				expect(result).toEqual(expected);
			});

			it("Testing tinyint with proper datatype and value, expecting an int to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.tinyint).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = GloboTest.fromSqlLiteConversionFunctions.tinyint(input);

				expect(result).toEqual(expected);
			});

			it("Testing tinyint without proper datatype and value, expecting a null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.tinyint).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.tinyint(input);

				expect(result).toEqual(expected);
			});

			it("Testing float with proper datatype and value, expecting a real to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.float).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = GloboTest.fromSqlLiteConversionFunctions.float(input);

				expect(result).toEqual(expected);
			});

			it("Testing real with proper datatype and value, expecting an real to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.real).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = GloboTest.fromSqlLiteConversionFunctions.real(input);

				expect(result).toEqual(expected);
			});

			it("Testing date with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.date).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = GloboTest.fromSqlLiteConversionFunctions.date(input);

				expect(result).toEqual(expected);
			});

			it("Testing date without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.date).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = GloboTest.fromSqlLiteConversionFunctions.date(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing datetime with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.datetime).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = GloboTest.fromSqlLiteConversionFunctions.datetime(input);

				expect(result).toEqual(expected);
			});

			it("Testing datetime without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.datetime).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = GloboTest.fromSqlLiteConversionFunctions.datetime(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing datetime2 with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.datetime2).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = GloboTest.fromSqlLiteConversionFunctions.datetime2(input);

				expect(result).toEqual(expected);
			});

			it("Testing datetime2 without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.datetime2).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = GloboTest.fromSqlLiteConversionFunctions.datetime2(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing datetimeoffset with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.datetimeoffset).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = GloboTest.fromSqlLiteConversionFunctions.datetimeoffset(input);

				expect(result).toEqual(expected);
			});

			it("Testing datetimeoffset without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.datetimeoffset).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = GloboTest.fromSqlLiteConversionFunctions.datetimeoffset(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing smalldatetime with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.smalldatetime).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = GloboTest.fromSqlLiteConversionFunctions.smalldatetime(input);

				expect(result).toEqual(expected);
			});

			it("Testing smalldatetime without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.smalldatetime).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = GloboTest.fromSqlLiteConversionFunctions.smalldatetime(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing time with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.time).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = GloboTest.fromSqlLiteConversionFunctions.time(input);

				expect(result).toEqual(expected);
			});

			it("Testing time without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.time).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = GloboTest.fromSqlLiteConversionFunctions.time(input);

				expect(result).toBeCloseToTime(expected); 
			});

			it("Testing char with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.char).toBeDefined();
				var result,
				input = "a",
				expected = "a";

				result = GloboTest.fromSqlLiteConversionFunctions.char(input);

				expect(result).toEqual(expected);
			});

			it("Testing char without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.char).toBeDefined();
				var result,
				input = 10,
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.char(input);

				expect(result).toEqual(expected);
			});

			it("Testing nchar with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.nchar).toBeDefined();
				var result,
				input = "d",
				expected = "d";

				result = GloboTest.fromSqlLiteConversionFunctions.nchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing nchar without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.nchar).toBeDefined();
				var result,
				input = 10,
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.nchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing varchar with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.varchar).toBeDefined();
				var result,
				input = "10",
				expected = "10";

				result = GloboTest.fromSqlLiteConversionFunctions.varchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing varchar without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.varchar).toBeDefined();
				var result,
				input = 10,
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.varchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing nvarchar with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.nvarchar).toBeDefined();
				var result,
				input = "foo",
				expected = "foo";

				result = GloboTest.fromSqlLiteConversionFunctions.nvarchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing nvarchar without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.nvarchar).toBeDefined();
				var result,
				input = null,
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.nvarchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing text with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.text).toBeDefined();
				var result,
				input = "hello",
				expected = "hello";

				result = GloboTest.fromSqlLiteConversionFunctions.text(input);

				expect(result).toEqual(expected);
			});

			it("Testing text without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.text).toBeDefined();
				var result,
				input = {},
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.text(input);

				expect(result).toEqual(expected);
			});

			it("Testing ntext with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.ntext).toBeDefined();
				var result,
				input = "goodbye",
				expected = "goodbye";

				result = GloboTest.fromSqlLiteConversionFunctions.ntext(input);

				expect(result).toEqual(expected);
			});

			it("Testing ntext without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.ntext).toBeDefined();
				var result,
				input = [],
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.ntext(input);

				expect(result).toEqual(expected);
			});

			it("Testing binary with proper datatype and value, expecting a blob to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.binary).toBeDefined();
				var result,
				input = "BLOB",
				expected = "BLOB";

				result = GloboTest.fromSqlLiteConversionFunctions.binary(input);

				expect(result).toEqual(expected);
			});

			it("Testing varbinary with proper datatype and value, expecting a blob to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.varbinary).toBeDefined();
				var result,
				input = "BLOB",
				expected = "BLOB";

				result = GloboTest.fromSqlLiteConversionFunctions.varbinary(input);

				expect(result).toEqual(expected);
			});

			it("Testing image with proper datatype and value, expecting a blob to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.image).toBeDefined();
				var result,
				input = "BLOB",
				expected = "BLOB";

				result = GloboTest.fromSqlLiteConversionFunctions.image(input);

				expect(result).toEqual(expected);
			});

			it("Testing uniqueidentifier with proper datatype and value, expecting a string to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.uniqueidentifier).toBeDefined();
				var result,
				input = "GUID",
				expected = "GUID";

				result = GloboTest.fromSqlLiteConversionFunctions.uniqueidentifier(input);

				expect(result).toEqual(expected);
			});

			it("Testing uniqueidentifier without proper datatype and value, expecting null to be returned", function(){
				expect(GloboTest.fromSqlLiteConversionFunctions.uniqueidentifier).toBeDefined();
				var result,
				input = 12345,
				expected = null;

				result = GloboTest.fromSqlLiteConversionFunctions.uniqueidentifier(input);

				expect(result).toEqual(expected);
			});

		});

		describe("Testing sqlConversion hash table", function(){
			it("Testing bigint conversion, expecting INTEGER", function(){
				var result,
				input = "bigint",
				expected = "INTEGER";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing bit conversion, expecting INTEGER", function(){
				var result,
				input = "bit",
				expected = "INTEGER";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing decimal conversion, expecting NUMERIC", function(){
				var result,
				input = "decimal",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing int conversion, expecting INTEGER", function(){
				var result,
				input = "int",
				expected = "INTEGER";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing money conversion, expecting NUMERIC", function(){
				var result,
				input = "money",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing numeric conversion, expecting NUMERIC", function(){
				var result,
				input = "numeric",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing smallint conversion, expecting INTEGER", function(){
				var result,
				input = "smallint",
				expected = "INTEGER";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing smallmoney conversion, expecting NUMERIC", function(){
				var result,
				input = "smallmoney",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing tinyint conversion, expecting INTEGER", function(){
				var result,
				input = "tinyint",
				expected = "INTEGER";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing float conversion, expecting REAL", function(){
				var result,
				input = "float",
				expected = "REAL";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing real conversion, expecting REAL", function(){
				var result,
				input = "real",
				expected = "REAL";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing date conversion, expecting NUMERIC", function(){
				var result,
				input = "date",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing datetime conversion, expecting NUMERIC", function(){
				var result,
				input = "datetime",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing datetime2 conversion, expecting NUMERIC", function(){
				var result,
				input = "datetime2",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing datetimeoffset conversion, expecting NUMERIC", function(){
				var result,
				input = "datetimeoffset",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing smalldatetime conversion, expecting NUMERIC", function(){
				var result,
				input = "smalldatetime",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing time conversion, expecting NUMERIC", function(){
				var result,
				input = "time",
				expected = "NUMERIC";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing char conversion, expecting TEXT", function(){
				var result,
				input = "char",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing nchar conversion, expecting TEXT", function(){
				var result,
				input = "nchar",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing varchar conversion, expecting TEXT", function(){
				var result,
				input = "varchar",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing nvarchar conversion, expecting TEXT", function(){
				var result,
				input = "nvarchar",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing text conversion, expecting TEXT", function(){
				var result,
				input = "text",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing ntext conversion, expecting TEXT", function(){
				var result,
				input = "ntext",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing binary conversion, expecting BLOB", function(){
				var result,
				input = "binary",
				expected = "BLOB";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing varbinary conversion, expecting BLOB", function(){
				var result,
				input = "varbinary",
				expected = "BLOB";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing image conversion, expecting BLOB", function(){
				var result,
				input = "image",
				expected = "BLOB";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing uniqueidentifier conversion, expecting TEXT", function(){
				var result,
				input = "uniqueidentifier",
				expected = "TEXT";

				result = GloboTest.sqlConversion[input];

				expect(result).toEqual(expected);
			});
		});

	});

	describe("Testing SQL Create Table Strings", function(){	

		it("given a sql varchar type, should convert and return a sqllite TEXT type", function(){
			var result,
				expected = "TEXT";

			result = noDbSchema.test.typeName(mock.foo.columns.Description);

			expect(result).toEqual(expected);
		});

		it("if column is nullable, should return true", function(){
			var result,
				expected = true;

			result = noDbSchema.test.isNullable(mock.foo.columns.Description);

			expect(result).toEqual(expected);
		});

		it("If column is a primary key, should return true", function(){
			var result,
				expected = true;

			result = noDbSchema.test.isPrimaryKey("fooID", mock.foo);

			expect(result).toEqual(expected);
		});

		it("If column is a foreign key, should return true", function(){
			var result,
				expected = true;

			result = noDbSchema.test.isForeignKey("barID", mock.foo);

			expect(result).toEqual(expected);
		});

		it("if column is nullable, should return a nullableClause", function(){
			var result,
				expected = " NULL";

			result = noDbSchema.test.nullableClause(mock.foo.columns.barID);

			expect(result).toEqual(expected);
		});

		it("If column is a primary key, should return a primaryKeyClause", function(){
			var result,
				expected = " PRIMARY KEY ASC";

			result = noDbSchema.test.primaryKeyClause(noDbSchema.test.isPrimaryKey("fooID", mock.foo));

			expect(result).toEqual(expected);
		});

		it("If columns is a Foreign Key, should return a FK clause", function(){
			var result,
				expected = " REFERENCES bar (barID)";

			result = noDbSchema.test.foreignKeyClause(noDbSchema.test.isForeignKey("barID", mock.foo), "barID", mock.foo.foreignKeys);

			expect(result).toEqual(expected);
		});

		it("should return a non-PK FK nullable columnConstraint", function(){
			var result,
				expected = " REFERENCES bar (barID) NULL";

			result = noDbSchema.test.columnConstraint("barID", mock.foo.columns.barID, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a PK non-FK non-nullible columnConstraint", function(){
			var result,
				expected = " PRIMARY KEY ASC";

			result = noDbSchema.test.columnConstraint("fooID", mock.foo.columns.fooID, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a non-PK non-FK nullible columnConstraint", function(){
			var result,
				expected = " NULL";

			result = noDbSchema.test.columnConstraint("Description", mock.foo.columns.Description, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column with it's type", function(){			
			var result,
				expected = "price NUMERIC";

			result = noDbSchema.test.columnDef("price", mock.foo.columns.price, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column with it's type thats nullable", function(){			
			var result,
				expected = "number INTEGER NULL";

			result = noDbSchema.test.columnDef("number", mock.foo.columns.number, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column with a foreign key constraint definition", function(){			
			var result,
				expected = "barID TEXT REFERENCES bar (barID) NULL";

			result = noDbSchema.test.columnDef("barID", mock.foo.columns.barID, mock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a series of column definition", function(){			
			var result,
				expected = "Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC";

			result = noDbSchema.test.columnConstraints(mock.foo);

			expect(result).toEqual(expected);
		});

		it("should make a create table statement", function(){
			var result,
				expected = "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC)";

			result = noDbSchema.test.createTable("foo", mock.foo);

			expect(result).toEqual(expected);
		});

	});

	describe("Testing SQL Insert Strings", function(){
		it("should make a sql insert statement from a mock", function(){
			var result,
				expected = "INSERT INTO foo (fooID,Description,barID,number,price) VALUES ('0eec54c3-1c7e-48af-a9da-d7da62820083','Test',,12,4.87);";

			result = noDbSchema.test.sqlInsert("foo", insertData);

			expect(result).toEqual(expected);
		});
	});

	describe("Testing SQL delete strings", function(){
		it("should make a sql delete statement from a mock", function(){
			var result,
				expected = "DELETE FROM foo WHERE (FooID = '0eec54c3-1c7e-48af-a9da-d7da62820083')";

			result = noDbSchema.test.sqlDelete("foo", [
					{
						"name" : "FooID",
						"logic" : null,
						"beginning": true,
						"end" : true,
						"filters" : [{
							"operator" : "eq",
							"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
							"logic" : null
						}]
					}
				]);

			expect(result).toEqual(expected);
		});
	});

	describe("Testing SQL update strings", function(){

	});
	
});