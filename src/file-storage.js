//file-storage.js
(function(){
	"use strict";

	function NoLocalFileStorageService($q) {

		/**
		*	@method toBlob(file)
		*
		*	Reads a file from a DOM File object and converts to a binary
		*	string compatible with the local, and upstream file systems.
		*/
		this.toBlob = function (file) {
			return $q(function(resolve, reject){
				var fileObj = {},
					reader = new FileReader();

				reader.onloadend = function(e){
					fileObj.name = file.name;
					fileObj.size = file.size;
					fileObj.type = file.type;
					fileObj.blob = e.target.result;

					resolve(fileObj);
				};

				reader.onerror = function(err) {
					console.error(err);
					reject(err);
				};

				reader.readAsBinaryString(file);
			});

		};

	}

	angular.module("noinfopath.data")
		.service("noLocalFileStorage", ["$q", NoLocalFileStorageService])
		;
})();
