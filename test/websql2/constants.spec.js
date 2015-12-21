var
	INJECTED_WEBSQL_IDENTIFIERS,
	INJECTED_WEBSQL_STATEMENT_BUILDERS,
	WEBSQL_IDENTIFIERS = {
		CREATETABLE: "CREATE TABLE IF NOT EXISTS ",
		CREATEVIEW: "CREATE VIEW IF NOT EXISTS ",
		INSERT: "INSERT INTO ",
		UPDATE: "UPDATE ",
		DELETE: "DELETE FROM ",
		READ: "SELECT * FROM ",
		COLUMNDEF: "{0}",
		PRIMARYKEY: "PRIMARY KEY ASC",
		FOREIGNKEY: "REFERENCES ",
		NULL: "NULL",
		INTEGER: "INTEGER",
		REAL: "REAL",
		TEXT: "TEXT",
		BLOB: "BLOB",
		DATE: "DATE",
		NUMERIC: "NUMERIC",
		WITHOUTROWID: "WITHOUT ROWID"
	},
	WEBSQL_STATEMENT_BUILDERS = {
		sqlConversion: {
			"bigint": WEBSQL_IDENTIFIERS.INTEGER,
			"bit": WEBSQL_IDENTIFIERS.INTEGER,
			"decimal": WEBSQL_IDENTIFIERS.NUMERIC,
			"int": WEBSQL_IDENTIFIERS.INTEGER,
			"money": WEBSQL_IDENTIFIERS.NUMERIC, // CHECK
			"numeric": WEBSQL_IDENTIFIERS.NUMERIC,
			"smallint": WEBSQL_IDENTIFIERS.INTEGER,
			"smallmoney": WEBSQL_IDENTIFIERS.NUMERIC, // CHECK
			"tinyint": WEBSQL_IDENTIFIERS.INTEGER,
			"float": WEBSQL_IDENTIFIERS.REAL,
			"real": WEBSQL_IDENTIFIERS.REAL,
			"date": WEBSQL_IDENTIFIERS.DATE, // CHECK
			"datetime": WEBSQL_IDENTIFIERS.DATE, // CHECK
			"datetime2": WEBSQL_IDENTIFIERS.DATE, // CHECK
			"datetimeoffset": WEBSQL_IDENTIFIERS.DATE, // CHECK
			"smalldatetime": WEBSQL_IDENTIFIERS.DATE, // CHECK
			"time": WEBSQL_IDENTIFIERS.DATE, // CHECK
			"char": WEBSQL_IDENTIFIERS.TEXT,
			"nchar": WEBSQL_IDENTIFIERS.TEXT,
			"varchar": WEBSQL_IDENTIFIERS.TEXT,
			"nvarchar": WEBSQL_IDENTIFIERS.TEXT,
			"text": WEBSQL_IDENTIFIERS.TEXT,
			"ntext": WEBSQL_IDENTIFIERS.TEXT,
			"binary": WEBSQL_IDENTIFIERS.BLOB, // CHECK
			"varbinary": WEBSQL_IDENTIFIERS.BLOB,
			"image": WEBSQL_IDENTIFIERS.BLOB,
			"uniqueidentifier": WEBSQL_IDENTIFIERS.TEXT
		},
		toSqlLiteConversionFunctions: {
			"TEXT": function(s) {
				return angular.isString(s) ? s : null;
			},
			"BLOB": function(b) {
				return b;
			},
			"INTEGER": function(i) {
				if (typeof i === "boolean") // typeof null is object, thanks javascript!
					return i ? 1 : 0; // converts true to 1 and false to 0
				else
					return angular.isNumber(i) ? i : null;
			},
			"NUMERIC": function(n) {
				var c = n === null ? null : Number(n);
				return c;
			},
			"REAL": function(r) {
				return r;
			},
			"DATE": function(d) {
				var r = null;
				if (angular.isString(d)) {
					r = noInfoPath.toDbDate(new Date(d));
				}

				return r;
			}
		},
		fromSqlLiteConversionFunctions: {
			"bigint": function(i) {
				return angular.isNumber(i) ? i : null;
			},
			"bit": function(i) {
				return angular.isNumber(i) ? i : null;
			},
			"decimal": function(n) {
				return angular.isNumber(n) ? n : null;
			},
			"int": function(i) {
				return angular.isNumber(i) ? i : null;
			},
			"money": function(n) {
				return angular.isNumber(n) ? n : null;
			},
			"numeric": function(n) {
				return angular.isNumber(n) ? n : null;
			},
			"smallint": function(i) {
				return angular.isNumber(i) ? i : null;
			},
			"smallmoney": function(n) {
				return angular.isNumber(n) ? n : null;
			},
			"tinyint": function(i) {
				return angular.isNumber(i) ? i : null;
			},
			"float": function(r) {
				return r;
			},
			"real": function(r) {
				return r;
			},
			"date": function(n) {
				return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
			},
			"datetime": function(n) {
				return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
			},
			"datetime2": function(n) {
				return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
			},
			"datetimeoffset": function(n) {
				return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
			},
			"smalldatetime": function(n) {
				return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
			},
			"time": function(n) {
				return angular.isDate(n) ? Date.UTC(n.getFullYear(), n.getMonth(), n.getDay(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds()) : Date.now();
			},
			"char": function(t) {
				return angular.isString(t) ? t : null;
			},
			"nchar": function(t) {
				return angular.isString(t) ? t : null;
			},
			"varchar": function(t) {
				return angular.isString(t) ? t : null;
			},
			"nvarchar": function(t) {
				return angular.isString(t) ? t : null;
			},
			"text": function(t) {
				return angular.isString(t) ? t : null;
			},
			"ntext": function(t) {
				return angular.isString(t) ? t : null;
			},
			"binary": function(b) {
				return b;
			},
			"varbinary": function(b) {
				return b;
			},
			"image": function(b) {
				return b;
			},
			"uniqueidentifier": function(t) {
				return angular.isString(t) ? t : null;
			}
		},
		"createTable": function(tableName, tableConfig) {
			var rs = WEBSQL_IDENTIFIERS.CREATETABLE;

			rs += tableName + " (" + WEBSQL_STATEMENT_BUILDERS.columnConstraints(tableConfig) + ")";

			return rs;
		},
		"createView": function(viewName, viewConfig) {
			var rs = viewConfig.entitySQL.replace("CREATE VIEW ", WEBSQL_IDENTIFIERS.CREATEVIEW);

			return rs;
		},
		"columnDef": function(columnName, columnConfig, tableConfig) {
			return columnName + " " + WEBSQL_STATEMENT_BUILDERS.typeName(columnConfig) + WEBSQL_STATEMENT_BUILDERS.columnConstraint(columnName, columnConfig, tableConfig);
		},
		"columnConstraint": function(columnName, columnConfig, tableConfig) {
			var isPrimaryKey = WEBSQL_STATEMENT_BUILDERS.isPrimaryKey(columnName, tableConfig),
				isForeignKey = WEBSQL_STATEMENT_BUILDERS.isForeignKey(columnName, tableConfig),
				isNullable = WEBSQL_STATEMENT_BUILDERS.isNullable(columnConfig),
				returnString = "";

			returnString += WEBSQL_STATEMENT_BUILDERS.primaryKeyClause(isPrimaryKey && (!isForeignKey && !isNullable)); // A PK cannot be a FK or nullable.
			returnString += WEBSQL_STATEMENT_BUILDERS.foreignKeyClause((isForeignKey && !isPrimaryKey), columnName, tableConfig.foreignKeys); // A FK cannot be a PK
			returnString += WEBSQL_STATEMENT_BUILDERS.nullableClause(isNullable && !isPrimaryKey); // A nullable field cannot be a PK

			return returnString;
		},
		"typeName": function(columnConfig) {
			return WEBSQL_STATEMENT_BUILDERS.sqlConversion[columnConfig.type];
		},
		"expr": function(Expr) {
			console.warn("TODO: Determine why this function exists.");
			return "";
		},
		"foreignKeyClause": function(isForeignKey, columnName, foreignKeys) {
			var rs = "";
			if (isForeignKey) {
				rs = " " + WEBSQL_IDENTIFIERS.FOREIGNKEY + foreignKeys[columnName].table + " (" + foreignKeys[columnName].column + ")";
			}
			return rs;
		},
		"primaryKeyClause": function(isPrimaryKey) {
			var rs = "";
			if (isPrimaryKey) {
				rs = " " + WEBSQL_IDENTIFIERS.PRIMARYKEY;
			}
			return rs;
		},
		"nullableClause": function(isNullable) {
			var rs = "";
			if (isNullable) {
				rs = " " + WEBSQL_IDENTIFIERS.NULL;
			}
			return rs;
		},
		"columnConstraints": function(tableConfig) {
			var colConst = [];
			angular.forEach(tableConfig.columns, function(value, key) {
				colConst.push(WEBSQL_STATEMENT_BUILDERS.columnDef(key, value, tableConfig));
			}, this);
			return colConst.join(",");
		},
		"isPrimaryKey": function(columnName, tableConfig) {
			var temp = false;

			for (var x in tableConfig.primaryKey) {
				if (columnName === tableConfig.primaryKey[x]) {
					temp = true;
					break;
				}
			}
			return temp;
		},
		"isForeignKey": function(columnName, tableConfig) {
			return !!tableConfig.foreignKeys[columnName];
		},
		"isNullable": function(columnConfig) {
			return columnConfig.nullable;
		},
		"sqlInsert": function(tableName, data) {
			var columnString = "",
				placeholdersString = "",
				returnObject = {},
				val = {};

			val = WEBSQL_STATEMENT_BUILDERS.parseData(data);

			columnString = val.columns.join(",");
			placeholdersString = val.placeholders.join(",");

			returnObject.queryString = WEBSQL_IDENTIFIERS.INSERT + tableName + " (" + columnString + ") VALUES (" + placeholdersString + ");";
			returnObject.valueArray = val.values;

			return returnObject;
		},
		"sqlUpdate": function(tableName, data, filters) {
			var val = {},
				nvps = [],
				nvpsString = "",
				returnObject = {};

			val = WEBSQL_STATEMENT_BUILDERS.parseData(data);

			nvps = WEBSQL_STATEMENT_BUILDERS.sqlUpdateNameValuePair(val);

			nvpsString = nvps.join(", ");

			returnObject.queryString = WEBSQL_IDENTIFIERS.UPDATE + tableName + " SET " + nvpsString + " WHERE " + filters.toSQL();
			returnObject.valueArray = val.values;

			return returnObject;
		},
		"sqlUpdateNameValuePair": function(values) {
			var nvps = [];

			angular.forEach(values.columns, function(col, key) {
				nvps.push(col + " = ?");
			});

			return nvps;
		},
		"sqlDelete": function(tableName, filters) {
			var returnObject = {},
				where = filters && filters.length ? " WHERE " + filters.toSQL() : "";
			returnObject.queryString = WEBSQL_IDENTIFIERS.DELETE + tableName + where;
			return returnObject;
		},
		"sqlRead": function(tableName, filters, sort, page) {
			var fs, ss, ps, returnObject = {};
			fs = !!filters ? " WHERE " + filters.toSQL() : "";
			ss = !!sort ? " " + sort.toSQL() : "";
			ps = !!page ? " " + page.toSQL() : "";
			returnObject.queryString = WEBSQL_IDENTIFIERS.READ + tableName + fs + ss + ps;
			return returnObject;
		},
		"sqlOne": function(tableName, primKey, value) {
			var returnObject = {};
			console.warn("TODO: Need to detect if the value is a string or number");

			returnObject.queryString = WEBSQL_IDENTIFIERS.READ + tableName + " WHERE " + primKey + " = '" + value + "'";
			return returnObject;
		},
		"parseData": function(data) {
			var values = [],
				placeholders = [],
				columns = [],
				r = {};
			angular.forEach(data, function(value, key) {
				columns.push(key);
				placeholders.push("?");
				values.push(value);
			});

			r.values = values;
			r.placeholders = placeholders;
			r.columns = columns;

			return r;
		}
	};

describe("Tesing WebSQL constants", function() {
	beforeEach(function() {
		module("noinfopath.data");

		inject(function($injector) {
			INJECTED_WEBSQL_IDENTIFIERS = $injector.get("WEBSQL_IDENTIFIERS");
			INJECTED_WEBSQL_STATEMENT_BUILDERS = $injector.get("WEBSQL_STATEMENT_BUILDERS");
		});

	});

	describe("Injected version of WEBSQL_IDENTIFIERS should match test version.", function() {
		it("should have been injected", function() {
			expect(INJECTED_WEBSQL_IDENTIFIERS);
		});

		function createTest(property, expected) {
			describe("Testing property " + property, function() {
				it("should exist in injected version" + property, function() {
					var actual = INJECTED_WEBSQL_IDENTIFIERS[property];

					expect(actual);
				});

				it("expected value should match the injected version", function() {
					var actual = INJECTED_WEBSQL_IDENTIFIERS[property];
					expect(actual).toBe(expected);
				});
			});
		}

		for (var wi in WEBSQL_IDENTIFIERS) {
			var expected_WEBSQL_IDENTIFIER = WEBSQL_IDENTIFIERS[wi];

			createTest(wi, expected_WEBSQL_IDENTIFIER);

		}
	});

	describe("Injected version of WEBSQL_STATEMENT_BUILDERS should match test version", function() {
		it("should have been injected", function() {
			expect(INJECTED_WEBSQL_STATEMENT_BUILDERS);
		});

		describe("testing WEBSQL_STATEMENT_BUILDERS.sqlConversion property", function() {
			it("should exist", function() {
				expect(WEBSQL_STATEMENT_BUILDERS.sqlConversion);
			});

			describe("test each expected property against the injected version", function() {
				function createTest(property, expected) {
					describe("Testing property " + property, function() {
						it("should exist in injected version" + property, function() {
							var actual = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlConversion[property];

							expect(actual);
						});

						it("expected value should match the injected version", function() {
							var actual = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlConversion[property];
							expect(actual).toBe(expected);
						});
					});
				}

				for (var wi in WEBSQL_STATEMENT_BUILDERS.sqlConversion) {
					var expected = WEBSQL_STATEMENT_BUILDERS.sqlConversion[wi];

					createTest(wi, expected);

				}
			});
		});

		describe("Testing WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions conversion functions", function() {
			describe("all expected function should exist.", function() {
				function createTest(fi, fn) {
					it("should have a " + fi + " function", function() {
						var fn = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions[fi];
						expect(fn);
					});
				}

				for (var fi in WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions) {
					createTest(fi);
				}

			});

			describe("Test the injected version of each method returns the correct results", function() {

				it("Testing TEXT with proper datatype, expecting a string", function() {
					var result,
						input = "Test String",
						expected = "Test String";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.TEXT(input);

					expect(result).toEqual(expected);
				});

				it("Testing TEXT without proper datatype, expecting a null", function() {
					var result,
						input = 15.5,
						expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.TEXT(input);

					expect(result).toEqual(expected);
				});

				it("Testing BLOB with proper datatype, expecting a blob", function() {
					console.warn("This might not be a valid test");
					var result,
						input = "IMABLOB",
						expected = "IMABLOB";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.BLOB(input);

					expect(result).toEqual(expected);
				});

				it("Testing INTEGER with proper datatype, expecting an integer", function() {
					var result,
						input = 15,
						expected = 15;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.INTEGER(input);

					expect(result).toEqual(expected);
				});

				it("Testing INTEGER without proper datatype, expecting null", function() {
					var result,
						input = "hi",
						expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.INTEGER(input);

					expect(result).toEqual(expected);
				});

				it("Testing NUMERIC with proper datatype, expecting a numeric", function() {
					var result,
						input = 15.5,
						expected = 15.5;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.NUMERIC(input);

					expect(result).toEqual(expected);
				});

				it("Testing NUMERIC without proper datatype, expecting 0", function() {
					expect(INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.NUMERIC).toBeDefined();
					var result,
						input = "hi",
						expected = NaN;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.NUMERIC(input);

					expect(result).toEqual(expected);
				});

				it("Testing REAL with proper datatype, expecting a real", function() {
					var result,
						input = 1.0,
						expected = 1.0;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.toSqlLiteConversionFunctions.REAL(input);

					expect(result).toEqual(expected);
				});
			});

		});

		describe("Testing WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions conversion functions", function() {
			describe("all expected function should exist.", function() {
				function createTest(fi, fn) {
					it("should have a " + fi + " function", function() {
						var fn = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions[fi];
						expect(fn);
					});
				}

				for (var fi in WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions) {
					createTest(fi);
				}

			});

			describe("Test the injected version of each method returns the correct results", function() {
				it("Testing bigint with proper datatype and value, expecting an int to be returned", function(){
					var result,
					input = 10,
					expected = 10;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.bigint(input);

					expect(result).toEqual(expected);
					expect(typeof result).toEqual('number');
				});

				it("Testing bigint without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.bigint(input);

					expect(result).toEqual(expected);
				});

				it("Testing bit with proper datatype and value, expecting an int to be returned", function(){
					var result,
					input = 1,
					expected = 1;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.bit(input);

					expect(result).toEqual(expected);
				});

				it("Testing bit without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "1",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.bit(input);

					expect(result).toEqual(expected);
				});

				it("Testing decimal with proper datatype and value, expecting a decimal to be returned", function(){
					var result,
					input = 10.2,
					expected = 10.2;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.decimal(input);

					expect(result).toEqual(expected);
				});

				it("Testing decimal without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10.2",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.decimal(input);

					expect(result).toEqual(expected);
				});

				it("Testing int with proper datatype and value, expecting an int to be returned", function(){
					var result,
					input = 10,
					expected = 10;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.int(input);

					expect(result).toEqual(expected);
				});

				it("Testing int without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.int(input);

					expect(result).toEqual(expected);
				});

				it("Testing money with proper datatype and value, expecting a decimal to be returned", function(){
					var result,
					input = 10.2,
					expected = 10.2;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.money(input);

					expect(result).toEqual(expected);
				});

				it("Testing decimal without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.money(input);

					expect(result).toEqual(expected);
				});

				it("Testing numeric with proper datatype and value, expecting a decimal to be returned", function(){
					var result,
					input = 10.2,
					expected = 10.2;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.numeric(input);

					expect(result).toEqual(expected);
				});

				it("Testing numeric without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.numeric(input);

					expect(result).toEqual(expected);
				});

				it("Testing smallint with proper datatype and value, expecting an int to be returned", function(){
					var result,
					input = 10,
					expected = 10;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.smallint(input);

					expect(result).toEqual(expected);
				});

				it("Testing smallint without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.smallint(input);

					expect(result).toEqual(expected);
				});

				it("Testing smallmoney with proper datatype and value, expecting a decimal to be returned", function(){
					var result,
					input = 10.2,
					expected = 10.2;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.smallmoney(input);

					expect(result).toEqual(expected);
				});

				it("Testing smallmoney without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.smallmoney(input);

					expect(result).toEqual(expected);
				});

				it("Testing tinyint with proper datatype and value, expecting an int to be returned", function(){
					var result,
					input = 10,
					expected = 10;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.tinyint(input);

					expect(result).toEqual(expected);
				});

				it("Testing tinyint without proper datatype and value, expecting a null to be returned", function(){
					var result,
					input = "10",
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.tinyint(input);

					expect(result).toEqual(expected);
				});

				it("Testing float with proper datatype and value, expecting a real to be returned", function(){
					var result,
					input = 10,
					expected = 10;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.float(input);

					expect(result).toEqual(expected);
				});

				it("Testing real with proper datatype and value, expecting an real to be returned", function(){
					var result,
					input = 10,
					expected = 10;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.real(input);

					expect(result).toEqual(expected);
				});

				it("Testing date with proper datatype and value, expecting a UTC date to be returned", function(){
					var result,
					input = new Date(2015, 08, 18, 10, 30, 50, 100),
					expected = 1441449050100;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.date(input);

					expect(result).toEqual(expected);
				});

				xit("Testing date without proper datatype and value, expecting a new UTC date to be returned", function(){
					var result,
					input = "10",
					expected = Date.now();

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.date(input);

					expect(result).toBeCloseToTime(expected);
				});

				it("Testing datetime with proper datatype and value, expecting a UTC date to be returned", function(){
					var result,
					input = new Date(2015, 08, 18, 10, 30, 50, 100),
					expected = 1441449050100;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.datetime(input);

					expect(result).toEqual(expected);
				});

				xit("Testing datetime without proper datatype and value, expecting a new UTC date to be returned", function(){
					var result,
					input = "10",
					expected = Date.now();

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.datetime(input);

					expect(result).toBeCloseToTime(expected);
				});

				it("Testing datetime2 with proper datatype and value, expecting a UTC date to be returned", function(){
					var result,
					input = new Date(2015, 08, 18, 10, 30, 50, 100),
					expected = 1441449050100;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.datetime2(input);

					expect(result).toEqual(expected);
				});

				xit("Testing datetime2 without proper datatype and value, expecting a new UTC date to be returned", function(){
					var result,
					input = "10",
					expected = Date.now();

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.datetime2(input);

					expect(result).toBeCloseToTime(expected);
				});

				it("Testing datetimeoffset with proper datatype and value, expecting a UTC date to be returned", function(){
					var result,
					input = new Date(2015, 08, 18, 10, 30, 50, 100),
					expected = 1441449050100;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.datetimeoffset(input);

					expect(result).toEqual(expected);
				});

				xit("Testing datetimeoffset without proper datatype and value, expecting a new UTC date to be returned", function(){
					var result,
					input = "10",
					expected = Date.now();

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.datetimeoffset(input);

					expect(result).toBeCloseToTime(expected);
				});

				it("Testing smalldatetime with proper datatype and value, expecting a UTC date to be returned", function(){
					var result,
					input = new Date(2015, 08, 18, 10, 30, 50, 100),
					expected = 1441449050100;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.smalldatetime(input);

					expect(result).toEqual(expected);
				});

				xit("Testing smalldatetime without proper datatype and value, expecting a new UTC date to be returned", function(){
					var result,
					input = "10",
					expected = Date.now();

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.smalldatetime(input);

					expect(result).toBeCloseToTime(expected);
				});

				it("Testing time with proper datatype and value, expecting a UTC date to be returned", function(){
					var result,
					input = new Date(2015, 08, 18, 10, 30, 50, 100),
					expected = 1441449050100;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.time(input);

					expect(result).toEqual(expected);
				});

				xit("Testing time without proper datatype and value, expecting a new UTC date to be returned", function(){
					var result,
					input = "10",
					expected = Date.now();

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.time(input);

					expect(result).toBeCloseToTime(expected);
				});

				it("Testing char with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "a",
					expected = "a";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.char(input);

					expect(result).toEqual(expected);
				});

				it("Testing char without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = 10,
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.char(input);

					expect(result).toEqual(expected);
				});

				it("Testing nchar with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "d",
					expected = "d";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.nchar(input);

					expect(result).toEqual(expected);
				});

				it("Testing nchar without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = 10,
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.nchar(input);

					expect(result).toEqual(expected);
				});

				it("Testing varchar with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "10",
					expected = "10";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.varchar(input);

					expect(result).toEqual(expected);
				});

				it("Testing varchar without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = 10,
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.varchar(input);

					expect(result).toEqual(expected);
				});

				it("Testing nvarchar with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "foo",
					expected = "foo";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.nvarchar(input);

					expect(result).toEqual(expected);
				});

				it("Testing nvarchar without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = null,
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.nvarchar(input);

					expect(result).toEqual(expected);
				});

				it("Testing text with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "hello",
					expected = "hello";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.text(input);

					expect(result).toEqual(expected);
				});

				it("Testing text without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = {},
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.text(input);

					expect(result).toEqual(expected);
				});

				it("Testing ntext with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "goodbye",
					expected = "goodbye";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.ntext(input);

					expect(result).toEqual(expected);
				});

				it("Testing ntext without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = [],
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.ntext(input);

					expect(result).toEqual(expected);
				});

				it("Testing binary with proper datatype and value, expecting a blob to be returned", function(){
					var result,
					input = "BLOB",
					expected = "BLOB";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.binary(input);

					expect(result).toEqual(expected);
				});

				it("Testing varbinary with proper datatype and value, expecting a blob to be returned", function(){
					var result,
					input = "BLOB",
					expected = "BLOB";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.varbinary(input);

					expect(result).toEqual(expected);
				});

				it("Testing image with proper datatype and value, expecting a blob to be returned", function(){
					var result,
					input = "BLOB",
					expected = "BLOB";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.image(input);

					expect(result).toEqual(expected);
				});

				it("Testing uniqueidentifier with proper datatype and value, expecting a string to be returned", function(){
					var result,
					input = "GUID",
					expected = "GUID";

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.uniqueidentifier(input);

					expect(result).toEqual(expected);
				});

				it("Testing uniqueidentifier without proper datatype and value, expecting null to be returned", function(){
					var result,
					input = 12345,
					expected = null;

					result = INJECTED_WEBSQL_STATEMENT_BUILDERS.fromSqlLiteConversionFunctions.uniqueidentifier(input);

					expect(result).toEqual(expected);
				});
			});

		});

	});

	describe("Testing Statement Creatation Functions", function(){
		describe("Testing SQL Insert Strings", function(){
			it("should make a sql insert object from a noDbSchemaMock", function(){
				var result,
					expected = {
						"queryString" : "INSERT INTO foo (fooID,Description,barID,number,price) VALUES (?,?,?,?,?);",
						"valueArray" : ['0eec54c3-1c7e-48af-a9da-d7da62820083','Test',null,12,4.87]
					};

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlInsert("foo", insertData);

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

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlDelete("foo", noFilters);

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

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlUpdate("foo", updateData, noFilters);

				expect(result).toEqual(expected);
			});
		});

		describe("testing SQL Read strings", function(){
			it("should create a sql select statement to read one record based on the PK", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo WHERE FooID = '0eec54c3-1c7e-48af-a9da-d7da62820083'"
					};

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlOne("foo", "FooID", "0eec54c3-1c7e-48af-a9da-d7da62820083");

				expect(result).toEqual(expected);
			});

			it("should create a sql select statement to read all records from a table", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo"
					};

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlRead("foo");

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

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlRead("foo", noFilters);

				expect(result).toEqual(expected);
			});

			it("should create a sql select statement to read all records from a table with a NoSort", function(){
				var result,
					expected = {
						"queryString" :"SELECT * FROM foo ORDER BY FooID desc",
					},
					noSort = new noInfoPath.data.NoSort();

					noSort.add("FooID", "desc");

				result = INJECTED_WEBSQL_STATEMENT_BUILDERS.sqlRead("foo", null, noSort);

				expect(result).toEqual(expected);
			});

		});

	});

});
