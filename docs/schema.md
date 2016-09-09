## noDbSchema
The noDbSchema service provides access to the database configuration that
defines how to configure the local IndexedDB data store.


### Properties

|Name|Type|Description|
|----|----|-----------|
|store|Object|A hash table compatible with Dexie::store method that is used to configure the database.|
|tables|Object|A hash table of NoInfoPath database schema definitions|
|isReady|Boolean|Returns true if the size of the tables object is greater than zero|


### Methods

#### \_processDbJson
Converts the schema received from the noinfopath-rest service and converts it to a Dexie compatible object.

##### Parameters
|Name|Type|Descriptions|
|----|----|------------|
|resp|Object|The raw HTTP response received from the noinfopath-rest service|

### load()
Loads and processes the database schema from the noinfopath-rest service.

#### Returns
AngularJS::Promise


### whenReady
whenReady is used to check if this service has completed its load phase. If it has not is calls the internal load method.

#### Returns
AngularJS::Promise

## NoDbSchema : Class
This provides

### Constructors

#### Constructor()

##### Usage
```js
var x = new NoDbSchema();
```

##### Parameters

None

### Methods

#### createSqlTableStmt(tableName, tableConfig)
Returns a SQL query string that creates a table given the provided tableName and tableConfig

##### Usage
```js
var x = createSqlTableStmt(tableName, tableConfig);
```
##### Parameters

|Name|Type|Description|
|----|----|-----------|
|tableName|String|The name of the table to be created|
|tableConfig|Object|The schema of the table to be created|

##### Returns
Returns a SQL query string

### Properties
|Name|Type|Description|
|----|----|-----------|
|queryString|String|Returns a SQL query string that creates a table given the provided tableName and tableConfig|

```json
{
	"dbName": "NoInfoPath_dtc_v1",
	"provider": "noIndexedDB",
	"remoteProvider:": "noHTTP",
	"version": 1,
	"schemaSource": {
		"provider": "inline",
		"schema": {
			"store": {
				"NoInfoPath_Changes": "$$ChangeID"
			},
			"tables": {
				"NoInfoPath_Changes": {
					"primaryKey": "ChangeID"
				}
			}
		}
	}
}
```url

### NoDbSchemaFactory

Creates unique instances of NoDbSchema based on noDBSchema configuration data.

> NOTE: noDbSchema property of noConfig is an array of NoInfoPath data provider configuration objects.

## noDbSchema
The noDbSchema service provides access to the database configuration that defines how to configure the local IndexedDB data store.


