(function(angular, Dexie, undefined){
	"use strict";

	angular.module("noinfopath.data")

		.service("noBulkData", ['$q', '$timeout','noConfig', 'noUrl', 'noDexie', 'noLogService', function($q, $timeout, noConfig, noUrl, noDexie, noLogService){
			var csss = {
				"success": "progress-bar-success progress-bar-striped active",
				"info": "progress-bar-info progress-bar-striped active",
				"warning": "progress-bar-warning"
			};

			function BulkImportProgress(){
				var _proto_ = Object.getPrototypeOf(this);

				this.tables = new noInfoPath.ProgressTracker();
				this.rows = new noInfoPath.ProgressTracker();

				_proto_.changeTableMessage = function(msg, css, showProgress, deferred){
					$timeout(function(){
						this.tables.changeMessage(msg, showProgress);
						this.tables.changeCss(css);
						deferred.notify(this);
					}.bind(this));
				};

				_proto_.changeRowMessage = function(msg, css, showProgress, deferred){
					$timeout(function(){
						this.rows.changeMessage(msg, showProgress);
						this.rows.changeCss(css);
						deferred.notify(this);
					}.bind(this));
				};


				_proto_.updateTable = function(msg, css, deferred) {
					$timeout(function(){
						this.tables.update(msg);
						this.tables.changeCss(css);
						deferred.notify(this);
					}.bind(this));

				};

				_proto_.updateRow = function(msg, css, deferred) {
					$timeout(function(){
						this.rows.update(msg);
						this.rows.changeCss(css);
						deferred.notify(this);
					}.bind(this));

				};
			}

			this.load = function(noManifest, datasvc){

				var _tasks = [],
					_datasvc,
					deferred = $q.defer(),
					progress = new BulkImportProgress();

				function _queue(manifest){
					//var urls = noUrl.makeResourceUrls(noConfig.current.RESTURI, manifest);

					for(var k in manifest){
						var task = manifest[k];
						task.url = k;
						_tasks.push(task);
					}
				}

				function _recurse(deferred, progress) {
					var task = _tasks.shift(), table, remote;
					if(task){
						progress.updateTable("Downloading " + task.TableName, csss.success, deferred);

						noLogService.debug(noDexie.constructor.name);
						noLogService.debug(_datasvc.constructor.name);

						table = noDexie[task.url];
						remote = _datasvc[task.url];
						if(table && remote)
						{
							remote.noRead()
								.then(function(data){
									try{
										if(data){
											//noLogService.info("\t" + data.length + " " + task.url + " downloaded.");

											progress.changeTableMessage("Importing " + data.length + " items from " + task.TableName, csss.info, false, deferred);

											//noLogService.info("\tImporting " + data.length + " items from " + task.TableName);

											noDexie[task.url].bulkLoad(data, progress)
												.then(function(info){
													deferred.notify(progress);
													//noLogService.info("\t" + info + " import completed.");
													_recurse(deferred, progress);
												})
												.catch(function(err){
													deferred.notify(progress);
													//noLogService.error(err);
													_recurse(deferred, progress);
												})
												.finally(angular.noop, function(info){
													deferred.reject(progress);
													//noLogService.info(info);
												});
										}else{
											//noLogService.info("\tError downloading " + task.TableName);
											//$timeout(function(){
											progress.rows.start({min: 1, max: 1, showProgress: false});
											progress.updateRow("Error downloading " + task.TableName, csss.warning, deferred);
											deferred.notify(progress);
											//});
											_recurse(deferred, progress);
										}
									}catch(ex){
										deferred.reject(ex);
										//noLogService.error(ex);
									}

							})
							.catch(function(err){
								//noLogService.error(err);

								progress.rows.start({min: 1, max: 1, showProgress: false});
								progress.updateRow("Error downloading " + task.TableName, csss.warning);
								deferred.notify(progress);
								_recurse(deferred, progress);

							});
						}else{

							throw {message: "table or remote not so swag!", data: [table, remote] };
						}

					}else{
						//noLogService.info("Bulk import complete.");
						deferred.resolve();  //Nothing left to do
					}
				}

				_datasvc = datasvc;
				_queue(noManifest);
				_recurse(deferred, progress);

				return deferred.promise;
			}.bind(this);
		}])
		;
})(angular, Dexie);
