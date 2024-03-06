// Services
const weSellRequisitionDirectDetailsService = require("./we-sell-requisition-direct-details");

// Queries
const weSellRequisitionDirectQueries = require("../../db/queries/we/we-sell-requisition-direct");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weSellRequisitionTableName = require("../../util/database-tables-name").weSellRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weSellRequisitionDirect) => {
    weSellRequisitionDirect.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weSellRequisitionDirect.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weSellRequisitionDirectQueries.selectOne({ number: weSellRequisitionDirect.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weSellRequisitionDirectQueries.insert(weSellRequisitionDirect);
    if (results) {
        return await weSellRequisitionDirectDetailsService.create(weSellRequisitionDirect);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weSellRequisitionDirectQueries.select();
    return results;
  };