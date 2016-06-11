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
});
