(function(angular, undefined){
    "use strict";

    angular.module("noinfopath.data.mocks", [])
        .value("dbJsonMock", {
            config: {"Addresses":"$$AddressID,UserID","CoolerTrials":"$$CoolerTrialID,HarvestID,FirmnessID,FlavorID,UserID","Harvests":"$$HarvestID,ActionID,HarvestWeightUOMID,UserID,TrialPlotID","LU_Firmness":"$$FirmnessID","LU_Flavor":"$$FlavorID","Selections":"$$SelectionID,FamilyID,GenusID,SpeciesID,StageID,UserID,SeedlingPlotID"},
            request: {
                method: "GET",
                url: "/db.json",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            },
            response: {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    "Addresses": {
                        "columns": {
                            "AddressID": {
                                "nullable": "false",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "AddressLine1": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "AddressLine2": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "AddressName": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "CellNumber": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "City": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ContactName": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "Country": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "CreatedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "DateCreated": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "Email": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "ModifiedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "ModifiedDate": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "notes": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "PhoneNumber": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "State": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ZipCode": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            }                            
                        },
                        "foreignKeys": {
                            "CreatedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            },
                            "ModifiedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            }                            
                        },
                        "primaryKey": "AddressID"
                    },
                    "CoolerTrials": {
                        "columns": {
                            "Comments": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": -1
                            },
                            "CoolerTrialID": {
                                "nullable": "false",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "CreatedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "DateCreated": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "EvaluationDate": {
                                "nullable": "true",
                                "type": "date",
                                "length": 0
                            },
                            "FirmnessID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "FlavorID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "HarvestID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "ModifiedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "ModifiedDate": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            }                           
                        },
                        "foreignKeys": {
                            "HarvestID": {
                                "table": "Harvests",
                                "column": "HarvestID"
                            },
                            "FirmnessID": {
                                "table": "LU_Firmness",
                                "column": "FirmnessID"
                            },
                            "FlavorID": {
                                "table": "LU_Flavor",
                                "column": "FlavorID"
                            },
                            "CreatedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            },
                            "ModifiedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            }
                        },
                        "primaryKey": "CoolerTrialID"
                    },
                    "Harvests": {
                        "columns": {
                            "ActionID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "CreatedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "DateCreated": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "HarvestDate": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "HarvestID": {
                                "nullable": "false",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "HarvestWeight": {
                                "nullable": "true",
                                "type": "decimal",
                                "length": 0
                            },
                            "HarvestWeightUOMID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "ModifiedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "ModifiedDate": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "Notes": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": -1
                            },
                            "PickNumber": {
                                "nullable": "true",
                                "type": "int",
                                "length": 0
                            },
                            "QuantityPlants": {
                                "nullable": "true",
                                "type": "int",
                                "length": 0
                            },
                            "TrialPlotID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            }
                        },
                        "foreignKeys": {
                            "ActionID": {
                                "table": "LU_Action",
                                "column": "ActionID"
                            },
                            "HarvestWeightUOMID": {
                                "table": "LU_HarvestWeightUOM",
                                "column": "HarvestWeightUOMID"
                            },
                            "CreatedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            },
                            "ModifiedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            },
                            "TrialPlotID": {
                                "table": "TrialPlots",
                                "column": "TrialPlotID"
                            }
                        },
                        "primaryKey": "HarvestID"
                    },
                    "LU_Firmness": {
                        "columns": {
                            "Description": {
                                "nullable": "true",
                                "type": "varchar",
                                "length": 50
                            },
                            "FirmnessID": {
                                "nullable": "false",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "Value": {
                                "nullable": "true",
                                "type": "int",
                                "length": 0
                            }
                        },
                        "foreignKeys": {},
                        "primaryKey": "FirmnessID"
                    },
                    "LU_Flavor": {
                        "columns": {
                            "Description": {
                                "nullable": "true",
                                "type": "varchar",
                                "length": 50
                            },
                            "FlavorID": {
                                "nullable": "false",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "Value": {
                                "nullable": "true",
                                "type": "int",
                                "length": 0
                            }
                        },
                        "foreignKeys": {},
                        "primaryKey": "FlavorID"
                    },
                    "Selections": {
                        "columns": {
                            "ABECASCode": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ABECASSpeciesCode": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ABECASVarietyCode": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ABECASWarehouse": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "AnticipatedFirstSaleDate": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "AnticipatedTerritories": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "BerryQuality": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "BerrySize": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "BushHabit": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "Catalog": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ChillHours": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "CreatedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "CultivarName": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "DateCreated": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "Description": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "FamilyID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "FeetIntoRow": {
                                "nullable": "true",
                                "type": "int",
                                "length": 0
                            },
                            "GenusID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "LegalComments": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "ModifiedBy": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "ModifiedDate": {
                                "nullable": "true",
                                "type": "datetime",
                                "length": 0
                            },
                            "OfficalName": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "OfficiallyNamed": {
                                "nullable": "true",
                                "type": "bit",
                                "length": 0
                            },
                            "OtherName": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "OutstandingCharacteristics": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 150
                            },
                            "Ownership": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "ProductionNotes": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "ReasonToAddForecast": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "SeedlingPlotID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "SelectionCode": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 255
                            },
                            "SelectionID": {
                                "nullable": "false",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "SpeciesID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "StageID": {
                                "nullable": "true",
                                "type": "uniqueidentifier",
                                "length": 0
                            },
                            "TrialingStatus": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                            "USDAZone": {
                                "nullable": "true",
                                "type": "nvarchar",
                                "length": 50
                            },
                        },
                        "foreignKeys": {
                            "FamilyID": {
                                "table": "Families",
                                "column": "FamilyID"
                            },
                            "GenusID": {
                                "table": "LU_Genus",
                                "column": "GenusID"
                            },
                            "SpeciesID": {
                                "table": "LU_Species",
                                "column": "SpeciesID"
                            },
                            "StageID": {
                                "table": "LU_Stage",
                                "column": "StageID"
                            },
                            "CreatedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            },
                            "ModifiedBy": {
                                "table": "NoInfoPath_Users",
                                "column": "UserID"
                            },
                            "SeedlingPlotID": {
                                "table": "SeedlingPlots",
                                "column": "SeedlingPlotID"
                            }
                        },
                        "primaryKey": "SelectionID"
                    }
                }
            }

        })
    ;
})(angular);

