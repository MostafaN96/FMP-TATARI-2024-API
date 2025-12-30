// Services
const waSellRequisitionDetailsService = require("./wa-sell-requisition-details");

// Queries
const waSellRequisitionQueries = require("../../db/queries/wa/wa-sell-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const waSellRequisitionTableName = require("../../util/database-tables-name").waSellRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (waSellRequisition) => {
    waSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waSellRequisitionQueries.selectOne({ number: waSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waSellRequisitionQueries.insert(waSellRequisition);
    if (results) {
        return await waSellRequisitionDetailsService.create(waSellRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await waSellRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
            const element = results[i];
            element.details = await waSellRequisitionDetailsService.selectByRequisitionId(element.id)
        }
    return results;
  };