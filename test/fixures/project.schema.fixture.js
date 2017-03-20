var projectSchema = {
	"entityName": "Projects",
	"entityType": "T",
	"primaryKey": "ID",
	"foreignKeys": {
		"ClientID": {
			"column": "ClientID",
			"refTable": "Clients",
			"refColumn": "ID",
			"isParentKey": true
		}
	},
	"columns": {},
	"relationships": [{
		"column": "ID",
		"refTable": "Documents",
		"refColumn": "ProjectID",
		"cascadeDeletes": true
	}, {
		"column": "ID",
		"refTable": "Reports",
		"refColumn": "ProjectID",
		"cascadeDeletes": true
	}, {
		"column": "ID",
		"refTable": "ProjectBidItems",
		"refColumn": "ProjectID",
		"cascadeDeletes": true
	}],
	"parentSchema": {}
};
