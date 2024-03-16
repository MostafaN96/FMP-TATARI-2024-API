// Services
const waTransitionBetweenWHRequisitionDetailsService = require("./wa-transition-between-wh-requisition-details");

// Queries
const waTransitionBetweenWHRequisitionQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { waTransitionBetweenWHRequisitionTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (waTransitionBetweenWHRequisition) => {
    waTransitionBetweenWHRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waTransitionBetweenWHRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waTransitionBetweenWHRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waTransitionBetweenWHRequisitionQueries.selectOne({ number: waTransitionBetweenWHRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waTransitionBetweenWHRequisitionQueries.insert(waTransitionBetweenWHRequisition);
    if (results) {
        return await waTransitionBetweenWHRequisitionDetailsService.create(waTransitionBetweenWHRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await waTransitionBetweenWHRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await waTransitionBetweenWHRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };