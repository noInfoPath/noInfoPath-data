[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

NoInfoPath Data (noinfopath-data)
=============================================

*@version 2.0.41* [![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)
___

Overview
--------

NoInfoPath Data provides serveral service that all an application to
interact with the various local storage systems found in HTML5 compliant
Web browsers.

### Installation

> npm install @noinfopath/noinfopath-data

### Services

|Name|Description|
|----|-----------|
|[noDataSource](/noinfopath/noinfopath-data/wikis/data-source)|Provides a abstracted CRUD interface that sits in front of actual NoInfoPath CRUD provider services.|
|[noFileStoreageCRUD](noFileStoreageCRUD)|Establishes a CRUD interface in front of `noLocalFileStorage`.|
|[noHTTP](noHTTP)|Establishes a CRUD interface in front of the AngularJS `$http` service|
|[noIndexedDb](noIndexedDb)|Prodvides a CRUD interface for the Browser's native IndexedDB database. (Not fully supported by all browsers.)|
|[noLocalFileStorage](noFileStoreageCRUD)|Reads a File object retrieved from a standard `input:file` element and saves the data to an IndexedDB object store called NoInfoPath_FileUploadCache. The file blob is stored as `binary string`|
|[noLocalFileSystem](noLocalFileSystem)|Stores files within the Brower's Temporary Local File System.|
|[noLocalStorage](noLocalStorage)|Provides access to the Browser's localStorage service.|
|[noMimeTypes](noLocalFileSystem)|Helper service that returns a mime type given a file extention and vice versa.|
|[noSessionStorage](noLocalStorage)|Provides access to the Browser's sessionStorage service.|
|[noTemplateCache](noTemplateCache)|Sits in front of Angular Template cache, but allows files to be retrieve directly without using `ngInclude` or a directives `templateUrl` property.|
|[noTransactionCache](noTransactionCache)|Manages data transaction by tracking changes made by a CRUD provider service, and stores the changes in the NoInfoPath_Changes object store.|
|[noWebSQL](noWebSQL)|Provides a CRUD interface for the Browser's native WebSQL database. (Not supported by all Browsers.)|

### [Helper Functions](functions)

NoInfoPath Data exposes several helper function on the global noInfoPath object
that is placed on the browser's instrinsic `window` object.

|Name|Description|
|----|-----------|
|digest|Deprecated; will be removed in a future release.|
|digestError|Deprecated; will be removed in a future release.|
|digestTimeout|Deprecated; will be removed in a future release.|
|fromScopeSafeGuid|Convertes a "Scope Safe GUID" to a standard GUID.|
|getItem(store, key)|Using the parameters provided, retrieves a value from the `store` using the `key`.|
|isCompoundFilter|Checks the provided `indexName` for a string that match the compound key format.|
|setItem(store, key, value)|Sets the `value`, on the `store` using the `key`.|
|toDbDate(date)|Converts a JavaScript Date to a database compliant date String.|
|toDisplayDate|Converts a JavaScript Date to a human readable date string.|
|toScopeSafeGuid|Converts standards GUID to one that is safe to use as a property name in a JavaScript Object.|
|resolveID|Creates and returns a NoFilters object.|

### [Classes](classes)

|Name|Description|
|----|-----------|
|NoDataModel|TODO|
|NoFilter|TODO|
|NoFilters|TODO|
|NoFilterExpression|TODO|
|NoPage|TODO|
|NoReadOptions|TODO|
|NoResults|TODO|
|NoSort|TODO|
|NoSortExpression|TODO|


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___


noLocalStorage
--------------

noSessionStorage
--------------


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___


noFileStoreageCRUD
------------------

### @method noClear()

Delete all files from the cache, without recording each delete transaction.

#### Returns
AngularJS Promise.

### @method noBulkCreate(data)

Inserts a file in to cache without logging a transaction.

### @method bulkload(data, progress)

Returns an AngularJS Promise.  Takes advantage of
Promise.notify to report project of the bulkLoad operation.

noLocalFileStorage
------------------


Saves a file to the noDataSource defined in the config object.

> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.



Saves a file to the noDataSource defined in the config object.

> NOTE: This service does not use syncable transations. It is the responsibility of the consumer to sync.  This is because it may not be appropriate to save the files to the upstream data store.



Deletes a file by FileID from the NoInfoPath_FileUploadCache.


Reads a file from a DOM File object and converts to a binary
string compatible with the local, and upstream file systems.


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

## noDataSource Service

Provides a generic service that exposes the NoInfoPath data providers'
underlying CRUD interface.

```json

"noDataSource": {
       "dataProvider": "noWebSQL",
       "databaseName": "FCFNv2",
       "entityName": "LU_PercentColor",
       "primaryKey": "PercentColorID",
       "queryParser": "noQueryParser",
       "sort":  [{"field": "Percentage", "dir": "asc"}],
       "aggregation": {
            "actions": [
				{
					"provider": "aCustomProvider",
					"method": "aMethod",
					"params": [

					],
					"noContextParams": true
				}
            ]
       }
   }

```


Use this property when you want the data source wait for some other
NoInfoPath component to update the `scope`.

#### create(dsConfigKey)

create a new instance of a NoDataSource object configured
based on the datasource configuration found in noConfig
at the given `dsConfigKey` location.

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|dsConfigKey|String|The location in noConfig where the data source's configuration can be found.  Can be a complex name like the following.  `noForms.myForm1.noComponents.foo.noDataSource`|

##### Returns

An instance of a NoDataSource object.



[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

noTransactionCache service
--------------------------

  Each top-level property represents a crud operation that must
  be handled in a specific manner in order to ensure consistency.
  Within each operation is a list of NoTables that are part of the
  transaction.

  For each table in the operation are instructions as to which entity are
  involved, how to carry out the transaction, and in what order.


When a field is a string then the value will be the
property on the data object provider to the call
the `basic` preOp

When a field is an object then confgure as if the
value will be coming from a trusted provider like
scope, or $stateParams.

When `scope` is the provider then the directive scope is used.
Otherwise the supplied injecable provider will be used.

When field value is a primative type meaning not
an object. or array. Use the value as is.

Drop each record one at a time so that the operations
are recorded in the current transaction.

Add each record one at a time to ensure that the transaction is recorded.

#### @property scopeKey

Use this property allow NoTransaction to store a reference
to the entity upon which this data operation was performed.
This is useful when you have tables that rely on a one to one
relationship.

It is best practice use this property when ever possible,
but it not a required configuration property.


### joiner-many

`joiner-many` assumes that it represents a multiple choice question.
In order to keep the algorithm simple we drop all joiner items
that match the parent key. (i.e. SelectionID)

### one-one

`one-one` enforces referential integrity between two table in a
transaction that share a one to one relationship.  When the child
data/table as defined in the noTransaction configuration and it's
an update is performed.



Use this property to `create` new related records in a transaction
member table when a matching item does not exist. So, this also
means that no `update` operations are performed on the designated
member table.


### @method bulkUpsert

Inserts or updates and array of data items. Uses a provided
constructor to create the object that will be added to the
entity. This allows for custom data conversion and business
logic to be implement at the record level, before saving.



[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

noTemplateCache
---------------

NoInfoPath abstraction of $templateCache. Added the actual $http calls that are
inferred in the documentation or perform by ngInclude.


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

## @service noHTTP

### Overview
Provides a RESTful compatible HTTP service.

### Methods

#### create(uri, data)

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|uri|string|unique identifier of the table to operate against|
|data|object|the data to use to create the new obejct in the db|

#### read(resourceURI, query)

#### update(resourceURI, formdata)
TODO: Implementation required.

#### destroy(resourceURI, formdata)
TODO: Implementation required.


### @class NoDb

#### Overview

Creates and manages a set of NoTable objects.

#### @constructor NoDb(tables, queryBuilder)

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|tables|object|A hash object that contains a collection of table configuration as provided by noDbScema|
|queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|



### @class NoTable

#### Overview

Provides an interface that loosely matches that of the NoTable
class provided by noDexie.  This to ease the integration with
NoInfoPath component that consume data such as noKendo.

#### @constructor NoTable(tableName, queryBuilder)

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|tableName|string|name of the table that this instance will interact with.|
|queryBuilder|function|a reference to a function that compiles supplied NoFilters, NoSort, and NoPage objects into a query object compatible with the upstream provider.|

When 'query' is an object then check to see if it is a
NoFilters object.  If not, add a filter to the intrinsic filters object
based on the query's key property, and the query's value.

When query a number, a filter is created on the instrinsic
filters object using the `rowid`  WebSQL column as the column
to filter on. Query will be the target
value of query.

When the query is a string it is assumed a table is being queried
by it's primary key.

> Passing a string when the entity is
a SQL View is not allowed.


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

noIndexedDB
------------------
## noIndexedDB

The noIndexedDB factory creates and configures a new instance of Dexie.
Dexie is a wrapper around IndexedDB.  noIndexedDB is a Dexie AddOn that
extends the query capabilites of Dexie, and exposes a CRUD interface
on the WriteableTable class.


### Class noDatum
This is a contructor function used by Dexie when creating and returning data objects.


### Class noDexie
This is the classed used to construct the Dexie AddOn.


#### noCreate
Adds a new record to the database. If the primary key is provided in that will be used when adding otherwise a new UUID will be created by Dexie.

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|data|Object|An object contains the properties that match the schema for the underlying WriteableTable.

##### Returns
AngularJS:Promise


#### noRead

The read operation takes a complex set of parameters that allow
for filtering, sorting and paging of data.

##### Parameters

|Name|Type|Description|
|----|----|------------|
|filters|NoFilters|(Optional) Any `NofilterExpression` objects that need to be applied to the the current table.|
|sort|NoSort|(Optional) Any `NoSortExpression` objects that need to be applied to the result set. The will be applied in the order supplied.|
|page|NoPage|(Optional) Paging information, if paging is reqired by the read operation.|

##### Returns
AngularJS::Promise


#### Internal Values

|Name|Type|Description|
|------|-----|-------------|
|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
|_resolve|Function|Call to resolve `Dexie::Promise` upon successful completion of `_applyFilters()`. This function is returned while resolving the underlying IDBObjectStore from the `table` parameter.|
|_reject|Function|Call to resolve the `Dexie::Promise` when an unexpected for un recoverable error occurs during processing.|
|_store|IDBObjectStore|This underlying `IDBObjectStore` that the `table` parameter represents.|
|_trans|IDBTransaction|This is the underlying `IDBTransaction` that the current object store is bound to.|


##### nonIndexedOperators
This hash table allows for quick access to the operations that can be applied to a property on a target object and the value(s) being filtered on.

NOTE:  The "a" parameter will always be the value tested, and "b" will always be the value being filter for.


#### \_applyFilters
This function develops an array of objects that has had all of the filters provided in the original request applied to them.  The schema matches the schema of the `table` parameter.

##### Parameters

|Name|Type|Description|
|----|----|------|
|iNofilters|[iNoFilterExpression]|An array of filter expressions. Contains both indexed and non-indexed filters|
|table|Dexie::Table|A reference to the `Dexie::Table` being filtered.

##### Internal variables

|Name|Type|Description|
|------|-----|-------------|
|deferred|$q::deferred|An AngularJS deferment object that is used to return a Promise.|
|iNoFilterHash|Collection<iNoFilters>|Used to organize the filters received in the `iNoFilters` in to a set of indexed and non-indexed filter object The collection is created by a call to `_sortOutFilters()`.|
|resultsKeys|Array\<guid\>|This will be use to collect the final set of results. It will be an array of keys that will be used to query the final result set.|

##### Returns
AngularJS::Promise (Maybe)


### \_filterByIndex

This method of filtering goes against a predefined index. Basically we are doing a MapReduce techique angaist each indexed filter we come across. Using the `filter` parameter provided the index is reduced by matching against the `value` property of the `INoFilterExpression`.  See the `INoFilterExpression` for more details.

#### Parameters

|Name|Type|Description|
|------|-----|-------------|
|filter|INoFilterExpression|A single indexed filter the contains the column, operator, and value to apply to the index.|

#### Returns
AngularJS::Promise


### \_filterByPrimaryKey  -- Being Deprecated

This method of of filterig goes against the `IDBObjectStore`'s primary key.


\_filterHasIndex uses the iNoFilter parameter to determine
if there is an index available for the give filter. it returns
true if there is, false if not.

To determine if and index exists, we look at the table.schema.primKey,
and table.schema.indexes properties.


### \_recurseIndexedFilters


This method of filtering compares the supplied set of
filters against each object return in the Dexie colletion.
This is a much slower than filtering against an index.


While Dexie supports a put operation which is similar to upsert,
we're going with upsert which decides whether an insert or an
update is required and calls the appropreiate function.


### configure


This function splits up the filters by indexed verses not. The
return value is a INoFilterHash.

interface INoFilterHash {
	indexedFilters: [INoFilterExpression]
	nonIndexedFilters: [INoFilterExpression]
}


This function applies the provided sort items to the supplied
Dexie:Collection. It should always sort on indexed columns and
return a DexieCollection.

NOTE: Need to research how to apply multi-column sorting.


Applies the specified skip and take values to the final
Dexie::Collection, if supplied.

Note that this is the function returns the final Array of items
based on all of the properties applied prior to this call.


The promise should resolve to a Dexie::Collection that will result in
a set of data that matches the supplied filters, reject errors.


The update function expects the key to be within the update object.


Maps to the Dexie.Table.get method.


### \_extendDexieTables

### relationships

This property controls operations that require cascadeing
deletes or reads.

*Prototypical entry in the array of relationships.*

```json
{
	"column": "ID",
	"refTable": "ReportBidItemAttributes",
	"refColumn": "ReportBidItemValueID",
	"cascadeDeletes": true,
	"followOnRead": true,
	"pivotMetaDataResults": true
	"sort": {"column": "Order", "dir", "asc"}
}
```
#### Properties

|Name|Type|Description|
|----|----|-----------|
|column|String|The name of the column in the host table that is to be looked up in the `refTable`.|
|refTable|String|Table that contains the related table.|
|refColumn|String|Name of the column that contains the data to match value in the host table, pointed to by `column`.
|cascadeDeletes|Boolean|When true, indicates that all related row should be delete when the host row is deleted.|
|followOnRead|Boolean|Populated the relationship on the host record when read a host record.  NOTE: you must set the `refColumn` to `noFollow: true` on the foreigh key configuration, when this property is set to true|
|sort|Object|Specifies the column and direction to sort by.|

### followMetaDataKeys

This feature of NoInfoPath allows for a special type of
data column that can contain heterogenuous data. Meaning on
any given row of data the value of the meta column could be
a string, a number, date or a foreign key reference to a
lookup table.

#### Sample MetaDataDefinition record

```json
{
	"ID": "67c373ac-a003-402a-9689-45c37fc2afa8",
	"MetaDataSchemaID": "16187a97-31d7-40e3-b33f-64b55471ee3f",
	"Title": "Unit",
	"DataType": "string",
	"InputType": "combobox",
	"ListSource": "lu_UOM",
	"TextField": "Description",
	"ValueField": "ID",
	"DateCreated": "2016-05-04T16:43:00.001",
	"CreatedBy": "79689b1e-6627-47c1-baa5-34be228cf06d",
	"ModifiedDate": "2016-05-04T16:43:00.001",
	"ModifiedBy": "79689b1e-6627-47c1-baa5-34be228cf06d"
}
```

### Class noDatum
This is a contructor function used by Dexie when creating and returning data objects.


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

noWebSql
--------

This module provides full CRUD operations, along with the ability to bulk
bulkload data into the WebSql database, and to perform a lookup for a single item,
and the abilty to perform upserts.

## @constant WEBSQL_IDENTIFIERS

Exposes a set of JavaScript idetentified that map to WebSQL DDL and DML expressions.

## @constant WEBSQL_STATEMENT_BUILDERS

Exposes a setup of helper function that construct safe, WebSQL DDL and DML expressions.

### @class NoWebSqlStatementFactory

This class is an injecton container that uses WEBSQL_IDENTIFIERS, and
WEBSQL_STATEMENT_BUILDERS to construct the various SQL statements
required to create and use a WebSQL database.


### @class NoWebSqlEntity

This class encapulates the CRUD functionality for NoInfoPath's implementation
of WebSQL. It abstracts the fundimental differences between SQL Views and Tables.
Exceptions will be thrown when a method is called that a SQL View connot supported.




### @method configure()

Creates the WebSQL Entity based on the configuration data and the database passed in
during the construction of the NoWebSqlEntity object.

This method returns an Angular Promise.

### noCreate(data, noTransaction)

Inserts a record into the websql database with the data provided.

#### Parameters

|Name|Type|Description|
|----|----|-----------|
|data|Object|Name Value Pairs|
|noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|

#### Remarks

When resolving the primary key for the purpose of createing a new record, it is
required that a primary key exist on the given table. Once discovered, if the
value already exists that value will be used as the primary value. If the key

> NOTE: Bug #00001
> There is a bug with current implementation that does not take into account
> the case when the primary key is a compond key. In the current implementation
> this results in the primary key resolving to `Undefined`.


When creating a new record in the WebSQL DB all tables are expected to have
the `tracking columns`: CreatedBy, DateCreated, ModifiedBy, ModifiedDate.
The values for these column are automatically added to the new data being
added to the DB.

### noRead([NoFilters, NoSort, NoPage])

Reads records from the websql database filtering, sorting and paging
as required by the provied parameters.

#### Parameters

> NOTE: All parameters are optional and may be provided in any order, as long as,
> they are of one of the known NoInfoPath query classes: NoFilters,
> NoSort, and NoPage

|Name|Type|Description|
|----|----|-----------|
|NoFilters|Object|(Optional) A noInfoPath NoFilters Array|
|NoSort|Object|(Optional) A noInfoPath NoSort Object|
|NoPage|Object|(Optional) A noInfoPath NoPage Object|

### noUpdate(data, noTransaction)

Updates a record from the websql database based on the Primary Key of the data provided.

#### Parameters

|Name|Type|Description|
|----|----|-----------|
|data|Object|Name Value Pairs|
|noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|

Returns an AngularJS Promise.

When resolving the primary key of the object to update
the id value must exist. If it does not an exception is thrown.

When updating a record in the WebSQL DB all tables are expected to have
the `tracking columns`: ModifiedBy, ModifiedDate.
The values for these column are automatically set on the object
being updated in the DB.

### noDestroy(data, noTransaction)

Deletes a record from the websql database based on the Primary Key of the data provided.

#### Parameters

|Name|Type|Description|
|----|----|-----------|
|data|Object|Name Value Pairs|
|noTransaction|Object|The noTransaction object that will commit changes to the NoInfoPath changes table for data synchronization|

### @method noOne(data)

Reads exactly one record from the websql database based on the filter derived the data provided.

> NOTE: Returns single object, not an array of objects. When more than one result is found it returns
> the first item in the array of results.  If none are found, returns an single empty object.

#### Parameters

##### @parameter `query`

The `query` parameter can be a Number, String or Object. When it
is as Number the it is a WebSQL `RowId`. When a String the value
is expectd to be the guid that is the primary key for the given
entity.  When an object, and is of the NoFilters class it is treated
as such. When not, then it expected to be a special object.

*Expected Types*
- Number
- String
- Object

#### Remarks

> NOTE: noinfopath-data only support primary keys that are strings. This
> is because we are expecting GUID or UUID as primary key, as the are
> inherently replicatable.


When 'query' is an object then check to see if it is a
NoFilters object.  If not, add a filter to the intrinsic filters object
based on the query's key property, and the query's value.

### @method noUpsert(data)

### @method noClear()

Delete all rows from the current table, without recording each delete transaction.

#### Returns
AngularJS Promise.

### @method noBulkCreate(data)

Inserts object in to the WebSQL database, converting data from
ANSI SQL to WebSQL.  No transactions are recorded during this operation.

### @method bulkload(data, progress)

Returns an AngularJS Promise.  Takes advantage of
Promise.notify to report project of the bulkLoad operation.

## @class NoWebSqlEntityFactory

Creates instances of the NoWebSqlEntity class, providing an Entity
configuration object, name of the entity, and a reference to the database.



### @method create(entityConfig, entityName, database)

Returns a new instance of the NoWebSqlEntity object configured with the
supplied Entity Configuration and Database.


## @class NoWebSqlService


[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.41*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

noLocalFileSystem
-----------------


noMimeTypes
-----------

