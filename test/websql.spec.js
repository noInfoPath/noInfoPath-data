//websql.spec.js
describe("Testing websql", function(){
	var noWebSQL, noConfig, $parse;

	beforeEach(function(){
		module("noinfopath.helpers");
		module("noinfopath.filters");	
		module("noinfopath.data");

		inject(function($injector){
			// $parse = $injector.get("$parse");
			noConfig = $injector.get("noConfig");
			noWebSQL = $injector.get("noWebSQL");
		});

		
	});

	it("noWebSQL should be instanciated.", function(){
		expect(noWebSQL).toBeDefined();
	});

	it("Should make a table called foo.", function(){
		
		noWebSQL.transaction(function (tx){
			tx.executeSql('CREATE TABLE foo (id UNIQUEIDENTIFIER PRIMARY KEY, alpha text, beta text)');
		});

	});

	//CRUD
	//CREATE
	it("Should insert a record to a table.", function(){
		noWebSQL.transaction(function(tx){
			tx.executeSql('INSERT INTO foo (id, alpha, beta) VALUES (?, ?, ?)', ["5e374fde-843f-457b-a53c-b434cd267690", "THING ONE", "THING TWO"]);
		});
	});

	//READ
	it("should return all records from a table.", function(done){
		noWebSQL.transaction(function(tx){
			tx.executeSql('SELECT * FROM foo', [], testReturn);
		});

		function testReturn(transaction, results)
		{
			console.log(results);
			console.log(transaction);
			expect(results).toBeDefined();

			done();
		}
	});

	//UPDATE
	it("should update a record in a table.", function(done){
		noWebSQL.transaction(function(tx){
			tx.executeSql("UPDATE foo SET alpha = ? WHERE id = ?", ["Pie", "5e374fde-843f-457b-a53c-b434cd267690"], complete);
		});

		function complete(transaction, results)
		{
			done();
		}
	});

	//DELETE
	xit("Should Delete a record from a table.", function(){
		noWebSQL.transaction(function(tx){
			tx.executeSql('DELETE FROM foo WHERE id=?', ["5e374fde-843f-457b-a53c-b434cd267690"]);
		});
	});

});
