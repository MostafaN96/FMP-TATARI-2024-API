const generalQueries = require("../../db/queries/general/general");

exports.selectMaxValue = async (fromTableName, atrributeMaxValue) => {
    const results = await generalQueries.selectMaxValue(fromTableName, atrributeMaxValue);
    return results;
};

exports.selectMaxValueWithCondition = async (fromTableName, atrributeMaxValue, whereCluse) => {
    const results = await generalQueries.selectMaxValueWithCondition(fromTableName, atrributeMaxValue, whereCluse);
    return results;
};

exports.selectMaxValueWithJoinCondition = async (fromTableName, atrributeMaxValue, whereCluse, 
    innerTable, innerTableAttribute, outerTableAttribute) => {
    const results = await generalQueries.selectMaxValueWithJoinCondition(fromTableName, atrributeMaxValue, whereCluse, 
        innerTable, innerTableAttribute, outerTableAttribute);
    return results;
};

exports.selectSum = async (fromTableName, atrributeValue, groupByColumn, whereCluse) => {
    const results = await generalQueries.selectSum(fromTableName, atrributeValue, groupByColumn, whereCluse);
    return results;
};