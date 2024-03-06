const sqlFun = require("../../config/sql-fun");

// Util
const constants = require("../../../util/constants");

exports.selectMaxValue = async (fromTableName, atrributeMaxValue) => {
    let queryResults = []
    await sqlFun.selectMaxValue(fromTableName, atrributeMaxValue)
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            queryResults = constants.errorPayload
            console.log(error);
        })
    return queryResults
}

exports.selectMaxValueWithCondition = async (fromTableName, atrributeMaxValue, whereCluse) => {
    let queryResults = []
    await sqlFun.selectMaxValueWithCondition(fromTableName, atrributeMaxValue, whereCluse)
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            queryResults = constants.errorPayload
            console.log(error);
        })
    return queryResults
}

exports.selectMaxValueWithJoinCondition = async (fromTableName, atrributeMaxValue, whereCluse, 
    innerTable, innerTableAttribute, outerTableAttribute) => {
    let queryResults = []
    await sqlFun.selectMaxValueWithJoinCondition(fromTableName, atrributeMaxValue, whereCluse, 
        innerTable, innerTableAttribute, outerTableAttribute)
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            queryResults = constants.errorPayload
            console.log(error);
        })
    return queryResults
}