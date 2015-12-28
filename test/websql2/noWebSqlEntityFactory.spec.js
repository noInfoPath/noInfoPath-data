var _, noWebSqlStatementFactory, database, $rootScope, $timeout, entity, foo, vw_foo,
	database = openDatabase(noDbConfig.dbName, noDbConfig.version, noDbConfig.description, noDbConfig.size);

database.currentUser = currentUser;

describe("Tesing noWebSqlEntityFactory", function() {
	beforeEach(function() {

		module("noinfopath.data");
		module("ngLodash");

		inject(function($injector) {
			noWebSqlEntityFactory = $injector.get("noWebSqlEntityFactory");
			$rootScope = $injector.get("$rootScope");
			_ = $injector.get("lodash");
			$timeout = $injector.get("$timeout");
		});


	});

	it("should exist", function() {
		expect(noWebSqlEntityFactory);
	});

	it("create method should exist", function() {
		expect(noWebSqlEntityFactory.create);
	});

	function dropEntity(type, tableName, database)
	{
		database.transaction(function(tx) {
			tx.executeSql(
				"DROP " + type + " IF EXISTS " + tableName,
				[],
				function(t, resultset){
					console.log("entity dropped");
				},
				function(t, err){
					console.error(err);
				}
			);
		});
	}

	function countEntityRows(expected, tableName, database, done)
	{
		database.transaction(function(tx) {
			tx.executeSql(
				"SELECT count() as count FROM " + tableName,
				[],
				function(t, resultset){
					expect(resultset.rows[0].count).toBe(expected);
					done();
				},
				function(t, err){
					console.error(err);
					done();
				}
			);
		});
	}


	dropEntity("TABLE", "foo", database);
	dropEntity("VIEW", "vw_foo", database);

	function testEntityExistence(entityType, sqlExpressionData, database, done) {
		database.transaction(function(tx) {
			tx.executeSql(
				sqlExpressionData.queryString,
				sqlExpressionData.valueArray,
				function(t, resultset) {
					expect(resultset);
					expect(resultset.rows.length).toBe(1);
					if(resultset.rows.length){
						expect(resultset.rows[0].type).toBe(entityType);
					}

					done();
				},
				function(t, r, x) {
					console.error(t, r, x);
					done();
				}
			);
		});
	}

	function testRowExistence(sqlExpressionData, database, done){
		database.transaction(function(tx) {
			tx.executeSql(
				sqlExpressionData.queryString,
				sqlExpressionData.valueArray,
				function(t, resultset) {
					expect(resultset);
					expect(resultset.rows.length).toBe(1);
					if(resultset.rows.length){
						expect(resultset.rows[0].type).toBe(entityType);
					}

					done();
				},
				function(t, r, x) {
					console.error(t, r, x);
					done();
				}
			);
		});
	}

	function objectsToBeEquivalant(a, b){
		var equal = true;

		for(var k in b){
			var vA = a[k],
				vB = b[k];

			if(!vA || vA !== vB)
			{
				equal = false;
				break;
			}

		}

		return equal;
	}

	describe("testing table creation", function(){
		it("create should return a NoWebSqlEntity object", function(){
			foo = noWebSqlEntityFactory.create(noDbSchemaMock.foo, "foo", database);

			expect(foo);

			expect(foo.constructor.prototype.constructor.name).toBe("NoWebSqlEntity");
		});

		it("ensure table got create on the WebSql database.", function(done){

			foo.configure()
				.then(function(){
					var sqlExpressionData = {
						queryString: "select name, type from sqlite_master where name = ?",
						valueArray: ["foo"]
					};

					testEntityExistence("table", sqlExpressionData, database, done);
				})
				.catch(function(err){
					console.error(err);
					done();
				});

		});
	});


	describe("testing view creation", function(){
		it("create  should return a NoWebSqlEntity object", function(){
			vw_foo = noWebSqlEntityFactory.create(noDbSchemaMock.vw_foo, "vw_foo", database);

			expect(vw_foo);

			expect(vw_foo.constructor.prototype.constructor.name).toBe("NoWebSqlEntity");
		});

		it("testing view creation", function(done){

			vw_foo.configure()
				.then(function(){
					var sqlExpressionData = {
						queryString: "select name, type from sqlite_master where name = ?",
						valueArray: ["vw_foo"]
					};

					testEntityExistence("view", sqlExpressionData, database, done);
				})
				.catch(function(err){
					console.error(err);
					done();
				});

		});
	});

	describe("Testing NoWebSqlEntity", function(){
		describe("testing table foo's data access API (without noTransaction)", function(){

			it("should have already created the foo table in previous tests.", function(){
				expect(foo);
			});

			describe("testing noCreate method", function(){
				it("method should exist on entity", function(){
					expect(foo.noCreate);
				});

				it("should add a new record and return it.", function(done){

					foo.noCreate(sampleCreateData)
						.then(function(data){
							expect(data).toEqual(sampleCreateData);
							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

			});

			describe("testing noRead method", function(){
				it("method should exist on entity", function(){
					expect(foo.noRead);
				});

				it("simple read w/o filter, sort or page", function(done){

					foo.noRead()
						.then(function(data){
							var tmp1 = _.toArray(data),
								tmp2 = _.toArray([sampleCreateData]);

							expect(tmp1).toEqual(tmp2);
							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

				it("TODO: create tests that probe the more complex use cases.");


			});

			describe("testing noUpdate method", function(){
				it("method should exist on entity", function(){
					expect(foo.noUpdate);
				});

				it("should update an existing record and return it.", function(done){

					foo.noUpdate(sampleUpdateData)
						.then(function(data){
							expect(data).toEqual(sampleUpdateData);
							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

			});

			describe("testing noDestroy method", function(){
				it("method should exist on entity", function(){
					expect(foo.noDestroy);
				});

				it("should delete an existing record and return it.", function(done){

					foo.noDestroy(sampleUpdateData)
						.then(function(data){
							expect(data.fooID).toBe(sampleUpdateData.fooID);

							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

				it("Test that the record was actually deleted.", function(done){
					countEntityRows(0, "foo", database, done);
				});

			});

			describe("testing noUpsert method", function(){
				it("method should exist on entity", function(){
					expect(foo.noUpsert);
				});

				it("should add a new record and return it when primary key is missing.", function(done){

					foo.noUpsert(sampleUpsertData1)
						.then(function(data){
							sampleUpsertData1.fooID = data.fooID;
							expect(data).toEqual(sampleUpsertData1);
							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

				it("should update existing record and return it when primary key is present.", function(done){
					foo.noCreate(sampleUpsertData2)
						.then(function(){
							foo.noUpsert(sampleUpsertData2)
								.then(function(data){

									expect(data).toEqual(sampleUpsertData2);
									done();
								})
								.catch(function(err){
									//console.error(err);
									expect(err).not.toBeDefined();
									done();
								});
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});

				});
			});

			describe("testing noOne method", function(){
				it("method should exist on entity", function(){
					expect(foo.noOne);
				});

				it("should get a single existing record based on `rowid`", function(done){

					foo.noOne(2)
						.then(function(data){
							expect(objectsToBeEquivalant(data, sampleUpsertData2)).toBeTruthy();

							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

				it("should get a single existing record based on primary key guid", function(done){

					foo.noOne("0eec54c3-1c7e-48af-a9da-d7da62820090")
						.then(function(data){
							expect(objectsToBeEquivalant(data, sampleUpsertData2)).toBeTruthy();

							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

				it("should get a single existing record based on a simple key/value object", function(done){

					foo.noOne({key: "fooID", value: "0eec54c3-1c7e-48af-a9da-d7da62820090"})
						.then(function(data){
							expect(objectsToBeEquivalant(data, sampleUpsertData2)).toBeTruthy();

							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

			});

			describe("testing noClear method", function(){
				it("method noClear should be on entity", function(){
					expect(foo.noClear);
				});

				it("should delete all records from given entity", function(done){

					foo.noClear()
						.then(function(){
							foo.noRead()
								.then(function(data){
									expect(data.length).toBe(0);
									done();
								})
								.catch(function(err){
									expect(err).not.toBeDefined();
									done();
								});


						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

			});

			describe("testing noBulkCreate method", function(){
				it("method noBulkCreate should be on entity", function(){
					expect(foo.noBulkCreate);
				});

				it("should create a single, converted record to websql", function(done){

					foo.noBulkCreate(bulkLoadData[0])
						.then(function(data){
							//countEntityRows(bulkLoadData.length, "foo", database, done);
							expect(data.insertId);
							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});
			});

			describe("testing bulkLoad method", function(){
				it("method bulkLoad should be on entity", function(){
					expect(foo.bulkLoad);
				});

				it("should create multiple converted record into the database", function(done){
					var progress = {};
					foo.bulkLoad(bulkLoadData, progress)
						.then(function(data){
							//console.log(progress);
							//$timeout.flush();
							countEntityRows(bulkLoadData.length, "foo", database, done);
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						})
						.finally(angular.noop, function(){
							console.log(arguments);
						});


				});
			});

		});

		describe("testing view vw_foo's data access API (without noTransaction)", function(){
			it("should have already created the vw_foo view in previous tests.", function(){
				expect(vw_foo);
			});

			describe("testing noRead method", function(){
				it("method should exist on entity", function(){
					expect(vw_foo.noRead);
				});

				it("simple read w/o filter, sort or page", function(done){

					vw_foo.noRead()
						.then(function(data){
							var tmp1 = _.toArray(data);

							expect(tmp1.length).toBe(2);
							done();
						})
						.catch(function(err){
							//console.error(err);
							expect(err).not.toBeDefined();
							done();
						});
				});

				it("TODO: create tests that probe the more complex use cases.");


			});


		});

	});
});
