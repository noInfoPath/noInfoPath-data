//conversion-functions.js
(function(angular, undefined){
  "use strict";

  function isNumber(i) {
    return !Number.isNaN(Number(i)) && i !== null;
  }
  var toProviderConversionFunctions = {
      "bigint": function (i) {
        return isNumber(i) ? i : null;
      },
      "bit": function (i) {
        return isNumber(i) ? i : null;
      },
      "decimal": function (n) {
        return isNumber(n) ? n : null;
      },
      "int": function (i) {
        return isNumber(i) ? i : null;
      },
      "money": function (n) {
        return isNumber(n) ? n : null;
      },
      "numeric": function (n) {
        return isNumber(n) ? n : null;
      },
      "smallint": function (i) {
        return isNumber(i) ? i : null;
      },
      "smallmoney": function (n) {
        return isNumber(n) ? n : null;
      },
      "tinyint": function (i) {
        return isNumber(i) ? i : null;
      },
      "float": function (i) {
        return isNumber(i) ? i : null;
      },
      "real": function (i) {
        return isNumber(i) ? i : null;
      },
      "date": function (n) {
        var d = null;

        if(n) {
          // Convert JS date to moment UTC, then stringify it to strip out offset and then make it a dbDate... otherwise assume it's already a dbdate
          d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
        }

        return d;
      },
      "datetime": function (n) {
        var d = null;

        if(n) {
          d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
        }

        return d;
      },
      "datetime2": function (n) {
        var d = null;

        if(n) {
          d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
        }

        return d;
      },
      "datetimeoffset": function (n) {
        var d = null;

        if(n) {
          d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
        }

        return d;
      },
      "smalldatetime": function (n) {
        var d = null;

        if(n) {
          d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
        }

        return d;
      },
      "time": function (n) {
        var d = null;

        if(n) {
          d = angular.isDate(n) ? noInfoPath.toDbDate(n) : n;
        }

        return d;
      },
      "char": function (t) {
        return angular.isString(t) ? t : null;
      },
      "nchar": function (t) {
        return angular.isString(t) ? t : null;
      },
      "varchar": function (t) {
        return angular.isString(t) ? t : null;
      },
      "nvarchar": function (t) {
        return angular.isString(t) ? t : null;
      },
      "text": function (t) {
        return angular.isString(t) ? t : null;
      },
      "ntext": function (t) {
        return angular.isString(t) ? t : null;
      },
      "binary": function (i) {
        return !angular.isNumber(i) ? i : null;
      },
      "varbinary": function (i) {
        return !angular.isNumber(i) ? i : null;
      },
      "image": function (i) {
        return !angular.isNumber(i) ? i : null;
      },
      "uniqueidentifier": function (t) {
        return angular.isString(t) ? t : null;
      }
    },
    fromProviderConversionFunctions = {
      "bigint": function (i) {
        return i;
      },
      "bit": function (i) {
        return i;
      },
      "decimal": function (n) {
        return n;
      },
      "int": function (i) {
        return i;
      },
      "money": function (n) {
        return n;
      },
      "numeric": function (n) {
        return n;
      },
      "smallint": function (i) {
        return i;
      },
      "smallmoney": function (n) {
        return n;
      },
      "tinyint": function (i) {
        return i;
      },
      "float": function (i) {
        return i;
      },
      "real": function (i) {
        return i;
      },
      "date": function (n) {
        return n ? new Date(n) : null;
      },
      "datetime": function (n) {
        return n ? new Date(n) : null;
      },
      "datetime2": function (n) {
        return n ? new Date(n) : null;
      },
      "datetimeoffset": function (n) {
        return n ? new Date(n) : null;
      },
      "smalldatetime": function (n) {
        return n ? new Date(n) : null;
      },
      "time": function (n) {
        return n ? new Date(n) : null;
      },
      "char": function (t) {
        return t;
      },
      "nchar": function (t) {
        return t;
      },
      "varchar": function (t) {
        return t;
      },
      "nvarchar": function (t) {
        return t;
      },
      "text": function (t) {
        return t;
      },
      "ntext": function (t) {
        return t;
      },
      "binary": function (i) {
        return i;
      },
      "varbinary": function (i) {
        return i;
      },
      "image": function (i) {
        return i;
      },
      "uniqueidentifier": function (t) {
        return t;
      }
    };

  angular.module("noinfopath.data")
    .constant("TO_PROVIDER_CONVERSION_FUNCTIONS", toProviderConversionFunctions)
    .constant("FROM_PROVIDER_CONVERSION_FUNCTIONS", fromProviderConversionFunctions)
  ;
})(angular);