//websql.spec.js
var mockTable = {
	"foo": {
		"columns": {
			"Alpha": {
				"nullable": "false",
				"type": "int",
				"length": 0
			},
			"Beta": {
				"nullable": "true",
				"type": "nvarchar",
				"length": 255
			}
		}
	}
};

describe("Testing websql", function () {
	var noWebSQL, noConfig, $parse, noDbSchema;

	beforeEach(function () {
		module("noinfopath.helpers");
		module("noinfopath.filters");
		module("noinfopath.data");
		module("noinfopath.logger");

		inject(function ($injector) {
			// $parse = $injector.get("$parse");
			$timeout = $injector.get("$timeout");
			noDbSchema = $injector.get("noDbSchema");
			noConfig = $injector.get("noConfig");
			noWebSQL = $injector.get("noWebSQL");
		});


	});

	xit("noWebSQL should be instanciated.", function () {
		expect(noWebSQL)
			.toBeDefined();
	});

	xit("should make a database when instanciated", function () {
		expect()
			.toBeDefined();
	});

	xit("should make a table", function () {

	});

	xit("Should make a series of tables.", function (done) {
		noWebSQL.whenReady(noConfig.webSQL, noDbSchema)
			.then(function () {
				expect(noHTTP.Addresses)
					.toBeDefined();
				expect(noHTTP.CoolerTrials)
					.toBeDefined();
				expect(noHTTP.Harvests)
					.toBeDefined();
				expect(noHTTP.LU_Firmness)
					.toBeDefined();
				expect(noHTTP.LU_Flavor)
					.toBeDefined();
				expect(noHTTP.Selections)
					.toBeDefined();
			})
			.catch(function (err) {
				console.log(err);
			})
			.finally(done);
	});

	//CRUD
	//CREATE
	xit("Should insert a record to a table.", function () {
		noWebSQL.transaction(function (tx) {
			tx.executeSql('INSERT INTO foo (id, alpha, beta) VALUES (?, ?, ?)', ["5e374fde-843f-457b-a53c-b434cd267690", "THING ONE", "THING TWO"]);
		});
	});

	//READ
	xit("should return all records from a table.", function (done) {
		noWebSQL.transaction(function (tx) {
			tx.executeSql('SELECT * FROM foo', [], testReturn);
		});

		function testReturn(transaction, results) {
			console.log(results);
			console.log(transaction);
			expect(results)
				.toBeDefined();

			done();
		}
	});

	//UPDATE
	xit("should update a record in a table.", function (done) {
		noWebSQL.transaction(function (tx) {
			tx.executeSql("UPDATE foo SET alpha = ? WHERE id = ?", ["Pie", "5e374fde-843f-457b-a53c-b434cd267690"], complete);
		});

		function complete(transaction, results) {
			done();
		}
	});

	//DELETE
	xit("Should Delete a record from a table.", function () {
		noWebSQL.transaction(function (tx) {
			tx.executeSql('DELETE FROM foo WHERE id=?', ["5e374fde-843f-457b-a53c-b434cd267690"]);
		});
	});

});
