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

exports.selectMaxValueWith2JoinCondition = async (fromTableName, atrributeMaxValue, whereCluse, 
    innerTable, innerTableAttribute, outerTableAttribute,
    innerTable2, innerTableAttribute2, outerTableAttribute2
    ) => {
    let queryResults = []
    await sqlFun.selectMaxValueWith2JoinCondition(fromTableName, atrributeMaxValue, whereCluse, 
        innerTable, innerTableAttribute, outerTableAttribute,
        innerTable2, innerTableAttribute2, outerTableAttribute2,
        )
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            queryResults = constants.errorPayload
            console.log(error);
        })
    return queryResults
}

exports.selectSum = async (fromTableName, atrributeValue, groupByColumn, whereCluse) => {
    let queryResults = []
    await sqlFun.selectSum(
        fromTableName, 
        atrributeValue, 
        groupByColumn, 
        whereCluse)
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            queryResults = constants.errorPayload
            console.log(error);
        })
    return queryResults
}