// Services
const wdTransportWdWcRequisitionDetailsService = require("./wd-transport-requisition-wd-wc-details");

// Queries
const wdTransportWdWcRequisitionQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wdTransportRequisitionWdWcTableName = require("../../util/database-tables-name").wdTransportRequisitionWdWcTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdTransportWdWcRequisition) => {
    wdTransportWdWcRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdTransportRequisitionWdWcTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdTransportWdWcRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdTransportWdWcRequisitionQueries.selectOne({ number: wdTransportWdWcRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wdTransportWdWcRequisitionQueries.insert(wdTransportWdWcRequisition);
    if (results) {
        return await wdTransportWdWcRequisitionDetailsService.create(wdTransportWdWcRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdTransportWdWcRequisitionQueries.select();
    return results;
  };