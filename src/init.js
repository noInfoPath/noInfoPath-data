var deferred = $q.defer();

noStatus.update(NOSYNC.STATUS_CODES.DBINIT);

var tasks,
	internal_version = (config.ver * 1000)
;

function checkDbVersion(version){
    var deferred = $q.defer(),
    	revision = (version * 1000) - tasks.length,
    	request = indexedDB.open(NODB.DBNAME, revision),
    	db;

    request.onerror = function onerror(ev) { 
    	if(ev.target.error.name == "AbortError"){
    		//Assume this was because we explictly
    		//called abort() in the upgradeneeded event.
    		deferred.resolve(true); 
    	}else if(ev.target.error.name == "VersionError"){
    		//assume this means that the version does
    		//already exist.
    		deferred.resolve(false);
    	}				         	
 	};

 	request.onsuccess = function onsuccess(ev){
		db = request.result;
		db.close();
		deferred.resolve(false);
 	};

 	request.onupgradeneeded = function onupgradeneeded(ev){
 		event.target.transaction.abort();
 	};

    return deferred.promise;
}

function requestDbUpgrades(upgradeId){
	var deferred = $q.defer();

	log.write("getting upgradeid " + upgradeId);
	$http.get(_crudUrl(NODB.COLLECTION.NODBUPGRADES, upgradeId))
		.success(function(data){
			currentUpgrade = data;
			deferred.resolve();
		})
		.error(function(err){
			deferred.reject(err);
		})
	return deferred.promise;
}

function queueUpgradeTasks(){
	var deferred = $q.defer(), 
		queue = [],
		upgrades = currentUpgrade;

	setTimeout(function(){
		angular.forEach(upgrades.collections, function(collection, name){
			angular.forEach(collection, function(upgrade){
				var fn = upgradeActions[upgrade.action];
				queue.push([name, upgrade, fn]);
			});
		});	
		tasks = queue;
		deferred.resolve(queue);	
	},1);

	return deferred.promise;
}

function start(queue){ 
	internal_version = internal_version - tasks.length + 1;
	var deferred = $q.defer();
	run(deferred)
		.then(function(data){
			log.write(data);
		})
		.catch(function(err){
			log.write(err.name + ": " + err.message);
		})
		.finally(function(){
			log.write("run, finally...");
		});				

	var deferred = $q.defer();
	
	return deferred.promise;
}

function run(whenDone){

	var task = tasks.shift();

	if(!!task){
		var p = new dbPromise(task, internal_version++);
		p.then(function(data){
			run(whenDone);
		}).catch(function(err){
			whenDone.reject(err);
		});								
	}


	return whenDone.promise;
}

function initDb(){
	var deferred = $q.defer();
	
	checkDbVersion(config.ver)							
		.then(function(startUpgrade){
			if(startUpgrade){
				log.write("db upgrade required");
				start(tasks)
					.then(function(){
						log.write("db upgrade completed at version: " + internal_version);
						deferred.resolve(true)
					})
					.catch(function(err){
						deferred.reject(err);
					})
			}else{
				log.write("db upgrade is not required");
				deferred.resolve(true);
			}
		});

	return deferred.promise;
}

function initCollections(){
	var deferred = $q.defer();
	
	setTimeout(function(){
		angular.forEach(currentUpgrade.collections, function(col, name){
			SELF.collection[name] = new collection(name, col);
		});
		
		log.write('NoInfoPath collection interfaces initialized.')
		//_broadcast(NODB.DB_READY);
		deferred.resolve(true);
	},1);							

	
	return deferred.promise;
}

requestDbUpgrades(config.id)
	.then(queueUpgradeTasks)
	.then(initCollections)
	.then(initDb)
	.then(deferred.resolve)
	.catch(deferred.reject);	

return deferred.promise;