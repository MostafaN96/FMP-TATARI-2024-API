// Services
const weReturnSellRequisitionDetailsService = require("./we-return-sell-requisition-details");

// Queries
const weReturnSellRequisitionQueries = require("../../db/queries/we/we-return-sell-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weReturnSellRequisitionTableName = require("../../util/database-tables-name").weReturnSellRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weReturnSellRequisition) => {
    weReturnSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weReturnSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weReturnSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weReturnSellRequisitionQueries.selectOne({ number: weReturnSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weReturnSellRequisitionQueries.insert(weReturnSellRequisition);
    if (results) {
        return await weReturnSellRequisitionDetailsService.create(weReturnSellRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weReturnSellRequisitionQueries.select();
    return results;
  };