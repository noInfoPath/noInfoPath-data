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
|data|Object|An object contains the properties that match the schema for the underlying WriteableTable.

##### Returns
AngularJS:Promise


#### noRead

The read operation takes a complex set of parameters that allow
for filtering, sorting and paging of data.

##### Parameters

|Name|Type|Descriptions|
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

