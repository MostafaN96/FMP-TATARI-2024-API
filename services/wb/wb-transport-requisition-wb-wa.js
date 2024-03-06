// Services
const wbTransportWbWaRequisitionDetailsService = require("./wb-transport-requisition-wb-wa-details");

// Queries
const wbTransportWbWaRequisitionQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wbTransportRequisitionWbWaTableName = require("../../util/database-tables-name").wbTransportRequisitionWbWaTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wbTransportWbWaRequisition) => {
    wbTransportWbWaRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbTransportRequisitionWbWaTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbTransportWbWaRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbTransportWbWaRequisitionQueries.selectOne({ number: wbTransportWbWaRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbTransportWbWaRequisitionQueries.insert(wbTransportWbWaRequisition);
    if (results) {
        return await wbTransportWbWaRequisitionDetailsService.create(wbTransportWbWaRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wbTransportWbWaRequisitionQueries.select();
    return results;
  };