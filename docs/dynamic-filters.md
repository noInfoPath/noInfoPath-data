[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)

___

[NoInfoPath Data (noinfopath-data)](home) *@version 2.0.61*

[![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)

Copyright (c) 2017 The NoInfoPath Group, LLC.

Licensed under the MIT License. (MIT)

___



Evaluates the type parameter looking for know types, and converts
converts the value parameter to explicitly be of the type provied.

If the type is not a supported type then value is returned unchanged.


If the filterCfg parameter's value property, has a watch property, and
the value's source property is an AngularJS  observable object
a watch is configured on the source. The cb parameter is used
for the watch's callback.

When the source is "scope", the scope parameter is used, otherwise
the source is injected using the $injector service.

> NOTE: Currently $rootScope is the only supported injectable source.

  ### resolveFilterValues(filters)
  #### This is more information

> Note of some kind

|Name|Type|Description|
|----|----|-----------|
|Foo|Number|Does something fun.|

  > TODO: Implement support for delayed (waitFor) filter values.

  > NOTE: If a filter.value is an object and it has a source
  > property set to `scope` then use the directives scope variable.
  > Otherwise assume source is an injectable.


An array of NoInfoPath dynamic filters. Each filter defines what
the provider of the filter data is, and what property to filter on.

The filter property has a child property called `value`. When it
is an object then a dynamic filter is assumed. Otherwise it is treated
as the filter value.

When `value` is an object it is expected to have a `source` and a
`property` property. Source is always a string that is either the
string "scope" or the name of an AngularJS injectable service that
is a JavaScript object. Possible services could be $rootScope or $stateParams.

