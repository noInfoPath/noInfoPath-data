
When a field is a string then the value will be the
property on the data object provider to the call
the `basic` preOp

When a field is an object then confgure as if the
value will be coming from a trusted provider like
scope, or $stateParams.

When `scope` is the provider then the directive scope is used.
Otherwise the supplied injecable provider will be used.

When field value is a primative type meaning not
an object. or array. Use the value as is.

Drop each record one at a time so that the operations
are recorded in the current transaction.

Add each record one at a time to ensure that the transaction is recorded.

  #### @property scopeKey

  Use this property allow NoTransaction to store a reference
  to the entity upon which this data operation was performed.
  This is useful when you have tables that rely on a one to one
  relationship.

  It is best practice use this property when ever possible,
  but it not a required configuration property.


 ### joiner-many

 `joiner-many` assumes that it represents a multiple choice question.
 In order to keep the algorithm simple we drop all joiner items
 that match the parent key. (i.e. SelectionID)

### one-one

`one-one` enforces referential integrity between two table in a
transaction that share a one to one relationship.  When the child
data/table as defined in the noTransaction configuration and it's
an update is performed.



Use this property to `create` new related records in a transaction
member table when a matching item does not exist. So, this also
means that no `update` operations are performed on the designated
member table.


### @method bulkUpsert

Inserts or updates and array of data items. Uses a provided
constructor to create the object that will be added to the
entity. This allows for custom data conversion and business
logic to be implement at the record level, before saving.


