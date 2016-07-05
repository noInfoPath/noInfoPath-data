## @interface INoQueryParser

> INoQueryParser is a conceptual entity, it does not really exist
> the reality. This is because JavaScript does not implement interfaces
> like other languages do. This documentation should be considered a
> guide for creating query parsers compatible with NoInfoPath.

### Overview
INoQueryParser provides a service interface definition for converting a set
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


## noQueryParser

### Overview
The noQueryParser takes the `data` property of the options
parameter passed to the Kendo DataSources transport.read method. The
data object is inspected and its filter, sort, and paging values are
converted to NoInfoPath compatible versions.

### Methods

#### parse(options)
Parses provided filter, sort and paging options into NoInfoPath compatible
  objects. Stores the results internally for future use.

  ##### Returns
Any/all filters, sorts or paging data as an array compatible
with a call to `function.prototype.array`.

### Properties
  None.


##  noQueryParser : INoQueryParser

### Overview

Implements a INoQueryBuilder compatible service that converts NoFilters,
NoSort, NoPage into ODATA compatible query object.


