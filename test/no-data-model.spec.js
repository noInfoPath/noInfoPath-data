describe("Testing NoDataModel", function () {
	var model = new MockFormController(project);
		actual = new noInfoPath.data.NoDataModel(projectSchema, model);

	beforeEach(function(){
		jasmine.addMatchers({
			toDeepEqual: function (util, customEqualityTesters) {
				return {
					compare: function (actual, expected) {
						var result = {pass: true};

						for(var k in actual) {
							var a = actual[k],
								e = expected[k];

							if(a !== e) {
								result.pass = false;
								break;
							}
						}

						return result;
					},
					negativeCompare: function(actual, expected) {
						var result = {pass: true}, c, t;

						for(var k in actual) {
							var a = actual[k],
								e = expected[k];

							t++;

							if(a === e) {
								c++;
								break;
							}
						}

						result.pass = c !== t;

						return result;
					}
				};
			}
		});
	});

	it("should exist on the noInfoPath.data global object.", function(){
		expect(noInfoPath.data.NoDataModel);
	});

	it("test fixtures should have been loaded", function(){
		expect(projectPristine);
		expect(projectDirty);
		expect(projectSchema);
	});

	it("test mocks should have been loaded", function() {
		expect(MockControlController);
		expect(MockFormController);
	});

	describe("test creation of a new NoDataModel", function(){

		it("should create a new NoDataModel", function () {


			expect(actual.__type).toBe("NoDataModel");
		});

		it("should expose all NoDataModel properties and methods.", function(){
			expect(actual.hasOwnProperty("pristine"));
			expect(actual.hasOwnProperty("current"));
			expect(actual.undo);
			expect(actual.commit);
		});

		it("should have all project fixture properties", function () {
			for(var p in projectPristine) {
				var prop = actual[p];
				expect(prop);
			}

		});
	});

	describe("test properties and methods", function(){


		it("get::pristine should return an object that matches the fixture", function(){
			expect(actual.pristine).toDeepEqual(projectPristine);
		});

		it("set::pristine should thow an exception.", function(){
			try {
				actual.pristine = projectDirty;
				fail();
			} catch(err) {}

		});

		it("get::current untouched should match get::pristine", function(){
			expect(actual.current).toDeepEqual(actual.pristine);
		});

		it("set::current should update the properties in the assigned object.", function(){
			actual.current = projectDeltas;
			expect(actual.current).toDeepEqual(projectDirty);
		});

		it("get::current values should not be equal to get::pristine values.", function(){
			expect(actual.current).not.toDeepEqual(actual.pristine);
		});

		it("get::undo() should set::current values back to get::pristine values", function(){
			actual.undo();
			expect(actual.current).not.toDeepEqual(actual.pristine);
		});

		it("commit() should set::pristine values to get::current values", function(){
			actual.current = projectDeltas;
			actual.commit();
			expect(actual.pristine).toDeepEqual(actual.current);
		});

		it("properties should remain as controller objects.", function(){
			Object.keys(project).forEach(function (k) {
				if (k.indexOf("$") === -1) {
					expect(typeof(actual[k])).toBe("object");
				}
			});

		});
	});

});
