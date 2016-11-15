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
		 *	@method cache(file)
		 *
		 *	Saves a file to the noDataSource defined in the config object.
		 *
		 *	> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.
		 *
		 */
		this.get = function loadFromCache(fileID) {
			var dsCfg = {
				"dataProvider": "noIndexedDb",
				"databaseName": "NoInfoPath_dtc_v1",
				"entityName": "NoInfoPath_FileUploadCache",
				"primaryKey": "FileID"
			};

			var ds = noDataSource.create(dsCfg, {});

			return ds.one(fileID);
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
			var deferred = $q.defer();

			var fileObj = {},
				reader = new FileReader();

			reader.onloadstart = function(e) {
				fileObj.name = file.name;
				fileObj.size = file.size;
				fileObj.type = file.type;
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};


			reader.onload = function (e) {
				fileObj.blob = e.target.result;

				deferred.resolve(fileObj);
			};

			reader.onerror = function (err) {
				deferred.reject(err);
			};

			reader.onprogress = function (e) {
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader[comp.readMethod || "readAsBinaryString"](file);
			//reader.readAsArrayBuffer(file);

			return deferred.promise;
		};

	}

	angular.module("noinfopath.data")
		.service("noLocalFileStorage", ["$q", "noDataSource", NoLocalFileStorageService]);
})();
