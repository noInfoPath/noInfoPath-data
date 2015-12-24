var _, noWebSqlStatementFactory, database, $rootScope, $timeout, entity, foo, vw_foo,
	database = openDatabase(noDbConfig.dbName, noDbConfig.version, noDbConfig.description, noDbConfig.size);

database.currentUser = {
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
};


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
