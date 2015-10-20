describe("Testing noWebSQLParser", function(){
	var $httpBackend, noWebSQLParser, dbJsonMock, noWebSQL
	;

	beforeEach(function(){
		module("noinfopath.data");
		module("noinfopath.logger");
		//module("noinfopath.data.mocks");
		inject(function($injector){
			$httpBackend = $injector.get("$httpBackend");
			noWebSQLParser = $injector.get("noWebSQLParser");
	       	//dbJsonMock = $injector.get("dbJsonMock");
		});
	});

	describe("Testing SQL conversion functions", function(){

		it("_interface should exist", function(){
			expect(noWebSQLParser._interface).toBeDefined();
			expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions).toBeDefined();
			expect(noWebSQLParser._interface.toSqlLiteConversionFunctions).toBeDefined();
			expect(noWebSQLParser._interface.sqlConversion).toBeDefined();
		});

		describe("Testing toSqlLiteConversionFunctions conversion functions", function(){

			it("Testing TEXT with proper datatype, expecting a string", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.TEXT).toBeDefined();
				var result,
				input = "Test String",
				expected = "Test String";

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.TEXT(input);

				expect(result).toEqual(expected);
			});

			it("Testing TEXT without proper datatype, expecting a null", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.TEXT).toBeDefined();
				var result,
				input = 15.5,
				expected = null;

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.TEXT(input);

				expect(result).toEqual(expected);
			});

			it("Testing BLOB with proper datatype, expecting a blob", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.BLOB).toBeDefined();
				var result,
				input = "IMABLOB",
				expected = "IMABLOB";

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.BLOB(input);

				expect(result).toEqual(expected);
			});

			it("Testing INTEGER with proper datatype, expecting an integer", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.INTEGER).toBeDefined();
				var result,
				input = 15,
				expected = 15;

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.INTEGER(input);

				expect(result).toEqual(expected);
			});

			it("Testing INTEGER without proper datatype, expecting 0", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.INTEGER).toBeDefined();
				var result,
				input = "hi",
				expected = 0;

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.INTEGER(input);

				expect(result).toEqual(expected);
			});

			it("Testing NUMERIC with proper datatype, expecting a numeric", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.NUMERIC).toBeDefined();
				var result,
				input = 15.5,
				expected = 15.5;

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.NUMERIC(input);

				expect(result).toEqual(expected);
			});

			it("Testing NUMERIC without proper datatype, expecting 0", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.NUMERIC).toBeDefined();
				var result,
				input = "hi",
				expected = NaN;

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.NUMERIC(input);

				expect(result).toEqual(expected);
			});

			it("Testing REAL with proper datatype, expecting a real", function(){
				expect(noWebSQLParser._interface.toSqlLiteConversionFunctions.REAL).toBeDefined();
				var result,
				input = "IMAREAL",
				expected = "IMAREAL";

				result = noWebSQLParser._interface.toSqlLiteConversionFunctions.REAL(input);

				expect(result).toEqual(expected);
			});

		});

		describe("Testing fromSqlLiteConversionFunctions conversion functions", function(){

			it("Testing bigint with proper datatype and value, expecting an int to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.bigint).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.bigint(input);

				expect(result).toEqual(expected);
				expect(typeof result).toEqual('number');
			});

			it("Testing bigint without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.bigint).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.bigint(input);

				expect(result).toEqual(expected);
			});

			it("Testing bit with proper datatype and value, expecting an int to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.bit).toBeDefined();
				var result,
				input = 1,
				expected = 1;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.bit(input);

				expect(result).toEqual(expected);
			});

			it("Testing bit without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.bit).toBeDefined();
				var result,
				input = "1",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.bit(input);

				expect(result).toEqual(expected);
			});

			it("Testing decimal with proper datatype and value, expecting a decimal to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.decimal).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.decimal(input);

				expect(result).toEqual(expected);
			});

			it("Testing decimal without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.decimal).toBeDefined();
				var result,
				input = "10.2",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.decimal(input);

				expect(result).toEqual(expected);
			});

			it("Testing int with proper datatype and value, expecting an int to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.int).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.int(input);

				expect(result).toEqual(expected);
			});

			it("Testing int without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.int).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.int(input);

				expect(result).toEqual(expected);
			});

			it("Testing money with proper datatype and value, expecting a decimal to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.money).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.money(input);

				expect(result).toEqual(expected);
			});

			it("Testing decimal without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.money).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.money(input);

				expect(result).toEqual(expected);
			});

			it("Testing numeric with proper datatype and value, expecting a decimal to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.numeric).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.numeric(input);

				expect(result).toEqual(expected);
			});

			it("Testing numeric without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.numeric).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.numeric(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallint with proper datatype and value, expecting an int to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallint).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallint(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallint without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallint).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallint(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallmoney with proper datatype and value, expecting a decimal to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallmoney).toBeDefined();
				var result,
				input = 10.2,
				expected = 10.2;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallmoney(input);

				expect(result).toEqual(expected);
			});

			it("Testing smallmoney without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallmoney).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.smallmoney(input);

				expect(result).toEqual(expected);
			});

			it("Testing tinyint with proper datatype and value, expecting an int to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.tinyint).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.tinyint(input);

				expect(result).toEqual(expected);
			});

			it("Testing tinyint without proper datatype and value, expecting a null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.tinyint).toBeDefined();
				var result,
				input = "10",
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.tinyint(input);

				expect(result).toEqual(expected);
			});

			it("Testing float with proper datatype and value, expecting a real to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.float).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.float(input);

				expect(result).toEqual(expected);
			});

			it("Testing real with proper datatype and value, expecting an real to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.real).toBeDefined();
				var result,
				input = 10,
				expected = 10;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.real(input);

				expect(result).toEqual(expected);
			});

			it("Testing date with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.date).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.date(input);

				expect(result).toEqual(expected);
			});

			xit("Testing date without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.date).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.date(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing datetime with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime(input);

				expect(result).toEqual(expected);
			});

			xit("Testing datetime without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing datetime2 with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime2).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime2(input);

				expect(result).toEqual(expected);
			});

			xit("Testing datetime2 without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime2).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetime2(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing datetimeoffset with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetimeoffset).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetimeoffset(input);

				expect(result).toEqual(expected);
			});

			xit("Testing datetimeoffset without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetimeoffset).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.datetimeoffset(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing smalldatetime with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.smalldatetime).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.smalldatetime(input);

				expect(result).toEqual(expected);
			});

			xit("Testing smalldatetime without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.smalldatetime).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.smalldatetime(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing time with proper datatype and value, expecting a UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.time).toBeDefined();
				var result,
				input = new Date(2015, 08, 18, 10, 30, 50, 100),
				expected = 1441449050100;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.time(input);

				expect(result).toEqual(expected);
			});

			xit("Testing time without proper datatype and value, expecting a new UTC date to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.time).toBeDefined();
				var result,
				input = "10",
				expected = Date.now();

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.time(input);

				expect(result).toBeCloseToTime(expected);
			});

			it("Testing char with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.char).toBeDefined();
				var result,
				input = "a",
				expected = "a";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.char(input);

				expect(result).toEqual(expected);
			});

			it("Testing char without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.char).toBeDefined();
				var result,
				input = 10,
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.char(input);

				expect(result).toEqual(expected);
			});

			it("Testing nchar with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.nchar).toBeDefined();
				var result,
				input = "d",
				expected = "d";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.nchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing nchar without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.nchar).toBeDefined();
				var result,
				input = 10,
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.nchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing varchar with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.varchar).toBeDefined();
				var result,
				input = "10",
				expected = "10";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.varchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing varchar without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.varchar).toBeDefined();
				var result,
				input = 10,
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.varchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing nvarchar with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.nvarchar).toBeDefined();
				var result,
				input = "foo",
				expected = "foo";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.nvarchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing nvarchar without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.nvarchar).toBeDefined();
				var result,
				input = null,
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.nvarchar(input);

				expect(result).toEqual(expected);
			});

			it("Testing text with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.text).toBeDefined();
				var result,
				input = "hello",
				expected = "hello";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.text(input);

				expect(result).toEqual(expected);
			});

			it("Testing text without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.text).toBeDefined();
				var result,
				input = {},
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.text(input);

				expect(result).toEqual(expected);
			});

			it("Testing ntext with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.ntext).toBeDefined();
				var result,
				input = "goodbye",
				expected = "goodbye";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.ntext(input);

				expect(result).toEqual(expected);
			});

			it("Testing ntext without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.ntext).toBeDefined();
				var result,
				input = [],
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.ntext(input);

				expect(result).toEqual(expected);
			});

			it("Testing binary with proper datatype and value, expecting a blob to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.binary).toBeDefined();
				var result,
				input = "BLOB",
				expected = "BLOB";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.binary(input);

				expect(result).toEqual(expected);
			});

			it("Testing varbinary with proper datatype and value, expecting a blob to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.varbinary).toBeDefined();
				var result,
				input = "BLOB",
				expected = "BLOB";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.varbinary(input);

				expect(result).toEqual(expected);
			});

			it("Testing image with proper datatype and value, expecting a blob to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.image).toBeDefined();
				var result,
				input = "BLOB",
				expected = "BLOB";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.image(input);

				expect(result).toEqual(expected);
			});

			it("Testing uniqueidentifier with proper datatype and value, expecting a string to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.uniqueidentifier).toBeDefined();
				var result,
				input = "GUID",
				expected = "GUID";

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.uniqueidentifier(input);

				expect(result).toEqual(expected);
			});

			it("Testing uniqueidentifier without proper datatype and value, expecting null to be returned", function(){
				expect(noWebSQLParser._interface.fromSqlLiteConversionFunctions.uniqueidentifier).toBeDefined();
				var result,
				input = 12345,
				expected = null;

				result = noWebSQLParser._interface.fromSqlLiteConversionFunctions.uniqueidentifier(input);

				expect(result).toEqual(expected);
			});

		});

		describe("Testing sqlConversion hash table", function(){
			it("Testing bigint conversion, expecting INTEGER", function(){
				var result,
				input = "bigint",
				expected = "INTEGER";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing bit conversion, expecting INTEGER", function(){
				var result,
				input = "bit",
				expected = "INTEGER";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing decimal conversion, expecting NUMERIC", function(){
				var result,
				input = "decimal",
				expected = "NUMERIC";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing int conversion, expecting INTEGER", function(){
				var result,
				input = "int",
				expected = "INTEGER";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing money conversion, expecting NUMERIC", function(){
				var result,
				input = "money",
				expected = "NUMERIC";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing numeric conversion, expecting NUMERIC", function(){
				var result,
				input = "numeric",
				expected = "NUMERIC";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing smallint conversion, expecting INTEGER", function(){
				var result,
				input = "smallint",
				expected = "INTEGER";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing smallmoney conversion, expecting NUMERIC", function(){
				var result,
				input = "smallmoney",
				expected = "NUMERIC";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing tinyint conversion, expecting INTEGER", function(){
				var result,
				input = "tinyint",
				expected = "INTEGER";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing float conversion, expecting REAL", function(){
				var result,
				input = "float",
				expected = "REAL";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing real conversion, expecting REAL", function(){
				var result,
				input = "real",
				expected = "REAL";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing date conversion, expecting DATE", function(){
				var result,
				input = "date",
				expected = "DATE";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing datetime conversion, expecting DATE", function(){
				var result,
				input = "datetime",
				expected = "DATE";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing datetime2 conversion, expecting DATE", function(){
				var result,
				input = "datetime2",
				expected = "DATE";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing datetimeoffset conversion, expecting DATE", function(){
				var result,
				input = "datetimeoffset",
				expected = "DATE";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing smalldatetime conversion, expecting DATE", function(){
				var result,
				input = "smalldatetime",
				expected = "DATE";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing time conversion, expecting DATE", function(){
				var result,
				input = "time",
				expected = "DATE";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing char conversion, expecting TEXT", function(){
				var result,
				input = "char",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing nchar conversion, expecting TEXT", function(){
				var result,
				input = "nchar",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing varchar conversion, expecting TEXT", function(){
				var result,
				input = "varchar",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing nvarchar conversion, expecting TEXT", function(){
				var result,
				input = "nvarchar",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing text conversion, expecting TEXT", function(){
				var result,
				input = "text",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing ntext conversion, expecting TEXT", function(){
				var result,
				input = "ntext",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing binary conversion, expecting BLOB", function(){
				var result,
				input = "binary",
				expected = "BLOB";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing varbinary conversion, expecting BLOB", function(){
				var result,
				input = "varbinary",
				expected = "BLOB";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing image conversion, expecting BLOB", function(){
				var result,
				input = "image",
				expected = "BLOB";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});

			it("Testing uniqueidentifier conversion, expecting TEXT", function(){
				var result,
				input = "uniqueidentifier",
				expected = "TEXT";

				result = noWebSQLParser._interface.sqlConversion[input];

				expect(result).toEqual(expected);
			});
		});

	});

	describe("Testing SQL Create Table Strings", function(){

		it("given a sql varchar type, should convert and return a sqllite TEXT type", function(){
			var result,
				expected = "TEXT";

			result = noWebSQLParser._interface.typeName(noDbSchemaMock.foo.columns.Description);

			expect(result).toEqual(expected);
		});

		it("if column is nullable, should return true", function(){
			var result,
				expected = true;

			result = noWebSQLParser._interface.isNullable(noDbSchemaMock.foo.columns.Description);

			expect(result).toEqual(expected);
		});

		it("If column is a primary key, should return true", function(){
			var result,
				expected = true;

			result = noWebSQLParser._interface.isPrimaryKey("fooID", noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("If column is a foreign key, should return true", function(){
			var result,
				expected = true;

			result = noWebSQLParser._interface.isForeignKey("barID", noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("if column is nullable, should return a nullableClause", function(){
			var result,
				expected = " NULL";

			result = noWebSQLParser._interface.nullableClause(noDbSchemaMock.foo.columns.barID);

			expect(result).toEqual(expected);
		});

		it("If column is a primary key, should return a primaryKeyClause", function(){
			var result,
				expected = " PRIMARY KEY ASC";

			result = noWebSQLParser._interface.primaryKeyClause(noWebSQLParser._interface.isPrimaryKey("fooID", noDbSchemaMock.foo));

			expect(result).toEqual(expected);
		});

		it("If columns is a Foreign Key, should return a FK clause", function(){
			var result,
				expected = " REFERENCES bar (barID)";

			result = noWebSQLParser._interface.foreignKeyClause(noWebSQLParser._interface.isForeignKey("barID", noDbSchemaMock.foo), "barID", noDbSchemaMock.foo.foreignKeys);

			expect(result).toEqual(expected);
		});

		it("should return a non-PK FK nullable columnConstraint", function(){
			var result,
				expected = " REFERENCES bar (barID) NULL";

			result = noWebSQLParser._interface.columnConstraint("barID", noDbSchemaMock.foo.columns.barID, noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a PK non-FK non-nullible columnConstraint", function(){
			var result,
				expected = " PRIMARY KEY ASC";

			result = noWebSQLParser._interface.columnConstraint("fooID", noDbSchemaMock.foo.columns.fooID, noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a non-PK non-FK nullible columnConstraint", function(){
			var result,
				expected = " NULL";

			result = noWebSQLParser._interface.columnConstraint("Description", noDbSchemaMock.foo.columns.Description, noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column with it's type", function(){
			var result,
				expected = "price NUMERIC";

			result = noWebSQLParser._interface.columnDef("price", noDbSchemaMock.foo.columns.price, noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column with it's type thats nullable", function(){
			var result,
				expected = "number INTEGER NULL";

			result = noWebSQLParser._interface.columnDef("number", noDbSchemaMock.foo.columns.number, noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a column with a foreign key constraint definition", function(){
			var result,
				expected = "barID TEXT REFERENCES bar (barID) NULL";

			result = noWebSQLParser._interface.columnDef("barID", noDbSchemaMock.foo.columns.barID, noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should return a series of column definition", function(){
			var result,
				expected = "Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC";

			result = noWebSQLParser._interface.columnConstraints(noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

		it("should make a create table statement", function(){
			var result,
				expected = "CREATE TABLE IF NOT EXISTS foo (Description TEXT NULL,fooID TEXT PRIMARY KEY ASC,barID TEXT REFERENCES bar (barID) NULL,number INTEGER NULL,price NUMERIC)";

			result = noWebSQLParser._interface.createTable("foo", noDbSchemaMock.foo);

			expect(result).toEqual(expected);
		});

	});

	describe("Testing SQL Insert Strings", function(){
		it("should make a sql insert object from a noDbSchemaMock", function(){
			var result,
				expected = {
					"queryString" : "INSERT INTO foo (fooID,Description,barID,number,price) VALUES (?,?,?,?,?);",
					"valueArray" : ['0eec54c3-1c7e-48af-a9da-d7da62820083','Test',null,12,4.87]
				};

			result = noWebSQLParser._interface.sqlInsert("foo", insertData);

			expect(result).toEqual(expected);
		});
	});

	describe("Testing SQL delete strings", function(){
		it("should make a sql delete statement with a filter from a mock", function(){
			var result,
				expected = {
					"queryString" : "DELETE FROM foo WHERE (FooID = '0eec54c3-1c7e-48af-a9da-d7da62820083')"
				},
				noFilters = new noInfoPath.data.NoFilters();

			noFilters.add("FooID",null,true,true,
					[{
						"operator" : "eq",
						"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
						"logic" : null
					}]
				);

			result = noWebSQLParser._interface.sqlDelete("foo", noFilters);

			expect(result).toEqual(expected);
		});
	});

	describe("Testing SQL update strings", function(){
		it("should make a sql update statement from a mock", function(){
			var result,
				expected = {
					"queryString" : "UPDATE foo SET Description = ?, barID = ?, number = ?, price = ? WHERE (FooID = '0eec54c3-1c7e-48af-a9da-d7da62820083')",
					"valueArray" : ['noTest','128f28ca-e926-4259-d202-b754fe5b11c7',42,19.95]
				},
				noFilters = new noInfoPath.data.NoFilters();

			noFilters.add("FooID",null,true,true,
					[{
						"operator" : "eq",
						"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
						"logic" : null
					}]
				);

			result = noWebSQLParser._interface.sqlUpdate("foo", updateData, noFilters);

			expect(result).toEqual(expected);
		});
	});

	describe("testing SQL Read strings", function(){
		it("should create a sql select statement to read one record based on the PK", function(){
			var result,
				expected = {
					"queryString" :"SELECT * FROM foo WHERE FooID = '0eec54c3-1c7e-48af-a9da-d7da62820083'"
				};

			result = noWebSQLParser._interface.sqlOne("foo", "FooID", "0eec54c3-1c7e-48af-a9da-d7da62820083");

			expect(result).toEqual(expected);
		});

		it("should create a sql select statement to read all records from a table", function(){
			var result,
				expected = {
					"queryString" :"SELECT * FROM foo"
				};

			result = noWebSQLParser._interface.sqlRead("foo");

			expect(result).toEqual(expected);
		});

		it("should create a sql select statement to read all records from a table with a NoFilter", function(){
			var result,
				expected = {
					"queryString" :"SELECT * FROM foo WHERE (FooID = '0eec54c3-1c7e-48af-a9da-d7da62820083')"
				},
				noFilters = new noInfoPath.data.NoFilters();

				noFilters.add("FooID",null,true,true,
					[{
						"operator" : "eq",
						"value" : "0eec54c3-1c7e-48af-a9da-d7da62820083",
						"logic" : null
					}]
				);

			result = noWebSQLParser._interface.sqlRead("foo", noFilters);

			expect(result).toEqual(expected);
		});

		it("should create a sql select statement to read all records from a table with a NoSort", function(){
			var result,
				expected = {
					"queryString" :"SELECT * FROM foo ORDER BY FooID desc",
				},
				noSort = new noInfoPath.data.NoSort();

				noSort.add("FooID", "desc");

			result = noWebSQLParser._interface.sqlRead("foo", null, noSort);

			expect(result).toEqual(expected);
		});

	});

});
