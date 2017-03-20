### Class NoDataModel

 This class provides functionality to help other NoInfoPath services to
access and utilitze data in a consistant way. It provides a pristine
attribute to the data so a directive can 'roll back' a change, for example.

#### Properties

|Name|Type|Description|
|----|----|-----------|
|data|NoResults Object|Returns the data wrapped in a NoInfoPath NoResults object|
|pristine|NoResults Object|Returns the pristine data wrapped in a NoInfoPath NoResults object|
|__type|String|Returns the type of NoInfoPath object. In this case, it will return "NoDataModel"|

##### data

Returns an object that is saved within the NoDataModel.

##### pristine

Returns an object that is the pristine version of the data. This enables data rollbacks using the undo() method.

##### __type

Returns a string that explains that this is an object that was created by the NoDataModel class. Always returns "NoDataModel".


#### Methods

|Name|Description|
|----|-----------|
 |clean()|Removes any Angular properties off the data object, and cleans up 'falsy' values to null|
|undo()|Sets the data property back to what is stored in the pristine property|
|update(data)|Updtes the data with a matching data object|

##### clean()

This method removes any Angular or Kendo data model properties off the data object. It also cleans up any
falsy values and returns them as null.

**Parameters**

None

**Returns**

Undefined

##### undo()

This method returns the value contained within the NoDataModel back to the current pristine value.

**Parameters**

None

##### update(data)

This method updates the data contained within the data model to the data being passed in.

**Parameters*

|Name|Type|Description|
|----|----|-----------|
|data|Object|An object that will be saved within NoDataModel|

data

An object that is to be saved within the NoDataModel object. This data does not need to be flat.

```js
{
	PersonID: "6a2bfe0f-29da-440d-e5b9-62262ac0345c",
	PersonFirstName: "Foo",
	PersonLastName: "Bar",
	PersonAge: 25,
	Mother: {
		PersonID: "54dd9168-0111-43e3-9db8-77dc33169b41",
		PersonFirstName: "Bridget",
		PersonLastName: "Bar",
		PersonAge: 50
   }
 }
 ```

**Returns**

Undefined



