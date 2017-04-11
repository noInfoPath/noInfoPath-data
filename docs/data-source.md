[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.61*

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

## destroy

Deletes the entity supplied as data.  If the current entity supports NoInfoPath_FileUploadCache
then delete the associated file.  if `filters` is a bool and false, then it indicates that the
associated file should be delete. If it is a bool and true the file should be preserved.


> This method also doubles as the `clear` method when it is called with no parameters.


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


