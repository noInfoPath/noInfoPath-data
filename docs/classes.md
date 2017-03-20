[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.46*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___

NoInfoPath Data Classes
-----------------------

TODO: Description

|

### @class NoFilterExpression : Object

Represents an single filter expression that can be applied to an `IDBObjectStore`.

#### Constructor

NoFilterExpression(column, operator, value [, logic])

|Name|Type|Description|
|----|----|-----------|
|column|String|The name of the column filter on.|
|operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
|value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
|logic|String|(Optional) One of the following values: `and`, `or`.|

#### Properties

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
|value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
|logic|String|(Optional) One of the following values: `and`, `or`.|

## Class NoFilters : Array

NoFilters is an array of NoFilterExpression objects.

### Properties

|----|----|------------|
|length|Number|Number of elements in the array.|

### Methods

#### add(column, operator, value[, logic])

Creates and adds a new NoFilterExpression into the underlying array that NoFilters represents.

#### Parameters

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
|value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
|logic|String|(Optional) One of the following values: `and`, `or`.|

## Class NoSortExpression : Object

Represents a single sort expression that can be applied to an `IDBObjectStore`.

### Constructor

NoFilterExpression(column[, dir])

### Properties

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|dir|String|(Optional) One of the following values: `asc`, `desc`.|

## Class NoSort : Array

NoSort is an array of NoSortExpression objects.

### Properties

|Name|Type|Description|
|----|----|------------|
|length|Number|Number of elements in the array.|

### Methods

#### add(column[, dir])

Creates and adds a new NoSortExpression into the underlying array that NoSort represents.

#### Parameters

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|dir|String|(Optional) One of the following values: `asc`, `desc`.|


## Class NoPage : Object

NoPage represent that information required to support paging of a data set.

### Constructor

NoPage(skip, take)

### Properties

|Name|Type|Description|
|-|-|-|
|skip|Number|Number of objects to skip before returning the desired amount specified in `take`.|
|take|Number|Number of objects records to return when paging data.|



## Class NoResults : Object

NoResults is a wrapper around a standard JavaScript Array instance. It inherits all properties and method offered by Array, but adds support for paged queries.

### @constructor NoResults(arrayOfThings)

#### Parameters

|Name|Type|Description|
|----|----|-----------|
|arrayOfThings|Array|(optional) An array of object that is used to populate the object on creation.|

### Properties

> Inherited properties are omitted.

|Name|Type|Description|
|----|----|-----------|
|total|Number|The total number of items in the array|

### Methods

#### page(options)

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|options|NoPage|A NoPage object that contains the paging instructions|

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|arrayOfThings|Array|(optional) An array of object that is used to populate the object on creation.|

##### Returns
void

## @class NoFilterExpression : Object

Represents an single filter expression that can be applied to an `IDBObjectStore`.

### Constructor

NoFilterExpression(column, operator, value [, logic])

|Name|Type|Description|
|----|----|-----------|
|column|String|The name of the column filter on.|
|operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
|value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
|logic|String|(Optional) One of the following values: `and`, `or`.|

### Properties

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
|value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
|logic|String|(Optional) One of the following values: `and`, `or`.|

## Class NoFilters : Array

NoFilters is an array of NoFilter objects.

### Constructors

#### NoFilters()

##### Usage

```js
var x = new noInfoPath.data.NoFilters()
```

### Properties

|Name|Type|Description|
|----|----|------------|
|length|Number|Number of elements in the array.|

### Methods

#### add(column, logic, beginning, end, filters)

Creates and adds a new NoFilter into the underlying array that NoFilters represents.

##### Parameters

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column to filter on.|
|logic|String|One of the following values: 'and', 'or'|
|beginning|Boolean|If the NoFilter is the beginning of the filter expression|
|end|Boolean|If the NoFilter is the end of the filter expression|
|filters|Array|Array of NoFilterExpressions|

#### toSQL()

Converts the NoFilters array to a partial SQL statement. It calls the toSQL() method on every NoFilter object within the NoFilters array.

##### Parameters

None

## Class NoFilter : Object

NoFilter is an object with some properties that has an array of NoFilterExpressions hanging off of it.

### Properties

|Name|Type|Description|
|----|----|------------|
|column|String|The column that will be filtered on|
|logic|String|One of the following values: 'and', 'or'|
|beginning|Boolean|If the NoFilter is the beginning of the filter expression|
|end|Boolean|If the NoFilter is the end of the filter expression|
|filters|Array|Array of NoFilterExpressions|

### Methods

#### toSQL()

Converts the current NoFilter object to a partial SQL statement. It calls the NoFilterExpression toSQL() method for every NoFilterExpression within the filters array.

#### Parameters

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|operator|String|One of the following values: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `contains`, `startswith`|
|value|Any Primative or Array of Primatives or Objects | The vales to filter against.|
|logic|String|(Optional) One of the following values: `and`, `or`.|

## Class NoSort : Array

NoSort is an array of NoSortExpression objects.

### Properties

|Name|Type|Description|
|----|----|------------|
|length|Number|Number of elements in the array.|
|total|Number|Total number of rows available given the current filters.|
|paged|Array|An array of object sliced on the skip and take parameters passed into the constructor.|

### Methods

#### add(column[, dir])

Creates and adds a new NoSortExpression into the underlying array that NoSort represents.

#### Parameters

|Name|Type|Description|
|----|----|------------|
|column|String|The name of the column filter on.|
|dir|String|(Optional) One of the following values: `asc`, `desc`.|

