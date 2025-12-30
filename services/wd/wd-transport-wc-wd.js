// Services
const wdTransportWcWdRequisitionDetailsService = require("./wd-transport-wc-wd-details");

// Queries
const wdTransportWcWdRequisitionQueries = require("../../db/queries/wd/wd-transport-wc-wd");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wdTransportWcWdTableName = require("../../util/database-tables-name").wdTransportWcWdTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdTransportWcWdRequisition) => {
    wdTransportWcWdRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdTransportWcWdTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdTransportWcWdRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdTransportWcWdRequisitionQueries.selectOne({ number: wdTransportWcWdRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wdTransportWcWdRequisitionQueries.insert(wdTransportWcWdRequisition);
    if (results) {
        return await wdTransportWcWdRequisitionDetailsService.create(wdTransportWcWdRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdTransportWcWdRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
            const element = results[i];
            element.details = await wdTransportWcWdRequisitionDetailsService.selectByRequisitionId(element.id)
        }
    return results;
  };