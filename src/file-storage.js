//file-storage.js
(function () {
	"use strict";


	function NoLocalFileStorageService($q, noDataSource) {

		/**
		 *	@method cache(file)
		 *
		 *	Saves a file to the noDataSource defined in the config object.
		 *
		 *	> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.
		 *
		 */
		this.cache = function saveToCache(fileObj) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID",
				"noTransaction": {
					"create": true,
					"update": true,
					"destroy": true
				}
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.create(fileObj);
		};

		/**
		 *	@method removeFromCache(file)
		 *
		 *	Deletes a file by FileID from the NoInfoPath_FileUploadCache.
		 */
		this.removeFromCache = function (fileID) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID",
				"noTransaction": {
					"create": true,
					"update": true,
					"destroy": true
				}
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.destory(dsCfg);
		};

		/**
		 *	@method read(file)
		 *
		 *	Reads a file from a DOM File object and converts to a binary
		 *	string compatible with the local, and upstream file systems.
		 */
		this.read = function (file, comp) {
			return $q(function (resolve, reject) {
				var fileObj = {},
					reader = new FileReader();

				reader.onloadend = function (e) {
					fileObj.name = file.name;
					fileObj.size = file.size;
					fileObj.type = file.type;
					fileObj.blob = e.target.result;

					resolve(fileObj);
				};

				reader.onerror = function (err) {
					console.error(err);
					reject(err);
				};

				reader[comp.readMethod || "readAsBinaryString"](file);
			});

		};

	}

	angular.module("noinfopath.data")
		.service("noLocalFileStorage", ["$q", "noDataSource", NoLocalFileStorageService]);
})();
