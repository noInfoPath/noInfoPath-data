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
       "sort":  [{"field": "Percentage", "dir": "asc"}]
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


