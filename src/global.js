//globals.js
/*
	*	[NoInfoPath Home](http://gitlab.imginconline.com/noinfopath/noinfopath/wikis/home)
	*
	*	NoInfoPath Data (noinfopath-data)
	*	=============================================
	*
	*	*@version 2.0.62* [![Build Status](http://gitlab.imginconline.com:8081/buildStatus/icon?job=noinfopath-data&build=6)](http://gitlab.imginconline.com/job/noinfopath-data/6/)
	*
	*	Copyright (c) 2017 The NoInfoPath Group, LLC.
	*
	*	Licensed under the MIT License. (MIT)
	*	___
	*
	*	Overview
	*	--------
	*
	*	NoInfoPath Data provides serveral service that all an application to
	*	interact with the various local storage systems found in HTML5 compliant
	*	Web browsers.
	*
	*	### Installation
	*
	*	> npm install @noinfopath/noinfopath-data
	*
	*	### Services
	*
	*	|Name|Description|
	*	|----|-----------|
	*	|[noDataSource](data-source)|Provides a abstracted CRUD interface that sits in front of actual NoInfoPath CRUD provider services.|
	*	|[noFileStoreageCRUD](file-storage)|Establishes a CRUD interface in front of `noLocalFileStorage`.|
	*	|[noHTTP](http)|Establishes a CRUD interface in front of the AngularJS `$http` service|
	*	|[noIndexedDb](indexeddb)|Prodvides a CRUD interface for the Browser's native IndexedDB database. (Not fully supported by all browsers.)|
	*	|[noLocalFileStorage](no-local-file-storage)|Reads a File object retrieved from a standard `input:file` element and saves the data to an IndexedDB object store called NoInfoPath_FileUploadCache. The file blob is stored as `binary string`|
	*	|[noLocalFileSystem](file-storage)|Stores files within the Brower's Temporary Local File System.|
	*	|[noLocalStorage](storage)|Provides access to the Browser's localStorage service.|
	*	|[noMimeTypes](no-local-file-storage)|Helper service that returns a mime type given a file extention and vice versa.|
	*	|[noSessionStorage](storage)|Provides access to the Browser's sessionStorage service.|
	*	|[noTemplateCache](template-cache)|Sits in front of Angular Template cache, but allows files to be retrieve directly without using `ngInclude` or a directives `templateUrl` property.|
	*	|[noTransactionCache](transaction-cache)|Manages data transaction by tracking changes made by a CRUD provider service, and stores the changes in the NoInfoPath_Changes object store.|
	*	|[noWebSQL](websql-2)|Provides a CRUD interface for the Browser's native WebSQL database. (Not supported by all Browsers.)|
	*
	*	### [Helper Functions](helper-functions)
	*
	*	NoInfoPath Data exposes several helper function on the global noInfoPath object
	*	that is placed on the browser's instrinsic `window` object.
	*
	*	|Name|Description|
	*	|----|-----------|
	*	|digest|Deprecated; will be removed in a future release.|
	*	|digestError|Deprecated; will be removed in a future release.|
	*	|digestTimeout|Deprecated; will be removed in a future release.|
	*	|fromScopeSafeGuid|Convertes a "Scope Safe GUID" to a standard GUID.|
	*	|getItem(store, key)|Using the parameters provided, retrieves a value from the `store` using the `key`.|
	*	|isCompoundFilter|Checks the provided `indexName` for a string that match the compound key format.|
	*	|setItem(store, key, value)|Sets the `value`, on the `store` using the `key`.|
	*	|toDbDate(date)|Converts a JavaScript Date to a database compliant date String.|
	*	|toDisplayDate|Converts a JavaScript Date to a human readable date string.|
	*	|toScopeSafeGuid|Converts standards GUID to one that is safe to use as a property name in a JavaScript Object.|
	*	|resolveID|Creates and returns a NoFilters object.|
	*
	*	### [Classes](classes)
	*
	*	|Name|Description|
	*	|----|-----------|
	*	|NoDataModel|TODO|
	*	|NoFilter|TODO|
	*	|NoFilters|TODO|
	*	|NoFilterExpression|TODO|
	*	|NoPage|TODO|
	*	|NoReadOptions|TODO|
	*	|NoResults|TODO|
	*	|NoSort|TODO|
	*	|NoSortExpression|TODO|
*/

(noInfoPath.data = {});
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.data", ['ngLodash', 'noinfopath.helpers', 'noinfopath.logger'])
	;
})(angular);
