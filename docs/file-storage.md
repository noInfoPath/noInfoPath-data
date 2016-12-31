
Saves a file to the noDataSource defined in the config object.

> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.



Saves a file to the noDataSource defined in the config object.

> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.



Deletes a file by FileID from the NoInfoPath_FileUploadCache.


Reads a file from a DOM File object and converts to a binary
string compatible with the local, and upstream file systems.

### @method noClear()

Delete all files from the cache, without recording each delete transaction.

#### Returns
AngularJS Promise.

### @method noBulkCreate(data)

Inserts a file in to cache without logging a transaction.

### @method bulkload(data, progress)

Returns an AngularJS Promise.  Takes advantage of
Promise.notify to report project of the bulkLoad operation.

