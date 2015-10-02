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
(function(angular, undefined){

	function NoDataSource($injector, $q, dsConfig, scope){
		var provider = $injector.get(dsConfig.dataProvider),
			db = provider.getDatabase(dsConfig.databaseName),
			entity = db[dsConfig.entityName],
			qp = $injector.get("noQueryParser"),
			isNoView = entity.constructor.name === "NoView",
            _scope = scope
		;

        /**
        *   ### resolveFilterValues(filters)
        *   #### This is more information
		*
		*	> Note of some kind
		*
		*	|Name|Type|Description|
		*	|----|----|-----------|
		*	|Foo|Number|Does something fun.|
		*
        *   > TODO: Implement support for delayed (waitFor) filter values.
        *
        *   > NOTE: If a filter.value is an object and it has a source
        *   > property set to `scope` then use the directives scope variable. Otherwise assume source is an injectable.
        */
        function resolveFilterValues(filters, scope){
            var values = {};

            for(var f in filters){
                var filter = filters[f],
                    source, value;

                if(angular.isObject(filter.value)){
                    source = filter.value.source === "scope" ? scope : $injector.get(filter.value.source);
                    values[filter.field] = noInfoPath.getItem(source, filter.value.property);
                }else{
                    values[filter.field] = filter.value;
                }
            }

            return values;
        }

		this.create = function(data, noTrans) {
			if(isNoView) throw "create operation not support on entities of type NoView";

			return entity.noCreate(data, noTrans);
		};

		this.read = function(options) {
            function requestData(scope, config, entity, queryParser, resolve, reject){
                var params = {},
                    filterValues = resolveFilterValues(dsConfig.filter, _scope);

                if(config.filter){
                    var filters = [];
                    for(var f in config.filter){
                        var filter = config.filter[f],
                            value = angular.isObject(filter.value) ? filterValues[filter.field] : filter.value;

                        filters.push({field: filter.field, operator: filter.operator, value: value});

                    }

                    params.filter = { filters:  filters.length ? filters : undefined };
                }

                if(config.sort){
                    params.sort = config.sort;
                }

                return entity.noRead.apply(null, queryParser.parse(params))
                    .then(function(data){
                        resolve(data);
                    })
                    .catch(function(err){
                        reject(err);
                    });

            }

            return $q(function(resolve, reject){
                var waitFor, filterValues;

                if(dsConfig.waitFor){
                    waitFor = _scope.$watch(dsConfig.waitFor.property, function(newval, oldval, scope){
                        if(newval){
                            requestData(scope, dsConfig, entity, qp, resolve, reject);

                            waitFor();
                        }
                    });
                }else{
                    requestData(scope, dsConfig, entity, qp, resolve, reject);
                }

            });

		};

		this.update = function(data, noTrans) {
			if(isNoView) throw "update operation not support on entities of type NoView";

			return entity.noUpdate(options, data);
		};

		this.destroy = function(data, noTrans) {
			if(isNoView) throw "destroy operation not support on entities of type NoView";

			return entity.noUpdate(options, data);
		};

        this.one = function(options) {
            function requestData(scope, config, entity, resolve, reject){
                var params = [];

                if(dsConfig.lookup){
                    filterValues =  $injector.get(dsConfig.lookup.source, _scope);

                }else if(dsConfig.filter){
                    filterValues = resolveFilterValues(config.filter, _scope);
                }

                if(entity.constructor.name === "NoView"){
                    params[0] = filterValues;
                    params[1] = config.primaryKey;
                }else{
                    params[0]  = filterValues;
                }


                return entity.noOne.apply(null, params)
                    .then(function(data){
                        resolve(data);
                    })
                    .catch(function(err){
                        reject(err);
                    });

            }


            return $q(function(resolve, reject){
                var waitFor, filterValues;



                if(dsConfig.waitFor){
                    waitFor = _scope.$watch(dsConfig.waitFor.property, function(newval, oldval, scope){
                        if(newval){

                            requestData(scope, dsConfig, entity, resolve, reject);

                            waitFor();
                        }
                    });
                }else{
                    requestData(scope, dsConfig, entity, resolve, reject);
                }

            });

		};

	}

	angular.module("noinfopath.data")

		.service("noDataSource", ["$injector", "$q", function($injector, $q){
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
			this.create = function(dsConifg, scope){
				return new NoDataSource($injector, $q, dsConifg, scope);
			};
		}])
	;
})(angular);
