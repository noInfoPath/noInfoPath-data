noDateFunctions Service

```json
"calculatedFields":[{
	"field": "Days",
	"parser": {
		"provider": "noDateFunctions",
		"method": "dateDiff",
		"fields": {
			"date1": "ObservationDate",
			"date2": "HarvestDate"
		}
	}
}]
```

