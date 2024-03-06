// Services
const weSellRequisitionDetailsService = require("./we-sell-requisition-details");

// Queries
const weSellRequisitionQueries = require("../../db/queries/we/we-sell-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weSellRequisitionTableName = require("../../util/database-tables-name").weSellRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weSellRequisition) => {
    weSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weSellRequisitionQueries.selectOne({ number: weSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weSellRequisitionQueries.insert(weSellRequisition);
    if (results) {
        return await weSellRequisitionDetailsService.create(weSellRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weSellRequisitionQueries.select();
    return results;
  };