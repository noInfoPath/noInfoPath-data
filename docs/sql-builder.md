## @interface INoQueryBuilder

> INoQueryBuilder is a conceptual entity, it does not really exist
> the reality. This is because JavaScript does not implement interfaces
> like other languages do. This documentation should be considered as a
> guide for creating query providers compatible with NoInfoPath.

### Overview
INoQueryBuilder provides a service interface definition for converting a set
of NoInfoPath class related to querying data into a given query protocol.
An example of this is the ODATA 2.0 specification.

### Methods

#### makeQuery(filters, sort, page)

##### Parameters

|Name|Type|Descriptions|
|----|----|------------|
|filters|NoFilters|(Optional) Instance of a NoFilters class|
|sort|NoSort|(Optional) Instance of NoSort class|
|page|NoPage|(Optional) Instance of NoPage class|

##### Returns
Object


## @service noSQLQueryBuilder : INoQueryBuilder `Deprecated`

### Overview

Implements a INoQueryBuilder compatible service that converts NoFilters,
NoSort, NoPage into a WebSQL compatible query string.


