(function(angular, undefined){
	angular.module('noinfopath.data.const',[])
		.constant('NODB_CONSTANTS', {
			DBNAME: "NoInfoPath",
			DATA_READY: "NoInfoPath::dataReady",
			DATA_CHANGED: "NoInfoPath::dataChanged",
			DB_READY: "NoInfoPath::dbReady",
			SYNC_COMPLETE: "NoInfoPath::dbSyncComplete",
			COLLECTION: {        
				"NODBUPGRADES": "nodbupgrades"
			}
		})
})(angular);