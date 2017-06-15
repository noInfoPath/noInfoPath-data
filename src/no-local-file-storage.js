// no-local-file-storage.js
/*
 *	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
 *
 *	___
 *
 *	[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.75*
 *
 *	[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
 *
 *	Copyright (c) 2017 The NoInfoPath Group, LLC.
 *
 *	Licensed under the MIT License. (MIT)
 *
 *	___
 *
 *	noLocalFileSystem
 *	-----------------
 *
 */
(function (angular, storageInfo, requestFileSystem, undefined) {
	function NoLocalFileSystemService($q, $http, noLocalStorage, noHTTP, noMimeTypes, noConfig) {

		var requestedBytes, fileSystem, root;

		/**
		 *	@method read(file)
		 *
		 *	Reads a file from a DOM File object and converts to a binary
		 *	string compatible with the local, and upstream file systems.
		 */
		function _readFileObject(file) {
			var deferred = $q.defer();

			var fileObj = {},
				reader = new FileReader();

			reader.onloadstart = function (e) {
				fileObj.name = file.name;
				fileObj.size = file.size;
				fileObj.type = file.type;
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader.onload = function (e) {
				//fileObj.blob = e.target.result;
				deferred.resolve(e.target.result);
			};

			reader.onerror = function (err) {
				deferred.reject(err);
			};

			reader.onprogress = function (e) {
				fileObj.loaded = (e.loaded / file.size) * 100;
				deferred.notify(e);
			};

			reader.readAsBinaryString(file);

			return deferred.promise;
		}
		this.getBinaryString = _readFileObject;

		function _requestStorageQuota() {
			if(!noLocalStorage.getItem("noLocalFileSystemQuota"))
			{
				requestedBytes = noConfig.current.localFileSystem.quota;

				return $q(function (resolve, reject) {
					storageInfo.requestQuota(
						requestedBytes,
						function (grantedBytes) {
							console.log('Requested ', requestedBytes, 'bytes, were granted ', grantedBytes, 'bytes');
							noLocalStorage.setItem("noLocalFileSystemQuota", grantedBytes);
							resolve(grantedBytes);
						},
						function (e) {
							console.log('Error', e);
							reject(e);
						}
					);
				});
			}



		}
		this.requestStorageQuota = _requestStorageQuota;

		function _requestFileSystem() {
			var deferred = $q.defer();

			requestFileSystem(
				window.PERSISTENT,
				requestedBytes,
				function (fs) {

					fileSystem = fs;

					fs.root.getDirectory('NoFileCache', {create:true}, function(directoryEntry){
						root = directoryEntry;
						deferred.resolve();
					}, deferred.reject);

					deferred.resolve(fs);
				},
				function (e) {
					deferred.reject(e);
				}
			);

			return deferred.promise;
		}
		this.requestFileSystem = _requestFileSystem;

		function str2ab(str) {
			var buf = new ArrayBuffer(str.length); // 2 bytes for each char
			var bufView = new Uint8Array(buf);
			for (var i = 0, strLen = str.length; i < strLen; i++) {
				bufView[i] = str.charCodeAt(i);
			}
			return buf;
		}

		function _count() {
			var deferred = $q.defer(),
				noFileCacheReader = root.createReader();

			noFileCacheReader.readEntries(function(results) {
				deferred.resolve(results.length);
			}, deferred.reject);

			return deferred.promise;
		}

		function _dir() {
			var deferred = $q.defer(),
				noFileCacheReader = root.createReader();

			noFileCacheReader.readEntries(function(results) {
				deferred.resolve(new noInfoPath.data.NoResults(results));
			}, deferred.reject);

			return deferred.promise;
		}
		this.dir = _dir;

		function _save(fileObj, fileIdKey) {

			return $q(function (resolve, reject) {
				if (!root || fileObj === null) {
					reject("File not found in File Cache.");
					return;
				}

				var path = fileObj.DocumentID + "." + noMimeTypes.fromMimeType(fileObj.type);

				_readFileObject(fileObj)
					.then(function (fileBlob) {
						root.getFile(path, {
							create: true
						}, function (fileEntry) {
							fileEntry.createWriter(function (writer) {
								var arr = [str2ab(fileBlob)],
									blob = new Blob(arr, {
										type: fileObj.type
									});
								writer.write(blob);

								resolve(fileObj);
							}, reject);
						}, reject);
					})
					.catch(function (err) {
						console.error(err);
					});



			});

		}
		this.save = _save;

		function _read(fileObj, fileNameField) {
			return $q(function (resolve, reject) {
				var path = fileObj[fileNameField || "DocumentID"] + "." + noMimeTypes.fromMimeType(fileObj.type);

				if(!root) reject(new Error("Root folder missing."));

				root.getFile(path, null, function (fileEntry) {
					resolve({
						fileObj: fileObj,
						fileEntry: fileEntry
					});
				}, reject);
			});

		}
		this.read = _read;

		// function _getFileUrls(docs, resolver) {
		// 	var promises = [];
		//
		//
		//
		// 	for (var d = 0; d < docs.length; d++) {
		//
		// 		var doc = docs[d],
		// 			fileId = null,
		// 			useDoc = false;
		//
		// 		if (angular.isFunction(resolver)) {
		// 			doc = resolver(doc);
		// 			fileId = doc ? doc.FileID : "";
		// 		} else if (angular.isObject(resolver)) {
		// 			useDoc = noInfoPath.getItem(doc, resolver.key) === resolver.value;
		// 			if (useDoc) {
		// 				fileId = doc.FileID;
		// 			}
		// 		} else {
		// 			fileId = doc.FileID;
		// 		}
		//
		// 		if (!!fileId) {
		// 			promises.push(_toUrl(fileId)
		// 				.then(function (doc, results) {
		// 					return {
		// 						url: results ? results.url : "",
		// 						name: doc.name
		// 					};
		// 				}.bind(null, docs[d])));
		//
		// 		}
		// 	}
		//
		// 	return $q.all(promises);
		// }
		// this.getFileUrls = _getFileUrls;
		//
		// function _toUrl(fileObj) {
		// 	return noLocalFileStorage.get(angular.isObject(fileObj) ? fileObj.FileID : fileObj)
		// 		.then(_save)
		// 		.then(_read)
		// 		.then(function (result) {
		// 			result.url = result.fileEntry.toURL();
		// 			return result;
		// 		})
		// 		.catch(function (err) {
		// 			console.error(err);
		// 		});
		// }
		// this.getUrl = _toUrl;

		function _get(fileObj, schema) {
			var options = {
				headers: {
					"Content-Type": fileObj.type,
					"Accept": fileObj.type
				},
				method: "GET",
				responseType: "arraybuffer"
			};

			return _read(fileObj, schema.primaryKey)
				.then(function (file) {
					return _download(file.fileEntry.toURL(), fileObj.type, fileObj.name)
						.then(function (resp) {
							return resp.data || resp;
						});
				})
				.catch(function (err) {
					return err;
				});

		}
		this.getFile = _get;

		function _delete(fileObj, fileNameField) {
			if(!fileObj.type){
				return $q.when("fileObj does not have type provided.");
			} else {
				return $q(function (resolve, reject) {
					var path = fileObj[fileNameField || "DocumentID"] + "." + noMimeTypes.fromMimeType(fileObj.type);
					if (!root) reject("Local file system is not initialized.");
					if (!fileObj) reject("File metadata object is missing");

					root.getFile(path, null, function (fileEntry) {
						fileEntry.remove(resolve, reject);
					}, reject);
				});
			}
		}
		this.deleteFile = _delete;

		function _clear() {
			var deferred = $q.defer(),
				noFileCacheReader = root.createReader();

			noFileCacheReader.readEntries(function(results) {
				if(!!results.length) {
					var count = 0;
					console.log("Deleteing", results.length);

					results.forEach(function(f){
						f.remove(function(){
							count++;
							if(count >= results.length) deferred.resolve();
						}, function(err){
							console.log(err);
							count++;
							if(count >= results.length) deferred.resolve();
						});
					});

				} else {
					deferred.resolve();
				}

			});

			return deferred.promise;

		}
		this.clear = _clear;

		function _download(url, mimeType, fileName) {
			return $q(function(resolve, reject){
				var options = {
					headers: {
						"Content-Type": mimeType,
						"Accept": mimeType
					},
					method: "GET",
					responseType: "arraybuffer"
				};

				noHTTP.noRequest(url, options)
					.then(function (resp) {
						//console.log(x.readAsArrayBuffer(resp.data));
						var file = new File([resp.data], fileName, {
							type: mimeType
						});
						console.log("noLocalFileSystem::download", file.name, mimeType, file.type, file.size);
						resolve(file);
					}).catch(function(err){
						resolve(null);
					});
			});

		}
		this.downloadFile = _download;
	}

	/*
	 *	noMimeTypes
	 *	-----------
	 */
	function NoMimeTypeService() {
		var mimeTypes = {
				'a': 'application/octet-stream',
				'ai': 'application/postscript',
				'aif': 'audio/x-aiff',
				'aifc': 'audio/x-aiff',
				'aiff': 'audio/x-aiff',
				'au': 'audio/basic',
				'avi': 'video/x-msvideo',
				'bat': 'text/plain',
				'bin': 'application/octet-stream',
				'bmp': 'image/x-ms-bmp',
				'c': 'text/plain',
				'cdf': 'application/x-cdf',
				'csh': 'application/x-csh',
				'css': 'text/css',
				'csv': 'text/csv',
				'dll': 'application/octet-stream',
				'doc': 'application/msword',
				'dvi': 'application/x-dvi',
				'eml': 'message/rfc822',
				'eps': 'application/postscript',
				'etx': 'text/x-setext',
				'exe': 'application/octet-stream',
				'gif': 'image/gif',
				'gtar': 'application/x-gtar',
				'h': 'text/plain',
				'hdf': 'application/x-hdf',
				'htm': 'text/html',
				'html': 'text/html',
				'jpe': 'image/jpeg',
				'jpeg': 'image/jpeg',
				'jpg': 'image/jpeg',
				'js': 'application/x-javascript',
				'ksh': 'text/plain',
				'latex': 'application/x-latex',
				'm1v': 'video/mpeg',
				'man': 'application/x-troff-man',
				'me': 'application/x-troff-me',
				'mht': 'message/rfc822',
				'mhtml': 'message/rfc822',
				'mif': 'application/x-mif',
				'mov': 'video/quicktime',
				'movie': 'video/x-sgi-movie',
				'mp2': 'audio/mpeg',
				'mp3': 'audio/mpeg',
				'mp4': 'video/mp4',
				'mpa': 'video/mpeg',
				'mpe': 'video/mpeg',
				'mpeg': 'video/mpeg',
				'mpg': 'video/mpeg',
				'ms': 'application/x-troff-ms',
				'nc': 'application/x-netcdf',
				'nws': 'message/rfc822',
				'o': 'application/octet-stream',
				'obj': 'application/octet-stream',
				'oda': 'application/oda',
				'pbm': 'image/x-portable-bitmap',
				'pdf': 'application/pdf',
				'pfx': 'application/x-pkcs12',
				'pgm': 'image/x-portable-graymap',
				'png': 'image/png',
				'pnm': 'image/x-portable-anymap',
				'pot': 'application/vnd.ms-powerpoint',
				'ppa': 'application/vnd.ms-powerpoint',
				'ppm': 'image/x-portable-pixmap',
				'pps': 'application/vnd.ms-powerpoint',
				'ppt': 'application/vnd.ms-powerpoint',
				'pptx': 'application/vnd.ms-powerpoint',
				'ps': 'application/postscript',
				'pwz': 'application/vnd.ms-powerpoint',
				'py': 'text/x-python',
				'pyc': 'application/x-python-code',
				'pyo': 'application/x-python-code',
				'qt': 'video/quicktime',
				'ra': 'audio/x-pn-realaudio',
				'ram': 'application/x-pn-realaudio',
				'ras': 'image/x-cmu-raster',
				'rdf': 'application/xml',
				'rgb': 'image/x-rgb',
				'roff': 'application/x-troff',
				'rtx': 'text/richtext',
				'sgm': 'text/x-sgml',
				'sgml': 'text/x-sgml',
				'sh': 'application/x-sh',
				'shar': 'application/x-shar',
				'snd': 'audio/basic',
				'so': 'application/octet-stream',
				'src': 'application/x-wais-source',
				'swf': 'application/x-shockwave-flash',
				't': 'application/x-troff',
				'tar': 'application/x-tar',
				'tcl': 'application/x-tcl',
				'tex': 'application/x-tex',
				'texi': 'application/x-texinfo',
				'texinfo': 'application/x-texinfo',
				'tif': 'image/tiff',
				'tiff': 'image/tiff',
				'tr': 'application/x-troff',
				'tsv': 'text/tab-separated-values',
				'txt': 'text/plain',
				'ustar': 'application/x-ustar',
				'vcf': 'text/x-vcard',
				'wav': 'audio/x-wav',
				'wsdl': 'application/xml',
				'xbm': 'image/x-xbitmap',
				'xlb': 'application/vnd.ms-excel',
				'xls': 'application/vnd.ms-excel',
				'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'xml': 'text/xml',
				'xpdl': 'application/xml',
				'xpm': 'image/x-xpixmap',
				'xsl': 'application/xml',
				'xwd': 'image/x-xwindowdump',
				'zip': 'application/zip'
			},
			mimeTypesInverted = {};

		for (var m in mimeTypes) {
			var mime = mimeTypes[m];
			mimeTypesInverted[mime] = m;
		}

		this.fromFileName = function (fileName) {
			var ext = fileName.substring(fileName.lastIndexOf(".") + 1);
			return mimeTypes[ext.toLowerCase()];
		};


		this.fromExtention = function (ext) {
			return mimeTypes[ext.toLowerCase()];
		};

		this.fromMimeType = function (mimeType) {
			return mimeTypesInverted[mimeType.toLowerCase()];
		};

		this.isImage = function(mimeType) {
			return mimeType.indexOf("image/") > -1;
		};
	}

	function NoFileSystemService($q, $rootScope, noLocalFileSystem) {
		var THIS = this;

		function _recordTransaction(resolve, tableName, operation, trans, rawData, result1, result2) {
			//console.log(arguments);

			var transData = result2 && result2.rows && result2.rows.length ? result2 : angular.isObject(result1) ? result1 : rawData;

			if (trans) trans.addChange(tableName, transData, operation, "NoInfoPath_dtc_v1_files");

			resolve(transData);
		}

		function _transactionFault(reject, err) {
			reject(err);
		}

		this.whenReady = function (config) {
			return $q(function (resolve, reject) {
				var dbInitialized = "noFileSystemInitialized";

				if ($rootScope[dbInitialized]) {
					resolve();
				} else {
					$rootScope.$watch(dbInitialized, function (newval) {
						if (newval) {
							resolve();
						}
					});

				}
			});
		};

		this.configure = function () {
			var schema = {
					"dbName": "rmEFR2",
					"provider": "LocalFileSystem",
					"schemaSource": {
						"provider": "inline",
						"schema": {
							"NoFileCache": {
								"entityName": "NoFileCache",
								"entityType": "T",
								"primaryKey": "name",
								"foreignKeys": {},
								"columns": {},
								"indexes": []
							}
						}
					}
				},
				db = new noFileSystemDb(),
				dbInitialized = "noFileSystem_rmEFR2";

			return $q(function (resolve, reject) {
				db.NoFileCache = new NoTable($q, "NoFileCache", schema, noLocalFileSystem);
				$rootScope[dbInitialized] = db;
				console.log(dbInitialized + " ready.");
				resolve(THIS);
			});

		};

		this.getDatabase = function (backerSchema) {
			var dbInitialized = "noFileSystem_rmEFR2",
				db = $rootScope[dbInitialized];

			if(db && db.NoFileCache){
				db.NoFileCache.backerSchema = backerSchema;
			}

			return db;
		};

		this.destroyDb = function (databaseName) {
			return $q.when();
		};

		function noFileSystemDb() {}

		function NoTable($q, tableName, table, noLocalFileSystem) {
			var THIS = this,
				schema = table,
				SQLOPS = {};

			Object.defineProperties(this, {
				entity: {
					get: function () {
						return _table;
					}
				},
				backerSchema: {
					set: function(v) {
						schema = v;
					}
				}
			});

			function noCreate(data, trans) {
				return $q(function (resolve, reject) {

					noLocalFileSystem.save(data, schema.primaryKey)
						.then(_recordTransaction.bind(null, resolve, schema.entityName, "C", trans, data))
						.catch(_transactionFault.bind(null, reject));
				});
			}
			this.noCreate = noCreate;

			function noDestroy(data) {
				return $q(function (resolve, reject) {
					noLocalFileSystem.deleteFile(data, schema.primaryKey)
						.then(resolve)
						.catch(resolve);
				});
			}
			this.noDestroy = noDestroy;

			this.noRead = function () {
				return noLocalFileSystem.dir();
			};

			this.noUpdate = function (data, trans) {
				return 	noLocalFileSystem.deleteFile(data, schema.primaryKey)
					.then(function (data) {
						return noLocalFileSystem.save(data, schema.primaryKey)
							.catch(function (err) {
								return err;
							});
					})
					.catch(function (err) {
						return err;
					});

			};

			this.noOne = function (query) {
				return noLocalFileSystem.getFile(query, schema);
			};

			/*
			 * ### @method noClear()
			 *
			 * Delete all files from the cache, without recording each delete transaction.
			 *
			 * #### Returns
			 * AngularJS Promise.
			 */
			this.noClear = function () {
				if (schema.entityType === "V") throw "Clear operation not supported by SQL Views.";

				return noLocalFileSystem.clear();
			};

			/*
			 *	### @method noBulkCreate(data)
			 *
			 *	Inserts a file in to cache without logging a transaction.
			 */
			this.noBulkCreate = function (data) {
				return $q.when("noBulkCreate not supported by noFileSystem");
			};

			/*
			 *	### @method bulkload(data, progress)
			 *
			 *	Returns an AngularJS Promise.  Takes advantage of
			 *	Promise.notify to report project of the bulkLoad operation.
			 */
			this.bulkload = function (data, progress, remoteDataSvc) {
				if (_table.entityType === "V") throw "BulkLoad operation not supported by SQL Views.";

				return $q.when("bulkload not supported by noFileSystem");
			};

			SQLOPS.I = this.noCreate;
			SQLOPS.U = this.noUpdate;
			SQLOPS.D = this.noDestroy;

			this.noImport = function (noChange) {
				return $q.when("noImport not supported by noFileSystem");
			};

			this.hasPrimaryKeys = function (keyList) {
				return $q.when("hasPrimaryKeys not supported by noFileSystem");
			};

			this.downloadFile = noLocalFileSystem.downloadFile;
		}

	}


	angular.module("noinfopath.data")
		.service("noMimeTypes", [NoMimeTypeService])
		.service("noLocalFileSystem", ["$q", "$http", "noLocalStorage","noHTTP", "noMimeTypes", "noConfig", NoLocalFileSystemService])
		.service("noFileSystem", ["$q", "$rootScope", "noLocalFileSystem", NoFileSystemService])
		;

})(angular, navigator.webkitPersistentStorage, window.requestFileSystem || window.webkitRequestFileSystem);
