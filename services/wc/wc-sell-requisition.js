// Services
const wcSellRequisitionDetailsService = require("./wc-sell-requisition-details");

// Queries
const wcSellRequisitionQueries = require("../../db/queries/wc/wc-sell-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wcSellRequisitionTableName = require("../../util/database-tables-name").wcSellRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wcSellRequisition) => {
    wcSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcSellRequisitionQueries.selectOne({ number: wcSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcSellRequisitionQueries.insert(wcSellRequisition);
    if (results) {
        return await wcSellRequisitionDetailsService.create(wcSellRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcSellRequisitionQueries.select();
    return results;
  };