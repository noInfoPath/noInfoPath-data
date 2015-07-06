(function(angular, undefined){
    "use strict";

    angular.module("noinfopath.data.mocks", [])
        .value("dbJsonMock", {
            store: {"Addresses":"$$AddressID,UserID","CoolerTrials":"$$CoolerTrialID,HarvestID,FirmnessID,FlavorID,UserID","Harvests":"$$HarvestID,ActionID,HarvestWeightUOMID,UserID,TrialPlotID","LU_Firmness":"$$FirmnessID","LU_Flavor":"$$FlavorID","Selections":"$$SelectionID,FamilyID,GenusID,SpeciesID,StageID,UserID,SeedlingPlotID"},
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
                        "noInfoPath": {
                            "displayName": "Firmness"
                        },
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

        .value("noUserMock", {
            "access_token": "zB4X8TUL9SLdXq3ccmlzY65rD4fXyJ_fZYnmGC_f4_NTcykq1U_l9Amva73-39x5tEoWFIX0B7jD-nTCK9gxYXoK_pti16odGavFGH61tUrtSIeDR7bmHZTa5sW-c5h3n7gomqznSIWkMwjimU-Z6caKLpBTRtrjfoOJ8uR47FaJ83fd2TVDGwo2o7KJmn2J0QnyVn22PIuId66sMqvzw-aa21s8RyFz7qpvvSKRUXQCV6dwIcnDbtXbfcVB2mwhoNoblHvtE5DskZ6L0Z5_yqJf9x66uKRinmzKQ2vQKJVN9csZ8CNjrZ2QkWX_96V_fKaaLrSSEIA7dvjip_5NH07ef1dG_D0OUhHfYmbngvyK_lSiefkz522Mb1FTYdeuetyGu7FvcbN00SMdzKUewYr8awXNgaot2wE7LQP1hhZ7I35luhUUj1_FFqZfNxWdnz4B0IZ6xUAZc_1pjCLY5cpi09ecVDJ2khPWgBNfUrpsBaGPiSZjMM2qoihYC76LTmvXS7M_7Ypw6Cmaun2_kNj6Bz8onHbYus4pEKc9rpGIJW8LhBp_O8PnD9Y6fUnvHJDCm2j7XuamBATTrCZiWaUARLy7QGoFOpYNQ1H6eFKbJwA0qvYpcHmwFQmC5SsUk_8PooPGh9Fdm_OSgu52j29161lSjgwytf17PObLg2kWZ2e7c_uT5Xk274S9Y4M7qfi0v8RGzFXos1kJvXPatBxp4kv2K0fcaXxeyXe_eaCul5P8ZkcSF9P1psTnP2bxkxA8upEGyMdQpeZK-n4hqvQMPgnBZnP2QEECPRKOKSHRwQjxnzEpd_0ztF_yYjxRSNvIjkfE7t9P9JJN04trk0iUxXfFjC9Jxe03r7UjJ0S6m064CSmBOdFBJJMEi3kP4oiUMRGApnxHk4715H01Rp0gEbuue82Dg3DGi8pYckkRXyYy6NuBghqzCuu1WY6MSZKmwXJItJ9jeqH8LXIRS_DA1jFB4-3Ra0Xryv9c5eIKbg_9FI1rJpmV9mm1mxVf7VYjcVVCepABzuUPWhHIkt0mikc7DQN3iBjh4JE_-fuLqsco3rqNxaRpIMNLxeBLAcSURgQubwevVGoL2I_nOw",
            "token_type": "bearer",
            "expires_in": 1209599,
            "userId": "2a1e4ce8-22de-4642-acda-e32ce81a76b9",
            "acl": [
                "276d677e-f1be-43ce-9f03-0c264aa7737d",
                "f1b29985-cb5f-4447-9322-10722b20475f",
                "bea3ae3f-1244-40aa-8076-165d9ffdae0a",
                "950470d7-df00-4be2-b7cf-45e31d161199",
                "230a963f-0515-40be-b2de-56309e77f5bd",
                "b7a277c4-543b-4d1d-bb14-66ae7214376c",
                "7c4f6d12-6717-41cc-8277-7febe97bbb7a",
                "61f663a9-656c-402e-93e0-8e0e7a1c6e8c",
                "18952aa8-0e92-4e53-a30f-8ec10cda0d27",
                "1add6cde-23b1-46df-97b5-983209e2f830",
                "1ce8e849-ff97-41b6-a859-aead9c705bca",
                "ad628c16-1ffe-45d9-ac2d-cb09fd430a50",
                "5004a316-36b3-4bb8-bb91-dacc2d403d8b",
                "f131453f-9b3c-4b58-8083-e5a0bb9e2cd9",
                "5ae45ddc-079e-4139-90ed-e70511d93077",
                "e3e8985d-3208-44ad-8225-eb3471bb9dc9",
                "ee4e70ee-4a51-4246-88cc-ebf78accf9a7",
                "86e4a293-2809-4c46-bad4-f213049f3bca"
            ],
            "username": "jeff@gochin.com",
            "email": "jeff@gochin.com",
            ".issued": "Mon, 15 Jun 2015 17:42:43 GMT",
            ".expires": "Mon, 29 Jun 2015 17:42:43 GMT",
            "expires": Date.parse("2015-06-29T17:42:43.000Z")
        })

        .service("noDbSchema", [function(){

            this.tables = {
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
                    "noInfoPath": {
                        "displayName": "Firmness"
                    },
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
            };


        }])

        .service("noConfig", [function(){
            this.current = {
            	"RESTURI": "http://fcfn-rest.img.local/odata",
            	"IndexedDB" : {
            		"name": "NoInfoPath-v3",
            		"version": 1
        	    }
            };
        }])
    ;
})(angular);
