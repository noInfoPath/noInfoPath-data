describe("Testing date formatter", function () {
	var $filter, listOfTimes = [
		new Date("1/1/2015 08:00"),
		new Date("1/1/2015 11:00"),
		new Date("1/1/2015 14:00"),
		new Date("1/1/2015 17:00"),
		new Date("1/1/2015 20:00"),
		new Date("1/1/2015 23:00")
	],
		reducedListOfTimes = [];
	//console.log(listOfTimes);

	beforeEach(function () {
		module("ngLodash");
		module("noinfopath.data");
		module("noinfopath.data.mocks");

		inject(function ($injector) {
			$filter = $injector.get("$filter");
		});
	});



	it("should work", function () {
		var NOW = new Date("1/1/15 18:01"),
			d;

		console.log(NOW);
		do {
			d = listOfTimes.shift();
			test = d >= NOW;
			if(d) {
				console.log($filter("date")(d, "MM/dd/yyyy hh:mm") + " >= " + $filter("date")(NOW, "MM/dd/yyyy hh:mm") + " = " + test);
			}

		} while (d);
	});

	describe("Testing date conversion functions", function(){
		describe("toDbDate", function() {
			it("should convert a valid date object to dbDate", function(){
				var input = new Date("12/31/2017"),
					output = noInfoPath.toDbDate(input),
					expected = "2017-12-31T05:00:00.000";


				expect(output).toBe(expected);
			});

			it("should return null when passed a none date string.", function(){
				var input = "",
					output = noInfoPath.toDbDate(input),
					expected = null;

				console.log(output);
				expect(output).toBe(expected);
			});

			it("should return null when passed a none date string.", function(){
				var input = "asasdasd",
					output = noInfoPath.toDbDate(input),
					expected = null;

				console.log(output);
				expect(output).toBe(expected);
			});

			it("should return null when passed null.", function(){
				var input = null,
					output = noInfoPath.toDbDate(input),
					expected = null;

				console.log(output);
				expect(output).toBe(expected);
			});

			it("should return null when passed undefined.", function(){
				var input = undefined,
					output = noInfoPath.toDbDate(input),
					expected = null;

				console.log(output);
				expect(output).toBe(expected);
			});

			it("should return null when passed UTC time value.", function(){
				var input = 1514696400000,
					output = noInfoPath.toDbDate(input),
					expected = "2017-12-31T05:00:00.000";

				console.log(output);
				expect(output).toBe(expected);
			});
		})
	});

});
