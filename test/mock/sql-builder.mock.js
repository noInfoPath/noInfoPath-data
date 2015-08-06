var kendofilter = {
  "take": 20,
  "skip": 0,
  "page": 1,
  "pageSize": 20,
  "sort": [
    {
      "field": "CrossCode",
      "dir": "asc"
    }
  ],
  "filter": {
    "logic": "and",
    "filters": [
      {
        "operator": "eq",
        "value": "N",
        "field": "FemaleParentSelectionID"
      },
      {
        "operator": "neq",
        "value": "fcd44f50-133f-4961-b9d0-8ceb57f041d1",
        "field": "MaleParentSelectionID"
      }
    ]
  }
},
sqlstring = "SELECT * FROM FOO WHERE FemaleParentSelectionID = 'N' AND MaleParentSelectionID != 'fcd44f50-133f-4961-b9d0-8ceb57f041d1'";
