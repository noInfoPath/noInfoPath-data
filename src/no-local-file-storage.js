// no-local-file-storage.js
(function(angular, storageInfo, requestFileSystem, undefined) {
    function NoLocalFileSystemService($q, noLocalFileStorage, noMimeTypes) {

        var requestedBytes = 1024 * 1024 * 280,
        	fileSystem;


        function _requestStorageQuota() {

            return $q(function(resolve, reject) {
                storageInfo.requestQuota(
                    requestedBytes,
                    function(grantedBytes) {
                        console.log('we were granted ', grantedBytes, 'bytes');
                        resolve(grantedBytes);
                    },
                    function(e) {
                        console.log('Error', e);
                        reject(e);
                    }
                );
            });


        }
        this.requestStorageQuota = _requestStorageQuota;

        function _requestFileSystem() {
            var deferred = $q.defer();

            requestFileSystem(
                window.TEMPORARY,
                requestedBytes,
                function(fs) {
                    fileSystem = fs;
                    deferred.resolve(fs);
                },
                function(e) {
                    deferred.reject(e);
                }
            );

            return deferred.promise;
        }
        this.requestFileSystem = _requestFileSystem;

		function str2ab(str) {
		  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
		  var bufView = new Uint8Array(buf);
		  for (var i=0, strLen=str.length; i<strLen; i++) {
		    bufView[i] = str.charCodeAt(i);
		  }
		  return buf;
		}

        function _save(fileObj) {

            return $q(function(resolve, reject) {
				var path = fileObj.FileID + "." + noMimeTypes.fromMimeType(fileObj.type)
                if (!fileSystem) reject();

                fileSystem.root.getFile(path, {
                    create: true
                }, function(fileEntry) {
                    fileEntry.createWriter(function(writer) {
						var arr = [str2ab(fileObj.blob)],
							blob = new Blob(arr, {type: fileObj.type});
                        writer.write(blob);

						 resolve(fileObj);
                    }, reject);
                }, reject);
            });

        }
        this.save = _save;

        function _read(fileObj) {
            return $q(function(resolve, reject) {
				var path = fileObj.FileID + "." + noMimeTypes.fromMimeType(fileObj.type);
                if (!fileSystem) reject();

                fileSystem.root.getFile(path, null, function(fileEntry) {
                    resolve({fileObj: fileObj, fileEntry: fileEntry});
                }, reject);
            });

        }
        this.read = _read;

		function _toUrl(fileObj) {
			return noLocalFileStorage.get(angular.isObject(fileObj) ? fileObj.FileID : fileObj)
				.then(_save)
				.then(_read)
				.then(function(result){
					result.url = result.fileEntry.toURL();
					return result;
				})
				.catch(function(err){
					console.error(err);
				});
		}
		this.getUrl = _toUrl;
    }

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

		for(var m in mimeTypes) {
			var mime = mimeTypes[m];
			mimeTypesInverted[mime] = m;
		}

		this.fromExtention = function(ext) {
			return mimeTypes[ext];
		}

		this.fromMimeType = function(mimeType) {
			return mimeTypesInverted[mimeType];
		}
    }


    angular.module("noinfopath.data")
		.service("noMimeTypes", [NoMimeTypeService])
        .service("noLocalFileSystem", ["$q", "noLocalFileStorage", "noMimeTypes", NoLocalFileSystemService])
		;
})(angular, navigator.webkitPersistentStorage, window.requestFileSystem || window.webkitRequestFileSystem);
