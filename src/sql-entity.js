function _getTotal(db, entityName, noFilter) {

	var deferred = $q.defer(),
		filterExpression = noFilter ? " WHERE " + noFilter.toSQL() : "",
		sqlExpressionData = {
			"queryString": "SELECT COUNT() AS total FROM " + entityName + filterExpression
		};

	_exec(db, sqlExpressionData)
		.then(function (resultset) {
			if(resultset.rows.length === 0) {
				deferred.resolve(0);
			} else {
				deferred.resolve(resultset.rows[0].total);
			}
		})
		.catch(deferred.reject);

	return deferred.promise;

}

function _exec(db, sqlExpressionData) {
	var deferred = $q.defer(),
		valueArray;

	if(sqlExpressionData.valueArray) {
		valueArray = sqlExpressionData.valueArray;
	} else {
		valueArray = [];
	}

	db.transaction(function (tx) {
		tx.executeSql(
			sqlExpressionData.queryString,
			valueArray,
			function (t, resultset) {
				deferred.resolve(resultset);
			},
			function (t, r, x) {
				deferred.reject({
					tx: t,
					err: r
				});
			}

		);
	});

	return deferred.promise;
}
