//data-source.js
/*
 *	## noDataSource Service
 *
 *	Provides a generic service that exposes the NoInfoPath data providers'
 *	underlying CRUD interface.
 *
 *	```json
 *
 *	"noDataSource": {
 *        "dataProvider": "noWebSQL",
 *        "databaseName": "FCFNv2",
 *        "entityName": "LU_PercentColor",
 *        "primaryKey": "PercentColorID",
 *        "queryParser": "noQueryParser",
 *        "sort":  [{"field": "Percentage", "dir": "asc"}]
 *    }
 *
 *	```
 */
(function (angular, undefined) {

	function NoDataSource($injector, $q, noDynamicFilters, dsConfig, scope, noCalculatedFields) {
		var provider = $injector.get(dsConfig.dataProvider),
			db = provider.getDatabase(dsConfig.databaseName),
			entity = db[dsConfig.entityName],
			qp = $injector.get("noQueryParser"),
			isNoView = entity.constructor.name === "NoView",
			_scope = scope;

		Object.defineProperties(this, {
			"entity": {
				"get": function () {
					return entity;
				}
			}
		});


		this.create = function (data, noTrans) {
			if(isNoView) throw "create operation not supported on entities of type NoView";

			return entity.noCreate(data, noTrans);

		};

		this.read = function (options) {
			function requestData(scope, config, entity, queryParser, resolve, reject) {
				var params = angular.merge({}, options);

				params.filter = noDynamicFilters.configure(config, scope);

				if(config.sort) {
					params.sort = config.sort;
				}

				if(config.take) {
					params.take = config.take;
					params.skip = config.skip;
				}

				return entity.noRead.apply(entity, queryParser.parse(params))
					.then(function (data) {

						data = noCalculatedFields.calculate(config, data);

						resolve(data);
					})
					.catch(function (err) {
						reject(err);
					});

			}


			return $q(function (resolve, reject) {
				var waitFor, filterValues;

				if(dsConfig.waitFor) {
					waitFor = _scope.$watch(dsConfig.waitFor.property, function (newval, oldval, scope) {
						if(newval) {
							requestData(scope, dsConfig, entity, qp, resolve, reject);

							waitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, entity, qp, resolve, reject);
				}

			});

		};

		this.update = function (data, noTrans) {
			if(isNoView) throw "update operation not supported on entities of type NoView";

			return entity.noUpdate(data, noTrans);
		};

		this.destroy = function (data, noTrans, filters) {
			if(isNoView) throw "destroy operation not supported on entities of type NoView";

			return entity.noDestroy(data, noTrans, filters);
		};

		this.one = function (id) {
			function requestData(scope, config, entity, resolve, reject) {
				var params = [];

				if(id) {
					filterValues = {};
					filterValues[config.primaryKey] = id;
				} else if(dsConfig.lookup) {
					filterValues = $injector.get(dsConfig.lookup.source, _scope);

				} else if(dsConfig.filter) {
					filterValues = new noInfoPath.data.NoFilters(noDynamicFilters.configure(config, _scope));
				}

				if(entity.constructor.name === "NoView") {
					params[0] = filterValues;
					params[1] = config.primaryKey;
				} else {
					params[0] = filterValues;
				}

				return entity.noOne.apply(entity, params)
					.then(function (data) {
						resolve(data);
					})
					.catch(function (err) {
						reject(err);
					});

			}


			return $q(function (resolve, reject) {
				var endWaitFor, filterValues;
				/*
				 *	@property noDataSource.waitFor
				 *
				 *	Use this property when you want the data source wait for some other
				 *	NoInfoPath component to update the `scope`.
				 */
				if(dsConfig.waitFor) {
					endWaitFor = _scope.$watch(dsConfig.waitFor.property, function (newval, oldval, scope) {
						if(newval) {

							requestData(scope, dsConfig, entity, resolve, reject);

							endWaitFor();
						}
					});
				} else {
					requestData(scope, dsConfig, entity, resolve, reject);
				}

			});

		};

	}

	angular.module("noinfopath.data")

	.service("noDataSource", ["$injector", "$q", "noDynamicFilters", "noCalculatedFields", function ($injector, $q, noDynamicFilters, noCalculatedFields) {
		/*
		 *	#### create(dsConfigKey)
		 *
		 *	create a new instance of a NoDataSource object configured
		 *	based on the datasource configuration found in noConfig
		 *	at the given `dsConfigKey` location.
		 *
		 *	##### Parameters
		 *
		 *	|Name|Type|Description|
		 *	|----|----|-----------|
		 *	|dsConfigKey|String|The location in noConfig where the data source's configuration can be found.  Can be a complex name like the following.  `noForms.myForm1.noComponents.foo.noDataSource`|
		 *
		 *	##### Returns
		 *
		 *	An instance of a NoDataSource object.
		 *
		 */
		this.create = function (dsConfig, scope) {
			return new NoDataSource($injector, $q, noDynamicFilters, dsConfig, scope, noCalculatedFields);
		};
	}]);


})(angular);
