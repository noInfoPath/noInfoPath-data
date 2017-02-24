(function (angular, undefined) {
	"use strict";

	/*
	*	{
	*		"dataProvider": "noIndexedDb",
	*		"databaseName": "rmEFR2",
	*		"entityName": "ReportBidItemValues",
	*		"primaryKey": "ID"
	*	}
	*/
	function MetaDataService($injector, $q, noDataSource, _) {

		function _followMetaData(cfg, arrayOfThings, pivotMetaDataName) {
			var dprov = $injector.get(cfg.dataProvider),
				db = dprov.getDatabase(cfg.databaseName),
				promises = {},
				keys = {};

			arrayOfThings.forEach(function(thing){
				thing[pivotMetaDataName].forEach(function(metaDataItem){
					var meta = metaDataItem.MetaDataDefinitionID,
						filters;

						//Only need follow lookup columns.
						if (meta.InputType === "combobox") {
							if (!!metaDataItem.Value) {
								filters = new noInfoPath.data.NoFilters();
								filters.quickAdd(meta.ValueField, "eq", metaDataItem.Value);

								//use the current `db` for looking up the meta data.
								promises[metaDataItem.Value] = db[meta.ListSource].noOne(filters);
							}
						}
				});
			});

			return _.size(promises) > 0 ?
				$q.all(promises)
					.then(function(refData){
						arrayOfThings.forEach(function(item){
							item[pivotMetaDataName].forEach(function(metaItem){
								var valueCadidate = refData[metaItem.Value];
								metaItem.Value = valueCadidate ? valueCadidate[metaItem.MetaDataDefinitionID.TextField] : metaItem.Value;
							});
						});

						if(pivotMetaDataName) {
							return _pivotMetaData(arrayOfThings, pivotMetaDataName);
						} else {
							return arrayOfThings;
						}
					})
					.catch(function(err){
						console.error(err);
					}) :
				$q.when(arrayOfThings);

		}
		this.follow = _followMetaData;

		function _pivotMetaData(arrayOfThings, metaDataName){
			arrayOfThings.forEach(function(thing){
				thing.metadata = {};
				thing[metaDataName].forEach(function(value){
					var meta = value.MetaDataDefinitionID;

					if (angular.isObject(value.Value)) {
						value = value.Value[meta.TextField];
					} else {
						value = value.Value;
					}
					thing.metadata[meta.Name] = value;
				});

			});

			return arrayOfThings;
		}

	}

	angular.module("noinfopath.data")
		.service("noMetaData", ["$injector", "$q", "noDataSource", "lodash", MetaDataService])
		;

})(angular);
