[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.79*

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

