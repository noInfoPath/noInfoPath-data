//data-source.js
/*
*	## noDataSource Service
*
*	Provides a generic service that  NoInfoPath data providers and returns
*	a NoResultSet object loaded with the request data filtered, sorted and paged.
*
*	"noDataSource": {
*        "dataProvider": "noWebSQL",
*        "databaseName": "FCFNv2",
*        "entityName": "LU_PercentColor",
*        "primaryKey": "PercentColorID",
*        "queryParser": "noQueryParser",
*        "sort":  [{"field": "Percentage", "dir": "asc"}]
*    }
*/
(function(angular, undefined){

	function NoDataSource($injector, noConfig, dsConfigKey){
		var config = noConfig.current[dsConfigKey],
			provider = $injector.get(config.dataProvider),
			db = provider[config.entityName],
			entity = db[config.entityName],
			qp = $injector.get(config.queryParser)
			;

		this.create = function(data, noTrans) {
			return entity.noCreate(data, noTrans);
		};
		this.read = function(options, data) {
			return entity.noRead(options);
		};
		this.update = function(data, noTrans) {
			return entity.noUpdate(options, data);
		};
		this.destroy = function (data, noTrans) {
			return entity.noDestory(options, data);
		};

	}
	angular.module("noinfopath-data")

		.service("noDataSource", [function(){
			/*
			*	#### create(dsConfigKey)
			*
			*	create a new instance of a NoDataSource object configured
			*	based on the datasource configuration found in noConfig
			*	at the given `dsConfigKey` location.
			*/
			this.create = function(dsConfigKey){
				return new NoDataSource($injector, noConfig, dsConfigKey);
			};
		}])
	;
})(angular);
