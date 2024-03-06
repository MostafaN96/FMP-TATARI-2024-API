// Services
const wbTransitionBetweenIndustriesRequisitionDetailsService = require("./wb-transition-between-industries-requisition-details");

// Queries
const wbTransitionBetweenIndustriesRequisitionQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wbTransitionBetweenIndustriesRequisitionTableName = require("../../util/database-tables-name").wbTransitionBetweenIndustriesRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wbTransitionBetweenIndustriesRequisition) => {
    wbTransitionBetweenIndustriesRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbTransitionBetweenIndustriesRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbTransitionBetweenIndustriesRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbTransitionBetweenIndustriesRequisitionQueries.selectOne({ number: wbTransitionBetweenIndustriesRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbTransitionBetweenIndustriesRequisitionQueries.insert(wbTransitionBetweenIndustriesRequisition);
    if (results) {
        return await wbTransitionBetweenIndustriesRequisitionDetailsService.create(wbTransitionBetweenIndustriesRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wbTransitionBetweenIndustriesRequisitionQueries.select();
    return results;
  };